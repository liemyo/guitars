// Teori musik dasar: nada, frekuensi, tuning, scale, kunci.

export const SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
export const ROOTS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const LETTER_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

export const mod12 = (n) => ((n % 12) + 12) % 12;
export const midiToFreq = (m, a4 = 440) => a4 * Math.pow(2, (m - 69) / 12);
export const freqToMidi = (f, a4 = 440) => 69 + 12 * Math.log2(f / a4);

export function pcOf(name) {
  const m = /^([A-G])([#b]*)/.exec(name);
  if (!m) return 0;
  let pc = LETTER_PC[m[1]];
  for (const ch of m[2]) pc += ch === '#' ? 1 : -1;
  return mod12(pc);
}

export const useFlats = (root) => /b/.test(root) || root === 'F';
export function noteName(m, flats = false) { return (flats ? FLAT : SHARP)[mod12(m)]; }
export function pitchLabel(m, flats = false) { return noteName(m, flats) + (Math.floor(m / 12) - 1); }
export const pretty = (s) => String(s).replace(/##/g, '\u{1D12A}').replace(/#/g, '♯').replace(/b(?=\d)/g, '♭').replace(/(?<=[A-G])b/g, '♭');

// "C#4" / "Bb3" -> midi
export function parsePitch(s) {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(s);
  if (!m) throw new Error('nada tidak dikenal: ' + s);
  return pcOf(m[1] + m[2]) + (Number(m[3]) + 1) * 12;
}

// ---------- Tuning ----------
export const TUNINGS = [
  { id: 'std', name: 'Standar (E A D G B E)', notes: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'] },
  { id: 'half', name: 'Turun 1/2 (Eb)', notes: ['Eb2', 'Ab2', 'Db3', 'Gb3', 'Bb3', 'Eb4'] },
  { id: 'whole', name: 'Turun 1 nada (D)', notes: ['D2', 'G2', 'C3', 'F3', 'A3', 'D4'] },
  { id: 'dropd', name: 'Drop D', notes: ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'] },
  { id: 'dropc', name: 'Drop C', notes: ['C2', 'G2', 'C3', 'F3', 'A3', 'D4'] },
  { id: 'openg', name: 'Open G', notes: ['D2', 'G2', 'D3', 'G3', 'B3', 'D4'] },
  { id: 'opend', name: 'Open D', notes: ['D2', 'A2', 'D3', 'F#3', 'A3', 'D4'] },
  { id: 'opene', name: 'Open E', notes: ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'] },
  { id: 'openc', name: 'Open C', notes: ['C2', 'G2', 'C3', 'G3', 'C4', 'E4'] },
  { id: 'dadgad', name: 'DADGAD', notes: ['D2', 'A2', 'D3', 'G3', 'A3', 'D4'] },
  { id: 'bass', name: 'Bass 4 senar', notes: ['E1', 'A1', 'D2', 'G2'] },
  { id: 'uke', name: 'Ukulele (G C E A)', notes: ['G4', 'C4', 'E4', 'A4'] },
].map((t) => ({ ...t, midi: t.notes.map(parsePitch) }));

export const STD = TUNINGS[0].midi;

// ---------- Scale ----------
export const SCALES = [
  { id: 'major', name: 'Mayor (Ionian)', iv: [0, 2, 4, 5, 7, 9, 11], grp: 'Dasar', mood: 'Cerah dan stabil', genre: 'Pop, country, folk, lagu anak', tip: 'Scale acuan semua teori. Hafalkan rumus nada-nada: 1 1 1/2 1 1 1 1/2.' },
  { id: 'minor', name: 'Minor natural (Aeolian)', iv: [0, 2, 3, 5, 7, 8, 10], grp: 'Dasar', mood: 'Sendu, gelap', genre: 'Rock, ballad, pop minor', tip: 'Relatif minor dari mayor: A minor memakai nada yang sama dengan C mayor.' },
  { id: 'pmin', name: 'Pentatonik minor', iv: [0, 3, 5, 7, 10], grp: 'Dasar', mood: 'Tegas, bluesy', genre: 'Blues, rock, funk', tip: 'Scale melodi paling populer. Mulai dari Box 1 (posisi akar di senar 6), lalu sambungkan ke box lain.' },
  { id: 'pmaj', name: 'Pentatonik mayor', iv: [0, 2, 4, 7, 9], grp: 'Dasar', mood: 'Ceria, terbuka', genre: 'Country, pop, southern rock', tip: 'Bentuknya sama dengan pentatonik minor tiga fret lebih rendah (G mayor = E minor).' },
  { id: 'blues', name: 'Blues minor', iv: [0, 3, 5, 6, 7, 10], grp: 'Menengah', box: 'pmin', mood: 'Bluesy, kotor', genre: 'Blues, rock, jazz', tip: 'Pentatonik minor + blue note (b5). Lewati b5 dengan cepat sebagai nada lewat.' },
  { id: 'bluesmaj', name: 'Blues mayor', iv: [0, 2, 3, 4, 7, 9], grp: 'Menengah', box: 'pmaj', mood: 'Manis dan bluesy', genre: 'Country blues, rock and roll', tip: 'Pentatonik mayor + b3. Slide atau hammer-on dari b3 ke 3.' },
  { id: 'dorian', name: 'Dorian', iv: [0, 2, 3, 5, 7, 9, 10], grp: 'Menengah', mood: 'Minor yang hangat', genre: 'Funk, jazz, fusion, rock', tip: 'Minor dengan 6 natural. Tekankan nada 6 di atas akor m7.' },
  { id: 'mixo', name: 'Mixolydian', iv: [0, 2, 4, 5, 7, 9, 10], grp: 'Menengah', mood: 'Mayor yang santai', genre: 'Blues rock, classic rock, funk', tip: 'Mayor dengan b7. Pas untuk dimainkan di atas akor dominan 7.' },
  { id: 'harmin', name: 'Minor harmonik', iv: [0, 2, 3, 5, 7, 8, 11], grp: 'Menengah', mood: 'Klasik, eksotis', genre: 'Neo-klasik, metal, latin', tip: 'Minor dengan 7 natural sehingga akor V menjadi dominan (E7 di kunci A minor).' },
  { id: 'phrygian', name: 'Phrygian', iv: [0, 1, 3, 5, 7, 8, 10], grp: 'Lanjut', mood: 'Gelap, spanyol', genre: 'Metal, flamenco', tip: 'Ciri khasnya interval b2. Mainkan 1 ke b2 berulang untuk rasa tegang.' },
  { id: 'lydian', name: 'Lydian', iv: [0, 2, 4, 6, 7, 9, 11], grp: 'Lanjut', mood: 'Melayang, sinematik', genre: 'Musik film, fusion, progressive', tip: 'Mayor dengan #4. Tahan #4 di atas akor mayor7.' },
  { id: 'locrian', name: 'Locrian', iv: [0, 1, 3, 5, 6, 8, 10], grp: 'Lanjut', mood: 'Tidak stabil', genre: 'Metal, jazz (akor m7b5)', tip: 'Dipakai di atas akor m7b5. Jarang dipakai sebagai pusat nada.' },
  { id: 'melmin', name: 'Minor melodik', iv: [0, 2, 3, 5, 7, 9, 11], grp: 'Lanjut', mood: 'Jazz, modern', genre: 'Jazz, fusion', tip: 'Sumber mode jazz: altered, lydian dominan. Bentuk naik dipakai juga saat turun di jazz.' },
  { id: 'phrdom', name: 'Phrygian dominan', iv: [0, 1, 4, 5, 7, 8, 10], grp: 'Lanjut', mood: 'Timur Tengah, flamenco', genre: 'Flamenco, metal, dangdut, gambus', tip: 'Mode ke-5 minor harmonik. Mainkan di atas akor E7 dalam kunci A minor.' },
  { id: 'hungmin', name: 'Minor Hungaria', iv: [0, 2, 3, 6, 7, 8, 11], grp: 'Lanjut', mood: 'Dramatis', genre: 'Neo-klasik, gipsi', tip: 'Dua interval 1 1/2 nada (b3-#4 dan b6-7) memberi warna dramatis.' },
  { id: 'hirajoshi', name: 'Hirajoshi (Jepang)', iv: [0, 2, 3, 7, 8], grp: 'Lanjut', mood: 'Oriental, tenang', genre: 'Musik Asia, metal', tip: 'Pentatonik Jepang. Mirip nuansa pelog.' },
  { id: 'whole', name: 'Whole tone', iv: [0, 2, 4, 6, 8, 10], grp: 'Lanjut', mood: 'Mengambang, mimpi', genre: 'Jazz, musik film', tip: 'Semua jarak 1 nada. Cocok untuk akor 7#5 / augmented.' },
  { id: 'dimhw', name: 'Diminished (1/2-1)', iv: [0, 1, 3, 4, 6, 7, 9, 10], grp: 'Lanjut', mood: 'Tegang, simetris', genre: 'Jazz, metal', tip: 'Dimainkan di atas akor 7b9. Polanya berulang setiap 3 fret.' },
  { id: 'bebop', name: 'Bebop dominan', iv: [0, 2, 4, 5, 7, 9, 10, 11], grp: 'Lanjut', mood: 'Swing', genre: 'Jazz bebop', tip: 'Mixolydian + 7 natural sebagai nada lewat agar nada akor jatuh di ketukan.' },
];
export const scaleById = (id) => SCALES.find((s) => s.id === id) || SCALES[0];

const IV_BASE = ['1', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'];
export function intervalName(iv, set) {
  const i = mod12(iv);
  if (i === 6 && set && !set.includes(5)) return '#4';
  if (i === 8 && set && !set.includes(7)) return '#5';
  return IV_BASE[i];
}

// Ejaan nada per scale (7 nada pakai huruf berurutan).
export function spellScale(root, iv) {
  if (iv.length === 7) {
    const L = LETTERS.indexOf(root[0]);
    const rpc = pcOf(root);
    return iv.map((x, i) => {
      const letter = LETTERS[(L + i) % 7];
      let diff = mod12(rpc + x - LETTER_PC[letter]);
      if (diff > 6) diff -= 12;
      return letter + (diff > 0 ? '#'.repeat(diff) : 'b'.repeat(-diff));
    });
  }
  const fl = useFlats(root);
  return iv.map((x) => noteName(pcOf(root) + x, fl));
}

// ---------- Akor ----------
export const QUAL = {
  '': { iv: [0, 4, 7], name: 'Mayor' },
  m: { iv: [0, 3, 7], name: 'Minor' },
  '5': { iv: [0, 7], name: 'Power chord' },
  '7': { iv: [0, 4, 7, 10], name: 'Dominan 7' },
  maj7: { iv: [0, 4, 7, 11], name: 'Mayor 7' },
  m7: { iv: [0, 3, 7, 10], name: 'Minor 7' },
  sus2: { iv: [0, 2, 7], name: 'Sus2' },
  sus4: { iv: [0, 5, 7], name: 'Sus4' },
  add9: { iv: [0, 4, 7, 14], name: 'Add9' },
  '6': { iv: [0, 4, 7, 9], name: 'Mayor 6' },
  m6: { iv: [0, 3, 7, 9], name: 'Minor 6' },
  dim: { iv: [0, 3, 6], name: 'Diminished' },
  dim7: { iv: [0, 3, 6, 9], name: 'Diminished 7' },
  m7b5: { iv: [0, 3, 6, 10], name: 'Half-diminished' },
  aug: { iv: [0, 4, 8], name: 'Augmented' },
  '9': { iv: [0, 4, 7, 10, 14], name: 'Dominan 9' },
  maj9: { iv: [0, 4, 7, 11, 14], name: 'Mayor 9' },
  m9: { iv: [0, 3, 7, 10, 14], name: 'Minor 9' },
  '6/9': { iv: [0, 4, 7, 9, 14], name: '6/9' },
  m11: { iv: [0, 3, 7, 10, 14, 17], name: 'Minor 11' },
  '13': { iv: [0, 4, 7, 10, 14, 21], name: 'Dominan 13' },
  '7b9': { iv: [0, 4, 7, 10, 13], name: '7 flat 9' },
  '7#9': { iv: [0, 4, 7, 10, 15], name: '7 sharp 9' },
};

const CHORD_IV_NAME = { 0: '1', 1: 'b9', 2: '9', 3: 'b3', 4: '3', 5: '11', 6: 'b5', 7: '5', 8: '#5', 9: '6', 10: 'b7', 11: '7' };
export function chordToneName(rootPc, midi, qual) {
  const i = mod12(midi - rootPc);
  const q = QUAL[qual];
  if (q) {
    if (i === 3 && q.iv.includes(15)) return '#9';
    if (i === 9 && q.iv.includes(21)) return '13';
    if (i === 9 && qual.startsWith('dim7')) return 'bb7';
    if (i === 8 && qual === 'aug') return '#5';
    if (i === 5 && /sus4/.test(qual)) return '4';
    if (i === 2 && /sus2/.test(qual)) return '2';
  }
  return CHORD_IV_NAME[i];
}

// "F#m7/C#" -> {root, qual, bass}
export function parseChord(name) {
  const m = /^([A-G][#b]?)(.*?)(?:\/([A-G][#b]?))?$/.exec(name);
  if (!m) return null;
  return { root: m[1], rootPc: pcOf(m[1]), qual: m[2], bass: m[3] || null };
}

// Akor diatonik
export function diatonic(rootName, minor = false) {
  const iv = minor ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
  const names = spellScale(rootName, iv);
  const q3 = minor ? ['m', 'dim', '', 'm', 'm', '', ''] : ['', 'm', 'm', '', '', 'm', 'dim'];
  const q7 = minor ? ['m7', 'm7b5', 'maj7', 'm7', 'm7', 'maj7', '7'] : ['maj7', 'm7', 'm7', 'maj7', '7', 'm7', 'm7b5'];
  const rn = minor ? ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'] : ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
  return names.map((n, i) => ({ deg: rn[i], triad: n + q3[i], seventh: n + q7[i] }));
}
