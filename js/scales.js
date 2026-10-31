// Pola scale di fretboard: posisi (box / 3 nada per senar), seluruh neck, pola latihan + playback.
import { SCALES, scaleById, ROOTS, STD, mod12, pcOf, spellScale, intervalName, pretty, noteName, useFlats, QUAL } from './music.js?v=20261031142813';
import { pluck, click, Transport, strum } from './audio.js?v=20261031142813';
import { h, btn, select, seg, field, store, fretboard, tabView } from './ui.js?v=20261031142813';
import { bestVoicing } from './chorddata.js?v=20261031142813';

// Posisi n-nada-per-senar mulai dari tiap derajat scale di senar 6.
function npsPositions(rootPc, iv, nps) {
  const pcs = new Set(iv.map((x) => mod12(rootPc + x)));
  const res = [];
  for (let d = 0; d < iv.length; d++) {
    let m = STD[0] + mod12(rootPc + iv[d] - STD[0]);
    const notes = [];
    for (let s = 0; s < 6; s++) for (let k = 0; k < nps; k++) { while (!pcs.has(mod12(m))) m++; notes.push({ s, f: m - STD[s], midi: m }); m++; }
    if (Math.min(...notes.map((n) => n.f)) >= 12) notes.forEach((n) => { n.f -= 12; n.midi -= 12; });
    res.push(notes);
  }
  return res;
}

export function scalePositions(rootPc, sc) {
  let list;
  if (sc.box) {
    const base = scaleById(sc.box);
    const extra = sc.iv.filter((x) => !base.iv.includes(x)).map((x) => mod12(rootPc + x));
    list = npsPositions(rootPc, base.iv, 2).map((notes) => {
      const out = notes.slice();
      for (let s = 0; s < 6; s++) {
        const fs = notes.filter((n) => n.s === s).map((n) => n.f);
        for (let f = Math.min(...fs) - 1; f <= Math.max(...fs) + 1; f++) {
          if (f >= 0 && extra.includes(mod12(STD[s] + f)) && !out.some((n) => n.s === s && n.f === f)) out.push({ s, f, midi: STD[s] + f, extra: true });
        }
      }
      return out.sort((a, b) => a.midi - b.midi);
    });
  } else list = npsPositions(rootPc, sc.iv, sc.iv.length <= 5 ? 2 : 3);
  // posisi 1 = akar di senar 6, berikutnya naik mengikuti derajat scale
  return list.map((notes, i) => ({ notes, deg: i, lo: Math.min(...notes.map((n) => n.f)), hi: Math.max(...notes.map((n) => n.f)) }));
}

function fingerings(notes) {
  const out = new Map();
  for (let s = 0; s < 6; s++) {
    const fs = notes.filter((n) => n.s === s).sort((a, b) => a.f - b.f);
    const fretted = fs.filter((n) => n.f > 0);
    fs.forEach((n) => { if (n.f === 0) out.set(`${s}:0`, 0); });
    if (fretted.length === 3) {
      const [a, b, c] = fretted.map((n) => n.f);
      const fg = [1, b - a >= 2 && c - b === 1 ? 3 : 2, 4];
      if (c - a <= 2) fg.splice(0, 3, 1, 2, 3);
      fretted.forEach((n, i) => out.set(`${s}:${n.f}`, fg[i]));
    }
  }
  const lo = Math.min(...notes.filter((n) => n.f > 0).map((n) => n.f));
  for (const n of notes) if (!out.has(`${n.s}:${n.f}`)) out.set(`${n.s}:${n.f}`, Math.max(1, Math.min(4, n.f - lo + 1)));
  return out;
}

// Pola latihan dari daftar nada naik
export const SEQS = [
  { id: 'lurus', name: 'Naik-turun lurus' },
  { id: 'g3', name: 'Grup 3 (1-2-3, 2-3-4)' },
  { id: 'g4', name: 'Grup 4 (1-2-3-4, 2-3-4-5)' },
  { id: 'terts', name: 'Terts (1-3, 2-4)' },
  { id: 'up', name: 'Naik saja' },
];
export function sequence(asc, id) {
  const desc = asc.slice().reverse();
  const grp = (arr, k) => { const r = []; for (let i = 0; i + k <= arr.length; i++) r.push(...arr.slice(i, i + k)); return r; };
  const terts = (arr) => { const r = []; for (let i = 0; i + 2 < arr.length; i++) r.push(arr[i], arr[i + 2]); return r; };
  switch (id) {
    case 'g3': return [...grp(asc, 3), ...grp(desc, 3)];
    case 'g4': return [...grp(asc, 4), ...grp(desc, 4)];
    case 'terts': return [...terts(asc), ...terts(desc)];
    case 'up': return asc;
    default: return [...asc, ...desc.slice(1)];
  }
}

function scaleChords(root, iv) {
  if (iv.length !== 7) return [];
  const names = spellScale(root, iv);
  const Q3 = { '4,7': '', '3,7': 'm', '3,6': 'dim', '4,8': 'aug' };
  const Q7 = { '4,7,11': 'maj7', '4,7,10': '7', '3,7,10': 'm7', '3,6,10': 'm7b5', '3,6,9': 'dim7', '3,7,11': 'm(maj7)', '4,8,11': 'maj7#5' };
  const RN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  return iv.map((r, i) => {
    const t = [2, 4, 6].map((k) => mod12(iv[(i + k) % 7] - r));
    const q3 = Q3[t.slice(0, 2).join()] ?? '?', q7 = Q7[t.join()] ?? '';
    const rn = q3 === 'm' || q3 === 'dim' ? RN[i].toLowerCase() : RN[i];
    return { rn: rn + (q3 === 'dim' ? '°' : q3 === 'aug' ? '+' : ''), triad: names[i] + q3, seventh: names[i] + q7 };
  });
}

export function initScales(root) {
  const S = { key: store.get('sc.key', 'A'), scale: store.get('sc.scale', 'pmin'), pos: store.get('sc.pos', 0), label: store.get('sc.label', 'note'), seq: 'lurus', bpm: store.get('sc.bpm', 80), sub: 2, loop: true, metro: true };
  const tp = new Transport();
  const save = () => { store.set('sc.key', S.key); store.set('sc.scale', S.scale); store.set('sc.pos', S.pos); store.set('sc.label', S.label); store.set('sc.bpm', S.bpm); };

  const grpOpts = ['Dasar', 'Menengah', 'Lanjut'].map((g) => ({ group: g, items: SCALES.filter((s) => s.grp === g).map((s) => ({ value: s.id, label: s.name })) }));
  const keySel = select(ROOTS.map((r) => ({ value: r, label: pretty(r) })), S.key, (v) => { S.key = v; render(); });
  const scSel = select(grpOpts, S.scale, (v) => { S.scale = v; S.pos = 0; render(); });
  const posBox = h('div', { class: 'seg wrap pos-seg' });
  const lblSeg = seg([{ value: 'note', label: 'Nada' }, { value: 'iv', label: 'Interval' }, { value: 'fg', label: 'Jari' }], S.label, (v) => { S.label = v; render(); });
  const seqSel = select(SEQS.map((x) => ({ value: x.id, label: x.name })), S.seq, (v) => { S.seq = v; if (tp.playing) play(); else drawTab(); });
  const subSel = select([{ value: 1, label: '1/4' }, { value: 2, label: '1/8' }, { value: 3, label: 'Triplet' }, { value: 4, label: '1/16' }], S.sub, (v) => { S.sub = Number(v); if (tp.playing) play(); });
  const bpmIn = h('input', { type: 'range', min: 40, max: 200, value: S.bpm, oninput: (e) => { S.bpm = Number(e.target.value); bpmOut.textContent = S.bpm + ' BPM'; tp.setBpm(S.bpm); save(); } });
  const bpmOut = h('output', {}, S.bpm + ' BPM');
  const playBtn = btn('Mainkan', 'play', () => (tp.playing ? stop() : play()), 'primary');
  const metroChk = h('label', { class: 'chk' }, h('input', { type: 'checkbox', checked: true, onchange: (e) => { S.metro = e.target.checked; } }), 'Klik metronom');

  const fbWrap = h('div', { class: 'fb-wrap' });
  const tabWrap = h('div', { class: 'tab-wrap' });
  const info = h('div', { class: 'card sc-info' });
  let fb = null, tab = null, seqNotes = [];

  tp.onStop = () => { playBtn.classList.remove('on'); playBtn.querySelector('span').textContent = 'Mainkan'; fb?.flash(null); tab?.clear(); };

  function current() {
    const sc = scaleById(S.scale);
    const rpc = pcOf(S.key);
    const positions = scalePositions(rpc, sc);
    if (S.pos > positions.length) S.pos = 0;
    return { sc, rpc, positions };
  }

  function render() {
    save();
    const { sc, rpc, positions } = current();
    const names = spellScale(S.key, sc.iv);
    const nameOf = new Map(sc.iv.map((x, i) => [mod12(rpc + x), names[i]]));
    // tombol posisi
    posBox.innerHTML = '';
    const mk = (v, label) => h('button', { type: 'button', class: S.pos === v ? 'on' : '', onclick: () => { S.pos = v; render(); } }, label);
    posBox.append(mk(0, 'Seluruh neck'));
    positions.forEach((p, i) => posBox.append(mk(i + 1, `Posisi ${i + 1} · fret ${p.lo}`)));

    let notes;
    if (S.pos === 0) {
      notes = [];
      for (let s = 0; s < 6; s++) for (let f = 0; f <= 17; f++) if (nameOf.has(mod12(STD[s] + f))) notes.push({ s, f, midi: STD[s] + f });
    } else notes = positions[S.pos - 1].notes;
    const fg = S.pos ? fingerings(notes) : null;
    const marks = notes.map((n) => {
      const pc = mod12(n.midi), iv = mod12(pc - rpc);
      const label = S.label === 'iv' ? intervalName(iv, sc.iv) : S.label === 'fg' && fg ? (fg.get(`${n.s}:${n.f}`) || 'o') : nameOf.get(pc);
      return { s: n.s, f: n.f, label, cls: (iv === 0 ? 'root' : '') + (n.extra || (sc.box && !scaleById(sc.box).iv.includes(iv)) ? ' blue' : '') };
    });
    const hi = Math.max(15, ...notes.map((n) => n.f + 1));
    const lo = 0;
    fb = fretboard({ frets: Math.min(hi, 18), from: lo, marks, labels: ['E', 'A', 'D', 'G', 'B', 'e'], onclick: (s, f) => { const m = STD[s] + f; pluck(m, 0, { dur: 0.9 }); } });
    fbWrap.innerHTML = ''; fbWrap.append(fb);
    if (S.pos) {
      const p = positions[S.pos - 1];
      requestAnimationFrame(() => { const x = (p.lo / 18) * fb.clientWidth - 40; if (fbWrap.scrollWidth > fbWrap.clientWidth) fbWrap.scrollTo({ left: Math.max(0, x), behavior: 'smooth' }); });
    }

    // nada urut untuk playback
    const asc = (S.pos ? positions[S.pos - 1].notes : positions[0].notes).slice().sort((a, b) => a.midi - b.midi || a.s - b.s);
    seqNotes = sequence(asc, S.seq);
    drawTab();
    drawInfo(sc, names, rpc);
    if (tp.playing) play();
  }

  function drawTab() {
    const { positions } = current();
    const asc = (S.pos ? positions[S.pos - 1].notes : positions[0].notes).slice().sort((a, b) => a.midi - b.midi || a.s - b.s);
    seqNotes = sequence(asc, S.seq);
    const step = 1 / S.sub;
    const tn = seqNotes.map((n, i) => ({ beat: i * step, dur: step, s: n.s, f: n.f, key: i }));
    tab = tabView(tn.map((n) => ({ ...n, beat: n.key / 2 })), { beatsPerBar: 2 * S.sub, barsPerLine: Math.max(1, Math.floor(((tabWrap.clientWidth || 700) - 30) / (88 * S.sub + 10))) });
    tabWrap.innerHTML = '';
    tabWrap.append(h('div', { class: 'tab-head' }, h('b', {}, 'Tab pola'), h('span', { class: 'muted' }, S.pos ? `Posisi ${S.pos}` : 'Posisi 1 (pilih posisi untuk pola lain)')), tab);
  }

  function play() {
    const step = 1 / S.sub;
    const evs = seqNotes.map((n, i) => ({
      beat: i * step, n, i,
      fn: (t, ev, spb) => pluck(n.midi, t, { dur: step * spb * 0.95, vel: 0.75 }),
      ui: () => { fb.flash(`${n.s}:${n.f}`); tab.flash(i); },
    }));
    const len = Math.ceil(seqNotes.length * step);
    for (let b = 0; b < len; b++) evs.push({ beat: b, fn: (t) => S.metro && click(t, b % 4 === 0, 0.6) });
    tp.set(evs, len);
    tp.bpm = S.bpm; tp.loop = S.loop;
    tp.start();
    playBtn.classList.add('on'); playBtn.querySelector('span').textContent = 'Berhenti';
  }
  function stop() { tp.stop(); }
  root.stopAll = stop;

  function drawInfo(sc, names, rpc) {
    const steps = sc.iv.map((x, i) => { const d = (sc.iv[i + 1] ?? 12) - x; return d === 1 ? '½' : d === 2 ? '1' : d === 3 ? '1½' : d === 4 ? '2' : d; });
    const chords = scaleChords(S.key, sc.iv);
    info.innerHTML = '';
    info.append(
      h('h3', {}, `${pretty(S.key)} ${sc.name}`),
      h('div', { class: 'sc-notes' }, ...names.map((n, i) => h('button', { type: 'button', class: 'pill' + (i === 0 ? ' root' : ''), onclick: () => pluck(48 + rpc + mod12(pcOf(n) - rpc), 0, { dur: 0.8 }) }, h('b', {}, pretty(n)), h('small', {}, pretty(intervalName(sc.iv[i], sc.iv)))))),
      h('p', { class: 'muted' }, 'Jarak: ' + steps.join(' – ')),
      h('dl', { class: 'kv' },
        h('dt', {}, 'Karakter'), h('dd', {}, sc.mood),
        h('dt', {}, 'Genre'), h('dd', {}, sc.genre),
        h('dt', {}, 'Tips'), h('dd', {}, sc.tip)),
    );
    if (chords.length) {
      const row = h('div', { class: 'sc-chords' });
      for (const c of chords) {
        const v = bestVoicing(c.seventh.replace('m(maj7)', 'm').replace('maj7#5', 'aug')) || bestVoicing(c.triad);
        row.append(h('button', { type: 'button', class: 'chip', onclick: () => v && strum(v.midi.filter((m) => m != null), 0, { vel: 0.6, ring: true }) }, h('small', {}, c.rn), h('b', {}, pretty(c.triad)), h('i', {}, pretty(c.seventh))));
      }
      info.append(h('h4', {}, 'Akor yang dibentuk scale ini'), row);
    }
  }

  root.append(
    h('div', { class: 'page-head' }, h('h1', {}, 'Pola Scale'), h('p', {}, 'Bentuk scale di fretboard per posisi, lengkap dengan interval dan penjarian. Pentatonik memakai 5 box klasik, scale 7 nada memakai pola 3 nada per senar.')),
    h('div', { class: 'card' },
      h('div', { class: 'controls' }, field('Kunci dasar', keySel), field('Scale', scSel), field('Label', lblSeg)),
      posBox,
      fbWrap,
      h('div', { class: 'legend' }, h('span', { class: 'lg root' }, 'Root'), h('span', { class: 'lg' }, 'Nada scale'), h('span', { class: 'lg blue' }, 'Blue note / nada tambahan'), h('span', { class: 'muted' }, 'Ketuk fretboard untuk membunyikan nada.')),
    ),
    h('div', { class: 'card' },
      h('div', { class: 'controls' }, field('Pola latihan', seqSel), field('Ketukan', subSel), field('Tempo', h('div', { class: 'range' }, bpmIn, bpmOut)), metroChk, playBtn),
      tabWrap),
    info,
  );
  render();
}

export { noteName, useFlats, QUAL };
