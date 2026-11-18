# Writer's Box — overview

Full spec: [Writer's Box — Product Spec & MVP Plan](https://claude.ai/artifact/TXbSgAiu4wPqsBacvkoUTx)

## Decisions so far
- Build order: a short spec first, then a browser prototype built to it.
- Visual style: GitHub-style UI. Icons are themed for writing:
  - pages for files, with one per type (Σ LaTeX, # Markdown, quotation marks BibTeX, a grid for spreadsheets)
  - a pencil for drafts, a bookmark for milestones, a pen nib for writing, ¶ for words
  - a clock inside a counterclockwise arrow for History
- MVP form factor: a single local-first web page. Data lives in IndexedDB; backups are `.writersbox.json` files.
- Formats in:
  - Google Docs: a rich paste that becomes Markdown, or a .docx/.md/.odt/.html download
  - Word: .docx, with the original kept
  - Excel and Google Sheets: .xlsx, .csv, .tsv, .ods or pasted cells
  - LaTeX: an Overleaf .zip or a folder
  - Markdown and text files
- Formats out:
  - the whole project as a .zip
  - documents as .docx and spreadsheets as .xlsx
  - a full backup
- A version captures the whole project, like Git. This is an open question.
- Merge: a fast-forward when main hasn't moved; otherwise the draft's text becomes the newest version on main. Three-way merge comes later.

## Vocabulary
Project (repository) · Version (commit) · Draft (branch) · Milestone (tag) · Compare (diff) · Restore (checkout)

## Roadmap
0 Browser MVP → 1 Folders and Git → 2 Google and Office fidelity → 3 Writer's toolbox (AI proofreading, review, citations) → 4 Collaboration
