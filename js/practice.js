// Latihan: metronom, latihan pendengaran (interval/akor), kuis nada fretboard.
import { STD, mod12, noteName, pretty, QUAL } from './music.js?v=20261031142813';
import { click, pluck, strum, Transport, now } from './audio.js?v=20261031142813';
import { h, btn, select, seg, field, store, fretboard } from './ui.js?v=20261031142813';

export function initPractice(root) {
  const S = { tab: store.get('pr.tab', 'metro') };
  const body = h('div', {});
  const tabs = seg([{ value: 'metro', label: 'Metronom' }, { value: 'ear', label: 'Latih pendengaran' }, { value: 'quiz', label: 'Hafal fretboard' }], S.tab, (v) => { S.tab = v; store.set('pr.tab', v); stopAll(); draw(); });
  let stopFns = [];
  const stopAll = () => { stopFns.forEach((f) => f()); stopFns = []; };
  root.stopAll = stopAll;
  function draw() { body.innerHTML = ''; ({ metro, ear, quiz })[S.tab](); }

  // ---------- Metronom ----------
  function metro() {
    const M = { bpm: store.get('mt.bpm', 90), beats: store.get('mt.beats', 4), sub: store.get('mt.sub', 1), accent: true, trainer: false, step: 4, every: 4, max: 160 };
    const tp = new Transport();
    stopFns.push(() => tp.stop());
    const bpmBig = h('div', { class: 'mt-bpm' }, String(M.bpm));
    const tempoName = h('div', { class: 'muted mt-name' });
    const pend = h('div', { class: 'mt-pend', html: '<svg viewBox="0 0 200 220"><path class="mt-body" d="M60 210 L140 210 L118 20 L82 20 Z"/><g class="mt-arm"><line x1="100" y1="190" x2="100" y2="40"/><rect x="90" y="80" width="20" height="16" rx="3"/></g><circle cx="100" cy="190" r="6" class="mt-hub"/></svg>' });
    const dots = h('div', { class: 'mt-dots' });
    const slider = h('input', { type: 'range', min: 30, max: 240, value: M.bpm, oninput: (e) => setBpm(Number(e.target.value)) });
    const playB = btn('Mulai', 'play', () => (tp.playing ? tp.stop() : start()), 'primary big');
    let taps = [];
    const tapB = btn('Tap tempo', 'tap', () => {
      const t = performance.now(); taps = taps.filter((x) => t - x < 2500); taps.push(t);
      if (taps.length >= 2) { const d = (taps[taps.length - 1] - taps[0]) / (taps.length - 1); setBpm(Math.round(60000 / d)); }
    });
    const names = [[40, 'Grave'], [60, 'Largo'], [66, 'Larghetto'], [76, 'Adagio'], [108, 'Andante'], [120, 'Moderato'], [156, 'Allegro'], [176, 'Vivace'], [200, 'Presto'], [999, 'Prestissimo']];
    function setBpm(b) {
      M.bpm = Math.max(30, Math.min(240, b)); store.set('mt.bpm', M.bpm);
      bpmBig.textContent = M.bpm; slider.value = M.bpm; tp.setBpm(M.bpm);
      tempoName.textContent = names.find(([x]) => M.bpm < x)[1];
    }
    function drawDots() { dots.innerHTML = ''; for (let i = 0; i < M.beats; i++) dots.append(h('span', { class: i === 0 && M.accent ? 'acc' : '' })); }
    let swing = 1, barCount = 0;
    function start() {
      const evs = [];
      for (let b = 0; b < M.beats; b++) {
        evs.push({ beat: b, fn: (t) => click(t, b === 0 && M.accent, 1), ui: () => {
          [...dots.children].forEach((d, i) => d.classList.toggle('on', i === b));
          swing = -swing; pend.style.setProperty('--dur', (60 / M.bpm) + 's'); pend.classList.toggle('r', swing > 0);
          if (b === 0) { barCount++; if (M.trainer && barCount > 1 && (barCount - 1) % M.every === 0 && M.bpm < M.max) setBpm(Math.min(M.max, M.bpm + M.step)); }
        } });
        for (let s = 1; s < M.sub; s++) evs.push({ beat: b + s / M.sub, fn: (t) => click(t, false, 0.35) });
      }
      tp.set(evs, M.beats); tp.bpm = M.bpm; tp.loop = true; barCount = 0; tp.start();
      playB.classList.add('on'); playB.querySelector('span').textContent = 'Berhenti';
    }
    tp.onStop = () => { playB.classList.remove('on'); playB.querySelector('span').textContent = 'Mulai'; [...dots.children].forEach((d) => d.classList.remove('on')); };
    const restart = () => { drawDots(); if (tp.playing) start(); };
    const beatsSel = select([2, 3, 4, 5, 6, 7].map((n) => ({ value: n, label: n + ' ketuk' })), M.beats, (v) => { M.beats = Number(v); store.set('mt.beats', M.beats); restart(); });
    const subSel = select([{ value: 1, label: '1/4' }, { value: 2, label: '1/8' }, { value: 3, label: 'Triplet' }, { value: 4, label: '1/16' }], M.sub, (v) => { M.sub = Number(v); store.set('mt.sub', M.sub); restart(); });
    const acc = h('label', { class: 'chk' }, h('input', { type: 'checkbox', checked: true, onchange: (e) => { M.accent = e.target.checked; restart(); } }), 'Aksen ketuk 1');
    const trn = h('label', { class: 'chk' }, h('input', { type: 'checkbox', onchange: (e) => { M.trainer = e.target.checked; } }), 'Speed trainer');
    const stepIn = h('input', { type: 'number', value: M.step, min: 1, max: 20, oninput: (e) => { M.step = Number(e.target.value) || 1; } });
    const everyIn = h('input', { type: 'number', value: M.every, min: 1, max: 32, oninput: (e) => { M.every = Number(e.target.value) || 1; } });
    const maxIn = h('input', { type: 'number', value: M.max, min: 40, max: 240, oninput: (e) => { M.max = Number(e.target.value) || 240; } });
    body.append(h('div', { class: 'card mt' },
      h('div', { class: 'mt-top' }, pend, h('div', { class: 'mt-read' }, bpmBig, h('small', {}, 'BPM'), tempoName, dots)),
      h('div', { class: 'mt-adj' }, btn('−5', null, () => setBpm(M.bpm - 5)), btn('−1', null, () => setBpm(M.bpm - 1)), slider, btn('+1', null, () => setBpm(M.bpm + 1)), btn('+5', null, () => setBpm(M.bpm + 5))),
      h('div', { class: 'controls center' }, playB, tapB),
      h('div', { class: 'controls' }, field('Birama', beatsSel), field('Subdivisi', subSel), acc),
      h('div', { class: 'controls trainer' }, trn, field('Naik (BPM)', stepIn), field('Setiap (birama)', everyIn), field('Batas BPM', maxIn)),
    ));
    drawDots(); setBpm(M.bpm);
  }

  // ---------- Latihan pendengaran ----------
  function ear() {
    const IV = [['Prime / unison', 0], ['Sekon minor', 1], ['Sekon mayor', 2], ['Terts minor', 3], ['Terts mayor', 4], ['Kwart murni', 5], ['Tritone', 6], ['Kwint murni', 7], ['Sekst minor', 8], ['Sekst mayor', 9], ['Septim minor', 10], ['Septim mayor', 11], ['Oktaf', 12]];
    const SETS = {
      iv1: { name: 'Interval dasar', items: [3, 4, 5, 7, 12] },
      iv2: { name: 'Interval lengkap', items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
      ch1: { name: 'Akor mayor / minor', items: ['', 'm'] },
      ch2: { name: 'Akor 7an', items: ['', 'm', '7', 'maj7', 'm7'] },
      ch3: { name: 'Akor lanjut', items: ['', 'm', '7', 'maj7', 'm7', 'dim7', 'm7b5', 'aug', 'sus4', 'sus2'] },
    };
    const E = { set: store.get('ear.set', 'iv1'), mode: 'asc', q: null, score: store.get('ear.score', { ok: 0, n: 0 }), answered: false };
    const setSel = select(Object.entries(SETS).map(([k, v]) => ({ value: k, label: v.name })), E.set, (v) => { E.set = v; store.set('ear.set', v); next(false); });
    const modeSeg = seg([{ value: 'asc', label: 'Naik' }, { value: 'desc', label: 'Turun' }, { value: 'harm', label: 'Bersamaan' }], E.mode, (v) => { E.mode = v; });
    const answers = h('div', { class: 'ear-ans' });
    const fb = h('div', { class: 'ear-fb' }, 'Tekan Putar soal.');
    const scoreEl = h('div', { class: 'ear-score' });
    const isChord = () => E.set.startsWith('ch');
    const label = (x) => (isChord() ? (x === '' ? 'Mayor' : x === 'm' ? 'Minor' : pretty(x)) : IV.find((i) => i[1] === x)[0]);
    function drawScore() { scoreEl.textContent = `Benar ${E.score.ok} dari ${E.score.n}` + (E.score.n ? ` (${Math.round((E.score.ok / E.score.n) * 100)}%)` : ''); }
    function playQ() {
      if (!E.q) return;
      const { base, x } = E.q;
      if (isChord()) { strum(QUAL[x].iv.map((i) => base + i), 0, { vel: 0.6, ring: true, spread: 0.03 }); return; }
      const t = now();
      if (E.mode === 'harm') { pluck(base, t, { dur: 1.5 }); pluck(base + x, t, { dur: 1.5 }); }
      else if (E.mode === 'desc') { pluck(base + x, t, { dur: 0.8 }); pluck(base, t + 0.75, { dur: 1 }); }
      else { pluck(base, t, { dur: 0.8 }); pluck(base + x, t + 0.75, { dur: 1 }); }
    }
    function next(playNow = true) {
      const items = SETS[E.set].items;
      E.q = { x: items[Math.floor(Math.random() * items.length)], base: 48 + Math.floor(Math.random() * 12) };
      E.answered = false;
      answers.innerHTML = '';
      for (const it of items) answers.append(h('button', { type: 'button', class: 'btn', onclick: (e) => answer(it, e.currentTarget) }, label(it)));
      fb.textContent = playNow ? 'Dengarkan, lalu pilih jawaban.' : 'Tekan Ulangi untuk mendengar soal pertama.'; fb.className = 'ear-fb';
      if (playNow) playQ();
    }
    function answer(it, el) {
      if (!E.q || E.answered) return;
      E.answered = true;
      const ok = it === E.q.x;
      E.score.n++; if (ok) E.score.ok++; store.set('ear.score', E.score);
      el.classList.add(ok ? 'good' : 'bad');
      if (!ok) for (const b of answers.children) if (b.textContent === label(E.q.x)) b.classList.add('good');
      fb.textContent = ok ? 'Benar.' : `Belum tepat. Jawaban: ${label(E.q.x)}.`;
      fb.className = 'ear-fb ' + (ok ? 'good' : 'bad');
      drawScore();
      setTimeout(() => { if (E.answered && S.tab === 'ear') next(); }, ok ? 1100 : 2200);
    }
    body.append(h('div', { class: 'card ear' },
      h('div', { class: 'controls' }, field('Materi', setSel), field('Arah interval', modeSeg)),
      h('div', { class: 'controls center' }, btn('Soal baru', 'play', () => next(), 'primary'), btn('Ulangi', 'loop', playQ), btn('Reset skor', null, () => { E.score = { ok: 0, n: 0 }; store.set('ear.score', E.score); drawScore(); })),
      fb, answers, scoreEl,
      h('p', { class: 'muted' }, 'Lagu pengingat interval naik: terts mayor = awal "When the Saints", kwart = awal "Amazing Grace", kwint = "Twinkle Twinkle" (twin-kle ke twin-kle), oktaf = awal "Over the Rainbow".'),
    ));
    drawScore(); next(false);
  }

  // ---------- Kuis fretboard ----------
  function quiz() {
    const Q = { mode: 'name', maxF: store.get('qz.max', 12), strings: [0, 1, 2, 3, 4, 5], q: null, ok: 0, n: 0, streak: 0, t0: 0 };
    const modeSeg = seg([{ value: 'name', label: 'Sebutkan nada' }, { value: 'find', label: 'Cari di fretboard' }], Q.mode, (v) => { Q.mode = v; next(); });
    const maxSel = select([{ value: 5, label: 'Fret 0–5' }, { value: 7, label: 'Fret 0–7' }, { value: 12, label: 'Fret 0–12' }], Q.maxF, (v) => { Q.maxF = Number(v); store.set('qz.max', Q.maxF); next(); });
    const strBox = h('div', { class: 'seg wrap' });
    ['6 (E)', '5 (A)', '4 (D)', '3 (G)', '2 (B)', '1 (e)'].forEach((l, i) => strBox.append(h('button', { type: 'button', class: 'on', onclick: (e) => {
      const b = e.currentTarget; const on = !b.classList.contains('on');
      if (!on && Q.strings.length === 1) return;
      b.classList.toggle('on', on); Q.strings = on ? [...Q.strings, i].sort() : Q.strings.filter((s) => s !== i); next();
    } }, l)));
    const fbWrap = h('div', { class: 'fb-wrap' });
    const prompt = h('div', { class: 'qz-prompt' });
    const answers = h('div', { class: 'qz-ans' });
    const stat = h('div', { class: 'ear-score' });
    const drawStat = () => { stat.textContent = `Benar ${Q.ok}/${Q.n} · beruntun ${Q.streak}`; };
    function next() {
      const s = Q.strings[Math.floor(Math.random() * Q.strings.length)];
      const f = Math.floor(Math.random() * (Q.maxF + 1));
      Q.q = { s, f, pc: mod12(STD[s] + f) }; Q.t0 = performance.now();
      answers.innerHTML = '';
      if (Q.mode === 'name') {
        prompt.textContent = 'Nada apa ini?';
        fbWrap.innerHTML = ''; fbWrap.append(fretboard({ frets: Math.max(12, Q.maxF), marks: [{ s, f, label: '?', cls: 'hit' }], labels: ['E', 'A', 'D', 'G', 'B', 'e'] }));
        for (let pc = 0; pc < 12; pc++) answers.append(h('button', { type: 'button', class: 'btn', onclick: (e) => check(pc === Q.q.pc, e.currentTarget, pc) }, pretty(noteName(pc)) + (noteName(pc).includes('#') ? ' / ' + pretty(noteName(pc, true)) : '')));
      } else {
        prompt.innerHTML = ''; prompt.append('Ketuk nada ', h('b', {}, pretty(noteName(Q.q.pc))), ` di senar ${6 - s}`);
        fbWrap.innerHTML = '';
        fbWrap.append(fretboard({ frets: Math.max(12, Q.maxF), marks: [], labels: ['E', 'A', 'D', 'G', 'B', 'e'], onclick: (ss, ff) => {
          if (ss !== Q.q.s) return;
          const ok = mod12(STD[ss] + ff) === Q.q.pc;
          const fbEl = fretboard({ frets: Math.max(12, Q.maxF), marks: [{ s: ss, f: ff, label: noteName(mod12(STD[ss] + ff)), cls: ok ? 'good' : 'bad' }, ...(!ok ? [{ s: Q.q.s, f: Q.q.f, label: noteName(Q.q.pc), cls: 'good' }] : [])], labels: ['E', 'A', 'D', 'G', 'B', 'e'] });
          fbWrap.innerHTML = ''; fbWrap.append(fbEl);
          check(ok, null, null, ff);
        } }));
      }
    }
    function check(ok, el, pc, ff) {
      if (!Q.q || Q.q.done) return;
      Q.q.done = true;
      Q.n++; if (ok) { Q.ok++; Q.streak++; } else Q.streak = 0;
      pluck(STD[Q.q.s] + (ff ?? Q.q.f), 0, { dur: 0.7 });
      if (el) { el.classList.add(ok ? 'good' : 'bad'); if (!ok) [...answers.children][Q.q.pc].classList.add('good'); }
      const sec = ((performance.now() - Q.t0) / 1000).toFixed(1);
      prompt.textContent = ok ? `Benar (${sec} dtk).` : `Belum tepat: ${pretty(noteName(Q.q.pc))} di senar ${6 - Q.q.s} fret ${Q.q.f}.`;
      drawStat();
      setTimeout(() => S.tab === 'quiz' && next(), ok ? 900 : 2000);
      void pc;
    }
    body.append(h('div', { class: 'card qz' },
      h('div', { class: 'controls' }, field('Mode', modeSeg), field('Rentang', maxSel)),
      field('Senar yang diuji', strBox),
      prompt, fbWrap, answers, stat,
      h('p', { class: 'muted' }, 'Patokan cepat: fret 5 = nada senar berikutnya (kecuali senar 3 ke 2 di fret 4), fret 12 = oktaf senar terbuka, dan nada di fret 7 senar bawah sama dengan senar atasnya di fret 2.')));
    drawStat(); next();
  }

  root.append(
    h('div', { class: 'page-head' }, h('h1', {}, 'Latihan'), h('p', {}, 'Metronom dengan speed trainer, latihan mengenali interval dan akor lewat telinga, serta kuis menghafal nada di fretboard.')),
    h('div', { class: 'subtabs' }, tabs),
    body,
  );
  draw();
}
