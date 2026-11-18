/* ============ Utilities ============ */
const enc = new TextEncoder(), dec = new TextDecoder();
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const b64 = {
  from(u8) { let s = ""; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); },
  to(str) { const bin = atob(str); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
};
async function sha(str) {
  try {
    const h = await crypto.subtle.digest("SHA-256", enc.encode(str));
    return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, "0")).join("");
  } catch (e) { // fallback: FNV-1a 64-ish, good enough for a prototype without SubtleCrypto
    let h1 = 0x811c9dc5, h2 = 0x01000193;
    for (let i = 0; i < str.length; i++) { const c = str.charCodeAt(i); h1 = Math.imul(h1 ^ c, 16777619); h2 = Math.imul(h2 ^ c, 2246822507); }
    return ((h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0")).repeat(4);
  }
}
function concatBytes(parts) { const n = parts.reduce((s, p) => s + p.length, 0); const out = new Uint8Array(n); let o = 0; for (const p of parts) { out.set(p, o); o += p.length; } return out; }
function ago(t) {
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 45) return "just now";
  const m = Math.round(s / 60); if (m < 60) return m + " min ago";
  const h = Math.round(m / 60); if (h < 24) return h + (h === 1 ? " hour ago" : " hours ago");
  const d = Math.round(h / 24); if (d < 30) return d + (d === 1 ? " day ago" : " days ago");
  return new Date(t).toLocaleDateString();
}
const fullDate = t => new Date(t).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
const wordCount = s => (s.match(/[\p{L}\p{N}][\p{L}\p{N}'’_-]*/gu) || []).length;
const extOf = n => (n.includes(".") ? n.split(".").pop().toLowerCase() : "");
const SHEET_EXT = ["xlsx", "csv", "tsv"];
const kindOf = n => extOf(n) === "docx" ? "docx" : SHEET_EXT.includes(extOf(n)) ? "sheet" : "text";
const TYPE = { xlsx: "Spreadsheet", ods: "Spreadsheet", csv: "CSV", tsv: "CSV", tex: "LaTeX", cls: "LaTeX", sty: "LaTeX", bst: "BibTeX", bib: "BibTeX", md: "Markdown", markdown: "Markdown", txt: "Text", docx: "Word" };
const typeLabel = n => TYPE[extOf(n)] || "Text";
const TEXT_EXT = ["tex", "bib", "cls", "sty", "bst", "bbx", "cbx", "md", "markdown", "txt"];
const isProse = n => ["docx", "md", "markdown", "txt"].includes(extOf(n));
const unitName = n => kindOf(n) === "docx" ? "paragraph" : kindOf(n) === "sheet" ? "row" : "line";
const ACCEPT = ".tex,.bib,.ris,.cls,.sty,.bst,.md,.markdown,.txt,.docx,.odt,.html,.htm,.zip,.xlsx,.csv,.tsv,.ods";

/* ============ Zip (read with DecompressionStream, write uncompressed) ============ */
const CRC_TABLE = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(u8) { let c = 0xFFFFFFFF; for (let i = 0; i < u8.length; i++) c = CRC_TABLE[(c ^ u8[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function zipStore(files) {
  const parts = [], central = []; let offset = 0;
  const d = new Date();
  const time = (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2);
  const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  for (const f of files) {
    const name = enc.encode(f.name), data = f.data, crc = crc32(data);
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true);
    lh.setUint16(10, time, true); lh.setUint16(12, date, true); lh.setUint32(14, crc, true);
    lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true); lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
    parts.push(new Uint8Array(lh.buffer), name, data);
    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true);
    ch.setUint16(12, time, true); ch.setUint16(14, date, true); ch.setUint32(16, crc, true);
    ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true); ch.setUint16(28, name.length, true); ch.setUint32(42, offset, true);
    central.push(new Uint8Array(ch.buffer), name);
    offset += 30 + name.length + data.length;
  }
  const cdSize = central.reduce((s, p) => s + p.length, 0);
  const eo = new DataView(new ArrayBuffer(22));
  eo.setUint32(0, 0x06054b50, true); eo.setUint16(8, files.length, true); eo.setUint16(10, files.length, true);
  eo.setUint32(12, cdSize, true); eo.setUint32(16, offset, true);
  return concatBytes([...parts, ...central, new Uint8Array(eo.buffer)]);
}
async function inflateRaw(data) {
  if (typeof DecompressionStream === "undefined") throw new Error("This browser can't unpack Word files. Try a current Chrome, Edge, Safari or Firefox.");
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
function unzip(u8) {
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  let e = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 65558); i--) if (dv.getUint32(i, true) === 0x06054b50) { e = i; break; }
  if (e < 0) throw new Error("This file isn't a valid .docx (no zip directory found).");
  const count = dv.getUint16(e + 10, true); let p = dv.getUint32(e + 16, true);
  const entries = {};
  for (let i = 0; i < count; i++) {
    if (dv.getUint32(p, true) !== 0x02014b50) throw new Error("This .docx looks damaged.");
    const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true);
    const nlen = dv.getUint16(p + 28, true), xlen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true), lho = dv.getUint32(p + 42, true);
    entries[dec.decode(u8.subarray(p + 46, p + 46 + nlen))] = { method, csize, lho };
    p += 46 + nlen + xlen + clen;
  }
  return {
    names: Object.keys(entries),
    async read(name) {
      const f = entries[name]; if (!f) return null;
      const start = f.lho + 30 + dv.getUint16(f.lho + 26, true) + dv.getUint16(f.lho + 28, true);
      const data = u8.subarray(start, start + f.csize);
      if (f.method === 0) return data.slice();
      if (f.method === 8) return inflateRaw(data);
      throw new Error("This .docx uses a compression method the prototype can't read.");
    }
  };
}

/* ============ Word adapter ============ */
const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
async function docxToText(u8) {
  const z = unzip(u8);
  const xml = await z.read("word/document.xml");
  if (!xml) throw new Error("This .docx has no main document.");
  const doc = new DOMParser().parseFromString(dec.decode(xml), "application/xml");
  const body = doc.getElementsByTagNameNS(W_NS, "body")[0];
  if (!body) throw new Error("Couldn't find the document body in this .docx.");
  const paras = [];
  for (const p of body.getElementsByTagNameNS(W_NS, "p")) {
    let s = "";
    const walk = n => {
      for (const c of n.childNodes) {
        if (c.nodeType !== 1) continue;
        if (c.namespaceURI === W_NS) {
          const t = c.localName;
          if (t === "t") s += c.textContent;
          else if (t === "tab") s += "\t";
          else if (t === "br" || t === "cr") s += " ";
          else if (t === "p" || t === "del" || t === "delText" || t === "instrText") continue;
          else walk(c);
        } else walk(c);
      }
    };
    walk(p);
    paras.push(s);
  }
  return paras.join("\n");
}
function textToDocx(text) {
  const x = s => s.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const paras = text.split("\n").map(line => {
    if (!line) return "<w:p/>";
    const runs = line.split("\t").map((seg, i) => (i ? "<w:tab/>" : "") + (seg ? `<w:t xml:space="preserve">${x(seg)}</w:t>` : "")).join("");
    return `<w:p><w:r>${runs}</w:r></w:p>`;
  }).join("");
  const files = [
    { name: "[Content_Types].xml", data: enc.encode('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>') },
    { name: "_rels/.rels", data: enc.encode('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>') },
    { name: "word/document.xml", data: enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="${W_NS}"><w:body>${paras}<w:sectPr/></w:body></w:document>`) }
  ];
  return zipStore(files);
}

/* ============ Diff engine (Myers) ============ */
function myers(a, b) {
  let pre = 0; while (pre < a.length && pre < b.length && a[pre] === b[pre]) pre++;
  let suf = 0; while (suf < a.length - pre && suf < b.length - pre && a[a.length - 1 - suf] === b[b.length - 1 - suf]) suf++;
  const A = a.slice(pre, a.length - suf), B = b.slice(pre, b.length - suf);
  const n = A.length, m = B.length, max = n + m, off = max + 1;
  const mid = [];
  if (n === 0) B.forEach(v => mid.push(["+", v]));
  else if (m === 0) A.forEach(v => mid.push(["-", v]));
  else {
    const v = new Int32Array(2 * max + 3); const trace = [];
    outer: for (let d = 0; d <= max; d++) {
      trace.push(v.slice());
      for (let k = -d; k <= d; k += 2) {
        let x = (k === -d || (k !== d && v[off + k - 1] < v[off + k + 1])) ? v[off + k + 1] : v[off + k - 1] + 1;
        let y = x - k;
        while (x < n && y < m && A[x] === B[y]) { x++; y++; }
        v[off + k] = x;
        if (x >= n && y >= m) break outer;
      }
    }
    let x = n, y = m; const rev = [];
    for (let d = trace.length - 1; d >= 0; d--) {
      const vv = trace[d], k = x - y;
      const pk = (k === -d || (k !== d && vv[off + k - 1] < vv[off + k + 1])) ? k + 1 : k - 1;
      const px = vv[off + pk], py = px - pk;
      while (x > px && y > py) { rev.push(["=", A[x - 1]]); x--; y--; }
      if (d > 0) { if (x === px) { rev.push(["+", B[y - 1]]); y--; } else { rev.push(["-", A[x - 1]]); x--; } }
      x = px; y = py;
    }
    rev.reverse(); mid.push(...rev);
  }
  return [...a.slice(0, pre).map(s => ["=", s]), ...mid, ...a.slice(a.length - suf).map(s => ["=", s])];
}
const tokenize = s => s.match(/\s+|[\p{L}\p{N}][\p{L}\p{N}'’_-]*|[^\s\p{L}\p{N}]/gu) || [];
const isWord = t => /[\p{L}\p{N}]/u.test(t);
function wordDiff(a, b) {
  const ops = myers(tokenize(a), tokenize(b));
  let same = 0, total = 0, L = "", R = "", ins = 0, del = 0;
  for (const [t, v] of ops) {
    const w = isWord(v);
    if (t === "=") { L += esc(v); R += esc(v); if (w) { same += 2; total += 2; } }
    else if (t === "-") { L += `<del>${esc(v)}</del>`; if (w) { del++; total++; } }
    else { R += `<ins>${esc(v)}</ins>`; if (w) { ins++; total++; } }
  }
  return { L, R, ins, del, sim: total ? same / total : 1 };
}
/* Build display rows: pairs deletions with insertions inside each change hunk */
function buildRows(aText, bText) {
  const a = aText === "" ? [] : aText.split("\n"), b = bText === "" ? [] : bText.split("\n");
  const ops = myers(a, b);
  const rows = []; let ia = 0, ib = 0, ins = 0, del = 0, changed = 0;
  for (let i = 0; i < ops.length;) {
    if (ops[i][0] === "=") { rows.push({ t: "=", a: ia + 1, b: ib + 1, text: esc(ops[i][1]) }); ia++; ib++; i++; continue; }
    const dels = [], adds = [];
    while (i < ops.length && ops[i][0] !== "=") { (ops[i][0] === "-" ? dels : adds).push(ops[i][1]); i++; }
    const pairs = Math.min(dels.length, adds.length);
    for (let j = 0; j < Math.max(dels.length, adds.length); j++) {
      changed++;
      if (j < pairs) {
        const wd = wordDiff(dels[j], adds[j]);
        if (wd.sim >= 0.35) {
          rows.push({ t: "~", a: ia + 1, b: ib + 1, L: wd.L, R: wd.R }); ins += wd.ins; del += wd.del; ia++; ib++; continue;
        }
      }
      if (j < dels.length) { rows.push({ t: "-", a: ia + 1, text: esc(dels[j]) }); del += wordCount(dels[j]); ia++; }
      if (j < adds.length) { rows.push({ t: "+", b: ib + 1, text: esc(adds[j]) }); ins += wordCount(adds[j]); ib++; }
    }
  }
  return { rows, ins, del, changed };
}
const statCache = new Map();
function quickStat(aText, bText) {
  const key = aText.length + ":" + bText.length + ":" + aText.slice(0, 40) + bText.slice(-40) + (aText === bText);
  if (aText === bText) return { ins: 0, del: 0, changed: 0 };
  const k2 = key + "|" + aText + "\u0000" + bText;
  if (statCache.has(k2)) return statCache.get(k2);
  const { ins, del, changed } = buildRows(aText, bText);
  const r = { ins, del, changed }; statCache.set(k2, r); return r;
}

/* ============ Storage (IndexedDB, this browser only) ============ */
const DB = { db: null, ok: false };
function dbOpen() {
  return new Promise(res => {
    const done = () => res(); const t = setTimeout(done, 3000);
    try {
      const r = indexedDB.open("writers-box", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("projects", { keyPath: "id" });
      r.onsuccess = () => { clearTimeout(t); DB.db = r.result; DB.ok = true; res(); };
      r.onerror = r.onblocked = () => { clearTimeout(t); res(); };
    } catch (e) { clearTimeout(t); res(); }
  });
}
function dbReq(mode, fn) {
  return new Promise((res, rej) => {
    if (!DB.ok) return res(null);
    try { const tx = DB.db.transaction("projects", mode); const r = fn(tx.objectStore("projects")); tx.oncomplete = () => res(r && r.result); tx.onerror = () => rej(tx.error); }
    catch (e) { rej(e); }
  });
}
const dbAll = () => dbReq("readonly", s => s.getAll());
const dbPut = p => dbReq("readwrite", s => s.put(p));
const dbDel = id => dbReq("readwrite", s => s.delete(id));
const timers = {};
function persist(p, now) {
  clearTimeout(timers[p.id]);
  const go = () => dbPut(p).catch(() => { DB.ok = false; render(); });
  if (now) return go(); timers[p.id] = setTimeout(go, 350);
}

/* ============ Version model ============ */
const S = { projects: [], pid: null, route: "files", dir: "", file: null, vid: null, cmp: { a: null, b: null }, mode: "split", importLog: null };
const P = () => S.projects.find(p => p.id === S.pid);
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
function newProject(name) {
  return { id: uid(), name, description: "", created: Date.now(), current: "main", drafts: { main: null }, milestones: {}, versions: {}, blobs: {}, working: {} };
}
const headId = p => p.drafts[p.current];
const treeOf = (p, vid) => (vid && p.versions[vid] ? p.versions[vid].tree : {});
const blobText = (p, h) => (h && p.blobs[h] ? p.blobs[h].text : "");
function textAt(p, vid, path) { if (vid === "WORKING") return p.working[path] ? p.working[path].text : ""; return blobText(p, treeOf(p, vid)[path]); }
function fileStatus(p, path) {
  const tree = treeOf(p, headId(p)), w = p.working[path];
  if (!w) return path in tree ? "deleted" : null;
  if (!(path in tree)) return "new";
  return blobText(p, tree[path]) === w.text ? "clean" : "modified";
}
function changedPaths(p) {
  const tree = treeOf(p, headId(p));
  const all = new Set([...Object.keys(tree), ...Object.keys(p.working)]);
  return [...all].sort().map(path => ({ path, status: fileStatus(p, path) })).filter(f => f.status && f.status !== "clean");
}
async function blobFor(p, f) {
  const h = (await sha((f.orig || "") + "\u0000" + f.text)).slice(0, 20);
  if (!p.blobs[h]) p.blobs[h] = { text: f.text, orig: f.orig || null };
  return h;
}
async function saveVersion(p, message, time = Date.now(), extra = {}) {
  const tree = {};
  for (const path of Object.keys(p.working).sort()) tree[path] = await blobFor(p, p.working[path]);
  const v = { parent: headId(p), tree, message: message.trim() || "Untitled version", time, draft: p.current, ...extra };
  const id = (await sha(JSON.stringify(v))).slice(0, 12);
  p.versions[id] = v; p.drafts[p.current] = id;
  return id;
}
function loadWorking(p, vid) {
  const tree = treeOf(p, vid); p.working = {};
  for (const [path, h] of Object.entries(tree)) p.working[path] = { text: p.blobs[h].text, orig: p.blobs[h].orig || null };
}
function ancestors(p, vid) {
  const seen = new Set(), stack = vid ? [vid] : [];
  while (stack.length) { const id = stack.pop(); if (!id || seen.has(id) || !p.versions[id]) continue; seen.add(id); const v = p.versions[id]; stack.push(v.parent, v.parent2); }
  return seen;
}
const milestonesOf = (p, vid) => Object.entries(p.milestones).filter(([, v]) => v === vid).map(([n]) => n);
const draftHeadsAt = (p, vid) => Object.entries(p.drafts).filter(([, v]) => v === vid).map(([n]) => n);
function versionStat(p, vid) {
  const v = p.versions[vid], pt = treeOf(p, v.parent);
  let ins = 0, del = 0, files = 0;
  for (const path of new Set([...Object.keys(pt), ...Object.keys(v.tree)])) {
    if (pt[path] === v.tree[path]) continue;
    files++; const s = quickStat(blobText(p, pt[path]), blobText(p, v.tree[path])); ins += s.ins; del += s.del;
  }
  return { ins, del, files };
}
async function bytesOf(p, path, f) {
  if (kindOf(path) === "docx") return f.orig ? b64.to(f.orig) : textToDocx(f.text);
  if (kindOf(path) === "sheet") return f.orig ? b64.to(f.orig) : sheetBytes(path, f.text);
  return enc.encode(f.text);
}

/* ============ Downloads ============ */
let downloadsCap = null;
(async () => { try { if (window.claude && window.claude.use) downloadsCap = await window.claude.use("downloads"); } catch (e) { downloadsCap = null; } })();
const DIRECT_EXT = ["txt", "md", "docx", "zip", "json", "xlsx", "csv"];
async function offerFile(filename, data, textFallback) {
  if (downloadsCap) {
    try { await downloadsCap.save({ filename, data }); toast("Saved " + filename); return; }
    catch (e) {
      if (e && e.code === "declined") return toast("Download cancelled.");
      if (e && e.code === "rate_limited") return toast("A download prompt is already open.");
    }
  }
  try { // outside the Claude viewer, a normal browser download works
    const url = URL.createObjectURL(new Blob([data]));
    const a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  } catch (e) { /* ignore */ }
  // Outside the Claude viewer (e.g. GitHub Pages) the browser download above works, so no copy box is needed.
  const inClaude = !!(window.claude && window.claude.use);
  if (textFallback != null && !downloadsCap && inClaude) {
    modal({ title: "Copy " + filename, body: `<p class="muted">Downloads aren't available in this view. Copy the text instead.</p><textarea class="copybox" readonly>${esc(textFallback)}</textarea>`,
      actions: [{ label: "Copy", primary: true, keep: true, onClick: async () => { try { await navigator.clipboard.writeText(textFallback); toast("Copied"); } catch (e) { toast("Select the text and copy it with your keyboard."); } } }, { label: "Close" }] });
  }
}
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "project";

/* ============ Modal + toast ============ */
function modal({ title, body, actions = [{ label: "Close" }], onOpen }) {
  return new Promise(resolve => {
    const layer = $("#layer");
    const ov = document.createElement("div"); ov.className = "overlay";
    ov.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="m-title"><div class="mhead"><h3 id="m-title">${esc(title)}</h3><button class="btn-octicon" data-x aria-label="Close">${ICON.x}</button></div><div class="mbody">${body}</div><div class="mactions"></div></div>`;
    const close = val => { ov.remove(); document.removeEventListener("keydown", onKey); resolve(val); };
    const onKey = e => { if (e.key === "Escape") close(null); };
    document.addEventListener("keydown", onKey);
    ov.addEventListener("mousedown", e => { if (e.target === ov) close(null); });
    ov.querySelector("[data-x]").onclick = () => close(null);
    const bar = $(".mactions", ov);
    actions.slice().reverse().forEach(a => {
      const b = document.createElement("button");
      b.className = "btn" + (a.primary ? " btn-primary" : "") + (a.danger ? " btn-danger" : ""); b.textContent = a.label;
      b.addEventListener("click", async () => { const r = a.onClick ? await a.onClick(ov) : true; if (r === false || a.keep) return; close(a.value !== undefined ? a.value : r); });
      bar.prepend(b);
    });
    layer.appendChild(ov);
    if (onOpen) onOpen(ov);
    const first = ov.querySelector("input, textarea, select") || bar.querySelector(".btn-primary") || bar.querySelector("button");
    if (first) first.focus();
  });
}
const confirmBox = (title, text, label = "Continue", danger = false) =>
  modal({ title, body: `<p>${text}</p>`, actions: [{ label: "Cancel", value: false }, { label, primary: !danger, danger, value: true }] });
function askText(title, labelText, value = "", okLabel = "OK", hint = "") {
  return modal({ title, body: `<label>${esc(labelText)}<input type="text" id="ask-in" value="${esc(value)}"></label>${hint ? `<p class="muted">${hint}</p>` : ""}`,
    onOpen: ov => { const i = $("#ask-in", ov); i.select(); i.addEventListener("keydown", e => { if (e.key === "Enter") $(".mactions .btn-primary", ov).click(); }); },
    actions: [{ label: "Cancel", value: null }, { label: okLabel, primary: true, onClick: ov => { const v = $("#ask-in", ov).value.trim(); return v || false; } }] });
}
let toastTimer;
function toast(msg) {
  let t = $(".toast"); if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
  t.textContent = msg; clearTimeout(toastTimer); toastTimer = setTimeout(() => t.remove(), 2600);
}
async function guardUnsaved(p, what) {
  const n = changedPaths(p).length; if (!n) return true;
  return confirmBox("Discard unsaved changes?", `You have unsaved changes in ${n} file${n > 1 ? "s" : ""}. ${what} replaces them. Save a version first if you want to keep them.`, "Discard and continue", true);
}

