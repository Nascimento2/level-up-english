/* Level Up English — salas de conversa ao vivo por nível (alunos praticando entre si). */
"use strict";

const ROOMS = [
  { id: "iniciante", name: "Sala Iniciante", levels: "Níveis 1 a 4", min: 1, max: 4, color: "#0B9668",
    topics: ["What's your name and where are you from?", "What do you do every morning?", "What's your favorite food?", "Do you have brothers or sisters?", "What do you like to do on weekends?"] },
  { id: "intermediario", name: "Sala Intermediária", levels: "Níveis 5 a 8", min: 5, max: 8, color: "#3152F5",
    topics: ["Tell us about your last trip.", "What's the best movie you've seen this year? Why?", "Describe your dream job.", "What would you do with a free day tomorrow?", "What's a habit you want to change?"] },
  { id: "avancado", name: "Sala Avançada", levels: "Nível 9 em diante", min: 9, max: 999, color: "#7048E8",
    topics: ["Is remote work better than working at an office? Defend your view.", "How is AI changing your industry?", "What's something most people believe that you disagree with?", "If you could live in any country, which would it be and why?", "What's the most valuable lesson you've learned from a mistake?"] },
];
const RoomS = { id: null, msgs: [], unsub: null, live: null, peers: [], err: "", checking: false, draft: "" };
function roomFor(level) { return ROOMS.find((r) => level >= r.min && level <= r.max) || ROOMS[0]; }
function roomOpenFor(r) { return currentLevel() >= r.min || S.lv.unlocked >= r.min; }
function topicOfWeek(r) { return r.topics[parseInt(wk().split("W")[1], 10) % r.topics.length]; }

async function joinRoom(id) {
  if (!needCloud()) return;
  const r = ROOMS.find((x) => x.id === id); if (!r) return;
  leaveRoom(true);
  Object.assign(RoomS, { id, msgs: [], err: "", peers: [] });
  RoomS.unsub = Store.db.collection(`rooms/${id}/msgs`).orderBy("at", "desc").limit(80).onSnapshot((s) => {
    RoomS.msgs = s.docs.map((d) => ({ id: d.id, ...d.data() })).filter((m) => m && m.text && !MOD.hidden[m.from]).sort((a, b) => a.at - b.at);
    if (currentView === "rooms") { const inp = $("#room-in"); const val = inp ? inp.value : ""; const foc = document.activeElement === inp; rerender(); const i2 = $("#room-in"); if (i2) { i2.value = val; if (foc) i2.focus(); } scrollRoom(); }
  }, () => { RoomS.err = "Não consegui carregar as mensagens agora."; rerenderIf(["rooms"]); });
  if (Store.room) {
    try {
      RoomS.live = await Store.room.join("sala-" + id);
      RoomS.live.onPeers((c) => { RoomS.peers = c.peers; rerenderIf(["rooms"]); }, () => {});
      RoomS.live.presence({ u: S.profile.username, id: Store.uid, lv: currentLevel() }).catch(() => {});
    } catch { RoomS.live = null; }
  }
  setPresence(`Na ${r.name}`); rerender(); scrollRoom();
}
function leaveRoom(silent = false) {
  if (RoomS.unsub) RoomS.unsub(); RoomS.unsub = null;
  if (RoomS.live) { RoomS.live.leave().catch(() => {}); RoomS.live = null; }
  RoomS.id = null; RoomS.msgs = []; RoomS.peers = [];
  if (!silent) { setPresence("No início"); rerender(); }
}
async function sendRoomMsg(text) {
  text = String(text || "").trim().slice(0, 400); if (!text || !RoomS.id) return;
  const id = Date.now().toString(36) + rid(4);
  const msg = { from: Store.uid, u: S.profile.username, av: S.profile.avatar, lv: currentLevel(), text, at: Date.now() };
  try {
    await Store.db.doc(`rooms/${RoomS.id}/msgs/${id}`).set(msg);
    RoomS.draft = ""; const inp = $("#room-in"); if (inp) inp.value = "";
    const d = D(); d.cv = (d.cv || 0) + 1; S.tot.roomMsgs = (S.tot.roomMsgs || 0) + 1;
    if (S.tot.roomMsgs % 5 === 0) popXP(gainXP(5));
    save();
  } catch { toast("Não consegui enviar. Confira sua conexão."); }
}
/* a IA confere a frase antes de enviar */
async function checkRoomMsg() {
  const inp = $("#room-in"); const text = (inp && inp.value || "").trim();
  if (!text) return toast("Escreva sua frase primeiro.");
  if (!Store.sample) return toast("A professora de IA não está disponível agora.");
  RoomS.checking = true; RoomS.draft = text; rerender();
  try {
    const out = await Store.sample.json(`You check one chat message written by a Brazilian English learner (CEFR ${studying()}). Message: "${text.replace(/"/g, "'")}".
Reply with only JSON: {"ok":true|false,"better":"corrected natural English version (same meaning)","why_pt":"explicação curta em português, ou vazio se estiver certo"}`, { modelTier: "quick" });
    if (typeof aiCount === "function") aiCount();
    RoomS.check = out && out.better ? out : null;
  } catch (e) { RoomS.check = null; toast(typeof aiErrorCopy === "function" ? aiErrorCopy(e) || "Não consegui conferir agora." : "Não consegui conferir agora."); }
  RoomS.checking = false; rerender(); const i2 = $("#room-in"); if (i2) i2.value = RoomS.draft;
}
async function deleteRoomMsg(id) {
  try { await Store.db.doc(`rooms/${RoomS.id}/msgs/${id}`).delete(); } catch { toast("Não consegui apagar."); }
}
function scrollRoom() { setTimeout(() => { const el = $("#room-end"); if (el) el.scrollIntoView({ block: "end" }); }, 30); }

function vRooms() {
  ensureLevels();
  if (!RoomS.id) {
    const mine = roomFor(currentLevel());
    return `${head("Salas ao vivo", "Pratique inglês conversando por escrito com outros alunos do seu nível.")}
      ${Store.mode !== "cloud" ? `<div class="notice">As salas precisam de uma conta. Entre com sua conta para conversar com outros alunos.</div>` : ""}
      <section class="grid3">${ROOMS.map((r) => { const ok = roomOpenFor(r); return `<button class="mode" data-a="room-join" data-v="${r.id}" ${ok && Store.mode === "cloud" ? "" : "disabled"}>
        <span class="pr-ic" style="--c:${r.color}">${icon(ok ? "chat" : "lock")}</span><span><b>${r.name}</b>${r.id === mine.id ? ' <span class="chip brand">Seu nível</span>' : ""}<br><span class="small muted">${r.levels}${ok ? "" : " · chegue ao nível " + r.min}</span><br><span class="small">Tópico da semana: <i>${esc(topicOfWeek(r))}</i></span></span></button>`; }).join("")}</section>
      <section class="card stack"><h3>Regras da sala</h3><ul class="stack small" style="margin:0;padding-left:20px;gap:4px">
        <li>Escreva sempre em inglês. Errar faz parte: ninguém é corrigido de forma grosseira.</li>
        <li>Use o botão <b>Conferir com a IA</b> para revisar sua frase antes de enviar.</li>
        <li>A cada 5 mensagens você ganha XP. Mensagens ofensivas podem ser denunciadas.</li></ul></section>`;
  }
  const r = ROOMS.find((x) => x.id === RoomS.id);
  const online = RoomS.peers.length;
  const msgs = RoomS.msgs.map((m) => { const me = m.from === Store.uid; const p = { u: m.u, av: m.av, fr: "none" };
    return `<div class="room-msg ${me ? "me" : ""}">${me ? "" : avatarHTML(p, 32)}<div class="msg ${me ? "me" : ""}"><span class="small" style="opacity:.8;font-weight:700">${esc(m.u || "Aluno")} · nível ${m.lv || 1}</span><span>${esc(m.text)}</span>
      <div class="row" style="gap:4px">${me ? "" : `<button class="btn ghost small" data-a="play" data-text="${esc(m.text)}" aria-label="Ouvir">${icon("speaker")}</button>`}${me || Store.isOwner ? `<button class="btn ghost small" data-a="room-del" data-v="${m.id}" aria-label="Apagar">${icon("x")}</button>` : `<button class="btn ghost small" data-a="report" data-v="${esc(m.from)}" aria-label="Denunciar">${icon("flag")}</button>`}</div></div></div>`; }).join("");
  return `<div class="row between"><div><p class="eyebrow">${r.levels} · ${online ? `${online} ${online === 1 ? "pessoa online" : "pessoas online"}` : "ao vivo"}</p><h2>${r.name}</h2></div><button class="btn" data-a="room-leave">Sair da sala</button></div>
    <div class="notice info">Tópico da semana: <b>${esc(topicOfWeek(r))}</b></div>
    ${RoomS.peers.length ? `<div class="row" style="gap:6px">${RoomS.peers.slice(0, 12).map((p) => `<span class="chip">${esc((p.presence && p.presence.u) || "Aluno")}${p.isMe ? " (você)" : ""}</span>`).join("")}</div>` : ""}
    <div class="chat" aria-live="polite">${msgs || '<p class="empty">Ninguém escreveu ainda. Comece respondendo ao tópico da semana!</p>'}
      ${RoomS.err ? `<div class="notice">${esc(RoomS.err)}</div>` : ""}<div id="room-end"></div></div>
    ${RoomS.check ? `<div class="correction"><b>${RoomS.check.ok ? "Está ótimo!" : "Sugestão da professora"}</b>${RoomS.check.ok ? "" : `<span>${esc(RoomS.check.better)}</span><span class="small">${esc(RoomS.check.why_pt || "")}</span><button class="btn small" data-a="room-use" style="align-self:flex-start">Usar esta versão</button>`}</div>` : ""}
    <form class="composer" id="room-form"><textarea id="room-in" maxlength="400" placeholder="Write in English…" aria-label="Sua mensagem"></textarea>
      <button type="button" class="btn" data-a="room-check" ${Store.sample && !RoomS.checking ? "" : "disabled"} title="Conferir com a IA">${RoomS.checking ? '<span class="typing"><i></i><i></i><i></i></span>' : icon("sparkle")}</button>
      <button class="btn primary" type="submit" aria-label="Enviar">${icon("send")}</button></form>`;
}
