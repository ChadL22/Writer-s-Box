
/* ============ Icons (drawn for this app) ============ */
const PAGE = '<path d="M3.75 1.75h6l2.5 2.5v10H3.75z"/><path d="M9.75 1.75v2.5h2.5"/>';
const P_ = {
  /* pages: one per kind of writing */
  file: PAGE + '<path d="M6 7.25h4.25M6 9.5h4.25M6 11.75h2.75"/>',
  fileWord: PAGE + '<path d="M5.75 7h4.5M5.75 9.25h4.5M5.75 11.5h4.5"/>',
  fileTex: PAGE + '<path d="M10 7H6.25l2 2.25-2 2.25H10"/>',
  fileBib: PAGE + '<path d="M5.75 7.5h1.5V9L6.5 11M8.75 7.5h1.5V9L9.5 11"/>',
  fileSheet: PAGE + '<path d="M5.75 6.75h4.5v6h-4.5zM5.75 9.75h4.5M8 6.75v6"/>',
  fileMd: PAGE + '<path d="M7 7l-.5 5.25M9.5 7 9 12.25M5.5 8.75h5M5.25 10.75h5"/>',
  folder: '<path d="M1.75 3.25h4.5l1.5 1.5h6.5v8.5H1.75z"/>',
  /* project = an open book; manuscript = the working pages */
  book: '<path d="M1.75 2.75h4a2.25 2.25 0 0 1 2.25 2.25v8.25a1.5 1.5 0 0 0-1.5-1.5h-4.75z"/><path d="M14.25 2.75h-4A2.25 2.25 0 0 0 8 5v8.25a1.5 1.5 0 0 1 1.5-1.5h4.75z"/>',
  manuscript: PAGE + '<path d="M6 7.25h4.25M6 9.5h4.25M6 11.75h2.75"/>',
  /* history = a stack of saved pages */
  history: '<path d="M6.5 13.45A5.75 5.75 0 1 0 2.75 8"/><path d="M1.25 6.6 2.75 8.6 4.25 6.6"/><circle cx="8.5" cy="8" r="2.6"/><path d="M8.5 6.75V8l.9.9"/>',
  /* drafts = a pencil */
  branch: '<path d="M10.75 2.25l3 3-7.75 7.75-3.75.75.75-3.75z"/><path d="M9.25 3.75l3 3"/>',
  /* milestone = a bookmark ribbon */
  milestone: '<path d="M4.25 1.75h7.5v12.5L8 11.25l-3.75 3z"/>',
  /* compare = two pages side by side */
  compare: '<path d="M1.75 2.75h5v10.5h-5zM9.25 2.75h5v10.5h-5z"/><path d="M3.25 5.5h2M3.25 8h2M3.25 10.5h2M10.75 5.5h2M10.75 8h2M10.75 10.5h2"/>',
  /* import = writing going into a page */
  import: '<path d="M3.75 6v8.25h8.5V6"/><path d="M8 1.5v7.75M5.5 6.75 8 9.25l2.5-2.5"/>',
  /* save version = a page signed off */
  commit: PAGE + '<path d="M5.75 9.25l1.5 1.5 3-3"/>',
  /* merge = two drafts becoming one */
  merge: '<path d="M2 1.75h4v5H2zM10 1.75h4v5h-4z"/><path d="M4 6.75v1c0 1 .75 1.75 1.75 1.75h4.5c1 0 1.75-.75 1.75-1.75v-1M8 9.5v4.75M6.5 12.75 8 14.25l1.5-1.5"/>',
  /* write = a pen nib */
  pencil: '<path d="M8 14.25 4.25 8.5 6 3.25h4l1.75 5.25z"/><path d="M8 14.25V9.5"/><circle cx="8" cy="8.25" r=".9"/><path d="M5.75 1.5h4.5"/>',
  sections: '<path d="M3.75 2.75h8.5v3h-8.5zM3.75 6.5h8.5v3h-8.5zM3.75 10.25h8.5v3h-8.5z"/>',
  kebab: '<circle cx="8" cy="3.5" r=".9" fill="currentColor"/><circle cx="8" cy="8" r=".9" fill="currentColor"/><circle cx="8" cy="12.5" r=".9" fill="currentColor"/>',
  chevronUp: '<path d="M4.5 10l3.5-3.5 3.5 3.5"/>',
  chevronDown: '<path d="M4.5 6l3.5 3.5 3.5-3.5"/>',
  format: '<path d="M1.75 13.25 5.5 2.75h1l3.75 10.5M3.1 9.5h5.8M11.25 8.25c.4-.6 1-.9 1.75-.9 1.1 0 1.75.7 1.75 1.8v4.1M14.75 10.6c-2.4 0-3.5.6-3.5 1.6 0 .7.5 1.15 1.3 1.15 1.2 0 2.2-.9 2.2-2.2"/>',
  quote: '<path d="M2.75 8.5h3.5v4.25H2.75zM2.75 8.5c0-2.6 1-4.4 3.25-5.25M9.75 8.5h3.5v4.25h-3.5zM9.75 8.5c0-2.6 1-4.4 3.25-5.25"/>',
  pilcrow: '<path d="M7.5 2.25v11.5M10.25 2.25v11.5M12 2.25H6.5a2.75 2.75 0 0 0 0 5.5h1"/>',
  x: '<path d="M4 4l8 8M12 4l-8 8"/>',
  plus: '<path d="M8 3v10M3 8h10"/>',
  chevd: '<path d="M4 6l4 4 4-4"/>',
  chevr: '<path d="M6 4l4 4-4 4"/>',
  trash: '<path d="M2.75 4.25h10.5M6.25 4.25V2.75h3.5v1.5M4.25 4.25l.6 9h6.3l.6-9"/>',
  download: '<path d="M8 1.75v8.5M5 7.25l3 3 3-3M2.75 13.75h10.5"/>',
  alert: '<path d="M8 2 14.5 13.5h-13z"/><path d="M8 6.25v3.25M8 11.6v.01"/>',
  info: '<circle cx="8" cy="8" r="6.25"/><path d="M8 7.25v4M8 4.9v.01"/>',
  check: '<path d="M3 8.5l3 3 7-7"/>',
  undo: '<path d="M4.5 6.5h6a3 3 0 0 1 0 6H7"/><path d="M6.75 4 4.25 6.5l2.5 2.5"/>',
  gear: '<circle cx="8" cy="8" r="2.25"/><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4"/>',
  up: '<path d="M8 13V3M4 7l4-4 4 4"/>',
  people: '<circle cx="6" cy="5.5" r="2.25"/><path d="M1.75 13.5c0-2.5 1.9-4.25 4.25-4.25s4.25 1.75 4.25 4.25"/><circle cx="11.5" cy="5" r="1.75"/><path d="M11 9c1.9 0 3.25 1.4 3.25 3.5"/>',
  paste: '<rect x="3" y="3" width="10" height="11.25" rx="1.5"/><path d="M6 1.75h4v2.5H6z"/><path d="M5.75 8h4.5M5.75 10.5h3"/>'
};
const ic = (name, cls = "") => `<svg class="oc ${cls}" viewBox="0 0 16 16" aria-hidden="true">${P_[name]}</svg>`;
const ICON = { x: ic("x") };
const fileIcon = path => ic({ LaTeX: "fileTex", BibTeX: "fileBib", Markdown: "fileMd", Word: "fileWord", Spreadsheet: "fileSheet", CSV: "fileSheet" }[typeLabel(path)] || "file");
const LOGO = `<svg class="logo" viewBox="108 100 260 266" aria-hidden="true" fill="currentColor"><path d="M132 140 264 112 355 177 203 212z"/><path d="M118 147 196 214v44L118 191z"/><path d="M206 217 357 181v41L206 258z"/><path d="M130 213 197 271v86L130 299z"/><path d="M207 271 342 238v80L207 357z"/></svg>`;
const TYPE_COLOR = { Spreadsheet: "#0f7b6c", CSV: "#52a37a", LaTeX: "#3d6117", BibTeX: "#778899", Markdown: "#083fa1", Word: "#2b6cb0", Text: "#9198a1" };

/* ============ Extra format adapters ============ */
const BLOCK_TAGS = new Set(["p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "table", "tr", "blockquote", "section", "article", "hr", "pre"]);
function htmlToMarkdown(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("style,script,meta,title,head,noscript").forEach(n => n.remove());
  const wrap = (s, m) => { const a = s.match(/^\s*/)[0], b = s.match(/\s*$/)[0]; return a + m + s.trim() + m + b; };
  const inline = (node, fmt = {}) => {
    let s = "";
    for (const c of node.childNodes) {
      if (c.nodeType === 3) { s += c.textContent.replace(/\s+/g, " "); continue; }
      if (c.nodeType !== 1) continue;
      const t = c.tagName.toLowerCase();
      if (t === "br") { s += " "; continue; }
      const st = c.getAttribute("style") || "";
      const fw = /font-weight:\s*(\d+|bold)/i.exec(st);
      const isB = t === "strong" || (t === "b" && !/font-weight:\s*(normal|[1-5]00)/i.test(st)) || !!(fw && (fw[1] === "bold" || +fw[1] >= 600));
      const isI = t === "em" || t === "i" || /font-style:\s*italic/i.test(st);
      let inner = inline(c, { b: fmt.b || isB, i: fmt.i || isI });
      if (t === "a" && c.getAttribute("href") && inner.trim()) {
        let href = c.getAttribute("href");
        try { const u = new URL(href); if (u.hostname.endsWith("google.com") && u.pathname === "/url" && u.searchParams.get("q")) href = u.searchParams.get("q"); } catch (e) { /* relative link */ }
        inner = `[${inner.trim()}](${href})`;
      }
      if (isB && !fmt.b && inner.trim()) inner = wrap(inner, "**");
      if (isI && !fmt.i && inner.trim()) inner = wrap(inner, "*");
      s += inner;
    }
    return s;
  };
  const hasBlock = el => [...el.querySelectorAll("*")].some(x => BLOCK_TAGS.has(x.tagName.toLowerCase()));
  const listLines = (el, depth) => {
    const lines = []; let n = 1; const ordered = el.tagName.toLowerCase() === "ol";
    for (const li of el.children) {
      if (li.tagName.toLowerCase() !== "li") continue;
      const clone = li.cloneNode(true); clone.querySelectorAll("ul,ol").forEach(x => x.remove());
      lines.push("  ".repeat(depth) + (ordered ? (n++) + ". " : "- ") + inline(clone).trim());
      for (const sub of li.querySelectorAll(":scope > ul, :scope > ol")) lines.push(...listLines(sub, depth + 1));
    }
    return lines;
  };
  const out = [];
  const block = el => {
    for (const c of el.childNodes) {
      if (c.nodeType === 3) { const t = c.textContent.replace(/\s+/g, " ").trim(); if (t) out.push(t); continue; }
      if (c.nodeType !== 1) continue;
      const t = c.tagName.toLowerCase();
      if (/^h[1-6]$/.test(t)) { const x = inline(c).replace(/\*\*/g, "").trim(); if (x) out.push("#".repeat(+t[1]) + " " + x); }
      else if (t === "ul" || t === "ol") out.push(listLines(c, 0).join("\n"));
      else if (t === "table") out.push([...c.querySelectorAll("tr")].map(tr => [...tr.children].map(td => inline(td).trim()).join(" | ")).join("\n"));
      else if (t === "hr") out.push("---");
      else if (t === "blockquote") { const x = inline(c).trim(); if (x) out.push("> " + x); }
      else if (t === "pre") out.push("```\n" + c.textContent.replace(/\n$/, "") + "\n```");
      else if (hasBlock(c)) block(c);
      else { const x = inline(c).trim(); if (x) out.push(x); }
    }
  };
  block(doc.body);
  return out.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}
async function odtToMarkdown(u8) {
  const z = unzip(u8); const x = await z.read("content.xml");
  if (!x) throw new Error("This .odt has no content.");
  const doc = new DOMParser().parseFromString(dec.decode(x), "application/xml");
  const T = "urn:oasis:names:tc:opendocument:xmlns:text:1.0";
  const body = doc.getElementsByTagNameNS("urn:oasis:names:tc:opendocument:xmlns:office:1.0", "text")[0];
  if (!body) throw new Error("Couldn't find the text in this .odt.");
  const inl = n => { let s = ""; for (const c of n.childNodes) { if (c.nodeType === 3) s += c.textContent; else if (c.nodeType === 1) { if (c.namespaceURI === T) { const t = c.localName; if (t === "s") s += " ".repeat(+(c.getAttributeNS(T, "c") || 1)); else if (t === "tab") s += "\t"; else if (t === "line-break") s += " "; else if (t === "note" || t === "bookmark" || t === "bookmark-start") { /* skip */ } else s += inl(c); } else s += inl(c); } } return s; };
  const out = [];
  const walk = (n, depth) => { for (const c of n.childNodes) { if (c.nodeType !== 1) continue; if (c.namespaceURI === T && c.localName === "h") { const lvl = Math.min(6, +(c.getAttributeNS(T, "outline-level") || 1)); const s = inl(c).trim(); if (s) out.push("#".repeat(lvl) + " " + s); } else if (c.namespaceURI === T && c.localName === "p") { const s = inl(c).trim(); if (s) out.push((depth >= 0 ? "  ".repeat(depth) + "- " : "") + s); } else if (c.namespaceURI === T && c.localName === "list") walk(c, depth + 1); else walk(c, depth); } };
  walk(body, -1);
  return out.join("\n\n");
}
function docxFromParagraphs(parasXml) {
  return zipStore([
    { name: "[Content_Types].xml", data: enc.encode('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>') },
    { name: "_rels/.rels", data: enc.encode('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>') },
    { name: "word/document.xml", data: enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="${W_NS}"><w:body>${parasXml}<w:sectPr/></w:body></w:document>`) }
  ]);
}
function mdToDocx(md) {
  const x = s => s.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const run = (t, rpr = "") => t ? `<w:r>${rpr ? `<w:rPr>${rpr}</w:rPr>` : ""}<w:t xml:space="preserve">${x(t)}</w:t></w:r>` : "";
  const inlineRuns = (s, base = "") => s.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\[[^\]]+\]\([^)]+\))/).map(part => {
    if (/^\*\*[^*]+\*\*$/.test(part)) return run(part.slice(2, -2), base + "<w:b/>");
    if (/^\*[^*].*\*$/.test(part)) return run(part.slice(1, -1), base + "<w:i/>");
    const m = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part); if (m) return run(m[1], base + "<w:u w:val=\"single\"/>");
    return run(part, base);
  }).join("");
  const paras = md.split("\n").filter(l => l.trim() !== "").map(line => {
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) return `<w:p>${inlineRuns(h[2], `<w:b/><w:sz w:val="${[36, 30, 26, 24, 22, 22][h[1].length - 1]}"/>`)}</w:p>`;
    const li = /^(\s*)(?:[-*]|\d+\.)\s+(.*)$/.exec(line);
    if (li) return `<w:p><w:pPr><w:ind w:left="${360 + li[1].length * 180}"/></w:pPr>${run("• ")}${inlineRuns(li[2])}</w:p>`;
    return `<w:p>${inlineRuns(line)}</w:p>`;
  }).join("");
  return docxFromParagraphs(paras);
}


/* ============ Spreadsheet adapter (Excel, Google Sheets, CSV, ODS) ============
   Canonical text: one "# Sheet: name" line per sheet, then one line per row, cells separated by tabs.
   Rows are the diff unit; formulas are kept as "=FORMULA" so formula edits show up as changes. */
const SHEET_HDR = "# Sheet: ";
const SS_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
const REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const cellOut = v => String(v == null ? "" : v).replace(/\t/g, " ").replace(/\r?\n/g, " ↵ ");
const cellIn = v => v.replace(/ ↵ /g, "\n");
function sheetsToText(sheets) {
  return sheets.map(s => {
    const rows = s.rows.map(r => { const a = (r || []).map(cellOut); while (a.length && a.at(-1) === "") a.pop(); return a.join("\t"); });
    while (rows.length && rows.at(-1) === "") rows.pop();
    return [SHEET_HDR + s.name, ...rows].join("\n");
  }).join("\n");
}
function textToSheets(text) {
  const sheets = [];
  for (const line of text.split("\n")) {
    if (line.startsWith(SHEET_HDR)) { sheets.push({ name: line.slice(SHEET_HDR.length), rows: [] }); continue; }
    if (!sheets.length) sheets.push({ name: "Sheet1", rows: [] });
    sheets.at(-1).rows.push(line === "" ? [] : line.split("\t").map(cellIn));
  }
  return sheets.length ? sheets : [{ name: "Sheet1", rows: [] }];
}
const colIndex = ref => { const m = /^([A-Z]+)/.exec(ref); let n = 0; for (const ch of m[1]) n = n * 26 + ch.charCodeAt(0) - 64; return n - 1; };
const colName = i => { let s = ""; i++; while (i > 0) { const r = (i - 1) % 26; s = String.fromCharCode(65 + r) + s; i = Math.floor((i - 1) / 26); } return s; };
function serialToDate(s) { const d = new Date(Math.round((s - 25569) * 864e5)); const iso = d.toISOString(); return s % 1 ? iso.slice(0, 16).replace("T", " ") : iso.slice(0, 10); }
async function xlsxToText(u8) {
  const z = unzip(u8);
  const rd = async n => { const b = await z.read(n); return b ? new DOMParser().parseFromString(dec.decode(b), "application/xml") : null; };
  const wb = await rd("xl/workbook.xml"); if (!wb) throw new Error("This .xlsx has no workbook inside.");
  const rels = await rd("xl/_rels/workbook.xml.rels"), relMap = {};
  if (rels) for (const r of rels.getElementsByTagName("Relationship")) relMap[r.getAttribute("Id")] = r.getAttribute("Target");
  const ssDoc = await rd("xl/sharedStrings.xml"), shared = [];
  if (ssDoc) for (const si of ssDoc.getElementsByTagNameNS(SS_NS, "si")) { let s = ""; for (const t of si.getElementsByTagNameNS(SS_NS, "t")) { if (t.parentNode.localName !== "rPh") s += t.textContent; } shared.push(s); }
  const st = await rd("xl/styles.xml"), dateXf = [];
  if (st) {
    const custom = {}; for (const nf of st.getElementsByTagNameNS(SS_NS, "numFmt")) custom[nf.getAttribute("numFmtId")] = nf.getAttribute("formatCode") || "";
    const xfs = st.getElementsByTagNameNS(SS_NS, "cellXfs")[0];
    if (xfs) [...xfs.getElementsByTagNameNS(SS_NS, "xf")].forEach((xf, i) => { const id = +xf.getAttribute("numFmtId"), code = custom[id]; dateXf[i] = (id >= 14 && id <= 22) || (id >= 45 && id <= 47) || !!(code && /[dy]/i.test(code.replace(/\[[^\]]*\]|"[^"]*"/g, ""))); });
  }
  const sheets = [];
  for (const sh of wb.getElementsByTagNameNS(SS_NS, "sheet")) {
    const rid = sh.getAttributeNS(REL_NS, "id") || sh.getAttribute("r:id"), target = relMap[rid] || "";
    const doc = await rd(target.startsWith("/") ? target.slice(1) : "xl/" + target.replace(/^\.\//, ""));
    const rows = [];
    if (doc) for (const row of doc.getElementsByTagNameNS(SS_NS, "row")) {
      const rAttr = row.getAttribute("r"), ri = rAttr ? +rAttr - 1 : rows.length;
      if (ri > 50000) break;
      const cells = []; let ci = 0;
      for (const c of row.getElementsByTagNameNS(SS_NS, "c")) {
        const ref = c.getAttribute("r"); if (ref) ci = colIndex(ref);
        const t = c.getAttribute("t"), f = c.getElementsByTagNameNS(SS_NS, "f")[0], v = c.getElementsByTagNameNS(SS_NS, "v")[0];
        let val = "";
        if (f && f.textContent) val = "=" + f.textContent;
        else if (t === "s") val = v ? (shared[+v.textContent] || "") : "";
        else if (t === "inlineStr") val = [...c.getElementsByTagNameNS(SS_NS, "t")].map(x => x.textContent).join("");
        else if (t === "b") val = v && v.textContent === "1" ? "TRUE" : "FALSE";
        else if (v) { val = v.textContent; if ((!t || t === "n") && dateXf[+c.getAttribute("s")] && val !== "" && !isNaN(+val)) val = serialToDate(+val); }
        cells[ci] = val; ci++;
      }
      rows[ri] = Array.from(cells, x => x == null ? "" : x);
    }
    sheets.push({ name: sh.getAttribute("name") || "Sheet" + (sheets.length + 1), rows: Array.from(rows, r => r || []) });
  }
  return sheetsToText(sheets);
}
async function odsToText(u8) {
  const z = unzip(u8), b = await z.read("content.xml"); if (!b) throw new Error("This .ods has no content.");
  const doc = new DOMParser().parseFromString(dec.decode(b), "application/xml");
  const TB = "urn:oasis:names:tc:opendocument:xmlns:table:1.0", TX = "urn:oasis:names:tc:opendocument:xmlns:text:1.0", OF = "urn:oasis:names:tc:opendocument:xmlns:office:1.0";
  const sheets = [];
  for (const t of doc.getElementsByTagNameNS(TB, "table")) {
    const rows = [];
    for (const r of t.getElementsByTagNameNS(TB, "table-row")) {
      const cells = [];
      for (const c of r.children) {
        if (c.namespaceURI !== TB || !/^(table-cell|covered-table-cell)$/.test(c.localName)) continue;
        const rep = Math.min(+(c.getAttributeNS(TB, "number-columns-repeated") || 1), 512), f = c.getAttributeNS(TB, "formula"), vt = c.getAttributeNS(OF, "value-type");
        let v;
        if (f) v = "=" + f.replace(/^of:=/, "").replace(/\[\.([A-Z]+\d+):\.([A-Z]+\d+)\]/g, "$1:$2").replace(/\[\.([A-Z]+\d+)\]/g, "$1");
        else if (vt === "date") v = (c.getAttributeNS(OF, "date-value") || "").replace("T", " ");
        else if (["float", "percentage", "currency"].includes(vt)) v = c.getAttributeNS(OF, "value");
        else v = [...c.getElementsByTagNameNS(TX, "p")].map(p => p.textContent).join("\n");
        for (let k = 0; k < rep; k++) cells.push(v);
      }
      while (cells.length && cells.at(-1) === "") cells.pop();
      const rrep = Math.min(+(r.getAttributeNS(TB, "number-rows-repeated") || 1), 2000);
      for (let k = 0; k < rrep; k++) rows.push(cells.slice());
    }
    while (rows.length && !rows.at(-1).length) rows.pop();
    sheets.push({ name: t.getAttributeNS(TB, "name") || "Sheet" + (sheets.length + 1), rows });
  }
  return sheetsToText(sheets);
}
function parseDelimited(text, sep) {
  const rows = []; let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; }
    else if (ch === '"' && cell === "") q = true;
    else if (ch === sep) { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") { if (ch === "\r" && text[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += ch;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows;
}
const toDelimited = (rows, sep) => rows.map(r => r.map(v => (v.includes(sep) || /["\n\r]/.test(v)) ? '"' + v.replace(/"/g, '""') + '"' : v).join(sep)).join("\n") + "\n";
function xlsxFromText(text) {
  const sheets = textToSheets(text);
  const x = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const used = new Set();
  const safe = (n, i) => { let s = (n || "Sheet" + (i + 1)).replace(/[[\]:*?/\\]/g, " ").slice(0, 31).trim() || "Sheet" + (i + 1); while (used.has(s.toLowerCase())) s = s.slice(0, 28) + " " + (i + 1); used.add(s.toLowerCase()); return s; };
  const cell = (v, ref) => {
    if (v === "") return "";
    if (v.length > 1 && v.startsWith("=")) return `<c r="${ref}"><f>${x(v.slice(1))}</f></c>`;
    if (/^-?(0|[1-9]\d*)(\.\d+)?([eE][-+]?\d+)?$/.test(v)) return `<c r="${ref}"><v>${v}</v></c>`;
    if (v === "TRUE" || v === "FALSE") return `<c r="${ref}" t="b"><v>${v === "TRUE" ? 1 : 0}</v></c>`;
    return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${x(v)}</t></is></c>`;
  };
  const sheetXml = s => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="${SS_NS}"><sheetData>${s.rows.map((r, i) => r.length ? `<row r="${i + 1}">${r.map((v, j) => cell(v, colName(j) + (i + 1))).join("")}</row>` : "").join("")}</sheetData></worksheet>`;
  const names = sheets.map((s, i) => safe(s.name, i));
  return zipStore([
    { name: "[Content_Types].xml", data: enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}</Types>`) },
    { name: "_rels/.rels", data: enc.encode('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>') },
    { name: "xl/workbook.xml", data: enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="${SS_NS}" xmlns:r="${REL_NS}"><sheets>${names.map((n, i) => `<sheet name="${x(n)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")}</sheets><calcPr fullCalcOnLoad="1"/></workbook>`) },
    { name: "xl/_rels/workbook.xml.rels", data: enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("")}</Relationships>`) },
    ...sheets.map((s, i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, data: enc.encode(sheetXml(s)) }))
  ]);
}
function sheetBytes(path, text) {
  const ext = extOf(path);
  if (ext === "csv" || ext === "tsv") return enc.encode(toDelimited(textToSheets(text)[0].rows, ext === "csv" ? "," : "\t"));
  return xlsxFromText(text);
}
function sheetRowLabels(text) { const out = []; let r = 0; for (const line of text.split("\n")) { if (line.startsWith(SHEET_HDR)) { out.push(""); r = 0; } else out.push(++r); } return out; }
const sheetSummary = text => { const s = textToSheets(text); const rows = s.reduce((n, x) => n + x.rows.length, 0); return `${s.length} sheet${s.length > 1 ? "s" : ""} · ${rows.toLocaleString()} rows`; };

/* ============ Helpers ============ */
const ME = "You";
const headTree = p => treeOf(p, headId(p));
const draftLabel = n => n;
function firstParentChain(p, vid) { const out = []; let id = vid; while (id && p.versions[id]) { out.push(id); id = p.versions[id].parent; } return out; }
function lastTouch(p) {
  const map = {};
  for (const id of firstParentChain(p, headId(p))) {
    const v = p.versions[id], pt = treeOf(p, v.parent);
    for (const path of new Set([...Object.keys(v.tree), ...Object.keys(pt)])) if (!(path in map) && v.tree[path] !== pt[path]) map[path] = id;
  }
  return map;
}
const refText = (p, ref, path) => ref === "W" ? (p.working[path] ? p.working[path].text : "") : ref ? textAt(p, ref, path) : "";
const refPaths = (p, ref) => ref === "W" ? Object.keys(p.working) : Object.keys(treeOf(p, ref));
const refExists = (p, ref, path) => ref === "W" ? !!p.working[path] : !!(ref && treeOf(p, ref)[path]);
function aheadBehind(p, name) {
  const d = ancestors(p, p.drafts[name]), m = ancestors(p, p.drafts.main);
  let ahead = 0, behind = 0; d.forEach(x => { if (!m.has(x)) ahead++; }); m.forEach(x => { if (!d.has(x)) behind++; });
  return { ahead, behind };
}
const shortDate = t => new Date(t).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
function statusLabel(st) {
  if (st === "modified") return `<span class="label label-attention">Modified</span>`;
  if (st === "new") return `<span class="label label-success">New</span>`;
  if (st === "deleted") return `<span class="label label-danger">Removed</span>`;
  return "";
}
function diffstatBlocks(ins, del) {
  const tot = ins + del; if (!tot) return `<span class="diffstat">${"<i></i>".repeat(5)}</span>`;
  const a = Math.round(5 * ins / tot), d = Math.min(5 - a, Math.round(5 * del / tot));
  return `<span class="diffstat">${"<i class='a'></i>".repeat(a)}${"<i class='d'></i>".repeat(d)}${"<i></i>".repeat(5 - a - d)}</span>`;
}
/* Browser history: every screen change is a history entry, so Back and Forward move through Writer's Box. */
const NAV_KEYS = ["route", "pid", "file", "dir", "vid", "cmp", "num", "fileMode"];
const navState = () => Object.fromEntries(NAV_KEYS.map(k => [k, S[k] === undefined ? null : JSON.parse(JSON.stringify(S[k]))]));
const navHash = () => "#" + ({ file: "files", version: "history", review: "reviews", note: "notes" }[S.route] || S.route);
const NAV_LAST = "wb.last";
function rememberNav() { try { localStorage.setItem(NAV_LAST, JSON.stringify({ pid: S.pid })); } catch (e) { /* ignore */ } }
function go(route, extra = {}, replace = false) {
  const before = JSON.stringify(navState());
  Object.assign(S, extra); S.route = route;
  const st = navState();
  try { if (replace || JSON.stringify(st) === before) history.replaceState(st, "", navHash()); else history.pushState(st, "", navHash()); } catch (e) { /* ignore */ }
  rememberNav(); render(); if (!replace) window.scrollTo(0, 0);
}
function onNavPop(e) {
  const st = e.state; if (!st || !st.route) return;
  document.querySelectorAll("#layer .overlay").forEach(o => { const x = o.querySelector("[data-x]"); if (x) x.click(); else o.remove(); });
  if (st.pid && !S.projects.some(x => x.id === st.pid)) return;
  Object.assign(S, st); rememberNav(); render();
}

/* ============ Shell ============ */
function render() { renderHeader(); renderRepoHead(); renderView(); }
function renderHeader() {
  const p = P(), el = $("#gh"), atHome = S.route === "home" || S.route === "profile";
  el.innerHTML = `<button class="mark" id="h-home" title="Home">${LOGO}<span>Writer's Box</span></button>
    ${!atHome && p ? `<span class="crumbs">/ <span>${esc(p.remote ? p.remote.owner : "local")}</span> /
      <label class="sr" for="proj-sel">Project</label>
      <select id="proj-sel">${S.projects.map(x => `<option value="${x.id}" ${x.id === p.id ? "selected" : ""}>${esc(x.remote ? x.remote.repo : x.name)}</option>`).join("")}</select></span>` : `<span class="crumbs"><strong>${S.route === "profile" ? "Profile" : "Home"}</strong></span>`}
    <span class="grow"></span>
    <button class="hbtn" id="h-new">${ic("plus")} New project</button>
    ${ghSignedIn() ? `<button class="hbtn av-btn" id="h-me" title="Your profile and account">${avatarImg(ghImgOk() ? GH.user.avatar_url : null, GH.user.login, 22)}<span>${esc(GH.user.login)}</span></button>`
      : `<button class="hbtn" id="h-signin">Sign in with GitHub</button>`}`;
  $("#h-home").onclick = () => go("home");
  const ps = $("#proj-sel"); if (ps) ps.onchange = e => { S.pid = e.target.value; resetSel(); go("files"); autoSync(); };
  $("#h-new").onclick = createProjectFlow;
  const si = $("#h-signin"); if (si) si.onclick = signInFlow;
  const me = $("#h-me"); if (me) me.onclick = () => modal({ title: GH.user.login, body: `<div class="Box"><button class="Box-row link" id="mm-pf" style="width:100%;color:var(--fg)">${ic("book")} Your profile</button><button class="Box-row link" id="mm-hm" style="width:100%;color:var(--fg)">${ic("manuscript")} Your projects</button><button class="Box-row link" id="mm-cl" style="width:100%;color:var(--fg)">${ic("import")} Open a project from GitHub</button><button class="Box-row link" id="mm-so" style="width:100%;color:var(--danger)">${ic("x")} Sign out</button></div><p class="muted" style="font-size:12px">Signing out removes your token from this browser. Your projects stay here and on GitHub.</p>`,
    onOpen: ov => { const c = f => () => { ov.remove(); f(); }; $("#mm-pf", ov).onclick = c(() => go("profile")); $("#mm-hm", ov).onclick = c(() => go("home")); $("#mm-cl", ov).onclick = c(cloneFlow); $("#mm-so", ov).onclick = c(() => { ghSignOut(); toast("Signed out."); render(); }); }, actions: [{ label: "Close" }] });
}
function renderRepoHead() {
  const p = P(), el = $("#repohead");
  if (!p || S.route === "home" || S.route === "profile") { el.innerHTML = ""; el.hidden = true; return; }
  el.hidden = false;
  const nV = Object.keys(p.versions).length, nD = Object.keys(p.drafts).length, remote = isRemote(p);
  const tab = { file: "files", version: "history", review: "reviews", note: "notes" }[S.route] || S.route;
  const cnt = k => { const c = GH.cache[`${k}:${p.id}:open`]; return c ? c.data.length : ""; };
  const tabs = [["files", "manuscript", "Files", ""], ["history", "history", "History", nV], ["drafts", "branch", "Drafts", nD], ["reviews", "merge", "Reviews", remote ? cnt("pr") : ""], ["notes", "pencil", "Notes", remote ? cnt("is") : ""], ["refs", "quote", "References", refCount(p) || ""], ["format", "format", "Format", ""], ["live", "people", "Live", Object.keys(p.live || {}).length || ""], ["insights", "pilcrow", "Insights", ""], ["compare", "compare", "Compare", ""], ["import", "import", "Import", ""], ["settings", "gear", "Settings", ""]];
  el.innerHTML = `<div class="repotitle">${ic("book")}<span class="owner">${esc(remote ? p.remote.owner : "local")}</span><span class="muted">/</span><strong>${esc(remote ? p.remote.repo : p.name)}</strong>
      <span class="label">${remote ? (p.remote.private ? "Private" : "Public") : "Stored on this device"}</span><span class="grow"></span>
      ${remote ? `<span class="muted" style="font-size:12px">${p.remote.syncedAt ? "Synced " + ago(p.remote.syncedAt) : "Not synced yet"}</span><button class="btn btn-sm" id="r-sync" ${ghSignedIn() ? "" : 'title="Sign in to sync"'}>${ic("undo")} Sync</button><a class="btn btn-sm" href="${esc(p.remote.htmlUrl || `https://github.com/${p.remote.owner}/${p.remote.repo}`)}" target="_blank" rel="noopener">View on GitHub</a>`
        : `<button class="btn btn-sm" id="r-pub">${ic("import")} Publish to GitHub</button>`}</div>
    <nav class="unav" aria-label="Project">${tabs.map(([k, i, l, n]) => `<button data-tab="${k}" ${tab === k ? 'aria-current="page"' : ""}><span class="in">${ic(i)}${l}${n !== "" ? ` <span class="counter">${n}</span>` : ""}</span></button>`).join("")}</nav>`;
  el.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => go(b.dataset.tab));
  const sy = $("#r-sync"); if (sy) sy.onclick = () => syncFlow(p);
  const pb = $("#r-pub"); if (pb) pb.onclick = () => ghSignedIn() ? publishFlow(p) : signInFlow();
}
function resetSel() { S.dir = ""; S.file = null; S.vid = null; S.cmp = { a: null, b: null }; S.importLog = null; S.num = null; S.revTab = null; S.noteLabel = null; }
function renderView() {
  const p = P(), el = $("#view");
  if (S.route === "home") return viewHome(p, el);
  if (S.route === "profile") return viewProfile(p, el);
  if (!p) { el.innerHTML = `<div class="Box blankslate">${ic("book")}<h3>No projects yet</h3><p class="muted">A project holds a paper, a book or a memo series, with every version you save.</p><button class="btn btn-primary" id="np">New project</button></div>`; $("#np").onclick = createProjectFlow; return; }
  ({ files: viewFiles, file: viewFile, history: viewHistory, version: viewVersion, drafts: viewDrafts, compare: viewCompare, import: viewImport,
     reviews: viewReviews, review: viewReview, live: viewLive, refs: viewRefs, format: viewFormat, notes: viewNotes, note: viewNote, insights: viewInsights, settings: viewSettings }[S.route] || viewFiles)(p, el);
}
function draftPicker(p, id = "draft-sel") {
  const names = Object.keys(p.drafts).sort((a, b) => a === "main" ? -1 : b === "main" ? 1 : a.localeCompare(b));
  return `<span class="select-wrap">${ic("branch")}<label class="sr" for="${id}">Draft</label><select class="btn" id="${id}">${names.map(n => `<option value="${esc(n)}" ${n === p.current ? "selected" : ""}>${esc(n)}</option>`).join("")}</select></span>`;
}
function bindDraftPicker(p, id = "draft-sel") { const s = $("#" + id); if (s) s.onchange = e => switchDraft(e.target.value); }
function unsavedFlash(p) {
  const ch = changedPaths(p); if (!ch.length) return "";
  return `<div class="flash">${ic("alert")}<span><strong>${ch.length} file${ch.length > 1 ? "s" : ""}</strong> with unsaved changes on <span class="branch-name">${esc(p.current)}</span>: ${ch.slice(0, 4).map(c => esc(c.path)).join(", ")}${ch.length > 4 ? "…" : ""}</span><span class="grow"></span>
    <button class="btn btn-sm" data-review>Review changes</button><button class="btn btn-sm btn-primary" data-save>Save version</button></div>`;
}
function bindFlash(p, el) {
  el.querySelectorAll("[data-review]").forEach(b => b.onclick = () => go("compare", { cmp: { a: headId(p), b: "W" } }));
  el.querySelectorAll("[data-save]").forEach(b => b.onclick = saveFlow);
}

/* ============ Files ============ */
function viewFiles(p, el) {
  const head = headId(p), hv = head && p.versions[head], lt = lastTouch(p), ch = changedPaths(p);
  const all = [...new Set([...Object.keys(p.working), ...Object.keys(headTree(p))])].sort();
  const pre = S.dir ? S.dir + "/" : "";
  const folders = new Map(), files = [];
  for (const path of all) {
    if (!path.startsWith(pre)) continue;
    const rest = path.slice(pre.length);
    if (rest.includes("/")) { const f = rest.split("/")[0]; if (!folders.has(f)) folders.set(f, []); folders.get(f).push(path); }
    else files.push(path);
  }
  const touchOf = paths => paths.map(x => lt[x]).filter(Boolean).sort((a, b) => p.versions[b].time - p.versions[a].time)[0];
  const nMs = Object.keys(p.milestones).length, nD = Object.keys(p.drafts).length;
  let ab = null; if (p.current !== "main") ab = aheadBehind(p, p.current);
  const crumbs = S.dir ? `<div class="breadcrumb"><button class="link" data-dir="">${esc(p.name)}</button>${S.dir.split("/").map((seg, i, arr) => ` <span class="muted">/</span> ${i === arr.length - 1 ? `<strong>${esc(seg)}</strong>` : `<button class="link" data-dir="${esc(arr.slice(0, i + 1).join("/"))}">${esc(seg)}</button>`}`).join("")}</div>` : "";
  const row = (icon, name, action, touch, extra = "", cls = "") => `<tr class="${cls}"><td class="ic">${icon}</td><td class="nm"><button class="link" ${action}>${esc(name)}</button> ${extra}</td>
    <td class="msg">${touch ? `<button class="link" data-v="${touch}">${esc(p.versions[touch].message)}</button>` : ""}</td><td class="when">${touch ? `<span title="${fullDate(p.versions[touch].time)}">${ago(p.versions[touch].time)}</span>` : ""}</td></tr>`;
  const words = {}; let totalWords = 0;
  for (const [path, f] of Object.entries(p.working)) { const w = wordCount(f.text); words[typeLabel(path)] = (words[typeLabel(path)] || 0) + w; totalWords += w; }
  const langs = Object.entries(words).sort((a, b) => b[1] - a[1]);
  el.innerHTML = `
    ${unsavedFlash(p)}
    ${ab && ab.ahead ? `<div class="flash info">${ic("info")}<span>This draft is <strong>${ab.ahead} version${ab.ahead > 1 ? "s" : ""} ahead</strong>${ab.behind ? ` and ${ab.behind} behind` : ""} of <span class="branch-name">main</span>.</span><span class="grow"></span><button class="btn btn-sm" data-cmpmain>Compare</button><button class="btn btn-sm btn-primary" data-merge>${ic("merge")} Merge into main</button></div>` : ""}
    <div class="layout"><div>
      <div class="filebar">${draftPicker(p)}
        <button class="link meta-link" data-tab="drafts">${ic("branch")}<strong>${nD}</strong> draft${nD > 1 ? "s" : ""}</button>
        <button class="link meta-link" data-tab="drafts">${ic("milestone")}<strong>${nMs}</strong> milestone${nMs === 1 ? "" : "s"}</button>
        <span class="grow"></span>
        <button class="btn" data-tab="import">${ic("import")} Import</button>
        <button class="btn" id="add-blank">${ic("plus")} New file</button>
        <button class="btn btn-primary" data-save ${ch.length ? "" : "disabled"}>${ic("commit")} Save version${ch.length ? ` <span class="counter">${ch.length}</span>` : ""}</button>
      </div>
      ${crumbs}
      <div class="Box">
        <div class="Box-header">${hv ? `<div class="latest">${avatarImg(ghImgOk() ? hv.avatar : null, hv.login || hv.author || ME, 20)}${whoOf(hv)}<button class="link link-muted" data-v="${head}" style="color:var(--fg)">${esc(hv.message)}</button></div><span class="grow"></span>
          <span class="muted sha">${head.slice(0, 7)}</span><span class="muted">·</span><span class="muted" title="${fullDate(hv.time)}">${ago(hv.time)}</span>
          <button class="btn btn-sm" data-tab="history">${ic("history")} ${Object.keys(p.versions).length} versions</button>` : `<span class="muted">No versions yet on <span class="branch-name">${esc(p.current)}</span>. Add files, then save your first version.</span>`}</div>
        ${all.length ? `<table class="ftable"><tbody>
          ${S.dir ? `<tr><td class="ic">${ic("up")}</td><td class="nm" colspan="3"><button class="link" data-dir="${esc(S.dir.split("/").slice(0, -1).join("/"))}">..</button></td></tr>` : ""}
          ${[...folders.keys()].sort().map(f => row(ic("folder", "solid folder"), f, `data-dir="${esc(pre + f)}"`, touchOf(folders.get(f)), folders.get(f).some(x => fileStatus(p, x) !== "clean") ? `<span class="label label-attention">Changes</span>` : "")).join("")}
          ${files.map(path => { const st = fileStatus(p, path); return row(fileIcon(path), path.slice(pre.length), `data-file="${esc(path)}"`, lt[path], (secFmt(path) && p.working[path] && secIncludes(p, path).length ? `<span class="label" title="Made of section files">${ic("sections")} ${secIncludes(p, path).length} sections</span> ` : "") + limitLabel(p, path) + statusLabel(st), st === "deleted" ? "del" : ""); }).join("")}
        </tbody></table>` : `<div class="blankslate">${ic("import")}<h3>Bring in your writing</h3><p class="muted">Import Google Docs, Word files or a LaTeX project, or start a new file.</p><div class="row"><button class="btn btn-primary" data-tab="import">Import documents</button></div></div>`}
      </div>
    </div>
    <aside class="about">
      <h2>About</h2>
      <p class="${p.description ? "" : "muted"}">${p.description ? esc(p.description) : "No description yet."} <button class="link" id="edit-desc">Edit</button></p>
      <div class="stat">${ic("pilcrow")}<span><strong>${totalWords.toLocaleString()}</strong> words in ${Object.keys(p.working).length} files</span></div>
      <div class="stat">${ic("history")}<span><strong>${Object.keys(p.versions).length}</strong> versions</span></div>
      <div class="stat">${ic("branch")}<span><strong>${nD}</strong> draft${nD > 1 ? "s" : ""}</span></div>
      <div class="stat">${ic("milestone")}<span>${nMs ? `Latest milestone: <strong>${esc(Object.entries(p.milestones).sort((a, b) => (p.versions[b[1]] || {}).time - (p.versions[a[1]] || {}).time)[0][0])}</strong>` : "No milestones yet"}</span></div>
      <hr>
      <h2>Formats</h2>
      ${totalWords ? `<div class="langbar">${langs.map(([l, w]) => `<span style="width:${(100 * w / totalWords).toFixed(1)}%;background:${TYPE_COLOR[l] || "#9198a1"}" title="${l}"></span>`).join("")}</div>
      <ul class="langs">${langs.map(([l, w]) => `<li><span class="sw" style="background:${TYPE_COLOR[l] || "#9198a1"}"></span><strong>${l}</strong> <span class="muted">${(100 * w / totalWords).toFixed(1)}%</span></li>`).join("")}</ul>` : `<p class="muted">No text yet.</p>`}
      <hr>
      <p class="muted" style="font-size:12px">${DB.ok ? "Saved in this browser only. Export a backup to move devices or keep a copy." : "Browser storage is unavailable here, so work lasts until you close this page. Export a backup to keep it."}</p>
    </aside></div>`;
  bindDraftPicker(p); bindFlash(p, el);
  el.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => go(b.dataset.tab));
  el.querySelectorAll("[data-dir]").forEach(b => b.onclick = () => go("files", { dir: b.dataset.dir }));
  el.querySelectorAll("[data-file]").forEach(b => b.onclick = () => {
    const path = b.dataset.file;
    if (!p.working[path]) return go("compare", { cmp: { a: headId(p), b: "W" } });
    go("file", { file: path });
  });
  el.querySelectorAll("[data-v]").forEach(b => b.onclick = () => go("version", { vid: b.dataset.v }));
  el.querySelectorAll("[data-merge]").forEach(b => b.onclick = () => mergeFlow(p.current));
  el.querySelectorAll("[data-cmpmain]").forEach(b => b.onclick = () => go("compare", { cmp: { a: p.drafts.main, b: p.drafts[p.current] } }));
  $("#add-blank").onclick = newFileFlow;
  $("#edit-desc").onclick = async () => { const d = await askText("Edit description", "Description", p.description || "", "Save", "A line about what this project is: “Journal article on algorithmic pricing, revise and resubmit.”"); if (d !== null) { p.description = d; persist(p, true); render(); } };
}

/* ============ File (write / preview) ============ */
function viewFile(p, el) {
  const path = S.file, f = p.working[path];
  if (!f) return go("files");
  const parts = path.split("/"), st = fileStatus(p, path), lt = lastTouch(p)[path], docx = kindOf(path) === "docx", sheet = kindOf(path) === "sheet";
  const mode = S.fileMode || "write";
  const secInc = secFmt(path) ? secIncludes(p, path) : [];
  const lines = (mode === "preview" && secInc.length ? assemble(p, path) : f.text).split("\n");
  const dlOpts = sheet ? [["orig", `Original (.${extOf(path)})`], ...(extOf(path) !== "xlsx" ? [["xlsx", "As Excel (.xlsx)"]] : []), ["csvs", "As CSV (.csv)"]]
    : [["orig", `Original (.${extOf(path)})`], ...(["md", "markdown", "txt"].includes(extOf(path)) ? [["docx", "As Word (.docx)"]] : []), ...(extOf(path) !== "txt" ? [["txt", "As plain text (.txt)"]] : []), ...(secInc.length ? [["combined", "Whole document, sections combined"]] : [])];
  const metaText = () => sheet ? sheetSummary(f.text) : `${f.text.split("\n").length} ${docx ? "paragraphs" : "lines"}`;
  el.innerHTML = `
    ${unsavedFlash(p)}
    <div class="breadcrumb"><button class="link" data-dir="">${esc(p.name)}</button>${parts.map((seg, i) => ` <span class="muted">/</span> ${i === parts.length - 1 ? `<strong>${esc(seg)}</strong>` : `<button class="link" data-dir="${esc(parts.slice(0, i + 1).join("/"))}">${esc(seg)}</button>`}`).join("")}</div>
    <div class="Box" style="margin-bottom:16px"><div class="Box-row" style="flex-wrap:wrap">
      ${lt ? `${avatarImg(ghImgOk() ? p.versions[lt].avatar : null, p.versions[lt].login || ME, 20)}${whoOf(p.versions[lt])}<button class="link link-muted" data-v="${lt}" style="color:var(--fg)">${esc(p.versions[lt].message)}</button><span class="grow"></span><span class="muted sha">${lt.slice(0, 7)}</span><span class="muted">· ${ago(p.versions[lt].time)}</span>` : `<span class="muted">Not in any saved version yet.</span><span class="grow"></span>`}
      <button class="btn btn-sm" data-tab="history">${ic("history")} History</button></div></div>
    ${liveOf(p, path) ? `<div class="flash info live-flash">${ic("people")}<span>Live in <strong>${esc(liveTarget(liveOf(p, path).provider, path))}</strong> · <span data-lst>${liveOf(p, path).lastSeen ? liveStateHtml(liveOf(p, path)) : "shared " + ago(liveOf(p, path).sharedAt)}</span></span><span class="grow"></span><button class="btn btn-sm btn-primary" data-lback>${ic("import")} Bring changes back</button><a class="btn btn-sm" href="${esc(liveOf(p, path).url)}" target="_blank" rel="noopener">Open</a></div>` : ""}
    ${docx || sheet ? `<div class="flash info" id="docx-note">${ic("info")}<span>${noteFor(path, f)}</span></div>` : ""}
    ${sectionsBar(p, path)}
    <div class="Box">
      <div class="Box-header blob-head">
        <div class="seg" role="group" aria-label="Mode"><button aria-pressed="${mode === "write"}" data-mode="write">${ic(sheet ? "fileSheet" : "pencil")} ${sheet ? "Cells" : "Write"}</button><button aria-pressed="${mode === "preview"}" data-mode="preview">${sheet ? "As text" : "Preview"}</button><button aria-pressed="${mode === "blame"}" data-mode="blame" title="Which version last changed each ${docx ? "paragraph" : sheet ? "row" : "line"}">${ic("history")} Line history</button></div>
        <span class="muted" id="f-meta">${metaText()}</span>
        <span class="label">${typeLabel(path)}</span><span id="f-status">${statusLabel(st)}</span>
        <span class="grow"></span>
        ${secFmt(path) && !secInc.length ? `<button class="btn btn-sm" id="f-sec" title="Split this document into section files">${ic("sections")} Sections</button>` : ""}
        ${mode === "write" && !sheet ? `<button class="btn btn-sm" id="f-cite" title="Insert a citation at the cursor">${ic("quote")} Cite</button>` : ""}
        <button class="btn btn-sm" id="f-live">${ic("people")} ${liveOf(p, path) ? "Live" : "Collaborate live"}</button>
        <button class="btn btn-sm" id="f-cmp">${ic("compare")} Changes</button>
        <label class="sr" for="f-dl">Download</label>
        <select class="btn btn-sm" id="f-dl"><option value="">Download</option>${dlOpts.map(([v, l]) => `<option value="${v}">${l}</option>`).join("")}</select>
        <button class="btn-octicon" id="f-ren" title="Rename" aria-label="Rename">${ic("pencil")}</button>
        <button class="btn-octicon" id="f-rm" title="Remove file" aria-label="Remove file">${ic("trash")}</button>
      </div>
      ${mode === "blame" ? `<div id="blame-mount"></div>` : sheet && mode === "write" ? `<div id="grid-mount"></div>` : mode === "write" ? `<label class="sr" for="ed">File text</label><textarea class="editor-area" id="ed" spellcheck="${isProse(path)}">${esc(f.text)}</textarea>`
        : `<div style="overflow-x:auto"><table class="code-view"><tbody>${lines.map((l, i) => `<tr><td class="n">${docx ? "¶" : ""}${i + 1}</td><td class="t">${(sheet ? (l.startsWith(SHEET_HDR) ? "<strong>" + esc(l) + "</strong>" : esc(l).replace(/\t/g, '<span class="csep"></span>')) : esc(l)) || " "}</td></tr>`).join("")}</tbody></table></div>`}
    </div>`;
  bindFlash(p, el);
  el.querySelectorAll("[data-dir]").forEach(b => b.onclick = () => go("files", { dir: b.dataset.dir }));
  el.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => go(b.dataset.tab));
  el.querySelectorAll("[data-v]").forEach(b => b.onclick = () => go("version", { vid: b.dataset.v }));
  el.querySelectorAll("[data-mode]").forEach(b => b.onclick = () => { S.fileMode = b.dataset.mode; viewFile(p, el); });
  const ta = $("#ed");
  if (ta) ta.addEventListener("input", () => {
    f.text = ta.value;
    afterEdit();
  });
  function afterEdit() {
    if ((docx || sheet) && f.orig) { f.orig = null; const n = $("#docx-note span"); if (n) n.textContent = noteFor(path, f); }
    $("#f-meta").textContent = metaText();
    $("#f-status").innerHTML = statusLabel(fileStatus(p, path));
    persist(p); renderRepoHead();
    const fl = el.querySelector(".flash:not(.info)"), html = unsavedFlash(p);
    if (fl && !html) fl.remove();
    else if (html) { const tmp = document.createElement("div"); tmp.innerHTML = html; if (fl) fl.replaceWith(tmp.firstElementChild); else el.prepend(tmp.firstElementChild); bindFlash(p, el); }
  }
  if (sheet && mode === "write") sheetGrid(p, path, f, $("#grid-mount"), afterEdit);
  if (!sheet) mountCountBar(p, path, el);
  if (mode === "blame") blameView(p, path, $("#blame-mount"));
  $("#f-cmp").onclick = () => go("compare", { cmp: { a: headId(p), b: "W" } });
  $("#f-live").onclick = () => shareLiveFlow(p, path);
  bindSections(p, path, el);
  const sb = $("#f-sec"); if (sb) sb.onclick = () => sectionsFlow(p, path);
  const ct = $("#f-cite"); if (ct) ct.onclick = () => citeFlow(p, path, $("#ed"));
  if (ta && S.citeCaret != null) { ta.focus(); ta.setSelectionRange(S.citeCaret, S.citeCaret); S.citeCaret = null; }
  const lb = el.querySelector("[data-lback]"); if (lb) lb.onclick = () => bringBackFlow(p, path);
  if (liveOf(p, path) && !liveBlocked()) liveStatus(p, path).then(() => { const s = el.querySelector("[data-lst]"); if (s) s.innerHTML = liveStateHtml(liveOf(p, path)); }).catch(() => {});
  $("#f-dl").onchange = async e => { const v = e.target.value; e.target.value = ""; if (v) await downloadAs(p, path, v); };
  $("#f-ren").onclick = async () => {
    const name = await askText("Rename file", "Path", path, "Rename", "Use slashes for folders, e.g. chapters/ch2.md"); if (!name || name === path) return;
    if (p.working[name]) return toast("A file with that name already exists.");
    if (kindOf(name) !== kindOf(path)) return toast("Keep the same kind of file (Word stays .docx).");
    p.working[name] = f; delete p.working[path]; persist(p, true); go("file", { file: name });
  };
  $("#f-rm").onclick = async () => {
    if (!await confirmBox("Remove " + path + "?", "It disappears from the next version you save. Past versions keep it, so you can restore it later.", "Remove file", true)) return;
    delete p.working[path]; persist(p, true); go("files");
  };
}


function noteFor(path, f) {
  if (kindOf(path) === "sheet") return f.orig
    ? "Spreadsheet: values and formulas are versioned cell by cell, one row at a time. The original file, with its formatting and charts, is kept until you edit."
    : "Edited spreadsheet: downloads rebuild the workbook with values and formulas only. Earlier versions keep their original files.";
  return f.orig ? "Word document: you're editing its text, one paragraph per line. The original .docx and its formatting are kept until you edit."
    : "Edited Word text: “Original” downloads rebuild a plain .docx. Earlier versions keep their original files.";
}
function sheetGrid(p, path, f, mount, onEdit) {
  const sheets = textToSheets(f.text);
  S.sheetIdx = S.sheetIdx && S.sheetFile === path && S.sheetIdx < sheets.length ? S.sheetIdx : 0; S.sheetFile = path;
  const sh = sheets[S.sheetIdx];
  const MAXR = 500, MAXC = 52;
  const nCols = Math.min(MAXC, Math.max(4, ...sh.rows.map(r => r.length)) + 1), nRows = Math.min(MAXR, Math.max(10, sh.rows.length + 1));
  const big = sh.rows.length >= MAXR || sh.rows.some(r => r.length >= MAXC);
  const isNum = v => /^-?[\d,]*\.?\d+%?$/.test(v);
  mount.innerHTML = `<div class="sheet-tabs">${sheets.map((s, i) => `<button data-sheet="${i}" aria-pressed="${i === S.sheetIdx}">${ic("fileSheet")} ${esc(s.name)}</button>`).join("")}
      <button class="btn-octicon" id="add-sheet" title="Add sheet" aria-label="Add sheet">${ic("plus")}</button><span class="grow"></span>
      <span class="muted" style="font-size:12px">${big ? "Large sheet: showing the first " + MAXR + " rows and " + MAXC + " columns." : "Click a cell to edit. Start with = for a formula."}</span></div>
    <div class="sheet-wrap"><table class="sheet-grid"><thead><tr><th class="corner"></th>${Array.from({ length: nCols }, (_, c) => `<th>${colName(c)}</th>`).join("")}</tr></thead><tbody>
      ${Array.from({ length: nRows }, (_, r) => `<tr><th>${r + 1}</th>${Array.from({ length: nCols }, (_, c) => { const v = (sh.rows[r] || [])[c] || ""; return `<td contenteditable="true" spellcheck="false" data-r="${r}" data-c="${c}" class="${v.startsWith("=") ? "fx" : isNum(v) ? "num" : ""}">${esc(v)}</td>`; }).join("")}</tr>`).join("")}
    </tbody></table></div>`;
  let grew = false;
  mount.querySelectorAll("[data-sheet]").forEach(b => b.onclick = () => { S.sheetIdx = +b.dataset.sheet; sheetGrid(p, path, f, mount, onEdit); });
  $("#add-sheet", mount).onclick = async () => {
    const name = await askText("Add sheet", "Sheet name", "Sheet" + (sheets.length + 1), "Add"); if (!name) return;
    sheets.push({ name, rows: [] }); f.text = sheetsToText(sheets); S.sheetIdx = sheets.length - 1; onEdit(); sheetGrid(p, path, f, mount, onEdit);
  };
  const tbody = mount.querySelector("tbody");
  tbody.addEventListener("input", e => {
    const td = e.target.closest("td"); if (!td) return;
    const r = +td.dataset.r, c = +td.dataset.c, v = td.textContent.replace(/\t/g, " ").replace(/\n/g, " ");
    while (sh.rows.length <= r) sh.rows.push([]);
    const row = sh.rows[r]; while (row.length <= c) row.push("");
    row[c] = v; td.className = v.startsWith("=") ? "fx" : isNum(v) ? "num" : "";
    if (r >= nRows - 1 || c >= nCols - 1) grew = true;
    f.text = sheetsToText(sheets); onEdit();
  });
  tbody.addEventListener("keydown", e => {
    const td = e.target.closest("td"); if (!td) return;
    if (e.key === "Enter") { e.preventDefault(); const next = tbody.querySelector(`td[data-r="${+td.dataset.r + 1}"][data-c="${td.dataset.c}"]`); if (next) next.focus(); }
  });
  tbody.addEventListener("paste", e => {
    const td = e.target.closest("td"); if (!td) return;
    const txt = e.clipboardData.getData("text/plain"); if (!txt.includes("\t") && !txt.includes("\n")) return;
    e.preventDefault();
    const block = parseDelimited(txt.replace(/\n$/, ""), "\t"), r0 = +td.dataset.r, c0 = +td.dataset.c;
    block.forEach((cells, i) => { while (sh.rows.length <= r0 + i) sh.rows.push([]); const row = sh.rows[r0 + i]; cells.forEach((v, j) => { while (row.length <= c0 + j) row.push(""); row[c0 + j] = v.replace(/\n/g, " "); }); });
    f.text = sheetsToText(textToSheets(sheetsToText(sheets))); onEdit(); sheetGrid(p, path, f, mount, onEdit); toast(`Pasted ${block.length} row${block.length > 1 ? "s" : ""}.`);
  });
  tbody.addEventListener("focusout", () => { if (grew) { grew = false; setTimeout(() => { if (!mount.contains(document.activeElement)) sheetGrid(p, path, f, mount, onEdit); }, 0); } });
}

/* ============ History ============ */
function viewHistory(p, el) {
  const head = headId(p);
  const ids = [...ancestors(p, head)].sort((a, b) => p.versions[b].time - p.versions[a].time);
  const groups = []; for (const id of ids) { const d = shortDate(p.versions[id].time); const g = groups.at(-1); if (g && g.d === d) g.ids.push(id); else groups.push({ d, ids: [id] }); }
  const ch = changedPaths(p);
  el.innerHTML = `
    <div class="filebar">${draftPicker(p)}<span class="grow"></span><button class="btn" data-tab="compare">${ic("compare")} Compare versions</button></div>
    ${ch.length ? `<div class="tl-group"><div class="tl-date"><span class="dot">${ic("pencil")}</span>Not saved yet</div>
      <div class="Box" style="border-style:dashed"><div class="vrow"><div class="vmain"><div class="vmsg"><strong>Unsaved changes</strong>${ch.map(c => `<span class="label">${esc(c.path)}</span>`).join("")}</div></div>
      <div class="vacts"><button class="btn btn-sm" data-review>Review</button><button class="btn btn-sm btn-primary" data-save>Save version</button></div></div></div></div>` : ""}
    ${groups.map(g => `<div class="tl-group"><div class="tl-date"><span class="dot">${ic("commit")}</span>Versions on ${g.d}</div><div class="Box">
      ${g.ids.map(id => {
        const v = p.versions[id], s = versionStat(p, id), ms = milestonesOf(p, id), heads = draftHeadsAt(p, id);
        return `<div class="vrow"><div class="vmain">
          <div class="vmsg"><button class="link" data-v="${id}">${esc(v.message)}</button>${ms.map(m => `<span class="label label-done">${ic("milestone")}${esc(m)}</span>`).join("")}${heads.map(h => `<span class="branch-name">${esc(h)}</span>`).join("")}</div>
          <div class="vmeta">${avatarImg(ghImgOk() ? v.avatar : null, v.login || v.author || ME, 20)}${whoOf(v)} saved <span title="${fullDate(v.time)}">${ago(v.time)}</span>${v.draft !== "main" ? ` on <span class="branch-name">${esc(v.draft)}</span>` : ""}
            · ${s.files} file${s.files === 1 ? "" : "s"} · <span class="add">+${s.ins}</span> <span class="del">−${s.del}</span> words ${diffstatBlocks(s.ins, s.del)}${v.parent2 ? ` · <span class="label">${ic("merge")}merge</span>` : ""}</div></div>
          <div class="vacts"><button class="btn btn-sm sha" data-v="${id}" title="View changes">${id.slice(0, 7)}</button>
            <button class="btn btn-sm" data-restore="${id}" title="Make this the current text">${ic("undo")} Restore</button>
            <button class="btn-octicon" data-branch="${id}" title="New draft from here" aria-label="New draft from here">${ic("branch")}</button>
            <button class="btn-octicon" data-mile="${id}" title="${ms.length ? "Edit milestone" : "Add milestone"}" aria-label="Milestone">${ic("milestone")}</button>
            <button class="btn-octicon" data-dl="${id}" title="Download this version (.zip)" aria-label="Download">${ic("download")}</button></div></div>`;
      }).join("")}</div></div>`).join("")}
    ${ids.length ? "" : `<div class="Box blankslate">${ic("history")}<h3>No versions yet</h3><p class="muted">Save a version to start the history of <span class="branch-name">${esc(p.current)}</span>.</p></div>`}`;
  bindDraftPicker(p); bindFlash(p, el);
  el.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => go(b.dataset.tab));
  el.querySelectorAll("[data-v]").forEach(b => b.onclick = () => go("version", { vid: b.dataset.v }));
  el.querySelectorAll("[data-restore]").forEach(b => b.onclick = () => restoreFlow(b.dataset.restore));
  el.querySelectorAll("[data-branch]").forEach(b => b.onclick = () => newDraftFlow(b.dataset.branch));
  el.querySelectorAll("[data-mile]").forEach(b => b.onclick = () => milestoneFlow(b.dataset.mile));
  el.querySelectorAll("[data-dl]").forEach(b => b.onclick = () => downloadVersion(p, b.dataset.dl));
}

/* ============ Version page ============ */
function viewVersion(p, el) {
  const id = S.vid, v = p.versions[id];
  if (!v) return go("history");
  const ms = milestonesOf(p, id);
  el.innerHTML = `
    <div class="vhead"><div class="title">${esc(v.message)}${ms.map(m => `<span class="label label-done">${ic("milestone")}${esc(m)}</span>`).join("")}
      <span class="grow"></span><button class="btn btn-sm" data-restore>${ic("undo")} Restore</button><button class="btn btn-sm" data-branch>${ic("branch")} New draft</button><button class="btn btn-sm" data-dl>${ic("download")} .zip</button></div>
      <div class="foot">${avatarImg(ghImgOk() ? v.avatar : null, v.login || v.author || ME, 20)}<span style="color:var(--fg)">${whoOf(v)}</span> saved ${ago(v.time)} on <span class="branch-name">${esc(v.draft)}</span>
        <span class="grow"></span>${v.parent ? `${v.parent2 ? "2 parents" : "1 parent"} <button class="link sha" data-v="${v.parent}">${v.parent.slice(0, 7)}</button>${v.parent2 ? ` + <button class="link sha" data-v="${v.parent2}">${v.parent2.slice(0, 7)}</button>` : ""}` : "first version"} · version <span class="sha" style="color:var(--fg)">${id.slice(0, 7)}</span></div></div>
    <div id="diffs"></div>`;
  el.querySelectorAll("[data-v]").forEach(b => b.onclick = () => go("version", { vid: b.dataset.v }));
  $("[data-restore]", el).onclick = () => restoreFlow(id);
  $("[data-branch]", el).onclick = () => newDraftFlow(id);
  $("[data-dl]", el).onclick = () => downloadVersion(p, id);
  renderDiffs(p, v.parent || null, id, $("#diffs"));
}

/* ============ Diff rendering ============ */
function renderDiffs(p, a, b, mount, opts = {}) {
  const paths = [...new Set([...(a ? refPaths(p, a) : []), ...refPaths(p, b)])].sort();
  const files = paths.filter(x => refText(p, a, x) !== refText(p, b, x) || refExists(p, a, x) !== refExists(p, b, x)).map(path => ({ path, ...buildRows(refText(p, a, path), refText(p, b, path)) }));
  const ins = files.reduce((s, f) => s + f.ins, 0), del = files.reduce((s, f) => s + f.del, 0);
  if (!files.length) { mount.innerHTML = `<div class="Box blankslate">${ic("check")}<h3>There isn't anything to compare</h3><p class="muted">These two are identical.</p></div>`; return; }
  mount.innerHTML = `<div class="toc"><span>Showing <strong>${files.length} changed file${files.length > 1 ? "s" : ""}</strong> with <span class="add">${ins} added</span> and <span class="del">${del} removed</span> words.</span>
      <div class="seg" role="group" aria-label="Diff layout"><button aria-pressed="${S.mode === "unified"}" data-dm="unified">Unified</button><button aria-pressed="${S.mode === "split"}" data-dm="split">${ic("compare")} Side by side</button></div></div>
    ${files.map((f, i) => {
      const inA = a ? refExists(p, a, f.path) : false, inB = refExists(p, b, f.path);
      return `<div class="fdiff" id="fd-${i}"><div class="fdiff-head"><button class="btn-octicon" data-toggle="${i}" aria-label="Collapse file">${ic("chevd")}</button>
        <span class="add">+${f.ins}</span><span class="del">−${f.del}</span>${diffstatBlocks(f.ins, f.del)}${fileIcon(f.path)}<span class="fn">${esc(f.path)}</span>
        ${!inA ? `<span class="label label-success">New</span>` : !inB ? `<span class="label label-danger">Removed</span>` : ""}<span class="label">${typeLabel(f.path)}</span>
        <span class="grow"></span>${p.working[f.path] ? `<button class="btn btn-sm" data-open="${esc(f.path)}">View file</button>` : ""}</div>
        <div class="fdiff-body" data-path="${esc(f.path)}">${S.mode === "split" && kindOf(f.path) !== "sheet"
          ? docSplit(f.rows, f.path, [pageHead(p, a, f.path, "Before"), pageHead(p, b, f.path, "After")], !!opts.onComment)
          : diffTable(f.rows, S.mode, f.path, kindOf(f.path) === "sheet" ? [sheetRowLabels(refText(p, a, f.path)), sheetRowLabels(refText(p, b, f.path))] : null, !!opts.onComment)}</div></div>`;
    }).join("")}`;
  mount.querySelectorAll("[data-dm]").forEach(x => x.onclick = () => { S.mode = x.dataset.dm; renderDiffs(p, a, b, mount, opts); });
  if (opts.onComment) mount.querySelectorAll("[data-cm]").forEach(x => x.onclick = () => { const body = x.closest(".fdiff-body"); opts.onComment(body.dataset.path, x.dataset.cl, x.dataset.cm); });
  mount.querySelectorAll("[data-toggle]").forEach(x => x.onclick = () => { const box = $("#fd-" + x.dataset.toggle, mount); box.classList.toggle("closed"); x.innerHTML = box.classList.contains("closed") ? ic("chevr") : ic("chevd"); });
  mount.querySelectorAll("[data-open]").forEach(x => x.onclick = () => go("file", { file: x.dataset.open }));
  mount.querySelectorAll("[data-dexp]").forEach(x => x.onclick = () => { const h = x.closest(".dfold").nextElementSibling; if (h) h.hidden = false; x.closest(".dfold").remove(); });
  mount.querySelectorAll("[data-exp]").forEach(x => x.onclick = () => { const tb = x.closest("tbody").nextElementSibling; if (tb && tb.hasAttribute("hidden")) { tb.hidden = false; x.closest("tbody").querySelectorAll("[data-exp]").forEach(e => e.remove()); } });
}
function diffTable(rows, mode, file, labels, commentable) {
  const docx = kindOf(file) === "docx", sheet = kindOf(file) === "sheet", unit = unitName(file);
  let side = 0;
  const lnA = n => n ? (labels ? labels[0][n - 1] : docx ? "¶" + n : n) : "", lnB = n => n ? (labels ? labels[1][n - 1] : docx ? "¶" + n : n) : "";
  const fmt = h => !sheet ? h : h.startsWith(esc(SHEET_HDR)) ? `<strong>${ic("fileSheet")} ${h.slice(esc(SHEET_HDR).length)}</strong>` : h.replace(/\t/g, '<span class="csep"></span>');
  const split = mode === "split";
  const plain = h => (h || "").replace(/<[^>]+>/g, "");
  const cbtn = (r, html, n) => commentable ? `<button class="addc" data-cm="${plain(html)}" data-cl="${esc(String(n || ""))}" title="Comment on this" aria-label="Comment on this">+</button>` : "";
  const rowHtml0 = r => {
    if (split) {
      if (r.t === "=") return `<tr><td class="ln">${lnA(r.a)}</td><td>${fmt(r.text) || " "}</td><td class="ln">${lnB(r.b)}</td><td>${fmt(r.text) || " "}</td></tr>`;
      if (r.t === "~") return `<tr><td class="ln n-del">${lnA(r.a)}</td><td class="c-del">${fmt(r.L) || " "}</td><td class="ln n-ins">${lnB(r.b)}</td><td class="c-ins">${fmt(r.R) || " "}</td></tr>`;
      if (r.t === "-") return `<tr><td class="ln n-del">${lnA(r.a)}</td><td class="c-del">${fmt(r.text) || " "}</td><td class="ln empty"></td><td class="empty"></td></tr>`;
      return `<tr><td class="ln empty"></td><td class="empty"></td><td class="ln n-ins">${lnB(r.b)}</td><td class="c-ins">${fmt(r.text) || " "}</td></tr>`;
    }
    if (r.t === "=") return `<tr><td class="ln">${lnA(r.a)}</td><td class="ln">${lnB(r.b)}</td><td class="mk"> </td><td>${fmt(r.text) || " "}</td></tr>`;
    if (r.t === "~") return `<tr class="rdel"><td class="ln">${lnA(r.a)}</td><td class="ln"></td><td class="mk">-</td><td>${fmt(r.L) || " "}</td></tr><tr class="rins"><td class="ln"></td><td class="ln">${lnB(r.b)}</td><td class="mk">+</td><td>${fmt(r.R) || " "}</td></tr>`;
    if (r.t === "-") return `<tr class="rdel"><td class="ln">${lnA(r.a)}</td><td class="ln"></td><td class="mk">-</td><td>${fmt(r.text) || " "}</td></tr>`;
    return `<tr class="rins"><td class="ln"></td><td class="ln">${lnB(r.b)}</td><td class="mk">+</td><td>${fmt(r.text) || " "}</td></tr>`;
  };
  const rowHtml = r => {
    let h = rowHtml0(r);
    if (!commentable || r.t === "=") return h;
    const txt = r.t === "~" ? r.R : r.text, n = r.t === "-" ? lnA(r.a) : lnB(r.b);
    return h.replace(/<td(?: class="(c-ins|c-del)")?>(?![\s\S]*<td)/, m => m + cbtn(r, txt, n));
  };
  const C = 3, ch = rows.map(r => r.t !== "=");
  const near = rows.map((_, i) => { for (let j = Math.max(0, i - C); j <= Math.min(rows.length - 1, i + C); j++) if (ch[j]) return true; return false; });
  const span = split ? 3 : 3;
  const hunk = (hidden, header) => `<tr class="hunk"><td class="ln">${hidden ? `<button data-exp title="Show ${hidden} unchanged ${unit}s" aria-label="Expand">⋯</button>` : ""}</td><td colspan="${span}">${header}${hidden ? ` <button data-exp>Show ${hidden} unchanged ${unit}${hidden === 1 ? "" : "s"}</button>` : ""}</td></tr>`;
  let html = "", i = 0;
  while (i < rows.length) {
    let hid = "", hn = 0;
    while (i < rows.length && !near[i]) { hid += rowHtml(rows[i++]); hn++; }
    if (i >= rows.length) { if (hn) html += `<tbody>${hunk(hn, "")}</tbody><tbody hidden>${hid}</tbody>`; break; }
    const chunk = []; while (i < rows.length && near[i]) chunk.push(rows[i++]);
    const as = chunk.filter(r => r.a), bs = chunk.filter(r => r.b);
    const header = `@@ -${as.length ? as[0].a : 0},${as.length} +${bs.length ? bs[0].b : 0},${bs.length} @@`;
    html += `<tbody>${hunk(hn, header)}</tbody>${hn ? `<tbody hidden>${hid}</tbody>` : ""}<tbody>${chunk.map(rowHtml).join("")}</tbody>`;
  }
  const cols = split ? `<col style="width:52px"><col><col style="width:52px"><col>` : `<col style="width:52px"><col style="width:52px"><col style="width:20px"><col>`;
  return `<table class="diff"><colgroup>${cols}</colgroup>${html}</table>`;
}


/* ============ Side-by-side "pages" view for prose (Word/Docs-like) ============ */
const unesc = s => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
const stripTags = h => (h || "").replace(/<[^>]+>/g, "");
function pageHead(p, ref, path, side) {
  const text = ref ? refText(p, ref, path) : "";
  const v = ref && ref !== "W" ? p.versions[ref] : null;
  const label = ref === "W" ? "Current text" : v ? v.message : "Not in this version";
  const when = ref === "W" ? "unsaved changes included" : v ? shortDate(v.time) + " · " + ref.slice(0, 7) : "";
  return { side, label, when, words: wordCount(text), exists: ref ? refExists(p, ref, path) : false };
}
const TEX_SRC = /^\\(documentclass|usepackage|begin|end|maketitle|title|author|date|input|include|bibliography|bibliographystyle|label|appendix|newcommand|renewcommand|setlength|tableofcontents|clearpage|newpage|centering)\b/;
function docLine(html, file) {
  const raw = unesc(stripTags(html)), ext = extOf(file), t = raw.trim();
  if (!t) return { cls: "blank", html: "" };
  let m, cls = "p", h = html;
  if (ext === "md" || ext === "markdown") {
    if ((m = /^(#{1,6})\s+/.exec(t))) { cls = "h" + Math.min(3, m[1].length); h = h.replace(/^(\s*)(<(?:ins|del)>)?#{1,6}\s+/, "$1$2"); }
    else if (/^\s*[-*]\s+/.test(raw)) { cls = "li"; h = h.replace(/^(\s*)(<(?:ins|del)>)?\s*[-*]\s+/, "$1$2"); }
    else if (/^\s*\d+\.\s+/.test(raw)) { cls = "li num"; }
    else if (/^>\s?/.test(t)) { cls = "quote"; h = h.replace(/^(\s*)(<(?:ins|del)>)?&gt;\s?/, "$1$2"); }
    h = h.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>").replace(/\[([^\]]+)\]\([^)]*\)/g, '<span class="dlink">$1</span>');
  } else if (["tex", "cls", "sty"].includes(ext)) {
    if (/^%/.test(t) || TEX_SRC.test(t)) cls = "src";
    else if ((m = /^\\(sub)*section\*?\{/.exec(t))) { cls = (m[0].match(/sub/g) || []).length ? "h3" : "h2"; h = h.replace(/^\s*\\(?:sub)*section\*?\{([\s\S]*)\}\s*$/, "$1"); }
    else if (/^\\item\b/.test(t)) { cls = "li"; h = h.replace(/^(\s*)(<(?:ins|del)>)?\\item\s*/, "$1$2"); }
    if (cls !== "src") h = h.replace(/\\textbf\{([^{}]*)\}/g, "<strong>$1</strong>").replace(/\\(?:emph|textit)\{([^{}]*)\}/g, "<em>$1</em>")
      .replace(/\\cite[pt]?\{([^{}]*)\}/g, '<span class="dcite">[$1]</span>').replace(/---/g, "—").replace(/--/g, "–").replace(/``/g, "“").replace(/''/g, "”").replace(/\\%/g, "%").replace(/\\&amp;/g, "&amp;").replace(/~/g, " ");
  } else if (ext === "bib") cls = "src";
  // Source indentation means nothing on a page: drop it so wrapped lines align (keeps any leading <ins>/<del> tag).
  if (cls !== "src") h = h.replace(/^((?:<(?:ins|del)>)?)[ \t]+/, "$1");
  return { cls, html: h.replace(/\t/g, "    ") };
}
function docSplit(rows, file, heads, commentable) {
  const docx = kindOf(file) === "docx", unit = unitName(file);
  const cell = (side, state, html, extra = "") => {
    if (state === "empty") return `<div class="dc ${side} empty"></div>`;
    const d = docLine(html, file);
    return `<div class="dc ${side} ${state} ${d.cls}">${extra}${d.cls === "li" ? '<span class="bul">•</span>' : ""}${d.html || (d.cls === "blank" ? "" : " ")}</div>`;
  };
  const chip = (kind, ins, del) => `<div class="dg"><span class="dchip ${kind}">${kind === "edit" ? "Edited" : kind === "add" ? "Added" : "Cut"}</span>${kind === "edit" ? `<span class="dnum"><span class="add">+${ins}</span> <span class="del">−${del}</span></span>` : ""}</div>`;
  const countIn = (h, tag) => { let n = 0; h.replace(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "g"), (_, x) => { n += wordCount(unesc(x)); return ""; }); return n; };
  const cb = (txt, n) => commentable ? `<button class="addc doc" data-cm="${stripTags(txt)}" data-cl="${esc(String(n || ""))}" title="Comment on this" aria-label="Comment on this">+</button>` : "";
  // One margin label per block of consecutive changes of the same kind.
  let prevKind = null;
  const label = (kind, ...n) => { const same = kind === prevKind && kind !== "edit"; prevKind = kind; return same ? `<div class="dg"></div>` : chip(kind, ...n); };
  const rowHtml = r => {
    if (r.t === "=") { prevKind = null; return cell("L", "same", r.text) + `<div class="dg"></div>` + cell("R", "same", r.text); }
    if (r.t === "~") return cell("L", "chg", r.L) + label("edit", countIn(r.R, "ins"), countIn(r.L, "del")) + cell("R", "chg", r.R, cb(r.R, docx ? "¶" + r.b : r.b));
    if (r.t === "-") return cell("L", "cut", r.text, cb(r.text, docx ? "¶" + r.a : r.a)) + label("cut") + cell("R", "empty");
    return cell("L", "empty") + label("add") + cell("R", "add", r.text, cb(r.text, docx ? "¶" + r.b : r.b));
  };
  const C = 2, ch = rows.map(r => r.t !== "=");
  const near = rows.map((_, i) => { for (let j = Math.max(0, i - C); j <= Math.min(rows.length - 1, i + C); j++) if (ch[j]) return true; return false; });
  const head = h => `<div class="dhead ${h.side}"><div class="dtitle">${ic(docx ? "fileWord" : "file")}<span>${h.side}</span></div><div class="dsub" title="${esc(h.label)}">${esc(h.label)}</div><div class="dmeta">${h.exists ? `${h.when} · ${h.words.toLocaleString()} word${h.words === 1 ? "" : "s"}` : "file not present"}</div></div>`;
  let body = "", i = 0;
  while (i < rows.length) {
    if (near[i]) { body += rowHtml(rows[i++]); continue; }
    let hid = "", n = 0, k = 0; while (i < rows.length && !near[i]) { hid += rowHtml(rows[i++]); k++; if (rows[i - 1].text && stripTags(rows[i - 1].text).trim()) n++; }
    if (k < 3) { body += hid; continue; }
    body += `<div class="dfold"><button data-dexp>⋯ ${n || "a few"} unchanged ${unit}${n === 1 ? "" : "s"}</button></div><div class="dhid" hidden>${hid}</div>`;
  }
  return `<div class="docdiff ${["md", "markdown", "tex", "cls", "sty", "bib"].includes(extOf(file)) ? "rendered" : ""}">${head(heads[0])}<div class="dg dg-head"></div>${head(heads[1])}<div class="dc L blank"></div><div class="dg"></div><div class="dc R blank"></div>${body}<div class="dfoot L"></div><div class="dg"></div><div class="dfoot R"></div></div>`;
}

/* ============ Compare ============ */
function refOptions(p, sel, withWorking) {
  const ids = Object.keys(p.versions).sort((a, b) => p.versions[b].time - p.versions[a].time);
  const vl = id => `${id.slice(0, 7)} · ${p.versions[id].message}`;
  const opt = (v, l, mark) => `<option value="${v}" ${mark && v === sel ? "selected" : ""}>${esc(l)}</option>`;
  return (withWorking ? opt("W", "Current text (includes unsaved changes)", true) : "") +
    `<optgroup label="Drafts">${Object.entries(p.drafts).filter(([, v]) => v).map(([n, v]) => opt(v, "draft: " + n, false)).join("")}</optgroup>` +
    (Object.keys(p.milestones).length ? `<optgroup label="Milestones">${Object.entries(p.milestones).map(([n, v]) => opt(v, "◆ " + n, false)).join("")}</optgroup>` : "") +
    `<optgroup label="Versions">${ids.map(id => opt(id, vl(id), true)).join("")}</optgroup>`;
}
function viewCompare(p, el) {
  const head = headId(p);
  if (!Object.keys(p.versions).length) { el.innerHTML = `<div class="Box blankslate">${ic("compare")}<h3>Nothing to compare yet</h3><p class="muted">Save a version, make some edits, then compare.</p></div>`; return; }
  const c = S.cmp;
  if (!c.b || (c.b !== "W" && !p.versions[c.b])) c.b = changedPaths(p).length ? "W" : head;
  if (!c.a || !p.versions[c.a]) c.a = c.b === "W" ? head : (p.versions[c.b].parent || head);
  el.innerHTML = `
    <div class="subhead"><h2>Compare changes</h2></div>
    <p class="muted" style="margin:-8px 0 16px">Pick any two versions, drafts or milestones, or compare against your current text.</p>
    <div class="Box" style="margin-bottom:16px"><div class="range">${ic("compare")}
      <label class="sr" for="c-a">Base</label><span class="muted">base:</span><select class="btn btn-sm" id="c-a">${refOptions(p, c.a, false)}</select>
      <span class="arrow">←</span>
      <label class="sr" for="c-b">Compare</label><span class="muted">compare:</span><select class="btn btn-sm" id="c-b">${refOptions(p, c.b, true)}</select>
      <button class="btn-octicon" id="c-swap" title="Swap base and compare" aria-label="Swap">⇄</button></div></div>
    <div id="diffs"></div>`;
  $("#c-a").onchange = e => { c.a = e.target.value; viewCompare(p, el); };
  $("#c-b").onchange = e => { c.b = e.target.value; viewCompare(p, el); };
  $("#c-swap").onclick = () => { if (c.b === "W") return toast("Current text can only be on the compare side."); [c.a, c.b] = [c.b, c.a]; viewCompare(p, el); };
  renderDiffs(p, c.a, c.b, $("#diffs"));
}

/* ============ Drafts & milestones ============ */
function viewDrafts(p, el) {
  const others = Object.keys(p.drafts).filter(n => n !== "main").sort();
  const upd = n => p.drafts[n] ? `<span class="muted" title="${fullDate(p.versions[p.drafts[n]].time)}">Updated ${ago(p.versions[p.drafts[n]].time)}</span>` : `<span class="muted">No versions yet</span>`;
  const maxAB = Math.max(1, ...others.map(n => { const x = aheadBehind(p, n); return Math.max(x.ahead, x.behind); }));
  const draftRow = n => {
    const isMain = n === "main", ab = isMain ? null : aheadBehind(p, n);
    return `<div class="Box-row" style="flex-wrap:wrap">${ic("branch")}<span class="branch-name">${esc(n)}</span>${upd(n)}
      ${n === p.current ? `<span class="label label-accent">Current</span>` : ""}${isMain ? `<span class="label">Default</span>` : ""}<span class="grow"></span>
      ${ab ? `<span class="aheadbehind" title="${ab.behind} behind, ${ab.ahead} ahead of main"><span class="b">${ab.behind}<div class="bar" style="width:${Math.round(56 * ab.behind / maxAB)}px"></div></span><span class="a">${ab.ahead}<div class="bar" style="width:${Math.round(56 * ab.ahead / maxAB)}px"></div></span></span>` : ""}
      ${n !== p.current ? `<button class="btn btn-sm" data-switch="${esc(n)}">Switch to</button>` : ""}
      ${ab && ab.ahead ? `<button class="btn btn-sm" data-cmp="${esc(n)}">Compare</button>${isRemote(p) ? `<button class="btn btn-sm btn-primary" data-rev="${esc(n)}">${ic("merge")} Request review</button><button class="btn btn-sm" data-merge="${esc(n)}">Merge now</button>` : `<button class="btn btn-sm btn-primary" data-merge="${esc(n)}">${ic("merge")} Merge into main</button>`}` : ""}
      ${!isMain ? `<button class="btn-octicon" data-del="${esc(n)}" title="Delete draft" aria-label="Delete draft ${esc(n)}">${ic("trash")}</button>` : ""}</div>`;
  };
  const ms = Object.entries(p.milestones).filter(([, v]) => p.versions[v]).sort((a, b) => p.versions[b[1]].time - p.versions[a[1]].time);
  el.innerHTML = `
    <div class="subhead"><h2>Drafts</h2><button class="btn btn-primary" id="d-new">${ic("branch")} New draft</button></div>
    <p class="muted" style="margin:-8px 0 16px">A draft is a parallel line of versions for trying an alternative (a shorter summary, a new structure) without touching <span class="branch-name">main</span>.</p>
    <div class="Box" style="margin-bottom:16px"><div class="Box-header"><strong>Default draft</strong></div>${draftRow("main")}</div>
    <div class="Box" style="margin-bottom:32px"><div class="Box-header"><strong>Your drafts</strong></div>${others.map(draftRow).join("") || `<div class="Box-body muted">No drafts yet.</div>`}</div>
    <div class="subhead"><h2>Milestones</h2></div>
    <div class="Box">${ms.map(([n, v]) => `<div class="Box-row" style="flex-wrap:wrap">${ic("milestone")}<strong>${esc(n)}</strong><button class="link link-muted" data-v="${v}">${esc(p.versions[v].message)}</button><span class="muted sha">${v.slice(0, 7)}</span><span class="grow"></span><span class="muted">${shortDate(p.versions[v].time)}</span>
      <button class="btn btn-sm" data-dl="${v}">${ic("download")} .zip</button><button class="btn-octicon" data-rmms="${esc(n)}" title="Remove milestone" aria-label="Remove milestone ${esc(n)}">${ic("trash")}</button></div>`).join("")
      || `<div class="Box-body muted">No milestones yet. Mark a version as “Sent to reviewers” or “Submitted” from History.</div>`}</div>`;
  $("#d-new").onclick = () => newDraftFlow(headId(p));
  el.querySelectorAll("[data-switch]").forEach(b => b.onclick = () => switchDraft(b.dataset.switch));
  el.querySelectorAll("[data-merge]").forEach(b => b.onclick = () => mergeFlow(b.dataset.merge));
  el.querySelectorAll("[data-rev]").forEach(b => b.onclick = () => requestReviewFlow(p, b.dataset.rev));
  el.querySelectorAll("[data-cmp]").forEach(b => b.onclick = () => go("compare", { cmp: { a: p.drafts.main, b: p.drafts[b.dataset.cmp] } }));
  el.querySelectorAll("[data-del]").forEach(b => b.onclick = () => deleteDraftFlow(b.dataset.del));
  el.querySelectorAll("[data-v]").forEach(b => b.onclick = () => go("version", { vid: b.dataset.v }));
  el.querySelectorAll("[data-dl]").forEach(b => b.onclick = () => downloadVersion(p, b.dataset.dl));
  el.querySelectorAll("[data-rmms]").forEach(b => b.onclick = () => { delete p.milestones[b.dataset.rmms]; persist(p, true); render(); });
}

/* ============ Import ============ */
function viewImport(p, el) {
  const log = S.importLog;
  const src = (color, glyph, title, fmts, steps, acts, note = "") => `<div class="Box source"><div class="Box-header"><span class="srcicon" style="background:${color}">${glyph}</span><strong>${title}</strong></div>
    <div class="Box-body"><div class="fmt">${fmts.map(f => `<span class="label">${f}</span>`).join("")}</div><ol>${steps.map(s => `<li>${s}</li>`).join("")}</ol>${note ? `<p class="muted" style="margin:0;font-size:12px">${note}</p>` : ""}<div class="acts">${acts}</div></div></div>`;
  el.innerHTML = `
    <div class="subhead"><h2>Import documents</h2></div>
    <p class="muted" style="margin:-8px 0 16px">Move writing in from Google Docs, Word, Excel, Google Sheets, LaTeX/Overleaf and Markdown. Files are read in your browser; nothing is uploaded.</p>
    ${log ? `<div class="Box" style="margin-bottom:16px"><div class="Box-header">${ic("check")}<strong>Last import</strong><span class="muted">${log.filter(x => x.status !== "skipped").length} added · ${log.filter(x => x.status === "skipped").length} skipped${log.saved ? ` · saved as version <span class="sha">${log.saved.slice(0, 7)}</span>` : ""}</span><span class="grow"></span><button class="btn btn-sm" data-tab="files">Go to files</button></div>
      <ul class="log">${log.map(x => `<li>${x.status === "skipped" ? `<span class="label label-danger">Skipped</span>` : x.status === "converted" ? `<span class="label label-done">Converted</span>` : x.status === "replaced" ? `<span class="label label-attention">Updated</span>` : `<span class="label label-success">Added</span>`}<span class="mono">${esc(x.path)}</span><span class="muted">${esc(x.note || "")}</span></li>`).join("")}</ul></div>` : ""}
    <div class="Box" style="margin-bottom:16px">
      <div class="import-opts">
        <label for="imp-dir">Put files in folder<input type="text" id="imp-dir" placeholder="Top level" value="${esc(S.importDir || "")}"></label>
        <label class="check"><input type="checkbox" id="imp-save" ${S.importSave !== false ? "checked" : ""}> Save a version right after importing</label>
      </div>
      <div style="padding:0 16px 16px"><div class="dropzone" id="drop">${ic("import")}<strong>Drag files, a folder or a .zip here</strong>
        <span class="muted">.docx · .odt · .xlsx · .csv · .ods · .md · .txt · .html · .tex · .bib · .ris · Overleaf .zip</span>
        <div class="row"><label class="btn btn-sm" for="in-files">Choose files</label><label class="btn btn-sm" for="in-folder">Choose a folder</label></div>
        <input type="file" id="in-files" multiple accept="${ACCEPT}" hidden><input type="file" id="in-folder" webkitdirectory multiple hidden></div></div>
    </div>
    <div class="sources">
      ${src("#1a73e8", ic("file"), "Google Docs", [".docx", ".md", ".odt", ".html", "paste"], [
        "<strong>Fastest:</strong> in your Google Doc press Ctrl/⌘ A, then Ctrl/⌘ C, then use <em>Paste from Google Docs</em>. Headings, bold, italics, lists and links come across as Markdown.",
        "<strong>Keep it as Word:</strong> File › Download › Microsoft Word (.docx), then drop the file here.",
        "Also works: File › Download › Markdown, OpenDocument or Web page (.zip)."
      ], `<button class="btn btn-sm btn-primary" id="paste-gdocs">${ic("paste")} Paste from Google Docs</button><label class="btn btn-sm" for="in-files">Choose downloaded file</label>`, "Importing straight from Google Drive needs the Google Drive connection. That's planned next.")}
      ${src("#2b579a", ic("fileWord"), "Microsoft Word", [".docx", ".odt"], [
        "Choose .docx files. They stay Word documents: the original file and its formatting are kept, and changes are compared paragraph by paragraph.",
        "Tracked changes come in as if accepted: insertions kept, deletions left out.",
        "Older .doc files: open them in Word and choose Save As › .docx first. LibreOffice .odt files are converted to Markdown."
      ], `<label class="btn btn-sm" for="in-files">Choose Word files</label>`)}
      ${src("#0f7b6c", ic("fileSheet"), "Excel & Google Sheets", [".xlsx", ".csv", ".tsv", ".ods", "paste"], [
        "<strong>Google Sheets:</strong> File › Download › Microsoft Excel (.xlsx) brings every tab; CSV brings the current tab.",
        "<strong>Quick copy:</strong> select cells in Sheets or Excel, copy, then use <em>Paste cells</em>.",
        "<strong>Excel:</strong> choose .xlsx files. Older .xls: Save As .xlsx first.",
        "Each row is compared cell by cell, and formulas are kept as formulas. The original workbook (formatting, charts) is kept until you edit."
      ], `<button class="btn btn-sm btn-primary" id="paste-cells">${ic("paste")} Paste cells</button><label class="btn btn-sm" for="in-files">Choose spreadsheets</label>`)}
      ${src("#3d6117", ic("fileTex"), "LaTeX & Overleaf", [".tex", ".bib", ".cls", ".sty", ".zip", "folder"], [
        "<strong>From Overleaf:</strong> Menu › Download › Source gives a .zip. Drop it here; folders like <span class='mono'>chapters/</span> are kept.",
        "<strong>From your computer:</strong> choose the project folder.",
        "Text files are versioned line by line. Figures and PDFs are listed as skipped for now."
      ], `<label class="btn btn-sm" for="in-files">Choose .zip or files</label><label class="btn btn-sm" for="in-folder">Choose folder</label>`)}
      ${src("#8250df", ic("quote"), "References", [".bib", ".ris", ".json", "DOI"], [
        "<strong>Zotero:</strong> File › Export Library › BibTeX or RIS. <strong>Mendeley:</strong> File › Export › BibTeX. <strong>EndNote:</strong> File › Export › RIS.",
        "References are kept in a .bib file, so they're versioned with your writing and work directly with LaTeX and Pandoc.",
        "Look references up by DOI, edit them, and export BibTeX, RIS, CSL-JSON or a formatted APA, Chicago or MLA list from the References tab."
      ], `<button class="btn btn-sm btn-primary" id="imp-refs">${ic("quote")} Import references</button><button class="btn btn-sm" data-tab="refs">Open References</button>`)}
      ${src("#083fa1", ic("fileMd"), "Markdown & text", [".md", ".txt", ".html"], [
        "Choose .md or .txt files from Obsidian, iA Writer, Ulysses exports and the like.",
        "Web pages (.html) are converted to Markdown.",
        "Or paste any text."
      ], `<label class="btn btn-sm" for="in-files">Choose files</label><button class="btn btn-sm" id="paste-plain">${ic("paste")} Paste text</button>`)}
    </div>
    <div class="subhead"><h2 style="font-size:20px">Move documents out</h2></div>
    <div class="Box">
      <div class="Box-row">${ic("download")}<span class="grow">Whole project, original formats, folders kept <span class="muted">(.zip)</span></span><button class="btn btn-sm" id="ex-zip">Download</button></div>
      <div class="Box-row">${ic("fileWord")}<span class="grow">Documents as Word, spreadsheets as Excel <span class="muted">(.zip of .docx and .xlsx)</span></span><button class="btn btn-sm" id="ex-word">Download</button></div>
      <div class="Box-row">${ic("history")}<span class="grow">Full backup with every version, draft and milestone <span class="muted">(.json)</span></span><button class="btn btn-sm" id="ex-backup">Download</button></div>
    </div>`;
  el.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => go(b.dataset.tab));
  $("#imp-refs").onclick = () => importRefsFlow(p, render);
  $("#imp-dir").oninput = e => S.importDir = e.target.value;
  $("#imp-save").onchange = e => S.importSave = e.target.checked;
  $("#in-files").onchange = e => runImport(p, [...e.target.files].map(f => ({ file: f, path: f.name })));
  $("#in-folder").onchange = e => runImport(p, [...e.target.files].map(f => ({ file: f, path: (f.webkitRelativePath || f.name).split("/").slice(1).join("/") || f.name })));
  const drop = $("#drop");
  drop.addEventListener("dragover", e => { e.preventDefault(); drop.classList.add("over"); });
  drop.addEventListener("dragleave", () => drop.classList.remove("over"));
  drop.addEventListener("drop", async e => {
    e.preventDefault(); drop.classList.remove("over");
    const items = [...(e.dataTransfer.items || [])].map(i => i.webkitGetAsEntry && i.webkitGetAsEntry()).filter(Boolean);
    if (items.length && items.some(x => x.isDirectory)) {
      const out = []; for (const it of items) await walkEntry(it, "", out, it.isDirectory); runImport(p, out);
    } else runImport(p, [...e.dataTransfer.files].map(f => ({ file: f, path: f.name })));
  });
  $("#paste-gdocs").onclick = () => pasteFlow(p, true);
  $("#paste-plain").onclick = () => pasteFlow(p, false);
  $("#paste-cells").onclick = () => pasteCellsFlow(p);
  $("#ex-zip").onclick = () => exportZip(p, false);
  $("#ex-word").onclick = () => exportZip(p, true);
  $("#ex-backup").onclick = () => exportBackup(p);
}
function walkEntry(entry, prefix, out, isRoot) {
  return new Promise(res => {
    if (entry.isFile) entry.file(f => { out.push({ file: f, path: prefix + f.name }); res(); }, () => res());
    else if (entry.isDirectory) {
      const reader = entry.createReader(), all = [];
      const next = () => reader.readEntries(async ents => {
        if (!ents.length) { for (const c of all) await walkEntry(c, isRoot ? prefix : prefix + entry.name + "/", out, false); res(); }
        else { all.push(...ents); next(); }
      }, () => res());
      next();
    } else res();
  });
}
const SKIP_NOTE = { pdf: "PDFs aren't versioned yet", png: "Images aren't versioned yet", jpg: "Images aren't versioned yet", jpeg: "Images aren't versioned yet", gif: "Images aren't versioned yet", svg: "Images aren't versioned yet", eps: "Images aren't versioned yet", doc: "Open in Word and Save As .docx first", xls: "Open in Excel and Save As .xlsx first", numbers: "Export from Numbers as .xlsx first", gsheet: "In Google Sheets choose File › Download › Microsoft Excel (.xlsx)", gdoc: "In Google Docs choose File › Download › Microsoft Word (.docx)", pages: "Export from Pages as .docx first", rtf: "Save as .docx first" };
async function importBytes(p, path, u8, log) {
  const ext = extOf(path), had = q => !!p.working[q];
  const put = (q, rec, note, status) => { const st = status || (had(q) ? "replaced" : "added"); p.working[q] = rec; log.push({ path: q, status: st, note }); };
  if (/(^|\/)(__MACOSX|\.DS_Store|Thumbs\.db)/.test(path)) return;
  try {
    if (ext === "zip") {
      const z = unzip(u8); let names = z.names.filter(n => !n.endsWith("/") && !/(^|\/)(__MACOSX|\.)/.test(n));
      const roots = new Set(names.map(n => n.split("/")[0]));
      const strip = roots.size === 1 && names.every(n => n.includes("/"));
      const base = path.includes("/") ? path.split("/").slice(0, -1).join("/") + "/" : "";
      for (const n of names) await importBytes(p, base + (strip ? n.split("/").slice(1).join("/") : n), await z.read(n), log);
      return;
    }
    if (ext === "docx") { const text = await docxToText(u8); return put(path, { text, orig: b64.from(u8) }, `${text.split("\n").length} paragraphs`); }
    if (ext === "xlsx") { const text = await xlsxToText(u8); return put(path, { text, orig: b64.from(u8) }, sheetSummary(text)); }
    if (ext === "ods") { const q = path.replace(/\.ods$/i, ".xlsx"); const text = await odsToText(u8); return put(q, { text, orig: null }, "OpenDocument spreadsheet converted to .xlsx (values and formulas) · " + sheetSummary(text), "converted"); }
    if (ext === "csv" || ext === "tsv") { const raw = dec.decode(u8).replace(/^\uFEFF/, ""); const rows = parseDelimited(raw, ext === "csv" ? "," : "\t"); const name = path.split("/").pop().replace(/\.[^.]+$/, ""); const text = sheetsToText([{ name, rows }]); return put(path, { text, orig: b64.from(u8) }, sheetSummary(text)); }
    if (ext === "odt") { const q = path.replace(/\.odt$/i, ".md"); return put(q, { text: await odtToMarkdown(u8), orig: null }, "OpenDocument converted to Markdown", "converted"); }
    if (ext === "html" || ext === "htm") { const q = path.replace(/\.html?$/i, ".md"); return put(q, { text: htmlToMarkdown(dec.decode(u8)), orig: null }, "Web page converted to Markdown", "converted"); }
    if (ext === "ris") { const q = path.replace(/\.ris$/i, ".bib"), items = risToFields(dec.decode(u8)), taken = new Set(); const text = items.map(it => entryToBib({ type: it.type, key: it.key && !taken.has(it.key) ? (taken.add(it.key), it.key) : (k => (taken.add(k), k))(makeKey(it.fields, taken)), fields: it.fields })).join("\n\n") + "\n"; return put(q, { text, orig: null }, `${items.length} reference${items.length === 1 ? "" : "s"} converted from RIS to BibTeX`, "converted"); }
    if (TEXT_EXT.includes(ext)) { const text = dec.decode(u8).replace(/^﻿/, "").replace(/\r\n?/g, "\n"); return put(path, { text, orig: null }, `${text.split("\n").length} line${text.includes("\n") ? "s" : ""}`); }
    log.push({ path, status: "skipped", note: SKIP_NOTE[ext] || "This file type isn't supported yet" });
  } catch (err) { log.push({ path, status: "skipped", note: err.message }); }
}
async function runImport(p, items) {
  if (!items.length) return;
  const dir = (S.importDir || "").trim().replace(/^\/+|\/+$/g, "");
  const log = []; toast("Importing…");
  for (const { file, path } of items) await importBytes(p, (dir ? dir + "/" : "") + path, new Uint8Array(await file.arrayBuffer()), log);
  const added = log.filter(x => x.status !== "skipped");
  if (added.length && S.importSave !== false && changedPaths(p).length) {
    const kinds = new Set(items.map(x => { const e = extOf(x.path); return e === "zip" ? "a .zip" : e === "docx" || e === "odt" ? "Word" : ["xlsx", "ods", "csv", "tsv"].includes(e) ? "spreadsheets" : e === "html" || e === "htm" ? "the web" : TEXT_EXT.slice(0, 7).includes(e) && e !== "md" && e !== "txt" ? "LaTeX" : "text files"; }));
    log.saved = await saveVersion(p, `Import ${added.length} file${added.length > 1 ? "s" : ""}${kinds.size === 1 ? " from " + [...kinds][0] : ""}`);
  }
  await persist(p, true);
  S.importLog = log; render();
  toast(added.length ? `Imported ${added.length} file${added.length > 1 ? "s" : ""}.` : "Nothing was imported. See the list for why.");
}
function pasteFlow(p, rich) {
  let md = "";
  modal({
    title: rich ? "Paste from Google Docs" : "Paste text",
    body: `${rich ? `<p class="muted">In your Google Doc press Ctrl/⌘ A then Ctrl/⌘ C. Click the box below and press Ctrl/⌘ V. Formatting is turned into Markdown you can review.</p>
      <div class="paste-target" id="pt" contenteditable="true" tabindex="0" data-ph="Click here, then paste"></div>` : ""}
      <label for="pt-md">${rich ? "Markdown to import" : "Text"}<textarea class="form copybox" id="pt-md" placeholder="${rich ? "Your pasted document appears here" : "Paste or type here"}" style="background:var(--canvas)"></textarea></label>
      <label for="pt-name">File name<input type="text" id="pt-name" value="${rich ? "google-doc.md" : "pasted.md"}"></label>
      <p class="muted" id="pt-msg"></p>`,
    onOpen: ov => {
      const pt = $("#pt", ov), ta = $("#pt-md", ov), nm = $("#pt-name", ov);
      if (pt) {
        pt.focus();
        pt.addEventListener("paste", e => {
          e.preventDefault();
          const html = e.clipboardData.getData("text/html"), txt = e.clipboardData.getData("text/plain");
          md = html ? htmlToMarkdown(html) : txt.replace(/\r\n?/g, "\n");
          ta.value = md;
          pt.textContent = `Pasted ${wordCount(md).toLocaleString()} words${html ? " with formatting" : ""}.`;
          const first = (md.match(/^#{1,6}\s+(.+)$/m) || md.match(/^(.+)$/m) || [])[1];
          if (first) nm.value = slug(first.replace(/[*_[\]()]/g, "")).slice(0, 40) + ".md";
        });
      }
    },
    actions: [{ label: "Cancel" }, { label: "Import", primary: true, onClick: async ov => {
      const text = $("#pt-md", ov).value; let name = $("#pt-name", ov).value.trim();
      if (!text.trim()) { $("#pt-msg", ov).textContent = "Paste something first."; return false; }
      if (!name) name = "pasted.md"; if (!extOf(name) || !TEXT_EXT.includes(extOf(name))) name = name.replace(/\.[^.]*$/, "") + ".md";
      const dir = (S.importDir || "").trim().replace(/^\/+|\/+$/g, ""); const path = (dir ? dir + "/" : "") + name;
      const log = [{ path, status: p.working[path] ? "replaced" : rich ? "converted" : "added", note: rich ? "Pasted from Google Docs as Markdown" : "Pasted text" }];
      p.working[path] = { text: text.replace(/\r\n?/g, "\n"), orig: null };
      if (S.importSave !== false) log.saved = await saveVersion(p, rich ? `Import ${name} from Google Docs` : `Add ${name}`);
      await persist(p, true); S.importLog = log; render(); toast("Imported " + name); return true;
    } }]
  });
}


function pasteCellsFlow(p) {
  let rows = [];
  modal({
    title: "Paste cells from Google Sheets or Excel",
    body: `<p class="muted">Select the cells (or press Ctrl/⌘ A in the sheet), copy, then click the box below and paste.</p>
      <div class="paste-target" id="pc" contenteditable="true" tabindex="0" data-ph="Click here, then paste"></div>
      <label for="pc-name">File name<input type="text" id="pc-name" value="pasted-sheet.csv"></label>
      <label class="check" style="flex-direction:row;align-items:center;gap:8px;font-weight:400"><input type="checkbox" id="pc-xlsx"> Save as Excel (.xlsx) instead of CSV</label>
      <p class="muted" id="pc-msg"></p>`,
    onOpen: ov => {
      const box = $("#pc", ov); box.focus();
      box.addEventListener("paste", e => {
        e.preventDefault();
        const txt = e.clipboardData.getData("text/plain"), html = e.clipboardData.getData("text/html");
        if (txt) rows = parseDelimited(txt.replace(/\r\n?/g, "\n").replace(/\n$/, ""), "\t");
        else if (html) { const d = new DOMParser().parseFromString(html, "text/html"); rows = [...d.querySelectorAll("tr")].map(tr => [...tr.children].map(td => td.textContent.trim())); }
        const cols = Math.max(0, ...rows.map(r => r.length));
        box.innerHTML = rows.length ? `<table class="sheet-grid mini"><tbody>${rows.slice(0, 8).map(r => `<tr>${Array.from({ length: Math.min(cols, 8) }, (_, j) => `<td>${esc(r[j] || "")}</td>`).join("")}</tr>`).join("")}</tbody></table>` : "";
        $("#pc-msg", ov).textContent = rows.length ? `${rows.length} rows × ${cols} columns ready to import.` : "Nothing to import. Copy some cells first.";
      });
      $("#pc-xlsx", ov).onchange = e => { const n = $("#pc-name", ov); n.value = n.value.replace(/\.(csv|xlsx)$/i, "") + (e.target.checked ? ".xlsx" : ".csv"); };
    },
    actions: [{ label: "Cancel" }, { label: "Import", primary: true, onClick: async ov => {
      if (!rows.length) { $("#pc-msg", ov).textContent = "Paste some cells first."; return false; }
      let name = $("#pc-name", ov).value.trim() || "pasted-sheet.csv";
      if (!["csv", "xlsx"].includes(extOf(name))) name = name.replace(/\.[^.]*$/, "") + ".csv";
      const dir = (S.importDir || "").trim().replace(/^\/+|\/+$/g, ""), path = (dir ? dir + "/" : "") + name;
      const text = sheetsToText([{ name: name.replace(/\.[^.]+$/, "").slice(0, 31) || "Sheet1", rows }]);
      const log = [{ path, status: p.working[path] ? "replaced" : "added", note: "Pasted cells · " + sheetSummary(text) }];
      p.working[path] = { text, orig: null };
      if (S.importSave !== false) log.saved = await saveVersion(p, `Import ${name} from pasted cells`);
      await persist(p, true); S.importLog = log; render(); toast("Imported " + name); return true;
    } }]
  });
}

/* ============ Downloads ============ */
async function downloadAs(p, path, how) {
  const f = p.working[path]; const base = path.split("/").pop(), stem = base.replace(/\.[^.]+$/, "");
  if (how === "combined") { const t = assemble(p, path); return offerFile(base, t, t); }
  if (how === "docx") return offerFile(stem + ".docx", mdToDocx(secFmt(path) ? assemble(p, path) : f.text));
  if (how === "txt") return offerFile(stem + ".txt", f.text, f.text);
  if (how === "xlsx") return offerFile(stem + ".xlsx", xlsxFromText(f.text));
  if (how === "csvs") {
    const sheets = textToSheets(f.text);
    if (sheets.length === 1) return offerFile(stem + ".csv", toDelimited(sheets[0].rows, ","));
    return offerFile(stem + "-sheets.zip", zipStore(sheets.map(s => ({ name: slug(s.name) + ".csv", data: enc.encode(toDelimited(s.rows, ",")) }))));
  }
  if (DIRECT_EXT.includes(extOf(base))) return offerFile(base, await bytesOf(p, path, f), kindOf(path) === "text" ? f.text : null);
  return offerFile(base + ".zip", zipStore([{ name: base, data: await bytesOf(p, path, f) }]), kindOf(path) === "text" ? f.text : null);
}
async function downloadVersion(p, vid) {
  const tree = treeOf(p, vid), files = [];
  for (const [path, h] of Object.entries(tree)) files.push({ name: path, data: await bytesOf(p, path, p.blobs[h]) });
  if (!files.length) return toast("That version has no files.");
  await offerFile(`${slug(p.name)}-${vid.slice(0, 7)}.zip`, zipStore(files));
}
async function exportZip(p, asWord) {
  const files = [];
  for (const [path, f] of Object.entries(p.working)) {
    if (!asWord) files.push({ name: path, data: await bytesOf(p, path, f) });
    else if (kindOf(path) === "docx") files.push({ name: path, data: await bytesOf(p, path, f) });
    else if (["md", "markdown", "txt"].includes(extOf(path))) files.push({ name: path.replace(/\.[^.]+$/, ".docx"), data: mdToDocx(f.text) });
    else if (kindOf(path) === "sheet") files.push({ name: path.replace(/\.[^.]+$/, ".xlsx"), data: extOf(path) === "xlsx" ? await bytesOf(p, path, f) : xlsxFromText(f.text) });
  }
  if (!files.length) return toast(asWord ? "No documents or spreadsheets to convert." : "This project has no files.");
  await offerFile(`${slug(p.name)}${asWord ? "-office" : ""}.zip`, zipStore(files));
}
async function exportBackup(p) { const data = JSON.stringify({ format: "writers-box", formatVersion: 1, exported: new Date().toISOString(), project: p }); await offerFile(slug(p.name) + ".writersbox.json", data, data); }

/* ============ Flows ============ */
async function saveFlow() {
  const p = P(), changes = changedPaths(p); if (!changes.length) return toast("Nothing has changed since the last version.");
  const msg = await modal({
    title: "Save version",
    body: `<label for="sv-msg">Describe this version<input type="text" id="sv-msg" placeholder="Tighten recommendation after review" maxlength="140" value="${esc(S.suggestedMsg || "")}"></label>
      <div class="Box">${changes.map(c => `<div class="Box-row">${fileIcon(c.path)}<span class="mono grow" style="font-size:12px">${esc(c.path)}</span>${statusLabel(c.status)}</div>`).join("")}</div>
      ${(() => { const probs = limitProblems(p, [...new Set([...changes.map(c => c.path), ...changes.flatMap(c => p.working[c.path] ? secParents(p, c.path) : [])])]); return probs.length ? `<div class="flash" style="margin-top:12px">${ic("alert")}<span>${probs.map(x => `<strong>${esc(x.path)}</strong> is ${limitStatusText(x.L, x.r)} (${limitText(x.L)})`).join("<br>")}. You can still save.</span></div>` : ""; })()}
      <p class="muted">Saving to ${ic("branch")} <span class="branch-name">${esc(p.current)}</span>. A version captures every file in the project.</p>`,
    onOpen: ov => $("#sv-msg", ov).addEventListener("keydown", e => { if (e.key === "Enter") $(".mactions .btn-primary", ov).click(); }),
    actions: [{ label: "Cancel", value: null }, { label: "Save version", primary: true, onClick: ov => $("#sv-msg", ov).value.trim() || "Untitled version" }]
  });
  if (!msg) return;
  S.suggestedMsg = null;
  if (isRemote(p)) {
    if (!ghSignedIn()) return toast("Sign in with GitHub to save versions to this project.");
    const pm = progressModal("Saving to GitHub"); pm.set("Uploading changed files…");
    try { await saveVersionRemote(p, msg); pm.close(); await persist(p, true); toast("Version saved to GitHub."); render(); }
    catch (e) { pm.close(); toast(e.message); }
    return;
  }
  await saveVersion(p, msg); await persist(p, true); toast("Version saved."); render();
}
async function restoreFlow(id) {
  const p = P(), v = p.versions[id];
  if (!await guardUnsaved(p, "Restoring")) return;
  loadWorking(p, id); await persist(p, true);
  toast(`Restored “${v.message}”. Save a version to make it the latest.`); go("files");
}
async function milestoneFlow(id) {
  const p = P(), cur = milestonesOf(p, id)[0] || "";
  const name = await askText(cur ? "Edit milestone" : "Add milestone", "Milestone name", cur, "Save", "For example: Sent to reviewers, Submitted, Published. Clear it and save to remove.");
  if (name === null) return;
  if (isRemote(p)) {
    if (!ghSignedIn()) return toast("Sign in with GitHub to change milestones.");
    try { if (cur) await deleteTagRemote(p, cur); if (name) { const t = tagName(name); await createTagRemote(p, t, id); p.milestones[t] = id; } if (cur) delete p.milestones[cur]; }
    catch (e) { return toast(e.message); }
    persist(p, true); return render();
  }
  if (cur) delete p.milestones[cur];
  if (name) p.milestones[name] = id;
  persist(p, true); render();
}
async function newFileFlow() {
  const p = P();
  const name = await askText("New file", "Path", S.dir ? S.dir + "/" : "", "Create file", "For example chapter-2.md, sections/intro.tex, refs.bib or data/budget.xlsx. Use slashes for folders.");
  if (!name) return;
  const isSheet = ["xlsx", "csv"].includes(extOf(name));
  if (!TEXT_EXT.includes(extOf(name)) && !isSheet) return toast("New files can be .md, .txt, .tex, .bib, .xlsx or .csv. Import a .docx instead.");
  if (p.working[name]) return toast("That file already exists.");
  p.working[name] = { text: isSheet ? SHEET_HDR + "Sheet1" : "", orig: null }; persist(p, true); go("file", { file: name, fileMode: "write" });
}
async function createProjectFlow() {
  const name = await askText("New project", "Project name", "", "Create project", "A project holds related files: a paper and its bibliography, a book's chapters, a memo series.");
  if (!name) return;
  const p = newProject(name); S.projects.push(p); S.pid = p.id; resetSel(); await persist(p, true); go("import");
}
async function projectMenu() { return go("settings"); }
async function projectMenuOld() {
  const p = P();
  await modal({
    title: "Settings",
    body: `<div class="Box">
      <div class="Box-row"><span class="grow"><strong>Rename project</strong><br><span class="muted">Currently “${esc(p.name)}”.</span></span><button class="btn btn-sm" id="pm-ren">Rename</button></div>
      <div class="Box-row"><span class="grow"><strong>Restore a backup</strong><br><span class="muted">Open a .writersbox.json file as a project.</span></span><label class="btn btn-sm" for="pm-imp">Choose backup</label><input type="file" id="pm-imp" accept=".json,application/json" hidden></div>
      <div class="Box-row"><span class="grow"><strong>Delete this project</strong><br><span class="muted">Removes it and every version from this browser.</span></span><button class="btn btn-sm btn-danger" id="pm-del">Delete</button></div></div>`,
    onOpen: ov => {
      const close = () => ov.remove();
      $("#pm-ren", ov).onclick = async () => { close(); const n = await askText("Rename project", "Project name", p.name, "Rename"); if (n) { p.name = n; persist(p, true); render(); } };
      $("#pm-imp", ov).onchange = async e => {
        close(); const file = e.target.files[0]; if (!file) return;
        try {
          const j = JSON.parse(await file.text());
          if (j.format !== "writers-box" || !j.project || !j.project.versions) throw new Error();
          const np = j.project; if (S.projects.some(x => x.id === np.id)) { np.id = uid(); np.name += " (restored)"; }
          S.projects.push(np); S.pid = np.id; resetSel(); await persist(np, true); toast("Backup restored."); go("files");
        } catch (err) { toast("That file isn't a Writer's Box backup."); }
      };
      $("#pm-del", ov).onclick = async () => {
        close();
        if (!await confirmBox("Delete “" + p.name + "”?", "This removes the project and all its versions from this browser. Export a backup first if you might need it.", "Delete project", true)) return;
        S.projects = S.projects.filter(x => x.id !== p.id); await dbDel(p.id).catch(() => {});
        S.pid = S.projects[0] ? S.projects[0].id : null; resetSel(); go("files");
      };
    },
    actions: [{ label: "Close" }]
  });
}
async function switchDraft(name) {
  const p = P(); if (name === p.current) return;
  if (!await guardUnsaved(p, "Switching drafts")) { render(); return; }
  p.current = name; loadWorking(p, p.drafts[name]); persist(p, true);
  const keep = S.route === "file" && p.working[S.file] ? "file" : ["history", "drafts"].includes(S.route) ? S.route : "files";
  go(keep); toast(`Switched to ${name}.`);
}
async function newDraftFlow(fromId) {
  const p = P();
  const name = await askText("New draft", "Draft name", "", "Create draft", "Short and specific: shorter-summary, new-structure, reviewer-2-edits.");
  if (!name) return;
  const key = name.trim().replace(/\s+/g, "-");
  if (p.drafts[key] !== undefined) return toast("A draft with that name already exists.");
  const keepWorking = fromId === headId(p);
  if (!keepWorking && !await guardUnsaved(p, "Starting a draft from an older version")) return;
  if (isRemote(p)) {
    if (!ghSignedIn()) return toast("Sign in with GitHub to create drafts in this project.");
    try { await createBranchRemote(p, key, fromId); } catch (e) { return toast(e.message); }
  }
  p.drafts[key] = fromId; p.current = key;
  if (!keepWorking) loadWorking(p, fromId);
  persist(p, true); go("files");
  toast(`Now writing on ${key}.` + (keepWorking && changedPaths(p).length ? " Your unsaved changes came with you." : ""));
}
async function mergeFlow(name) {
  const p = P(), dHead = p.drafts[name], mHead = p.drafts.main;
  if (changedPaths(p).length) return toast("Save or discard your unsaved changes before merging.");
  if (!dHead || dHead === mHead || ancestors(p, mHead).has(dHead)) return toast("main already includes everything in this draft.");
  if (isRemote(p)) {
    if (!ghSignedIn()) return toast("Sign in with GitHub to merge.");
    if (!mHead || ancestors(p, dHead).has(mHead)) {
      if (!await confirmBox(`Merge ${name} into main now?`, "main hasn't changed since this draft started, so main moves forward to include the draft's versions. To get feedback first, use Request review instead.", "Merge into main")) return;
      try { await fastForwardRemote(p, "main", dHead); p.drafts.main = dHead; } catch (e) { return toast(e.message); }
      p.current = "main"; loadWorking(p, p.drafts.main); p.remote.syncedHead = p.drafts.main; await persist(p, true); go("files"); return toast(`Merged ${name} into main.`);
    }
    if (await confirmBox("main has moved on", `main has new versions that “${esc(name)}” doesn't. Open a review: GitHub merges both sets of edits when they don't touch the same lines, and flags it when they do.`, "Request review")) requestReviewFlow(p, name);
    return;
  }
  if (!mHead || ancestors(p, dHead).has(mHead)) {
    if (!await confirmBox(`Merge ${name} into main?`, "main hasn't changed since this draft started, so main moves forward to include the draft's versions.", "Merge into main")) return;
    p.drafts.main = dHead;
  } else {
    if (!await confirmBox("main has moved on", `main gained new versions after “${esc(name)}” started. The prototype can't blend both sets of edits yet (three-way merge is planned). You can make the draft's text the newest version on main; main's earlier versions stay in History.`, "Use the draft's text on main")) return;
    p.current = "main";
    await saveVersion(p, `Merge draft ${name} (took the draft's text)`, Date.now(), { tree: { ...treeOf(p, dHead) }, parent2: dHead });
  }
  p.current = "main"; loadWorking(p, p.drafts.main); await persist(p, true); go("files");
  toast(`Merged ${name} into main.`);
}
async function deleteDraftFlow(name) {
  const p = P();
  const merged = !p.drafts[name] || ancestors(p, p.drafts.main).has(p.drafts[name]);
  if (!await confirmBox(`Delete draft ${name}?`, merged ? "Its versions are already part of main, so nothing is lost." : "Its versions aren't part of main and will no longer be listed. Backups made before now still contain them.", "Delete draft", true)) return;
  if (p.current === name) {
    if (!await guardUnsaved(p, "Deleting the draft you're on")) return;
    p.current = "main"; loadWorking(p, p.drafts.main);
  }
  if (isRemote(p)) {
    if (!ghSignedIn()) return toast("Sign in with GitHub to delete drafts.");
    try { await deleteBranchRemote(p, name); } catch (e) { return toast(e.message); }
  }
  delete p.drafts[name]; persist(p, true); render();
}

/* ============ Example project ============ */
async function seedProject() {
  const p = newProject("click-to-cancel-memo");
  p.description = "Policy memo on regulating subscription cancellation dark patterns, with a briefing for the director.";
  const day = 864e5, now = Date.now();
  const memo1 = String.raw`\documentclass[11pt]{article}
\usepackage[margin=1in]{geometry}
\title{Click-to-Cancel: Options for Regulating Subscription Dark Patterns}
\author{Policy Research Team}
\date{Draft}
\begin{document}
\maketitle

\section*{Executive summary}
Consumers who sign up for subscriptions online often face a far harder path when they try to cancel.
This memo reviews the evidence on cancellation friction and outlines three regulatory options.
We recommend a symmetric-effort rule paired with clear disclosure requirements.

\section{Background}
Negative option marketing lets a seller treat a consumer's silence as consent to keep paying.
Cancellation flows frequently add retention offers, phone-only requirements, and confusing button labels.
Survey evidence suggests many consumers keep paying for services they no longer use.

\section{Options}
\begin{enumerate}
  \item Disclosure only: require sellers to state cancellation steps before purchase.
  \item Symmetric effort: cancelling must be as easy as signing up, through the same channel.
  \item Default expiry: subscriptions lapse unless the consumer actively renews each year.
\end{enumerate}

\section{Recommendation}
Adopt option 2, with option 1 as a complementary requirement.
\end{document}`;
  const memo2 = memo1
    .replace("We recommend a symmetric-effort rule paired with clear disclosure requirements.", "We recommend a symmetric-effort rule, paired with plain-language disclosure before purchase.")
    .replace("Survey evidence suggests many consumers keep paying for services they no longer use.", "Survey evidence suggests many consumers keep paying for services they no longer use.\nRetention offers are not harmful on their own; the harm comes from making them mandatory.")
    .replace("Adopt option 2, with option 1 as a complementary requirement.", "Adopt option 2, with option 1 as a complementary requirement.\nAllow at most one retention offer, which the consumer can decline in a single step.\n\n\\input{appendix/survey-methods}");
  const memoDraft = memo2.replace("Consumers who sign up for subscriptions online often face a far harder path when they try to cancel.\nThis memo reviews the evidence on cancellation friction and outlines three regulatory options.\n", "Cancelling a subscription online is often far harder than signing up.\n");
  const methods = String.raw`\appendix
\section{Survey methods}
Respondents were recruited from an online panel and asked about subscriptions cancelled in the past year.
The questionnaire recorded the cancellation channel, the number of steps, and any retention offers.`;
  const bib = "@misc{example2025survey,\n  title  = {Subscription cancellation experiences: an example survey},\n  author = {Example Research Group},\n  year   = {2025},\n  note   = {Placeholder entry for the example project}\n}";
  const notes1 = "# Review notes\n\n- Check the survey citation in Background (sample size?)\n- Ask legal whether \"same channel\" covers app-store subscriptions";
  const notes2 = notes1 + "\n- Reviewer 1: tighten the executive summary";
  const notesNow = notes2 + "\n- Reviewer 2: add an enforcement section before Recommendation";
  const brief1 = ["Briefing: Subscription cancellation rule", "Purpose: prepare the director for Thursday's stakeholder meeting.", "Industry groups argue that symmetric-effort rules will raise churn and prices.", "Consumer groups report that phone-only cancellation is still common in fitness and media subscriptions."].join("\n");
  const brief2 = ["Briefing: Subscription cancellation rule", "Purpose: prepare the director for Thursday's meeting with industry and consumer groups.", "Industry groups argue that symmetric-effort rules will raise churn and prices.", "Consumer groups report that phone-only cancellation is still common in fitness and media subscriptions.", "Recommended position: support symmetric effort, with a 12-month compliance window for small businesses."].join("\n");
  const docx = t => ({ text: t, orig: b64.from(textToDocx(t)) });
  const xl = sheets => { const t = sheetsToText(sheets); return { text: t, orig: b64.from(xlsxFromText(t)) }; };
  const hdr = ["Cancellation channel", "Respondents", "Share"];
  const survey1 = [{ name: "Responses", rows: [hdr, ["Online, same page", "412", "=B2/B$5"], ["Phone only", "268", "=B3/B$5"], ["Chat or email", "120", "=B4/B$5"], ["Total", "=SUM(B2:B4)", ""]] }];
  const survey2 = [{ name: "Responses", rows: [hdr, ["Online, same page", "389", "=B2/B$5"], ["Phone only", "291", "=B3/B$5"], ["Chat or email", "120", "=B4/B$5"], ["Total", "=SUM(B2:B4)", ""]] },
    { name: "Notes", rows: [["Source", "Example online panel, 2025"], ["Caveat", "Placeholder figures for the example project"]] }];
  p.working = { "memo.tex": { text: memo1, orig: null }, "refs.bib": { text: bib, orig: null }, "notes.md": { text: notes1, orig: null }, "briefing.docx": docx(brief1), "data/survey-results.xlsx": xl(survey1) };
  const v1 = await saveVersion(p, "First full draft", now - 3 * day);
  p.working["memo.tex"].text = memo2; p.working["notes.md"].text = notes2; p.working["briefing.docx"] = docx(brief2); p.working["data/survey-results.xlsx"] = xl(survey2);
  p.working["appendix/survey-methods.tex"] = { text: methods, orig: null };
  const v2 = await saveVersion(p, "Tighten recommendation after legal review", now - 1 * day - 3600e3);
  p.milestones["Sent to reviewers"] = v2;
  p.drafts["shorter-summary"] = v2; p.current = "shorter-summary";
  p.working["memo.tex"].text = memoDraft;
  await saveVersion(p, "Cut the executive summary to two sentences", now - 5 * 3600e3);
  p.current = "main"; loadWorking(p, v2);
  p.working["notes.md"].text = notesNow;
  return { p, v1, v2 };
}

