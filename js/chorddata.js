// Data kunci gitar: bentuk terbuka (tetap) + bentuk geser (movable) untuk semua root.
import { STD, pcOf, mod12, noteName, useFlats, QUAL, ROOTS } from './music.js?v=20261030111205';

const X = -1;
// Kunci terbuka. f = fret senar 6 -> 1, g = jari (0 = terbuka/mute, 5 = jempol)
const OPEN = [
  ['C', '', [X, 3, 2, 0, 1, 0], [0, 3, 2, 0, 1, 0], 1],
  ['D', '', [X, X, 0, 2, 3, 2], [0, 0, 0, 1, 3, 2], 1],
  ['E', '', [0, 2, 2, 1, 0, 0], [0, 2, 3, 1, 0, 0], 1],
  ['G', '', [3, 2, 0, 0, 0, 3], [2, 1, 0, 0, 0, 3], 1],
  ['G', '', [3, 2, 0, 0, 3, 3], [2, 1, 0, 0, 3, 4], 2],
  ['A', '', [X, 0, 2, 2, 2, 0], [0, 0, 1, 2, 3, 0], 1],
  ['A', 'm', [X, 0, 2, 2, 1, 0], [0, 0, 2, 3, 1, 0], 1],
  ['D', 'm', [X, X, 0, 2, 3, 1], [0, 0, 0, 2, 3, 1], 1],
  ['E', 'm', [0, 2, 2, 0, 0, 0], [0, 2, 3, 0, 0, 0], 1],
  ['F', '', [X, X, 3, 2, 1, 1], [0, 0, 3, 2, 1, 1], 1, { fret: 1, from: 4, to: 5 }],
  ['E', '7', [0, 2, 0, 1, 0, 0], [0, 2, 0, 1, 0, 0], 1],
  ['A', '7', [X, 0, 2, 0, 2, 0], [0, 0, 2, 0, 3, 0], 1],
  ['D', '7', [X, X, 0, 2, 1, 2], [0, 0, 0, 2, 1, 3], 1],
  ['G', '7', [3, 2, 0, 0, 0, 1], [3, 2, 0, 0, 0, 1], 1],
  ['C', '7', [X, 3, 2, 3, 1, 0], [0, 3, 2, 4, 1, 0], 1],
  ['B', '7', [X, 2, 1, 2, 0, 2], [0, 2, 1, 3, 0, 4], 1],
  ['A', 'm7', [X, 0, 2, 0, 1, 0], [0, 0, 2, 0, 1, 0], 1],
  ['E', 'm7', [0, 2, 0, 0, 0, 0], [0, 2, 0, 0, 0, 0], 1],
  ['E', 'm7', [0, 2, 2, 0, 3, 0], [0, 1, 2, 0, 3, 0], 2],
  ['D', 'm7', [X, X, 0, 2, 1, 1], [0, 0, 0, 2, 1, 1], 1],
  ['C', 'maj7', [X, 3, 2, 0, 0, 0], [0, 3, 2, 0, 0, 0], 1],
  ['F', 'maj7', [X, X, 3, 2, 1, 0], [0, 0, 3, 2, 1, 0], 1],
  ['A', 'maj7', [X, 0, 2, 1, 2, 0], [0, 0, 2, 1, 3, 0], 1],
  ['D', 'maj7', [X, X, 0, 2, 2, 2], [0, 0, 0, 1, 1, 1], 1],
  ['G', 'maj7', [3, 2, 0, 0, 0, 2], [3, 2, 0, 0, 0, 1], 2],
  ['D', 'sus2', [X, X, 0, 2, 3, 0], [0, 0, 0, 1, 3, 0], 1],
  ['D', 'sus4', [X, X, 0, 2, 3, 3], [0, 0, 0, 1, 3, 4], 1],
  ['A', 'sus2', [X, 0, 2, 2, 0, 0], [0, 0, 1, 2, 0, 0], 1],
  ['A', 'sus4', [X, 0, 2, 2, 3, 0], [0, 0, 1, 2, 3, 0], 1],
  ['E', 'sus4', [0, 2, 2, 2, 0, 0], [0, 2, 3, 4, 0, 0], 1],
  ['C', 'add9', [X, 3, 2, 0, 3, 3], [0, 2, 1, 0, 3, 4], 2],
  ['G', '6', [3, 2, 0, 0, 0, 0], [2, 1, 0, 0, 0, 0], 2],
  ['E', '5', [0, 2, 2, X, X, X], [0, 1, 2, 0, 0, 0], 1],
  ['A', '5', [X, 0, 2, 2, X, X], [0, 0, 1, 2, 0, 0], 1],
  ['D', '5', [X, X, 0, 2, 3, X], [0, 0, 0, 1, 3, 0], 1],
  ['G', '', [X, 2, 0, 0, 0, 3], [0, 1, 0, 0, 0, 3], 2, null, 'B'],
  ['D', '', [2, X, 0, 2, 3, 2], [5, 0, 0, 1, 3, 2], 2, null, 'F#'],
  ['C', '', [3, 3, 2, 0, 1, 0], [3, 4, 2, 0, 1, 0], 2, null, 'G'],
  ['A', 'm', [3, 0, 2, 2, 1, 0], [3, 0, 2, 3, 1, 0], 2, null, 'G'],
  ['E', 'm9', [0, 2, 0, 0, 0, 2], [0, 2, 0, 0, 0, 3], 3],
  ['A', 'm9', [X, 0, 5, 5, 0, 0], [0, 0, 2, 3, 0, 0], 3],
  ['E', '7#9', [0, 7, 6, 7, 8, X], [0, 2, 1, 3, 4, 0], 3],
];

// Bentuk geser: offset relatif fret root. rs = senar root (0 = senar 6).
// lvl 2 = menengah, 3 = lanjut.
const _ = null;
const MOVE = [
  // root senar 6 (bentuk E)
  ['', 0, [0, 2, 2, 1, 0, 0], [1, 3, 4, 2, 1, 1], 2, 'Bentuk E (barre)', true],
  ['m', 0, [0, 2, 2, 0, 0, 0], [1, 3, 4, 1, 1, 1], 2, 'Bentuk Em (barre)', true],
  ['7', 0, [0, 2, 0, 1, 0, 0], [1, 3, 1, 2, 1, 1], 2, 'Bentuk E7 (barre)', true],
  ['m7', 0, [0, 2, 0, 0, 0, 0], [1, 3, 1, 1, 1, 1], 2, 'Bentuk Em7 (barre)', true],
  ['sus4', 0, [0, 2, 2, 2, 0, 0], [1, 2, 3, 4, 1, 1], 2, 'Bentuk Esus4', true],
  ['5', 0, [0, 2, 2, _, _, _], [1, 3, 4, 0, 0, 0], 2, 'Power chord root 6'],
  ['maj7', 0, [0, _, 1, 1, 0, _], [2, 0, 3, 4, 1, 0], 3, 'Maj7 drop-3, root 6'],
  ['7', 0, [0, _, 0, 1, 0, _], [2, 0, 3, 4, 1, 0], 3, 'Dom7 drop-3, root 6'],
  ['m7', 0, [0, _, 0, 0, 0, _], [2, 0, 3, 3, 3, 0], 3, 'm7 drop-3, root 6'],
  ['m7b5', 0, [0, _, 0, 0, -1, _], [2, 0, 3, 4, 1, 0], 3, 'm7b5 root 6'],
  ['dim7', 0, [0, _, -1, 0, -1, _], [2, 0, 1, 3, 1, 0], 3, 'dim7 root 6'],
  ['6', 0, [0, _, -1, 1, 0, _], [2, 0, 1, 4, 3, 0], 3, '6 root 6'],
  ['m6', 0, [0, _, -1, 0, 0, _], [2, 0, 1, 3, 4, 0], 3, 'm6 root 6'],
  ['13', 0, [0, _, 0, 1, 2, _], [1, 0, 2, 3, 4, 0], 3, '13 root 6'],
  ['7', 0, [0, _, 0, 1, _, _], [2, 0, 3, 4, 0, 0], 3, 'Shell 1-b7-3'],
  ['maj7', 0, [0, _, 1, 1, _, _], [2, 0, 3, 4, 0, 0], 3, 'Shell 1-7-3'],
  // root senar 5 (bentuk A)
  ['', 1, [_, 0, 2, 2, 2, 0], [0, 1, 3, 3, 3, 1], 2, 'Bentuk A (barre)', true],
  ['m', 1, [_, 0, 2, 2, 1, 0], [0, 1, 3, 4, 2, 1], 2, 'Bentuk Am (barre)', true],
  ['7', 1, [_, 0, 2, 0, 2, 0], [0, 1, 3, 1, 4, 1], 2, 'Bentuk A7 (barre)', true],
  ['m7', 1, [_, 0, 2, 0, 1, 0], [0, 1, 3, 1, 2, 1], 2, 'Bentuk Am7 (barre)', true],
  ['maj7', 1, [_, 0, 2, 1, 2, 0], [0, 1, 3, 2, 4, 1], 2, 'Bentuk Amaj7 (barre)', true],
  ['sus2', 1, [_, 0, 2, 2, 0, 0], [0, 1, 3, 4, 1, 1], 2, 'Bentuk Asus2', true],
  ['sus4', 1, [_, 0, 2, 2, 3, 0], [0, 1, 2, 3, 4, 1], 2, 'Bentuk Asus4', true],
  ['5', 1, [_, 0, 2, 2, _, _], [0, 1, 3, 4, 0, 0], 2, 'Power chord root 5'],
  ['add9', 1, [_, 0, -1, -3, 0, _], [0, 3, 2, 1, 4, 0], 3, 'add9 root 5'],
  ['9', 1, [_, 0, -1, 0, 0, 0], [0, 2, 1, 3, 3, 3], 3, '9 root 5'],
  ['7#9', 1, [_, 0, -1, 0, 1, _], [0, 2, 1, 3, 4, 0], 3, '7#9 root 5'],
  ['7b9', 1, [_, 0, -1, 0, -1, _], [0, 2, 1, 3, 1, 0], 3, '7b9 root 5'],
  ['m9', 1, [_, 0, -2, 0, 0, _], [0, 2, 1, 3, 4, 0], 3, 'm9 root 5'],
  ['maj9', 1, [_, 0, -1, 1, 0, _], [0, 2, 1, 4, 3, 0], 3, 'maj9 root 5'],
  ['6/9', 1, [_, 0, -1, -1, 0, 0], [0, 2, 1, 1, 3, 4], 3, '6/9 root 5'],
  ['m11', 1, [_, 0, 0, 0, 1, 0], [0, 1, 1, 1, 2, 1], 3, 'm11 root 5', true],
  ['m7b5', 1, [_, 0, 1, 0, 1, _], [0, 1, 3, 2, 4, 0], 3, 'm7b5 root 5'],
  ['dim7', 1, [_, 0, 1, -1, 1, _], [0, 2, 3, 1, 4, 0], 3, 'dim7 root 5'],
  ['aug', 1, [_, 0, -1, -2, -2, _], [0, 4, 3, 1, 2, 0], 3, 'aug root 5'],
  ['13', 1, [_, 0, _, 0, 2, 2], [0, 1, 0, 2, 3, 4], 3, '13 root 5'],
  ['maj7', 1, [_, 0, 2, 1, 2, _], [0, 1, 3, 2, 4, 0], 3, 'maj7 drop-2, root 5'],
  ['m7', 1, [_, 0, _, 0, 1, 0], [0, 2, 0, 3, 4, 1], 3, 'm7 drop-2, root 5'],
  // root senar 4 (bentuk D)
  ['', 2, [_, _, 0, 2, 3, 2], [0, 0, 1, 2, 4, 3], 2, 'Bentuk D'],
  ['m', 2, [_, _, 0, 2, 3, 1], [0, 0, 1, 3, 4, 2], 2, 'Bentuk Dm'],
  ['7', 2, [_, _, 0, 2, 1, 2], [0, 0, 1, 3, 2, 4], 2, 'Bentuk D7'],
  ['m7', 2, [_, _, 0, 2, 1, 1], [0, 0, 1, 3, 2, 2], 2, 'Bentuk Dm7'],
  ['maj7', 2, [_, _, 0, 2, 2, 2], [0, 0, 1, 3, 3, 3], 2, 'Bentuk Dmaj7'],
  ['m7b5', 2, [_, _, 0, 1, 1, 1], [0, 0, 1, 2, 2, 2], 3, 'm7b5 root 4'],
  ['dim7', 2, [_, _, 0, 1, 0, 1], [0, 0, 2, 3, 1, 4], 3, 'dim7 root 4'],
  ['6', 2, [_, _, 0, 2, 0, 2], [0, 0, 1, 3, 1, 4], 3, '6 root 4'],
];

export const LEVELS = [{ id: 1, name: 'Dasar' }, { id: 2, name: 'Menengah' }, { id: 3, name: 'Lanjut' }];

function finalize(v) {
  v.midi = v.frets.map((f, s) => (f < 0 ? null : STD[s] + f));
  const rp = pcOf(v.root);
  v.roots = v.frets.map((f, s) => (f >= 0 && mod12(STD[s] + f) === rp ? s : -1)).filter((s) => s >= 0);
  v.name = v.root + v.qual + (v.bass ? '/' + v.bass : '');
  return v;
}

export const OPEN_CHORDS = OPEN.map(([root, qual, frets, fingers, lvl, barre, bass]) => finalize({ root, qual, frets, fingers, lvl, barre: barre || null, bass: bass || null, kind: 'open', label: bass ? 'Slash chord' : lvl === 1 ? 'Posisi terbuka' : 'Variasi terbuka' }));

// Semua voicing untuk root + kualitas.
export function voicingsFor(root, qual) {
  const rpc = pcOf(root);
  const out = OPEN_CHORDS.filter((v) => pcOf(v.root) === rpc && v.qual === qual && !v.bass).map((v) => ({ ...v, root }));
  for (const [q, rs, off, fg, lvl, label, barre] of MOVE) {
    if (q !== qual) continue;
    const lo = Math.min(...off.filter((o) => o != null));
    let r = mod12(rpc - STD[rs]);
    if (r + lo < 1) r += 12;
    const frets = off.map((o) => (o == null ? X : r + o));
    if (Math.max(...frets) > 17) continue;
    if (out.some((v) => v.frets.join() === frets.join())) continue;
    out.push(finalize({ root, qual, frets, fingers: fg.slice(), lvl, label: `${label} · fret ${r}`, barre: barre ? { fret: r, from: rs, to: 5 } : null, kind: 'move' }));
  }
  return out;
}

// Voicing paling nyaman untuk iringan (terbuka dulu, lalu fret terendah).
export function bestVoicing(name) {
  const m = /^([A-G][#b]?)(.*?)(?:\/([A-G][#b]?))?$/.exec(name);
  if (!m) return null;
  const [, root, qual, bass] = m;
  if (bass) {
    const s = OPEN_CHORDS.find((v) => pcOf(v.root) === pcOf(root) && v.qual === qual && v.bass && pcOf(v.bass) === pcOf(bass));
    if (s) return s;
  }
  const list = voicingsFor(root, QUAL[qual] ? qual : '');
  if (!list.length) return null;
  const score = (v) => (v.kind === 'open' ? (v.lvl === 1 ? 0 : 1) : 2) + Math.max(...v.frets) * 0.15 + (v.frets.filter((f) => f < 0).length > 2 ? 1 : 0);
  const best = list.slice().sort((a, b) => score(a) - score(b))[0];
  if (bass) return { ...best, bassMidi: 36 + pcOf(bass) + (pcOf(bass) < 4 ? 12 : 0) };
  return best;
}

export const QUALS_BY_LEVEL = [
  { lvl: 1, list: ['', 'm', '7', 'm7', 'maj7', 'sus2', 'sus4', '5'] },
  { lvl: 2, list: ['', 'm', '7', 'm7', 'maj7', 'sus2', 'sus4', '5', 'add9', '6'] },
  { lvl: 3, list: ['9', 'maj9', 'm9', '13', '7#9', '7b9', '6/9', 'm11', 'm7b5', 'dim7', 'aug', '6', 'm6'] },
];

export function rootLabel(pc) { return ROOTS[mod12(pc)]; }
export { noteName, useFlats };
