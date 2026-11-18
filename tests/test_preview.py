"""Write and Preview look and work differently.

Preview shows the document on a page, as a reader sees it: real headings, italics, lists, quotations,
footnotes and printed citations, with no markup or line numbers. Write uses a writing font for prose files.

Run:  ./build.sh && python3 tests/test_preview.py
"""
import asyncio
import base64
import os
import pathlib

import docx
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
APP = (ROOT / "index.html").as_uri()
SHOTS = ROOT / "tests" / "screenshots"
SHOTS.mkdir(exist_ok=True)
CHROME = os.environ.get("CHROME_PATH")
failures = []


def check(name, cond, detail=""):
    print(("PASS " if cond else "FAIL ") + name + (f"  ({detail})" if detail and not cond else ""))
    if not cond:
        failures.append(name)


def sample_docx():
    d = docx.Document()
    d.add_paragraph("Proposed Amendments to the ECPA", style="Title")
    d.add_heading("Introduction", level=1)
    p = d.add_paragraph("Some forty years before the rise of ")
    p.add_run("large language models").italic = True
    p.add_run(", Congress sought to modernize surveillance law.")
    d.add_heading("Background", level=2)
    d.add_paragraph("A quoted passage that runs as a block quotation.", style="Quote")
    d.add_paragraph("First recommendation", style="List Bullet")
    d.add_paragraph("Second recommendation", style="List Bullet")
    path = SHOTS.parent / "_preview.docx"
    d.save(path)
    data = path.read_bytes()
    path.unlink()
    return base64.b64encode(data).decode()


async def main():
    async with async_playwright() as p:
        kw = {"executable_path": CHROME, "args": ["--no-sandbox"]} if CHROME else {}
        browser = await p.chromium.launch(**kw)
        page = await browser.new_page(viewport={"width": 1360, "height": 1000})
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        await page.goto(APP)
        await page.wait_for_timeout(1000)
        await page.evaluate("""async b => { const p = P(); S.refStyle = 'apa';
          p.working['refs.bib'].text = '@article{smith2020, author={Smith, Jane}, title={Dark Patterns}, journal={Journal of Policy}, year={2020}}';
          await importBytes(p, 'paper.docx', b64.to(b), []);
          p.working['essay.md'] = { text: '---\\ntitle: An Essay\\nauthor: Sipho Langa\\n---\\n\\n## Why it matters\\n\\nThis is **bold** and *italic* with a citation [@smith2020, p. 4] and a note.^[A footnote.]\\n\\n> A quotation.\\n\\n1. one\\n2. two\\n\\nMissing source [@nobody].\\n', orig: null };
          p.working['t.tex'] = { text: '\\\\documentclass{article}\\n\\\\title{TeX Paper}\\n\\\\begin{document}\\n\\\\section{Intro}\\nText \\\\emph{here}.\\\\footnote{Note.}\\n\\\\end{document}\\n', orig: null };
          persist(p, true); }""", sample_docx())

        # Word file
        await page.evaluate("go('file', { file: 'paper.docx', fileMode: 'write' })")
        await page.wait_for_timeout(400)
        font = await page.eval_on_selector("#ed", "e => getComputedStyle(e).fontFamily")
        check("Write uses a writing font for Word files", "Georgia" in font, font)
        await page.screenshot(path=str(SHOTS / "preview-write.png"))
        await page.click('[data-mode="preview"]')
        await page.wait_for_selector(".pg-paper h1")
        html = await page.inner_html(".pg-paper")
        text = await page.inner_text(".pg-paper")
        check("Word: title, headings, italics, quotation and list", "<h1" in html and ">Introduction</h2>" in html and ">Background</h3>" in html and "<em>large language models</em>" in html and "<blockquote>" in html and "<ul><li>First recommendation" in html, html[:600])
        check("no line numbers or paragraph marks", "¶" not in text and await page.query_selector(".code-view") is None)
        check("page is white paper", await page.eval_on_selector(".pg-paper", "e => getComputedStyle(e).backgroundColor") == "rgb(255, 255, 255)")
        check("labels are plain", "Who wrote what" in await page.inner_text(".seg") and "Line history" not in await page.inner_text(".seg"))
        await page.screenshot(path=str(SHOTS / "preview-word.png"))

        # Markdown
        await page.evaluate("go('file', { file: 'essay.md', fileMode: 'preview' })")
        await page.wait_for_selector(".pg-paper h1")
        html = await page.inner_html(".pg-paper")
        text = await page.inner_text(".pg-paper")
        check("Markdown: title and byline from the top of the file", "An Essay</h1>" in html and "Sipho Langa" in text and "title:" not in text)
        check("Markdown: formatting instead of symbols", "<strong>bold</strong>" in html and "<em>italic</em>" in html and "**" not in text and "##" not in text)
        check("citations print in the chosen style", "(Smith, 2020, p. 4)" in text, text)
        check("footnotes numbered with notes at the end", "pg-fn" in html and "A footnote." in await page.inner_text(".pg-notes"))
        check("reference list added", "Smith, J. (2020). Dark Patterns." in await page.inner_text(".pg-refs"))
        check("missing citations are highlighted", await page.query_selector(".pg-cite.missing") is not None and "1 citation not in References" in await page.inner_text(".pg-bar"))
        await page.click(".pg-bar [data-tab='format']")
        await page.wait_for_timeout(300)
        check("button leads to Format", await page.evaluate("S.route") == "format")

        # LaTeX
        await page.evaluate("go('file', { file: 't.tex', fileMode: 'write' })")
        await page.wait_for_timeout(300)
        check("LaTeX keeps the code font in Write", "Georgia" not in await page.eval_on_selector("#ed", "e => getComputedStyle(e).fontFamily"))
        await page.click('[data-mode="preview"]')
        await page.wait_for_selector(".pg-paper h1")
        text = await page.inner_text(".pg-paper")
        check("LaTeX preview has no commands", "TeX Paper" in text and "Intro" in text and "\\" not in text and "Note." in text, text)

        # dark mode: the page stays paper-white and readable
        await page.evaluate("document.documentElement.dataset.theme = 'dark'")
        await page.evaluate("go('file', { file: 'essay.md', fileMode: 'preview' })")
        await page.wait_for_selector(".pg-paper h1")
        await page.wait_for_timeout(200)
        check("dark mode keeps dark text on the white page", await page.eval_on_selector(".pg-paper h2", "e => getComputedStyle(e).color") == "rgb(31, 35, 40)")
        await page.screenshot(path=str(SHOTS / "preview-dark.png"))
        check("no page errors", not errors, errors[:3])
        await browser.close()
    print(f"\n{'All passed' if not failures else str(len(failures)) + ' failed'}")
    raise SystemExit(1 if failures else 0)

asyncio.run(main())
