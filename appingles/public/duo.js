/* Level Up English — trilha de lições, vidas, baús, combos, sons e telas de comemoração. */
"use strict";

/* ---------- estado extra ---------- */
const MAX_HEARTS = 5, HEART_MS = 30 * 60 * 1000, REFILL_PRICE = 100;
function ensureDuo() {
  if (!S.hearts || typeof S.hearts.n !== "number") S.hearts = { n: MAX_HEARTS, t: Date.now() };
  if (!S.chests) S.chests = {};
  if (S.profile.sound === undefined) S.profile.sound = true;
}
function unlimitedHearts() { return S.plan === "premium"; }
function heartsNow() {
  ensureDuo(); const h = S.hearts; const now = Date.now();
  if (h.n >= MAX_HEARTS) { h.t = now; return h.n; }
  while (h.n < MAX_HEARTS && now - h.t >= HEART_MS) { h.n++; h.t += HEART_MS; }
  if (h.n >= MAX_HEARTS) h.t = now;
  return h.n;
}
function nextHeartMin() { heartsNow(); return Math.max(1, Math.ceil((HEART_MS - (Date.now() - S.hearts.t)) / 60000)); }
function loseHeart() { if (unlimitedHearts()) return; const n = heartsNow(); if (n >= MAX_HEARTS) S.hearts.t = Date.now(); S.hearts.n = Math.max(0, n - 1); }
function gainHeart(k = 1) { const n = heartsNow(); if (n >= MAX_HEARTS) return 0; S.hearts.n = Math.min(MAX_HEARTS, n + k); if (S.hearts.n >= MAX_HEARTS) S.hearts.t = Date.now(); return 1; }
function heartsLabel() { return unlimitedHearts() ? "∞" : String(heartsNow()); }

/* ---------- ícones extras ---------- */
Object.assign(IC, {
  heart: '<path d="M12 20s-7.5-4.6-9.2-9.3C1.7 7.6 3.8 4.5 7 4.5c2 0 3.3 1.1 5 3 1.7-1.9 3-3 5-3 3.2 0 5.3 3.1 4.2 6.2C19.5 15.4 12 20 12 20z"/>',
  chest: '<rect x="3" y="10" width="18" height="10" rx="1.5"/><path d="M4 10V8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2M3 13h18"/><rect x="10" y="11.5" width="4" height="4" rx="1"/>',
  guide: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11M9 8h6"/>',
  dumbbell: '<path d="M3 10v4M6 7v10M18 7v10M21 10v4M6 12h12"/>',
  note: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
  mute: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><path d="M3 3l18 18"/>',
});
const HEART_SVG = (cls = "icon") => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.8-4.8-9.6-9.7C1.2 7.5 3.4 4.2 6.8 4.2c2.1 0 3.5 1.1 5.2 3.1 1.7-2 3.1-3.1 5.2-3.1 3.4 0 5.6 3.3 4.4 6.6-1.8 4.9-9.6 9.7-9.6 9.7z" fill="var(--heart)"/><path d="M7 7.5c-1.2.2-2 1.2-2 2.4" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".6"/></svg>`;
const FLAME_SVG = (cls = "icon", lit = true) => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5c1.2 3.8 6 5.8 6 11a6 6 0 0 1-12 0c0-2.4 1.2-4.1 2.4-5.2.3 1.8 1.2 2.9 2.4 2.9-1.2-3.5 0-6.3 1.2-8.7z" fill="${lit ? "var(--flame)" : "var(--line)"}"/><path d="M12 12.5c.6 1.7 3 2.5 3 5a3 3 0 0 1-6 0c0-1.3.7-2.2 1.4-2.8.1.9.6 1.4 1.1 1.4-.4-1.4 0-2.6.5-3.6z" fill="${lit ? "#FFD43B" : "var(--surface)"}"/></svg>`;
const GEM_SVG = (cls = "icon") => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h12l3.5 5L12 21 2.5 8.5z" fill="var(--gem)"/><path d="M2.5 8.5h19M9 3.5 7.5 8.5 12 21l4.5-12.5L15 3.5" fill="none" stroke="#fff" stroke-width="1.2" stroke-linejoin="round" opacity=".55"/></svg>`;

/* ---------- barra de status (vidas, ofensiva, moedas) ---------- */
function statusBar() {
  const st = streakAlive(); const lit = D().xp > 0;
  return `<div class="statusbar" role="group" aria-label="Seu status">
    <button class="sb-item" data-a="go" data-v="progress" title="Seu nível de inglês"><span class="flagchip">EN</span><b>${esc(studying())}</b></button>
    <button class="sb-item" data-a="streak-info" title="Ofensiva">${FLAME_SVG("sb-ic", lit)}<b class="num" style="color:${lit ? "var(--flame)" : "var(--muted)"}">${st}</b></button>
    <button class="sb-item" data-a="go" data-v="rewards" title="Moedas">${GEM_SVG("sb-ic")}<b class="num" style="color:var(--gem)">${S.coins}</b></button>
    <button class="sb-item" data-a="hearts-info" title="Vidas">${HEART_SVG("sb-ic")}<b class="num" style="color:var(--heart)">${heartsLabel()}</b></button>
  </div>`;
}

/* ---------- trilha ---------- */
const UNIT_COLORS = ["#3152F5", "#0B9668", "#E8590C", "#7048E8", "#0C8599", "#D6336C", "#C77700", "#2B8A3E", "#5C7CFA", "#E64980", "#1971C2", "#9C36B5"];
const UNIT_ICONS = { amizades: "users", restaurantes: "coin", "dia a dia": "home", compras: "gift", viagens: "flag", trabalho: "chart", "reuniões": "chat", conversa: "chat" };
const ZIG = [0, 44, 70, 44, 0, -44, -70, -44];

function homeNotes() {
  const notes = [];
  for (const r of FREQ_IN.filter((x) => x.status === "pending")) { const p = displayPlayer(r.from); notes.push(`<div class="li">${avatarHTML(p, 36)}<div class="grow"><b>${esc(p.u)}</b> quer ser seu amigo</div><button class="btn small primary" data-a="req-yes" data-v="${r.id}">Aceitar</button><button class="btn small" data-a="req-no" data-v="${r.id}">Recusar</button></div>`); }
  for (const c of CHEERS) { const p = displayPlayer(c.from); notes.push(`<div class="li">${avatarHTML(p, 36)}<div class="grow"><b>${esc(p.u)}</b>: ${esc(CHEER_KINDS[c.kind] || "Força nos estudos!")}</div><button class="btn small" data-a="cheer-ok" data-v="${c.id}">Valeu!</button></div>`); }
  for (const d of DUELS_IN.filter((x) => !(x.results || {})[Store.uid])) { const p = displayPlayer(d.from); notes.push(`<div class="li">${avatarHTML(p, 36)}<div class="grow"><b>${esc(p.u)}</b> te desafiou: ${DUEL_MODES[d.mode] || "Quiz"}</div><button class="btn small primary" data-a="duel-play" data-v="${esc(d.id)}">Jogar</button></div>`); }
  return notes;
}

/* revisão da unidade: mistura vocabulário e frases */
function buildUnitReview(u, count) {
  const half = Math.ceil(count / 2);
  const a = buildLesson(u, "v", half + 4).filter((x) => x.t !== "intro");
  const b = buildLesson(u, "f", half);
  return shuffle([...a.slice(0, half), ...b.slice(0, count - half)]);
}
function startNode(unitId, k) {
  const u = unitById(unitId); if (!u) return;
  if (!canStartLesson()) return;
  if (k !== "r") return startLesson(unitId, k);
  const count = LEN_COUNT[S.profile.minutes] || 12;
  startRun({ mode: "lesson", title: `${u.title} · Revisão da unidade`, lessonId: `${u.id}_r`, unit: u, items: buildUnitReview(u, count), presence: `Revisão: ${u.title}` });
}
function canStartLesson() {
  if (unlimitedHearts() || heartsNow() > 0) return true;
  noHeartsModal(); return false;
}
function noHeartsModal() {
  modal(`<div class="stack celebrate">${HEART_SVG("medal-big")}<h1>Você ficou sem vidas</h1>
    <p class="muted">Ganha 1 vida a cada 30 minutos. A próxima chega em ${nextHeartMin()} min.</p>
    <div class="stack" style="width:100%">
      <button class="btn primary big" data-a="practice-heart">${icon("dumbbell")} Praticar para ganhar 1 vida</button>
      <button class="btn big" data-a="refill" ${S.coins >= REFILL_PRICE ? "" : "disabled"}>${GEM_SVG()} Recarregar tudo · ${REFILL_PRICE} moedas</button>
      <button class="btn ghost" data-a="close">Agora não</button></div></div>`);
}
function chestOpen(unitId) {
  const id = unitId + "_c"; if (S.chests[id]) return;
  const amt = 15 + (hashStr(id + (Store.uid || "")) % 21);
  S.chests[id] = amt; gainCoins(amt); save(); sfx("chest");
  modal(`<div class="stack celebrate"><div class="chest-pop">${GEM_SVG("medal-big")}</div><p class="eyebrow">Baú aberto</p><h1>+${amt} moedas</h1><p class="muted">Use na loja para comprar molduras, temas ou recarregar vidas.</p><button class="btn primary big" data-a="close">Pegar</button></div>`);
  rerender();
}
function unitGuide(unitId) {
  const u = unitById(unitId); if (!u) return;
  const pr = (p) => p ? `<span class="pron">${esc(p)}</span>` : "";
  modal(`<div class="row between"><div><p class="eyebrow">${esc(u.moduleTitle || u.cefr || "")} · Guia</p><h2>${esc(u.title)}</h2></div><button class="btn ghost small" data-a="close" aria-label="Fechar">${icon("x")}</button></div>
    <p class="muted">${esc(u.goal || "")}</p>
    <h3>Palavras</h3><div class="list">${u.words.map((w) => `<div class="li"><button class="btn ghost small" data-a="play" data-text="${esc(w[0])}" aria-label="Ouvir">${icon("speaker")}</button><div class="grow"><b>${esc(w[0])}</b> <span class="muted">${esc(w[1])}</span><br>${pr(w[2])}</div></div>`).join("")}</div>
    ${u.dialogue && u.dialogue.length ? `<h3>Diálogo</h3>${dialogueHTML(u.dialogue, true)}<button class="btn" data-a="play-dlg" data-v="${esc(u.id)}">${icon("speaker")} Ouvir o diálogo inteiro</button>`
      : `<h3>Frases-chave</h3><div class="list">${u.sentences.map((s) => `<div class="li"><button class="btn ghost small" data-a="play" data-text="${esc(s[0])}" aria-label="Ouvir">${icon("speaker")}</button><div class="grow"><b>${esc(s[0])}</b><p class="small muted">${esc(s[1])}</p>${pr(s[2])}</div></div>`).join("")}</div>`}
    ${(u.fills || []).length ? `<h3>Dicas de gramática</h3><div class="stack">${u.fills.map((f) => `<div class="notice info small">${esc(f[3])}</div>`).join("")}</div>` : ""}
    ${Store.sample && u.dialogue ? `<button class="btn primary" data-a="roleplay" data-v="${esc(u.id)}">${icon("chat")} Praticar esta situação com a professora</button>` : ""}`);
}

/* ---------- player: topo, rodapé e telas finais ---------- */
function runnerTopExtra() {
  const lessonish = Runner.mode === "lesson";
  const combo = Runner.combo >= 3 ? `<span class="combo">${icon("bolt")} ${Runner.combo} seguidas</span>` : "";
  const mus = ["lesson", "review", "errors", "blitz"].includes(Runner.mode) ? `<button class="btn ghost small mus-btn" data-a="music" aria-label="${S.profile.music === false ? "Ligar música" : "Desligar música"}" title="Música">${S.profile.music === false ? icon("mute") : icon("note")}</button>` : "";
  return `${combo}${mus}${lessonish ? `<span class="run-hearts ${Runner.heartFlash ? "flash" : ""}">${HEART_SVG()}<b class="num">${heartsLabel()}</b></span>` : `<span class="chip xp">${icon("bolt")} <span class="num">${Runner.xp}</span></span>`}`;
}
function noHeartsRun() {
  return `<div class="runner"><div class="stack celebrate" style="margin:auto;max-width:440px;gap:16px">${mascot("bolota", "sad", 120)}<h1>Acabaram suas vidas</h1>
    <p class="muted">Recarregue para terminar esta lição ou pratique para ganhar uma vida. A próxima vida grátis chega em ${nextHeartMin()} min.</p>
    <button class="btn primary big" data-a="refill-run" ${S.coins >= REFILL_PRICE ? "" : "disabled"}>${GEM_SVG()} Recarregar · ${REFILL_PRICE} moedas</button>
    <button class="btn big" data-a="practice-heart">${icon("dumbbell")} Praticar para ganhar vida</button>
    <button class="btn ghost" data-a="run-leave">Sair da lição</button></div></div>`;
}
function verdictFor(acc) { return acc >= 95 ? "Perfeito" : acc >= 85 ? "Incrível" : acc >= 70 ? "Muito bom" : "Bom"; }
function lessonEndHTML() {
  const acc = Math.round((Runner.acc || 0) * 100); const secs = Math.round(Runner.secs); const mm = Math.floor(secs / 60), ss = secs % 60;
  if (Runner.endStep === "streak") {
    const n = streakAlive(); const days = lastDays(7);
    return `<div class="runner"><div class="stack celebrate end-screen"><div class="row" style="justify-content:center;gap:4px">${mascot("bolota", "cheer", 96)}${FLAME_SVG("streak-big")}</div><p class="streak-num num">${n}</p><h1>${n === 1 ? "dia de ofensiva!" : "dias de ofensiva!"}</h1>
      <div class="week-dots">${days.map((k) => { const d = S.days[k]; const on = d && d.xp > 0; return `<span class="wd ${on ? "on" : ""}"><i>${on ? icon("check") : ""}</i><small>${["D", "S", "T", "Q", "Q", "S", "S"][keyToDate(k).getDay()]}</small></span>`; }).join("")}</div>
      <p class="muted">Pratique todos os dias para manter a ofensiva. ${S.streak.freezes ? `Você tem ${S.streak.freezes} protetor${S.streak.freezes > 1 ? "es" : ""} de ofensiva.` : "Um protetor na loja salva sua ofensiva se você perder um dia."}</p>
      <button class="btn primary big wide" data-a="run-done">Continuar</button></div></div>`;
  }
  return `<div class="runner"><div class="stack celebrate end-screen">
    <div class="confetti" aria-hidden="true">${Array.from({ length: 18 }, (_, i) => `<i style="--x:${(i * 37) % 100};--d:${(i % 6) * 0.12}s;--c:${UNIT_COLORS[i % 6]}"></i>`).join("")}</div>
    <div class="row end-mascots" style="justify-content:center;gap:0">${acc >= 70 ? mascot("mia", "cheer", 80) : ""}${mascot("bolota", "cheer", 120)}${acc >= 70 ? mascot("capi", "cheer", 80) : ""}</div>
    <h1 class="end-title">${Runner.mode === "lesson" ? "Lição concluída!" : "Treino concluído!"}</h1>
    ${Runner.heartGain ? `<p class="chip ok">${HEART_SVG()} +1 vida recuperada</p>` : ""}
    <div class="end-stats">
      <div class="es" style="--c:var(--xp)"><span>Total de XP</span><b class="num">${icon("bolt")} ${Runner.xp}</b></div>
      <div class="es" style="--c:var(--ok)"><span>${verdictFor(acc)}</span><b class="num">${icon("target")} ${acc}%</b></div>
      <div class="es" style="--c:var(--brand)"><span>Tempo</span><b class="num">${icon("clock")} ${mm}:${pad(ss)}</b></div>
    </div>
    ${(() => { const wrong = Runner.results.filter((r) => !r.ok && r.ex.t !== "match"); return wrong.length ? `<details class="card flat review-box"><summary><b>Revisar ${wrong.length} ${wrong.length === 1 ? "erro" : "erros"}</b></summary><div class="list">${wrong.slice(0, 8).map((r) => `<div class="li"><div class="grow"><p class="small muted ell">${esc(r.ex.q || r.ex.audio || "")}</p><p><b>${esc(r.ex.a)}</b>${r.ex.expl ? ` <span class="muted small">— ${esc(r.ex.expl)}</span>` : ""}</p></div>${r.ex.en ? `<button class="btn ghost small" data-a="play" data-text="${esc(r.ex.en)}" aria-label="Ouvir">${icon("speaker")}</button>` : ""}</div>`).join("")}</div></details>` : ""; })()}
    ${lessonReportHTML()}
    <button class="btn primary big wide" data-a="run-done">Continuar</button></div></div>`;
}
/* relatório: palavras aprendidas e o que melhorar */
function lessonReportHTML() {
  const words = [...new Map(Runner.results.filter((r) => r.ok && r.ex.word && r.ex.en).map((r) => [r.ex.en, r.ex])).values()];
  const intros = Runner.items.filter((x) => x.t === "intro").map((x) => ({ en: x.en, pt: x.pt }));
  const learned = [...new Map([...intros, ...words].map((w) => [w.en, w])).values()].slice(0, 12);
  const SK = { vocab: "Vocabulário", listen: "Escuta", grammar: "Gramática", writing: "Escrita e tradução", speaking: "Pronúncia", dialogue: "Diálogos" };
  const by = {}; for (const r of Runner.results) { const k = r.ex.skill; if (!k || r.ex.t === "match") continue; by[k] = by[k] || [0, 0]; by[k][1]++; if (r.ok) by[k][0]++; }
  const weak = Object.entries(by).filter(([, v]) => v[1] && v[0] / v[1] < 0.8).sort((a, b) => a[1][0] / a[1][1] - b[1][0] / b[1][1]).map(([k]) => SK[k] || k);
  const u = Runner.unit;
  return `<div class="card flat review-box stack" style="gap:10px">
    ${learned.length ? `<div><p class="eyebrow">Palavras desta lição</p><div class="chips-wrap">${learned.map((w) => `<button class="chip" data-a="play" data-text="${esc(w.en)}">${esc(w.en)} <span class="muted">${esc(w.pt || "")}</span></button>`).join("")}</div></div>` : ""}
    <div><p class="eyebrow">O que melhorar</p><p class="small">${weak.length ? `Treine mais: <b>${weak.join(", ")}</b>. Esses erros entram na sua revisão automática.` : "Nada pendente: você foi bem em tudo. Continue assim!"}</p></div>
    ${u && u.dialogue && Store.sample ? `<button class="btn" data-a="roleplay" data-v="${esc(u.id)}">${icon("chat")} Conversar com a professora sobre esta situação</button>` : ""}
  </div>`;
}
