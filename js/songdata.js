// Melodi untuk latihan scale. Lagu = komposisi domain publik / tradisional.
// Lick = komposisi orisinal bergaya genre populer. Latihan = pola teknik.
//
// Token melodi: "<nada>[:durasi][mod]"; nada = C#4 | 1/12 (senar/fret) | r (diam);
// beberapa nada sekaligus digabung dengan "+". Mod: h hammer-on, p pull-off,
// s slide, b bend 1 nada, q bend 1/2 nada, ~ vibrato, m palm mute.

const trip = (bars) => bars.map(([bass, inner, mel]) => mel.map((m, i) => `${i === 0 ? bass + '+' : ''}${m}:.333 ${inner[0]}:.333 ${inner[1]}:.333`).join(' ')).join(' ');
// arpeggio 6/8 dari bentuk akor: bass, 3, 2, 1, 2, 3
const arp68 = (shapes) => shapes.map(([bass, s3, s2, s1]) => `${bass}:.5 3/${s3}:.5 2/${s2}:.5 1/${s1}:.5 2/${s2}:.5 3/${s3}:.5`).join(' ');

const EM = ['2/0', '3/0'], AM = ['2/5', '3/5'], B7 = ['2/4', '3/2'];

export const CATS = [
  { id: 'lagu', name: 'Lagu klasik & tradisional' },
  { id: 'lick', name: 'Lick gaya populer' },
  { id: 'teknik', name: 'Latihan teknik' },
];

export const SONGS = [
  {
    id: 'twinkle', cat: 'lagu', title: 'Twinkle Twinkle Little Star', by: 'Tradisional (melodi Prancis abad 18)', lvl: 1,
    key: 'C', scale: 'major', bpm: 100, ts: 4, pos: 0, style: 'strum',
    mel: 'C4 C4 G4 G4 A4 A4 G4:2 F4 F4 E4 E4 D4 D4 C4:2 G4 G4 F4 F4 E4 E4 D4:2 G4 G4 F4 F4 E4 E4 D4:2 C4 C4 G4 G4 A4 A4 G4:2 F4 F4 E4 E4 D4 D4 C4:2',
    chords: 'C:4 F:2 C:2 F:2 C:2 G:2 C:2 C:2 F:2 C:2 G:2 C:2 F:2 C:2 G:2 C:4 F:2 C:2 F:2 C:2 G:2 C:2',
    note: 'Melodi pertama yang ideal: semua nada ada di posisi terbuka C mayor, senar 3 sampai 1.',
  },
  {
    id: 'ode', cat: 'lagu', title: 'Ode to Joy', by: 'L. van Beethoven, Simfoni No. 9 (1824)', lvl: 1,
    key: 'C', scale: 'major', bpm: 108, ts: 4, pos: 0, style: 'strum',
    mel: 'E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4:1.5 D4:.5 D4:2 E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4:1.5 C4:.5 C4:2 D4 D4 E4 C4 D4 E4:.5 F4:.5 E4 C4 D4 E4:.5 F4:.5 E4 D4 C4 D4 G3:2 E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4:1.5 C4:.5 C4:2',
    chords: 'C:4 G:4 C:4 G:4 C:4 G:4 C:4 G:2 C:2 G:4 G:2 C:2 G:4 C:2 G:2 C:4 G:4 C:4 G:2 C:2',
    note: 'Melodi bergerak bertahap (step) sehingga melatih perpindahan jari 1-2-3 di fret 1 sampai 3.',
  },
  {
    id: 'jingle', cat: 'lagu', title: 'Jingle Bells', by: 'J. L. Pierpont (1857)', lvl: 1,
    key: 'C', scale: 'major', bpm: 120, ts: 4, pos: 0, style: 'strum', drums: true,
    mel: 'E4 E4 E4:2 E4 E4 E4:2 E4 G4 C4:1.5 D4:.5 E4:4 F4 F4 F4:1.5 F4:.5 F4 E4 E4 E4:.5 E4:.5 E4 D4 D4 E4 D4:2 G4:2 E4 E4 E4:2 E4 E4 E4:2 E4 G4 C4:1.5 D4:.5 E4:4 F4 F4 F4:1.5 F4:.5 F4 E4 E4 E4:.5 E4:.5 G4 G4 F4 D4 C4:4',
    chords: 'C:4 C:4 C:4 C:4 F:4 C:4 D7:4 G7:4 C:4 C:4 C:4 C:4 F:4 C:4 G7:4 C:4',
    note: 'Latihan ritme: nada berulang dan not 1/8. Jaga pukulan tetap rata.',
  },
  {
    id: 'saints', cat: 'lagu', title: 'When the Saints Go Marching In', by: 'Spiritual tradisional Amerika', lvl: 1,
    key: 'C', scale: 'major', bpm: 120, ts: 4, pos: 0, style: 'strum', drums: true,
    mel: 'r C4 E4 F4 G4:4 r C4 E4 F4 G4:4 r C4 E4 F4 G4:2 E4:2 C4:2 E4:2 D4:4 r E4 E4 D4 C4:3 C4 E4:2 G4:2 G4 F4:3 E4 F4 G4:2 E4:2 C4:2 D4:4 C4:4',
    chords: 'C:4 C:4 C:4 C:4 C:4 C:4 G7:4 G7:4 C:4 C7:4 F:4 F:4 C:4 G7:4 G7:4 C:4',
    note: 'Hampir seluruhnya pentatonik mayor C (C D E G A) ditambah F. Cocok untuk belajar melodi dengan jeda di awal birama.',
  },
  {
    id: 'amazing', cat: 'lagu', title: 'Amazing Grace', by: 'Melodi tradisional "New Britain" (1829)', lvl: 1,
    key: 'G', scale: 'pmaj', bpm: 84, ts: 3, pos: 0, style: 'waltz',
    mel: 'r:2 D3 G3:2 B3:.5 G3:.5 B3:2 A3 G3:2 E3 D3:2 D3 G3:2 B3:.5 G3:.5 B3:2 A3 D4:3 D4:2 B3 D4:1.5 B3:.5 D4:.5 B3:.5 G3:2 D3 E3:1.5 G3:.5 G3:.5 E3:.5 D3:2 D3 G3:2 B3:.5 G3:.5 B3:2 A3 G3:3',
    chords: 'G:3 G:3 G:3 C:3 G:3 G:3 G:3 D:3 D:3 G:3 G:3 C:3 G:3 G:3 D:3 G:3',
    note: 'Seluruh melodi memakai pentatonik mayor G (G A B D E) di posisi terbuka. Latih nada panjang dan perpindahan senar 4 ke 2.',
  },
  {
    id: 'silent', cat: 'lagu', title: 'Silent Night', by: 'F. X. Gruber (1818)', lvl: 1,
    key: 'C', scale: 'major', bpm: 72, ts: 3, pos: 0, style: 'waltz',
    mel: 'G3:1.5 A3:.5 G3 E3:3 G3:1.5 A3:.5 G3 E3:3 D4:2 D4 B3:3 C4:2 C4 G3:3 A3:2 A3 C4:1.5 B3:.5 A3 G3:1.5 A3:.5 G3 E3:3 A3:2 A3 C4:1.5 B3:.5 A3 G3:1.5 A3:.5 G3 E3:3 D4:2 D4 F4:1.5 D4:.5 B3 C4:3 E4:3 C4 G3 E3 G3:1.5 F3:.5 D3 C3:3 r:3',
    chords: 'C:3 C:3 C:3 C:3 G:3 G:3 C:3 C:3 F:3 F:3 C:3 C:3 F:3 F:3 C:3 C:3 G:3 G7:3 C:3 C:3 C:3 G7:3 C:3 C:3',
    note: 'Birama 3/4 (rasa 6/8). Dimainkan satu oktaf lebih rendah sehingga seluruh melodi muat di posisi terbuka.',
  },
  {
    id: 'greensleeves', cat: 'lagu', title: 'Greensleeves', by: 'Tradisional Inggris (abad 16)', lvl: 2,
    key: 'A', scale: 'dorian', bpm: 100, ts: 3, pos: 0, style: 'arp3',
    mel: 'r:2 A3 C4:2 D4 E4:1.5 F4:.5 E4 D4:2 B3 G3:1.5 A3:.5 B3 C4:2 A3 A3:1.5 G#3:.5 A3 B3:2 G#3 E3:2 A3 C4:2 D4 E4:1.5 F4:.5 E4 D4:2 B3 G3:1.5 A3:.5 B3 C4:1.5 B3:.5 A3 G#3:1.5 F#3:.5 G#3 A3:3 A3:3 G4:3 G4:1.5 F#4:.5 E4 D4:2 B3 G3:1.5 A3:.5 B3 C4:2 A3 A3:1.5 G#3:.5 A3 B3:2 G#3 E3:3 G4:3 G4:1.5 F#4:.5 E4 D4:2 B3 G3:1.5 A3:.5 B3 C4:1.5 B3:.5 A3 G#3:1.5 F#3:.5 G#3 A3:3 A3:3',
    chords: 'Am:3 Am:3 C:3 G:3 Em:3 Am:3 Am:3 E:3 E:3 Am:3 C:3 G:3 Em:3 Am:3 E:3 Am:3 Am:3 C:3 C:3 G:3 Em:3 Am:3 E:3 E:3 E:3 C:3 C:3 G:3 Em:3 Am:3 E:3 Am:3 Am:3',
    note: 'Campuran minor natural, Dorian (F#) dan minor harmonik (G#). Perhatikan nada luar scale yang ditandai di fretboard.',
  },
  {
    id: 'scarborough', cat: 'lagu', title: 'Scarborough Fair', by: 'Balada tradisional Inggris', lvl: 2,
    key: 'D', scale: 'dorian', bpm: 104, ts: 3, pos: 0, style: 'arp3',
    mel: 'D3:2 D3 A3:2 A3 E3:1.5 F3:.5 E3 D3:3 r A3 C4 D4:2 C4 A3 B3 G3 A3:3 r D4:2 D4:2 D4 C4:2 A3 A3 G3 F3 E3 C3:2 D3:2 A3 G3:2 F3 E3 D3 C3 D3:3 r:3',
    chords: 'Dm:3 Dm:3 C:3 Dm:3 F:3 C:3 G:3 Dm:3 Dm:3 F:3 C:3 F:3 C:3 Dm:3 G:3 C:3 Dm:3 Dm:3',
    note: 'Contoh klasik mode Dorian: nada B natural (6 mayor) di atas kunci D minor memberi warna khas.',
  },
  {
    id: 'canon', cat: 'lagu', title: 'Canon in D', by: 'J. Pachelbel (sekitar 1680)', lvl: 2,
    key: 'D', scale: 'major', bpm: 72, ts: 4, pos: 0, style: 'ballad',
    mel: 'F#4:2 E4:2 D4:2 C#4:2 B3:2 A3:2 B3:2 C#4:2 D4:2 C#4:2 B3:2 A3:2 G3:2 F#3:2 G3:2 E3:2 D3:.5 F#3:.5 A3:.5 G3:.5 F#3:.5 D3:.5 F#3:.5 E3:.5 D3:.5 B2:.5 D3:.5 A3:.5 G3:.5 B3:.5 A3:.5 G3:.5 F#3:.5 D3:.5 E3:.5 C#4:.5 D4:.5 F#4:.5 A4:.5 A3:.5 B3:.5 G3:.5 A3:.5 F#3:.5 E3:.5 A3:.5 C#4:.5 E4:.5 D4:4~',
    chords: 'D:2 A:2 Bm:2 F#m:2 G:2 D:2 G:2 A:2 D:2 A:2 Bm:2 F#m:2 G:2 D:2 G:2 A:2 D:2 A:2 Bm:2 F#m:2 G:2 D:2 G:2 A:2 D:4',
    note: 'Progresi I–V–vi–iii–IV–I–IV–V yang menjadi dasar ribuan lagu pop. Melodi turun bertahap di D mayor.',
  },
  {
    id: 'minuet', cat: 'lagu', title: 'Minuet in G', by: 'C. Petzold (sekitar 1725)', lvl: 2,
    key: 'G', scale: 'major', bpm: 100, ts: 3, pos: 0, style: 'waltz',
    mel: 'D4 G3:.5 A3:.5 B3:.5 C4:.5 D4 G3 G3 E4 C4:.5 D4:.5 E4:.5 F#4:.5 G4 G3 G3 C4 D4:.5 C4:.5 B3:.5 A3:.5 B3 C4:.5 B3:.5 A3:.5 G3:.5 F#3 G3:.5 A3:.5 B3:.5 G3:.5 A3:3 D4 G3:.5 A3:.5 B3:.5 C4:.5 D4 G3 G3 E4 C4:.5 D4:.5 E4:.5 F#4:.5 G4 G3 G3 C4 D4:.5 C4:.5 B3:.5 A3:.5 B3 C4:.5 B3:.5 A3:.5 G3:.5 A3 B3:.5 A3:.5 G3:.5 F#3:.5 G3:3',
    chords: 'G:3 G:3 C:3 G:3 C:3 G:3 D:3 D:3 G:3 G:3 C:3 G:3 C:3 G:3 D:3 G:3',
    note: 'Dimainkan satu oktaf lebih rendah agar muat di posisi terbuka. Latih not 1/8 dengan alternate picking.',
  },
  {
    id: 'furelise', cat: 'lagu', title: 'Für Elise (tema)', by: 'L. van Beethoven (1810)', lvl: 2,
    key: 'A', scale: 'harmin', bpm: 132, ts: 3, pos: 0, style: 'none',
    mel: 'r:2 E4:.5 D#4:.5 E4:.5 D#4:.5 E4:.5 B3:.5 D4:.5 C4:.5 A3 r:.5 C3:.5 E3:.5 A3:.5 B3 r:.5 E3:.5 G#3:.5 B3:.5 C4 r:.5 E3:.5 E4:.5 D#4:.5 E4:.5 D#4:.5 E4:.5 B3:.5 D4:.5 C4:.5 A3 r:.5 C3:.5 E3:.5 A3:.5 B3 r:.5 E3:.5 C4:.5 B3:.5 A3:2 r',
    chords: 'Am:3 Am:3 Am:3 E:3 Am:3 Am:3 Am:3 E:3 Am:3',
    note: 'Ketukan dihitung per 1/8 (birama 3/8). D# berasal dari minor harmonik A. Arpeggio iringan sudah termasuk di melodi.',
  },
  {
    id: 'mountain', cat: 'lagu', title: 'In the Hall of the Mountain King', by: 'E. Grieg, Peer Gynt (1875)', lvl: 2,
    key: 'B', scale: 'minor', bpm: 116, ts: 4, pos: 0, style: 'rock', drums: true,
    mel: 'B2:.5 C#3:.5 D3:.5 E3:.5 F#3:.5 D3:.5 F#3 F3:.5 C#3:.5 F3 E3:.5 C3:.5 E3 B2:.5 C#3:.5 D3:.5 E3:.5 F#3:.5 D3:.5 F#3:.5 B3:.5 A3:.5 F#3:.5 D3:.5 F#3:.5 A3:2 B3:.5 C#4:.5 D4:.5 E4:.5 F#4:.5 D4:.5 F#4 F4:.5 C#4:.5 F4 E4:.5 C4:.5 E4 B3:.5 C#4:.5 D4:.5 E4:.5 F#4:.5 D4:.5 F#4:.5 B4:.5 A4:.5 F#4:.5 D4:.5 F#4:.5 A4:2',
    chords: 'Bm:4 F#:2 C:2 Bm:4 D:4 Bm:4 F#:2 C:2 Bm:4 D:4',
    note: 'Riff B minor dengan nada kromatik. Bagian kedua satu oktaf lebih tinggi: latih perpindahan posisi.',
  },
  {
    id: 'rising', cat: 'lagu', title: 'House of the Rising Sun (arpeggio)', by: 'Lagu rakyat tradisional Amerika', lvl: 2,
    key: 'A', scale: 'minor', bpm: 76, ts: 3, pos: 0, style: 'none',
    mel: arp68([['5/0', 2, 1, 0], ['5/3', 0, 1, 0], ['4/0', 2, 3, 2], ['4/3', 2, 1, 1], ['5/0', 2, 1, 0], ['5/3', 0, 1, 0], ['6/0', 1, 0, 0], ['6/0', 1, 0, 0], ['5/0', 2, 1, 0], ['5/3', 0, 1, 0], ['4/0', 2, 3, 2], ['4/3', 2, 1, 1], ['5/0', 2, 1, 0], ['6/0', 1, 0, 0], ['5/0', 2, 1, 0], ['6/0', 1, 0, 0]]),
    chords: 'Am:3 C:3 D:3 F:3 Am:3 C:3 E:3 E:3 Am:3 C:3 D:3 F:3 Am:3 E:3 Am:3 E:3',
    note: 'Pola petik bass–3–2–1–2–3 dalam birama 6/8. Jaga bass jatuh tepat di ketukan pertama tiap akor.',
  },
  {
    id: 'romance', cat: 'lagu', title: 'Romance (Spanish Romance)', by: 'Anonim (abad 19)', lvl: 3,
    key: 'E', scale: 'minor', bpm: 66, ts: 3, pos: 0, style: 'none',
    mel: trip([
      ['6/0', EM, ['1/7', '1/7', '1/7']], ['6/0', EM, ['1/7', '1/5', '1/3']], ['6/0', EM, ['1/3', '1/2', '1/0']], ['6/0', EM, ['1/0', '1/3', '1/7']],
      ['6/0', EM, ['1/12', '1/12', '1/12']], ['6/0', EM, ['1/12', '1/10', '1/8']], ['5/0', AM, ['1/8', '1/7', '1/5']], ['5/0', AM, ['1/5', '1/7', '1/8']],
      ['5/2', B7, ['1/7', '1/8', '1/7']], ['5/2', B7, ['1/5', '1/3', '1/2']], ['6/0', EM, ['1/0', '1/0', '1/0']],
    ]),
    chords: 'Em:3 Em:3 Em:3 Em:3 Em:3 Em:3 Am:3 Am:3 B7:3 B7:3 Em:3',
    note: 'Fingerstyle triplet: melodi di senar 1 (jari a), senar 2-3 terbuka (m-i), bass dengan jempol. Disederhanakan untuk 11 birama pertama.',
  },

  // ---------- Lick orisinal ----------
  {
    id: 'blues-a', cat: 'lick', title: 'Blues shuffle 12 bar', by: 'Lick orisinal · gaya Chicago blues', lvl: 2,
    key: 'A', scale: 'blues', bpm: 88, ts: 4, swing: true, style: 'shuffle', drums: true,
    mel: '3/7:1b~ 2/5:.5 1/5:.5 2/8:.5 2/5:.5 3/7 3/5:.5 3/7:.5h 3/8:.5 3/7:.5 4/7:2~ 1/5 2/8:.5 1/5:.5 2/8:1b~ 2/5 3/7:.5 3/5:.5p 4/7 4/5:.5 5/7:.5 6/5:1~ 1/8:1~ 1/5:.5 2/8:.5 2/5 3/7:1q 3/5:2~ r:2 2/5:.5 2/8:.5 1/5:.5 1/8:.5 1/5:.5 2/8:.5 2/5 3/7:1b~ 3/5 4/7:2~ 3/9 3/7:.5 3/5:.5 4/7 4/5 4/7:.5 3/5:.5 3/7:1b~ 2/5:2 1/5:.5 2/5:.5 3/7:.5 3/5:.5 4/7:.5 4/5:.5 5/7 5/7 4/6 5/7:2',
    chords: 'A7:4 D7:4 A7:4 A7:4 D7:4 D7:4 A7:4 A7:4 E7:4 D7:4 A7:4 E7:4',
    note: 'Box 1 pentatonik minor A di fret 5 + blue note Eb (fret 8 senar 3). Bend senar 3 fret 7 naik satu nada sampai terdengar sama dengan fret 9.',
  },
  {
    id: 'rock-e', cat: 'lick', title: 'Riff rock posisi terbuka', by: 'Lick orisinal · gaya hard rock 70-an', lvl: 1,
    key: 'E', scale: 'blues', bpm: 120, ts: 4, style: 'rock', drums: true,
    mel: '6/0:.5m 6/0:.5m 6/3:.5 6/0:.5m 5/2:.5 6/0:.5m 5/0:.5 5/2:.5 6/0:.5m 6/0:.5m 6/3:.5 6/0:.5m 5/0:.5 5/1:.5 5/2~ 6/3:.5 6/3:.5 5/0:.5 5/2:.5 4/0:.5 4/2:.5 5/2~ 4/0:.5 4/2:.5h 5/2:.5 5/0:.5 6/3:.5 6/0:1.5~',
    chords: 'E5:4 E5:4 G5:2 A5:2 E5:4',
    note: 'Pentatonik minor E di posisi terbuka + blue note Bb (senar 5 fret 1). Huruf m = palm mute: tempelkan sisi telapak di dekat bridge.',
  },
  {
    id: 'funk-a', cat: 'lick', title: 'Groove funk Dorian', by: 'Lick orisinal · gaya funk / R&B', lvl: 2,
    key: 'A', scale: 'dorian', bpm: 98, ts: 4, style: 'funk', drums: true,
    mel: 'r:.5 3/5:.25 3/7:.25 2/5:.5 2/7:.5 2/5:.5 3/7:.5 4/7 4/7:.5 4/4:.5 4/5:.5 3/4:.5 3/5:.5 3/4:.5p 4/7 2/7:.5 1/5:.5 2/8:.5 2/7:.5p 2/5:.5 3/7:.5 2/5:1~ 2/7:1~ 2/5:.5 3/7:.5 4/7:.5 4/4:.5 4/5',
    chords: 'Am7:4 D7:4 Am7:4 D7:4',
    note: 'A Dorian di fret 5: nada F# (6 mayor) jatuh tepat di 3 akor D7, inti suara funk. Main pendek dan bertitik.',
  },
  {
    id: 'country-g', cat: 'lick', title: 'Lick country pentatonik mayor', by: 'Lick orisinal · gaya country / bluegrass', lvl: 1,
    key: 'G', scale: 'pmaj', bpm: 116, ts: 4, style: 'country', drums: true,
    mel: '3/0:.5 3/2:.5h 2/0:.5 2/3:.5 1/0:.5 1/3:.5 2/3:.5 2/0:.5 3/2:.5 3/0:.5p 4/2:.5 4/0:.5 5/2:.5 6/3:1.5 2/1:.5 2/3:.5 1/0:.5 1/3:1~ 2/3:.5 2/1 3/2:.5 2/0:.5 2/3:.5 1/2:1~ 2/3:.5 3/2 3/0:.5 4/0:.5 4/2:.5 3/0:.5 2/0:2~',
    chords: 'G:4 G:4 C:4 D:4 G:4',
    note: 'Pentatonik mayor G di posisi terbuka. Ikuti nada akor: C saat akor C, F# saat akor D.',
  },
  {
    id: 'metal-e', cat: 'lick', title: 'Riff metal Phrygian', by: 'Lick orisinal · gaya heavy metal', lvl: 2,
    key: 'E', scale: 'phrygian', bpm: 140, ts: 4, style: 'rock', drums: true,
    mel: '6/0:.5m 6/0:.25m 6/0:.25m 6/1:.5 6/0:.5m 6/0:.25m 6/0:.25m 6/3:.5 6/1:.5 6/0:.5 6/0:.5m 6/0:.25m 6/0:.25m 5/0:.5 6/3:.5 6/1~ 6/0 4/2:.25 4/3:.25 4/5:.25 3/2:.25 3/4:.25 3/5:.25 2/3:.25 2/5:.25 2/6:.5 2/5:.5 3/4:1~ 6/1:.5 6/0:.5m 6/1:.5 6/0:.5m 6/3:.5 6/1:.5 6/0:1~',
    chords: 'E5:4 E5:2 F5:2 E5:4 F5:2 E5:2',
    note: 'Ciri Phrygian: interval b2 (E ke F, fret 0 ke 1). Ritme gallop 1/8 + dua 1/16 dengan palm mute.',
  },
  {
    id: 'flamenco-e', cat: 'lick', title: 'Kadens Andalusia', by: 'Lick orisinal · gaya flamenco / Timur Tengah', lvl: 2,
    key: 'E', scale: 'phrdom', bpm: 100, ts: 4, style: 'strum',
    mel: '1/0:.5 1/1:.5 1/4:.5 1/5:.5 1/4:.5 1/1:.5 1/0 2/3:.5 2/1:.5 2/0:.5 3/1:.5 3/2:.5 2/0:.5 2/1 2/1:.5 2/0:.5 3/2:.5 3/1:.5 4/3:.5 4/2:.5 4/3:1~ 4/2:.25 4/3:.25 3/1:.25 3/2:.25 2/0:.25 2/1:.25 1/0:.25 1/1:.25 1/0:2~',
    chords: 'Am:4 G:4 F:4 E:4',
    note: 'Phrygian dominan E (E F G# A B C D) di atas progresi Am–G–F–E. Interval b2 dan 3 mayor memberi rasa Spanyol/Arab, juga sering di dangdut dan gambus.',
  },
  {
    id: 'jazz-c', cat: 'lick', title: 'Garis bebop ii–V–I', by: 'Lick orisinal · gaya jazz swing', lvl: 3,
    key: 'C', scale: 'major', bpm: 132, ts: 4, swing: true, style: 'jazz', pos: 5,
    mel: 'D4:.5 F4:.5 A4:.5 C5:.5 B4:.5 A4:.5 G4:.5 F4:.5 B3:.5 D4:.5 F4:.5 A4:.5 G4:.5 F4:.5 E4:.5 D4:.5 E4 G4:.5 B4:.5 D5 B4 C5:2 r:2',
    chords: 'Dm7:4 G7:4 Cmaj7:4 Cmaj7:4',
    note: 'Arpeggio Dm7 naik lalu scale turun; di G7 mulai dari 3 (B) agar nada akor jatuh di ketukan, lalu resolusi ke 3 Cmaj7 (E).',
  },
  {
    id: 'ballad-d', cat: 'lick', title: 'Melodi ballad pentatonik', by: 'Lick orisinal · gaya pop ballad', lvl: 1,
    key: 'D', scale: 'pmaj', bpm: 76, ts: 4, style: 'ballad', pos: 0,
    mel: 'A4 F#4:.5 E4:.5 D4 B3 A3:1.5 B3:.5 D4 E4 F#4:2 E4:.5 D4:.5 B3 D4:2 E4:.5 F#4:.5 A3 D4:4~',
    chords: 'D:4 Bm:4 G:4 A:4 D:4',
    note: 'Pentatonik mayor D: nada aman di semua akor progresi I–vi–IV–V. Mainkan dengan vibrato lembut di nada panjang.',
  },

  // ---------- Latihan teknik ----------
  {
    id: 't-legato', cat: 'teknik', title: 'Hammer-on & pull-off', by: 'Latihan legato · pentatonik minor A', lvl: 1,
    key: 'A', scale: 'pmin', bpm: 80, ts: 4, style: 'none', metro: true,
    mel: '1/5:.5 1/8:.5h 2/5:.5 2/8:.5h 3/5:.5 3/7:.5h 4/5:.5 4/7:.5h 4/7:.5 4/5:.5p 3/7:.5 3/5:.5p 2/8:.5 2/5:.5p 1/8:.5 1/5:.5p',
    chords: 'Am:8',
    note: 'Petik nada pertama saja; nada kedua dibunyikan dengan memukul (hammer-on) atau menarik jari (pull-off). Volume kedua nada harus mirip.',
  },
  {
    id: 't-slide', cat: 'teknik', title: 'Slide', by: 'Latihan perpindahan posisi', lvl: 1,
    key: 'A', scale: 'pmin', bpm: 76, ts: 4, style: 'none', metro: true,
    mel: '3/5 3/7s 3/9s 3/7s 2/5 2/8s 2/10:2s 4/5 4/7s 3/5 3/7s 2/5:2~ r:2',
    chords: 'Am:16',
    note: 'Tekan senar dan geser tanpa mengurangi tekanan. Nada tujuan harus tetap berbunyi tanpa dipetik ulang.',
  },
  {
    id: 't-bend', cat: 'teknik', title: 'Bending & vibrato', by: 'Latihan kontrol pitch', lvl: 2,
    key: 'A', scale: 'pmin', bpm: 70, ts: 4, style: 'none', metro: true,
    mel: '3/9 3/7:1b 2/10 2/8:1b 3/7:2b~ 2/5:2~ 3/8 3/7:1q 2/8:1b~ 2/5 1/5:2~ 3/7:2~',
    chords: 'Am:16',
    note: 'Mainkan dulu nada target (fret 9), lalu bend fret 7 sampai sama tinggi. Pakai 2-3 jari untuk mendorong senar. Vibrato = bend kecil berulang.',
  },
  {
    id: 't-spider', cat: 'teknik', title: 'Alternate picking 1-2-3-4', by: 'Latihan kromatik (spider)', lvl: 1,
    key: 'A', scale: 'minor', bpm: 72, ts: 4, style: 'none', metro: true,
    mel: [6, 5, 4, 3, 2, 1].map((s) => [5, 6, 7, 8].map((f) => `${s}/${f}:.5`).join(' ')).join(' ') + ' ' + [1, 2, 3, 4, 5, 6].map((s) => [8, 7, 6, 5].map((f) => `${s}/${f}:.5`).join(' ')).join(' '),
    chords: '',
    note: 'Satu jari per fret (1-2-3-4) dengan pola petik bawah-atas. Naikkan tempo 4 BPM setiap kali bersih 3 kali berturut-turut.',
  },
  {
    id: 't-pm', cat: 'teknik', title: 'Palm mute & aksen', by: 'Latihan tangan kanan', lvl: 1,
    key: 'E', scale: 'pmin', bpm: 110, ts: 4, style: 'rock', drums: true,
    mel: '6/0:.5m 6/0:.5m 6/0:.5m 6/0:.5m 6/0:.5m 6/0:.5m 6/3 6/0:.5m 6/0:.5m 6/0:.5m 6/0:.5m 5/0 5/2 6/0:.5m 6/0:.5m 6/0:.5m 6/0:.5m 6/0:.5m 6/0:.5m 6/5 6/0:.5m 6/0:.5m 6/0:.5m 6/0:.5m 6/3 6/2',
    chords: 'E5:4 E5:4 E5:4 E5:4',
    note: 'Bunyi teredam (m) vs nada terbuka. Sisi telapak menempel tipis di saddle; terlalu jauh akan mematikan nada.',
  },
  {
    id: 't-sweep', cat: 'teknik', title: 'Sweep arpeggio 3 senar', by: 'Latihan arpeggio', lvl: 3,
    key: 'A', scale: 'minor', bpm: 66, ts: 4, style: 'none', metro: true,
    mel: '3/5:.333 2/5:.333 1/5:.333 1/8:.333h 1/5:.333p 2/5:.333 3/4:.333 2/3:.333 1/3:.333 1/7:.333h 1/3:.333p 2/3:.333 3/2:.333 2/1:.333 1/1:.333 1/5:.333h 1/1:.333p 2/1:.333 3/1:.333 2/0:.333 1/0:.333 1/4:.333h 1/0:.333p 2/0:.333',
    chords: 'Am:2 G:2 F:2 E:2',
    note: 'Satu gerakan pick menyapu ke bawah melewati 3 senar, lalu kembali ke atas. Angkat jari setelah tiap nada agar tidak berbunyi bersamaan.',
  },
  {
    id: 't-travis', cat: 'teknik', title: 'Fingerstyle Travis picking', by: 'Latihan bass bergantian', lvl: 2,
    key: 'C', scale: 'major', bpm: 84, ts: 4, style: 'none',
    mel: '5/3+1/0:.5 3/0:.5 4/2:.5 2/1:.5 6/3:.5 3/0:.5 4/2:.5 2/1:.5 5/3+1/0:.5 3/0:.5 4/2:.5 2/1:.5 6/3:.5 3/0:.5 4/2:.5 2/1:.5 6/3+1/3:.5 3/0:.5 4/0:.5 2/0:.5 5/2:.5 3/0:.5 4/0:.5 2/0:.5 6/3+1/3:.5 3/0:.5 4/0:.5 2/0:.5 5/2:.5 3/0:.5 4/0:.5 2/0:.5',
    chords: 'C:8 G:8',
    note: 'Jempol bergantian bass senar 5-4-6-4 di setiap ketukan, jari telunjuk dan tengah mengisi di antaranya.',
  },
];
