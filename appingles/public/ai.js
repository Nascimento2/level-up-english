/* Level Up English — professor de IA (conversa por texto e voz), explicações e aulas sob medida. */
"use strict";

const AI_FREE_DAILY = 40;
const GOALS = { viagem: "travel", trabalho: "work and career", conversa: "everyday conversation", estudos: "studies and exams", entrevistas: "job interviews" };
const Chat = { scenario: null, turns: [], view: [], busy: false, ctl: null, lastAt: 0, scores: [], err: "" };

function aiAllowed() {
  if (S.ai.day !== today()) { S.ai.day = today(); S.ai.n = 0; }
  return S.plan === "premium" || S.ai.n < AI_FREE_DAILY;
}
function aiCount() { if (S.ai.day !== today()) { S.ai.day = today(); S.ai.n = 0; } S.ai.n++; }
function aiErrorCopy(e) {
  const c = e && e.code;
  if (c === "not_granted" || c === "sampling_disabled") return "A professora de IA ainda não foi ativada neste app. Enquanto isso, pratique com as lições e os diálogos da trilha.";
  if (c === "rate_limited") return "Muitas mensagens em pouco tempo. Espere um minutinho e tente de novo.";
  if (c === "session_expired") return "Sua sessão expirou. Entre na sua conta de novo e recarregue a página.";
  if (c === "invalid_json") return "A resposta veio num formato inesperado. Tente enviar de novo.";
  if (c === "cancelled") return "";
  return "Não consegui falar com o professor agora. Tente de novo em instantes.";
}

function startScenario(id) {
  const sc = typeof id === "object" && id ? id : LUE_SCENARIOS.find((s) => s.id === id) || LUE_SCENARIOS[0];
  if (Chat.scenario) endConversation(true);
  Object.assign(Chat, { scenario: sc, turns: [], view: [{ who: "ai", en: sc.opener, pt: "" }], scores: [], err: "", lastAt: Date.now(), startedAt: Date.now() });
  setPresence(`Conversando: ${sc.title}`);
  rerender(); speak(sc.opener);
}
function rules() {
  const lvl = studying(); const sc = Chat.scenario;
  return `You are "Teacher Lia", a friendly English teacher for Brazilian learners in the app Level Up English.
Learner's English level (CEFR): ${lvl}; course level ${typeof currentLevel === "function" ? currentLevel() : 1} of an endless course. Learner's main goal: ${GOALS[S.profile.goal] || "everyday conversation"}.
Scenario: ${sc.title} — ${sc.desc}. You play the other person in this scenario (in "Conversa livre" you are a friendly conversation partner).
Rules:
- Reply in natural spoken English adapted to ${lvl}: for A1/A2 use very short, simple sentences; for B1 and above speak naturally. 1 to 3 sentences, and usually end with a question that keeps the conversation going.
- Look only at the learner's LAST message. If it has a relevant error (grammar, word choice, unnatural phrasing, or Portuguese words), give a correction. Ignore capitalization, missing punctuation and small typos that do not change meaning. Never comment on accent. If the message is good, correction is null.
- If you give a correction, end your reply by kindly asking the learner to try saying it again the right way.
- Every few turns, ask a new question about a different detail so each session feels different.
- If the learner writes in Portuguese or asks how to say something, answer the question briefly in Brazilian Portuguese inside "tip_pt" and model the English sentence in "reply".
- Explanations are in Brazilian Portuguese, simple and kind, at most 2 sentences. Never make the learner feel embarrassed.
- Scores rate the learner's LAST message from 0 to 5 for grammar, vocabulary and fluency (naturalness), fair for the learner's level.
Reply with only one JSON object in this exact shape:
{"reply":"English reply","reply_pt":"tradução em português","reply_pron":"pronúncia simplificada para brasileiros (sílaba forte em MAIÚSCULAS)","correction":null,"tip_pt":"","scores":{"grammar":4,"vocabulary":4,"fluency":4}}
Example with a correction:
{"reply":"Sure! Would you like it hot or iced?","reply_pt":"Claro! Você quer quente ou gelado?","correction":{"you_said":"I want a coffee big","better":"I'd like a large coffee, please.","why_pt":"Em inglês o adjetivo vem antes do substantivo, e \\"I'd like\\" soa mais educado que \\"I want\\"."},"tip_pt":"","scores":{"grammar":2,"vocabulary":3,"fluency":3}}`;
}
async function sendChat(text, spoken = false) {
  text = (text || "").trim(); if (!text || Chat.busy) return;
  if (!Store.sample) return toast("O professor de IA não está disponível nesta visualização.");
  if (!aiAllowed()) return modal(`<h2>Limite diário do plano gratuito</h2><p class="muted">Você já enviou ${AI_FREE_DAILY} mensagens ao professor hoje. Amanhã o limite renova. O plano Premium libera conversas ilimitadas.</p><div class="row"><button class="btn primary" data-a="go" data-v="plans">Ver planos</button><button class="btn" data-a="close">Fechar</button></div>`);
  const now = Date.now(); const mins = Math.min(2, (now - (Chat.lastAt || now)) / 60000); Chat.lastAt = now;
  const d = D(); d.cvsec = (d.cvsec || 0) + mins * 60; d.cvmin = Math.floor(d.cvsec / 60); d.sec = (d.sec || 0) + mins * 60; d.min = Math.floor(d.sec / 60);
  Chat.view.push({ who: "me", text, spoken });
  Chat.busy = true; Chat.err = ""; rerender(); scrollChat();
  const history = [{ role: "user", content: rules() }, { role: "assistant", content: Chat.scenario.opener }];
  for (const t of Chat.turns.slice(-16)) history.push(t);
  history.push({ role: "user", content: spoken ? `(spoken, transcribed by speech recognition) ${text}` : text });
  Chat.ctl = new AbortController();
  try {
    const out = await Store.sample.json(history, { cache: false, modelTier: "quick", signal: Chat.ctl.signal });
    const reply = String(out && out.reply || "").trim(); if (!reply) throw { code: "invalid_json" };
    aiCount();
    Chat.turns.push({ role: "user", content: text }, { role: "assistant", content: reply });
    const corr = out.correction && out.correction.better ? out.correction : null;
    const sc = out.scores || {}; const g = clamp(+sc.grammar || 0, 0, 5), v = clamp(+sc.vocabulary || 0, 0, 5), f = clamp(+sc.fluency || 0, 0, 5);
    Chat.scores.push({ g, v, f });
    Chat.view.push({ who: "ai", en: reply, pt: String(out.reply_pt || ""), pron: String(out.reply_pron || ""), corr, tip: String(out.tip_pt || "") });
    S.convo.msgs++; d.cv++;
    const sk = d.sk.speaking || (d.sk.speaking = [0, 0]); sk[1]++; if (!corr) sk[0]++;
    const xp = gainXP(3 + Math.round((g + v + f) / 5)); popXP(xp);
    save(); speak(reply);
  } catch (e) { Chat.err = aiErrorCopy(e); if (e && e.code !== "cancelled") Chat.view.pop(); if (e && e.code !== "cancelled") Chat.retryText = text; }
  finally { Chat.busy = false; Chat.ctl = null; rerender(); scrollChat(); }
}
function endConversation(silent = false) {
  if (!Chat.scenario) return;
  const n = Chat.scores.length;
  if (n) {
    const avg = (k) => Math.round((sum(Chat.scores.map((s) => s[k])) / n) * 10) / 10;
    const ses = { at: today(), sc: Chat.scenario.id, n, g: avg("g"), v: avg("v"), f: avg("f") };
    S.convo.sessions.push(ses); save();
    if (!silent) modal(`<h2>Resumo da conversa</h2><p class="muted">${esc(Chat.scenario.title)} · ${n} ${n === 1 ? "mensagem" : "mensagens"}</p>
      ${scoreBars(ses)}
      <p class="small muted">Critérios: gramática (estrutura correta), vocabulário (palavras adequadas à situação) e fluência (soar natural). Cada mensagem é avaliada de 0 a 5 para o seu nível atual; sotaque não tira ponto.</p>
      <button class="btn primary" data-a="close">Fechar</button>`);
  }
  Chat.scenario = null; Chat.view = []; Chat.turns = []; Chat.scores = [];
  setPresence("No início"); if (!silent) rerender();
}
function scoreBars(s) {
  const row = (label, v) => `<div class="stack" style="gap:4px"><div class="row between"><span>${label}</span><b class="num">${v.toFixed(1)} / 5</b></div><div class="bar ok"><i style="width:${(v / 5) * 100}%"></i></div></div>`;
  return `<div class="stack">${row("Gramática", s.g)}${row("Vocabulário", s.v)}${row("Fluência", s.f)}</div>`;
}
function scrollChat() { const el = $("#chat-end"); if (el) el.scrollIntoView({ block: "end", behavior: "smooth" }); }
async function chatVoice() {
  if (!SR_OK) return toast("O microfone não está disponível nesta visualização. Digite sua mensagem.");
  const btn = $("#mic-btn"); if (btn) btn.classList.add("rec");
  try { const alts = await recognize(); const text = alts[0] || ""; if (text) sendChat(text, true); }
  catch (e) { toast(e === "no-speech" ? "Não ouvi nada. Tente falar mais perto do microfone." : "O microfone não está disponível. Digite sua mensagem."); rerender(); }
  finally { if (btn) btn.classList.remove("rec"); }
}

/* explica um erro do exercício */
async function aiExplainCurrent() {
  const ex = curEx(); const last = Runner.results[Runner.results.length - 1];
  if (!Store.sample || !ex) return;
  Runner.aiExplain = "Pensando…"; rerunner();
  try {
    const { text } = await Store.sample(`Você é um professor de inglês gentil para brasileiros (nível ${studying()}). Em português do Brasil, em no máximo 3 frases curtas, explique por que a resposta correta é "${ex.a}" e não "${last ? last.given : ""}" neste exercício: "${ex.q || ex.audio || ex.a}". Dê um exemplo curto em inglês com tradução. Sem títulos nem listas.`, { modelTier: "quick" });
    aiCount(); Runner.aiExplain = text.trim();
  } catch (e) { Runner.aiExplain = aiErrorCopy(e) || null; }
  rerunner();
}

/* aula sob medida gerada pela IA */
async function aiMakeLesson(topic) {
  topic = (topic || "").trim().slice(0, 120); if (!topic) return toast("Escreva um tema para a aula.");
  if (!Store.sample) return toast("A IA não está disponível nesta visualização.");
  if (!aiAllowed()) return toast("Limite diário de IA do plano gratuito atingido.");
  const lvl = studying();
  modal(`<h2>Criando sua aula…</h2><p class="muted">Tema: ${esc(topic)} · nível ${lvl}. Isso leva alguns segundos.</p><div class="typing"><i></i><i></i><i></i></div>`);
  try {
    const out = await Store.sample.json(`Create a short English lesson for a Brazilian learner at CEFR level ${lvl} about this topic (it may be written in Portuguese): "${topic}". Focus on real situations.
Reply with only JSON in this shape:
{"title":"título curto em português","goal":"objetivo da aula em português","words":[["english word or short phrase","tradução"]],"sentences":[["English sentence","tradução"]],"fills":[["Sentence with ___ blank","answer",["answer","wrong1","wrong2"],"explicação curta em português"]]}
Give exactly 8 words, 6 sentences (max 10 words each, adapted to ${lvl}) and 3 fills. Translations in Brazilian Portuguese.`, { modelTier: "default" });
    aiCount();
    const ok = out && Array.isArray(out.words) && out.words.length >= 4 && Array.isArray(out.sentences) && out.sentences.length >= 3;
    if (!ok) throw { code: "invalid_json" };
    const fills = (out.fills || []).filter((f) => Array.isArray(f) && f.length >= 3 && Array.isArray(f[2]) && f[2].includes(f[1]) && String(f[0]).includes("___"));
    const id = "ai_" + rid(5);
    const modRef = viewState.pendingModule || null; viewState.pendingModule = null;
    S.aiLessons.unshift({ id, module: modRef, cefr: lvl, title: String(out.title || topic).slice(0, 60), goal: String(out.goal || "").slice(0, 140), topic, words: out.words.slice(0, 10).map((w) => [String(w[0]), String(w[1])]), sentences: out.sentences.slice(0, 8).map((s) => [String(s[0]), String(s[1])]), fills: fills.slice(0, 4).map((f) => [String(f[0]), String(f[1]), f[2].map(String), String(f[3] || "")]) });
    S.aiLessons = S.aiLessons.slice(0, 12); save(); closeModal(); rerender(); toast("Aula criada! Ela está em “Aulas sob medida”.");
  } catch (e) { modal(`<h2>Não deu certo desta vez</h2><p class="muted">${esc(aiErrorCopy(e) || "Tente outro tema.")}</p><button class="btn primary" data-a="close">Fechar</button>`); }
}

/* teste B2+ gerado pela IA */
async function aiLevelTest(band) {
  if (!Store.sample) return toast("A IA não está disponível nesta visualização.");
  modal(`<h2>Preparando o teste ${band}…</h2><p class="muted">A IA está montando 12 questões do nível ${band}.</p><div class="typing"><i></i><i></i><i></i></div>`);
  try {
    const out = await Store.sample.json(`Write a 12-question multiple-choice English test at CEFR level ${band} for Brazilian learners: grammar, vocabulary, reading of short sentences and common phrasal verbs/collocations at that level. Each question has 4 options and exactly one correct option.
Reply with only a JSON array: [{"q":"question text (English, may include ___)","options":["a","b","c","d"],"answer":"the correct option text","why_pt":"explicação curta em português"}]`, { modelTier: "default" });
    aiCount();
    const qs = (Array.isArray(out) ? out : []).filter((x) => x && x.q && Array.isArray(x.options) && x.options.length >= 3 && x.options.includes(x.answer)).slice(0, 12);
    if (qs.length < 8) throw { code: "invalid_json" };
    closeModal();
    startRun({ mode: "test", band, title: `Teste de nível ${band} (IA)`, showAnswers: false, items: qs.map((x) => ({ t: "mc", prompt: "Escolha a resposta certa", q: String(x.q), a: String(x.answer), opts: shuffle(x.options.map(String)), expl: String(x.why_pt || ""), skill: "grammar" })) });
  } catch (e) { modal(`<h2>Não consegui montar o teste</h2><p class="muted">${esc(aiErrorCopy(e) || "Tente de novo em instantes.")}</p><button class="btn primary" data-a="close">Fechar</button>`); }
}
