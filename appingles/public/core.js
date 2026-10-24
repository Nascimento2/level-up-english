/* Level Up English — núcleo: utilidades, estado, armazenamento, gamificação. */
"use strict";

/* ---------- utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pad = (n) => String(n).padStart(2, "0");
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sum = (a) => a.reduce((x, y) => x + y, 0);
function dk(d = new Date()) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function mk(d = new Date()) { return d.getFullYear() + "-" + pad(d.getMonth() + 1); }
function wk(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day);
  const y = t.getUTCFullYear(); const w = Math.ceil(((t - Date.UTC(y, 0, 1)) / 864e5 + 1) / 7);
  return y + "-W" + pad(w);
}
function keyToDate(k) { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); }
function addDays(k, n) { const x = keyToDate(k); x.setDate(x.getDate() + n); return dk(x); }
function daysBetween(a, b) { return Math.round((keyToDate(b) - keyToDate(a)) / 864e5); }
function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function hashStr(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function shuffle(a, rng = Math.random) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function pick(a, rng = Math.random) { return a[Math.floor(rng() * a.length)]; }
function rid(n = 6) { const c = "abcdefghjkmnpqrstuvwxyz23456789"; let s = ""; const b = crypto.getRandomValues(new Uint8Array(n)); for (const x of b) s += c[x % c.length]; return s; }
function norm(s) {
  return String(s || "").toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/\bi'm\b/g, "i am").replace(/\bdon't\b/g, "do not").replace(/\bdoesn't\b/g, "does not").replace(/\bdidn't\b/g, "did not")
    .replace(/\bcan't\b/g, "cannot").replace(/\bwon't\b/g, "will not").replace(/\bit's\b/g, "it is").replace(/\blet's\b/g, "let us")
    .replace(/\bi'll\b/g, "i will").replace(/\bi'd\b/g, "i would").replace(/\bwe're\b/g, "we are").replace(/\byou're\b/g, "you are")
    .replace(/\bthey're\b/g, "they are").replace(/\bi've\b/g, "i have").replace(/\bwhat's\b/g, "what is")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
}
function lev(a, b) {
  if (a === b) return 0; const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
  return prev[n];
}
/* compara resposta digitada: "exact" | "typo" | "wrong" */
function compareAnswer(given, expected) {
  const alts = String(expected).split(/\s*\/\s*/);
  const g = norm(given);
  let best = "wrong";
  for (const alt of alts) {
    const e = norm(alt); if (!e) continue;
    if (g === e) return "exact";
    const d = lev(g, e);
    if (d <= Math.max(1, Math.floor(e.length / 12))) best = "typo";
  }
  return best;
}
/* pontuação de pronúncia por palavras (tolerante a sotaque: só checa se as palavras foram reconhecidas) */
function wordMatch(target, heardList) {
  const t = norm(target).split(" ").filter(Boolean);
  let bestScore = 0, bestHeard = "", bestMiss = t;
  for (const heard of heardList) {
    const h = norm(heard).split(" ").filter(Boolean);
    const dp = Array.from({ length: t.length + 1 }, () => new Array(h.length + 1).fill(0));
    for (let i = 1; i <= t.length; i++) for (let j = 1; j <= h.length; j++) {
      const eq = t[i - 1] === h[j - 1] || (t[i - 1].length > 3 && lev(t[i - 1], h[j - 1]) <= 1);
      dp[i][j] = eq ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
    const score = t.length ? dp[t.length][h.length] / t.length : 0;
    if (score >= bestScore) {
      const hs = new Set(h); bestScore = score; bestHeard = heard;
      bestMiss = t.filter((w) => !hs.has(w) && ![...hs].some((x) => w.length > 3 && lev(w, x) <= 1));
    }
  }
  return { score: bestScore, heard: bestHeard, missed: bestMiss };
}

/* ---------- ícones ---------- */
const IC = {
  home: '<path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M8 7h7"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.7-3.6 3.3-5.5 6.5-5.5s5.8 1.9 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c1.9.7 3.1 2.4 3.5 5.2"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H4a3 3 0 0 0 4 4M16 6h4a3 3 0 0 1-4 4M12 13v4M8 20h8M10 17h4"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
  gift: '<rect x="3" y="8" width="18" height="5" rx="1"/><path d="M5 13v8h14v-8M12 8v13M12 8c-1-3-5-4-5-1.5S10 8 12 8c2 0 5 1 5-1.5S13 5 12 8"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4.2-6.5 8-6.5s7 2 8 6.5"/>',
  chart: '<path d="M4 20V4M4 20h16"/><path d="M8 16v-5M12 16V8M16 16v-3"/>',
  speaker: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
  slow: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 12h4"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
  send: '<path d="M4 12 20 4l-6 16-3-7z"/>',
  flame: '<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.3 1.5 1 2.5 2 2.5-1-3 0-5.5 1-8z"/>',
  bolt: '<path d="M13 3 5 13h6l-1 8 8-10h-6z"/>',
  coin: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v9M9.5 9.5c0-1 1.1-1.8 2.5-1.8s2.5.7 2.5 1.8-1 1.5-2.5 1.9-2.5.9-2.5 2c0 1 1.1 1.8 2.5 1.8s2.5-.8 2.5-1.8"/>',
  check: '<path d="M5 12.5 10 17l9-10"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  ear: '<path d="M7 9a5 5 0 0 1 10 0c0 3-3 4-3 7a3 3 0 0 1-6 0"/><path d="M10 9a2 2 0 0 1 4 0"/>',
  repeat: '<path d="M4 9a6 6 0 0 1 10-3l2 2M20 15a6 6 0 0 1-10 3l-2-2"/><path d="M16 4v4h-4M8 20v-4h4"/>',
  sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  shield: '<path d="M12 3 20 6v6c0 4.5-3.4 7.8-8 9-4.6-1.2-8-4.5-8-9V6z"/>',
  more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  swords: '<path d="M4 4l9 9M4 4v4M4 4h4M20 4l-9 9M20 4v4M20 4h-4M7 14l3 3M17 14l-3 3M5 19l3-3M19 19l-3-3"/>',
  star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
};
function icon(name, cls = "icon") { return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[name] || ""}</svg>`; }
const LOGO = '<svg class="logo-mark" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="11" fill="var(--brand)"/><path d="M11 27 L18 20 L22 24 L30 14" fill="none" stroke="var(--on-brand)" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 14 H30 V20" fill="none" stroke="var(--xp)" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* ---------- gamificação: níveis, medalhas, loja ---------- */
const LEVELS = [
  { n: 1, name: "Iniciante", xp: 0 }, { n: 2, name: "Explorador", xp: 300 }, { n: 3, name: "Comunicador", xp: 900 },
  { n: 4, name: "Intermediário", xp: 2000 }, { n: 5, name: "Conversador", xp: 4000 }, { n: 6, name: "Avançado", xp: 7500 },
  { n: 7, name: "Fluente em desenvolvimento", xp: 12000 },
];
const CEFR = ["A1", "A2", "B1", "B2", "C1", "C2"];
function levelOf(xp) { let L = LEVELS[0]; for (const l of LEVELS) if (xp >= l.xp) L = l; return L; }
function nextLevel(xp) { return LEVELS.find((l) => l.xp > xp) || null; }

const ACH = [
  { id: "first_lesson", name: "Primeira aula", desc: "Conclua sua primeira lição", coins: 20, kind: "dedicação", test: (s) => s.tot.lessons >= 1 },
  { id: "perfect", name: "Aula perfeita", desc: "Termine uma lição com 100% de acertos", coins: 30, kind: "domínio", test: (s) => !!s.flags.perfect },
  { id: "streak3", name: "Três dias seguidos", desc: "Estude 3 dias em sequência", coins: 30, kind: "dedicação", test: (s) => s.streak.best >= 3 },
  { id: "streak7", name: "Semana completa", desc: "Estude 7 dias em sequência", coins: 60, kind: "dedicação", test: (s) => s.streak.best >= 7 },
  { id: "streak30", name: "Maratonista", desc: "Estude 30 dias em sequência", coins: 200, kind: "dedicação", test: (s) => s.streak.best >= 30 },
  { id: "words50", name: "Vocabulário em construção", desc: "Aprenda 50 palavras", coins: 50, kind: "domínio", test: (s) => learnedCount(s) >= 50 },
  { id: "words150", name: "Dicionário ambulante", desc: "Aprenda 150 palavras", coins: 120, kind: "domínio", test: (s) => learnedCount(s) >= 150 },
  { id: "review100", name: "Mestre da revisão", desc: "Faça 100 revisões corretas", coins: 80, kind: "dedicação", test: (s) => s.tot.reviews >= 100 },
  { id: "convo1", name: "Primeira conversa", desc: "Converse com o professor de IA", coins: 20, kind: "dedicação", test: (s) => s.convo.msgs >= 1 },
  { id: "convo50", name: "Boa de papo", desc: "Envie 50 mensagens ao professor de IA", coins: 100, kind: "dedicação", test: (s) => s.convo.msgs >= 50 },
  { id: "speak20", name: "Voz confiante", desc: "Acerte 20 exercícios de pronúncia ou ditado", coins: 60, kind: "domínio", test: (s) => s.tot.speak >= 20 },
  { id: "duel1", name: "Primeiro duelo", desc: "Termine um desafio com um amigo", coins: 20, kind: "dedicação", test: (s) => s.duels.played >= 1 },
  { id: "duelwin", name: "Fera do duelo", desc: "Vença 3 desafios", coins: 80, kind: "domínio", test: (s) => s.duels.w >= 3 },
  { id: "friend1", name: "Turma formada", desc: "Adicione um amigo", coins: 20, kind: "dedicação", test: (s) => s.friends.length >= 1 },
  { id: "group1", name: "Em equipe", desc: "Entre em um grupo de estudo", coins: 20, kind: "dedicação", test: (s) => s.groups.length >= 1 },
  { id: "missions20", name: "Missões em dia", desc: "Conclua 20 missões", coins: 80, kind: "dedicação", test: (s) => s.tot.missions >= 20 },
  { id: "test_A1", name: "Certificado A1", desc: "Passe no teste de nível A1", coins: 100, kind: "domínio", test: (s) => !!s.cefr.passed.A1 },
  { id: "test_A2", name: "Certificado A2", desc: "Passe no teste de nível A2", coins: 150, kind: "domínio", test: (s) => !!s.cefr.passed.A2 },
  { id: "test_B1", name: "Certificado B1", desc: "Passe no teste de nível B1", coins: 200, kind: "domínio", test: (s) => !!s.cefr.passed.B1 },
  { id: "test_B2", name: "Certificado B2", desc: "Passe no teste de nível B2", coins: 300, kind: "domínio", test: (s) => !!s.cefr.passed.B2 },
  { id: "lvl3", name: "Comunicador", desc: "Alcance o nível 3", coins: 40, kind: "dedicação", test: (s) => levelOf(s.xp).n >= 3 },
  { id: "lvl5", name: "Conversador", desc: "Alcance o nível 5", coins: 100, kind: "dedicação", test: (s) => levelOf(s.xp).n >= 5 },
  { id: "lvl7", name: "Fluente em desenvolvimento", desc: "Alcance o nível 7", coins: 250, kind: "dedicação", test: (s) => levelOf(s.xp).n >= 7 },
];
const MEDAL_COLORS = { "dedicação": ["#F59F00", "#FFE8A3"], "domínio": ["#12B886", "#C3FAE8"] };

const AV_COLORS = ["#3152F5", "#0B9668", "#E8590C", "#D6336C", "#6741D9", "#1098AD", "#C77700", "#495057"];
const SHOP = {
  shapes: [
    { id: "circle", name: "Círculo", price: 0 }, { id: "squircle", name: "Quadrado", price: 0 },
    { id: "hex", name: "Hexágono", price: 60 }, { id: "badge", name: "Selo", price: 120 }, { id: "shield", name: "Escudo", price: 0, req: "test_A1" },
  ],
  frames: [
    { id: "none", name: "Sem moldura", price: 0 }, { id: "bronze", name: "Bronze", price: 0, lvl: 2 }, { id: "silver", name: "Prata", price: 0, lvl: 4 },
    { id: "gold", name: "Ouro", price: 0, lvl: 6 }, { id: "neon", name: "Neon", price: 150 }, { id: "streak", name: "Chama", price: 0, req: "streak7" },
    { id: "cefr", name: "Certificada", price: 0, req: "test_A2" },
  ],
  themes: [
    { id: "azul", name: "Azul Level Up", price: 0 }, { id: "coral", name: "Coral", price: 100 }, { id: "menta", name: "Menta", price: 100 },
    { id: "violeta", name: "Violeta", price: 150 }, { id: "ouro", name: "Ouro", price: 0, lvl: 5 },
  ],
  titles: [
    { id: "Aprendiz", price: 0 }, { id: "Explorador de palavras", price: 40 }, { id: "Mestre da revisão", req: "review100" },
    { id: "Fera do duelo", req: "duelwin" }, { id: "Maratonista", req: "streak30" }, { id: "Boa de papo", req: "convo50" },
    { id: "Voz confiante", req: "speak20" }, { id: "Certificado B1", req: "test_B1" }, { id: "Viajante", req: "traveler" },
  ],
};

/* ---------- estado ---------- */
function newState() {
  return {
    v: 1, created: Date.now(), onboarded: false,
    profile: { username: "", level0: "zero", goal: "conversa", minutes: 10, pref: "ambos", avatar: { shape: "circle", color: AV_COLORS[0] }, frame: "none", title: "Aprendiz", theme: "system", accent: "azul", priv: false, reqs: true, showRank: true, rate: 1 },
    xp: 0, coins: 50, plan: "free",
    cefr: { estimate: null, start: null, passed: {}, unlocked: ["A1"] },
    lessons: {}, words: {}, days: {}, errors: [],
    streak: { n: 0, last: null, best: 0, freezes: 0 },
    missions: { day: null, list: [], week: null, wlist: [], claimedEvent: null },
    ach: {}, owned: { shapes: ["circle", "squircle"], frames: ["none"], themes: ["azul"], titles: ["Aprendiz"] },
    convo: { msgs: 0, sessions: [] }, duels: { played: 0, w: 0, l: 0, seen: {} },
    friends: [], groups: [], aiLessons: [], ai: { day: null, n: 0 },
    tot: { lessons: 0, reviews: 0, c: 0, t: 0, missions: 0, speak: 0, tests: {} },
    flags: {},
  };
}
let S = newState();
function migrate(s) {
  try { s = s ? JSON.parse(JSON.stringify(s)) : s; } catch {}
  const base = newState();
  const out = Object.assign(base, s || {});
  for (const k of ["profile", "cefr", "streak", "missions", "owned", "convo", "duels", "tot", "flags", "ai"]) out[k] = Object.assign(newState()[k], (s || {})[k] || {});
  out.profile.avatar = Object.assign({ shape: "circle", color: AV_COLORS[0] }, out.profile.avatar || {});
  return out;
}
const today = () => dk();
function D(k = today()) {
  if (!S.days[k]) S.days[k] = { xp: 0, min: 0, c: 0, t: 0, w: 0, l: 0, r: 0, cv: 0, cvmin: 0, good: 0, lt: 0, lc: 0, du: 0, sk: {} };
  return S.days[k];
}
function learnedCount(s = S) { return Object.values(s.words).filter((w) => w.box >= 1).length; }
function totalAccuracy() { return S.tot.t ? S.tot.c / S.tot.t : 0; }
function certified() { let c = null; for (const b of CEFR) if (S.cefr.passed[b]) c = b; return c; }
function studying() { const c = certified(); const i = c ? CEFR.indexOf(c) + 1 : 0; const est = S.cefr.estimate ? CEFR.indexOf(S.cefr.estimate) : -1; return CEFR[Math.min(5, Math.max(i, est))]; }
function cefrIndexNow() { const c = certified(); return c ? CEFR.indexOf(c) + 1 : 0; }
function dailyGoalXP() { return { 5: 50, 10: 100, 15: 150, 30: 300 }[S.profile.minutes] || 100; }
function activeDays(n = 30) { let c = 0; for (let i = 0; i < n; i++) { const d = S.days[addDays(today(), -i)]; if (d && (d.xp > 0 || d.min > 0)) c++; } return c; }
function weekXP() { let x = 0; const w = wk(); for (const [k, d] of Object.entries(S.days)) if (wk(keyToDate(k)) === w) x += d.xp; return x; }
function monthXP() { let x = 0; const m = mk(); for (const [k, d] of Object.entries(S.days)) if (k.startsWith(m)) x += d.xp; return x; }
function monthField(f) { let x = 0; const m = mk(); for (const [k, d] of Object.entries(S.days)) if (k.startsWith(m)) x += d[f] || 0; return x; }
function weekField(f) { let x = 0; const w = wk(); for (const [k, d] of Object.entries(S.days)) if (wk(keyToDate(k)) === w) x += d[f] || 0; return x; }
function pruneState() {
  const keys = Object.keys(S.days).sort(); while (keys.length > 120) delete S.days[keys.shift()];
  if (S.errors.length > 150) S.errors = S.errors.slice(-150);
  if (S.convo.sessions.length > 60) S.convo.sessions = S.convo.sessions.slice(-60);
  const seen = Object.keys(S.duels.seen); if (seen.length > 200) for (const k of seen.slice(0, seen.length - 200)) delete S.duels.seen[k];
}

/* ---------- sequência de estudos ---------- */
function touchStreak() {
  const t = today(); const st = S.streak;
  if (st.last === t) return;
  if (!st.last) st.n = 1;
  else {
    const gap = daysBetween(st.last, t);
    if (gap === 1) st.n += 1;
    else if (gap > 1 && st.freezes >= gap - 1) { st.freezes -= gap - 1; st.n += 1; toast(`Protetor de sequência usado: sua sequência de ${st.n - 1} dias continua.`); }
    else st.n = 1;
  }
  st.last = t; st.best = Math.max(st.best, st.n);
}
function streakAlive() { if (!S.streak.last) return 0; const gap = daysBetween(S.streak.last, today()); return gap <= 1 + (S.streak.freezes || 0) ? S.streak.n : 0; }

/* ---------- XP com proteção contra farm ----------
   - respostas rápidas demais (< 700 ms) não rendem XP
   - repetir a mesma lição mais de 2x no dia rende 25%
   - XP diário acima de 800 rende 50%, acima de 1600 rende 20% */
function xpMultiplier() { const x = D().xp; return x < 800 ? 1 : x < 1600 ? 0.5 : 0.2; }
function gainXP(base, why) {
  if (base <= 0) return 0;
  const before = levelOf(S.xp).n;
  const g = Math.max(1, Math.round(base * xpMultiplier()));
  S.xp += g; D().xp += g; touchStreak();
  const after = levelOf(S.xp).n;
  if (after > before) setTimeout(() => celebrateLevel(after), 400);
  queueCheck();
  return g;
}
function gainCoins(n) { S.coins += n; }

/* ---------- repetição espaçada (Leitner) ---------- */
const BOX_DAYS = [0, 1, 2, 4, 7, 15, 30];
function wordSeen(en, pt, unit) { if (!S.words[en]) S.words[en] = { pt, unit, box: 0, due: today(), right: 0, wrong: 0 }; return S.words[en]; }
function wordResult(en, pt, unit, ok) {
  const w = wordSeen(en, pt, unit); const wasNew = w.box === 0; const wasDue = w.box >= 1 && w.due <= today();
  if (ok) { w.right++; w.box = Math.min(6, w.box + 1); w.due = addDays(today(), BOX_DAYS[w.box]); if (wasNew) D().w++; if (wasDue) { D().r++; S.tot.reviews++; } }
  else { w.wrong++; w.box = Math.max(1, Math.min(w.box, 1)); w.due = today(); }
  return { wasNew, wasDue };
}
function dueWords() { const t = today(); return Object.entries(S.words).filter(([, w]) => w.box >= 1 && w.due <= t).map(([en, w]) => ({ en, ...w })); }
function weakWords(n = 12) { return Object.entries(S.words).filter(([, w]) => w.box >= 1).map(([en, w]) => ({ en, ...w })).sort((a, b) => (b.wrong - b.right / 3) - (a.wrong - a.right / 3)).slice(0, n); }

/* ---------- missões ---------- */
const MISSION_DEFS = {
  words: { m: "w", t: (n) => `Aprenda ${n} palavras novas`, n: { 5: 5, 10: 10, 15: 12, 30: 20 } },
  minutes: { m: "min", t: (n) => `Pratique inglês por ${n} minutos`, n: { 5: 5, 10: 10, 15: 15, 30: 30 } },
  lessons: { m: "l", t: (n) => n === 1 ? "Complete 1 lição" : `Complete ${n} lições`, n: { 5: 1, 10: 2, 15: 3, 30: 4 } },
  convo: { m: "cvmin", t: (n) => `Converse por ${n} minutos com o professor de IA`, n: { 5: 2, 10: 5, 15: 5, 30: 8 } },
  good: { m: "good", t: () => "Acerte 8 de 10: termine uma lição com 80% ou mais", n: { 5: 1, 10: 1, 15: 1, 30: 2 } },
  review: { m: "r", t: (n) => `Revise ${n} palavras antigas`, n: { 5: 8, 10: 15, 15: 15, 30: 25 } },
  duel: { m: "du", t: () => "Faça um desafio com um amigo", n: { 5: 1, 10: 1, 15: 1, 30: 1 } },
  listen: { m: "lt", t: (n) => `Complete ${n} exercícios de escuta`, n: { 5: 4, 10: 6, 15: 8, 30: 12 } },
};
const WEEK_DEFS = {
  days: { t: (n) => `Estude em ${n} dias diferentes nesta semana`, n: { 5: 4, 10: 5, 15: 5, 30: 6 }, v: () => { let c = 0; const w = wk(); for (const [k, d] of Object.entries(S.days)) if (wk(keyToDate(k)) === w && d.xp > 0) c++; return c; } },
  xp: { t: (n) => `Ganhe ${n} XP nesta semana`, n: { 5: 300, 10: 500, 15: 700, 30: 1200 }, v: () => weekXP() },
  convo: { t: (n) => `Envie ${n} mensagens ao professor de IA`, n: { 5: 10, 10: 20, 15: 25, 30: 40 }, v: () => weekField("cv") },
};
function ensureMissions() {
  const t = today(); const m = S.profile.minutes || 10;
  if (S.missions.day !== t) {
    const rng = mulberry32(hashStr(t + (Store.uid || "local")));
    const hasDue = dueWords().length >= 5;
    let pool = ["words", "convo", "good", "listen"]; if (hasDue) pool.push("review"); if (S.profile.pref !== "sozinho" && S.friends.length) pool.push("duel");
    const first = rng() < 0.5 ? "lessons" : "minutes";
    const ids = [first, ...shuffle(pool, rng).slice(0, 2)];
    S.missions.day = t; S.missions.list = ids.map((id) => ({ id, n: MISSION_DEFS[id].n[m], claimed: false }));
  }
  const w = wk();
  if (S.missions.week !== w) { S.missions.week = w; S.missions.wlist = Object.keys(WEEK_DEFS).map((id) => ({ id, n: WEEK_DEFS[id].n[m], claimed: false })); }
}
function missionProgress(mi) { return Math.min(mi.n, D()[MISSION_DEFS[mi.id].m] || 0); }
function weekMissionProgress(mi) { return Math.min(mi.n, WEEK_DEFS[mi.id].v()); }

/* ---------- conquistas ---------- */
let checkTimer = null;
function queueCheck() { clearTimeout(checkTimer); checkTimer = setTimeout(checkAchievements, 300); }
function checkAchievements() {
  if (["u06_v", "u06_f", "u07_v", "u07_f"].every((k) => S.lessons[k] && S.lessons[k].done)) S.flags.traveler = true;
  const newly = [];
  for (const a of ACH) if (!S.ach[a.id] && a.test(S)) { S.ach[a.id] = today(); gainCoins(a.coins); newly.push(a); }
  if (newly.length) { save(); if (!Runner.active) showMedal(newly[0], newly.length - 1); else Runner.pendingMedals.push(...newly); }
}
function hasReq(req) { if (!req) return true; if (req === "traveler") return !!S.flags.traveler; return !!S.ach[req]; }
function itemUnlocked(it) { return (!it.lvl || levelOf(S.xp).n >= it.lvl) && hasReq(it.req); }

/* ---------- plataforma (claude.ai) e armazenamento ---------- */
const Store = { mode: "local", db: null, user: null, uid: null, room: null, sample: null, downloads: null, isOwner: false, ready: false };
const LKEY = "lue-state-v1";
let PLAYERS = [], MOD = { hidden: {} }, CUSTOM = { lessons: [] }, CHEERS = [], FREQ_IN = [], FREQ_OUT = [], DUELS_IN = [], DUELS_OUT = [], PEERS = [];

async function initPlatform() {
  if (!window.claude || !claude.use) return;
  try {
    const wait = (pr, ms) => window.LUE_STANDALONE ? pr : Promise.race([pr, new Promise((r) => setTimeout(() => r(null), ms))]);
    const [db, user] = await wait(Promise.all([claude.use("db"), claude.use("user")]), 8000) || [null, null];
    Store.user = user;
    if (user) Store.isOwner = await wait(user.isOwner(), 4000) || false;
    if (db && user) { const id = await user.id(); if (id) { Store.db = db; Store.uid = id; Store.mode = "cloud"; } }
  } catch (e) { console.warn("platform", e); }
  claude.use("sample").then((s) => { Store.sample = s; rerenderIf(["talk", "learn"]); });
  claude.use("downloads").then((d) => { Store.downloads = d; });
  claude.use("room").then((r) => { Store.room = r; if (r) startLobby(); });
}
async function loadState() {
  let local = null; try { local = JSON.parse(localStorage.getItem(LKEY) || "null"); } catch {}
  if (Store.mode === "cloud") {
    try {
      const snap = await Promise.race([Store.db.doc(`data/users/${Store.uid}/state`).get(), new Promise((_, rj) => setTimeout(() => rj(new Error("timeout")), 8000))]);
      if (snap.exists) { S = migrate(snap.data()); return; }
    } catch (e) { console.warn(e); toast("Não consegui carregar seu progresso da nuvem; usando a cópia deste aparelho."); }
  }
  S = migrate(local);
}
let saveTimer = null, savingChain = Promise.resolve(), lastPub = "";
function save() {
  pruneState();
  try { localStorage.setItem(LKEY, JSON.stringify(S)); } catch {}
  clearTimeout(saveTimer); saveTimer = setTimeout(flush, 1200);
}
function flush() {
  clearTimeout(saveTimer);
  if (Store.mode !== "cloud" || !S.onboarded) return;
  const body = JSON.parse(JSON.stringify(S));
  const pub = publicDoc(); const pubStr = JSON.stringify(pub);
  savingChain = savingChain.then(async () => {
    try {
      await Store.db.doc(`data/users/${Store.uid}/state`).set(body);
      if (pubStr !== lastPub) { await Store.db.doc(`players/${Store.uid}`).set(pub); lastPub = pubStr; }
    } catch (e) {
      if (e && e.code === "quota_exceeded") toast("O armazenamento do app está cheio. Fale com o administrador.");
      else if (e && e.code === "invalid_argument") { Store.readOnly = true; toast("Você tem acesso só de leitura a este app; seu progresso fica salvo neste aparelho."); }
      else console.warn("save", e);
    }
  });
}
addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(); });
function publicDoc() {
  const p = S.profile;
  const tests = Object.values(S.tot.tests || {});
  return {
    u: p.username, ul: p.username.toLowerCase(), av: p.avatar, fr: p.frame, ti: p.title,
    xp: S.xp, lv: levelOf(S.xp).n, cefr: certified() || "", est: S.cefr.estimate || "", studying: studying(),
    streak: streakAlive(), best: S.streak.best, lessons: S.tot.lessons, acc: Math.round(totalAccuracy() * 100),
    mastery: Math.round(sum(tests)), evo: cefrIndexNow() - (S.cefr.start ?? 0), cons: activeDays(30),
    day: { k: today(), xp: D().xp, l: D().l }, week: { k: wk(), xp: weekXP(), l: weekField("l") }, month: { k: mk(), xp: monthXP(), l: monthField("l") },
    priv: !!p.priv, reqs: p.reqs !== false, show: p.showRank !== false, upd: Date.now(),
  };
}

/* ---------- assinaturas de dados compartilhados ---------- */
function subscribeShared() {
  if (Store.mode !== "cloud") return;
  const db = Store.db, me = Store.uid;
  const onErr = (e) => console.warn("snapshot", e);
  db.collection("players").limit(500).onSnapshot((s) => { PLAYERS = s.docs.map((d) => ({ id: d.id, ...d.data() })); rerenderIf(["ranking", "friends", "home", "admin", "missions"]); }, onErr);
  db.doc("moderation/state").onSnapshot((s) => { MOD = s.exists ? Object.assign({ hidden: {} }, s.data()) : { hidden: {} }; rerenderIf(["ranking", "admin"]); }, onErr);
  db.doc("content/custom").onSnapshot((s) => { CUSTOM = s.exists ? Object.assign({ lessons: [] }, s.data()) : { lessons: [] }; rerenderIf(["learn", "admin"]); }, onErr);
  db.collection("cheers").where("to", "==", me).onSnapshot((s) => { CHEERS = s.docs.map((d) => ({ id: d.id, ...d.data() })); rerenderIf(["home", "friends"]); }, onErr);
  db.collection("friendreq").where("to", "==", me).onSnapshot((s) => { FREQ_IN = s.docs.map((d) => ({ id: d.id, ...d.data() })); rerenderIf(["home", "friends"]); }, onErr);
  db.collection("friendreq").where("from", "==", me).onSnapshot((s) => { FREQ_OUT = s.docs.map((d) => ({ id: d.id, ...d.data() })); acceptedRequests(); rerenderIf(["friends"]); }, onErr);
  db.collection("duels").where("to", "==", me).onSnapshot((s) => { DUELS_IN = s.docs.map((d) => ({ id: d.id, ...d.data() })); countDuels(); rerenderIf(["home", "friends"]); }, onErr);
  db.collection("duels").where("from", "==", me).onSnapshot((s) => { DUELS_OUT = s.docs.map((d) => ({ id: d.id, ...d.data() })); countDuels(); rerenderIf(["friends"]); }, onErr);
}
function playerById(id) { return PLAYERS.find((p) => p.id === id); }

/* sala geral: quem está online e fazendo o quê */
let lobbyActivity = "No início";
function startLobby() {
  const r = Store.room;
  r.onPeers((c) => { PEERS = c.peers; rerenderIf(["friends", "home"]); }, () => {});
  setPresence(lobbyActivity);
}
function setPresence(act) {
  lobbyActivity = act;
  if (Store.room && S.onboarded) Store.room.presence({ u: S.profile.username, id: Store.uid || null, act }).catch(() => {});
}
function onlineIds() { const m = {}; for (const p of PEERS) { const id = p.by || p.presence?.id; if (id && !p.isMe) m[id] = p.presence?.act || "Online"; } return m; }

/* ---------- interface: toast, modal, avatar ---------- */
function toast(msg) {
  const t = document.createElement("div"); t.className = "toast"; t.textContent = msg;
  $("#toasts").append(t); setTimeout(() => t.remove(), 3800);
}
function modal(html, opts = {}) {
  const root = $("#modal-root");
  root.innerHTML = `<div class="modal-bg" data-a="modal-bg"><div class="modal ${opts.cls || ""}" role="dialog" aria-modal="true">${html}</div></div>`;
  const first = root.querySelector("button, input, select, textarea"); if (first) setTimeout(() => first.focus(), 30);
}
function closeModal() { $("#modal-root").innerHTML = ""; }
function avatarSVG(av, size = 40, letter = "?") {
  av = av || {}; const c = av.color || AV_COLORS[0];
  const shapes = {
    circle: `<circle cx="24" cy="24" r="23" fill="${c}"/>`,
    squircle: `<rect x="1" y="1" width="46" height="46" rx="15" fill="${c}"/>`,
    hex: `<polygon points="24,1 44,12.5 44,35.5 24,47 4,35.5 4,12.5" fill="${c}"/>`,
    badge: `<polygon points="24,1 30,8 40,7 39,17 47,24 39,31 40,41 30,40 24,47 18,40 8,41 9,31 1,24 9,17 8,7 18,8" fill="${c}"/>`,
    shield: `<path d="M24 1 L45 8 V24 C45 37 35 44 24 47 C13 44 3 37 3 24 V8 Z" fill="${c}"/>`,
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" aria-hidden="true">${shapes[av.shape] || shapes.circle}<text x="24" y="31" text-anchor="middle" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="21" fill="#fff">${esc((letter || "?").slice(0, 1).toUpperCase())}</text></svg>`;
}
function avatarHTML(p, size = 40, online = false) {
  const fr = p.fr || p.frame || "none";
  return `<span class="av f-${esc(fr)}" style="width:${size}px;height:${size}px">${avatarSVG(p.av || p.avatar, size, p.u || p.username)}${online ? '<i class="dot-online" title="Online agora"></i>' : ""}</span>`;
}
function meCard() { return { u: S.profile.username, av: S.profile.avatar, fr: S.profile.frame }; }
function medalSVG(a, earned = true, cls = "") {
  const [c1, c2] = MEDAL_COLORS[a.kind] || MEDAL_COLORS["dedicação"];
  return `<svg class="${cls}" viewBox="0 0 64 64" aria-hidden="true"><path d="M20 2h10l4 18H24z" fill="${c1}" opacity=".7"/><path d="M34 2h10l-4 18H30z" fill="${c1}"/><circle cx="32" cy="40" r="20" fill="${c2}"/><circle cx="32" cy="40" r="15" fill="${c1}"/><path d="M32 30l3.1 6.3 7 1-5 4.9 1.2 6.9-6.3-3.3-6.3 3.3 1.2-6.9-5-4.9 7-1z" fill="#fff"/></svg>`;
}
function applyTheme() {
  const r = document.documentElement; const t = S.profile.theme;
  if (t === "light" || t === "dark") r.setAttribute("data-theme", t); else r.removeAttribute("data-theme");
  if (S.profile.accent && S.profile.accent !== "azul") r.setAttribute("data-accent", S.profile.accent); else r.removeAttribute("data-accent");
}

/* ---------- voz: síntese (TTS) e reconhecimento ---------- */
let VOICE = null;
function pickVoice() {
  try {
    const vs = speechSynthesis.getVoices(); const en = vs.filter((v) => /^en[-_]/i.test(v.lang));
    VOICE = en.find((v) => /en[-_]US/i.test(v.lang) && /Google|Samantha|Aria|Jenny|Natural/i.test(v.name)) || en.find((v) => /en[-_]US/i.test(v.lang)) || en[0] || null;
  } catch {}
}
try { speechSynthesis.onvoiceschanged = pickVoice; pickVoice(); } catch {}
function speak(text, slow = false) {
  try {
    if (!("speechSynthesis" in window)) throw 0;
    speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US"; if (VOICE) u.voice = VOICE; u.rate = (slow ? 0.65 : 0.95) * (S.profile.rate || 1);
    speechSynthesis.speak(u);
  } catch { toast("O áudio não está disponível neste navegador."); }
}
const SRClass = window.SpeechRecognition || window.webkitSpeechRecognition;
let SR_OK = !!SRClass;
function recognize() {
  return new Promise((res, rej) => {
    if (!SR_OK) return rej("unsupported");
    let r; try { r = new SRClass(); } catch { SR_OK = false; return rej("unsupported"); }
    r.lang = "en-US"; r.interimResults = false; r.maxAlternatives = 4;
    let done = false;
    r.onresult = (e) => { done = true; res([...e.results[0]].map((a) => a.transcript)); };
    r.onerror = (e) => { if (["not-allowed", "service-not-allowed", "audio-capture"].includes(e.error)) SR_OK = false; if (!done) { done = true; rej(e.error); } };
    r.onend = () => { if (!done) { done = true; rej("no-speech"); } };
    try { r.start(); } catch { SR_OK = false; rej("unsupported"); }
  });
}
