
/* ============ Formatting styles ============
   A style describes how a finished paper looks: page set-up, header, title page or heading block, headings,
   citations and the reference list. Built-in styles summarise the Purdue OWL's guidance (linked from each style);
   writers can import their own from a link, a document or pasted text, and edit any of them.
   Applying a style never changes the writing itself: it produces a formatted Word file, a LaTeX preamble block,
   and a checklist. */
const OWL = "https://owl.purdue.edu/owl/research_and_citation/";
const H = (align, bold, italic, extra = {}) => ({ align, bold, italic, runIn: false, indent: false, case: "title", ...extra });
const FORMAT_STYLES = [
  { id: "apa7-student", name: "APA 7 · student paper", builtin: true,
    page: { margin: 1, font: "Times New Roman", size: 12, spacing: 2, indent: 0.5 },
    header: { left: "", right: "{page}", center: "", position: "top", fromEdge: 0.5, firstPage: true },
    titlePage: { on: true, top: 2.5, lines: [{ text: "{title}", bold: true }, { text: "" }, { text: "{author}" }, { text: "{institution}" }, { text: "{course}" }, { text: "{instructor}" }, { text: "{date}" }] },
    headingBlock: { on: false, lines: [] }, titleOnFirstPage: { on: true, bold: true },
    abstract: { on: true, title: "Abstract" },
    headings: [H("center", true, false), H("left", true, false), H("left", true, true), H("left", true, false, { indent: true, runIn: true }), H("left", true, true, { indent: true, runIn: true })],
    references: { on: true, title: "References", bold: true, align: "center", newPage: true, hanging: 0.5, spacing: 2, blankBetween: false },
    citations: { mode: "author-date", style: "apa" }, notes: { size: 10, spacing: 1 },
    dateFormat: "us",
    rules: ["Use one legible font throughout. APA lists 12 pt Times New Roman, 11 pt Georgia, 11 pt Calibri and 11 pt Arial as options.", "Student papers need no running head unless your instructor asks for one; put the page number in the top right of every page.", "Title page: bold title in the upper half, then your name, institution, course number and name, instructor and due date.", "Repeat the title, bold and centered, at the top of the first page of text.", "Abstract (if required): new page, bold centered “Abstract”, one paragraph without indent, usually 250 words or fewer.", "Headings: level 1 centered bold; level 2 flush left bold; level 3 flush left bold italic; levels 4 and 5 indented and run into the paragraph.", "References start on a new page with a bold centered heading; entries are double-spaced with a 0.5 inch hanging indent and listed alphabetically.", "Cite sources in the text with the author and year, for example (Jones, 2020)."],
    source: { label: "Purdue OWL · APA general format", url: OWL + "apa_style/apa_formatting_and_style_guide/general_format.html" } },
  { id: "apa7-professional", name: "APA 7 · professional paper", builtin: true, extends: "apa7-student",
    header: { left: "{RUNNINGHEAD}", right: "{page}", center: "", position: "top", fromEdge: 0.5, firstPage: true },
    titlePage: { on: true, top: 2.5, lines: [{ text: "{title}", bold: true }, { text: "" }, { text: "{author}" }, { text: "{institution}" }] },
    rules: ["Running head: a shortened title in capitals (50 characters at most) flush left, page number flush right, on every page.", "Title page: bold title in the upper half, author name (no titles or degrees) and affiliation; an author note goes in the bottom half if needed.", "Abstract: new page, bold centered “Abstract”, one unindented paragraph of usually 250 words or fewer, then optional indented, italic “Keywords:”.", "Headings, references and in-text citations follow the same rules as student papers."],
    source: { label: "Purdue OWL · APA general format", url: OWL + "apa_style/apa_formatting_and_style_guide/general_format.html" } },
  { id: "mla9", name: "MLA 9", builtin: true,
    page: { margin: 1, font: "Times New Roman", size: 12, spacing: 2, indent: 0.5 },
    header: { left: "", right: "{lastname} {page}", center: "", position: "top", fromEdge: 0.5, firstPage: true },
    titlePage: { on: false, top: 3, lines: [] },
    headingBlock: { on: true, lines: [{ text: "{author}" }, { text: "{instructor}" }, { text: "{course}" }, { text: "{date}" }] },
    titleOnFirstPage: { on: true, bold: false }, abstract: { on: false, title: "Abstract" },
    headings: [H("left", true, false), H("left", false, true), H("center", true, false), H("center", false, true), H("left", false, false)],
    references: { on: true, title: "Works Cited", bold: false, align: "center", newPage: true, hanging: 0.5, spacing: 2, blankBetween: false },
    citations: { mode: "mla", style: "mla" }, notes: { size: 12, spacing: 2 }, dateFormat: "dmy",
    rules: ["1 inch margins, a legible 12 pt font such as Times New Roman, double-spaced throughout, first line of each paragraph indented 0.5 inch.", "Header: your last name and the page number, flush right, 0.5 inch from the top of every page.", "No title page unless your instructor asks for one. Instead, put your name, instructor, course and date at the top left of the first page.", "Center the title in title case: no bold, italics, underlining, quotation marks or all capitals.", "Section headings are optional; if you number them, use an Arabic numeral, a period and a space before the heading. Keep levels consistent.", "Works Cited starts on a new page; entries are alphabetical with a 0.5 inch hanging indent.", "Cite sources in the text with the author and page number, for example (Smith 23)."],
    source: { label: "Purdue OWL · MLA general format", url: OWL + "mla_style/mla_formatting_and_style_guide/mla_general_format.html" } },
  { id: "chicago18-nb", name: "Chicago 18 · notes and bibliography", builtin: true,
    page: { margin: 1, font: "Times New Roman", size: 12, spacing: 2, indent: 0.5 },
    header: { left: "", right: "{page}", center: "", position: "top", fromEdge: 0.5, firstPage: false },
    titlePage: { on: true, top: 3, lines: [{ text: "{title}" }, { text: "" }, { text: "" }, { text: "" }, { text: "{author}" }, { text: "{course}" }, { text: "{date}" }] },
    headingBlock: { on: false, lines: [] }, titleOnFirstPage: { on: false, bold: false }, abstract: { on: false, title: "Abstract" },
    headings: [H("center", true, false), H("center", false, false), H("left", true, false), H("left", false, false, { case: "sentence" }), H("left", true, false, { case: "sentence", runIn: true })],
    references: { on: true, title: "Bibliography", bold: false, align: "center", newPage: true, hanging: 0.5, spacing: 1, blankBetween: true },
    citations: { mode: "notes", style: "chicago" }, notes: { size: 10, spacing: 1 }, dateFormat: "us",
    rules: ["Margins of at least 1 inch; a readable font such as Times New Roman, preferably 12 pt.", "Double-space the text, but single-space block quotations, notes, bibliography entries, table titles and figure captions.", "Title page (if required): title centered about a third of the way down, with your name, class and date several lines below. Otherwise put the title on the first page of text.", "Number pages in the header, starting with 1 on the first page of text.", "Optional heading levels: 1 centered bold; 2 centered regular; 3 flush left bold; 4 flush left regular, sentence case; 5 run in at the start of the paragraph with a period. Aim for no more than three levels.", "Footnotes are numbered consecutively; the superscript number goes after punctuation at the end of the clause.", "Bibliography: titled “Bibliography”, two blank lines after the title, entries single-spaced with a blank line between and alphabetized."],
    source: { label: "Purdue OWL · Chicago general format", url: OWL + "chicago_manual_18th_edition/cmos_formatting_and_style_guide/general_format.html" } },
  { id: "chicago18-ad", name: "Chicago 18 · author-date", builtin: true, extends: "chicago18-nb",
    references: { on: true, title: "References", bold: false, align: "center", newPage: true, hanging: 0.5, spacing: 1, blankBetween: true },
    citations: { mode: "author-date", style: "chicago" },
    rules: ["Page set-up, title page and headings follow the notes-and-bibliography rules.", "Cite sources in the text with author, year and page, for example (Smith 2020, 23).", "The reference list is titled “References”: entries single-spaced with a blank line between, alphabetized."],
    source: { label: "Purdue OWL · Chicago general format", url: OWL + "chicago_manual_18th_edition/cmos_formatting_and_style_guide/general_format.html" } },
  { id: "bluebook-memo", name: "Bluebook · legal memo", builtin: true,
    page: { margin: 1, font: "Times New Roman", size: 12, spacing: 2, indent: 0.5 },
    header: { left: "", right: "", center: "{page}", position: "bottom", fromEdge: 0.5, firstPage: true },
    titlePage: { on: false, top: 3, lines: [] },
    headingBlock: { on: true, spacing: 1, lines: [{ text: "MEMORANDUM", bold: true, align: "center" }, { text: "" }, { text: "TO: {recipient}" }, { text: "FROM: {author}" }, { text: "DATE: {date}" }, { text: "RE: {subject}" }, { text: "" }] },
    titleOnFirstPage: { on: false, bold: true }, abstract: { on: false, title: "Abstract" },
    headings: [H("left", true, false, { case: "upper" }), H("left", true, false), H("left", false, true), H("left", false, false, { indent: true }), H("left", false, true, { runIn: true })],
    references: { on: false, title: "Table of Authorities", bold: true, align: "center", newPage: true, hanging: 0.5, spacing: 1, blankBetween: true },
    citations: { mode: "bluebook", style: "bluebook" }, notes: { size: 10, spacing: 1 }, dateFormat: "us",
    rules: ["The Bluebook governs citations; layout rules for memos and briefs usually come from your course, firm or court, so check them first.", "Case names are italicized (or underlined, consistently). Cite a case as: Case Name, volume Reporter first page, pinpoint (Court year).", "Statutes: Act name, title Code § section (year). Constitutions: abbreviated name with article and section, no date unless repealed or amended.", "After the first full citation, use a short form; use Id. for the authority cited immediately before.", "Writer's Box puts citations in footnotes, law-review style. Switch the citation mode to in text if your memo cites in the body."],
    source: { label: "Purdue OWL · Bluebook citation for legal materials", url: OWL + "chicago_manual_17th_edition/cmos_formatting_and_style_guide/bluebook_citation_for_legal_materials.html" } }
];
const FIELDS = [["title", "Title"], ["author", "Your name"], ["institution", "Institution"], ["course", "Course"], ["instructor", "Instructor"], ["date", "Date"], ["runningHead", "Running head (short title)"], ["recipient", "Memo to"], ["subject", "Memo subject (RE)"]];
const CITE_MODES = { "author-date": "In text: author and year", mla: "In text: author and page (MLA)", notes: "Footnotes (Chicago notes)", bluebook: "Footnotes (Bluebook)" };

/* ---------- style library ---------- */
const STYLE_LIB = "wb.styles";
function customStyles() { try { return JSON.parse(localStorage.getItem(STYLE_LIB) || "[]"); } catch (e) { return []; } }
function saveCustomStyle(p, s) { const all = customStyles().filter(x => x.id !== s.id); all.push(s); try { localStorage.setItem(STYLE_LIB, JSON.stringify(all)); } catch (e) { /* ignore */ } if (p) { p.styles = { ...(p.styles || {}), [s.id]: s }; persist(p, true); } }
function deleteCustomStyle(p, id) { try { localStorage.setItem(STYLE_LIB, JSON.stringify(customStyles().filter(x => x.id !== id))); } catch (e) { /* ignore */ } if (p && p.styles) { delete p.styles[id]; persist(p, true); } }
function allStyles(p) { const seen = new Map(); for (const s of [...FORMAT_STYLES, ...Object.values((p && p.styles) || {}), ...customStyles()]) seen.set(s.id, s); return [...seen.values()]; }
function resolveStyle(p, id) {
  const list = allStyles(p), s = list.find(x => x.id === id) || list[0];
  const base = s.extends ? resolveStyle(p, s.extends) : null;
  if (!base) return JSON.parse(JSON.stringify(s));
  const out = JSON.parse(JSON.stringify(base)); for (const [k, v] of Object.entries(s)) out[k] = JSON.parse(JSON.stringify(v)); delete out.extends; return out;
}
function fmtState(p) { p.format = p.format || {}; const f = p.format; f.fields = f.fields || {}; f.checked = f.checked || {}; if (!f.style) f.style = "apa7-student"; if (!f.doc || !p.working[f.doc]) f.doc = defaultFormatDoc(p); return f; }
function formattable(p) { return Object.keys(p.working).filter(x => ["tex", "md", "markdown", "txt", "docx"].includes(extOf(x)) && !secParents(p, x).length).sort(); }
function defaultFormatDoc(p) { const list = formattable(p); return list.find(x => secFmt(x) && secIncludes(p, x).length) || list.find(x => extOf(x) === "tex") || list.find(x => extOf(x) === "docx") || list[0] || null; }

/* ---------- reading a document into blocks ----------
   Inline text keeps *italic* and **bold**; citations become \u0001C{json}\u0002 and footnotes \u0001F text \u0002. */
const CITE = o => "\u0001C" + JSON.stringify(o) + "\u0002", FOOT = t => "\u0001F" + t.replace(/[\u0001\u0002]/g, "") + "\u0002";
function mdInlineCites(s) {
  return s.replace(/\[([^\[\]]*@[\w:.\-]+[^\[\]]*)\]/g, (m, inner) => {
    const items = inner.split(";").map(x => { const mm = /^\s*(.*?)-?@([\w:.\-]+)\s*,?\s*(.*?)\s*$/.exec(x); return mm ? { pre: mm[1].trim(), key: mm[2], loc: mm[3].trim() } : null; }).filter(Boolean);
    return items.length ? CITE({ items }) : m;
  }).replace(/\^\[([^\]]+)\]/g, (m, t) => FOOT(t));
}
function mdBlocks(text) {
  const meta = {}, blocks = []; let lines = text.split("\n");
  if (lines[0] && lines[0].trim() === "---") { const end = lines.findIndex((l, i) => i > 0 && /^(---|\.\.\.)\s*$/.test(l)); if (end > 0) { for (const l of lines.slice(1, end)) { const m = /^(\w[\w-]*):\s*"?(.*?)"?\s*$/.exec(l); if (m) meta[m[1].toLowerCase()] = m[2]; } lines = lines.slice(end + 1); } }
  let para = [], fence = false; const flush = () => { if (para.length) { blocks.push({ t: "p", text: mdInlineCites(para.join(" ").trim()) }); para = []; } };
  for (const raw of lines) {
    const l = raw.replace(/<!--.*?-->/g, "");
    if (/^\s*(```|~~~)/.test(l)) { flush(); fence = !fence; continue; }
    if (fence) { blocks.push({ t: "code", text: raw }); continue; }
    if (!l.trim()) { flush(); continue; }
    const h = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(l); if (h) { flush(); blocks.push({ t: "h", level: h[1].length, text: mdInlineCites(h[2]) }); continue; }
    const q = /^\s*>\s?(.*)$/.exec(l); if (q) { flush(); const last = blocks.at(-1); if (last && last.t === "quote" && !last.closed) last.text += " " + mdInlineCites(q[1]); else blocks.push({ t: "quote", text: mdInlineCites(q[1]) }); continue; }
    const li = /^\s*([-*+]|\d+[.)])\s+(.*)$/.exec(l); if (li) { flush(); blocks.push({ t: "li", ordered: /\d/.test(li[1]), text: mdInlineCites(li[2]) }); continue; }
    if (blocks.length && blocks.at(-1).t === "quote") blocks.at(-1).closed = true;
    para.push(l.trim());
  }
  flush();
  // an "Abstract" heading followed by a paragraph becomes the abstract
  const ai = blocks.findIndex(b => b.t === "h" && /^abstract$/i.test(b.text.trim()));
  if (ai >= 0 && blocks[ai + 1] && blocks[ai + 1].t === "p") { blocks.splice(ai, 2, { t: "abstract", text: blocks[ai + 1].text }); }
  // a lone level-1 heading at the very top is the title
  if (!meta.title && blocks[0] && blocks[0].t === "h" && blocks[0].level === 1 && blocks.filter(b => b.t === "h" && b.level === 1).length === 1) { meta.title = blocks.shift().text; }
  shiftLevels(blocks); return { meta, blocks };
}
function shiftLevels(blocks) { const hs = blocks.filter(b => b.t === "h"); if (!hs.length) return; const min = Math.min(...hs.map(h => h.level)); hs.forEach(h => h.level = Math.min(5, h.level - min + 1)); }
function texArg(s, i) { while (s[i] === " ") i++; if (s[i] !== "{") return [null, i]; let d = 0; for (let j = i; j < s.length; j++) { if (s[j] === "{" && s[j - 1] !== "\\") d++; else if (s[j] === "}" && s[j - 1] !== "\\" && --d === 0) return [s.slice(i + 1, j), j + 1]; } return [s.slice(i + 1), s.length]; }
function texInline(s) {
  let out = "", i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === "%" && s[i - 1] !== "\\") { const n = s.indexOf("\n", i); i = n < 0 ? s.length : n; continue; }
    if (c === "~") { out += " "; i++; continue; }
    if (c === "`" && s[i + 1] === "`") { out += "“"; i += 2; continue; }
    if (c === "'" && s[i + 1] === "'") { out += "”"; i += 2; continue; }
    if (c === "-" && s.slice(i, i + 3) === "---") { out += "—"; i += 3; continue; }
    if (c === "-" && s[i + 1] === "-") { out += "–"; i += 2; continue; }
    if (c === "{" || c === "}") { i++; continue; }
    if (c !== "\\") { out += c; i++; continue; }
    const m = /^\\([A-Za-z]+\*?|.)/.exec(s.slice(i)); if (!m) { i++; continue; }
    const name = m[1]; i += m[0].length;
    if (/^[%&$#_{} ]$/.test(name)) { out += name; continue; }
    if (name === "\\") { out += " "; continue; }
    const cite = /^(?:no|auto|paren|text|foot|super)?cite(?:p|t|alp|alt|author|year|yearpar)?\*?$/.exec(name);
    if (cite) {
      const opts = []; while (s[i] === "[" || (s[i] === " " && s[i + 1] === "[")) { if (s[i] === " ") i++; const e = s.indexOf("]", i); opts.push(s.slice(i + 1, e)); i = e + 1; }
      const [keys, j] = texArg(s, i); i = j; if (keys == null) continue;
      const loc = (opts.length === 2 ? opts[1] : opts[0] || "").replace(/~/g, " "), pre = opts.length === 2 ? opts[0] : "";
      const items = keys.split(",").map(k => k.trim()).filter(Boolean).map((key, n, a) => ({ key, pre: n === 0 ? pre : "", loc: n === a.length - 1 ? loc : "" }));
      out += CITE({ items, textual: /^citet|^textcite/.test(name) }); continue;
    }
    const [arg, j] = texArg(s, i);
    if (["emph", "textit", "textsl"].includes(name) && arg != null) { out += "*" + texInline(arg) + "*"; i = j; continue; }
    if (name === "textbf" && arg != null) { out += "**" + texInline(arg) + "**"; i = j; continue; }
    if (name === "footnote" && arg != null) { out += FOOT(texInline(arg)); i = j; continue; }
    if (["label", "ref", "eqref", "pageref", "index", "vspace", "hspace", "bibliographystyle", "bibliography", "addbibresource", "printbibliography", "newpage", "clearpage", "noindent", "maketitle", "centering", "small", "large", "Large", "footnotesize", "normalsize", "par", "medskip", "bigskip", "smallskip", "tableofcontents"].includes(name)) { if (arg != null && !["noindent", "maketitle", "centering", "newpage", "clearpage", "par", "medskip", "bigskip", "smallskip", "tableofcontents", "small", "large", "Large", "footnotesize", "normalsize"].includes(name)) i = j; continue; }
    if (name === "url" || name === "href") { out += arg || ""; i = j; if (name === "href") { const [t, k] = texArg(s, i); out = out.slice(0, out.length - (arg || "").length) + (t || arg); i = k; } continue; }
    if (arg != null) { out += texInline(arg); i = j; continue; }
    out += texText("\\" + name);
  }
  return out.replace(/[ \t]+/g, " ");
}
function texBlocks(text) {
  const meta = {}; const grab = n => { const m = new RegExp("\\\\" + n + "\\s*(?:\\[[^\\]]*\\])?\\s*\\{").exec(text); if (!m) return ""; const [a] = texArg(text, m.index + m[0].length - 1); return a ? texInline(a.replace(/\\\\|\\and/g, ", ")).replace(/\s*,\s*,/g, ",").trim() : ""; };
  meta.title = grab("title"); meta.author = grab("author"); const d = grab("date"); if (d && !/\\today/.test(d)) meta.date = d;
  let body = text; const b = text.indexOf("\\begin{document}"); if (b >= 0) body = text.slice(b + 16); const e = body.indexOf("\\end{document}"); if (e >= 0) body = body.slice(0, e);
  body = body.replace(/(^|[^\\])%.*$/gm, "$1");
  const blocks = []; let para = [];
  const flush = () => { const t = texInline(para.join(" ")).trim(); if (t) blocks.push({ t: "p", text: t }); para = []; };
  const env = [];
  for (const l of body.split("\n")) {
    const be = /^\s*\\begin\{(\w+\*?)\}/.exec(l), en = /^\s*\\end\{(\w+\*?)\}/.exec(l);
    if (be) { flush(); env.push(be[1]); if (be[1] === "abstract") blocks.push({ t: "abstract", text: "" }); continue; }
    if (en) { flush(); env.pop(); continue; }
    const cur = env.at(-1);
    if (["figure", "table", "tabular", "equation", "align", "align*", "equation*", "verbatim", "lstlisting", "thebibliography", "tikzpicture"].includes(cur)) continue;
    const h = /^\s*\\(part|chapter|section|subsection|subsubsection|paragraph)\*?\s*(\[[^\]]*\])?\s*\{/.exec(l);
    if (h) { flush(); const [a, j] = texArg(l, h[0].length - 1); const rank = { part: 0, chapter: 1, section: 2, subsection: 3, subsubsection: 4, paragraph: 5 }[h[1]]; blocks.push({ t: "h", level: rank, text: texInline(a || "") }); const rest = l.slice(j).trim(); if (rest) para.push(rest); continue; }
    if (/^\s*\\item\b/.test(l) && (cur === "itemize" || cur === "enumerate" || cur === "description")) { flush(); blocks.push({ t: "li", ordered: cur === "enumerate", text: texInline(l.replace(/^\s*\\item(\[[^\]]*\])?/, "")) }); continue; }
    if (cur === "itemize" || cur === "enumerate") { const last = blocks.at(-1); if (last && last.t === "li" && l.trim()) { last.text += " " + texInline(l); continue; } }
    if (cur === "abstract") { if (l.trim()) blocks.at(-1).text = (blocks.at(-1).text + " " + texInline(l)).trim(); continue; }
    if (cur === "quote" || cur === "quotation") { if (l.trim()) { const last = blocks.at(-1); if (last && last.t === "quote" && last.env) last.text += " " + texInline(l); else blocks.push({ t: "quote", env: true, text: texInline(l) }); } continue; }
    if (!l.trim()) { flush(); continue; }
    para.push(l.trim());
  }
  flush(); shiftLevels(blocks); return { meta, blocks };
}
/* Word: read paragraph styles so headings, title and quotes survive */
async function docxRead(u8) {
  const z = unzip(u8), doc = new DOMParser().parseFromString(dec.decode(await z.read("word/document.xml")), "application/xml");
  let styles = null; try { styles = new DOMParser().parseFromString(dec.decode(await z.read("word/styles.xml")), "application/xml"); } catch (e) { /* none */ }
  const W = W_NS, A = (el, n) => el.getAttributeNS(W, n) || el.getAttribute("w:" + n);
  const styleName = {}; if (styles) for (const s of styles.getElementsByTagNameNS(W, "style")) { const n = s.getElementsByTagNameNS(W, "name")[0]; styleName[A(s, "styleId")] = n ? A(n, "val") : A(s, "styleId"); }
  const meta = {}, blocks = [];
  for (const p of doc.getElementsByTagNameNS(W, "p")) {
    if (p.parentNode && p.parentNode.localName === "tc") continue;
    let text = ""; for (const r of p.getElementsByTagNameNS(W, "r")) { const rp = r.getElementsByTagNameNS(W, "rPr")[0], it = rp && rp.getElementsByTagNameNS(W, "i")[0], bd = rp && rp.getElementsByTagNameNS(W, "b")[0]; let t = ""; for (const c of r.childNodes) { if (c.localName === "t") t += c.textContent; else if (c.localName === "tab") t += " "; else if (c.localName === "footnoteReference") t += ""; } if (!t) continue; text += it && A(it, "val") !== "0" && t.trim() ? `*${t}*` : bd && A(bd, "val") !== "0" && t.trim() ? `**${t}**` : t; }
    text = text.replace(/\*\*\s*\*\*|\*\s*\*/g, "").trim(); if (!text) continue;
    const ps = p.getElementsByTagNameNS(W, "pStyle")[0], sid = ps ? A(ps, "val") : "", sname = (styleName[sid] || sid || "").toLowerCase();
    const hm = /^heading\s*(\d)/.exec(sname) || /^heading(\d)$/.exec(sid.toLowerCase());
    if (sname === "title") { meta.title = text.replace(/\*/g, ""); continue; }
    if (sname === "subtitle") { meta.title = (meta.title ? meta.title + ": " : "") + text.replace(/\*/g, ""); continue; }
    if (hm) { blocks.push({ t: "h", level: +hm[1], text: text.replace(/^\*\*(.*)\*\*$/, "$1") }); continue; }
    if (/quote/.test(sname)) { blocks.push({ t: "quote", text }); continue; }
    if (/list/.test(sname) || p.getElementsByTagNameNS(W, "numPr").length) { blocks.push({ t: "li", ordered: false, text }); continue; }
    blocks.push({ t: "p", text: mdInlineCites(text) });
  }
  // page set-up and fonts, for "copy formatting from a Word document"
  const info = {}; const sect = doc.getElementsByTagNameNS(W, "sectPr")[0];
  if (sect) { const mar = sect.getElementsByTagNameNS(W, "pgMar")[0]; if (mar) { const t = +A(mar, "top"), l = +A(mar, "left"); if (t) info.margin = Math.round((t + l) / 2 / 1440 * 100) / 100; } }
  if (styles) {
    const dd = styles.getElementsByTagNameNS(W, "docDefaults")[0], normal = [...styles.getElementsByTagNameNS(W, "style")].find(s => A(s, "styleId") === "Normal");
    for (const scope of [dd, normal].filter(Boolean)) {
      const rf = scope.getElementsByTagNameNS(W, "rFonts")[0]; if (rf && A(rf, "ascii")) info.font = A(rf, "ascii");
      const sz = scope.getElementsByTagNameNS(W, "sz")[0]; if (sz) info.size = +A(sz, "val") / 2;
      const sp = scope.getElementsByTagNameNS(W, "spacing")[0]; if (sp && A(sp, "line") && (A(sp, "lineRule") || "auto") === "auto") info.spacing = Math.round(+A(sp, "line") / 240 * 10) / 10;
      const ind = scope.getElementsByTagNameNS(W, "ind")[0]; if (ind && A(ind, "firstLine")) info.indent = Math.round(+A(ind, "firstLine") / 1440 * 100) / 100;
    }
  }
  shiftLevels(blocks); return { meta, blocks, info };
}
async function docBlocks(p, path) {
  const f = p.working[path], ext = extOf(path);
  if (ext === "docx") { if (f.orig) { try { return await docxRead(b64.to(f.orig)); } catch (e) { /* fall back to text */ } } return { meta: {}, blocks: f.text.split("\n").filter(l => l.trim()).map(t => ({ t: "p", text: mdInlineCites(t) })) }; }
  const text = secFmt(path) ? assemble(p, path) : f.text;
  return ext === "tex" ? texBlocks(text) : mdBlocks(text);
}

/* ---------- citations ---------- */
function citeEngine(p, spec) {
  const lib = new Map(); for (const b of bibFiles(p)) for (const r of refLibrary(p, b)) if (!lib.has(r.key)) lib.set(r.key, r);
  const used = [], seen = new Set(), noted = new Map(); let lastNoteKey = null, noteNo = 0;
  const mode = spec.citations.mode, st = spec.citations.style;
  const use = k => { if (!seen.has(k)) { seen.add(k); used.push(k); } };
  const loc = (l, style) => !l ? "" : style === "apa" ? (/^(p|pp|para|chap|sec)\.?\s/i.test(l) ? l : (/[-–]/.test(l) ? "pp. " : "p. ") + l) : l.replace(/^pp?\.\s*/i, "");
  const legal = r => r.type === "jurisdiction" || r.type === "legislation";
  const who = r => { if (legal(r)) return `*${r.title}*`; const a = r.authors.map(familyOf); return !a.length ? `“${shortTitle(r.title)}”` : a.length === 1 ? a[0] : a.length === 2 ? `${a[0]} ${st === "apa" ? "&" : "and"} ${a[1]}` : `${a[0]} et al.`; };
  return {
    lib, used, missing: new Set(),
    inText(c) {
      const parts = c.items.map(it => { const r = lib.get(it.key); use(it.key); if (!r) { this.missing.add(it.key); return `${it.key}?`; }
        const l = loc(it.loc, legal(r) ? "x" : st), pre = it.pre ? it.pre + " " : "";
        if (st === "mla") return pre + who(r) + (l ? " " + l : "");
        if (st === "apa") return pre + who(r) + ", " + (r.year || "n.d.") + (l ? ", " + l : "");
        return pre + who(r) + " " + (r.year || "n.d.") + (l ? ", " + l : ""); });
      if (c.textual && c.items.length === 1 && lib.get(c.items[0].key)) { const r = lib.get(c.items[0].key); const l = loc(c.items[0].loc, st); return st === "mla" ? `${who(r)}${l ? ` (${l})` : ""}` : `${who(r)} (${r.year || "n.d."}${l ? ", " + l : ""})`; }
      return "(" + parts.join("; ") + ")";
    },
    note(c) {
      noteNo++;
      const out = c.items.map(it => { const r = lib.get(it.key); use(it.key); if (!r) { this.missing.add(it.key); return `[${it.key}?]`; }
        const pin = it.loc ? loc(it.loc, "x") : "";
        if (c.items.length === 1 && lastNoteKey === it.key) return mode === "bluebook" ? `*Id.*${pin ? " at " + pin : ""}` : `Ibid.${pin ? ", " + pin : ""}`;
        if (noted.has(it.key)) {
          if (mode === "bluebook") return r.type === "jurisdiction" ? `*${shortTitle(r.title)}*, ${texText(r.fields.volume || "")} ${texText(r.fields.journal || "")} at ${pin || texText((r.fields.pages || "").split(/[-–]/)[0])}` : `${r.authors[0] ? familyOf(r.authors[0]) : `*${shortTitle(r.title)}*`}, *supra* note ${noted.get(it.key)}${pin ? ", at " + pin : ""}`;
          return `${r.authors[0] ? familyOf(r.authors[0]) + ", " : ""}${r.type === "article" || r.type === "incollection" ? `“${shortTitle(r.title)}”` : `*${shortTitle(r.title)}*`}${pin ? ", " + pin : ""}`;
        }
        noted.set(it.key, noteNo); const pre = it.pre ? it.pre + " " : "";
        return pre + (mode === "bluebook" ? bluebookRef(r, pin).replace(/\.$/, "") : chicagoNote(r, pin).replace(/\.$/, ""));
      });
      lastNoteKey = c.items.length === 1 ? c.items[0].key : null;
      return out.join("; ") + ".";
    }
  };
}
const isNotes = spec => spec.citations.mode === "notes" || spec.citations.mode === "bluebook";

/* ---------- tokens, dates, cases ---------- */
function fmtDate(style) { const d = new Date(), m = d.toLocaleString("en-US", { month: "long" }); return style === "dmy" ? `${d.getDate()} ${m} ${d.getFullYear()}` : `${m} ${d.getDate()}, ${d.getFullYear()}`; }
function fieldValues(p, spec, meta) {
  const f = fmtState(p).fields, v = {}; for (const [k] of FIELDS) v[k] = (f[k] || "").trim() || (meta[k] || "").trim();
  if (!v.author && GH.user) v.author = GH.user.name || GH.user.login || "";
  if (!v.date) v.date = fmtDate(spec.dateFormat);
  if (!v.runningHead && v.title) v.runningHead = v.title.replace(/:.*/, "").slice(0, 50);
  v.lastname = (v.author || "").trim().split(/\s+/).pop() || ""; v.RUNNINGHEAD = (v.runningHead || "").toUpperCase();
  return v;
}
const fillTokens = (s, v) => s.replace(/\{(\w+)\}/g, (m, k) => k === "page" ? "{page}" : v[k] != null ? v[k] : k === "RUNNINGHEAD" ? "" : m);
const SMALL = new Set("a an and as at but by for in nor of on or per the to vs via".split(" "));
function applyCase(t, c) { if (c === "upper") return t.toUpperCase(); if (c === "sentence") return t.replace(/^(\W*)(\w)/, (m, a, b) => a + b.toUpperCase()); if (c === "title") return t.split(/(\s+)/).map((w, i, a) => /\s/.test(w) || /[A-Z].*[A-Z]/.test(w) ? w : (i && i < a.length - 1 && SMALL.has(w.toLowerCase())) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)).join(""); return t; }

/* ---------- shared layout: turns blocks into a list of laid-out paragraphs ----------
   Each paragraph: { segs: [{ text, b, i, note }], align, indent, left, hanging, spacing, after, before, pageBreak, bold, size } */
function layoutPaper(p, spec, doc) {
  const v = fieldValues(p, spec, doc.meta), ce = citeEngine(p, spec), notes = [], out = [];
  const segs = (s, base = {}) => {
    const res = []; let rest = s;
    const re = /\u0001C(.*?)\u0002|\u0001F(.*?)\u0002/g; let last = 0, m; const pieces = [];
    while ((m = re.exec(s))) { pieces.push(s.slice(last, m.index)); pieces.push(m[1] != null ? { cite: JSON.parse(m[1]) } : { foot: m[2] }); last = re.lastIndex; }
    pieces.push(s.slice(last));
    for (const pc of pieces) {
      if (typeof pc === "string") { for (const part of pc.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/)) { if (!part) continue; if (/^\*\*[^*]+\*\*$/.test(part)) res.push({ ...base, text: part.slice(2, -2), b: true }); else if (/^\*[^*]+\*$/.test(part)) res.push({ ...base, text: part.slice(1, -1), i: true }); else res.push({ ...base, text: part }); } continue; }
      if (pc.cite) { if (isNotes(spec)) { const n = ce.note(pc.cite); notes.push(n); res.push({ note: notes.length }); } else res.push(...segs(ce.inText(pc.cite), base)); continue; }
      if (pc.foot) { notes.push(pc.foot); res.push({ note: notes.length }); }
    }
    void rest;
    for (let k = 0; k < res.length; k++) {
      if (!res[k].note) continue;
      const prev = res[k - 1]; if (prev && prev.text) prev.text = prev.text.replace(/\s+$/, "");
      const next = res[k + 1], m = next && next.text && /^[.,;:!?]+/.exec(next.text);
      if (m && prev && prev.text != null) { prev.text += m[0]; next.text = next.text.slice(m[0].length); }
    }
    return res.filter(x => x.note || x.text);
  };
  const sp = spec.page.spacing, ind = spec.page.indent;
  const line = (text, o = {}) => out.push({ segs: segs(text, o.bold ? { b: true } : {}), align: o.align || "left", indent: 0, spacing: o.spacing || sp, ...o });
  // title page or heading block
  if (spec.titlePage.on) {
    spec.titlePage.lines.forEach((l, i) => line(applyCase(fillTokens(l.text, v), l.case), { align: l.align || "center", bold: !!l.bold, before: i === 0 ? spec.titlePage.top : 0, kind: "title" }));
    out.at(-1).pageBreakAfter = true;
  }
  if (spec.headingBlock.on) spec.headingBlock.lines.forEach(l => line(fillTokens(l.text, v), { align: l.align || "left", bold: !!l.bold, spacing: spec.headingBlock.spacing || sp }));
  const abs = doc.blocks.find(b => b.t === "abstract");
  if (abs && spec.abstract.on) { line(spec.abstract.title, { align: "center", bold: true, kind: "abstract" }); line(abs.text, { kind: "abstract" }); out.at(-1).pageBreakAfter = true; }
  if (spec.titleOnFirstPage.on && v.title) line(applyCase(v.title, "title"), { align: "center", bold: !!spec.titleOnFirstPage.bold });
  const blocks = doc.blocks.filter(b => b.t !== "abstract");
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.t === "h") {
      const hs = spec.headings[Math.min(4, b.level - 1)] || spec.headings[0], text = applyCase(b.text, hs.case);
      if (hs.runIn && blocks[i + 1] && blocks[i + 1].t === "p") { const hseg = segs(text.replace(/[.:]?$/, "."), { b: hs.bold, i: hs.italic }); out.push({ segs: [...hseg, { text: " " }, ...segs(blocks[i + 1].text)], align: "left", indent: hs.indent ? ind : ind, spacing: sp }); i++; continue; }
      out.push({ segs: segs(text, { b: hs.bold, i: hs.italic }), align: hs.align, indent: hs.indent ? ind : 0, spacing: sp, keepNext: true, heading: b.level }); continue;
    }
    if (b.t === "p") { out.push({ segs: segs(b.text), align: spec.page.align || "left", indent: ind, spacing: sp }); continue; }
    if (b.t === "quote") { out.push({ segs: segs(b.text), align: "left", indent: 0, left: 0.5, spacing: spec.citations.style === "chicago" ? 1 : sp, after: spec.citations.style === "chicago" ? 12 : 0 }); continue; }
    if (b.t === "li") { const n = b.ordered ? (out.filter(x => x.liN).length + 1) : 0; out.push({ segs: [{ text: b.ordered ? `${n}. ` : "• " }, ...segs(b.text)], align: "left", indent: 0, left: 0.5, hanging: 0.25, spacing: sp, liN: b.ordered }); continue; }
    if (b.t === "code") { out.push({ segs: [{ text: b.text, mono: true }], align: "left", indent: 0, spacing: 1 }); }
  }
  // references
  let refs = [];
  if (spec.references.on) {
    const keys = ce.used.length ? ce.used : [...ce.lib.keys()];
    refs = sortRefs(keys.map(k => ce.lib.get(k)).filter(Boolean));
    if (refs.length) {
      out.push({ segs: [{ text: spec.references.title, b: !!spec.references.bold }], align: spec.references.align, indent: 0, spacing: sp, pageBreak: spec.references.newPage, after: spec.references.blankBetween ? 24 : 0, refTitle: true });
      for (const r of refs) out.push({ segs: segs(formatRef(r, spec.citations.style).replace(/\u0001|\u0002/g, "")), align: "left", indent: 0, left: spec.references.hanging, hanging: spec.references.hanging, spacing: spec.references.spacing, after: spec.references.blankBetween ? 12 : 0, ref: true });
    }
  }
  return { paras: out, notes, values: v, missing: [...ce.missing], refs, used: ce.used };
}

/* ---------- Word output ---------- */
function paperDocx(spec, lay) {
  const x = s => String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const tw = inch => Math.round(inch * 1440), half = spec.page.size * 2, font = x(spec.page.font);
  const run = sg => sg.note ? `<w:r><w:rPr><w:vertAlign w:val="superscript"/></w:rPr><w:footnoteReference w:id="${sg.note}"/></w:r>` : sg.text ? `<w:r>${sg.b || sg.i || sg.mono ? `<w:rPr>${sg.mono ? '<w:rFonts w:ascii="Courier New" w:hAnsi="Courier New"/>' : ""}${sg.b ? "<w:b/>" : ""}${sg.i ? "<w:i/>" : ""}</w:rPr>` : ""}<w:t xml:space="preserve">${x(sg.text)}</w:t></w:r>` : "";
  const para = (pr, i, all) => {
    const ppr = [];
    if (pr.keepNext) ppr.push("<w:keepNext/>");
    if (pr.pageBreak) ppr.push("<w:pageBreakBefore/>");
    ppr.push(`<w:spacing w:before="${pr.before ? tw(pr.before) : 0}" w:after="${pr.after ? pr.after * 20 : 0}" w:line="${Math.round(240 * pr.spacing)}" w:lineRule="auto"/>`);
    if (pr.left || pr.indent || pr.hanging) ppr.push(`<w:ind w:left="${tw(pr.left || 0)}"${pr.hanging ? ` w:hanging="${tw(pr.hanging)}"` : pr.indent ? ` w:firstLine="${tw(pr.indent)}"` : ""}/>`);
    else ppr.push('<w:ind w:firstLine="0"/>');
    ppr.push(`<w:jc w:val="${pr.align === "center" ? "center" : pr.align === "right" ? "right" : pr.align === "justify" ? "both" : "left"}"/>`);
    const brk = pr.pageBreakAfter && i < all.length - 1 ? '<w:r><w:br w:type="page"/></w:r>' : "";
    return `<w:p><w:pPr>${ppr.join("")}</w:pPr>${pr.segs.map(run).join("")}${brk}</w:p>`;
  };
  const body = lay.paras.map(para).join("");
  const field = '<w:fldSimple w:instr="PAGE"><w:r><w:t>1</w:t></w:r></w:fldSimple>';
  const hText = s => fillTokens(s || "", lay.values).split("{page}").map((t, i) => (i ? field : "") + (t ? `<w:r><w:t xml:space="preserve">${x(t)}</w:t></w:r>` : "")).join("");
  const h = spec.header, hasH = h.left || h.right || h.center;
  const width = tw(8.5 - 2 * spec.page.margin);
  const hdrXml = hasH ? `<w:p><w:pPr><w:tabs><w:tab w:val="center" w:pos="${Math.round(width / 2)}"/><w:tab w:val="right" w:pos="${width}"/></w:tabs><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr>${hText(h.left)}${h.center || h.right ? "<w:r><w:tab/></w:r>" : ""}${hText(h.center)}${h.right ? "<w:r><w:tab/></w:r>" + hText(h.right) : ""}</w:p>` : "<w:p/>";
  const part = (tag, inner) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:${tag} xmlns:w="${W_NS}">${inner}</w:${tag}>`;
  const top = h.position !== "bottom", titlePg = !h.firstPage;
  const hdrRef = hasH ? `<w:${top ? "header" : "footer"}Reference w:type="default" r:id="rIdH1"/>${titlePg ? `<w:${top ? "header" : "footer"}Reference w:type="first" r:id="rIdH2"/>` : ""}` : "";
  const sect = `<w:sectPr>${hdrRef}<w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="${tw(spec.page.margin)}" w:right="${tw(spec.page.margin)}" w:bottom="${tw(spec.page.margin)}" w:left="${tw(spec.page.margin)}" w:header="${tw(h.fromEdge || 0.5)}" w:footer="${tw(h.fromEdge || 0.5)}" w:gutter="0"/>${titlePg ? '<w:pgNumType w:start="0"/><w:titlePg/>' : ""}</w:sectPr>`;
  const R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="${W_NS}" xmlns:r="${R}"><w:body>${body}${sect}</w:body></w:document>`;
  const noteSz = spec.notes.size * 2;
  const footXml = part("footnotes", `<w:footnote w:type="separator" w:id="-1"><w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:separator/></w:r></w:p></w:footnote><w:footnote w:type="continuationSeparator" w:id="0"><w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:continuationSeparator/></w:r></w:p></w:footnote>` +
    lay.notes.map((n, i) => `<w:footnote w:id="${i + 1}"><w:p><w:pPr><w:spacing w:after="${spec.notes.spacing === 1 ? 120 : 0}" w:line="${240 * spec.notes.spacing}" w:lineRule="auto"/><w:ind w:firstLine="${tw(0.5)}"/></w:pPr><w:r><w:rPr><w:vertAlign w:val="superscript"/><w:sz w:val="${noteSz}"/></w:rPr><w:footnoteRef/></w:r>${[{ text: " " }, ...segsOf(n)].map(sg => `<w:r><w:rPr>${sg.b ? "<w:b/>" : ""}${sg.i ? "<w:i/>" : ""}<w:sz w:val="${noteSz}"/></w:rPr><w:t xml:space="preserve">${x(sg.text)}</w:t></w:r>`).join("")}</w:p></w:footnote>`).join(""));
  const stylesXml = part("styles", `<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:eastAsia="${font}" w:cs="${font}"/><w:sz w:val="${half}"/><w:szCs w:val="${half}"/><w:lang w:val="en-US"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="${Math.round(240 * spec.page.spacing)}" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>`);
  const files = [
    { name: "[Content_Types].xml", data: enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>${lay.notes.length ? '<Override PartName="/word/footnotes.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml"/>' : ""}${hasH ? `<Override PartName="/word/hf1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.${top ? "header" : "footer"}+xml"/>${titlePg ? `<Override PartName="/word/hf2.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.${top ? "header" : "footer"}+xml"/>` : ""}` : ""}</Types>`) },
    { name: "_rels/.rels", data: enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${R}/officeDocument" Target="word/document.xml"/></Relationships>`) },
    { name: "word/_rels/document.xml.rels", data: enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdS" Type="${R}/styles" Target="styles.xml"/><Relationship Id="rIdT" Type="${R}/settings" Target="settings.xml"/>${lay.notes.length ? `<Relationship Id="rIdF" Type="${R}/footnotes" Target="footnotes.xml"/>` : ""}${hasH ? `<Relationship Id="rIdH1" Type="${R}/${top ? "header" : "footer"}" Target="hf1.xml"/>${titlePg ? `<Relationship Id="rIdH2" Type="${R}/${top ? "header" : "footer"}" Target="hf2.xml"/>` : ""}` : ""}</Relationships>`) },
    { name: "word/document.xml", data: enc.encode(docXml) },
    { name: "word/styles.xml", data: enc.encode(stylesXml) },
    { name: "word/settings.xml", data: enc.encode(part("settings", lay.notes.length ? '<w:footnotePr><w:footnote w:id="-1"/><w:footnote w:id="0"/></w:footnotePr>' : "")) }
  ];
  if (lay.notes.length) files.push({ name: "word/footnotes.xml", data: enc.encode(footXml) });
  if (hasH) { files.push({ name: "word/hf1.xml", data: enc.encode(part(top ? "hdr" : "ftr", hdrXml)) }); if (titlePg) files.push({ name: "word/hf2.xml", data: enc.encode(part(top ? "hdr" : "ftr", "<w:p/>")) }); }
  return zipStore(files);
}
function segsOf(s) { const out = []; for (const part of s.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/)) { if (!part) continue; if (/^\*\*[^*]+\*\*$/.test(part)) out.push({ text: part.slice(2, -2), b: true }); else if (/^\*[^*]+\*$/.test(part)) out.push({ text: part.slice(1, -1), i: true }); else out.push({ text: part }); } return out; }

/* ---------- on-screen preview: title page, first page, notes, reference list ---------- */
function paperPreview(spec, lay) {
  const PX = 64, pt = PX / 72, sz = spec.page.size * pt, m = spec.page.margin * PX;
  const segHtml = sg => sg.note ? `<sup>${sg.note}</sup>` : `${sg.b ? "<b>" : ""}${sg.i ? "<i>" : ""}${esc(sg.text)}${sg.i ? "</i>" : ""}${sg.b ? "</b>" : ""}`;
  const pHtml = pr => `<p style="text-align:${pr.align === "justify" ? "justify" : pr.align};line-height:${pr.spacing * 1.15};margin:${pr.before ? pr.before * PX : 0}px 0 ${pr.after ? pr.after * pt : 0}px ${(pr.left || 0) * PX}px;text-indent:${pr.hanging ? -pr.hanging * PX : (pr.indent || 0) * PX}px">${pr.segs.map(segHtml).join("") || "&nbsp;"}</p>`;
  const v = lay.values, h = spec.header;
  const hdr = (n, first) => (!h.firstPage && first) ? "" : `<div class="pp-hdr" style="${h.position === "bottom" ? "bottom" : "top"}:${(h.fromEdge || 0.5) * PX - sz}px;left:${m}px;right:${m}px">${["left", "center", "right"].map(k => `<span>${esc(fillTokens(h[k] || "", v)).replace("{page}", n)}</span>`).join("")}</div>`;
  const pages = []; let cur = [], startNo = spec.titlePage.on && !h.firstPage ? 0 : 1;
  for (const pr of lay.paras) { if (pr.pageBreak && cur.length) { pages.push(cur); cur = []; } cur.push(pr); if (pr.pageBreakAfter) { pages.push(cur); cur = []; } }
  if (cur.length) pages.push(cur);
  const refStart = pages.findIndex(pg => pg.some(x => x.refTitle));
  const firstBody = pages.findIndex(pg => pg.some(x => !x.kind && !x.refTitle && !x.ref));
  const show = [...new Set([0, firstBody, refStart].filter(i => i >= 0 && i < pages.length))].slice(0, 3);
  const notesHtml = idx => idx === show.find(i => i !== refStart && pages[i].some(x => x.segs.some(s => s.note))) && lay.notes.length ? `<div class="pp-notes" style="left:${m}px;right:${m}px;bottom:${m}px;font-size:${spec.notes.size * pt}px">${lay.notes.slice(0, 4).map((n, i) => `<p><sup>${i + 1}</sup> ${segsOf(n).map(segHtml).join("")}</p>`).join("")}</div>` : "";
  return show.map(i => `<div class="pp-page" style="width:${8.5 * PX}px;height:${11 * PX}px;font-family:'${esc(spec.page.font)}',serif;font-size:${sz}px">
      ${hdr(i + startNo, i === 0)}<div class="pp-body" style="position:absolute;top:${m}px;left:${m}px;right:${m}px;bottom:${m}px">${pages[i].map(pHtml).join("")}</div>${notesHtml(i)}
      <div class="pp-label">${i === 0 && spec.titlePage.on ? "Title page" : i === refStart ? spec.references.title : `Page ${i + startNo}`}${i + 1 < pages.length && !show.includes(i + 1) && i !== refStart ? " · …" : ""}</div></div>`).join("");
}

/* ---------- LaTeX preamble block ---------- */
const FMT_BEGIN = "% >>> Writer's Box format", FMT_END = "% <<< Writer's Box format";
function latexBlock(spec) {
  const font = /times/i.test(spec.page.font) ? "\\usepackage{newtxtext}  % Times-like text font" : /arial|helvetica/i.test(spec.page.font) ? "\\usepackage{helvet}\\renewcommand{\\familydefault}{\\sfdefault}" : /georgia|palatino/i.test(spec.page.font) ? "\\usepackage{mathpazo}" : `% Font: ${spec.page.font} (use fontspec with XeLaTeX or LuaLaTeX: \\setmainfont{${spec.page.font}})`;
  const sp = spec.page.spacing >= 2 ? "\\doublespacing" : spec.page.spacing >= 1.5 ? "\\onehalfspacing" : "\\singlespacing";
  const h = spec.header, t = s => (s || "").replace(/\{page\}/g, "\\thepage").replace(/\{lastname\}/g, "\\WBlastname{}").replace(/\{RUNNINGHEAD\}/g, "\\MakeUppercase{\\WBrunninghead}").replace(/\{runningHead\}/g, "\\WBrunninghead{}");
  const pos = h.position === "bottom" ? "foot" : "head";
  const cmd = ["section", "subsection", "subsubsection", "paragraph", "subparagraph"];
  const hd = spec.headings.map((s, i) => `\\titleformat{\\${cmd[i]}}${s.runIn ? "[runin]" : ""}{\\normalfont${s.bold ? "\\bfseries" : ""}${s.italic ? "\\itshape" : ""}${s.align === "center" && !s.runIn ? "\\centering" : ""}}{}{0pt}{${s.indent && s.runIn ? "\\hspace*{" + spec.page.indent + "in}" : ""}}${s.runIn ? "[.]" : ""}\n\\titlespacing*{\\${cmd[i]}}{0pt}{0pt}{${s.runIn ? "1ex" : "0pt"}}`).join("\n");
  const bib = { "author-date": spec.citations.style === "apa" ? "\\usepackage[style=apa]{biblatex}  % then \\addbibresource{references.bib} and \\printbibliography" : "\\usepackage[authordate]{biblatex-chicago}", mla: "\\usepackage[style=mla]{biblatex}  % needs biblatex-mla", notes: "\\usepackage[notes]{biblatex-chicago}", bluebook: "% Bluebook: cite in footnotes, e.g. \\footnote{...}; see the jurabib or biblatex-juradiss packages, or format by hand" }[spec.citations.mode];
  return [`${FMT_BEGIN}: ${spec.name}. Managed in the Format tab; edits inside this block are replaced when you apply a style again.`,
    `\\usepackage[letterpaper,margin=${spec.page.margin}in]{geometry}`, font, `\\usepackage{setspace}${sp}`, `\\setlength{\\parindent}{${spec.page.indent}in}`,
    `\\usepackage{fancyhdr}\\pagestyle{fancy}\\fancyhf{}\\renewcommand{\\headrulewidth}{0pt}`,
    ...(h.left ? [`\\fancy${pos}[L]{${t(h.left)}}`] : []), ...(h.center ? [`\\fancy${pos}[C]{${t(h.center)}}`] : []), ...(h.right ? [`\\fancy${pos}[R]{${t(h.right)}}`] : []),
    ...(h.firstPage ? ["\\fancypagestyle{plain}{}  % same header on the first page"] : []),
    `\\providecommand{\\WBlastname}{}\\providecommand{\\WBrunninghead}{}  % \\renewcommand these, e.g. \\renewcommand{\\WBlastname}{Langa}`,
    "\\usepackage{titlesec}", hd,
    ...(spec.references.on ? [`% Reference list title: ${spec.references.title}${spec.references.newPage ? " (new page)" : ""}, hanging indent ${spec.references.hanging}in`] : []),
    `% Citations: ${bib}`, FMT_END].join("\n");
}
function applyLatex(p, path, spec) {
  const f = p.working[path]; let t = f.text;
  const a = t.indexOf(FMT_BEGIN), b = t.indexOf(FMT_END);
  const block = latexBlock(spec);
  if (a >= 0 && b > a) t = t.slice(0, a) + block + t.slice(b + FMT_END.length);
  else { const i = t.indexOf("\\begin{document}"); if (i < 0) throw new Error("This file has no \\begin{document}, so there's no preamble to format. Apply the style to the main file."); t = t.slice(0, i) + block + "\n\n" + t.slice(i); }
  t = t.replace(/\\documentclass\[([^\]]*)\]\{/, (m, o) => `\\documentclass[${o.split(",").map(s => s.trim()).filter(s => !/^\d+pt$/.test(s)).concat(spec.page.size + "pt").join(",")}]{`)
       .replace(/\\documentclass\{/, `\\documentclass[${spec.page.size}pt]{`);
  f.text = t; return [10, 11, 12].includes(spec.page.size);
}

/* ---------- checks ---------- */
async function formatChecks(p, path, spec) {
  const doc = await docBlocks(p, path), lay = layoutPaper(p, spec, doc), out = [], v = lay.values;
  const add = (ok, text, fix) => out.push({ ok, text, fix });
  add(!!v.title, v.title ? `Title: “${v.title}”` : "No title yet. Add it in the details or in the document.", "fields");
  add(!!v.author, v.author ? `Author: ${v.author}` : "No author name yet.", "fields");
  const needs = new Set(); for (const l of [...(spec.titlePage.on ? spec.titlePage.lines : []), ...(spec.headingBlock.on ? spec.headingBlock.lines : [])]) for (const m of l.text.matchAll(/\{(\w+)\}/g)) needs.add(m[1]);
  const missingF = [...needs].filter(k => !["title", "author", "date", "page", "lastname", "RUNNINGHEAD"].includes(k) && !v[k]);
  if (missingF.length) add(false, `${spec.titlePage.on ? "Title page" : "First-page heading"} still needs: ${missingF.map(k => (FIELDS.find(f => f[0] === k) || [k, k])[1].toLowerCase()).join(", ")}.`, "fields");
  else if (needs.size) add(true, `${spec.titlePage.on ? "Title page" : "First-page heading"} details are filled in.`);
  const hs = doc.blocks.filter(b => b.t === "h"); let skip = null; hs.forEach((h, i) => { if (i && h.level > hs[i - 1].level + 1 && !skip) skip = h; });
  add(!skip, skip ? `Heading levels skip a level at “${skip.text.replace(/\*/g, "")}”.` : hs.length ? `${hs.length} heading${hs.length > 1 ? "s" : ""}, levels in order.` : "No section headings (fine for short papers).");
  const deep = Math.max(0, ...hs.map(h => h.level)); if (/chicago/.test(spec.id || "") && deep > 3) add(false, `Uses ${deep} heading levels; Chicago suggests no more than three.`);
  const absB = doc.blocks.find(b => b.t === "abstract"); if (absB && spec.abstract.on) { const n = wordCount(absB.text); add(n <= 250 || !/apa/.test(spec.id || ""), `Abstract: ${n} words${/apa/.test(spec.id || "") ? " (APA: usually 250 or fewer)" : ""}.`); }
  if (lay.missing.length) add(false, `${lay.missing.length} citation${lay.missing.length > 1 ? "s aren't" : " isn't"} in your references: ${lay.missing.slice(0, 5).join(", ")}.`, "refs");
  const libN = [...citeEngine(p, spec).lib.keys()].length;
  if (spec.references.on) { if (!libN) add(false, "No references yet, so there's no reference list.", "refs"); else if (!lay.used.length) add(false, `No citations found in the text, so all ${libN} references will be listed. Cite them with ${extOf(path) === "tex" ? "\\cite{key}" : "[@key]"}.`, "refs"); else add(true, `${lay.used.length} source${lay.used.length > 1 ? "s" : ""} cited; ${spec.references.title} lists ${lay.refs.length}.`); }
  else if (isNotes(spec)) add(true, `${lay.notes.length} footnote${lay.notes.length === 1 ? "" : "s"}.`);
  if (extOf(path) === "tex") { const t = p.working[path].text, a = t.indexOf(FMT_BEGIN); add(a >= 0 && t.slice(a, a + 200).includes(spec.name), a < 0 ? "The LaTeX preamble doesn't use this style yet." : t.slice(a, a + 200).includes(spec.name) ? "LaTeX preamble uses this style." : "The LaTeX preamble uses a different style.", "latex"); }
  for (const target of [path, ...(secFmt(path) ? secIncludes(p, path).filter(s => s.exists).map(s => s.path) : [])]) for (const L of limitsOf(p, target)) { const r = checkLimit(p, target, L); if (r) add(r.state === "ok" || r.state === "near", `${target === path ? "" : target + ": "}${r.value.toLocaleString()} ${unitShort(L.unit)} (${L.label ? L.label + ", " : ""}${limitText(L)})${r.state === "over" || r.state === "under" ? " · " + limitStatusText(L, r) : ""}.`, r.state === "ok" || r.state === "near" ? null : "limit"); }
  if ((S.refStyle || "apa") !== spec.citations.style) add(false, `The References tab formats as ${STYLES[S.refStyle || "apa"]}; this style uses ${STYLES[spec.citations.style]}.`, "refstyle");
  return { checks: out, lay };
}

/* ---------- reading a style guide (no AI) ---------- */
function styleFromText(text, base) {
  const s = JSON.parse(JSON.stringify(base)), t = text.replace(/\s+/g, " ");
  const num = re => { const m = re.exec(t); return m ? parseFloat(m[1].replace("½", ".5").replace("one", "1")) : null; };
  const mg = num(/(\d(?:\.\d+)?|one)[- ]?(?:inch|in\.?|")\s*margins?/i) ?? num(/margins?[^.]{0,40}?(\d(?:\.\d+)?)[- ]?(?:inch|in\b|")/i); if (mg) s.page.margin = mg;
  const fm = /(Times New Roman|Arial|Calibri|Georgia|Garamond|Cambria|Helvetica|Courier(?: New)?|Book Antiqua|Palatino(?: Linotype)?|Century Schoolbook)/i.exec(t); if (fm) s.page.font = fm[1].replace(/\b\w/g, c => c.toUpperCase()).replace("New Roman", "New Roman");
  const sz = num(/(\d{2})[- ]?(?:pt|point)/i); if (sz && sz >= 9 && sz <= 14) s.page.size = sz;
  if (/double[- ]spac/i.test(t)) s.page.spacing = 2; else if (/(1\.5|one and a half)[- ]?(?:line )?spac/i.test(t)) s.page.spacing = 1.5; else if (/single[- ]spac/i.test(t) && !/double/i.test(t)) s.page.spacing = 1;
  const ind = num(/indent[^.]{0,40}?(\d?\.\d+|½|one)[- ]?(?:inch|in\b|")/i) ?? num(/(\d?\.\d+|½)[- ]?(?:inch|in\b|")\s*indent/i); if (ind) s.page.indent = ind;
  if (/works cited/i.test(t)) { s.references.title = "Works Cited"; s.citations = { mode: "mla", style: "mla" }; }
  else if (/bibliography/i.test(t) && /footnote/i.test(t)) { s.references.title = "Bibliography"; s.citations = { mode: "notes", style: "chicago" }; }
  else if (/\breferences\b/i.test(t) && /author[- ]date|\(\w+,? \d{4}\)/i.test(t)) s.references.title = "References";
  if (/no title page|without a title page|title page (?:is )?not (?:required|needed)/i.test(t)) s.titlePage.on = false; else if (/title page/i.test(t)) s.titlePage.on = true;
  if (/(?:page numbers?|number(?:ing)? (?:the |all |each )?pages?)[^.]{0,60}(bottom|footer)/i.test(t)) { s.header.position = "bottom"; s.header.center = "{page}"; s.header.right = ""; }
  const sentences = text.replace(/\r/g, "").split(/(?<=[.!?])\s+(?=[A-Z])|\n+/).map(x => x.trim()).filter(x => x.length > 12 && x.length < 260);
  s.rules = sentences.filter(x => /margin|font|point|spac|indent|header|page number|title|heading|citation|cite|reference|works cited|bibliograph|footnote|abstract|quotation|word (?:count|limit)|length|submit/i.test(x)).slice(0, 25);
  return s;
}
const SPEC_SCHEMA = `{"name": string, "page": {"margin": inches, "font": string, "size": points, "spacing": 1|1.5|2, "indent": inches, "align": "left"|"justify"},
 "header": {"left": string, "center": string, "right": string, "position": "top"|"bottom", "fromEdge": inches, "firstPage": boolean},
 "titlePage": {"on": boolean, "top": inches from top margin, "lines": [{"text": string, "bold": boolean}]},
 "headingBlock": {"on": boolean, "lines": [{"text": string, "bold": boolean, "align": "left"|"center"}]},
 "titleOnFirstPage": {"on": boolean, "bold": boolean}, "abstract": {"on": boolean, "title": string},
 "headings": [5 × {"align": "left"|"center", "bold": boolean, "italic": boolean, "runIn": boolean, "indent": boolean, "case": "title"|"sentence"|"upper"}],
 "references": {"on": boolean, "title": string, "bold": boolean, "align": "left"|"center", "newPage": boolean, "hanging": inches, "spacing": 1|2, "blankBetween": boolean},
 "citations": {"mode": "author-date"|"mla"|"notes"|"bluebook", "style": "apa"|"mla"|"chicago"|"bluebook"},
 "rules": [short checklist items in your own words]}
In header and title lines use these placeholders: {title} {author} {lastname} {institution} {course} {instructor} {date} {runningHead} {RUNNINGHEAD} {recipient} {subject} {page}.`;
function mergeSpec(base, part) {
  const out = JSON.parse(JSON.stringify(base)); if (!part || typeof part !== "object") return out;
  for (const [k, v] of Object.entries(part)) { if (v == null) continue; if (Array.isArray(v)) { if (k === "headings") out.headings = out.headings.map((h, i) => ({ ...h, ...(v[i] || {}) })); else out[k] = v; } else if (typeof v === "object") out[k] = { ...(out[k] || {}), ...Object.fromEntries(Object.entries(v).filter(([, x]) => x != null)) }; else out[k] = v; }
  return out;
}
async function readSource(src) {
  if (src.kind === "paste") return { text: src.text };
  if (src.kind === "file") {
    const f = src.file, ext = extOf(f.name), u8 = new Uint8Array(await f.arrayBuffer());
    if (ext === "pdf") return { pdf: u8, name: f.name };
    if (ext === "docx") { try { const r = await docxRead(u8); return { text: (r.meta.title ? "# " + r.meta.title + "\n" : "") + r.blocks.map(b => (b.t === "h" ? "#".repeat(b.level) + " " : "") + b.text).join("\n"), docx: r }; } catch (e) { return { text: await docxToText(u8) }; } }
    if (ext === "html" || ext === "htm") return { text: htmlToMarkdown(dec.decode(u8)) };
    if (ext === "tex") return { text: dec.decode(u8), tex: true };
    return { text: dec.decode(u8) };
  }
  // a link: try reading it directly (works when the site allows it); otherwise AI can fetch it
  try { const r = await fetch(src.url, { mode: "cors" }); if (!r.ok) throw new Error(); const ct = r.headers.get("content-type") || ""; if (/pdf/.test(ct) || /\.pdf($|\?)/i.test(src.url)) return { pdf: new Uint8Array(await r.arrayBuffer()), name: src.url.split("/").pop() }; const body = await r.text(); return { text: /html/.test(ct) ? htmlToMarkdown(body) : body }; }
  catch (e) { return { url: src.url, blocked: true }; }
}

/* ============ Format tab ============ */
function viewFormat(p, el) {
  const F = fmtState(p), styles = allStyles(p), spec = resolveStyle(p, F.style), docs = formattable(p), path = F.doc;
  el.innerHTML = `<div class="subhead"><h2>Format</h2><button class="btn" id="fm-import">${ic("import")} Import a style</button><button class="btn" id="fm-struct">${ic("sections")} Copy a paper's structure</button></div>
    <p class="muted" style="margin:-8px 0 16px">Choose a style, fill in the details, and download a formatted Word file or apply the style to your LaTeX. Your writing isn't changed. Built-in styles summarize the Purdue OWL; check your instructor's or publisher's requirements too.</p>
    ${!path ? `<div class="Box blankslate">${ic("pilcrow")}<h3>Nothing to format yet</h3><p class="muted">Add or import a Word, LaTeX or Markdown document first.</p><button class="btn btn-primary" data-tab="import">Import documents</button></div>` : `
    <div class="fm-grid">
      <div>
        <div class="Box fm-controls"><div class="Box-row" style="flex-wrap:wrap;gap:12px">
          <label for="fm-doc" style="margin:0">Document<select class="form" id="fm-doc">${docs.map(d => `<option ${d === path ? "selected" : ""}>${esc(d)}</option>`).join("")}</select></label>
          <label for="fm-style" style="margin:0">Style<select class="form" id="fm-style">${styles.map(s => `<option value="${esc(s.id)}" ${s.id === F.style ? "selected" : ""}>${esc(s.name)}${s.builtin ? "" : " (yours)"}</option>`).join("")}</select></label>
          <span class="grow"></span>
          <button class="btn btn-primary" id="fm-docx">${ic("download")} Formatted Word file</button>
          ${extOf(path) === "tex" ? `<button class="btn" id="fm-tex">Apply to LaTeX</button>` : ""}
        </div></div>
        <div class="fm-preview" id="fm-prev"><div class="muted" style="padding:24px"><span class="spinner sm"></span> Laying out pages…</div></div>
      </div>
      <div>
        <div class="Box"><div class="Box-header"><strong>Details</strong><span class="muted" style="font-size:12px">Used on the title page and in headers</span></div><div class="Box-body fm-fields">
          ${FIELDS.filter(([k]) => fieldUsed(spec, k)).map(([k, l]) => `<label for="ff-${k}">${l}<input type="text" id="ff-${k}" data-field="${k}" value="${esc(F.fields[k] || "")}"></label>`).join("")}
          <p class="muted" style="font-size:12px;margin:0" id="fm-auto"></p></div></div>
        <div class="Box" style="margin-top:16px"><div class="Box-header"><strong>Checklist</strong><span class="grow"></span><span class="muted" id="fm-score" style="font-size:12px"></span></div><div id="fm-checks"><div class="Box-body muted">Checking…</div></div>
          <div class="Box-row fm-rules-h"><strong style="font-size:12px">Style rules</strong><span class="grow"></span>${spec.source && spec.source.url ? `<a href="${esc(spec.source.url)}" target="_blank" rel="noopener" style="font-size:12px">${esc(spec.source.label || "Source")} ↗</a>` : spec.source && spec.source.label ? `<span class="muted" style="font-size:12px">${esc(spec.source.label)}</span>` : ""}</div>
          ${(spec.rules || []).map((r, i) => `<label class="Box-row check fm-rule"><input type="checkbox" data-rule="${i}" ${(F.checked[spec.id || F.style] || []).includes(i) ? "checked" : ""}><span>${esc(r)}</span></label>`).join("") || `<div class="Box-body muted">No rules listed for this style.</div>`}
        </div>
      </div>
    </div>`}
    <div class="subhead" style="margin-top:24px"><h2 style="font-size:20px">Styles</h2></div>
    <div class="fm-styles">${styles.map(s => styleCard(p, s, s.id === F.style)).join("")}</div>`;
  const rerender = () => go("format", {}, true);
  el.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => go(b.dataset.tab));
  $("#fm-import").onclick = () => importStyleFlow(p);
  $("#fm-struct").onclick = () => structureFlow(p);
  el.querySelectorAll("[data-use]").forEach(b => b.onclick = () => useStyle(p, b.dataset.use));
  el.querySelectorAll("[data-edit-style]").forEach(b => b.onclick = () => styleEditFlow(p, resolveStyle(p, b.dataset.editStyle), allStyles(p).find(s => s.id === b.dataset.editStyle).builtin));
  el.querySelectorAll("[data-export-style]").forEach(b => b.onclick = () => { const s = resolveStyle(p, b.dataset.exportStyle); const out = JSON.stringify({ format: "writers-box-style", style: s }, null, 2); offerFile(slug(s.name) + ".style.json", out, out); });
  el.querySelectorAll("[data-del-style]").forEach(b => b.onclick = async () => { if (!await confirmBox("Delete this style?", "It's removed from this browser and this project. Documents aren't changed.", "Delete", true)) return; deleteCustomStyle(p, b.dataset.delStyle); if (F.style === b.dataset.delStyle) F.style = "apa7-student"; persist(p, true); rerender(); });
  if (!path) return;
  $("#fm-doc").onchange = e => { F.doc = e.target.value; persist(p, true); rerender(); };
  $("#fm-style").onchange = e => useStyle(p, e.target.value);
  el.querySelectorAll("[data-field]").forEach(i => i.oninput = () => { F.fields[i.dataset.field] = i.value; persist(p); clearTimeout(i._t); i._t = setTimeout(refresh, 300); });
  el.querySelectorAll("[data-rule]").forEach(c => c.onchange = () => { const id = spec.id || F.style, set = new Set(F.checked[id] || []); c.checked ? set.add(+c.dataset.rule) : set.delete(+c.dataset.rule); F.checked[id] = [...set]; persist(p); score(); });
  $("#fm-docx").onclick = async () => { try { const doc = await docBlocks(p, path), lay = layoutPaper(p, spec, doc); await offerFile(stemOf(path) + " (" + slug(spec.name) + ").docx", paperDocx(spec, lay)); if (lay.missing.length) toast(`Downloaded. ${lay.missing.length} citation${lay.missing.length > 1 ? "s are" : " is"} missing from your references.`); } catch (e) { toast("Couldn't build the Word file: " + e.message); } };
  const tx = $("#fm-tex"); if (tx) tx.onclick = () => { try { applyLatex(p, path, spec); persist(p, true); S.refStyle = spec.citations.style; toast(`Applied ${spec.name} to ${path}. Review it in Changes, then save a version.`); rerender(); } catch (e) { toast(e.message); } };
  let lastChecks = [];
  const score = () => { const rules = (spec.rules || []).length, done = (F.checked[spec.id || F.style] || []).length, auto = lastChecks.filter(c => c.ok).length; const s = $("#fm-score"); if (s) s.textContent = `${auto + done} of ${lastChecks.length + rules} done`; };
  async function refresh() {
    try {
      const { checks, lay } = await formatChecks(p, path, spec); lastChecks = checks;
      $("#fm-prev").innerHTML = paperPreview(spec, lay);
      const doc = await docBlocks(p, path), auto = FIELDS.filter(([k]) => !F.fields[k] && doc.meta[k]).map(([k, l]) => l.toLowerCase());
      $("#fm-auto").textContent = auto.length ? `Empty fields use the document's own ${auto.join(", ")}.` : "";
      el.querySelectorAll("[data-field]").forEach(i => { if (!i.value) i.placeholder = lay.values[i.dataset.field] || ""; });
      $("#fm-checks").innerHTML = checks.map((c, i) => `<div class="Box-row fm-check ${c.ok ? "ok" : "todo"}">${ic(c.ok ? "check" : "alert")}<span class="grow">${esc(c.text)}</span>${!c.ok && c.fix ? `<button class="btn btn-sm" data-fix="${c.fix}" data-ci="${i}">${{ fields: "Fill in", refs: "Open References", latex: "Apply", refstyle: "Match", limit: "Open" }[c.fix]}</button>` : ""}</div>`).join("");
      $("#fm-checks").querySelectorAll("[data-fix]").forEach(b => b.onclick = () => { const k = b.dataset.fix; if (k === "fields") { const e = el.querySelector("[data-field]:placeholder-shown"); (e || el.querySelector("[data-field]")).focus(); } else if (k === "refs") go("refs"); else if (k === "latex") tx && tx.click(); else if (k === "refstyle") { S.refStyle = spec.citations.style; refresh(); } else if (k === "limit") go("file", { file: path }); });
      score();
    } catch (e) { $("#fm-prev").innerHTML = `<div class="flash">${ic("alert")}<span>${esc(e.message)}</span></div>`; }
  }
  refresh();
}
const fieldUsed = (spec, k) => { const all = JSON.stringify([spec.titlePage.on ? spec.titlePage.lines : [], spec.headingBlock.on ? spec.headingBlock.lines : [], spec.header]); return k === "title" || k === "author" || all.includes("{" + k + "}") || (k === "runningHead" && all.includes("{RUNNINGHEAD}")); };
function useStyle(p, id) { const F = fmtState(p); F.style = id; const s = resolveStyle(p, id); S.refStyle = s.citations.style; persist(p, true); go("format", {}, true); toast(`Using ${s.name}.`); }
function styleCard(p, s0, current) {
  const s = resolveStyle(p, s0.id), pg = s.page;
  const facts = [`${pg.font} ${pg.size} pt`, `${pg.margin}" margins`, pg.spacing === 2 ? "double-spaced" : pg.spacing === 1 ? "single-spaced" : pg.spacing + " spacing", s.titlePage.on ? "title page" : s.headingBlock.on ? "first-page heading" : "no title page", CITE_MODES[s.citations.mode].replace(/^In text: /, "")];
  return `<div class="Box fm-card ${current ? "current" : ""}"><div class="Box-header"><strong>${esc(s.name)}</strong>${s0.builtin ? "" : `<span class="label">Yours</span>`}${current ? `<span class="label label-success">In use</span>` : ""}</div>
    <div class="Box-body"><div class="muted" style="font-size:12px">${facts.map(esc).join(" · ")}</div>${s.references.on ? `<div class="muted" style="font-size:12px">Reference list: ${esc(s.references.title)}</div>` : ""}
      ${s.source && s.source.url ? `<a href="${esc(s.source.url)}" target="_blank" rel="noopener" style="font-size:12px">${esc(s.source.label || s.source.url)} ↗</a>` : s.source && s.source.label ? `<div class="muted" style="font-size:12px">From ${esc(s.source.label)}</div>` : ""}
      <div class="row" style="margin-top:10px">${current ? "" : `<button class="btn btn-sm btn-primary" data-use="${esc(s0.id)}">Use</button>`}<button class="btn btn-sm" data-edit-style="${esc(s0.id)}">${s0.builtin ? "Customize" : "Edit"}</button><button class="btn btn-sm" data-export-style="${esc(s0.id)}">Export</button>${s0.builtin ? "" : `<button class="btn btn-sm btn-danger" data-del-style="${esc(s0.id)}">Delete</button>`}</div></div></div>`;
}

/* ---------- style editor ---------- */
function styleEditFlow(p, spec, fromBuiltin, note = "") {
  const s = JSON.parse(JSON.stringify(spec)); if (fromBuiltin) { s.id = "custom-" + uid(); s.name = s.name + " (custom)"; delete s.builtin; s.source = s.source || {}; s.basedOn = spec.name; }
  const sel = (id, opts, val) => `<select class="form" id="${id}">${opts.map(([v, l]) => `<option value="${v}" ${String(v) === String(val) ? "selected" : ""}>${l}</option>`).join("")}</select>`;
  const num = (id, val, step = 0.25) => `<input type="number" id="${id}" value="${val}" step="${step}" min="0">`;
  const linesTxt = ls => (ls || []).map(l => (l.bold ? "**" : "") + l.text + (l.bold ? "**" : "") + (l.align && l.align !== "left" && l.align !== "center" ? "" : "")).join("\n");
  modal({
    title: fromBuiltin ? `Customize ${spec.name}` : `Edit ${spec.name}`,
    body: `${note ? `<div class="flash info">${ic("info")}<span>${note}</span></div>` : ""}
      <label for="se-name">Style name<input type="text" id="se-name" value="${esc(s.name)}"></label>
      <h4 class="se-h">Page</h4><div class="se-grid">
        <label for="se-font">Font<input type="text" id="se-font" value="${esc(s.page.font)}" list="se-fonts"><datalist id="se-fonts">${["Times New Roman", "Georgia", "Calibri", "Arial", "Garamond", "Cambria", "Courier New", "Book Antiqua", "Century Schoolbook"].map(f => `<option>${f}</option>`).join("")}</datalist></label>
        <label for="se-size">Size (pt)${num("se-size", s.page.size, 0.5)}</label><label for="se-margin">Margins (in)${num("se-margin", s.page.margin)}</label>
        <label for="se-spacing">Line spacing${sel("se-spacing", [[1, "Single"], [1.5, "1.5 lines"], [2, "Double"]], s.page.spacing)}</label><label for="se-indent">First-line indent (in)${num("se-indent", s.page.indent)}</label>
        <label for="se-align">Text alignment${sel("se-align", [["left", "Left"], ["justify", "Justified"]], s.page.align || "left")}</label></div>
      <h4 class="se-h">Header or footer</h4><div class="se-grid">
        <label for="se-hl">Left<input type="text" id="se-hl" value="${esc(s.header.left || "")}"></label><label for="se-hc">Center<input type="text" id="se-hc" value="${esc(s.header.center || "")}"></label><label for="se-hr">Right<input type="text" id="se-hr" value="${esc(s.header.right || "")}"></label>
        <label for="se-hpos">Position${sel("se-hpos", [["top", "Top of page"], ["bottom", "Bottom of page"]], s.header.position)}</label><label class="check" style="align-self:end"><input type="checkbox" id="se-hfirst" ${s.header.firstPage ? "checked" : ""}> <span>Also on the first page</span></label></div>
      <p class="muted" style="font-size:12px;margin-top:0">Placeholders: {page} {lastname} {title} {runningHead} {RUNNINGHEAD} {author} {date}</p>
      <h4 class="se-h">Opening</h4>
      <label for="se-open">First page${sel("se-open", [["title", "Separate title page"], ["block", "Heading block at the top of page 1"], ["none", "Neither"]], s.titlePage.on ? "title" : s.headingBlock.on ? "block" : "none")}</label>
      <label for="se-lines">Lines, in order <span class="muted" style="font-weight:400">(one per line; **bold**; empty line for a gap)</span><textarea class="form" id="se-lines" rows="6" style="font-family:var(--mono);font-size:12px">${esc(linesTxt(s.titlePage.on ? s.titlePage.lines : s.headingBlock.lines))}</textarea></label>
      <div class="se-grid"><label class="check"><input type="checkbox" id="se-t1" ${s.titleOnFirstPage.on ? "checked" : ""}> <span>Title above the first page of text</span></label><label class="check"><input type="checkbox" id="se-t1b" ${s.titleOnFirstPage.bold ? "checked" : ""}> <span>Bold title</span></label><label class="check"><input type="checkbox" id="se-abs" ${s.abstract.on ? "checked" : ""}> <span>Abstract on its own page</span></label></div>
      <h4 class="se-h">Headings</h4><table class="se-heads"><thead><tr><th>Level</th><th>Align</th><th>Bold</th><th>Italic</th><th>Indent</th><th>Run in</th><th>Case</th></tr></thead><tbody>${s.headings.map((h, i) => `<tr><td>${i + 1}</td><td>${sel("sh-al" + i, [["left", "Left"], ["center", "Center"]], h.align)}</td><td><input type="checkbox" id="sh-b${i}" ${h.bold ? "checked" : ""} aria-label="Level ${i + 1} bold"></td><td><input type="checkbox" id="sh-i${i}" ${h.italic ? "checked" : ""} aria-label="Level ${i + 1} italic"></td><td><input type="checkbox" id="sh-n${i}" ${h.indent ? "checked" : ""} aria-label="Level ${i + 1} indented"></td><td><input type="checkbox" id="sh-r${i}" ${h.runIn ? "checked" : ""} aria-label="Level ${i + 1} run in"></td><td>${sel("sh-c" + i, [["title", "Title Case"], ["sentence", "Sentence case"], ["upper", "CAPITALS"]], h.case)}</td></tr>`).join("")}</tbody></table>
      <h4 class="se-h">Citations and reference list</h4><div class="se-grid">
        <label for="se-cm">Citations${sel("se-cm", Object.entries(CITE_MODES), s.citations.mode)}</label>
        <label for="se-cs">Reference format${sel("se-cs", Object.entries(STYLES), s.citations.style)}</label>
        <label class="check" style="align-self:end"><input type="checkbox" id="se-ron" ${s.references.on ? "checked" : ""}> <span>Include a reference list</span></label>
        <label for="se-rt">List title<input type="text" id="se-rt" value="${esc(s.references.title)}"></label><label for="se-rh">Hanging indent (in)${num("se-rh", s.references.hanging)}</label>
        <label for="se-rs">Entry spacing${sel("se-rs", [[1, "Single, blank line between"], [2, "Double"]], s.references.spacing)}</label>
        <label class="check"><input type="checkbox" id="se-rb" ${s.references.bold ? "checked" : ""}> <span>Bold title</span></label><label class="check"><input type="checkbox" id="se-rc" ${s.references.align === "center" ? "checked" : ""}> <span>Centered title</span></label><label class="check"><input type="checkbox" id="se-rn" ${s.references.newPage ? "checked" : ""}> <span>New page</span></label></div>
      <h4 class="se-h">Rules checklist</h4><label for="se-rules"><span class="muted" style="font-weight:400">One rule per line. These show as a checklist in the Format tab.</span><textarea class="form" id="se-rules" rows="5">${esc((s.rules || []).join("\n"))}</textarea></label>
      <div class="se-grid"><label for="se-src">Source<input type="text" id="se-src" value="${esc((s.source && s.source.label) || "")}" placeholder="e.g. Course syllabus, journal guidelines"></label><label for="se-url">Source link<input type="text" id="se-url" value="${esc((s.source && s.source.url) || "")}" placeholder="https://…"></label></div>`,
    actions: [{ label: "Cancel" }, { label: "Save style", primary: true, onClick: ov => {
      const g = id => $("#" + id, ov), n = id => parseFloat(g(id).value) || 0, c = id => g(id).checked;
      s.name = g("se-name").value.trim() || "My style";
      s.page = { margin: n("se-margin") || 1, font: g("se-font").value.trim() || "Times New Roman", size: n("se-size") || 12, spacing: +g("se-spacing").value, indent: n("se-indent"), align: g("se-align").value };
      s.header = { ...s.header, left: g("se-hl").value, center: g("se-hc").value, right: g("se-hr").value, position: g("se-hpos").value, firstPage: c("se-hfirst") };
      const lines = g("se-lines").value.split("\n").map(l => { const b = /^\*\*(.*)\*\*$/.exec(l.trim()); return { text: b ? b[1] : l.trim(), bold: !!b }; }); const open = g("se-open").value;
      s.titlePage = { ...s.titlePage, on: open === "title", lines: open === "title" ? lines : s.titlePage.lines }; s.headingBlock = { ...s.headingBlock, on: open === "block", lines: open === "block" ? lines : s.headingBlock.lines };
      s.titleOnFirstPage = { on: c("se-t1"), bold: c("se-t1b") }; s.abstract = { ...s.abstract, on: c("se-abs") };
      s.headings = s.headings.map((h, i) => ({ align: g("sh-al" + i).value, bold: c("sh-b" + i), italic: c("sh-i" + i), indent: c("sh-n" + i), runIn: c("sh-r" + i), case: g("sh-c" + i).value }));
      s.citations = { mode: g("se-cm").value, style: g("se-cs").value };
      s.references = { ...s.references, on: c("se-ron"), title: g("se-rt").value.trim() || "References", hanging: n("se-rh"), spacing: +g("se-rs").value, blankBetween: +g("se-rs").value === 1, bold: c("se-rb"), align: c("se-rc") ? "center" : "left", newPage: c("se-rn") };
      s.rules = g("se-rules").value.split("\n").map(x => x.trim()).filter(Boolean);
      s.source = { label: g("se-src").value.trim(), url: g("se-url").value.trim() };
      if (s.builtin) { s.id = "custom-" + uid(); delete s.builtin; }
      saveCustomStyle(p, s); const F = fmtState(p); F.style = s.id; S.refStyle = s.citations.style; persist(p, true); go("format", {}, true); toast(`Saved ${s.name}.`); return true;
    } }]
  });
}

/* ---------- import a style ---------- */
function importStyleFlow(p) {
  let mode = "link";
  modal({
    title: "Import a style",
    body: `<p class="muted" style="margin-top:0">Bring in formatting rules from a syllabus, a journal's author guidelines, a style guide page, or a Writer's Box style file. You'll review the result before using it.</p>
      <div class="seg" role="group" aria-label="Source"><button aria-pressed="true" data-m="link">Link</button><button aria-pressed="false" data-m="file">Document</button><button aria-pressed="false" data-m="paste">Paste</button></div>
      <div data-pane="link"><label for="is-url">Web page or PDF link<input type="url" id="is-url" placeholder="https://owl.purdue.edu/… or your course page"></label>
        <p class="muted" style="font-size:12px">Many sites, including the Purdue OWL, don't let other sites read their pages. For those, Writer's Box uses your OpenRouter connection${llmConnected() ? "" : " (not connected yet)"}, or you can paste the text.</p></div>
      <div data-pane="file" hidden><div class="dropzone" id="is-drop">${ic("import")}<strong>Drop a guide or a style file</strong><span class="muted">.pdf · .docx · .md · .txt · .html · Writer's Box .style.json</span><label class="btn btn-sm" for="is-file">Choose file</label><input type="file" id="is-file" accept=".pdf,.docx,.md,.txt,.html,.htm,.json" hidden></div><p class="muted" id="is-fname"></p></div>
      <div data-pane="paste" hidden><label for="is-text">Paste the formatting requirements<textarea class="form" id="is-text" rows="8" placeholder="Papers must be double-spaced in 12-point Times New Roman with 1-inch margins…"></textarea></label></div>
      <div class="se-grid"><label for="is-base">Start from<select class="form" id="is-base">${allStyles(p).map(s => `<option value="${esc(s.id)}" ${s.id === fmtState(p).style ? "selected" : ""}>${esc(s.name)}</option>`).join("")}</select></label>
        <label class="check" style="align-self:end"><input type="checkbox" id="is-ai" ${llmConnected() ? "checked" : "disabled"}> <span>Read it with AI${llmConnected() ? "" : " (connect OpenRouter in Settings)"}</span></label></div>
      <p class="muted" id="is-msg"></p>`,
    onOpen: ov => {
      ov.querySelectorAll("[data-m]").forEach(b => b.onclick = () => { mode = b.dataset.m; ov.querySelectorAll("[data-m]").forEach(x => x.setAttribute("aria-pressed", x === b)); ov.querySelectorAll("[data-pane]").forEach(x => x.hidden = x.dataset.pane !== mode); });
      const fi = $("#is-file", ov); fi.onchange = () => $("#is-fname", ov).textContent = fi.files[0] ? fi.files[0].name : "";
      const drop = $("#is-drop", ov); drop.addEventListener("dragover", e => { e.preventDefault(); drop.classList.add("over"); }); drop.addEventListener("dragleave", () => drop.classList.remove("over"));
      drop.addEventListener("drop", e => { e.preventDefault(); drop.classList.remove("over"); const dt = new DataTransfer(); dt.items.add(e.dataTransfer.files[0]); fi.files = dt.files; fi.onchange(); });
    },
    actions: [{ label: "Cancel" }, { label: "Read style", primary: true, onClick: async ov => {
      const msg = $("#is-msg", ov), base = resolveStyle(p, $("#is-base", ov).value), ai = $("#is-ai", ov).checked;
      const src = mode === "link" ? { kind: "link", url: $("#is-url", ov).value.trim() } : mode === "file" ? { kind: "file", file: $("#is-file", ov).files[0] } : { kind: "paste", text: $("#is-text", ov).value };
      if ((mode === "link" && !/^https?:\/\//.test(src.url)) || (mode === "file" && !src.file) || (mode === "paste" && src.text.trim().length < 20)) { msg.textContent = mode === "link" ? "Enter a link starting with https://." : mode === "file" ? "Choose a file." : "Paste the requirements first."; return false; }
      msg.innerHTML = `<span class="spinner sm"></span> Reading…`;
      try {
        const head = mode === "file" && src.file.size < 2e6 ? (await src.file.slice(0, 200).text()).trim() : "";
        if (mode === "file" && (/\.json$/i.test(src.file.name) || (head.startsWith("{") && head.includes("writers-box-style")))) { const j = JSON.parse(await src.file.text()); if (j.format !== "writers-box-style" || !j.style) throw new Error("That isn't a Writer's Box style file."); const st = mergeSpec(base, j.style); st.id = "custom-" + uid(); delete st.builtin; ov.querySelector("[data-x]").click(); styleEditFlow(p, st, false, "Imported from a style file. Check it, then save."); return false; }
        const got = await readSource(src);
        let spec, note;
        if (ai && llmConnected()) {
          const parts = [`Formatting guidelines for a written paper follow${got.url ? ` at this link: ${got.url}` : ""}. Convert them to JSON matching this schema:\n${SPEC_SCHEMA}\nStart from this base style and change only what the guidelines say: ${JSON.stringify({ page: base.page, header: base.header, titlePage: base.titlePage, headingBlock: base.headingBlock, references: base.references, citations: base.citations })}\nReturn only the JSON object. Write "rules" as short checklist items in your own words (do not copy passages). Give the style a short "name".`];
          if (got.text) parts.push(got.text.slice(0, 60000)); if (got.pdf) parts.push({ file: got.pdf, name: got.name || "guide.pdf" });
          msg.innerHTML = `<span class="spinner sm"></span> Asking ${esc(llmModel())} to read it…`;
          const j = await llmJSON({ system: "You turn writing and formatting guidelines into a precise JSON style specification. Only use what the guidelines state.", parts, fetchUrls: !!got.url });
          spec = mergeSpec(base, j); note = `Read with AI from ${esc(src.url || (src.file && src.file.name) || "pasted text")}. Check every setting against the guide before using it.`;
        } else {
          if (got.blocked) throw new Error("This site doesn't allow other sites to read it. Connect OpenRouter in Settings › Connections, or copy the requirements and use Paste.");
          if (got.pdf) throw new Error("Reading PDFs needs the OpenRouter connection. Or copy the text from the PDF and use Paste.");
          spec = styleFromText(got.text, base); note = `Settings were picked out of the text automatically, starting from ${esc(base.name)}, and the sentences about formatting became the checklist. Check them against the guide.`;
        }
        spec.id = "custom-" + uid(); delete spec.builtin; delete spec.extends; spec.name = spec.name && spec.name !== base.name ? spec.name : "Imported style";
        spec.source = { label: src.url ? new URL(src.url).hostname : src.file ? src.file.name : "Pasted guidelines", url: src.url || "" };
        ov.querySelector("[data-x]").click(); styleEditFlow(p, spec, false, note); return false;
      } catch (e) { msg.textContent = e.message; return false; }
    } }]
  });
}

/* ---------- copy another paper's structure ---------- */
function structureFlow(p) {
  let mode = "file";
  modal({
    title: "Copy a paper's structure",
    body: `<p class="muted" style="margin-top:0">Use a model paper (a published article, an example from your instructor, last year's report) as a template: Writer's Box picks out its sections and formatting and starts a new outline for you. None of its text is copied.</p>
      <div class="seg" role="group" aria-label="Source"><button aria-pressed="true" data-m="file">Document</button><button aria-pressed="false" data-m="link">Link</button><button aria-pressed="false" data-m="paste">Paste</button><button aria-pressed="false" data-m="project">From this project</button></div>
      <div data-pane="file"><div class="dropzone">${ic("import")}<strong>Choose the model paper</strong><span class="muted">.docx · .pdf · .tex · .md · .txt</span><label class="btn btn-sm" for="cs-file">Choose file</label><input type="file" id="cs-file" accept=".docx,.pdf,.tex,.md,.markdown,.txt,.html" hidden></div><p class="muted" id="cs-fname"></p></div>
      <div data-pane="link" hidden><label for="cs-url">Link to the paper<input type="url" id="cs-url" placeholder="https://…"></label></div>
      <div data-pane="paste" hidden><label for="cs-text">Paste the paper, or just its headings<textarea class="form" id="cs-text" rows="8"></textarea></label></div>
      <div data-pane="project" hidden><label for="cs-doc">Document<select class="form" id="cs-doc">${formattable(p).map(d => `<option>${esc(d)}</option>`).join("")}</select></label></div>
      <label class="check"><input type="checkbox" id="cs-ai" ${llmConnected() ? "checked" : "disabled"}> <span>Describe each section's purpose with AI${llmConnected() ? "" : " (connect OpenRouter in Settings)"}</span></label>
      <p class="muted" style="font-size:12px">Without AI, Writer's Box reads the headings, section lengths and (for Word files) the page set-up. PDFs and links need AI.</p>
      <p class="muted" id="cs-msg"></p>`,
    onOpen: ov => {
      ov.querySelectorAll("[data-m]").forEach(b => b.onclick = () => { mode = b.dataset.m; ov.querySelectorAll("[data-m]").forEach(x => x.setAttribute("aria-pressed", x === b)); ov.querySelectorAll("[data-pane]").forEach(x => x.hidden = x.dataset.pane !== mode); });
      const fi = $("#cs-file", ov); fi.onchange = () => $("#cs-fname", ov).textContent = fi.files[0] ? fi.files[0].name : "";
    },
    actions: [{ label: "Cancel" }, { label: "Read structure", primary: true, onClick: async ov => {
      const msg = $("#cs-msg", ov), ai = $("#cs-ai", ov).checked && llmConnected();
      try {
        let got, label;
        if (mode === "project") { const d = $("#cs-doc", ov).value; if (!d) throw new Error("No document to read."); const r = await docBlocks(p, d); got = { blocks: r.blocks, meta: r.meta, info: r.info }; label = d; }
        else if (mode === "file") { const f = $("#cs-file", ov).files[0]; if (!f) throw new Error("Choose a file."); got = await readSource({ kind: "file", file: f }); label = f.name; if (got.docx) { got.blocks = got.docx.blocks; got.info = got.docx.info; got.meta = got.docx.meta; } else if (got.tex) { const r = texBlocks(got.text); got.blocks = r.blocks; got.meta = r.meta; } else if (got.text) { const r = mdBlocks(got.text); got.blocks = r.blocks; got.meta = r.meta; } }
        else if (mode === "link") { const u = $("#cs-url", ov).value.trim(); if (!/^https?:\/\//.test(u)) throw new Error("Enter a link starting with https://."); msg.innerHTML = `<span class="spinner sm"></span> Reading…`; got = await readSource({ kind: "link", url: u }); label = new URL(u).hostname; if (got.text) { const r = mdBlocks(got.text); got.blocks = r.blocks; got.meta = r.meta; } }
        else { const t = $("#cs-text", ov).value; if (t.trim().length < 10) throw new Error("Paste the paper or its headings."); got = { text: t }; const r = mdBlocks(t.split("\n").map(l => /^#/.test(l) || l.length > 80 || !l.trim() ? l : /^[A-Z0-9IVX]+[.)]\s|^[A-Z][^.!?]{2,60}$/.test(l.trim()) ? "## " + l.replace(/^[A-Z0-9IVX]+[.)]\s*/, "") : l).join("\n")); got.blocks = r.blocks; got.meta = r.meta; label = "pasted text"; }
        let outline = got.blocks ? outlineFromBlocks(got.blocks) : [], formatting = got.info || null, cite = null, summary = "";
        if (ai) {
          msg.innerHTML = `<span class="spinner sm"></span> Asking ${esc(llmModel())} to describe the structure…`;
          const parts = [`Describe the structure of this paper so a writer can use it as a template for a different paper on their own topic. Do not reproduce its text or arguments.
Return JSON: {"summary": one sentence on the kind of paper, "sections": [{"heading": generic heading (keep standard headings like Introduction, Methods; replace topic-specific headings with a generic description in brackets), "level": 1-3, "purpose": what this section does in one sentence, "share": percent of total length}], "citation": "apa"|"mla"|"chicago"|"bluebook"|"other", "formatting": partial style using this schema (only what you can see): ${SPEC_SCHEMA}}${got.url ? `\nThe paper is at ${got.url}.` : ""}`];
          if (got.text) parts.push(got.text.slice(0, 80000)); else if (got.blocks) parts.push(got.blocks.map(b => (b.t === "h" ? "#".repeat(b.level) + " " + b.text : `[paragraph, ${wordCount(b.text)} words]`)).join("\n"));
          if (got.pdf) parts.push({ file: got.pdf, name: got.name || "paper.pdf" });
          const j = await llmJSON({ system: "You analyse the structure of academic and professional papers. You never copy their wording.", parts, fetchUrls: !!got.url });
          if (Array.isArray(j.sections) && j.sections.length) outline = j.sections.map(s => ({ heading: String(s.heading || "Section"), level: Math.max(1, Math.min(3, +s.level || 1)), purpose: String(s.purpose || ""), share: +s.share || 0 }));
          formatting = j.formatting || formatting; cite = j.citation; summary = j.summary || "";
        } else {
          if (got.blocked) throw new Error("That site can't be read from the browser. Connect OpenRouter, download the paper and choose it as a document, or paste its headings.");
          if (got.pdf) throw new Error("Reading PDFs needs the OpenRouter connection. You can also paste the paper's headings.");
        }
        if (!outline.length) throw new Error("No sections found. Paste the paper's headings, one per line, or use AI.");
        ov.querySelector("[data-x]").click(); outlineResultFlow(p, { outline, formatting, cite, summary, label, title: (got.meta && got.meta.title) || "" }); return false;
      } catch (e) { msg.textContent = e.message; return false; }
    } }]
  });
}
function outlineFromBlocks(blocks) {
  const total = Math.max(1, blocks.filter(b => b.t !== "h").reduce((n, b) => n + wordCount(b.text || ""), 0)), out = []; let cur = null;
  for (const b of blocks) { if (b.t === "h") { cur = { heading: b.text.replace(/\*/g, "").replace(/\u0001.*?\u0002/g, ""), level: Math.min(3, b.level), purpose: "", words: 0 }; out.push(cur); } else if (cur) cur.words += wordCount(b.text || ""); else if (b.t === "abstract") out.push({ heading: "Abstract", level: 1, purpose: "", words: wordCount(b.text) }); }
  return out.map(s => ({ ...s, share: Math.round(s.words / total * 100) }));
}
function outlineResultFlow(p, r) {
  const fmtNames = { md: "Markdown (.md)", tex: "LaTeX (.tex)" };
  modal({
    title: "Structure found",
    body: `<p class="muted" style="margin-top:0">From ${esc(r.label)}${r.summary ? ": " + esc(r.summary) : ""}. Edit the outline, then start your paper from it.</p>
      <label for="or-out">Outline <span class="muted" style="font-weight:400">(one heading per line; indent with # for levels; text after “ — ” is a note to yourself)</span><textarea class="form" id="or-out" rows="10" style="font-family:var(--mono);font-size:12px">${esc(r.outline.map(s => "#".repeat(s.level) + " " + s.heading + (s.purpose || s.share ? " — " + [s.purpose, s.share ? `about ${s.share}% of the paper` : ""].filter(Boolean).join(" · ") : "")).join("\n"))}</textarea></label>
      <div class="se-grid"><label for="or-name">New document<input type="text" id="or-name" value="${esc(slug(r.title || "outline") || "outline")}" style="font-family:var(--mono)"></label>
        <label for="or-fmt">As<select class="form" id="or-fmt">${Object.entries(fmtNames).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></label>
        <label for="or-words">Target length (words)<input type="number" id="or-words" value="3000" step="250" min="0"></label></div>
      <label class="check"><input type="checkbox" id="or-split" checked> <span>Make each top-level section its own file</span></label>
      ${r.formatting ? `<label class="check"><input type="checkbox" id="or-style" checked> <span>Save the paper's formatting as a style${r.formatting.font || (r.formatting.page && r.formatting.page.font) ? ` (${esc((r.formatting.page && r.formatting.page.font) || r.formatting.font)})` : ""}</span></label>` : ""}`,
    actions: [{ label: "Cancel" }, { label: "Create outline", primary: true, onClick: ov => {
      const g = id => $("#" + id, ov), ext = g("or-fmt").value, words = +g("or-words").value || 0;
      let name = g("or-name").value.trim().replace(/\.(md|tex)$/i, "") || "outline"; const taken = new Set(); const path = freePath(p, name + "." + ext, taken);
      const lines = g("or-out").value.split("\n").map(l => /^(#{1,6})\s+(.*?)(?:\s+—\s+(.*))?$/.exec(l.trim())).filter(Boolean);
      if (!lines.length) { toast("Add at least one heading."); return false; }
      const cmd = ["section", "subsection", "subsubsection"];
      const body = lines.map(([, h, head, note]) => { const lvl = h.length, sh = /(\d+)%/.exec(note || ""), target = sh && words ? ` Aim for about ${Math.round(words * +sh[1] / 100 / 50) * 50} words.` : "";
        return ext === "tex" ? `\\${cmd[Math.min(2, lvl - 1)]}{${head}}\n${note || target ? `% ${(note || "").replace(/about \d+% of the paper/, "").replace(/\s·\s*$/, "").trim()}${target}\n` : ""}` : `${"#".repeat(lvl + 1)} ${head}\n\n${note || target ? `<!-- ${(note || "").replace(/about \d+% of the paper/, "").replace(/\s·\s*$/, "").trim()}${target} -->\n` : ""}`; }).join("\n");
      const title = "[Your title]";
      p.working[path] = { text: ext === "tex" ? `\\documentclass[12pt]{article}\n\\title{${title}}\n\\author{}\n\\begin{document}\n\\maketitle\n\n${body}\n\\end{document}\n` : `---\ntitle: "${title}"\n---\n\n${body}`, orig: null };
      if (g("or-split").checked) { const plan = planSplit(p, path, ext === "tex" ? 2 : 2, stemOf(path)); if (plan && plan.chunks.length > 1) applySplit(p, path, plan); }
      const st = g("or-style"); if (st && st.checked && r.formatting) { const flat = r.formatting.page || r.formatting.header ? r.formatting : { page: { margin: r.formatting.margin, font: r.formatting.font, size: r.formatting.size, spacing: r.formatting.spacing, indent: r.formatting.indent } }; const base = resolveStyle(p, r.cite === "mla" ? "mla9" : r.cite === "chicago" ? "chicago18-nb" : r.cite === "bluebook" ? "bluebook-memo" : "apa7-student"); const spec = mergeSpec(base, flat); spec.id = "custom-" + uid(); delete spec.builtin; delete spec.extends; spec.name = `Like ${r.label}`.slice(0, 60); spec.source = { label: r.label, url: "" }; spec.rules = [...(spec.rules || [])]; saveCustomStyle(p, spec); fmtState(p).style = spec.id; }
      fmtState(p).doc = path; persist(p, true); go("file", { file: path, fileMode: "write" }); toast(`Started ${path} from the outline. Save a version when you're ready.`); return true;
    } }]
  });
}
