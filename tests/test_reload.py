"""Refreshing keeps you where you were.

A refresh reopens the same project and screen; a new tab opens the project used last; if that project was removed,
the first project opens instead; Back still works after a refresh.

Run:  ./build.sh && python3 tests/test_reload.py
"""
import asyncio
import os
import pathlib

from playwright.async_api import async_playwright

APP = (pathlib.Path(__file__).resolve().parent.parent / "index.html").as_uri()
CHROME = os.environ.get("CHROME_PATH")
failures = []


def check(name, cond, detail=""):
    print(("PASS " if cond else "FAIL ") + name + (f"  ({detail})" if detail and not cond else ""))
    if not cond:
        failures.append(name)


async def main():
    async with async_playwright() as p:
        kw = {"executable_path": CHROME, "args": ["--no-sandbox"]} if CHROME else {}
        browser = await p.chromium.launch(**kw)
        ctx = await browser.new_context()
        page = await ctx.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        await page.goto(APP)
        await page.wait_for_timeout(1000)
        first = await page.evaluate("S.projects[0].id")
        pid = await page.evaluate("""async () => { const p = newProject('thesis'); p.working['chapter.md'] = { text: '# One\\n\\nText.\\n', orig: null }; S.projects.push(p); await persist(p, true); S.pid = p.id; resetSel(); go('files'); go('file', { file: 'chapter.md' }); return p.id; }""")
        await page.wait_for_timeout(500)
        await page.reload()
        await page.wait_for_timeout(1200)
        st = await page.evaluate("[S.pid, S.route, S.file]")
        check("refresh keeps the project and the open file", st == [pid, "file", "chapter.md"], st)
        check("page shows the thesis project", "thesis" in await page.inner_text("header"))
        await page.go_back()
        await page.wait_for_timeout(500)
        check("Back still works after a refresh", await page.evaluate("[S.pid, S.route]") == [pid, "files"], await page.evaluate("[S.pid, S.route]"))

        page2 = await ctx.new_page()
        await page2.goto(APP)
        await page2.wait_for_timeout(1200)
        check("a new tab opens the project used last", await page2.evaluate("S.pid") == pid)
        await page2.goto(APP + "#history")
        await page2.wait_for_timeout(1200)
        check("a link to a tab opens it in the project used last", await page2.evaluate("[S.pid, S.route]") == [pid, "history"])

        await page.evaluate("go('files')")
        await page.evaluate("""async () => { const p = P(); S.projects = S.projects.filter(x => x.id !== p.id); await dbDel(p.id); S.pid = S.projects[0].id; resetSel(); go('home'); }""")
        await page.wait_for_timeout(300)
        await page.evaluate("localStorage.setItem('wb.last', JSON.stringify({ pid: 'gone' }))")
        page3 = await ctx.new_page()
        await page3.goto(APP)
        await page3.wait_for_timeout(1200)
        check("a removed project falls back to the first project", await page3.evaluate("S.pid") == first)

        await page.evaluate("""() => { history.replaceState({ route: 'file', pid: S.pid, file: 'nope.md' }, '', '#files'); }""")
        await page.reload()
        await page.wait_for_timeout(1200)
        check("a file that no longer exists falls back to the file list", await page.evaluate("[S.route, S.file]") == ["files", None], await page.evaluate("[S.route, S.file]"))
        check("no page errors", not errors, errors[:3])
        await browser.close()
    print(f"\n{'All passed' if not failures else str(len(failures)) + ' failed'}")
    raise SystemExit(1 if failures else 0)

asyncio.run(main())
