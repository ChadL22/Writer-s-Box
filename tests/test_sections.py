"""End-to-end tests of sections and browser navigation.

Covers splitting LaTeX and Markdown documents into section files, the sections panel (open, reorder,
add, remove), section-to-section navigation, the assembled preview and download, combining sections
back into one file, and the browser Back/Forward buttons staying inside Writer's Box.

Run:  ./build.sh && python3 tests/test_sections.py
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

TEX = r"""\documentclass{article}
\title{Thesis}
\begin{document}
\maketitle

\section{Introduction}
Intro text \cite{smith2020}.

\subsection{Motivation}
Why it matters.

\section{Methods}
How we did it.
% \input{ignored}

\section{Results}
What we found.

\bibliography{refs}
\end{document}
"""
MD = """---
title: Essay
---
Opening paragraph.

# Part one
First part.

```
# not a heading
```

# Part two
Second part.
"""


def check(name, cond, detail=""):
    print(("PASS " if cond else "FAIL ") + name + (f"  ({detail})" if detail and not cond else ""))
    if not cond:
        failures.append(name)


async def main():
    async with async_playwright() as p:
        kw = {"executable_path": CHROME, "args": ["--no-sandbox"]} if CHROME else {}
        browser = await p.chromium.launch(**kw)
        ctx = await browser.new_context(viewport={"width": 1360, "height": 900}, accept_downloads=True)
        page = await ctx.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        await page.goto(APP)
        await page.wait_for_timeout(1200)

        async def shot(name, full=False):
            await page.wait_for_timeout(250)
            await page.screenshot(path=str(SHOTS / f"sections-{name}.png"), full_page=full)

        await shot("logo")
        logo = await page.eval_on_selector("#h-home svg.logo", "e => getComputedStyle(e).color")
        check("logo is the box and uses the theme's header colour", logo in ("rgb(255, 255, 255)", "rgb(240, 246, 252)"), logo)

        # ---------- engine ----------
        r = await page.evaluate("""([tex, md]) => { const p = { working: { "thesis/main.tex": { text: tex }, "essay.md": { text: md } } };
          const hs = secHeadings(tex, "tex"), mh = secHeadings(md, "md");
          const plan = planSplit(p, "thesis/main.tex", 2, "sections"); applySplit(p, "thesis/main.tex", plan);
          const mp = planSplit(p, "essay.md", 1, "essay"); applySplit(p, "essay.md", mp);
          return { hs: hs.map(h => h.title + h.rank), mh: mh.map(h => h.title), files: Object.keys(p.working).sort(), main: p.working["thesis/main.tex"].text,
            incs: secIncludes(p, "thesis/main.tex").map(s => s.path), back: assemble(p, "thesis/main.tex"), mdMain: p.working["essay.md"].text, mdBack: assemble(p, "essay.md"),
            intro: p.working["thesis/sections/introduction.tex"].text, parents: secParents(p, "thesis/sections/methods.tex") }; }""", [TEX, MD])
        check("finds LaTeX headings with levels", r["hs"] == ["Introduction2", "Motivation3", "Methods2", "Results2"], r["hs"])
        check("Markdown headings skip front matter and code", r["mh"] == ["Part one", "Part two"], r["mh"])
        check("creates one file per section", r["files"] == ["essay.md", "essay/part-one.md", "essay/part-two.md", "thesis/main.tex", "thesis/sections/introduction.tex", "thesis/sections/methods.tex", "thesis/sections/results.tex"], r["files"])
        check("main file keeps preamble and bibliography, uses \\input", r["main"] == "\\documentclass{article}\n\\title{Thesis}\n\\begin{document}\n\\maketitle\n\n\\input{sections/introduction}\n\\input{sections/methods}\n\\input{sections/results}\n\n\\bibliography{refs}\n\\end{document}\n", r["main"])
        check("subsections stay inside their section", "\\subsection{Motivation}" in r["intro"])
        check("commented-out \\input is ignored", r["incs"] == ["thesis/sections/introduction.tex", "thesis/sections/methods.tex", "thesis/sections/results.tex"], r["incs"])
        check("assembling gives back the same words", r["back"].split() == TEX.split(), r["back"])
        check("Markdown main uses include comments", "<!-- include: essay/part-one.md -->" in r["mdMain"] and r["mdMain"].startswith("---\ntitle: Essay\n---\nOpening paragraph."), r["mdMain"])
        check("Markdown assembles back", r["mdBack"].split() == MD.split(), r["mdBack"])
        check("knows which document a section belongs to", r["parents"] == ["thesis/main.tex"], r["parents"])

        # ---------- UI ----------
        await page.evaluate("""tex => { const p = P(); p.working["thesis.tex"] = { text: tex, orig: null }; persist(p, true); go("file", { file: "thesis.tex", fileMode: "write" }); }""", TEX)
        await page.wait_for_timeout(300)
        await page.click("#f-sec")
        await page.wait_for_timeout(200)
        plan = await page.inner_text("#sp-plan")
        check("split preview lists files", "thesis/introduction.tex" in plan and "thesis/results.tex" in plan, plan)
        await page.select_option("#sp-rank", "3")
        await page.wait_for_timeout(100)
        check("can split at a finer level", "thesis/motivation.tex" in await page.inner_text("#sp-plan"))
        await page.select_option("#sp-rank", "2")
        await shot("split")
        await page.click(".mactions .btn-primary")
        await page.wait_for_timeout(300)
        rows = await page.query_selector_all("[data-sec]")
        check("sections panel lists 3 sections", len(rows) == 3, len(rows))
        await shot("panel")

        # reorder
        await page.click('[data-sec-down="0"]')
        await page.wait_for_timeout(200)
        order = await page.evaluate("secIncludes(P(), 'thesis.tex').map(s => s.path)")
        check("move down reorders the document", order == ["thesis/methods.tex", "thesis/introduction.tex", "thesis/results.tex"], order)
        await page.click('[data-sec-up="1"]')
        await page.wait_for_timeout(200)

        # preview is assembled
        await page.click('[data-mode="preview"]')
        await page.wait_for_timeout(200)
        await page.wait_for_selector(".pg-paper p")
        pv = await page.inner_text(".pg-paper")
        check("preview shows the whole document", "Why it matters." in pv and "What we found." in pv)
        await page.click('[data-mode="write"]')

        # add a section before results
        await page.click("[data-sec-add]")
        await page.fill("#as-title", "Discussion & Limits")
        await page.select_option("#as-pos", "2")
        await page.click(".mactions .btn-primary")
        await page.wait_for_timeout(300)
        cur = await page.evaluate("[S.file, P().working[S.file].text]")
        check("add section creates the file and opens it", cur[0] == "thesis/discussion-limits.tex" and cur[1].startswith("\\section{Discussion & Limits}"), cur)
        order = await page.evaluate("secIncludes(P(), 'thesis.tex').map(s => s.path)")
        check("new section goes where chosen", order == ["thesis/introduction.tex", "thesis/methods.tex", "thesis/discussion-limits.tex", "thesis/results.tex"], order)
        nav = await page.inner_text(".sec-nav")
        check("section shows its place", "Section 3 of 4" in nav, nav)
        await shot("section-nav")
        await page.click(".sec-nav button:has-text('Next')")
        await page.wait_for_timeout(200)
        check("Next goes to the following section", await page.evaluate("S.file") == "thesis/results.tex")

        # back button walks back through screens
        await page.go_back()
        await page.wait_for_timeout(300)
        check("Back returns to the previous section", await page.evaluate("S.route + ':' + S.file") == "file:thesis/discussion-limits.tex", await page.evaluate("S.route + ':' + S.file"))
        await page.go_back()
        await page.wait_for_timeout(300)
        check("Back again returns to the main document", await page.evaluate("S.file") == "thesis.tex")
        await page.go_forward()
        await page.wait_for_timeout(300)
        check("Forward works too", await page.evaluate("S.file") == "thesis/discussion-limits.tex")
        await page.evaluate("go('history')")
        await page.wait_for_timeout(200)
        await page.evaluate("go('refs')")
        await page.wait_for_timeout(200)
        await page.go_back()
        await page.wait_for_timeout(300)
        check("Back between tabs", await page.evaluate("S.route") == "history" and page.url.endswith("#history"), page.url)
        await page.click("#rf-add" if False else '[data-tab="settings"]')
        await page.wait_for_timeout(200)
        await page.evaluate("go('refs')")
        await page.wait_for_timeout(200)
        await page.click("#rf-add")
        await page.wait_for_timeout(200)
        await page.go_back()
        await page.wait_for_timeout(300)
        check("Back closes an open dialog and goes back", await page.query_selector(".overlay") is None and await page.evaluate("S.route") == "settings")
        for _ in range(30):
            if page.url.startswith("file:") and "index.html" in page.url and await page.evaluate("history.state && history.state.route") == "home":
                break
            await page.go_back()
            await page.wait_for_timeout(120)
        check("Backing all the way lands on Home, still in Writer's Box", "index.html" in page.url and await page.evaluate("S.route") == "home", page.url)

        # file list label, download combined, combine back
        await page.evaluate("go('files', { dir: '' })")
        await page.wait_for_timeout(200)
        lst = await page.inner_text("#view")
        check("file list marks the sectioned document", "4 sections" in lst)
        await page.evaluate("go('file', { file: 'thesis.tex', fileMode: 'write' })")
        await page.wait_for_timeout(200)
        async with page.expect_download() as dl:
            await page.select_option("#f-dl", "combined")
        d = await dl.value
        txt = pathlib.Path(await d.path()).read_text()
        check("download the whole document as one file", d.suggested_filename == "thesis.tex" and "How we did it." in txt and "\\input{thesis" not in txt, txt[:200])

        await page.click('[data-sec-rm="2"]')
        await page.click(".mactions button:has-text('Delete the file too')")
        await page.wait_for_timeout(200)
        check("remove section and delete its file", await page.evaluate("!P().working['thesis/discussion-limits.tex'] && secIncludes(P(), 'thesis.tex').length === 3"))

        await page.click("[data-sec-menu]")
        await page.click('[data-act="combine"]')
        await page.click(".mactions .btn-danger")
        await page.wait_for_timeout(300)
        r = await page.evaluate("[P().working['thesis.tex'].text, Object.keys(P().working).filter(k => k.startsWith('thesis/'))]")
        check("combine puts the sections back and removes their files", r[0].split() == TEX.split() and r[1] == [], r)

        # markdown with no headings -> add first section
        await page.evaluate("() => { const p = P(); p.working['draft.md'] = { text: 'Just some notes.\\n', orig: null }; persist(p, true); go('file', { file: 'draft.md', fileMode: 'write' }); }")
        await page.wait_for_timeout(200)
        await page.click("#f-sec")
        await page.click(".mactions .btn-primary")
        await page.wait_for_timeout(200)
        await page.fill("#as-title", "Chapter One")
        await page.click(".mactions .btn-primary")
        await page.wait_for_timeout(300)
        r = await page.evaluate("[S.file, P().working['draft.md'].text, P().working[S.file].text]")
        check("start sections in a document without headings", r[0] == "draft/chapter-one.md" and r[1] == "Just some notes.\n\n<!-- include: draft/chapter-one.md -->\n" and r[2].startswith("## Chapter One"), r)

        await page.evaluate("document.documentElement.dataset.theme = 'dark'")
        await page.evaluate("go('file', { file: 'memo.tex' })")
        await shot("dark")
        check("no page errors", not errors, errors[:3])
        await browser.close()
    print(f"\n{'All passed' if not failures else str(len(failures)) + ' failed'}")
    raise SystemExit(1 if failures else 0)

asyncio.run(main())
