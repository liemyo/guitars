// Kurikulum bertahap dengan tautan ke alat lain dan checklist progres.
import { h, store, icon } from './ui.js?v=20261031142813';

const LESSONS = [
  { lvl: 'Pemula', items: [
    { id: 'p1', t: 'Menyetel gitar', d: 'Setel standar E A D G B E dengan tuner. Lakukan setiap kali mulai latihan.', go: { page: 'tuner' }, goals: ['Semua senar bertanda pas', 'Bisa menyetel dalam waktu kurang dari 2 menit'] },
    { id: 'p2', t: 'Postur & tangan', d: 'Ibu jari di belakang leher, jari menekan tepat di belakang fret, pergelangan rileks. Pick dipegang ibu jari dan telunjuk.', goals: ['Nada bersih tanpa dengung', 'Tidak ada ketegangan di bahu'] },
    { id: 'p3', t: 'Kunci terbuka pertama', d: 'Em, Am, E, A, D, lalu C dan G.', go: { page: 'chords', tab: 'dasar' }, goals: ['Semua senar dalam kunci berbunyi', 'Ganti G–C–D tanpa berhenti di 60 BPM'] },
    { id: 'p4', t: 'Ritme & metronom', d: 'Genjreng 4 ketuk turun, lalu pola pop D - DU - UDU.', go: { page: 'chords', tab: 'genjreng' }, goals: ['Stabil bersama metronom 70 BPM', 'Tangan kanan terus mengayun'] },
    { id: 'p5', t: 'Progresi pertama', d: 'I – V – vi – IV di kunci C dan G. Ini dasar ribuan lagu pop.', go: { page: 'chords', tab: 'progresi' }, goals: ['Main 4 putaran tanpa salah', 'Coba di 3 kunci berbeda'] },
    { id: 'p6', t: 'Membaca tab & melodi pertama', d: 'Garis = senar (bawah = senar 6), angka = fret. Mulai dari Twinkle Twinkle dan Ode to Joy.', go: { page: 'songs', id: 'twinkle' }, goals: ['Main bersama playback 80%', 'Main tanpa melihat tab'] },
    { id: 'p7', t: 'Latihan jari 1-2-3-4', d: 'Pola kromatik dengan alternate picking untuk kekuatan dan koordinasi.', go: { page: 'songs', id: 't-spider' }, goals: ['Bersih di 80 BPM 1/8', 'Bersih di 80 BPM 1/16'] },
  ] },
  { lvl: 'Menengah', items: [
    { id: 'm1', t: 'Kunci barre', d: 'Bentuk E dan A di fret 1 sampai 7: F, Bm, Cm, Gm. Mulai dari barre sebagian.', go: { page: 'chords', tab: 'variasi', root: 'F', qual: '' }, goals: ['F dan Bm berbunyi bersih', 'Pindah F–C–G dalam tempo'] },
    { id: 'm2', t: 'Pentatonik minor box 1', d: 'Box 1 A minor di fret 5. Fondasi improvisasi rock dan blues.', go: { page: 'scales', key: 'A', scale: 'pmin', pos: 1 }, goals: ['Naik-turun di 100 BPM 1/8', 'Pola grup 3'] },
    { id: 'm3', t: 'Lima box pentatonik', d: 'Sambungkan box 1 sampai 5 agar bisa bergerak ke seluruh neck.', go: { page: 'scales', key: 'A', scale: 'pmin', pos: 0 }, goals: ['Hafal 5 box', 'Main satu lick melewati 2 box'] },
    { id: 'm4', t: 'Teknik lead dasar', d: 'Hammer-on, pull-off, slide, bending dan vibrato.', go: { page: 'songs', id: 't-legato' }, goals: ['Bend tepat 1 nada', 'Vibrato rata'] },
    { id: 'm5', t: 'Blues 12 bar', d: 'Iringan shuffle dan lick blues di A.', go: { page: 'songs', id: 'blues-a' }, goals: ['Hafal bentuk 12 bar', 'Improvisasi 1 putaran'] },
    { id: 'm6', t: 'Scale mayor & akor diatonik', d: 'Scale mayor 3 nada per senar dan akor yang dibentuknya.', go: { page: 'scales', key: 'G', scale: 'major', pos: 1 }, goals: ['Sebut akor diatonik di kunci G', 'Main 7 posisi'] },
    { id: 'm7', t: 'Akor 7 & progresi menengah', d: 'maj7, m7, 7 dalam progresi dengan voicing yang berdekatan.', go: { page: 'chords', tab: 'progresi' }, goals: ['ii–V–I di kunci C dan F', 'Hafal bentuk barre m7 dan 7'] },
    { id: 'm8', t: 'Fingerstyle', d: 'Arpeggio 6/8 dan Travis picking.', go: { page: 'songs', id: 'rising' }, goals: ['House of the Rising Sun penuh', 'Bass bergantian stabil'] },
  ] },
  { lvl: 'Lanjut', items: [
    { id: 'l1', t: 'Mode', d: 'Dorian, Mixolydian, Phrygian, Lydian: warna khas di atas akor yang tepat.', go: { page: 'scales', key: 'A', scale: 'dorian', pos: 1 }, goals: ['Dengar beda Dorian dan minor natural', 'Main lick funk Dorian'] },
    { id: 'l2', t: 'Minor harmonik & Phrygian dominan', d: 'Nuansa neo-klasik, flamenco, dan Timur Tengah.', go: { page: 'songs', id: 'flamenco-e' }, goals: ['Kadens Andalusia', 'Sweep arpeggio 3 senar'] },
    { id: 'l3', t: 'Akor perluasan', d: '9, 13, m9, maj9, 6/9, 7#9 dan bentuk shell untuk jazz dan neo-soul.', go: { page: 'chords', tab: 'variasi', root: 'C', qual: '9' }, goals: ['Hafal 2 bentuk tiap kualitas', 'Progresi tingkat lanjut'] },
    { id: 'l4', t: 'Garis bebop', d: 'Arpeggio + nada lewat kromatik di ii–V–I.', go: { page: 'songs', id: 'jazz-c' }, goals: ['Target nada 3 di tiap akor', 'Swing 8th di 140 BPM'] },
    { id: 'l5', t: 'Telinga musikal', d: 'Kenali interval dan kualitas akor tanpa melihat.', go: { page: 'practice', tab: 'ear' }, goals: ['Interval lengkap 80%', 'Akor lanjut 70%'] },
    { id: 'l6', t: 'Hafal seluruh fretboard', d: 'Nama nada di semua senar sampai fret 12.', go: { page: 'practice', tab: 'quiz' }, goals: ['30 benar beruntun', 'Rata-rata di bawah 2 detik'] },
  ] },
];

export function initLessons(root, { go } = {}) {
  const done = new Set(store.get('lessons.done', []));
  const total = LESSONS.reduce((a, g) => a + g.items.reduce((b, it) => b + it.goals.length, 0), 0);
  const bar = h('div', { class: 'progress' }, h('i', {}));
  const pct = h('b', {});
  const upd = () => { const n = done.size; bar.firstChild.style.width = (n / total) * 100 + '%'; pct.textContent = `${n} / ${total} target`; store.set('lessons.done', [...done]); };
  const wrap = h('div', { class: 'lessons' });
  for (const g of LESSONS) {
    const col = h('section', { class: 'lesson-col' }, h('h2', {}, g.lvl));
    g.items.forEach((it, i) => {
      const goals = h('ul', { class: 'goals' });
      it.goals.forEach((gl, k) => {
        const key = it.id + ':' + k;
        goals.append(h('li', {}, h('label', { class: 'chk' }, h('input', { type: 'checkbox', checked: done.has(key), onchange: (e) => { e.target.checked ? done.add(key) : done.delete(key); upd(); } }), gl)));
      });
      col.append(h('article', { class: 'card lesson' },
        h('div', { class: 'lesson-n' }, String(i + 1).padStart(2, '0')),
        h('div', {}, h('h3', {}, it.t), h('p', {}, it.d), goals,
          it.go ? h('button', { type: 'button', class: 'btn ghost', onclick: () => go?.(it.go), html: '<span>Buka latihan</span>' + icon('right') }) : null)));
    });
    wrap.append(col);
  }
  root.append(
    h('div', { class: 'page-head' }, h('h1', {}, 'Kurikulum'), h('p', {}, 'Jalur belajar dari pemula sampai lanjut. Centang target yang sudah tercapai; progres tersimpan di perangkat ini.')),
    h('div', { class: 'card prog-card' }, pct, bar),
    wrap,
  );
  upd();
}
