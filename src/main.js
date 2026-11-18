
/* ============ Boot ============ */
const ROUTES = ["home", "profile", "files", "history", "drafts", "reviews", "notes", "refs", "live", "insights", "compare", "import", "settings"];
let autoSynced = new Set();
function autoSync() { const p = P(); if (p && isRemote(p) && ghSignedIn() && !autoSynced.has(p.id)) { autoSynced.add(p.id); syncFlow(p, true); } }
(async function boot() {
  ghLoadToken();
  await dbOpen();
  let list = [];
  try { list = (await dbAll()) || []; } catch (e) { list = []; }
  S.projects = list.sort((a, b) => a.created - b.created);
  if (!S.projects.length) { const { p } = await seedProject(); S.projects.push(p); persist(p, true); }
  S.pid = S.projects[0].id; resetSel();
  const h = location.hash.slice(1);
  S.route = ROUTES.includes(h) ? h : "home";
  render();
  if (GH.token) {
    try { GH.user = await gh("/user"); render(); autoSync(); }
    catch (e) { if (e.status === 401) { ghSignOut(); toast("Your GitHub sign-in expired. Sign in again to sync."); } render(); }
  }
  window.addEventListener("hashchange", () => { const v = location.hash.slice(1); const tab = { file: "files", version: "history", review: "reviews", note: "notes" }[S.route] || S.route; if (ROUTES.includes(v) && v !== tab) { S.route = v; render(); } });
})();
</script>
</body>
</html>
