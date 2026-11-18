/* In-memory stand-ins for Google Identity Services + Drive v3 and MSAL + Microsoft Graph,
   so the live-collaboration flows can be tested without real accounts. */
(() => {
  const files = {}; let n = 0, t = Date.now() - 3600e3;
  const tick = () => new Date(t += 1000).toISOString();
  const id = p => p + (++n).toString(36) + Math.random().toString(36).slice(2, 8);
  const toStr = u8 => { let s = ""; for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]); return s; };
  const toU8 = s => { const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 255; return u; };
  const json = (b, status = 200) => new Response(status === 204 ? null : JSON.stringify(b), { status, headers: { "Content-Type": "application/json" } });
  const bytesOf = async body => body instanceof Uint8Array ? body : body instanceof ArrayBuffer ? new Uint8Array(body) : typeof body === "string" ? new TextEncoder().encode(body) : new Uint8Array(await new Response(body).arrayBuffer());
  const ME = { displayName: "Test Writer", emailAddress: "writer@example.org" };
  window.__mockLive = {
    files, calls: [],
    edit(fileId, fn, by) { const f = files[fileId]; const next = fn(f.bytes); f.bytes = next; f.modifiedTime = new Date(Date.now() + 5000).toISOString(); f.lastModifyingUser = { displayName: by || "Anonymous" }; },
    comment(fileId, c) { files[fileId].comments.push({ id: id("c"), author: { displayName: c.author }, content: c.text, quotedFileContent: { value: c.quote || "" }, createdTime: new Date().toISOString(), resolved: false, replies: [] }); },
    text: fileId => new TextDecoder().decode(files[fileId].bytes)
  };
  /* sign-in libraries */
  window.google = { accounts: { oauth2: { initTokenClient: cfg => ({ requestAccessToken: () => setTimeout(() => cfg.callback({ access_token: "g-token", expires_in: 3600 }), 10) }) } } };
  window.msal = { PublicClientApplication: class { constructor(c) { this.c = c; this.acc = null; } async initialize() {} getAllAccounts() { return this.acc ? [this.acc] : []; }
    async loginPopup() { this.acc = { username: "writer@outlook.com" }; return { account: this.acc, accessToken: "m-token" }; } async acquireTokenSilent() { if (!this.acc) throw new Error("no account"); return { accessToken: "m-token" }; } } };

  async function google(method, url, opts) {
    const u = new URL(url), path = u.pathname; let m;
    if (path === "/upload/drive/v3/files" && method === "POST") {
      const s = toStr(await bytesOf(opts.body)), b = /boundary=(\S+)/.exec(opts.headers["Content-Type"])[1];
      const parts = s.split("--" + b).slice(1, -1).map(pt => { const i = pt.indexOf("\r\n\r\n"); return { head: pt.slice(0, i), body: pt.slice(i + 4).replace(/\r\n$/, "") }; });
      const meta = JSON.parse(new TextDecoder().decode(toU8(parts[0].body))), source = /Content-Type: (\S+)/.exec(parts[1].head)[1];
      const fid = id("g"); files[fid] = { provider: "google", name: meta.name, mimeType: meta.mimeType, source, bytes: toU8(parts[1].body), modifiedTime: tick(), lastModifyingUser: ME, permissions: [{ id: "owner", type: "user", role: "owner" }], comments: [] };
      return json({ id: fid, name: meta.name, mimeType: meta.mimeType, webViewLink: `https://docs.google.com/${meta.mimeType.endsWith("spreadsheet") ? "spreadsheets" : "document"}/d/${fid}/edit` });
    }
    if ((m = /^\/upload\/drive\/v3\/files\/([^/]+)$/.exec(path)) && method === "PATCH") { const f = files[m[1]]; f.bytes = await bytesOf(opts.body); f.modifiedTime = tick(); f.lastModifyingUser = ME; return json({ id: m[1] }); }
    if (!(m = /^\/drive\/v3\/files\/([^/]+)(\/.*)?$/.exec(path))) return json({ error: { message: "no route" } }, 404);
    const fid = m[1], f = files[fid], rest = m[2] || ""; if (!f) return json({ error: { message: "File not found" } }, 404);
    if (rest === "/permissions" && method === "POST") { const pm = JSON.parse(opts.body); pm.id = id("p"); f.permissions.push(pm); if (pm.emailAddress) window.__mockLive.calls.push("invite " + pm.emailAddress); return json({ id: pm.id }); }
    if (rest === "/permissions" && method === "GET") return json({ permissions: f.permissions });
    if ((m = /^\/permissions\/(.+)$/.exec(rest)) && method === "DELETE") { f.permissions = f.permissions.filter(x => x.id !== m[1]); return json(null, 204); }
    if (rest === "/export") return new Response(f.bytes, { status: 200 });
    if (rest === "/comments") return json({ comments: f.comments });
    if (!rest) return json({ modifiedTime: f.modifiedTime, lastModifyingUser: f.lastModifyingUser, webViewLink: `https://docs.google.com/document/d/${fid}/edit`, trashed: false, version: "1" });
    return json({ error: { message: "no route " + rest } }, 404);
  }
  async function graph(method, url, opts) {
    const path = decodeURIComponent(new URL(url).pathname.replace(/^\/v1\.0/, "")); let m;
    if ((m = /^\/me\/drive\/root:\/(.+):\/content$/.exec(path)) && method === "PUT") {
      const fid = id("m"), name = m[1].split("/").pop(); files[fid] = { provider: "microsoft", name, path: m[1], source: opts.headers["Content-Type"], bytes: await bytesOf(opts.body), modifiedTime: tick(), lastModifyingUser: ME, permissions: [{ id: "owner", roles: ["owner"] }], comments: [] };
      return json({ id: fid, name, webUrl: `https://onedrive.live.com/edit?id=${fid}` });
    }
    if (!(m = /^\/me\/drive\/items\/([^/]+)(\/.*)?$/.exec(path))) return json({ error: { message: "no route" } }, 404);
    const fid = m[1], f = files[fid], rest = m[2] || ""; if (!f) return json({ error: { message: "Item not found" } }, 404);
    if (rest === "/createLink") { const pm = { id: id("p"), roles: ["write"], link: { scope: "anonymous", webUrl: `https://1drv.ms/w/s!${fid}` } }; f.permissions.push(pm); return json(pm); }
    if (rest === "/invite") { const b = JSON.parse(opts.body); for (const r of b.recipients) { f.permissions.push({ id: id("p"), roles: ["write"], invitation: { email: r.email } }); window.__mockLive.calls.push("invite " + r.email); } return json({ value: [] }); }
    if (rest === "/permissions" && method === "GET") return json({ value: f.permissions });
    if ((m = /^\/permissions\/(.+)$/.exec(rest)) && method === "DELETE") { f.permissions = f.permissions.filter(x => x.id !== m[1]); return json(null, 204); }
    if (rest === "/content" && method === "GET") return new Response(f.bytes, { status: 200 });
    if (rest === "/content" && method === "PUT") { f.bytes = await bytesOf(opts.body); f.modifiedTime = tick(); f.lastModifyingUser = ME; return json({ id: fid }); }
    if (!rest) return json({ lastModifiedDateTime: f.modifiedTime, lastModifiedBy: { user: f.lastModifyingUser }, webUrl: `https://onedrive.live.com/edit?id=${fid}`, deleted: null });
    return json({ error: { message: "no route " + rest } }, 404);
  }
  const prev = window.fetch.bind(window);
  window.fetch = async (url, opts = {}) => {
    const s = typeof url === "string" ? url : url.url, host = new URL(s, location.href).hostname, method = (opts.method || "GET").toUpperCase();
    if (host === "www.googleapis.com") { if (!/Bearer g-token/.test(opts.headers && opts.headers.Authorization)) return json({ error: { message: "auth" } }, 401); return google(method, s, opts); }
    if (host === "graph.microsoft.com") { if (!/Bearer m-token/.test(opts.headers && opts.headers.Authorization)) return json({ error: { message: "auth" } }, 401); return graph(method, s, opts); }
    return prev(url, opts);
  };
})();
