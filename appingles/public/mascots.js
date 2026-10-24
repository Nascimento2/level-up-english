/* Level Up English — mascotes animados (Bolota, a pug; Mia, a gatinha; Capi, a capivara) e trilha sonora. */
"use strict";

/* ---------- mascotes ---------- */
const MASCOTS = {
  bolota: { name: "Bolota", kind: "pug" },
  mia: { name: "Mia", kind: "gata" },
  capi: { name: "Capi", kind: "capivara" },
};
const MASCOT_ORDER = ["bolota", "mia", "capi"];

function faceParts(eyeY, eyeDx, mouthY, dark) {
  return `
  <g class="eyes">
    <g class="eye"><circle cx="${60 - eyeDx}" cy="${eyeY}" r="6.5" fill="#1D1410"/><circle cx="${62 - eyeDx}" cy="${eyeY - 2.4}" r="2.2" fill="#fff"/></g>
    <g class="eye"><circle cx="${60 + eyeDx}" cy="${eyeY}" r="6.5" fill="#1D1410"/><circle cx="${62 + eyeDx}" cy="${eyeY - 2.4}" r="2.2" fill="#fff"/></g>
  </g>
  <g class="brows-sad"><path d="M${52 - eyeDx} ${eyeY - 11} l9 4M${68 + eyeDx} ${eyeY - 11} l-9 4" stroke="${dark}" stroke-width="2.6" stroke-linecap="round"/></g>
  <g class="mouth-happy"><path d="M50 ${mouthY} q10 10 20 0" fill="#7A1F2B" stroke="${dark}" stroke-width="2"/><path d="M55 ${mouthY + 3.5} q5 8 10 0" fill="#FF7A8A"/></g>
  <g class="mouth-sad"><path d="M51 ${mouthY + 5} q9 -7 18 0" fill="none" stroke="${dark}" stroke-width="2.6" stroke-linecap="round"/><path class="tear" d="M${60 + eyeDx + 3} ${eyeY + 6} q3 5 0 8 q-3 -3 0 -8z" fill="#74C0FC"/></g>
  <g class="cheeks"><ellipse cx="${60 - eyeDx - 6}" cy="${eyeY + 10}" rx="5" ry="3" fill="#FF8FA3" opacity=".55"/><ellipse cx="${60 + eyeDx + 6}" cy="${eyeY + 10}" rx="5" ry="3" fill="#FF8FA3" opacity=".55"/></g>`;
}

function mascotSVG(id) {
  if (id === "mia") {
    const fur = "#9AA8B8", dark = "#3E4756";
    return `<svg class="mascot-svg" viewBox="0 0 120 120" aria-hidden="true">
      <path class="tail" d="M86 104 C112 104 114 76 100 70" fill="none" stroke="${fur}" stroke-width="9" stroke-linecap="round"/>
      <g class="body"><ellipse cx="60" cy="96" rx="27" ry="20" fill="${fur}"/><ellipse cx="60" cy="100" rx="15" ry="13" fill="#E9EEF4"/>
        <ellipse cx="48" cy="114" rx="8" ry="5" fill="#E9EEF4"/><ellipse cx="72" cy="114" rx="8" ry="5" fill="#E9EEF4"/></g>
      <g class="paw-wave"><ellipse cx="94" cy="70" rx="7" ry="9" fill="#E9EEF4"/></g>
      <g class="head">
        <path class="ear" d="M30 40 L34 10 L54 28 Z" fill="${fur}"/><path d="M35 33 L37 18 L48 28 Z" fill="#FFB3C1"/>
        <path class="ear ear-r" d="M90 40 L86 10 L66 28 Z" fill="${fur}"/><path d="M85 33 L83 18 L72 28 Z" fill="#FFB3C1"/>
        <ellipse cx="60" cy="50" rx="33" ry="28" fill="${fur}"/>
        <path d="M52 24 l2 9M60 22 v10M68 24 l-2 9" stroke="${dark}" stroke-width="2.4" stroke-linecap="round" opacity=".5"/>
        <ellipse cx="60" cy="61" rx="14" ry="9" fill="#E9EEF4"/>
        ${faceParts(48, 13, 62, dark)}
        <path d="M56.5 57 h7 l-3.5 4z" fill="#FF7A8A"/>
        <path d="M30 58 h14M30 63 l14 -2M90 58 h-14M90 63 l-14 -2" stroke="${dark}" stroke-width="1.4" stroke-linecap="round" opacity=".55"/>
      </g></svg>`;
  }
  if (id === "capi") {
    const fur = "#A97B50", dark = "#4A3020";
    return `<svg class="mascot-svg" viewBox="0 0 120 120" aria-hidden="true">
      <g class="body"><ellipse cx="60" cy="94" rx="34" ry="22" fill="${fur}"/>
        <ellipse cx="44" cy="114" rx="9" ry="5" fill="${dark}"/><ellipse cx="76" cy="114" rx="9" ry="5" fill="${dark}"/></g>
      <g class="paw-wave"><ellipse cx="97" cy="72" rx="7" ry="9" fill="${fur}"/></g>
      <g class="head">
        <g class="ear"><ellipse cx="36" cy="26" rx="7" ry="6" fill="${dark}"/></g><g class="ear ear-r"><ellipse cx="84" cy="26" rx="7" ry="6" fill="${dark}"/></g>
        <rect x="27" y="22" width="66" height="54" rx="27" fill="${fur}"/>
        <ellipse cx="60" cy="64" rx="22" ry="13" fill="#8C6239"/>
        <ellipse cx="54" cy="60" rx="2.6" ry="2" fill="${dark}"/><ellipse cx="66" cy="60" rx="2.6" ry="2" fill="${dark}"/>
        ${faceParts(42, 15, 67, dark)}
        <g class="hat"><circle cx="60" cy="16" r="9" fill="#FD7E14"/><path d="M60 7 q4 -5 9 -3 q-4 4 -9 3z" fill="#2F9E44"/></g>
      </g></svg>`;
  }
  const fur = "#E8C39E", dark = "#3B2A20";
  return `<svg class="mascot-svg" viewBox="0 0 120 120" aria-hidden="true">
    <path class="tail" d="M88 92 c14 -2 16 -16 6 -18 c-7 -1 -8 8 -2 9" fill="none" stroke="${fur}" stroke-width="7" stroke-linecap="round"/>
    <g class="body"><ellipse cx="60" cy="95" rx="30" ry="21" fill="${fur}"/>
      <ellipse cx="46" cy="114" rx="8" ry="5" fill="${fur}" stroke="#C9A07A" stroke-width="1.5"/><ellipse cx="74" cy="114" rx="8" ry="5" fill="${fur}" stroke="#C9A07A" stroke-width="1.5"/>
      <path d="M44 84 q16 8 32 0" fill="none" stroke="#E03131" stroke-width="5" stroke-linecap="round"/><circle cx="60" cy="90" r="4" fill="#FCC419"/></g>
    <g class="paw-wave"><ellipse cx="96" cy="70" rx="7" ry="9" fill="${fur}" stroke="#C9A07A" stroke-width="1.5"/></g>
    <g class="head">
      <path class="ear" d="M28 32 q-6 -14 8 -16 q8 2 10 12 z" fill="${dark}"/>
      <path class="ear ear-r" d="M92 32 q6 -14 -8 -16 q-8 2 -10 12 z" fill="${dark}"/>
      <ellipse cx="60" cy="50" rx="34" ry="30" fill="${fur}"/>
      <path d="M50 28 q10 -4 20 0M52 33 q8 -3 16 0" fill="none" stroke="#C9A07A" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="60" cy="63" rx="19" ry="14" fill="${dark}"/>
      ${faceParts(47, 14, 66, "#1D1410")}
      <ellipse cx="60" cy="59" rx="6.5" ry="4.2" fill="#120C09"/><ellipse cx="58" cy="57.6" rx="2" ry="1" fill="#fff" opacity=".5"/>
    </g></svg>`;
}
/* mood: idle | happy | sad | wave | cheer */
function mascot(id = "bolota", mood = "idle", size = 96, extraCls = "") {
  return `<span class="mascot m-${mood} ${extraCls}" style="--ms:${size}px" title="${esc(MASCOTS[id] ? MASCOTS[id].name : "")}">${mascotSVG(id)}</span>`;
}
function mascotForUnit(i) { return MASCOT_ORDER[i % MASCOT_ORDER.length]; }
function speech(text) { return `<span class="speech">${esc(text)}</span>`; }

/* ---------- sons e música ---------- */
let AUD = null;
function audioCtx() {
  try { AUD = AUD || new (window.AudioContext || window.webkitAudioContext)(); if (AUD.state === "suspended") AUD.resume(); return AUD; } catch { return null; }
}
const NOTE = (n) => 440 * Math.pow(2, (n - 69) / 12);
function tone(ac, dest, midi, t, dur, type = "triangle", vol = 0.12) {
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(NOTE(midi), t);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(vol * 0.6, t + Math.min(dur * 0.5, 0.25));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(dest); o.start(t); o.stop(t + dur + 0.05);
}
/* [nota MIDI, início em batidas, duração em batidas, voz] */
const JINGLES = {
  ok: { bpm: 220, notes: [[72, 0, 1], [76, 1, 1], [79, 2, 1], [84, 3, 3], [60, 3, 3, "b"], [64, 3, 3, "b"], [67, 3, 3, "b"]] },
  bad: { bpm: 150, notes: [[67, 0, 1.2, "s"], [66, 1.2, 1.2, "s"], [65, 2.4, 1.2, "s"], [64, 3.6, 3, "s"], [48, 3.6, 3, "b"]] },
  done: { bpm: 170, notes: [
    [67, 0, 1], [72, 1, 1], [76, 2, 1], [79, 3, 2], [76, 5, 1], [79, 6, 4],
    [77, 10, 1], [76, 11, 1], [74, 12, 1], [72, 13, 1], [74, 14, 1], [76, 15, 1], [79, 16, 2], [84, 18, 6],
    [48, 0, 4, "b"], [52, 4, 4, "b"], [53, 8, 4, "b"], [55, 12, 4, "b"], [48, 16, 8, "b"],
    [64, 18, 6, "p"], [67, 18, 6, "p"], [72, 18, 6, "p"]] },
  chest: { bpm: 260, notes: [[72, 0, 1], [76, 1, 1], [79, 2, 1], [84, 3, 1], [88, 4, 1], [91, 5, 1], [96, 6, 4], [84, 6, 4, "p"], [88, 6, 4, "p"]] },
  streak: { bpm: 180, notes: [[60, 0, 1], [64, 1, 1], [67, 2, 1], [72, 3, 2], [71, 5, 1], [72, 6, 1], [76, 7, 1], [79, 8, 5], [48, 0, 4, "b"], [55, 4, 4, "b"], [48, 8, 5, "b"], [64, 8, 5, "p"], [67, 8, 5, "p"]] },
  heart: { bpm: 200, notes: [[76, 0, 1], [72, 1, 1], [79, 2, 3]] },
  start: { bpm: 200, notes: [[60, 0, 1], [67, 1, 1], [72, 2, 2], [48, 0, 3, "b"]] },
};
/* Os sons são sintetizados como arquivos WAV e tocados com <audio>, que funciona
   mesmo no iPhone em modo silencioso; o Web Audio fica como reserva. */
const SR = 22050;
function renderNotes(notes, beat, totalSec) {
  const n = Math.ceil(totalSec * SR); const buf = new Float32Array(n);
  for (const [m, st, d, v] of notes) {
    const f = NOTE(m), t0 = Math.floor(st * beat * SR), len = Math.floor(d * beat * 1.05 * SR);
    const vol = v === "b" ? 0.32 : v === "s" ? 0.16 : v === "p" ? 0.16 : 0.34;
    for (let k = 0; k < len && t0 + k < n; k++) {
      const t = k / SR; const ph = (f * t) % 1;
      let w = v === "b" || v === "p" ? Math.sin(2 * Math.PI * f * t) : v === "s" ? (2 * ph - 1) * 0.7 : 1 - 4 * Math.abs(ph - 0.5);
      if (!v) w += 0.25 * Math.sin(4 * Math.PI * f * t);
      const att = Math.min(1, t / 0.012); const rel = Math.min(1, (len - k) / (SR * 0.06));
      const dec = Math.exp(-t * (v === "b" ? 2.2 : 3.2));
      buf[t0 + k] += w * vol * att * rel * (0.45 + 0.55 * dec);
    }
  }
  return buf;
}
function wavURL(buf, target = 0.9) {
  let peak = 0; for (const x of buf) peak = Math.max(peak, Math.abs(x));
  const g = peak > 0 ? target / peak : 1;
  const ab = new ArrayBuffer(44 + buf.length * 2); const dv = new DataView(ab);
  const str = (o, t) => { for (let i = 0; i < t.length; i++) dv.setUint8(o + i, t.charCodeAt(i)); };
  str(0, "RIFF"); dv.setUint32(4, 36 + buf.length * 2, true); str(8, "WAVE"); str(12, "fmt "); dv.setUint32(16, 16, true);
  dv.setUint16(20, 1, true); dv.setUint16(22, 1, true); dv.setUint32(24, SR, true); dv.setUint32(28, SR * 2, true);
  dv.setUint16(32, 2, true); dv.setUint16(34, 16, true); str(36, "data"); dv.setUint32(40, buf.length * 2, true);
  for (let i = 0; i < buf.length; i++) dv.setInt16(44 + i * 2, Math.max(-1, Math.min(1, buf[i] * g)) * 32767, true);
  return URL.createObjectURL(new Blob([ab], { type: "audio/wav" }));
}
const SND = {};
/* cliques: [freq. inicial, freq. final, duração s, onda, volume] */
const POPS = { tap: [900, 520, 0.09, "sine", 0.8], tile: [700, 1050, 0.08, "tri", 0.75], key: [1800, 1500, 0.035, "tri", 0.45], key2: [1650, 1400, 0.035, "tri", 0.45], key3: [1950, 1600, 0.035, "tri", 0.45], pair: [880, 1320, 0.16, "tri", 0.7], back: [600, 380, 0.08, "sine", 0.7] };
function renderPop([f0, f1, dur, wave, vol]) {
  const n = Math.ceil((dur + 0.02) * SR); const buf = new Float32Array(n); let ph = 0;
  for (let k = 0; k < n; k++) {
    const t = k / SR; const f = f0 + (f1 - f0) * Math.min(1, t / dur); ph += f / SR;
    const w = wave === "sine" ? Math.sin(2 * Math.PI * ph) : 1 - 4 * Math.abs((ph % 1) - 0.5);
    buf[k] = w * vol * Math.min(1, t / 0.003) * Math.exp(-t * (5 / dur));
  }
  return buf;
}
function sndURL(kind) {
  if (SND[kind]) return SND[kind];
  if (kind === "music") return (SND.music = wavURL(renderMusic(), 0.6));
  if (POPS[kind]) return (SND[kind] = wavURL(renderPop(POPS[kind]), POPS[kind][4]));
  const j = JINGLES[kind]; if (!j) return null;
  const beat = 60 / j.bpm; const end = Math.max(...j.notes.map((x) => x[1] + x[2])) * beat + 0.4;
  return (SND[kind] = wavURL(renderNotes(j.notes, beat, end)));
}
function renderMusic() {
  const e = 60 / 104 / 2; const notes = []; const M = Music.melody, C = Music.chords;
  for (let i = 0; i < 64; i++) {
    const bar = Math.floor(i / 8) % 4;
    if (M[i]) notes.push([M[i], i, 1.8, "p"]);
    if (i % 8 === 0) for (const c of C[bar]) notes.push([c, i, 7.5, "p"]);
    if (i % 4 === 0) notes.push([C[bar][0] - 12, i, 1.5, "b"]);
  }
  const buf = renderNotes(notes, e, 64 * e);
  for (let k = 0; k < buf.length; k++) buf[k] *= 0.55;
  return buf;
}
let audioUnlocked = false;
function unlockAudio() {
  if (audioUnlocked) return; audioUnlocked = true;
  try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch {}
  try { ["ok", "bad", "done", "tap", "tile", "key", "key2", "key3"].forEach(sndURL); setTimeout(() => { SND.applause = SND.applause || wavURL(renderApplause(), 0.8); }, 400); const a = new Audio(sndURL("heart")); a.volume = 0.001; a.muted = true; const p = a.play(); if (p) p.then(() => a.pause()).catch(() => {}); } catch {}
  audioCtx();
}
addEventListener("pointerdown", unlockAudio, { capture: true, once: false });
addEventListener("keydown", unlockAudio, { capture: true });
function sfxWebAudio(kind) {
  const j = JINGLES[kind]; const ac = audioCtx(); if (!j || !ac) return;
  const beat = 60 / j.bpm; const t0 = ac.currentTime + 0.03;
  const out = ac.createGain(); out.gain.value = 0.9; out.connect(ac.destination);
  for (const [m, s, d, v] of j.notes) {
    const type = v === "b" ? "sine" : v === "s" ? "sawtooth" : v === "p" ? "sine" : "triangle";
    const vol = v === "b" ? 0.1 : v === "s" ? 0.035 : v === "p" ? 0.05 : 0.11;
    tone(ac, out, m, t0 + s * beat, d * beat * 1.05, type, vol);
  }
}
/* aplausos: dezenas de palmas curtas (ruído filtrado) com a plateia crescendo e sumindo */
function renderApplause(dur = 4.2) {
  const n = Math.ceil(dur * SR); const buf = new Float32Array(n); let seed = 12345;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const env = (t) => Math.min(1, t / 0.5) * (t < dur - 1.6 ? 1 : Math.max(0, (dur - t) / 1.6));
  for (let t = 0; t < dur; t += 1 / 60) {
    const claps = Math.round(env(t) * (1.2 + rnd() * 1.4));
    for (let c = 0; c < claps; c++) {
      const st = Math.floor((t + rnd() / 60) * SR); const fc = 900 + rnd() * 1800; const q = 1.2;
      const w0 = 2 * Math.PI * fc / SR, al = Math.sin(w0) / (2 * q), a0 = 1 + al;
      const b0 = al / a0, b2 = -al / a0, a1 = -2 * Math.cos(w0) / a0, a2 = (1 - al) / a0;
      let x1 = 0, x2 = 0, y1 = 0, y2 = 0; const amp = (0.35 + rnd() * 0.65) * env(t); const len = Math.floor(SR * 0.03);
      for (let k = 0; k < len && st + k < n; k++) {
        const x = (rnd() * 2 - 1) * Math.exp(-k / (SR * 0.006));
        const y = b0 * x + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x; y2 = y1; y1 = y;
        buf[st + k] += y * amp * 0.9;
      }
    }
  }
  return buf;
}
function applause() {
  if (!S.profile || S.profile.sound === false) return;
  try { const a = new Audio(SND.applause || (SND.applause = wavURL(renderApplause(), 0.8))); a.volume = 0.85; const p = a.play(); if (p && p.catch) p.catch(() => {}); } catch {}
}
const POOL = {};
function click(kind = "tap") {
  if (!S.profile || S.profile.sound === false) return;
  if (kind === "key") kind = pick(["key", "key2", "key3"]);
  try {
    const pool = POOL[kind] || (POOL[kind] = []); let a = pool.find((x) => x.paused || x.ended);
    if (!a) { if (pool.length >= 4) a = pool[0]; else { a = new Audio(sndURL(kind)); pool.push(a); } }
    a.currentTime = 0; const p = a.play(); if (p && p.catch) p.catch(() => {});
  } catch {}
}
function sfx(kind) {
  if (!S.profile || S.profile.sound === false || !JINGLES[kind]) return;
  try {
    const a = new Audio(sndURL(kind)); a.volume = 1;
    const p = a.play(); if (p && p.catch) p.catch(() => { try { sfxWebAudio(kind); } catch {} });
  } catch { try { sfxWebAudio(kind); } catch {} }
  if (kind === "done") setTimeout(applause, 250);
  if (Music.on) Music.duck(kind === "done" ? 5 : 1.4);
}

/* música de fundo das lições: loop calmo de 8 compassos (C–Am–F–G) */
const Music = {
  on: false, el: null, duckT: null,
  melody: [76, null, 79, 76, 74, null, 72, null, 72, null, 76, 72, 69, null, null, null, 77, null, 76, 74, 72, null, 69, null, 71, null, 74, 72, 71, null, 67, null,
           76, null, 79, 81, 79, null, 76, null, 72, null, 74, 76, 72, null, 69, null, 69, null, 72, 74, 77, null, 76, 74, 74, null, 71, 72, 74, null, null, null],
  chords: [[48, 55, 64], [45, 52, 60], [41, 48, 57], [43, 50, 59]],
  start() {
    if (this.on || !S.profile || S.profile.music === false) return;
    try {
      this.el = this.el || new Audio(sndURL("music")); this.el.loop = true; this.el.volume = 0.35; this.el.currentTime = 0;
      this.on = true; const p = this.el.play(); if (p && p.catch) p.catch(() => { this.on = false; });
    } catch { this.on = false; }
  },
  duck(sec) { if (!this.el) return; clearTimeout(this.duckT); this.el.volume = 0.1; this.duckT = setTimeout(() => { if (this.el) this.el.volume = 0.35; }, sec * 1000); },
  stop() { this.on = false; clearTimeout(this.duckT); if (this.el) { try { this.el.pause(); } catch {} } },
};
function musicToggle() { S.profile.music = S.profile.music === false; save(); if (S.profile.music) Music.start(); else Music.stop(); if (currentView === "run") rerunner(); }
