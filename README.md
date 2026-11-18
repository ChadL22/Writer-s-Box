# Writer's Box

GitHub for writers: version history, drafts, reviews, notes and insights for LaTeX, Markdown, Word, Excel, Google Docs and Google Sheets. It works offline in the browser, and with GitHub as the backend when you sign in.

- **Live prototype (Claude preview, local mode only):** https://claude.ai/artifact/XfYykGFo9fWwGnRe2vCqtx
- **Product spec & MVP plan:** https://claude.ai/artifact/TXbSgAiu4wPqsBacvkoUTx (summary in `docs/overview.md`)

## Two ways it runs

| | Local mode | GitHub mode |
| --- | --- | --- |
| Where projects live | This browser (IndexedDB) | Your GitHub repositories, plus a local copy |
| Account | None | Sign in with a GitHub personal access token |
| Versions, drafts, milestones | ✓ | ✓ as commits, branches and tags |
| Compare, line history, insights | ✓ | ✓ |
| Reviews, notes, collaborators, profile | — | ✓ as pull requests, issues and collaborators |
| Live co-editing with people who don't use GitHub | ✓ via Google Docs / Word for the web | ✓ via Google Docs / Word for the web |

GitHub mode works on the hosted site (GitHub Pages). It doesn't work inside Claude's preview, which blocks connections to other sites.

## Run it

Open `index.html`. It's one self-contained page with no server and no install. It opens on a home dashboard with an example project (a policy memo with LaTeX, Word, Markdown, BibTeX and Excel files).

**Hosting:** GitHub Pages serves `index.html` from `main` / root (`.nojekyll` keeps the files as they are). Push to redeploy.

## Signing in with GitHub

Click **Sign in with GitHub** and paste a personal access token:
- **Quickest:** a [classic token with the `repo` scope](https://github.com/settings/tokens/new?scopes=repo&description=Writer%27s%20Box), with an expiration.
- **Tighter:** a [fine-grained token](https://github.com/settings/personal-access-tokens/new) for all repositories, with read and write access to Administration, Contents, Issues and Pull requests.

The token is stored only in that browser (localStorage) and sent only to `api.github.com`. Signing out removes it.

**Planned:** a one-click "Sign in with GitHub" (OAuth). That needs a tiny token-exchange service, such as a Cloudflare Worker, because GitHub's OAuth endpoints can't be called from a static page.

## Live collaboration (no GitHub account needed)

Share any file to **Google Docs / Sheets** (all file types) or **Word / Excel for the web** (`.docx`, `.xlsx`) with **Anyone with the link** (no sign-in) or **Only people I invite**. Collaborators edit there in real time. The **Live** tab shows new edits, who made them, and Google Docs comments, which can become Notes. **Bring changes back** opens their edits in the side-by-side view to save as a version. **Update live copy** sends your newer text; **Stop sharing** removes access.

One-time setup: a free Google client ID and/or Microsoft app registration, in `src/config.js` or in Settings › Connections. See **`docs/live-collaboration-setup.md`**.

## References

The **References** tab manages your bibliography. References live in a BibTeX file in the project (`references.bib` by default, or any `.bib` you already have), so they're versioned, compared, reviewed and synced like everything else, and LaTeX uses them directly.

- **View and find:** search, filter by type or by cited / not cited, sort, and open any reference to see it formatted (APA 7, Chicago author-date or MLA 9), its fields, and every place it's cited.
- **Citation check:** citations in your `.tex` (`\cite`, `\citep`, `\citet`, …) and Markdown (`[@key]`) that aren't in your library are flagged, with a one-click add.
- **Add and edit:** a form whose fields follow the reference type, with a live formatted preview. Fill it in from a DOI. Editing one reference rewrites only that entry; the rest of your `.bib` file is left exactly as it was.
- **Import:** `.bib`, `.ris` and CSL-JSON files (Zotero, Mendeley, EndNote, Paperpile), pasted text, or a list of DOIs. Duplicates are skipped by DOI or title and year.
- **Export:** BibTeX, RIS, CSL-JSON, or a formatted bibliography as Word, Markdown or copied text, for all references or only the cited ones.
- **Cite while writing:** the **Cite** button in the editor inserts `\cite{key}` in LaTeX, `[@key]` in Markdown, or an in-text citation like (Smith et al., 2020) elsewhere.

DOI lookup uses doi.org, so it works on the hosted site but not inside Claude's preview.

## Sections

Long documents can be split into sections, and each section becomes its own file with its own history, line history, reviews and live sharing.

- Open a LaTeX or Markdown file and choose **Sections**. Pick where to split (chapters, sections, subsections, or `#` / `##` headings) and a folder, and preview the files before splitting.
- The main file keeps the order. LaTeX uses `\input{...}`, so it still compiles locally and in Overleaf. Markdown uses `<!-- include: ... -->` comments, which don't show in Markdown viewers.
- The main file shows a sections panel where you can open, reorder, add or remove sections. Each section file shows "Section 2 of 5" with Previous and Next buttons.
- **Preview** shows the whole document assembled. **Download › Whole document** gives one combined file, and Markdown can also download as one Word file. **Combine** puts everything back into a single file.

## Formatting styles

The **Format** tab turns a document into a correctly formatted paper without changing your writing.

- **Built-in styles**, summarized from the Purdue OWL and linked to its pages: APA 7 (student and professional), MLA 9, Chicago 18 (notes and bibliography, and author-date), and a Bluebook legal memo.
- **Preview** shows the title page (or first-page heading), the first page of text and the reference list. **Formatted Word file** downloads a .docx with the right margins, font, spacing, header or page numbers, title page, heading styles, in-text citations or footnotes, and a reference list with hanging indents. For LaTeX, **Apply to LaTeX** writes a marked preamble block (geometry, spacing, header, heading formats) that's replaced cleanly if you switch styles.
- **Checklist:** automatic checks (title and details, heading levels, abstract length, citations missing from References, LaTeX style) plus each style's rules to tick off.
- **Your own styles:** customize any style, or import one from a link, a document (PDF, Word, Markdown, text, HTML) or pasted requirements. Without AI, Writer's Box picks out margins, font, size, spacing, indent, page numbers and the reference list title, and turns the formatting sentences into a checklist. Styles export and import as `.style.json`.
- **Copy a paper's structure:** read a model paper's headings and section lengths (and, for Word files, its page set-up) and start a new outline with length targets, optionally split into section files. None of the model's text is copied.

### AI (optional, through OpenRouter)

Connect OpenRouter in **Settings › Connections** (one-click sign-in on the hosted site, or paste a key). It's used only when you ask: reading style guides from sites that block other sites (like the Purdue OWL) or from PDFs, and describing each section's purpose when copying a structure. The key stays in your browser; text goes to OpenRouter and the model you choose. AI features don't work inside Claude's preview.

## Word and character counts

- **Live counter** under the editor: words, characters and reading time, plus a count of any selected text. Sectioned documents count every section.
- **Counts what a reader sees:** LaTeX commands, Markdown symbols, comments and front matter are left out; citations count as they print (for example "(Smith, 2020)"); an emoji is one character; Chinese, Japanese and Korean characters each count as a word.
- **Counts & limits** shows sentences, paragraphs, characters without spaces, reading and speaking time, estimated pages, and a count per section. Choose what counts: body, title and headings, abstract, quotations, lists, footnotes, citations, reference list (off by default).
- **Limits:** a minimum, a maximum or both, in words or characters, on the counted text or the abstract only, for any document or section. Presets: Common App essay (250–650 words), APA abstract (250 words), X (280 characters), Bluesky (300), Threads (500), LinkedIn (3,000).
- Limits show as progress bars in the editor and sections panel, as **Over limit** / **Under minimum** labels in the file list, as a warning when saving (saving isn't blocked), and in the Format checklist.
- Word files are counted paragraph by paragraph; their headings count as body text for now.

## How Writer's Box maps onto GitHub

| Writer's Box | GitHub |
| --- | --- |
| Project | Repository, tagged with the `writers-box` topic |
| Version | Commit. Only changed files are uploaded; files Writer's Box doesn't read (README, images) are left untouched |
| Draft | Branch (`main` is the repo's default branch) |
| Milestone | Tag |
| Review | Pull request: conversation, paragraph comments (posted as quoted comments), approve or ask for changes, merge |
| Note / to-do | Issue, with writing labels: revision, citation, reviewer feedback, typo, idea |
| Collaborators | Repository collaborators (invited from Settings) |

**Publish to GitHub** creates a private or public repository and replays your whole local history into it: every version with its original date, drafts as branches, milestones as tags. **Open a project from GitHub** reads any repository you can access; LaTeX, Markdown, text, Word and spreadsheet files are read, and the rest stay on GitHub untouched.

## Project layout

```
writers-box/
├── index.html          ← the built app (generated by build.sh; don't edit by hand)
├── build.sh            ← concatenates src/ into index.html
├── src/
│   ├── head.html       ← page shell + all CSS (GitHub-style tokens, light & dark)
│   ├── engine.js       ← zip, Word adapter, Myers diff, IndexedDB storage, local version model
│   ├── ui.js           ← icons, format adapters (HTML/ODT/Excel/CSV/ODS), core views, import/export
│   ├── github.js       ← GitHub API client, sign-in, sync, publish, open, remote save/branch/tag
│   ├── config.js       ← site settings: Google / Microsoft client IDs for live collaboration
│   ├── collab.js       ← home, profile, reviews, notes, insights, line history, settings
│   ├── live.js         ← live collaboration via Google Drive and OneDrive (share, status, bring back, comments)
│   ├── refs.js         ← references: BibTeX/RIS/CSL-JSON, DOI lookup, APA/Chicago/MLA, citation check, References tab
│   ├── llm.js          ← optional AI through OpenRouter (sign-in, chat, PDF and web reading)
│   ├── format.js       ← formatting styles, Word export, LaTeX preamble, checklist, style import, structure copy
│   ├── counts.js       ← word and character counts, what counts, limits, live counter
│   ├── sections.js     ← splitting documents into section files, sections panel, assembling
│   └── main.js         ← boot and routing
├── tests/
│   ├── test_app.py     ← local-mode browser tests (15 checks)
│   ├── test_github.py  ← GitHub-mode tests against a mock GitHub API (26 checks)
│   ├── mock_github.js  ← in-memory stand-in for the GitHub REST API
│   ├── test_refs.py    ← references tests: BibTeX engine, import/export, citing (45 checks)
│   ├── test_format.py  ← styles, Word output (python-docx + LibreOffice), LaTeX, style import, structure, OpenRouter (63 checks)
│   ├── test_reload.py  ← refreshing keeps your project and screen (8 checks)
│   ├── test_counts.py  ← counting rules, selection counts, limits and warnings (27 checks)
│   ├── test_sections.py ← sections and Back/Forward navigation (32 checks)
│   ├── test_live.py    ← live-collaboration tests against mock Google and Microsoft APIs (17 checks)
│   ├── mock_live.js    ← in-memory stand-ins for Google Drive/sign-in and Microsoft Graph/sign-in
│   └── screenshots/    ← written by the tests (git-ignored)
└── docs/
    ├── overview.md     ← decisions, vocabulary, roadmap
    └── live-collaboration-setup.md ← Google / Microsoft one-time setup
```

Edit files in `src/`, then run `./build.sh` (in VS Code's terminal, Ctrl+`) to rebuild `index.html`.

## Test it

```bash
pip install playwright openpyxl
python -m playwright install chromium
./build.sh && python3 tests/test_app.py && python3 tests/test_github.py && python3 tests/test_live.py && python3 tests/test_refs.py && python3 tests/test_sections.py && python3 tests/test_format.py && python3 tests/test_counts.py && python3 tests/test_reload.py
```

The GitHub tests run every flow against `tests/mock_github.js`, so they need no account or network:
- sign-in
- publishing with history
- commits that keep the README
- milestones as tags, drafts as branches
- opening a review, commenting, paragraph comments and merging
- notes with labels, comments and marking done
- line history
- re-opening the repository elsewhere, with Word files byte-identical
- inviting collaborators
- signing out

## Known limits (prototype)

- Word formatting, and spreadsheet formatting and charts, aren't compared. The original files are kept until you edit them in Writer's Box.
- Paragraph comments in reviews are posted as quoted conversation comments, not GitHub line comments, so they also work for Word and Excel files.
- Opening a repository reads the latest 60 versions per draft.
- In local mode, merging when `main` has also changed takes the draft's text. In GitHub mode, conflicting edits go through a review, and GitHub merges them.

## Roadmap

0 Browser MVP ✓ → GitHub backend ✓ (reviews, notes, insights, profiles) → one-click OAuth sign-in → Google Drive and Office fidelity → writer's toolbox (AI proofreading, citations) → real-time collaboration.
