/* Level Up English — telas, navegação e ações. */
"use strict";

let currentView = "home", viewState = { friendsTab: "amigos", rankScope: "global", rankPeriod: "week", rankCrit: "xp", rewardsTab: "avatares", adminTab: "usuarios", teams: null, adminReports: null };
const NAV = [
  ["learn", "Aprender", "home"], ["talk", "Conversar", "chat"], ["home", "Resumo", "chart"], ["friends", "Amigos", "users"],
  ["ranking", "Ranking", "trophy"], ["missions", "Missões", "target"], ["rewards", "Recompensas", "gift"], ["profile", "Meu Perfil", "user"],
];
const BOTTOM = [["learn", "Aprender", "home"], ["talk", "Conversar", "chat"], ["ranking", "Ranking", "trophy"], ["missions", "Missões", "target"], ["more", "Mais", "more"]];

function renderShell() {
  $("#app").innerHTML = `<div class="shell">
    <nav class="side" aria-label="Menu principal"><div class="logo">${LOGO}<span>Level Up English</span></div><div id="side-nav"></div><div class="spacer"></div><div id="side-foot"></div></nav>
    <main class="main"><div class="wrap" id="view"></div></main>
    <nav class="bottom" aria-label="Menu" id="bottom-nav"></nav></div>`;
}
function renderNav() {
  const hidden = !S.onboarded || currentView === "run";
  $(".side").style.display = hidden ? "none" : ""; $(".shell").classList.toggle("nonav", hidden); $("#bottom-nav").style.display = hidden ? "none" : "";
  const items = Store.isOwner ? [...NAV, ["admin", "Administração", "shield"]] : NAV;
  $("#side-nav").innerHTML = items.map(([v, l, i]) => `<button class="navbtn" data-a="go" data-v="${v}" ${currentView === v || (v === "profile" && ["progress", "plans"].includes(currentView)) ? 'aria-current="page"' : ""}>${icon(i)}<span>${l}</span></button>`).join("");
  $("#side-foot").innerHTML = S.onboarded ? `<div class="row" style="padding:10px;gap:8px"><span class="chip xp">${icon("bolt")} <span class="num">${S.xp}</span></span><span class="chip">${FLAME_SVG("icon", D().xp > 0)} <span class="num">${streakAlive()}</span></span><span class="chip">${HEART_SVG()} <span class="num">${heartsLabel()}</span></span></div>` : "";
  const moreViews = ["home", "friends", "rewards", "profile", "progress", "plans", "admin"];
  $("#bottom-nav").innerHTML = BOTTOM.map(([v, l, i]) => `<button data-a="${v === "more" ? "more" : "go"}" data-v="${v}" ${(currentView === v || (v === "more" && moreViews.includes(currentView))) ? 'aria-current="page"' : ""}>${icon(i)}<span>${l}</span></button>`).join("");
}
function go(v) {
  if (v !== "run" && Runner.active && currentView === "run" && !Runner.finished) { Runner.active = false; clearInterval(tickHandle); setPresence("No início"); }
  if (currentView === "run" && v !== "run") { cleanupDuel(); Music.stop(); }
  currentView = v; closeModal(); renderNav(); rerender(); scrollTo(0, 0);
}
function rerender() {
  const el = $("#view"); if (!el) return;
  ensureDuo();
  const R = { onboarding: vOnboarding, home: vHome, learn: vPath, practice: vLearn, run: renderRunner, talk: vTalk, friends: vFriends, ranking: vRanking, missions: vMissions, rewards: vRewards, profile: vProfile, progress: vProgress, plans: vPlans, admin: vAdmin };
  ensureMissions();
  el.innerHTML = (R[currentView] || vHome)();
  renderNav();
  if (currentView === "run") startQTimer();
}
function rerenderIf(views) {
  if (!views.includes(currentView)) return;
  const a = document.activeElement; if (a && a.closest && a.closest("#view") && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) return;
  rerender();
}
function head(title, sub = "", right = "") { return `<header class="row between" style="align-items:flex-end"><div class="stack" style="gap:4px;min-width:0"><h1>${title}</h1>${sub ? `<p class="muted">${sub}</p>` : ""}</div>${right}</header>`; }
function cefrTape() {
  const cur = studying();
  return `<div class="tape" aria-label="Escala CEFR">${CEFR.map((b) => `<span class="${S.cefr.passed[b] ? "done" : b === cur ? "now" : ""}">${b}</span>`).join("")}</div>`;
}
function cefrText() {
  const c = certified(); const est = S.cefr.estimate;
  return c ? `Certificado em teste até <b>${c}</b> · estudando <b>${studying()}</b>` : est ? `Estimativa inicial <b>${est}</b> · ainda sem teste de nível` : `Estudando <b>A1</b> · faça os testes de nível para certificar`;
}
function ring(pct, label) {
  const r = 40, c = 2 * Math.PI * r, off = c * (1 - Math.min(1, pct));
  return `<svg class="ring" viewBox="0 0 96 96" aria-label="${esc(label)}"><circle cx="48" cy="48" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="10"/><circle cx="48" cy="48" r="${r}" fill="none" stroke="var(--xp)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 48 48)"/><text x="48" y="54" text-anchor="middle" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="20" fill="var(--ink)">${Math.round(Math.min(1, pct) * 100)}%</text></svg>`;
}

/* ---------- cadastro ---------- */
function vOnboarding() {
  const p = S.profile; const opt = (name, val, label, cur) => `<button type="button" data-a="ob-pick" data-k="${name}" data-v="${val}" aria-pressed="${cur === val}">${label}</button>`;
  return `<div class="stack" style="max-width:620px;margin:0 auto;gap:20px">
    <div class="row">${LOGO}<b style="font-family:var(--display);font-size:1.2rem">Level Up English</b></div>
    <div class="row ob-mascots">${mascot("mia", "wave", 84)}${mascot("bolota", "wave", 110)}${mascot("capi", "wave", 84)}</div>
    <p class="small muted">Bolota, Mia e Capi vão estudar com você.</p>
    <h1>Inglês de verdade, alguns minutos por dia.</h1>
    <p class="muted">Vamos montar seu plano. ${Store.mode === "cloud" ? "Você entrou com sua conta: o progresso fica salvo e sincroniza entre seus aparelhos." : "Neste modo o progresso fica salvo só neste aparelho."}</p>
    <form class="card stack" id="ob-form" style="gap:18px">
      <label class="field">Nome de usuário <input type="text" id="ob-name" maxlength="20" placeholder="ex.: ana.silva" value="${esc(p.username)}" autocomplete="off" autocapitalize="off"><span class="small muted">3 a 20 letras, números, ponto ou _. É assim que seus amigos vão te achar.</span></label>
      <div class="stack" style="gap:6px"><b>Seu nível de inglês hoje</b><div class="seg">${opt("level0", "zero", "Do zero", p.level0)}${opt("level0", "basico", "Básico", p.level0)}${opt("level0", "intermediario", "Intermediário", p.level0)}${opt("level0", "avancado", "Avançado", p.level0)}</div></div>
      <div class="stack" style="gap:6px"><b>Objetivo principal</b><div class="seg">${opt("goal", "viagem", "Viajar", p.goal)}${opt("goal", "trabalho", "Trabalho", p.goal)}${opt("goal", "conversa", "Conversar", p.goal)}${opt("goal", "estudos", "Estudos", p.goal)}${opt("goal", "entrevistas", "Entrevistas", p.goal)}</div></div>
      <div class="stack" style="gap:6px"><b>Tempo por dia</b><div class="seg">${[5, 10, 15, 30].map((m) => opt("minutes", String(m), m + " min", String(p.minutes))).join("")}</div></div>
      <div class="stack" style="gap:6px"><b>Como prefere estudar</b><div class="seg">${opt("pref", "sozinho", "Sozinho", p.pref)}${opt("pref", "amigos", "Com amigos", p.pref)}${opt("pref", "ambos", "Os dois", p.pref)}</div></div>
      <label class="toggle"><span><b>Fazer o teste de nivelamento agora</b><br><span class="small muted">15 perguntas, uns 4 minutos. Opcional.</span></span><input type="checkbox" class="switch" id="ob-test" ${p.level0 !== "zero" ? "checked" : ""}></label>
      <p class="small" id="ob-err" style="color:var(--bad)"></p>
      <button class="btn primary big" type="submit">Começar</button>
    </form></div>`;
}
async function submitOnboarding() {
  const name = ($("#ob-name").value || "").trim(); const err = $("#ob-err");
  if (!/^[a-zA-Z0-9_.]{3,20}$/.test(name)) { err.textContent = "Use de 3 a 20 caracteres: letras, números, ponto ou _."; return; }
  if (Store.mode === "cloud") {
    try { const q = await Store.db.collection("players").where("ul", "==", name.toLowerCase()).limit(2).get(); if (q.docs.some((d) => d.id !== Store.uid)) { err.textContent = "Esse nome já está em uso. Escolha outro."; return; } } catch {}
  }
  S.profile.username = name; S.onboarded = true;
  const map = { zero: -1, basico: 0, intermediario: 1, avancado: 2 }; const idx = map[S.profile.level0] ?? -1;
  if (S.cefr.start === null) S.cefr.start = Math.max(0, idx);
  for (let k = 0; k <= Math.min(2, idx + 1); k++) unlockBand(CEFR[k]);
  if (idx >= 0 && !S.cefr.estimate) S.cefr.estimate = CEFR[idx];
  const test = $("#ob-test").checked;
  ensureMissions(); save(); flush(); setPresence("No início");
  if (test) startPlacement(); else go("learn");
}

/* ---------- início ---------- */
function vHome() {
  const h = new Date().getHours(); const hi = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  const nl = nextLesson(); const goal = dailyGoalXP(); const dx = D().xp; const L = levelOf(S.xp); const NL = nextLevel(S.xp);
  const due = dueWords().length; const rank = myRank("week");
  const nextAch = ACH.filter((a) => !S.ach[a.id])[0];
  const notes = [];
  for (const r of FREQ_IN.filter((x) => x.status === "pending")) { const p = displayPlayer(r.from); notes.push(`<div class="li">${avatarHTML(p, 36)}<div class="grow"><b>${esc(p.u)}</b> quer ser seu amigo</div><button class="btn small primary" data-a="req-yes" data-v="${r.id}">Aceitar</button><button class="btn small" data-a="req-no" data-v="${r.id}">Recusar</button></div>`); }
  for (const c of CHEERS) { const p = displayPlayer(c.from); notes.push(`<div class="li">${avatarHTML(p, 36)}<div class="grow"><b>${esc(p.u)}</b>: ${esc(CHEER_KINDS[c.kind] || "Força nos estudos!")}</div><button class="btn small" data-a="cheer-ok" data-v="${c.id}">Valeu!</button></div>`); }
  for (const d of DUELS_IN.filter((x) => !(x.results || {})[Store.uid])) { const p = displayPlayer(d.from); notes.push(`<div class="li">${avatarHTML(p, 36)}<div class="grow"><b>${esc(p.u)}</b> te desafiou: ${DUEL_MODES[d.mode] || "Quiz"}</div><button class="btn small primary" data-a="duel-play" data-v="${esc(d.id)}">Jogar</button></div>`); }
  return `${head(`${hi}, ${esc(S.profile.username)}!`, new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }), `<button class="btn ghost" data-a="go" data-v="profile" aria-label="Meu perfil">${avatarHTML(meCard(), 40)}</button>`)}
    ${notes.length ? `<section class="card"><p class="eyebrow">Para você</p><div class="list">${notes.join("")}</div></section>` : ""}
    <section class="hero">
      <div class="card continue stack" style="gap:14px;padding:22px">
        <p class="eyebrow" style="color:var(--xp)">Próxima aula · ${nl.unit.cefr}</p>
        <h2 style="font-size:1.6rem">${esc(nl.unit.title)} · ${nl.kind === "v" ? "Vocabulário" : "Frases e diálogos"}</h2>
        <p class="muted">${esc(nl.unit.goal)}. Aula de ${S.profile.minutes} minutos${due ? `, com ${Math.min(due, Math.round((LEN_COUNT[S.profile.minutes] || 12) * 0.3))} revisões` : ""}.</p>
        <div class="row"><button class="btn primary big" data-a="go" data-v="learn">Ir para a trilha</button><span class="small muted">${S.profile.minutes} min</span></div>
      </div>
      <div class="card row" style="gap:16px;align-items:center">${ring(dx / goal, "Meta do dia")}<div class="stack" style="gap:4px;min-width:0"><p class="eyebrow">Meta do dia</p><b class="num" style="font-size:1.2rem">${dx} / ${goal} XP</b><p class="small muted">${dx >= goal ? "Meta batida! Tudo o que vier agora é bônus." : `Faltam ${goal - dx} XP.`}</p><p class="small"><span class="chip">${icon("flame")} ${streakAlive()} ${streakAlive() === 1 ? "dia" : "dias"} de sequência</span></p></div></div>
    </section>
    <section class="card stack">
      <div class="row between"><div><p class="eyebrow">Nível ${L.n}</p><h3>${L.name}</h3></div><span class="chip xp">${icon("bolt")} <span class="num">${S.xp} XP</span></span></div>
      <div class="bar xp"><i style="width:${NL ? Math.round(((S.xp - L.xp) / (NL.xp - L.xp)) * 100) : 100}%"></i></div>
      <p class="small muted">${NL ? `Próxima recompensa: nível ${NL.n} (${NL.name}) em ${NL.xp - S.xp} XP, com medalha e moldura nova.` : "Você chegou ao nível máximo de gamificação."}${nextAch ? ` Medalha mais próxima: <b>${esc(nextAch.name)}</b> (${esc(nextAch.desc.toLowerCase())}).` : ""}</p>
      <div class="stack" style="gap:6px"><p class="eyebrow">Seu inglês (CEFR)</p>${cefrTape()}<p class="small muted">${cefrText()}</p></div>
    </section>
    <section class="grid2">
      <div class="card stack"><div class="row between"><h3>Missões do dia</h3><button class="btn ghost small" data-a="go" data-v="missions">Ver todas</button></div>${S.missions.list.map(missionRow).join("")}</div>
      <div class="card stack"><h3>Atalhos</h3>
        <button class="mode" data-a="start-review" ${due ? "" : "disabled"}><span class="ic">${icon("repeat")}</span><span><b>Revisar ${due} ${due === 1 ? "palavra" : "palavras"}</b><br><span class="small muted">${due ? "Hora certa de revisar para não esquecer" : "Nenhuma revisão pendente hoje"}</span></span></button>
        <button class="mode" data-a="go" data-v="talk"><span class="ic">${icon("chat")}</span><span><b>Conversar com a professora Lia</b><br><span class="small muted">Pratique por texto ou voz com correções</span></span></button>
        <button class="mode" data-a="go" data-v="ranking"><span class="ic">${icon("trophy")}</span><span><b>${rank ? `Você está em ${rank}º na semana` : "Ranking semanal"}</b><br><span class="small muted">Veja quem está estudando mais</span></span></button>
        ${!S.flags.placementDone ? `<button class="mode" data-a="placement"><span class="ic">${icon("target")}</span><span><b>Teste de nivelamento</b><br><span class="small muted">Descubra seu nível em 4 minutos</span></span></button>` : ""}
      </div>
    </section>`;
}
function missionRow(mi) {
  const def = MISSION_DEFS[mi.id]; const prog = missionProgress(mi); const done = prog >= mi.n;
  return `<div class="stack" style="gap:6px;padding:6px 0"><div class="row between"><span style="font-weight:600">${esc(def.t(mi.n))}</span>${mi.claimed ? `<span class="chip ok">${icon("check")} Feito</span>` : done ? `<button class="btn small primary" data-a="claim" data-v="${mi.id}">Resgatar</button>` : `<span class="small muted num">${prog}/${mi.n}</span>`}</div><div class="bar ${done ? "ok" : ""}"><i style="width:${(prog / mi.n) * 100}%"></i></div></div>`;
}

/* ---------- aprender ---------- */
function vLearn() {
  const due = dueWords().length; const lvl = levelOf(S.xp).n;
  const bands = ["A1", "A2", "B1"].map((b) => {
    const unlocked = bandUnlocked(b); const passed = S.cefr.passed[b]; const units = bandUnits(b);
    const prev = CEFR[CEFR.indexOf(b) - 1];
    return `<section class="band card"><div class="band-head"><span class="cefr-badge">${b}</span><div class="grow" style="flex:1;min-width:0"><h3>${{ A1: "Básico: primeiros passos", A2: "Básico: situações do dia a dia", B1: "Intermediário: trabalho e opiniões" }[b]}</h3><p class="small muted">${units.length} unidades · ${units.filter(unitDone).length} concluídas</p></div>
      ${passed ? `<span class="chip ok">${icon("check")} Certificado ${passed.score}%</span>` : unlocked ? `<button class="btn small" data-a="test" data-v="${b}">${icon("shield")} Teste de nível ${b}</button>` : `<span class="chip">${icon("lock")} Passe no teste ${prev}</span>`}</div>
      <div class="stack">${units.map((u) => unitCard(u, unlocked)).join("")}</div></section>`;
  }).join("");
  const b2 = bandUnlocked("B2");
  return `${head("Meu Treinamento", "Lições curtas, revisões inteligentes e testes para subir de nível.")}
    <section class="card stack"><div class="row between"><div><h3>Aula do dia</h3><p class="small muted">Próxima lição + revisões das palavras que você está esquecendo.</p></div>
      <div class="seg" role="group" aria-label="Duração da aula">${[5, 10, 15, 30].map((m) => `<button data-a="set-min" data-v="${m}" aria-pressed="${S.profile.minutes === m}">${m} min</button>`).join("")}</div></div>
      <button class="btn primary big" data-a="daily">Começar aula de ${S.profile.minutes} minutos</button></section>
    <section class="grid3">
      <button class="mode" data-a="start-review"><span class="ic">${icon("repeat")}</span><span><b>Revisão inteligente</b><br><span class="small muted">${due ? `${due} para hoje` : "Reforce as mais difíceis"}</span></span></button>
      <button class="mode" data-a="listening"><span class="ic">${icon("ear")}</span><span><b>Treino de escuta</b><br><span class="small muted">Áudio em inglês nativo</span></span></button>
      <button class="mode" data-a="pronunciation"><span class="ic">${icon("mic")}</span><span><b>Treino de pronúncia</b><br><span class="small muted">${SR_OK ? "Fale e receba nota" : "Ditado (microfone indisponível aqui)"}</span></span></button>
      <button class="mode" data-a="errors"><span class="ic">${icon("x")}</span><span><b>Revisão de erros</b><br><span class="small muted">${S.errors.length} no histórico</span></span></button>
      <button class="mode" data-a="blitz" ${lvl >= 3 ? "" : "disabled"}><span class="ic">${icon(lvl >= 3 ? "bolt" : "lock")}</span><span><b>Desafio relâmpago</b><br><span class="small muted">${lvl >= 3 ? "60 segundos, quantas acertar" : "Libera no nível 3"}</span></span></button>
      <button class="mode" data-a="ai-lesson-open" ${Store.sample ? "" : "disabled"}><span class="ic">${icon("sparkle")}</span><span><b>Aula sob medida</b><br><span class="small muted">${Store.sample ? "A IA cria uma aula com o tema que você quiser" : "IA indisponível nesta visualização"}</span></span></button>
    </section>
    ${bands}
    <section class="band card"><div class="band-head"><span class="cefr-badge">B2+</span><div style="flex:1;min-width:0"><h3>Avançado com IA</h3><p class="small muted">Aulas sob medida e testes B2, C1 e C2 gerados pela IA.</p></div>${b2 ? "" : `<span class="chip">${icon("lock")} Passe no teste B1</span>`}</div>
      ${b2 ? `<div class="row">${["B2", "C1", "C2"].map((b) => S.cefr.passed[b] ? `<span class="chip ok">${icon("check")} ${b} ${S.cefr.passed[b].score}%</span>` : bandUnlocked(b) ? `<button class="btn small" data-a="ai-test" data-v="${b}" ${Store.sample ? "" : "disabled"}>Teste ${b}</button>` : `<span class="chip">${icon("lock")} ${b}</span>`).join("")}</div>` : ""}</section>
    ${S.aiLessons.length ? `<section class="card stack"><h3>Aulas sob medida</h3>${S.aiLessons.map((u) => unitCard(u, true, true)).join("")}</section>` : ""}
    ${(CUSTOM.lessons || []).length ? `<section class="card stack"><h3>Conteúdo extra</h3>${allUnits().filter((u) => u.custom).map((u) => unitCard(u, true)).join("")}</section>` : ""}
    <section class="card stack"><div class="row between"><h3>Histórico de erros</h3>${S.errors.length ? `<button class="btn small" data-a="errors">Praticar</button>` : ""}</div>
      ${S.errors.length ? `<div class="list">${S.errors.slice(-8).reverse().map((e) => `<div class="li"><div class="grow"><p class="small muted ell">${esc(e.q)}</p><p class="ell"><b>${esc(e.a)}</b> <span class="muted small">você respondeu: ${esc(e.given || "—")}</span></p></div></div>`).join("")}</div>` : '<p class="empty">Seus erros aparecem aqui para você revisar depois.</p>'}</section>`;
}
function unitCard(u, unlocked, del = false) {
  const lv = u.id + "_v", lf = u.id + "_f";
  const pill = (id, kind, label) => { const L = S.lessons[id]; return `<button class="lesson-pill ${L && L.done ? "done" : ""}" data-a="lesson" data-u="${esc(u.id)}" data-k="${kind}" ${unlocked ? "" : "disabled"}>${L && L.done ? icon("check") : icon(kind === "v" ? "book" : "chat")} ${label}${L && L.best ? ` <span class="num small">${L.best}%</span>` : ""}</button>`; };
  return `<div class="unit ${unlocked ? "" : "locked"}" style="padding:10px 0;border-bottom:1px solid var(--line)"><div class="row between"><div style="min-width:0"><b>${esc(u.title)}</b> <span class="chip">${esc(u.cefr || "")}</span><p class="small muted">${esc(u.goal || "")}</p></div>${del ? `<button class="btn ghost small" data-a="ai-lesson-del" data-v="${esc(u.id)}" aria-label="Apagar aula">${icon("x")}</button>` : ""}</div><div class="lessons">${pill(lv, "v", "Vocabulário")}${pill(lf, "f", "Frases e diálogos")}</div></div>`;
}

/* ---------- conversar ---------- */
function vTalk() {
  if (!Chat.scenario) {
    const last = S.convo.sessions.slice(-1)[0];
    return `${head("Conversar", `Pratique com a professora Lia, uma IA que se adapta ao seu nível (${studying()}).`)}
      ${!Store.sample ? `<div class="notice">A professora de IA precisa de uma conta. Vá em Meu Perfil e toque em Entrar.</div>` : ""}
      <section class="grid3">${LUE_SCENARIOS.map((s) => `<button class="mode" data-a="scenario" data-v="${s.id}" ${Store.sample ? "" : "disabled"}><span class="ic">${icon(s.id === "free" ? "chat" : s.id === "interview" ? "user" : s.id === "airport" ? "target" : "speaker")}</span><span><b>${esc(s.title)}</b><br><span class="small muted">${esc(s.desc)}</span></span></button>`).join("")}</section>
      <section class="card stack"><h3>Como funciona</h3><ol class="stack" style="margin:0;padding-left:20px;gap:6px">
        <li>Você escreve${SR_OK ? " ou fala" : ""} em inglês. Pode misturar português quando travar.</li><li>A professora responde no seu nível, com tradução e áudio.</li><li>Quando há um erro importante, ela mostra uma forma mais natural e explica em português.</li><li>Toque em “Praticar esta frase” para repetir a versão corrigida.</li><li>No fim, você recebe notas de gramática, vocabulário e fluência (sotaque não tira ponto).</li></ol>
        <p class="small muted">${S.plan === "premium" ? "Plano Premium: mensagens ilimitadas." : `Plano gratuito: ${Math.max(0, AI_FREE_DAILY - (S.ai.day === today() ? S.ai.n : 0))} de ${AI_FREE_DAILY} mensagens disponíveis hoje.`}${SR_OK ? "" : " O microfone não está disponível nesta visualização; a conversa funciona por texto, com áudio das respostas."}</p></section>
      ${last ? `<section class="card stack"><h3>Última conversa</h3>${scoreBars(last)}</section>` : ""}`;
  }
  const sc = Chat.scenario;
  return `<div class="row between"><div><p class="eyebrow">Conversando · nível ${studying()}</p><h2>${esc(sc.title)}</h2></div><button class="btn" data-a="end-chat">Encerrar e ver notas</button></div>
    <div class="chat" aria-live="polite">${Chat.view.map((m, k) => m.who === "me" ? `<div class="msg me">${esc(m.text)}${m.spoken ? ' <span class="small">(voz)</span>' : ""}</div>` :
      `<div class="msg"><span>${esc(m.en)}</span>${m.pt ? `<details><summary class="small muted" style="cursor:pointer">Tradução</summary><span class="pt">${esc(m.pt)}</span></details>` : ""}<div class="row" style="gap:4px"><button class="btn ghost small" data-a="play" data-text="${esc(m.en)}" aria-label="Ouvir">${icon("speaker")}</button><button class="btn ghost small" data-a="play" data-slow="1" data-text="${esc(m.en)}" aria-label="Ouvir devagar">${icon("slow")}</button></div></div>
      ${m.tip ? `<div class="correction"><b>Dica</b><span>${esc(m.tip)}</span></div>` : ""}
      ${m.corr ? `<div class="correction"><b>Forma mais natural</b><span class="small">Você disse: <s>${esc(m.corr.you_said || "")}</s></span><span>${esc(m.corr.better)} <button class="btn ghost small" data-a="play" data-text="${esc(m.corr.better)}" aria-label="Ouvir">${icon("speaker")}</button></span><span class="small">${esc(m.corr.why_pt || "")}</span><button class="btn small" data-a="practice-phrase" data-v="${esc(m.corr.better)}" style="align-self:flex-start">${icon("repeat")} Praticar esta frase</button></div>` : ""}`).join("")}
      ${Chat.busy ? `<div class="msg"><span class="typing" aria-label="Escrevendo"><i></i><i></i><i></i></span></div>` : ""}
      ${Chat.err ? `<div class="notice">${esc(Chat.err)} ${Chat.retryText ? `<button class="btn small" data-a="chat-retry">Tentar de novo</button>` : ""}</div>` : ""}
      <div id="chat-end"></div></div>
    <form class="composer" id="chat-form"><textarea id="chat-in" placeholder="Escreva em inglês…" aria-label="Sua mensagem" ${Chat.busy ? "disabled" : ""}></textarea>
      ${SR_OK ? `<button type="button" class="btn" id="mic-btn" data-a="chat-mic" aria-label="Falar">${icon("mic")}</button>` : ""}
      <button class="btn primary" type="submit" aria-label="Enviar" ${Chat.busy ? "disabled" : ""}>${icon("send")}</button></form>`;
}

/* ---------- amigos ---------- */
function vFriends() {
  const t = viewState.friendsTab; const online = onlineIds();
  const tabs = `<div class="tabs" role="tablist">${[["amigos", "Amigos"], ["desafios", "Desafios"], ["grupos", "Grupos e equipes"]].map(([k, l]) => `<button role="tab" data-a="ftab" data-v="${k}" aria-selected="${t === k}">${l}</button>`).join("")}</div>`;
  const cloudNote = Store.mode !== "cloud" ? `<div class="notice">Amigos, grupos e desafios online precisam de uma conta. Vá em Meu Perfil e toque em Entrar.</div>` : "";
  let body = "";
  if (t === "amigos") {
    const pend = FREQ_IN.filter((x) => x.status === "pending");
    const outP = FREQ_OUT.filter((x) => x.status === "pending");
    body = `<section class="card stack"><h3>Adicionar amigo</h3><form class="row" id="add-friend" style="flex-wrap:nowrap"><input type="text" id="friend-name" placeholder="Nome de usuário" autocapitalize="off" autocomplete="off"><button class="btn primary" type="submit">Adicionar</button></form>
        <p class="small muted">Seu usuário é <b>@${esc(S.profile.username)}</b> <button class="btn ghost small" data-a="copy" data-v="${esc(S.profile.username)}">Copiar</button>. Para convidar alguém, compartilhe o link deste app e seu usuário.</p>
        ${outP.length ? `<p class="small muted">Pedidos enviados aguardando: ${outP.map((r) => esc(displayPlayer(r.to).u)).join(", ")}</p>` : ""}</section>
      ${pend.length ? `<section class="card stack"><h3>Pedidos de amizade</h3><div class="list">${pend.map((r) => { const p = displayPlayer(r.from); return `<div class="li">${avatarHTML(p, 40)}<div class="grow"><b>${esc(p.u)}</b><p class="small muted">${esc(p.studying || "")} · nível ${p.lv || 1}</p></div><button class="btn small primary" data-a="req-yes" data-v="${r.id}">Aceitar</button><button class="btn small" data-a="req-no" data-v="${r.id}">Recusar</button></div>`; }).join("")}</div></section>` : ""}
      <section class="card stack"><div class="row between"><h3>Seus amigos</h3><span class="small muted">${S.friends.length}</span></div>
        ${S.friends.length ? `<div class="list">${S.friends.map((id) => { const p = displayPlayer(id); const wx = p.week && p.week.k === wk() ? p.week.xp : 0; return `<div class="li">${avatarHTML(p, 44, !!online[id])}<div class="grow"><b class="ell">${esc(p.u)}</b>${p.ti ? ` <span class="chip small">${esc(p.ti)}</span>` : ""}<p class="small muted ell">${online[id] ? esc(online[id]) : `${p.cefr ? "Certificado " + esc(p.cefr) : "Estudando " + esc(p.studying || "A1")} · ${p.streak || 0} dias de sequência · ${wx} XP na semana`}</p></div>
          <button class="btn small" data-a="cheer" data-v="${id}">Incentivar</button><button class="btn small" data-a="duel-new" data-v="${id}">${icon("swords")} Desafiar</button><button class="btn ghost small" data-a="friend-rm" data-v="${id}" aria-label="Remover amigo">${icon("x")}</button></div>`; }).join("")}</div>` : `<p class="empty">Adicione amigos pelo nome de usuário para estudar juntos, se desafiar e acompanhar a evolução de cada um.</p>`}</section>`;
  } else if (t === "desafios") {
    const pending = DUELS_IN.filter((d) => !(d.results || {})[Store.uid]);
    const mine = [...DUELS_OUT, ...DUELS_IN.filter((d) => (d.results || {})[Store.uid])].sort((a, b) => b.at - a.at).slice(0, 12);
    body = `<section class="grid2"><div class="card stack"><h3>Novo desafio</h3><p class="small muted">8 perguntas iguais para os dois. Pontua quem acerta (e quem responde rápido, se ativar o tempo). No fim, todos veem o gabarito com explicações.</p><button class="btn primary" data-a="duel-new">${icon("swords")} Criar desafio</button></div>
      <div class="card stack"><h3>Entrar com código</h3><form class="row" id="duel-code" style="flex-wrap:nowrap"><input type="text" id="duel-code-in" placeholder="Código do desafio" autocapitalize="off"><button class="btn" type="submit">Jogar</button></form><p class="small muted">Recorde: <b class="num">${S.duels.w}</b> vitórias · <b class="num">${S.duels.l}</b> derrotas · ${S.duels.played} jogados</p></div></section>
      <section class="card stack"><h3>Convites para você</h3>${pending.length ? `<div class="list">${pending.map((d) => { const p = displayPlayer(d.from); return `<div class="li">${avatarHTML(p, 40)}<div class="grow"><b>${esc(p.u)}</b><p class="small muted">${DUEL_MODES[d.mode]}${d.timer ? " · com tempo" : ""}</p></div><button class="btn small primary" data-a="duel-play" data-v="${esc(d.id)}">Jogar</button></div>`; }).join("")}</div>` : '<p class="empty">Nenhum convite agora.</p>'}</section>
      <section class="card stack"><h3>Seus desafios</h3>${mine.length ? `<div class="list">${mine.map((d) => { const res = d.results || {}; const me = res[Store.uid]; const opId = Object.keys(res).find((i) => i !== Store.uid) || (d.from === Store.uid ? d.to : d.from); const op = opId ? res[opId] : null; const st = !me ? "Você ainda não jogou" : !op ? "Aguardando oponente" : me.score > op.score ? "Vitória" : me.score < op.score ? "Derrota" : "Empate"; return `<div class="li"><span class="chip ${st === "Vitória" ? "ok" : st === "Derrota" ? "bad" : ""}">${st}</span><div class="grow"><b>${opId ? esc(displayPlayer(opId).u) : "Aberto"}</b> <span class="small muted">· ${DUEL_MODES[d.mode]} · código ${esc(d.id)}</span></div><button class="btn small" data-a="${me ? "duel-result" : "duel-play"}" data-v="${esc(d.id)}">${me ? "Ver" : "Jogar"}</button></div>`; }).join("")}</div>` : '<p class="empty">Seus desafios aparecem aqui.</p>'}</section>`;
  } else {
    body = `<section class="grid2"><div class="card stack"><h3>Criar grupo</h3><p class="small muted">Sala privada de estudo com meta semanal coletiva. Os grupos competem entre si no ranking de equipes.</p><button class="btn primary" data-a="group-new">${icon("plus")} Criar grupo</button></div>
      <div class="card stack"><h3>Entrar em um grupo</h3><form class="row" id="group-join" style="flex-wrap:nowrap"><input type="text" id="group-code" placeholder="Código do grupo" autocapitalize="off"><button class="btn" type="submit">Entrar</button></form></div></section>
      <section class="card stack"><h3>Seus grupos</h3>${S.groups.length ? `<div class="list">${S.groups.map((c) => { const g = GROUP_CACHE[c]; return `<div class="li"><span class="ic">${icon("users")}</span><div class="grow"><b>${g ? esc(g.name) : "Grupo " + esc(c)}</b><p class="small muted">${g ? `${g.members.length} membros · ${g.weekly}/${g.goal} XP na semana` : "Toque para abrir"}</p></div><button class="btn small" data-a="group-open" data-v="${esc(c)}">Abrir</button></div>`; }).join("")}</div>` : '<p class="empty">Você ainda não está em nenhum grupo.</p>'}</section>
      <section class="card stack"><div class="row between"><h3>Competição entre equipes</h3><button class="btn small" data-a="teams-load">Atualizar</button></div>
        ${viewState.teams ? (viewState.teams.length ? `<div class="list">${viewState.teams.map((g, k) => `<div class="li"><span class="pos ${k === 0 ? "p1" : ""}">${k + 1}</span><div class="grow"><b>${esc(g.name)}</b><p class="small muted">${g.members.length} membros · meta ${g.goal} XP</p></div><span class="chip xp num">${g.weekly} XP</span></div>`).join("")}</div>` : '<p class="empty">Nenhum grupo criado ainda.</p>') : '<p class="small muted">Toque em Atualizar para ver a classificação semanal dos grupos.</p>'}</section>`;
  }
  return `${head("Aprenda com Amigos", "Estude junto, mande incentivos e dispute desafios.")}${cloudNote}${tabs}${body}`;
}

/* ---------- ranking ---------- */
function vRanking() {
  const { rankScope: sc, rankPeriod: per, rankCrit: cr } = viewState; const crit = CRITS[cr];
  const scopeTabs = `<div class="tabs" role="tablist">${[["global", "Geral"], ["friends", "Amigos"], ["teams", "Equipes"]].map(([k, l]) => `<button role="tab" data-a="rscope" data-v="${k}" aria-selected="${sc === k}">${l}</button>`).join("")}</div>`;
  if (sc === "teams") return `${head("Ranking", "Classificação semanal dos grupos de estudo.")}${scopeTabs}<section class="card stack"><div class="row between"><h3>Equipes nesta semana</h3><button class="btn small" data-a="teams-load">Atualizar</button></div>${viewState.teams ? (viewState.teams.length ? `<div class="list">${viewState.teams.map((g, k) => `<div class="rank-row"><span class="pos ${k === 0 ? "p1" : ""}">${k + 1}</span><span class="ic">${icon("users")}</span><div style="min-width:0"><b class="ell">${esc(g.name)}</b><p class="small muted">${g.members.length} membros</p></div><b class="num">${g.weekly} XP</b></div>`).join("")}</div>` : '<p class="empty">Nenhum grupo ainda. Crie um em Amigos.</p>') : '<p class="small muted">Toque em Atualizar para carregar.</p>'}</section>`;
  const rows = rankingRows(per, sc, cr); const meId = Store.uid || "me"; const myPos = rows.findIndex((r) => r.p.id === meId);
  const top = rows.slice(0, 3);
  const podium = rows.length >= 3 ? `<div class="podium">${[1, 0, 2].map((k) => { const r = top[k]; return `<div class="col ${k === 0 ? "first" : ""}">${avatarHTML(r.p, k === 0 ? 60 : 48)}<b class="ell" style="max-width:100%">${esc(r.p.u)}</b><span class="small muted num">${r.v} ${crit.unit}</span><div class="block">${k + 1}º</div></div>`; }).join("")}</div>` : "";
  return `${head("Ranking", "Valoriza aprendizagem real: acertos, revisões e constância, não cliques.")}${scopeTabs}
    <section class="card stack">
      <div class="row between"><div class="seg" role="group" aria-label="Período">${[["day", "Hoje"], ["week", "Semana"], ["month", "Mês"], ["all", "Geral"]].map(([k, l]) => `<button data-a="rper" data-v="${k}" aria-pressed="${per === k}" ${crit.periods ? "" : "disabled"}>${l}</button>`).join("")}</div>
        <select id="rank-crit" aria-label="Critério" style="width:auto">${Object.entries(CRITS).map(([k, c]) => `<option value="${k}" ${cr === k ? "selected" : ""}>${c.name}</option>`).join("")}</select></div>
      ${!crit.periods ? `<p class="small muted">${cr === "cons" ? "Dias com estudo nos últimos 30 dias." : cr === "mastery" ? "Soma das melhores notas nos testes de nível: premia quem domina mais etapas." : "Quantas etapas CEFR a pessoa certificou desde o início."}</p>` : ""}
      ${myPos >= 0 ? `<div class="notice info">Sua posição: <b>${myPos + 1}º</b> de ${rows.length} · <span class="num">${rows[myPos].v}</span> ${crit.unit}</div>` : `<div class="notice">Você está oculto do ranking (ajuste em Meu Perfil).</div>`}
      ${podium}
      <div class="list">${rows.map((r, k) => `<div class="rank-row ${r.p.id === meId ? "me" : ""}"><span class="pos ${k === 0 ? "p1" : ""}">${k + 1}</span>${avatarHTML(r.p, 40)}<div style="min-width:0"><b class="ell">${esc(r.p.u)}${r.p.id === meId ? " (você)" : ""}</b><p class="small muted ell">${r.p.ti ? esc(r.p.ti) + " · " : ""}${r.p.cefr ? "Certificado " + esc(r.p.cefr) : "Estudando " + esc(r.p.studying || "A1")} · acerto ${r.p.acc || 0}%</p></div><div class="row" style="gap:4px"><b class="num">${r.v}</b>${r.p.id !== meId && Store.mode === "cloud" ? `<button class="btn ghost small" data-a="report" data-v="${r.p.id}" aria-label="Denunciar">${icon("flag")}</button>` : ""}</div></div>`).join("") || '<p class="empty">Ninguém por aqui ainda.</p>'}</div>
      ${Store.mode !== "cloud" ? '<p class="small muted">Modo sem conta: o ranking com outras pessoas aparece quando você entra com uma conta.</p>' : ""}
    </section>
    <section class="card stack"><h3>Como garantimos um ranking justo</h3><ul class="stack small" style="margin:0;padding-left:20px;gap:4px"><li>O XP vem de respostas certas, revisões e conversas; respostas rápidas demais não contam.</li><li>Repetir a mesma lição várias vezes no dia rende menos XP, e o XP diário diminui depois de 800 pontos.</li><li>Rankings de domínio e evolução usam só testes de nível, não tempo de uso.</li><li>Não é possível comprar posição. Contas suspeitas podem ser denunciadas e removidas pelo administrador.</li></ul></section>`;
}

/* ---------- missões ---------- */
function vMissions() {
  const comm = Store.mode === "cloud" ? sum(PLAYERS.map((p) => p.week && p.week.k === wk() ? p.week.l || 0 : 0)) : weekField("l");
  const target = Math.max(30, (Store.mode === "cloud" ? PLAYERS.length : 1) * 10);
  return `${head("Missões do Dia", "Metas ajustadas ao seu tempo diário de " + S.profile.minutes + " minutos.")}
    <section class="card stack"><div class="row between"><h3>Hoje</h3><span class="small muted">Cada missão: +15 XP e 10 moedas</span></div>${S.missions.list.map(missionRow).join("")}</section>
    <section class="card stack"><div class="row between"><h3>Missões da semana</h3><span class="small muted">Cada uma: +60 XP e 40 moedas</span></div>
      ${S.missions.wlist.map((mi) => { const def = WEEK_DEFS[mi.id]; const pr = weekMissionProgress(mi); const done = pr >= mi.n; return `<div class="stack" style="gap:6px;padding:6px 0"><div class="row between"><span style="font-weight:600">${esc(def.t(mi.n))}</span>${mi.claimed ? `<span class="chip ok">${icon("check")} Feito</span>` : done ? `<button class="btn small primary" data-a="wclaim" data-v="${mi.id}">Resgatar</button>` : `<span class="small muted num">${pr}/${mi.n}</span>`}</div><div class="bar ${done ? "ok" : ""}"><i style="width:${(pr / mi.n) * 100}%"></i></div></div>`; }).join("")}</section>
    <section class="card stack"><p class="eyebrow" style="color:var(--brand)">Evento da semana · desafio coletivo</p><h3>Maratona da Comunidade</h3><p class="muted">Todo mundo junto: a comunidade precisa completar ${target} lições até domingo. Quem contribuir com pelo menos 3 lições ganha 100 moedas.</p>
      <div class="row between"><b class="num">${comm} / ${target} lições</b><span class="small muted">Sua parte: ${weekField("l")}</span></div><div class="bar xp"><i style="width:${Math.min(100, (comm / target) * 100)}%"></i></div>
      ${comm >= target && weekField("l") >= 3 ? (S.missions.claimedEvent === wk() ? `<span class="chip ok">${icon("check")} Recompensa resgatada</span>` : `<button class="btn primary" data-a="event-claim">Resgatar 100 moedas</button>`) : ""}</section>
    <p class="small muted">Missões concluídas no total: ${S.tot.missions}. As metas se ajustam ao tempo diário escolhido no seu perfil.</p>`;
}

/* ---------- recompensas ---------- */
function vRewards() {
  const L = levelOf(S.xp); const t = viewState.rewardsTab; const passed = CEFR.filter((b) => S.cefr.passed[b]);
  const shopTab = (key, label) => `<button role="tab" data-a="rtab" data-v="${key}" aria-selected="${t === key}">${label}</button>`;
  let shop = "";
  const buyBtn = (cat, it, owned, on) => on ? `<span class="chip brand">Em uso</span>` : owned ? `<button class="btn small" data-a="equip" data-c="${cat}" data-v="${esc(it.id)}">Usar</button>` : !itemUnlocked(it) ? `<span class="chip">${icon("lock")} ${it.lvl ? "Nível " + it.lvl : esc((ACH.find((a) => a.id === it.req) || { name: "Viajante: conclua as unidades de viagem" }).name)}</span>` : it.price ? `<button class="btn small primary" data-a="buy" data-c="${cat}" data-v="${esc(it.id)}" ${S.coins >= it.price ? "" : "disabled"}>${icon("coin")} ${it.price}</button>` : `<button class="btn small" data-a="buy" data-c="${cat}" data-v="${esc(it.id)}">Pegar</button>`;
  if (t === "avatares") shop = `<p class="small muted">Formato</p><div class="medals">${SHOP.shapes.map((it) => `<div class="shop-item ${S.profile.avatar.shape === it.id ? "on" : ""}">${avatarSVG({ shape: it.id, color: S.profile.avatar.color }, 52, S.profile.username)}<b class="small">${it.name}</b>${buyBtn("shapes", it, S.owned.shapes.includes(it.id), S.profile.avatar.shape === it.id)}</div>`).join("")}</div>
    <p class="small muted">Cor</p><div class="row">${AV_COLORS.map((c) => `<button class="btn ghost" data-a="av-color" data-v="${c}" aria-label="Cor ${c}" style="padding:4px;${S.profile.avatar.color === c ? "outline:3px solid var(--brand)" : ""}"><span style="display:block;width:30px;height:30px;border-radius:50%;background:${c}"></span></button>`).join("")}</div>`;
  if (t === "molduras") shop = `<div class="medals">${SHOP.frames.map((it) => `<div class="shop-item ${S.profile.frame === it.id ? "on" : ""}">${avatarHTML({ u: S.profile.username, av: S.profile.avatar, fr: it.id }, 52)}<b class="small">${it.name}</b>${buyBtn("frames", it, S.owned.frames.includes(it.id), S.profile.frame === it.id)}</div>`).join("")}</div>`;
  if (t === "temas") shop = `<div class="medals">${SHOP.themes.map((it) => `<div class="shop-item ${S.profile.accent === it.id ? "on" : ""}"><span style="width:52px;height:52px;border-radius:14px;background:${{ azul: "#3152F5", coral: "#D9480F", menta: "#087F5B", violeta: "#6741D9", ouro: "#E59A00" }[it.id]}"></span><b class="small">${it.name}</b>${buyBtn("themes", it, S.owned.themes.includes(it.id), S.profile.accent === it.id)}</div>`).join("")}</div>`;
  if (t === "titulos") shop = `<div class="list">${SHOP.titles.map((it) => `<div class="li"><div class="grow"><b>${esc(it.id)}</b><p class="small muted">Aparece ao lado do seu nome no ranking</p></div>${buyBtn("titles", { ...it, price: it.price || 0 }, S.owned.titles.includes(it.id), S.profile.title === it.id)}</div>`).join("")}</div>`;
  if (t === "itens") shop = `<div class="li"><span class="ic">${icon("shield")}</span><div class="grow"><b>Protetor de sequência</b><p class="small muted">Salva sua sequência se você perder um dia. Você tem ${S.streak.freezes} (máx. 2).</p></div><button class="btn small primary" data-a="buy-freeze" ${S.coins >= 50 && S.streak.freezes < 2 ? "" : "disabled"}>${icon("coin")} 50</button></div>
    <div class="li"><span class="ic">${icon("bolt")}</span><div class="grow"><b>Desafio relâmpago</b><p class="small muted">Desafio especial desbloqueado no nível 3.</p></div>${levelOf(S.xp).n >= 3 ? `<button class="btn small" data-a="blitz">Jogar</button>` : `<span class="chip">${icon("lock")} Nível 3</span>`}</div>`;
  return `${head("Recompensas", "Medalhas por dedicação e por domínio do idioma.", `<span class="chip xp" style="font-size:1rem">${icon("coin")} <span class="num">${S.coins}</span> moedas</span>`)}
    <section class="card row" style="gap:18px">${avatarHTML(meCard(), 64)}<div class="stack" style="gap:4px;flex:1;min-width:0"><p class="eyebrow">Nível ${L.n} de 7</p><h2>${L.name}</h2><div class="bar xp"><i style="width:${nextLevel(S.xp) ? Math.round(((S.xp - L.xp) / (nextLevel(S.xp).xp - L.xp)) * 100) : 100}%"></i></div><p class="small muted">${LEVELS.map((l) => `<span style="${l.n === L.n ? "color:var(--ink);font-weight:700" : ""}">${l.n}. ${l.name}</span>`).join(" · ")}</p></div></section>
    <section class="card stack"><div class="row between"><h3>Medalhas</h3><span class="small muted">${Object.keys(S.ach).length} de ${ACH.length}</span></div><div class="medals">${ACH.map((a) => `<div class="medal ${S.ach[a.id] ? "" : "locked"}" title="${esc(a.desc)}">${medalSVG(a)}<b class="small">${esc(a.name)}</b><span class="small muted">${S.ach[a.id] ? "Conquistada" : esc(a.desc)}</span><span class="chip small">${a.kind}</span></div>`).join("")}</div></section>
    <section class="card stack"><h3>Certificados de etapa</h3>${passed.length ? `<div class="list">${passed.map((b) => `<div class="li"><span class="cefr-badge">${b}</span><div class="grow"><b>Etapa ${b} concluída</b><p class="small muted">${S.cefr.passed[b].score}% em ${esc(S.cefr.passed[b].at)}</p></div><button class="btn small" data-a="cert" data-v="${b}">Ver</button></div>`).join("")}</div>` : '<p class="empty">Passe em um teste de nível (em Aprender) para ganhar seu primeiro certificado.</p>'}</section>
    <section class="card stack"><h3>Loja</h3><div class="tabs" role="tablist">${shopTab("avatares", "Avatares")}${shopTab("molduras", "Molduras")}${shopTab("temas", "Temas")}${shopTab("titulos", "Títulos")}${shopTab("itens", "Itens")}</div>${shop}<p class="small muted">Moedas só vêm de estudo: missões, medalhas e testes. Não há como comprar moedas nem posição no ranking.</p></section>`;
}

/* ---------- perfil ---------- */
function vProfile() {
  const p = S.profile; const L = levelOf(S.xp);
  const sw = (id, on, label, sub) => `<label class="toggle"><span><b>${label}</b><br><span class="small muted">${sub}</span></span><input type="checkbox" class="switch" data-a="pref-toggle" data-v="${id}" ${on ? "checked" : ""}></label>`;
  return `${head("Meu Perfil")}
    <section class="card row" style="gap:16px">${avatarHTML(meCard(), 72)}<div class="stack" style="gap:4px;flex:1;min-width:0"><h2>@${esc(p.username)}</h2><p class="muted">${esc(p.title)} · Nível ${L.n} (${L.name})</p><p class="small">${cefrText()}</p></div><button class="btn" data-a="go" data-v="progress">${icon("chart")} Painel de progresso</button></section>
    <section class="card stack"><h3>Seu plano de estudos</h3>
      <div class="stack" style="gap:6px"><b class="small">Objetivo</b><div class="seg">${[["viagem", "Viajar"], ["trabalho", "Trabalho"], ["conversa", "Conversar"], ["estudos", "Estudos"], ["entrevistas", "Entrevistas"]].map(([v, l]) => `<button data-a="pset" data-k="goal" data-v="${v}" aria-pressed="${p.goal === v}">${l}</button>`).join("")}</div></div>
      <div class="stack" style="gap:6px"><b class="small">Tempo por dia</b><div class="seg">${[5, 10, 15, 30].map((m) => `<button data-a="pset" data-k="minutes" data-v="${m}" aria-pressed="${p.minutes === m}">${m} min</button>`).join("")}</div></div>
      <div class="stack" style="gap:6px"><b class="small">Prefere estudar</b><div class="seg">${[["sozinho", "Sozinho"], ["amigos", "Com amigos"], ["ambos", "Os dois"]].map(([v, l]) => `<button data-a="pset" data-k="pref" data-v="${v}" aria-pressed="${p.pref === v}">${l}</button>`).join("")}</div></div>
      <div class="stack" style="gap:6px"><b class="small">Velocidade do áudio</b><div class="seg">${[["0.8", "Mais devagar"], ["1", "Normal"], ["1.15", "Mais rápido"]].map(([v, l]) => `<button data-a="pset" data-k="rate" data-v="${v}" aria-pressed="${String(p.rate) === v}">${l}</button>`).join("")}</div></div>
      <button class="btn" data-a="placement" style="align-self:flex-start">${icon("target")} Refazer teste de nivelamento</button></section>
    <section class="card stack"><h3>Aparência</h3><div class="seg">${[["system", "Automático"], ["light", "Claro"], ["dark", "Escuro"]].map(([v, l]) => `<button data-a="pset" data-k="theme" data-v="${v}" aria-pressed="${p.theme === v}">${l}</button>`).join("")}</div><div class="row"><button class="btn" data-a="snd-toggle" aria-pressed="${p.sound !== false}">${icon(p.sound !== false ? "speaker" : "mute")} Sons ${p.sound !== false ? "ligados" : "desligados"}</button><button class="btn" data-a="music" aria-pressed="${p.music !== false}">${icon(p.music !== false ? "note" : "mute")} Música nas lições ${p.music !== false ? "ligada" : "desligada"}</button></div>
      <p class="small muted">Avatar, moldura, tema de cores e título ficam em <button class="btn ghost small" data-a="go" data-v="rewards">Recompensas</button>.</p></section>
    <section class="card stack"><h3>Privacidade</h3>
      ${sw("priv", p.priv, "Perfil privado", "Some do ranking geral e da busca; só seus amigos te veem.")}
      ${sw("reqs", p.reqs !== false, "Aceitar pedidos de amizade", "Desligue para ninguém novo conseguir te adicionar.")}
      ${sw("showRank", p.showRank !== false, "Aparecer no ranking", "Desligue para estudar sem competir.")}</section>
    <section class="card stack"><div class="row between"><h3>Plano</h3><span class="chip ${S.plan === "premium" ? "xp" : ""}">${S.plan === "premium" ? "Premium" : "Gratuito"}</span></div><p class="small muted">Lições, missões, ranking e desafios são sempre gratuitos.</p><button class="btn" data-a="go" data-v="plans" style="align-self:flex-start">Comparar planos</button></section>
    <section class="card stack"><h3>Conta</h3><p class="small muted">${Store.mode === "cloud" ? "Você entrou com seu e-mail. Seu progresso é salvo na nuvem e continua de onde parou em qualquer aparelho." : "Modo sem conta: o progresso está salvo só neste aparelho. Entre com uma conta para salvar na nuvem."}</p>
      ${viewState.confirmReset ? `<div class="notice">Isso apaga todo o seu progresso, XP, medalhas e moedas. Não dá para desfazer.<div class="row" style="margin-top:8px"><button class="btn danger" data-a="reset-yes">Apagar tudo</button><button class="btn" data-a="reset-no">Cancelar</button></div></div>` : `<button class="btn danger" data-a="reset" style="align-self:flex-start">Recomeçar do zero</button>`}
      ${window.LUE_STANDALONE ? (Store.mode === "cloud" ? `<button class="btn" data-a="logout" style="align-self:flex-start">Sair da conta</button>` : `<button class="btn primary" data-a="login" style="align-self:flex-start">Entrar ou criar conta</button>`) : ""}</section>`;
}

/* ---------- painel de progresso ---------- */
function lastDays(n) { return Array.from({ length: n }, (_, i) => addDays(today(), i - n + 1)); }
function barChart(vals, labels, color = "var(--brand)", unit = "") {
  const w = 640, h = 170, l = 34, b = 22, t = 12; const max = Math.max(1, ...vals); const nice = Math.ceil(max / 10) * 10 || 10;
  const bw = (w - l - 8) / vals.length;
  let s = `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img">`;
  for (const f of [0, 0.5, 1]) { const y = t + (h - t - b) * (1 - f); s += `<line x1="${l}" x2="${w - 4}" y1="${y}" y2="${y}" stroke="var(--line)"/><text x="${l - 6}" y="${y + 3}" text-anchor="end">${Math.round(nice * f)}</text>`; }
  vals.forEach((v, i) => { const bh = (h - t - b) * (v / nice); const x = l + i * bw + bw * 0.18; s += `<rect x="${x}" y="${h - b - bh}" width="${bw * 0.64}" height="${Math.max(0, bh)}" rx="3" fill="${color}"><title>${labels[i]}: ${v}${unit}</title></rect>`; if (i % 2 === (vals.length - 1) % 2) s += `<text x="${x + bw * 0.32}" y="${h - 6}" text-anchor="middle">${labels[i]}</text>`; });
  return s + "</svg>";
}
function lineChart(series, labels) {
  const w = 640, h = 170, l = 34, b = 22, t = 12; const n = labels.length; const step = (w - l - 12) / Math.max(1, n - 1);
  let s = `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img">`;
  for (const f of [0, 0.5, 1]) { const y = t + (h - t - b) * (1 - f); s += `<line x1="${l}" x2="${w - 4}" y1="${y}" y2="${y}" stroke="var(--line)"/><text x="${l - 6}" y="${y + 3}" text-anchor="end">${Math.round(100 * f)}%</text>`; }
  labels.forEach((lb, i) => { if (i % 2 === (n - 1) % 2) s += `<text x="${l + i * step}" y="${h - 6}" text-anchor="middle">${lb}</text>`; });
  for (const se of series) {
    const pts = se.vals.map((v, i) => v == null ? null : [l + i * step, t + (h - t - b) * (1 - v)]);
    let path = ""; pts.forEach((p) => { if (p) path += (path ? " L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); });
    if (path) s += `<path d="${path}" fill="none" stroke="${se.color}" stroke-width="2.5" stroke-linejoin="round"/>`;
    pts.forEach((p, i) => { if (p) s += `<circle cx="${p[0]}" cy="${p[1]}" r="${i === pts.length - 1 ? 4.5 : 3}" fill="${se.color}"><title>${labels[i]}: ${Math.round(se.vals[i] * 100)}%</title></circle>`; });
  }
  return s + "</svg>";
}
function vProgress() {
  const days = lastDays(14); const lbl = days.map((k) => k.slice(8)); const DD = (k) => S.days[k] || {};
  const xp = days.map((k) => DD(k).xp || 0); const acc = days.map((k) => DD(k).t ? DD(k).c / DD(k).t : null);
  const lis = days.map((k) => { const s = (DD(k).sk || {}).listen; return s && s[1] ? s[0] / s[1] : null; });
  const totalMin = Math.round(sum(Object.values(S.days).map((d) => d.sec || 0)) / 60);
  const skills = { vocab: "Vocabulário", listen: "Escuta", grammar: "Gramática", writing: "Escrita", speaking: "Conversação e pronúncia" };
  const sk = {}; for (const k of lastDays(30)) for (const [name, v] of Object.entries(DD(k).sk || {})) { sk[name] = sk[name] || [0, 0]; sk[name][0] += v[0]; sk[name][1] += v[1]; }
  const skRows = Object.entries(skills).map(([k, l]) => ({ k, l, c: (sk[k] || [0, 0])[0], t: (sk[k] || [0, 0])[1] })).map((r) => ({ ...r, a: r.t ? r.c / r.t : null }));
  const known = skRows.filter((r) => r.t >= 5).sort((a, b) => b.a - a.a);
  const ses = S.convo.sessions.slice(-10);
  const reviewed = Object.values(S.words).filter((w) => w.right > 1).length;
  const rank = myRank("week");
  return `${head("Painel de progresso", "Seu nível vem dos testes e das conversas, não do número de aulas.", `<button class="btn" data-a="go" data-v="profile">${icon("back")} Perfil</button>`)}
    <section class="card stack"><p class="eyebrow">Nível de inglês (escala compatível com o CEFR)</p>${cefrTape()}<p>${cefrText()}</p><p class="small muted">Nunca declaramos fluência por pontos ou aulas: cada etapa só é certificada com aprovação de 80% no teste de nível.</p></section>
    <section class="stats">
      <div class="card stat"><span class="muted small">XP total</span><b class="num">${S.xp}</b></div>
      <div class="card stat"><span class="muted small">Ranking semanal</span><b class="num">${rank ? rank + "º" : "—"}</b></div>
      <div class="card stat"><span class="muted small">Sequência</span><b class="num">${streakAlive()} d</b><span class="small muted">recorde ${S.streak.best}</span></div>
      <div class="card stat"><span class="muted small">Minutos de prática</span><b class="num">${totalMin}</b></div>
      <div class="card stat"><span class="muted small">Palavras aprendidas</span><b class="num">${learnedCount()}</b><span class="small muted">${reviewed} revisadas</span></div>
      <div class="card stat"><span class="muted small">Taxa de acertos</span><b class="num">${Math.round(totalAccuracy() * 100)}%</b></div>
      <div class="card stat"><span class="muted small">Lições</span><b class="num">${S.tot.lessons}</b></div>
      <div class="card stat"><span class="muted small">Conversas com IA</span><b class="num">${S.convo.sessions.length}</b></div>
    </section>
    <section class="grid2"><div class="card stack"><h3>XP por dia</h3><p class="small muted">Últimos 14 dias · meta diária ${dailyGoalXP()} XP</p>${barChart(xp, lbl, "var(--xp)", " XP")}</div>
      <div class="card stack"><h3>Acertos e escuta</h3><p class="small muted"><span style="color:var(--brand);font-weight:700">●</span> acertos gerais <span style="color:var(--ok);font-weight:700;margin-left:8px">●</span> compreensão auditiva</p>${lineChart([{ vals: acc, color: "var(--brand)" }, { vals: lis, color: "var(--ok)" }], lbl)}</div></section>
    <section class="grid2"><div class="card stack"><h3>Evolução da conversação</h3>${ses.length ? `<p class="small muted">Média de gramática, vocabulário e fluência por conversa (0 a 5).</p>${barChart(ses.map((s) => Math.round(((s.g + s.v + s.f) / 3) * 10) / 10), ses.map((s) => s.at.slice(5).replace("-", "/")), "var(--brand)", " / 5")}` : '<p class="empty">Converse com a professora de IA para ver sua evolução aqui.</p>'}</div>
      <div class="card stack"><h3>Pontos fortes e dificuldades</h3><p class="small muted">Últimos 30 dias</p>${skRows.map((r) => `<div class="stack" style="gap:4px"><div class="row between"><span>${r.l}</span><span class="small num">${r.a == null ? "sem dados" : Math.round(r.a * 100) + "%"}</span></div><div class="bar ${r.a != null && r.a >= 0.8 ? "ok" : ""}"><i style="width:${(r.a || 0) * 100}%"></i></div></div>`).join("")}
        ${known.length >= 2 ? `<p class="small">Ponto forte: <b>${known[0].l}</b>. Para treinar: <b>${known[known.length - 1].l}</b>.</p>` : ""}</div></section>
    <section class="grid2"><div class="card stack"><h3>Metas</h3><div class="row between"><span>Hoje</span><b class="num">${D().xp} / ${dailyGoalXP()} XP</b></div><div class="bar xp"><i style="width:${Math.min(100, (D().xp / dailyGoalXP()) * 100)}%"></i></div><div class="row between"><span>Semana</span><b class="num">${weekXP()} / ${dailyGoalXP() * 5} XP</b></div><div class="bar xp"><i style="width:${Math.min(100, (weekXP() / (dailyGoalXP() * 5)) * 100)}%"></i></div></div>
      <div class="card stack"><h3>Histórico de conquistas</h3>${Object.keys(S.ach).length ? `<div class="list">${Object.entries(S.ach).sort((a, b) => b[1].localeCompare(a[1])).slice(0, 8).map(([id, at]) => { const a = ACH.find((x) => x.id === id); return a ? `<div class="li">${medalSVG(a, true, "icon")}<div class="grow"><b>${esc(a.name)}</b></div><span class="small muted">${esc(at)}</span></div>` : ""; }).join("")}</div>` : '<p class="empty">Suas medalhas aparecem aqui.</p>'}</div></section>`;
}

/* ---------- planos ---------- */
function vPlans() {
  const row = (f, free, prem) => `<div class="li"><div class="grow">${f}</div><span style="width:110px;text-align:center">${free}</span><span style="width:110px;text-align:center">${prem}</span></div>`;
  const y = `<span class="chip ok">${icon("check")}</span>`, n = '<span class="muted">—</span>';
  return `${head("Planos", "O progresso básico é sempre gratuito.", `<button class="btn" data-a="go" data-v="profile">${icon("back")} Perfil</button>`)}
    <section class="card stack"><div class="li" style="font-weight:800"><div class="grow">Recurso</div><span style="width:110px;text-align:center">Gratuito</span><span style="width:110px;text-align:center">Premium</span></div>
      ${row("Lições essenciais A1 a B1", y, y)}${row("Missões diárias e semanais", y, y)}${row("Rankings e desafios com amigos", y, y)}${row("Testes de nível e certificados", y, y)}
      ${row("Conversa com a professora de IA", AI_FREE_DAILY + "/dia", "Ilimitada")}${row("Aulas sob medida com IA", "Dentro do limite", "Ilimitadas")}${row("Trilhas personalizadas e relatórios avançados", n, y)}${row("Mais exercícios de pronúncia", n, y)}${row("Sem anúncios", "Sem anúncios", y)}</section>
    <div class="notice info">Seu plano atual: <b>${S.plan === "premium" ? "Premium" : "Gratuito"}</b>. A assinatura Premium é ativada pelo pagamento na versão publicada do app (Stripe, configurado no código-fonte). Não existe nenhuma forma de comprar XP, moedas ou posição no ranking.</div>`;
}

/* ---------- administração ---------- */
function vAdmin() {
  if (!Store.isOwner) return `${head("Administração")}<p class="empty">Somente o dono do app acessa esta área.</p>`;
  const t = viewState.adminTab;
  const tabs = `<div class="tabs" role="tablist">${[["usuarios", "Usuários"], ["denuncias", "Denúncias"], ["conteudo", "Conteúdo"], ["recompensas", "Recompensas"]].map(([k, l]) => `<button role="tab" data-a="atab" data-v="${k}" aria-selected="${t === k}">${l}</button>`).join("")}</div>`;
  let body = "";
  if (t === "usuarios") {
    const act = PLAYERS.filter((p) => p.day && p.day.k === today()).length;
    body = `<section class="stats"><div class="card stat"><span class="muted small">Usuários</span><b class="num">${PLAYERS.length}</b></div><div class="card stat"><span class="muted small">Ativos hoje</span><b class="num">${act}</b></div><div class="card stat"><span class="muted small">Ocultos</span><b class="num">${Object.keys(MOD.hidden || {}).length}</b></div><div class="card stat"><span class="muted small">XP médio</span><b class="num">${PLAYERS.length ? Math.round(sum(PLAYERS.map((p) => p.xp || 0)) / PLAYERS.length) : 0}</b></div></section>
      <section class="card stack"><h3>Usuários</h3><div class="list">${PLAYERS.slice().sort((a, b) => (b.xp || 0) - (a.xp || 0)).map((p) => { const sus = p.day && p.day.k === today() && p.day.xp > 1500; return `<div class="li">${avatarHTML(p, 36)}<div class="grow"><b>${esc(p.u)}</b> ${sus ? '<span class="chip bad">XP alto hoje</span>' : ""}${MOD.hidden[p.id] ? '<span class="chip">Oculto</span>' : ""}<p class="small muted">${p.xp || 0} XP · acerto ${p.acc || 0}% · ${p.lessons || 0} lições · visto ${p.upd ? new Date(p.upd).toLocaleDateString("pt-BR") : "—"}</p></div><button class="btn small" data-a="mod-hide" data-v="${p.id}">${MOD.hidden[p.id] ? "Mostrar no ranking" : "Ocultar do ranking"}</button></div>`; }).join("") || '<p class="empty">Ainda não há usuários.</p>'}</div></section>`;
  } else if (t === "denuncias") {
    const reps = viewState.adminReports;
    body = `<section class="card stack"><div class="row between"><h3>Denúncias</h3><button class="btn small" data-a="reports-load">Atualizar</button></div>${reps ? (reps.length ? `<div class="list">${reps.map((r) => `<div class="li"><div class="grow"><b>${esc(displayPlayer(r.target).u)}</b> <span class="small muted">denunciado por ${esc(displayPlayer(r.by).u)} · ${new Date(r.at).toLocaleString("pt-BR")}</span><p class="small">${esc(r.reason || "(sem motivo)")}</p></div><button class="btn small" data-a="mod-hide" data-v="${r.target}">${MOD.hidden[r.target] ? "Mostrar" : "Ocultar"}</button></div>`).join("")}</div>` : '<p class="empty">Nenhuma denúncia.</p>') : '<p class="small muted">Toque em Atualizar para carregar.</p>'}</section>`;
  } else if (t === "conteudo") {
    body = `<section class="card stack"><h3>Nova lição</h3><form class="stack" id="admin-lesson">
      <div class="grid2"><label class="field">Título <input type="text" id="al-title" maxlength="60" required></label><label class="field">Nível <select id="al-cefr">${CEFR.map((c) => `<option>${c}</option>`).join("")}</select></label></div>
      <label class="field">Objetivo <input type="text" id="al-goal" maxlength="140"></label>
      <label class="field">Vocabulário (uma por linha: inglês = português) <textarea id="al-words" placeholder="umbrella = guarda-chuva"></textarea></label>
      <label class="field">Frases (uma por linha: inglês = português) <textarea id="al-sents" placeholder="It's raining today. = Está chovendo hoje."></textarea></label>
      <button class="btn primary" type="submit">Publicar lição</button></form></section>
      <section class="card stack"><h3>Lições publicadas</h3>${(CUSTOM.lessons || []).length ? `<div class="list">${CUSTOM.lessons.map((l) => `<div class="li"><div class="grow"><b>${esc(l.title)}</b> <span class="chip">${esc(l.cefr)}</span><p class="small muted">${l.words.length} palavras · ${l.sentences.length} frases</p></div><button class="btn small danger" data-a="admin-del-lesson" data-v="${esc(l.id)}">Remover</button></div>`).join("")}</div>` : '<p class="empty">Nenhuma lição extra publicada.</p>'}</section>`;
  } else {
    body = `<section class="card stack"><h3>Medalhas configuradas</h3><div class="list">${ACH.map((a) => `<div class="li">${medalSVG(a, true, "icon")}<div class="grow"><b>${esc(a.name)}</b><p class="small muted">${esc(a.desc)} · ${a.kind}</p></div><span class="chip xp">${a.coins} moedas</span></div>`).join("")}</div><p class="small muted">Regras de medalhas e loja ficam no código (validadas no servidor na versão completa).</p></section>`;
  }
  return `${head("Administração", "Usuários, denúncias, conteúdo e recompensas.")}${tabs}${body}`;
}

/* ---------- celebrações ---------- */
function celebrateLevel(n) {
  const L = LEVELS[n - 1]; const fr = { 2: "bronze", 4: "silver", 6: "gold" }[n];
  if (fr && !S.owned.frames.includes(fr)) S.owned.frames.push(fr);
  if (n === 5 && !S.owned.themes.includes("ouro")) S.owned.themes.push("ouro");
  gainCoins(25 * n); save();
  const html = `<div class="stack celebrate"><svg class="medal-big" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="var(--xp-soft)"/><circle cx="32" cy="32" r="22" fill="var(--xp)"/><text x="32" y="40" text-anchor="middle" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="24" fill="#1B1300">${n}</text></svg>
    <p class="eyebrow">Novo nível</p><h1>${esc(L.name)}</h1><p class="muted">Você chegou ao nível ${n}! Ganhou ${25 * n} moedas${fr ? " e a moldura " + { bronze: "Bronze", silver: "Prata", gold: "Ouro" }[fr] : ""}${n === 5 ? " e o tema Ouro" : ""}.</p><button class="btn primary big" data-a="close">Continuar</button></div>`;
  if (Runner.active && !Runner.finished) Runner.pendingLevel = html; else modal(html);
}
function showMedal(a, more = 0) {
  modal(`<div class="stack celebrate">${medalSVG(a, true, "medal-big")}<p class="eyebrow">Medalha conquistada</p><h1>${esc(a.name)}</h1><p class="muted">${esc(a.desc)}. +${a.coins} moedas.${more ? ` E mais ${more} ${more === 1 ? "medalha" : "medalhas"} em Recompensas!` : ""}</p><button class="btn primary big" data-a="close">Que demais!</button></div>`);
}

/* ---------- ações ---------- */
const A = {
  go: (el) => go(el.dataset.v),
  more: () => modal(`<div class="row between"><h2>Mais</h2><button class="btn ghost small" data-a="close" aria-label="Fechar">${icon("x")}</button></div><div class="stack sheet">${[["home", "Resumo", "chart"], ["friends", "Amigos", "users"], ["rewards", "Loja e medalhas", "gift"], ["profile", "Meu Perfil", "user"], ["progress", "Painel de progresso", "chart"], ...(Store.isOwner ? [["admin", "Administração", "shield"]] : [])].map(([v, l, i]) => `<button class="navbtn" data-a="go" data-v="${v}">${icon(i)}<span>${l}</span></button>`).join("")}</div>`),
  close: () => { closeModal(); if (Runner.pendingLevel) { const h = Runner.pendingLevel; Runner.pendingLevel = null; modal(h); } },
  "modal-bg": (el, e) => { if (e.target === el) A.close(); },
  "ob-pick": (el) => { const k = el.dataset.k; S.profile[k] = k === "minutes" ? +el.dataset.v : el.dataset.v; $$(`[data-a="ob-pick"][data-k="${k}"]`).forEach((b) => b.setAttribute("aria-pressed", b === el)); if (k === "level0") $("#ob-test").checked = el.dataset.v !== "zero"; },
  daily: () => startDaily(),
  "set-min": (el) => { S.profile.minutes = +el.dataset.v; S.missions.day = null; save(); rerender(); },
  lesson: (el) => startLesson(el.dataset.u, el.dataset.k),
  "start-review": () => startReview(),
  listening: () => startListening(),
  pronunciation: () => startPronunciation(),
  errors: () => startErrors(),
  blitz: () => startBlitz(),
  test: (el) => startLevelTest(el.dataset.v),
  "ai-test": (el) => aiLevelTest(el.dataset.v),
  placement: () => startPlacement(),
  "ai-lesson-open": () => modal(`<h2>Aula sob medida</h2><p class="muted">Diga o tema e a IA cria uma aula no seu nível (${studying()}) com vocabulário, frases e exercícios.</p><form class="stack" id="ai-lesson-form"><input type="text" id="ai-topic" maxlength="120" placeholder="ex.: pedir desconto numa loja, reunião com cliente, futebol"><div class="row"><button class="btn primary" type="submit">${icon("sparkle")} Criar aula</button><button class="btn" type="button" data-a="close">Cancelar</button></div></form>`),
  "ai-lesson-del": (el) => { S.aiLessons = S.aiLessons.filter((l) => l.id !== el.dataset.v); save(); rerender(); },
  play: (el) => speak(el.dataset.text, !!el.dataset.slow),
  opt: (el) => { if (Runner.answered) return; Runner.sel = el.dataset.v; const ex = curEx(); if (ex.t === "fill") rerunner(); else { $$(".opt").forEach((b) => b.setAttribute("aria-pressed", b === el)); const c = $('[data-a="check"]'); if (c) c.disabled = false; } },
  check: () => checkAnswer(),
  next: () => nextItem(),
  tile: (el) => { if (Runner.answered) return; Runner.built.push(+el.dataset.k); rerunner(); },
  untile: (el) => { if (Runner.answered) return; const k = +el.dataset.k; Runner.built = Runner.built.filter((x) => x !== k); rerunner(); },
  match: (el) => {
    const ex = curEx(); const side = el.dataset.side, v = el.dataset.v;
    if (!Runner.matchSel || Runner.matchSel[0] === side) { Runner.matchSel = side + ":" + v; if (side === "l") speak(v); rerunner(); return; }
    const other = Runner.matchSel.slice(2); const [en, pt] = side === "l" ? [v, other] : [other, v];
    if (ex.pairs.some((p) => p[0] === en && p[1] === pt)) { click("pair"); Runner.matchDone.push([en, pt]); const w = ex.words.find((x) => x.en === en); if (w) wordSeen(w.en, w.pt, w.unit); }
    else { Runner.matchMiss++; toast("Esse par não combina. Tente de novo."); }
    Runner.matchSel = null;
    if (Runner.matchDone.length === ex.pairs.length) finishItem(ex, Runner.matchMiss <= 1, "pares"); else rerunner();
  },
  speak: async () => {
    const ex = curEx(); const btn = $(".speakbtn"); if (btn) btn.classList.add("rec");
    try { const alts = await recognize(); const r = wordMatch(ex.a, alts); Runner.speakRes = { ...r }; finishItem(ex, r.score >= 0.75, r.heard); }
    catch (e) { if (!SR_OK) { toast("Microfone indisponível: troquei por um ditado."); Runner.items[Runner.i] = exDict(ex); rerunner(); autoPlay(); } else { Runner.speakRes = { err: e === "no-speech" ? "Não ouvi nada. Tente de novo, mais perto do microfone." : "Não consegui ouvir. Tente de novo." }; rerunner(); } }
  },
  "speak-skip": () => { const ex = curEx(); Runner.items[Runner.i] = exDict(ex); rerunner(); autoPlay(); },
  "speak-retry": () => { if (Runner.mode === "test") return; const ex = curEx(); Runner.answered = false; Runner.speakRes = null; Runner.results.pop(); Runner.itemStart = Date.now(); rerunner(); speak(ex.a); },
  "ai-explain": () => aiExplainCurrent(),
  "run-quit": () => { if (Runner.mode === "test" || Runner.mode === "placement" || Runner.i === 0) return leaveRun(); modal(`<h2>Sair da lição?</h2><p class="muted">O XP que você já ganhou fica, mas a lição não conta como concluída.</p><div class="row"><button class="btn primary" data-a="close">Continuar estudando</button><button class="btn" data-a="run-leave">Sair</button></div>`); },
  "run-leave": () => { closeModal(); leaveRun(); },
  "run-done": () => {
    const lessonish = ["lesson", "review", "errors", "blitz"].includes(Runner.mode);
    if (lessonish && Runner.endStep !== "streak" && S.streak.last === today() && Runner.streakWas !== today()) { Runner.endStep = "streak"; sfx("streak"); rerunner(); return; }
    leaveRun();
  },
  node: (el) => startNode(el.dataset.u, el.dataset.k),
  logout: () => { flush(); setTimeout(() => window.LUE_logout && window.LUE_logout(), 400); },
  login: () => window.LUE_login && window.LUE_login(),
  music: () => { musicToggle(); if (currentView !== "run") rerender(); },
  "snd-toggle": () => { S.profile.sound = S.profile.sound === false; save(); if (S.profile.sound) sfx("ok"); rerender(); },
  "node-locked": () => toast("Complete as etapas anteriores para liberar esta."),
  chest: (el) => chestOpen(el.dataset.v),
  guide: (el) => unitGuide(el.dataset.v),
  "hearts-info": () => modal(`<div class="stack celebrate">${HEART_SVG("medal-big")}<h1>${unlimitedHearts() ? "Vidas ilimitadas" : `${heartsNow()} de ${MAX_HEARTS} vidas`}</h1><p class="muted">${unlimitedHearts() ? "Com o Premium você erra à vontade." : `Cada erro numa lição tira 1 vida. ${heartsNow() < MAX_HEARTS ? `A próxima vida chega em ${nextHeartMin()} min.` : "Você está com todas."}`}</p><div class="stack" style="width:100%">${!unlimitedHearts() && heartsNow() < MAX_HEARTS ? `<button class="btn primary big" data-a="practice-heart">${icon("dumbbell")} Praticar para ganhar 1 vida</button><button class="btn big" data-a="refill" ${S.coins >= REFILL_PRICE ? "" : "disabled"}>${GEM_SVG()} Recarregar · ${REFILL_PRICE} moedas</button>` : ""}<button class="btn ghost" data-a="close">Fechar</button></div></div>`),
  "streak-info": () => modal(`<div class="stack celebrate">${FLAME_SVG("medal-big", D().xp > 0)}<h1>${streakAlive()} ${streakAlive() === 1 ? "dia" : "dias"} de ofensiva</h1><p class="muted">${D().xp > 0 ? "Você já praticou hoje. Volte amanhã para manter a chama acesa." : "Faça uma lição hoje para manter sua ofensiva."} Recorde: ${S.streak.best} ${S.streak.best === 1 ? "dia" : "dias"}.</p><button class="btn primary big" data-a="close">Continuar</button></div>`),
  refill: () => { if (S.coins < REFILL_PRICE) return; S.coins -= REFILL_PRICE; S.hearts = { n: MAX_HEARTS, t: Date.now() }; save(); sfx("heart"); closeModal(); toast("Vidas recarregadas!"); rerender(); },
  "refill-run": () => { if (S.coins < REFILL_PRICE) return; S.coins -= REFILL_PRICE; S.hearts = { n: MAX_HEARTS, t: Date.now() }; save(); sfx("heart"); Runner.noHearts = false; nextItem(); },
  "practice-heart": () => { closeModal(); if (Runner.active) { Runner.active = false; } const items = reviewItems(8); if (!items.length) { const u = LUE_UNITS[0]; return startRun({ mode: "review", title: "Prática para ganhar vida", items: buildLesson(u, "v", 8).filter((x) => x.t !== "intro"), presence: "Praticando" }); } startRun({ mode: "review", title: "Prática para ganhar vida", items, presence: "Praticando" }); },
  "duel-done": () => { Runner.hooks.back = "friends"; leaveRun(); },
  claim: (el) => { const mi = S.missions.list.find((m) => m.id === el.dataset.v); if (!mi || mi.claimed || missionProgress(mi) < mi.n) return; mi.claimed = true; S.tot.missions++; popXP(gainXP(15)); gainCoins(10); save(); rerender(); },
  wclaim: (el) => { const mi = S.missions.wlist.find((m) => m.id === el.dataset.v); if (!mi || mi.claimed || weekMissionProgress(mi) < mi.n) return; mi.claimed = true; S.tot.missions++; popXP(gainXP(60)); gainCoins(40); save(); rerender(); },
  "event-claim": () => { if (S.missions.claimedEvent === wk()) return; S.missions.claimedEvent = wk(); gainCoins(100); save(); toast("+100 moedas pela Maratona da Comunidade!"); rerender(); },
  scenario: (el) => startScenario(el.dataset.v),
  "end-chat": () => endConversation(),
  "chat-mic": () => chatVoice(),
  "chat-retry": () => { const t = Chat.retryText; Chat.retryText = null; Chat.err = ""; sendChat(t); },
  "practice-phrase": (el) => { const v = el.dataset.v; speak(v); const inp = $("#chat-in"); if (inp) { inp.value = v; inp.focus(); } toast("Ouça e repita: depois envie a frase corrigida."); },
  ftab: (el) => { viewState.friendsTab = el.dataset.v; rerender(); if (el.dataset.v === "grupos") S.groups.forEach((c) => loadGroup(c).then(() => rerenderIf(["friends"])).catch(() => {})); },
  "req-yes": (el) => answerRequest(el.dataset.v, true),
  "req-no": (el) => answerRequest(el.dataset.v, false),
  "cheer-ok": (el) => dismissCheer(el.dataset.v),
  cheer: (el) => modal(`<h2>Mandar incentivo</h2><div class="stack">${Object.entries(CHEER_KINDS).map(([k, l]) => `<button class="btn" data-a="cheer-send" data-to="${el.dataset.v}" data-v="${k}">${esc(l)}</button>`).join("")}</div><button class="btn ghost" data-a="close">Cancelar</button>`),
  "cheer-send": (el) => sendCheer(el.dataset.to, el.dataset.v),
  "friend-rm": (el) => modal(`<h2>Remover amigo?</h2><p class="muted">${esc(displayPlayer(el.dataset.v).u)} sai da sua lista de amigos.</p><div class="row"><button class="btn danger" data-a="friend-rm-yes" data-v="${el.dataset.v}">Remover</button><button class="btn" data-a="close">Cancelar</button></div>`),
  "friend-rm-yes": (el) => { closeModal(); removeFriend(el.dataset.v); },
  "duel-new": (el) => { if (!needCloud()) return; const to = el.dataset.v || ""; modal(`<h2>Novo desafio</h2><form class="stack" id="duel-form">
    <label class="field">Modo <select id="duel-mode">${Object.entries(DUEL_MODES).map(([k, l]) => `<option value="${k}">${l}</option>`).join("")}</select></label>
    <label class="field">Oponente <select id="duel-to"><option value="">Qualquer pessoa com o código</option>${S.friends.map((id) => `<option value="${id}" ${id === to ? "selected" : ""}>${esc(displayPlayer(id).u)}</option>`).join("")}</select></label>
    <label class="toggle"><span><b>Com tempo</b><br><span class="small muted">15 segundos por pergunta; responder rápido vale bônus</span></span><input type="checkbox" class="switch" id="duel-timer"></label>
    <div class="row"><button class="btn primary" type="submit">${icon("swords")} Começar</button><button class="btn" type="button" data-a="close">Cancelar</button></div></form>`); },
  "duel-play": (el) => playDuel(el.dataset.v),
  "duel-result": (el) => showDuelResult(el.dataset.v),
  "group-new": () => { if (!needCloud()) return; modal(`<h2>Criar grupo</h2><form class="stack" id="group-form"><label class="field">Nome do grupo <input type="text" id="group-name" maxlength="40" placeholder="ex.: Turma do inglês"></label><label class="field">Meta semanal do grupo (XP) <input type="number" id="group-goal" value="1500" min="200" step="100"></label><div class="row"><button class="btn primary" type="submit">Criar</button><button class="btn" type="button" data-a="close">Cancelar</button></div></form>`); },
  "group-open": (el) => openGroup(el.dataset.v),
  "group-leave": (el) => leaveGroup(el.dataset.v),
  "teams-load": async () => { if (Store.mode !== "cloud") return toast("Disponível quando você entra com uma conta."); toast("Carregando equipes…"); try { viewState.teams = await teamRanking(); } catch { viewState.teams = []; } rerender(); },
  copy: async (el) => { try { await navigator.clipboard.writeText(el.dataset.v); toast("Copiado!"); } catch { toast("Copie: " + el.dataset.v); } },
  rscope: (el) => { viewState.rankScope = el.dataset.v; rerender(); if (el.dataset.v === "teams" && !viewState.teams) A["teams-load"](); },
  rper: (el) => { viewState.rankPeriod = el.dataset.v; rerender(); },
  report: (el) => modal(`<h2>Denunciar ${esc(displayPlayer(el.dataset.v).u)}</h2><form class="stack" id="report-form" data-v="${el.dataset.v}"><label class="field">Motivo <textarea id="report-reason" maxlength="300" placeholder="ex.: pontuação impossível, nome ofensivo"></textarea></label><div class="row"><button class="btn primary" type="submit">Enviar denúncia</button><button class="btn" type="button" data-a="close">Cancelar</button></div></form>`),
  rtab: (el) => { viewState.rewardsTab = el.dataset.v; rerender(); },
  buy: (el) => {
    const cat = el.dataset.c, id = el.dataset.v; const it = SHOP[cat].find((x) => x.id === id); if (!it || !itemUnlocked(it)) return;
    if (it.price && S.coins < it.price) return toast("Moedas insuficientes.");
    if (it.price) S.coins -= it.price; if (!S.owned[cat].includes(id)) S.owned[cat].push(id); A.equip(el); toast(it.price ? `Comprado: ${it.name || it.id}` : "Desbloqueado!");
  },
  equip: (el) => { const cat = el.dataset.c, id = el.dataset.v; if (!S.owned[cat].includes(id)) return; if (cat === "shapes") S.profile.avatar.shape = id; if (cat === "frames") S.profile.frame = id; if (cat === "themes") { S.profile.accent = id; applyTheme(); } if (cat === "titles") S.profile.title = id; save(); rerender(); },
  "av-color": (el) => { S.profile.avatar.color = el.dataset.v; save(); rerender(); },
  "buy-freeze": () => { if (S.coins < 50 || S.streak.freezes >= 2) return; S.coins -= 50; S.streak.freezes++; save(); toast("Protetor de sequência comprado."); rerender(); },
  cert: (el) => { const b = el.dataset.v; modal(`<div style="overflow-x:auto">${certificateSVG(b).replace('width="1200" height="850"', 'width="100%" style="height:auto;border-radius:12px"')}</div><div class="row">${Store.downloads ? `<button class="btn primary" data-a="cert-dl" data-v="${b}">${icon("download")} Baixar certificado</button>` : ""}<button class="btn" data-a="close">Fechar</button></div>`); },
  "cert-dl": (el) => downloadCertificate(el.dataset.v),
  pset: (el) => { const k = el.dataset.k; let v = el.dataset.v; if (k === "minutes") { v = +v; S.missions.day = null; S.missions.week = null; } if (k === "rate") v = +v; S.profile[k] = v; if (k === "theme") applyTheme(); save(); rerender(); },
  "pref-toggle": (el) => { S.profile[el.dataset.v] = el.checked; save(); flush(); toast("Preferência salva."); },
  reset: () => { viewState.confirmReset = true; rerender(); },
  "reset-no": () => { viewState.confirmReset = false; rerender(); },
  "reset-yes": () => { const name = S.profile.username; S = newState(); S.profile.username = name; viewState.confirmReset = false; save(); flush(); applyTheme(); go("onboarding"); },
  atab: (el) => { viewState.adminTab = el.dataset.v; rerender(); if (el.dataset.v === "denuncias" && !viewState.adminReports) A["reports-load"](); },
  "reports-load": async () => { try { const s = await Store.db.collection("reports").get(); viewState.adminReports = s.docs.flatMap((d) => (d.data().items || []).map((i) => ({ ...i, by: d.id }))).sort((a, b) => b.at - a.at); } catch { viewState.adminReports = []; } rerender(); },
  "mod-hide": async (el) => { const id = el.dataset.v; const hidden = { ...(MOD.hidden || {}) }; if (hidden[id]) delete hidden[id]; else hidden[id] = true; try { await Store.db.doc("moderation/state").set({ hidden }); toast("Moderação atualizada."); } catch { toast("Não consegui salvar."); } },
  "admin-del-lesson": async (el) => { const lessons = (CUSTOM.lessons || []).filter((l) => l.id !== el.dataset.v); try { await Store.db.doc("content/custom").set({ lessons }); toast("Lição removida."); } catch { toast("Não consegui salvar."); } },
};
const CLICK_SND = { opt: "tap", tile: "tile", untile: "back", node: "tap", go: "tap", lesson: "tap", daily: "tap", next: "tap", guide: "tap", play: null, "run-quit": "back", rtab: "tap", ftab: "tap", scenario: "tap", "ob-pick": "tap", "set-min": "tap", pset: "tap", more: "tap", close: "back" };
document.addEventListener("click", (e) => { const el = e.target.closest("[data-a]"); if (!el || el.tagName === "INPUT") return; const f = A[el.dataset.a]; if (f) { if (CLICK_SND[el.dataset.a] && !el.disabled) click(CLICK_SND[el.dataset.a]); if (el.tagName === "BUTTON" || el.tagName === "A") e.preventDefault(); f(el, e); } });
document.addEventListener("change", (e) => {
  const el = e.target;
  if (el.dataset && el.dataset.a === "pref-toggle") A["pref-toggle"](el);
  if (el.id === "rank-crit") { viewState.rankCrit = el.value; rerender(); }
});
document.addEventListener("input", (e) => { if (e.target.id === "ans") Runner.sel = e.target.value; if (e.target.matches && e.target.matches("input[type=text], textarea")) click(e.inputType && e.inputType.startsWith("delete") ? "back" : "key"); });
const parseLines = (txt) => txt.split("\n").map((l) => l.split("=").map((x) => x.trim())).filter((p) => p.length >= 2 && p[0] && p[1]).map((p) => [p[0], p.slice(1).join("=")]);
document.addEventListener("submit", (e) => {
  const f = e.target; e.preventDefault();
  if (f.id === "ob-form") submitOnboarding();
  if (f.id === "chat-form") { const v = $("#chat-in").value; sendChat(v); }
  if (f.id === "add-friend") { sendFriendRequest($("#friend-name").value); $("#friend-name").value = ""; }
  if (f.id === "duel-code") playDuel($("#duel-code-in").value);
  if (f.id === "group-join") joinGroup($("#group-code").value);
  if (f.id === "group-form") createGroup($("#group-name").value, $("#group-goal").value);
  if (f.id === "duel-form") createDuel($("#duel-mode").value, $("#duel-to").value, $("#duel-timer").checked);
  if (f.id === "report-form") reportPlayer(f.dataset.v, $("#report-reason").value);
  if (f.id === "ai-lesson-form") aiMakeLesson($("#ai-topic").value);
  if (f.id === "admin-lesson") {
    const words = parseLines($("#al-words").value), sentences = parseLines($("#al-sents").value);
    if (words.length < 4 || sentences.length < 3) return toast("Inclua pelo menos 4 palavras e 3 frases.");
    const l = { id: rid(6), title: $("#al-title").value.trim().slice(0, 60), cefr: $("#al-cefr").value, goal: $("#al-goal").value.trim().slice(0, 140), words: words.slice(0, 16), sentences: sentences.slice(0, 12), fills: [] };
    Store.db.doc("content/custom").set({ lessons: [...(CUSTOM.lessons || []), l] }).then(() => toast("Lição publicada para todos.")).catch(() => toast("Não consegui publicar."));
    f.reset();
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.id === "chat-in" && !e.shiftKey) { e.preventDefault(); sendChat(e.target.value); return; }
  if (currentView !== "run" || !Runner.active || $("#modal-root").innerHTML) return;
  const ex = curEx(); if (!ex) { if (e.key === "Enter" && Runner.finished) leaveRun(); return; }
  if (e.key === "Enter") { e.preventDefault(); if (Runner.finished) return; if (ex.t === "intro" || Runner.answered) nextItem(); else if (ex.t !== "speak" && ex.t !== "match") checkAnswer(); return; }
  if (/^[1-4]$/.test(e.key) && ex.opts && !Runner.answered && e.target.tagName !== "INPUT") { const o = ex.opts[+e.key - 1]; if (o) { click("tap"); Runner.sel = o; rerunner(); } }
});

/* ---------- início do app ---------- */
function bootError(e) {
  console.error(e);
  const app = $("#app"); if (!app) return;
  app.innerHTML = `<div class="loading"><h2>Não consegui abrir o app</h2><p class="muted">${esc((e && e.message) || "Erro desconhecido")}</p><button class="btn primary" onclick="location.reload()">Tentar de novo</button></div>`;
}
(async function boot() {
  try {
    await initPlatform();
    await loadState();
    applyTheme(); renderShell();
    if (!S.onboarded) { currentView = "onboarding"; rerender(); }
    else { ensureMissions(); go("learn"); setPresence("No início"); }
    try { subscribeShared(); } catch (e) { console.warn(e); }
    queueCheck();
  } catch (e) { bootError(e); }
})();
addEventListener("error", (e) => { const own = /\/(content|core|lesson|ai|social|duo|views)\.js/.test(e.filename || ""); if (own && !$(".shell")) bootError(e.error || e); });
