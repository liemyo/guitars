// Kunci: kunci dasar, penjelajah variasi (dasar/menengah/lanjut), progresi, pola genjreng, capo & transpose.
import { ROOTS, QUAL, pcOf, mod12, noteName, useFlats, pretty, chordToneName, parseChord } from './music.js?v=20261031142813';
import { strum, pluck, click, drum, Transport } from './audio.js?v=20261031142813';
import { h, btn, select, seg, field, store, chordDiagram, icon } from './ui.js?v=20261031142813';
import { OPEN_CHORDS, voicingsFor, bestVoicing, QUALS_BY_LEVEL } from './chorddata.js?v=20261031142813';

const LVL = ['', 'Dasar', 'Menengah', 'Lanjut'];
const playV = (v, o = {}) => strum(v.midi.filter((m) => m != null), 0, { vel: 0.6, ring: true, spread: 0.02, ...o });

function card(v, { onClick, big = false, sub = null } = {}) {
  const rp = pcOf(v.root);
  const labels = v.midi.map((m) => (m == null ? null : chordToneName(rp, m, v.qual)));
  return h('button', { type: 'button', class: 'chord-card' + (big ? ' big' : ''), onclick: () => { playV(v); onClick?.(v); } },
    h('div', { class: 'cc-top' }, h('b', {}, pretty(v.name)), h('i', { class: 'lvl l' + v.lvl }, LVL[v.lvl])),
    chordDiagram(v, { labels }),
    h('small', {}, sub ?? v.label));
}

// ---------- Progresi ----------
const PROGS = [
  { id: 'pop', name: 'Pop  I – V – vi – IV', key: 'C', steps: ['I', 'V', 'vi', 'IV'] },
  { id: '50s', name: '50-an  I – vi – IV – V', key: 'G', steps: ['I', 'vi', 'IV', 'V'] },
  { id: 'canon', name: 'Canon  I – V – vi – iii – IV – I – IV – V', key: 'D', steps: ['I', 'V', 'vi', 'iii', 'IV', 'I', 'IV', 'V'] },
  { id: 'royal', name: 'Royal road  IV – V – iii – vi', key: 'C', steps: ['IV', 'V', 'iii', 'vi'] },
  { id: 'minor', name: 'Minor  i – bVI – bIII – bVII', key: 'A', steps: ['i', 'bVI', 'bIII', 'bVII'] },
  { id: 'andal', name: 'Andalusia  i – bVII – bVI – V', key: 'A', steps: ['i', 'bVII', 'bVI', 'V'] },
  { id: 'melayu', name: 'Melayu / dangdut  i – iv – V – i', key: 'D', steps: ['i', 'iv', 'V', 'i'] },
  { id: 'iiVI', name: 'Jazz  ii – V – I', key: 'C', steps: ['ii', 'V', 'I', 'I'] },
  { id: 'turn', name: 'Turnaround  I – vi – ii – V', key: 'F', steps: ['I', 'vi', 'ii', 'V'] },
  { id: 'blues', name: 'Blues 12 bar  I7 – IV7 – V7', key: 'E', steps: ['I7', 'IV7', 'I7', 'I7', 'IV7', 'IV7', 'I7', 'I7', 'V7', 'IV7', 'I7', 'V7'] },
];
const DEG = { I: 0, II: 2, III: 4, IV: 5, V: 7, VI: 9, VII: 11 };
export function resolveStep(step, key, lvl) {
  const m = /^(b|#)?(i{1,3}|iv|v|vi{0,2}|I{1,3}|IV|V|VI{0,2})(°|7|maj7)?$/.exec(step);
  if (!m) return null;
  const [, acc, rn, suf] = m;
  const off = DEG[rn.toUpperCase()] + (acc === 'b' ? -1 : acc === '#' ? 1 : 0);
  const minor = rn === rn.toLowerCase();
  const pc = mod12(pcOf(key) + off);
  const flats = useFlats(key) || acc === 'b' || ['F', 'Bb', 'Eb', 'Ab', 'Db'].includes(key);
  const root = noteName(pc, flats);
  let q;
  if (suf === '°') q = lvl === 1 ? 'dim' : 'm7b5';
  else if (suf === '7' || (rn === 'V' && !minor)) q = suf === '7' ? (lvl === 3 ? '9' : '7') : lvl === 1 ? '' : lvl === 2 ? '7' : '13';
  else if (minor) q = lvl === 1 ? 'm' : lvl === 2 ? 'm7' : 'm9';
  else q = lvl === 1 ? '' : lvl === 2 ? 'maj7' : (off === 0 ? '6/9' : 'maj9');
  return { root, qual: q, name: root + q, rn: step };
}
const avgFret = (v) => { const f = v.frets.filter((x) => x > 0); return f.length ? f.reduce((a, b) => a + b, 0) / f.length : 0; };
function pickVoicing(root, qual, lvl, prev) {
  const all = voicingsFor(root, qual);
  if (!all.length) return bestVoicing(root + qual);
  if (lvl === 1) return bestVoicing(root + qual) || all[0];
  const pool = all.filter((v) => v.lvl >= 2 || v.kind === 'open');
  const target = prev ? avgFret(prev) : 5;
  return pool.slice().sort((a, b) => Math.abs(avgFret(a) - target) - Math.abs(avgFret(b) - target) + (a.kind === 'open') * 0.5 - (b.kind === 'open') * 0.5)[0] || all[0];
}

// ---------- Pola genjreng ----------
export const STRUMS = [
  { id: 'basic', name: 'Dasar: 4 ketuk turun', per: 2, ts: 4, p: 'D-D-D-D-' },
  { id: 'pop', name: 'Pop: D - DU - UDU', per: 2, ts: 4, p: 'D-DU-UDU' },
  { id: 'folk', name: 'Folk: D - DU DU DU', per: 2, ts: 4, p: 'D-DUDUDU' },
  { id: 'rock', name: 'Rock: 8 ketuk turun', per: 2, ts: 4, p: 'DdDdDdDd' },
  { id: 'reggae', name: 'Reggae / ska: offbeat', per: 2, ts: 4, p: '-x-x-x-x' },
  { id: 'waltz', name: 'Waltz 3/4: D - DU DU', per: 2, ts: 3, p: 'D-DUDU' },
  { id: 'ballad', name: 'Ballad 6/8: D - - D U -', per: 2, ts: 3, p: 'D--DU-' },
  { id: 'funk', name: 'Funk 1/16: D x U x', per: 4, ts: 4, p: 'D-uxD-uxDxuxD-ux' },
  { id: 'dangdut', name: 'Dangdut: D - D U - U D -', per: 2, ts: 4, p: 'D-DU-UD-' },
];
function strumAt(ch, notes, t, spb, per) {
  const len = spb / per;
  const top = notes.slice(-4);
  switch (ch) {
    case 'D': strum(notes, t, { vel: 0.6, dur: len * 1.9 }); break;
    case 'd': strum(notes, t, { vel: 0.38, dur: len * 0.9 }); break;
    case 'U': strum(top, t, { dir: 'up', vel: 0.5, dur: len * 1.4 }); break;
    case 'u': strum(top, t, { dir: 'up', vel: 0.32, dur: len * 0.9 }); break;
    case 'x': strum(notes, t, { vel: 0.4, dur: 0.06, mute: true, spread: 0.006 }); break;
    default:
  }
}

export function initChords(root) {
  const S = { tab: store.get('ch.tab', 'dasar'), root: store.get('ch.root', 'C'), qual: store.get('ch.qual', ''), prog: 'pop', key: 'C', lvl: 1, strum: 'pop', bpm: 84, sChord: 'G', capoKey: 'F', capo: 0 };
  const body = h('div', {});
  const tabs = seg([{ value: 'dasar', label: 'Kunci dasar' }, { value: 'variasi', label: 'Variasi kunci' }, { value: 'progresi', label: 'Progresi' }, { value: 'genjreng', label: 'Pola genjreng' }, { value: 'capo', label: 'Capo & transpose' }], S.tab, (v) => { S.tab = v; store.set('ch.tab', v); tp.stop(); draw(); });
  const tp = new Transport();
  root.stopAll = () => tp.stop();

  function draw() {
    body.innerHTML = '';
    ({ dasar, variasi, progresi, genjreng, capo })[S.tab]();
  }

  function dasar() {
    const groups = [
      ['Mayor', (v) => v.qual === '' && !v.bass && v.lvl === 1],
      ['Minor', (v) => v.qual === 'm' && !v.bass],
      ['Dominan 7', (v) => v.qual === '7'],
      ['Minor 7 & Mayor 7', (v) => ['m7', 'maj7'].includes(v.qual)],
      ['Sus, add & power chord', (v) => ['sus2', 'sus4', 'add9', '5', '6'].includes(v.qual)],
      ['Variasi & slash chord', (v) => (v.qual === '' && (v.lvl === 2 || v.bass)) || (v.bass && v.qual)],
      ['Warna lanjut (posisi terbuka)', (v) => ['m9', '7#9'].includes(v.qual)],
    ];
    body.append(h('p', { class: 'muted' }, 'Ketuk diagram untuk mendengar. Angka di titik = jari (1 telunjuk, 2 tengah, 3 manis, 4 kelingking, T jempol). Angka di bawah = interval tiap senar.'));
    for (const [title, fn] of groups) {
      const list = OPEN_CHORDS.filter(fn);
      if (!list.length) continue;
      body.append(h('h3', {}, title), h('div', { class: 'chord-grid' }, ...list.map((v) => card(v))));
    }
    body.append(h('div', { class: 'card tips' }, h('h3', {}, 'Urutan belajar yang disarankan'), h('ol', {},
      h('li', {}, 'Em dan Am (dua jari dan tiga jari, paling mudah).'),
      h('li', {}, 'E, A, D lalu C dan G. Latih perpindahan G–C–D dan Am–Em.'),
      h('li', {}, 'E7, A7, D7, B7 untuk lagu blues dan pop lama.'),
      h('li', {}, 'F versi kecil (xx3211) sebelum F barre penuh.'),
      h('li', {}, 'Latihan satu menit: ganti antara dua kunci sebanyak mungkin; catat jumlahnya setiap hari.'))));
  }

  function variasi() {
    const rootSeg = seg(ROOTS.map((r) => ({ value: r, label: pretty(r) })), S.root, (v) => { S.root = v; store.set('ch.root', v); drawList(); });
    rootSeg.classList.add('wrap');
    const qualBox = h('div', { class: 'qual-box' });
    for (const g of QUALS_BY_LEVEL.slice(1)) {
      const row = h('div', { class: 'seg wrap' });
      for (const q of g.list) row.append(h('button', { type: 'button', 'data-q': q, class: q === S.qual ? 'on' : '', onclick: () => { S.qual = q; store.set('ch.qual', q); for (const b of qualBox.querySelectorAll('button')) b.classList.toggle('on', b.dataset.q === q); drawList(); } }, q === '' ? 'Mayor' : q === 'm' ? 'Minor' : pretty(q)));
      qualBox.append(h('div', { class: 'qual-row' }, h('small', {}, g.lvl === 2 ? 'Dasar & menengah' : 'Lanjut'), row));
    }
    const out = h('div', {});
    function drawList() {
      out.innerHTML = '';
      const list = voicingsFor(S.root, S.qual).sort((a, b) => a.lvl - b.lvl || avgFret(a) - avgFret(b));
      const q = QUAL[S.qual];
      const rp = pcOf(S.root);
      const tones = q.iv.map((i) => `${pretty(noteName(rp + i, useFlats(S.root)))} (${pretty(chordToneName(rp, rp + i, S.qual))})`);
      out.append(h('div', { class: 'chord-info' }, h('h3', {}, pretty(S.root + S.qual) + ' · ' + q.name), h('p', {}, 'Nada akor: ' + tones.join(', '))));
      if (!list.length) out.append(h('p', { class: 'muted' }, 'Belum ada bentuk untuk kombinasi ini.'));
      for (const lv of [1, 2, 3]) {
        const l = list.filter((v) => v.lvl === lv);
        if (l.length) out.append(h('h4', {}, LVL[lv]), h('div', { class: 'chord-grid' }, ...l.map((v) => card(v))));
      }
    }
    body.append(h('div', { class: 'card' }, field('Root', rootSeg), qualBox), out);
    drawList();
  }

  function progresi() {
    const P = () => PROGS.find((p) => p.id === S.prog);
    const progSel = select(PROGS.map((p) => ({ value: p.id, label: p.name })), S.prog, (v) => { S.prog = v; S.key = P().key; keySel.value = S.key; build(); });
    const keySel = select(ROOTS.map((r) => ({ value: r, label: pretty(r) })), S.key, (v) => { S.key = v; build(); });
    const lvlSeg = seg([{ value: 1, label: 'Dasar' }, { value: 2, label: 'Menengah' }, { value: 3, label: 'Lanjut' }], S.lvl, (v) => { S.lvl = Number(v); build(); });
    const strumSel = select(STRUMS.map((s) => ({ value: s.id, label: s.name })), S.strum, (v) => { S.strum = v; if (tp.playing) play(); });
    const bpm = h('input', { type: 'range', min: 50, max: 160, value: S.bpm, oninput: (e) => { S.bpm = Number(e.target.value); out.textContent = S.bpm + ' BPM'; tp.setBpm(S.bpm); } });
    const out = h('output', {}, S.bpm + ' BPM');
    const playB = btn('Putar', 'play', () => (tp.playing ? tp.stop() : play()), 'primary');
    tp.onStop = () => { playB.classList.remove('on'); playB.querySelector('span').textContent = 'Putar'; for (const c of grid.children) c.classList.remove('hit'); };
    const grid = h('div', { class: 'chord-grid prog' });
    const explain = h('p', { class: 'muted' });
    let seq = [];
    function build() {
      let prev = null;
      seq = P().steps.map((st) => { const r = resolveStep(st, S.key, S.lvl); const v = pickVoicing(r.root, r.qual, S.lvl, prev); prev = v; return { ...r, v }; });
      grid.innerHTML = '';
      seq.forEach((c) => { const el = card({ ...c.v, name: c.name }, { sub: c.rn }); grid.append(el); });
      explain.textContent = S.lvl === 1 ? 'Dasar: triad terbuka (mayor/minor).' : S.lvl === 2 ? 'Menengah: akor 7 dengan bentuk barre/geser, dipilih yang dekat satu sama lain.' : 'Lanjut: perluasan 9, 13, 6/9 untuk warna jazz/neo-soul.';
      if (tp.playing) play();
    }
    function play() {
      const pat = STRUMS.find((s) => s.id === S.strum);
      const barBeats = pat.ts;
      const evs = [];
      seq.forEach((c, i) => {
        const notes = c.v.midi.filter((m) => m != null);
        const b0 = i * barBeats;
        evs.push({ beat: b0, ui: () => { [...grid.children].forEach((el, k) => el.classList.toggle('hit', k === i)); } });
        [...pat.p].forEach((ch, k) => { if (ch !== '-') evs.push({ beat: b0 + k / pat.per, fn: (t, e, spb) => strumAt(ch, notes, t, spb, pat.per) }); });
        for (let b = 0; b < barBeats; b++) evs.push({ beat: b0 + b, fn: (t) => { click(t, b === 0, 0.35); if (b === 0) pluck(28 + mod12(pcOf(c.root) - 4), t, { bus: 'bass', vel: 0.6, dur: 60 / S.bpm * barBeats * 0.9 }); } });
      });
      tp.set(evs, seq.length * barBeats); tp.bpm = S.bpm; tp.loop = true; tp.start();
      playB.classList.add('on'); playB.querySelector('span').textContent = 'Berhenti';
    }
    body.append(h('div', { class: 'card' },
      h('div', { class: 'controls' }, field('Progresi', progSel), field('Kunci', keySel), field('Tingkat', lvlSeg)),
      h('div', { class: 'controls' }, field('Pola genjreng', strumSel), field('Tempo', h('div', { class: 'range' }, bpm, out)), playB),
      explain, grid));
    body.append(h('div', { class: 'card tips' }, h('h3', {}, 'Cara membaca angka Romawi'), h('p', {}, 'Huruf besar = akor mayor, huruf kecil = minor, ° = diminished. Angka menunjukkan derajat scale dari kunci yang dipilih, sehingga progresi yang sama bisa dipindah ke kunci mana saja. Contoh I – V – vi – IV di C = C – G – Am – F, di G = G – D – Em – C.')));
    build();
  }

  function genjreng() {
    const chordSel = select(['G', 'C', 'D', 'Em', 'Am', 'E', 'A', 'F'].map((c) => ({ value: c, label: c })), S.sChord, (v) => { S.sChord = v; });
    const bpm = h('input', { type: 'range', min: 50, max: 150, value: S.bpm, oninput: (e) => { S.bpm = Number(e.target.value); out.textContent = S.bpm + ' BPM'; tp.setBpm(S.bpm); } });
    const out = h('output', {}, S.bpm + ' BPM');
    const list = h('div', { class: 'strum-list' });
    let active = null;
    tp.onStop = () => { for (const el of list.querySelectorAll('.slot')) el.classList.remove('hit'); for (const b of list.querySelectorAll('.btn')) { b.classList.remove('on'); b.querySelector('span').textContent = 'Putar'; } active = null; };
    for (const p of STRUMS) {
      const row = h('div', { class: 'strum-row' });
      const slots = h('div', { class: 'slots', style: { '--n': p.p.length } });
      [...p.p].forEach((ch, k) => {
        const beatNo = k % p.per === 0 ? String(k / p.per + 1) : p.per === 4 ? ['', 'e', '&', 'a'][k % 4] : '&';
        slots.append(h('div', { class: 'slot ' + (ch === '-' ? 'rest' : ch === 'x' ? 'mute' : /[du]/.test(ch) ? 'soft' : '') }, h('span', { class: 'arrow' }, ch === 'D' || ch === 'd' ? '↓' : ch === 'U' || ch === 'u' ? '↑' : ch === 'x' ? '×' : ''), h('small', {}, beatNo)));
      });
      const b = btn('Putar', 'play', () => {
        if (active === p.id) { tp.stop(); return; }
        tp.stop(); active = p.id;
        const v = bestVoicing(S.sChord); const notes = v.midi.filter((m) => m != null);
        const evs = [];
        [...p.p].forEach((ch, k) => evs.push({ beat: k / p.per, fn: (t, e, spb) => strumAt(ch, notes, t, spb, p.per), ui: () => { [...slots.children].forEach((el, j) => el.classList.toggle('hit', j === k)); } }));
        for (let i = 0; i < p.ts; i++) evs.push({ beat: i, fn: (t) => { click(t, i === 0, 0.35); if (p.id === 'reggae' || p.id === 'dangdut') drum(i % 2 ? 'snare' : 'kick', t, 0.6); } });
        tp.set(evs, p.ts); tp.bpm = S.bpm; tp.loop = true; tp.start();
        b.classList.add('on'); b.querySelector('span').textContent = 'Berhenti';
      });
      row.append(h('div', { class: 'strum-name' }, h('b', {}, p.name), h('small', { class: 'muted' }, p.ts === 3 ? 'Birama 3' : 'Birama 4')), slots, b);
      list.append(row);
    }
    body.append(h('div', { class: 'card' }, h('div', { class: 'controls' }, field('Kunci', chordSel), field('Tempo', h('div', { class: 'range' }, bpm, out))),
      h('p', { class: 'muted' }, '↓ = genjreng turun, ↑ = naik, panah redup = pelan, × = chop/mute (tangan kiri melonggarkan tekanan). Tangan kanan tetap mengayun naik-turun walau tidak menyentuh senar.'), list));
  }

  function capo() {
    const keySel = select(ROOTS.map((r) => ({ value: r, label: pretty(r) })), S.capoKey, (v) => { S.capoKey = v; drawCapo(); });
    const tbl = h('div', { class: 'capo-table' });
    const EASY = ['C', 'G', 'D', 'A', 'E'];
    function drawCapo() {
      tbl.innerHTML = '';
      const kp = pcOf(S.capoKey);
      for (let c = 0; c <= 9; c++) {
        const shape = noteName(kp - c, false).replace('A#', 'Bb').replace('D#', 'Eb');
        const easy = EASY.includes(shape);
        tbl.append(h('div', { class: 'capo-cell' + (easy ? ' easy' : '') }, h('small', {}, c ? `Capo ${c}` : 'Tanpa capo'), h('b', {}, pretty(shape)), h('span', {}, easy ? 'bentuk mudah' : '')));
      }
    }
    const txt = h('textarea', { rows: 4, spellcheck: 'false' }, store.get('ch.trtext', 'Am F C G\nDm7 G7 Cmaj7 A7/C#'));
    const nIn = h('input', { type: 'number', value: 2, min: -11, max: 11, step: 1 });
    const res = h('pre', { class: 'tr-out' });
    const doTr = () => {
      store.set('ch.trtext', txt.value);
      const n = Number(nIn.value) || 0;
      const target = noteName(pcOf('C') + n);
      const fl = useFlats(target) || n < 0;
      res.textContent = txt.value.replace(/\b([A-G][#b]?)((?:maj|m|dim|aug|sus|add|[0-9#b])*)(?:\/([A-G][#b]?))?/g, (all, r, q, b) => {
        const nr = noteName(pcOf(r) + n, fl);
        return nr + (q || '') + (b ? '/' + noteName(pcOf(b) + n, fl) : '');
      });
    };
    txt.addEventListener('input', doTr); nIn.addEventListener('input', doTr);
    body.append(
      h('div', { class: 'card' }, h('h3', {}, 'Kalkulator capo'), h('p', { class: 'muted' }, 'Pilih kunci asli lagu. Tabel menunjukkan bentuk kunci yang dimainkan untuk tiap posisi capo; kotak hijau = bentuk terbuka yang mudah.'), field('Kunci lagu', keySel), tbl),
      h('div', { class: 'card' }, h('h3', {}, 'Transpose kunci'), h('div', { class: 'tr-grid' }, field('Teks kunci', txt), field('Geser (semitone)', nIn)), res),
    );
    drawCapo(); doTr();
  }

  root.append(
    h('div', { class: 'page-head' }, h('h1', {}, 'Kunci Gitar'), h('p', {}, 'Kunci dasar, variasi menengah dan lanjut untuk semua root, progresi populer, pola genjreng, serta capo dan transpose.')),
    h('div', { class: 'subtabs' }, tabs),
    body,
  );
  draw();
  void parseChord; void icon;
}
