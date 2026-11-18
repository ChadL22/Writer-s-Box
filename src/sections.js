
/* ============ Sections: split a document into section files ============
   A sectioned document is a main file that pulls its sections in, in order:
     LaTeX     \input{memo/introduction}            (standard LaTeX, so it still compiles and works in Overleaf)
     Markdown  <!-- include: memo/introduction.md -->  (an HTML comment, invisible in Markdown viewers)
   Each section is an ordinary file, so it has its own history, line history, reviews and live sharing. */
const secFmt = path => { const e = extOf(path); return e === "tex" ? "tex" : e === "md" || e === "markdown" ? "md" : null; };
const dirOf = path => path.includes("/") ? path.slice(0, path.lastIndexOf("/") + 1) : "";
const stemOf = path => path.split("/").pop().replace(/\.[^.]+$/, "");
const TEX_RANK = { part: 0, chapter: 1, section: 2, subsection: 3, subsubsection: 4 };
const TEX_INC = /^\s*\\(?:input|include|subfile)\{([^}]+)\}/, MD_INC = /^\s*<!--\s*include:\s*(.+?)\s*-->\s*$/;
const TEX_TAIL = /^\s*\\(?:bibliography(?:style)?\{|printbibliography|end\{document\})/;

function normPath(path) { const out = []; for (const s of path.split("/")) { if (s === "..") out.pop(); else if (s && s !== ".") out.push(s); } return out.join("/"); }
function incTarget(main, arg, fmt) { let a = arg.trim(); if (fmt === "tex" && !/\.\w+$/.test(a)) a += ".tex"; return normPath(dirOf(main) + a); }
function incArg(main, target, fmt) {
  const from = dirOf(main).split("/").filter(Boolean), to = target.split("/");
  let i = 0; while (i < from.length && i < to.length - 1 && from[i] === to[i]) i++;
  const rel = [...from.slice(i).map(() => ".."), ...to.slice(i)].join("/");
  return fmt === "tex" ? rel.replace(/\.tex$/, "") : rel;
}
const incLine = (main, target, fmt) => fmt === "tex" ? `\\input{${incArg(main, target, fmt)}}` : `<!-- include: ${incArg(main, target, fmt)} -->`;

/* Sections a main file pulls in: [{ line, path, exists }] */
function secIncludes(p, main) {
  const fmt = secFmt(main), f = p.working[main]; if (!fmt || !f) return [];
  const out = [];
  f.text.split("\n").forEach((l, i) => { if (fmt === "tex" && /^\s*%/.test(l)) return; const m = (fmt === "tex" ? TEX_INC : MD_INC).exec(l); if (m) { const path = incTarget(main, m[1], fmt); out.push({ line: i, path, exists: !!p.working[path] }); } });
  return out;
}
/* Main files that pull in this file */
function secParents(p, path) { return Object.keys(p.working).filter(m => m !== path && secFmt(m) && secIncludes(p, m).some(s => s.path === path)); }

function balanced(s, i) { let d = 0; for (let j = i; j < s.length; j++) { if (s[j] === "{") d++; else if (s[j] === "}" && --d === 0) return s.slice(i + 1, j); } return s.slice(i + 1); }
/* Headings in a file: [{ line, rank, title }] (rank 0 = largest) */
function secHeadings(text, fmt) {
  const out = []; let fence = false, front = false;
  text.split("\n").forEach((l, i) => {
    if (fmt === "md") {
      if (i === 0 && l.trim() === "---") { front = true; return; }
      if (front) { if (/^(---|\.\.\.)\s*$/.test(l)) front = false; return; }
      if (/^\s*(```|~~~)/.test(l)) { fence = !fence; return; }
      if (fence) return;
      const m = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(l); if (m) out.push({ line: i, rank: m[1].length, title: m[2] });
    } else {
      const m = /^\s*\\(part|chapter|section|subsection|subsubsection)\*?\s*(\[[^\]]*\])?\s*\{/.exec(l);
      if (m) out.push({ line: i, rank: TEX_RANK[m[1]], title: texText(balanced(l, m[0].length - 1)).trim() });
    }
  });
  return out;
}
const rankName = (fmt, r) => fmt === "md" ? `${"#".repeat(r)} headings` : Object.keys(TEX_RANK).find(k => TEX_RANK[k] === r).replace(/^./, c => c.toUpperCase()) + "s";
function secTitle(p, path) { const f = p.working[path], fmt = secFmt(path); if (!f) return stemOf(path); const h = fmt ? secHeadings(f.text, fmt)[0] : null; return h ? h.title : stemOf(path).replace(/[-_]+/g, " ").replace(/^./, c => c.toUpperCase()); }

function freePath(p, want, taken) { let q = want, n = 2; while (p.working[q] || taken.has(q)) q = want.replace(/(\.\w+)$/, `-${n++}$1`); taken.add(q); return q; }

/* Plan a split at headings of `rank` or larger. Returns { head, tail, chunks: [{ title, path, text }] } */
function planSplit(p, main, rank, folder) {
  const fmt = secFmt(main), lines = p.working[main].text.split("\n");
  const hs = secHeadings(lines.join("\n"), fmt).filter(h => h.rank <= rank);
  if (!hs.length) return null;
  let end = lines.length;
  if (fmt === "tex") { for (let i = hs[hs.length - 1].line + 1; i < lines.length; i++) if (TEX_TAIL.test(lines[i])) { end = i; break; } }
  const ext = fmt === "tex" ? ".tex" : "." + extOf(main), taken = new Set(), dir = normPath(dirOf(main) + folder.replace(/^\/+|\/+$/g, ""));
  const chunks = hs.map((h, k) => {
    const to = k + 1 < hs.length ? hs[k + 1].line : end;
    const body = lines.slice(h.line, to); while (body.length && !body[body.length - 1].trim()) body.pop();
    return { title: h.title, path: freePath(p, (dir ? dir + "/" : "") + (slug(h.title) || "section") + ext, taken), text: body.join("\n") + "\n" };
  });
  const head = lines.slice(0, hs[0].line); while (head.length && !head[head.length - 1].trim()) head.pop();
  return { head, tail: lines.slice(end), chunks, fmt };
}
function applySplit(p, main, plan) {
  for (const c of plan.chunks) p.working[c.path] = { text: c.text, orig: null };
  const inc = plan.chunks.map(c => incLine(main, c.path, plan.fmt));
  p.working[main].text = [...plan.head, ...(plan.head.length ? [""] : []), ...inc, ...(plan.tail.length ? ["", ...plan.tail] : [])].join("\n").replace(/\n*$/, "\n");
}
/* The whole document with sections pulled in */
function assemble(p, main, depth = 0, seen = new Set([main])) {
  const fmt = secFmt(main), f = p.working[main]; if (!f) return "";
  return f.text.split("\n").map(l => {
    const m = fmt && !(fmt === "tex" && /^\s*%/.test(l)) ? (fmt === "tex" ? TEX_INC : MD_INC).exec(l) : null;
    if (!m) return l; const t = incTarget(main, m[1], fmt);
    if (!p.working[t] || seen.has(t) || depth > 6) return l;
    return assemble(p, t, depth + 1, new Set([...seen, t])).replace(/\n$/, "");
  }).join("\n");
}
function secInsertAt(p, main) {
  const incs = secIncludes(p, main), lines = p.working[main].text.split("\n");
  if (incs.length) return incs[incs.length - 1].line + 1;
  if (secFmt(main) === "tex") { const i = lines.findIndex(l => TEX_TAIL.test(l)); if (i >= 0) return i; }
  let n = lines.length; while (n > 0 && !lines[n - 1].trim()) n--; return n;
}

/* ---------- Sections panel in the file view ---------- */
function sectionsBar(p, path) {
  const fmt = secFmt(path); if (!fmt && !secParents(p, path).length) return "";
  const incs = fmt ? secIncludes(p, path) : [];
  if (incs.length) {
    const words = incs.reduce((n, s) => n + (s.exists ? wordCount(p.working[s.path].text) : 0), 0);
    const open = S.secOpen !== false;
    return `<div class="Box sec-box" style="margin-bottom:16px">
      <div class="Box-header"><button class="link sec-toggle" data-sec-toggle aria-expanded="${open}">${ic("sections")} <strong>${incs.length} section${incs.length > 1 ? "s" : ""}</strong></button><span class="muted" style="font-size:12px">${words.toLocaleString()} words in sections · each section is its own file</span><span class="grow"></span><button class="btn btn-sm" data-sec-add>${ic("plus")} Add section</button><button class="btn btn-sm" data-sec-menu>${ic("kebab")}<span class="sr">More section actions</span></button></div>
      ${open ? `<ol class="sec-list">${incs.map((s, i) => `<li class="Box-row" data-sec="${i}">
        <span class="sec-n">${i + 1}</span>
        <div class="grow" style="min-width:0">${s.exists ? `<button class="link sec-title" data-sec-open="${esc(s.path)}">${esc(secTitle(p, s.path))}</button>` : `<span class="sec-title">${esc(stemOf(s.path))}</span> <span class="label label-danger">File missing</span>`}<div class="muted mono sec-path">${esc(s.path)}</div></div>
        ${s.exists ? `${sectionCountHtml(p, s.path)}${statusLabel(fileStatus(p, s.path))}` : ""}
        <button class="btn-octicon" data-sec-up="${i}" ${i ? "" : "disabled"} title="Move up" aria-label="Move ${esc(s.path)} up">${ic("chevronUp")}</button>
        <button class="btn-octicon" data-sec-down="${i}" ${i < incs.length - 1 ? "" : "disabled"} title="Move down" aria-label="Move ${esc(s.path)} down">${ic("chevronDown")}</button>
        <button class="btn-octicon" data-sec-rm="${i}" title="Remove from this document" aria-label="Remove ${esc(s.path)}">${ic("x")}</button></li>`).join("")}</ol>` : ""}
    </div>`;
  }
  const parents = secParents(p, path);
  if (parents.length) {
    const main = parents[0], incs = secIncludes(p, main).filter(s => s.exists), i = incs.findIndex(s => s.path === path);
    const prev = incs[i - 1], next = incs[i + 1];
    return `<div class="Box sec-nav" style="margin-bottom:16px"><div class="Box-row">${ic("sections")}<span>Section <strong>${i + 1}</strong> of ${incs.length} in <button class="link" data-sec-open="${esc(main)}">${esc(main)}</button></span><span class="grow"></span>
      <button class="btn btn-sm" ${prev ? `data-sec-open="${esc(prev.path)}" title="${esc(secTitle(p, prev.path))}"` : "disabled"}>‹ Previous</button><button class="btn btn-sm" ${next ? `data-sec-open="${esc(next.path)}" title="${esc(secTitle(p, next.path))}"` : "disabled"}>Next ›</button></div></div>`;
  }
  return "";
}
function bindSections(p, path, el) {
  const rerender = () => go("file", { file: path }, true);
  el.querySelectorAll("[data-sec-open]").forEach(b => b.onclick = () => go("file", { file: b.dataset.secOpen }));
  const tg = el.querySelector("[data-sec-toggle]"); if (tg) tg.onclick = () => { S.secOpen = S.secOpen === false; rerender(); };
  const add = el.querySelector("[data-sec-add]"); if (add) add.onclick = () => addSectionFlow(p, path);
  const menu = el.querySelector("[data-sec-menu]"); if (menu) menu.onclick = () => sectionsFlow(p, path);
  const swap = (i, j) => { const incs = secIncludes(p, path), lines = p.working[path].text.split("\n"); const a = incs[i].line, b = incs[j].line; [lines[a], lines[b]] = [lines[b], lines[a]]; p.working[path].text = lines.join("\n"); persist(p, true); rerender(); };
  el.querySelectorAll("[data-sec-up]").forEach(b => b.onclick = () => swap(+b.dataset.secUp, +b.dataset.secUp - 1));
  el.querySelectorAll("[data-sec-down]").forEach(b => b.onclick = () => swap(+b.dataset.secDown, +b.dataset.secDown + 1));
  el.querySelectorAll("[data-sec-rm]").forEach(b => b.onclick = async () => {
    const s = secIncludes(p, path)[+b.dataset.secRm];
    const v = await modal({ title: "Remove section", body: `<p>Take <strong>${esc(s.exists ? secTitle(p, s.path) : s.path)}</strong> out of ${esc(path)}?</p>${s.exists ? `<p class="muted">You can keep <span class="mono">${esc(s.path)}</span> as a separate file, or delete it. Either way, past versions keep it.</p>` : ""}`,
      actions: [{ label: "Cancel", value: null }, ...(s.exists ? [{ label: "Delete the file too", danger: true, value: "delete" }] : []), { label: s.exists ? "Keep the file" : "Remove", primary: true, value: "keep" }] });
    if (!v) return;
    const lines = p.working[path].text.split("\n"); lines.splice(s.line, 1); p.working[path].text = lines.join("\n");
    if (v === "delete" && !secParents(p, s.path).length) delete p.working[s.path];
    persist(p, true); rerender(); toast("Section removed. Save a version to keep the change.");
  });
}

/* ---------- Split / add / combine ---------- */
function sectionsFlow(p, path) {
  const fmt = secFmt(path), incs = secIncludes(p, path), hs = secHeadings(p.working[path].text, fmt);
  const ranks = [...new Set(hs.map(h => h.rank))].sort((a, b) => a - b);
  if (incs.length) {
    return modal({ title: "Sections", body: `<p>${esc(path)} is made of ${incs.length} section file${incs.length > 1 ? "s" : ""}.</p>
      <div class="Box"><div class="Box-row"><div class="grow"><strong>Download the whole document</strong><div class="muted" style="font-size:12px">One ${fmt === "tex" ? ".tex" : ".md"} file with every section pulled in</div></div><button class="btn btn-sm" data-act="dl">Download</button></div>
      ${fmt === "md" ? `<div class="Box-row"><div class="grow"><strong>Download as Word</strong><div class="muted" style="font-size:12px">The whole document as one .docx</div></div><button class="btn btn-sm" data-act="docx">Download</button></div>` : ""}
      ${hs.length ? `<div class="Box-row"><div class="grow"><strong>Split the rest</strong><div class="muted" style="font-size:12px">${hs.length} heading${hs.length > 1 ? "s are" : " is"} still in ${esc(path)} itself</div></div><button class="btn btn-sm" data-act="split">Split</button></div>` : ""}
      <div class="Box-row"><div class="grow"><strong>Combine into one file</strong><div class="muted" style="font-size:12px">Put every section back into ${esc(path)} and remove the section files</div></div><button class="btn btn-sm btn-danger" data-act="combine">Combine</button></div></div>`,
      onOpen: ov => ov.querySelectorAll("[data-act]").forEach(b => b.onclick = async () => {
        const act = b.dataset.act; ov.querySelector("[data-x]").click();
        if (act === "dl") { const t = assemble(p, path); return offerFile(path.split("/").pop(), t, t); }
        if (act === "docx") return offerFile(stemOf(path) + ".docx", mdToDocx(assemble(p, path)));
        if (act === "split") return splitFlow(p, path);
        if (!await confirmBox("Combine sections?", `Every section will be put back into ${esc(path)}, and the ${incs.filter(s => s.exists).length} section files will be removed from the project. Past versions keep them.`, "Combine", true)) return;
        const text = assemble(p, path); for (const s of incs) if (s.exists && secParents(p, s.path).length <= 1) delete p.working[s.path];
        p.working[path].text = text; persist(p, true); go("file", { file: path }, true); toast("Sections combined. Save a version to keep the change.");
      }),
      actions: [{ label: "Close" }] });
  }
  if (!ranks.length) return modal({ title: "Split into sections", body: `<p>There are no headings in ${esc(path)} to split at${fmt === "tex" ? " (\\chapter, \\section or \\subsection)" : " (lines starting with #)"}.</p><p class="muted">Start a section instead: each section you add becomes its own file, and ${esc(path)} keeps them in order.</p>`,
    actions: [{ label: "Cancel" }, { label: "Add a section", primary: true, onClick: () => { setTimeout(() => addSectionFlow(p, path)); return true; } }] });
  return splitFlow(p, path);
}
function splitFlow(p, path) {
  const fmt = secFmt(path), hs = secHeadings(p.working[path].text, fmt), ranks = [...new Set(hs.map(h => h.rank))].sort((a, b) => a - b);
  let rank = ranks.find(r => hs.filter(h => h.rank <= r).length >= 2) ?? ranks[0];
  let folder = dirOf(path) ? stemOf(path) : (p.working["sections"] ? stemOf(path) : stemOf(path) === "main" ? "sections" : stemOf(path));
  modal({
    title: "Split into sections",
    body: `<p class="muted" style="margin-top:0">Each section becomes its own file you can open, write, review and share on its own. ${esc(path)} keeps them in order${fmt === "tex" ? " with <span class='mono'>\\input</span>, so it still compiles as before" : ""}.</p>
      <div class="rf-grid"><label for="sp-rank">Split at<select class="form" id="sp-rank">${ranks.map(r => `<option value="${r}" ${r === rank ? "selected" : ""}>${rankName(fmt, r)} (${hs.filter(h => h.rank <= r).length} sections)</option>`).join("")}</select></label>
      <label for="sp-dir">Folder for the sections<input type="text" id="sp-dir" value="${esc(folder)}" style="font-family:var(--mono)"></label></div>
      <span class="side-h">Files to create</span><div class="Box sec-plan" id="sp-plan"></div>`,
    onOpen: ov => {
      const show = () => { rank = +$("#sp-rank", ov).value; folder = $("#sp-dir", ov).value.trim(); const plan = planSplit(p, path, rank, folder);
        $("#sp-plan", ov).innerHTML = (plan.head.length ? `<div class="Box-row muted" style="font-size:12px">${fileIcon(path)} <span class="mono">${esc(path)}</span> keeps ${fmt === "tex" ? "the preamble and title" : "the text before the first heading"} and lists the sections</div>` : "")
          + plan.chunks.map((c, i) => `<div class="Box-row"><span class="sec-n">${i + 1}</span><div class="grow" style="min-width:0"><strong>${esc(c.title)}</strong><div class="muted mono sec-path">${esc(c.path)}</div></div><span class="muted" style="font-size:12px">${wordCount(c.text).toLocaleString()} words</span></div>`).join(""); };
      ov.addEventListener("input", show); ov.addEventListener("change", show); show();
    },
    actions: [{ label: "Cancel" }, { label: "Split into sections", primary: true, onClick: ov => {
      const plan = planSplit(p, path, +$("#sp-rank", ov).value, $("#sp-dir", ov).value.trim());
      applySplit(p, path, plan); S.secOpen = true; persist(p, true); go("file", { file: path }, true);
      toast(`Split into ${plan.chunks.length} sections. Save a version to keep the change.`); return true;
    } }]
  });
}
function addSectionFlow(p, path) {
  const fmt = secFmt(path), incs = secIncludes(p, path).filter(s => s.exists);
  const sib = incs[0] ? secHeadings(p.working[incs[0].path].text, fmt)[0] : null;
  const rank = sib ? sib.rank : fmt === "tex" ? (/\\chapter\b/.test(p.working[path].text) || /documentclass(\[[^\]]*\])?\{(book|report)/.test(p.working[path].text) ? 1 : 2) : 2;
  const dir = incs[0] ? dirOf(incs[0].path) : normPath(dirOf(path) + (dirOf(path) ? stemOf(path) : stemOf(path) === "main" ? "sections" : stemOf(path))) + "/";
  modal({
    title: "Add a section",
    body: `<label for="as-title">Section title<input type="text" id="as-title" placeholder="e.g. Background"></label>
      <label for="as-pos">Position<select class="form" id="as-pos">${incs.map((s, i) => `<option value="${i}">Before ${esc(secTitle(p, s.path))}</option>`).join("")}<option value="end" selected>At the end</option></select></label>
      <p class="muted" style="font-size:12px">Creates <span class="mono" id="as-path">${esc(dir)}…</span></p>`,
    onOpen: ov => { const i = $("#as-title", ov); i.oninput = () => $("#as-path", ov).textContent = dir + (slug(i.value) || "…") + (fmt === "tex" ? ".tex" : "." + extOf(path)); i.onkeydown = e => { if (e.key === "Enter") $(".mactions .btn-primary", ov).click(); }; },
    actions: [{ label: "Cancel" }, { label: "Add section", primary: true, onClick: ov => {
      const title = $("#as-title", ov).value.trim(); if (!title) return false;
      const file = freePath(p, dir + (slug(title) || "section") + (fmt === "tex" ? ".tex" : "." + extOf(path)), new Set());
      const heading = fmt === "tex" ? `\\${Object.keys(TEX_RANK).find(k => TEX_RANK[k] === rank)}{${title}}` : `${"#".repeat(rank)} ${title}`;
      p.working[file] = { text: heading + "\n\n", orig: null };
      const pos = $("#as-pos", ov).value, lines = p.working[path].text.split("\n");
      const at = pos === "end" ? secInsertAt(p, path) : secIncludes(p, path).filter(s => s.exists)[+pos].line;
      const add = [incLine(path, file, fmt)]; if (!incs.length && at > 0 && lines[at - 1].trim()) add.unshift(""); if (!incs.length && lines[at] && lines[at].trim()) add.push("");
      lines.splice(at, 0, ...add); p.working[path].text = lines.join("\n"); persist(p, true);
      S.secOpen = true; go("file", { file, fileMode: "write" }); toast(`Added “${title}”. It's listed in ${path}.`); return true;
    } }]
  });
}
