# Writer's Box — overview

Full spec: [Writer's Box — Product Spec & MVP Plan](https://claude.ai/artifact/TXbSgAiu4wPqsBacvkoUTx)

## Decisions so far
- Build order: a short spec first, then a browser prototype built to it.
- Visual style: a GitHub-style UI with icons themed for writing:
  - pages for files, with one per type
  - a pencil for drafts, a bookmark for milestones, ¶ for words
  - a clock inside a counterclockwise arrow for History
- Two modes:
  - **local** (IndexedDB, no account)
  - **GitHub** (sign in with a personal access token; each project is a repository tagged `writers-box`)
- GitHub mapping: versions = commits, drafts = branches, milestones = tags, reviews = pull requests, notes = issues (with writing labels), sharing = collaborators and repository visibility.
- Publishing replays the full local history into the new repository. GitHub's placeholder "Initial commit" is dropped, and its README is kept.
- Paragraph comments in reviews are posted as quoted conversation comments, so they work for Word and Excel files too.
- Insights:
  - words over time (each saved version on the current draft)
  - a calendar of versions saved per day
  - per-file words and revisions, and contributors
- Line history: which version last changed each line, paragraph or row.
- Formats:
  - in: Google Docs (rich paste or a download), Word, Excel and Google Sheets, LaTeX/Overleaf, Markdown
  - out: .zip, .docx, .xlsx, backup
- Open questions: one-click OAuth sign-in (needs a small token-exchange service); whether a version should be per project (current) or per file.

## Vocabulary
Project (repository) · Version (commit) · Draft (branch) · Milestone (tag) · Review (pull request) · Note (issue) · Compare (diff) · Line history (blame)

## Roadmap
Browser MVP ✓ → GitHub backend ✓ → OAuth sign-in → Google Drive and Office fidelity → Writer's toolbox (AI proofreading, citations) → real-time collaboration
