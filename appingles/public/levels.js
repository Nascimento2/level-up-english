/* Level Up English — níveis (1 a 10 fixos, 11 em diante gerados), trilha e teste de cada nível. */
"use strict";

/* ---------- situações dos módulos viram unidades ---------- */
function parseSituation(mod, s, i) {
  const words = s.w.split(";").map((x) => x.trim().split("|").map((y) => y.trim())).filter((x) => x.length >= 2);
  const dialogue = s.d.map((l) => l.split("|").map((y) => y.trim()));
  return {
    id: `${mod.id}s${i + 1}`, module: mod.id, moduleTitle: mod.title, icon: mod.icon, title: s.t, goal: s.g,
    words, dialogue, sentences: dialogue.map((l) => [l[1], l[2], l[3]]), fills: s.f || [],
  };
}
const MODULE_UNITS = (window.LUE_MODULES || []).flatMap((m) => m.s.map((s, i) => parseSituation(m, s, i)));
const MODULE_BY_ID = Object.fromEntries((window.LUE_MODULES || []).map((m) => [m.id, m]));

/* ---------- níveis ---------- */
const LEVEL_DEF = [
  { n: 1, name: "Primeiras palavras", units: ["u01", "u02", "u03"] },
  { n: 2, name: "Frases básicas", units: ["u04", "u05", "m14s1"] },
  { n: 3, name: "Cumprimentos e apresentações", units: ["m01s1", "m01s2", "m01s3", "m22s1"] },
  { n: 4, name: "Perguntas e respostas", units: ["m04s1", "m04s2", "m04s3", "m08s1", "m08s2"] },
  { n: 5, name: "Conversas curtas", units: ["m02s1", "m02s2", "m02s3", "m07s1", "m07s2", "m13s1", "m13s2"] },
  { n: 6, name: "Conversação cotidiana", units: ["u06", "u07", "u08", "m07s3", "m08s3", "m09s1", "m10s1", "m10s2", "m13s3", "m17s1", "m17s2", "m17s3", "m18s1", "m18s2", "m19s1", "m19s2", "m19s3"] },
  { n: 7, name: "Frases mais complexas", units: ["u09", "m05s1", "m05s2", "m05s3", "m06s1", "m06s2", "m06s3", "m09s2", "m09s3", "m10s3", "m16s1", "m16s2", "m16s3", "m18s3"] },
  { n: 8, name: "Conversação intermediária", units: ["u10", "u11", "m03s1", "m03s2", "m03s3", "m11s1", "m11s2", "m11s3", "m14s2", "m14s3", "m21s1", "m21s2", "m21s3", "m22s2", "m22s3", "m23s1", "m23s2", "m23s3"] },
  { n: 9, name: "Conversação avançada", units: ["u12", "m12s1", "m12s2", "m12s3", "m15s1", "m15s2", "m15s3", "m20s1", "m20s2", "m20s3", "m24s1", "m24s2", "m24s3"] },
  { n: 10, name: "Fluência prática", units: ["m25s1", "m25s2", "m25s3"] },
];
const FIXED_LEVELS = LEVEL_DEF.length;
const LEVEL_CEFR = { 3: "A1", 6: "A2", 8: "B1", 9: "B2", 10: "C1", 15: "C2" };
const GEN_NAMES = ["Fluência contínua", "Conversas do mundo real", "Inglês sem pausa", "Nativo no dia a dia", "Expressões avançadas", "Debates e ideias", "Histórias e experiências", "Inglês profissional", "Viagens sem fronteiras", "Mestre da conversa"];
function levelName(n) { return n <= FIXED_LEVELS ? LEVEL_DEF[n - 1].name : GEN_NAMES[(n - FIXED_LEVELS - 1) % GEN_NAMES.length]; }
function levelBand(n) { return n <= 3 ? "A1" : n <= 6 ? "A2" : n <= 8 ? "B1" : n <= 9 ? "B2" : n <= 14 ? "C1" : "C2"; }

function ensureLevels() {
  if (!S.lv) S.lv = { unlocked: 1, passed: {} };
  if (!S.gen) S.gen = {};
  const fromBands = S.cefr.unlocked.includes("B2") ? 9 : S.cefr.unlocked.includes("B1") ? 7 : S.cefr.unlocked.includes("A2") ? 4 : 1;
  const fromPassed = Object.keys(S.lv.passed).reduce((m, k) => Math.max(m, +k + 1), 1);
  const fromCefr = S.cefr.passed.B1 ? 9 : S.cefr.passed.A2 ? 7 : S.cefr.passed.A1 ? 4 : 1;
  S.lv.unlocked = Math.max(S.lv.unlocked || 1, fromBands, fromPassed, fromCefr);
}
function levelUnlocked(n) { ensureLevels(); return n <= S.lv.unlocked; }
function levelPassed(n) { return !!(S.lv && S.lv.passed[n]); }
function levelUnits(n) {
  if (n <= FIXED_LEVELS) return LEVEL_DEF[n - 1].units.map((id) => unitById(id)).filter(Boolean);
  return (S.gen[n] && S.gen[n].units) || [];
}
function unlockedUnits() { ensureLevels(); const out = []; for (let n = 1; n <= S.lv.unlocked; n++) out.push(...levelUnits(n)); return out.length ? out : levelUnits(1); }
function currentLevel() { ensureLevels(); let n = 1; for (let k = 1; k <= S.lv.unlocked; k++) if (!levelPassed(k)) { n = k; break; } else n = k + 1; return Math.min(n, S.lv.unlocked); }

/* ---------- trilha ---------- */
function levelOrder(n) { return levelUnits(n).flatMap(unitNodes).map((x) => x.id); }
function levelCursor(n) { for (const u of levelUnits(n)) for (const nd of unitNodes(u)) if (!nodeDone(nd)) return nd.id; return null; }
function pathState() {
  ensureLevels(); const cur = {}; let first = null;
  for (let n = 1; n <= S.lv.unlocked; n++) { const c = levelCursor(n); cur[n] = c; if (c && !first) first = c; }
  return { cur, first };
}
function nodeHTML(u, n, idx, color, st, lvl) {
  const done = nodeDone(n); const unlocked = levelUnlocked(lvl);
  const order = levelOrder(lvl); const curIdx = st.cur[lvl] ? order.indexOf(st.cur[lvl]) : order.length;
  const avail = unlocked && (done || order.indexOf(n.id) <= curIdx);
  const isCur = n.id === st.cur[lvl]; const isFirst = n.id === st.first;
  const off = ZIG[idx % ZIG.length]; const L = S.lessons[n.id];
  let inner;
  if (n.type === "chest") inner = `<svg class="node-ic chest-ic" viewBox="0 0 48 48" aria-hidden="true">${done
    ? '<path d="M8 20 L14 8 H34 L40 20 Z" fill="#A86B1C"/><rect x="7" y="20" width="34" height="20" rx="3" fill="#C98A2E"/><rect x="7" y="25" width="34" height="3" fill="#8A5310"/><circle cx="24" cy="16" r="4" fill="#FFD43B"/>'
    : '<rect x="7" y="18" width="34" height="22" rx="3" fill="#C98A2E"/><path d="M7 22 V16 a8 8 0 0 1 8-8 h18 a8 8 0 0 1 8 8 v6 Z" fill="#A86B1C"/><rect x="7" y="22" width="34" height="3" fill="#8A5310"/><rect x="20" y="20" width="8" height="9" rx="2" fill="#FFD43B"/>'}</svg>`;
  else inner = done ? icon("check", "node-ic") : !avail ? icon("lock", "node-ic") : icon(n.ic, "node-ic");
  const cls = n.type === "chest" ? `node chest ${done ? "opened" : ""} ${avail ? "" : "locked"}` : `node ${done ? "done" : ""} ${avail ? "" : "locked"} ${isCur ? "current" : ""}`;
  const action = n.type === "chest" ? (avail && !done ? `data-a="chest" data-v="${esc(u.id)}"` : "") : avail ? `data-a="node" data-u="${esc(u.id)}" data-k="${n.k}"` : `data-a="node-locked"`;
  const tip = `${n.label}${done && L && L.best ? ` · melhor ${L.best}%` : ""}${!avail ? " · bloqueada" : ""}`;
  return `<div class="node-wrap ${isFirst ? "has-bubble" : ""} ${isCur && n.type !== "chest" ? "has-ring" : ""}" style="--o:${off}">
    ${isFirst ? `<span class="start-bubble">COMEÇAR</span>` : ""}
    ${isCur && n.type !== "chest" ? `<svg class="node-ring" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="none" stroke="var(--surface-2)" stroke-width="7"/></svg>` : ""}
    <button class="${cls}" style="--c:${color}" ${action} aria-label="${esc(u.title)}: ${esc(tip)}" title="${esc(tip)}">${inner}</button>
  </div>`;
}
function nodeDone(n) { return n.type === "chest" ? !!S.chests[n.id] : lessonDone(n.id); }
function unitNodes(u) {
  const dlg = u.dialogue && u.dialogue.length;
  return [
    { k: "v", type: "lesson", id: u.id + "_v", label: "Vocabulário", ic: "book" },
    { k: "f", type: "lesson", id: u.id + "_f", label: dlg ? "Diálogo" : "Frases e diálogos", ic: "chat" },
    { k: "c", type: "chest", id: u.id + "_c", label: "Baú" },
    { k: "r", type: "lesson", id: u.id + "_r", label: "Revisão e teste da unidade", ic: "dumbbell" },
  ];
}
let uIdxGlobal = 0;
function levelSection(n, st) {
  const unlocked = levelUnlocked(n); const passed = S.lv.passed[n]; const units = levelUnits(n);
  const head = `<div class="band-divider"><span class="cefr-badge">Nível ${n}</span><b>${esc(levelName(n))}</b><span class="chip">${levelBand(n)}</span>
    ${!unlocked && n > 1 && levelUnlocked(n - 1) ? `<button class="btn small" data-a="lvtest" data-v="${n - 1}">${icon("bolt")} Pular para cá: teste do nível ${n - 1}</button>` : ""}</div>`;
  if (n > FIXED_LEVELS && passed && !units.length) return `<div class="band-sec">${head}<div class="card row" style="gap:10px"><span class="chip ok">${icon("check")} Concluído com ${passed.score}%</span></div></div>`;
  if (n > FIXED_LEVELS && unlocked && !units.length) {
    return `<div class="band-sec">${head}<div class="card stack gen-card" style="align-items:center;text-align:center">${mascot("capi", "wave", 90)}
      <h3>Preparando o nível ${n}</h3><p class="muted small">${Gen.busy === n ? "Criando situações novas para você…" : "Toque para criar as lições deste nível."}</p>
      ${Gen.busy === n ? '<div class="typing"><i></i><i></i><i></i></div>' : `<button class="btn primary" data-a="gen-level" data-v="${n}">${icon("sparkle")} Criar nível ${n}</button>`}
      ${Gen.err ? `<p class="small" style="color:var(--bad)">${esc(Gen.err)}</p>` : ""}</div></div>`;
  }
  if (!unlocked && n > FIXED_LEVELS) return `<div class="band-sec band-locked">${head}<div class="card"><p class="muted small">Passe no teste do nível ${n - 1} para abrir. A partir do nível 11 as lições são criadas para você, sem limite.</p></div></div>`;
  const unitsHTML = units.map((u) => {
    const color = UNIT_COLORS[uIdxGlobal % UNIT_COLORS.length]; const num = ++uIdxGlobal;
    const nodes = unitNodes(u).map((nd, k) => nodeHTML(u, nd, k + (num % 2 ? 0 : 4), color, st, n)).join("");
    const side = num % 2 ? "right" : "left";
    const kicker = u.moduleTitle ? esc(u.moduleTitle) : u.gen ? "Lição criada para você" : `Unidade ${num}`;
    return `<section class="unit-sec">
      <header class="unit-banner" style="--c:${color}"><div class="ub-txt"><p class="ub-eyebrow">Nível ${n} · ${kicker}</p><h2>${esc(u.title)}</h2><p class="ub-goal">${esc(u.goal || "")}</p></div>
        <button class="ub-guide" data-a="guide" data-v="${esc(u.id)}">${icon("guide")}<span>Guia</span></button></header>
      <div class="path">
        <span class="path-deco ${side}" aria-hidden="true">${mascot(mascotForUnit(num - 1), unitNodes(u).some((x) => x.id === st.first) ? "wave" : "idle", 104)}</span>
        ${nodes}
      </div></section>`;
  }).join("");
  const trophy = `<div class="node-wrap" style="--o:0"><button class="node trophy ${passed ? "done" : ""} ${unlocked ? "" : "locked"}" ${unlocked && !passed ? `data-a="lvtest" data-v="${n}"` : passed && LEVEL_CEFR[n] && S.cefr.passed[LEVEL_CEFR[n]] ? `data-a="cert" data-v="${LEVEL_CEFR[n]}"` : passed ? "" : 'data-a="node-locked"'} aria-label="Teste do nível ${n}">
    <svg class="node-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10v6a5 5 0 0 1-10 0z" fill="#FFD43B"/><path d="M7 5H4a3 3 0 0 0 3.5 4M17 5h3a3 3 0 0 1-3.5 4" fill="none" stroke="#FFD43B" stroke-width="2"/><path d="M10.5 14h3v3h-3zM8 18h8v3H8z" fill="#FAB005"/></svg></button>
    <p class="trophy-cap">${passed ? `Nível ${n} concluído · ${passed.score}%` : `Teste do nível ${n}${LEVEL_CEFR[n] ? ` (certificado ${LEVEL_CEFR[n]})` : ""}`}</p></div>`;
  return `<div class="band-sec ${unlocked ? "" : "band-locked"}">${head}${unitsHTML}<div class="path">${trophy}</div></div>`;
}
function vPath() {
  ensureDuo(); ensureLevels(); uIdxGlobal = 0;
  const st = pathState();
  const last = Math.max(FIXED_LEVELS, S.lv.unlocked + 1);
  let levels = ""; for (let n = 1; n <= last; n++) levels += levelSection(n, st);
  if (S.lv.unlocked > FIXED_LEVELS && !levelUnits(S.lv.unlocked).length && Gen.busy !== S.lv.unlocked && !Gen.err) setTimeout(() => genLevel(S.lv.unlocked), 50);
  const due = dueWords().length; const goal = dailyGoalXP(); const dx = D().xp;
  const rank = myRank("week"); const notes = homeNotes(); const cl = currentLevel();
  const side = `<aside class="path-side">
    <div class="side-sticky">${statusBar()}
    <section class="card stack"><div class="row between"><div><p class="eyebrow">Seu nível</p><h3>Nível ${cl}: ${esc(levelName(cl))}</h3></div><span class="chip brand">${levelBand(cl)}</span></div>
      <div class="bar ok"><i style="width:${levelProgress(cl)}%"></i></div><p class="small muted">${levelProgress(cl)}% do nível concluído. Próxima meta: ${levelProgress(cl) >= 100 ? `teste do nível ${cl}` : "terminar as lições do nível"}.</p></section>
    <section class="card stack"><div class="row between"><h3>Meta do dia</h3><button class="btn ghost small" data-a="go" data-v="missions">Ver missões</button></div>
      <div class="row" style="gap:12px">${FLAME_SVG("goal-flame", dx > 0)}<div class="stack" style="gap:6px;flex:1;min-width:0"><div class="bar xp goal-bar"><i style="width:${Math.min(100, (dx / goal) * 100)}%"></i><span class="num">${dx} / ${goal} XP</span></div><p class="small muted">${dx >= goal ? "Meta batida! O resto é bônus." : `Faltam ${goal - dx} XP para bater a meta.`}</p></div></div>
      ${S.missions.list.map(missionRow).join("")}</section>
    <section class="card stack"><h3>Praticar</h3>
      <div class="practice-grid">
        <button class="pr" data-a="start-review"><span class="pr-ic" style="--c:#0B9668">${icon("repeat")}</span><b>Revisão</b><span class="small muted">${due ? `${due} para hoje` : "Reforço"}</span></button>
        <button class="pr" data-a="listening"><span class="pr-ic" style="--c:#0C8599">${icon("ear")}</span><b>Escuta</b><span class="small muted">Áudio nativo</span></button>
        <button class="pr" data-a="pronunciation"><span class="pr-ic" style="--c:#7048E8">${icon("mic")}</span><b>Pronúncia</b><span class="small muted">${SR_OK ? "Fale e ganhe nota" : "Ditado"}</span></button>
        <button class="pr" data-a="errors"><span class="pr-ic" style="--c:#D6336C">${icon("x")}</span><b>Erros</b><span class="small muted">${S.errors.length} no histórico</span></button>
        <button class="pr" data-a="blitz" ${levelOf(S.xp).n >= 3 ? "" : "disabled"}><span class="pr-ic" style="--c:#E8590C">${icon(levelOf(S.xp).n >= 3 ? "bolt" : "lock")}</span><b>Relâmpago</b><span class="small muted">${levelOf(S.xp).n >= 3 ? "60 segundos" : "Nível 3 de XP"}</span></button>
        <button class="pr" data-a="ai-lesson-open" ${Store.sample ? "" : "disabled"}><span class="pr-ic" style="--c:#C77700">${icon("sparkle")}</span><b>Aula com IA</b><span class="small muted">Tema livre</span></button>
      </div>
      <p class="small muted">Praticar devolve 1 vida quando você acerta 60% ou mais.</p></section>
    <section class="card row" style="gap:12px"><span class="ic">${icon("trophy")}</span><div class="stack" style="gap:2px;flex:1;min-width:0"><b>${rank ? `Você está em ${rank}º na semana` : "Ranking semanal"}</b><span class="small muted">Ganhe XP para subir</span></div><button class="btn small" data-a="go" data-v="ranking">Ver</button></section>
    </div></aside>`;
  const extras = `${S.aiLessons.length ? `<section class="card stack"><h3>Aulas sob medida</h3>${S.aiLessons.map((u) => unitCard(u, true, true)).join("")}</section>` : ""}
    ${(CUSTOM.lessons || []).length ? `<section class="card stack"><h3>Conteúdo extra</h3>${allUnits().filter((u) => u.custom).map((u) => unitCard(u, true)).join("")}</section>` : ""}`;
  return `<div class="path-layout"><div class="path-main">
      <div class="mobile-only">${statusBar()}</div>
      ${notes.length ? `<section class="card"><p class="eyebrow">Para você</p><div class="list">${notes.join("")}</div></section>` : ""}
      ${!S.flags.placementDone ? `<button class="mode" data-a="placement"><span class="ic">${icon("target")}</span><span><b>Teste de nivelamento</b><br><span class="small muted">Descubra seu nível em 4 minutos e pule o que já sabe</span></span></button>` : ""}
      ${levels}${extras}</div>${side}</div>`;
}
function levelProgress(n) { const o = levelOrder(n); if (!o.length) return 0; const done = levelUnits(n).flatMap(unitNodes).filter(nodeDone).length; return Math.round((done / o.length) * 100); }

/* ---------- próxima lição (Aula do dia) ---------- */
function nextLesson() {
  const st = pathState();
  for (let n = 1; n <= S.lv.unlocked; n++) {
    for (const u of levelUnits(n)) for (const nd of unitNodes(u)) if (nd.id === st.cur[n] && nd.type === "lesson") return { unit: u, kind: nd.k };
  }
  const pool = unlockedUnits(); const u = pick(pool) || LUE_UNITS[0];
  return { unit: u, kind: "f" };
}

/* ---------- teste de cada nível ---------- */
function startLevelTestN(n) {
  const rng = Math.random; const units = levelUnits(n);
  if (!units.length) return toast("Este nível ainda não tem lições.");
  const words = wordPool(units).map((w) => ({ ...w, isWord: false })); const sents = sentPool(units);
  const fills = shuffle(units.flatMap((u) => (u.fills || []).map((f) => exFill(f, u.id, rng))), rng).slice(0, 4);
  const dlgUnits = units.filter((u) => u.dialogue && u.dialogue.length >= 4);
  const dlg = shuffle(dlgUnits, rng).slice(0, 2).map((u) => exDialogueFill(u, rng)).filter(Boolean);
  const shortS = sents.filter((s) => tokens(s.en).length <= 7);
  const items = [...fills, ...dlg,
    ...shuffle(sents, rng).slice(0, 3).map((s) => exMC(s, "pt2en", sents, rng)),
    ...shuffle(words, rng).slice(0, 2).map((w) => exMC(w, "en2pt", words, rng)),
    ...shuffle(sents, rng).slice(0, 2).map((s) => exListen(s, sents, rng)),
    exType(pick(shortS.length ? shortS : sents, rng))];
  startRun({ mode: "test", band: `Nível ${n}`, level: n, title: `Teste do nível ${n}`, items: shuffle(items, rng), showAnswers: false, presence: `Fazendo o teste do nível ${n}` });
}
function finishLevelTest(acc) {
  const n = Runner.level; const score = Math.round(acc * 100);
  S.tot.tests["L" + n] = Math.max(S.tot.tests["L" + n] || 0, score);
  Runner.passed = acc >= 0.8;
  if (!Runner.passed) return;
  const first = !S.lv.passed[n];
  S.lv.passed[n] = { at: today(), score }; S.lv.unlocked = Math.max(S.lv.unlocked, n + 1);
  const band = LEVEL_CEFR[n];
  if (band && !S.cefr.passed[band]) { S.cefr.passed[band] = { at: today(), score }; unlockBand(CEFR[CEFR.indexOf(band) + 1]); }
  if (first) { const g = gainXP(100); Runner.xp += g; gainCoins(50); }
}
