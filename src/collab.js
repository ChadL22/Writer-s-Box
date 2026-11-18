
/* ============ Collaboration views: home, profile, reviews, notes, insights, settings ============ */
const avatarImg = (url, login, size = 20) => url ? `<img class="av" src="${esc(url)}" alt="" width="${size}" height="${size}" style="width:${size}px;height:${size}px">` : `<span class="avatar" style="width:${size}px;height:${size}px">${esc((login || "Y")[0].toUpperCase())}</span>`;
const whoOf = v => v.login ? `<strong>${esc(v.login)}</strong>` : `<strong>${esc(v.author || ME)}</strong>`;
const ghImgOk = () => !inClaudeViewer();
function loadingInto(el, text = "Loading from GitHub…") { el.innerHTML = `<div class="Box blankslate"><span class="spinner" aria-hidden="true"></span><p class="muted">${esc(text)}</p></div>`; }
function errorInto(el, err, retry) { el.innerHTML = `<div class="flash">${ic("alert")}<span>${esc(err.message || String(err))}</span><span class="grow"></span>${retry ? `<button class="btn btn-sm" data-retry>Try again</button>` : ""}</div>`; if (retry) $("[data-retry]", el).onclick = retry; }
function needsGitHub(el, p, what) {
  const signedIn = ghSignedIn();
  el.innerHTML = `<div class="Box blankslate">${ic(what === "reviews" ? "merge" : "pencil")}
    <h3>${what === "reviews" ? "Reviews live on GitHub" : "Notes & to-dos live on GitHub"}</h3>
    <p class="muted" style="max-width:520px">${what === "reviews" ? "Publish this project to GitHub to ask someone to review a draft, discuss changes paragraph by paragraph, and merge it into main once it's approved." : "Publish this project to GitHub to track revisions, citations to check and reviewer feedback as notes you can label, discuss and close."}</p>
    <div class="row">${signedIn ? `<button class="btn btn-primary" data-pub>${ic("import")} Publish to GitHub</button>` : `<button class="btn btn-primary" data-signin>Sign in with GitHub</button>`}</div></div>`;
  const pub = $("[data-pub]", el); if (pub) pub.onclick = () => publishFlow(p);
  const si = $("[data-signin]", el); if (si) si.onclick = signInFlow;
}

/* ---------- Sign in ---------- */
function signInFlow() {
  const blocked = inClaudeViewer();
  modal({
    title: "Sign in with GitHub",
    body: blocked ? `<div class="flash">${ic("alert")}<span>GitHub can't be reached from inside Claude's preview. Open your hosted Writer's Box site (your GitHub Pages address) and sign in there.</span></div>` :
      `<p>Writer's Box keeps your projects in your own GitHub repositories. Sign in with a personal access token: it stays in this browser only and is sent only to GitHub.</p>
      <div class="Box"><div class="Box-row" style="display:block"><strong>Quickest:</strong> <a href="https://github.com/settings/tokens/new?scopes=repo&description=Writer%27s%20Box" target="_blank" rel="noopener">create a classic token with the “repo” scope</a>, set an expiration, generate it and paste it below.</div>
      <div class="Box-row" style="display:block"><strong>Tighter:</strong> a <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">fine-grained token</a> for “All repositories” with read and write access to Administration, Contents, Issues and Pull requests.</div></div>
      <label for="tok">Personal access token<input type="text" id="tok" autocomplete="off" spellcheck="false" placeholder="ghp_… or github_pat_…" style="font-family:var(--mono)"></label>
      <p class="muted" style="font-size:12px">Anyone with this token can act on your repositories, so don't share it. Sign out to remove it from this browser; revoke it on GitHub any time.</p>
      <p class="muted" id="tok-msg"></p>`,
    actions: blocked ? [{ label: "Close" }] : [{ label: "Cancel" }, { label: "Sign in", primary: true, onClick: async ov => {
      const t = $("#tok", ov).value.trim(), msg = $("#tok-msg", ov);
      if (!t) { msg.textContent = "Paste a token first."; return false; }
      msg.textContent = "Checking with GitHub…";
      try { const u = await ghSignIn(t); toast(`Signed in as ${u.login}.`); render(); return true; }
      catch (e) { msg.textContent = e.message; return false; }
    } }]
  });
}

/* ---------- Home dashboard ---------- */
function viewHome(p, el) {
  const projects = [...S.projects].sort((a, b) => lastActivity(b) - lastActivity(a));
  const feed = [];
  for (const pr of S.projects) for (const [id, v] of Object.entries(pr.versions)) feed.push({ pr, id, v });
  feed.sort((a, b) => b.v.time - a.v.time);
  el.innerHTML = `<div class="home">
    <aside class="home-side">
      <div class="row" style="justify-content:space-between;margin-bottom:8px"><strong>Projects</strong><button class="btn btn-sm btn-primary" id="hm-new">${ic("book")} New</button></div>
      <input type="text" id="hm-filter" placeholder="Find a project…" aria-label="Find a project">
      <ul class="proj-list" id="hm-list">${projects.map(x => `<li><button class="link" data-open="${x.id}">${avatarImg(x.remote && x.remote.ownerAvatar && ghImgOk() ? x.remote.ownerAvatar : null, x.remote ? x.remote.owner : "local", 16)}<span>${esc(x.remote ? x.remote.owner + " / " + x.remote.repo : "local / " + x.name)}</span></button>${x.remote ? `<span class="label">${x.remote.private ? "Private" : "Public"}</span>` : `<span class="label">Local</span>`}</li>`).join("")}</ul>
      <button class="btn btn-sm" id="hm-clone" style="margin-top:12px;width:100%;justify-content:center">${ic("import")} Open a project from GitHub</button>
    </aside>
    <section class="home-main">
      <h2 class="home-h">${ghSignedIn() ? `Welcome back, ${esc(GH.user.name || GH.user.login)}` : "Your writing"}</h2>
      <div id="hm-reviews"></div>
      <h3 class="sec-h">Recent activity</h3>
      <div class="Box">${feed.slice(0, 14).map(({ pr, id, v }) => `<div class="Box-row feed-row">${ic("commit")}<div class="grow" style="min-width:0">
          <div>${whoOf(v)} saved <button class="link" data-goto="${pr.id}:${id}" style="font-weight:600">${esc(v.message)}</button></div>
          <div class="muted" style="font-size:12px">${esc(pr.remote ? pr.remote.owner + "/" + pr.remote.repo : pr.name)} · <span class="branch-name">${esc(v.draft)}</span> · <span title="${fullDate(v.time)}">${ago(v.time)}</span></div></div></div>`).join("") || `<div class="Box-body muted">No versions yet. Create a project and save your first version.</div>`}</div>
    </section>
    <aside class="home-right">${ghSignedIn() ? `<div class="Box"><div class="Box-body" style="display:flex;gap:12px;align-items:center">${avatarImg(ghImgOk() ? GH.user.avatar_url : null, GH.user.login, 48)}<div><strong>${esc(GH.user.name || GH.user.login)}</strong><div class="muted">${esc(GH.user.login)}</div><button class="link" id="hm-profile">View profile</button></div></div></div>`
      : `<div class="Box"><div class="Box-body"><h3 style="margin:0 0 8px;font-size:16px">Work with others</h3><p class="muted" style="margin:0 0 12px">Sign in with GitHub to keep projects online, ask for reviews, track notes and share with collaborators.</p><button class="btn btn-primary" id="hm-signin">Sign in with GitHub</button></div></div>`}
      <div class="Box" style="margin-top:16px"><div class="Box-header"><strong>Your writing, this year</strong></div><div class="Box-body" style="overflow-x:auto">${heatmapSvg(versionsByDay(S.projects), true)}</div></div>
    </aside></div>`;
  $("#hm-new").onclick = createProjectFlow;
  $("#hm-clone").onclick = cloneFlow;
  $("#hm-filter").oninput = e => { const q = e.target.value.toLowerCase(); el.querySelectorAll("#hm-list li").forEach(li => li.hidden = !li.textContent.toLowerCase().includes(q)); };
  el.querySelectorAll("[data-open]").forEach(b => b.onclick = () => { S.pid = b.dataset.open; resetSel(); go("files"); });
  el.querySelectorAll("[data-goto]").forEach(b => b.onclick = () => { const [pid, vid] = b.dataset.goto.split(":"); S.pid = pid; resetSel(); go("version", { vid }); });
  const pf = $("#hm-profile"); if (pf) pf.onclick = () => go("profile");
  const si = $("#hm-signin"); if (si) si.onclick = signInFlow;
  const box = $("#hm-reviews");
  const remotes = S.projects.filter(isRemote);
  if (ghSignedIn() && remotes.length) {
    box.innerHTML = `<h3 class="sec-h">Open reviews & notes</h3><div class="Box"><div class="Box-body muted">Loading…</div></div>`;
    Promise.all(remotes.map(async x => ({ x, prs: await listPulls(x).catch(() => []), notes: await listNotes(x).catch(() => []) }))).then(rows => {
      const items = rows.flatMap(({ x, prs, notes }) => [...prs.map(r => ({ x, r, kind: "review" })), ...notes.map(r => ({ x, r, kind: "note" }))]).sort((a, b) => Date.parse(b.r.updated_at) - Date.parse(a.r.updated_at));
      box.innerHTML = `<h3 class="sec-h">Open reviews & notes</h3><div class="Box">${items.slice(0, 8).map(({ x, r, kind }) => `<div class="Box-row">${ic(kind === "review" ? "merge" : "pencil", "open-ic")}<div class="grow" style="min-width:0"><button class="link" data-item="${x.id}:${kind}:${r.number}" style="font-weight:600;color:var(--fg)">${esc(r.title)}</button><div class="muted" style="font-size:12px">${esc(x.remote.owner + "/" + x.remote.repo)} #${r.number} · ${kind === "review" ? "review" : "note"} · updated ${ago(Date.parse(r.updated_at))}</div></div></div>`).join("") || `<div class="Box-body muted">Nothing open. Request a review from a draft, or add a note to a project.</div>`}</div>`;
      box.querySelectorAll("[data-item]").forEach(b => b.onclick = () => { const [pid, kind, n] = b.dataset.item.split(":"); S.pid = pid; resetSel(); go(kind === "review" ? "review" : "note", { num: +n }); });
    });
  }
}
const lastActivity = p => Math.max(p.created || 0, ...Object.values(p.versions).map(v => v.time));
function versionsByDay(projects) { const m = {}; for (const p of projects) for (const v of Object.values(p.versions)) { const d = new Date(v.time); const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; m[k] = (m[k] || 0) + 1; } return m; }
function heatmapSvg(byDay, compact) {
  const cell = compact ? 9 : 11, gap = compact ? 2 : 3, weeks = compact ? 26 : 53;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const start = new Date(today); start.setDate(start.getDate() - (weeks - 1) * 7 - today.getDay());
  const vals = Object.values(byDay), max = Math.max(1, ...vals);
  const lvl = n => n === 0 ? 0 : n >= max * 0.75 ? 4 : n >= max * 0.5 ? 3 : n >= max * 0.25 ? 2 : 1;
  const L = 28, T = 16, W = L + weeks * (cell + gap), H = T + 7 * (cell + gap) + 18;
  const months = []; let rects = "", total = 0;
  for (let w = 0; w < weeks; w++) for (let d = 0; d < 7; d++) {
    const day = new Date(start); day.setDate(start.getDate() + w * 7 + d); if (day > today) continue;
    const k = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`, n = byDay[k] || 0; total += n;
    if (day.getDate() <= 7 && d === 0) months.push([w, day.toLocaleDateString([], { month: "short" })]);
    rects += `<rect x="${L + w * (cell + gap)}" y="${T + d * (cell + gap)}" width="${cell}" height="${cell}" rx="2" class="hm hm${lvl(n)}"><title>${n ? n + " version" + (n > 1 ? "s" : "") : "No versions"} on ${day.toLocaleDateString([], { dateStyle: "medium" })}</title></rect>`;
  }
  const legend = [0, 1, 2, 3, 4].map((l, i) => `<rect x="${W - 5 * (cell + gap) - 30 + i * (cell + gap)}" y="${H - cell - 2}" width="${cell}" height="${cell}" rx="2" class="hm hm${l}"/>`).join("");
  return `<svg class="heatmap" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${total} versions saved in the last ${weeks} weeks">
    ${months.map(([w, m]) => `<text x="${L + w * (cell + gap)}" y="10" class="hm-t">${m}</text>`).join("")}
    ${[[1, "Mon"], [3, "Wed"], [5, "Fri"]].map(([d, t]) => `<text x="0" y="${T + d * (cell + gap) + cell - 1}" class="hm-t">${t}</text>`).join("")}
    ${rects}<text x="0" y="${H - 3}" class="hm-t">${total} version${total === 1 ? "" : "s"} saved</text><text x="${W - 5 * (cell + gap) - 58}" y="${H - 3}" class="hm-t">Less</text>${legend}<text x="${W - 26}" y="${H - 3}" class="hm-t">More</text></svg>`;
}

/* ---------- Profile ---------- */
function viewProfile(p, el) {
  const u = GH.user;
  const local = S.projects;
  el.innerHTML = `<div class="profile">
    <aside>${avatarImg(u && ghImgOk() ? u.avatar_url : null, u ? u.login : "You", 260)}
      <h1 class="pf-name">${esc(u ? (u.name || u.login) : "You")}</h1><div class="pf-login">${esc(u ? u.login : "Writing on this device")}</div>
      ${u && u.bio ? `<p>${esc(u.bio)}</p>` : ""}
      ${u ? `<div class="muted" style="display:flex;flex-direction:column;gap:4px;font-size:14px">${u.company ? `<span>${esc(u.company)}</span>` : ""}${u.location ? `<span>${esc(u.location)}</span>` : ""}${u.blog ? `<a href="${esc(/^https?:/.test(u.blog) ? u.blog : "https://" + u.blog)}" target="_blank" rel="noopener">${esc(u.blog)}</a>` : ""}<a href="${esc(u.html_url)}" target="_blank" rel="noopener">View on GitHub</a></div>` : `<button class="btn btn-primary" id="pf-signin" style="margin-top:12px">Sign in with GitHub</button>`}
    </aside>
    <section>
      <h3 class="sec-h">Writing projects</h3>
      <div class="pins" id="pf-pins">${local.map(x => pinCard(x)).join("")}</div>
      <h3 class="sec-h" style="margin-top:24px">${Object.values(versionsByDay(local)).reduce((a, b) => a + b, 0)} versions in the last year</h3>
      <div class="Box"><div class="Box-body" style="overflow-x:auto">${heatmapSvg(versionsByDay(local), false)}</div></div>
      <div id="pf-remote"></div>
    </section></div>`;
  const si = $("#pf-signin"); if (si) si.onclick = signInFlow;
  el.querySelectorAll("[data-open]").forEach(b => b.onclick = () => { S.pid = b.dataset.open; resetSel(); go("files"); });
  if (ghSignedIn()) {
    const box = $("#pf-remote");
    ghCached("repos", () => gh("/user/repos?per_page=100&sort=updated")).then(repos => {
      const linked = new Set(S.projects.filter(isRemote).map(x => (x.remote.owner + "/" + x.remote.repo).toLowerCase()));
      const wb = repos.filter(r => (r.topics || []).includes("writers-box") && !linked.has(r.full_name.toLowerCase()));
      if (!wb.length) return;
      box.innerHTML = `<h3 class="sec-h" style="margin-top:24px">On GitHub, not opened here yet</h3><div class="pins">${wb.map(r => `<div class="Box pin"><div class="row">${ic("book")}<button class="link" data-clone="${esc(r.full_name)}" style="font-weight:600">${esc(r.name)}</button><span class="label">${r.private ? "Private" : "Public"}</span></div><p class="muted">${esc(r.description || "")}</p><div class="muted" style="font-size:12px">Updated ${ago(Date.parse(r.pushed_at || r.updated_at))}</div></div>`).join("")}</div>`;
      box.querySelectorAll("[data-clone]").forEach(b => b.onclick = () => { const [o, n] = b.dataset.clone.split("/"); doClone(o, n); });
    }).catch(() => {});
  }
}
function pinCard(x) {
  const words = Object.values(x.working).reduce((n, f) => n + wordCount(f.text), 0);
  const types = {}; for (const path of Object.keys(x.working)) types[typeLabel(path)] = (types[typeLabel(path)] || 0) + wordCount(x.working[path].text);
  const top = Object.entries(types).sort((a, b) => b[1] - a[1])[0];
  return `<div class="Box pin"><div class="row">${ic("book")}<button class="link" data-open="${x.id}" style="font-weight:600">${esc(x.remote ? x.remote.repo : x.name)}</button><span class="label">${x.remote ? (x.remote.private ? "Private" : "Public") : "Local"}</span></div>
    <p class="muted">${esc(x.description || "")}</p>
    <div class="row muted" style="font-size:12px">${top ? `<span><span class="sw" style="background:${TYPE_COLOR[top[0]] || "#9198a1"}"></span> ${top[0]}</span>` : ""}<span>${ic("pilcrow")} ${words.toLocaleString()} words</span><span>${ic("history")} ${Object.keys(x.versions).length}</span></div></div>`;
}

/* ---------- Clone / publish / sync flows ---------- */
function progressModal(title) {
  const layer = $("#layer"), ov = document.createElement("div"); ov.className = "overlay";
  ov.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="mhead"><h3>${esc(title)}</h3></div><div class="mbody"><div class="row"><span class="spinner" aria-hidden="true"></span><span id="pg-text">Starting…</span></div></div></div>`;
  layer.appendChild(ov);
  return { set: t => { const x = $("#pg-text", ov); if (x) x.textContent = t; }, close: () => ov.remove() };
}
async function cloneFlow() {
  if (!ghSignedIn()) return signInFlow();
  const pm = progressModal("Open a project from GitHub"); pm.set("Loading your repositories…");
  let repos; try { repos = await ghCached("repos", () => gh("/user/repos?per_page=100&sort=updated")); } catch (e) { pm.close(); return toast(e.message); }
  pm.close();
  const linked = new Set(S.projects.filter(isRemote).map(x => (x.remote.owner + "/" + x.remote.repo).toLowerCase()));
  repos = [...repos].sort((a, b) => ((b.topics || []).includes("writers-box") - (a.topics || []).includes("writers-box")) || Date.parse(b.pushed_at) - Date.parse(a.pushed_at));
  modal({
    title: "Open a project from GitHub",
    body: `<input type="text" id="cl-q" placeholder="Filter repositories…" aria-label="Filter repositories"><div class="Box" style="max-height:50vh;overflow:auto" id="cl-list">${repos.map(r => `<div class="Box-row" data-name="${esc(r.full_name.toLowerCase())}">${ic("book")}<div class="grow" style="min-width:0"><strong>${esc(r.full_name)}</strong> ${r.private ? `<span class="label">Private</span>` : ""} ${(r.topics || []).includes("writers-box") ? `<span class="label label-done">Writer's Box</span>` : ""}<div class="muted" style="font-size:12px">${esc(r.description || "")}</div></div>${linked.has(r.full_name.toLowerCase()) ? `<span class="muted" style="font-size:12px">Open already</span>` : `<button class="btn btn-sm" data-clone="${esc(r.full_name)}">Open</button>`}</div>`).join("")}</div>
      <p class="muted" style="font-size:12px">LaTeX, Markdown, text, Word and spreadsheet files are read; other files stay on GitHub untouched.</p>`,
    onOpen: ov => {
      $("#cl-q", ov).oninput = e => { const q = e.target.value.toLowerCase(); ov.querySelectorAll("[data-name]").forEach(r => r.hidden = !r.dataset.name.includes(q)); };
      ov.querySelectorAll("[data-clone]").forEach(b => b.onclick = () => { ov.remove(); const [o, n] = b.dataset.clone.split("/"); doClone(o, n); });
    },
    actions: [{ label: "Close" }]
  });
}
async function doClone(owner, repo) {
  const pm = progressModal(`Opening ${owner}/${repo}`);
  try { const p = await cloneRepo(owner, repo, pm.set); S.projects.push(p); S.pid = p.id; await persist(p, true); pm.close(); resetSel(); go("files"); toast(`Opened ${owner}/${repo}.`); }
  catch (e) { pm.close(); toast(e.message); }
}
async function syncFlow(p, quiet) {
  if (!ghSignedIn()) return quiet ? null : signInFlow();
  const btn = $("#r-sync"); if (btn) { btn.disabled = true; btn.innerHTML = `<span class="spinner sm"></span> Syncing`; }
  try { const r = await syncProject(p, () => {}); await persist(p, true); ghBust(`pr:${p.id}`); ghBust(`is:${p.id}`); render(); if (!quiet) toast(r.moved ? "Synced: new versions came in from GitHub." : "Up to date with GitHub."); }
  catch (e) { render(); toast(e.message); }
}
function publishFlow(p) {
  if (!ghSignedIn()) return signInFlow();
  modal({
    title: "Publish to GitHub",
    body: `<p>Writer's Box will create a repository in your GitHub account and copy every version, draft and milestone into it, so your full history comes along.</p>
      <label for="pb-name">Repository name<input type="text" id="pb-name" value="${esc(slug(p.name))}"></label>
      <label for="pb-desc">Description <span class="muted" style="font-weight:400">(optional)</span><input type="text" id="pb-desc" value="${esc(p.description || "")}"></label>
      <fieldset class="vis"><legend>Who can see it</legend>
        <label class="check"><input type="radio" name="vis" value="private" checked> <span><strong>Private</strong><br><span class="muted">Only you and collaborators you invite.</span></span></label>
        <label class="check"><input type="radio" name="vis" value="public"> <span><strong>Public</strong><br><span class="muted">Anyone on the internet can read it.</span></span></label></fieldset>
      <p class="muted" id="pb-msg"></p>`,
    actions: [{ label: "Cancel" }, { label: "Publish", primary: true, onClick: async ov => {
      const name = $("#pb-name", ov).value.trim().replace(/[^A-Za-z0-9._-]+/g, "-"), msg = $("#pb-msg", ov);
      if (!name) { msg.textContent = "Give the repository a name."; return false; }
      if (changedPaths(p).length && !Object.keys(p.versions).length) { msg.textContent = "Save a first version, then publish."; return false; }
      const isPrivate = ov.querySelector('input[name="vis"]:checked').value === "private";
      ov.remove();
      const pm = progressModal("Publishing to GitHub");
      try { const repo = await publishProject(p, { name, description: $("#pb-desc", ov).value.trim(), isPrivate }, pm.set); await persist(p, true); pm.close(); ghBust("repos"); render(); toast(`Published to ${repo.full_name}.`); }
      catch (e) { pm.close(); toast(e.message); }
      return true;
    } }]
  });
}

/* ---------- Reviews (pull requests) ---------- */
function viewReviews(p, el) {
  if (!isRemote(p) || !ghSignedIn()) return needsGitHub(el, p, "reviews");
  const state = S.revState || "open";
  loadingInto(el);
  listPulls(p, state === "open" ? "open" : "closed").then(prs => {
    const ready = Object.keys(p.drafts).filter(d => d !== "main" && aheadBehind(p, d).ahead > 0);
    el.innerHTML = `
      ${ready.length && state === "open" ? `<div class="flash info">${ic("info")}<span>${ready.map(d => `<span class="branch-name">${esc(d)}</span>`).join(" ")} ${ready.length > 1 ? "have" : "has"} changes ready for review.</span><span class="grow"></span><button class="btn btn-sm btn-primary" data-newrev="${esc(ready[0])}">Request review</button></div>` : ""}
      <div class="row" style="margin-bottom:16px"><span class="grow"></span><button class="btn btn-primary" id="rv-new">${ic("merge")} Request a review</button></div>
      <div class="Box"><div class="Box-header"><div class="row"><button class="link ${state === "open" ? "" : "link-muted"}" data-st="open" style="font-weight:${state === "open" ? 600 : 400};color:var(--fg)">${ic("merge")} Open</button><button class="link ${state === "closed" ? "" : "link-muted"}" data-st="closed" style="font-weight:${state === "closed" ? 600 : 400};color:var(--fg)">${ic("check")} Closed</button></div></div>
      ${prs.map(r => `<div class="Box-row">${r.merged_at ? ic("merge", "merged-ic") : r.state === "open" ? ic("merge", "open-ic") : ic("x", "closed-ic")}<div class="grow" style="min-width:0"><button class="link" data-pr="${r.number}" style="font-weight:600;color:var(--fg);font-size:15px">${esc(r.title)}</button>
        <div class="muted" style="font-size:12px">#${r.number} · ${esc(r.user.login)} asked to merge <span class="branch-name">${esc(localDraft(p, r.head.ref))}</span> into <span class="branch-name">${esc(localDraft(p, r.base.ref))}</span> · ${r.merged_at ? "merged " + ago(Date.parse(r.merged_at)) : r.state === "open" ? "opened " + ago(Date.parse(r.created_at)) : "closed " + ago(Date.parse(r.closed_at))}</div></div>
        ${(r.requested_reviewers || []).slice(0, 3).map(u => avatarImg(ghImgOk() ? u.avatar_url : null, u.login, 20)).join("")}</div>`).join("") || `<div class="blankslate">${ic("merge")}<h3>${state === "open" ? "No open reviews" : "No closed reviews yet"}</h3><p class="muted">A review asks someone to read a draft's changes, comment on them and approve merging them into main.</p></div>`}</div>`;
    el.querySelectorAll("[data-st]").forEach(b => b.onclick = () => { S.revState = b.dataset.st; viewReviews(p, el); });
    el.querySelectorAll("[data-pr]").forEach(b => b.onclick = () => go("review", { num: +b.dataset.pr }));
    $("#rv-new").onclick = () => requestReviewFlow(p, ready[0]);
    el.querySelectorAll("[data-newrev]").forEach(b => b.onclick = () => requestReviewFlow(p, b.dataset.newrev));
  }).catch(e => errorInto(el, e, () => viewReviews(p, el)));
}
async function requestReviewFlow(p, draft) {
  if (!isRemote(p) || !ghSignedIn()) return toast("Publish this project to GitHub first.");
  const drafts = Object.keys(p.drafts).filter(d => d !== "main");
  if (!drafts.length) return toast("Create a draft first: reviews compare a draft with main.");
  if (changedPaths(p).length) return toast("Save your unsaved changes as a version first.");
  let collabs = []; try { collabs = (await ghCached(`co:${p.id}`, () => gh(`${repoPath(p)}/collaborators?per_page=100`))).filter(u => u.login !== GH.user.login); } catch (e) { /* not an admin */ }
  const d0 = draft || drafts[0], v0 = p.drafts[d0] && p.versions[p.drafts[d0]];
  modal({
    title: "Request a review",
    body: `<label for="rq-d">Draft to review<select class="form" id="rq-d">${drafts.map(d => `<option value="${esc(d)}" ${d === d0 ? "selected" : ""}>${esc(d)} (${aheadBehind(p, d).ahead} new version${aheadBehind(p, d).ahead === 1 ? "" : "s"})</option>`).join("")}</select></label>
      <label for="rq-t">Title<input type="text" id="rq-t" value="${esc(v0 ? v0.message : "")}"></label>
      <label for="rq-b">What should the reviewer look at?<textarea class="form" id="rq-b" rows="5" placeholder="e.g. I cut the executive summary to two sentences. Does it still make the case?"></textarea></label>
      ${collabs.length ? `<div><span style="font-weight:600">Reviewers</span><div class="Box" style="margin-top:6px">${collabs.map(u => `<label class="Box-row check" style="font-weight:400"><input type="checkbox" value="${esc(u.login)}" class="rq-u"> ${avatarImg(ghImgOk() ? u.avatar_url : null, u.login, 20)} ${esc(u.login)}</label>`).join("")}</div></div>` : `<p class="muted" style="font-size:12px">To ask a specific person, invite them as a collaborator in Settings first. You can still open the review and share its link.</p>`}
      <p class="muted" id="rq-msg"></p>`,
    onOpen: ov => { const t = $("#rq-t", ov); let edited = false; t.addEventListener("input", () => edited = true);
      $("#rq-d", ov).onchange = e => { const v = p.drafts[e.target.value] && p.versions[p.drafts[e.target.value]]; if (!edited && v) t.value = v.message; }; },
    actions: [{ label: "Cancel" }, { label: "Request review", primary: true, onClick: async ov => {
      const d = $("#rq-d", ov).value, title = $("#rq-t", ov).value.trim(), msg = $("#rq-msg", ov);
      if (!title) { msg.textContent = "Give the review a title."; return false; }
      if (!aheadBehind(p, d).ahead) { msg.textContent = "That draft has nothing main doesn't already have."; return false; }
      msg.textContent = "Opening the review on GitHub…";
      try {
        const pr = await gh(`${repoPath(p)}/pulls`, { method: "POST", body: { title, body: $("#rq-b", ov).value, head: remoteBranch(p, d), base: remoteBranch(p, "main") } });
        const who = [...ov.querySelectorAll(".rq-u:checked")].map(x => x.value);
        if (who.length) { try { await gh(`${repoPath(p)}/pulls/${pr.number}/requested_reviewers`, { method: "POST", body: { reviewers: who } }); } catch (e) { toast(e.message); } }
        ghBust(`pr:${p.id}`); go("review", { num: pr.number }); toast(`Review #${pr.number} opened.`); return true;
      } catch (e) { msg.textContent = e.message; return false; }
    } }]
  });
}
function viewReview(p, el) {
  if (!isRemote(p) || !ghSignedIn()) return needsGitHub(el, p, "reviews");
  const n = S.num, R = repoPath(p), tab = S.revTab || "conversation";
  loadingInto(el);
  Promise.all([gh(`${R}/pulls/${n}`), gh(`${R}/issues/${n}/comments?per_page=100`), gh(`${R}/pulls/${n}/reviews?per_page=100`)]).then(async ([pr, comments, reviews]) => {
    const head = localDraft(p, pr.head.ref), base = localDraft(p, pr.base.ref);
    if (pr.head.sha && !p.versions[pr.head.sha] || pr.base.sha && !p.versions[pr.base.sha]) { try { await syncProject(p); await persist(p, true); } catch (e) { /* show what we have */ } }
    const timeline = [...comments.map(c => ({ t: Date.parse(c.created_at), kind: "comment", user: c.user, body: c.body })),
      ...reviews.filter(r => r.state !== "PENDING").map(r => ({ t: Date.parse(r.submitted_at), kind: "review", user: r.user, body: r.body, state: r.state }))].sort((a, b) => a.t - b.t);
    const approvals = reviews.filter(r => r.state === "APPROVED").length, changesReq = reviews.filter(r => r.state === "CHANGES_REQUESTED").length;
    const stateLbl = pr.merged_at ? `<span class="state merged">${ic("merge")} Merged</span>` : pr.state === "open" ? `<span class="state open">${ic("merge")} Open</span>` : `<span class="state closed">${ic("x")} Closed</span>`;
    const mine = pr.user.login === GH.user.login;
    const evIcon = { APPROVED: ["check", "Approved these changes", "ok"], CHANGES_REQUESTED: ["alert", "Asked for changes", "bad"], COMMENTED: ["pencil", "Reviewed", ""], DISMISSED: ["x", "Review dismissed", ""] };
    el.innerHTML = `
      <div class="pr-head"><h1>${esc(pr.title)} <span class="muted" style="font-weight:300">#${pr.number}</span></h1>
        <div class="row">${stateLbl}<span class="muted"><strong style="color:var(--fg)">${esc(pr.user.login)}</strong> ${pr.merged_at ? "merged" : "wants to merge"} <span class="branch-name">${esc(head)}</span> into <span class="branch-name">${esc(base)}</span></span><span class="grow"></span><a class="btn btn-sm" href="${esc(pr.html_url)}" target="_blank" rel="noopener">View on GitHub</a></div></div>
      <nav class="unav sub" aria-label="Review"><button data-rt="conversation" ${tab === "conversation" ? 'aria-current="page"' : ""}><span class="in">${ic("pencil")} Conversation <span class="counter">${timeline.length}</span></span></button><button data-rt="changes" ${tab === "changes" ? 'aria-current="page"' : ""}><span class="in">${ic("compare")} Changes</span></button></nav>
      <div id="rv-body" style="margin-top:16px"></div>`;
    el.querySelectorAll("[data-rt]").forEach(b => b.onclick = () => { S.revTab = b.dataset.rt; viewReview(p, el); });
    const body = $("#rv-body");
    if (tab === "changes") {
      const a = p.drafts[base] && p.versions[pr.base.sha] ? pr.base.sha : p.drafts[base], b = p.versions[pr.head.sha] ? pr.head.sha : p.drafts[head];
      if (!a || !b) { body.innerHTML = `<div class="Box-body muted">Sync this project to load the changes.</div>`; return; }
      body.innerHTML = `<p class="muted" style="margin:0 0 12px">Click <strong>+</strong> beside a changed paragraph to comment on it.</p><div id="rv-diffs"></div>`;
      renderDiffs(p, a, b, $("#rv-diffs"), { onComment: (path, label, text) => commentOnLine(p, pr, path, label, text) });
      return;
    }
    body.innerHTML = `<div class="tl">
        <div class="tl-c">${avatarImg(ghImgOk() ? pr.user.avatar_url : null, pr.user.login, 32)}<div class="Box cmt"><div class="Box-header"><strong>${esc(pr.user.login)}</strong><span class="muted">asked for a review ${ago(Date.parse(pr.created_at))}</span></div><div class="Box-body md">${mdLite(pr.body)}</div></div></div>
        ${timeline.map(x => x.kind === "review" && !x.body ? `<div class="tl-ev ${evIcon[x.state] ? evIcon[x.state][2] : ""}">${ic(evIcon[x.state] ? evIcon[x.state][0] : "pencil")}<strong>${esc(x.user.login)}</strong> <span class="muted">${evIcon[x.state] ? evIcon[x.state][1].toLowerCase() : "reviewed"} ${ago(x.t)}</span></div>`
          : `<div class="tl-c">${avatarImg(ghImgOk() ? x.user.avatar_url : null, x.user.login, 32)}<div class="Box cmt ${x.state === "APPROVED" ? "ok" : x.state === "CHANGES_REQUESTED" ? "bad" : ""}"><div class="Box-header"><strong>${esc(x.user.login)}</strong><span class="muted">${x.kind === "review" && evIcon[x.state] ? evIcon[x.state][1].toLowerCase() : "commented"} ${ago(x.t)}</span></div><div class="Box-body md">${mdLite(x.body)}</div></div></div>`).join("")}
      </div>
      ${pr.state === "open" ? `<div class="merge-box Box ${approvals && !changesReq ? "ok" : ""}"><div class="Box-body">
          <div class="row">${approvals && !changesReq ? ic("check") : changesReq ? ic("alert") : ic("info")}<strong>${approvals && !changesReq ? `Approved by ${approvals} reviewer${approvals > 1 ? "s" : ""}` : changesReq ? "Changes were requested" : "Waiting for review"}</strong></div>
          <p class="muted" style="margin:6px 0 12px">${pr.mergeable === false ? "These changes conflict with main. Merge main into the draft on GitHub, or bring the draft up to date, then try again." : "Merging adds this draft's versions to main. The draft stays available until you delete it."}</p>
          <div class="row"><button class="btn btn-primary" id="rv-merge" ${pr.mergeable === false ? "disabled" : ""}>${ic("merge")} Merge into ${esc(base)}</button><button class="btn" id="rv-close">Close without merging</button></div></div></div>` : ""}
      <div class="tl-c" style="margin-top:16px">${avatarImg(ghImgOk() ? GH.user.avatar_url : null, GH.user.login, 32)}<div class="Box cmt grow"><div class="Box-header"><strong>Add your review</strong></div><div class="Box-body"><label class="sr" for="rv-txt">Comment</label><textarea class="form" id="rv-txt" rows="4" placeholder="Leave a comment. Markdown works: **bold**, *italic*, > quotes, - lists."></textarea>
        <div class="row" style="margin-top:8px;justify-content:flex-end">${pr.state === "open" && !mine ? `<button class="btn" data-ev="REQUEST_CHANGES">${ic("alert")} Ask for changes</button><button class="btn" data-ev="APPROVE">${ic("check")} Approve</button>` : ""}<button class="btn btn-primary" data-ev="COMMENT">Comment</button></div>
        ${mine && pr.state === "open" ? `<p class="muted" style="font-size:12px;margin:8px 0 0">GitHub doesn't let you approve your own review request; your reviewers can.</p>` : ""}</div></div></div>`;
    el.querySelectorAll("[data-ev]").forEach(b => b.onclick = async () => {
      const txt = $("#rv-txt").value.trim(), ev = b.dataset.ev;
      if (ev !== "APPROVE" && !txt) return toast(ev === "COMMENT" ? "Write a comment first." : "Say what should change.");
      b.disabled = true;
      try {
        if (ev === "COMMENT") await gh(`${R}/issues/${n}/comments`, { method: "POST", body: { body: txt } });
        else await gh(`${R}/pulls/${n}/reviews`, { method: "POST", body: { event: ev, body: txt } });
        toast(ev === "APPROVE" ? "Approved." : ev === "REQUEST_CHANGES" ? "Asked for changes." : "Comment posted."); viewReview(p, el);
      } catch (e) { b.disabled = false; toast(e.message); }
    });
    const mg = $("#rv-merge"); if (mg) mg.onclick = async () => {
      if (!await confirmBox(`Merge ${head} into ${base}?`, `This adds the reviewed versions to ${base}.`, "Merge")) return;
      try { await gh(`${R}/pulls/${n}/merge`, { method: "PUT", body: { merge_method: "merge", commit_title: `Merge review #${n}: ${pr.title}` } }); ghBust(`pr:${p.id}`); await syncProject(p); await persist(p, true); toast("Merged."); viewReview(p, el); renderRepoHead(); }
      catch (e) { toast(e.message); }
    };
    const cl = $("#rv-close"); if (cl) cl.onclick = async () => { try { await gh(`${R}/pulls/${n}`, { method: "PATCH", body: { state: "closed" } }); ghBust(`pr:${p.id}`); toast("Review closed."); viewReview(p, el); } catch (e) { toast(e.message); } };
  }).catch(e => errorInto(el, e, () => viewReview(p, el)));
}
function commentOnLine(p, pr, path, label, text) {
  modal({
    title: `Comment on ${path}${label ? " · " + (kindOf(path) === "docx" ? "¶" : kindOf(path) === "sheet" ? "row " : "line ") + label : ""}`,
    body: `<blockquote class="quote">${esc(text.length > 400 ? text.slice(0, 400) + "…" : text)}</blockquote><label for="lc-t">Your comment<textarea class="form" id="lc-t" rows="4" placeholder="Suggest a change or ask a question about this passage."></textarea></label>`,
    actions: [{ label: "Cancel" }, { label: "Comment", primary: true, onClick: async ov => {
      const t = $("#lc-t", ov).value.trim(); if (!t) return false;
      const quote = text.replace(/\n/g, " ").slice(0, 400);
      const body = `**${path}**${label ? ` · ${kindOf(path) === "docx" ? "¶" : kindOf(path) === "sheet" ? "row " : "line "}${label}` : ""}\n> ${quote}\n\n${t}`;
      try { await gh(`${repoPath(p)}/issues/${pr.number}/comments`, { method: "POST", body: { body } }); toast("Comment posted to the conversation."); return true; }
      catch (e) { toast(e.message); return false; }
    } }]
  });
}

/* ---------- Notes & to-dos (issues) ---------- */
const labelChip = l => `<span class="gl" style="--lc:#${esc(l.color)}">${esc(l.name)}</span>`;
function viewNotes(p, el) {
  if (!isRemote(p) || !ghSignedIn()) return needsGitHub(el, p, "notes");
  const state = S.noteState || "open";
  loadingInto(el);
  listNotes(p, state).then(notes => {
    const f = S.noteLabel;
    const shown = f ? notes.filter(x => x.labels.some(l => l.name === f)) : notes;
    el.innerHTML = `<div class="row" style="margin-bottom:16px">${f ? `<span class="muted">Showing notes labeled</span> ${labelChip(notes.flatMap(x => x.labels).find(l => l.name === f) || { name: f, color: "8c959f" })} <button class="link" id="nt-clear">Clear</button>` : ""}<span class="grow"></span><button class="btn btn-primary" id="nt-new">${ic("pencil")} New note</button></div>
      <div class="Box"><div class="Box-header"><div class="row"><button class="link" data-st="open" style="font-weight:${state === "open" ? 600 : 400};color:var(--fg)">${ic("info")} Open</button><button class="link" data-st="closed" style="font-weight:${state === "closed" ? 600 : 400};color:var(--fg)">${ic("check")} Done</button></div></div>
      ${shown.map(x => `<div class="Box-row">${state === "open" ? ic("info", "open-ic") : ic("check", "merged-ic")}<div class="grow" style="min-width:0"><div class="row" style="gap:6px"><button class="link" data-note="${x.number}" style="font-weight:600;color:var(--fg);font-size:15px">${esc(x.title)}</button>${x.labels.map(l => `<button class="lbtn" data-lf="${esc(l.name)}">${labelChip(l)}</button>`).join("")}</div>
        <div class="muted" style="font-size:12px">#${x.number} · ${esc(x.user.login)} ${state === "open" ? "added" : "closed"} ${ago(Date.parse(state === "open" ? x.created_at : x.closed_at))}</div></div>${x.comments ? `<span class="muted" style="font-size:12px">${ic("pencil")} ${x.comments}</span>` : ""}</div>`).join("") || `<div class="blankslate">${ic("check")}<h3>${state === "open" ? "No open notes" : "Nothing done yet"}</h3><p class="muted">Notes are to-dos for this project: a citation to check, a section to rework, a reviewer's comment to address.</p></div>`}</div>`;
    el.querySelectorAll("[data-st]").forEach(b => b.onclick = () => { S.noteState = b.dataset.st; viewNotes(p, el); });
    el.querySelectorAll("[data-note]").forEach(b => b.onclick = () => go("note", { num: +b.dataset.note }));
    el.querySelectorAll("[data-lf]").forEach(b => b.onclick = () => { S.noteLabel = b.dataset.lf; viewNotes(p, el); });
    const cl = $("#nt-clear"); if (cl) cl.onclick = () => { S.noteLabel = null; viewNotes(p, el); };
    $("#nt-new").onclick = () => newNoteFlow(p);
  }).catch(e => errorInto(el, e, () => viewNotes(p, el)));
}
async function newNoteFlow(p, preset = {}) {
  let labels = []; try { labels = await ensureLabels(p); } catch (e) { /* labels optional */ }
  modal({
    title: "New note",
    body: `<label for="nn-t">Title<input type="text" id="nn-t" value="${esc(preset.title || "")}" placeholder="e.g. Check the survey sample size in Background"></label>
      <label for="nn-b">Details<textarea class="form" id="nn-b" rows="5" placeholder="Add context, quote a passage with >, or list steps with - [ ]">${esc(preset.body || "")}</textarea></label>
      ${labels.length ? `<div><span style="font-weight:600">Labels</span><div class="row" style="margin-top:6px">${labels.map(l => `<label class="check" style="font-weight:400;flex-direction:row;gap:4px"><input type="checkbox" class="nn-l" value="${esc(l.name)}"> ${labelChip(l)}</label>`).join("")}</div></div>` : ""}
      <p class="muted" id="nn-msg"></p>`,
    actions: [{ label: "Cancel" }, { label: "Add note", primary: true, onClick: async ov => {
      const title = $("#nn-t", ov).value.trim(); if (!title) { $("#nn-msg", ov).textContent = "Give the note a title."; return false; }
      try {
        const is = await gh(`${repoPath(p)}/issues`, { method: "POST", body: { title, body: $("#nn-b", ov).value, labels: [...ov.querySelectorAll(".nn-l:checked")].map(x => x.value) } });
        ghBust(`is:${p.id}`); go("note", { num: is.number }); toast(`Note #${is.number} added.`); return true;
      } catch (e) { $("#nn-msg", ov).textContent = e.message; return false; }
    } }]
  });
}
function viewNote(p, el) {
  if (!isRemote(p) || !ghSignedIn()) return needsGitHub(el, p, "notes");
  const n = S.num, R = repoPath(p);
  loadingInto(el);
  Promise.all([gh(`${R}/issues/${n}`), gh(`${R}/issues/${n}/comments?per_page=100`), ensureLabels(p).catch(() => [])]).then(([is, comments, labels]) => {
    const open = is.state === "open";
    el.innerHTML = `<div class="pr-head"><h1>${esc(is.title)} <span class="muted" style="font-weight:300">#${is.number}</span></h1>
        <div class="row"><span class="state ${open ? "open" : "merged"}">${ic(open ? "info" : "check")} ${open ? "Open" : "Done"}</span><span class="muted"><strong style="color:var(--fg)">${esc(is.user.login)}</strong> added this ${ago(Date.parse(is.created_at))} · ${comments.length} comment${comments.length === 1 ? "" : "s"}</span><span class="grow"></span><a class="btn btn-sm" href="${esc(is.html_url)}" target="_blank" rel="noopener">View on GitHub</a></div></div>
      <div class="note-layout"><div class="tl">
        <div class="tl-c">${avatarImg(ghImgOk() ? is.user.avatar_url : null, is.user.login, 32)}<div class="Box cmt"><div class="Box-header"><strong>${esc(is.user.login)}</strong><span class="muted">${ago(Date.parse(is.created_at))}</span></div><div class="Box-body md">${mdLite(is.body)}</div></div></div>
        ${comments.map(c => `<div class="tl-c">${avatarImg(ghImgOk() ? c.user.avatar_url : null, c.user.login, 32)}<div class="Box cmt"><div class="Box-header"><strong>${esc(c.user.login)}</strong><span class="muted">${ago(Date.parse(c.created_at))}</span></div><div class="Box-body md">${mdLite(c.body)}</div></div></div>`).join("")}
        <div class="tl-c">${avatarImg(ghImgOk() ? GH.user.avatar_url : null, GH.user.login, 32)}<div class="Box cmt grow"><div class="Box-body"><label class="sr" for="nc-t">Comment</label><textarea class="form" id="nc-t" rows="4" placeholder="Add a comment"></textarea>
          <div class="row" style="margin-top:8px;justify-content:flex-end"><button class="btn" id="nc-state">${open ? ic("check") + " Mark done" : "Reopen"}</button><button class="btn btn-primary" id="nc-go">Comment</button></div></div></div></div></div>
        <aside class="note-side"><div class="side-h">Labels</div><div class="row" style="gap:6px">${labels.map(l => `<button class="lbtn ${is.labels.some(x => x.name === l.name) ? "on" : ""}" data-tl="${esc(l.name)}" title="${is.labels.some(x => x.name === l.name) ? "Remove" : "Add"} label">${labelChip(l)}</button>`).join("") || `<span class="muted">None</span>`}</div><p class="muted" style="font-size:12px">Click a label to add or remove it.</p></aside></div>`;
    $("#nc-go").onclick = async () => { const t = $("#nc-t").value.trim(); if (!t) return toast("Write a comment first."); try { await gh(`${R}/issues/${n}/comments`, { method: "POST", body: { body: t } }); ghBust(`is:${p.id}`); viewNote(p, el); } catch (e) { toast(e.message); } };
    $("#nc-state").onclick = async () => { try { const t = $("#nc-t").value.trim(); if (t) await gh(`${R}/issues/${n}/comments`, { method: "POST", body: { body: t } }); await gh(`${R}/issues/${n}`, { method: "PATCH", body: { state: open ? "closed" : "open" } }); ghBust(`is:${p.id}`); toast(open ? "Marked done." : "Reopened."); viewNote(p, el); } catch (e) { toast(e.message); } };
    el.querySelectorAll("[data-tl]").forEach(b => b.onclick = async () => {
      const cur = is.labels.map(l => l.name), name = b.dataset.tl;
      const next = cur.includes(name) ? cur.filter(x => x !== name) : [...cur, name];
      try { await gh(`${R}/issues/${n}`, { method: "PATCH", body: { labels: next } }); ghBust(`is:${p.id}`); viewNote(p, el); } catch (e) { toast(e.message); }
    });
  }).catch(e => errorInto(el, e, () => viewNote(p, el)));
}

/* ---------- Insights ---------- */
function viewInsights(p, el) {
  const chain = firstParentChain(p, headId(p)).reverse();
  const points = chain.map(id => { const v = p.versions[id]; return { id, v, words: Object.values(v.tree).reduce((n, h) => n + wordCount(blobText(p, h)), 0) }; });
  const touches = {}; for (const id of chain) { const v = p.versions[id], pt = treeOf(p, v.parent); for (const path of new Set([...Object.keys(v.tree), ...Object.keys(pt)])) if (v.tree[path] !== pt[path]) touches[path] = (touches[path] || 0) + 1; }
  const authors = {}; for (const id of chain) { const v = p.versions[id], k = v.login || v.author || ME; authors[k] = authors[k] || { n: 0, avatar: v.avatar, login: v.login }; authors[k].n++; }
  const cur = Object.entries(p.working).map(([path, f]) => ({ path, words: wordCount(f.text), touches: touches[path] || 0 })).sort((a, b) => b.words - a.words);
  const first = points[0], last = points.at(-1);
  el.innerHTML = `<div class="insights">
    <div class="tiles">
      <div class="tile"><div class="tile-n">${(last ? last.words : 0).toLocaleString()}</div><div class="muted">words on <span class="branch-name">${esc(p.current)}</span></div></div>
      <div class="tile"><div class="tile-n">${points.length >= 2 ? ((last.words - first.words >= 0 ? "+" : "−") + Math.abs(last.words - first.words).toLocaleString()) : "—"}</div><div class="muted">since the first version</div></div>
      <div class="tile"><div class="tile-n">${chain.length}</div><div class="muted">versions on this draft</div></div>
      <div class="tile"><div class="tile-n">${Object.keys(authors).length}</div><div class="muted">contributor${Object.keys(authors).length === 1 ? "" : "s"}</div></div></div>
    <div class="Box"><div class="Box-header"><strong>Words over time</strong><span class="muted">each point is a saved version on ${esc(p.current)}</span></div><div class="Box-body" id="ins-chart">${points.length >= 2 ? wordsChart(points) : `<p class="muted">Save at least two versions to see a trend.</p>`}</div></div>
    <div class="Box"><div class="Box-header"><strong>Activity</strong><span class="muted">versions saved per day, this project</span></div><div class="Box-body" style="overflow-x:auto">${heatmapSvg(versionsByDay([p]), false)}</div></div>
    <div class="ins-two">
      <div class="Box"><div class="Box-header"><strong>Files</strong></div><table class="ftable"><tbody>${cur.map(r => `<tr><td class="ic">${fileIcon(r.path)}</td><td class="nm"><button class="link" data-file="${esc(r.path)}">${esc(r.path)}</button></td><td class="when" style="width:auto">${r.words.toLocaleString()} word${r.words === 1 ? "" : "s"}</td><td class="when" style="width:auto">${r.touches} revision${r.touches === 1 ? "" : "s"}</td></tr>`).join("")}</tbody></table></div>
      <div class="Box"><div class="Box-header"><strong>Contributors</strong></div>${Object.entries(authors).sort((a, b) => b[1].n - a[1].n).map(([k, a]) => `<div class="Box-row">${avatarImg(ghImgOk() ? a.avatar : null, k, 24)}<strong class="grow">${esc(k)}</strong><span class="muted">${a.n} version${a.n === 1 ? "" : "s"}</span></div>`).join("")}</div></div></div>`;
  el.querySelectorAll("[data-file]").forEach(b => b.onclick = () => go("file", { file: b.dataset.file }));
  bindChartHover($("#ins-chart"), points);
}
function wordsChart(points) {
  const W = 880, H = 240, L = 56, R = 16, T = 16, B = 32;
  const t0 = points[0].v.time, t1 = points.at(-1).v.time, span = Math.max(1, t1 - t0);
  const maxW = Math.max(...points.map(x => x.words)), niceMax = niceCeil(maxW * 1.1 || 10);
  const X = t => L + (W - L - R) * (t - t0) / span, Y = w => T + (H - T - B) * (1 - w / niceMax);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(niceMax * f));
  const line = points.map((q, i) => `${i ? "L" : "M"}${X(q.v.time).toFixed(1)},${Y(q.words).toFixed(1)}`).join("");
  const area = `${line}L${X(t1).toFixed(1)},${Y(0)}L${X(t0).toFixed(1)},${Y(0)}Z`;
  const dates = [t0, t0 + span / 2, t1];
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Words over time, from ${points[0].words} to ${points.at(-1).words}">
    ${ticks.map(v => `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" class="grid"/><text x="${L - 8}" y="${Y(v) + 4}" text-anchor="end" class="tick">${v.toLocaleString()}</text>`).join("")}
    ${dates.map((t, i) => `<text x="${X(t)}" y="${H - 10}" text-anchor="${["start", "middle", "end"][i]}" class="tick">${new Date(t).toLocaleDateString([], { month: "short", day: "numeric" })}</text>`).join("")}
    <path d="${area}" class="area"/><path d="${line}" class="line"/>
    ${points.map((q, i) => `<circle cx="${X(q.v.time).toFixed(1)}" cy="${Y(q.words).toFixed(1)}" r="${i === points.length - 1 ? 5 : 3.5}" class="pt ${i === points.length - 1 ? "end" : ""}"/>`).join("")}
    <text x="${X(t1) - 8}" y="${Y(points.at(-1).words) - 10}" text-anchor="end" class="endlbl">${points.at(-1).words.toLocaleString()} words</text>
    <line class="xh" x1="0" x2="0" y1="${T}" y2="${H - B}" style="display:none"/>
    <rect class="hit" x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}" fill="transparent"/></svg><div class="tip" hidden></div>`;
}
const niceCeil = v => { const p = Math.pow(10, Math.floor(Math.log10(v))); for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v) return m * p; return 10 * p; };
function bindChartHover(box, points) {
  const svg = box && box.querySelector("svg.chart"); if (!svg) return;
  const tip = box.querySelector(".tip"), xh = svg.querySelector(".xh"), hit = svg.querySelector(".hit"), circles = [...svg.querySelectorAll("circle.pt")];
  box.style.position = "relative";
  hit.addEventListener("mousemove", e => {
    const r = svg.getBoundingClientRect(), sx = (e.clientX - r.left) * (880 / r.width);
    let best = 0, bd = 1e9; circles.forEach((c, i) => { const d = Math.abs(+c.getAttribute("cx") - sx); if (d < bd) { bd = d; best = i; } });
    const c = circles[best], q = points[best]; const cx = +c.getAttribute("cx");
    xh.setAttribute("x1", cx); xh.setAttribute("x2", cx); xh.style.display = "";
    circles.forEach((k, i) => k.classList.toggle("on", i === best));
    tip.hidden = false; tip.innerHTML = `<strong>${q.words.toLocaleString()} words</strong><br>${esc(q.v.message)}<br><span class="muted">${fullDate(q.v.time)} · ${q.id.slice(0, 7)}</span>`;
    const px = cx * r.width / 880; tip.style.left = Math.min(r.width - 240, Math.max(0, px + 12)) + "px"; tip.style.top = "12px";
  });
  hit.addEventListener("mouseleave", () => { tip.hidden = true; xh.style.display = "none"; circles.forEach(k => k.classList.remove("on")); });
  hit.addEventListener("click", () => { const on = circles.findIndex(k => k.classList.contains("on")); if (on >= 0) go("version", { vid: points[on].id }); });
}

/* ---------- Line history (blame) ---------- */
function blame(p, path, head) {
  const chain = firstParentChain(p, head);
  const headText = refText(p, "W", path) || textAt(p, head, path);
  const lines = headText.split("\n"), attr = new Array(lines.length).fill(null);
  let map = lines.map((_, i) => i), curText = headText, curId = "W";
  for (const id of chain) {
    const pText = textAt(p, id, path);
    const ops = myers(pText === "" ? [] : pText.split("\n"), curText === "" ? [] : curText.split("\n"));
    const toParent = new Map(); let ia = 0, ib = 0;
    for (const [t] of ops) { if (t === "=") { toParent.set(ib, ia); ia++; ib++; } else if (t === "-") ia++; else ib++; }
    map = map.map((ci, li) => { if (ci == null) return null; if (toParent.has(ci)) return toParent.get(ci); if (attr[li] == null) attr[li] = curId; return null; });
    curText = pText; curId = id;
    if (map.every(x => x == null)) break;
  }
  map.forEach((ci, li) => { if (ci != null && attr[li] == null) attr[li] = curId; });
  return lines.map((l, i) => ({ line: l, vid: attr[i] }));
}
function blameView(p, path, mount) {
  const rows = blame(p, path, headId(p)), docx = kindOf(path) === "docx", sheet = kindOf(path) === "sheet";
  const times = rows.map(r => r.vid && r.vid !== "W" ? p.versions[r.vid].time : Date.now());
  const tMin = Math.min(...times), tMax = Math.max(...times), age = t => tMax === tMin ? 4 : Math.round(1 + 4 * (t - tMin) / (tMax - tMin));
  let html = "", prev = null;
  rows.forEach((r, i) => {
    const v = r.vid && r.vid !== "W" ? p.versions[r.vid] : null, start = r.vid !== prev; prev = r.vid;
    html += `<tr class="${start ? "bstart" : ""}"><td class="bmeta">${start ? (v ? `<button class="link" data-v="${r.vid}" title="${esc(v.message)}">${esc(v.message)}</button><span class="muted"> · ${ago(v.time)}</span>` : `<span class="muted"><em>Unsaved change</em></span>`) : ""}</td><td class="bage a${age(times[i])}"></td><td class="n">${docx ? "¶" : ""}${i + 1}</td><td class="t">${(sheet && r.line.startsWith(SHEET_HDR) ? "<strong>" + esc(r.line) + "</strong>" : esc(r.line).replace(/\t/g, sheet ? '<span class="csep"></span>' : "\t")) || " "}</td></tr>`;
  });
  mount.innerHTML = `<div style="overflow-x:auto"><table class="code-view blame"><tbody>${html}</tbody></table></div>`;
  mount.querySelectorAll("[data-v]").forEach(b => b.onclick = () => go("version", { vid: b.dataset.v }));
}

/* ---------- Settings tab ---------- */
function viewSettings(p, el) {
  const remote = isRemote(p);
  el.innerHTML = `<div class="settings">
    <h2 class="set-h">General</h2>
    <div class="Box"><div class="Box-row"><div class="grow"><strong>Project name</strong><div class="muted">${esc(p.name)}</div></div><button class="btn btn-sm" id="st-ren">Rename</button></div>
      <div class="Box-row"><div class="grow"><strong>Description</strong><div class="muted">${esc(p.description || "None yet")}</div></div><button class="btn btn-sm" id="st-desc">Edit</button></div></div>
    <h2 class="set-h">Sharing</h2>
    <div class="Box">${remote ? `
      <div class="Box-row"><div class="grow"><strong>Linked to GitHub</strong><div class="muted"><a href="${esc(p.remote.htmlUrl || `https://github.com/${p.remote.owner}/${p.remote.repo}`)}" target="_blank" rel="noopener">${esc(p.remote.owner + "/" + p.remote.repo)}</a> · last synced ${p.remote.syncedAt ? ago(p.remote.syncedAt) : "never"}</div></div><button class="btn btn-sm" id="st-sync">Sync now</button></div>
      <div class="Box-row"><div class="grow"><strong>Visibility</strong><div class="muted">${p.remote.private ? "Private: only you and collaborators can see it." : "Public: anyone can read it."}</div></div><button class="btn btn-sm" id="st-vis" ${ghSignedIn() ? "" : "disabled"}>Make ${p.remote.private ? "public" : "private"}</button></div>`
      : `<div class="Box-row"><div class="grow"><strong>Publish to GitHub</strong><div class="muted">Keep this project online, invite collaborators, request reviews and track notes. Your full history comes along.</div></div><button class="btn btn-sm btn-primary" id="st-pub">${ghSignedIn() ? "Publish" : "Sign in to publish"}</button></div>`}</div>
    ${remote ? `<h2 class="set-h">Collaborators</h2><div class="Box" id="st-co"><div class="Box-body muted">${ghSignedIn() ? "Loading…" : "Sign in to see collaborators."}</div></div>` : ""}
    <h2 class="set-h">Backups</h2>
    <div class="Box"><div class="Box-row"><div class="grow"><strong>Export a backup</strong><div class="muted">Every version, draft and milestone in one .json file.</div></div><button class="btn btn-sm" id="st-exp">Export</button></div>
      <div class="Box-row"><div class="grow"><strong>Restore a backup</strong><div class="muted">Open a .writersbox.json file as a project.</div></div><label class="btn btn-sm" for="st-imp">Choose file</label><input type="file" id="st-imp" accept=".json,application/json" hidden></div></div>
    <h2 class="set-h danger-h">Danger zone</h2>
    <div class="Box danger"><div class="Box-row"><div class="grow"><strong>Remove from this browser</strong><div class="muted">${remote ? "Deletes the local copy only. The GitHub repository and its history stay." : "Deletes the project and every version from this browser."}</div></div><button class="btn btn-sm btn-danger" id="st-del">Remove</button></div></div></div>`;
  $("#st-ren").onclick = async () => { const n = await askText("Rename project", "Project name", p.name, "Rename"); if (n) { p.name = n; persist(p, true); render(); } };
  $("#st-desc").onclick = async () => { const d = await askText("Edit description", "Description", p.description || "", "Save"); if (d !== null) { p.description = d; persist(p, true); if (remote && ghSignedIn()) gh(repoPath(p), { method: "PATCH", body: { description: d } }).catch(e => toast(e.message)); render(); } };
  const pub = $("#st-pub"); if (pub) pub.onclick = () => ghSignedIn() ? publishFlow(p) : signInFlow();
  const sy = $("#st-sync"); if (sy) sy.onclick = () => syncFlow(p);
  const vis = $("#st-vis"); if (vis) vis.onclick = async () => {
    const toPrivate = !p.remote.private;
    if (!await confirmBox(`Make ${p.remote.repo} ${toPrivate ? "private" : "public"}?`, toPrivate ? "Only you and invited collaborators will be able to see it." : "Anyone on the internet will be able to read every version.", toPrivate ? "Make private" : "Make public", !toPrivate)) return;
    try { const r = await gh(repoPath(p), { method: "PATCH", body: { private: toPrivate } }); p.remote.private = r.private; persist(p, true); render(); toast(`Now ${r.private ? "private" : "public"}.`); } catch (e) { toast(e.message); }
  };
  $("#st-exp").onclick = () => exportBackup(p);
  $("#st-imp").onchange = async e => {
    const file = e.target.files[0]; if (!file) return;
    try { const j = JSON.parse(await file.text()); if (j.format !== "writers-box" || !j.project || !j.project.versions) throw new Error(); const np = j.project; if (S.projects.some(x => x.id === np.id)) { np.id = uid(); np.name += " (restored)"; } S.projects.push(np); S.pid = np.id; resetSel(); await persist(np, true); toast("Backup restored."); go("files"); }
    catch (err) { toast("That file isn't a Writer's Box backup."); }
  };
  $("#st-del").onclick = async () => {
    if (!await confirmBox(`Remove “${p.name}” from this browser?`, remote ? "The GitHub repository stays; you can open it again later." : "This deletes the project and all its versions from this browser. Export a backup first if you might need it.", "Remove", true)) return;
    S.projects = S.projects.filter(x => x.id !== p.id); await dbDel(p.id).catch(() => {}); S.pid = S.projects[0] ? S.projects[0].id : null; resetSel(); go("home");
  };
  if (remote && ghSignedIn()) loadCollaborators(p, $("#st-co"));
}
async function loadCollaborators(p, box) {
  try {
    const list = await gh(`${repoPath(p)}/collaborators?per_page=100`);
    let invites = []; try { invites = await gh(`${repoPath(p)}/invitations`); } catch (e) { /* needs admin */ }
    box.innerHTML = list.map(u => `<div class="Box-row">${avatarImg(ghImgOk() ? u.avatar_url : null, u.login, 24)}<strong class="grow">${esc(u.login)}</strong><span class="label">${u.role_name || (u.permissions && u.permissions.admin ? "admin" : "write")}</span>${u.login !== GH.user.login ? `<button class="btn-octicon" data-rm="${esc(u.login)}" title="Remove" aria-label="Remove ${esc(u.login)}">${ic("trash")}</button>` : ""}</div>`).join("") +
      invites.map(iv => `<div class="Box-row">${avatarImg(ghImgOk() ? iv.invitee && iv.invitee.avatar_url : null, iv.invitee ? iv.invitee.login : "?", 24)}<strong class="grow">${esc(iv.invitee ? iv.invitee.login : "invitee")}</strong><span class="label label-attention">Invited</span></div>`).join("") +
      `<div class="Box-row"><label class="sr" for="co-u">GitHub username</label><input type="text" id="co-u" placeholder="GitHub username" style="max-width:260px"><button class="btn btn-sm" id="co-add">Invite</button><span class="muted" style="font-size:12px">They get an email from GitHub and can review drafts once they accept.</span></div>`;
    box.querySelectorAll("[data-rm]").forEach(b => b.onclick = async () => { if (!await confirmBox(`Remove ${b.dataset.rm}?`, "They'll lose access to this project.", "Remove", true)) return; try { await gh(`${repoPath(p)}/collaborators/${enc_(b.dataset.rm)}`, { method: "DELETE" }); ghBust(`co:${p.id}`); loadCollaborators(p, box); } catch (e) { toast(e.message); } });
    $("#co-add", box).onclick = async () => { const u = $("#co-u", box).value.trim().replace(/^@/, ""); if (!u) return; try { await gh(`${repoPath(p)}/collaborators/${enc_(u)}`, { method: "PUT", body: { permission: "push" } }); ghBust(`co:${p.id}`); toast(`Invited ${u}.`); loadCollaborators(p, box); } catch (e) { toast(e.message); } };
  } catch (e) { box.innerHTML = `<div class="Box-body muted">${esc(e.message)}</div>`; }
}
