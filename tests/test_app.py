"""Browser tests for Writer's Box.

Runs the built index.html in headless Chromium and checks the core flows:
diffing, Word/ODT/HTML/Overleaf/Excel/CSV imports, exports, saving versions,
drafts and merging. Screenshots go to tests/screenshots/.

Setup (once):
    pip install playwright openpyxl
    python -m playwright install chromium
Run:
    ./build.sh && python3 tests/test_app.py
"""
import asyncio
import base64
import datetime
import io
import pathlib
import sys
import zipfile

from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
APP = (ROOT / "index.html").as_uri()
SHOTS = ROOT / "tests" / "screenshots"
SHOTS.mkdir(exist_ok=True)

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"


def b64zip(files):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        for name, data in files.items():
            z.writestr(name, data)
    return base64.b64encode(buf.getvalue()).decode()


DOCX = b64zip({
    "[Content_Types].xml": "<Types/>",
    "word/document.xml": f'<?xml version="1.0"?><w:document xmlns:w="{W}"><w:body>'
    '<w:p><w:r><w:t>Hello </w:t></w:r><w:ins><w:r><w:t>brave </w:t></w:r></w:ins>'
    '<w:del><w:r><w:delText>old</w:delText></w:r></w:del><w:r><w:t>world</w:t></w:r></w:p>'
    '<w:p/><w:p><w:r><w:t>Second</w:t><w:tab/><w:t>para</w:t></w:r></w:p></w:body></w:document>',
})
ODT = b64zip({
    "content.xml": '<?xml version="1.0"?><office:document-content '
    'xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" '
    'xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"><office:body><office:text>'
    '<text:h text:outline-level="1">Title here</text:h><text:p>First<text:s text:c="2"/>para</text:p>'
    "</office:text></office:body></office:document-content>",
})
OVERLEAF = b64zip({
    "thesis/main.tex": "\\documentclass{article}\n\\begin{document}\n\\input{chapters/intro}\n\\end{document}",
    "thesis/chapters/intro.tex": "Intro text.",
    "thesis/figures/plot.png": "PNG",
})
GDOCS_HTML = (
    '<b style="font-weight:normal;" id="docs-internal-guid-1"><h1><span style="font-weight:400">My Essay</span></h1>'
    '<p><span style="font-weight:700">Bold start</span><span> then </span><span style="font-style:italic">italic</span>'
    '<span> and </span><a href="https://www.google.com/url?q=https://example.org&amp;sa=D"><span>a link</span></a></p>'
    "<ul><li><p><span>First point</span></p></li></ul></b>"
)
CSV = base64.b64encode('Name,Note\n"Smith, J.","said ""hi"""\nLee,ok\n'.encode()).decode()


def make_xlsx():
    try:
        import openpyxl
    except ImportError:
        return None
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Budget"
    ws.append(["Item", "Amount", "Due"])
    ws.append(["Rent", 1200, datetime.date(2026, 12, 1)])
    ws["A3"], ws["B3"] = "Total", "=SUM(B2:B2)"
    buf = io.BytesIO()
    wb.save(buf)
    return base64.b64encode(buf.getvalue()).decode()


failures = []


def check(name, cond, detail=""):
    print(("PASS " if cond else "FAIL ") + name + (f"  ({detail})" if detail and not cond else ""))
    if not cond:
        failures.append(name)


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1360, "height": 900})
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        await page.goto(APP)
        await page.wait_for_timeout(1200)
        await page.screenshot(path=str(SHOTS / "files.png"))

        ok = await page.evaluate("""() => { let ok = true; for (let i = 0; i < 300; i++) {
            const a = Array.from({length: Math.random()*20|0}, () => "abc"[Math.random()*3|0]);
            const b = Array.from({length: Math.random()*20|0}, () => "abc"[Math.random()*3|0]);
            const ops = myers(a, b);
            if (ops.filter(o => o[0] !== "+").map(o => o[1]).join("") !== a.join("") ||
                ops.filter(o => o[0] !== "-").map(o => o[1]).join("") !== b.join("")) ok = false; }
            return ok; }""")
        check("diff engine reproduces both sides", ok)

        md = await page.evaluate("h => htmlToMarkdown(h)", GDOCS_HTML)
        check("Google Docs paste keeps headings", md.startswith("# My Essay"), md)
        check("Google Docs paste keeps bold/italic/links", "**Bold start**" in md and "*italic*" in md and "[a link](https://example.org)" in md, md)

        rt = await page.evaluate('async () => { const t = "Line one\\n\\nTab\\there & <x>"; return (await docxToText(textToDocx(t))) === t; }')
        check("Word round-trip", rt)

        xlsx = make_xlsx()
        log = await page.evaluate("""async ([d, o, z, c, x]) => {
            const p = P(); S.importDir = "imported";
            const mk = (b, n) => ({file: new File([b64.to(b)], n), path: n});
            const items = [mk(d, "novel.docx"), mk(o, "notes.odt"), mk(z, "thesis.zip"), mk(c, "people.csv")];
            if (x) items.push(mk(x, "budget.xlsx"));
            await runImport(p, items);
            const w = P().working;
            return { log: S.importLog.map(l => l.status + " " + l.path), docx: w["imported/novel.docx"].text,
                     odt: w["imported/notes.md"].text, csv: w["imported/people.csv"].text,
                     xlsx: x ? w["imported/budget.xlsx"].text : null, saved: !!S.importLog.saved }; }""",
            [DOCX, ODT, OVERLEAF, CSV, xlsx])
        check("Word import accepts tracked changes", log["docx"] == "Hello brave world\n\nSecond\tpara", log["docx"])
        check("ODT import becomes Markdown", log["odt"].startswith("# Title here"), log["odt"])
        check("Overleaf zip keeps folders", "added imported/chapters/intro.tex" in log["log"], log["log"])
        check("Overleaf zip skips images", "skipped imported/figures/plot.png" in log["log"], log["log"])
        check("CSV import handles quotes", 'Smith, J.\tsaid "hi"' in log["csv"], log["csv"])
        check("import saved a version", log["saved"])
        if xlsx:
            check("Excel import keeps formulas and dates", "=SUM(B2:B2)" in log["xlsx"] and "2026-12-01" in log["xlsx"], log["xlsx"])
            out = await page.evaluate('() => b64.from(xlsxFromText(P().working["imported/budget.xlsx"].text))')
            import openpyxl
            wb = openpyxl.load_workbook(io.BytesIO(base64.b64decode(out)))
            check("rebuilt .xlsx opens in openpyxl", wb.sheetnames == ["Budget"])

        await page.evaluate('go("history")')
        await page.wait_for_timeout(300)
        await page.screenshot(path=str(SHOTS / "history.png"), full_page=True)

        await page.evaluate('go("file", {file: "notes.md"})')
        await page.wait_for_timeout(300)
        await page.fill("#ed", "changed text")
        await page.click("[data-save]")
        await page.fill("#sv-msg", "Test version")
        await page.click(".mactions .btn-primary")
        await page.wait_for_timeout(400)
        check("save version clears unsaved changes", await page.evaluate("changedPaths(P()).length") == 0)

        await page.evaluate('() => { switchDraft("shorter-summary"); }')
        await page.wait_for_timeout(300)
        await page.evaluate('() => { mergeFlow("shorter-summary"); }')  # don't await: it waits for the dialog
        await page.wait_for_timeout(200)
        await page.click(".mactions .btn-primary")
        await page.wait_for_timeout(400)
        check("merge lands on main", await page.evaluate("P().current") == "main")

        await page.evaluate('go("compare", {cmp: {a: null, b: null}})')
        await page.wait_for_timeout(300)
        await page.screenshot(path=str(SHOTS / "compare.png"), full_page=True)
        await page.evaluate('go("import")')
        await page.wait_for_timeout(300)
        await page.screenshot(path=str(SHOTS / "import.png"), full_page=True)

        check("no page errors", not errors, "; ".join(errors))
        await browser.close()
    print(f"\n{'All checks passed' if not failures else str(len(failures)) + ' failed: ' + ', '.join(failures)}. Screenshots in {SHOTS}")
    sys.exit(1 if failures else 0)


asyncio.run(main())
