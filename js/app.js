import { h, icon, store, $, $$ } from './ui.js?v=20261030111205';
import { initTuner } from './tuner.js?v=20261030111205';
import { initScales } from './scales.js?v=20261030111205';
import { initSongs } from './songs.js?v=20261030111205';
import { initChords } from './chords.js?v=20261030111205';
import { initPractice } from './practice.js?v=20261030111205';
import { initLessons } from './lessons.js?v=20261030111205';
import { SONGS } from './songdata.js?v=20261030111205';
import { ac } from './audio.js?v=20261030111205';

const PAGES = [
  { id: 'tuner', name: 'Tuner', ic: 'tuner', init: initTuner },
  { id: 'scales', name: 'Scale', ic: 'scale', init: initScales },
  { id: 'songs', name: 'Melodi', ic: 'music', init: (el) => initSongs(el, { onScale: (key, scale) => go({ page: 'scales', key, scale, pos: 1 }) }) },
  { id: 'chords', name: 'Kunci', ic: 'chord', init: initChords },
  { id: 'practice', name: 'Latihan', ic: 'practice', init: initPractice },
  { id: 'lessons', name: 'Kurikulum', ic: 'path', init: (el) => initLessons(el, { go }) },
];
const ready = new Set();

function build(id) {
  const p = PAGES.find((x) => x.id === id);
  const el = $('#page-' + id);
  el.stopAll?.(); el.stopTuner?.();
  el.innerHTML = '';
  p.init(el);
  ready.add(id);
}

function show(id) {
  if (!PAGES.some((p) => p.id === id)) id = 'tuner';
  for (const p of PAGES) {
    const el = $('#page-' + p.id);
    if (p.id !== id) { el.stopAll?.(); el.stopTuner?.(); }
    el.hidden = p.id !== id;
  }
  if (!ready.has(id)) build(id);
  for (const a of $$('.nav a')) a.classList.toggle('on', a.dataset.p === id);
  store.set('page', id);
  window.scrollTo(0, 0);
}

export function go(o) {
  if (o.page === 'scales') { if (o.key) store.set('sc.key', o.key); if (o.scale) store.set('sc.scale', o.scale); if (o.pos != null) store.set('sc.pos', o.pos); }
  if (o.page === 'chords') { if (o.tab) store.set('ch.tab', o.tab); if (o.root) store.set('ch.root', o.root); if (o.qual != null) store.set('ch.qual', o.qual); }
  if (o.page === 'practice' && o.tab) store.set('pr.tab', o.tab);
  if (o.page === 'songs' && o.id) { store.set('song.id', o.id); store.set('song.cat', SONGS.find((s) => s.id === o.id)?.cat || 'lagu'); }
  if (ready.has(o.page) && o.page !== 'tuner') ready.delete(o.page);
  if (location.hash === '#' + o.page) show(o.page); else location.hash = o.page;
}

function theme(t) {
  document.documentElement.dataset.theme = t === 'auto' ? '' : t;
  if (t === 'auto') delete document.documentElement.dataset.theme;
  store.set('theme', t);
  const tb = $('#themeBtn');
  if (tb) tb.innerHTML = icon(t === 'dark' ? 'moon' : t === 'light' ? 'sun' : 'sun') + `<span>${t === 'auto' ? 'Auto' : t === 'dark' ? 'Gelap' : 'Terang'}</span>`;
}

function boot() {
  const nav = $('.nav');
  for (const p of PAGES) nav.append(h('a', { href: '#' + p.id, 'data-p': p.id, html: icon(p.ic) + `<span>${p.name}</span>` }));
  const main = $('main');
  for (const p of PAGES) main.append(h('div', { id: 'page-' + p.id, class: 'page', hidden: true }));
  $('#themeBtn').addEventListener('click', () => { const order = ['auto', 'light', 'dark']; const cur = store.get('theme', 'auto'); theme(order[(order.indexOf(cur) + 1) % 3]); });
  theme(store.get('theme', 'auto'));
  // buka AudioContext pada interaksi pertama (kebijakan autoplay)
  const unlock = () => { ac(); window.removeEventListener('pointerdown', unlock); };
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('hashchange', () => show(location.hash.slice(1)));
  show(location.hash.slice(1) || store.get('page', 'tuner'));
}
boot();
