// Mesin suara: gitar sintetis (Karplus-Strong), bass, drum, klik metronom, dan transport.
import { midiToFreq } from './music.js?v=20261031142813';

let ctx = null;
let master, bus = {};
const cache = new Map();

export function ac() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' });
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 3;
    master = ctx.createGain(); master.gain.value = 0.9;
    master.connect(comp).connect(ctx.destination);
    const rev = ctx.createConvolver(); rev.buffer = impulse(1.6);
    const revGain = ctx.createGain(); revGain.gain.value = 0.18;
    rev.connect(revGain).connect(master);
    const mk = (g, wet = 0.25) => {
      const n = ctx.createGain(); n.gain.value = g; n.connect(master);
      const s = ctx.createGain(); s.gain.value = wet; n.connect(s).connect(rev);
      return n;
    };
    bus.lead = mk(0.9, 0.35);
    bus.back = mk(0.55, 0.2);
    bus.bass = mk(0.75, 0.05);
    bus.drum = mk(0.55, 0.1);
    bus.click = mk(0.7, 0);
    // jalur overdrive untuk lead elektrik
    const pre = ctx.createGain(); pre.gain.value = 1;
    const shaper = ctx.createWaveShaper(); shaper.curve = driveCurve(7); shaper.oversample = '4x';
    const tone = ctx.createBiquadFilter(); tone.type = 'lowpass'; tone.frequency.value = 3600;
    const cab = ctx.createBiquadFilter(); cab.type = 'peaking'; cab.frequency.value = 900; cab.gain.value = 4;
    const post = ctx.createGain(); post.gain.value = 0.33;
    pre.connect(shaper).connect(tone).connect(cab).connect(post).connect(bus.lead);
    bus.drive = pre;
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
export const now = () => ac().currentTime;
export function setVolume(name, v) { ac(); if (bus[name]) bus[name].gain.value = v; }

function impulse(sec) {
  const sr = ctx.sampleRate, len = Math.floor(sr * sec);
  const b = ctx.createBuffer(2, len, sr);
  for (let c = 0; c < 2; c++) {
    const d = b.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
  }
  return b;
}
function driveCurve(k) {
  const n = 2048, c = new Float32Array(n);
  for (let i = 0; i < n; i++) { const x = (i / (n - 1)) * 2 - 1; c[i] = Math.tanh(k * x) / Math.tanh(k); }
  return c;
}

// Buffer senar petik. Panjang delay bulat, koreksi pitch lewat playbackRate.
function stringBuffer(midi, kind) {
  const key = kind + midi;
  if (cache.has(key)) return cache.get(key);
  const sr = ctx.sampleRate;
  const f = midiToFreq(midi);
  const N = Math.max(2, Math.floor(sr / f - 0.5));
  const f0 = sr / (N + 0.5);
  const bass = kind === 'bass';
  const T60 = bass ? 2.2 : Math.max(0.9, 4.2 - (midi - 40) * 0.07);
  const dur = Math.min(T60 + 0.2, 4);
  const len = Math.floor(sr * dur);
  const buf = ctx.createBuffer(1, len, sr);
  const out = buf.getChannelData(0);
  const ring = new Float32Array(N);
  const bright = bass ? 0.18 : kind === 'nylon' ? 0.45 : 0.7;
  let lp = 0, mean = 0;
  for (let i = 0; i < N; i++) { lp += bright * (Math.random() * 2 - 1 - lp); ring[i] = lp; mean += lp; }
  mean /= N;
  // posisi petikan: comb sederhana
  const pick = Math.max(1, Math.floor(N * 0.13));
  const tmp = Float32Array.from(ring);
  for (let i = 0; i < N; i++) ring[i] = tmp[i] - mean - 0.6 * (tmp[(i + pick) % N] - mean);
  const rho = Math.pow(0.001, 1 / (f0 * T60));
  const S = bass ? 0.55 : 0.5;
  let j = 0, peak = 0;
  for (let i = 0; i < len; i++) {
    const a = ring[j], b = ring[(j + 1) % N];
    out[i] = a;
    ring[j] = rho * (S * a + (1 - S) * b);
    j = (j + 1) % N;
    const v = Math.abs(a); if (v > peak) peak = v;
  }
  const norm = 0.6 / (peak || 1);
  const fade = Math.floor(sr * 0.05);
  for (let i = 0; i < len; i++) out[i] *= norm * (i > len - fade ? (len - i) / fade : 1);
  const res = { buf, rate: f / f0 };
  cache.set(key, res);
  return res;
}

let leadTone = 'steel';
export function setLeadTone(t) { leadTone = t; }
export const getLeadTone = () => leadTone;

// Petik satu nada.
export function pluck(midi, when = 0, o = {}) {
  const c = ac();
  const t = Math.max(when || 0, c.currentTime);
  const kind = o.kind || (o.bus === 'bass' ? 'bass' : o.bus === 'lead' && leadTone === 'nylon' ? 'nylon' : 'steel');
  const { buf, rate } = stringBuffer(midi, kind);
  const src = c.createBufferSource();
  src.buffer = buf; src.playbackRate.value = rate;
  const g = c.createGain();
  const vel = o.vel ?? 0.8;
  g.gain.setValueAtTime(o.soft ? vel * 0.55 : vel, t);
  let end = t + buf.duration / rate;
  if (o.dur) {
    const stop = t + o.dur;
    g.gain.setValueAtTime(o.soft ? vel * 0.55 : vel, stop);
    g.gain.exponentialRampToValueAtTime(0.001, stop + (o.ring ? 0.6 : 0.09));
    end = Math.min(end, stop + (o.ring ? 0.65 : 0.12));
  }
  if (o.slideFrom != null) {
    src.detune.setValueAtTime((o.slideFrom - midi) * 100, t);
    src.detune.linearRampToValueAtTime(0, t + 0.09);
  }
  if (o.bend) {
    const at = t + (o.bendDelay ?? 0.03);
    src.detune.setValueAtTime(o.preBend ? o.bend * 100 : 0, t);
    src.detune.setValueAtTime(o.preBend ? o.bend * 100 : 0, at);
    src.detune.linearRampToValueAtTime(o.preBend ? 0 : o.bend * 100, at + 0.14);
  }
  if (o.vib) {
    const lfo = c.createOscillator(); lfo.frequency.value = 5.6;
    const lg = c.createGain(); lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(o.bend ? 18 : 28, t + 0.25);
    lfo.connect(lg).connect(src.detune); lfo.start(t); lfo.stop(end);
  }
  let dest = bus[o.bus || 'lead'];
  if ((o.bus || 'lead') === 'lead' && leadTone === 'drive') dest = bus.drive;
  if (o.mute) {
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900;
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12); end = Math.min(end, t + 0.15);
    src.connect(f).connect(g);
  } else src.connect(g);
  g.connect(dest);
  src.start(t); src.stop(end);
  return src;
}

// Genjreng akor: notes = midi rendah -> tinggi.
export function strum(notes, when = 0, o = {}) {
  const list = o.dir === 'up' ? [...notes].reverse() : notes;
  const spread = o.spread ?? 0.014;
  list.forEach((m, i) => pluck(m, when + i * spread, { bus: o.bus || 'back', vel: (o.vel ?? 0.55) * (o.dir === 'up' ? 0.8 : 1), dur: o.dur, mute: o.mute, ring: o.ring }));
}

// ---------- Drum & klik ----------
let noiseBuf = null;
function noise() {
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}
export function drum(kind, when, vel = 1) {
  const c = ac(); const t = Math.max(when, c.currentTime);
  const g = c.createGain(); g.connect(bus.drum);
  if (kind === 'kick') {
    const o = c.createOscillator(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    o.connect(g); o.start(t); o.stop(t + 0.36);
  } else {
    const s = c.createBufferSource(); s.buffer = noise();
    const f = c.createBiquadFilter();
    if (kind === 'snare') {
      f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 0.7;
      g.gain.setValueAtTime(vel * 0.8, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      const o = c.createOscillator(); o.frequency.value = 190; const og = c.createGain();
      og.gain.setValueAtTime(vel * 0.4, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      o.connect(og).connect(bus.drum); o.start(t); o.stop(t + 0.1);
    } else {
      f.type = 'highpass'; f.frequency.value = 7000;
      const d = kind === 'open' ? 0.22 : 0.045;
      g.gain.setValueAtTime(vel * 0.35, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
    }
    s.connect(f).connect(g); s.start(t); s.stop(t + 0.3);
  }
}
export function click(when, accent = false, vol = 1) {
  const c = ac(); const t = Math.max(when, c.currentTime);
  const o = c.createOscillator(); o.type = 'square'; o.frequency.value = accent ? 1760 : 1175;
  const g = c.createGain(); g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.35 * vol, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  o.connect(g).connect(bus.click); o.start(t); o.stop(t + 0.06);
}
export function tone(midi, dur = 2.5) {
  // nada referensi tuner: petik + sinus halus agar mudah didengar
  pluck(midi, 0, { bus: 'click', vel: 0.9 });
  const c = ac(), t = c.currentTime;
  const o = c.createOscillator(); o.frequency.value = midiToFreq(midi);
  const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.08, t + 0.05); g.gain.linearRampToValueAtTime(0, t + dur);
  o.connect(g).connect(bus.click); o.start(t); o.stop(t + dur);
}

// ---------- Transport ----------
// events: [{beat, fn(time, ev)}], ui callback dijalankan tepat waktu via rAF.
export class Transport {
  constructor() { this.events = []; this.length = 4; this.bpm = 90; this.loop = false; this.playing = false; this.onEnd = null; this.ui = []; }
  set(events, length) { this.events = events.slice().sort((a, b) => a.beat - b.beat); this.length = length; }
  get spb() { return 60 / this.bpm; }
  beatNow() { return this.playing ? (now() - this.t0) / this.spb : 0; }
  setBpm(b) {
    if (this.playing) { const beat = this.beatNow(); this.bpm = b; this.t0 = now() - beat * this.spb; } else this.bpm = b;
  }
  start(fromBeat = 0, lead = 0.12) {
    this.stop(true);
    ac();
    this.playing = true; this.idx = this.events.findIndex((e) => e.beat >= fromBeat); if (this.idx < 0) this.idx = this.events.length;
    this.t0 = now() + lead - fromBeat * this.spb;
    this.ui = [];
    this.timer = setInterval(() => this.tick(), 25);
    this.tick();
    const raf = () => {
      if (!this.playing) return;
      const t = now();
      while (this.ui.length && this.ui[0].time <= t + 0.01) { const u = this.ui.shift(); u.ev.ui?.(u.ev, u.time); }
      this.raf = requestAnimationFrame(raf);
    };
    this.raf = requestAnimationFrame(raf);
    // rAF bisa tertahan (tab tersembunyi); timer sebagai cadangan
    this.uiTimer = setInterval(() => { const t = now(); while (this.ui.length && this.ui[0].time <= t) { const u = this.ui.shift(); u.ev.ui?.(u.ev, u.time); } }, 40);
  }
  tick() {
    const horizon = now() + 0.2;
    for (;;) {
      if (this.idx >= this.events.length) {
        const endTime = this.t0 + this.length * this.spb;
        if (this.loop && this.events.length) { if (endTime > horizon) return; this.t0 = endTime; this.idx = 0; continue; }
        if (now() >= endTime) { const cb = this.onEnd; this.stop(); cb?.(); }
        return;
      }
      const ev = this.events[this.idx];
      const time = this.t0 + ev.beat * this.spb;
      if (time > horizon) return;
      ev.fn?.(time, ev, this.spb);
      if (ev.ui) { this.ui.push({ time, ev }); }
      this.idx++;
    }
  }
  stop(silent) {
    this.playing = false;
    clearInterval(this.timer); clearInterval(this.uiTimer); cancelAnimationFrame(this.raf);
    this.ui = [];
    if (!silent) this.onStop?.();
  }
}
