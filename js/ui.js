// Helper DOM, ikon garis, fretboard SVG, diagram akor, dan tab.
import { pretty } from './music.js?v=20261030111205';

export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') for (const [sk, sv2] of Object.entries(v)) sk.startsWith('--') ? el.style.setProperty(sk, sv2) : (el.style[sk] = sv2);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid instanceof Node ? kid : document.createTextNode(kid));
  return el;
}
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const P = {
  tuner: '<path d="M4 15a8 8 0 1 1 16 0"/><path d="M12 15l4-6"/><circle cx="12" cy="15" r="1.3"/>',
  scale: '<path d="M3 6h18M3 10h18M3 14h18M3 18h18"/><circle cx="8" cy="10" r="1.6"/><circle cx="14" cy="14" r="1.6"/><circle cx="17" cy="6" r="1.6"/>',
  music: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  chord: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M5 8h14M5 13h14M10 3v18M14 3v18"/>',
  practice: '<path d="M8 21l4-18 4 18"/><path d="M6 21h12"/><path d="M12 13l5-5"/>',
  path: '<path d="M4 19h4v-5h4v-4h4V5h4"/>',
  play: '<path d="M7 4l13 8-13 8z"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="1"/>',
  loop: '<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  volume: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  left: '<path d="M15 5l-7 7 7 7"/>',
  right: '<path d="M9 5l7 7-7 7"/>',
  shuffle: '<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
  tap: '<path d="M9 11V5a2 2 0 0 1 4 0v6"/><path d="M13 9a2 2 0 0 1 4 0v3a6 6 0 0 1-6 6h-1a5 5 0 0 1-4-2l-2-3a1.5 1.5 0 0 1 2.4-1.8L9 13"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  ear: '<path d="M6 9a6 6 0 1 1 12 0c0 4-4 5-4 8a3 3 0 0 1-6 0"/><path d="M10 9a2 2 0 1 1 4 0"/>',
};
export function icon(name, cls = '') {
  return `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`;
}
export function btn(label, ico, onclick, cls = '') {
  return h('button', { class: 'btn ' + cls, type: 'button', onclick, html: (ico ? icon(ico) : '') + (label ? `<span>${label}</span>` : '') });
}
export function select(opts, value, onchange, attrs = {}) {
  const s = h('select', { ...attrs, onchange: (e) => onchange(e.target.value) });
  for (const o of opts) {
    if (o.group) {
      const g = h('optgroup', { label: o.group });
      for (const x of o.items) g.append(h('option', { value: x.value }, x.label));
      s.append(g);
    } else s.append(h('option', { value: o.value }, o.label));
  }
  s.value = value;
  return s;
}
export function seg(opts, value, onchange) {
  const w = h('div', { class: 'seg', role: 'tablist' });
  const draw = (v) => { for (const b of w.children) b.classList.toggle('on', b.dataset.v === String(v)); };
  for (const o of opts) w.append(h('button', { type: 'button', 'data-v': o.value, onclick: () => { draw(o.value); onchange(o.value); } }, o.label));
  draw(value);
  w.set = draw;
  return w;
}
export function field(label, el) { return h('label', { class: 'field' }, h('span', {}, label), el); }

export const store = {
  get(k, d) { try { const v = localStorage.getItem('guitars.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('guitars.' + k, JSON.stringify(v)); } catch { /* mode privat */ } },
};

// ---------- Fretboard ----------
const NS = 'http://www.w3.org/2000/svg';
const sv = (tag, a = {}) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); return e; };
export const MARKERS = [3, 5, 7, 9, 15, 17, 19, 21];

// marks: [{s (0 = senar 6), f, label, cls, key}]
export function fretboard({ strings = 6, frets = 15, from = 0, marks = [], onclick = null, labels = [] } = {}) {
  const fw = 52, sh = 26, left = from === 0 ? 52 : 18, top = 22;
  const n = frets - from;
  const W = left + n * fw + 14, H = top + (strings - 1) * sh + 30;
  const svg = sv('svg', { viewBox: `0 0 ${W} ${H}`, class: 'fb', width: W, height: H });
  const y = (s) => top + (strings - 1 - s) * sh;
  const xf = (f) => (f === 0 ? left - 20 : left + (f - from - 0.5) * fw);
  svg.append(sv('rect', { x: left, y: top - 8, width: n * fw, height: (strings - 1) * sh + 16, rx: 4, class: 'fb-wood' }));
  for (let f = from; f <= frets; f++) {
    if (f > from) {
      const mx = left + (f - from - 0.5) * fw;
      if (MARKERS.includes(f)) svg.append(sv('circle', { cx: mx, cy: top + ((strings - 1) * sh) / 2, r: 5, class: 'fb-inlay' }));
      if (f === 12 || f === 24) { svg.append(sv('circle', { cx: mx, cy: top + sh * 1.0, r: 5, class: 'fb-inlay' })); svg.append(sv('circle', { cx: mx, cy: top + sh * (strings - 2), r: 5, class: 'fb-inlay' })); }
      const t = sv('text', { x: mx, y: H - 6, class: 'fb-num' }); t.textContent = f; svg.append(t);
    }
    const x = left + (f - from) * fw;
    svg.append(sv('line', { x1: x, x2: x, y1: top - 8, y2: top + (strings - 1) * sh + 8, class: f === 0 ? 'fb-nut' : 'fb-fret' }));
  }
  for (let s = 0; s < strings; s++) {
    svg.append(sv('line', { x1: left, x2: left + n * fw, y1: y(s), y2: y(s), class: 'fb-str', 'stroke-width': 0.8 + (strings - 1 - s) * 0.32 }));
    if (labels[s]) { const t = sv('text', { x: 4, y: y(s) + 4, class: 'fb-lab' }); t.textContent = labels[s]; if (from === 0) svg.append(t); }
  }
  if (onclick) {
    const hit = sv('rect', { x: 0, y: 0, width: W, height: H, fill: 'transparent', style: 'cursor:pointer' });
    hit.addEventListener('click', (e) => {
      const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const p = pt.matrixTransform(svg.getScreenCTM().inverse());
      const s = Math.round((strings - 1) - (p.y - top) / sh);
      const f = p.x < left ? 0 : Math.floor((p.x - left) / fw) + from + 1;
      if (s >= 0 && s < strings && f <= frets) onclick(s, f);
    });
    svg.append(hit);
  }
  const map = new Map();
  for (const m of marks) {
    if (m.f < from || m.f > frets) continue;
    const g = sv('g', { class: 'fb-dot ' + (m.cls || ''), transform: `translate(${xf(m.f)},${y(m.s)})` });
    g.append(sv('circle', { r: 10.5 }));
    if (m.label != null) { const t = sv('text', { y: 4 }); t.textContent = pretty(m.label); g.append(t); }
    if (onclick) g.style.pointerEvents = 'none';
    svg.append(g);
    map.set(m.key ?? `${m.s}:${m.f}`, g);
  }
  svg.dots = map;
  svg.flash = (key, cls = 'hit') => { for (const g of svg.querySelectorAll('.' + cls)) g.classList.remove(cls); const g = map.get(key); if (g) g.classList.add(cls); };
  return svg;
}

// ---------- Diagram akor ----------
// frets: 6 angka (senar 6 -> 1), -1 = mute. fingers: angka jari / 0.
export function chordDiagram(v, { size = 1, labels = null } = {}) {
  const played = v.frets.filter((f) => f > 0);
  const maxF = Math.max(...played, 1);
  const minF = played.length ? Math.min(...played) : 1;
  const base = maxF <= 4 ? 1 : minF;
  const rows = Math.max(4, maxF - base + 1);
  const cw = 18, rh = 22, L = 26, T = 30;
  const W = L + cw * 5 + 22, H = T + rh * rows + 22;
  const svg = sv('svg', { viewBox: `0 0 ${W} ${H}`, class: 'cd', width: W * size, height: H * size });
  const x = (s) => L + s * cw;
  if (base === 1) svg.append(sv('rect', { x: L - 1, y: T - 4, width: cw * 5 + 2, height: 4, class: 'cd-nut' }));
  else { const t = sv('text', { x: L - 8, y: T + rh * 0.62, class: 'cd-base' }); t.textContent = base + 'fr'; svg.append(t); }
  for (let r = 0; r <= rows; r++) svg.append(sv('line', { x1: L, x2: L + cw * 5, y1: T + r * rh, y2: T + r * rh, class: 'cd-line' }));
  for (let s = 0; s < 6; s++) svg.append(sv('line', { x1: x(s), x2: x(s), y1: T, y2: T + rows * rh, class: 'cd-line' }));
  if (v.barre) {
    const bf = v.barre.fret, ss = v.barre.from ?? 0, se = v.barre.to ?? 5;
    svg.append(sv('rect', { x: x(ss) - 7, y: T + (bf - base + 0.5) * rh - 7, width: x(se) - x(ss) + 14, height: 14, rx: 7, class: 'cd-barre' }));
  }
  v.frets.forEach((f, s) => {
    if (f < 0) { const t = sv('text', { x: x(s), y: T - 10, class: 'cd-x' }); t.textContent = '×'; svg.append(t); return; }
    if (f === 0) { svg.append(sv('circle', { cx: x(s), cy: T - 14, r: 4.5, class: 'cd-open' })); }
    else {
      const cy = T + (f - base + 0.5) * rh;
      const isRoot = v.roots?.includes(s);
      svg.append(sv('circle', { cx: x(s), cy, r: 7.5, class: 'cd-dot' + (isRoot ? ' root' : '') }));
      const fg = v.fingers?.[s];
      if (fg) { const t = sv('text', { x: x(s), y: cy + 3.6, class: 'cd-fg' }); t.textContent = fg === 5 ? 'T' : fg; svg.append(t); }
    }
    if (labels?.[s]) { const t = sv('text', { x: x(s), y: H - 6, class: 'cd-iv' }); t.textContent = pretty(labels[s]); svg.append(t); }
  });
  return svg;
}

// ---------- Tab ----------
// notes: [{beat, dur, s, f, tech, key}], beatsPerBar
export function tabView(notes, { beatsPerBar = 4, barsPerLine = 4, totalBeats = null, chords = [] } = {}) {
  const wrap = h('div', { class: 'tab' });
  const total = totalBeats ?? Math.max(...notes.map((n) => n.beat + n.dur), beatsPerBar);
  const bars = Math.ceil(total / beatsPerBar - 1e-6);
  const bw = 44 * beatsPerBar + 10;
  const map = new Map();
  for (let line = 0; line * barsPerLine < bars; line++) {
    const b0 = line * barsPerLine, b1 = Math.min(bars, b0 + barsPerLine);
    const W = 26 + (b1 - b0) * bw, H = 6 * 13 + 34;
    const svg = sv('svg', { viewBox: `0 0 ${W} ${H}`, class: 'tabsv', width: W, height: H });
    const y = (s) => 26 + (5 - s) * 13;
    for (let s = 0; s < 6; s++) svg.append(sv('line', { x1: 14, x2: W, y1: y(s), y2: y(s), class: 'tab-line' }));
    const tt = sv('text', { x: 4, y: y(3) + 4, class: 'tab-tab' }); tt.textContent = 'T'; svg.append(tt);
    for (let b = b0; b <= b1; b++) { const xx = 22 + (b - b0) * bw; svg.append(sv('line', { x1: xx, x2: xx, y1: y(5), y2: y(0), class: 'tab-bar' })); }
    const bx = (beat) => 22 + (beat - b0 * beatsPerBar) * 44 + 14;
    for (const c of chords) {
      if (c.beat < b0 * beatsPerBar || c.beat >= b1 * beatsPerBar) continue;
      const t = sv('text', { x: bx(c.beat) - 6, y: 12, class: 'tab-chord' }); t.textContent = pretty(c.name); svg.append(t);
    }
    for (const n of notes) {
      if (n.beat < b0 * beatsPerBar - 1e-6 || n.beat >= b1 * beatsPerBar - 1e-6 || n.s == null) continue;
      const g = sv('g', { class: 'tab-n', transform: `translate(${bx(n.beat)},${y(n.s)})` });
      const label = String(n.f) + (n.tech || '');
      g.append(sv('rect', { x: -2 - label.length * 3.2, y: -6.5, width: 4 + label.length * 6.4, height: 13, rx: 2 }));
      const t = sv('text', { y: 4 }); t.textContent = label; g.append(t);
      svg.append(g);
      if (!map.has(n.key)) map.set(n.key, []);
      map.get(n.key).push(g);
    }
    wrap.append(svg);
  }
  let last = [];
  wrap.flash = (key) => {
    for (const g of last) g.classList.remove('hit');
    last = map.get(key) || [];
    for (const g of last) g.classList.add('hit');
    const el = last[0]?.ownerSVGElement;
    if (el && wrap.scrollHeight > wrap.clientHeight) {
      const top = el.offsetTop - wrap.offsetTop;
      if (top < wrap.scrollTop || top > wrap.scrollTop + wrap.clientHeight - el.clientHeight) wrap.scrollTo({ top: top - 8, behavior: 'smooth' });
    }
  };
  wrap.clear = () => { for (const g of last) g.classList.remove('hit'); last = []; };
  return wrap;
}
