"""Pull and push with the writer's computer, live documents, GitHub and Overleaf.

Uses stand-in file and folder handles (automated browsers can't click real file pickers). Covers the three-way
merge, Word files keeping their formatting when pushed, linking and syncing a file and a folder, conflict handling,
browsers without file links, Overleaf download/upload, and the Sync panel.

Run:  ./build.sh && python3 tests/test_sync.py
"""
import asyncio
import base64
import io
import json
import os
import pathlib
import zipfile

import docx
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
APP = (ROOT / "index.html").as_uri()
SHOTS = ROOT / "tests" / "screenshots"
SHOTS.mkdir(exist_ok=True)
CHROME = os.environ.get("CHROME_PATH")
failures = []

FAKE_FS = """
window.__fs = {};
window.makeFile = (name, text, b64) => {
  const st = { name, bytes: b64 ? Uint8Array.from(atob(b64), c => c.charCodeAt(0)) : new TextEncoder().encode(text), modified: Date.now() - 60000 };
  const h = { kind: 'file', name, st,
    async getFile() { return new File([st.bytes], name, { lastModified: st.modified }); },
    async createWritable() { const parts = []; return { async write(d) { parts.push(d instanceof Uint8Array ? d : new TextEncoder().encode(String(d))); }, async close() { const n = parts.reduce((a, b) => a + b.length, 0), out = new Uint8Array(n); let o = 0; for (const x of parts) { out.set(x, o); o += x.length; } st.bytes = out; st.modified = Date.now(); } }; },
    async queryPermission() { return 'granted'; }, async requestPermission() { return 'granted'; } };
  return h;
};
window.makeDir = (name, files) => {
  const kids = new Map();
  const d = { kind: 'directory', name, kids,
    async *entries() { for (const [k, v] of kids) yield [k, v]; },
    async getDirectoryHandle(n, o) { if (!kids.has(n)) { if (!o || !o.create) throw new DOMException('nf', 'NotFoundError'); kids.set(n, makeDir(n, {})); } return kids.get(n); },
    async getFileHandle(n, o) { if (!kids.has(n)) { if (!o || !o.create) throw new DOMException('nf', 'NotFoundError'); kids.set(n, makeFile(n, '')); } return kids.get(n); },
    async queryPermission() { return 'granted'; }, async requestPermission() { return 'granted'; } };
  for (const [k, v] of Object.entries(files)) kids.set(k, typeof v === 'string' ? makeFile(k, v) : v);
  return d;
};
window.textOf = h => new TextDecoder().decode(h.st.bytes);
"""


def check(name, cond, detail=""):
    print(("PASS " if cond else "FAIL ") + name + (f"  ({detail})" if detail and not cond else ""))
    if not cond:
        failures.append(name)


def word_file():
    d = docx.Document()
    d.add_paragraph("Proposed Amendments to the ECPA", style="Title")
    d.add_heading("Introduction", level=1)
    p = d.add_paragraph("Untouched paragraph with ")
    p.add_run("bold").bold = True
    p.add_run(" and ")
    p.add_run("italic").italic = True
    p.add_run(" words.")
    d.add_paragraph("This paragraph will be rewritten.", style="Quote")
    d.add_paragraph("This paragraph will be deleted.")
    d.add_heading("Conclusion", level=1)
    b = io.BytesIO()
    d.save(b)
    return base64.b64encode(b.getvalue()).decode()


async def main():
    async with async_playwright() as p:
        kw = {"executable_path": CHROME, "args": ["--no-sandbox"]} if CHROME else {}
        browser = await p.chromium.launch(**kw)
        ctx = await browser.new_context(viewport={"width": 1360, "height": 1000}, accept_downloads=True)
        await ctx.add_init_script(FAKE_FS)
        page = await ctx.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        await page.goto(APP)
        await page.wait_for_timeout(1000)

        # ---------- merge ----------
        r = await page.evaluate("""() => {
          const base = 'A\\nB\\nC\\nD', mine = 'A\\nB mine\\nC\\nD', theirs = 'A\\nB\\nC\\nD theirs';
          const clash = merge3('A\\nB\\nC', 'A\\nB1\\nC', 'A\\nB2\\nC');
          return { clean: merge3(base, mine, theirs), same: merge3(base, mine, mine).text, clash: clash.conflicts,
                   m: merge3('A\\nB\\nC', 'A\\nB1\\nC', 'A\\nB2\\nC', 'mine').text, t: merge3('A\\nB\\nC', 'A\\nB1\\nC', 'A\\nB2\\nC', 'theirs').text,
                   both: merge3('A\\nB\\nC', 'A\\nB1\\nC', 'A\\nB2\\nC').text, ins: merge3('A\\nC', 'A\\nX\\nC', 'A\\nC\\nY').text }; }""")
        check("merge combines edits to different paragraphs", r["clean"]["text"] == "A\nB mine\nC\nD theirs" and r["clean"]["conflicts"] == 0, r["clean"])
        check("merge: same edit on both sides is no conflict", r["same"] == "A\nB mine\nC\nD")
        check("merge flags a paragraph changed in both", r["clash"] == 1 and r["m"] == "A\nB1\nC" and r["t"] == "A\nB2\nC" and "[[ Writer's Box version ]]" in r["both"], r)
        check("merge handles insertions", r["ins"] == "A\nX\nC\nY", r["ins"])

        # ---------- Word keeps its formatting ----------
        wb = word_file()
        await page.evaluate("""async b => { const p = P(); await importBytes(p, 'paper.docx', b64.to(b), []); const f = p.working['paper.docx'];
          f.base = f.orig; f.orig = null;
          f.text = f.text.replace('This paragraph will be rewritten.', 'This paragraph was rewritten in Writer\\'s Box.').replace('This paragraph will be deleted.\\n', '').replace('Conclusion', 'A brand new paragraph.\\nConclusion');
          persist(p, true); window.__out = b64.from(await bytesOf(p, 'paper.docx', f)); }""", wb)
        out = base64.b64decode(await page.evaluate("window.__out"))
        d = docx.Document(io.BytesIO(out))
        paras = [(x.style.name, x.text) for x in d.paragraphs]
        untouched = d.paragraphs[2]
        check("Word: untouched paragraph keeps bold and italic", untouched.text == "Untouched paragraph with bold and italic words." and any(r.bold for r in untouched.runs) and any(r.italic for r in untouched.runs), [(r.text, r.bold, r.italic) for r in untouched.runs])
        check("Word: title and headings keep their styles", paras[0] == ("Title", "Proposed Amendments to the ECPA") and paras[1] == ("Heading 1", "Introduction") and paras[-1] == ("Heading 1", "Conclusion"), paras)
        check("Word: changed paragraph keeps its style", ("Quote", "This paragraph was rewritten in Writer's Box.") in paras, paras)
        check("Word: deleted paragraph removed, new one added", all("deleted" not in t for _, t in paras) and any(t == "A brand new paragraph." for _, t in paras), paras)

        # ---------- link a file on the computer ----------
        await page.evaluate("""() => { const p = P(); p.working['essay.md'] = { text: 'Para one.\\n\\nPara two.\\n\\nPara three.\\n', orig: null }; persist(p, true);
          window.__h = makeFile('essay-final.md', 'Para one.\\n\\nPara two, edited in Word.\\n\\nPara three.\\n'); window.showOpenFilePicker = async () => [window.__h]; go('files'); }""")
        await page.wait_for_timeout(300)
        await page.click("#r-sync")
        await page.wait_for_timeout(300)
        await page.screenshot(path=str(SHOTS / "sync-panel.png"))
        panel = await page.inner_text(".modal")
        check("Sync panel lists every source", all(s in panel for s in ["Your computer", "Google Docs and Word online", "GitHub", "Overleaf"]), panel[:300])
        check("local project offers Publish for GitHub", "Publish to GitHub" in panel)
        await page.select_option("#sy-file", "essay.md")
        await page.click('[data-s="link"]')
        await page.wait_for_timeout(300)
        check("asks to pull right after linking", "Linked to essay-final.md" in await page.inner_text(".modal"))
        await page.click(".mactions .btn-primary")
        await page.wait_for_timeout(500)
        st = await page.evaluate("[S.route, P().working['essay.md'].text, S.suggestedMsg]")
        check("pull brings the computer's text in and shows the changes", st[0] == "compare" and "edited in Word" in st[1] and st[2] == "Changes from essay-final.md", st)

        await page.evaluate("go('file', { file: 'essay.md', fileMode: 'write' })")
        await page.wait_for_timeout(300)
        bar = await page.inner_text(".src-bar")
        check("file shows what it's linked to", "Linked to" in bar and "essay-final.md" in bar and "on your computer" in bar and "Pull" in bar and "Push" in bar, bar)
        await page.screenshot(path=str(SHOTS / "sync-file.png"))
        await page.evaluate("() => { const p = P(); p.working['essay.md'].text = p.working['essay.md'].text.replace('Para three.', 'Para three, edited in Writer\\'s Box.'); persist(p, true); go('file', { file: 'essay.md' }, true); }")
        await page.wait_for_timeout(200)
        await page.click('.src-bar [data-src="push"]')
        await page.wait_for_timeout(400)
        check("push writes Writer's Box text to the file", "edited in Writer's Box" in await page.evaluate("textOf(window.__h)"))

        # both sides change different paragraphs → push warns → pull merges
        await page.evaluate("() => { const st = window.__h.st; st.bytes = new TextEncoder().encode(textOf(window.__h).replace('Para one.', 'Para one, edited again in Word.')); st.modified = Date.now() + 5000; const p = P(); p.working['essay.md'].text = p.working['essay.md'].text.replace('Para two, edited in Word.', 'Para two, changed here.'); persist(p, true); }")
        await page.click('.src-bar [data-src="push"]')
        await page.wait_for_timeout(300)
        check("push warns when the file changed on the computer", "changed" in await page.inner_text(".modal") and "Pull first" in await page.inner_text(".modal"))
        await page.click(".mactions button:has-text('Pull first')")
        await page.wait_for_timeout(500)
        t = await page.evaluate("P().working['essay.md'].text")
        check("pull merges edits made in both places", "edited again in Word" in t and "changed here" in t and "edited in Writer's Box" in t and "[[" not in t, t)

        # same paragraph changed on both sides → asked
        await page.evaluate("() => { const st = window.__h.st; const base = P().sources['essay.md'].syncedText; st.bytes = new TextEncoder().encode(base.replace(/Para two.*\\n/, 'Para two from Word.\\n')); st.modified = Date.now() + 9000; const p = P(); p.working['essay.md'].text = base.replace(/Para two.*\\n/, 'Para two from Writer\\'s Box.\\n'); persist(p, true); go('file', { file: 'essay.md' }, true); }")
        await page.wait_for_timeout(200)
        await page.click('.src-bar [data-src="pull"]')
        await page.wait_for_timeout(400)
        check("asks which version to keep for a paragraph changed in both", "Changed in both places" in await page.inner_text(".modal"))
        await page.click(".mactions button:has-text('Keep both, marked')")
        await page.wait_for_timeout(400)
        t = await page.evaluate("P().working['essay.md'].text")
        check("keep both marks the two versions", "[[ Writer's Box version ]]" in t and "Para two from Word." in t and "Para two from Writer's Box." in t, t)

        # ---------- Word file pushed to the computer keeps formatting ----------
        await page.evaluate("""b => { window.__w = makeFile('Langa_Final_Paper.docx', '', b); window.showOpenFilePicker = async () => [window.__w]; }""", wb)
        await page.evaluate("""async () => { const p = P(); const key = await putHandle(window.__w); p.sources['paper.docx'] = { kind: 'local', key, name: 'Langa_Final_Paper.docx', modified: window.__w.st.modified, syncedText: null }; persist(p, true); await localPush(p, 'paper.docx', true); window.__wout = b64.from(window.__w.st.bytes); }""")
        d = docx.Document(io.BytesIO(base64.b64decode(await page.evaluate("window.__wout"))))
        check("pushing an edited Word file keeps its formatting", d.paragraphs[0].style.name == "Title" and any(r.bold for r in d.paragraphs[2].runs) and any("rewritten in Writer's Box" in x.text for x in d.paragraphs))

        # ---------- link a folder ----------
        await page.evaluate("""() => { window.__dir = makeDir('Thesis', { 'essay.md': 'Folder version.\\n', 'chapters': makeDir('chapters', { 'one.tex': '\\\\section{One}\\nText.\\n' }), '.DS_Store': 'x', 'image.png': 'x' }); window.showDirectoryPicker = async () => window.__dir; }""")
        await page.evaluate("() => { const p = P(); delete p.sources['essay.md']; p.working['essay.md'].text = 'Para one.\\n'; persist(p, true); go('files'); }")
        await page.click("#r-sync")
        await page.click('[data-s="link-folder"]')
        await page.wait_for_timeout(300)
        await page.click(".mactions .btn-primary")
        await page.wait_for_timeout(600)
        st = await page.evaluate("[!!P().working['chapters/one.tex'], P().working['essay.md'].text, !!P().working['.DS_Store'], !!P().working['image.png']]")
        check("folder pull adds new files and updates existing ones", st == [True, "Folder version.\n", False, False], st)
        await page.evaluate("() => { const p = P(); p.working['chapters/one.tex'].text += 'More.\\n'; p.working['new.md'] = { text: 'New file.\\n', orig: null }; persist(p, true); }")
        await page.evaluate("folderPush(P())")
        await page.wait_for_timeout(600)
        r = await page.evaluate("[textOf(window.__dir.kids.get('chapters').kids.get('one.tex')), window.__dir.kids.has('new.md'), textOf(window.__dir.kids.get('essay.md'))]")
        check("folder push writes changed and new files", "More." in r[0] and r[1] and r[2] == "Folder version.\n", r)

        # ---------- browsers without file links ----------
        await page.evaluate("() => { delete window.showOpenFilePicker; const p = P(); go('files'); }")
        await page.click("#r-sync")
        await page.wait_for_timeout(200)
        check("explains the fallback when file links aren't available", "can't keep a link to a file" in await page.inner_text(".modal"))
        await page.select_option("#sy-file", "notes.md")
        await page.click('[data-s="link"]')
        await page.wait_for_timeout(200)
        async with page.expect_download() as dl:
            await page.evaluate("localPush(P(), 'notes.md')")
        check("fallback push downloads the file to save over the original", (await dl.value).suggested_filename == "notes.md")

        # ---------- Overleaf ----------
        b = io.BytesIO()
        with zipfile.ZipFile(b, "w") as z:
            z.writestr("My Paper/memo.tex", "\\documentclass{article}\\begin{document}Edited in Overleaf.\\end{document}\n")
            z.writestr("My Paper/extra.bib", "@misc{x, title={X}}\n")
            z.writestr("My Paper/figure.png", "png")
        zp = SHOTS.parent / "_overleaf.zip"
        zp.write_bytes(b.getvalue())
        async with page.expect_file_chooser() as fc:
            await page.evaluate("overleafPull(P())")
        await (await fc.value).set_files(str(zp))
        await page.wait_for_timeout(700)
        st = await page.evaluate("[P().working['memo.tex'].text.includes('Edited in Overleaf'), !!P().working['extra.bib'], !!P().working['figure.png'], S.route]")
        check("Overleaf download pulls into the existing files", st == [True, True, False, "compare"], st)
        zp.unlink()
        await page.evaluate("() => { const p = P(); p.working['memo.tex'].text += '% more\\n'; persist(p, true); }")
        async with page.expect_download() as dl:
            await page.evaluate("overleafPush(P())")
        zdata = pathlib.Path(await (await dl.value).path()).read_bytes()
        names = zipfile.ZipFile(io.BytesIO(zdata)).namelist()
        check("Overleaf push sends changed files and ones Overleaf lacks, not unchanged ones", "memo.tex" in names and "extra.bib" not in names and all(n.endswith((".tex", ".bib")) for n in names), names)
        check("Overleaf upload steps shown", "Upload to Overleaf" in await page.inner_text(".modal"))
        await page.click(".mactions .btn-primary")

        # ---------- live documents and GitHub rows ----------
        await page.evaluate("() => { const p = P(); p.live = { 'notes.md': { provider: 'google', id: 'x', url: 'https://docs.google.com/document/d/x', sharedAt: Date.now() - 9e5, pulledAt: Date.now() - 9e5, lastSeen: { modified: Date.now(), by: 'Ana' } } }; persist(p, true); go('files'); }")
        await page.wait_for_timeout(300)
        check("header Sync shows waiting live edits", await page.inner_text("#r-sync") == "Sync 1" or "1" in await page.inner_text("#r-sync"))
        await page.click("#r-sync")
        await page.wait_for_timeout(200)
        live = await page.inner_text(".modal")
        check("live documents listed with new edits", "notes.md" in live and "New edits" in live)
        await page.screenshot(path=str(SHOTS / "sync-panel-full.png"), full_page=True)
        check("no page errors", not errors, errors[:3])
        await browser.close()
    print(f"\n{'All passed' if not failures else str(len(failures)) + ' failed'}")
    raise SystemExit(1 if failures else 0)

asyncio.run(main())
