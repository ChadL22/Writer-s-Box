"""End-to-end tests of formatting styles, style import, structure copying and the OpenRouter connection.

Covers the built-in styles (APA, MLA, Chicago, Bluebook) laid out as a preview and as a Word file
(checked with python-docx and rendered with LibreOffice), applying a style to LaTeX, the checklist,
importing a style from pasted text, a style file and a link (AI mocked), copying a paper's structure
with and without AI, and finishing the OpenRouter sign-in.

Run:  ./build.sh && python3 tests/test_format.py
"""
import asyncio
import io
import json
import os
import pathlib
import subprocess
import tempfile
import zipfile

import docx
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
APP = (ROOT / "index.html").as_uri()
SHOTS = ROOT / "tests" / "screenshots"
SHOTS.mkdir(exist_ok=True)
CHROME = os.environ.get("CHROME_PATH")
failures = []

BIB = r"""@article{smith2020, author={Smith, Jane and Doe, John}, title={Dark Patterns and Consumer Welfare}, journal={American Economic Review}, year={2020}, volume={110}, number={3}, pages={101--130}}
@book{mill1859, author={Mill, John Stuart}, title={On Liberty}, publisher={John W. Parker}, year={1859}}
@jurisdiction{ftc2023, title={FTC v. Amazon.com, Inc.}, volume={71}, journal={F.4th}, pages={1080}, institution={9th Cir.}, year={2023}}
"""
MD = """---
title: Cancelling Subscriptions Should Be Easy
author: Sipho Langa
---

## Abstract

Subscription services make cancelling harder than signing up. This paper looks at why.

## Introduction

Dark patterns cost consumers money [@smith2020, p. 104]. Mill argued for liberty [@mill1859].^[A side note.]

### Background

Courts have weighed in [@ftc2023, 1085]. Again [@ftc2023, 1086]. And Smith again [@smith2020, 110].

## Conclusion

Make it easy to leave [@nobody2024].
"""
TEX = r"""\documentclass[11pt]{article}
\title{A \emph{Test} Paper}
\author{Sipho Langa}
\begin{document}
\maketitle
\section{Introduction}
Text with a citation \cite[p.~5]{smith2020} and \textbf{bold}.
\subsection{Detail}
More text.\footnote{A note.}
\end{document}
"""


def check(name, cond, detail=""):
    print(("PASS " if cond else "FAIL ") + name + (f"  ({detail})" if detail and not cond else ""))
    if not cond:
        failures.append(name)


def render_pdf(data, name):
    with tempfile.TemporaryDirectory() as d:
        src = pathlib.Path(d) / f"{name}.docx"
        src.write_bytes(data)
        subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", d, str(src)], capture_output=True, timeout=120)
        pdf = pathlib.Path(d) / f"{name}.pdf"
        if not pdf.exists():
            return 0
        subprocess.run(["pdftoppm", "-png", "-r", "50", str(pdf), str(SHOTS / f"format-word-{name}")], capture_output=True, timeout=60)
        out = subprocess.run(["pdfinfo", str(pdf)], capture_output=True, text=True).stdout if subprocess.run(["which", "pdfinfo"], capture_output=True).returncode == 0 else ""
        for line in out.splitlines():
            if line.startswith("Pages:"):
                return int(line.split()[1])
        return 1


async def main():
    async with async_playwright() as p:
        kw = {"executable_path": CHROME, "args": ["--no-sandbox"]} if CHROME else {}
        browser = await p.chromium.launch(**kw)
        ctx = await browser.new_context(viewport={"width": 1400, "height": 1000}, accept_downloads=True)
        page = await ctx.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        llm_calls = []

        async def or_route(route):
            req = route.request
            hdr = {"Access-Control-Allow-Origin": "*", "Content-Type": "application/json"}
            if req.url.endswith("/auth/keys"):
                body = json.loads(req.post_data)
                ok = body.get("code") == "abc123" and body.get("code_verifier") == "verif" and body.get("code_challenge_method") == "S256"
                await route.fulfill(status=200 if ok else 400, headers=hdr, body=json.dumps({"key": "sk-or-test-key"} if ok else {"error": {"message": "bad"}}))
                return
            if req.url.endswith("/models"):
                await route.fulfill(status=200, headers=hdr, body=json.dumps({"data": [{"id": "anthropic/test-model", "name": "Test"}]}))
                return
            body = json.loads(req.post_data)
            llm_calls.append({"body": body, "auth": req.headers.get("authorization")})
            text = json.dumps(body)
            if "Describe the structure" in text:
                ans = {"summary": "An empirical policy paper.", "sections": [{"heading": "Introduction", "level": 1, "purpose": "States the problem and the argument.", "share": 15}, {"heading": "[The policy context]", "level": 1, "purpose": "Explains the rules today.", "share": 25}, {"heading": "Recommendations", "level": 1, "purpose": "What should change.", "share": 20}], "citation": "chicago", "formatting": {"page": {"font": "Garamond", "size": 12, "margin": 1.25}}}
            else:
                ans = {"name": "Journal of Testing", "page": {"font": "Georgia", "size": 11, "margin": 1.5, "spacing": 2}, "references": {"title": "Literature Cited"}, "rules": ["Abstracts are limited to 150 words."]}
            await route.fulfill(status=200, headers=hdr, body=json.dumps({"choices": [{"message": {"content": "```json\n" + json.dumps(ans) + "\n```"}}]}))
        await page.route("https://openrouter.ai/**", or_route)

        async def blocked_route(route):
            await route.abort("failed")  # what a browser sees when a site blocks cross-site reading
        await page.route("https://journal.example.org/**", blocked_route)

        # OpenRouter sign-in finishing (?code= on return)
        await page.goto(APP)
        await page.wait_for_timeout(800)
        await page.evaluate("sessionStorage.setItem('wb.or.verifier', 'verif'); localStorage.removeItem('wb.or.key')")
        await page.goto(APP + "?code=abc123#home")
        await page.wait_for_timeout(1500)
        check("OpenRouter sign-in exchanges the code for a key", await page.evaluate("localStorage.getItem('wb.or.key')") == "sk-or-test-key")
        check("code is removed from the address", "code=" not in page.url, page.url)
        check("lands on Settings with AI connected", await page.evaluate("S.route") == "settings" and "Connected" in await page.inner_text("#view"))
        await page.evaluate("localStorage.removeItem('wb.or.key')")

        async def shot(name, full=False):
            await page.wait_for_timeout(300)
            await page.screenshot(path=str(SHOTS / f"format-{name}.png"), full_page=full)

        await page.evaluate("""([bib, md, tex]) => { const p = P(); p.working['refs.bib'].text = bib; p.working['paper.md'] = { text: md, orig: null }; p.working['test.tex'] = { text: tex, orig: null }; p.format = { doc: 'paper.md', style: 'apa7-student', fields: { institution: 'MIT Sloan', course: 'POL 501: Tech Policy', instructor: 'Dr. Rivera', date: 'November 18, 2026' }, checked: {} }; persist(p, true); go('format'); }""", [BIB, MD, TEX])
        await page.wait_for_timeout(900)
        check("Format tab is listed", await page.query_selector('[data-tab="format"]') is not None)
        pages = await page.query_selector_all(".pp-page")
        check("preview shows title page, first page and references", len(pages) == 3, len(pages))
        prev = await page.inner_text("#fm-prev")
        check("APA title page has title and details", "Cancelling Subscriptions Should Be Easy" in prev and "MIT Sloan" in prev and "Dr. Rivera" in prev, prev[:300])
        check("APA in-text citations", "(Smith & Doe, 2020, p. 104)" in prev and "(Mill, 1859)" in prev, prev)
        check("references page lists cited works", "References" in prev and "Smith, J., & Doe, J. (2020)" in prev)
        checks = await page.inner_text("#fm-checks")
        check("checklist flags the missing citation", "nobody2024" in checks, checks)
        check("checklist reports abstract length", "Abstract:" in checks)
        await shot("apa")

        async def download(name):
            async with page.expect_download() as dl:
                await page.click("#fm-docx")
            d = await dl.value
            return pathlib.Path(await d.path()).read_bytes(), d.suggested_filename

        data, fname = await download("apa")
        d = docx.Document(io.BytesIO(data))
        texts = [x.text for x in d.paragraphs]
        sec = d.sections[0]
        z = zipfile.ZipFile(io.BytesIO(data))
        styles = z.read("word/styles.xml").decode()
        check("Word file opens and has the APA parts", fname.endswith(".docx") and "Cancelling Subscriptions Should Be Easy" in texts and "Abstract" in texts and "References" in texts, texts[:12])
        check("Word page set-up: 1 inch margins, letter", abs(sec.left_margin.inches - 1) < 0.01 and abs(sec.page_width.inches - 8.5) < 0.01)
        check("Word default font and size", 'w:ascii="Times New Roman"' in styles and 'w:sz w:val="24"' in styles)
        hdr = z.read("word/hf1.xml").decode()
        check("header has the page number", "PAGE" in hdr)
        ref_p = next(x for x in d.paragraphs if x.text.startswith("Smith, J."))
        check("references have a hanging indent", ref_p.paragraph_format.first_line_indent is not None and ref_p.paragraph_format.first_line_indent.inches < 0, ref_p.paragraph_format.first_line_indent)
        n = render_pdf(data, "apa")
        check("LibreOffice renders the APA file", n >= 3, n)

        # MLA
        await page.select_option("#fm-style", "mla9")
        await page.wait_for_timeout(900)
        prev = await page.inner_text("#fm-prev")
        check("MLA: heading block, no title page", "Sipho Langa\nDr. Rivera" in prev or ("Dr. Rivera" in prev and "Title page" not in prev), prev[:200])
        check("MLA in-text citation", "(Smith and Doe 104)" in prev, prev)
        check("MLA header with last name", "Langa 1" in prev)
        check("switching style matches References tab", await page.evaluate("S.refStyle") == "mla")
        await shot("mla")
        data, _ = await download("mla")
        z = zipfile.ZipFile(io.BytesIO(data))
        check("MLA Word header", "Langa" in z.read("word/hf1.xml").decode())
        check("MLA Works Cited", "Works Cited" in [x.text for x in docx.Document(io.BytesIO(data)).paragraphs])
        render_pdf(data, "mla")

        # Chicago notes
        await page.select_option("#fm-style", "chicago18-nb")
        await page.wait_for_timeout(900)
        data, _ = await download("chicago")
        z = zipfile.ZipFile(io.BytesIO(data))
        notes = z.read("word/footnotes.xml").decode()
        check("Chicago: citations become footnotes", "Jane Smith and John Doe, “Dark Patterns and Consumer Welfare,”" in notes and "104" in notes, notes[:600])
        check("Chicago: short form and footnote text", "Smith, “Dark Patterns and Consumer”" in notes and "A side note." in notes, notes[-900:])
        check("Chicago: title page not numbered", "w:titlePg" in z.read("word/document.xml").decode())
        check("Chicago: Bibliography", "Bibliography" in [x.text for x in docx.Document(io.BytesIO(data)).paragraphs])
        render_pdf(data, "chicago")
        await shot("chicago")

        # Bluebook
        await page.select_option("#fm-style", "bluebook-memo")
        await page.wait_for_timeout(900)
        prev = await page.inner_text("#fm-prev")
        check("Bluebook memo heading", "MEMORANDUM" in prev and "FROM: Sipho Langa" in prev, prev[:200])
        data, _ = await download("bluebook")
        z = zipfile.ZipFile(io.BytesIO(data))
        notes = z.read("word/footnotes.xml").decode()
        check("Bluebook case citation", "FTC v. Amazon.com, Inc." in notes and "71 F.4th 1080, 1085 (9th Cir. 2023)" in notes, notes[:900])
        check("Bluebook Id.", ">Id.<" in notes, notes)
        check("Bluebook supra", "supra" in notes)
        check("Bluebook page number in footer", "word/hf1.xml" in z.namelist() and "ftr" in z.read("word/hf1.xml").decode())
        render_pdf(data, "bluebook")

        # LaTeX apply
        await page.select_option("#fm-doc", "test.tex")
        await page.wait_for_timeout(500)
        await page.select_option("#fm-style", "apa7-student")
        await page.wait_for_timeout(700)
        prev = await page.inner_text("#fm-prev")
        check("LaTeX is read: title, emphasis, citation", "A Test Paper" in prev and "(Smith & Doe, 2020, p. 5)" in prev, prev[:400])
        await page.click("#fm-tex")
        await page.wait_for_timeout(400)
        await page.click("#fm-tex")
        await page.wait_for_timeout(400)
        t = await page.evaluate("P().working['test.tex'].text")
        check("LaTeX preamble block added once", t.count("Writer's Box format: APA 7") == 1 and "\\usepackage[letterpaper,margin=1in]{geometry}" in t and t.index("geometry") < t.index("\\begin{document}"), t[:500])
        check("LaTeX font size set to 12pt", t.startswith("\\documentclass[12pt]{article}"), t[:40])
        checks = await page.inner_text("#fm-checks")
        check("checklist sees the LaTeX style", "LaTeX preamble uses this style." in checks)

        # rules checklist persists
        await page.check('[data-rule="0"]')
        await page.wait_for_timeout(200)
        check("rule checkbox saved", await page.evaluate("P().format.checked['apa7-student'].includes(0)"))

        # import a style from pasted text (no AI)
        await page.click("#fm-import")
        await page.click('[data-m="paste"]')
        await page.fill("#is-text", "Submissions must use 1.5-inch margins on all sides. Use Arial 11-point font. Single-spaced text is required. Number pages at the bottom of the page. Include a Works Cited page in MLA format. No title page is needed.")
        await page.click(".mactions .btn-primary")
        await page.wait_for_timeout(500)
        vals = await page.evaluate("[$('#se-margin').value, $('#se-font').value, $('#se-size').value, $('#se-spacing').value, $('#se-rt').value, $('#se-open').value, $('#se-hpos').value, $('#se-rules').value]")
        check("pasted rules are picked out", vals[:7] == ["1.5", "Arial", "11", "1", "Works Cited", "none", "bottom"], vals)
        check("formatting sentences become the checklist", "Arial 11-point" in vals[7])
        await shot("style-edit")
        await page.fill("#se-name", "Course style")
        await page.click(".mactions .btn-primary")
        await page.wait_for_timeout(700)
        check("saved style is in use", await page.evaluate("resolveStyle(P(), P().format.style).name") == "Course style")
        check("saved style listed", "Course style" in await page.inner_text(".fm-styles"))

        # style file round trip
        async with page.expect_download() as dl:
            await page.click(".fm-card.current [data-export-style]")
        sf = await (await dl.value).path()
        await page.click("#fm-import")
        await page.click('[data-m="file"]')
        await page.set_input_files("#is-file", sf)
        await page.click(".mactions .btn-primary")
        await page.wait_for_timeout(400)
        check("style file imports", await page.input_value("#se-name") == "Course style" and await page.input_value("#se-font") == "Arial")
        await page.click(".mactions button:has-text('Cancel')")

        # AI: import from a link that blocks other sites
        await page.evaluate("localStorage.setItem('wb.or.key', 'sk-or-test-key'); localStorage.setItem('wb.or.model', 'anthropic/test-model')")
        await page.evaluate("go('format', {}, true)")
        await page.wait_for_timeout(500)
        await page.click("#fm-import")
        await page.fill("#is-url", "https://journal.example.org/guidelines")
        await page.click(".mactions .btn-primary")
        await page.wait_for_timeout(800)
        call = llm_calls[-1] if llm_calls else {"body": {}}
        check("AI is asked to fetch the blocked page", any(t.get("type") == "openrouter:web_fetch" for t in call["body"].get("tools", [])) and "journal.example.org/guidelines" in json.dumps(call["body"]), call)
        check("AI request uses the key and model", call.get("auth") == "Bearer sk-or-test-key" and call["body"].get("model") == "anthropic/test-model")
        vals = await page.evaluate("[$('#se-name').value, $('#se-font').value, $('#se-margin').value, $('#se-rt').value, $('#se-rules').value, $('#se-src').value]")
        check("AI style lands in the editor", vals[:4] == ["Journal of Testing", "Georgia", "1.5", "Literature Cited"] and "150 words" in vals[4] and vals[5] == "journal.example.org", vals)
        await page.click(".mactions button:has-text('Cancel')")

        # structure without AI, from this project
        await page.evaluate("localStorage.removeItem('wb.or.key')")
        await page.evaluate("go('format', {}, true)")
        await page.wait_for_timeout(400)
        await page.click("#fm-struct")
        await page.click('[data-m="project"]')
        await page.select_option("#cs-doc", "paper.md")
        await page.click(".mactions .btn-primary")
        await page.wait_for_timeout(500)
        out = await page.input_value("#or-out")
        check("outline from headings with lengths", out.startswith("# Abstract — about") and "# Introduction — about" in out and "## Background" in out and "# Conclusion" in out, out)
        await page.fill("#or-name", "my-paper")
        await shot("outline")
        await page.click(".mactions .btn-primary")
        await page.wait_for_timeout(500)
        r = await page.evaluate("[S.file, Object.keys(P().working).filter(k => k.startsWith('my-paper')), P().working['my-paper.md'].text]")
        check("creates the new outline split into section files", r[0] == "my-paper.md" and "my-paper/introduction.md" in r[1] and "<!-- include: my-paper/conclusion.md -->" in r[2], r)
        intro = await page.evaluate("P().working['my-paper/introduction.md'].text")
        check("sections hold the heading and a length target, not the text", intro.startswith("## Introduction") and "Aim for about" in intro and "Dark patterns" not in intro, intro)

        # structure with AI from a PDF
        await page.evaluate("localStorage.setItem('wb.or.key', 'sk-or-test-key')")
        await page.evaluate("go('format', {}, true)")
        await page.wait_for_timeout(400)
        pdf = SHOTS.parent / "model.pdf"
        pdf.write_bytes(b"%PDF-1.4\n% test\n")
        await page.click("#fm-struct")
        await page.set_input_files("#cs-file", str(pdf))
        await page.click(".mactions .btn-primary")
        await page.wait_for_timeout(800)
        call = llm_calls[-1]
        parts = call["body"]["messages"][-1]["content"]
        check("PDF is sent to the model as a file", any(x.get("type") == "file" and x["file"]["file_data"].startswith("data:application/pdf;base64,") for x in parts))
        out = await page.input_value("#or-out")
        check("AI outline with purposes", "# [The policy context] — Explains the rules today." in out, out)
        check("offers to save the paper's formatting", await page.query_selector("#or-style") is not None and "Garamond" in await page.inner_text(".modal"))
        await page.fill("#or-name", "policy-brief")
        await page.click(".mactions .btn-primary")
        await page.wait_for_timeout(500)
        st = await page.evaluate("resolveStyle(P(), P().format.style)")
        check("formatting saved as a style based on Chicago", st["page"]["font"] == "Garamond" and st["page"]["margin"] == 1.25 and st["citations"]["mode"] == "notes", st["page"])
        pdf.unlink()

        await page.evaluate("go('settings')")
        await page.wait_for_timeout(300)
        check("Settings shows the OpenRouter connection", "OpenRouter (AI)" in await page.inner_text("#view"))
        await page.click("#st-llm")
        await page.wait_for_timeout(300)
        await shot("openrouter")
        await page.click(".mactions button:has-text('Cancel')")

        await page.evaluate("go('refs')")
        await page.wait_for_timeout(300)
        check("Bluebook in References styles", "Bluebook" in await page.inner_text("#rf-style"))
        await page.evaluate("go('format')")
        await page.wait_for_timeout(800)
        await shot("final", True)
        check("no page errors", not errors, errors[:3])
        await browser.close()
    print(f"\n{'All passed' if not failures else str(len(failures)) + ' failed'}")
    raise SystemExit(1 if failures else 0)

asyncio.run(main())
