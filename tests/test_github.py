"""End-to-end tests of Writer's Box's GitHub features against an in-memory mock of the GitHub API.

Covers sign-in, publishing a local project with its full history, saving versions as commits,
drafts as branches, milestones as tags, reviews (pull requests: comment, paragraph comments, merge),
notes (issues: labels, comments, done), opening a repo fresh, insights and line history.

Run:  ./build.sh && python3 tests/test_github.py
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
MOCK = (ROOT / "tests" / "mock_github.js").read_text()
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
        await page.add_init_script(MOCK)
        await page.goto(APP)
        await page.wait_for_timeout(1200)

        async def shot(name, full=False):
            await page.wait_for_timeout(250)
            await page.screenshot(path=str(SHOTS / f"gh-{name}.png"), full_page=full)

        async def modal_primary():
            await page.wait_for_selector(".overlay .mactions .btn-primary")
            await page.click(".overlay .mactions .btn-primary")
            await page.wait_for_timeout(500)

        # --- sign in through the dialog
        await shot("home-signed-out")
        await page.click("#h-signin")
        await page.fill("#tok", "ghp_testtoken")
        await modal_primary()
        check("sign in", await page.evaluate("ghSignedIn() && GH.user.login") == "writer-test")
        await shot("home-signed-in")

        # --- publish the example project with its history
        local_versions = await page.evaluate("Object.keys(P().versions).length")
        await page.evaluate('go("files")')
        await page.click("#r-pub")
        await page.fill("#pb-name", "click-to-cancel-memo")
        await modal_primary()
        await page.wait_for_function("P().remote && P().remote.syncedAt", timeout=20000)
        info = await page.evaluate("""() => { const p = P(), r = __mockGitHub.repos['writer-test/click-to-cancel-memo'];
            return { remote: p.remote.owner + '/' + p.remote.repo, versions: Object.keys(p.versions).length, drafts: Object.keys(p.drafts).sort(),
                     tags: Object.keys(r.refs).filter(k => k.startsWith('tags/')), topics: r.topics, private: r.private,
                     unsaved: changedPaths(p).map(c => c.path), readme: !!r.trees[r.commits[r.refs['heads/main']].tree]['README.md'],
                     root: p.versions[firstParentChain(p, p.drafts.main).at(-1)].message }; }""")
        check("publish links the project", info["remote"] == "writer-test/click-to-cancel-memo", info)
        check("publish copies every version, history starting at the first draft", info["versions"] == local_versions and info["root"] == "First full draft", info)
        check("drafts become branches", info["drafts"] == ["main", "shorter-summary"], info)
        check("milestones become tags", info["tags"] == ["tags/Sent-to-reviewers"], info)
        check("repo is private and tagged writers-box", info["private"] and info["topics"] == ["writers-box"], info)
        check("unsaved edits survive publishing", info["unsaved"] == ["notes.md"], info)
        await shot("files-remote")

        # --- save a version as a commit
        await page.click(".filebar [data-save]")
        await page.fill("#sv-msg", "Add reviewer 2 note")
        await modal_primary()
        await page.wait_for_timeout(600)
        saved = await page.evaluate("""() => { const p = P(), r = __mockGitHub.repos['writer-test/click-to-cancel-memo'], head = r.refs['heads/main'], c = r.commits[head], t = r.trees[c.tree];
            return { msg: c.message, local: p.drafts.main === head, unsaved: changedPaths(p).length, readme: !!t['README.md'],
                     notes: atob(r.blobs[t['notes.md']].content).includes('Reviewer 2') }; }""")
        check("save version commits to GitHub", saved["msg"] == "Add reviewer 2 note" and saved["local"] and saved["unsaved"] == 0, saved)
        check("commit keeps files Writer's Box doesn't manage (README)", saved["readme"], saved)
        check("commit carries the edited text", saved["notes"], saved)

        # --- milestone as tag, new draft as branch, edit + save on the draft
        head = await page.evaluate("headId(P())")
        await page.evaluate(f'() => {{ milestoneFlow("{head}"); }}')
        await page.fill("#ask-in", "Second round")
        await modal_primary()
        check("milestone creates a tag", await page.evaluate("'tags/Second-round' in __mockGitHub.repos['writer-test/click-to-cancel-memo'].refs"))
        await page.evaluate(f'() => {{ newDraftFlow("{head}"); }}')
        await page.fill("#ask-in", "tighter-options")
        await modal_primary()
        check("new draft creates a branch", await page.evaluate("'heads/tighter-options' in __mockGitHub.repos['writer-test/click-to-cancel-memo'].refs"))
        await page.evaluate("""async () => { const p = P(); p.working['memo.tex'].text = p.working['memo.tex'].text.replace('Default expiry: subscriptions lapse unless the consumer actively renews each year.', 'Default expiry: subscriptions lapse after twelve months unless renewed.'); await saveVersionRemote(p, 'Tighten option 3'); }""")
        check("draft version commits to its branch", await page.evaluate("__mockGitHub.repos['writer-test/click-to-cancel-memo'].refs['heads/tighter-options'] === P().drafts['tighter-options']"))

        # --- request a review (pull request)
        await page.evaluate('go("reviews")')
        await page.wait_for_selector("#rv-new")
        await shot("reviews-empty")
        await page.click("#rv-new")
        await page.select_option("#rq-d", "tighter-options")
        check("review title follows the chosen draft", await page.input_value("#rq-t") == "Tighten option 3")
        await page.fill("#rq-b", "I shortened **option 3**. Does it still read clearly?")
        await modal_primary()
        await page.wait_for_selector(".pr-head h1")
        check("review opens a pull request", await page.evaluate("__mockGitHub.repos['writer-test/click-to-cancel-memo'].issues.some(i => i.pr && i.head === 'tighter-options')"))
        await page.fill("#rv-txt", "Reads well. One nit on the date.")
        await page.click('[data-ev="COMMENT"]')
        await page.wait_for_timeout(600)
        check("comment appears in the conversation", "One nit on the date" in await page.inner_text("#rv-body"))
        await shot("review-conversation", True)

        # --- paragraph comment from the Changes tab
        await page.click('[data-rt="changes"]')
        await page.wait_for_selector(".addc", state="attached")
        await shot("review-changes", True)
        await page.evaluate("document.querySelector('.addc').click()")
        await page.fill("#lc-t", "Twelve months: should this match the compliance window?")
        await modal_primary()
        cm = await page.evaluate("Object.values(__mockGitHub.repos['writer-test/click-to-cancel-memo'].comments).flat().map(c => c.body).join('\\n')")
        check("paragraph comment quotes the passage", "memo.tex" in cm and "> " in cm and "Twelve months" in cm, cm)

        # --- merge
        await page.click('[data-rt="conversation"]')
        await page.wait_for_selector("#rv-merge")
        await page.click("#rv-merge")
        await modal_primary()
        await page.wait_for_selector(".state.merged", timeout=10000)
        merged = await page.evaluate("""() => { const r = __mockGitHub.repos['writer-test/click-to-cancel-memo']; return { mainHasDraft: r.refs['heads/main'] === r.refs['heads/tighter-options'] || r.commits[r.refs['heads/main']].parents.includes(r.refs['heads/tighter-options']), local: P().drafts.main === r.refs['heads/main'] }; }""")
        check("merge lands the draft on main (GitHub and local)", merged["mainHasDraft"] and merged["local"], merged)
        await shot("review-merged")

        # --- notes (issues)
        await page.evaluate('go("notes")')
        await page.wait_for_selector("#nt-new")
        await page.click("#nt-new")
        await page.wait_for_selector("#nn-t")
        await page.fill("#nn-t", "Check the survey sample size")
        await page.fill("#nn-b", "> Survey evidence suggests many consumers keep paying\n\n- [ ] find the n\n- [ ] cite the panel")
        await page.click('.nn-l[value="citation"]')
        await modal_primary()
        await page.wait_for_selector("#nc-go")
        await page.fill("#nc-t", "Panel n = 2,000 per the appendix.")
        await page.click("#nc-go")
        await page.wait_for_timeout(500)
        await shot("note", True)
        await page.click("#nc-state")
        await page.wait_for_timeout(500)
        note = await page.evaluate("""() => { const r = __mockGitHub.repos['writer-test/click-to-cancel-memo'], i = r.issues.find(x => !x.pr); return { state: i.state, labels: i.labels.map(l => l.name), comments: (r.comments[i.number] || []).length, labelsMade: r.labels.length }; }""")
        check("note created with a writing label", note["labels"] == ["citation"] and note["labelsMade"] == 5, note)
        check("note comment + mark done", note["comments"] == 1 and note["state"] == "closed", note)
        await page.evaluate('go("notes")')
        await page.wait_for_selector("#nt-new")
        await shot("notes-list")

        # --- insights + line history
        await page.evaluate('go("insights")')
        await page.wait_for_selector("svg.chart")
        await shot("insights", True)
        await page.evaluate('go("file", {file: "memo.tex", fileMode: "blame"})')
        await page.wait_for_selector("table.blame")
        blame = await page.evaluate("blame(P(), 'memo.tex', headId(P())).filter(r => r.line.includes('twelve months')).map(r => P().versions[r.vid].message)")
        check("line history attributes edited line to its version", blame and blame[0] == "Tighten option 3", blame)
        await shot("blame")

        # --- open the repo fresh, as a collaborator on another device would
        fresh = await page.evaluate("""async () => { const p = await cloneRepo('writer-test', 'click-to-cancel-memo'); const o = P();
            return { same: JSON.stringify(Object.keys(p.working).sort()) === JSON.stringify(Object.keys(o.working).sort()) && Object.keys(p.working).every(k => p.working[k].text === o.working[k].text),
                     versions: Object.keys(p.versions).length, docx: !!p.working['briefing.docx'].orig }; }""")
        check("opening the repo elsewhere reproduces every file", fresh["same"], fresh)
        check("Word files come back with their original bytes", fresh["docx"], fresh)

        # --- settings, profile, dashboard
        await page.evaluate('go("settings")')
        await page.wait_for_selector("#co-add")
        await page.fill("#co-u", "reviewer-friend")
        await page.click("#co-add")
        await page.wait_for_timeout(500)
        check("invite a collaborator", "reviewer-friend" in await page.inner_text("#st-co"))
        await shot("settings", True)
        await page.evaluate('go("profile")')
        await page.wait_for_timeout(400)
        await shot("profile", True)
        await page.evaluate('go("home")')
        await page.wait_for_timeout(600)
        await shot("home", True)

        await page.emulate_media(color_scheme="dark")
        await page.evaluate('go("review", {num: 1, revTab: "changes"})')
        await page.wait_for_selector(".pr-head")
        await shot("review-dark")

        # --- sign out keeps work
        await page.evaluate("ghSignOut(); render();")
        check("sign out keeps the local copy", await page.evaluate("S.projects.length >= 1 && !ghSignedIn()"))

        check("no page errors", not errors, "; ".join(errors))
        await browser.close()
    print(f"\n{'All GitHub checks passed' if not failures else str(len(failures)) + ' failed: ' + ', '.join(failures)}. Screenshots in {SHOTS}")
    sys.exit(1 if failures else 0)


asyncio.run(main())
