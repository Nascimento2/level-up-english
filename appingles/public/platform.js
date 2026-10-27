/* Level Up English — versão própria (fora do Claude).
   Implementa a mesma interface que o app usava no Claude (claude.use: db, user, sample, downloads, room)
   em cima do Supabase, e mostra a tela de login antes do app abrir. */
"use strict";
window.LUE_STANDALONE = true;

(function () {
  const SB_URL = "https://uxokksplwrujsycwackx.supabase.co";
  const SB_KEY = "sb_publishable_azWIRglBqYT2hc0F31kpsQ_DdGGxJKJ";
  const GUEST_KEY = "lue-guest";
  const sb = window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  window.LUE_SB = sb;
  let session = null;

  /* ---------- tela de login ---------- */
  const e = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function loginHTML(mode, msg = "", err = "") {
    const isUp = mode === "up";
    return `<div class="auth-wrap"><div class="auth-card stack">
      <div class="row" style="justify-content:center">${typeof mascot === "function" ? mascot("mia", "wave", 72) + mascot("bolota", "wave", 96) + mascot("capi", "wave", 72) : ""}</div>
      <h1 style="text-align:center">Level Up English</h1>
      <p class="muted" style="text-align:center">${isUp ? "Crie sua conta grátis para salvar seu progresso e competir com amigos." : "Entre para continuar de onde parou."}</p>
      <div class="seg" role="tablist" style="justify-content:center"><button type="button" data-auth="in" aria-pressed="${!isUp}">Entrar</button><button type="button" data-auth="up" aria-pressed="${isUp}">Criar conta</button></div>
      <form class="stack" id="auth-form" data-mode="${isUp ? "up" : "in"}">
        <label class="field">E-mail <input type="email" id="auth-email" autocomplete="email" required inputmode="email" autocapitalize="off"></label>
        <label class="field">Senha <input type="password" id="auth-pass" autocomplete="${isUp ? "new-password" : "current-password"}" minlength="6" required></label>
        ${err ? `<p class="small" style="color:var(--bad)">${e(err)}</p>` : ""}${msg ? `<div class="notice info">${e(msg)}</div>` : ""}
        <button class="btn primary big" type="submit">${isUp ? "Criar conta" : "Entrar"}</button>
      </form>
      ${isUp ? "" : `<button type="button" class="btn ghost small" data-auth="forgot">Esqueci minha senha</button>`}
      <button type="button" class="btn ghost small" data-auth="guest">Usar sem conta (progresso só neste aparelho)</button>
      <a class="small muted" href="privacy.html" style="text-align:center">Política de Privacidade</a>
    </div></div>`;
  }
  const MSG = {
    "Invalid login credentials": "E-mail ou senha incorretos.",
    "Email not confirmed": "Confirme seu e-mail primeiro: abra o link que enviamos para a sua caixa de entrada.",
    "User already registered": "Esse e-mail já tem conta. Toque em Entrar.",
  };
  async function showLogin() {
    if (document.readyState !== "complete") await new Promise((r) => addEventListener("load", r, { once: true }));
    return new Promise((resolve) => {
      const app = document.getElementById("app");
      let mode = "in";
      const render = (m, msg, err) => { mode = m; app.innerHTML = loginHTML(m, msg, err); };
      render("in");
      app.addEventListener("click", async function onClick(ev) {
        const b = ev.target.closest("[data-auth]"); if (!b) return;
        const a = b.dataset.auth;
        if (a === "in" || a === "up") return render(a);
        if (a === "guest") { try { localStorage.setItem(GUEST_KEY, "1"); } catch {} app.removeEventListener("click", onClick); return resolve(null); }
        if (a === "forgot") {
          const em = (document.getElementById("auth-email") || {}).value || "";
          if (!em) return render("in", "", "Digite seu e-mail acima e toque de novo em Esqueci minha senha.");
          const { error } = await sb.auth.resetPasswordForEmail(em, { redirectTo: location.origin + location.pathname });
          return render("in", error ? "" : "Enviamos um link para criar uma senha nova. Confira seu e-mail.", error ? error.message : "");
        }
      });
      app.addEventListener("submit", async (ev) => {
        if (ev.target.id !== "auth-form") return; ev.preventDefault();
        const em = document.getElementById("auth-email").value.trim(), pw = document.getElementById("auth-pass").value;
        const btn = ev.target.querySelector("button[type=submit]"); btn.disabled = true; btn.textContent = "Aguarde…";
        if (mode === "up") {
          const { data, error } = await sb.auth.signUp({ email: em, password: pw, options: { emailRedirectTo: location.origin + location.pathname } });
          if (error) return render("up", "", MSG[error.message] || error.message);
          if (data.session) { session = data.session; return resolve(session); }
          return render("in", "Conta criada! Enviamos um link de confirmação para " + em + ". Confirme e depois entre aqui com sua senha.");
        }
        const { data, error } = await sb.auth.signInWithPassword({ email: em, password: pw });
        if (error) return render("in", "", MSG[error.message] || error.message);
        session = data.session; resolve(session);
      });
    });
  }
  const ready = (async () => {
    try {
      const { data } = await sb.auth.getSession();
      if (data.session) return (session = data.session);
    } catch {}
    try { if (localStorage.getItem(GUEST_KEY)) return null; } catch {}
    return showLogin();
  })();
  sb.auth.onAuthStateChange((ev, s) => {
    if (ev === "PASSWORD_RECOVERY") setTimeout(async () => {
      const app = document.getElementById("modal-root") || document.body;
      app.innerHTML = `<div class="modal-bg"><div class="modal stack"><h2>Criar senha nova</h2><form class="stack" id="newpass"><input type="password" id="np" minlength="6" placeholder="Senha nova (mín. 6 caracteres)" required><button class="btn primary">Salvar senha</button></form></div></div>`;
      document.getElementById("newpass").addEventListener("submit", async (x) => { x.preventDefault(); const { error } = await sb.auth.updateUser({ password: document.getElementById("np").value }); app.innerHTML = ""; if (typeof toast === "function") toast(error ? "Não consegui salvar a senha." : "Senha alterada!"); });
    }, 600);
    if (s) session = s;
  });
  window.LUE_logout = async () => { try { localStorage.removeItem(GUEST_KEY); localStorage.removeItem("lue-state-v1"); } catch {} await sb.auth.signOut(); location.reload(); };
  window.LUE_deleteAccount = async () => {
    const { data: s } = await sb.auth.getSession(); if (!s.session) throw new Error("sem login");
    const r = await fetch(SB_URL + "/functions/v1/delete-account", { method: "POST", headers: { Authorization: "Bearer " + s.session.access_token, apikey: SB_KEY } });
    if (!r.ok) throw new Error("falhou");
    try { localStorage.clear(); } catch {}
    await sb.auth.signOut().catch(() => {}); location.reload();
  };
  window.LUE_login = () => { try { localStorage.removeItem(GUEST_KEY); } catch {} location.reload(); };

  /* ---------- banco: documentos por caminho ---------- */
  const parentOf = (p) => p.replace(/\/[^/]+$/, "");
  const fail = (error) => { const c = error && (error.code === "42501" || /row-level security/i.test(error.message || "")) ? "permission_denied" : "unavailable"; const x = new Error(error && error.message); x.code = c; throw x; };
  const watchers = new Set(); let channel = null;
  function ensureChannel() {
    if (channel) return;
    channel = sb.channel("docs-changes").on("postgres_changes", { event: "*", schema: "public", table: "docs" }, (pl) => {
      const p = (pl.new && pl.new.path) || (pl.old && pl.old.path); if (!p) return;
      for (const w of watchers) if ((w.path && w.path === p) || (w.parent && w.parent === parentOf(p))) w.kick();
    }).subscribe();
  }
  function watch(spec, fetcher, cb, onErr) {
    let t = null, alive = true;
    const run = async () => { try { const r = await fetcher(); if (alive) cb(r); } catch (er) { if (alive && onErr) onErr(er); } };
    const w = { ...spec, kick: () => { clearTimeout(t); t = setTimeout(run, 150); } };
    watchers.add(w); ensureChannel(); run();
    const poll = setInterval(run, 60000);
    return () => { alive = false; watchers.delete(w); clearInterval(poll); clearTimeout(t); };
  }
  const snapOf = (path, row) => ({ id: path.replace(/^.*\//, ""), exists: !!row, data: () => (row ? row.data : undefined) });
  function doc(path) {
    const get = async () => { const { data, error } = await sb.from("docs").select("data").eq("path", path).maybeSingle(); if (error) fail(error); return snapOf(path, data); };
    return {
      get,
      async set(v) { const { error } = await sb.from("docs").upsert({ path, data: v }, { onConflict: "path" }); if (error) fail(error); },
      async update(v) { const { error } = await sb.rpc("doc_merge", { p_path: path, p_patch: v }); if (error) fail(error); },
      async delete() { const { error } = await sb.from("docs").delete().eq("path", path); if (error) fail(error); },
      onSnapshot(cb, onErr) { return watch({ path }, get, cb, onErr); },
    };
  }
  function collection(parent, filters = [], lim = 1000, order = null) {
    const get = async () => {
      let q = sb.from("docs").select("path,data").eq("parent", parent);
      for (const [f, v] of filters) q = q.eq("data->>" + f, String(v));
      if (order) q = q.order("data->" + order[0], { ascending: order[1] !== "desc" });
      const { data, error } = await q.limit(lim); if (error) fail(error);
      return { docs: (data || []).map((r) => ({ id: r.path.replace(/^.*\//, ""), data: () => r.data })) };
    };
    return {
      where(f, op, v) { return collection(parent, [...filters, [f, v]], lim, order); },
      orderBy(f, dir = "asc") { return collection(parent, filters, lim, [f, dir]); },
      limit(n) { return collection(parent, filters, n, order); },
      get,
      onSnapshot(cb, onErr) { return watch({ parent }, get, cb, onErr); },
    };
  }
  const db = { doc, collection };

  /* ---------- professora de IA (Edge Function "tutor") ---------- */
  async function callTutor(input, opts = {}, json = false) {
    const messages = typeof input === "string" ? [{ role: "user", content: input }] : input;
    const { data: s } = await sb.auth.getSession();
    if (!s.session) { const x = new Error("sem login"); x.code = "not_granted"; throw x; }
    let res;
    try {
      res = await fetch(SB_URL + "/functions/v1/tutor", {
        method: "POST", signal: opts.signal,
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + s.session.access_token, apikey: SB_KEY },
        body: JSON.stringify({ messages, json, tier: opts.modelTier || "default" }),
      });
    } catch (er) { const x = new Error("rede"); x.code = er && er.name === "AbortError" ? "cancelled" : "unavailable"; throw x; }
    const out = await res.json().catch(() => ({}));
    if (!res.ok) { const x = new Error(out.error || "erro"); x.code = res.status === 429 ? "rate_limited" : res.status === 503 ? "sampling_disabled" : out.code || "unavailable"; throw x; }
    if (json) { if (out.json === undefined) { const x = new Error("json"); x.code = "invalid_json"; throw x; } return out.json; }
    return { text: out.text || "" };
  }
  const sample = (input, opts) => callTutor(input, opts, false);
  sample.json = (input, opts) => callTutor(input, opts, true);

  /* ---------- downloads ---------- */
  const downloads = {
    async save({ filename, data }) {
      const url = URL.createObjectURL(data instanceof Blob ? data : new Blob([data]));
      const a = document.createElement("a"); a.href = url; a.download = filename || "arquivo"; document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    },
  };

  /* ---------- salas ao vivo (quem está online) ---------- */
  function makeRoom(name, uid) {
    const ch = sb.channel("room:" + name, { config: { presence: { key: uid } } });
    const cbs = new Set(); let last = null;
    const subscribed = new Promise((res) => ch.on("presence", { event: "sync" }, () => {
      const st = ch.presenceState();
      const peers = Object.entries(st).map(([k, arr]) => ({ by: k, isMe: k === uid, presence: arr[arr.length - 1] || {} }));
      for (const cb of cbs) try { cb({ peers }); } catch {}
    }).subscribe((status) => { if (status === "SUBSCRIBED") res(); }));
    return {
      onPeers(cb) { cbs.add(cb); return () => cbs.delete(cb); },
      async presence(obj) { last = obj; await subscribed; await ch.track(obj); },
      async join(sub) { return makeRoom(name + ":" + sub, uid); },
      async leave() { try { await ch.untrack(); } catch {} sb.removeChannel(ch); },
    };
  }

  window.claude = {
    async use(cap) {
      const s = await ready;
      if (cap === "downloads") return downloads;
      if (!s) return null;
      const uid = s.user.id;
      if (cap === "db") return db;
      if (cap === "user") return { id: async () => uid, email: () => s.user.email, isOwner: async () => { const { data } = await sb.rpc("is_admin"); return data === true; } };
      if (cap === "sample") return sample;
      if (cap === "room") return makeRoom("lobby", uid);
      return null;
    },
  };
})();
