/* Level Up English — lições, exercícios, testes de nível e o "player" de exercícios. */
"use strict";

/* ---------- conteúdo ---------- */
function allUnits() {
  const custom = (CUSTOM.lessons || []).map((l) => ({ ...l, id: "cx_" + l.id, custom: true, fills: l.fills || [] }));
  return [...LUE_UNITS, ...custom, ...S.aiLessons.map((l) => ({ ...l, ai: true }))];
}
function unitById(id) { return allUnits().find((u) => u.id === id); }
function bandUnits(b) { return LUE_UNITS.filter((u) => u.cefr === b); }
function lessonDone(id) { return !!(S.lessons[id] && S.lessons[id].done); }
function unitDone(u) { return lessonDone(u.id + "_v") && lessonDone(u.id + "_f"); }
function bandUnlocked(b) { return S.cefr.unlocked.includes(b); }
function unlockBand(b) { if (b && !S.cefr.unlocked.includes(b)) S.cefr.unlocked.push(b); }
function nextLesson() {
  for (const b of ["A1", "A2", "B1"]) {
    if (!bandUnlocked(b)) continue;
    for (const u of bandUnits(b)) {
      if (!lessonDone(u.id + "_v")) return { unit: u, kind: "v" };
      if (!lessonDone(u.id + "_f")) return { unit: u, kind: "f" };
    }
  }
  const pool = LUE_UNITS.filter((u) => bandUnlocked(u.cefr));
  const u = pool.sort((a, b) => ((S.lessons[a.id + "_f"] || {}).best || 0) - ((S.lessons[b.id + "_f"] || {}).best || 0))[0] || LUE_UNITS[0];
  return { unit: u, kind: "f" };
}
function wordPool(units) { return units.flatMap((u) => u.words.map((w) => ({ en: w[0], pt: w[1], unit: u.id }))); }
function sentPool(units) { return units.flatMap((u) => u.sentences.map((s) => ({ en: s[0], pt: s[1], unit: u.id }))); }
const ALL_WORDS = () => wordPool(allUnits());
const ALL_SENTS = () => sentPool(allUnits());
const LEN_COUNT = { 5: 8, 10: 12, 15: 16, 30: 26 };

/* ---------- construtores de exercícios ---------- */
function distractors(item, pool, key, n, rng) {
  const seen = new Set([norm(item[key])]); const out = [];
  for (const p of shuffle(pool, rng)) { const k = norm(p[key]); if (!seen.has(k)) { seen.add(k); out.push(p); } if (out.length >= n) break; }
  return out;
}
function exMC(item, dir, pool, rng) {
  const [qk, ak] = dir === "en2pt" ? ["en", "pt"] : ["pt", "en"];
  const opts = shuffle([item[ak], ...distractors(item, pool, ak, 3, rng).map((d) => d[ak])], rng);
  return { t: "mc", prompt: dir === "en2pt" ? "O que significa?" : "Como se diz em inglês?", q: item[qk], audio: dir === "en2pt" ? item.en : null, a: item[ak], opts, en: item.en, pt: item.pt, unit: item.unit, skill: "vocab", word: item.isWord };
}
function exListen(item, pool, rng) {
  const opts = shuffle([item.en, ...distractors(item, pool, "en", 3, rng).map((d) => d.en)], rng);
  return { t: "listen", prompt: "Ouça e escolha o que foi dito", audio: item.en, a: item.en, opts, en: item.en, pt: item.pt, unit: item.unit, skill: "listen", word: item.isWord };
}
function tokens(s) { return s.replace(/[.?!,]/g, "").split(/\s+/).filter(Boolean); }
function exBuild(item, pool, rng) {
  const tk = tokens(item.en);
  const extra = shuffle(pool.flatMap((p) => tokens(p.en)).filter((w) => !tk.map((x) => x.toLowerCase()).includes(w.toLowerCase())), rng).slice(0, 2);
  return { t: "build", prompt: "Monte a frase em inglês", q: item.pt, a: item.en, tiles: shuffle([...tk, ...extra], rng), en: item.en, pt: item.pt, unit: item.unit, skill: "writing" };
}
function exType(item) { return { t: "type", prompt: "Escreva em inglês", q: item.pt, a: item.en, en: item.en, pt: item.pt, unit: item.unit, skill: "writing", word: item.isWord }; }
function exDict(item) { return { t: "dict", prompt: "Ouça e escreva o que você ouviu", audio: item.en, a: item.en, en: item.en, pt: item.pt, unit: item.unit, skill: "listen" }; }
function exSpeak(item) { return SR_OK ? { t: "speak", prompt: "Fale esta frase em inglês", a: item.en, en: item.en, pt: item.pt, unit: item.unit, skill: "speaking" } : exDict(item); }
function exMatch(items, rng) { return { t: "match", prompt: "Ligue os pares", pairs: items.slice(0, 4).map((w) => [w.en, w.pt]), left: shuffle(items.slice(0, 4).map((w) => w.en), rng), right: shuffle(items.slice(0, 4).map((w) => w.pt), rng), skill: "vocab", unit: items[0] && items[0].unit, words: items.slice(0, 4) }; }
function exFill(f, unit, rng) { return { t: "fill", prompt: "Complete a frase", q: f[0], a: f[1], opts: shuffle(f[2], rng), expl: f[3], unit, skill: "grammar" }; }
function exIntro(w, unit) {
  const ex = (unit.sentences || []).find((s) => norm(s[0]).split(" ").includes(norm(w.en).split(" ")[0]));
  return { t: "intro", en: w.en, pt: w.pt, unit: unit.id, example: ex, skill: "vocab" };
}

function buildLesson(unit, kind, count) {
  const rng = mulberry32(hashStr(unit.id + kind + Date.now()));
  const words = unit.words.map((w) => ({ en: w[0], pt: w[1], unit: unit.id, isWord: true }));
  const sents = unit.sentences.map((s) => ({ en: s[0], pt: s[1], unit: unit.id }));
  const wpool = [...words, ...wordPool(allUnits()).map((w) => ({ ...w, isWord: true }))];
  const spool = [...sents, ...ALL_SENTS()];
  const items = [];
  if (kind === "v") {
    for (let c = 0; c < words.length; c += 4) {
      const chunk = words.slice(c, c + 4);
      for (const w of chunk) if (!S.words[w.en] || S.words[w.en].box === 0) items.push(exIntro(w, unit));
      if (chunk.length >= 3) items.push(exMatch(chunk, rng));
      for (const w of chunk) items.push(pick([() => exMC(w, "en2pt", wpool, rng), () => exMC(w, "pt2en", wpool, rng), () => exListen(w, wpool, rng)], rng)());
    }
    for (const w of shuffle(words, rng).slice(0, 2)) items.push(exType(w));
    for (const w of shuffle(words, rng).slice(0, 2)) items.push(exListen(w, wpool, rng));
  } else {
    for (const s of sents) items.push(pick([() => exBuild(s, spool, rng), () => exListen(s, spool, rng), () => exBuild(s, spool, rng)], rng)());
    for (const f of unit.fills || []) items.push(exFill(f, unit.id, rng));
    for (const s of shuffle(sents, rng).slice(0, 2)) items.push(exSpeak(s));
    const short = sents.filter((s) => tokens(s.en).length <= 6);
    if (short.length) items.push(exType(pick(short, rng)));
    items.push(exDict(pick(sents, rng)));
  }
  let out = items;
  if (out.length > count) {
    const intros = out.filter((x) => x.t === "intro" || x.t === "match");
    const rest = shuffle(out.filter((x) => x.t !== "intro" && x.t !== "match"), rng).slice(0, Math.max(4, count - intros.length));
    out = kind === "v" ? out.filter((x) => intros.includes(x) || rest.includes(x)) : shuffle(rest, rng).sort((a, b) => (a.t === "speak") - (b.t === "speak"));
  }
  while (out.length < count) {
    const extra = reviewItems(1, rng)[0] || (kind === "v" ? exMC(pick(words, rng), "pt2en", wpool, rng) : exListen(pick(sents, rng), spool, rng));
    out.push(extra);
  }
  return out;
}
function reviewItems(n, rng = Math.random) {
  let due = dueWords(); if (due.length < n) due = due.concat(weakWords(n * 2).filter((w) => !due.find((d) => d.en === w.en)));
  const pool = ALL_WORDS().map((w) => ({ ...w, isWord: true }));
  return shuffle(due, rng).slice(0, n).map((w) => {
    const item = { en: w.en, pt: w.pt, unit: w.unit, isWord: true };
    const ex = pick([() => exMC(item, "pt2en", pool, rng), () => exMC(item, "en2pt", pool, rng), () => exListen(item, pool, rng), () => exType(item)], rng)();
    ex.review = true; return ex;
  });
}
function errorItems(n) {
  const rng = Math.random;
  const pool = ALL_WORDS().map((w) => ({ ...w, isWord: true }));
  const errs = S.errors.slice().reverse(); const seen = new Set(); const out = [];
  for (const e of errs) {
    const key = e.a + "|" + e.q; if (seen.has(key)) continue; seen.add(key);
    if (e.t === "fill" && e.opts) out.push({ t: "fill", prompt: "Complete a frase", q: e.q, a: e.a, opts: shuffle(e.opts), expl: e.expl, skill: "grammar", unit: e.unit });
    else if (e.en && e.pt) out.push(e.en.split(" ").length <= 3 ? exMC({ en: e.en, pt: e.pt, unit: e.unit, isWord: true }, "pt2en", pool, rng) : exBuild({ en: e.en, pt: e.pt, unit: e.unit }, ALL_SENTS(), rng));
    if (out.length >= n) break;
  }
  return out;
}

/* ---------- o player de exercícios ---------- */
const Runner = { active: false, pendingMedals: [] };

function startRun(cfg) {
  Object.assign(Runner, {
    active: true, mode: cfg.mode || "lesson", title: cfg.title || "Lição", lessonId: cfg.lessonId || null, unit: cfg.unit || null,
    items: cfg.items, i: 0, results: [], requeued: new Set(), xp: 0, started: Date.now(), itemStart: Date.now(), secs: 0,
    answered: false, sel: null, built: [], matchSel: null, matchDone: [], matchMiss: 0, speakRes: null,
    hooks: cfg.hooks || {}, pendingMedals: [], timerEnd: cfg.timerSec ? Date.now() + cfg.timerSec * 1000 : null, qTimer: cfg.qTimer || 0, band: cfg.band || null,
    showAnswers: cfg.showAnswers !== false, aiExplain: null, finished: false, qEnd: null, pendingLevel: null, acc: 0, passed: false,
    combo: 0, bestCombo: 0, heartFlash: false, noHearts: false, endStep: null, heartGain: 0, streakWas: S.streak.last,
  });
  setPresence(cfg.presence || "Fazendo uma lição");
  go("run");
  if (["lesson", "review", "errors", "blitz"].includes(Runner.mode)) { sfx("start"); Music.start(); }
}
function curEx() { return Runner.items[Runner.i]; }

function renderRunner() {
  if (Runner.finished) return renderRunEnd();
  if (Runner.noHearts) return noHeartsRun();
  const ex = curEx(); const n = Runner.items.length;
  const pct = Math.round((Runner.i / n) * 100);
  const timer = Runner.timerEnd ? `<span class="chip" id="run-timer">${icon("clock")} <span class="num">${Math.max(0, Math.ceil((Runner.timerEnd - Date.now()) / 1000))}s</span></span>` : "";
  const qt = Runner.qTimer && !Runner.answered ? `<span class="chip" id="q-timer">${icon("clock")} <span class="num">${Runner.qTimer}s</span></span>` : "";
  return `<div class="runner">
    <div class="runner-top">
      <button class="btn ghost small" data-a="run-quit" aria-label="Sair da lição">${icon("x")}</button>
      <div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
      ${timer}${qt}${runnerTopExtra()}
    </div>
    <p class="eyebrow">${esc(Runner.title)} · ${Runner.i + 1} de ${n}</p>
    <div class="stack" id="ex-body">${renderEx(ex)}</div>
    ${renderFooter(ex)}
  </div>`;
}
function audioBtns(text) { return `<div class="row"><button class="audiobtn" data-a="play" data-text="${esc(text)}" aria-label="Ouvir">${icon("speaker")}</button><button class="audiobtn slow" data-a="play" data-slow="1" data-text="${esc(text)}" aria-label="Ouvir devagar">${icon("slow")}</button></div>`; }
function optsHTML(ex) {
  return `<div class="opts">${ex.opts.map((o, k) => {
    let cls = ""; if (Runner.answered) { if (o === ex.a && Runner.showAnswers) cls = "right"; else if (o === Runner.sel && o !== ex.a) cls = "wrong"; }
    return `<button class="opt ${cls}" data-a="opt" data-v="${esc(o)}" aria-pressed="${Runner.sel === o}" ${Runner.answered ? "disabled" : ""}><kbd>${k + 1}</kbd><span>${esc(o)}</span></button>`;
  }).join("")}</div>`;
}
function renderEx(ex) {
  switch (ex.t) {
    case "intro": return `<div class="row" style="gap:10px;align-items:flex-end">${mascot(MASCOT_ORDER[Runner.i % 3], "wave", 70)}${speech("Palavra nova! Toque para ouvir.")}</div>
      <div class="row">${audioBtns(ex.en)}<div class="stack" style="gap:4px"><span class="q-big">${esc(ex.en)}</span><span class="muted" style="font-size:1.1rem">${esc(ex.pt)}</span></div></div>
      ${ex.example ? `<div class="card flat"><p class="eyebrow">Exemplo</p><p style="font-weight:600">${esc(ex.example[0])} <button class="btn ghost small" data-a="play" data-text="${esc(ex.example[0])}" aria-label="Ouvir exemplo">${icon("speaker")}</button></p><p class="muted">${esc(ex.example[1])}</p></div>` : ""}`;
    case "mc": return `<p class="q-title">${esc(ex.prompt)}</p><div class="row">${ex.audio ? `<button class="audiobtn slow" data-a="play" data-text="${esc(ex.audio)}" aria-label="Ouvir">${icon("speaker")}</button>` : ""}<span class="q-big">${esc(ex.q)}</span></div>${optsHTML(ex)}`;
    case "listen": return `<p class="q-title">${esc(ex.prompt)}</p>${audioBtns(ex.audio)}${optsHTML(ex)}`;
    case "fill": return `<p class="q-title">${esc(ex.prompt)}</p><p class="q-big" style="font-size:1.5rem">${esc(ex.q).replace("___", '<span style="border-bottom:3px solid var(--brand);padding:0 18px">' + (Runner.sel ? esc(Runner.sel) : "&nbsp;") + "</span>")}</p>${optsHTML(ex)}`;
    case "build": {
      const used = new Set(Runner.built);
      return `<p class="q-title">${esc(ex.prompt)}</p><p class="q-big" style="font-size:1.35rem">${esc(ex.q)}</p>
        <div class="tiles" aria-label="Sua resposta">${Runner.built.map((k) => `<button class="tile" data-a="untile" data-k="${k}" ${Runner.answered ? "disabled" : ""}>${esc(ex.tiles[k])}</button>`).join("") || '<span class="muted small">Toque nas palavras abaixo na ordem certa</span>'}</div>
        <div class="tiles bank">${ex.tiles.map((w, k) => `<button class="tile ${used.has(k) ? "used" : ""}" data-a="tile" data-k="${k}" ${Runner.answered ? "disabled" : ""}>${esc(w)}</button>`).join("")}</div>`;
    }
    case "type": return `<p class="q-title">${esc(ex.prompt)}</p><p class="q-big" style="font-size:1.4rem">${esc(ex.q)}</p><input type="text" id="ans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Digite em inglês" ${Runner.answered ? "disabled" : ""} value="${esc(Runner.sel || "")}">`;
    case "dict": return `<p class="q-title">${esc(ex.prompt)}</p>${audioBtns(ex.audio)}<input type="text" id="ans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Escreva o que ouviu" ${Runner.answered ? "disabled" : ""} value="${esc(Runner.sel || "")}">`;
    case "match": {
      const doneL = new Set(Runner.matchDone.map((p) => p[0])), doneR = new Set(Runner.matchDone.map((p) => p[1]));
      return `<p class="q-title">${esc(ex.prompt)}</p><div class="match">
        <div class="opts">${ex.left.map((w) => `<button class="opt ${doneL.has(w) ? "gone" : ""}" data-a="match" data-side="l" data-v="${esc(w)}" aria-pressed="${Runner.matchSel === "l:" + w}">${esc(w)}</button>`).join("")}</div>
        <div class="opts">${ex.right.map((w) => `<button class="opt ${doneR.has(w) ? "gone" : ""}" data-a="match" data-side="r" data-v="${esc(w)}" aria-pressed="${Runner.matchSel === "r:" + w}">${esc(w)}</button>`).join("")}</div></div>`;
    }
    case "speak": {
      const r = Runner.speakRes;
      return `<p class="q-title">${esc(ex.prompt)}</p><div class="row">${audioBtns(ex.a)}<div class="stack" style="gap:2px;min-width:0"><span class="q-big" style="font-size:1.4rem">${esc(ex.a)}</span><span class="muted">${esc(ex.pt)}</span></div></div>
        <button class="speakbtn" data-a="speak" aria-label="Falar" ${Runner.answered ? "disabled" : ""}>${icon("mic")}</button>
        <p class="muted small" style="text-align:center">${r ? (r.err ? esc(r.err) : `Entendi: “${esc(r.heard)}”`) : "Toque no microfone e fale a frase"}</p>
        ${!Runner.answered ? `<button class="btn ghost small" data-a="speak-skip" style="align-self:center">Não posso falar agora</button>` : ""}`;
    }
  }
  return "";
}
function renderFooter(ex) {
  if (ex.t === "intro") return `<div class="feedback"><button class="btn primary big" data-a="next">Continuar</button></div>`;
  if (ex.t === "match") return Runner.answered ? `<div class="feedback right"><b>Pares completos!</b><button class="btn ok big" data-a="next">Continuar</button></div>` : "";
  if (!Runner.answered) {
    const can = ex.t === "build" ? Runner.built.length > 0 : ex.t === "speak" ? false : ex.t === "type" || ex.t === "dict" ? true : !!Runner.sel;
    return ex.t === "speak" ? "" : `<div class="feedback"><button class="btn primary big" data-a="check" ${can ? "" : "disabled"}>Verificar</button></div>`;
  }
  const last = Runner.results[Runner.results.length - 1] || {};
  if (!Runner.showAnswers) return `<div class="feedback"><span class="ink">Resposta registrada.</span><button class="btn primary big" data-a="next">Continuar</button></div>`;
  if (last.ok) {
    const extra = last.typo ? `<span class="ink small">Quase perfeito! Atenção à grafia: <b>${esc(ex.a)}</b></span>` : ex.t === "speak" && Runner.speakRes ? `<span class="ink small">Pronúncia compreensível: ${Math.round(Runner.speakRes.score * 100)}% das palavras reconhecidas.</span>` : ex.pt && ex.t !== "mc" ? `<span class="ink small">${esc(ex.pt)}</span>` : "";
    return `<div class="feedback right" role="status">${mascot(pick(MASCOT_ORDER), "happy", 74, "fb-mascot")}<div class="fb-head"><span class="fb-ic">${icon("check")}</span><b class="fb-title">${pick(["Muito bem!", "Isso aí!", "Mandou bem!", "Perfeito!", "Excelente!"])}</b></div>${extra}<button class="btn ok big" data-a="next">Continuar</button></div>`;
  }
  const missed = ex.t === "speak" && Runner.speakRes && Runner.speakRes.missed ? `<span class="ink small">Palavras para treinar: ${Runner.speakRes.missed.map((w) => `<b>${esc(w)}</b>`).join(", ")}</span>` : "";
  return `<div class="feedback wrong" role="status">${mascot(pick(MASCOT_ORDER), "sad", 74, "fb-mascot")}<div class="fb-head"><span class="fb-ic">${icon("x")}</span><b class="fb-title">Resposta correta:</b></div><b class="ink fb-answer">${esc(ex.a)}</b>
    ${ex.expl ? `<span class="ink small">${esc(ex.expl)}</span>` : ex.pt && ex.t !== "mc" ? `<span class="ink small">${esc(ex.pt)}</span>` : ""}${missed}
    ${Runner.aiExplain ? `<span class="ink small" id="ai-expl">${esc(Runner.aiExplain)}</span>` : ""}
    <div class="row">${Store.sample && !Runner.aiExplain && Runner.mode !== "duel" ? `<button class="btn small" data-a="ai-explain">${icon("sparkle")} Explicar com IA</button>` : ""}
    ${ex.t === "speak" ? `<button class="btn small" data-a="speak-retry">${icon("repeat")} Tentar de novo</button>` : ""}
    <button class="btn primary big" data-a="next" style="margin-left:auto">Continuar</button></div></div>`;
}

/* avaliação */
function checkAnswer() {
  const ex = curEx(); if (Runner.answered) return;
  let given = Runner.sel, ok = false, typo = false;
  if (ex.t === "type" || ex.t === "dict") { given = ($("#ans") || {}).value || ""; const r = compareAnswer(given, ex.a); ok = r !== "wrong"; typo = r === "typo"; }
  else if (ex.t === "build") { given = Runner.built.map((k) => ex.tiles[k]).join(" "); ok = norm(given) === norm(ex.a); }
  else ok = given === ex.a;
  finishItem(ex, ok, given, typo);
}
function finishItem(ex, ok, given, typo = false) {
  const ms = Date.now() - Runner.itemStart; Runner.answered = true; Runner.sel = Runner.sel ?? given;
  const secs = Math.min(60, ms / 1000); Runner.secs += secs;
  const res = { ok, typo, given, ms, ex }; Runner.results.push(res);
  if (ok) { Runner.combo++; Runner.bestCombo = Math.max(Runner.bestCombo, Runner.combo); } else Runner.combo = 0;
  Runner.heartFlash = false;
  if (Runner.showAnswers) sfx(ok ? "ok" : "bad");
  if (!ok && Runner.mode === "lesson" && !unlimitedHearts()) { loseHeart(); Runner.heartFlash = true; }
  const graded = Runner.mode !== "placement";
  if (graded) {
    const d = D(); d.t++; if (ok) d.c++; S.tot.t++; if (ok) S.tot.c++;
    const sk = d.sk[ex.skill] || (d.sk[ex.skill] = [0, 0]); sk[1]++; if (ok) sk[0]++;
    if (ex.skill === "listen") { d.lt++; if (ok) d.lc++; }
    if ((ex.t === "speak" || ex.t === "dict") && ok) S.tot.speak++;
    if (ex.word || ex.review) wordResult(ex.en, ex.pt, ex.unit, ok);
    if (!ok) S.errors.push({ at: Date.now(), t: ex.t, q: ex.q || ex.audio || ex.a, a: ex.a, given, en: ex.en, pt: ex.pt, unit: ex.unit, skill: ex.skill, expl: ex.expl || "", opts: ex.opts || null });
    if (ok && Runner.mode !== "test" && Runner.mode !== "duel") {
      const fast = ms < 700;
      const base = (ex.t === "speak" ? 3 : 2) + (ex.review ? 1 : 0) + (Runner.requeued.has(Runner.i) ? -1 : 0);
      if (!fast) { const g = gainXP(base); Runner.xp += g; popXP(g); }
    }
    if (!ok && Runner.mode === "lesson" && !Runner.requeued.has(Runner.i) && ex.t !== "speak") { Runner.items.push({ ...ex }); Runner.requeued.add(Runner.items.length - 1); }
  }
  if (Runner.hooks.onAnswer) Runner.hooks.onAnswer(res, Runner);
  save(); rerunner();
}
function popXP(g) { if (g <= 0) return; const p = document.createElement("div"); p.className = "xp-pop"; p.textContent = "+" + g + " XP"; document.body.append(p); setTimeout(() => p.remove(), 1000); }
function nextItem() {
  const ex = curEx();
  if (ex && ex.t === "intro") { wordSeen(ex.en, ex.pt, ex.unit); Runner.secs += Math.min(30, (Date.now() - Runner.itemStart) / 1000); }
  if (Runner.mode === "lesson" && !unlimitedHearts() && heartsNow() <= 0 && Runner.i + 1 < Runner.items.length) { Runner.noHearts = true; Runner.answered = false; rerunner(); return; }
  Runner.i++; Object.assign(Runner, { answered: false, sel: null, built: [], matchSel: null, matchDone: [], matchMiss: 0, speakRes: null, aiExplain: null, qEnd: null, itemStart: Date.now() });
  if (Runner.i >= Runner.items.length) return endRun();
  rerunner(); autoPlay();
}
function autoPlay() { const ex = curEx(); if (ex && (ex.t === "listen" || ex.t === "dict")) setTimeout(() => speak(ex.audio), 250); if (ex && ex.t === "intro") setTimeout(() => speak(ex.en), 250); }
function rerunner() { if (currentView !== "run") return; const y = scrollY; $("#view").innerHTML = renderRunner(); scrollTo(0, y); const inp = $("#ans"); if (inp && !Runner.answered) inp.focus(); startQTimer(); }

/* cronômetros */
let tickHandle = null;
function startQTimer() {
  clearInterval(tickHandle);
  if (!Runner.active || Runner.finished) return;
  if (Runner.qTimer && !Runner.answered && !Runner.qEnd) Runner.qEnd = Date.now() + Runner.qTimer * 1000;
  tickHandle = setInterval(() => {
    if (Runner.timerEnd) { const left = Math.ceil((Runner.timerEnd - Date.now()) / 1000); const el = $("#run-timer .num"); if (el) el.textContent = Math.max(0, left) + "s"; if (left <= 0) { clearInterval(tickHandle); endRun(); return; } }
    if (Runner.qTimer && !Runner.answered && Runner.qEnd) {
      const left = Math.ceil((Runner.qEnd - Date.now()) / 1000); const el = $("#q-timer .num"); if (el) el.textContent = Math.max(0, left) + "s";
      if (left <= 0) { Runner.qEnd = null; finishItem(curEx(), false, "(tempo esgotado)"); }
    }
  }, 250);
}

/* fim da sessão */
function endRun() {
  clearInterval(tickHandle); Music.stop();
  const graded = Runner.results.filter((r) => r.ex.t !== "match");
  const correct = graded.filter((r) => r.ok).length; const total = graded.length || 1;
  const acc = correct / total; Runner.acc = acc; Runner.finished = true;
  const d = D(); d.sec = (d.sec || 0) + Runner.secs; d.min = Math.floor(d.sec / 60);
  let bonus = 0;
  if (Runner.mode === "lesson" && Runner.lessonId) {
    const L = S.lessons[Runner.lessonId] || (S.lessons[Runner.lessonId] = { done: 0, best: 0 });
    if (L.dayKey !== today()) { L.dayKey = today(); L.dayCount = 0; }
    L.dayCount++; L.done++; L.best = Math.max(L.best, Math.round(acc * 100)); L.last = today();
    const mult = L.dayCount > 2 ? 0.25 : 1;
    bonus = Math.round((10 + (acc >= 0.9 ? 10 : acc >= 0.8 ? 5 : 0)) * mult);
    d.l++; S.tot.lessons++; if (acc >= 0.8) d.good++; if (acc === 1 && total >= 5) S.flags.perfect = true;
  } else if (Runner.mode === "review" || Runner.mode === "errors" || Runner.mode === "blitz") { bonus = Math.round(5 * (acc >= 0.8 ? 1 : 0.5)); if (acc >= 0.8 && total >= 8) d.good++; }
  else if (Runner.mode === "test") finishTest(acc);
  else if (Runner.mode === "placement") finishPlacement();
  if (bonus) { const g = gainXP(bonus); Runner.xp += g; }
  if (["review", "errors", "blitz"].includes(Runner.mode) && acc >= 0.6) Runner.heartGain = gainHeart(1);
  if (Runner.mode !== "duel") sfx("done");
  if (Runner.hooks.onFinish) Runner.hooks.onFinish(Runner);
  setPresence("No início"); save(); queueCheck(); rerunner();
}
function renderRunEnd() {
  if (Runner.hooks.renderEnd) return Runner.hooks.renderEnd(Runner);
  if (["lesson", "review", "errors", "blitz"].includes(Runner.mode)) return lessonEndHTML();
  const acc = Math.round((Runner.acc || 0) * 100); const mins = Math.max(1, Math.round(Runner.secs / 60));
  const wrong = Runner.results.filter((r) => !r.ok && r.ex.t !== "match");
  const title = Runner.mode === "placement" ? "Teste de nivelamento concluído" : Runner.mode === "test" ? (Runner.passed ? `Aprovado no teste ${Runner.band}!` : `Teste ${Runner.band}: ainda não foi desta vez`) : acc >= 90 ? "Excelente aula!" : acc >= 70 ? "Boa aula!" : "Aula concluída";
  const sub = Runner.mode === "placement" ? `Estimativa inicial: <b>${esc(S.cefr.estimate || "A1")}</b>. Liberamos as trilhas certas para você.` : Runner.mode === "test" ? (Runner.passed ? "Seu certificado já está em Recompensas." : "Você precisa de 80% para passar. Revise os erros abaixo e tente de novo quando quiser.") : "";
  return `<div class="runner"><div class="card stack celebrate" style="padding:28px">
    <p class="eyebrow">${esc(Runner.title)}</p><h1>${title}</h1>${sub ? `<p class="muted">${sub}</p>` : ""}
    <div class="stats" style="width:100%;margin-top:8px">
      <div class="stat"><span class="muted small">XP ganho</span><b class="num" style="color:var(--xp)">+${Runner.xp}</b></div>
      <div class="stat"><span class="muted small">Acertos</span><b class="num">${acc}%</b></div>
      <div class="stat"><span class="muted small">Tempo</span><b class="num">${mins} min</b></div>
      <div class="stat"><span class="muted small">Sequência</span><b class="num">${streakAlive()} ${streakAlive() === 1 ? "dia" : "dias"}</b></div>
    </div>
    ${wrong.length ? `<div class="card flat" style="width:100%;text-align:left"><p class="eyebrow">Para revisar</p><div class="list">${wrong.slice(0, 8).map((r) => `<div class="li"><div class="grow"><p class="small muted ell">${esc(r.ex.q || r.ex.audio || "")}</p><p><b>${esc(r.ex.a)}</b>${r.ex.expl ? ` <span class="muted small">— ${esc(r.ex.expl)}</span>` : ""}</p></div>${r.ex.en ? `<button class="btn ghost small" data-a="play" data-text="${esc(r.ex.en)}" aria-label="Ouvir">${icon("speaker")}</button>` : ""}</div>`).join("")}</div></div>` : ""}
    <div class="row" style="justify-content:center"><button class="btn primary big" data-a="run-done">Continuar</button>${Runner.mode === "lesson" ? `<button class="btn big" data-a="start-review">Revisar palavras</button>` : ""}</div>
  </div></div>`;
}
function leaveRun() {
  Runner.active = false; clearInterval(tickHandle); Music.stop();
  const medals = Runner.pendingMedals.splice(0);
  const back = Runner.hooks.back || "learn";
  const lvl = Runner.pendingLevel; Runner.pendingLevel = null;
  go(back);
  if (lvl) setTimeout(() => modal(lvl), 300);
  else if (medals.length) setTimeout(() => showMedal(medals[0], medals.length - 1), 300);
}

/* ---------- sessões ---------- */
function startLesson(unitId, kind) {
  const u = unitById(unitId); if (!u) return;
  if (!canStartLesson()) return;
  const count = LEN_COUNT[S.profile.minutes] || 12;
  startRun({ mode: "lesson", title: `${u.title} · ${kind === "v" ? "Vocabulário" : "Frases"}`, lessonId: `${u.id}_${kind}`, unit: u, items: buildLesson(u, kind, count), presence: `Lição: ${u.title}` });
}
function startDaily(minutes) {
  if (!canStartLesson()) return;
  if (minutes) { S.profile.minutes = minutes; save(); }
  const nl = nextLesson(); const count = LEN_COUNT[S.profile.minutes] || 12;
  const nReview = Math.min(dueWords().length, Math.round(count * 0.3));
  const items = buildLesson(nl.unit, nl.kind, count - nReview);
  const rev = reviewItems(nReview);
  const mixed = items.slice(); rev.forEach((r, k) => mixed.splice(Math.min(mixed.length, 3 + k * 3), 0, r));
  startRun({ mode: "lesson", title: `Aula do dia · ${nl.unit.title}`, lessonId: `${nl.unit.id}_${nl.kind}`, unit: nl.unit, items: mixed, presence: `Aula do dia: ${nl.unit.title}` });
}
function startReview() {
  const n = Math.max(8, Math.min(20, dueWords().length));
  const items = reviewItems(n);
  if (!items.length) return toast("Você ainda não tem palavras para revisar. Faça uma lição primeiro.");
  startRun({ mode: "review", title: "Revisão inteligente", items, presence: "Revisando palavras" });
}
function startListening() {
  const rng = Math.random; const units = LUE_UNITS.filter((u) => bandUnlocked(u.cefr));
  const words = wordPool(units).map((w) => ({ ...w, isWord: true })); const sents = sentPool(units);
  const items = [...shuffle(words, rng).slice(0, 4).map((w) => exListen(w, words, rng)), ...shuffle(sents, rng).slice(0, 4).map((s) => exListen(s, sents, rng)), ...shuffle(sents, rng).slice(0, 3).map(exDict)];
  startRun({ mode: "review", title: "Treino de escuta", items: shuffle(items), presence: "Treinando escuta" });
}
function startPronunciation() {
  const units = LUE_UNITS.filter((u) => bandUnlocked(u.cefr)); const sents = shuffle(sentPool(units)).slice(0, 6);
  if (!SR_OK) toast("O microfone não está disponível aqui: vamos treinar com ditado (ouvir e escrever).");
  startRun({ mode: "review", title: "Treino de pronúncia", items: sents.map(exSpeak), presence: "Treinando pronúncia" });
}
function startErrors() {
  const items = errorItems(12); if (!items.length) return toast("Nenhum erro registrado ainda. Ótimo sinal!");
  startRun({ mode: "errors", title: "Revisão de erros", items, presence: "Revisando erros" });
}
function startBlitz() {
  let words = Object.entries(S.words).filter(([, w]) => w.box >= 1).map(([en, w]) => ({ en, pt: w.pt, unit: w.unit, isWord: true }));
  if (words.length < 8) words = wordPool(bandUnits("A1")).map((w) => ({ ...w, isWord: true }));
  const pool = ALL_WORDS(); const items = [];
  for (let k = 0; k < 40; k++) items.push(exMC(pick(words), Math.random() < 0.5 ? "en2pt" : "pt2en", pool, Math.random));
  startRun({ mode: "blitz", title: "Desafio relâmpago", items, timerSec: 60, presence: "No desafio relâmpago" });
}
function startLevelTest(band) {
  const rng = Math.random; const units = bandUnits(band);
  const words = wordPool(units).map((w) => ({ ...w, isWord: false })); const sents = sentPool(units);
  const fills = shuffle(units.flatMap((u) => u.fills.map((f) => exFill(f, u.id, rng))), rng).slice(0, 4);
  const items = [...fills, ...shuffle(sents, rng).slice(0, 3).map((s) => exMC(s, "pt2en", sents, rng)), ...shuffle(words, rng).slice(0, 2).map((w) => exMC(w, "en2pt", words, rng)), ...shuffle(sents, rng).slice(0, 2).map((s) => exListen(s, sents, rng)), exType(pick(sents.filter((s) => tokens(s.en).length <= 6), rng) || sents[0])];
  startRun({ mode: "test", band, title: `Teste de nível ${band}`, items: shuffle(items, rng), showAnswers: false, presence: `Fazendo o teste ${band}` });
}
function finishTest(acc) {
  const band = Runner.band; const score = Math.round(acc * 100);
  S.tot.tests[band] = Math.max(S.tot.tests[band] || 0, score);
  Runner.passed = acc >= 0.8;
  if (Runner.passed) {
    const first = !S.cefr.passed[band];
    S.cefr.passed[band] = { at: today(), score };
    unlockBand(CEFR[CEFR.indexOf(band) + 1]);
    if (first) { const g = gainXP(100); Runner.xp += g; gainCoins(50); }
  }
}
function startPlacement() {
  const items = LUE_PLACEMENT.map((p) => ({ t: "mc", prompt: "Escolha a resposta certa", q: p[0], a: p[1], opts: shuffle(p[2]), band: p[3], skill: "grammar" }));
  startRun({ mode: "placement", title: "Teste de nivelamento", items, showAnswers: false, hooks: { back: "home" }, presence: "Fazendo o nivelamento" });
}
function finishPlacement() {
  const by = {}; for (const r of Runner.results) { const b = r.ex.band; by[b] = by[b] || [0, 0]; by[b][1]++; if (r.ok) by[b][0]++; }
  let est = null; for (const b of CEFR) { const v = by[b]; if (!v) break; if (v[0] / v[1] >= 0.67) est = b; else break; }
  const startIdx = est ? CEFR.indexOf(est) : -1;
  S.cefr.estimate = est || "A1"; S.cefr.start = Math.max(0, startIdx); S.flags.placementDone = true;
  for (let k = 0; k <= Math.min(startIdx + 1, 2); k++) unlockBand(CEFR[k]);
}

/* certificado (SVG para baixar) */
function certificateSVG(band) {
  const info = S.cefr.passed[band] || {}; const name = esc(S.profile.username);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="850" viewBox="0 0 1200 850"><rect width="1200" height="850" fill="#FBFBFE"/><rect x="30" y="30" width="1140" height="790" rx="28" fill="none" stroke="#3152F5" stroke-width="6"/><rect x="52" y="52" width="1096" height="746" rx="18" fill="none" stroke="#E59A00" stroke-width="2"/>
<text x="600" y="170" text-anchor="middle" font-family="Georgia,serif" font-size="30" fill="#5B6185" letter-spacing="6">LEVEL UP ENGLISH</text>
<text x="600" y="260" text-anchor="middle" font-family="Georgia,serif" font-size="62" fill="#151933" font-weight="bold">Certificado de etapa ${band}</text>
<text x="600" y="350" text-anchor="middle" font-family="Georgia,serif" font-size="28" fill="#5B6185">Certificamos que</text>
<text x="600" y="430" text-anchor="middle" font-family="Georgia,serif" font-size="56" fill="#3152F5">${name}</text>
<text x="600" y="510" text-anchor="middle" font-family="Georgia,serif" font-size="26" fill="#151933">foi aprovado(a) no teste da etapa ${band} (escala compatível com o CEFR)</text>
<text x="600" y="555" text-anchor="middle" font-family="Georgia,serif" font-size="26" fill="#151933">com ${info.score || 0}% de acertos em ${esc(info.at || today())}.</text>
<text x="600" y="700" text-anchor="middle" font-family="Georgia,serif" font-size="18" fill="#5B6185">Certificado de progresso no app, sem validade acadêmica oficial.</text></svg>`;
}
async function downloadCertificate(band) {
  if (!Store.downloads) return toast("O download não está disponível nesta visualização.");
  try { await Store.downloads.save({ filename: `certificado-level-up-${band}.svg`, data: new Blob([certificateSVG(band)], { type: "image/svg+xml" }) }); }
  catch (e) { if (e && e.code !== "declined") toast("Não foi possível baixar o certificado agora."); }
}
