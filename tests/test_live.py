"""End-to-end tests of live collaboration (Google Docs / Word for the web) against mock Google and Microsoft APIs.

Covers sharing a file with a link or by invitation, checking for new edits, bringing collaborators'
changes back (LaTeX via Google Docs, Word via OneDrive), reviewing and saving them as a version,
Google Docs comments, updating the live copy and stopping sharing.

Run:  ./build.sh && python3 tests/test_live.py
"""
import asyncio
import os
import pathlib
import sys

from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
APP = (ROOT / "index.html").as_uri()
SHOTS = ROOT / "tests" / "screenshots"
SHOTS.mkdir(exist_ok=True)
MOCK = (ROOT / "tests" / "mock_live.js").read_text()
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
        page = await browser.new_page(viewport={"width": 1360, "height": 900})
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        await page.add_init_script("localStorage.setItem('wb.cid.google','test-google.apps.googleusercontent.com'); localStorage.setItem('wb.cid.microsoft','00000000-test');")
        await page.add_init_script(MOCK)
        await page.goto(APP)
        await page.wait_for_timeout(1200)

        async def shot(name, full=False):
            await page.wait_for_timeout(250)
            await page.screenshot(path=str(SHOTS / f"live-{name}.png"), full_page=full)

        async def primary():
            await page.wait_for_selector(".overlay .mactions .btn-primary")
            await page.click(".overlay .mactions .btn-primary")
            await page.wait_for_timeout(500)

        # --- share memo.tex to Google Docs with a link
        await page.evaluate('go("file", {file: "memo.tex"})')
        await page.click("#f-live")
        await page.wait_for_selector('input[name="prov"]')
        ms_disabled = await page.evaluate("""document.querySelector('input[name="prov"][value="microsoft"]').disabled""")
        check("Word for the web is offered only for .docx/.xlsx", ms_disabled)
        await shot("share-dialog")
        await primary()
        await page.wait_for_selector("#lv-link")
        link = await page.input_value("#lv-link")
        check("sharing returns an edit link", link.startswith("https://docs.google.com/document/d/"), link)
        g = await page.evaluate("""() => { const f = Object.values(__mockLive.files)[0]; return { mime: f.mimeType, source: f.source, anyone: f.permissions.some(x => x.type === 'anyone' && x.role === 'writer'), text: __mockLive.text(Object.keys(__mockLive.files)[0]).slice(0, 30) }; }""")
        check("LaTeX goes to Google Docs as plain text", g["mime"] == "application/vnd.google-apps.document" and g["source"] == "text/plain" and g["text"].startswith("\\documentclass"), g)
        check("anyone with the link can edit (no account)", g["anyone"], g)
        await shot("link-ready")
        await page.click(".overlay .mactions .btn-primary")

        # --- a collaborator edits it and comments
        await page.evaluate("""() => { const fid = Object.keys(__mockLive.files)[0];
            __mockLive.edit(fid, b => new TextEncoder().encode('\\uFEFF' + new TextDecoder().decode(b).replace('Adopt option 2, with option 1 as a complementary requirement.', 'Adopt option 2 now, with option 1 as a complementary requirement.').replace(/\\n/g, '\\r\\n')), 'Ana Ruiz');
            __mockLive.comment(fid, { author: 'Ana Ruiz', text: 'Should we cite the panel size here?', quote: 'Survey evidence suggests many consumers keep paying' }); }""")
        await page.evaluate('go("live")')
        await page.wait_for_selector(".live-box .label")
        await page.wait_for_timeout(500)
        state = await page.inner_text(".live-box [data-st]")
        check("Live tab shows new edits and who made them", "New edits" in state and "Ana Ruiz" in state, state)
        check("Google Docs comments come back", "cite the panel size" in await page.inner_text(".live-box [data-cm]"))
        await shot("live-tab", True)

        # --- bring changes back, review, save
        await page.click('.live-box [data-act="back"]')
        await page.wait_for_selector(".docdiff", timeout=10000)
        txt = await page.evaluate("P().working['memo.tex'].text")
        check("collaborator's edit comes back (BOM and Windows line endings cleaned)", "Adopt option 2 now," in txt and "\r" not in txt and not txt.startswith("﻿"), repr(txt[:40]))
        check("only the real edit shows as a change", await page.evaluate("changedPaths(P()).map(c => c.path).join(',')") in ("memo.tex", "memo.tex,notes.md"))
        await shot("review-their-changes", True)
        await page.evaluate("() => { saveFlow(); }")
        await page.wait_for_selector("#sv-msg")
        msg = await page.input_value("#sv-msg")
        check("version message is pre-filled with where the edits came from", "Google Docs" in msg and "Ana Ruiz" in msg, msg)
        await primary()
        check("their edits saved as a version", await page.evaluate("P().versions[headId(P())].message.includes('Google Docs')"))

        # --- Word for the web: invite by email, edit, bring back
        await page.evaluate('go("file", {file: "briefing.docx"})')
        await page.click("#f-live")
        await page.click('input[name="prov"][value="microsoft"]')
        await page.click('input[name="mode"][value="people"]')
        await page.fill("#lv-em", "jo@example.com, sam@example.org")
        await primary()
        await page.wait_for_selector(".overlay .mactions .btn-primary")
        await page.click(".overlay .mactions .btn-primary")
        calls = await page.evaluate("__mockLive.calls")
        check("Word sharing invites people by email", "invite jo@example.com" in calls and "invite sam@example.org" in calls, calls)
        await page.evaluate("""() => { const fid = Object.keys(__mockLive.files).find(k => __mockLive.files[k].provider === 'microsoft');
            const t = P().working['briefing.docx'].text.replace('raise churn and prices.', 'raise churn and prices, though evidence is mixed.');
            __mockLive.edit(fid, () => textToDocx(t), 'Jo Park'); }""")
        await page.evaluate('go("file", {file: "briefing.docx"})')
        await page.wait_for_selector("[data-lback]")
        await page.wait_for_timeout(400)
        check("file banner shows the live status", "Jo Park" in await page.inner_text(".live-flash"))
        await shot("file-banner")
        await page.click("[data-lback]")
        await page.wait_for_selector(".docdiff", timeout=10000)
        w = await page.evaluate("({ t: P().working['briefing.docx'].text, orig: !!P().working['briefing.docx'].orig })")
        check("Word edits come back with the .docx file kept", "evidence is mixed" in w["t"] and w["orig"], w)

        # --- update live copy, stop sharing
        await page.evaluate("async () => { await pushLive(P(), 'briefing.docx'); }")
        same = await page.evaluate("""async () => { const fid = Object.keys(__mockLive.files).find(k => __mockLive.files[k].provider === 'microsoft'); return (await docxToText(__mockLive.files[fid].bytes)) === P().working['briefing.docx'].text; }""")
        check("update live copy sends your current text", same)
        await page.evaluate("async () => { await stopLive(P(), 'memo.tex'); }")
        st = await page.evaluate("""() => ({ live: !!(P().live || {})['memo.tex'], perms: Object.values(__mockLive.files)[0].permissions.map(x => x.role) })""")
        check("stop sharing removes access and the link", not st["live"] and st["perms"] == ["owner"], st)

        # --- settings connections + not-configured guidance
        await page.evaluate('go("settings")')
        await page.wait_for_selector("[data-conn]")
        await shot("settings-connections", True)
        await page.evaluate("localStorage.removeItem('wb.cid.microsoft'); localStorage.removeItem('wb.cid.google'); go('file', {file: 'notes.md'})")
        await page.click("#f-live")
        await page.wait_for_selector('input[name="prov"]')
        await primary()
        check("explains setup when no client ID is configured", "Settings" in await page.inner_text("#lv-err"))

        check("no page errors", not errors, "; ".join(errors))
        await browser.close()
    print(f"\n{'All live-collaboration checks passed' if not failures else str(len(failures)) + ' failed: ' + ', '.join(failures)}. Screenshots in {SHOTS}")
    sys.exit(1 if failures else 0)


asyncio.run(main())
