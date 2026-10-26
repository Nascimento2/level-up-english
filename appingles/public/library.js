/* Level Up English — biblioteca de Conversação (25 módulos), área de Vocabulário e roleplay com a IA. */
"use strict";

const UNIT_LEVEL = {};
for (const L of LEVEL_DEF) for (const id of L.units) UNIT_LEVEL[id] = L.n;
function unitLevel(u) { return u.level || UNIT_LEVEL[u.id] || 1; }
function unitProgress(u) { const nd = unitNodes(u).filter((x) => x.type === "lesson"); return nd.filter(nodeDone).length / nd.length; }

/* ---------- Conversação: biblioteca de módulos ---------- */
function vModules() {
  ensureLevels();
  const open = viewState.module && MODULE_BY_ID[viewState.module];
  if (open) return moduleDetail(open);
  const cards = LUE_MODULES.map((m) => {
    const units = MODULE_UNITS.filter((u) => u.module === m.id);
    const done = units.filter((u) => unitProgress(u) >= 1).length;
    const minLv = Math.min(...units.map(unitLevel)); const unlocked = units.some((u) => levelUnlocked(unitLevel(u)));
    return `<button class="mod-card ${unlocked ? "" : "locked"}" data-a="mod-open" data-v="${m.id}">
      <span class="pr-ic" style="--c:${UNIT_COLORS[(m.n - 1) % UNIT_COLORS.length]}">${icon(unlocked ? m.icon : "lock")}</span>
      <span class="mod-txt"><span class="small muted">Módulo ${m.n} · a partir do nível ${minLv}</span><b>${esc(m.title)}</b>
      <span class="bar ok" style="height:6px"><i style="width:${(done / units.length) * 100}%"></i></span><span class="small muted">${done} de ${units.length} situações concluídas</span></span></button>`;
  }).join("");
  return `${head("Conversação", "25 módulos de situações reais, com diálogo, tradução, pronúncia e áudio.")}
    <section class="mod-grid">${cards}</section>
    <p class="small muted">As situações abrem conforme você avança de nível. Em cada uma você pode estudar o diálogo, fazer os exercícios e conversar com a professora de IA.</p>`;
}
function moduleDetail(m) {
  const units = MODULE_UNITS.filter((u) => u.module === m.id);
  const extra = S.aiLessons.filter((l) => l.module === m.id);
  const rows = units.map((u) => {
    const lv = unitLevel(u); const ok = levelUnlocked(lv); const pct = Math.round(unitProgress(u) * 100);
    return `<div class="card stack sit-card ${ok ? "" : "locked"}">
      <div class="row between"><div style="min-width:0"><p class="eyebrow">Nível ${lv}${pct >= 100 ? " · concluída" : pct ? ` · ${pct}%` : ""}</p><h3>${esc(u.title)}</h3><p class="small muted">${esc(u.goal)}</p></div>${ok ? "" : `<span class="chip">${icon("lock")} Nível ${lv}</span>`}</div>
      ${ok ? `${dialogueHTML(u.dialogue.slice(0, 2), true)}
      <div class="row">
        <button class="btn primary small" data-a="sit-start" data-u="${u.id}" data-k="f">${icon("chat")} Diálogo e exercícios</button>
        <button class="btn small" data-a="sit-start" data-u="${u.id}" data-k="v">${icon("book")} Vocabulário</button>
        <button class="btn small" data-a="guide" data-v="${u.id}">${icon("guide")} Ver tudo</button>
        <button class="btn small" data-a="roleplay" data-v="${u.id}" ${Store.sample ? "" : "disabled"} title="${Store.sample ? "" : "A professora de IA não está disponível agora"}">${icon("sparkle")} Praticar com a IA</button>
      </div>` : `<p class="small muted">Chegue ao nível ${lv} na trilha para abrir esta situação.</p>`}</div>`;
  }).join("");
  return `<div class="row"><button class="btn ghost small" data-a="mod-close">${icon("back")} Todos os módulos</button></div>
    ${head(`${esc(m.title)}`, `Módulo ${m.n} · ${units.length + extra.length} situações`)}
    <section class="stack">${rows}</section>
    ${extra.length ? `<section class="card stack"><h3>Situações criadas com IA</h3>${extra.map((u) => unitCard(u, true, true)).join("")}</section>` : ""}
    <section class="card row" style="gap:12px"><span class="ic">${icon("sparkle")}</span><div class="stack" style="gap:2px;flex:1;min-width:0"><b>Quer mais situações deste tema?</b><span class="small muted">A IA cria uma situação nova no seu nível, com vocabulário e exercícios.</span></div>
      <button class="btn small" data-a="mod-more" data-v="${m.id}" ${Store.sample ? "" : "disabled"}>Criar com IA</button></section>`;
}

/* ---------- roleplay com a professora em cada situação ---------- */
function startRoleplay(unitId) {
  const u = unitById(unitId); if (!u || !u.dialogue) return;
  if (!Store.sample) return toast("A professora de IA não está disponível agora.");
  const L = u.dialogue; const ai = L[0][0]; const me = L.find((l) => l[0] !== ai)?.[0] || "you";
  const ref = L.map((l) => `${l[0]}: ${l[1]}`).join("\n");
  const sc = { id: "rp_" + u.id, title: u.title, opener: L[0][1],
    desc: `Roleplay of the situation "${u.title}" (${u.goal}). You are ${ai}; the learner is ${me}. Follow this reference dialogue loosely, then continue naturally with new questions:\n${ref}` };
  closeModal(); go("talk"); startScenario(sc);
}

/* ---------- Vocabulário ---------- */
let PRON_MAP = null;
function pronOf(en) {
  if (!PRON_MAP) { PRON_MAP = {}; for (const u of allUnits()) { for (const w of u.words || []) if (w[2]) PRON_MAP[norm(w[0])] = w[2]; } }
  return PRON_MAP[norm(en)] || "";
}
function vVocab() {
  const all = Object.entries(S.words).filter(([, w]) => w.box >= 1).map(([en, w]) => ({ en, ...w }));
  const due = dueWords(); const mastered = all.filter((w) => w.box >= 5);
  const tab = viewState.vocabTab || "todas"; const q = norm(viewState.vocabQ || "");
  let list = tab === "revisar" ? all.filter((w) => w.due <= today() || w.wrong > w.right / 3) : tab === "dominadas" ? mastered : all;
  if (q) list = list.filter((w) => norm(w.en).includes(q) || norm(w.pt).includes(q));
  list.sort((a, b) => (tab === "revisar" ? a.box - b.box : a.en.localeCompare(b.en)));
  const T = (k, l) => `<button role="tab" data-a="vtab" data-v="${k}" aria-selected="${tab === k}">${l}</button>`;
  return `${head("Vocabulário", "Todas as palavras e expressões que você já estudou.")}
    <section class="stats">
      <div class="card stat"><span class="muted small">Aprendidas</span><b class="num">${all.length}</b></div>
      <div class="card stat"><span class="muted small">Para revisar hoje</span><b class="num">${due.length}</b></div>
      <div class="card stat"><span class="muted small">Dominadas</span><b class="num">${mastered.length}</b></div>
      <div class="card stat"><span class="muted small">Revisões corretas</span><b class="num">${S.tot.reviews}</b></div>
    </section>
    <section class="card stack">
      <div class="row between"><div class="tabs" role="tablist">${T("todas", "Todas")}${T("revisar", "Para revisar")}${T("dominadas", "Dominadas")}</div>
        <button class="btn primary small" data-a="start-review" ${all.length ? "" : "disabled"}>${icon("repeat")} Revisar agora</button></div>
      <input type="text" id="vocab-q" placeholder="Buscar palavra em inglês ou português" value="${esc(viewState.vocabQ || "")}" autocomplete="off">
      ${list.length ? `<div class="list">${list.slice(0, 300).map((w) => `<div class="li"><button class="btn ghost small" data-a="play" data-text="${esc(w.en)}" aria-label="Ouvir">${icon("speaker")}</button>
        <div class="grow"><b>${esc(w.en)}</b> <span class="muted">${esc(w.pt)}</span>${pronOf(w.en) ? `<br><span class="pron">${esc(pronOf(w.en))}</span>` : ""}</div>
        <span class="strength" title="Força da memória: ${w.box} de 6">${Array.from({ length: 6 }, (_, i) => `<i class="${i < w.box ? "on" : ""}"></i>`).join("")}</span></div>`).join("")}</div>`
      : `<p class="empty">${all.length ? "Nenhuma palavra encontrada aqui." : "Faça sua primeira lição para começar seu vocabulário."}</p>`}
    </section>`;
}
