
/* ============ GitHub backend ============
   Each Writer's Box project can be linked to a GitHub repository:
   versions = commits, drafts = branches, milestones = tags,
   reviews = pull requests, notes & to-dos = issues.
   The browser talks to api.github.com directly with the writer's own token (kept in this browser only). */
const GH = { token: null, user: null, base: "https://api.github.com", cache: {} };
const TOKEN_KEY = "wb.gh.token";
function ghLoadToken() { try { GH.token = localStorage.getItem(TOKEN_KEY) || null; } catch (e) { GH.token = null; } }
function ghSaveToken(t) { GH.token = t; try { if (t) localStorage.setItem(TOKEN_KEY, t); else localStorage.removeItem(TOKEN_KEY); } catch (e) { /* storage blocked: token lasts for this visit */ } }
const ghSignedIn = () => !!(GH.token && GH.user);
const enc_ = s => encodeURIComponent(s);
const refPath = name => name.split("/").map(enc_).join("/");
function ghErrorText(status, data) {
  const m = data && data.message ? data.message : "";
  if (status === 401) return "GitHub didn't accept the token. Sign in again with a valid token.";
  if (status === 403 && /rate limit/i.test(m)) return "GitHub's rate limit was reached. Try again in a few minutes.";
  if (status === 403) return "This token doesn't have permission for that. " + (m ? "(" + m + ")" : "");
  if (status === 404) return "Not found on GitHub, or this token can't see it.";
  if (status === 409 && /empty/i.test(m)) return "That repository is empty.";
  if (status === 422) return "GitHub couldn't do that: " + (data && data.errors && data.errors[0] && (data.errors[0].message || data.errors[0].code) || m || "invalid request");
  return `GitHub error ${status}${m ? ": " + m : ""}`;
}
async function gh(path, opts = {}) {
  if (!GH.token) throw new Error("Sign in with GitHub first.");
  let res;
  try {
    res = await fetch(GH.base + path, {
      method: opts.method || "GET",
      headers: { Accept: "application/vnd.github+json", Authorization: "Bearer " + GH.token, "X-GitHub-Api-Version": "2022-11-28", ...(opts.body ? { "Content-Type": "application/json" } : {}) },
      body: opts.body ? JSON.stringify(opts.body) : undefined
    });
  } catch (e) {
    throw new Error(inClaudeViewer() ? "GitHub can't be reached from inside Claude. Open your hosted Writer's Box site (GitHub Pages) to use GitHub features." : "Couldn't reach GitHub. Check your connection and try again.");
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) { const err = new Error(ghErrorText(res.status, data)); err.status = res.status; err.data = data; throw err; }
  return data;
}
const inClaudeViewer = () => !!(window.claude && window.claude.use) || /claude\.ai|claudeusercontent/.test(location.hostname);
async function pool(items, n, fn) {
  const out = new Array(items.length); let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); } }));
  return out;
}
async function ghSignIn(token) {
  GH.token = token.trim();
  try { GH.user = await gh("/user"); ghSaveToken(GH.token); GH.cache = {}; return GH.user; }
  catch (e) { GH.token = null; GH.user = null; throw e; }
}
function ghSignOut() { ghSaveToken(null); GH.user = null; GH.cache = {}; }
async function ghCached(key, fetcher, maxAgeMs = 60000) {
  const c = GH.cache[key]; if (c && Date.now() - c.t < maxAgeMs) return c.data;
  const data = await fetcher(); GH.cache[key] = { t: Date.now(), data }; return data;
}
const ghBust = prefix => { for (const k of Object.keys(GH.cache)) if (k.startsWith(prefix)) delete GH.cache[k]; };

/* ---- mapping between Writer's Box drafts and Git branches ---- */
const isRemote = p => !!(p && p.remote);
const repoPath = p => `/repos/${enc_(p.remote.owner)}/${enc_(p.remote.repo)}`;
const remoteBranch = (p, local) => local === "main" ? (p.remote.def || "main") : local;
const localDraft = (p, remote) => remote === (p.remote.def || "main") ? "main" : remote;
const SUPPORTED_REMOTE = path => kindOf(path) !== "text" || TEXT_EXT.includes(extOf(path));
async function decodeRemote(path, u8) {
  const k = kindOf(path), ext = extOf(path);
  if (k === "docx") return { text: await docxToText(u8), orig: b64.from(u8) };
  if (ext === "xlsx") return { text: await xlsxToText(u8), orig: b64.from(u8) };
  if (ext === "csv" || ext === "tsv") { const name = path.split("/").pop().replace(/\.[^.]+$/, ""); return { text: sheetsToText([{ name, rows: parseDelimited(dec.decode(u8).replace(/^﻿/, ""), ext === "csv" ? "," : "\t") }]), orig: b64.from(u8) }; }
  return { text: dec.decode(u8).replace(/^﻿/, "").replace(/\r\n?/g, "\n"), orig: null };
}

/* ---- sync: pull branches, commits, trees and blobs into the local model ---- */
async function syncProject(p, progress = () => {}) {
  const R = repoPath(p);
  const info = await gh(R);
  Object.assign(p.remote, { def: info.default_branch, private: info.private, htmlUrl: info.html_url, ownerAvatar: info.owner && info.owner.avatar_url, permissions: info.permissions || {} });
  if (!p.description && info.description) p.description = info.description;
  progress("Reading drafts…");
  const branches = await gh(`${R}/branches?per_page=100`);
  branches.sort((a, b) => (a.name === info.default_branch ? -1 : b.name === info.default_branch ? 1 : a.name.localeCompare(b.name)));
  const meta = {}, firstBranch = {};
  for (const br of branches) {
    progress(`Reading history of ${localDraft(p, br.name)}…`);
    const list = await gh(`${R}/commits?sha=${enc_(br.name)}&per_page=60`);
    for (const c of list) { meta[c.sha] = c; if (!(c.sha in firstBranch)) firstBranch[c.sha] = br.name; }
  }
  const need = Object.values(meta).filter(c => !p.versions[c.sha] || !p.versions[c.sha].treeSha);
  progress(`Reading ${need.length} version${need.length === 1 ? "" : "s"}…`);
  const trees = {};
  await pool([...new Set(need.map(c => c.commit.tree.sha))], 6, async sha => {
    const t = await gh(`${R}/git/trees/${sha}?recursive=1`);
    trees[sha] = t.tree.filter(e => e.type === "blob" && SUPPORTED_REMOTE(e.path) && (e.size || 0) < 15e6);
  });
  const blobs = new Map();
  for (const sha of Object.keys(trees)) for (const e of trees[sha]) if (!p.blobs[e.sha] && !blobs.has(e.sha)) blobs.set(e.sha, e.path);
  let done = 0;
  await pool([...blobs.entries()], 6, async ([sha, path]) => {
    const b = await gh(`${R}/git/blobs/${sha}`);
    try { p.blobs[sha] = await decodeRemote(path, b64.to((b.content || "").replace(/\s/g, ""))); }
    catch (e) { p.blobs[sha] = { text: "(This file couldn't be read: " + e.message + ")", orig: null }; }
    if (++done % 5 === 0) progress(`Reading files ${done}/${blobs.size}…`);
  });
  for (const c of need) {
    const ps = c.parents.map(x => x.sha);
    p.versions[c.sha] = {
      parent: ps[0] && meta[ps[0]] ? ps[0] : (ps[0] && p.versions[ps[0]] ? ps[0] : null), parent2: ps[1] || undefined,
      tree: Object.fromEntries(trees[c.commit.tree.sha].map(e => [e.path, e.sha])), treeSha: c.commit.tree.sha,
      message: c.commit.message.split("\n")[0], body: c.commit.message.split("\n").slice(1).join("\n").trim(),
      time: Date.parse((c.commit.author || c.commit.committer).date), draft: localDraft(p, firstBranch[c.sha]),
      author: (c.commit.author && c.commit.author.name) || "", login: c.author && c.author.login, avatar: c.author && c.author.avatar_url
    };
  }
  p.drafts = {}; for (const br of branches) p.drafts[localDraft(p, br.name)] = br.commit.sha;
  if (!p.drafts.main) p.drafts.main = null;
  try { const tags = await gh(`${R}/tags?per_page=100`); p.milestones = {}; for (const t of tags) if (p.versions[t.commit.sha]) p.milestones[t.name] = t.commit.sha; } catch (e) { /* tags are optional */ }
  if (!(p.current in p.drafts)) p.current = "main";
  const moved = p.remote.syncedHead && p.remote.syncedHead !== p.drafts[p.current];
  if (!changedPathsAgainst(p, p.remote.syncedHead).length || !p.remote.syncedHead) loadWorking(p, p.drafts[p.current]);
  p.remote.syncedHead = p.drafts[p.current]; p.remote.syncedAt = Date.now();
  return { moved };
}
function changedPathsAgainst(p, vid) {
  if (!vid || !p.versions[vid]) return Object.keys(p.working);
  const tree = p.versions[vid].tree, out = [];
  for (const path of new Set([...Object.keys(tree), ...Object.keys(p.working)])) { const w = p.working[path]; if (!w || !tree[path] || blobText(p, tree[path]) !== w.text) out.push(path); }
  return out;
}

/* ---- remote writes ---- */
async function uploadBlob(p, path, f) {
  const bytes = await bytesOf(p, path, f);
  const b = await gh(`${repoPath(p)}/git/blobs`, { method: "POST", body: { content: b64.from(bytes), encoding: "base64" } });
  if (!p.blobs[b.sha]) p.blobs[b.sha] = { text: f.text, orig: kindOf(path) === "text" ? null : b64.from(bytes) };
  return b.sha;
}
async function saveVersionRemote(p, message) {
  const R = repoPath(p), head = headId(p), hv = head && p.versions[head];
  if (!hv) throw new Error("Sync this project before saving.");
  const entries = [], tree = {};
  for (const path of Object.keys(p.working).sort()) {
    const f = p.working[path], prev = hv.tree[path], pb = prev && p.blobs[prev];
    if (pb && pb.text === f.text && (pb.orig || null) === (f.orig || null)) { tree[path] = prev; continue; }
    tree[path] = await uploadBlob(p, path, f);
    entries.push({ path, mode: "100644", type: "blob", sha: tree[path] });
  }
  for (const path of Object.keys(hv.tree)) if (!p.working[path]) entries.push({ path, mode: "100644", type: "blob", sha: null });
  if (!entries.length) throw new Error("Nothing has changed since the last version.");
  const t = await gh(`${R}/git/trees`, { method: "POST", body: { base_tree: hv.treeSha, tree: entries } });
  const c = await gh(`${R}/git/commits`, { method: "POST", body: { message, tree: t.sha, parents: [head] } });
  await gh(`${R}/git/refs/heads/${refPath(remoteBranch(p, p.current))}`, { method: "PATCH", body: { sha: c.sha } });
  p.versions[c.sha] = { parent: head, tree, treeSha: t.sha, message, time: Date.now(), draft: p.current, author: GH.user.name || GH.user.login, login: GH.user.login, avatar: GH.user.avatar_url };
  p.drafts[p.current] = c.sha; p.remote.syncedHead = c.sha; ghBust("act:");
  return c.sha;
}
const createBranchRemote = (p, name, sha) => gh(`${repoPath(p)}/git/refs`, { method: "POST", body: { ref: "refs/heads/" + name, sha } });
const deleteBranchRemote = (p, name) => gh(`${repoPath(p)}/git/refs/heads/${refPath(name)}`, { method: "DELETE" });
const createTagRemote = (p, name, sha) => gh(`${repoPath(p)}/git/refs`, { method: "POST", body: { ref: "refs/tags/" + name, sha } });
const deleteTagRemote = (p, name) => gh(`${repoPath(p)}/git/refs/tags/${refPath(name)}`, { method: "DELETE" });
const fastForwardRemote = (p, draft, sha) => gh(`${repoPath(p)}/git/refs/heads/${refPath(remoteBranch(p, draft))}`, { method: "PATCH", body: { sha } });
const tagName = s => s.trim().replace(/\s+/g, "-").replace(/[~^:?*[\\]|\.\.|@\{/g, "").replace(/^[-.]+|[.]+$|\.lock$/g, "") || "milestone";

/* ---- publish a local project as a new GitHub repository, history included ---- */
async function publishProject(p, { name, description, isPrivate }, progress = () => {}) {
  progress("Creating the repository…");
  const repo = await gh("/user/repos", { method: "POST", body: { name, description: description || "", private: !!isPrivate, auto_init: true, has_issues: true } });
  const R = `/repos/${enc_(repo.owner.login)}/${enc_(repo.name)}`;
  try { await gh(`${R}/topics`, { method: "PUT", body: { names: ["writers-box"] } }); } catch (e) { /* topic is a nicety */ }
  const init = (await gh(`${R}/commits?per_page=1`))[0];
  const initTree = init.commit.tree.sha, def = repo.default_branch;
  const tmp = { remote: { owner: repo.owner.login, repo: repo.name, def }, blobs: {} };
  const keyPath = new Map();
  for (const v of Object.values(p.versions)) for (const [path, k] of Object.entries(v.tree)) if (!keyPath.has(k)) keyPath.set(k, path);
  const shaOf = {}; let n = 0;
  progress(`Uploading ${keyPath.size} file version${keyPath.size === 1 ? "" : "s"}…`);
  await pool([...keyPath.entries()], 4, async ([k, path]) => {
    shaOf[k] = await uploadBlob(tmp, path, p.blobs[k]);
    if (++n % 5 === 0) progress(`Uploading files ${n}/${keyPath.size}…`);
  });
  const ids = Object.keys(p.versions).sort((a, b) => p.versions[a].time - p.versions[b].time);
  const map = {}, who = { name: GH.user.name || GH.user.login, email: `${GH.user.id}+${GH.user.login}@users.noreply.github.com` };
  let i = 0;
  for (const id of ids) {
    const v = p.versions[id];
    progress(`Writing version ${++i} of ${ids.length}: ${v.message}`);
    const t = await gh(`${R}/git/trees`, { method: "POST", body: { base_tree: initTree, tree: Object.entries(v.tree).map(([path, k]) => ({ path, mode: "100644", type: "blob", sha: shaOf[k] })) } });
    // Root versions start history themselves (GitHub's placeholder "Initial commit" is dropped; its README is kept via base_tree).
    const parents = v.parent && map[v.parent] ? [map[v.parent]] : []; if (v.parent2 && map[v.parent2]) parents.push(map[v.parent2]);
    const when = new Date(v.time).toISOString();
    const c = await gh(`${R}/git/commits`, { method: "POST", body: { message: v.message, tree: t.sha, parents, author: { ...who, date: when }, committer: { ...who, date: when } } });
    map[id] = c.sha;
  }
  progress("Linking drafts and milestones…");
  for (const [draft, head] of Object.entries(p.drafts)) {
    if (!head || !map[head]) continue;
    if (draft === "main") await gh(`${R}/git/refs/heads/${refPath(def)}`, { method: "PATCH", body: { sha: map[head], force: true } });
    else await gh(`${R}/git/refs`, { method: "POST", body: { ref: "refs/heads/" + draft, sha: map[head] } });
  }
  for (const [ms, vid] of Object.entries(p.milestones)) if (map[vid]) { try { await gh(`${R}/git/refs`, { method: "POST", body: { ref: "refs/tags/" + tagName(ms), sha: map[vid] } }); } catch (e) { /* duplicate name */ } }
  const working = p.working;
  p.remote = { owner: repo.owner.login, repo: repo.name, def, private: repo.private, htmlUrl: repo.html_url };
  p.versions = {}; p.blobs = {}; p.milestones = {};
  if (p.name !== repo.name && !p.name.includes("/")) p.name = p.name || repo.name;
  progress("Reading it back from GitHub…");
  await syncProject(p, progress);
  // Keep unsaved edits, on top of what GitHub now has (e.g. the README it created).
  p.working = { ...p.working, ...working };
  return repo;
}

/* ---- open (clone) a GitHub repository as a project ---- */
async function cloneRepo(owner, repo, progress = () => {}) {
  const p = newProject(repo);
  p.remote = { owner, repo };
  await syncProject(p, progress);
  loadWorking(p, p.drafts[p.current]);
  p.remote.syncedHead = p.drafts[p.current];
  return p;
}

/* ---- reviews (pull requests) & notes (issues) ---- */
const listPulls = (p, state = "open") => ghCached(`pr:${p.id}:${state}`, () => gh(`${repoPath(p)}/pulls?state=${state}&per_page=50&sort=updated&direction=desc`), 30000);
const listNotes = (p, state = "open") => ghCached(`is:${p.id}:${state}`, async () => (await gh(`${repoPath(p)}/issues?state=${state}&per_page=100`)).filter(x => !x.pull_request), 30000);
const WRITING_LABELS = [["revision", "fbca04", "Text to rework"], ["citation", "0e8a16", "Sources and references"], ["reviewer feedback", "5319e7", "Comments from a reviewer"], ["typo", "d93f0b", "Spelling, grammar, small fixes"], ["idea", "1d76db", "Something to add or explore"]];
async function ensureLabels(p) {
  const have = await gh(`${repoPath(p)}/labels?per_page=100`); const names = new Set(have.map(l => l.name.toLowerCase()));
  for (const [name, color, description] of WRITING_LABELS) if (!names.has(name)) { try { have.push(await gh(`${repoPath(p)}/labels`, { method: "POST", body: { name, color, description } })); } catch (e) { /* no permission */ } }
  return have;
}

/* ---- tiny Markdown renderer for review and note bodies ---- */
function mdLite(src) {
  const inline = s => esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/(^|\s)@([A-Za-z0-9-]+)/g, '$1<strong>@$2</strong>');
  const out = []; let list = null, quote = [];
  const flushQ = () => { if (quote.length) { out.push(`<blockquote>${quote.map(inline).join("<br>")}</blockquote>`); quote = []; } };
  const flushL = () => { if (list) { out.push(`<${list.t}>${list.items.map(i => `<li>${i}</li>`).join("")}</${list.t}>`); list = null; } };
  for (const line of String(src || "").replace(/\r\n?/g, "\n").split("\n")) {
    let m;
    if ((m = /^>\s?(.*)$/.exec(line))) { flushL(); quote.push(m[1]); continue; }
    flushQ();
    if ((m = /^\s*[-*]\s+\[( |x)\]\s+(.*)$/i.exec(line))) { if (!list || list.t !== "ul") { flushL(); list = { t: "ul", items: [] }; } list.items.push(`<input type="checkbox" disabled ${m[1].toLowerCase() === "x" ? "checked" : ""}> ${inline(m[2])}`); continue; }
    if ((m = /^\s*[-*]\s+(.*)$/.exec(line))) { if (!list || list.t !== "ul") { flushL(); list = { t: "ul", items: [] }; } list.items.push(inline(m[1])); continue; }
    if ((m = /^\s*\d+\.\s+(.*)$/.exec(line))) { if (!list || list.t !== "ol") { flushL(); list = { t: "ol", items: [] }; } list.items.push(inline(m[1])); continue; }
    flushL();
    if ((m = /^(#{1,6})\s+(.*)$/.exec(line))) { out.push(`<h${Math.min(6, m[1].length + 2)}>${inline(m[2])}</h${Math.min(6, m[1].length + 2)}>`); continue; }
    if (line.trim()) out.push(`<p>${inline(line)}</p>`);
  }
  flushQ(); flushL();
  return out.join("") || `<p class="muted"><em>No description provided.</em></p>`;
}
