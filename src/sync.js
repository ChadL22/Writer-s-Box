
/* ============ Sync: pull and push changes with where the writing also lives ============
   Sources: a file or folder on the writer's computer, live Google Docs / Word documents, GitHub, and Overleaf
   (through GitHub sync, or by Overleaf download and upload). Pulling brings changes in as unsaved edits to review;
   pushing sends Writer's Box's current text out. When both sides changed, a line-by-line merge keeps both sets of
   edits, and asks only about paragraphs changed in both places. */

/* ---------- Word: rewrite only the paragraphs that changed ---------- */
function docxParaText(p) {
  let s = "";
  const walk = n => { for (const c of n.childNodes) { if (c.nodeType !== 1) continue; if (c.namespaceURI === W_NS) { const t = c.localName; if (t === "t") s += c.textContent; else if (t === "tab") s += "\t"; else if (t === "br" || t === "cr") s += " "; else if (t === "p" || t === "del" || t === "delText" || t === "instrText") continue; else walk(c); } else walk(c); } };
  walk(p); return s;
}
async function docxPatch(baseU8, text) {
  const z = unzip(baseU8), xml = dec.decode(await z.read("word/document.xml"));
  const doc = new DOMParser().parseFromString(xml, "application/xml"), body = doc.getElementsByTagNameNS(W_NS, "body")[0];
  const paras = [...body.getElementsByTagNameNS(W_NS, "p")], oldLines = paras.map(docxParaText), newLines = text.split("\n");
  const el = n => doc.createElementNS(W_NS, "w:" + n);
  const firstRpr = p => { const r = [...p.getElementsByTagNameNS(W_NS, "r")].find(x => x.getElementsByTagNameNS(W_NS, "t").length) || p.getElementsByTagNameNS(W_NS, "r")[0]; const rp = r && [...r.childNodes].find(c => c.localName === "rPr"); return rp ? rp.cloneNode(true) : null; };
  const runFor = (line, rpr) => { const r = el("r"); if (rpr) r.appendChild(rpr); line.split("\t").forEach((seg, i) => { if (i) r.appendChild(el("tab")); if (seg) { const t = el("t"); t.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve"); t.textContent = seg; r.appendChild(t); } }); return r; };
  const setText = (p, line) => { const ppr = [...p.childNodes].find(c => c.localName === "pPr"), rpr = firstRpr(p); [...p.childNodes].forEach(c => { if (c !== ppr) p.removeChild(c); }); if (line) p.appendChild(runFor(line, rpr)); };
  const fresh = (like, line) => { const p = el("p"), ppr = [...like.childNodes].find(c => c.localName === "pPr"); if (ppr) p.appendChild(ppr.cloneNode(true)); if (line) p.appendChild(runFor(line, firstRpr(like))); return p; };
  const ops = myers(oldLines, newLines); let i = 0, last = null; const dels = [], adds = [];
  const flush = () => {
    const n = Math.min(dels.length, adds.length);
    for (let k = 0; k < n; k++) setText(dels[k], adds[k]);
    let anchor = n ? dels[n - 1] : last;
    for (const line of adds.slice(n)) { const like = anchor || paras[0]; const np = fresh(like, line); if (anchor) anchor.parentNode.insertBefore(np, anchor.nextSibling); else body.insertBefore(np, body.firstChild); anchor = np; }
    for (const d of dels.slice(n)) { const cell = d.parentNode && d.parentNode.localName === "tc"; if (cell && d.parentNode.getElementsByTagNameNS(W_NS, "p").length === 1) setText(d, ""); else d.parentNode.removeChild(d); }
    if (n) last = dels[n - 1]; else if (adds.length > n) last = anchor;
    dels.length = 0; adds.length = 0;
  };
  for (const [t, v] of ops) { if (t === "=") { flush(); last = paras[i]; i++; } else if (t === "-") { dels.push(paras[i]); i++; } else adds.push(v); }
  flush();
  const out = new XMLSerializer().serializeToString(doc);
  const files = []; for (const n of z.names) { if (n.endsWith("/")) continue; files.push({ name: n, data: n === "word/document.xml" ? enc.encode(out) : await z.read(n) }); }
  return zipStore(files);
}

/* ---------- three-way merge, line by line ---------- */
function lineHunks(base, other) {
  const hs = []; let i = 0, cur = null;
  for (const [t, v] of myers(base, other)) { if (t === "=") { if (cur) { hs.push(cur); cur = null; } i++; } else { if (!cur) cur = { start: i, end: i, lines: [] }; if (t === "-") { i++; cur.end = i; } else cur.lines.push(v); } }
  if (cur) hs.push(cur); return hs;
}
function merge3(baseText, mineText, theirsText, choose) {
  if (mineText === theirsText) return { text: mineText, conflicts: 0 };
  if (mineText === baseText) return { text: theirsText, conflicts: 0 };
  if (theirsText === baseText) return { text: mineText, conflicts: 0 };
  const base = baseText.split("\n"), A = lineHunks(base, mineText.split("\n")).map(h => ({ ...h, side: "a" })), B = lineHunks(base, theirsText.split("\n")).map(h => ({ ...h, side: "b" }));
  const all = [...A, ...B].sort((x, y) => x.start - y.start || x.end - y.end), regions = [];
  for (const h of all) { const r = regions.at(-1); if (r && (h.start < r.end || h.start === r.start || (h.start === r.end && h.start === h.end && r.start === r.end))) { r.end = Math.max(r.end, h.end); r.hs.push(h); } else regions.push({ start: h.start, end: h.end, hs: [h] }); }
  const sideText = (r, side) => { const hs = r.hs.filter(h => h.side === side); if (!hs.length) return base.slice(r.start, r.end); const out = []; let k = r.start; for (const h of hs) { out.push(...base.slice(k, h.start), ...h.lines); k = h.end; } out.push(...base.slice(k, r.end)); return out; };
  const out = []; let pos = 0, conflicts = 0;
  for (const r of regions) {
    out.push(...base.slice(pos, r.start)); pos = r.end;
    const sides = new Set(r.hs.map(h => h.side)), a = sideText(r, "a"), b = sideText(r, "b");
    if (sides.size === 1) { out.push(...(sides.has("a") ? a : b)); continue; }
    if (a.join("\n") === b.join("\n")) { out.push(...a); continue; }
    conflicts++;
    if (choose === "mine") out.push(...a); else if (choose === "theirs") out.push(...b);
    else out.push("[[ Writer's Box version ]]", ...a, "[[ Other version ]]", ...b, "[[ End of both versions: keep one and delete these marker lines ]]");
  }
  out.push(...base.slice(pos));
  return { text: out.join("\n"), conflicts };
}

/* ---------- remembered file and folder links ---------- */
const HANDLE_MEM = new Map();
let handleDb = null;
function hdb() { return handleDb || (handleDb = new Promise((res, rej) => { const r = indexedDB.open("writers-box-handles", 1); r.onupgradeneeded = () => r.result.createObjectStore("h"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); })); }
async function putHandle(h) { const key = uid(); HANDLE_MEM.set(key, h); try { const db = await hdb(); await new Promise((res, rej) => { const t = db.transaction("h", "readwrite"); t.objectStore("h").put(h, key); t.oncomplete = res; t.onerror = () => rej(t.error); }); } catch (e) { /* kept for this session only */ } return key; }
async function getHandle(key) { if (HANDLE_MEM.has(key)) return HANDLE_MEM.get(key); try { const db = await hdb(); const h = await new Promise((res, rej) => { const r = db.transaction("h").objectStore("h").get(key); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); if (h) HANDLE_MEM.set(key, h); return h || null; } catch (e) { return null; } }
const canLinkFiles = () => typeof window.showOpenFilePicker === "function" && !inClaudeViewer();
const canLinkFolders = () => typeof window.showDirectoryPicker === "function" && !inClaudeViewer();
async function ensurePerm(h, write) { const mode = write ? "readwrite" : "read"; if (!h.queryPermission) return true; if (await h.queryPermission({ mode }) === "granted") return true; return (await h.requestPermission({ mode })) === "granted"; }
const srcOf = (p, key) => (p.sources || {})[key];
function setSrc(p, key, v) { p.sources = p.sources || {}; if (v) p.sources[key] = v; else delete p.sources[key]; }
const SYNC_EXT = ["tex", "bib", "md", "markdown", "txt", "docx", "xlsx", "csv", "tsv", "cls", "sty", "bst", "json", "yaml", "yml"];

/* bytes from a source → a working record */
async function recordFromBytes(p, path, u8) {
  if (kindOf(path) === "docx") return { text: await docxToText(u8), orig: b64.from(u8) };
  if (extOf(path) === "xlsx") return { text: await xlsxToText(u8), orig: b64.from(u8) };
  if (extOf(path) === "csv" || extOf(path) === "tsv") { const name = path.split("/").pop().replace(/\.[^.]+$/, ""); return { text: sheetsToText([{ name, rows: parseDelimited(dec.decode(u8).replace(/^﻿/, ""), extOf(path) === "csv" ? "," : "\t") }]), orig: null }; }
  return { text: dec.decode(u8).replace(/^﻿/, "").replace(/\r\n?/g, "\n"), orig: null };
}
/* Bring incoming text into the working copy, merging with unsaved Writer's Box edits when both changed.
   Returns { changed, conflicts, added } or null when cancelled. */
async function applyIncoming(p, path, next, syncedText, label) {
  const cur = p.working[path];
  if (!cur) { p.working[path] = next; return { changed: true, added: true, conflicts: 0 }; }
  if (cur.text === next.text) { if (next.orig && !cur.orig && !cur.base) cur.base = next.orig; return { changed: false, conflicts: 0 }; }
  const base = syncedText != null ? syncedText : (headId(p) && treeOf(p, headId(p))[path] ? blobText(p, treeOf(p, headId(p))[path]) : cur.text);
  const mineChanged = cur.text !== base, theirsChanged = next.text !== base;
  if (!mineChanged) { p.working[path] = next; return { changed: true, conflicts: 0 }; }
  if (!theirsChanged) return { changed: false, conflicts: 0, kept: true };
  let m = merge3(base, cur.text, next.text);
  if (m.conflicts) {
    const v = await modal({ title: "Changed in both places", body: `<p><strong>${esc(path)}</strong> was edited in Writer's Box and in ${esc(label)} since you last synced. Edits to different paragraphs are combined automatically.</p><p>${m.conflicts} paragraph${m.conflicts > 1 ? "s were" : " was"} changed in both. Which version should ${m.conflicts > 1 ? "they" : "it"} keep?</p>`,
      actions: [{ label: "Cancel", value: null }, { label: "Keep both, marked", value: "both" }, { label: `Use ${label}'s`, value: "theirs" }, { label: "Keep Writer's Box's", primary: true, value: "mine" }] });
    if (!v) return null;
    m = merge3(base, cur.text, next.text, v === "both" ? null : v);
  }
  p.working[path] = { text: m.text, orig: null, base: next.orig || cur.base || cur.orig || null };
  return { changed: true, conflicts: m.conflicts, merged: true };
}
function afterPull(p, results, label) {
  const changed = results.filter(r => r && r.changed);
  if (!changed.length) { toast(`Already up to date with ${label}.`); render(); return; }
  S.suggestedMsg = `Changes from ${label}`;
  go("compare", { cmp: { a: headId(p), b: "W" } });
  toast(`Pulled ${changed.length} file${changed.length > 1 ? "s" : ""} from ${label}. Review the changes, then save a version.`);
}

/* ---------- your computer: one file ---------- */
async function linkLocalFile(p, path) {
  let h;
  try { [h] = await window.showOpenFilePicker({ multiple: false, id: "wb-link" }); } catch (e) { if (e.name !== "AbortError") toast("Couldn't open the file: " + e.message); return; }
  const file = await h.getFile();
  if (extOf(file.name) !== extOf(path) && !await confirmBox("Different file type", `${esc(file.name)} isn't the same type as ${esc(path)}. Link it anyway?`, "Link")) return;
  const key = await putHandle(h);
  setSrc(p, path, { kind: "local", key, name: file.name, linkedAt: Date.now(), modified: null, syncedText: null });
  persist(p, true);
  if (await confirmBox(`Linked to ${file.name}`, `Pull now to bring in what's in ${esc(file.name)}? You'll see the changes before saving a version.`, "Pull now")) return localPull(p, path);
  render();
}
async function localPull(p, path) {
  const src = srcOf(p, path); if (!src) return;
  if (src.kind === "local-manual") return manualPull(p, path);
  const h = await getHandle(src.key); if (!h) return relinkFlow(p, path);
  try { if (!await ensurePerm(h, false)) return toast("Writer's Box needs permission to read the file. Try Pull again and choose Allow."); }
  catch (e) { return relinkFlow(p, path); }
  let file; try { file = await h.getFile(); } catch (e) { return relinkFlow(p, path, "The file has moved or been renamed."); }
  const next = await recordFromBytes(p, path, new Uint8Array(await file.arrayBuffer()));
  const r = await applyIncoming(p, path, next, src.syncedText, file.name); if (!r) return;
  src.modified = file.lastModified; src.syncedText = next.text; src.pulledAt = Date.now(); src.name = file.name;
  await persist(p, true); afterPull(p, [r], file.name);
}
async function localPush(p, path, force) {
  const src = srcOf(p, path), f = p.working[path]; if (!src || !f) return;
  if (src.kind === "local-manual") return manualPush(p, path);
  const h = await getHandle(src.key); if (!h) return relinkFlow(p, path);
  try { if (!await ensurePerm(h, true)) return toast("Writer's Box needs permission to save to the file. Try Push again and choose Allow."); } catch (e) { return relinkFlow(p, path); }
  let file; try { file = await h.getFile(); } catch (e) { return relinkFlow(p, path, "The file has moved or been renamed."); }
  if (!force && src.modified && file.lastModified > src.modified + 1000) {
    const v = await modal({ title: `${file.name} changed`, body: `<p>${esc(file.name)} was edited on your computer after you last pulled or pushed. Pushing now would replace those edits.</p>`, actions: [{ label: "Cancel", value: null }, { label: "Replace it anyway", danger: true, value: "push" }, { label: "Pull first", primary: true, value: "pull" }] });
    if (v === "pull") return localPull(p, path); if (v !== "push") return;
  }
  const bytes = await outgoingBytes(p, path, f);
  const w = await h.createWritable(); await w.write(bytes); await w.close();
  const after = await h.getFile(); src.modified = after.lastModified; src.syncedText = f.text; src.pushedAt = Date.now();
  await persist(p, true); render(); toast(`Pushed to ${file.name}.`);
}
async function outgoingBytes(p, path, f) {
  if (kindOf(path) === "docx" && !f.orig && f.base) { try { return await docxPatch(b64.to(f.base), f.text); } catch (e) { /* fall back to plain */ } }
  return bytesOf(p, path, f);
}
function relinkFlow(p, path, why) {
  modal({ title: "Link the file again", body: `<p>${esc(why || "Writer's Box can't reach the linked file any more (browsers forget links when site data is cleared, or the file moved).")}</p><p>Choose the file on your computer again to keep pulling and pushing.</p>`, actions: [{ label: "Unlink", value: "unlink", onClick: () => { setSrc(p, path, null); persist(p, true); render(); return true; } }, { label: "Choose the file", primary: true, onClick: () => { setTimeout(() => linkLocalFile(p, path)); return true; } }] });
}
/* Browsers without file links (Safari, Firefox, Claude's preview): pull by choosing the file, push by downloading it */
function linkManual(p, path) { setSrc(p, path, { kind: "local-manual", name: path.split("/").pop(), linkedAt: Date.now(), syncedText: p.working[path] ? p.working[path].text : null }); persist(p, true); render(); toast("Linked. Pull asks you to choose the file; Push downloads it so you can save over the original."); }
function manualPull(p, path) {
  const inp = document.createElement("input"); inp.type = "file"; inp.accept = "." + extOf(path);
  inp.onchange = async () => { const file = inp.files[0]; if (!file) return; const src = srcOf(p, path); const next = await recordFromBytes(p, path, new Uint8Array(await file.arrayBuffer())); const r = await applyIncoming(p, path, next, src.syncedText, file.name); if (!r) return; src.syncedText = next.text; src.pulledAt = Date.now(); src.name = file.name; await persist(p, true); afterPull(p, [r], file.name); };
  inp.click();
}
async function manualPush(p, path) { const src = srcOf(p, path), f = p.working[path]; const bytes = await outgoingBytes(p, path, f); await offerFile(src.name || path.split("/").pop(), bytes, kindOf(path) === "text" ? f.text : undefined); src.syncedText = f.text; src.pushedAt = Date.now(); persist(p, true); toast(`Downloaded ${src.name}. Save it over the original on your computer.`); }

/* ---------- your computer: a whole folder ---------- */
async function linkFolder(p) {
  let h; try { h = await window.showDirectoryPicker({ id: "wb-folder", mode: "readwrite" }); } catch (e) { if (e.name !== "AbortError") toast("Couldn't open the folder: " + e.message); return; }
  const key = await putHandle(h);
  setSrc(p, "@folder", { kind: "folder", key, name: h.name, linkedAt: Date.now(), files: {} }); persist(p, true);
  if (await confirmBox(`Linked to the folder “${h.name}”`, "Pull now to bring in its writing files? New files are added; files already in Writer's Box are updated so you can review the changes.", "Pull now")) return folderPull(p);
  render();
}
async function walkFolder(dir, prefix = "", out = []) {
  for await (const [name, h] of dir.entries()) {
    if (name.startsWith(".") || ["node_modules", "__MACOSX", "_to_delete"].includes(name)) continue;
    if (h.kind === "directory") await walkFolder(h, prefix + name + "/", out);
    else if (SYNC_EXT.includes(extOf(name))) out.push({ path: prefix + name, h });
  }
  return out;
}
async function folderHandle(p, write) {
  const src = srcOf(p, "@folder"); const h = src && await getHandle(src.key);
  if (!h) { toast("Link the folder again: Writer's Box can't reach it any more."); return null; }
  try { if (!await ensurePerm(h, write)) { toast("Writer's Box needs permission for the folder. Try again and choose Allow."); return null; } } catch (e) { toast("Link the folder again."); return null; }
  return h;
}
async function folderPull(p) {
  const src = srcOf(p, "@folder"), h = await folderHandle(p, false); if (!h) return;
  const pm = progressModal(`Pulling from ${src.name}`), results = [];
  try {
    for (const { path, h: fh } of await walkFolder(h)) {
      pm.set(path); const file = await fh.getFile(), rec = src.files[path] || {};
      if (rec.modified && file.lastModified <= rec.modified && p.working[path]) continue;
      const next = await recordFromBytes(p, path, new Uint8Array(await file.arrayBuffer()));
      pm.close(); const r = await applyIncoming(p, path, next, rec.syncedText, src.name); if (r === null) { await persist(p, true); return; }
      results.push(r); src.files[path] = { modified: file.lastModified, syncedText: next.text };
    }
  } finally { pm.close(); }
  src.pulledAt = Date.now(); await persist(p, true); afterPull(p, results, `the folder “${src.name}”`);
}
async function folderPush(p) {
  const src = srcOf(p, "@folder"), h = await folderHandle(p, true); if (!h) return;
  const targets = Object.keys(p.working).filter(path => SYNC_EXT.includes(extOf(path)) && (!src.files[path] || src.files[path].syncedText !== p.working[path].text));
  if (!targets.length) return toast(`Nothing to push: ${src.name} already has your latest text.`);
  const getFile = async (path, create) => { const parts = path.split("/"); let d = h; for (const seg of parts.slice(0, -1)) d = await d.getDirectoryHandle(seg, { create }); return d.getFileHandle(parts.at(-1), { create }); };
  const clash = [];
  for (const path of targets) { try { const fh = await getFile(path, false), file = await fh.getFile(); const rec = src.files[path]; if (rec && file.lastModified > rec.modified + 1000) clash.push(path); } catch (e) { /* new file */ } }
  if (clash.length) {
    const v = await modal({ title: "Changed in the folder too", body: `<p>${clash.length === 1 ? esc(clash[0]) + " was" : clash.length + " files were"} edited in “${esc(src.name)}” after you last synced. Pushing would replace those edits.</p>`, actions: [{ label: "Cancel", value: null }, { label: "Replace them", danger: true, value: "push" }, { label: "Pull first", primary: true, value: "pull" }] });
    if (v === "pull") return folderPull(p); if (v !== "push") return;
  }
  const pm = progressModal(`Pushing to ${src.name}`);
  try { for (const path of targets) { pm.set(path); const fh = await getFile(path, true), w = await fh.createWritable(); await w.write(await outgoingBytes(p, path, p.working[path])); await w.close(); src.files[path] = { modified: (await fh.getFile()).lastModified, syncedText: p.working[path].text }; } }
  finally { pm.close(); }
  src.pushedAt = Date.now(); await persist(p, true); render(); toast(`Pushed ${targets.length} file${targets.length > 1 ? "s" : ""} to ${src.name}.`);
}

/* ---------- Overleaf without GitHub: download and upload ---------- */
function overleafPull(p) {
  const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".zip";
  inp.onchange = async () => {
    const file = inp.files[0]; if (!file) return;
    const src = srcOf(p, "@overleaf") || { kind: "overleaf", files: {} }; src.files = src.files || {}; setSrc(p, "@overleaf", src);
    const z = unzip(new Uint8Array(await file.arrayBuffer())); let names = z.names.filter(n => !n.endsWith("/") && !/(^|\/)(__MACOSX|\.)/.test(n) && SYNC_EXT.includes(extOf(n)));
    const roots = new Set(names.map(n => n.split("/")[0])), strip = roots.size === 1 && names.every(n => n.includes("/")), results = [];
    for (const n of names) { const path = strip ? n.split("/").slice(1).join("/") : n; const next = await recordFromBytes(p, path, await z.read(n)); const r = await applyIncoming(p, path, next, (src.files[path] || {}).syncedText, "Overleaf"); if (r === null) break; results.push(r); src.files[path] = { syncedText: next.text }; }
    src.pulledAt = Date.now(); await persist(p, true); afterPull(p, results, "Overleaf");
  };
  inp.click();
}
async function overleafPush(p) {
  const src = srcOf(p, "@overleaf") || { kind: "overleaf", files: {} }; src.files = src.files || {}; setSrc(p, "@overleaf", src);
  const paths = Object.keys(p.working).filter(path => ["tex", "bib", "cls", "sty", "bst"].includes(extOf(path)) && (src.files[path] || {}).syncedText !== p.working[path].text);
  if (!paths.length) return toast("Nothing to push: Overleaf already has your latest LaTeX files.");
  const name = slug(p.name) + "-for-overleaf.zip";
  await offerFile(name, zipStore(paths.map(path => ({ name: path, data: enc.encode(p.working[path].text) }))));
  for (const path of paths) src.files[path] = { syncedText: p.working[path].text };
  src.pushedAt = Date.now(); await persist(p, true); render();
  modal({ title: "Upload to Overleaf", body: `<p>Downloaded <strong>${esc(name)}</strong> with ${paths.length} changed file${paths.length > 1 ? "s" : ""}: ${paths.map(x => `<span class="mono">${esc(x)}</span>`).join(", ")}.</p><ol class="steps"><li>Open your project in Overleaf${src.url ? ` (<a href="${esc(src.url)}" target="_blank" rel="noopener">open it</a>)` : ""}.</li><li>Unzip the download, then in Overleaf's file list choose <strong>Upload</strong> and drop the files in.</li><li>Choose <strong>Overwrite</strong> when Overleaf asks about files that already exist.</li></ol>`, actions: [{ label: "Done", primary: true }] });
}

/* ---------- the Sync panel ---------- */
function syncSummary(p) {
  let n = 0;
  for (const [path, rec] of Object.entries(p.live || {})) if (p.working[path] && hasNewEdits(rec)) n++;
  return n;
}
function syncFlowPanel(p) {
  const files = Object.keys(p.working).filter(x => SYNC_EXT.includes(extOf(x))).sort();
  const locals = Object.entries(p.sources || {}).filter(([k, v]) => !k.startsWith("@") && p.working[k] && (v.kind === "local" || v.kind === "local-manual"));
  const folder = srcOf(p, "@folder"), ol = srcOf(p, "@overleaf") || {}, lives = Object.entries(p.live || {}).filter(([path]) => p.working[path]), remote = isRemote(p);
  const when = t => t ? ago(t) : "never";
  const row = (icon, title, sub, btns) => `<div class="Box-row sync-row">${ic(icon)}<div class="grow" style="min-width:0"><strong>${title}</strong><div class="muted" style="font-size:12px">${sub}</div></div>${btns}</div>`;
  const pp = (pull, push, extra = "") => `<button class="btn btn-sm" ${pull} title="Bring changes into Writer's Box">${ic("download")} Pull</button><button class="btn btn-sm" ${push} title="Send Writer's Box changes out">${ic("import")} Push</button>${extra}`;
  modal({
    title: "Sync",
    body: `<p class="muted" style="margin-top:0"><strong>Pull</strong> brings changes made elsewhere into Writer's Box, where you review them before saving a version. <strong>Push</strong> sends your Writer's Box text out. If both sides changed, edits to different paragraphs are combined and you're asked about the rest.</p>
      <h4 class="se-h">Your computer</h4><div class="Box">
        ${folder ? row("folder", `Folder: ${esc(folder.name)}`, `Every writing file in the folder · pulled ${when(folder.pulledAt)} · pushed ${when(folder.pushedAt)}`, pp(`data-s="folder-pull"`, `data-s="folder-push"`, `<button class="btn-octicon" data-s="folder-unlink" title="Unlink folder" aria-label="Unlink folder">${ic("x")}</button>`)) : ""}
        ${locals.map(([path, s]) => row(kindOf(path) === "docx" ? "fileWord" : "fileText", `${esc(path)} <span class="muted" style="font-weight:400">⇄ ${esc(s.name)}</span>`, s.kind === "local-manual" ? "Pull: choose the file · Push: download it to save over the original" : `Pulled ${when(s.pulledAt)} · pushed ${when(s.pushedAt)}`, pp(`data-s="pull" data-path="${esc(path)}"`, `data-s="push" data-path="${esc(path)}"`, `<button class="btn-octicon" data-s="unlink" data-path="${esc(path)}" title="Unlink" aria-label="Unlink ${esc(path)}">${ic("x")}</button>`))).join("")}
        <div class="Box-row sync-link"><div class="grow"><label for="sy-file" style="margin:0">Link a Writer's Box file to a file on your computer<select class="form" id="sy-file">${files.filter(x => !srcOf(p, x)).map(x => `<option>${esc(x)}</option>`).join("")}</select></label></div><button class="btn btn-sm" data-s="link">Choose file…</button>${canLinkFolders() && !folder ? `<button class="btn btn-sm" data-s="link-folder">Link a whole folder…</button>` : ""}</div>
        ${canLinkFiles() ? "" : `<div class="Box-row muted" style="font-size:12px">${inClaudeViewer() ? "In Claude's preview" : "In this browser"}, Writer's Box can't keep a link to a file. Pull asks you to choose the file each time and Push downloads it for you to save over the original. Chrome and Edge on your hosted site can pull and push directly.</div>`}
      </div>
      <h4 class="se-h">Google Docs and Word online</h4><div class="Box">
        ${lives.length ? lives.map(([path, rec]) => row("people", `${esc(path)} <span class="muted" style="font-weight:400">⇄ ${esc(liveTarget(rec.provider, path))}</span>`, `${hasNewEdits(rec) ? `<span class="label label-attention">New edits</span> ` : ""}Shared ${when(rec.sharedAt)} · last pulled ${when(rec.pulledAt)}`, pp(`data-s="live-pull" data-path="${esc(path)}"`, `data-s="live-push" data-path="${esc(path)}"`))).join("") : `<div class="Box-row muted">No live documents yet. Open a file and choose <strong>Collaborate live</strong> to share it to Google Docs or Word online.</div>`}
      </div>
      <h4 class="se-h">GitHub</h4><div class="Box">
        ${remote ? row("cloud", esc(p.remote.owner + "/" + p.remote.repo), `Saved versions go to GitHub as you save · synced ${when(p.remote.syncedAt)}${changedPaths(p).length ? ` · <strong>${changedPaths(p).length} unsaved change${changedPaths(p).length > 1 ? "s" : ""}</strong>` : ""}`, pp(`data-s="gh-pull"`, `data-s="gh-push"`))
          : row("cloud", "Not on GitHub yet", "Publish to keep the project online, work with collaborators, and sync with Overleaf.", `<button class="btn btn-sm btn-primary" data-s="gh-publish">Publish to GitHub</button>`)}
      </div>
      <h4 class="se-h">Overleaf</h4><div class="Box">
        ${remote ? row("cloud", "Through GitHub (two-way)", `In Overleaf, open Menu › GitHub and link this project to <span class="mono">${esc(p.remote.owner + "/" + p.remote.repo)}</span> (Overleaf plans that include GitHub sync). Then: Push here, and choose “Pull GitHub changes into Overleaf” there; or “Push Overleaf changes to GitHub” there, and Pull here.`, pp(`data-s="gh-pull"`, `data-s="gh-push"`)) : ""}
        ${row("download", remote ? "Or by download and upload" : "By download and upload", `Pull: in Overleaf choose Menu › Download › Source, then pick the .zip here. Push: downloads your changed LaTeX files to upload into Overleaf. ${ol.pulledAt ? "Pulled " + when(ol.pulledAt) + "." : ""}`, pp(`data-s="ol-pull"`, `data-s="ol-push"`))}
        <div class="Box-row"><label for="sy-ol" class="grow" style="margin:0">Overleaf project link <span class="muted" style="font-weight:400">(optional, for quick access)</span><input type="url" id="sy-ol" value="${esc(ol.url || "")}" placeholder="https://www.overleaf.com/project/…"></label>${ol.url ? `<a class="btn btn-sm" href="${esc(ol.url)}" target="_blank" rel="noopener">Open in Overleaf</a>` : ""}</div>
      </div>`,
    onOpen: ov => {
      const close = () => ov.querySelector("[data-x]").click();
      $("#sy-ol", ov).onchange = e => { const v = e.target.value.trim(); const s = srcOf(p, "@overleaf") || { kind: "overleaf", files: {} }; if (v && !/^https:\/\/(www\.)?overleaf\.com\//.test(v)) { toast("That doesn't look like an Overleaf link."); return; } s.url = v; setSrc(p, "@overleaf", s); persist(p, true); };
      ov.querySelectorAll("[data-s]").forEach(b => b.onclick = async () => {
        const a = b.dataset.s, path = b.dataset.path; close();
        if (a === "link") { const target = $("#sy-file", ov).value; if (!target) return; return canLinkFiles() ? linkLocalFile(p, target) : linkManual(p, target); }
        if (a === "link-folder") return linkFolder(p);
        if (a === "pull") return localPull(p, path);
        if (a === "push") return localPush(p, path);
        if (a === "unlink") { setSrc(p, path, null); persist(p, true); render(); return toast("Unlinked. The file on your computer isn't changed."); }
        if (a === "folder-pull") return folderPull(p);
        if (a === "folder-push") return folderPush(p);
        if (a === "folder-unlink") { setSrc(p, "@folder", null); persist(p, true); render(); return toast("Folder unlinked. Nothing in it was changed."); }
        if (a === "live-pull") return bringBackFlow(p, path);
        if (a === "live-push") { if (!await confirmBox("Push to the live document?", `This replaces the text of the live document with ${esc(path)} as it is in Writer's Box. Pull first if collaborators made edits you haven't brought back.`, "Push")) return; const pm = progressModal("Pushing"); try { await pushLive(p, path); pm.close(); toast("The live document now has your latest text."); render(); } catch (e) { pm.close(); toast(e.message); } return; }
        if (a === "gh-pull") return syncFlow(p);
        if (a === "gh-push") return changedPaths(p).length ? saveFlow() : toast("GitHub already has all your saved versions.");
        if (a === "gh-publish") return ghSignedIn() ? publishFlow(p) : signInFlow();
        if (a === "ol-pull") return overleafPull(p);
        if (a === "ol-push") return overleafPush(p);
      });
    },
    actions: [{ label: "Close" }]
  });
}
/* Bar above the editor for a file that's linked somewhere */
function sourceBar(p, path) {
  const s = srcOf(p, path), folder = srcOf(p, "@folder"), live = (p.live || {})[path];
  const items = [];
  if (s && (s.kind === "local" || s.kind === "local-manual")) items.push(`<span>${ic("download")} Linked to <strong>${esc(s.name)}</strong> on your computer${s.pulledAt || s.pushedAt ? ` · synced ${ago(Math.max(s.pulledAt || 0, s.pushedAt || 0))}` : ""}</span><button class="btn btn-sm" data-src="pull">Pull</button><button class="btn btn-sm" data-src="push">Push</button>`);
  else if (folder && (folder.files || {})[path]) items.push(`<span>${ic("folder")} In the linked folder <strong>${esc(folder.name)}</strong></span><button class="btn btn-sm" data-src="fpull">Pull</button><button class="btn btn-sm" data-src="fpush">Push</button>`);
  if (live) items.push(`<span>${ic("people")} Live in ${esc(liveTarget(live.provider, path))}${hasNewEdits(live) ? ` <span class="label label-attention">New edits</span>` : ""}</span><button class="btn btn-sm" data-src="lpull">Pull</button>`);
  if (!items.length) return "";
  return `<div class="src-bar">${items.join('<span class="src-sep"></span>')}<span class="grow"></span><button class="link" data-src="panel" style="font-size:12px">All sources</button></div>`;
}
function bindSourceBar(p, path, el) {
  el.querySelectorAll("[data-src]").forEach(b => b.onclick = () => ({ pull: () => localPull(p, path), push: () => localPush(p, path), fpull: () => folderPull(p), fpush: () => folderPush(p), lpull: () => bringBackFlow(p, path), panel: () => syncFlowPanel(p) })[b.dataset.src]());
}
