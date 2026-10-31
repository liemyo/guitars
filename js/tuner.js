// Tuner mikrofon dengan jarum bergaya pendulum metronom.
import { TUNINGS, freqToMidi, midiToFreq, pitchLabel, noteName, pretty } from './music.js?v=20261031142813';
import { ac, tone } from './audio.js?v=20261031142813';
import { h, icon, btn, select, seg, store, field } from './ui.js?v=20261031142813';

const S = { tuning: store.get('tuning', 'std'), a4: store.get('a4', 440), mode: 'auto', target: 0, done: new Set() };

// YIN pitch detection (sinyal sudah di-downsample).
export function yin(x, sr, minF = 55, maxF = 1100) {
  const tauMin = Math.max(2, Math.floor(sr / maxF));
  const tauMax = Math.min(Math.floor(sr / minF), Math.floor(x.length / 2));
  const W = x.length - tauMax;
  const d = new Float32Array(tauMax + 1);
  for (let tau = 1; tau <= tauMax; tau++) {
    let sum = 0;
    for (let i = 0; i < W; i++) { const v = x[i] - x[i + tau]; sum += v * v; }
    d[tau] = sum;
  }
  let run = 0; d[0] = 1;
  for (let tau = 1; tau <= tauMax; tau++) { run += d[tau]; d[tau] = run ? (d[tau] * tau) / run : 1; }
  let tau = -1;
  for (let t = tauMin; t < tauMax; t++) {
    if (d[t] < 0.12) { while (t + 1 < tauMax && d[t + 1] < d[t]) t++; tau = t; break; }
  }
  if (tau < 0) {
    let best = 1;
    for (let t = tauMin; t < tauMax; t++) if (d[t] < best) { best = d[t]; tau = t; }
    if (best > 0.3) return null;
  }
  const a = d[tau - 1] ?? d[tau], b = d[tau], c = d[tau + 1] ?? d[tau];
  const den = a + c - 2 * b;
  const shift = den ? (a - c) / (2 * den) : 0;
  return { f: sr / (tau + shift), conf: 1 - b };
}

export function initTuner(root) {
  const tun = () => TUNINGS.find((t) => t.id === S.tuning) || TUNINGS[0];
  let stream = null, analyser = null, buf = null, raf = 0, srcNode = null, timer = 0;
  let needle = 0, vel = 0, target = 0, live = false, lastSeen = 0, inTuneSince = 0;
  const hist = [], readings = [];

  const gauge = h('div', { class: 'gauge', html: gaugeSvg() });
  const noteEl = h('div', { class: 'tn-note' }, '–');
  const hzEl = h('div', { class: 'tn-hz' }, 'Hz');
  const centsEl = h('div', { class: 'tn-cents' }, '0 cent');
  const hintEl = h('div', { class: 'tn-hint' }, 'Tekan Mulai, lalu petik satu senar.');
  const trace = h('canvas', { class: 'tn-trace', width: 600, height: 70 });
  const strRow = h('div', { class: 'tn-strings' });
  const micBtn = btn('Mulai tuner', 'mic', () => (stream ? stopMic() : startMic()), 'primary big');

  const tuningSel = select(TUNINGS.map((t) => ({ value: t.id, label: t.name })), S.tuning, (v) => { S.tuning = v; store.set('tuning', v); S.done.clear(); S.target = 0; drawStrings(); });
  const a4Sel = select([432, 435, 438, 440, 441, 442, 443, 444, 446].map((v) => ({ value: v, label: `A4 = ${v} Hz` })), S.a4, (v) => { S.a4 = Number(v); store.set('a4', S.a4); drawStrings(); });
  const modeSeg = seg([{ value: 'auto', label: 'Otomatis' }, { value: 'manual', label: 'Pilih senar' }], S.mode, (v) => { S.mode = v; drawStrings(); });

  function drawStrings() {
    const t = tun();
    strRow.innerHTML = '';
    const n = t.midi.length;
    t.midi.forEach((m, i) => {
      const num = n - i;
      const b = h('button', { type: 'button', class: 'tn-str' + (S.done.has(i) ? ' done' : '') + (S.mode === 'manual' && S.target === i ? ' on' : ''), onclick: () => { S.target = i; if (S.mode === 'auto') { S.mode = 'manual'; modeSeg.set('manual'); } tone(m); drawStrings(); } },
        h('span', { class: 'num' }, String(num)), h('b', {}, pretty(noteName(m, /b/.test(t.notes[i])))), h('small', {}, midiToFreq(m, S.a4).toFixed(1) + ' Hz'),
        h('i', { class: 'ok', html: icon('check') }));
      strRow.append(b);
    });
  }

  async function startMic() {
    try {
      const c = ac();
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      srcNode = c.createMediaStreamSource(stream);
      const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 45;
      analyser = c.createAnalyser(); analyser.fftSize = 4096;
      srcNode.connect(hp).connect(analyser);
      buf = new Float32Array(analyser.fftSize);
      micBtn.classList.add('on'); micBtn.querySelector('span').textContent = 'Hentikan';
      hintEl.textContent = 'Petik satu senar dan biarkan berbunyi.';
      root.classList.add('live');
      timer = setInterval(() => analyser && analyse(performance.now()), 45);
      loop();
    } catch (e) {
      hintEl.textContent = 'Mikrofon tidak bisa diakses. Izinkan akses mikrofon di browser lalu coba lagi.';
      stream = null;
    }
  }
  function stopMic() {
    cancelAnimationFrame(raf); clearInterval(timer);
    stream?.getTracks().forEach((t) => t.stop());
    srcNode?.disconnect();
    stream = null; analyser = null; live = false;
    micBtn.classList.remove('on'); micBtn.querySelector('span').textContent = 'Mulai tuner';
    root.classList.remove('live', 'intune');
    hintEl.textContent = 'Tuner berhenti.';
  }
  root.stopTuner = stopMic;

  function loop() {
    raf = requestAnimationFrame(loop);
    const t = performance.now();
    // fisika jarum: pegas teredam seperti pendulum metronom
    const goal = live ? target : 0;
    vel += (goal - needle) * 0.09; vel *= 0.72; needle += vel;
    const g = gauge.querySelector('.needle');
    g.setAttribute('transform', `rotate(${(Math.max(-50, Math.min(50, needle)) * 0.9).toFixed(2)} 160 170)`);
    if (live && t - lastSeen > 900) { live = false; root.classList.remove('intune'); gauge.classList.remove('flat', 'sharp', 'ok'); }
    drawTrace();
  }

  function analyse(t) {
    analyser.getFloatTimeDomainData(buf);
    let rms = 0; for (let i = 0; i < buf.length; i++) rms += buf[i] * buf[i];
    rms = Math.sqrt(rms / buf.length);
    if (rms < 0.006) { readings.length = 0; return; }
    const sr = analyser.context.sampleRate;
    const step = sr > 40000 ? 2 : 1;
    const x = new Float32Array(Math.floor(buf.length / step));
    for (let i = 0; i < x.length; i++) x[i] = step === 2 ? (buf[2 * i] + buf[2 * i + 1]) * 0.5 : buf[i];
    const r = yin(x, sr / step, Math.min(55, midiToFreq(tun().midi[0], S.a4) * 0.8));
    if (!r || r.conf < 0.8) return;
    readings.push(r.f); if (readings.length > 5) readings.shift();
    const f = [...readings].sort((a, b) => a - b)[readings.length >> 1];
    const midiF = freqToMidi(f, S.a4);
    const tset = tun();
    let idx, ref;
    if (S.mode === 'manual') { idx = S.target; ref = tset.midi[idx]; }
    else {
      idx = 0; let best = 1e9;
      tset.midi.forEach((m, i) => { const dd = Math.abs(midiF - m); if (dd < best) { best = dd; idx = i; } });
      ref = tset.midi[idx];
      if (Math.abs(midiF - ref) > 2.5) ref = Math.round(midiF); // bukan senar terbuka: tampilkan nada terdekat
    }
    const cents = (midiF - ref) * 100;
    target = Math.max(-60, Math.min(60, cents));
    live = true; lastSeen = t;
    const isString = tset.midi[idx] === ref;
    noteEl.textContent = pretty(noteName(ref, /b/.test(tset.notes[idx] || '')));
    noteEl.append(h('sub', {}, String(Math.floor(ref / 12) - 1)));
    hzEl.textContent = f.toFixed(1) + ' Hz  ·  target ' + midiToFreq(ref, S.a4).toFixed(1) + ' Hz';
    const c = Math.round(cents);
    centsEl.textContent = (c > 0 ? '+' : '') + c + ' cent';
    const ok = Math.abs(cents) <= 4;
    gauge.classList.toggle('ok', ok); gauge.classList.toggle('flat', cents < -4); gauge.classList.toggle('sharp', cents > 4);
    root.classList.toggle('intune', ok);
    if (ok) {
      hintEl.textContent = 'Pas. Tahan sebentar...';
      if (!inTuneSince) inTuneSince = t;
      if (t - inTuneSince > 700 && isString && !S.done.has(idx)) {
        S.done.add(idx); drawStrings();
        const n = tset.midi.length;
        hintEl.textContent = `Senar ${n - idx} sudah pas.` + (S.done.size === n ? ' Semua senar selesai disetel.' : '');
      } else if (S.done.has(idx)) hintEl.textContent = 'Pas.';
    } else {
      inTuneSince = 0;
      const n = tset.midi.length;
      const strTxt = isString ? `Senar ${n - idx}: ` : '';
      hintEl.textContent = strTxt + (cents < 0 ? 'terlalu rendah, kencangkan senar.' : 'terlalu tinggi, kendurkan senar.');
    }
    for (const b of strRow.children) b.classList.remove('hear');
    if (isString) strRow.children[idx]?.classList.add('hear');
    hist.push({ t, c: cents }); while (hist.length && t - hist[0].t > 4000) hist.shift();
  }

  function drawTrace() {
    const g = trace.getContext('2d'); const W = trace.width, H = trace.height;
    g.clearRect(0, 0, W, H);
    const cs = getComputedStyle(root);
    g.fillStyle = cs.getPropertyValue('--ok-soft'); g.fillRect(0, H / 2 - (4 / 50) * (H / 2), W, (8 / 50) * (H / 2));
    g.strokeStyle = cs.getPropertyValue('--line'); g.beginPath(); g.moveTo(0, H / 2); g.lineTo(W, H / 2); g.stroke();
    if (hist.length < 2) return;
    const tn = performance.now();
    g.strokeStyle = cs.getPropertyValue('--accent'); g.lineWidth = 2; g.beginPath();
    hist.forEach((p, i) => {
      const xx = W - ((tn - p.t) / 4000) * W;
      const yy = H / 2 - (Math.max(-50, Math.min(50, p.c)) / 50) * (H / 2 - 3);
      i ? g.lineTo(xx, yy) : g.moveTo(xx, yy);
    });
    g.stroke();
  }

  root.append(
    h('div', { class: 'page-head' }, h('h1', {}, 'Tuner'), h('p', {}, 'Setel tiap senar lewat mikrofon. Jarum berayun seperti metronom: tengah dan hijau berarti nada sudah pas.')),
    h('div', { class: 'tn-grid' },
    h('div', { class: 'card tn-main' },
      h('div', { class: 'tn-controls' }, field('Tuning', tuningSel), field('Kalibrasi', a4Sel), field('Mode', modeSeg)),
      gauge,
      h('div', { class: 'tn-read' }, noteEl, h('div', {}, centsEl, hzEl)),
      hintEl,
      h('div', { class: 'tn-actions' }, micBtn),
      trace,
    ),
    h('div', { class: 'tn-side' },
    h('div', { class: 'card' },
      h('h3', {}, 'Senar'),
      h('p', { class: 'muted' }, 'Ketuk senar untuk mendengar nada referensi dan mengunci tuner ke senar itu. Tanda centang muncul setelah senar stabil pas.'),
      strRow),
    h('div', { class: 'card tips' }, h('h3', {}, 'Tips menyetel'),
      h('ul', {},
        h('li', {}, 'Selalu setel dari bawah ke atas nada: jika terlalu tinggi, kendurkan dulu sedikit di bawah target lalu naikkan perlahan. Senar lebih stabil.'),
        h('li', {}, 'Petik dengan kekuatan sedang di dekat lubang suara, lalu biarkan nada berbunyi. Matikan senar lain agar tidak ikut bergetar.'),
        h('li', {}, 'Setelah semua senar pas, cek ulang senar 6 sampai 1. Perubahan tegangan satu senar sedikit memengaruhi senar lain.'),
        h('li', {}, 'Cek intonasi: harmonik di fret 12 harus sama dengan nada tekan di fret 12. Jika berbeda, setelan saddle perlu diatur.'))))),
  );
  drawStrings();
}

function gaugeSvg() {
  const cx = 160, cy = 170, R = 140;
  let ticks = '';
  for (let c = -50; c <= 50; c += 5) {
    const a = ((c * 0.9 - 90) * Math.PI) / 180;
    const long = c % 25 === 0, mid = c % 10 === 0;
    const r1 = R - (long ? 22 : mid ? 15 : 9);
    ticks += `<line x1="${cx + R * Math.cos(a)}" y1="${cy + R * Math.sin(a)}" x2="${cx + r1 * Math.cos(a)}" y2="${cy + r1 * Math.sin(a)}" class="${long ? 'tk-l' : 'tk'}"/>`;
    if (long) ticks += `<text x="${cx + (R - 34) * Math.cos(a)}" y="${cy + (R - 34) * Math.sin(a) + 4}" class="tk-t">${c > 0 ? '+' + c : c}</text>`;
  }
  const arc = (c0, c1, r) => {
    const a0 = ((c0 * 0.9 - 90) * Math.PI) / 180, a1 = ((c1 * 0.9 - 90) * Math.PI) / 180;
    return `M${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A${r} ${r} 0 0 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)}`;
  };
  return `<svg viewBox="0 0 320 200" class="gauge-svg">
    <path d="${arc(-50, 50, R + 8)}" class="g-track"/>
    <path d="${arc(-4, 4, R + 8)}" class="g-zone"/>
    ${ticks}
    <text x="34" y="192" class="g-lbl">rendah</text><text x="286" y="192" class="g-lbl" text-anchor="end">tinggi</text>
    <g class="needle"><path d="M157 170 L160 38 L163 170 Z"/><rect x="152" y="96" width="16" height="10" rx="2" class="weight"/></g>
    <circle cx="${cx}" cy="${cy}" r="9" class="g-hub"/>
  </svg>`;
}
