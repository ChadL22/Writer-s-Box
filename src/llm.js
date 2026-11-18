
/* ============ AI through OpenRouter ============
   Optional. Used to read style guides (web pages, PDFs) and to describe another paper's structure.
   The writer connects their own OpenRouter account (one click, OAuth PKCE) or pastes a key.
   The key is stored only in this browser. Text is sent to OpenRouter and the chosen model only when the writer asks. */
const OR_KEY = "wb.or.key", OR_MODEL = "wb.or.model", OR_VERIFIER = "wb.or.verifier";
const OR_DEFAULT_MODEL = "openrouter/auto";
const llmKey = () => { try { return localStorage.getItem(OR_KEY) || ""; } catch (e) { return ""; } };
const llmModel = () => { try { return localStorage.getItem(OR_MODEL) || OR_DEFAULT_MODEL; } catch (e) { return OR_DEFAULT_MODEL; } };
const llmConnected = () => !!llmKey();
const llmSetKey = k => { try { k ? localStorage.setItem(OR_KEY, k) : localStorage.removeItem(OR_KEY); } catch (e) { /* ignore */ } };
const b64url = u8 => btoa(String.fromCharCode(...u8)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const orCallback = () => location.origin + location.pathname;
const orCanConnect = () => location.protocol === "https:" && !inClaudeViewer();

async function llmConnect() {
  if (!orCanConnect()) throw new Error(inClaudeViewer() ? "Connecting OpenRouter works on your hosted Writer's Box site, not inside Claude's preview." : "Connecting OpenRouter needs the site to be served over https.");
  const verifier = b64url(crypto.getRandomValues(new Uint8Array(48)));
  const challenge = b64url(new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(verifier))));
  sessionStorage.setItem(OR_VERIFIER, verifier);
  location.href = `https://openrouter.ai/auth?callback_url=${encodeURIComponent(orCallback())}&code_challenge=${challenge}&code_challenge_method=S256`;
}
/* Called at start-up: finishes the connection when OpenRouter sends the writer back with ?code= */
async function llmFinishConnect() {
  const u = new URL(location.href), code = u.searchParams.get("code"), verifier = sessionStorage.getItem(OR_VERIFIER);
  if (!code || !verifier) return false;
  sessionStorage.removeItem(OR_VERIFIER); u.searchParams.delete("code");
  try { history.replaceState(history.state, "", u.pathname + (u.search || "") + u.hash); } catch (e) { /* ignore */ }
  try {
    const r = await fetch("https://openrouter.ai/api/v1/auth/keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, code_verifier: verifier, code_challenge_method: "S256" }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.key) throw new Error((j.error && j.error.message) || "OpenRouter didn't return a key.");
    llmSetKey(j.key); toast("OpenRouter connected."); return true;
  } catch (e) { toast("Couldn't connect OpenRouter: " + e.message); return false; }
}

/* One chat completion. parts: array of strings or {file, name, mime} (PDFs are sent as files). Returns the reply text. */
async function llmChat({ system, parts, json = false, fetchUrls = false, maxTokens = 4000 }) {
  if (!llmConnected()) throw new Error("Connect OpenRouter in Settings › Connections to use AI features.");
  if (liveBlocked()) throw new Error("AI features work on your hosted Writer's Box site, not inside Claude's preview.");
  const content = [];
  for (const x of parts) {
    if (typeof x === "string") content.push({ type: "text", text: x });
    else content.push({ type: "file", file: { filename: x.name || "document.pdf", file_data: `data:${x.mime || "application/pdf"};base64,${b64.from(x.file)}` } });
  }
  const body = { model: llmModel(), max_tokens: maxTokens, messages: [...(system ? [{ role: "system", content: system }] : []), { role: "user", content }] };
  if (json) body.response_format = { type: "json_object" };
  if (fetchUrls) body.tools = [{ type: "openrouter:web_fetch", parameters: { max_uses: 4 } }];
  const call = async b => {
    let r;
    try { r = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers: { Authorization: "Bearer " + llmKey(), "Content-Type": "application/json", "HTTP-Referer": location.origin, "X-Title": "Writer's Box" }, body: JSON.stringify(b) }); }
    catch (e) { throw new Error("Couldn't reach OpenRouter. Check your connection."); }
    const j = await r.json().catch(() => ({}));
    if (r.status === 401) { throw Object.assign(new Error("OpenRouter didn't accept the key. Reconnect in Settings › Connections."), { status: 401 }); }
    if (r.status === 402) throw new Error("Your OpenRouter account is out of credits.");
    if (!r.ok) throw Object.assign(new Error((j.error && j.error.message) || `OpenRouter error ${r.status}.`), { status: r.status });
    const msg = j.choices && j.choices[0] && j.choices[0].message;
    const text = msg && (typeof msg.content === "string" ? msg.content : Array.isArray(msg.content) ? msg.content.map(c => c.text || "").join("") : "");
    if (!text) throw new Error("The model returned an empty answer. Try again or pick another model.");
    return text;
  };
  try { return await call(body); }
  catch (e) { if (json && e.status === 400) { delete body.response_format; return call(body); } throw e; }
}
function parseJsonLoose(text) {
  const t = text.replace(/^\s*```(?:json)?/i, "").replace(/```\s*$/, "").trim();
  try { return JSON.parse(t); } catch (e) { /* fall through */ }
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  if (a >= 0 && b > a) { try { return JSON.parse(t.slice(a, b + 1)); } catch (e) { /* fall through */ } }
  throw new Error("The model's answer wasn't in the expected format. Try again, or pick a different model in Settings › Connections.");
}
async function llmJSON(opts) { return parseJsonLoose(await llmChat({ ...opts, json: true })); }

/* Settings › Connections row and setup dialog */
function llmSettingsRow() {
  return `<div class="Box-row"><div class="grow"><strong>OpenRouter (AI)</strong><div class="muted">${llmConnected() ? `Connected · model <span class="mono">${esc(llmModel())}</span>. Used only when you ask: reading style guides and describing another paper's structure.` : "Not connected. Optional: lets Writer's Box read style guides from websites and PDFs, and copy the structure of another paper."}</div></div><button class="btn btn-sm" id="st-llm">${llmConnected() ? "Manage" : "Connect"}</button></div>`;
}
function llmSetupFlow(after) {
  modal({
    title: "OpenRouter (AI)",
    body: `<p class="muted" style="margin-top:0">OpenRouter gives one account access to many AI models. Writer's Box uses it only when you ask it to read a style guide or another paper. That text goes to OpenRouter and the model you choose. Your key stays in this browser.</p>
      ${llmConnected() ? `<div class="flash info">${ic("check")}<span>Connected.</span><span class="grow"></span><button class="btn btn-sm btn-danger" id="or-off">Disconnect</button></div>` : `
      <div class="Box"><div class="Box-row"><div class="grow"><strong>Connect your account</strong><div class="muted" style="font-size:12px">Sign in on OpenRouter and come straight back. ${orCanConnect() ? "" : "Works on your hosted site."}</div></div><button class="btn btn-sm btn-primary" id="or-go" ${orCanConnect() ? "" : "disabled"}>Connect OpenRouter</button></div>
      <div class="Box-row"><div class="grow"><label for="or-key" style="margin:0">Or paste a key you created at openrouter.ai/keys<input type="password" id="or-key" autocomplete="off" placeholder="sk-or-…"></label></div></div></div>`}
      <label for="or-model">Model<input type="text" id="or-model" list="or-models" value="${esc(llmModel())}" style="font-family:var(--mono)"><datalist id="or-models"></datalist></label>
      <p class="muted" style="font-size:12px">"openrouter/auto" picks a model for each request. To read PDFs and web pages reliably, choose a recent model that supports tools and file input. <a href="https://openrouter.ai/models" target="_blank" rel="noopener">Browse models</a></p>
      <p class="muted" id="or-msg"></p>`,
    onOpen: ov => {
      const go_ = $("#or-go", ov); if (go_) go_.onclick = () => llmConnect().catch(e => $("#or-msg", ov).textContent = e.message);
      const off = $("#or-off", ov); if (off) off.onclick = () => { llmSetKey(""); ov.querySelector("[data-x]").click(); toast("OpenRouter disconnected."); if (after) after(); };
      if (!liveBlocked()) fetch("https://openrouter.ai/api/v1/models").then(r => r.json()).then(j => { $("#or-models", ov).innerHTML = (j.data || []).map(m => `<option value="${esc(m.id)}">${esc(m.name || "")}</option>`).join(""); }).catch(() => {});
    },
    actions: [{ label: "Cancel" }, { label: "Save", primary: true, onClick: ov => {
      const k = $("#or-key", ov); if (k && k.value.trim()) { if (!/^sk-or-/.test(k.value.trim())) { $("#or-msg", ov).textContent = "OpenRouter keys start with sk-or-."; return false; } llmSetKey(k.value.trim()); }
      const m = $("#or-model", ov).value.trim(); try { localStorage.setItem(OR_MODEL, m || OR_DEFAULT_MODEL); } catch (e) { /* ignore */ }
      toast(llmConnected() ? "OpenRouter settings saved." : "Model saved. Connect an account to use AI features."); if (after) after(); return true;
    } }]
  });
}
