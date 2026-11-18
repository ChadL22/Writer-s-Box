
/* ============ Live collaboration through Google Docs and Word for the web ============
   Writer's Box puts a copy of a file in the writer's own Google Drive or OneDrive, shares it with a link
   (no account needed to edit) or with invited people, and later brings the edited document back so the
   changes can be reviewed and saved as a version. Collaborators never need a GitHub or Writer's Box account. */
const LIVE = { google: { token: null, exp: 0, user: null }, microsoft: { app: null, account: null } };
const MIME = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "text/csv", tsv: "text/tab-separated-values", md: "text/markdown", markdown: "text/markdown", text: "text/plain",
  gdoc: "application/vnd.google-apps.document", gsheet: "application/vnd.google-apps.spreadsheet"
};
const PROVIDERS = {
  google: { name: "Google", doc: "Google Docs", sheet: "Google Sheets", color: "#1a73e8" },
  microsoft: { name: "Microsoft", doc: "Word for the web", sheet: "Excel for the web", color: "#2b579a" }
};
function liveClientId(provider) {
  let v = ""; try { v = localStorage.getItem("wb.cid." + provider) || ""; } catch (e) { /* no storage */ }
  return v || (provider === "google" ? WB_CONFIG.googleClientId : WB_CONFIG.microsoftClientId) || "";
}
function setLiveClientId(provider, v) { try { if (v) localStorage.setItem("wb.cid." + provider, v.trim()); else localStorage.removeItem("wb.cid." + provider); } catch (e) { /* no storage */ } }
const liveSupports = (provider, path) => provider === "google" ? true : ["docx", "xlsx"].includes(extOf(path));
const liveTarget = (provider, path) => kindOf(path) === "sheet" ? PROVIDERS[provider].sheet : PROVIDERS[provider].doc;
function sourceMime(path) { const e = extOf(path); return MIME[e] || MIME.text; }
function liveBlocked() { return inClaudeViewer() ? "Live collaboration works on your hosted Writer's Box site (GitHub Pages), not inside Claude's preview." : ""; }

function loadScript(src, globalName) {
  return new Promise((res, rej) => {
    if (globalName.split(".").reduce((o, k) => o && o[k], window)) return res();
    const s = document.createElement("script"); s.src = src; s.async = true;
    s.onload = () => res(); s.onerror = () => rej(new Error("Couldn't load the sign-in library from " + new URL(src).host + ". Check your connection or ad blocker."));
    document.head.appendChild(s);
  });
}

/* ---------- Google (Identity Services token model + Drive v3) ---------- */
async function googleToken(interactive = true) {
  const g = LIVE.google;
  if (g.token && Date.now() < g.exp - 60000) return g.token;
  const cid = liveClientId("google");
  if (!cid) throw new Error("Google isn't set up yet. Add a Google client ID in Settings › Connections.");
  if (!interactive) throw new Error("Connect Google first.");
  await loadScript("https://accounts.google.com/gsi/client", "google.accounts.oauth2");
  return new Promise((res, rej) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: cid, scope: "https://www.googleapis.com/auth/drive.file",
      callback: r => { if (r.error) return rej(new Error("Google sign-in didn't finish: " + (r.error_description || r.error))); g.token = r.access_token; g.exp = Date.now() + (r.expires_in || 3600) * 1000; res(g.token); },
      error_callback: e => rej(new Error(e && e.type === "popup_closed" ? "The Google sign-in window was closed." : "Google sign-in failed" + (e && e.message ? ": " + e.message : ".")))
    });
    client.requestAccessToken({ prompt: "" });
  });
}
async function gapi(path, opts = {}) {
  const token = await googleToken(opts.interactive !== false);
  const url = (path.startsWith("http") ? path : "https://www.googleapis.com/drive/v3" + path);
  let res;
  try { res = await fetch(url, { method: opts.method || "GET", headers: { Authorization: "Bearer " + token, ...(opts.headers || {}) }, body: opts.body }); }
  catch (e) { throw new Error("Couldn't reach Google. Check your connection and try again."); }
  if (res.status === 204) return null;
  if (!res.ok) {
    const d = await res.json().catch(() => null), m = d && d.error && d.error.message || "";
    if (res.status === 401) { LIVE.google.token = null; throw new Error("Your Google sign-in expired. Try again to reconnect."); }
    if (res.status === 404) throw new Error("Google can't find that document. It may have been deleted, or it was created by another account.");
    throw new Error(`Google error ${res.status}${m ? ": " + m : ""}`);
  }
  return opts.raw ? res : res.json();
}
function multipart(meta, bytes, mime) {
  const b = "wbx" + Math.random().toString(36).slice(2);
  const head = enc.encode(`--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${b}\r\nContent-Type: ${mime}\r\n\r\n`);
  return { body: concatBytes([head, bytes, enc.encode(`\r\n--${b}--`)]), type: `multipart/related; boundary=${b}` };
}
const google_ = {
  async create(p, path, bytes) {
    const sheet = kindOf(path) === "sheet", base = path.split("/").pop().replace(/\.[^.]+$/, "");
    const meta = { name: `${base} (${p.remote ? p.remote.repo : p.name})`, mimeType: sheet ? MIME.gsheet : MIME.gdoc, description: "Shared from Writer's Box for live editing." };
    const mp = multipart(meta, bytes, sourceMime(path));
    const f = await gapi("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,mimeType,name", { method: "POST", headers: { "Content-Type": mp.type }, body: mp.body });
    return { fileId: f.id, url: f.webViewLink, name: f.name };
  },
  async share(rec, mode, emails, message) {
    if (mode === "link") await gapi(`/files/${rec.fileId}/permissions?fields=id`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "anyone", role: "writer", allowFileDiscovery: false }) });
    for (const email of emails) await gapi(`/files/${rec.fileId}/permissions?sendNotificationEmail=true${message ? "&emailMessage=" + encodeURIComponent(message) : ""}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "user", role: "writer", emailAddress: email }) });
  },
  async status(rec) {
    const f = await gapi(`/files/${rec.fileId}?fields=modifiedTime,lastModifyingUser(displayName,emailAddress),webViewLink,trashed,version`);
    return { modified: Date.parse(f.modifiedTime), by: f.lastModifyingUser ? (f.lastModifyingUser.displayName || f.lastModifyingUser.emailAddress) : "", url: f.webViewLink, trashed: !!f.trashed, rev: f.version };
  },
  async download(rec, path) {
    const e = extOf(path), mime = e === "docx" ? MIME.docx : e === "xlsx" ? MIME.xlsx : e === "csv" ? MIME.csv : e === "tsv" ? MIME.tsv : (e === "md" || e === "markdown") ? MIME.md : MIME.text;
    const res = await gapi(`/files/${rec.fileId}/export?mimeType=${encodeURIComponent(mime)}`, { raw: true });
    return new Uint8Array(await res.arrayBuffer());
  },
  async update(rec, path, bytes) { await gapi(`https://www.googleapis.com/upload/drive/v3/files/${rec.fileId}?uploadType=media`, { method: "PATCH", headers: { "Content-Type": sourceMime(path) }, body: bytes }); },
  async unshare(rec) { const r = await gapi(`/files/${rec.fileId}/permissions?fields=permissions(id,type,role,emailAddress)`); for (const pm of r.permissions || []) if (pm.role !== "owner") await gapi(`/files/${rec.fileId}/permissions/${pm.id}`, { method: "DELETE" }); },
  async comments(rec) {
    const r = await gapi(`/files/${rec.fileId}/comments?fields=comments(id,author(displayName),content,quotedFileContent(value),createdTime,resolved,replies(author(displayName),content))&pageSize=100`);
    return (r.comments || []).map(c => ({ id: c.id, author: c.author && c.author.displayName || "Anonymous", text: c.content, quote: c.quotedFileContent && c.quotedFileContent.value || "", time: Date.parse(c.createdTime), resolved: !!c.resolved, replies: (c.replies || []).filter(x => x.content).map(x => ({ author: x.author && x.author.displayName || "Anonymous", text: x.content })) }));
  }
};

/* ---------- Microsoft (MSAL + Graph) ---------- */
async function msToken() {
  const m = LIVE.microsoft, cid = liveClientId("microsoft");
  if (!cid) throw new Error("Microsoft isn't set up yet. Add a Microsoft client ID in Settings › Connections.");
  await loadScript("https://alcdn.msauth.net/browser/2.38.3/js/msal-browser.min.js", "msal.PublicClientApplication");
  if (!m.app || m.cid !== cid) { m.app = new msal.PublicClientApplication({ auth: { clientId: cid, authority: "https://login.microsoftonline.com/common", redirectUri: location.origin + location.pathname }, cache: { cacheLocation: "sessionStorage" } }); m.cid = cid; if (m.app.initialize) await m.app.initialize(); }
  const req = { scopes: ["Files.ReadWrite"] };
  m.account = m.account || (m.app.getAllAccounts()[0] || null);
  try { if (m.account) return (await m.app.acquireTokenSilent({ ...req, account: m.account })).accessToken; } catch (e) { /* fall through to popup */ }
  try { const r = await m.app.loginPopup(req); m.account = r.account; return r.accessToken || (await m.app.acquireTokenSilent({ ...req, account: m.account })).accessToken; }
  catch (e) { throw new Error(/cancel|closed/i.test(String(e && (e.errorCode || e.message))) ? "The Microsoft sign-in window was closed." : "Microsoft sign-in failed: " + (e && (e.errorMessage || e.message) || e)); }
}
async function graph(path, opts = {}) {
  const token = await msToken();
  let res;
  try { res = await fetch("https://graph.microsoft.com/v1.0" + path, { method: opts.method || "GET", headers: { Authorization: "Bearer " + token, ...(opts.headers || {}) }, body: opts.body }); }
  catch (e) { throw new Error("Couldn't reach Microsoft. Check your connection and try again."); }
  if (res.status === 204) return null;
  if (!res.ok) {
    const d = await res.json().catch(() => null), m = d && d.error && d.error.message || "";
    if (res.status === 404) throw new Error("OneDrive can't find that document. It may have been deleted.");
    if (res.status === 403 && /anonymous|sharing/i.test(m)) throw new Error("Your Microsoft account doesn't allow anyone-with-the-link editing (common for work accounts). Invite people by email instead.");
    throw new Error(`Microsoft error ${res.status}${m ? ": " + m : ""}`);
  }
  return opts.raw ? res : res.json();
}
const microsoft_ = {
  async create(p, path, bytes) {
    const base = path.split("/").pop(), folder = "Writer's Box/" + (p.remote ? p.remote.repo : p.name).replace(/[\\/:*?"<>|#%]/g, "-");
    const item = await graph(`/me/drive/root:/${encodeURIComponent(folder).replace(/%2F/g, "/")}/${encodeURIComponent(base)}:/content?@microsoft.graph.conflictBehavior=rename`, { method: "PUT", headers: { "Content-Type": sourceMime(path) }, body: bytes });
    return { fileId: item.id, url: item.webUrl, name: item.name };
  },
  async share(rec, mode, emails, message) {
    if (mode === "link") { const r = await graph(`/me/drive/items/${rec.fileId}/createLink`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "edit", scope: "anonymous" }) }); rec.url = r.link && r.link.webUrl || rec.url; }
    if (emails.length) await graph(`/me/drive/items/${rec.fileId}/invite`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipients: emails.map(email => ({ email })), requireSignIn: false, sendInvitation: true, roles: ["write"], message: message || "I'd like your edits on this document." }) });
  },
  async status(rec) {
    const f = await graph(`/me/drive/items/${rec.fileId}?select=lastModifiedDateTime,lastModifiedBy,webUrl,deleted`);
    const by = f.lastModifiedBy && (f.lastModifiedBy.user || f.lastModifiedBy.application || {});
    return { modified: Date.parse(f.lastModifiedDateTime), by: by && by.displayName || "", url: f.webUrl, trashed: !!f.deleted };
  },
  async download(rec) { const res = await graph(`/me/drive/items/${rec.fileId}/content`, { raw: true }); return new Uint8Array(await res.arrayBuffer()); },
  async update(rec, path, bytes) { await graph(`/me/drive/items/${rec.fileId}/content`, { method: "PUT", headers: { "Content-Type": sourceMime(path) }, body: bytes }); },
  async unshare(rec) { const r = await graph(`/me/drive/items/${rec.fileId}/permissions`); for (const pm of r.value || []) if (!(pm.roles || []).includes("owner")) await graph(`/me/drive/items/${rec.fileId}/permissions/${pm.id}`, { method: "DELETE" }); },
  async comments() { return []; }
};
const liveApi = provider => provider === "google" ? google_ : microsoft_;

/* ---------- records on the project: p.live[path] = { provider, fileId, url, name, sharedAt, sharedFrom, mode, emails, pulledAt, lastSeen } ---------- */
const liveOf = (p, path) => (p.live || {})[path];
async function shareLive(p, path, provider, mode, emails, message) {
  const f = p.working[path]; if (!f) throw new Error("That file isn't in the project.");
  const api = liveApi(provider), bytes = await bytesOf(p, path, f);
  const rec = { provider, ...(await api.create(p, path, bytes)), sharedAt: Date.now(), sharedFrom: headId(p), sharedText: f.text, mode, emails };
  await api.share(rec, mode, emails, message);
  p.live = p.live || {}; p.live[path] = rec; await persist(p, true);
  return rec;
}
async function liveStatus(p, path) {
  const rec = liveOf(p, path); const st = await liveApi(rec.provider).status(rec);
  rec.lastSeen = { ...st, at: Date.now() }; if (st.url) rec.url = st.url; persist(p);
  return st;
}
async function bringBack(p, path) {
  const rec = liveOf(p, path); const u8 = await liveApi(rec.provider).download(rec, path);
  let next;
  if (kindOf(path) === "docx") next = { text: await docxToText(u8), orig: b64.from(u8) };
  else if (extOf(path) === "xlsx") next = { text: await xlsxToText(u8), orig: b64.from(u8) };
  else if (extOf(path) === "csv" || extOf(path) === "tsv") { const name = path.split("/").pop().replace(/\.[^.]+$/, ""); next = { text: sheetsToText([{ name, rows: parseDelimited(dec.decode(u8).replace(/^﻿/, ""), extOf(path) === "csv" ? "," : "\t") }]), orig: u8 && b64.from(u8) }; }
  else next = { text: dec.decode(u8).replace(/^﻿/, "").replace(/\r\n?/g, "\n").replace(/\n+$/, "") + (p.working[path].text.endsWith("\n") ? "\n" : ""), orig: null };
  const before = p.working[path].text;
  p.working[path] = next;
  const st = await liveStatus(p, path).catch(() => null);
  rec.pulledAt = Date.now(); rec.pulledRev = st && st.modified; rec.pulledText = next.text;
  await persist(p, true);
  return { changed: before !== next.text, by: st && st.by };
}
async function pushLive(p, path) { const rec = liveOf(p, path); await liveApi(rec.provider).update(rec, path, await bytesOf(p, path, p.working[path])); rec.sharedFrom = headId(p); rec.sharedText = p.working[path].text; rec.pulledAt = Date.now(); await persist(p, true); }
async function stopLive(p, path) { const rec = liveOf(p, path); try { await liveApi(rec.provider).unshare(rec); } finally { delete p.live[path]; await persist(p, true); } }
const hasNewEdits = rec => !!(rec && rec.lastSeen && rec.lastSeen.modified > (rec.pulledAt || rec.sharedAt) + 2000);

/* ---------- UI: share dialog ---------- */
function shareLiveFlow(p, path) {
  const blocked = liveBlocked();
  const existing = liveOf(p, path);
  if (existing) return go("live");
  const options = ["google", "microsoft"].filter(pv => liveSupports(pv, path));
  modal({
    title: `Collaborate live on ${path.split("/").pop()}`,
    body: blocked ? `<div class="flash">${ic("alert")}<span>${blocked}</span></div>` : `
      <p>Writer's Box puts a copy in your own Google Drive or OneDrive and shares it. Your collaborators edit there, together and in real time, with no GitHub or Writer's Box account. When they're done, bring their changes back here to review and save them as a version.</p>
      <fieldset class="vis"><legend>Edit in</legend>
        ${["google", "microsoft"].map(pv => {
          const ok = liveSupports(pv, path), conf = !!liveClientId(pv);
          return `<label class="check prov ${ok ? "" : "dis"}"><input type="radio" name="prov" value="${pv}" ${pv === options[0] ? "checked" : ""} ${ok ? "" : "disabled"}> <span><strong>${liveTarget(pv, path)}</strong><br><span class="muted">${!ok ? "Only for Word (.docx) and Excel (.xlsx) files. Use Google for this file." : !conf ? `Needs a one-time setup: add a ${PROVIDERS[pv].name} client ID in Settings › Connections.` : pv === "google" ? (["tex", "bib", "cls", "sty"].includes(extOf(path)) ? "Opens as plain text in Google Docs, so the LaTeX stays intact." : (extOf(path) === "md" || extOf(path) === "markdown") ? "Headings, bold, lists and links become Google Docs formatting and come back as Markdown." : "Collaborators can edit, suggest and comment.") : "Collaborators edit in the browser; anyone-with-the-link may be off for work accounts."}</span></span></label>`;
        }).join("")}</fieldset>
      <fieldset class="vis"><legend>Who can edit</legend>
        <label class="check"><input type="radio" name="mode" value="link" checked> <span><strong>Anyone with the link</strong><br><span class="muted">No sign-in needed. Share the link only with people you trust.</span></span></label>
        <label class="check"><input type="radio" name="mode" value="people"> <span><strong>Only people I invite</strong><br><span class="muted">They get an email invitation.</span></span></label></fieldset>
      <label for="lv-em">Invite by email <span class="muted" style="font-weight:400">(optional with a link; separate with commas)</span><input type="text" id="lv-em" placeholder="ana@example.org, jo@example.com"></label>
      <label for="lv-msg">Message <span class="muted" style="font-weight:400">(optional)</span><input type="text" id="lv-msg" placeholder="Could you tighten the recommendation section?"></label>
      ${fileStatus(p, path) !== "clean" ? `<p class="flash">${ic("info")}<span>This file has unsaved changes. The live copy will include them.</span></p>` : ""}
      <p class="muted" id="lv-err"></p>`,
    actions: blocked ? [{ label: "Close" }] : [{ label: "Cancel" }, { label: "Share", primary: true, onClick: async ov => {
      const provider = (ov.querySelector('input[name="prov"]:checked') || {}).value, mode = ov.querySelector('input[name="mode"]:checked').value;
      const emails = $("#lv-em", ov).value.split(/[,;\s]+/).map(s => s.trim()).filter(Boolean), err = $("#lv-err", ov);
      if (!provider) { err.textContent = "Choose where to edit."; return false; }
      if (!liveClientId(provider)) { err.textContent = `Set up ${PROVIDERS[provider].name} first in Settings › Connections.`; return false; }
      if (mode === "people" && !emails.length) { err.textContent = "Add at least one email address, or choose “Anyone with the link”."; return false; }
      const bad = emails.find(e => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)); if (bad) { err.textContent = `“${bad}” doesn't look like an email address.`; return false; }
      err.innerHTML = `<span class="spinner sm"></span> Signing in to ${PROVIDERS[provider].name} and creating the live copy…`;
      try { const rec = await shareLive(p, path, provider, mode, emails, $("#lv-msg", ov).value.trim()); ov.remove(); liveLinkModal(p, path, rec); render(); return true; }
      catch (e) { err.textContent = e.message; return false; }
    } }]
  });
}
function liveLinkModal(p, path, rec) {
  modal({
    title: "Your document is live",
    body: `<p>${esc(path.split("/").pop())} is now open for editing in <strong>${esc(liveTarget(rec.provider, path))}</strong>.${rec.emails && rec.emails.length ? ` Invitations went to ${rec.emails.map(esc).join(", ")}.` : ""}</p>
      ${rec.mode === "link" ? `<label for="lv-link">Share this link<input type="text" id="lv-link" readonly value="${esc(rec.url)}"></label>` : ""}
      <p class="muted">When your collaborators are done, open the <strong>Live</strong> tab and choose <strong>Bring changes back</strong> to review their edits and save them as a version.</p>`,
    onOpen: ov => { const l = $("#lv-link", ov); if (l) l.select(); },
    actions: [...(rec.mode === "link" ? [{ label: "Copy link", keep: true, onClick: async () => { try { await navigator.clipboard.writeText(rec.url); toast("Link copied."); } catch (e) { toast("Select the link and copy it."); } } }] : []), { label: "Open it", keep: true, onClick: () => { window.open(rec.url, "_blank", "noopener"); } }, { label: "Done", primary: true }]
  });
}

/* ---------- UI: bring changes back → review in Compare ---------- */
async function bringBackFlow(p, path) {
  const rec = liveOf(p, path);
  if (fileStatus(p, path) === "modified" && rec.pulledText !== p.working[path].text && !await confirmBox("Replace your unsaved changes?", `${esc(path)} has edits you haven't saved. Bringing the live document back replaces them with the collaborators' version. Save a version first if you want to keep yours.`, "Bring changes back", true)) return;
  if (rec.sharedFrom && headId(p) && treeOf(p, headId(p))[path] && treeOf(p, rec.sharedFrom)[path] && treeOf(p, headId(p))[path] !== treeOf(p, rec.sharedFrom)[path] && blobText(p, treeOf(p, headId(p))[path]) !== rec.sharedText
      && !await confirmBox("You've saved changes since sharing", `The live document started from an earlier version of ${esc(path)}. Your later edits aren't in it, so they'll show as removed when you compare. Choose “Update live copy” first to send your version, or continue and review carefully.`, "Continue", true)) return;
  const pm = progressModal(`Bringing back ${path.split("/").pop()}`); pm.set(`Downloading from ${PROVIDERS[rec.provider].name}…`);
  try {
    const r = await bringBack(p, path); pm.close();
    if (!r.changed) { toast("No new changes in the live document."); return render(); }
    S.suggestedMsg = `Edits from ${liveTarget(rec.provider, path)}${r.by ? " (last edited by " + r.by + ")" : ""}`;
    go("compare", { cmp: { a: headId(p), b: "W" } });
    toast("Review the collaborators' changes, then save them as a version.");
  } catch (e) { pm.close(); toast(e.message); }
}

/* ---------- UI: Live tab ---------- */
function viewLive(p, el) {
  const recs = Object.entries(p.live || {}).filter(([path]) => p.working[path] || treeOf(p, headId(p))[path]);
  const blocked = liveBlocked();
  el.innerHTML = `<div class="subhead"><h2>Live documents</h2></div>
    <p class="muted" style="margin:-8px 0 16px;max-width:760px">Share a file to Google Docs or Word for the web so others can edit it together in real time, with no GitHub account. Bring their changes back to review them and save a version.</p>
    ${blocked ? `<div class="flash">${ic("alert")}<span>${blocked}</span></div>` : ""}
    ${recs.length ? recs.map(([path, rec]) => `<div class="Box live-box" data-lp="${esc(path)}">
        <div class="Box-header"><span class="srcicon" style="background:${PROVIDERS[rec.provider].color}">${fileIcon(path)}</span><div class="grow" style="min-width:0"><strong>${esc(path)}</strong><div class="muted" style="font-size:12px">${esc(liveTarget(rec.provider, path))} · ${rec.mode === "link" ? "anyone with the link can edit" : "invited people can edit"}${rec.emails && rec.emails.length ? " · " + rec.emails.map(esc).join(", ") : ""} · shared ${ago(rec.sharedAt)}</div></div>
          <span class="live-state" data-st>${rec.lastSeen ? liveStateHtml(rec) : `<span class="muted">Checking…</span>`}</span></div>
        <div class="Box-row" style="flex-wrap:wrap"><button class="btn btn-sm btn-primary" data-act="back">${ic("import")} Bring changes back</button><button class="btn btn-sm" data-act="open">Open in ${esc(PROVIDERS[rec.provider].name)}</button>${rec.mode === "link" ? `<button class="btn btn-sm" data-act="copy">Copy link</button>` : ""}<button class="btn btn-sm" data-act="push" title="Send your current text to the live document, replacing its contents">Update live copy</button><span class="grow"></span><button class="btn btn-sm btn-danger" data-act="stop">Stop sharing</button></div>
        <div class="live-comments" data-cm></div></div>`).join("")
      : `<div class="Box blankslate">${ic("people")}<h3>Nothing shared yet</h3><p class="muted" style="max-width:520px">Open a file and choose <strong>Collaborate live</strong>, or pick one here. Google Docs works for every file; Word and Excel for the web work for .docx and .xlsx.</p>
        <div class="row" style="justify-content:center">${Object.keys(p.working).sort().slice(0, 6).map(path => `<button class="btn btn-sm" data-share="${esc(path)}">${fileIcon(path)} ${esc(path)}</button>`).join("")}</div></div>`}
    <h3 class="sec-h">Connections</h3>
    <div class="Box">${["google", "microsoft"].map(pv => `<div class="Box-row"><span class="srcicon" style="background:${PROVIDERS[pv].color}">${ic(pv === "google" ? "file" : "fileWord")}</span><div class="grow"><strong>${PROVIDERS[pv].doc}${pv === "google" ? " & Sheets" : " & Excel"}</strong><div class="muted" style="font-size:12px">${liveClientId(pv) ? "Set up for this site." : "Not set up yet."} ${pv === "google" ? "Collaborators edit with just the link, or with any Google account you invite." : "Collaborators edit with just the link (personal accounts), or by email invitation."}</div></div><button class="btn btn-sm" data-conn="${pv}">${liveClientId(pv) ? "Change" : "Set up"}</button></div>`).join("")}</div>`;
  el.querySelectorAll("[data-share]").forEach(b => b.onclick = () => shareLiveFlow(p, b.dataset.share));
  el.querySelectorAll("[data-conn]").forEach(b => b.onclick = () => connectionFlow(b.dataset.conn, () => viewLive(p, el)));
  el.querySelectorAll("[data-lp]").forEach(box => {
    const path = box.dataset.lp, rec = liveOf(p, path);
    box.querySelectorAll("[data-act]").forEach(b => b.onclick = async () => {
      const a = b.dataset.act;
      if (a === "open") return window.open(rec.url, "_blank", "noopener");
      if (a === "copy") { try { await navigator.clipboard.writeText(rec.url); toast("Link copied."); } catch (e) { modal({ title: "Share this link", body: `<input type="text" readonly value="${esc(rec.url)}" onfocus="this.select()">`, actions: [{ label: "Close" }] }); } return; }
      if (a === "back") return bringBackFlow(p, path);
      if (a === "push") { if (!await confirmBox("Replace the live document?", `This sends your current text of ${esc(path)} to ${esc(liveTarget(rec.provider, path))}, replacing what's there. Bring their changes back first if you haven't.`, "Update live copy", true)) return; try { await pushLive(p, path); toast("Live copy updated."); viewLive(p, el); } catch (e) { toast(e.message); } return; }
      if (a === "stop") { if (!await confirmBox("Stop sharing?", `Collaborators will lose access to the live copy of ${esc(path)}. Bring their changes back first if you need them. The document stays in your ${rec.provider === "google" ? "Google Drive" : "OneDrive"}.`, "Stop sharing", true)) return; try { await stopLive(p, path); toast("Sharing stopped."); render(); } catch (e) { toast(e.message); render(); } }
    });
    if (blocked) return;
    liveStatus(p, path).then(() => { const s = $("[data-st]", box); if (s) s.innerHTML = liveStateHtml(rec); }).catch(e => { const s = $("[data-st]", box); if (s) s.innerHTML = `<span class="muted" title="${esc(e.message)}">Can't check right now</span>`; });
    if (rec.provider === "google") google_.comments(rec).then(cs => renderLiveComments(p, path, cs, $("[data-cm]", box))).catch(() => {});
  });
}
function liveStateHtml(rec) {
  const s = rec.lastSeen; if (!s) return "";
  if (s.trashed) return `<span class="label label-danger">Deleted in ${esc(PROVIDERS[rec.provider].name)}</span>`;
  return hasNewEdits(rec) ? `<span class="label label-attention">New edits</span> <span class="muted" style="font-size:12px">${s.by ? esc(s.by) + " · " : ""}${ago(s.modified)}</span>` : `<span class="label label-success">Up to date</span> <span class="muted" style="font-size:12px">last edit ${ago(s.modified)}</span>`;
}
function renderLiveComments(p, path, cs, mount) {
  const open = cs.filter(c => !c.resolved); if (!open.length || !mount) return;
  mount.innerHTML = `<div class="Box-row" style="display:block"><strong>${open.length} open comment${open.length > 1 ? "s" : ""} from Google Docs</strong></div>${open.map(c => `<div class="Box-row live-cmt"><span class="avatar">${esc((c.author || "A")[0].toUpperCase())}</span><div class="grow" style="min-width:0"><div><strong>${esc(c.author)}</strong> <span class="muted" style="font-size:12px">${ago(c.time)}</span></div>${c.quote ? `<blockquote class="quote">${esc(c.quote)}</blockquote>` : ""}<div>${esc(c.text)}</div>${c.replies.map(r => `<div class="muted" style="font-size:13px;margin-top:4px">↳ <strong>${esc(r.author)}</strong>: ${esc(r.text)}</div>`).join("")}</div>
      ${isRemote(p) && ghSignedIn() ? `<button class="btn btn-sm" data-note="${esc(c.id)}">Make a note</button>` : ""}</div>`).join("")}`;
  mount.querySelectorAll("[data-note]").forEach(b => b.onclick = () => { const c = open.find(x => x.id === b.dataset.note); newNoteFlow(p, { title: (c.text.split(/[.!?\n]/)[0] || "Comment from Google Docs").slice(0, 80), body: `From **${c.author}** in Google Docs, on **${path}**:\n${c.quote ? "> " + c.quote.replace(/\n/g, " ") + "\n\n" : ""}${c.text}` }); });
}
function connectionFlow(provider, after) {
  const google = provider === "google";
  modal({
    title: `Set up ${google ? "Google Docs & Sheets" : "Word & Excel for the web"}`,
    body: `<p class="muted">A one-time setup by the site owner, so Writer's Box can create shared documents in a writer's own ${google ? "Google Drive" : "OneDrive"}. Full steps are in <span class="mono">docs/live-collaboration-setup.md</span>.</p>
      <ol class="steps">${google ? `<li>In <a href="https://console.cloud.google.com/" target="_blank" rel="noopener">Google Cloud Console</a>, create a project and enable the <strong>Google Drive API</strong>.</li><li>Set up the OAuth consent screen (External) and add the scope <span class="mono">drive.file</span>.</li><li>Create an <strong>OAuth client ID</strong> of type <em>Web application</em> with this authorized JavaScript origin: <span class="mono">${esc(location.origin)}</span></li><li>Paste the client ID below.</li>`
        : `<li>In the <a href="https://entra.microsoft.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade" target="_blank" rel="noopener">Microsoft Entra admin center</a> (or Azure portal), choose <strong>App registrations › New registration</strong>.</li><li>Pick “Accounts in any organizational directory and personal Microsoft accounts”.</li><li>Add a <strong>Single-page application</strong> redirect URI: <span class="mono">${esc(location.origin + location.pathname)}</span></li><li>Copy the <strong>Application (client) ID</strong> and paste it below.</li>`}</ol>
      <label for="cid">${google ? "Google OAuth client ID" : "Microsoft Application (client) ID"}<input type="text" id="cid" value="${esc(liveClientId(provider))}" placeholder="${google ? "1234567890-abc.apps.googleusercontent.com" : "00000000-0000-0000-0000-000000000000"}" style="font-family:var(--mono)"></label>
      <p class="muted" style="font-size:12px">Client IDs are public identifiers, not passwords. To set it for everyone on your site, put it in <span class="mono">src/config.js</span> and rebuild.</p>`,
    actions: [{ label: "Cancel" }, { label: "Save", primary: true, onClick: ov => { setLiveClientId(provider, $("#cid", ov).value); if (provider === "google") LIVE.google.token = null; else LIVE.microsoft.app = null; toast("Saved."); if (after) after(); return true; } }]
  });
}
