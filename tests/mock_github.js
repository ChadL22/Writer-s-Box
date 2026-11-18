/* In-memory stand-in for the parts of the GitHub REST API that Writer's Box uses.
   Loaded into the test browser before the app; it intercepts fetch() calls to api.github.com. */
(() => {
  const USER = { login: "writer-test", id: 4242, name: "Test Writer", avatar_url: null, html_url: "https://github.com/writer-test", bio: "Writes policy memos.", location: "Philadelphia" };
  const repos = {};
  let seq = 0;
  const sha = () => { let s = ""; for (let i = 0; i < 40; i++) s += "0123456789abcdef"[Math.floor(Math.random() * 16)]; return s; };
  const now = () => new Date(Date.now() + (seq++)).toISOString();
  const json = (body, status = 200) => new Response(status === 204 ? null : JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
  const fail = (status, message, errors) => json({ message, errors }, status);
  const b64len = b => Math.floor(b.replace(/=+$/, "").length * 3 / 4);

  function makeRepo(name, opts) {
    const r = { name, full_name: `${USER.login}/${name}`, owner: { login: USER.login, avatar_url: null }, private: !!opts.private, description: opts.description || "",
      default_branch: "main", html_url: `https://github.com/${USER.login}/${name}`, topics: [], permissions: { admin: true, push: true, pull: true },
      pushed_at: now(), updated_at: now(), blobs: {}, trees: {}, commits: {}, refs: {}, issues: [], comments: {}, reviews: {}, labels: [], collaborators: [{ login: USER.login, avatar_url: null, role_name: "admin" }], next: 1 };
    if (opts.auto_init) {
      const content = btoa(`# ${name}\n`), b = sha(); r.blobs[b] = { content, size: b64len(content) };
      const t = sha(); r.trees[t] = { "README.md": b };
      const c = sha(); r.commits[c] = { tree: t, parents: [], message: "Initial commit", author: { name: USER.name, date: now() } };
      r.refs["heads/main"] = c;
    }
    repos[r.full_name.toLowerCase()] = r; return r;
  }
  const pub = r => ({ name: r.name, full_name: r.full_name, owner: r.owner, private: r.private, description: r.description, default_branch: r.default_branch, html_url: r.html_url, topics: r.topics, permissions: r.permissions, pushed_at: r.pushed_at, updated_at: r.updated_at });
  const commitJson = (r, s) => { const c = r.commits[s]; return { sha: s, commit: { message: c.message, author: c.author, committer: c.author, tree: { sha: c.tree } }, parents: c.parents.map(p => ({ sha: p })), author: { login: USER.login, avatar_url: null } }; };
  function reachable(r, start, n) {
    const seen = new Set(), out = [], stack = [start];
    while (stack.length) { const s = stack.pop(); if (!s || seen.has(s) || !r.commits[s]) continue; seen.add(s); out.push(s); stack.push(...r.commits[s].parents); }
    return out.sort((a, b) => Date.parse(r.commits[b].author.date) - Date.parse(r.commits[a].author.date)).slice(0, n);
  }
  const isAncestor = (r, a, b) => reachable(r, b, 1e6).includes(a);
  const prJson = (r, i) => ({ number: i.number, title: i.title, body: i.body, state: i.state, user: { login: USER.login, avatar_url: null }, html_url: `${r.html_url}/pull/${i.number}`,
    created_at: i.created_at, updated_at: i.updated_at, closed_at: i.closed_at || null, merged_at: i.merged_at || null, mergeable: true,
    head: { ref: i.head, sha: r.refs["heads/" + i.head] || i.headSha }, base: { ref: i.base, sha: r.refs["heads/" + i.base] }, requested_reviewers: i.reviewers || [] });
  const issueJson = (r, i) => ({ number: i.number, title: i.title, body: i.body, state: i.state, user: { login: USER.login, avatar_url: null }, html_url: `${r.html_url}/issues/${i.number}`,
    created_at: i.created_at, updated_at: i.updated_at, closed_at: i.closed_at || null, labels: i.labels, comments: (r.comments[i.number] || []).length, ...(i.pr ? { pull_request: {} } : {}) });

  async function handle(method, path, q, body) {
    let m;
    if (path === "/user" && method === "GET") return json(USER);
    if (path === "/user/repos" && method === "GET") return json(Object.values(repos).map(pub));
    if (path === "/user/repos" && method === "POST") {
      if (repos[`${USER.login}/${body.name}`.toLowerCase()]) return fail(422, "Repository creation failed.", [{ message: "name already exists on this account" }]);
      return json(pub(makeRepo(body.name, body)), 201);
    }
    if (!(m = /^\/repos\/([^/]+)\/([^/]+)(\/.*)?$/.exec(path))) return fail(404, "Not Found");
    const r = repos[`${decodeURIComponent(m[1])}/${decodeURIComponent(m[2])}`.toLowerCase()]; if (!r) return fail(404, "Not Found");
    const rest = m[3] || "";
    if (!rest && method === "GET") return json(pub(r));
    if (!rest && method === "PATCH") { if ("private" in body) r.private = body.private; if ("description" in body) r.description = body.description; return json(pub(r)); }
    if (rest === "/topics" && method === "PUT") { r.topics = body.names; return json({ names: r.topics }); }
    if (rest === "/branches") return json(Object.entries(r.refs).filter(([k]) => k.startsWith("heads/")).map(([k, s]) => ({ name: k.slice(6), commit: { sha: s } })));
    if (rest === "/tags") return json(Object.entries(r.refs).filter(([k]) => k.startsWith("tags/")).map(([k, s]) => ({ name: k.slice(5), commit: { sha: s } })));
    if (rest === "/commits") { const start = q.get("sha") ? r.refs["heads/" + q.get("sha")] : r.refs["heads/main"]; return json(reachable(r, start, +(q.get("per_page") || 30)).map(s => commitJson(r, s))); }
    if ((m = /^\/git\/trees\/([0-9a-f]+)$/.exec(rest))) { const t = r.trees[m[1]]; if (!t) return fail(404, "Not Found"); return json({ sha: m[1], tree: Object.entries(t).map(([p, s]) => ({ path: p, mode: "100644", type: "blob", sha: s, size: r.blobs[s].size })) }); }
    if ((m = /^\/git\/blobs\/([0-9a-f]+)$/.exec(rest))) { const b = r.blobs[m[1]]; if (!b) return fail(404, "Not Found"); return json({ sha: m[1], content: b.content.replace(/(.{60})/g, "$1\n"), encoding: "base64", size: b.size }); }
    if (rest === "/git/blobs" && method === "POST") { const s = sha(); r.blobs[s] = { content: body.content, size: b64len(body.content) }; return json({ sha: s }, 201); }
    if (rest === "/git/trees" && method === "POST") {
      const t = body.base_tree ? { ...r.trees[body.base_tree] } : {};
      for (const e of body.tree) { if (e.sha === null) delete t[e.path]; else { if (!r.blobs[e.sha]) return fail(422, "Invalid blob"); t[e.path] = e.sha; } }
      const s = sha(); r.trees[s] = t; return json({ sha: s }, 201);
    }
    if (rest === "/git/commits" && method === "POST") { if (!r.trees[body.tree]) return fail(422, "Invalid tree"); const s = sha(); r.commits[s] = { tree: body.tree, parents: body.parents || [], message: body.message, author: { name: (body.author && body.author.name) || USER.name, date: (body.author && body.author.date) || now() } }; return json({ sha: s, tree: { sha: body.tree } }, 201); }
    if ((m = /^\/git\/refs\/((?:heads|tags)\/.+)$/.exec(rest))) {
      const ref = decodeURIComponent(m[1]);
      if (method === "PATCH") { if (!r.refs[ref]) return fail(422, "Reference does not exist"); if (!body.force && !isAncestor(r, r.refs[ref], body.sha)) return fail(422, "Update is not a fast forward"); r.refs[ref] = body.sha; r.pushed_at = now(); return json({ ref: "refs/" + ref, object: { sha: body.sha } }); }
      if (method === "DELETE") { delete r.refs[ref]; return json(null, 204); }
    }
    if (rest === "/git/refs" && method === "POST") { const ref = body.ref.replace(/^refs\//, ""); if (r.refs[ref]) return fail(422, "Reference already exists"); r.refs[ref] = body.sha; return json({ ref: body.ref, object: { sha: body.sha } }, 201); }
    if (rest === "/pulls" && method === "GET") { const st = q.get("state") || "open"; return json(r.issues.filter(i => i.pr && (st === "all" || i.state === st)).map(i => prJson(r, i)).reverse()); }
    if (rest === "/pulls" && method === "POST") {
      if (!r.refs["heads/" + body.head]) return fail(422, "Validation Failed", [{ message: "head branch not found" }]);
      const i = { number: r.next++, pr: true, title: body.title, body: body.body || "", head: body.head, base: body.base, state: "open", created_at: now(), updated_at: now(), labels: [] };
      r.issues.push(i); return json(prJson(r, i), 201);
    }
    if ((m = /^\/pulls\/(\d+)(\/.*)?$/.exec(rest))) {
      const i = r.issues.find(x => x.pr && x.number === +m[1]); if (!i) return fail(404, "Not Found"); const sub = m[2] || "";
      if (!sub && method === "GET") return json(prJson(r, i));
      if (!sub && method === "PATCH") { i.state = body.state; i.closed_at = now(); return json(prJson(r, i)); }
      if (sub === "/requested_reviewers") { i.reviewers = body.reviewers.map(l => ({ login: l, avatar_url: null })); return json(prJson(r, i), 201); }
      if (sub === "/reviews" && method === "GET") return json(r.reviews[i.number] || []);
      if (sub === "/reviews" && method === "POST") {
        if (body.event === "APPROVE" || body.event === "REQUEST_CHANGES") return fail(422, "Unprocessable Entity", [{ message: `Can not ${body.event === "APPROVE" ? "approve" : "request changes on"} your own pull request` }]);
        (r.reviews[i.number] = r.reviews[i.number] || []).push({ user: { login: USER.login, avatar_url: null }, state: "COMMENTED", body: body.body, submitted_at: now() }); return json({}, 200);
      }
      if (sub === "/merge" && method === "PUT") {
        const base = r.refs["heads/" + i.base], head = r.refs["heads/" + i.head];
        let merged;
        if (isAncestor(r, base, head)) merged = head;
        else { merged = sha(); r.commits[merged] = { tree: r.commits[head].tree, parents: [base, head], message: body.commit_title || "Merge", author: { name: USER.name, date: now() } }; }
        r.refs["heads/" + i.base] = merged; i.state = "closed"; i.merged_at = now(); i.closed_at = i.merged_at; i.headSha = head;
        return json({ merged: true, sha: merged });
      }
    }
    if (rest === "/issues" && method === "GET") { const st = q.get("state") || "open"; return json(r.issues.filter(i => st === "all" || i.state === st).map(i => issueJson(r, i)).reverse()); }
    if (rest === "/issues" && method === "POST") { const i = { number: r.next++, title: body.title, body: body.body || "", state: "open", created_at: now(), updated_at: now(), labels: (body.labels || []).map(n => r.labels.find(l => l.name === n) || { name: n, color: "8c959f" }) }; r.issues.push(i); return json(issueJson(r, i), 201); }
    if ((m = /^\/issues\/(\d+)(\/comments)?$/.exec(rest))) {
      const i = r.issues.find(x => x.number === +m[1]); if (!i) return fail(404, "Not Found");
      if (m[2] && method === "GET") return json(r.comments[i.number] || []);
      if (m[2] && method === "POST") { (r.comments[i.number] = r.comments[i.number] || []).push({ user: { login: USER.login, avatar_url: null }, body: body.body, created_at: now() }); i.updated_at = now(); return json({}, 201); }
      if (method === "GET") return json(issueJson(r, i));
      if (method === "PATCH") { if (body.state) { i.state = body.state; i.closed_at = body.state === "closed" ? now() : null; } if (body.labels) i.labels = body.labels.map(n => r.labels.find(l => l.name === n) || { name: n, color: "8c959f" }); i.updated_at = now(); return json(issueJson(r, i)); }
    }
    if (rest === "/labels" && method === "GET") return json(r.labels);
    if (rest === "/labels" && method === "POST") { const l = { name: body.name, color: body.color, description: body.description }; r.labels.push(l); return json(l, 201); }
    if (rest === "/collaborators") return json(r.collaborators);
    if (rest === "/invitations") return json(r.invites || []);
    if ((m = /^\/collaborators\/([^/]+)$/.exec(rest))) {
      const who = decodeURIComponent(m[1]);
      if (method === "PUT") { (r.invites = r.invites || []).push({ invitee: { login: who, avatar_url: null } }); return json({}, 201); }
      if (method === "DELETE") { r.collaborators = r.collaborators.filter(c => c.login !== who); return json(null, 204); }
    }
    return fail(404, `Mock has no route for ${method} ${path}`);
  }
  const realFetch = window.fetch.bind(window);
  window.__mockGitHub = { repos, USER, calls: [] };
  window.fetch = async (url, opts = {}) => {
    const u = new URL(typeof url === "string" ? url : url.url, location.href);
    if (u.hostname !== "api.github.com") return realFetch(url, opts);
    const method = (opts.method || "GET").toUpperCase(), body = opts.body ? JSON.parse(opts.body) : null;
    window.__mockGitHub.calls.push(method + " " + u.pathname);
    if (!/Bearer \S+/.test((opts.headers || {}).Authorization || "")) return fail(401, "Requires authentication");
    return handle(method, u.pathname, u.searchParams, body);
  };
})();
