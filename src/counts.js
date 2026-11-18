
/* ============ Word and character counts, limits ============
   Counts the text a reader sees: LaTeX commands, Markdown symbols, comments and front matter are left out,
   citations are counted as they'll print, and each part (headings, abstract, footnotes, quotations, citations,
   reference list) can be counted or not. Limits (minimum, maximum, or both; words or characters) can be set on any
   document or section; they show in the editor, the sections panel, the file list, the save dialog and the Format checklist. */
const WPM_READ = 238, WPM_SPEAK = 130, WORDS_PER_PAGE = 250;
const COUNT_PARTS = [["body", "Body text"], ["headings", "Title and headings"], ["abstract", "Abstract"], ["quotes", "Block quotations"], ["lists", "Lists"], ["footnotes", "Footnotes"], ["citations", "In-text citations"], ["references", "Reference list"]];
const DEFAULT_INCLUDE = { body: true, headings: true, abstract: true, quotes: true, lists: true, footnotes: true, citations: true, references: false };
const UNITS = { words: "words", chars: "characters", charsNoSpaces: "characters without spaces" };
const LIMIT_PRESETS = [
  { id: "custom", label: "Custom limit" },
  { id: "commonapp", label: "Common App personal essay", unit: "words", min: 250, max: 650, note: "250 to 650 words for the 2026–27 application." },
  { id: "apa-abstract", label: "APA abstract", unit: "words", max: 250, part: "abstract", note: "APA abstracts are usually 250 words or fewer; check your instructor's or journal's limit." },
  { id: "x", label: "X post", unit: "chars", max: 280, note: "280 characters on a free account (25,000 with Premium). X counts every link as 23 characters and most emoji as 2, so the true count can differ." },
  { id: "bluesky", label: "Bluesky post", unit: "chars", max: 300, note: "300 characters as you see them; links count at full length." },
  { id: "threads", label: "Threads post", unit: "chars", max: 500 },
  { id: "linkedin", label: "LinkedIn post", unit: "chars", max: 3000 }
];

/* ---------- counting ---------- */
const graphemeSeg = typeof Intl !== "undefined" && Intl.Segmenter ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;
const graphemes = s => graphemeSeg ? [...graphemeSeg.segment(s)].length : Array.from(s).length;
const CJK = /[぀-ヿ㐀-䶿一-鿿가-힯豈-﫿]/g;
function countWords(s) { const cjk = (s.match(CJK) || []).length; return s.replace(CJK, " ").split(/\s+/).filter(t => /[\p{L}\p{N}]/u.test(t)).length + cjk; }
function textStats(paras) {
  const list = (Array.isArray(paras) ? paras : [paras]).map(x => x.replace(/[ \t]+/g, " ").trim()).filter(Boolean), all = list.join(" ");
  return { words: countWords(all), chars: graphemes(list.join(" ")), charsNoSpaces: graphemes(all.replace(/\s+/g, "")), sentences: (all.match(/[^.!?…]+(?:[.!?…]+["”’)\]]*|$)/g) || []).filter(x => /[\p{L}\p{N}]/u.test(x)).length, paragraphs: list.length };
}
const plainInline = s => s.replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/(^|\W)[*_]([^*_]+)[*_](?=\W|$)/g, "$1$2").replace(/`([^`]+)`/g, "$1").replace(/<[^>]+>/g, "");
/* Split a file into countable parts: { body: [paras], headings: [...], ... } */
function countParts(p, path) {
  const ext = extOf(path), f = p.working[path]; if (!f || kindOf(path) === "sheet") return null;
  let doc;
  if (ext === "tex") doc = texBlocks(secFmt(path) ? assemble(p, path) : f.text);
  else if (ext === "md" || ext === "markdown") doc = mdBlocks(secFmt(path) ? assemble(p, path) : f.text);
  else if (ext === "docx" || ext === "txt") doc = { meta: {}, blocks: f.text.split(/\n/).filter(l => l.trim()).map(t => ({ t: "p", text: mdInlineCites(t) })) };
  else doc = { meta: {}, blocks: f.text.split(/\n\s*\n/).filter(l => l.trim()).map(t => ({ t: "p", text: t })) };
  const parts = Object.fromEntries(COUNT_PARTS.map(([k]) => [k, []]));
  const style = S.refStyle || "apa", ce = citeEngine(p, { citations: { mode: "author-date", style: style === "bluebook" ? "chicago" : style } });
  const take = (text, part) => {
    const cites = [], feet = [];
    const main = text.replace(/\u0001C(.*?)\u0002/g, (m, j) => { try { cites.push(ce.inText(JSON.parse(j))); } catch (e) { /* ignore */ } return " "; }).replace(/\u0001F(.*?)\u0002/g, (m, t) => { feet.push(t); return " "; });
    parts[part].push(plainInline(main)); for (const c of cites) parts.citations.push(plainInline(c)); for (const t of feet) parts.footnotes.push(plainInline(t.replace(/\u0001C(.*?)\u0002/g, (m, j) => { try { return ce.inText(JSON.parse(j)); } catch (e) { return ""; } })));
  };
  if (doc.meta.title) take(doc.meta.title, "headings");
  for (const b of doc.blocks) take(b.text || "", { h: "headings", abstract: "abstract", quote: "quotes", li: "lists" }[b.t] || "body");
  for (const k of ce.used) { const r = ce.lib.get(k); if (r) parts.references.push(plainInline(formatRef(r, style))); }
  return parts;
}
function countRules(p, path) { return { ...DEFAULT_INCLUDE, ...((p.countRules || {})[path] || {}) }; }
function analyze(p, path) {
  const parts = countParts(p, path); if (!parts) return null;
  const inc = countRules(p, path), per = Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, textStats(v)]));
  const counted = textStats(COUNT_PARTS.filter(([k]) => inc[k]).flatMap(([k]) => parts[k]));
  return { parts: per, counted, include: inc, readMin: Math.max(1, Math.round(counted.words / WPM_READ)), speakMin: Math.max(1, Math.round(counted.words / WPM_SPEAK)), pages: Math.round(counted.words / WORDS_PER_PAGE * 10) / 10 };
}
function selectionStats(path, text) {
  if (!text.trim()) return null;
  const ext = extOf(path), t = ext === "tex" ? texInline(text.replace(/\\(?:section|subsection|chapter)\*?\{([^}]*)\}/g, "$1")).replace(/\u0001[CF].*?\u0002/g, " ") : plainInline(text.replace(/^#+\s*/gm, "").replace(/<!--.*?-->/g, ""));
  return textStats(t.split(/\n/));
}

/* ---------- limits ---------- */
const limitsOf = (p, path) => ((p.limits || {})[path] || []);
function checkLimit(p, path, L, a = analyze(p, path)) {
  if (!a) return null;
  const value = (L.part === "abstract" ? a.parts.abstract : a.counted)[L.unit] || 0;
  const state = L.max && value > L.max ? "over" : L.min && value < L.min ? "under" : L.max && value >= L.max * 0.9 ? "near" : "ok";
  return { value, state, pct: L.max ? Math.min(100, Math.round(value / L.max * 100)) : L.min ? Math.min(100, Math.round(value / L.min * 100)) : 0 };
}
const unitShort = u => u === "words" ? "words" : "characters";
function limitText(L) { const u = unitShort(L.unit); return L.min && L.max ? `${L.min.toLocaleString()}–${L.max.toLocaleString()} ${u}` : L.max ? `at most ${L.max.toLocaleString()} ${u}` : `at least ${(L.min || 0).toLocaleString()} ${u}`; }
function limitStatusText(L, r) {
  const u = unitShort(L.unit);
  if (r.state === "over") return `${(r.value - L.max).toLocaleString()} ${u} over`;
  if (r.state === "under") return `${(L.min - r.value).toLocaleString()} ${u} to go`;
  if (L.max) return `${(L.max - r.value).toLocaleString()} left`;
  return "Met";
}
/* Problems across the project (or just the given paths) */
function limitProblems(p, paths = Object.keys(p.limits || {})) {
  const out = [];
  for (const path of paths) { if (!p.working[path]) continue; const a = analyze(p, path); for (const L of limitsOf(p, path)) { const r = checkLimit(p, path, L, a); if (r && (r.state === "over" || r.state === "under")) out.push({ path, L, r }); } }
  return out;
}
function limitLabel(p, path) {
  const ls = limitsOf(p, path); if (!ls.length || !p.working[path]) return "";
  const a = analyze(p, path), rs = ls.map(L => checkLimit(p, path, L, a));
  if (rs.some(r => r.state === "over")) return `<span class="label label-danger" title="Over its limit">Over limit</span> `;
  if (rs.some(r => r.state === "under")) return `<span class="label label-attention" title="Under its minimum">Under minimum</span> `;
  return "";
}
function limitMeter(L, r, compact) {
  return `<span class="lim lim-${r.state}" title="${esc((L.label ? L.label + ": " : "") + limitText(L))}"><span class="lim-bar"><span style="width:${r.pct}%"></span></span>${compact ? `${r.value.toLocaleString()}${L.max ? " / " + L.max.toLocaleString() : ""}` : `<strong>${r.value.toLocaleString()}</strong>${L.max ? " / " + L.max.toLocaleString() : " / " + L.min.toLocaleString() + "+"} ${unitShort(L.unit)} · ${limitStatusText(L, r)}`}</span>`;
}
function sectionCountHtml(p, path) {
  const a = analyze(p, path); if (!a) return "";
  const L = limitsOf(p, path)[0];
  return L ? limitMeter(L, checkLimit(p, path, L, a), true) : `<span class="muted" style="font-size:12px;white-space:nowrap">${a.counted.words.toLocaleString()} words</span>`;
}

/* ---------- live counter under the editor ---------- */
function mountCountBar(p, path, el) {
  if (!p.working[path] || kindOf(path) === "sheet") return;
  const box = [...el.querySelectorAll(":scope > .Box")].pop(); if (!box) return;
  const bar = document.createElement("div"); bar.className = "cnt-bar"; bar.id = "cnt-bar"; box.after(bar);
  const ta = $("#ed"); let selTxt = "";
  const draw = () => {
    const a = analyze(p, path); if (!a) { bar.remove(); return; }
    const c = a.counted, sel = selTxt ? selectionStats(path, selTxt) : null, parents = secParents(p, path);
    const lims = limitsOf(p, path).map(L => limitMeter(L, checkLimit(p, path, L, a)));
    const parentLims = parents.flatMap(m => limitsOf(p, m).map(L => `<span class="muted">${esc(m)}:</span> ${limitMeter(L, checkLimit(p, m, L), true)}`));
    bar.innerHTML = `<span class="cnt-main"><strong>${c.words.toLocaleString()}</strong> words · ${c.chars.toLocaleString()} characters · ${a.readMin} min read${secFmt(path) && secIncludes(p, path).length ? ` <span class="muted">(whole document)</span>` : ""}</span>
      ${sel ? `<span class="cnt-sel">Selected: <strong>${sel.words.toLocaleString()}</strong> words · ${sel.chars.toLocaleString()} characters</span>` : ""}
      ${lims.join("")}${parentLims.join("")}<span class="grow"></span>
      <button class="btn btn-sm" id="cnt-open">${ic("pilcrow")} ${limitsOf(p, path).length ? "Counts & limits" : "Set a limit"}</button>`;
    $("#cnt-open", bar).onclick = () => countsFlow(p, path, draw);
  };
  draw();
  if (ta) {
    let t; ta.addEventListener("input", () => { clearTimeout(t); t = setTimeout(draw, 250); });
    const sel = () => { const s = ta.value.slice(ta.selectionStart, ta.selectionEnd); if (s !== selTxt) { selTxt = s; draw(); } };
    ["select", "keyup", "mouseup"].forEach(ev => ta.addEventListener(ev, sel));
  }
}

/* ---------- counts & limits dialog ---------- */
function countsFlow(p, path, after) {
  p.countRules = p.countRules || {}; p.limits = p.limits || {};
  const fmtN = n => n.toLocaleString(), incs = secFmt(path) ? secIncludes(p, path).filter(s => s.exists) : [];
  modal({
    title: `Counts · ${path.split("/").pop()}`,
    body: `<div class="cnt-grid" id="cd-grid"></div>
      <h4 class="se-h">What counts</h4><p class="muted" style="font-size:12px;margin-top:0">Choose what goes into the count, for example leave out the reference list or footnotes if your limit says so. Limits on this ${incs.length ? "document" : "file"} use these choices.</p>
      <table class="cnt-table"><thead><tr><th>Part</th><th>Words</th><th>Characters</th><th>Count it</th></tr></thead><tbody id="cd-parts"></tbody></table>
      ${incs.length ? `<h4 class="se-h">Sections</h4><table class="cnt-table"><thead><tr><th>Section</th><th>Words</th><th>Limit</th></tr></thead><tbody>${incs.map(s => `<tr><td><button class="link" data-cd-open="${esc(s.path)}">${esc(secTitle(p, s.path))}</button></td><td>${fmtN(analyze(p, s.path).counted.words)}</td><td>${limitsOf(p, s.path).map(L => limitMeter(L, checkLimit(p, s.path, L), true)).join(" ") || `<button class="link" data-cd-sec="${esc(s.path)}">Set a limit</button>`}</td></tr>`).join("")}</tbody></table>` : ""}
      <h4 class="se-h">Limits</h4><div id="cd-limits"></div>
      <div class="Box cd-add"><div class="Box-header"><strong>Add a limit</strong></div><div class="Box-body">
        <div class="se-grid"><label for="cd-preset">Start from<select class="form" id="cd-preset">${LIMIT_PRESETS.map(x => `<option value="${x.id}">${esc(x.label)}${x.max || x.min ? ` (${limitText(x)})` : ""}</option>`).join("")}</select></label>
          <label for="cd-label">Name <span class="muted" style="font-weight:400">(optional)</span><input type="text" id="cd-label" placeholder="e.g. Assignment limit"></label></div>
        <div class="se-grid"><label for="cd-min">At least<input type="number" id="cd-min" min="0" placeholder="No minimum"></label><label for="cd-max">At most<input type="number" id="cd-max" min="0" placeholder="No maximum"></label>
          <label for="cd-unit">Count<select class="form" id="cd-unit">${Object.entries(UNITS).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></label>
          <label for="cd-part">Of<select class="form" id="cd-part"><option value="counted">the counted text</option><option value="abstract">the abstract only</option></select></label></div>
        <p class="muted" id="cd-note" style="font-size:12px;margin:0 0 8px"></p>
        <button class="btn btn-sm btn-primary" id="cd-add">${ic("plus")} Add limit</button> <span class="muted" id="cd-msg" style="font-size:12px"></span></div></div>`,
    onOpen: ov => {
      const draw = () => {
        const a = analyze(p, path), c = a.counted;
        $("#cd-grid", ov).innerHTML = [["Words", fmtN(c.words)], ["Characters", fmtN(c.chars)], ["Without spaces", fmtN(c.charsNoSpaces)], ["Sentences", fmtN(c.sentences)], ["Paragraphs", fmtN(c.paragraphs)], ["Reading time", `${a.readMin} min`], ["Speaking time", `${a.speakMin} min`], ["Pages", `≈ ${a.pages} <span class="muted" style="font-size:11px">double-spaced</span>`]].map(([k, v]) => `<div class="cnt-stat"><div class="muted">${k}</div><div class="cnt-num">${v}</div></div>`).join("");
        $("#cd-parts", ov).innerHTML = COUNT_PARTS.map(([k, l]) => { const s = a.parts[k]; return `<tr class="${s.words ? "" : "muted"}"><td>${l}</td><td>${fmtN(s.words)}</td><td>${fmtN(s.chars)}</td><td><input type="checkbox" data-inc="${k}" ${a.include[k] ? "checked" : ""} aria-label="Count ${esc(l)}"></td></tr>`; }).join("") + `<tr class="cnt-total"><td>Counted</td><td>${fmtN(c.words)}</td><td>${fmtN(c.chars)}</td><td></td></tr>`;
        $("#cd-parts", ov).querySelectorAll("[data-inc]").forEach(x => x.onchange = () => { p.countRules[path] = { ...countRules(p, path), [x.dataset.inc]: x.checked }; persist(p, true); draw(); if (after) after(); });
        const ls = limitsOf(p, path);
        $("#cd-limits", ov).innerHTML = ls.length ? `<div class="Box">${ls.map((L, i) => { const r = checkLimit(p, path, L, a); return `<div class="Box-row"><div class="grow"><strong>${esc(L.label || "Limit")}</strong> <span class="muted" style="font-size:12px">${limitText(L)}${L.part === "abstract" ? " · abstract only" : ""}</span><div style="margin-top:4px">${limitMeter(L, r)}</div></div><button class="btn btn-sm btn-danger" data-cd-rm="${i}" aria-label="Remove limit">${ic("trash")}</button></div>`; }).join("")}</div>` : `<p class="muted" style="margin-top:0">No limits on this file yet.</p>`;
        $("#cd-limits", ov).querySelectorAll("[data-cd-rm]").forEach(b => b.onclick = () => { p.limits[path] = ls.filter((_, j) => j !== +b.dataset.cdRm); if (!p.limits[path].length) delete p.limits[path]; persist(p, true); draw(); if (after) after(); });
      };
      $("#cd-preset", ov).onchange = e => { const x = LIMIT_PRESETS.find(y => y.id === e.target.value); $("#cd-label", ov).value = x.id === "custom" ? "" : x.label; $("#cd-min", ov).value = x.min || ""; $("#cd-max", ov).value = x.max || ""; if (x.unit) $("#cd-unit", ov).value = x.unit; $("#cd-part", ov).value = x.part || "counted"; $("#cd-note", ov).textContent = x.note || ""; };
      $("#cd-add", ov).onclick = () => {
        const min = parseInt($("#cd-min", ov).value, 10) || 0, max = parseInt($("#cd-max", ov).value, 10) || 0, msg = $("#cd-msg", ov);
        if (!min && !max) { msg.textContent = "Enter a minimum, a maximum, or both."; return; }
        if (min && max && min > max) { msg.textContent = "The minimum is larger than the maximum."; return; }
        p.limits[path] = [...limitsOf(p, path), { id: uid(), label: $("#cd-label", ov).value.trim(), unit: $("#cd-unit", ov).value, min: min || null, max: max || null, part: $("#cd-part", ov).value }];
        persist(p, true); msg.textContent = ""; $("#cd-min", ov).value = $("#cd-max", ov).value = $("#cd-label", ov).value = ""; $("#cd-preset", ov).value = "custom"; $("#cd-note", ov).textContent = ""; $("#cd-part", ov).value = "counted"; $("#cd-unit", ov).value = "words"; draw(); if (after) after(); toast("Limit added.");
      };
      ov.querySelectorAll("[data-cd-open]").forEach(b => b.onclick = () => { ov.querySelector("[data-x]").click(); go("file", { file: b.dataset.cdOpen }); });
      ov.querySelectorAll("[data-cd-sec]").forEach(b => b.onclick = () => { ov.querySelector("[data-x]").click(); go("file", { file: b.dataset.cdSec }); setTimeout(() => countsFlow(p, b.dataset.cdSec), 50); });
      draw();
    },
    actions: [{ label: "Done", primary: true }]
  });
}
