// Halaman melodi: daftar lagu/lick/latihan, tab, fretboard scale, playback lead + iringan.
import { STD, parsePitch, pcOf, mod12, scaleById, spellScale, intervalName, pretty, noteName } from './music.js?v=20261030111205';
import { pluck, strum, drum, click, Transport, setLeadTone, getLeadTone, setVolume } from './audio.js?v=20261030111205';
import { h, btn, select, seg, field, store, fretboard, tabView, icon } from './ui.js?v=20261030111205';
import { bestVoicing } from './chorddata.js?v=20261030111205';
import { SONGS, CATS } from './songdata.js?v=20261030111205';
import { scalePositions } from './scales.js?v=20261030111205';

const MODS = /^(.+?)(?::([\d.]+))?([hpsbq~m]*)$/;
const snap = (d) => (Math.abs(d * 3 - Math.round(d * 3)) < 0.02 ? Math.round(d * 3) / 3 : d);

export function parseMelody(src) {
  const out = []; let beat = 0;
  for (const tok of src.split(/\s+/).filter((t) => t && t !== '|')) {
    const m = MODS.exec(tok);
    if (!m) throw new Error('token: ' + tok);
    const dur = m[2] ? snap(Number(m[2])) : 1;
    const mods = m[3] || '';
    if (m[1] !== 'r') {
      const parts = m[1].split('+').map((p) => {
        if (p.includes('/')) { const [sn, f] = p.split('/').map(Number); const s = 6 - sn; return { s, f, midi: STD[s] + f, fixed: true }; }
        return { midi: parsePitch(p) };
      });
      out.push({ beat, dur, parts, mods });
    }
    beat += dur;
  }
  return { notes: out, length: beat };
}

export function parseChords(src) {
  const out = []; let beat = 0;
  for (const tok of (src || '').split(/\s+/).filter(Boolean)) {
    const [name, d] = tok.split(':');
    const dur = Number(d || 4);
    out.push({ beat, dur, name });
    beat += dur;
  }
  return { list: out, length: beat };
}

// Penempatan nada ke senar/fret dengan DP (minim perpindahan tangan).
export function mapPositions(notes, pos = 0) {
  const lo = pos, hi = pos + 4;
  const cands = notes.map((n) => {
    const p = n.parts[0];
    if (p.fixed) return [{ s: p.s, f: p.f }];
    const list = [];
    for (let s = 0; s < 6; s++) { const f = p.midi - STD[s]; if (f >= 0 && f <= 17) list.push({ s, f }); }
    return list.length ? list : [{ s: 0, f: Math.max(0, p.midi - STD[0]) }];
  });
  const winCost = (f) => (f === 0 && lo <= 2 ? 0.2 : f < lo ? (lo - f) * 2 : f > hi ? (f - hi) * 2 : 0);
  const cost = cands.map((c) => c.map((x) => winCost(x.f)));
  const back = cands.map((c) => c.map(() => 0));
  for (let i = 1; i < cands.length; i++) {
    const legato = /[hps]/.test(notes[i].mods);
    for (let j = 0; j < cands[i].length; j++) {
      let best = Infinity, bk = 0;
      for (let k = 0; k < cands[i - 1].length; k++) {
        const a = cands[i - 1][k], b = cands[i][j];
        const fa = a.f || (lo || 1), fb = b.f || (lo || 1);
        let t = cost[i - 1][k] + Math.abs(fa - fb) * 0.45 + Math.abs(a.s - b.s) * 0.15;
        if (legato && a.s !== b.s) t += 4;
        if (t < best) { best = t; bk = k; }
      }
      cost[i][j] += best; back[i][j] = bk;
    }
  }
  const res = new Array(cands.length);
  if (!cands.length) return res;
  let j = cost[cost.length - 1].indexOf(Math.min(...cost[cost.length - 1]));
  for (let i = cands.length - 1; i >= 0; i--) { res[i] = cands[i][j]; j = back[i][j]; }
  return res;
}

export function buildSong(song) {
  const { notes, length } = parseMelody(song.mel);
  const pos = mapPositions(notes, song.pos ?? 0);
  notes.forEach((n, i) => {
    n.s = pos[i].s; n.f = pos[i].f; n.midi = n.parts[0].midi; n.key = i;
    // nada tambahan (double stop / bass) di senar lain
    n.extra = n.parts.slice(1).map((p) => {
      if (p.fixed) return p;
      const used = new Set([n.s]);
      let best = null;
      for (let s = 0; s < 6; s++) { const f = p.midi - STD[s]; if (f >= 0 && f <= 17 && !used.has(s)) { const d = Math.abs(f - n.f); if (!best || d < best.d) best = { s, f, d, midi: p.midi }; } }
      return best || { s: 0, f: 0, midi: p.midi };
    });
    n.tech = n.mods.includes('h') ? 'h' : n.mods.includes('p') ? 'p' : n.mods.includes('s') ? '/' : '';
    n.tail = (n.mods.includes('b') ? 'b' : n.mods.includes('q') ? 'q' : '') + (n.mods.includes('~') ? '~' : '');
  });
  const ch = parseChords(song.chords);
  const total = Math.max(length, ch.length);
  return { notes, length: total, chords: ch.list };
}

// ---------- Iringan ----------
function voicing(name) { return bestVoicing(name); }
function bassOf(name) {
  const m = /^([A-G][#b]?)/.exec(name); const pc = pcOf(m[1]);
  return 28 + mod12(pc - 4); // E1..D#2
}
function swingBeat(b, on) { if (!on) return b; const i = Math.floor(b + 1e-6), fr = b - i; return Math.abs(fr - 0.5) < 1e-3 ? i + 2 / 3 : b; }

function backingEvents(song, chords, opt) {
  const ev = [];
  const sw = (b) => swingBeat(b, song.swing);
  for (const c of chords) {
    const v = voicing(c.name); if (!v) continue;
    const notes = v.midi.filter((m) => m != null);
    const upper = notes.slice(-4);
    const bass = bassOf(c.name);
    const low = notes[0];
    const add = (rel, fn) => { if (rel < c.dur - 1e-6) ev.push({ beat: sw(c.beat + rel), fn }); };
    const bars = Math.max(1, c.dur);
    const st = song.style;
    for (let b = 0; b < bars; b += 1) {
      const inBar = (c.beat + b) % song.ts;
      if (st === 'strum') {
        if (song.ts === 4 || song.ts === 2) {
          if (b === 0 || inBar === 0 || inBar === 2) add(b, (t, e, spb) => { if (opt.back) strum(notes, t, { vel: 0.5, dur: spb * 0.95 }); if (opt.bass) pluck(bass, t, { bus: 'bass', vel: 0.7, dur: spb * 0.9 }); });
          else add(b, (t, e, spb) => opt.back && strum(notes, t, { vel: 0.35, dur: spb * 0.45 }));
          add(b + 0.5, (t, e, spb) => opt.back && strum(upper, t, { dir: 'up', vel: 0.32, dur: spb * 0.45 }));
        } else add(b, (t, e, spb) => opt.back && strum(notes, t, { vel: inBar === 0 ? 0.5 : 0.32, dur: spb * 0.9 }));
      } else if (st === 'waltz') {
        add(b, (t, e, spb) => {
          if (inBar === 0) { if (opt.bass) pluck(bass + 12, t, { bus: 'bass', vel: 0.6, dur: spb * 2.5 }); if (opt.back) pluck(low, t, { bus: 'back', vel: 0.5, dur: spb * 0.9 }); }
          else if (opt.back) strum(upper, t, { vel: 0.3, dur: spb * 0.8, spread: 0.008 });
        });
      } else if (st === 'arp3' || st === 'ballad') {
        const pat = st === 'arp3' ? [low, ...upper.slice(-3), upper.slice(-2)[0], upper.slice(-3)[0]] : [low, upper.slice(-3)[0], upper.slice(-2)[0], upper.slice(-3)[0], upper.slice(-1)[0], upper.slice(-3)[0], upper.slice(-2)[0], upper.slice(-3)[0]];
        const per = st === 'arp3' ? 2 : 2; // 1/8
        for (let k = 0; k < per; k++) {
          add(b + k / per, (t, e, spb) => {
            const idx = Math.round((inBar + k / per) * 2) % pat.length;
            if (opt.back) pluck(pat[idx], t, { bus: 'back', vel: idx === 0 ? 0.55 : 0.4, ring: true, dur: spb * 1.6 });
            if (opt.bass && idx === 0) pluck(bass + 12, t, { bus: 'bass', vel: 0.45, dur: spb * song.ts * 0.9 });
          });
        }
      } else if (st === 'rock') {
        const pw = [bass + 12, bass + 19, bass + 24];
        for (let k = 0; k < 2; k++) add(b + k / 2, (t, e, spb) => { if (opt.back) strum(pw, t, { vel: 0.45, dur: spb * 0.4, mute: false, spread: 0.006 }); if (opt.bass) pluck(bass, t, { bus: 'bass', vel: 0.6, dur: spb * 0.45 }); });
      } else if (st === 'shuffle') {
        const r = bass + 12;
        const line = [r, r + 7, r, r + 9];
        for (let k = 0; k < 2; k++) add(b + k / 2, (t, e, spb) => {
          const idx = Math.floor((inBar % 2) * 2 + k) % 4;
          if (opt.back) strum([r, line[idx] === r ? r + 7 : line[idx]], t, { vel: 0.42, dur: spb * 0.42, spread: 0.005 });
          if (opt.bass && k === 0) pluck(bass + (inBar % 2 ? 7 : 0), t, { bus: 'bass', vel: 0.65, dur: spb * 0.8 });
        });
      } else if (st === 'funk') {
        for (let k = 0; k < 4; k++) add(b + k / 4, (t, e, spb) => {
          const accent = k === 0 && inBar % 2 === 0 || k === 2 && inBar % 2 === 1;
          if (opt.back) strum(upper, t, { dir: k % 2 ? 'up' : 'down', vel: accent ? 0.45 : 0.18, dur: accent ? spb * 0.22 : spb * 0.08, mute: !accent, spread: 0.004 });
          if (opt.bass && (k === 0 || (k === 3 && inBar % 2 === 1))) pluck(bass + (k === 3 ? 12 : 0), t, { bus: 'bass', vel: 0.7, dur: spb * 0.3 });
        });
      } else if (st === 'country') {
        add(b, (t, e, spb) => { if (opt.bass) pluck(inBar % 2 ? bass + 7 : bass, t, { bus: 'bass', vel: 0.65, dur: spb * 0.8 }); if (opt.back) pluck(inBar % 2 ? low + 7 : low, t, { bus: 'back', vel: 0.45, dur: spb * 0.6 }); });
        add(b + 0.5, (t, e, spb) => opt.back && strum(upper, t, { vel: 0.3, dur: spb * 0.3, spread: 0.006 }));
      } else if (st === 'jazz') {
        // walking bass + comping di ketukan 2 & 4
        const r = bass; const walk = [r, r + 4, r + 7, r + 6];
        add(b, (t, e, spb) => { if (opt.bass) pluck(walk[inBar % 4] + 12, t, { bus: 'bass', vel: 0.6, dur: spb * 0.9 }); if (opt.back && inBar % 2 === 1) strum(upper, t, { vel: 0.35, dur: spb * 0.5, spread: 0.006 }); });
      }
      if (song.drums) {
        const swing = song.swing;
        add(b, (t) => { if (!opt.drums) return; drum(inBar % 2 === 0 ? 'kick' : 'snare', t, 0.9); drum('hat', t, 0.7); });
        if (st === 'funk') { add(b + 0.25, (t) => opt.drums && drum('hat', t, 0.35)); add(b + 0.75, (t) => opt.drums && drum('hat', t, 0.35)); }
        add(b + 0.5, (t) => opt.drums && drum('hat', t, swing ? 0.4 : 0.5));
        if (st === 'rock' && inBar % 4 === 3) add(b + 0.5, (t) => opt.drums && drum('kick', t, 0.7));
      }
    }
  }
  return ev;
}

export function initSongs(root, { onScale } = {}) {
  const S = { id: store.get('song.id', 'twinkle'), cat: store.get('song.cat', 'lagu'), tempo: 100, loop: false, lead: true, back: true, bass: true, drums: true, metro: false, count: true, tone: store.get('song.tone', 'steel') };
  const tp = new Transport();
  let built = null, fb = null, tab = null;
  setLeadTone(S.tone);

  const list = h('div', { class: 'song-list' });
  const catSeg = seg(CATS.map((c) => ({ value: c.id, label: c.name })), S.cat, (v) => { S.cat = v; store.set('song.cat', v); drawList(); });
  const head = h('div', { class: 'song-head' });
  const fbWrap = h('div', { class: 'fb-wrap' });
  const tabWrap = h('div', { class: 'tab-wrap tall' });
  const noteBox = h('div', { class: 'song-note' });
  const nowChord = h('div', { class: 'now-chord' }, '–');
  const playBtn = btn('Putar', 'play', () => (tp.playing ? tp.stop() : play()), 'primary');
  const tempoIn = h('input', { type: 'range', min: 40, max: 130, value: 100, oninput: (e) => { S.tempo = Number(e.target.value); tempoOut.textContent = S.tempo + '%'; if (built) tp.setBpm(curSong().bpm * S.tempo / 100); } });
  const tempoOut = h('output', {}, '100%');
  const toneSel = select([{ value: 'steel', label: 'Akustik steel' }, { value: 'nylon', label: 'Klasik nylon' }, { value: 'drive', label: 'Elektrik overdrive' }], S.tone, (v) => { S.tone = v; store.set('song.tone', v); setLeadTone(v); });
  const toggle = (key, label) => h('label', { class: 'chk' }, h('input', { type: 'checkbox', checked: S[key], onchange: (e) => { S[key] = e.target.checked; if (key === 'loop') tp.loop = S.loop; } }), label);

  tp.onStop = () => { playBtn.classList.remove('on'); playBtn.querySelector('span').textContent = 'Putar'; fb?.flash(null); tab?.clear(); nowChord.textContent = '–'; };

  const curSong = () => SONGS.find((s) => s.id === S.id) || SONGS[0];

  function drawList() {
    list.innerHTML = '';
    for (const s of SONGS.filter((x) => x.cat === S.cat)) {
      const sc = scaleById(s.scale);
      list.append(h('button', { type: 'button', class: 'song-item' + (s.id === S.id ? ' on' : ''), onclick: () => { S.id = s.id; store.set('song.id', s.id); tp.stop(); drawList(); load(); } },
        h('b', {}, s.title), h('small', {}, s.by), h('span', { class: 'tags' }, h('i', {}, pretty(s.key) + ' ' + sc.name), h('i', { class: 'lvl l' + s.lvl }, ['', 'Dasar', 'Menengah', 'Lanjut'][s.lvl]))));
    }
  }

  function load() {
    const song = curSong();
    built = buildSong(song);
    const sc = scaleById(song.scale);
    const rpc = pcOf(song.key);
    const names = spellScale(song.key, sc.iv);
    const nameOf = new Map(sc.iv.map((x, i) => [mod12(rpc + x), names[i]]));
    head.innerHTML = '';
    head.append(
      h('div', {}, h('h2', {}, song.title), h('p', { class: 'muted' }, song.by)),
      h('div', { class: 'song-meta' },
        h('span', {}, h('small', {}, 'Kunci'), h('b', {}, pretty(song.key))),
        h('span', {}, h('small', {}, 'Scale'), h('b', {}, sc.name)),
        h('span', {}, h('small', {}, 'Tempo'), h('b', {}, song.bpm + ' BPM')),
        h('span', {}, h('small', {}, 'Birama'), h('b', {}, song.ts === 3 ? '3/4' : '4/4')),
        h('button', { type: 'button', class: 'btn ghost', onclick: () => onScale?.(song.key, song.scale), html: icon('scale') + '<span>Buka pola scale</span>' })),
    );
    noteBox.textContent = song.note || '';

    // fretboard: nada scale di area melodi + nada melodi
    const fr = built.notes.flatMap((n) => [n, ...n.extra]).map((n) => n.f);
    const lo = Math.max(0, Math.min(...fr) - 1), hiF = Math.min(17, Math.max(...fr) + 1);
    const marks = [];
    const seen = new Set();
    for (let s = 0; s < 6; s++) for (let f = lo; f <= hiF; f++) {
      const pc = mod12(STD[s] + f);
      if (nameOf.has(pc)) { marks.push({ s, f, label: nameOf.get(pc), cls: mod12(pc - rpc) === 0 ? 'root faint' : 'faint' }); seen.add(`${s}:${f}`); }
    }
    for (const n of built.notes.flatMap((x) => [x, ...x.extra])) {
      const k = `${n.s}:${n.f}`; if (seen.has(k)) continue; seen.add(k);
      const pc = mod12(STD[n.s] + n.f);
      marks.push({ s: n.s, f: n.f, label: noteName(pc, /b/.test(song.key) || song.key === 'F'), cls: 'out' });
    }
    fb = fretboard({ frets: Math.max(12, hiF + 1), marks, labels: ['E', 'A', 'D', 'G', 'B', 'e'], onclick: (s, f) => pluck(STD[s] + f, 0, { dur: 0.9 }) });
    fbWrap.innerHTML = ''; fbWrap.append(fb);

    const tabNotes = built.notes.flatMap((n) => [{ beat: n.beat, dur: n.dur, s: n.s, f: (n.tech === '/' ? '/' : n.tech) + n.f, tech: n.tail, key: n.key }, ...n.extra.map((x) => ({ beat: n.beat, dur: n.dur, s: x.s, f: x.f, key: n.key }))]);
    const bpl = Math.max(1, Math.min(6, Math.floor(((tabWrap.clientWidth || 700) - 30) / (44 * song.ts + 10))));
    tab = tabView(tabNotes, { beatsPerBar: song.ts, barsPerLine: bpl, totalBeats: built.length, chords: built.chords });
    tabWrap.innerHTML = ''; tabWrap.append(tab);
    tempoIn.value = S.tempo;
    S.metro = !!song.metro; metroT.querySelector('input').checked = S.metro;
  }

  function play(from = 0) {
    const song = curSong();
    const opt = S;
    const evs = [];
    const lead = song.ts * (S.count ? 1 : 0);
    const off = lead;
    const sw = (b) => swingBeat(b, song.swing);
    for (const n of built.notes) {
      const bend = n.mods.includes('b') ? 2 : n.mods.includes('q') ? 1 : 0;
      const prev = built.notes[n.key - 1];
      evs.push({
        beat: off + sw(n.beat),
        fn: (t, e, spb) => {
          if (!S.lead) return;
          const dur = n.dur * spb * 0.98;
          const o = { dur, vel: 0.85, bend, vib: n.mods.includes('~'), soft: /[hp]/.test(n.mods), slideFrom: n.mods.includes('s') && prev ? prev.midi : null };
          if (n.mods.includes('m')) Object.assign(o, { dur: Math.min(dur, 0.16), vel: 0.7 });
          if (/[hps]/.test(n.mods) && prev) o.soft = true;
          pluck(n.midi, t, o);
          for (const x of n.extra) pluck(x.midi, t, { dur, vel: 0.6 });
        },
        ui: () => { fb.flash(`${n.s}:${n.f}`); tab.flash(n.key); },
      });
    }
    for (const e of backingEvents(song, built.chords, opt)) evs.push({ ...e, beat: e.beat + off });
    for (const c of built.chords) evs.push({ beat: off + c.beat, ui: () => { nowChord.textContent = pretty(c.name); } });
    if (S.count && off) for (let b = 0; b < lead; b++) evs.push({ beat: b, fn: (t) => click(t, b === 0, 0.8), ui: () => { nowChord.textContent = String(b + 1); } });
    for (let b = 0; b < built.length; b++) evs.push({ beat: off + b, fn: (t) => S.metro && click(t, b % song.ts === 0, 0.5) });
    tp.set(evs, off + built.length);
    tp.bpm = song.bpm * S.tempo / 100; tp.loop = S.loop;
    tp.start(from);
    playBtn.classList.add('on'); playBtn.querySelector('span').textContent = 'Berhenti';
  }
  root.stopAll = () => tp.stop();
  root.select = (id) => { const s = SONGS.find((x) => x.id === id); if (!s) return; S.id = id; S.cat = s.cat; catSeg.set(s.cat); drawList(); load(); };

  const metroT = toggle('metro', 'Metronom');
  root.append(
    h('div', { class: 'page-head' }, h('h1', {}, 'Melodi & Lick'), h('p', {}, 'Melodi terkenal dan lick bergaya genre populer, masing-masing dengan scale yang dipakai, tab, dan playback. Matikan suara melodi untuk berlatih bersama iringan.')),
    h('div', { class: 'song-grid' },
      h('aside', { class: 'card song-side' }, catSeg, list),
      h('section', { class: 'song-main' },
        h('div', { class: 'card' }, head, noteBox),
        h('div', { class: 'card player' },
          h('div', { class: 'controls' }, playBtn, nowChord, field('Tempo', h('div', { class: 'range' }, tempoIn, tempoOut)), field('Suara lead', toneSel)),
          h('div', { class: 'toggles' }, toggle('lead', 'Melodi'), toggle('back', 'Gitar iringan'), toggle('bass', 'Bass'), toggle('drums', 'Drum'), metroT, toggle('count', 'Hitungan awal'), toggle('loop', 'Ulangi')),
          h('p', { class: 'muted tab-legend' }, 'Notasi tab: h hammer-on · p pull-off · / slide · b bend 1 nada · q bend ½ nada · ~ vibrato. Garis bawah = senar 6 (E rendah).'),
          tabWrap),
        h('div', { class: 'card' }, h('div', { class: 'tab-head' }, h('b', {}, 'Scale di fretboard'), h('span', { class: 'muted' }, 'Nada redup = nada scale di area melodi, kuning = nada di luar scale. Titik menyala mengikuti melodi.')), fbWrap),
      )),
  );
  drawList(); load();
  void setVolume; void getLeadTone; void intervalName;
}
