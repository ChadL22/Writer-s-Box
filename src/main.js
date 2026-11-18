
/* ============ Boot ============ */
const ROUTES = ["home", "profile", "files", "history", "drafts", "reviews", "notes", "refs", "format", "live", "insights", "compare", "import", "settings"];
let autoSynced = new Set();
function autoSync() { const p = P(); if (p && isRemote(p) && ghSignedIn() && !autoSynced.has(p.id)) { autoSynced.add(p.id); syncFlow(p, true); } }
(async function boot() {
  ghLoadToken();
  const orBack = llmFinishConnect();
  await dbOpen();
  let list = [];
  try { list = (await dbAll()) || []; } catch (e) { list = []; }
  S.projects = list.sort((a, b) => a.created - b.created);
  if (!S.projects.length) { const { p } = await seedProject(); S.projects.push(p); persist(p, true); }
  // Reopen where the writer was: the same screen after a refresh (this tab's history entry),
  // otherwise the project used last (a new tab or window). The first project is only a fallback.
  const exists = id => S.projects.some(x => x.id === id);
  let saved = null; try { saved = JSON.parse(localStorage.getItem(NAV_LAST) || "null"); } catch (e) { saved = null; }
  const here = history.state && history.state.route && exists(history.state.pid) ? history.state : null;
  S.pid = here ? here.pid : saved && exists(saved.pid) ? saved.pid : S.projects[0].id; resetSel();
  const h = location.hash.slice(1);
  if (here) {
    Object.assign(S, here);
    const p = P();
    if (S.file && !p.working[S.file] && !(S.route === "version")) { S.file = null; if (S.route === "file") S.route = "files"; }
    if (S.vid && !(p.versions || {})[S.vid]) { S.vid = null; if (S.route === "version") S.route = "history"; }
    try { history.replaceState(navState(), "", navHash()); } catch (e) { /* ignore */ }
  } else {
    S.route = ROUTES.includes(h) ? h : "home";
    // Start history at Home, so Back from any screen you land on stays in Writer's Box.
    try { const want = S.route; S.route = "home"; history.replaceState(navState(), "", "#home"); S.route = want; if (want !== "home") history.pushState(navState(), "", navHash()); } catch (e) { /* ignore */ }
  }
  rememberNav();
  window.addEventListener("popstate", onNavPop);
  render();
  if (await orBack) { go("settings"); }
  if (GH.token) {
    try { GH.user = await gh("/user"); render(); autoSync(); }
    catch (e) { if (e.status === 401) { ghSignOut(); toast("Your GitHub sign-in expired. Sign in again to sync."); } render(); }
  }
  window.addEventListener("hashchange", () => { if (history.state && history.state.route) return; const v = location.hash.slice(1); if (ROUTES.includes(v)) go(v, {}, true); });
})();
</script>
</body>
</html>
