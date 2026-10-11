// Tiny synthesized sound set (WebAudio, no files).
let ctx = null;
let on = (() => { try { return localStorage.getItem('c3d.sound') !== '0'; } catch { return true; } })();
export const soundOn = () => on;
export function setSound(v) { on = v; try { localStorage.setItem('c3d.sound', v ? '1' : '0'); } catch {} }

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
function tone(f, dur, { type = 'sine', gain = 0.12, slide = 0, delay = 0 } = {}) {
  const a = ac(), t = a.currentTime + delay;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f * slide), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t); o.stop(t + dur + 0.05);
}
function noise(dur, { gain = 0.1, freq = 1800, q = 1, type = 'bandpass', delay = 0 } = {}) {
  const a = ac(), t = a.currentTime + delay;
  const buf = a.createBuffer(1, Math.ceil(a.sampleRate * dur), a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 2;
  const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  src.buffer = buf; f.type = type; f.frequency.value = freq; f.Q.value = q; g.gain.value = gain;
  src.connect(f).connect(g).connect(a.destination);
  src.start(t);
}

const S = {
  click: () => tone(1400, 0.05, { type: 'triangle', gain: 0.04 }),
  coin: (n = 2) => { for (let i = 0; i < Math.min(n, 5); i++) { tone(2100 + Math.random() * 600, 0.18, { type: 'triangle', gain: 0.05, delay: i * 0.07 }); tone(3200, 0.08, { gain: 0.02, delay: i * 0.07 }); } },
  card: (n = 1) => { for (let i = 0; i < Math.min(n, 4); i++) noise(0.09, { gain: 0.12, freq: 2600, q: 0.7, delay: i * 0.08 }); },
  build: () => { tone(110, 0.35, { slide: 0.5, gain: 0.22 }); noise(0.3, { gain: 0.08, freq: 500, type: 'lowpass', delay: 0.02 }); tone(880, 0.4, { gain: 0.03, delay: 0.25 }); },
  destroy: () => { noise(0.9, { gain: 0.22, freq: 380, type: 'lowpass' }); tone(70, 0.8, { slide: 0.5, gain: 0.25 }); },
  call: () => { tone(523, 1.4, { gain: 0.07 }); tone(784, 1.2, { gain: 0.05, delay: 0.02 }); tone(1046, 0.9, { gain: 0.03, delay: 0.04 }); },
  kill: () => { tone(220, 0.9, { type: 'sawtooth', gain: 0.04, slide: 0.6 }); tone(233, 0.9, { gain: 0.06, slide: 0.6 }); },
  turn: () => [659, 784, 988].forEach((f, i) => tone(f, 0.5, { gain: 0.07, delay: i * 0.11, type: 'triangle' })),
  crown: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.6, { gain: 0.05, delay: i * 0.06 })),
  win: () => [523, 659, 784, 1046, 784, 1046].forEach((f, i) => tone(f, 0.7, { gain: 0.08, delay: i * 0.14, type: 'triangle' })),
};
export function sfx(name, arg) {
  if (!on) return;
  try { S[name]?.(arg); } catch { /* audio unavailable */ }
}

// ── generative ambient score: slow modal pads + sparse plucks, all synthesized ──
let musicOn = (() => { try { return localStorage.getItem('c3d.music') === '1'; } catch { return false; } })();
let music = null;
export const musicEnabled = () => musicOn;
export function setMusic(v) {
  musicOn = v;
  try { localStorage.setItem('c3d.music', v ? '1' : '0'); } catch {}
  v ? startMusic() : stopMusic();
}
const hz = m => 440 * 2 ** ((m - 69) / 12);
const CHORDS = [[50, 57, 65, 69], [48, 55, 64, 67], [46, 53, 62, 65], [45, 52, 61, 64]]; // Dm · C · Bb · A
const PLUCK = [62, 64, 65, 67, 69, 72, 74, 76, 77, 81];
function startMusic() {
  if (music) return;
  const a = ac();
  const out = a.createGain(), lp = a.createBiquadFilter(), delay = a.createDelay(), fb = a.createGain();
  out.gain.setValueAtTime(0.0001, a.currentTime);
  out.gain.exponentialRampToValueAtTime(0.06, a.currentTime + 4);
  lp.type = 'lowpass'; lp.frequency.value = 1400;
  delay.delayTime.value = 0.42; fb.gain.value = 0.38;
  out.connect(lp).connect(a.destination);
  out.connect(delay); delay.connect(fb).connect(delay); delay.connect(lp);
  let bar = 0;
  const note = (f, start, dur, peak, type) => {
    const o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.value = f; o.detune.value = (Math.random() - 0.5) * 8;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(peak, start + Math.min(2, dur / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g).connect(out); o.start(start); o.stop(start + dur + 0.1);
  };
  const chord = () => {
    const t = a.currentTime + 0.05, c = CHORDS[bar++ % CHORDS.length];
    c.forEach((m, i) => note(hz(m), t + i * 0.08, 7.5, i ? 0.18 : 0.26, i % 2 ? 'triangle' : 'sine'));
  };
  const pluck = () => {
    if (Math.random() < 0.35) return;
    const m = PLUCK[Math.floor(Math.random() * PLUCK.length)];
    note(hz(m), a.currentTime + 0.02, 1.6, 0.14, 'triangle');
  };
  chord();
  music = { out, timers: [setInterval(chord, 6400), setInterval(pluck, 800)] };
}
function stopMusic() {
  if (!music) return;
  const m = music; music = null;
  m.timers.forEach(clearInterval);
  try { m.out.gain.cancelScheduledValues(0); m.out.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.4); } catch {}
  setTimeout(() => { try { m.out.disconnect(); } catch {} }, 2000);
}
// Browsers only allow audio after a gesture: resume the saved preference on the first tap.
addEventListener('pointerdown', () => { if (musicOn && !music) startMusic(); }, { once: true });
document.addEventListener('visibilitychange', () => {
  if (!ctx) return;
  document.hidden ? ctx.suspend() : ctx.resume();
});
