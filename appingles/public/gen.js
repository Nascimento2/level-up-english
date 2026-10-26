/* Level Up English — geração de lições para os níveis 11 em diante.
   1) Tenta criar com a IA, com controle de qualidade (formato, tamanho, tradução, repetição).
   2) Se a IA não estiver disponível ou falhar, usa um gerador próprio que combina personagens,
      lugares, tempos verbais e vocabulário — funciona sem internet e nunca acaba. */
"use strict";

const Gen = { busy: 0, err: "" };
const UNITS_PER_GEN_LEVEL = 4;

/* ---------- banco do gerador próprio ---------- */
const GB = {
  names: [["Alex", "Alex", "ÉL-iks"], ["Sam", "Sam", "SÉM"], ["Jordan", "Jordan", "DJÓR-dan"], ["Taylor", "Taylor", "TÊI-lor"], ["Chris", "Chris", "KRÍS"], ["Morgan", "Morgan", "MÓR-gan"], ["Jamie", "Jamie", "DJÊI-mi"], ["Casey", "Casey", "KÊI-si"]],
  places: [ // [inglês, "ir para" em pt, "perto de" em pt, pronúncia]
    ["the beach", "à praia", "perto da praia", "dâ BÍTCH"], ["the gym", "à academia", "perto da academia", "dâ DJÍM"], ["the library", "à biblioteca", "perto da biblioteca", "dâ LÁI-bre-ri"],
    ["the mall", "ao shopping", "perto do shopping", "dâ MÓL"], ["the market", "ao mercado", "perto do mercado", "dâ MÁR-ket"], ["the park", "ao parque", "perto do parque", "dâ PÁRK"],
    ["the museum", "ao museu", "perto do museu", "dâ miu-ZÍ-âm"], ["the stadium", "ao estádio", "perto do estádio", "dâ STÊI-di-âm"], ["the theater", "ao teatro", "perto do teatro", "dâ TÍ-a-târ"]],
  future: [["tomorrow", "amanhã", "tu-MÓ-rou"], ["next week", "semana que vem", "NÉKST UÍK"], ["on Saturday", "no sábado", "on SÉ-târ-dei"], ["tonight", "hoje à noite", "tu-NÁIT"], ["this weekend", "neste fim de semana", "DÍS UÍK-end"]],
  cities: [["London", "Londres", "LÂN-don"], ["New York", "Nova York", "niu IÓRK"], ["Tokyo", "Tóquio", "TÔU-kiou"], ["Lisbon", "Lisboa", "LÍZ-bon"], ["Sydney", "Sydney", "SÍD-ni"], ["Toronto", "Toronto", "to-RÓN-tou"], ["Dublin", "Dublin", "DÂ-blin"], ["Rome", "Roma", "RÔUM"]],
  foods: [["sushi", "sushi", "SÚ-xi"], ["pizza", "pizza", "PÍT-sa"], ["tacos", "tacos", "TÁ-kous"], ["fish and chips", "peixe com fritas", "FÍCH énd TCHÍPS"], ["pasta", "macarrão", "PÁS-ta"], ["street food", "comida de rua", "STRÍT FÚD"], ["pancakes", "panquecas", "PÉN-keiks"]],
  things: [["a new phone", "um celular novo", "a NIÚ FÔUN"], ["a new laptop", "um notebook novo", "a NIÚ LÉP-tóp"], ["a new bike", "uma bicicleta nova", "a NIÚ BÁIK"], ["a new backpack", "uma mochila nova", "a NIÚ BÉK-pék"]],
  bring: [["some snacks", "uns petiscos", "sâm SNÉKS"], ["a jacket", "um casaco", "a DJÉ-ket"], ["your camera", "sua câmera", "iór KÉ-me-ra"], ["some water", "água", "sâm UÓ-târ"]],
  hours: [["six", "seis", "SÍKS"], ["seven", "sete", "SÉ-ven"], ["eight", "oito", "ÊIT"], ["four", "quatro", "FÓR"]],
  days: [["three", "três", "TRÍ"], ["five", "cinco", "FÁIV"], ["seven", "sete", "SÉ-ven"], ["ten", "dez", "TÉN"]],
};
/* diálogos com espaços: {N}=nome, {P}=lugar, {F}=futuro, {C}=cidade, {D}=comida, {D2}=outra comida, {T}=objeto, {B}=algo para levar, {H}=hora, {X}=dias */
const GD = [
  { t: "Combinando um passeio", g: "Convidar alguém e combinar detalhes", lines: [
    ["What are you doing {F}?", "O que você vai fazer {F}?", "UÓT ár iu DÚ-in {F}?"],
    ["I'm going to {P}. Do you want to come?", "Vou {P}. Quer vir?", "áim GÔU-in tu {P}. du iu UÓNT tu KÂM?"],
    ["I'd love to! What time?", "Eu adoraria! Que horas?", "áid LÂV tu! UÓT TÁIM?"],
    ["Around {H}. Is that OK for you?", "Lá pelas {H}. Tudo bem para você?", "a-RÁUND {H}. iz DÉT ôu-KÊI for iu?"],
    ["Perfect. Should I bring anything?", "Perfeito. Levo alguma coisa?", "PÂR-fekt. xúd ái BRÍNG É-ni-tin?"],
    ["Just bring {B}.", "Só leva {B}.", "DJÂST BRÍNG {B}."]] },
  { t: "Voltando de viagem", g: "Contar uma viagem usando o passado", lines: [
    ["How was your trip to {C}?", "Como foi sua viagem para {C}?", "RÁU uóz iór TRÍP tu {C}?"],
    ["It was amazing! I stayed for {X} days.", "Foi incrível! Fiquei {X} dias.", "it uóz a-MÊI-zin! ái STÊID for {X} DÊIZ."],
    ["What did you like the most?", "Do que você mais gostou?", "UÓT did iu LÁIK dâ MÔUST?"],
    ["The food. I tried {D} almost every day.", "Da comida. Comi {D} quase todo dia.", "dâ FÚD. ái TRÁID {D} ÓL-moust ÉV-ri DÊI."],
    ["Would you go back?", "Você voltaria?", "uúd iu GÔU BÉK?"],
    ["Definitely. Maybe next year.", "Com certeza. Talvez no ano que vem.", "DÉ-fi-nit-li. MÊI-bi NÉKST IÍR."]] },
  { t: "Pensando em comprar", g: "Pedir e dar conselhos sobre uma compra", lines: [
    ["I'm thinking about buying {T}.", "Estou pensando em comprar {T}.", "áim TÍN-kin a-BÁUT BÁI-in {T}."],
    ["Really? What's wrong with your old one?", "Sério? Qual o problema com o antigo?", "RÍ-li? UÓTS RÓNG uíd iór ÔULD UÂN?"],
    ["It's too slow, and it keeps breaking.", "É lento demais e vive quebrando.", "its TÚ SLÔU, énd it KÍPS BRÊI-kin."],
    ["Have you compared prices online?", "Você comparou preços na internet?", "rév iu kom-PÉRD PRÁI-siz on-LÁIN?"],
    ["Yes, but everything is expensive right now.", "Sim, mas está tudo caro agora.", "IÉS, bât ÉV-ri-tin iz eks-PÉN-siv RÁIT NÁU."],
    ["Wait for a sale. You could save a lot.", "Espera uma promoção. Você pode economizar muito.", "UÊIT for a SÊIL. iu kud SÊIV a LÓT."]] },
  { t: "Escolhendo onde comer", g: "Comparar opções e dizer o que prefere", lines: [
    ["I'm starving. How about {D}?", "Estou morrendo de fome. Que tal {D}?", "áim STÁR-vin. RÁU a-BÁUT {D}?"],
    ["I had {D} yesterday. I'd rather have {D2}.", "Comi {D} ontem. Prefiro {D2}.", "ái RÉD {D} iés-târ-DÊI. áid RÉ-dâr RÉV {D2}."],
    ["Fine by me. Do you know a good place?", "Por mim, tudo bem. Conhece um lugar bom?", "FÁIN bái MÍ. du iu NÔU a GUD PLÊIS?"],
    ["Yes, there's one {N}.", "Sim, tem um {N}.", "IÉS, DÉRZ UÂN {N}."],
    ["Is it expensive?", "É caro?", "iz it eks-PÉN-siv?"],
    ["Not at all, and the portions are huge.", "Nem um pouco, e as porções são enormes.", "NÓT ét ÓL, énd dâ PÓR-chans ár RIÚDJ."]] },
  { t: "Precisando de uma pausa", g: "Mostrar preocupação e dar conselhos", lines: [
    ["You look tired. Is everything OK?", "Você parece cansado. Está tudo bem?", "iu LÚK TÁI-rd. iz ÉV-ri-tin ôu-KÊI?"],
    ["I've been working too much lately.", "Ando trabalhando demais ultimamente.", "áiv bin UÂR-kin TÚ MÂTCH LÊIT-li."],
    ["You should take a break. Maybe go to {P} {F}.", "Você devia fazer uma pausa. Talvez ir {P} {F}.", "iu xúd TÊIK a BRÊIK. MÊI-bi GÔU tu {P} {F}."],
    ["That's a good idea. I really need to relax.", "Boa ideia. Preciso muito relaxar.", "DÉTS a GUD ai-DÍ-a. ái RÍ-li NÍD tu ri-LÉKS."],
    ["And try to get more sleep.", "E tente dormir mais.", "énd TRÁI tu guet MÓR SLÍP."],
    ["You're right. Thanks for caring.", "Você tem razão. Obrigado por se importar.", "iór RÁIT. TÉNKS for KÉ-rin."]] },
  { t: "Planejando uma viagem", g: "Pedir recomendações para uma viagem", lines: [
    ["Have you ever been to {C}?", "Você já foi para {C}?", "rév iu É-vâr bin tu {C}?"],
    ["Yes, twice. Are you planning a trip?", "Sim, duas vezes. Está planejando uma viagem?", "IÉS, TUÁIS. ár iu PLÉ-nin a TRÍP?"],
    ["I am! Is it worth visiting?", "Estou! Vale a pena visitar?", "ái ÉM! iz it UÂRTH VÍ-zi-tin?"],
    ["Absolutely. If you go, you have to try {D}.", "Com certeza. Se for, tem que provar {D}.", "éb-so-LÚT-li. if iu GÔU, iu RÉV tu TRÁI {D}."],
    ["How long should I stay?", "Quanto tempo devo ficar?", "RÁU LÓNG xúd ái STÊI?"],
    ["At least {X} days. There's a lot to see.", "Pelo menos {X} dias. Tem muita coisa para ver.", "ét LÍST {X} DÊIZ. DÉRZ a LÓT tu SÍ."]] },
];
/* vocabulário extra por tema (avançado) */
const GV = {
  "Trabalho e carreira": "promotion|promoção|pro-MÔU-chan; colleague|colega|KÓ-lig; workload|carga de trabalho|UÂRK-loud; negotiate|negociar|ni-GÔU-chi-eit; resign|pedir demissão|ri-ZÁIN; achievement|conquista|a-TCHÍV-ment",
  "Viagens": "itinerary|roteiro|ai-TÍ-ne-re-ri; sightseeing|passeio turístico|SÁIT-si-in; jet lag|cansaço do fuso|DJÉT LÉG; layover|escala|LÊI-ôu-vâr; currency|moeda|KÂ-ren-si; souvenir|lembrancinha|su-ve-NÍR",
  "Saúde e bem-estar": "habit|hábito|RÉ-bit; balanced|equilibrado|BÉ-lanst; burnout|esgotamento|BÂRN-aut; recover|se recuperar|ri-KÂ-vâr; mindful|consciente|MÁIND-ful; schedule|rotina / agenda|SKÉ-djul",
  "Dinheiro": "budget|orçamento|BÂ-djet; afford|ter dinheiro para|a-FÓRD; savings|economias|SÊI-vingz; loan|empréstimo|LÔUN; worth|valer|UÂRTH; installments|parcelas|ins-TÓL-ments",
  "Tecnologia": "device|aparelho|di-VÁIS; reliable|confiável|ri-LÁI-a-bou; feature|recurso|FÍ-tchâr; upgrade|melhorar / atualizar|ÂP-greid; storage|armazenamento|STÓ-ridj; outdated|ultrapassado|aut-DÊI-ted",
  "Relacionamentos": "trust|confiança|TRÂST; get along|se dar bem|guet a-LÓNG; support|apoiar|sâ-PÓRT; honest|sincero|Ó-nest; misunderstanding|mal-entendido|mis-ân-dâr-STÉN-din; apologize|pedir desculpas|a-PÓ-lo-djaiz",
  "Opiniões": "argue|argumentar|ÁR-guiu; convince|convencer|kon-VÍNS; point of view|ponto de vista|PÓINT óv VIÚ; obviously|obviamente|ÓB-vi-âs-li; doubt|dúvida|DÁUT; reasonable|razoável|RÍ-zo-na-bou",
  "Cidade": "neighborhood|bairro|NÊI-bâr-rud; crowded|lotado|KRÁU-did; commute|trajeto diário|ko-MIÚT; rent|aluguel|RÉNT; downtown|centro|dáun-TÁUN; nearby|perto daqui|nír-BÁI",
  "Comida": "spicy|apimentado|SPÁI-si; recipe|receita|RÉ-si-pi; leftovers|sobras|LÉFT-ôu-vârz; craving|vontade (de comer)|KRÊI-vin; delicious|delicioso|di-LÍ-châs; bland|sem sal / sem graça|BLÉND",
  "Tempo livre": "binge-watch|maratonar série|BÍNDJ uótch; hobby|passatempo|RÓ-bi; hang out|sair junto|réng ÁUT; chill|relaxar|TCHÍL; hike|trilha|RÁIK; spare time|tempo livre|SPÉR TÁIM",
};
const GFILLS = [
  ["I've been working here ___ three years.", "for", ["for", "since", "during"], "\"For\" + período de tempo; \"since\" + ponto de início."],
  ["If I ___ more money, I would travel more.", "had", ["had", "have", "will have"], "Hipótese: if + passado, would + verbo."],
  ["She asked me where I ___.", "lived", ["lived", "live", "do live"], "Em pergunta indireta no passado, o verbo também vai para o passado."],
  ["I'm looking forward ___ seeing you.", "to", ["to", "for", "of"], "\"Look forward to\" + verbo com -ing."],
  ["You ___ have told me earlier!", "should", ["should", "must", "can"], "\"Should have\" + particípio = deveria ter feito."],
  ["By the time we arrived, the movie ___ started.", "had", ["had", "has", "was"], "Ação anterior a outra no passado: had + particípio."],
  ["I'd rather stay home ___ go out tonight.", "than", ["than", "that", "then"], "\"I'd rather X than Y\" = prefiro X a Y."],
  ["It's worth ___ the museum.", "visiting", ["visiting", "visit", "to visit"], "Depois de \"worth\", o verbo vai com -ing."],
  ["Hardly ___ I sat down when the phone rang.", "had", ["had", "did", "have"], "Depois de \"hardly\" no começo, a ordem inverte: hardly had I..."],
  ["I wish I ___ speak French.", "could", ["could", "can", "will"], "Desejo sobre o presente: wish + could/passado."],
  ["The report needs ___ by Friday.", "to be finished", ["to be finished", "finishing to", "finish"], "Voz passiva com need: needs to be + particípio."],
  ["Not only is it cheap, ___ it's also fast.", "but", ["but", "and", "so"], "\"Not only... but also\" = não só... mas também."],
  ["She's used to ___ early.", "waking up", ["waking up", "wake up", "woke up"], "\"Be used to\" + verbo com -ing = estar acostumado a."],
  ["Unless you hurry, you ___ miss the bus.", "will", ["will", "would", "did"], "\"Unless\" = a menos que; futuro com will."],
  ["I can't help ___ when I see that video.", "laughing", ["laughing", "laugh", "to laugh"], "\"Can't help + -ing\" = não consigo evitar."],
  ["He suggested ___ a taxi.", "taking", ["taking", "to take", "take"], "\"Suggest\" + verbo com -ing."],
];

function fillSlots(str, m, kind) {
  return str.replace(/\{(\w+)\}/g, (_, k) => { const v = m[k]; if (!v) return ""; return kind === "en" ? v[0] : kind === "pt" ? v[1] : v[2]; });
}
function proceduralUnit(n, k, avoid) {
  const rng = mulberry32(hashStr(`gen-${n}-${k}-${Store.uid || "x"}`));
  const tpl = GD[(n * 3 + k) % GD.length];
  const P = pick(GB.places, rng); const nameA = pick(GB.names, rng); let nameB = pick(GB.names, rng); if (nameB === nameA) nameB = GB.names[(GB.names.indexOf(nameA) + 1) % GB.names.length];
  const D = pick(GB.foods, rng); let D2 = pick(GB.foods, rng); if (D2 === D) D2 = GB.foods[(GB.foods.indexOf(D) + 1) % GB.foods.length];
  const m = {
    P: [P[0], P[1], P[3]], N: [`near ${P[0]}`, P[2], `NÍR ${P[3]}`], F: pick(GB.future, rng), C: pick(GB.cities, rng),
    D, D2, T: pick(GB.things, rng), B: pick(GB.bring, rng), H: pick(GB.hours, rng), X: pick(GB.days, rng),
  };
  const dialogue = tpl.lines.map((l, i) => [i % 2 ? nameB[0] : nameA[0], fillSlots(l[0], m, "en"), fillSlots(l[1], m, "pt"), fillSlots(l[2], m, "pron")]);
  const themes = Object.keys(GV); const theme = themes[(n * UNITS_PER_GEN_LEVEL + k) % themes.length];
  let words = GV[theme].split(";").map((x) => x.trim().split("|"));
  const fresh = words.filter((w) => !avoid.has(norm(w[0]))); if (fresh.length >= 4) words = fresh;
  const fills = shuffle(GFILLS, rng).slice(0, 3);
  return { id: `g${n}u${k + 1}`, gen: true, level: n, title: tpl.t, goal: `${tpl.g}. Vocabulário novo: ${theme.toLowerCase()}`, words, dialogue, sentences: dialogue.map((l) => [l[1], l[2], l[3]]), fills };
}

/* ---------- geração com IA + controle de qualidade ---------- */
const ASCIIish = /^[\x20-\x7E’‘“”—–…]+$/;
function checkAIUnit(o, avoid, titles) {
  if (!o || typeof o !== "object") return "formato";
  const words = (Array.isArray(o.words) ? o.words : []).filter((w) => Array.isArray(w) && w.length >= 3 && w.every((x) => typeof x === "string" && x.trim()))
    .map((w) => w.slice(0, 3).map((x) => x.trim())).filter((w) => ASCIIish.test(w[0]) && norm(w[0]) !== norm(w[1]) && !avoid.has(norm(w[0])));
  const uniq = [...new Map(words.map((w) => [norm(w[0]), w])).values()];
  if (uniq.length < 5) return "vocabulário repetido ou inválido";
  const dlg = (Array.isArray(o.dialogue) ? o.dialogue : []).filter((l) => Array.isArray(l) && l.length >= 4 && l.every((x) => typeof x === "string" && x.trim())).map((l) => l.slice(0, 4).map((x) => x.trim()));
  if (dlg.length < 5 || dlg.length > 12) return "diálogo";
  if (dlg.some((l) => !ASCIIish.test(l[1]) || tokens(l[1]).length > 28 || tokens(l[1]).length < 2 || norm(l[1]) === norm(l[2]))) return "frases do diálogo";
  const fills = (Array.isArray(o.fills) ? o.fills : []).filter((f) => Array.isArray(f) && f.length >= 3 && String(f[0]).includes("___") && Array.isArray(f[2]) && f[2].length >= 3 && f[2].includes(f[1]) && new Set(f[2]).size === f[2].length);
  if (fills.length < 2) return "exercícios";
  const title = String(o.title || "").trim().slice(0, 60); if (!title || titles.has(norm(title))) return "título repetido";
  return { title, goal: String(o.goal || "").slice(0, 140), words: uniq.slice(0, 10), dialogue: dlg, fills: fills.slice(0, 4).map((f) => [String(f[0]), String(f[1]), f[2].map(String), String(f[3] || "")]) };
}
async function aiUnit(n, k, avoid, titles) {
  const theme = LUE_MODULES[(n * UNITS_PER_GEN_LEVEL + k) % LUE_MODULES.length].title;
  const band = levelBand(n); const known = [...avoid].slice(-120).join(", ");
  const prompt = `You create English lessons for Brazilian learners. Level ${n} of an endless course (CEFR ${band}); difficulty must grow slowly with the level number.
Theme: "${theme}" — invent a NEW, realistic everyday situation within this theme (not a generic one).
Do NOT use these words the learner already knows as new vocabulary: ${known}.
Return only JSON:
{"title":"título curto em português","goal":"objetivo em português","words":[["english","português","pronúncia simplificada para brasileiros, sílaba forte em MAIÚSCULAS"]],"dialogue":[["Name","English line","tradução natural em português","pronúncia simplificada"]],"fills":[["sentence with ___","answer",["answer","wrong1","wrong2"],"explicação curta em português"]]}
Rules: exactly 7 words (useful words/expressions at ${band}), a natural dialogue of 6 to 8 lines between two people with names, 3 fills testing grammar from the dialogue. English must be natural and correct; Portuguese must be Brazilian and correct. Pronunciation example: "Nice to meet you" -> "NÁIS tu MÍT iu".`;
  for (let attempt = 0; attempt < 2; attempt++) {
    const out = await Store.sample.json(prompt, { modelTier: "default" });
    if (typeof aiCount === "function") aiCount();
    const ok = checkAIUnit(out, avoid, titles);
    if (typeof ok === "object") return { id: `g${n}u${k + 1}`, gen: true, ai: false, level: n, ...ok, sentences: ok.dialogue.map((l) => [l[1], l[2], l[3]]) };
  }
  return null;
}
async function genLevel(n) {
  if (Gen.busy || n <= FIXED_LEVELS || !levelUnlocked(n) || (S.gen[n] && S.gen[n].units.length)) return;
  Gen.busy = n; Gen.err = ""; rerenderIf(["learn"]);
  const avoid = new Set([...Object.keys(S.words), ...allUnits().flatMap((u) => u.words.map((w) => w[0]))].map(norm));
  const titles = new Set(allUnits().map((u) => norm(u.title)));
  const units = [];
  for (let k = 0; k < UNITS_PER_GEN_LEVEL; k++) {
    let u = null;
    if (Store.sample && (typeof aiAllowed !== "function" || aiAllowed())) { try { u = await aiUnit(n, k, avoid, titles); } catch { u = null; } }
    if (!u) u = proceduralUnit(n, k, avoid);
    u.words.forEach((w) => avoid.add(norm(w[0]))); titles.add(norm(u.title));
    units.push(u);
  }
  S.gen[n] = { at: Date.now(), units };
  pruneGen(); save();
  Gen.busy = 0; rerenderIf(["learn", "modules"]);
  toast(`Nível ${n} pronto: ${units.length} situações novas!`);
}
/* guarda o conteúdo dos níveis recentes; níveis antigos já concluídos são resumidos para caber no armazenamento */
function pruneGen() {
  const keys = Object.keys(S.gen).map(Number).sort((a, b) => a - b);
  for (const k of keys) if (k < S.lv.unlocked - 4 && levelPassed(k)) S.gen[k] = { at: S.gen[k].at, units: S.gen[k].units.map((u) => ({ ...u, dialogue: u.dialogue.slice(0, 6), fills: u.fills.slice(0, 2) })) };
  if (JSON.stringify(S.gen).length > 120000) for (const k of keys.slice(0, -6)) if (levelPassed(k)) delete S.gen[k];
}
