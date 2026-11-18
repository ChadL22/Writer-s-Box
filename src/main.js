
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
  S.pid = S.projects[0].id; resetSel();
  const h = location.hash.slice(1);
  S.route = ROUTES.includes(h) ? h : "home";
  // Start history at Home, so Back from any screen you land on stays in Writer's Box.
  try { const want = S.route; S.route = "home"; history.replaceState(navState(), "", "#home"); S.route = want; if (want !== "home") history.pushState(navState(), "", navHash()); } catch (e) { /* ignore */ }
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
