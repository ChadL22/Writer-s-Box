"""End-to-end tests of word and character counts and limits.

Covers counting what a reader sees in Markdown, LaTeX and plain text (markup, comments and front matter left out,
citations counted as printed, emoji and CJK handled), choosing which parts count, selection counts, the live counter,
adding limits from presets, and limit warnings in the file list, sections panel, save dialog and Format checklist.

Run:  ./build.sh && python3 tests/test_counts.py
"""
import asyncio
import os
import pathlib

from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
APP = (ROOT / "index.html").as_uri()
SHOTS = ROOT / "tests" / "screenshots"
SHOTS.mkdir(exist_ok=True)
CHROME = os.environ.get("CHROME_PATH")
failures = []

MD = """---
title: Short Essay
author: Someone
---

## Abstract

Two short sentences here. Another one!

## The Argument

This is **bold** and a [link](https://example.com) with a citation [@smith2020].^[One footnote here.]

> A quoted line of five words.

- first list item
- second

<!-- a hidden comment that should not count -->
"""
TEX = r"""\documentclass{article}
\usepackage{geometry}
\begin{document}
\section{Intro}
Hello \emph{brave} new world. % a comment
\cite{smith2020}
\end{document}
"""


def check(name, cond, detail=""):
    print(("PASS " if cond else "FAIL ") + name + (f"  ({detail})" if detail and not cond else ""))
    if not cond:
        failures.append(name)


async def main():
    async with async_playwright() as p:
        kw = {"executable_path": CHROME, "args": ["--no-sandbox"]} if CHROME else {}
        browser = await p.chromium.launch(**kw)
        page = await browser.new_page(viewport={"width": 1360, "height": 900})
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        await page.goto(APP)
        await page.wait_for_timeout(1000)

        async def shot(name):
            await page.wait_for_timeout(250)
            await page.screenshot(path=str(SHOTS / f"counts-{name}.png"))

        r = await page.evaluate("""([md, tex]) => { const p = P(); S.refStyle = 'apa';
          p.working['refs.bib'].text = '@article{smith2020, author={Smith, Jane}, title={T}, journal={J}, year={2020}}';
          p.working['e.md'] = { text: md, orig: null }; p.working['t.tex'] = { text: tex, orig: null }; p.working['x.txt'] = { text: 'Emoji 👩‍👩‍👧 here. 日本語 text.', orig: null };
          const a = analyze(p, 'e.md'), t = analyze(p, 't.tex'), x = analyze(p, 'x.txt');
          return { parts: Object.fromEntries(Object.entries(a.parts).map(([k, v]) => [k, v.words])), total: a.counted.words, sentences: a.counted.sentences,
                   tex: t.counted.words, texCite: t.parts.citations.words, x: x.counted, sel: selectionStats('t.tex', 'Hello \\\\emph{brave} new') }; }""", [MD, TEX])
        P_ = r["parts"]
        check("headings: title and the one section heading (Abstract belongs to the abstract)", P_["headings"] == 4, P_)
        check("abstract counted separately", P_["abstract"] == 6, P_)
        check("body leaves out markup, link URL and comment", P_["body"] == 9, P_)
        check("citation counted as printed (Smith, 2020)", P_["citations"] == 2, P_)
        check("footnote, quote and list parts", P_["footnotes"] == 3 and P_["quotes"] == 6 and P_["lists"] == 4, P_)
        check("reference list not counted by default", r["total"] == sum(v for k, v in P_.items() if k != "references") and P_["references"] > 0, r)
        check("LaTeX: commands and comments left out", r["tex"] == 7 and r["texCite"] == 2, r)
        check("emoji counts as one character, CJK characters as words", r["x"]["words"] == 6 and r["x"]["chars"] == 23, r["x"])
        check("selection count strips LaTeX", r["sel"]["words"] == 3, r["sel"])

        # live counter
        await page.evaluate("go('file', { file: 'e.md', fileMode: 'write' })")
        await page.wait_for_timeout(400)
        bar = await page.inner_text("#cnt-bar")
        check("counter under the editor", f"{r['total']} words" in bar and "min read" in bar, bar)
        await page.evaluate("() => { const t = $('#ed'); const i = t.value.indexOf('This is'); t.focus(); t.setSelectionRange(i, i + 15); t.dispatchEvent(new Event('select')); }")
        await page.wait_for_timeout(200)
        check("selection count shows", "Selected: 3 words" in await page.inner_text("#cnt-bar"), await page.inner_text("#cnt-bar"))
        await page.focus("#ed")
        await page.keyboard.press("Control+End")
        await page.keyboard.type(" More words typed now.")
        await page.wait_for_timeout(500)
        check("counter updates while typing", f"{r['total'] + 4} words" in await page.inner_text("#cnt-bar"), await page.inner_text("#cnt-bar"))

        # dialog: what counts + limits
        await page.click("#cnt-open")
        await page.wait_for_timeout(300)
        await shot("dialog")
        before = await page.evaluate("analyze(P(), 'e.md').counted.words")
        await page.uncheck('[data-inc="headings"]')
        await page.wait_for_timeout(200)
        after = await page.evaluate("analyze(P(), 'e.md').counted.words")
        check("leaving out headings changes the count", after == before - 4, (before, after))
        await page.select_option("#cd-preset", "apa-abstract")
        check("preset fills the form", await page.input_value("#cd-max") == "250" and await page.input_value("#cd-part") == "abstract")
        await page.click("#cd-add")
        await page.wait_for_timeout(200)
        await page.fill("#cd-label", "Assignment")
        await page.fill("#cd-max", "20")
        await page.click("#cd-add")
        await page.wait_for_timeout(200)
        lims = await page.inner_text("#cd-limits")
        check("limits listed with status", "APA abstract" in lims and "Assignment" in lims and "over" in lims, lims)
        await page.fill("#cd-min", "50")
        await page.fill("#cd-max", "10")
        await page.click("#cd-add")
        check("rejects min above max", "larger" in await page.inner_text("#cd-msg"))
        await page.click(".mactions .btn-primary")
        await page.wait_for_timeout(300)
        bar = await page.inner_text("#cnt-bar")
        check("counter shows the over-limit meter", "over" in bar and await page.query_selector("#cnt-bar .lim-over") is not None, bar)
        await shot("bar")

        # file list, save dialog
        await page.evaluate("go('files', { dir: '' })")
        await page.wait_for_timeout(300)
        check("file list flags the file", "Over limit" in await page.inner_text("#view"))
        await page.evaluate("() => { saveFlow(); }")
        await page.wait_for_timeout(300)
        check("save dialog warns but still allows saving", "words over" in await page.inner_text(".modal") and "You can still save" in await page.inner_text(".modal"))
        await page.click(".mactions button:has-text('Cancel')")

        # sections with a per-section limit
        await page.evaluate("""() => { const p = P(); p.working['book.md'] = { text: '# One\\n\\nAlpha beta gamma.\\n\\n# Two\\n\\nDelta epsilon.\\n', orig: null }; applySplit(p, 'book.md', planSplit(p, 'book.md', 1, 'book')); p.limits['book/one.md'] = [{ id: 'a', unit: 'words', max: 3, min: null, part: 'counted' }]; persist(p, true); go('file', { file: 'book.md' }); }""")
        await page.wait_for_timeout(400)
        sec = await page.inner_text(".sec-list")
        check("sections panel shows the section's limit", "4 / 3" in sec and await page.query_selector(".sec-list .lim-over") is not None, sec)
        bar = await page.inner_text("#cnt-bar")
        check("main document counts every section", "7 words" in bar and "whole document" in bar, bar)
        await page.evaluate("go('file', { file: 'book/two.md' })")
        await page.wait_for_timeout(300)
        await page.evaluate("P().limits['book.md'] = [{ id: 'b', unit: 'chars', max: 40, min: null, part: 'counted' }]; go('file', { file: 'book/two.md' }, true)")
        await page.wait_for_timeout(300)
        check("a section shows the whole document's limit too", "book.md:" in await page.inner_text("#cnt-bar"), await page.inner_text("#cnt-bar"))

        # Format checklist
        await page.evaluate("P().format = { doc: 'book.md', style: 'apa7-student', fields: {}, checked: {} }; go('format')")
        await page.wait_for_timeout(900)
        chk = await page.inner_text("#fm-checks")
        check("Format checklist includes limits", "book/one.md: 4 words (at most 3 words) · 1 words over" in chk or "book/one.md: 4 words" in chk, chk)

        check("no page errors", not errors, errors[:3])
        await browser.close()
    print(f"\n{'All passed' if not failures else str(len(failures)) + ' failed'}")
    raise SystemExit(1 if failures else 0)

asyncio.run(main())
