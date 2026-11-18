
/* ============ References (citation manager) ============
   A project's references live in its BibTeX file(s), so they are versioned, compared, reviewed and synced
   like any other file. Edits replace only the edited entry's text, so other entries keep their formatting. */

/* ---------- BibTeX parsing ---------- */
const MONTHS = { jan: "January", feb: "February", mar: "March", apr: "April", may: "May", jun: "June", jul: "July", aug: "August", sep: "September", oct: "October", nov: "November", dec: "December" };
function parseBib(text) {
  const entries = [], strings = { ...MONTHS };
  let i = 0;
  while ((i = text.indexOf("@", i)) !== -1) {
    const m = /^@\s*([A-Za-z]+)\s*([{(])/.exec(text.slice(i, i + 64));
    if (!m) { i++; continue; }
    const type = m[1].toLowerCase(), open = m[2], close = open === "{" ? "}" : ")";
    let k = i + m[0].length, depth = 1;
    while (k < text.length && depth > 0) { const ch = text[k]; if (ch === "\\") { k += 2; continue; } if (ch === open) depth++; else if (ch === close) depth--; k++; }
    const body = text.slice(i + m[0].length, k - 1);
    if (type === "comment" || type === "preamble") { i = k; continue; }
    if (type === "string") { Object.assign(strings, Object.fromEntries(Object.entries(parseBibFields(body, strings).fields).map(([a, b]) => [a.toLowerCase(), b]))); i = k; continue; }
    const comma = body.indexOf(","), key = (comma < 0 ? body : body.slice(0, comma)).trim();
    const { fields, order } = parseBibFields(comma < 0 ? "" : body.slice(comma + 1), strings);
    entries.push({ type, key, fields, order, start: i, end: k });
    i = k;
  }
  return entries;
}
function parseBibFields(s, strings) {
  const fields = {}, order = []; let i = 0;
  const ws = () => { while (i < s.length && /[\s,]/.test(s[i])) i++; };
  const braced = () => { let d = 1, j = i + 1; while (j < s.length && d > 0) { if (s[j] === "\\") { j += 2; continue; } if (s[j] === "{") d++; else if (s[j] === "}") d--; j++; } const v = s.slice(i + 1, j - 1); i = j; return v; };
  const quoted = () => { let d = 0, j = i + 1; while (j < s.length) { const c = s[j]; if (c === "\\") { j += 2; continue; } if (c === "{") d++; else if (c === "}") d--; else if (c === '"' && d === 0) break; j++; } const v = s.slice(i + 1, j); i = j + 1; return v; };
  while (i < s.length) {
    ws(); const nm = /^[A-Za-z0-9_\-:.+]+/.exec(s.slice(i)); if (!nm) break;
    i += nm[0].length; while (i < s.length && /\s/.test(s[i])) i++;
    if (s[i] !== "=") { continue; } i++;
    const parts = [];
    for (;;) {
      while (i < s.length && /\s/.test(s[i])) i++;
      if (s[i] === "{") parts.push(braced());
      else if (s[i] === '"') parts.push(quoted());
      else { const t = /^[^\s,#}]+/.exec(s.slice(i)); if (!t) break; i += t[0].length; parts.push(strings[t[0].toLowerCase()] !== undefined ? strings[t[0].toLowerCase()] : t[0]); }
      while (i < s.length && /\s/.test(s[i])) i++;
      if (s[i] === "#") { i++; continue; }
      break;
    }
    const name = nm[0].toLowerCase(); if (!(name in fields)) order.push(name); fields[name] = parts.join("");
  }
  return { fields, order };
}
const FIELD_ORDER = ["author", "editor", "title", "journal", "booktitle", "edition", "publisher", "institution", "school", "organization", "address", "howpublished", "year", "month", "volume", "number", "pages", "doi", "url", "urldate", "isbn", "issn", "note", "keywords", "abstract"];
function entryToBib(e) {
  const names = Object.keys(e.fields).filter(k => e.fields[k] !== "" && e.fields[k] != null);
  names.sort((a, b) => (FIELD_ORDER.indexOf(a) + 1 || 99) - (FIELD_ORDER.indexOf(b) + 1 || 99));
  const w = Math.max(0, ...names.map(n => n.length));
  return `@${e.type}{${e.key},\n${names.map(n => `  ${n.padEnd(w)} = {${e.fields[n]}}`).join(",\n")}\n}`;
}
const bibEscape = s => String(s == null ? "" : s).replace(/\\/g, "\\textbackslash{}").replace(/([&%$#_])/g, "\\$1").replace(/[{}]/g, "");

/* ---------- LaTeX → readable text ---------- */
const ACCENT = { '"': "\u0308", "'": "\u0301", "`": "\u0300", "^": "\u0302", "~": "\u0303", "=": "\u0304", ".": "\u0307", c: "\u0327", u: "\u0306", v: "\u030C", H: "\u030B", k: "\u0328", r: "\u030A" };
function texText(s) {
  if (!s) return "";
  let t = String(s);
  t = t.replace(/\{?\\(["'`^~=.])\s*\{?\\?([A-Za-z])\}?\}?/g, (_, a, ch) => ch + ACCENT[a])
    .replace(/\{?\\([cuvHkr])\s*\{\\?([A-Za-z])\}\}?/g, (_, a, ch) => ch + ACCENT[a])
    .replace(/\{?\\([cuvHkr]) ([A-Za-z])\}?/g, (_, a, ch) => ch + ACCENT[a])
    .replace(/\\ss\b\{?\}?/g, "ß").replace(/\\(aa|AA)\b\{?\}?/g, m => m.includes("AA") ? "Å" : "å").replace(/\\(ae|AE)\b\{?\}?/g, m => m.includes("AE") ? "Æ" : "æ")
    .replace(/\\(oe|OE)\b\{?\}?/g, m => m.includes("OE") ? "Œ" : "œ").replace(/\\o\b\{?\}?/g, "ø").replace(/\\O\b\{?\}?/g, "Ø").replace(/\\l\b\{?\}?/g, "ł").replace(/\\L\b\{?\}?/g, "Ł")
    .replace(/\\textbackslash\{\}/g, "\\").replace(/\\(?:textit|emph|textbf|textsc|textrm|texttt|mkbibquote|url)\{([^{}]*)\}/g, "$1")
    .replace(/\\([&%$#_{}])/g, "$1").replace(/---/g, "—").replace(/--/g, "–").replace(/``|''/g, '"').replace(/~/g, " ")
    .replace(/[{}]/g, "").replace(/\s+/g, " ").trim();
  return t.normalize("NFC");
}
function splitTop(s, sep) { const out = []; let d = 0, cur = ""; const re = new RegExp(`^${sep}`, "i"); for (let i = 0; i < s.length; i++) { const c = s[i]; if (c === "{") d++; else if (c === "}") d--; if (d === 0) { const m = re.exec(s.slice(i)); if (m) { out.push(cur); cur = ""; i += m[0].length - 1; continue; } } cur += c; } out.push(cur); return out.map(x => x.trim()).filter(Boolean); }
function parseNames(s) {
  if (!s) return [];
  return splitTop(s, "\\s+and\\s+").map(raw => {
    if (/^\{.*\}$/.test(raw) && !/\}\s*,/.test(raw)) return { literal: texText(raw) };
    const parts = splitTop(raw, ",");
    if (parts.length >= 2) return { family: texText(parts[0]), given: texText(parts.slice(-1)[0]), suffix: parts.length === 3 ? texText(parts[1]) : "" };
    const words = splitTop(raw, "\\s+"); if (words.length === 1) return { family: texText(words[0]), given: "" };
    let f = words.length - 1; while (f > 0 && /^[a-z]/.test(words[f - 1])) f--;
    return { family: texText(words.slice(f).join(" ")), given: texText(words.slice(0, f).join(" ")) };
  });
}
const nameToBib = n => n.literal ? `{${n.literal}}` : n.given ? `${n.family}, ${n.given}` : n.family;
const initials = g => (g || "").split(/\s+/).filter(Boolean).map(w => w.split("-").map(p => p[0] ? p[0].toUpperCase() + "." : "").join("-")).join(" ");
const familyOf = n => n.literal || n.family || "";

/* ---------- reference model ---------- */
const REF_TYPES = [
  ["article", "Journal article", ["journal", "volume", "number", "pages", "doi", "url"]],
  ["book", "Book", ["publisher", "address", "edition", "isbn", "doi", "url"]],
  ["incollection", "Book chapter", ["editor", "booktitle", "publisher", "pages", "doi", "url"]],
  ["inproceedings", "Conference paper", ["booktitle", "publisher", "pages", "doi", "url"]],
  ["techreport", "Report", ["institution", "number", "url"]],
  ["phdthesis", "PhD thesis", ["school", "url"]],
  ["mastersthesis", "Master's thesis", ["school", "url"]],
  ["online", "Website", ["howpublished", "url", "urldate"]],
  ["jurisdiction", "Court case", ["volume", "journal", "pages", "institution", "url"]],
  ["legislation", "Statute or law", ["volume", "journal", "pages", "url"]],
  ["misc", "Other", ["howpublished", "publisher", "url"]]
];
const TYPE_LABEL = { jurisdiction: { volume: "Reporter volume", journal: "Reporter (e.g. U.S., F.3d)", pages: "First page", institution: "Court (e.g. 9th Cir.; leave empty for the Supreme Court)" }, legislation: { volume: "Title number", journal: "Code (e.g. U.S.C.)", pages: "Section", title: "Name of act" } };
const fieldLabel = (t, k) => (TYPE_LABEL[t] || {})[k] || FIELD_LABEL[k] || k;
const FIELD_LABEL = { journal: "Journal", volume: "Volume", number: "Issue / number", pages: "Pages", doi: "DOI", url: "URL", publisher: "Publisher", address: "Place published", edition: "Edition", isbn: "ISBN", editor: "Editors (one per line)", booktitle: "Book or proceedings title", institution: "Institution", school: "University", howpublished: "Site or publisher", urldate: "Accessed (YYYY-MM-DD)" };
const typeName = t => (REF_TYPES.find(x => x[0] === t) || [t, t.charAt(0).toUpperCase() + t.slice(1)])[1];
function refView(e) {
  const f = e.fields, authors = parseNames(f.author), editors = parseNames(f.editor);
  const year = (f.year || (f.date || "").slice(0, 4) || "").replace(/[^\d]/g, "").slice(0, 4);
  return { ...e, authors, editors, year, title: texText(f.title), container: texText(f.journal || f.booktitle || f.howpublished || ""), publisher: texText(f.publisher || f.institution || f.school || f.organization || ""), doi: (f.doi || "").replace(/^https?:\/\/(dx\.)?doi\.org\//i, ""), url: f.url || "" };
}
function bibFiles(p) { return Object.keys(p.working).filter(x => extOf(x) === "bib").sort(); }
function refLibrary(p, file) { const f = p.working[file]; return f ? parseBib(f.text).map(refView) : []; }
function allRefKeys(p) { const s = new Set(); for (const b of bibFiles(p)) for (const e of parseBib(p.working[b].text)) s.add(e.key); return s; }

/* ---------- citations in the manuscript ---------- */
const TEX_CITE = /\\(?:no|auto|paren|text|foot|super)?cite(?:p|t|alp|alt|author|year|yearpar)?\*?(?:\[[^\]]*\]){0,2}\{([^}]*)\}/g;
function citationsIn(p) {
  const uses = {};
  for (const [path, f] of Object.entries(p.working)) {
    const ext = extOf(path); if (!["tex", "md", "markdown", "txt"].includes(ext)) continue;
    f.text.split("\n").forEach((line, li) => {
      const add = k => { k = k.trim(); if (!k || k === "*") return; (uses[k] = uses[k] || []).push({ path, line: li + 1 }); };
      if (ext === "tex") { let m; TEX_CITE.lastIndex = 0; while ((m = TEX_CITE.exec(line))) m[1].split(",").forEach(add); }
      else { const re = /(?:^|[\s\[;(-])@([A-Za-z0-9_][\w:.#$%&+?<>~\/-]*[A-Za-z0-9_])/g; let m; while ((m = re.exec(line))) add(m[1]); }
    });
  }
  return uses;
}
function makeKey(fields, taken) {
  const a = parseNames(fields.author)[0], fam = a ? familyOf(a) : "ref";
  const word = (texText(fields.title).toLowerCase().split(/\s+/).find(w => w.length > 3 && !/^(the|and|with|from|into|that|this|what|when|about)$/.test(w)) || "").replace(/[^a-z0-9]/g, "");
  const base = (fam.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "") || "ref") + (fields.year || "").replace(/\D/g, "").slice(0, 4) + word;
  let k = base, n = 0; while (taken.has(k)) k = base + String.fromCharCode(97 + n++);
  return k;
}

/* ---------- RIS / CSL-JSON / DOI ---------- */
const RIS_TYPE = { JOUR: "article", MGZN: "article", NEWS: "article", BOOK: "book", EBOOK: "book", CHAP: "incollection", ECHAP: "incollection", CONF: "inproceedings", CPAPER: "inproceedings", RPRT: "techreport", THES: "phdthesis", ELEC: "online", WEB: "online", BLOG: "online", GEN: "misc" };
function risToFields(text) {
  const out = []; let cur = null;
  for (const raw of text.replace(/\r\n?/g, "\n").split("\n")) {
    const m = /^([A-Z][A-Z0-9])  - ?(.*)$/.exec(raw); if (!m) continue;
    const [, tag, val] = m, v = val.trim();
    if (tag === "TY") { cur = { type: RIS_TYPE[v] || "misc", f: { author: [], editor: [], keywords: [] } }; continue; }
    if (!cur) continue;
    if (tag === "ER") { const f = cur.f; f.author = f.author.join(" and "); f.editor = f.editor.join(" and "); f.keywords = f.keywords.join(", "); if (f.sp) { f.pages = f.ep ? `${f.sp}--${f.ep}` : f.sp; } delete f.sp; delete f.ep; out.push({ type: cur.type, fields: f }); cur = null; continue; }
    const f = cur.f;
    if (tag === "AU" || tag === "A1") f.author.push(v); else if (tag === "A2" || tag === "ED") f.editor.push(v);
    else if (tag === "TI" || tag === "T1") f.title = v; else if (tag === "T2" || tag === "JO" || tag === "JF" || tag === "BT") { if (["incollection", "inproceedings"].includes(cur.type)) f.booktitle = v; else f.journal = f.journal || v; }
    else if (tag === "PY" || tag === "Y1" || tag === "DA") f.year = f.year || (v.match(/\d{4}/) || [""])[0];
    else if (tag === "VL") f.volume = v; else if (tag === "IS") f.number = v; else if (tag === "SP") f.sp = v; else if (tag === "EP") f.ep = v;
    else if (tag === "DO") f.doi = v; else if (tag === "UR") f.url = f.url || v; else if (tag === "PB") f.publisher = v; else if (tag === "CY") f.address = v;
    else if (tag === "SN") f.isbn = v; else if (tag === "KW") f.keywords.push(v); else if (tag === "AB" || tag === "N2") f.abstract = v; else if (tag === "N1") f.note = v;
  }
  return out.map(r => ({ type: r.type, fields: Object.fromEntries(Object.entries(r.fields).filter(([, v]) => v).map(([k, v]) => [k, ["author", "editor"].includes(k) ? v.split(" and ").map(x => x.replace(/[{}]/g, "")).join(" and ") : bibEscape(v)])) }));
}
const CSL_TYPE = { "article-journal": "article", "article-magazine": "article", "article-newspaper": "article", article: "article", book: "book", chapter: "incollection", "paper-conference": "inproceedings", report: "techreport", thesis: "phdthesis", webpage: "online", "post-weblog": "online", dataset: "misc" };
function cslToFields(items) {
  return (Array.isArray(items) ? items : [items]).map(it => {
    const t = CSL_TYPE[it.type] || "misc", names = a => (a || []).map(n => n.literal ? `{${n.literal}}` : n.given ? `${n.family}, ${n.given}` : n.family).join(" and ");
    const dp = (it.issued && it.issued["date-parts"] && it.issued["date-parts"][0]) || [];
    const f = { author: names(it.author), editor: names(it.editor), title: bibEscape(it.title), year: dp[0] ? String(dp[0]) : "", volume: it.volume, number: it.issue || it.number, pages: (it.page || "").replace(/-/g, "--"), doi: it.DOI, url: it.URL, publisher: bibEscape(it.publisher), address: bibEscape(it["publisher-place"]), isbn: Array.isArray(it.ISBN) ? it.ISBN[0] : it.ISBN, abstract: bibEscape(it.abstract) };
    const ct = bibEscape(Array.isArray(it["container-title"]) ? it["container-title"][0] : it["container-title"]);
    if (t === "article") f.journal = ct; else if (["incollection", "inproceedings"].includes(t)) f.booktitle = ct; else if (t === "online") f.howpublished = ct;
    if (t === "phdthesis") f.school = f.publisher, delete f.publisher; if (t === "techreport") f.institution = f.publisher, delete f.publisher;
    return { type: t, fields: Object.fromEntries(Object.entries(f).filter(([, v]) => v != null && v !== "")), key: it["citation-key"] || (it.id && /^[A-Za-z][\w:-]*$/.test(String(it.id)) ? String(it.id) : "") };
  });
}
function refToCsl(r) {
  const inv = Object.fromEntries(Object.entries(CSL_TYPE).map(([a, b]) => [b, a]));
  const nm = list => list.map(n => n.literal ? { literal: n.literal } : { family: n.family, given: n.given });
  const o = { id: r.key, "citation-key": r.key, type: inv[r.type] || "document", title: r.title, author: nm(r.authors) };
  if (r.editors.length) o.editor = nm(r.editors); if (r.year) o.issued = { "date-parts": [[+r.year]] }; if (r.container) o["container-title"] = r.container;
  const f = r.fields; if (f.volume) o.volume = texText(f.volume); if (f.number) o.issue = texText(f.number); if (f.pages) o.page = texText(f.pages); if (r.doi) o.DOI = r.doi; if (r.url) o.URL = r.url; if (r.publisher) o.publisher = r.publisher; if (f.address) o["publisher-place"] = texText(f.address); if (f.isbn) o.ISBN = f.isbn; if (f.abstract) o.abstract = texText(f.abstract);
  return o;
}
function refToRis(r) {
  const inv = { article: "JOUR", book: "BOOK", incollection: "CHAP", inproceedings: "CPAPER", techreport: "RPRT", phdthesis: "THES", mastersthesis: "THES", online: "ELEC", misc: "GEN" };
  const L = [`TY  - ${inv[r.type] || "GEN"}`]; const f = r.fields;
  r.authors.forEach(n => L.push(`AU  - ${n.literal || (n.given ? n.family + ", " + n.given : n.family)}`)); r.editors.forEach(n => L.push(`A2  - ${n.literal || (n.given ? n.family + ", " + n.given : n.family)}`));
  if (r.title) L.push(`TI  - ${r.title}`); if (r.container) L.push(`${r.type === "article" ? "JO" : "T2"}  - ${r.container}`); if (r.year) L.push(`PY  - ${r.year}`);
  if (f.volume) L.push(`VL  - ${texText(f.volume)}`); if (f.number) L.push(`IS  - ${texText(f.number)}`);
  if (f.pages) { const [a, b] = texText(f.pages).split(/[–-]+/); L.push(`SP  - ${a}`); if (b) L.push(`EP  - ${b}`); }
  if (r.publisher) L.push(`PB  - ${r.publisher}`); if (f.address) L.push(`CY  - ${texText(f.address)}`); if (r.doi) L.push(`DO  - ${r.doi}`); if (r.url) L.push(`UR  - ${r.url}`); if (f.isbn) L.push(`SN  - ${f.isbn}`);
  if (f.keywords) texText(f.keywords).split(/\s*[,;]\s*/).filter(Boolean).forEach(k => L.push(`KW  - ${k}`)); if (f.abstract) L.push(`AB  - ${texText(f.abstract)}`);
  L.push(`ID  - ${r.key}`, "ER  - "); return L.join("\n");
}
async function lookupDoi(doi) {
  const d = doi.trim().replace(/^(https?:\/\/(dx\.)?doi\.org\/|doi:\s*)/i, "");
  if (!/^10\.\d{4,9}\/\S+$/.test(d)) throw new Error("That doesn't look like a DOI. It should start with 10., like 10.1000/xyz123.");
  let res;
  try { res = await fetch("https://doi.org/" + d.split("/").map(encodeURIComponent).join("/").replace("%2F", "/"), { headers: { Accept: "application/vnd.citationstyles.csl+json" } }); }
  catch (e) { throw new Error(inClaudeViewer() ? "DOI lookup works on your hosted Writer's Box site, not inside Claude's preview. Paste BibTeX instead." : "Couldn't reach doi.org. Check your connection."); }
  if (res.status === 404) throw new Error("No record found for that DOI.");
  if (!res.ok) throw new Error("doi.org couldn't look that up (error " + res.status + ").");
  return cslToFields(await res.json())[0];
}

/* ---------- formatted references ---------- */
const STYLES = { apa: "APA 7", chicago: "Chicago (author-date)", mla: "MLA 9", bluebook: "Bluebook (legal)" };
function nameList(list, style) {
  if (!list.length) return "";
  const inv = (n, first) => n.literal ? n.literal : style === "apa" ? `${n.family}, ${initials(n.given)}`.replace(/, $/, "") : first ? (n.given ? `${n.family}, ${n.given}` : n.family) : (n.given ? `${n.given} ${n.family}` : n.family);
  if (style === "apa") { const a = list.map(n => inv(n)); if (a.length === 1) return a[0]; if (a.length <= 20) return a.slice(0, -1).join(", ") + ", & " + a.at(-1); return a.slice(0, 19).join(", ") + ", … " + a.at(-1); }
  if (style === "mla") { if (list.length === 1) return inv(list[0], true); if (list.length === 2) return `${inv(list[0], true)}, and ${inv(list[1], false)}`; return `${inv(list[0], true)}, et al.`; }
  const a = list.map((n, i) => inv(n, i === 0)); if (a.length === 1) return a[0]; if (a.length <= 10) return a.slice(0, -1).join(", ") + ", and " + a.at(-1); return a.slice(0, 7).join(", ") + ", et al.";
}
const endDot = s => s && !/[.?!]$/.test(s) ? s + "." : s;
const itDot = s => `*${s}*` + (/[.?!]$/.test(s) ? "" : ".");
function formatRef(r, style = "apa") {
  const f = r.fields, pages = texText(f.pages || "").replace(/--?/g, "–"), vol = texText(f.volume || ""), num = texText(f.number || ""), ed = texText(f.edition || "");
  const link = r.doi ? `https://doi.org/${r.doi}` : r.url, au = nameList(r.authors, style) || r.publisher || r.title, yr = r.year || "n.d.", t = r.title;
  const eds = nameList(r.editors, style === "apa" ? "chicago" : style);
  if (style === "apa") {
    const head = `${endDot(au)} (${yr}).`;
    switch (r.type) {
      case "article": return [head, endDot(t), `*${r.container}*${vol ? `, *${vol}*` : ""}${num ? `(${num})` : ""}${pages ? `, ${pages}` : ""}.`, link].filter(Boolean).join(" ");
      case "book": return [head, `*${t}*${ed ? ` (${ed} ed.)` : ""}.`, r.publisher ? endDot(r.publisher) : "", link].filter(Boolean).join(" ");
      case "incollection": return [head, endDot(t), `In ${eds ? eds + (r.editors.length > 1 ? " (Eds.), " : " (Ed.), ") : ""}*${r.container}*${pages ? ` (pp. ${pages})` : ""}.`, r.publisher ? endDot(r.publisher) : "", link].filter(Boolean).join(" ");
      case "inproceedings": return [head, endDot(t), `In *${r.container}*${pages ? ` (pp. ${pages})` : ""}.`, r.publisher ? endDot(r.publisher) : "", link].filter(Boolean).join(" ");
      case "techreport": return [head, `*${t}*${num ? ` (Report No. ${num})` : ""}.`, r.publisher ? endDot(r.publisher) : "", link].filter(Boolean).join(" ");
      case "phdthesis": case "mastersthesis": return [head, `*${t}* [${r.type === "phdthesis" ? "Doctoral dissertation" : "Master's thesis"}${r.publisher ? ", " + r.publisher : ""}].`, link].filter(Boolean).join(" ");
      default: return [head, `*${t}*.`, r.container || r.publisher ? endDot(r.container || r.publisher) : "", link].filter(Boolean).join(" ");
    }
  }
  if (style === "chicago") {
    const head = `${endDot(au)} ${yr}.`;
    switch (r.type) {
      case "article": return [head, `“${endDot(t)}”`, `*${r.container}*${vol ? ` ${vol}` : ""}${num ? ` (${num})` : ""}${pages ? `: ${pages}` : ""}.`, link ? endDot(link) : ""].filter(Boolean).join(" ");
      case "book": return [head, itDot(t), f.address || r.publisher ? endDot([texText(f.address || ""), r.publisher].filter(Boolean).join(": ")) : "", link ? endDot(link) : ""].filter(Boolean).join(" ");
      case "incollection": case "inproceedings": return [head, `“${endDot(t)}”`, `In *${r.container}*${eds ? `, edited by ${eds}` : ""}${pages ? `, ${pages}` : ""}.`, r.publisher ? endDot(r.publisher) : "", link ? endDot(link) : ""].filter(Boolean).join(" ");
      default: return [head, r.type === "techreport" || r.type.includes("thesis") || r.type === "online" || r.type === "misc" ? itDot(t) : `“${endDot(t)}”`, r.container || r.publisher ? endDot(r.container || r.publisher) : "", link ? endDot(link) : ""].filter(Boolean).join(" ");
    }
  }
  if (style === "bluebook" || r.type === "jurisdiction" || r.type === "legislation") return bluebookRef(r);  // APA, MLA and Chicago all defer to Bluebook for legal sources
  const head = endDot(au);
  switch (r.type) {
    case "article": return [head, `“${endDot(t)}”`, `*${r.container}*${vol ? `, vol. ${vol}` : ""}${num ? `, no. ${num}` : ""}, ${yr}${pages ? `, pp. ${pages}` : ""}.`, link ? endDot(link) : ""].filter(Boolean).join(" ");
    case "book": return [head, itDot(t), `${r.publisher ? r.publisher + ", " : ""}${yr}.`, link ? endDot(link) : ""].filter(Boolean).join(" ");
    case "incollection": case "inproceedings": return [head, `“${endDot(t)}”`, `*${r.container}*${eds ? `, edited by ${eds}` : ""}, ${r.publisher ? r.publisher + ", " : ""}${yr}${pages ? `, pp. ${pages}` : ""}.`, link ? endDot(link) : ""].filter(Boolean).join(" ");
    default: return [head, itDot(t), `${r.container || r.publisher ? (r.container || r.publisher) + ", " : ""}${yr}.`, link ? endDot(link) : ""].filter(Boolean).join(" ");
  }
}
/* Bluebook full citation (law review footnote form, italics in place of small capitals) */
function bbAuthors(list) { const n = list.map(a => a.literal || [a.given, a.family].filter(Boolean).join(" ")); return n.length <= 2 ? n.join(" & ") : n[0] + " et al."; }
function bluebookRef(r, pin) {
  const f = r.fields, vol = texText(f.volume || ""), pg = texText(f.pages || "").split(/[-–]/)[0], yr = r.year || "", at = pin ? `, ${pin}` : "";
  switch (r.type) {
    case "jurisdiction": { const court = texText(f.institution || ""); return `*${r.title}*, ${vol} ${texText(f.journal || "")} ${pg}${at} (${court ? court + " " : ""}${yr}).`.replace(/\s+/g, " "); }
    case "legislation": return `${r.title}, ${vol} ${texText(f.journal || "")} § ${texText(f.pages || "")}${yr ? ` (${yr})` : ""}.`.replace(/\s+/g, " ");
    case "article": return `${bbAuthors(r.authors)}, *${r.title}*, ${vol} ${r.container} ${pg}${at} (${yr}).`.replace(/^, /, "").replace(/\s+/g, " ");
    case "book": return `${bbAuthors(r.authors)}, *${r.title}*${at ? " " + pin : ""} (${texText(f.edition || "") ? texText(f.edition) + " ed. " : ""}${yr}).`.replace(/^, /, "");
    case "incollection": return `${bbAuthors(r.authors)}, *${r.title}*, in ${r.container}${at ? " " + pin : ""} (${r.editors.length ? bbAuthors(r.editors) + " ed., " : ""}${yr}).`.replace(/^, /, "");
    default: { const link = r.doi ? `https://doi.org/${r.doi}` : r.url; return `${r.authors.length ? bbAuthors(r.authors) + ", " : ""}*${r.title}*${r.container || r.publisher ? ", " + (r.container || r.publisher) : ""}${yr ? ` (${yr})` : ""}${link ? ", " + link : ""}.`; }
  }
}
/* Chicago notes-bibliography: full first note */
function chicagoNote(r, pin) {
  const f = r.fields, names = r.authors.map(a => a.literal || [a.given, a.family].filter(Boolean).join(" ")), au = names.length <= 2 ? names.join(" and ") : names.length === 3 ? `${names[0]}, ${names[1]}, and ${names[2]}` : names[0] + " et al.";
  const yr = r.year || "n.d.", pg = pin ? `, ${pin}` : "", link = r.doi ? `https://doi.org/${r.doi}` : r.url;
  switch (r.type) {
    case "article": return `${au ? au + ", " : ""}“${r.title},” *${r.container}*${f.volume ? " " + texText(f.volume) : ""}${f.number ? ", no. " + texText(f.number) : ""} (${yr})${pin ? ": " + pin : ""}${link ? ", " + link : ""}.`;
    case "book": return `${au ? au + ", " : ""}*${r.title}* (${r.publisher ? r.publisher + ", " : ""}${yr})${pg}.`;
    case "incollection": case "inproceedings": return `${au ? au + ", " : ""}“${r.title},” in *${r.container}*${r.editors.length ? ", ed. " + r.editors.map(a => [a.given, a.family].filter(Boolean).join(" ")).join(" and ") : ""} (${r.publisher ? r.publisher + ", " : ""}${yr})${pg}.`;
    case "jurisdiction": case "legislation": return bluebookRef(r, pin);
    default: return `${au ? au + ", " : ""}*${r.title}*${r.container || r.publisher ? ", " + (r.container || r.publisher) : ""}, ${yr}${pg}${link ? ", " + link : ""}.`;
  }
}
const shortTitle = t => { const w = t.replace(/[:.].*$/, "").split(/\s+/); return w.length > 4 ? w.slice(0, 4).join(" ") : w.join(" "); };
const refHtml = s => esc(s).replace(/\*([^*]+)\*/g, "<em>$1</em>").replace(/(https?:\/\/[^\s<]+[^\s<.,;])/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
function inTextCite(r, style = "apa") {
  if (style === "bluebook") return r.type === "jurisdiction" ? `*${r.title}*` : (r.authors[0] ? familyOf(r.authors[0]) + ", " : "") + `*${shortTitle(r.title)}*`;
  const a = r.authors, fam = a.map(familyOf);
  const who = !a.length ? (r.title.split(/\s+/).slice(0, 3).join(" ")) : a.length === 1 ? fam[0] : a.length === 2 ? `${fam[0]} ${style === "apa" ? "&" : "and"} ${fam[1]}` : `${fam[0]} et al.`;
  return style === "mla" ? `(${who})` : `(${who}${style === "apa" ? "," : ""} ${r.year || "n.d."})`;
}
const sortRefs = list => [...list].sort((x, y) => (familyOf(x.authors[0] || { family: x.title }) || "").localeCompare(familyOf(y.authors[0] || { family: y.title }) || "") || (x.year || "").localeCompare(y.year || ""));

/* ---------- writing changes back into the .bib file ---------- */
function bibTarget(p) {
  const files = bibFiles(p);
  if (S.refFile && files.includes(S.refFile)) return S.refFile;
  return files[0] || null;
}
function ensureBib(p) { let f = bibTarget(p); if (!f) { f = "references.bib"; p.working[f] = { text: "", orig: null }; } S.refFile = f; return f; }
function replaceEntry(p, file, oldEntry, newEntry) {
  const t = p.working[file].text;
  if (oldEntry && !newEntry) { let a = oldEntry.start, b = oldEntry.end; while (b < t.length && t[b] === "\n") b++; p.working[file].text = (t.slice(0, a) + t.slice(b)).replace(/\n{3,}/g, "\n\n"); return; }
  const src = entryToBib(newEntry);
  p.working[file].text = oldEntry ? t.slice(0, oldEntry.start) + src + t.slice(oldEntry.end) : (t.replace(/\s*$/, "") + (t.trim() ? "\n\n" : "") + src + "\n");
}
function addReferences(p, items) {
  const file = ensureBib(p), existing = refLibrary(p, file), taken = allRefKeys(p);
  const norm = s => texText(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  let added = 0, dup = 0; const keys = [];
  for (const it of items) {
    const doi = (it.fields.doi || "").toLowerCase();
    const isDup = existing.some(e => (doi && e.doi.toLowerCase() === doi) || (norm(e.fields.title) && norm(e.fields.title) === norm(it.fields.title) && e.year === (it.fields.year || "").slice(0, 4)));
    if (isDup) { dup++; continue; }
    let key = it.key && /^[A-Za-z0-9_:.\-]+$/.test(it.key) ? it.key : makeKey(it.fields, taken);
    if (taken.has(key)) key = makeKey({ ...it.fields }, taken);
    taken.add(key); keys.push(key);
    replaceEntry(p, file, null, { type: it.type, key, fields: it.fields });
    added++;
  }
  return { file, added, dup, keys };
}

/* ============ References UI ============ */
function refCount(p) { try { return bibFiles(p).reduce((n, f) => n + refLibrary(p, f).length, 0); } catch (e) { return 0; } }
function viewRefs(p, el) {
  const files = bibFiles(p), file = bibTarget(p), all = file ? refLibrary(p, file) : [];
  const uses = citationsIn(p), keys = allRefKeys(p);
  const missing = Object.keys(uses).filter(k => !keys.has(k)), unused = all.filter(r => !uses[r.key]);
  const q = (S.refQ || "").toLowerCase(), type = S.refType || "", cited = S.refCited || "", sort = S.refSort || "author", style = S.refStyle || "apa";
  let list = all.filter(r => (!type || r.type === type) && (!cited || (cited === "yes" ? !!uses[r.key] : !uses[r.key])) &&
    (!q || [r.key, r.title, r.container, r.year, r.publisher, ...r.authors.map(a => familyOf(a) + " " + (a.given || "")), texText(r.fields.keywords || "")].join(" ").toLowerCase().includes(q)));
  if (sort === "author") list = sortRefs(list); else if (sort === "year") list.sort((a, b) => (b.year || "").localeCompare(a.year || "")); else if (sort === "title") list.sort((a, b) => a.title.localeCompare(b.title)); else list.reverse();
  const types = [...new Set(all.map(r => r.type))];
  el.innerHTML = `<div class="subhead"><h2>References</h2>
      <button class="btn" id="rf-import">${ic("import")} Import</button><button class="btn" id="rf-export" ${all.length ? "" : "disabled"}>${ic("download")} Export</button><button class="btn btn-primary" id="rf-add">${ic("plus")} Add reference</button></div>
    ${missing.length ? `<div class="flash">${ic("alert")}<span><strong>${missing.length} citation${missing.length > 1 ? "s" : ""}</strong> in your writing ${missing.length > 1 ? "aren't" : "isn't"} in your references: ${missing.slice(0, 6).map(k => `<button class="link mono" data-miss="${esc(k)}" title="Add this reference">${esc(k)}</button>`).join(", ")}${missing.length > 6 ? "…" : ""}</span><span class="grow"></span><span class="muted" style="font-size:12px">${missing.slice(0, 1).map(k => `in ${esc(uses[k][0].path)}, line ${uses[k][0].line}`).join("")}</span></div>` : ""}
    ${!file ? `<div class="Box blankslate">${ic("quote")}<h3>No reference library yet</h3><p class="muted" style="max-width:540px">Add references one by one, look them up by DOI, or import a BibTeX, RIS or CSL-JSON file from Zotero, Mendeley or EndNote. They're kept in a <span class="mono">references.bib</span> file, so they're versioned with your writing and work directly with LaTeX.</p><div class="row" style="justify-content:center"><button class="btn btn-primary" data-empty="add">Add a reference</button><button class="btn" data-empty="doi">Look up a DOI</button><button class="btn" data-empty="import">Import a file</button></div></div>` : `
    <div class="Box">
      <div class="Box-header rf-bar">
        ${files.length > 1 ? `<label class="sr" for="rf-file">Library file</label><select class="btn btn-sm" id="rf-file">${files.map(f => `<option ${f === file ? "selected" : ""}>${esc(f)}</option>`).join("")}</select>` : `<span class="mono" style="font-size:12px">${fileIcon(file)} ${esc(file)}</span>`}
        <label class="sr" for="rf-q">Search references</label><input type="text" id="rf-q" placeholder="Search author, title, year, keyword…" value="${esc(S.refQ || "")}">
        <select class="btn btn-sm" id="rf-type" aria-label="Type"><option value="">All types</option>${types.map(t => `<option value="${t}" ${t === type ? "selected" : ""}>${esc(typeName(t))}</option>`).join("")}</select>
        <select class="btn btn-sm" id="rf-cited" aria-label="Cited"><option value="">Cited or not</option><option value="yes" ${cited === "yes" ? "selected" : ""}>Cited</option><option value="no" ${cited === "no" ? "selected" : ""}>Not cited (${unused.length})</option></select>
        <select class="btn btn-sm" id="rf-sort" aria-label="Sort"><option value="author" ${sort === "author" ? "selected" : ""}>Sort: author</option><option value="year" ${sort === "year" ? "selected" : ""}>Sort: newest</option><option value="title" ${sort === "title" ? "selected" : ""}>Sort: title</option><option value="added" ${sort === "added" ? "selected" : ""}>Sort: recently added</option></select>
        <select class="btn btn-sm" id="rf-style" aria-label="Citation style">${Object.entries(STYLES).map(([k, v]) => `<option value="${k}" ${k === style ? "selected" : ""}>${v}</option>`).join("")}</select>
      </div>
      <div class="Box-row muted" style="font-size:12px">${list.length === all.length ? `${all.length} reference${all.length === 1 ? "" : "s"}` : `${list.length} of ${all.length} references`} · ${Object.keys(uses).filter(k => keys.has(k)).length} cited in your writing${fileStatus(p, file) !== "clean" ? ` · <span class="label label-attention">Unsaved changes</span> <button class="link" data-save>Save version</button>` : ""}</div>
      ${list.map(r => refRow(p, r, uses[r.key], style)).join("") || `<div class="Box-body muted">No references match.</div>`}
    </div>`}`;
  const rerender = () => viewRefs(p, el);
  const bind = (id, k) => { const x = $("#" + id); if (x) x.onchange = e => { S[k] = e.target.value; rerender(); }; };
  bind("rf-type", "refType"); bind("rf-cited", "refCited"); bind("rf-sort", "refSort"); bind("rf-style", "refStyle"); bind("rf-file", "refFile");
  const qi = $("#rf-q"); if (qi) { qi.oninput = e => { S.refQ = e.target.value; clearTimeout(qi._t); qi._t = setTimeout(() => { rerender(); const n = $("#rf-q"); if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }, 200); }; }
  $("#rf-add").onclick = () => editRefFlow(p, null, rerender);
  $("#rf-import").onclick = () => importRefsFlow(p, rerender);
  $("#rf-export").onclick = () => exportRefsFlow(p);
  el.querySelectorAll("[data-empty]").forEach(b => b.onclick = () => b.dataset.empty === "add" ? editRefFlow(p, null, rerender) : importRefsFlow(p, rerender, b.dataset.empty === "doi" ? "doi" : "file"));
  el.querySelectorAll("[data-miss]").forEach(b => b.onclick = () => editRefFlow(p, null, rerender, b.dataset.miss));
  el.querySelectorAll("[data-save]").forEach(b => b.onclick = saveFlow);
  el.querySelectorAll("[data-rk]").forEach(row => {
    const r = all.find(x => x.key === row.dataset.rk);
    row.querySelector("[data-toggle]").onclick = () => { S.refOpen = S.refOpen === r.key ? null : r.key; rerender(); };
    const ed = row.querySelector("[data-edit]"); if (ed) ed.onclick = () => editRefFlow(p, r, rerender);
    const dl = row.querySelector("[data-del]"); if (dl) dl.onclick = async () => { if (!await confirmBox(`Delete ${r.key}?`, uses[r.key] ? `It's cited ${uses[r.key].length} time${uses[r.key].length > 1 ? "s" : ""} in your writing; those citations will show as missing.` : "It isn't cited anywhere.", "Delete reference", true)) return; replaceEntry(p, file, r, null); persist(p, true); render(); toast(`Deleted ${r.key}. Save a version to keep the change.`); };
    const cp = row.querySelector("[data-copy]"); if (cp) cp.onclick = async () => { const txt = formatRef(r, style).replace(/\*/g, ""); try { await navigator.clipboard.writeText(txt); toast("Copied the formatted reference."); } catch (e) { toast("Select the text to copy it."); } };
    row.querySelectorAll("[data-goto]").forEach(b => b.onclick = () => go("file", { file: b.dataset.goto, fileMode: "write" }));
  });
}
function refRow(p, r, use, style) {
  const open = S.refOpen === r.key, auth = r.authors.length ? r.authors.slice(0, 3).map(a => a.literal || [a.given, a.family].filter(Boolean).join(" ")).join(", ") + (r.authors.length > 3 ? ` +${r.authors.length - 3}` : "") : "No author";
  const shown = Object.entries(r.fields).filter(([k]) => !["abstract"].includes(k));
  return `<div class="Box-row rf-row ${open ? "open" : ""}" data-rk="${esc(r.key)}"><div class="grow" style="min-width:0">
      <div class="row" style="gap:8px;flex-wrap:nowrap"><button class="link rf-title" data-toggle aria-expanded="${open}">${esc(r.title || "(untitled)")}</button></div>
      <div class="muted rf-meta">${esc(auth)}${r.year ? ` · ${esc(r.year)}` : ""}${r.container ? ` · <em>${esc(r.container)}</em>` : r.publisher ? ` · ${esc(r.publisher)}` : ""}</div>
      ${open ? `<div class="rf-detail">
        <div class="rf-formatted">${refHtml(formatRef(r, style))}</div>
        <div class="rf-intext muted">In text: ${esc(inTextCite(r, style))} · LaTeX: <span class="mono">\\cite{${esc(r.key)}}</span> · Markdown: <span class="mono">[@${esc(r.key)}]</span></div>
        <table class="rf-fields"><tbody>${shown.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${k === "doi" ? `<a href="https://doi.org/${esc(r.doi)}" target="_blank" rel="noopener">${esc(v)}</a>` : k === "url" ? `<a href="${esc(v)}" target="_blank" rel="noopener">${esc(v)}</a>` : esc(texText(v))}</td></tr>`).join("")}</tbody></table>
        ${r.fields.abstract ? `<details><summary class="muted">Abstract</summary><p>${esc(texText(r.fields.abstract))}</p></details>` : ""}
        <div class="rf-uses">${use ? `<strong>Cited in</strong> ${[...new Set(use.map(u => u.path))].map(path => `<button class="link" data-goto="${esc(path)}">${esc(path)}</button> <span class="muted">(line${use.filter(u => u.path === path).length > 1 ? "s" : ""} ${use.filter(u => u.path === path).map(u => u.line).join(", ")})</span>`).join(" · ")}` : `<span class="muted">Not cited in your writing yet.</span>`}</div>
        <div class="row" style="margin-top:8px"><button class="btn btn-sm" data-edit>${ic("pencil")} Edit</button><button class="btn btn-sm" data-copy>Copy formatted</button><span class="grow"></span><button class="btn btn-sm btn-danger" data-del>${ic("trash")} Delete</button></div></div>` : ""}
    </div>
    <span class="label">${esc(typeName(r.type))}</span><span class="branch-name rf-key">${esc(r.key)}</span>
    ${use ? `<span class="label label-success" title="${use.length} citation${use.length > 1 ? "s" : ""}">Cited ${use.length}×</span>` : `<span class="label">Not cited</span>`}
    ${open ? "" : `<button class="btn-octicon" data-edit title="Edit" aria-label="Edit ${esc(r.key)}">${ic("pencil")}</button>`}</div>`;
}
function editRefFlow(p, r, after, presetKey) {
  const isNew = !r, f = r ? r.fields : {};
  let type = r ? r.type : "article";
  const fieldsFor = t => (REF_TYPES.find(x => x[0] === t) || REF_TYPES.at(-1))[2];
  const known = new Set(["author", "title", "year", "keywords", "note", "abstract", ...REF_TYPES.flatMap(x => x[2])]);
  const extra = Object.entries(f).filter(([k]) => !known.has(k)).map(([k, v]) => `${k} = ${v}`).join("\n");
  const namesText = s => parseNames(s).map(n => n.literal ? n.literal : n.given ? `${n.family}, ${n.given}` : n.family).join("\n");
  const typeFields = t => fieldsFor(t).map(k => k === "editor" ? `<label for="rf-editor">${fieldLabel(t, k)}<textarea class="form" id="rf-editor" rows="2" placeholder="Family, Given">${esc(namesText(f.editor))}</textarea></label>` : `<label for="rf-${k}">${fieldLabel(t, k)}<input type="text" id="rf-${k}" value="${esc(f[k] || "")}"></label>`).join("");
  modal({
    title: isNew ? "Add a reference" : `Edit ${r.key}`,
    body: `${isNew ? `<div class="row"><label for="rf-doi" style="flex:1">Fill in from a DOI <span class="muted" style="font-weight:400">(optional)</span><input type="text" id="rf-doi" placeholder="10.1000/xyz123 or https://doi.org/…"></label><button class="btn" id="rf-doi-go" style="align-self:flex-end">Look up</button></div>` : ""}
      <div class="rf-grid">
        <label for="rf-type-e">Type<select class="form" id="rf-type-e">${REF_TYPES.map(([k, n]) => `<option value="${k}" ${k === type ? "selected" : ""}>${n}</option>`).join("")}${REF_TYPES.some(x => x[0] === type) ? "" : `<option value="${esc(type)}" selected>${esc(type)}</option>`}</select></label>
        <label for="rf-key-e">Citation key<input type="text" id="rf-key-e" value="${esc(r ? r.key : presetKey || "")}" placeholder="Made from author and year if empty" style="font-family:var(--mono)"></label></div>
      <label for="rf-author">Authors <span class="muted" style="font-weight:400">(one per line: Family, Given — or an organization)</span><textarea class="form" id="rf-author" rows="3" placeholder="Langa, Sipho\nOrganisation for Economic Co-operation and Development">${esc(namesText(f.author))}</textarea></label>
      <label for="rf-title">Title<input type="text" id="rf-title" value="${esc(f.title || "")}"></label>
      <label for="rf-year" style="max-width:160px">Year<input type="text" id="rf-year" value="${esc(f.year || "")}" inputmode="numeric"></label>
      <div class="rf-grid" id="rf-typed">${typeFields(type)}</div>
      <details ${f.keywords || f.note || f.abstract || extra ? "open" : ""}><summary>More fields</summary>
        <label for="rf-keywords">Keywords <span class="muted" style="font-weight:400">(comma-separated)</span><input type="text" id="rf-keywords" value="${esc(f.keywords || "")}"></label>
        <label for="rf-note">Note<input type="text" id="rf-note" value="${esc(f.note || "")}"></label>
        <label for="rf-abstract">Abstract<textarea class="form" id="rf-abstract" rows="3">${esc(f.abstract || "")}</textarea></label>
        <label for="rf-extra">Other BibTeX fields <span class="muted" style="font-weight:400">(one per line: name = value)</span><textarea class="form" id="rf-extra" rows="2" style="font-family:var(--mono)">${esc(extra)}</textarea></label></details>
      <div><span class="side-h">Preview (${STYLES[S.refStyle || "apa"]})</span><div class="rf-formatted" id="rf-prev"></div></div>
      <p class="muted" id="rf-msg" style="font-size:12px">LaTeX in fields is fine, for example {\\"o} for ö or {DNA} to keep capitals.</p>`,
    onOpen: ov => {
      const read = () => {
        const o = { author: $("#rf-author", ov).value.split("\n").map(s => s.trim()).filter(Boolean).map(s => /,/.test(s) || s.split(/\s+/).length <= 3 ? s : `{${s}}`).join(" and "), title: $("#rf-title", ov).value.trim(), year: $("#rf-year", ov).value.trim() };
        for (const k of fieldsFor(type)) { const x = $("#rf-" + k, ov); if (x) o[k] = k === "editor" ? x.value.split("\n").map(s => s.trim()).filter(Boolean).join(" and ") : x.value.trim(); }
        for (const k of ["keywords", "note", "abstract"]) o[k] = $("#rf-" + k, ov).value.trim();
        for (const line of $("#rf-extra", ov).value.split("\n")) { const m = /^\s*([A-Za-z][\w:-]*)\s*=\s*(.+)$/.exec(line); if (m) o[m[1].toLowerCase()] = m[2].trim().replace(/^\{([\s\S]*)\}$/, "$1"); }
        return Object.fromEntries(Object.entries(o).filter(([, v]) => v));
      };
      const preview = () => { const fake = refView({ type, key: $("#rf-key-e", ov).value || "key", fields: read() }); $("#rf-prev", ov).innerHTML = fake.title || fake.authors.length ? refHtml(formatRef(fake, S.refStyle || "apa")) : `<span class="muted">Fill in a title and authors to see the formatted reference.</span>`; };
      ov._read = read;
      ov.addEventListener("input", preview);
      $("#rf-type-e", ov).onchange = e => { const cur = read(); type = e.target.value; Object.assign(f, cur); $("#rf-typed", ov).innerHTML = typeFields(type); preview(); };
      const go_ = $("#rf-doi-go", ov);
      if (go_) go_.onclick = async () => {
        const msg = $("#rf-msg", ov); msg.innerHTML = `<span class="spinner sm"></span> Looking up the DOI…`;
        try {
          const it = await lookupDoi($("#rf-doi", ov).value); type = it.type; Object.assign(f, it.fields);
          $("#rf-type-e", ov).value = REF_TYPES.some(x => x[0] === type) ? type : "misc"; $("#rf-author", ov).value = namesText(it.fields.author); $("#rf-title", ov).value = it.fields.title || ""; $("#rf-year", ov).value = it.fields.year || "";
          $("#rf-typed", ov).innerHTML = typeFields(type); if (it.fields.abstract) $("#rf-abstract", ov).value = it.fields.abstract;
          msg.textContent = "Filled in from doi.org. Check the details, then save."; preview();
        } catch (e) { msg.textContent = e.message; }
      };
      preview();
    },
    actions: [{ label: "Cancel" }, { label: isNew ? "Add reference" : "Save changes", primary: true, onClick: ov => {
      const fields = ov._read(), msg = $("#rf-msg", ov);
      if (!fields.title && !fields.author) { msg.textContent = "Add at least a title or an author."; return false; }
      const file = isNew ? ensureBib(p) : bibTarget(p), taken = allRefKeys(p); if (!isNew) taken.delete(r.key);
      let key = $("#rf-key-e", ov).value.trim();
      if (key && !/^[A-Za-z0-9_:.\-]+$/.test(key)) { msg.textContent = "Citation keys can use letters, numbers and _ : . - only."; return false; }
      if (key && taken.has(key)) { msg.textContent = `The key “${key}” is already used by another reference.`; return false; }
      if (!key) key = makeKey(fields, taken);
      replaceEntry(p, file, isNew ? null : r, { type, key, fields });
      persist(p, true); S.refOpen = key; render(); toast(`${isNew ? "Added" : "Updated"} ${key}. Save a version to keep the change.`); return true;
    } }]
  });
}
function importRefsFlow(p, after, start = "file") {
  let mode = start;
  modal({
    title: "Import references",
    body: `<div class="seg" role="group" aria-label="How to import"><button aria-pressed="${mode === "file"}" data-m="file">File</button><button aria-pressed="${mode === "paste"}" data-m="paste">Paste</button><button aria-pressed="${mode === "doi"}" data-m="doi">DOIs</button></div>
      <div data-pane="file" ${mode === "file" ? "" : "hidden"}><div class="dropzone" id="rf-drop">${ic("quote")}<strong>Drop a .bib, .ris or .json file</strong><span class="muted">From Zotero, Mendeley, EndNote, Google Scholar, Paperpile or another reference manager</span><label class="btn btn-sm" for="rf-in">Choose file</label><input type="file" id="rf-in" accept=".bib,.ris,.json,.txt" multiple hidden></div>
        <p class="muted" style="font-size:12px">Zotero: File › Export Library › BibTeX or RIS. Mendeley: File › Export › BibTeX. EndNote: File › Export › RIS.</p></div>
      <div data-pane="paste" ${mode === "paste" ? "" : "hidden"}><label for="rf-paste">Paste BibTeX, RIS or CSL-JSON<textarea class="form" id="rf-paste" rows="8" style="font-family:var(--mono);font-size:12px" placeholder="@article{smith2020,\n  author = {Smith, Jane},\n  title  = {…},\n  year   = {2020}\n}"></textarea></label></div>
      <div data-pane="doi" ${mode === "doi" ? "" : "hidden"}><label for="rf-dois">One DOI per line<textarea class="form" id="rf-dois" rows="5" style="font-family:var(--mono);font-size:12px" placeholder="10.1257/aer.20151220\nhttps://doi.org/10.1093/qje/qjy001"></textarea></label></div>
      <p class="muted" id="rf-imsg"></p>`,
    onOpen: ov => {
      ov.querySelectorAll("[data-m]").forEach(b => b.onclick = () => { mode = b.dataset.m; ov.querySelectorAll("[data-m]").forEach(x => x.setAttribute("aria-pressed", x === b)); ov.querySelectorAll("[data-pane]").forEach(x => x.hidden = x.dataset.pane !== mode); $(".mactions .btn-primary", ov).hidden = mode === "file"; });
      $(".mactions .btn-primary", ov).hidden = mode === "file";
      const take = async fileList => { const items = []; for (const file of fileList) items.push(...parseRefText(await file.text(), file.name)); finish(ov, items); };
      $("#rf-in", ov).onchange = e => take([...e.target.files]);
      const drop = $("#rf-drop", ov);
      drop.addEventListener("dragover", e => { e.preventDefault(); drop.classList.add("over"); }); drop.addEventListener("dragleave", () => drop.classList.remove("over"));
      drop.addEventListener("drop", e => { e.preventDefault(); drop.classList.remove("over"); take([...e.dataTransfer.files]); });
    },
    actions: [{ label: "Cancel" }, { label: "Import", primary: true, onClick: async ov => {
      const msg = $("#rf-imsg", ov);
      if (mode === "paste") { const items = parseRefText($("#rf-paste", ov).value); if (!items.length) { msg.textContent = "Couldn't find any references in that text. Paste BibTeX (@article{…}), RIS (TY  - …) or CSL-JSON."; return false; } finish(ov, items); return false; }
      const dois = $("#rf-dois", ov).value.split(/\s+/).filter(Boolean); if (!dois.length) { msg.textContent = "Add at least one DOI."; return false; }
      const items = [], fails = [];
      for (const [i, d] of dois.entries()) { msg.innerHTML = `<span class="spinner sm"></span> Looking up ${i + 1} of ${dois.length}…`; try { items.push(await lookupDoi(d)); } catch (e) { fails.push(`${d}: ${e.message}`); } }
      if (!items.length) { msg.textContent = fails.join(" "); return false; }
      finish(ov, items, fails); return false;
    } }]
  });
  function finish(ov, items, fails = []) {
    if (!items.length) { $("#rf-imsg", ov).textContent = "No references found in that file."; return; }
    const r = addReferences(p, items); persist(p, true); ov.querySelector("[data-x]").click(); S.refOpen = null; render();
    toast(`Imported ${r.added} reference${r.added === 1 ? "" : "s"} into ${r.file}${r.dup ? ` · ${r.dup} duplicate${r.dup > 1 ? "s" : ""} skipped` : ""}${fails.length ? ` · ${fails.length} DOI${fails.length > 1 ? "s" : ""} not found` : ""}.`);
  }
}
function parseRefText(text, name = "") {
  const t = text.replace(/^﻿/, "").trim(); if (!t) return [];
  if (/\.json$/i.test(name) || /^[\[{]/.test(t)) { try { return cslToFields(JSON.parse(t)); } catch (e) { return []; } }
  if (/\.ris$/i.test(name) || /^TY {2}- /m.test(t)) return risToFields(t);
  return parseBib(t).map(e => ({ type: e.type, key: e.key, fields: e.fields }));
}
function exportRefsFlow(p) {
  const file = bibTarget(p), all = refLibrary(p, file), uses = citationsIn(p);
  modal({
    title: "Export references",
    body: `<fieldset class="vis"><legend>Which references</legend>
        <label class="check"><input type="radio" name="scope" value="all" checked> <span>All ${all.length} in ${esc(file)}</span></label>
        <label class="check"><input type="radio" name="scope" value="cited"> <span>Only the ${all.filter(r => uses[r.key]).length} cited in your writing</span></label></fieldset>
      <div class="Box">
        <div class="Box-row ex-wrap"><div class="grow"><strong>Formatted bibliography</strong><div class="muted" style="font-size:12px">Alphabetical reference list for a manuscript</div></div><select class="btn btn-sm" id="ex-style" aria-label="Style">${Object.entries(STYLES).map(([k, v]) => `<option value="${k}" ${k === (S.refStyle || "apa") ? "selected" : ""}>${v}</option>`).join("")}</select><button class="btn btn-sm" data-ex="docx">Word</button><button class="btn btn-sm" data-ex="md">Markdown</button><button class="btn btn-sm" data-ex="copy">Copy</button></div>
        <div class="Box-row"><div class="grow"><strong>BibTeX</strong> <span class="muted">.bib</span><div class="muted" style="font-size:12px">LaTeX, Overleaf, Zotero, JabRef</div></div><button class="btn btn-sm" data-ex="bib">Download</button></div>
        <div class="Box-row"><div class="grow"><strong>RIS</strong> <span class="muted">.ris</span><div class="muted" style="font-size:12px">EndNote, Mendeley, Zotero, RefWorks</div></div><button class="btn btn-sm" data-ex="ris">Download</button></div>
        <div class="Box-row"><div class="grow"><strong>CSL-JSON</strong> <span class="muted">.json</span><div class="muted" style="font-size:12px">Pandoc, Zotero, citation.js</div></div><button class="btn btn-sm" data-ex="json">Download</button></div></div>
      <div><span class="side-h">Preview</span><div class="rf-biblio" id="ex-prev"></div></div>`,
    onOpen: ov => {
      const pick = () => { const scope = ov.querySelector('input[name="scope"]:checked').value; return sortRefs(scope === "cited" ? all.filter(r => uses[r.key]) : all); };
      const biblio = () => pick().map(r => formatRef(r, $("#ex-style", ov).value));
      const prev = () => { const b = biblio(); $("#ex-prev", ov).innerHTML = b.slice(0, 4).map(x => `<p>${refHtml(x)}</p>`).join("") + (b.length > 4 ? `<p class="muted">…and ${b.length - 4} more</p>` : ""); };
      ov.addEventListener("change", prev); prev();
      const stem = slug(p.name) + "-references";
      ov.querySelectorAll("[data-ex]").forEach(b => b.onclick = async () => {
        const list = pick(), kind = b.dataset.ex, st = $("#ex-style", ov).value;
        if (!list.length) return toast("No references to export.");
        if (kind === "bib") { const text = p.working[file].text, keep = new Set(list.map(r => r.key)); const out = list.length === all.length ? text : parseBib(text).filter(e => keep.has(e.key)).map(e => text.slice(e.start, e.end)).join("\n\n") + "\n"; return offerFile(stem + ".bib", out, out); }
        if (kind === "ris") { const out = list.map(refToRis).join("\n\n") + "\n"; return offerFile(stem + ".ris", out, out); }
        if (kind === "json") { const out = JSON.stringify(list.map(refToCsl), null, 2); return offerFile(stem + ".json", out, out); }
        const heading = `# References`, lines = list.map(r => formatRef(r, st));
        if (kind === "md") { const out = heading + "\n\n" + lines.join("\n\n") + "\n"; return offerFile(stem + ".md", out, out); }
        if (kind === "docx") return offerFile(stem + ".docx", mdToDocx(heading + "\n" + lines.join("\n")));
        try { await navigator.clipboard.writeText(lines.map(x => x.replace(/\*/g, "")).join("\n\n")); toast("Bibliography copied."); } catch (e) { toast("Couldn't copy. Use Markdown instead."); }
      });
    },
    actions: [{ label: "Close" }]
  });
}
/* ---------- Cite while writing ---------- */
function citeFlow(p, path, textarea) {
  const files = bibFiles(p); const refs = files.flatMap(f => refLibrary(p, f));
  if (!refs.length) return modal({ title: "Cite a reference", body: `<p>This project has no references yet.</p>`, actions: [{ label: "Close" }, { label: "Open References", primary: true, onClick: () => { go("refs"); return true; } }] });
  const ext = extOf(path), style = S.refStyle || "apa";
  const fmt = rs => ext === "tex" ? `\\cite{${rs.map(r => r.key).join(",")}}` : ["md", "markdown"].includes(ext) ? `[${rs.map(r => "@" + r.key).join("; ")}]` : rs.map(r => inTextCite(r, style)).join(" ").replace(/\) \(/g, "; ");
  const pos = textarea ? [textarea.selectionStart, textarea.selectionEnd] : null;
  modal({
    title: "Cite a reference",
    body: `<input type="text" id="ct-q" placeholder="Search author, title, year…" aria-label="Search references"><div class="Box ct-list" id="ct-list">${sortRefs(refs).map(r => `<label class="Box-row check" style="font-weight:400" data-txt="${esc([r.key, r.title, r.year, ...r.authors.map(familyOf)].join(" ").toLowerCase())}"><input type="checkbox" value="${esc(r.key)}"><div class="grow" style="min-width:0"><div><strong>${esc(r.title || r.key)}</strong></div><div class="muted" style="font-size:12px">${esc(r.authors.map(familyOf).slice(0, 3).join(", "))}${r.year ? " · " + esc(r.year) : ""} · <span class="mono">${esc(r.key)}</span></div></div></label>`).join("")}</div>
      <p class="muted" style="font-size:12px">Inserts <span class="mono" id="ct-fmt">${esc(fmt([{ key: "key", authors: [{ family: "Author" }], year: "2024", title: "" }]))}</span> at the cursor.</p>`,
    onOpen: ov => { $("#ct-q", ov).oninput = e => { const q = e.target.value.toLowerCase(); ov.querySelectorAll("[data-txt]").forEach(x => x.hidden = !x.dataset.txt.includes(q)); }; $("#ct-q", ov).focus(); },
    actions: [{ label: "Cancel" }, { label: "Insert citation", primary: true, onClick: ov => {
      const sel = [...ov.querySelectorAll("#ct-list input:checked")].map(x => refs.find(r => r.key === x.value)); if (!sel.length) return false;
      const ins = fmt(sel), f = p.working[path], [a, b] = pos || [f.text.length, f.text.length];
      f.text = f.text.slice(0, a) + ins + f.text.slice(b); persist(p);
      S.citeCaret = a + ins.length; render(); toast(`Inserted ${ins}.`); return true;
    } }]
  });
}
