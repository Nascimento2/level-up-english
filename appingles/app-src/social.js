/* Level Up English — amigos, incentivos, grupos, desafios online e rankings. */
"use strict";

function needCloud() { if (Store.mode !== "cloud") { toast("Recursos com amigos precisam do app aberto no Claude com sua conta."); return false; } if (Store.readOnly) { toast("Seu acesso a este app é só de leitura."); return false; } return true; }
function displayPlayer(id) { if (id === Store.uid) return { id, ...publicDoc() }; return playerById(id) || { id, u: "Aluno", av: null }; }

/* ---------- amigos ---------- */
async function sendFriendRequest(name) {
  if (!needCloud()) return;
  name = (name || "").trim().replace(/^@/, "").toLowerCase(); if (!name) return toast("Digite o nome de usuário do seu amigo.");
  const p = PLAYERS.find((x) => x.ul === name && !MOD.hidden[x.id]);
  if (!p || (p.priv && !S.friends.includes(p.id))) return toast("Não encontrei esse usuário. Confira o nome (ele precisa ter aberto o app).");
  if (p.id === Store.uid) return toast("Esse é você!");
  if (S.friends.includes(p.id)) return toast(`Você e ${p.u} já são amigos.`);
  if (p.reqs === false) return toast(`${p.u} não está aceitando pedidos de amizade no momento.`);
  try { await Store.db.doc(`friendreq/${p.id}__${Store.uid}`).set({ to: p.id, from: Store.uid, status: "pending", at: Date.now() }); toast(`Pedido enviado para ${p.u}.`); }
  catch { toast("Não consegui enviar o pedido agora."); }
}
async function answerRequest(id, accept) {
  const r = FREQ_IN.find((x) => x.id === id); if (!r) return;
  try {
    if (accept) { if (!S.friends.includes(r.from)) S.friends.push(r.from); save(); await Store.db.doc(`friendreq/${id}`).update({ status: "accepted" }); toast(`Agora vocês são amigos!`); queueCheck(); }
    else await Store.db.doc(`friendreq/${id}`).delete();
  } catch { toast("Não consegui responder ao pedido agora."); }
}
let processingAccepted = false;
async function acceptedRequests() {
  if (processingAccepted) return; processingAccepted = true;
  try {
    for (const r of FREQ_OUT.filter((x) => x.status === "accepted")) {
      if (!S.friends.includes(r.to)) { S.friends.push(r.to); save(); queueCheck(); const p = playerById(r.to); toast(`${p ? p.u : "Seu amigo"} aceitou seu pedido de amizade!`); }
      await Store.db.doc(`friendreq/${r.id}`).delete().catch(() => {});
    }
  } finally { processingAccepted = false; }
}
function removeFriend(id) { S.friends = S.friends.filter((f) => f !== id); save(); rerender(); }

/* incentivos */
const CHEER_KINDS = { bora: "Bora estudar hoje!", parabens: "Parabéns pelo progresso!", sequencia: "Que sequência! Continua assim!", desafio: "Topa um desafio?" };
async function sendCheer(to, kind) {
  if (!needCloud()) return;
  try { await Store.db.doc(`cheers/${to}__${Store.uid}`).set({ to, from: Store.uid, kind, at: Date.now() }); toast("Incentivo enviado!"); closeModal(); }
  catch { toast("Não consegui enviar agora."); }
}
async function dismissCheer(id) { try { await Store.db.doc(`cheers/${id}`).delete(); } catch {} }

/* ---------- grupos e equipes ---------- */
const GROUP_CACHE = {};
async function createGroup(name, goal) {
  if (!needCloud()) return; name = (name || "").trim().slice(0, 40); if (!name) return toast("Dê um nome ao grupo.");
  const code = rid(6);
  try {
    await Store.db.doc(`groups/${code}`).set({ name, owner: Store.uid, goal: clamp(parseInt(goal) || 1500, 200, 50000), at: Date.now() });
    await Store.db.doc(`groups/${code}/members/${Store.uid}`).set({ at: Date.now() });
    S.groups.push(code); save(); queueCheck(); closeModal(); toast(`Grupo criado! Código de convite: ${code}`); openGroup(code);
  } catch { toast("Não consegui criar o grupo agora."); }
}
async function joinGroup(code) {
  if (!needCloud()) return; code = (code || "").trim().toLowerCase();
  if (!/^[a-z0-9]{4,12}$/.test(code)) return toast("Código inválido.");
  if (S.groups.includes(code)) return openGroup(code);
  try {
    const g = await Store.db.doc(`groups/${code}`).get(); if (!g.exists) return toast("Não encontrei um grupo com esse código.");
    await Store.db.doc(`groups/${code}/members/${Store.uid}`).set({ at: Date.now() });
    S.groups.push(code); save(); queueCheck(); closeModal(); toast(`Você entrou no grupo ${g.data().name}.`); openGroup(code);
  } catch { toast("Não consegui entrar no grupo agora."); }
}
async function leaveGroup(code) {
  try { await Store.db.doc(`groups/${code}/members/${Store.uid}`).delete(); } catch {}
  S.groups = S.groups.filter((c) => c !== code); save(); closeModal(); rerender();
}
async function loadGroup(code) {
  const g = await Store.db.doc(`groups/${code}`).get(); if (!g.exists) return null;
  const ms = await Store.db.collection(`groups/${code}/members`).get();
  const members = ms.docs.map((d) => d.id);
  const wkKey = wk();
  const weekly = sum(members.map((id) => { const p = displayPlayer(id); return p.week && p.week.k === wkKey ? p.week.xp : 0; }));
  const out = { code, ...g.data(), members, weekly }; GROUP_CACHE[code] = out; return out;
}
async function openGroup(code) {
  modal(`<p class="muted">Carregando grupo…</p>`);
  let g; try { g = await loadGroup(code); } catch { g = null; }
  if (!g) { closeModal(); return toast("Não consegui abrir esse grupo."); }
  const online = onlineIds(); const wkKey = wk();
  const rows = g.members.map((id) => ({ p: displayPlayer(id), x: (displayPlayer(id).week || {}).k === wkKey ? displayPlayer(id).week.xp : 0 })).sort((a, b) => b.x - a.x);
  const pct = Math.min(100, Math.round((g.weekly / g.goal) * 100));
  modal(`<div class="row between"><div><p class="eyebrow">Grupo · código ${esc(g.code)}</p><h2>${esc(g.name)}</h2></div><button class="btn ghost small" data-a="close" aria-label="Fechar">${icon("x")}</button></div>
    <div class="stack" style="gap:6px"><div class="row between"><b>Meta semanal do grupo</b><span class="num">${g.weekly} / ${g.goal} XP</span></div><div class="bar xp"><i style="width:${pct}%"></i></div></div>
    <div class="list">${rows.map((r, k) => `<div class="li">${avatarHTML(r.p, 36, !!online[r.p.id])}<div class="grow"><b class="ell">${esc(r.p.u)}${r.p.id === Store.uid ? " (você)" : ""}</b><p class="small muted ell">${online[r.p.id] ? esc(online[r.p.id]) : (r.p.streak ? r.p.streak + " dias de sequência" : "—")}</p></div><span class="chip xp num">${r.x} XP</span></div>`).join("")}</div>
    <div class="notice info">Convide amigos com o código <b>${esc(g.code)}</b>. Quem estiver com o app aberto aparece como online, com o que está estudando agora.</div>
    <div class="row"><button class="btn" data-a="copy" data-v="${esc(g.code)}">Copiar código</button><button class="btn danger" data-a="group-leave" data-v="${esc(g.code)}">Sair do grupo</button></div>`);
}
async function teamRanking() {
  if (Store.mode !== "cloud") return [];
  const gs = await Store.db.collection("groups").limit(100).get();
  const out = [];
  for (const d of gs.docs) { try { out.push(await loadGroup(d.id)); } catch {} }
  return out.filter(Boolean).sort((a, b) => b.weekly - a.weekly);
}

/* ---------- desafios (duelos) ---------- */
const DUEL_MODES = { vocab: "Vocabulário", traducao: "Tradução", escuta: "Escuta" };
function duelItems(seed, mode) {
  const rng = mulberry32(seed); const units = LUE_UNITS.filter((u) => u.cefr === "A1" || u.cefr === "A2");
  const words = wordPool(units); const sents = sentPool(units); const items = [];
  for (let k = 0; k < 8; k++) {
    if (mode === "vocab") items.push(exMC(pick(words, rng), rng() < 0.5 ? "en2pt" : "pt2en", words, rng));
    else if (mode === "traducao") items.push(exMC(pick(sents, rng), "pt2en", sents, rng));
    else items.push(exListen(rng() < 0.5 ? pick(words, rng) : pick(sents, rng), rng() < 0.5 ? words : sents, rng));
  }
  return items;
}
async function createDuel(mode, to, timer) {
  if (!needCloud()) return;
  const code = rid(6);
  const doc = { code, from: Store.uid, to: to || null, mode, timer: !!timer, seed: hashStr(code + Date.now()), at: Date.now(), results: {} };
  try { await Store.db.doc(`duels/${code}`).set(doc); closeModal(); toast(to ? "Desafio enviado! Seu amigo verá o convite." : `Desafio criado. Código: ${code}`); playDuel(code); }
  catch { toast("Não consegui criar o desafio agora."); }
}
let duelUnsub = null, duelRoom = null, DUEL = null;
async function playDuel(code) {
  if (!needCloud()) return; code = (code || "").trim().toLowerCase();
  let snap; try { snap = await Store.db.doc(`duels/${code}`).get(); } catch { snap = null; }
  if (!snap || !snap.exists) return toast("Não encontrei esse desafio.");
  const d = snap.data();
  if (d.results && d.results[Store.uid]) return showDuelResult(code);
  DUEL = { code, d, score: 0, correct: 0, opp: null };
  if (Store.room) { try { duelRoom = await Store.room.join("duel-" + code); duelRoom.onPeers((c) => { const o = c.peers.find((p) => !p.isMe); DUEL.opp = o ? o.presence : null; const el = $("#duel-opp"); if (el) el.innerHTML = oppLine(); }, () => {}); } catch { duelRoom = null; } }
  const items = duelItems(d.seed, d.mode);
  startRun({
    mode: "duel", title: `Desafio · ${DUEL_MODES[d.mode] || "Quiz"}`, items, qTimer: d.timer ? 15 : 0, presence: "Em um desafio",
    hooks: {
      back: "friends",
      onAnswer: (res) => { if (res.ok) { DUEL.correct++; DUEL.score += 100 + (d.timer ? Math.round(50 * Math.max(0, 1 - res.ms / 15000)) : 0); } duelRoom && duelRoom.presence({ u: S.profile.username, i: Runner.i + 1, sc: DUEL.score, done: false }).catch(() => {}); },
      onFinish: async (R) => {
        const r = { u: S.profile.username, score: DUEL.score, correct: DUEL.correct, total: R.items.length, at: Date.now() };
        duelRoom && duelRoom.presence({ u: S.profile.username, i: R.items.length, sc: DUEL.score, done: true }).catch(() => {});
        D().du++; S.duels.played++; const g = gainXP(10 + DUEL.correct * 2); Runner.xp += g; save(); queueCheck();
        try { await Store.db.doc(`duels/${code}`).update({ results: { [Store.uid]: r } }); } catch { toast("Não consegui registrar seu resultado."); }
        duelUnsub && duelUnsub(); duelUnsub = Store.db.doc(`duels/${code}`).onSnapshot((s) => { if (s.exists) { DUEL.d = s.data(); countOne(DUEL.d); if (currentView === "run") rerunner(); } }, () => {});
      },
      renderEnd: () => duelEndHTML(),
    },
  });
  setTimeout(() => { const top = $(".runner-top"); if (top && !$("#duel-opp")) top.insertAdjacentHTML("afterend", `<p class="small muted" id="duel-opp">${oppLine()}</p>`); }, 50);
}
function oppLine() { const o = DUEL && DUEL.opp; return o ? `Oponente ao vivo: <b>${esc(o.u || "Amigo")}</b> · questão ${o.i || 0} · ${o.sc || 0} pts${o.done ? " · terminou" : ""}` : "Seu oponente pode jogar agora ou depois: o resultado aparece quando os dois terminarem."; }
function duelEndHTML() {
  const d = DUEL.d; const res = d.results || {}; const ids = Object.keys(res);
  const mine = res[Store.uid] || { score: DUEL.score, correct: DUEL.correct, total: Runner.items.length };
  const opp = ids.filter((id) => id !== Store.uid).map((id) => res[id])[0];
  const verdict = !opp ? "Aguardando o oponente terminar…" : mine.score > opp.score ? "Você venceu!" : mine.score < opp.score ? `${esc(opp.u)} venceu desta vez` : "Empate!";
  return `<div class="runner"><div class="card stack celebrate" style="padding:26px"><p class="eyebrow">Desafio ${esc(d.code)} · ${DUEL_MODES[d.mode]}</p><h1>${verdict}</h1>
    <div class="grid2" style="width:100%"><div class="card flat"><p class="eyebrow">Você</p><b class="q-big num">${mine.score}</b><p class="muted">${mine.correct}/${mine.total} acertos</p></div>
    <div class="card flat"><p class="eyebrow">${opp ? esc(opp.u) : "Oponente"}</p><b class="q-big num">${opp ? opp.score : "—"}</b><p class="muted">${opp ? `${opp.correct}/${opp.total} acertos` : "ainda jogando"}</p></div></div>
    <div class="card flat" style="width:100%;text-align:left"><p class="eyebrow">Gabarito para todos aprenderem</p><div class="list">${Runner.items.map((ex, k) => { const r = Runner.results[k]; return `<div class="li">${r && r.ok ? `<span class="chip ok">${icon("check")}</span>` : `<span class="chip bad">${icon("x")}</span>`}<div class="grow"><p class="small muted ell">${esc(ex.q || ex.audio)}</p><p><b>${esc(ex.a)}</b> <span class="muted small">${esc(ex.t === "mc" && ex.a === ex.pt ? ex.en : ex.pt || "")}</span></p></div></div>`; }).join("")}</div></div>
    <button class="btn primary big" data-a="duel-done">Continuar</button></div></div>`;
}
async function showDuelResult(code) {
  const s = await Store.db.doc(`duels/${code}`).get(); const d = s.data(); const res = d.results || {};
  const rows = Object.values(res).sort((a, b) => b.score - a.score);
  modal(`<h2>Desafio ${esc(code)}</h2><p class="muted">${DUEL_MODES[d.mode]}${d.timer ? " · com tempo" : ""}</p>
    <div class="list">${rows.map((r, k) => `<div class="li"><span class="pos ${k === 0 ? "p1" : ""}">${k + 1}</span><div class="grow"><b>${esc(r.u)}</b><p class="small muted">${r.correct}/${r.total} acertos</p></div><b class="num">${r.score}</b></div>`).join("")}</div>
    ${rows.length < 2 ? '<p class="muted small">Aguardando o oponente jogar.</p>' : ""}<button class="btn primary" data-a="close">Fechar</button>`);
  countOne(d);
}
function countOne(d) {
  const res = d.results || {}; const ids = Object.keys(res);
  if (!res[Store.uid] || ids.length < 2 || S.duels.seen[d.code]) return;
  const mine = res[Store.uid].score; const opp = Math.max(...ids.filter((i) => i !== Store.uid).map((i) => res[i].score));
  S.duels.seen[d.code] = 1; if (mine > opp) S.duels.w++; else if (mine < opp) S.duels.l++; save(); queueCheck();
}
function countDuels() { for (const d of [...DUELS_IN, ...DUELS_OUT]) countOne({ ...d, code: d.code || d.id }); }
function cleanupDuel() { duelUnsub && duelUnsub(); duelUnsub = null; if (duelRoom) { duelRoom.leave().catch(() => {}); duelRoom = null; } }

/* ---------- denúncias ---------- */
async function reportPlayer(id, reason) {
  if (!needCloud()) return;
  try {
    const ref = Store.db.doc(`reports/${Store.uid}`); const cur = await ref.get();
    const items = (cur.exists ? cur.data().items || [] : []).slice(-30); items.push({ target: id, reason: String(reason || "").slice(0, 300), at: Date.now() });
    await ref.set({ items }); closeModal(); toast("Denúncia enviada. O administrador vai analisar.");
  } catch { toast("Não consegui enviar a denúncia agora."); }
}

/* ---------- rankings ---------- */
const CRITS = {
  xp: { name: "XP de aprendizagem", unit: "XP", periods: true },
  lessons: { name: "Lições concluídas", unit: "lições", periods: true },
  cons: { name: "Consistência", unit: "dias ativos (30d)", periods: false },
  mastery: { name: "Domínio nos testes", unit: "pontos", periods: false },
  evo: { name: "Evolução de nível", unit: "etapas CEFR", periods: false },
};
function rankValue(p, period, crit) {
  if (crit === "xp") { if (period === "day") return p.day && p.day.k === today() ? p.day.xp : 0; if (period === "week") return p.week && p.week.k === wk() ? p.week.xp : 0; if (period === "month") return p.month && p.month.k === mk() ? p.month.xp : 0; return p.xp || 0; }
  if (crit === "lessons") { if (period === "day") return p.day && p.day.k === today() ? p.day.l || 0 : 0; if (period === "week") return p.week && p.week.k === wk() ? p.week.l || 0 : 0; if (period === "month") return p.month && p.month.k === mk() ? p.month.l || 0 : 0; return p.lessons || 0; }
  if (crit === "cons") return p.cons || 0;
  if (crit === "mastery") return p.mastery || 0;
  if (crit === "evo") return p.evo || 0;
  return 0;
}
function rankingRows(period, scope, crit) {
  const me = { id: Store.uid || "me", ...publicDoc() };
  let list = Store.mode === "cloud" ? PLAYERS.filter((p) => p.id !== Store.uid && p.u && !MOD.hidden[p.id]) : [];
  if (scope === "friends") list = list.filter((p) => S.friends.includes(p.id));
  else list = list.filter((p) => !p.priv && p.show !== false);
  if (S.profile.showRank !== false || scope === "friends") list.push(me);
  return list.map((p) => ({ p, v: rankValue(p, period, crit) })).sort((a, b) => b.v - a.v || (b.p.xp || 0) - (a.p.xp || 0));
}
function myRank(period = "week") { const rows = rankingRows(period, "global", "xp"); const i = rows.findIndex((r) => r.p.id === (Store.uid || "me")); return i >= 0 ? i + 1 : null; }
