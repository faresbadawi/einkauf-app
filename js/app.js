import { createStore } from './store.js';
import { workerUrl } from './config.js';
import { t, getLang, setLang, applyLang, LANGS } from './i18n.js';
import { CATS, CAT, CAT_ORDER, PRODUCTS, PRODUCT, norm, search, findProduct } from './catalog.js';
import { demoRecipes } from './demo.js';
import { OLD_LIST } from './oldlist.js';

/* ---------- Helfer ---------- */
const $ = (s, r = document) => r.querySelector(s);
const uid = () => Array.from(crypto.getRandomValues(new Uint8Array(8)), b => b.toString(16).padStart(2, '0')).join('');
const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newCode = () => Array.from(crypto.getRandomValues(new Uint8Array(10)), b => ALPHA[b % 32]).join('');
const fmtCode = c => c.replace(/(.{5})(.{5})/, '$1-$2');
const normCode = c => c.toUpperCase().replace(/[^A-Z0-9]/g, '');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const isAr = s => /[؀-ۿ]/.test(s);
const WORKER = (localStorage.getItem('ut:worker') ?? workerUrl).trim().replace(/\/?$/, '/').replace(/^\/$/, '');
const gkey = () => { try { return localStorage.getItem('ut:gkey') || ''; } catch { return ''; } };
const aiHeaders = json => ({ ...(json ? { 'Content-Type': 'application/json' } : {}), ...(gkey() ? { 'X-Gemini-Key': gkey() } : {}) });

const IC = {
  bag: 'M5.5 8h13l1 12h-15l1-12zM9 8V7a3 3 0 0 1 6 0v1',
  book: 'M5 4.5h10.5A2.5 2.5 0 0 1 18 7v12.500H7.500A2.500 2.500 0 0 1 5 17V4.500zM5 17a2.500 2.500 0 0 1 2.500-2.500H18M9 8.500h5',
  cal: 'M4.500 6.500h15v13h-15zM4.500 10.500h15M8.500 4v4M15.500 4v4',
  sliders: 'M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4',
  grid: 'M4.500 4.500h6v6h-6zM13.500 4.500h6v6h-6zM4.500 13.500h6v6h-6zM13.500 13.500h6v6h-6z',
  plus: 'M12 5v14M5 12h14', minus: 'M5 12h14', close: 'M6 6l12 12M18 6L6 18', check: 'M5 12.500l4.500 4.500L19 7.500',
  search: 'M11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM20 20l-4.500-4.500',
  heart: 'M12 20s-7.500-4.600-7.500-10.200A4.300 4.300 0 0 1 12 7.200a4.300 4.300 0 0 1 7.500 2.600C19.500 15.400 12 20 12 20z',
  back: 'M15 5l-7 7 7 7', fwd: 'M9 5l7 7-7 7', up: 'M5 15l7-7 7 7', down: 'M5 9l7 7 7-7',
  dots: 'M6 12h.01M12 12h.01M18 12h.01',
  trash: 'M5 7h14M10 7V4.500h4V7M7 7l1 12.500h8L17 7',
  edit: 'M4.500 19.500h4L19 9l-4-4L4.500 15.500v4zM13 7l4 4',
  share: 'M12 15V4M8 8l4-4 4 4M5 13v6.500h14V13',
  spark: 'M11 4l1.800 5.200L18 11l-5.200 1.800L11 18l-1.800-5.200L4 11l5.200-1.800zM18.500 15.500l.7 1.800 1.800.7-1.800.7-.7 1.800-.7-1.800-1.800-.7 1.800-.7z',
  shuffle: 'M4 7h3l10 10h3M4 17h3l2.500-2.500M14.500 9.500L17 7h3M18 4.500L20.500 7 18 9.500M18 14.500l2.500 2.500-2.500 2.500',
  globe: 'M12 3.500a8.500 8.500 0 1 0 0 17 8.500 8.500 0 0 0 0-17zM3.500 12h17M12 3.500c3 3 3 14 0 17M12 3.500c-3 3-3 14 0 17',
  store: 'M4.500 9.500L6 4.500h12l1.500 5M4.500 9.500v10h15v-10M4.500 9.500h15M9.500 19.500v-5.500h5v5.500',
  home: 'M4.500 11L12 4.500 19.500 11v8.500h-15zM9.500 19.500v-5h5v5',
  bell: 'M6 16.500V11a6 6 0 0 1 12 0v5.500l1.500 1.500h-15zM10 20.500h4',
  list: 'M9 6.500h11M9 12h11M9 17.500h11M4.500 6.500h.01M4.500 12h.01M4.500 17.500h.01',
  qr: 'M4.500 4.500h6v6h-6zM13.500 4.500h6v6h-6zM4.500 13.500h6v6h-6zM14 14h2v2h-2zM18 18h1.500v1.500H18zM14 18.500h2M18.500 14v2.500',
  scan: 'M4 8V5.500A1.500 1.500 0 0 1 5.500 4H8M16 4h2.500A1.500 1.500 0 0 1 20 5.500V8M20 16v2.500a1.500 1.500 0 0 1-1.500 1.500H16M8 20H5.500A1.500 1.500 0 0 1 4 18.500V16M4 12h16',
  user: 'M12 12a3.800 3.800 0 1 0 0-7.600 3.800 3.800 0 0 0 0 7.600zM4.500 20c.8-3.600 3.800-5.600 7.500-5.600s6.700 2 7.500 5.600',
  install: 'M12 4v11M7.500 10.500L12 15l4.500-4.500M5 19.500h14',
  clock: 'M12 3.500a8.500 8.500 0 1 0 0 17 8.500 8.500 0 0 0 0-17zM12 7.500V12l3 2',
  link: 'M10 14a4 4 0 0 0 5.700 0l3-3A4 4 0 0 0 13 5.300l-1 1M14 10a4 4 0 0 0-5.700 0l-3 3A4 4 0 0 0 11 18.700l1-1'
};
const ico = n => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="${IC[n].replace(/(\d)00(?=\D|$)/g, '$1')}"/></svg>`;

/* ---------- Zustand ---------- */
const S = {
  tab: 'list', items: [], recipes: [], plan: [], stores: [], prefs: [], custom: [], meta: [],
  storeF: '', doneOpen: false, q: '', rcat: 'all', fav: false, week: 0,
  net: { state: 'local', peers: 1, synced: true }, ai: null
};
let store, code;
let storeMap = new Map(), prefMap = new Map(), customMap = new Map(), allProducts = PRODUCTS;

const STD = [
  { id: 's-arab', std: 'arab', emoji: '🧆', color: 1 }, { id: 's-super', std: 'super', emoji: '🛒', color: 0 },
  { id: 's-dm', std: 'dm', emoji: '🧴', color: 2 }, { id: 's-ross', std: 'ross', emoji: '💊', color: 6 }
];
const COLORS = ['#2f7d5b', '#c2703d', '#3b6fb5', '#b0468a', '#8a6d1f', '#5b5fc7', '#c0392b', '#3a8f8f', '#e0a526', '#7a4fd1', '#1f8fd6', '#d1495b', '#5c8a2f', '#9a6b4f', '#2b3a55', '#e06c9f', '#00a6a6', '#6d6d6d'];
const EMOJIS = ['🛒', '🛍️', '🏪', '🏬', '🧺', '📦', '🧆', '🥙', '🫓', '🌙', '🕌', '🧴', '💊', '🧼', '🪥', '💄', '🥬', '🍎', '🍅', '🥕', '🌿', '🥩', '🍗', '🐟', '🥖', '🥐', '🧀', '🥛', '🥚', '🍫', '🍪', '☕', '🍵', '🧃', '❄️', '🌶️', '🫒', '🍯', '🌾', '🐑', '🇩🇪', '🇹🇷', '🇸🇾', '🇱🇧', '🇮🇶', '🇮🇹', '🇵🇱', '🏠', '⭐', '❤️', '💚', '💙', '🔥', '🎁'];
const RCATS = [['all', '🍽️'], ['main', '🥘'], ['starter', '🥙'], ['salad', '🥗'], ['soup', '🍲'], ['breakfast', '🍳'], ['dessert', '🍰']];
const LEGACY_RCAT = { Hauptgerichte: 'main', Salate: 'salad', Suppen: 'soup', 'Frühstück': 'breakfast', Desserts: 'dessert' };
const rcatOf = r => LEGACY_RCAT[r.category] || (RCATS.some(c => c[0] === r.category) ? r.category : 'main');

function derive() {
  storeMap = new Map(S.stores.map(s => [s.id, s]));
  prefMap = new Map(S.prefs.map(p => [p.id, p.store]));
  const cust = S.custom.filter(c => !PRODUCT[c.id]).map(c => ({ ...c, cat: CAT[c.cat] ? c.cat : 'sonst', custom: true, n: [norm(c.de), norm(c.ar), norm(c.en)].filter(Boolean) }));
  customMap = new Map(cust.map(c => [c.id, c]));
  allProducts = [...PRODUCTS, ...cust];
}
const prod = key => PRODUCT[key] || customMap.get(key);
const pName = p => p[getLang()] || (getLang() === 'ar' ? p.ar : p.de) || p.de || p.en || p.ar || '';
const itemName = i => { const p = prod(i.key); return p ? pName(p) : i.name; };
const itemEmoji = i => prod(i.key)?.emoji || '🛒';
const itemCat = i => prod(i.key)?.cat || 'sonst';
const catName = id => CAT[id][getLang()] || CAT[id].de;
const stores = () => [...S.stores].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
const storeName = s => s.name || (s.std ? t('store_' + s.std) : '');
const storeColor = s => COLORS[(s.color || 0) % COLORS.length];
const itemStore = i => storeMap.has(i.store) ? i.store : '';
const recipe = id => S.recipes.find(r => r.id === id);

function toast(msg, act) {
  const el = $('#toast');
  el.innerHTML = `<span>${esc(msg)}</span>${act ? `<button>${esc(act.label)}</button>` : ''}`;
  if (act) el.querySelector('button').onclick = () => { act.fn(); el.classList.add('hidden'); };
  el.classList.remove('hidden');
  clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.add('hidden'), act ? 5000 : 2400);
}

/* ---------- Ton & Vibration ---------- */
/* Töne einzeln schaltbar: Abhaken, Tippen (standardmäßig aus), Löschen, Verschieben, Vibration */
const SND_DEF = { check: 1, tap: 0, del: 1, move: 1, vib: 1 };
const snd = () => { try { return { ...SND_DEF, ...(localStorage.getItem('ut:fx') === '0' ? { check: 0, del: 0, move: 0, vib: 0 } : {}), ...JSON.parse(localStorage.getItem('ut:snd') || '{}') }; } catch { return { ...SND_DEF }; } };
const setSnd = (k, v) => { try { localStorage.setItem('ut:snd', JSON.stringify({ ...snd(), [k]: v ? 1 : 0 })); } catch {} };
const fxOn = () => Object.values(snd()).some(Boolean);
const vib = ms => { if (!snd().vib) return; try { navigator.vibrate?.(ms); } catch {} };
let hapEl = null, actx = null;
/** iPhone (iOS 18+): kurzes haptisches Feedback über einen versteckten Schalter */
function haptic() {
  if (!snd().vib || 'vibrate' in navigator) return;
  try {
    if (!hapEl) { hapEl = document.createElement('label'); hapEl.className = 'hap'; hapEl.innerHTML = '<input type="checkbox" switch>'; document.body.append(hapEl); }
    hapEl.click();
  } catch {}
}
/* Klänge werden live erzeugt (WebAudio) – weich und kurz, ähnlich wie bei iOS */
function ac() {
  actx ||= new (window.AudioContext || window.webkitAudioContext)();
  if (actx.state === 'suspended') actx.resume();
  if (!ac.out) { // sanfter Tiefpass + Kompressor für einen runden, "teuren" Klang
    const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 6500;
    const cp = actx.createDynamicsCompressor(); cp.threshold.value = -18; cp.ratio.value = 4;
    lp.connect(cp).connect(actx.destination); ac.out = lp;
  }
  return actx;
}
/** Marimba-artiger Ton: Grundton + kurzer heller Anschlag */
function note(f, at, vol = .2, len = .32) {
  const c = actx, t0 = c.currentTime + at;
  for (const [mul, v, d] of [[1, vol, len], [4, vol * .22, .045], [2.01, vol * .12, len * .4]]) {
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.value = f * mul;
    g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(v, t0 + .004); g.gain.exponentialRampToValueAtTime(.0001, t0 + d);
    o.connect(g).connect(ac.out); o.start(t0); o.stop(t0 + d + .02);
  }
}
/** Kurzes Rauschen durch einen Filter – für Klick und Wisch-Geräusch */
function noise(len, f1, f2, vol, q = 1.2) {
  const c = actx, n = Math.ceil(c.sampleRate * len), buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
  const src = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain(), t0 = c.currentTime;
  src.buffer = buf; bp.type = 'bandpass'; bp.Q.value = q; bp.frequency.setValueAtTime(f1, t0); bp.frequency.exponentialRampToValueAtTime(f2, t0 + len);
  g.gain.value = vol; src.connect(bp).connect(g).connect(ac.out); src.start();
}
const sfx = {
  tap() { noise(.008, 2600, 2200, .16, .9); },
  on() { note(1318.5, 0, .16); note(1975.5, .075, .13, .4); },
  off() { note(880, 0, .1, .2); },
  swoosh() { noise(.22, 700, 3800, .35, .7); },
  drop() { note(659.3, 0, .14); note(987.8, .06, .12); },
  join() { note(784, 0, .15); note(1046.5, .09, .14); note(1568, .18, .13, .5); }
};
const SND_OF = { tap: 'tap', on: 'check', off: 'check', join: 'check', swoosh: 'del', drop: 'move' };
function play(name) { if (!snd()[SND_OF[name]]) return; try { ac(); sfx[name](); } catch {} }
function tick(on) { vib(on ? 14 : 8); haptic(); play(on ? 'on' : 'off'); }

/* ---------- Mengen ---------- */
const UNITS = 'kg|g|ml|cl|l|EL|TL|tbsps?|tsps?|cups?|cloves?|bunch(?:es)?|tins?|cans?|pinch(?:es)?|pieces?|slices?|Stk\\.?|Stück|Bund|Dosen?|Pck\\.?|Packung(?:en)?|Zehen?|Prisen?|Tassen?|Gläser|Glas|Scheiben?|Becher|Flaschen?|Beutel|ملعقة كبيرة|ملعقة صغيرة|ملاعق كبيرة|ملاعق صغيرة|أكواب|كوب|كيلو|كغ|غرام|غ|مل|لتر|ل|حبات|حبة|قطعة|قطع|رشة|فصوص|فص|حزمة|علبة|عود|قرن';
const QRE = new RegExp(`^(\\d+\\s*/\\s*\\d+|\\d+(?:[.,]\\d+)?|[½¼¾])\\s*(?:(${UNITS})\\s+)?(.+)$`, 'i');
const latin = s => s.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/٫/g, '.');
/** "500 g Nudeln" -> {num, unit, name} */
function parseLine(s) {
  s = latin(String(s)).trim().replace(/\s+/g, ' ');
  const m = s.match(QRE);
  if (!m) return { num: null, unit: '', name: s };
  const fr = m[1].split('/');
  const num = { '½': .5, '¼': .25, '¾': .75 }[m[1]] ?? (fr.length === 2 ? fr[0] / fr[1] : parseFloat(m[1].replace(',', '.')));
  return { num, unit: m[2] || '', name: m[3] };
}
const fmtNum = n => String(Math.round(n * 100) / 100).replace('.', getLang() === 'de' ? ',' : '.');
const fmtQty = (num, unit) => num == null ? '' : `${fmtNum(num)}${unit ? ' ' + unit : ''}`;
/** Hochgerechnete Mengen auf einkaufbare Werte runden (z. B. 1,25 Zitronen -> 2, 3,75 EL -> 4 EL) */
function niceNum(n, unit) {
  if (n == null) return n;
  if (/^(g|ml|غ|مل|غرام)$/i.test(unit)) return n >= 100 ? Math.round(n / 10) * 10 : Math.max(5, Math.round(n / 5) * 5);
  if (/^(kg|l|كغ|كيلو|لتر|ل)$/i.test(unit)) return Math.round(n * 10) / 10;
  if (!unit || /^(stk|stück|zehe|bund|dose|glas|becher|packung|pck|حبة|حبات|قطعة|فص|حزمة|علبة)/i.test(unit)) return Math.ceil(n - 0.05);
  return Math.ceil(n * 2 - 0.05) / 2;
}
const splitQty = q => { const m = latin(q || '').trim().match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/); return m ? { num: parseFloat(m[1].replace(',', '.')), rest: m[2] } : null; };
function stepQty(q, dir) {
  const p = splitQty(q);
  if (!p) return q?.trim() ? q : (dir > 0 ? '2' : '');
  const step = /^(g|ml|غ|مل)$/i.test(p.rest) ? (p.num >= 100 ? 50 : 10) : 1;
  const n = p.num + dir * step;
  return n <= 0 ? '' : fmtNum(n) + (p.rest ? ' ' + p.rest : '');
}
function mergeQty(a, b) {
  if (!a) return b; if (!b) return a;
  const x = splitQty(a), y = splitQty(b);
  return x && y && x.rest.toLowerCase() === y.rest.toLowerCase() ? fmtNum(x.num + y.num) + (x.rest ? ' ' + x.rest : '') : `${a} + ${b}`;
}

/* ---------- Einkaufsliste: Aktionen ---------- */
/** Typische Artikel vom arabischen Markt, auch wenn ihre Kategorie allgemein ist */
const ARAB_KEYS = new Set(['arabisches-brot', 'saj-brot-markouk', 'tannour-brot', 'samoon', 'lavash', 'halal-fleisch', 'lammfleisch', 'lammkeule', 'lammschulter', 'lammkoteletts', 'lammhack', 'ziegenfleisch', 'kleine-auberginen', 'helle-zucchini', 'okra', 'minigurken', 'peperoni', 'koriander', 'minze', 'petersilie', 'portulak', 'wilder-zaatar', 'frische-kichererbsen', 'sucuk', 'pastirma', 'doener-fleisch', 'kebab-spiesse', 'tk-molokhia', 'tk-okra', 'tk-falafel', 'tk-kibbeh', 'tk-sambousek', 'filoteig', 'manti', 'zaatar', 'sumach', 'sieben-gewuerze', 'baharat', 'kibbeh-gewuerz', 'falafel-gewuerz', 'schwarzkuemmel', 'kardamom', 'bulgur', 'freekeh', 'dicke-bohnen', 'rote-linsen', 'basmatireis', 'rundkornreis', 'suppennudeln', 'feta', 'hirtenkaese', 'kaschkaval-kaese', 'ayran']);
function defaultStore(key, cat) {
  if (prefMap.has(key)) { const s = prefMap.get(key); return storeMap.has(s) ? s : ''; }
  const d = ARAB_KEYS.has(key) ? 's-arab' : { orient: 's-arab', drogerie: 's-dm', haushalt: 's-dm', baby: 's-dm' }[cat] || 's-super';
  return storeMap.has(d) ? d : '';
}
/** Setzt einen Artikel auf die Liste. true = neu oder geändert, false = stand schon drauf. */
function addEntry(key, name, qty = '') {
  const ex = S.items.find(i => i.key === key);
  if (ex) {
    if (ex.done) { store.put('items', { ...ex, done: false, qty, note: '', t: Date.now() }); return true; }
    if (!qty) return false;
    store.put('items', { ...ex, qty: mergeQty(ex.qty, qty) }); return true;
  }
  let p = prod(key);
  if (!p) {
    store.put('custom', { id: key, de: isAr(name) ? '' : name, ar: isAr(name) ? name : '', cat: 'sonst', emoji: '🛒' });
    enrich(key, name);
  }
  store.put('items', { id: uid(), key, name, qty, note: '', done: false, store: defaultStore(key, p?.cat || 'sonst'), auto: !prefMap.has(key), t: Date.now() });
  return true;
}
/** Freitext wie "2 kg Tomaten" oder "Milch, Eier, Brot". Gibt die Anzahl neuer Einträge zurück. */
function addText(text) {
  let n = 0;
  for (const part of text.split(/[,،\n]+/)) {
    const p = parseLine(part); const name = p.name.trim(); if (!name) continue;
    const hit = allProducts.find(x => x.n.includes(norm(name)));
    if (addEntry(hit ? hit.id : 'c:' + norm(name), hit ? pName(hit) : name, fmtQty(p.num, p.unit))) n++;
  }
  return n;
}
/** Rezeptzutaten: Namen aufräumen und – wenn möglich – einem Katalogartikel zuordnen. */
function addIngredients(lines, factor = 1) {
  let n = 0;
  for (const l of lines) {
    const p = parseLine(l);
    const name = p.name.replace(/\((n|en|e|s)\)/gi, '').replace(/\([^)]*\)/g, ' ').split(/[,،]/)[0].replace(/\s+/g, ' ').trim();
    if (!name) continue;
    const hit = findProduct(allProducts, name);
    if (addEntry(hit ? hit.id : 'c:' + norm(name), hit ? pName(hit) : name, fmtQty(factor === 1 ? p.num : niceNum(p.num == null ? null : p.num * factor, p.unit), p.unit))) n++;
  }
  return n;
}
function setItemStore(i, sid) {
  store.put('items', { ...i, store: sid, auto: false });
  store.put('prefs', { id: i.key, store: sid });
}

/* KI: eigene Artikel einordnen (Kategorie, Emoji) und in die andere Sprache übersetzen */
const aiQ = new Map(); let aiT = 0;
function enrich(key, name) { if (!WORKER) return; aiQ.set(key, name); clearTimeout(aiT); aiT = setTimeout(flushAI, 800); }
async function flushAI() {
  const batch = [...aiQ].slice(0, 25); for (const [k] of batch) aiQ.delete(k);
  if (aiQ.size) aiT = setTimeout(flushAI, 1500);
  try {
    const r = await fetch(WORKER + 'items', { method: 'POST', headers: aiHeaders(true), body: JSON.stringify({ names: batch.map(b => b[1]) }), signal: AbortSignal.timeout(60000) });
    const d = await r.json();
    const items = d.items || [];
    batch.forEach(([key, name], idx) => {
      const hit = items.find(x => norm(x.name) === norm(name)) || (items.length === batch.length ? items[idx] : null), cur = customMap.get(key);
      if (!hit || !cur || cur.ai) return;
      const cat = CAT[hit.cat] ? hit.cat : 'sonst';
      store.put('custom', { id: key, de: cur.de || hit.de || '', ar: cur.ar || hit.ar || '', en: cur.en || hit.en || '', cat, emoji: hit.emoji || '🛒', ai: 1 });
      const it = S.items.find(i => i.key === key), ds = defaultStore(key, cat);
      if (it && it.auto && it.store !== ds) store.put('items', { ...it, store: ds });
    });
  } catch {}
}

/* ---------- Woche ---------- */
function monday(off = 0) {
  const d = new Date(); d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + off * 7); return d;
}
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const weekId = (off = 0) => 'w' + iso(monday(off));
const weekLabel = off => {
  const a = monday(off), b = new Date(a); b.setDate(b.getDate() + 6);
  const f = d => d.toLocaleDateString({ ar: 'ar-u-nu-latn', en: 'en-GB' }[getLang()] || 'de-DE', { day: 'numeric', month: 'short' });
  return `${f(a)} – ${f(b)}`;
};
/* Wochenplan: drei Hauptgerichte + beliebig viele Extras (Salat, Dessert, Suppe, Frühstück) */
const COURSES = ['starter', 'salad', 'soup', 'dessert', 'breakfast'];
const rEmoji = c => RCATS.find(x => x[0] === c)?.[1] || '🍽️';
/** Regeln für Vorschläge – im Haushalt geteilt. n = Hauptgerichte pro Woche, gap = Wochen ohne Wiederholung, add = Gänge, die mit vorgeschlagen werden. */
const planCfg = () => { const m = S.meta.find(m => m.id === 'planCfg') || {}; return { n: Math.min(7, Math.max(1, m.n || 3)), gap: m.gap ?? 4, add: (m.add || []).filter(c => COURSES.includes(c)) }; };
const setPlanCfg = patch => store.put('meta', { id: 'planCfg', ...planCfg(), ...patch, t: Date.now() });
const planOf = off => {
  const p = S.plan.find(p => p.id === weekId(off)), slots = [...(p?.slots || [])];
  const len = Math.max(planCfg().n, slots.reduce((a, id, i) => id ? i + 1 : a, 0));
  slots.length = len; for (let i = 0; i < len; i++) slots[i] ??= null;
  return { id: weekId(off), slots, extra: p?.extra || [] };
};
const slotLabel = (i, len) => len === 3 ? t('slot' + i) : t('dishN', { n: i + 1 });
const savePlan = (off, patch) => store.put('plan', { ...planOf(off), ...patch });
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function suggest(off) {
  const c = planCfg(), recent = new Set();
  for (let k = 1; k <= c.gap; k++) { const q = planOf(off - k); [...q.slots, ...q.extra.map(e => e.r)].forEach(id => id && recent.add(id)); }
  // zuerst Rezepte, die in den letzten Wochen nicht dran waren; die anderen nur, wenn es sonst nicht reicht
  const order = ids => [...shuffle(ids.filter(id => !recent.has(id))), ...shuffle(ids.filter(id => recent.has(id)))];
  const ofCat = cs => S.recipes.filter(r => cs.includes(rcatOf(r))).map(r => r.id);
  if (!ofCat(['main', 'soup', 'salad']).length) return toast(t('needRecipes'));
  // erst die Beilagen wählen, damit z. B. der einzige Salat nicht als Hauptgericht verbraucht wird
  const used = new Set();
  let extra = [...planOf(off).extra];
  for (const k of c.add) if (!extra.some(e => e.c === k) && ofCat([k]).length) extra.push({ id: uid().slice(0, 8), c: k, r: null });
  extra = extra.map(e => {
    const pool = order(ofCat([e.c])).filter(id => !used.has(id));
    const pick = pool.find(id => id !== e.r && !recent.has(id)) ?? pool.find(id => id !== e.r) ?? pool[0];
    if (!pick) return e;
    used.add(pick); return { ...e, r: pick };
  });
  let mains = order(ofCat(['main']));
  if (mains.length < c.n) mains = mains.concat(order(ofCat(['soup', 'salad'])).filter(id => !used.has(id)));
  savePlan(off, { slots: Array.from({ length: c.n }, (_, i) => mains[i] || null), extra });
  toast(t('suggested'));
}
function aggregate(p) {
  const map = new Map();
  for (const id of [...p.slots, ...p.extra.map(e => e.r)]) {
    const r = recipe(id); if (!r) continue;
    for (const l of r.ingredients || []) {
      const x = parseLine(l), k = norm(x.name) + '|' + x.unit.toLowerCase(), e = map.get(k);
      if (e && e.num != null && x.num != null) e.num += x.num; else if (!e) map.set(k, { ...x });
    }
  }
  return [...map.values()];
}

/* ---------- Ansicht: Einkaufsliste ---------- */
function netLine(open, count = true) {
  const n = !count ? '' : open ? t('nOpen', { n: open }) : (S.items.length ? t('allDone') : '');
  const s = S.net.state;
  const st = s === 'online' ? `<i class="dot on" title="online"></i>${S.net.peers > 1 ? `<span class="peers" title="${t('peers', { n: S.net.peers })}">${ico('user')}${S.net.peers}</span>` : ''}`
    : s === 'offline' ? `<i class="dot off"></i>${t('offline')}` : s === 'connecting' ? `<i class="dot"></i>${t('connecting')}` : '';
  return s === 'online' && S.net.peers < 2 ? `${st}${n ? `<span>${n}</span>` : ''}` : [st, n].filter(Boolean).join('<span class="sep">·</span>');
}
function itemRow(i) {
  const sub = [i.qty, i.note].filter(Boolean).map(esc).join(' · ');
  return `<div class="it ${i.done ? 'done' : ''}" data-id="${i.id}"><div class="ri"><span class="chk"><svg class="i ck" viewBox="0 0 24 24" aria-hidden="true"><path pathLength="1" d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><span class="em">${itemEmoji(i)}</span>
    <span class="nm"><b dir="auto">${esc(itemName(i))}</b>${sub ? `<small dir="auto">${sub}</small>` : ''}</span>
    <button class="more" data-item="${i.id}" aria-label="${t('edit')}">${ico('dots')}</button></div></div>`;
}
const byCatName = (a, b) => CAT_ORDER[itemCat(a)] - CAT_ORDER[itemCat(b)] || itemName(a).localeCompare(itemName(b), getLang());
/** Lange Gruppen bekommen kleine Kategorie-Trenner (Obst, Gemüse …) – übersichtlicher im Laden */
function rowsHtml(arr, divide) {
  let last = null;
  return arr.sort(byCatName).map(i => { const c = itemCat(i), d = divide && c !== last ? `<div class="cdiv"><span>${CAT[c].emoji}</span>${catName(c)}</div>` : ''; last = c; return d + itemRow(i); }).join('');
}
const group = (title, arr, style = '', drop) => arr.length ? `<section class="grp" ${drop != null ? `data-drop="${drop}"` : ''}><h3 ${style}>${title}<small>${arr.length}</small></h3><div class="card">${rowsHtml(arr, drop != null && arr.length > 7)}</div></section>` : '';

function suggHtml(text) {
  const name = parseLine(text.split(/[,،]/).pop() || '').name.trim();
  if (name.length < 1) return '';
  return search(allProducts, name, 8).map(p => `<button type="button" class="sg" data-sugg="${esc(p.id)}"><span>${p.emoji}</span>${esc(pName(p))}</button>`).join('');
}

function vList() {
  const open = S.items.filter(i => !i.done), done = S.items.filter(i => i.done).sort((a, b) => (b.u || 0) - (a.u || 0));
  const sts = stores();
  if (S.storeF && !storeMap.has(S.storeF)) S.storeF = '';
  const count = id => open.filter(i => itemStore(i) === id).length;
  const chips = sts.length ? `<div class="chips"><button class="chip ${S.storeF ? '' : 'on'}" data-sf="">${t('all')}<i>${open.length}</i></button>
    ${sts.map(s => `<button class="chip ${S.storeF === s.id ? 'on' : ''}" data-sf="${s.id}" data-drop="${s.id}" style="--c:${storeColor(s)}"><span>${s.emoji}</span>${esc(storeName(s))}${count(s.id) ? `<i>${count(s.id)}</i>` : ''}</button>`).join('')}
    <button class="chip plain" id="manageStores" aria-label="${t('manageStores')}">${ico('sliders')}</button></div>` : '';

  let body = '';
  if (!S.items.length) {
    body = `<div class="empty"><div class="art">🧺</div><b>${t('emptyList')}</b><p>${t('emptyListSub')}</p><button class="btn" id="openCatalog2">${ico('grid')}${t('openCatalog')}</button></div>`;
  } else if (S.storeF) {
    const mine = open.filter(i => itemStore(i) === S.storeF), any = open.filter(i => !itemStore(i));
    const cats = [...new Set(mine.map(itemCat))].sort((a, b) => CAT_ORDER[a] - CAT_ORDER[b]);
    body = cats.map(c => group(`<span class="ge">${CAT[c].emoji}</span>${catName(c)}`, mine.filter(i => itemCat(i) === c))).join('')
      + group(`<span class="ge">📍</span>${t('anywhere')}`, any)
      + (!mine.length && !any.length ? `<div class="empty small"><div class="art">✅</div><b>${t('allDone')}</b></div>` : '');
  } else {
    body = '<div class="groups">' + sts.map(s => group(`<span class="ge" style="--c:${storeColor(s)}">${s.emoji}</span>${esc(storeName(s))}`, open.filter(i => itemStore(i) === s.id), `style="--c:${storeColor(s)}" class="st"`, s.id)).join('')
      + group(`<span class="ge">📍</span>${sts.length ? t('noStore') : t('list')}`, open.filter(i => !itemStore(i)), '', '') + '</div>'
      + (!open.length ? `<div class="empty small"><div class="art">✅</div><b>${t('allDone')}</b></div>` : '');
  }
  const doneHtml = done.length ? `<details class="doneBox" id="doneBox" ${S.doneOpen ? 'open' : ''}><summary>🛍️ ${t('doneTrip')}<small>${done.length}</small></summary>
    <div class="card">${done.map(itemRow).join('')}</div></details>
    <button class="btn finish" id="finishTrip">${ico('check')}${t('finishTrip')}</button><p class="hint center small">${t('finishTripSub')}</p>` : '';

  const pct = S.items.length ? Math.round(done.length / S.items.length * 100) : 0;
  const showOld = !S.meta.some(m => m.id === 'oldlist') && localStorage.getItem('ut:oldX') !== code;
  const banner = showOld ? `<div class="banner"><span class="be">📋</span><span class="bt"><b>${t('oldTitle')}</b><small>${t('oldBanner', { n: OLD_LIST.length })}</small></span>
    <button class="btn fit" id="oldOpen">${t('oldGo')}</button><button class="mini" id="oldX" aria-label="×">${ico('close')}</button></div>` : '';
  const inst = !standalone() && innerWidth < 960 && localStorage.getItem('ut:instX') !== '1' && !showOld ? installRow().replace('</div>', `<button class="mini" id="installX" aria-label="×">${ico('close')}</button></div>`) : '';
  const hint = open.length && localStorage.getItem('ut:hint') !== '1' ? `<p class="tip" id="tipX">${t('gestureTip')}<button class="mini">${ico('close')}</button></p>` : '';
  return `<header class="top"><div><h1>${t('list')}</h1><p class="sub">${netLine(open.length)}</p>${S.items.length ? `<div class="prog"><i style="width:${pct}%"></i></div>` : ''}</div></header>${banner}${inst}
  <form class="add" id="addForm" autocomplete="off"><label class="inp">${ico('plus')}<input id="addInput" dir="auto" placeholder="${t('addPh')}" enterkeyhint="done"></label>
    <button type="button" class="catBtn" id="openCatalog">${ico('grid')}<span>${t('catalog')}</span></button></form>
  <div class="sugg" id="sugg"></div>${chips}${hint}${body}${doneHtml}`;
}

/* ---------- Ansicht: Rezepte ---------- */
const picCls = r => `pic p${[...r.title].reduce((a, c) => a + c.codePointAt(0), 0) % 6}`;
const picStyle = r => r.image ? `style="background-image:url('${esc(r.image)}')"` : '';
const picIn = r => r.image ? '' : esc(r.emoji || '🍽️');
const rMeta = r => [r.time ? `${r.time} ${t('min')}` : '', r.servings ? `${r.servings} ${t('persons')}` : ''].filter(Boolean).join(' · ');

function vRecipes() {
  const q = norm(S.q);
  const sort = localStorage.getItem('ut:rsort') || 'az';
  const cmp = { az: (a, b) => a.title.localeCompare(b.title, getLang()), new: (a, b) => (b.t || 0) - (a.t || 0), fast: (a, b) => (a.time || 999) - (b.time || 999) }[sort] || ((a, b) => 0);
  const list = S.recipes.filter(r => (!S.fav || r.fav) && (S.rcat === 'all' || rcatOf(r) === S.rcat) && (!q || norm(r.title + ' ' + (r.ingredients || []).join(' ')).includes(q))).sort(cmp);
  const cnt = c => c === 'all' ? S.recipes.length : S.recipes.filter(r => rcatOf(r) === c).length;
  const hasDemo = S.recipes.some(r => r.demo);
  return `<header class="top"><div><h1>${t('recipes')}</h1><p class="sub">${S.recipes.length || ''}</p></div><button class="round acc" id="newRecipe" aria-label="${t('newRecipe')}">${ico('plus')}</button></header>
  ${S.recipes.length ? `<div class="rTools"><label class="inp search">${ico('search')}<input id="rSearch" type="search" dir="auto" value="${esc(S.q)}" placeholder="${t('searchRecipes')}"><kbd class="kb">/</kbd></label>
    <select class="field sortSel" id="rSort" aria-label="${t('sort')}">${['az', 'new', 'fast'].map(k => `<option value="${k}" ${sort === k ? 'selected' : ''}>${t('sort_' + k)}</option>`).join('')}</select></div>
  <div class="chips"><button class="chip ${S.fav ? 'on' : ''}" id="favF" style="--c:#c0392b">${ico('heart')}${t('favs')}</button>
    ${RCATS.map(([c, e]) => (c === 'all' || cnt(c) ? `<button class="chip ${S.rcat === c ? 'on' : ''}" data-rcat="${c}"><span>${e}</span>${t('rc_' + c)}<i>${cnt(c)}</i></button>` : '')).join('')}</div>` : ''}
  <div class="rgrid">${list.map(r => `<article class="rcard" data-open="${r.id}"><div class="${picCls(r)}">${esc(r.emoji || '🍽️')}${r.image ? `<img src="${esc(r.image)}" alt="" loading="lazy" decoding="async">` : ''}</div>
    <button class="fav ${r.fav ? 'on' : ''}" data-fav="${r.id}" aria-label="${t('favs')}">${ico('heart')}</button>
    <button class="fav rmore" data-ract="${r.id}" aria-label="${t('recipeActions')}">${ico('dots')}</button>
    <div class="meta"><b dir="auto">${esc(r.title)}</b><small>${rEmoji(rcatOf(r))} ${[t('rc_' + rcatOf(r)), rMeta(r)].filter(Boolean).join(' · ')}</small></div></article>`).join('')}</div>
  ${!list.length ? (S.recipes.length ? `<div class="empty small"><div class="art">🔎</div><b>${t('nothing')}</b></div>`
    : `<div class="empty"><div class="art">📖</div><b>${t('noRecipes')}</b><p>${t('noRecipesSub')}</p><button class="btn" id="newRecipe2">${ico('plus')}${t('newRecipe')}</button>
       ${hasDemo ? '' : `<button class="btn ghost" id="demoBtn">${ico('spark')}${t('loadDemo')}</button>`}</div>`) : ''}`;
}

/* ---------- Ansicht: Wochenplan ---------- */
function slotHtml(r, tag, attr) {
  return r ? `<div class="slot" ${attr}><div class="${picCls(r)}" ${picStyle(r)}>${picIn(r)}</div><div class="tx"><span class="tag">${tag}</span><b dir="auto">${esc(r.title)}</b><small>${rMeta(r)}</small></div>${ico('edit')}</div>`
    : `<button class="slot none" ${attr}><div class="pic">${ico('plus')}</div><div class="tx"><span class="tag">${tag}</span><b>${t('pickDish')}</b></div></button>`;
}
function vPlan() {
  const off = S.week, p = planOf(off), agg = aggregate(p);
  return `<header class="top"><div><h1>${t('plan')}</h1><p class="sub">${weekLabel(off)}${off === 0 ? ' · ' + t('thisWeek') : ''}</p></div>
    <div class="nav2"><button class="round" id="wPrev" aria-label="‹">${ico('back')}</button><button class="round" id="wNext" aria-label="›">${ico('fwd')}</button></div></header>
  <div class="planCols"><div>
  <section class="grp"><h3><span class="ge">${rEmoji('main')}</span>${t('mains')}<small>${p.slots.filter(recipe).length}/${p.slots.length}</small></h3>
    <div class="slots">${p.slots.map((id, i) => slotHtml(recipe(id), `${t('c_main')} · ${slotLabel(i, p.slots.length)}`, `data-pick="m${i}"`)).join('')}</div></section>
  <section class="grp"><h3><span class="ge">✨</span>${t('extras')}<small>${p.extra.length || ''}</small></h3>
    ${p.extra.length ? `<div class="slots">${p.extra.map(e => slotHtml(recipe(e.r), `${rEmoji(e.c)} ${t('c_' + e.c)}`, `data-pick="x${e.id}"`)).join('')}</div>` : `<p class="hint pad2">${t('extrasHint')}</p>`}
    <div class="pickers addC">${COURSES.map(c => `<button class="chip" data-addc="${c}">${ico('plus')}<span>${rEmoji(c)}</span>${t('c_' + c)}</button>`).join('')}</div></section>
  <button class="btn ghost" id="suggest">${ico('shuffle')}${t('suggest')}</button></div>
  <section class="grp"><h3>${t('weekShop')}<small>${agg.length || ''}</small></h3>
  ${agg.length ? `<div class="card pad">${agg.map(a => `<div class="ing"><span dir="auto">${esc(a.name)}</span><span dir="auto">${esc(fmtQty(a.num, a.unit))}</span></div>`).join('')}</div>
    <button class="btn" id="planToList">${ico('bag')}${t('toList')}</button>` : `<p class="hint">${t('planEmpty')}</p>`}</section></div>`;
}

/* ---------- Design: automatisch / hell / dunkel (pro Gerät) ---------- */
const themePref = () => localStorage.getItem('ut:theme') || 'auto';
const mqDark = matchMedia('(prefers-color-scheme:dark)');
function applyTheme() {
  const dark = themePref() === 'dark' || (themePref() === 'auto' && mqDark.matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.querySelectorAll('meta[name="theme-color"]').forEach(m => { m.removeAttribute('media'); m.content = dark ? '#121311' : '#f6f5f1'; });
}
mqDark.addEventListener('change', applyTheme); applyTheme();
document.addEventListener('toggle', e => { if (e.target.id === 'hhBox') S.hh = e.target.open; }, true);

/* ---------- Ansicht: Einstellungen ---------- */
function vMore() {
  const hasDemo = S.recipes.some(r => r.demo), L = getLang(), cfg = planCfg();
  const ai = !WORKER ? t('aiOff') : S.ai == null ? t('aiCheck') : S.ai === true ? t('aiOk') : S.ai === false ? t('aiOff') : t('aiErr');
  return `<header class="top"><div><h1>${t('more')}</h1></div></header>
  ${installRow()}
  <section class="grp"><h3>${t('appearance')}</h3><div class="card set">
    <div class="setRow"><b>${t('language')}</b><div class="seg">${[['de', 'Deutsch'], ['ar', 'العربية'], ['en', 'English']].map(([k, n]) => `<button data-lang="${k}" class="${L === k ? 'on' : ''}" lang="${k}">${n}</button>`).join('')}</div></div>
    <div class="setRow"><b>${t('theme')}</b><div class="seg">${['auto', 'light', 'dark'].map(k => `<button data-th="${k}" class="${themePref() === k ? 'on' : ''}">${t('th_' + k)}</button>`).join('')}</div></div></div></section>
  <section class="grp"><h3>${t('planSet')}</h3><div class="card set">
    <div class="setRow line"><b>${t('planN')}</b><div class="stepper sm"><button data-cfgn="-1" aria-label="−" ${cfg.n <= 1 ? 'disabled' : ''}>${ico('minus')}</button><span>${cfg.n}</span><button data-cfgn="1" aria-label="+" ${cfg.n >= 7 ? 'disabled' : ''}>${ico('plus')}</button></div></div>
    <div class="setRow"><b>${t('planGap')}</b><div class="seg">${[0, 1, 2, 4].map(g => `<button data-gap="${g}" class="${cfg.gap === g ? 'on' : ''}">${t('gap' + g)}</button>`).join('')}</div></div>
    <div class="setRow"><b>${t('planAdd')}</b><div class="pickers">${COURSES.map(c => `<button class="chip sm ${cfg.add.includes(c) ? 'on' : ''}" data-padd="${c}"><span>${rEmoji(c)}</span>${t('c_' + c)}</button>`).join('')}</div>
      <p class="hint small">${t('planSetHint')}</p></div></div></section>
  <section class="grp"><h3>${t('household')}</h3><details class="card hh" id="hhBox" ${S.hh ? 'open' : ''}>
    <summary>${ico('user')}<span><b dir="ltr">${fmtCode(code)}</b><small class="sub">${netLine(0, false) || t('localOnly')}</small></span></summary>
    <div class="stack">
    <p class="hint">${WORKER ? t('householdSub') : t('householdLocal')}</p>
    <div class="qrWrap"><div class="qr" id="qrBox" aria-label="QR"></div><div class="qrSide"><small>${t('codeLabel')}</small><div class="code" dir="ltr">${fmtCode(code)}</div></div></div>
    <p class="hint qrHint">${ico('qr')}<span>${t('qrHint')}</span></p>
    <div class="row"><button class="btn" id="mScan">${ico('scan')}${t('scan')}</button><button class="btn ghost" id="mShare">${ico('share')}${t('share')}</button></div>
    <div class="row"><input class="field" id="mJoin" dir="ltr" placeholder="${t('joinPh')}" autocapitalize="characters" autocomplete="off"><button class="btn ghost fit" id="mJoinBtn">${t('join')}</button></div>
    <button class="linkBtn" id="mNew">${t('newHousehold')}</button></div></details></section>
  <section class="grp"><h3>${t('moreSet')}</h3><div class="card menu">
    <button id="manageStores">${ico('store')}<span>${t('manageStores')}<small>${t('nStores', { n: S.stores.length })}</small></span>${ico('fwd')}</button>
    <button id="demoBtn">${ico('spark')}<span>${hasDemo ? t('removeDemo') : t('loadDemo')}<small>${t('demoSub')}</small></span></button>
    <button id="aiOpen">${ico('globe')}<span>${t('ai')}<small>${gkey() ? t('ownKeySet') + ' · ' : ''}${ai}</small></span><i class="dot ${S.ai === true ? 'on' : S.ai == null ? '' : 'off'}"></i>${ico('fwd')}</button>
    <button id="fxBtn">${ico('bell')}<span>${t('snd')}<small>${sndSummary()}</small></span>${ico('fwd')}</button>
    <button id="histBtn">${ico('clock')}<span>${t('history')}<small>${trips().length ? `${trips().length} × 🧾` : t('noHistory')}</small></span>${ico('fwd')}</button>
  </div></section>`;
}

/* ---------- Render ---------- */
const TABS = [['list', 'tabList', 'bag'], ['recipes', 'tabRecipes', 'book'], ['plan', 'tabPlan', 'cal'], ['more', 'tabMore', 'sliders']];
let sheetRefresh = null, sheetCleanup = null, raf = 0;
let G = null, pendingRender = false, suppressClick = 0, checking = 0;
const schedule = () => { if (G?.mode || checking) { pendingRender = true; if (checking) { clearTimeout(schedule.t); schedule.t = setTimeout(schedule, 120); } return; } if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (G?.mode) pendingRender = true; else render(); }); };
/** dir="auto" bei leerem Feld nimmt LTR an – dadurch steht der arabische Platzhalter falsch. Leer = Richtung der App, sonst automatisch. */
function fixDir(root = document) {
  for (const el of root.querySelectorAll('input[dir="auto"], textarea[dir="auto"], input[data-bidi], textarea[data-bidi]')) { el.dataset.bidi = 1; bidi(el); }
}
const bidi = el => { if (el.value.trim()) el.dir = 'auto'; else el.removeAttribute('dir'); };
document.addEventListener('input', e => { if (e.target.dataset?.bidi) bidi(e.target); }, true);
function render() {
  const act = document.activeElement, keep = act?.id && ['addInput', 'rSearch', 'mJoin'].includes(act.id) ? act.id : null;
  const sel = keep ? [act.selectionStart, act.selectionEnd] : null;
  const vals = { addInput: $('#addInput')?.value, mJoin: $('#mJoin')?.value };
  $('#app').innerHTML = { list: vList, recipes: vRecipes, plan: vPlan, more: vMore }[S.tab]();
  const open = S.items.filter(i => !i.done).length;
  $('#tabs').innerHTML = `<div class="brand"><img src="icons/icon.svg" alt=""><b>${t('app')}</b></div>` + TABS.map(([k, l, i]) => `<button data-tab="${k}" class="${S.tab === k ? 'on' : ''}">${ico(i)}<span>${t(l)}</span>${k === 'list' && open ? `<i>${open}</i>` : ''}</button>`).join('');
  for (const [k, v] of Object.entries(vals)) if (v && $('#' + k)) $('#' + k).value = v;
  if ($('#addInput')?.value) $('#sugg').innerHTML = suggHtml($('#addInput').value);
  if (keep && $('#' + keep)) { const el = $('#' + keep); el.focus(); try { el.setSelectionRange(...sel); } catch {} }
  sheetRefresh?.();
  const qb = $('#qrBox'); if (qb) drawQR(qb);
  fixDir($('#app'));
}

/* ---------- Sheets (Dialog) ---------- */
const dlg = $('#dlg'), sheet = $('#sheet');
function show(html, cls = '') {
  sheet.onclick = sheet.oninput = sheet.onchange = null; sheetRefresh = null; sheetCleanup?.(); sheetCleanup = null;
  dlg.className = cls; sheet.innerHTML = html; sheet.scrollTop = 0; fixDir(sheet);
  if (!dlg.open) { dlg.showModal(); history.pushState({ sheet: 1 }, ''); }
}
const close = () => { if (dlg.open) dlg.close(); };
dlg.addEventListener('close', () => { sheetRefresh = null; sheetCleanup?.(); sheetCleanup = null; if (history.state?.sheet) history.back(); });
dlg.addEventListener('click', e => { if (e.target === dlg && Date.now() - suppressClick > 450) close(); });
addEventListener('popstate', () => { if (dlg.open) dlg.close(); });
const head = (title, sub = '') => `<div class="sh"><div><h2 dir="auto">${title}</h2>${sub ? `<small>${sub}</small>` : ''}</div><button class="round" data-x="close" aria-label="×">${ico('close')}</button></div>`;

/* Katalog */
function openCatalog() {
  const st = { cat: S.prefs.length ? 'mine' : 'all', q: '', assign: false, target: stores()[0]?.id || '' };
  show(`<div class="cHead"><button class="round" data-x="close" aria-label="‹">${ico('back')}</button><label class="inp search">${ico('search')}<input id="cSearch" type="search" dir="auto" placeholder="${t('searchProducts')}" autocomplete="off"></label>
    <button class="round" id="cAssign" data-x="assign" aria-label="${t('assign')}" title="${t('assign')}">${ico('store')}</button></div>
    <div class="assignBar hidden" id="cAssignBar"></div>
    <div class="chips" id="cChips"></div><div class="tiles" id="cTiles"></div>
    <div class="cFoot"><button class="btn" data-x="close" id="cDone"></button></div>`, 'full');
  const onKeys = () => new Set(S.items.filter(i => !i.done).map(i => i.key));
  const tile = (p, on) => { const sid = prefMap.get(p.id), s = sid && storeMap.get(sid);
    return `<button class="tile ${st.assign ? (sid === st.target ? 'on as' : '') : on.has(p.id) ? 'on' : ''}" data-key="${esc(p.id)}"><span class="em">${p.emoji}</span><span class="nm" dir="auto">${esc(pName(p))}</span>${s ? `<b class="sb" style="--c:${storeColor(s)}" title="${esc(storeName(s))}">${s.emoji}</b>` : ''}<i>${ico('check')}</i></button>`; };
  const draw = () => {
    const on = onKeys(), known = new Set([...prefMap.keys(), ...customMap.keys()]), hasMine = known.size > 0;
    $('#cChips').innerHTML = `${hasMine ? `<button class="chip ${st.cat === 'mine' ? 'on' : ''}" data-cc="mine"><span>⭐</span>${t('mine')}</button>` : ''}<button class="chip ${st.cat === 'all' ? 'on' : ''}" data-cc="all">${t('all')}</button>`
      + CATS.filter(c => c.id !== 'sonst').map(c => `<button class="chip ${st.cat === c.id ? 'on' : ''}" data-cc="${c.id}"><span>${c.emoji}</span>${c[getLang()]}</button>`).join('');
    let html;
    if (st.q.trim()) {
      const hits = search(allProducts, st.q, 90), exact = hits.some(p => p.n.includes(norm(st.q)));
      html = (exact ? '' : `<button class="tile new" data-new="1"><span class="em">＋</span><span class="nm" dir="auto">${esc(t('addCustom', { name: st.q.trim() }))}</span></button>`) + hits.map(p => tile(p, on)).join('');
    } else if (st.cat === 'all') {
      html = CATS.map(c => { const ps = allProducts.filter(p => p.cat === c.id); return ps.length ? `<h4><span>${c.emoji}</span>${c[getLang()]}</h4>` + ps.map(p => tile(p, on)).join('') : ''; }).join('');
    } else if (st.cat === 'mine') {
      const mine = allProducts.filter(p => known.has(p.id)).sort((a, b) => CAT_ORDER[a.cat] - CAT_ORDER[b.cat] || pName(a).localeCompare(pName(b), getLang()));
      const sec = (title, ps) => ps.length ? `<h4>${title}<small>${ps.length}</small></h4>` + ps.map(p => tile(p, on)).join('') : '';
      html = stores().map(s => sec(`<span>${s.emoji}</span>${esc(storeName(s))}`, mine.filter(p => prefMap.get(p.id) === s.id))).join('')
        + sec(`<span>📍</span>${t('noStore')}`, mine.filter(p => !storeMap.has(prefMap.get(p.id))));
    } else {
      html = allProducts.filter(p => p.cat === st.cat).map(p => tile(p, on)).join('') || `<p class="hint center">${t('nothing')}</p>`;
    }
    $('#cTiles').innerHTML = html; foot(on);
    $('#cAssign').classList.toggle('acc', st.assign);
    const bar = $('#cAssignBar'); bar.classList.toggle('hidden', !st.assign);
    if (st.assign) bar.innerHTML = `<p>${t('assignHint')}</p><div class="chips">${stores().map(s => `<button class="chip ${st.target === s.id ? 'on' : ''}" data-tg="${s.id}" style="--c:${storeColor(s)}"><span>${s.emoji}</span>${esc(storeName(s))}</button>`).join('')}</div>`;
  };
  const foot = on => { $('#cDone').textContent = st.assign ? t('assignDone') : on.size ? t('finishN', { n: on.size }) : t('finish'); };
  sheetRefresh = () => { if (st.assign) return draw(); const on = onKeys(); for (const el of sheet.querySelectorAll('.tile[data-key]')) el.classList.toggle('on', on.has(el.dataset.key)); foot(on); };
  sheet.oninput = e => { if (e.target.id === 'cSearch') { st.q = e.target.value; draw(); $('#cTiles').scrollTop = 0; } };
  sheet.onclick = e => {
    if (e.target.closest('[data-x="close"]')) { if (st.assign && e.target.closest('#cDone')) { st.assign = false; e.preventDefault(); return draw(); } return close(); }
    if (e.target.closest('[data-x="assign"]')) { st.assign = !st.assign; if (st.assign && st.cat === 'all' && !st.q) st.cat = 'mine'; return draw(); }
    const tg = e.target.closest('[data-tg]'); if (tg) { st.target = tg.dataset.tg; return draw(); }
    const cc = e.target.closest('[data-cc]'); if (cc) { st.cat = cc.dataset.cc; st.q = ''; $('#cSearch').value = ''; draw(); $('#cTiles').scrollTop = 0; return; }
    if (e.target.closest('[data-new]')) { addText(st.q); st.q = ''; $('#cSearch').value = ''; st.cat = 'mine'; draw(); return; }
    const tl = e.target.closest('.tile[data-key]'); if (!tl) return;
    const key = tl.dataset.key, it = S.items.find(i => i.key === key && !i.done);
    if (st.assign) { // Artikel fest einem Markt zuordnen (nochmal tippen = Zuordnung entfernen)
      const sid = prefMap.get(key) === st.target ? '' : st.target;
      store.put('prefs', { id: key, store: sid });
      for (const i of S.items.filter(i => i.key === key && !i.done)) store.put('items', { ...i, store: sid, auto: false });
      vib(10); play('drop'); return;
    }
    tick(!it);
    if (it) store.remove('items', it.id); else addEntry(key, pName(prod(key)));
  };
  draw();
}

/* Artikel bearbeiten */
function openItem(id) {
  const i = S.items.find(x => x.id === id); if (!i) return close();
  const p = prod(i.key), cur = itemStore(i);
  show(`${head(`<span class="hem">${itemEmoji(i)}</span>${esc(itemName(i))}`, catName(itemCat(i)))}
    <label class="lb">${t('qty')}</label>
    <div class="qtyRow"><button class="round" data-x="minus" aria-label="−">${ico('minus')}</button><input class="field" id="iQty" dir="auto" value="${esc(i.qty)}" placeholder="${t('qtyPh')}" autocomplete="off"><button class="round" data-x="plus" aria-label="+">${ico('plus')}</button></div>
    <label class="lb">${t('note')}</label><input class="field" id="iNote" dir="auto" value="${esc(i.note)}" placeholder="${t('notePh')}" autocomplete="off">
    <label class="lb">${t('where')}</label>
    <div class="pickers">${stores().map(s => `<button class="chip ${cur === s.id ? 'on' : ''}" data-store="${s.id}" style="--c:${storeColor(s)}"><span>${s.emoji}</span>${esc(storeName(s))}</button>`).join('')}
      <button class="chip ${cur ? '' : 'on'}" data-store="">${t('any')}</button><button class="chip plain" data-x="newStore">${ico('plus')}${t('newStore')}</button></div>
    <p class="hint">${t('remembered')}</p>
    ${p?.custom ? `<label class="lb">${t('category')}</label><select class="field" id="iCat">${CATS.map(c => `<option value="${c.id}" ${c.id === p.cat ? 'selected' : ''}>${c.emoji} ${c[getLang()]}</option>`).join('')}</select>` : ''}
    <button class="btn ghost danger" data-x="del">${ico('trash')}${t('removeItem')}</button>`);
  const fresh = () => S.items.find(x => x.id === id);
  sheet.onchange = e => {
    const it = fresh(); if (!it) return;
    if (e.target.id === 'iQty') store.put('items', { ...it, qty: e.target.value.trim() });
    if (e.target.id === 'iNote') store.put('items', { ...it, note: e.target.value.trim() });
    if (e.target.id === 'iCat') { const c = customMap.get(it.key); if (c) { const { custom, n, ...doc } = c; store.put('custom', { ...doc, cat: e.target.value, ai: 1 }); } }
  };
  sheet.onclick = e => {
    const it = fresh(); if (!it) return close();
    const st = e.target.closest('[data-store]');
    if (st) { setItemStore({ ...it, qty: $('#iQty').value.trim(), note: $('#iNote').value.trim() }, st.dataset.store); return openItem(id); }
    const x = e.target.closest('[data-x]')?.dataset.x; if (!x) return;
    if (x === 'close') close();
    else if (x === 'plus' || x === 'minus') { const q = stepQty($('#iQty').value, x === 'plus' ? 1 : -1); $('#iQty').value = q; store.put('items', { ...it, qty: q }); }
    else if (x === 'del') { store.remove('items', id); close(); }
    else if (x === 'newStore') editStore(null, sid => { const f = fresh(); if (f && sid) setItemStore(f, sid); openItem(id); });
  };
}

/* Märkte */
function openStores() {
  const sts = stores();
  show(`${head(t('stores'))}<p class="hint">${t('storesSub')}</p>
    <div class="card menu">${sts.map((s, i) => `<div class="mrow"><span class="sbadge" style="--c:${storeColor(s)}">${s.emoji}</span><span class="grow" dir="auto">${esc(storeName(s))}</span>
      <button class="mini" data-mv="${i}:-1" ${i ? '' : 'disabled'} aria-label="↑">${ico('up')}</button><button class="mini" data-mv="${i}:1" ${i < sts.length - 1 ? '' : 'disabled'} aria-label="↓">${ico('down')}</button>
      <button class="mini" data-es="${s.id}" aria-label="${t('edit')}">${ico('edit')}</button></div>`).join('')}</div>
    <button class="btn" data-x="new">${ico('plus')}${t('newStore')}</button>`);
  sheet.onclick = e => {
    if (e.target.closest('[data-x="close"]')) return close();
    if (e.target.closest('[data-x="new"]')) return editStore(null, openStores);
    const es = e.target.closest('[data-es]'); if (es) return editStore(storeMap.get(es.dataset.es), openStores);
    const mv = e.target.closest('[data-mv]');
    if (mv) { const [i, d] = mv.dataset.mv.split(':').map(Number), j = i + d; if (!sts[j]) return;
      [sts[i], sts[j]] = [sts[j], sts[i]]; sts.forEach((s, k) => { if (s.order !== k) store.put('stores', { ...s, order: k }); }); openStores(); }
  };
}
function editStore(s, back) {
  const st = { emoji: s?.emoji || '🏪', color: s?.color ?? (S.stores.length % COLORS.length) };
  const draw = name => show(`${head(s ? t('editStore') : t('newStore'))}
    <label class="lb">${t('storeName')}</label><input class="field" id="sName" dir="auto" value="${esc(name)}" placeholder="${t('storeNamePh')}" autocomplete="off">
    <label class="lb">${t('symbol')}</label><div class="pickers">${EMOJIS.map(e => `<button class="emo ${st.emoji === e ? 'on' : ''}" data-emo="${e}">${e}</button>`).join('')}</div>
    <label class="lb">${t('color')}</label><div class="pickers">${COLORS.map((c, i) => `<button class="col ${st.color === i ? 'on' : ''}" data-col="${i}" style="--c:${c}" aria-label="${c}"></button>`).join('')}</div>
    <div class="row"><button class="btn ghost" data-x="cancel">${t('cancel')}</button><button class="btn" data-x="save">${t('save')}</button></div>
    ${s ? `<button class="btn ghost danger" data-x="del">${ico('trash')}${t('del')}</button>` : ''}`);
  const bind = () => { sheet.onclick = e => {
    const emo = e.target.closest('[data-emo]'), col = e.target.closest('[data-col]'), x = e.target.closest('[data-x]')?.dataset.x;
    if (emo) { st.emoji = emo.dataset.emo; draw($('#sName').value); return bind(); }
    if (col) { st.color = +col.dataset.col; draw($('#sName').value); return bind(); }
    if (x === 'cancel' || x === 'close') return back();
    if (x === 'save') {
      const name = $('#sName').value.trim(); if (!name) return $('#sName').focus();
      const id = s?.id || 's-' + uid();
      store.put('stores', { ...(s || { order: S.stores.length }), id, name: s?.std && name === t('store_' + s.std) ? '' : name, emoji: st.emoji, color: st.color });
      return back(id);
    }
    if (x === 'del' && confirm(t('delStoreQ', { name: storeName(s) }))) { store.remove('stores', s.id); back(); }
  }; };
  draw(s ? storeName(s) : ''); bind();
  if (!s) setTimeout(() => $('#sName')?.focus(), 50);
}

/* Rezept ansehen */
function openRecipe(id, st = { serv: null, off: new Set() }) {
  const r = recipe(id); if (!r) return close();
  const base = r.servings || 0, serv = st.serv ?? base, f = base && serv ? serv / base : 1;
  const lines = (r.ingredients || []).map(parseLine), n = lines.length - st.off.size;
  show(`<div class="hero ${picCls(r)}" ${picStyle(r)}>${picIn(r)}<button class="round glass s" data-x="close" aria-label="‹">${ico('back')}</button><div class="glassRow"><button class="round glass2" data-x="share" aria-label="${t('shareRecipe')}">${ico('share')}</button><button class="round glass2 ${r.fav ? 'on' : ''}" data-x="fav" aria-label="${t('favs')}">${ico('heart')}</button></div></div>
    <div class="rbody"><h2 dir="auto">${esc(r.title)}</h2>
    <div class="facts">${r.time ? `<span>⏱ ${r.time} ${t('min')}</span>` : ''}<span>${RCATS.find(c => c[0] === rcatOf(r))[1]} ${t('rc_' + rcatOf(r))}</span></div>
    <div class="rcols"><div class="rc1"><div class="secHead"><h3>${t('ingredients')}</h3>${base ? `<div class="stepper"><button data-x="s-" aria-label="−">${ico('minus')}</button><span>${serv} ${t('persons')}</span><button data-x="s+" aria-label="+">${ico('plus')}</button></div>` : ''}</div>
    ${lines.length ? `<div class="card">${lines.map((p, i) => `<button class="ing2 ${st.off.has(i) ? '' : 'sel'}" data-i="${i}"><span class="chk">${ico('check')}</span><span class="nm"><b dir="auto">${esc(p.name)}</b></span><span class="q" dir="auto">${esc(fmtQty(f === 1 ? p.num : niceNum(p.num == null ? null : p.num * f, p.unit), p.unit))}</span></button>`).join('')}</div>
      <button class="btn" data-x="tolist" ${n ? '' : 'disabled'}>${ico('bag')}${t('toListN', { n })}</button>` : `<p class="hint">${t('noIngredients')}</p>`}</div>
    <div class="rc2"><div class="secHead"><h3>${t('steps')}</h3></div>
    <div class="steps" dir="auto">${stepsHtml(r.steps)}</div></div></div>
    ${r.url ? `<a class="linkBtn" href="${esc(r.url)}" target="_blank" rel="noopener">${ico('link')}${t('original_link')}</a>` : ''}
    <div class="row three"><button class="btn ghost" data-x="edit">${ico('edit')}${t('edit')}</button>${WORKER ? `<button class="btn ghost" data-x="tr">${ico('globe')}${t('translate')}</button>` : ''}<button class="btn ghost danger" data-x="del">${ico('trash')}${t('del')}</button></div></div>`, 'full recipe');
  sheet.onclick = e => {
    const ing = e.target.closest('[data-i]');
    if (ing) { const i = +ing.dataset.i; st.off.has(i) ? st.off.delete(i) : st.off.add(i); const y = sheet.scrollTop; openRecipe(id, st); sheet.scrollTop = y; return; }
    const x = e.target.closest('[data-x]')?.dataset.x; if (!x) return;
    if (x === 'close') close();
    else if (x === 's-' || x === 's+') { st.serv = Math.max(1, serv + (x === 's+' ? 1 : -1)); const y = sheet.scrollTop; openRecipe(id, st); sheet.scrollTop = y; }
    else if (x === 'fav') { store.put('recipes', { ...r, fav: !r.fav }); const y = sheet.scrollTop; openRecipe(id, st); sheet.scrollTop = y; }
    else if (x === 'tolist') { const k = addIngredients((r.ingredients || []).filter((_, i) => !st.off.has(i)), f); close(); toast(t('added', { n: k })); }
    else if (x === 'edit') editRecipe(r);
    else if (x === 'share') shareRecipe(r);
    else if (x === 'tr') translateRecipe(r);
    else if (x === 'del' && confirm(t('delRecipeQ', { name: r.title }))) { store.remove('recipes', r.id); close(); }
  };
}

/** Schritte "1. …" als nummerierte Liste mit großen Ziffern */
function stepsHtml(txt) {
  const parts = String(txt || '').split(/\n+/).map(x => x.trim()).filter(Boolean);
  if (!parts.length) return `<span class="hint">${t('noSteps')}</span>`;
  return `<ol class="stepList">${parts.map(x => `<li dir="auto">${esc(x.replace(/^\d+[.)]\s*/, ''))}</li>`).join('')}</ol>`;
}

const LANG_OPTS = () => [['orig', t('original')], ['de', 'Deutsch'], ['ar', 'العربية'], ['en', 'English']];

/* ---------- Rezept teilen: das ganze Rezept steckt komprimiert im Link (#r=…) ---------- */
const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = str => Uint8Array.from(atob(str.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
async function pack(obj) {
  const raw = new TextEncoder().encode(JSON.stringify(obj));
  if (!window.CompressionStream) return 'j' + b64u(raw);
  return 'z' + b64u(await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());
}
async function unpack(str) {
  const bytes = unb64u(str.slice(1));
  const raw = str[0] === 'z' ? await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer() : bytes;
  return JSON.parse(new TextDecoder().decode(raw));
}
async function shareRecipe(r) {
  const data = { t: r.title, i: r.ingredients || [], s: r.steps || '', m: r.time || 0, v: r.servings || 0, c: rcatOf(r), e: r.emoji || '🍽️', p: /^https?:/.test(r.image || '') ? r.image : '', u: r.url || '' };
  const url = `${location.origin}${location.pathname}#r=${await pack(data)}`;
  const text = `${t('shareRecipeText')} ${r.title}`;
  try { await navigator.share({ title: r.title, text, url }); }
  catch (e) { if (e?.name === 'AbortError') return; try { await navigator.clipboard.writeText(url); toast(t('copied')); } catch { prompt(t('shareRecipe'), url); } }
}
async function openShared(str) {
  let d; try { d = await unpack(str); } catch { return toast(t('shareBad')); }
  const r = { title: String(d.t || '').slice(0, 200), ingredients: [].concat(d.i || []).map(String).slice(0, 100), steps: String(d.s || ''), time: +d.m || 0, servings: +d.v || 0,
    category: RCATS.some(c => c[0] === d.c) ? d.c : 'main', emoji: d.e || '🍽️', image: /^https?:/.test(d.p || '') ? d.p : '', url: /^https?:/.test(d.u || '') ? d.u : '' };
  if (!r.title) return toast(t('shareBad'));
  show(`${head(t('sharedRecipe'), t('sharedFrom'))}<div class="shared"><div class="${picCls(r)}" ${picStyle(r)}>${picIn(r)}</div><div><b dir="auto">${esc(r.title)}</b><small>${rEmoji(r.category)} ${t('rc_' + r.category)}${rMeta(r) ? ' · ' + rMeta(r) : ''}</small></div></div>
    <div class="card pad">${r.ingredients.map(l => `<div class="ing"><span dir="auto">${esc(l)}</span></div>`).join('') || `<p class="hint">${t('noIngredients')}</p>`}</div>
    <button class="btn" data-x="save">${ico('plus')}${t('importShared')}</button>`, 'wide');
  sheet.onclick = e => {
    const x = e.target.closest('[data-x]')?.dataset.x;
    if (x === 'close') close();
    else if (x === 'save') { const id = uid(); store.put('recipes', { ...r, id, fav: false, t: Date.now() }); play('join'); toast(t('recipeSaved')); S.tab = 'recipes'; render(); openRecipe(id); }
  };
}

/* ---------- Rezept-Aktionen (über den ⋯-Knopf auf der Karte) ---------- */
function recipeActions(id) {
  const r = recipe(id); if (!r) return;
  show(`${head(esc(r.title), t('recipeActions'))}
    <button class="opt" data-x="share"><span class="oe">📤</span><span><b>${t('shareRecipe')}</b></span></button>
    <button class="opt" data-x="edit"><span class="oe">✏️</span><span><b>${t('edit')}</b></span></button>
    <button class="opt" data-x="fav"><span class="oe">${r.fav ? '🤍' : '❤️'}</span><span><b>${t('favs')}</b></span></button>
    <button class="opt danger" data-x="del"><span class="oe">🗑️</span><span><b>${t('del')}</b></span></button>`);
  sheet.onclick = e => {
    const x = e.target.closest('[data-x]')?.dataset.x; if (!x) return;
    if (x === 'close') close();
    else if (x === 'share') { close(); shareRecipe(r); }
    else if (x === 'edit') editRecipe(r);
    else if (x === 'fav') { store.put('recipes', { ...r, fav: !r.fav }); close(); }
    else if (x === 'del') { store.remove('recipes', r.id); close(); play('swoosh'); toast(t('deleted', { name: r.title }), { label: t('undo'), fn: () => store.put('recipes', r) }); }
  };
}

/* KI-Aufrufe */
async function ai(path, body, query = '') {
  if (!WORKER) throw new Error(t('aiNoWorker'));
  let r;
  try {
    r = await fetch(WORKER + path + query, body ? { method: 'POST', headers: aiHeaders(true), body: JSON.stringify(body), signal: AbortSignal.timeout(120000) } : { headers: aiHeaders(false), signal: AbortSignal.timeout(120000) });
  } catch { throw new Error(t('aiErr')); }
  const d = await r.json().catch(() => ({ error: 'HTTP ' + r.status }));
  if (!r.ok || d.error) throw new Error(d.error || 'HTTP ' + r.status);
  return d;
}
const busy = msg => show(`<div class="busy"><div class="spin"></div><b>${msg}</b></div>`);

function translateRecipe(r) {
  show(`${head(t('translateTo'))}<div class="row">${LANG_OPTS().slice(1).map(([k, l]) => `<button class="btn ghost" data-lg="${k}">${l}</button>`).join('')}</div>`);
  sheet.onclick = async e => {
    if (e.target.closest('[data-x="close"]')) return openRecipe(r.id);
    const lg = e.target.closest('[data-lg]')?.dataset.lg; if (!lg) return;
    busy(t('translating'));
    try {
      const d = await ai('text', { lang: lg, text: JSON.stringify({ title: r.title, ingredients: r.ingredients, steps: r.steps, time: r.time, servings: r.servings }) });
      store.put('recipes', { ...r, title: d.title || r.title, ingredients: d.ingredients?.length ? d.ingredients : r.ingredients, steps: d.steps || r.steps });
      toast(t('translated'));
    } catch (err) { toast(`${t('aiFail')}: ${err.message}`); }
    if (dlg.open) openRecipe(r.id);
  };
}

/* Neues Rezept */
function newRecipe() {
  const opt = (x, em, a, b) => `<button class="opt" data-x="${x}"><span class="oe">${em}</span><span><b>${t(a)}</b><small>${t(b)}</small></span>${ico('fwd')}</button>`;
  show(`${head(t('newRecipe'))}${WORKER ? opt('link', '🔗', 'fromLink', 'fromLinkSub') + opt('bulk', '📚', 'bulk', 'bulkSub') + opt('text', '📋', 'fromText', 'fromTextSub') : ''}${opt('manual', '✍️', 'manual', 'manualSub')}`);
  sheet.onclick = e => { const x = e.target.closest('[data-x]')?.dataset.x;
    if (x === 'close') close(); else if (x === 'manual') editRecipe(); else if (x === 'bulk') bulkSheet(); else if (x) importSheet(x); };
}
function importSheet(mode, val = '', error = '') {
  let lg = localStorage.getItem('ut:rlang') || getLang();
  const draw = () => show(`${head(t(mode === 'link' ? 'fromLink' : 'fromText'), t(mode === 'link' ? 'fromLinkSub' : 'fromTextSub'))}
    ${mode === 'link' ? `<input class="field" id="imp" type="url" inputmode="url" dir="ltr" placeholder="${t('linkPh')}" value="${esc(val)}" autocomplete="off">`
      : `<textarea class="field tall" id="imp" dir="auto" placeholder="${t('textPh')}">${esc(val)}</textarea>`}
    ${mode === 'link' ? `<p class="hint ytHint"><span class="yt">▶</span>${t('ytHint')}</p>` : ''}
    <label class="lb">${t('recipeLang')}</label>
    <div class="seg">${LANG_OPTS().map(([k, l]) => `<button data-lg="${k}" class="${lg === k ? 'on' : ''}">${l}</button>`).join('')}</div>
    ${error ? `<div class="err"><b>${t('aiFail')}</b><span dir="auto">${esc(error)}</span></div>` : ''}
    <button class="btn" data-x="go">${ico('spark')}${t('readRecipe')}</button>`);
  const bind = () => { sheet.onclick = async e => {
    const l = e.target.closest('[data-lg]');
    if (l) { val = $('#imp').value; lg = l.dataset.lg; localStorage.setItem('ut:rlang', lg); draw(); return bind(); }
    const x = e.target.closest('[data-x]')?.dataset.x;
    if (x === 'close') return newRecipe();
    if (x !== 'go') return;
    val = $('#imp').value.trim(); if (!val) return $('#imp').focus();
    if (mode === 'link' && !/^https?:\/\//i.test(val)) val = 'https://' + val;
    const isYT = mode === 'link' && /(?:youtube\.com|youtu\.be)\//i.test(val);
    busy(isYT ? t('aiVideo') : t('aiWorking'));
    try {
      const d = mode === 'link' ? await ai('', null, `?url=${encodeURIComponent(val)}&lang=${lg}`) : await ai('text', { text: val, lang: lg });
      if (!dlg.open) return;
      editRecipe({ title: d.title, ingredients: d.ingredients || [], steps: d.steps || '', time: d.time || 0, servings: d.servings || 0, category: d.category || 'main', emoji: d.emoji || '🍽️', image: d.image || '', url: d.url || (mode === 'link' ? val : '') });
      toast(d.warning ? t('aiPartial') : t('checkRecipe'));
    } catch (err) { if (dlg.open) importSheet(mode, val, err.message); }
  }; };
  draw(); bind();
  setTimeout(() => $('#imp')?.focus(), 50);
}

/** Viele Links auf einmal: je drei gleichzeitig lesen und direkt speichern */
function bulkSheet() {
  let lg = localStorage.getItem('ut:rlang') || 'orig';
  const draw = (val = '') => show(`${head(t('bulk'), t('bulkSub'))}
    <textarea class="field tall" id="bulkIn" dir="ltr" placeholder="${t('bulkPh')}">${esc(val)}</textarea>
    <label class="lb">${t('recipeLang')}</label>
    <div class="seg">${LANG_OPTS().map(([k, l]) => `<button data-lg="${k}" class="${lg === k ? 'on' : ''}">${l}</button>`).join('')}</div>
    <button class="btn" data-x="go">${ico('spark')}${t('bulkGo')}</button>`, 'wide');
  draw();
  sheet.onclick = async e => {
    const l = e.target.closest('[data-lg]');
    if (l) { const v = $('#bulkIn').value; lg = l.dataset.lg; localStorage.setItem('ut:rlang', lg); draw(v); return; }
    const x = e.target.closest('[data-x]')?.dataset.x;
    if (x === 'close') return close();
    if (x === 'done') { close(); S.tab = 'recipes'; S.rcat = 'all'; localStorage.setItem('ut:rsort', 'new'); return render(); }
    if (x !== 'go') return;
    const have = new Set(S.recipes.map(r => r.url).filter(Boolean));
    const urls = [...new Set(($('#bulkIn').value.match(/https?:\/\/[^\s"'<>]+/g) || []).map(u => u.replace(/[),.;]+$/, '')))];
    if (!urls.length) return toast(t('bulkNone'));
    const jobs = urls.map((u, i) => ({ i, u, st: have.has(u) ? 'skip' : 'wait', msg: '' }));
    const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };
    const row = j => `<div class="bj ${j.st}" id="bj${j.i}"><span class="bs">${{ wait: '⏳', run: '<i class="spin s"></i>', ok: '✓', err: '✗', skip: '↷' }[j.st]}</span><span class="bt"><b dir="auto">${esc(j.msg || host(j.u))}</b><small dir="ltr">${esc(j.st === 'err' ? j.err : j.st === 'skip' ? t('bulkSkip') : host(j.u))}</small></span></div>`;
    const sum = () => { const ok = jobs.filter(j => j.st === 'ok').length, left = jobs.filter(j => j.st === 'wait' || j.st === 'run').length;
      const h = $('#bulkSum'); if (h) h.textContent = left ? t('bulkRun', { n: jobs.length - left, all: jobs.length }) : t('bulkDone', { n: ok }); const d = $('#bulkDone'); if (d && !left) d.classList.remove('hidden'); };
    show(`${head(t('bulk'))}<p class="hint" id="bulkSum"></p><div class="card bjs">${jobs.map(row).join('')}</div><button class="btn hidden" id="bulkDone" data-x="done">${ico('book')}${t('bulkShow')}</button>`, 'wide');
    sheet.onclick = e2 => { const x2 = e2.target.closest('[data-x]')?.dataset.x; if (x2 === 'close') close(); else if (x2 === 'done') { close(); S.tab = 'recipes'; S.rcat = 'all'; S.q = ''; localStorage.setItem('ut:rsort', 'new'); render(); } };
    const upd = j => { const el = $('#bj' + j.i); if (el) el.outerHTML = row(j); sum(); };
    sum();
    const queue = jobs.filter(j => j.st === 'wait');
    const worker = async () => {
      for (let j; (j = queue.shift());) {
        j.st = 'run'; upd(j);
        try {
          const d = await ai('', null, `?url=${encodeURIComponent(j.u)}&lang=${lg}`);
          store.put('recipes', { id: uid(), title: d.title, ingredients: d.ingredients || [], steps: d.steps || '', time: d.time || 0, servings: d.servings || 0,
            category: RCATS.some(c => c[0] === d.category) ? d.category : 'main', emoji: d.emoji || '🍽️', image: d.image || '', url: d.url || j.u, fav: false, t: Date.now() });
          j.st = 'ok'; j.msg = d.title;
        } catch (err) { j.st = 'err'; j.err = err.message; }
        upd(j);
      }
    };
    await Promise.all([worker(), worker(), worker()]);
    play('join');
  };
  setTimeout(() => $('#bulkIn')?.focus(), 50);
}

function editRecipe(r = {}) {
  const cat = r.category ? rcatOf(r) : 'main';
  show(`${head(r.id ? t('editRecipe') : t('newRecipe'))}
    <div class="row"><div class="w80"><label class="lb">${t('emoji')}</label><input class="field center" id="eEmoji" value="${esc(r.emoji || '🍽️')}"></div><div><label class="lb">${t('title')}</label><input class="field" dir="auto" id="eTitle" value="${esc(r.title)}"></div></div>
    <div class="row"><div><label class="lb">${t('category')}</label><select class="field" id="eCat">${RCATS.slice(1).map(([c, e]) => `<option value="${c}" ${cat === c ? 'selected' : ''}>${e} ${t('rc_' + c)}</option>`).join('')}</select></div>
      <div class="w80"><label class="lb">${t('minutes')}</label><input class="field" id="eTime" type="number" inputmode="numeric" value="${r.time || ''}"></div><div class="w80"><label class="lb">${t('persons')}</label><input class="field" id="eServ" type="number" inputmode="numeric" value="${r.servings || ''}"></div></div>
    <label class="lb">${t('ingredients')}</label><textarea class="field tall" dir="auto" id="eIng" placeholder="${t('ingPh')}">${esc((r.ingredients || []).join('\n'))}</textarea>
    <label class="lb">${t('steps')}</label><textarea class="field tall" dir="auto" id="eSteps">${esc(r.steps)}</textarea>
    <label class="lb">${t('image')}</label><input class="field" id="eImg" type="url" dir="ltr" value="${esc(r.image)}">
    <label class="lb">${t('source')}</label><input class="field" id="eUrl" type="url" dir="ltr" value="${esc(r.url)}">
    <div class="row"><button class="btn ghost" data-x="cancel">${t('cancel')}</button><button class="btn" data-x="save">${t('save')}</button></div>`);
  sheet.onclick = e => {
    const x = e.target.closest('[data-x]')?.dataset.x;
    if (x === 'cancel' || x === 'close') return r.id ? openRecipe(r.id) : close();
    if (x !== 'save') return;
    const title = $('#eTitle').value.trim(); if (!title) return toast(t('needTitle'));
    const rec = { ...r, id: r.id || uid(), title, emoji: $('#eEmoji').value.trim() || '🍽️', category: $('#eCat').value, url: $('#eUrl').value.trim(), image: $('#eImg').value.trim(),
      time: +$('#eTime').value || 0, servings: +$('#eServ').value || 0, fav: !!r.fav, t: r.t || Date.now(),
      ingredients: $('#eIng').value.split('\n').map(s => s.trim()).filter(Boolean), steps: $('#eSteps').value.trim() };
    store.put('recipes', rec); openRecipe(rec.id);
  };
}

/** Gericht für einen Platz im Plan wählen. ref = "m0".."m2" (Hauptgericht) oder "x<id>" (Extra). */
function pickRecipe(ref) {
  const p = planOf(S.week), isMain = ref[0] === 'm', ex = isMain ? null : p.extra.find(e => e.id === ref.slice(1));
  if (!isMain && !ex) return close();
  const c = isMain ? 'main' : ex.c, all = [...S.recipes].sort((a, b) => a.title.localeCompare(b.title, getLang()));
  const fit = all.filter(r => rcatOf(r) === c), rest = all.filter(r => rcatOf(r) !== c);
  const opt = r => `<button class="opt" data-r="${r.id}"><span class="${picCls(r)} sm" ${picStyle(r)}>${picIn(r)}</span><span><b dir="auto">${esc(r.title)}</b><small>${rEmoji(rcatOf(r))} ${t('rc_' + rcatOf(r))}${rMeta(r) ? ' · ' + rMeta(r) : ''}</small></span></button>`;
  show(`${head(`${rEmoji(c)} ${t('c_' + c)}`, isMain ? slotLabel(+ref[1], p.slots.length) : '')}
    ${fit.length ? fit.map(opt).join('') : `<p class="hint">${t('noneOfCourse', { c: t('rc_' + c) })}</p>`}
    ${rest.length ? `<h4 class="subH">${t('otherRecipes')}</h4>${rest.map(opt).join('')}` : ''}
    ${!all.length ? `<p class="hint">${t('needRecipes')}</p>` : ''}
    <button class="btn ghost danger" data-r="">${ico('trash')}${isMain ? t('clearSlot') : t('removeCourse')}</button>`);
  sheet.onclick = e => {
    if (e.target.closest('[data-x="close"]')) return close();
    const b = e.target.closest('[data-r]'); if (!b) return;
    const cur = planOf(S.week), rid = b.dataset.r || null;
    if (isMain) { const slots = [...cur.slots]; slots[+ref[1]] = rid; savePlan(S.week, { slots }); }
    else savePlan(S.week, { extra: rid ? cur.extra.map(e => e.id === ex.id ? { ...e, r: rid } : e) : cur.extra.filter(e => e.id !== ex.id) });
    close();
  };
}
function addCourse(c) {
  const p = planOf(S.week), e = { id: uid().slice(0, 8), c, r: null };
  const pool = S.recipes.filter(r => rcatOf(r) === c);
  if (pool.length === 1) e.r = pool[0].id;
  savePlan(S.week, { extra: [...p.extra, e] });
  if (!e.r && S.recipes.length) setTimeout(() => pickRecipe('x' + e.id), 30);
}

/* ---------- Töne ---------- */
const SND_KEYS = [['check', '✅'], ['tap', '👆'], ['del', '🗑️'], ['move', '↔️'], ['vib', '📳']];
const sndSummary = () => { const o = snd(), on = SND_KEYS.filter(([k]) => o[k]); return on.length ? on.map(([k]) => t('snd_' + k)).join(' · ') : t('snd_off'); };
function openSounds() {
  const o = snd();
  show(`${head(t('snd'), t('sndSub'))}<div class="card menu">${SND_KEYS.map(([k, e]) => `<button data-snd="${k}"><span class="oe sm">${e}</span><span>${t('snd_' + k)}</span><span class="sw ${o[k] ? 'on' : ''}"><i></i></span></button>`).join('')}</div>`);
  sheet.onclick = e => {
    if (e.target.closest('[data-x="close"]')) return close();
    const b = e.target.closest('[data-snd]'); if (!b) return;
    const k = b.dataset.snd, v = !snd()[k]; setSnd(k, v); b.querySelector('.sw').classList.toggle('on', v);
    if (v) { if (k === 'vib') vib(20); else play({ check: 'on', tap: 'tap', del: 'swoosh', move: 'drop' }[k]); }
  };
}

/* ---------- Einkauf abschließen & Verlauf (in "meta" als trip-…) ---------- */
const trips = () => S.meta.filter(m => m.id.startsWith('trip-')).sort((a, b) => b.t - a.t);
function finishTrip() {
  const done = S.items.filter(i => i.done); if (!done.length) return;
  store.put('meta', { id: 'trip-' + Date.now(), t: Date.now(), items: done.map(i => ({ key: i.key, name: itemName(i), qty: i.qty || '', store: i.store || '' })) });
  done.forEach(i => store.remove('items', i.id));
  trips().slice(40).forEach(m => store.remove('meta', m.id));
  play('join'); vib(20); toast(t('tripDone', { n: done.length }));
}
function openHistory(openId) {
  const ts = trips(), loc = getLang() === 'de' ? 'de-DE' : getLang() === 'ar' ? 'ar-u-nu-latn' : 'en-GB';
  const date = ms => new Date(ms).toLocaleDateString(loc, { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' + new Date(ms).toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' });
  show(`${head(t('history'))}${ts.length ? ts.map((m, i) => `<details class="trip" ${m.id === openId || (!openId && !i) ? 'open' : ''}><summary><span class="oe sm">🧾</span><span><b>${date(m.t)}</b><small>${t('nItems', { n: m.items.length })}</small></span></summary>
    <div class="card">${m.items.map((x, j) => { const p = prod(x.key); return `<button class="hrow" data-again="${m.id}:${j}"><span class="em">${p?.emoji || '🛒'}</span><span class="nm"><b dir="auto">${esc(p ? pName(p) : x.name)}</b>${x.qty ? `<small dir="auto">${esc(x.qty)}</small>` : ''}</span><span class="plus">${ico('plus')}</span></button>`; }).join('')}</div></details>`).join('')
    : `<div class="empty small"><div class="art">🧾</div><b>${t('noHistory')}</b></div>`}`);
  sheet.onclick = e => {
    if (e.target.closest('[data-x="close"]')) return close();
    const a = e.target.closest('[data-again]'); if (!a) return;
    const [mid, j] = a.dataset.again.split(':'), x = S.meta.find(m => m.id === mid)?.items[+j]; if (!x) return;
    if (addEntry(x.key, x.name, x.qty)) { tick(true); a.classList.add('on'); toast(t('added', { n: 1 })); } else toast(t('onList'));
  };
}

/* ---------- Als App installieren ---------- */
let installEvt = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; schedule(); });
addEventListener('appinstalled', () => { installEvt = null; localStorage.setItem('ut:instX', '1'); schedule(); });
const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
function installRow() {
  if (standalone()) return '';
  return `<div class="banner inst"><span class="be"><img src="icons/icon.svg" alt=""></span><span class="bt"><b>${t('install')}</b><small>${t('installSub')}</small></span><button class="btn fit" id="installBtn">${ico('install')}</button></div>`;
}
async function doInstall() {
  if (installEvt) { installEvt.prompt(); const r = await installEvt.userChoice.catch(() => null); if (r?.outcome === 'accepted') installEvt = null; return render(); }
  show(`${head(t('install'), t('installSub'))}<div class="instHow"><img src="icons/icon.svg" alt=""><p>${isIOS() ? t('installIos') : t('installAndroid')}</p></div>
    <button class="btn" data-x="close">${t('finish')}</button>`);
  sheet.onclick = e => { if (e.target.closest('[data-x="close"]')) close(); };
}

/* ---------- Haushalt & Beispieldaten ---------- */
function relangDemo() {
  const map = new Map(demoRecipes(getLang()).map(r => [r.id, r]));
  for (const r of S.recipes) { const n = map.get(r.id); if (r.demo && n && n.title !== r.title) store.put('recipes', { ...r, title: n.title, ingredients: n.ingredients, steps: n.steps, category: n.category }); }
}
function toggleDemo() {
  const demo = S.recipes.filter(r => r.demo);
  if (demo.length) demo.forEach(r => store.remove('recipes', r.id));
  else demoRecipes(getLang()).forEach(r => store.put('recipes', r));
}
function switchHousehold(c) { localStorage.setItem('ut:code', c); sessionStorage.setItem('ut:joined', '1'); location.hash = ''; location.reload(); }
const loadJs = src => loadJs[src] ||= new Promise((res, rej) => { const el = document.createElement('script'); el.src = src; el.onload = res; el.onerror = () => { loadJs[src] = null; rej(new Error('load')); }; document.head.append(el); });
const inviteLink = () => `${location.origin}${location.pathname}#${code}`;
async function drawQR(el) {
  try {
    await loadJs('js/vendor/qrcode.js');
    const q = window.qrcode(0, 'M'); q.addData(inviteLink()); q.make();
    el.innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
  } catch { el.classList.add('hidden'); }
}
/** Haushaltscode aus einem gescannten Text (Einladungslink oder Code) */
const codeFrom = txt => { const c = normCode(String(txt).includes('#') ? String(txt).split('#').pop() : String(txt)); return c.length === 10 ? c : ''; };
function confirmJoin(c) {
  if (c === code) { close(); return toast(t('alreadyIn')); }
  play('join'); vib(20);
  show(`${head(t('joinQ'))}<div class="code" dir="ltr">${fmtCode(c)}</div><p class="hint">${t('joinInfo')}</p>
    <div class="row"><button class="btn ghost" data-x="close">${t('cancel')}</button><button class="btn" data-x="join">${t('join')}</button></div>`);
  sheet.onclick = e => { const x = e.target.closest('[data-x]')?.dataset.x; if (x === 'close') close(); else if (x === 'join') switchHousehold(c); };
}
/** QR-Code mit der Kamera lesen: BarcodeDetector (Android/Chrome) oder jsQR (iPhone) */
async function openScanner() {
  show(`${head(t('scanTitle'), t('scanSub'))}<div class="scan"><video id="scV" playsinline muted autoplay></video><i class="frame"></i></div><p class="hint center" id="scMsg">${t('scanWait')}</p>`);
  let stream = null, stop = false, timer = 0;
  sheetCleanup = () => { stop = true; clearTimeout(timer); stream?.getTracks().forEach(tr => tr.stop()); };
  sheet.onclick = e => { if (e.target.closest('[data-x="close"]')) close(); };
  const msg = m => { const el = $('#scMsg'); if (el) el.textContent = m; };
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 } }, audio: false });
  } catch { return msg(t('camErr')); }
  if (stop) return stream.getTracks().forEach(tr => tr.stop());
  const v = $('#scV'); v.srcObject = stream; try { await v.play(); } catch {}
  let det = null;
  try { if ('BarcodeDetector' in window && (await BarcodeDetector.getSupportedFormats()).includes('qr_code')) det = new BarcodeDetector({ formats: ['qr_code'] }); } catch {}
  if (!det) { try { await loadJs('js/vendor/jsQR.js'); } catch { return msg(t('camErr')); } }
  const cv = document.createElement('canvas'), cx = cv.getContext('2d', { willReadFrequently: true });
  msg(t('scanHint'));
  const loop = async () => {
    if (stop) return;
    let txt = '';
    try {
      if (v.readyState >= 2 && v.videoWidth) {
        if (det) txt = (await det.detect(v))[0]?.rawValue || '';
        else {
          const k = Math.min(1, 640 / v.videoWidth); cv.width = v.videoWidth * k | 0; cv.height = v.videoHeight * k | 0;
          cx.drawImage(v, 0, 0, cv.width, cv.height);
          txt = window.jsQR(cx.getImageData(0, 0, cv.width, cv.height).data, cv.width, cv.height, { inversionAttempts: 'attemptBoth' })?.data || '';
        }
      }
    } catch {}
    if (stop) return;
    const c = txt && codeFrom(txt);
    if (c) { sheetCleanup(); sheetCleanup = null; return confirmJoin(c); }
    if (txt) msg(t('scanNoCode'));
    timer = setTimeout(loop, 160);
  };
  loop();
}
async function checkAI() {
  if (!WORKER || S.ai != null) return;
  try { const d = await (await fetch(WORKER + 'health', { signal: AbortSignal.timeout(8000) })).json(); S.ai = !!d.ai; } catch { S.ai = 'err'; }
  if (S.tab === 'more') render();
}

/* ---------- Ereignisse ---------- */
document.addEventListener('click', async e => {
  const el = e.target;
  const tab = el.closest('#tabs [data-tab]');
  if (tab) { S.tab = tab.dataset.tab; scrollTo(0, 0); render(); if (S.tab === 'more') checkAI(); return; }
  if (Date.now() - suppressClick < 450) return;
  if (dlg.open) return;
  const sg = el.closest('[data-sugg]');
  if (sg) { const inp = $('#addInput'), parts = inp.value.split(/[,،]/), last = parseLine(parts.pop());
    if (!addEntry(sg.dataset.sugg, pName(prod(sg.dataset.sugg)), fmtQty(last.num, last.unit))) toast(t('onList'));
    inp.value = ''; $('#sugg').innerHTML = ''; inp.focus(); return; }
  const sf = el.closest('[data-sf]'); if (sf) { S.storeF = sf.dataset.sf; return render(); }
  const itemBtn = el.closest('[data-item]'); if (itemBtn) return openItem(itemBtn.dataset.item);
  const row = el.closest('.it[data-id]');
  if (row) { const it = S.items.find(i => i.id === row.dataset.id); if (!it || row.classList.contains('checking')) return;
    tick(!it.done);
    if (it.done) { store.put('items', { ...it, done: false }); return; }
    // Häkchen zeichnen, kurz zeigen, dann Zeile sanft ausblenden
    row.style.height = row.offsetHeight + 'px'; row.classList.add('checking'); checking++;
    setTimeout(() => row.classList.add('leaving'), 420);
    setTimeout(() => { checking--; const cur = S.items.find(i => i.id === it.id); if (cur && !cur.done) store.put('items', { ...cur, done: true }); else schedule(); }, 700);
    return; }
  const fav = el.closest('[data-fav]'); if (fav) { const r = recipe(fav.dataset.fav); if (r) store.put('recipes', { ...r, fav: !r.fav }); return; }
  const ra = el.closest('[data-ract]'); if (ra) return recipeActions(ra.dataset.ract);
  const op = el.closest('[data-open]'); if (op) return openRecipe(op.dataset.open);
  const rc = el.closest('[data-rcat]'); if (rc) { S.rcat = rc.dataset.rcat; return render(); }
  const pk = el.closest('[data-pick]'); if (pk) return S.recipes.length ? pickRecipe(pk.dataset.pick) : toast(t('needRecipes'));
  const ac2 = el.closest('[data-addc]'); if (ac2) return addCourse(ac2.dataset.addc);
  const lg = el.closest('[data-lang]'); if (lg) { setLang(lg.dataset.lang); relangDemo(); return render(); }
  const th = el.closest('[data-th]'); if (th) { localStorage.setItem('ut:theme', th.dataset.th); applyTheme(); return render(); }
  const cn = el.closest('[data-cfgn]'); if (cn) { setPlanCfg({ n: Math.min(7, Math.max(1, planCfg().n + +cn.dataset.cfgn)) }); return render(); }
  const gp = el.closest('[data-gap]'); if (gp) { setPlanCfg({ gap: +gp.dataset.gap }); return render(); }
  const pa = el.closest('[data-padd]'); if (pa) { const a = planCfg().add, c = pa.dataset.padd; setPlanCfg({ add: a.includes(c) ? a.filter(x => x !== c) : [...a, c] }); return render(); }
  const id = el.closest('[id]')?.id;
  if (id === 'openCatalog' || id === 'openCatalog2') openCatalog();
  else if (id === 'manageStores') openStores();
  else if (id === 'oldOpen') openImport();
  else if (id === 'oldX') { localStorage.setItem('ut:oldX', code); render(); }
  else if (id === 'tipX') { localStorage.setItem('ut:hint', '1'); render(); }
  else if (id === 'aiOpen') openAI();
  else if (id === 'fxBtn') openSounds();
  else if (id === 'histBtn') openHistory();
  else if (id === 'installBtn') doInstall();
  else if (id === 'installX') { localStorage.setItem('ut:instX', '1'); render(); }
  else if (id === 'finishTrip') finishTrip();
  else if (id === 'newRecipe' || id === 'newRecipe2') newRecipe();
  else if (id === 'favF') { S.fav = !S.fav; render(); }
  else if (id === 'demoBtn') toggleDemo();
  else if (id === 'suggest') suggest(S.week);
  else if (id === 'wPrev') { S.week--; render(); } else if (id === 'wNext') { S.week++; render(); }
  else if (id === 'planToList') { const n = addIngredients(aggregate(planOf(S.week)).map(a => `${fmtQty(a.num, a.unit)} ${a.name}`.trim())); toast(t('added', { n })); }
  else if (id === 'mScan') openScanner();
  else if (id === 'mShare') {
    const link = inviteLink();
    try { await navigator.share({ title: t('app'), text: `${t('shareText')} ${fmtCode(code)}`, url: link }); }
    catch { try { await navigator.clipboard.writeText(link); toast(t('copied')); } catch { toast(fmtCode(code)); } }
  }
  else if (id === 'mJoinBtn') { const c = normCode($('#mJoin').value); c.length === 10 ? switchHousehold(c) : toast(t('codeLen')); }
  else if (id === 'mNew' && confirm(t('newHouseholdQ'))) switchHousehold(newCode());
});
document.addEventListener('click', e => {
  const b = e.target.closest('button, .chip, .opt, .linkBtn, summary, [data-open], [data-pick]');
  if (b && !b.closest('.it, .tile[data-key]') && !b.disabled) play('tap');
}, true);
document.addEventListener('submit', e => {
  if (e.target.id !== 'addForm') return;
  e.preventDefault();
  const i = $('#addInput'), v = i.value.trim(); if (!v) return;
  if (!addText(v)) toast(t('onList'));
  i.value = ''; $('#sugg').innerHTML = ''; i.focus();
});
document.addEventListener('input', e => {
  if (e.target.id === 'addInput') $('#sugg').innerHTML = suggHtml(e.target.value);
  if (e.target.id === 'rSearch') { S.q = e.target.value; clearTimeout(S.qT); S.qT = setTimeout(render, 140); }
  if (e.target.id === 'rSort') { localStorage.setItem('ut:rsort', e.target.value); render(); }
});
addEventListener('hashchange', () => { if (location.hash.startsWith('#r=')) { const h = location.hash.slice(3); history.replaceState(null, '', location.pathname); return openShared(h); } const c = codeFrom(location.hash); if (c) { history.replaceState(null, '', location.pathname); confirmJoin(c); } });
document.addEventListener('keydown', e => {
  if (dlg.open || e.ctrlKey || e.metaKey || e.altKey || /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)) return;
  if (e.key === '/') { const el = $('#addInput') || $('#rSearch'); if (el) { e.preventDefault(); el.focus(); } }
  else if (e.key === 'n' && S.tab === 'recipes') { e.preventDefault(); newRecipe(); }
  else if (/^[1-4]$/.test(e.key)) { S.tab = TABS[+e.key - 1][0]; render(); if (S.tab === 'more') checkAI(); }
});
document.addEventListener('toggle', e => { if (e.target.id === 'doneBox') S.doneOpen = e.target.open; }, true);

/* ---------- Start ---------- */
function seed() {
  if (!store.net.synced || S.meta.some(m => m.id === 'init')) return;
  store.put('meta', { id: 'init', t: Date.now() });
  STD.forEach((s, i) => { if (!storeMap.has(s.id)) store.put('stores', { ...s, order: i }); });
  // Daten der früheren lokalen Version übernehmen
  const old = c => { try { return JSON.parse(localStorage.getItem(`unsertisch:${code}:${c}`)) || []; } catch { return []; } };
  old('recipes').filter(r => !r.demo).forEach(r => store.put('recipes', r));
  old('plan').filter(p => !p.demo).forEach(p => store.put('plan', p));
  old('items').filter(i => !i.demo && !i.done).forEach(i => addText(`${i.qty || ''} ${i.name}`));
}

/** Einmalig: "Fladenbrot" aus der alten Liste war arabisches Brot */
function migrate() {
  if (!store.net.synced || S.meta.some(m => m.id === 'mig-bread')) return;
  store.put('meta', { id: 'mig-bread', t: Date.now() });
  if (!S.meta.some(m => m.id === 'oldlist')) return;
  for (const i of S.items) if (i.key === 'fladenbrot') store.put('items', { ...i, key: 'arabisches-brot', name: 'Arabisches Brot' });
  const pf = S.prefs.find(x => x.id === 'fladenbrot'); if (pf) { store.put('prefs', { ...pf, id: 'arabisches-brot' }); store.remove('prefs', 'fladenbrot'); }
}

let enrichedOnce = false;
/** Eigene Artikel, die noch nicht übersetzt sind (z. B. App wurde vorher geschlossen), einmal pro Start nachholen */
function retryEnrich() {
  if (enrichedOnce || !store?.net.synced) return;
  enrichedOnce = true;
  for (const c of customMap.values()) if (!c.ai && (!c.de || !c.ar)) enrich(c.id, c.de || c.ar);
}

/* ---------- Frühere Liste übernehmen ---------- */
function importOld(onList) {
  const SID = { a: 's-arab', s: 's-super', d: 's-dm' };
  let n = 0;
  for (const e of OLD_LIST) {
    const p = PRODUCTS.find(x => x.de === e.de), key = p ? p.id : 'c:' + norm(e.de);
    if (!p && !customMap.has(key)) store.put('custom', { id: key, de: e.de, ar: e.ar, cat: e.cat, emoji: e.emoji, ai: 1 });
    if (!prefMap.has(key)) store.put('prefs', { id: key, store: storeMap.has(SID[e.s]) ? SID[e.s] : '' });
    if ((onList || e.open) && addEntry(key, p ? pName(p) : e.de)) n++;
  }
  store.put('meta', { id: 'oldlist', t: Date.now() });
  return n;
}
function openImport() {
  const cnt = k => OLD_LIST.filter(e => e.s === k).length;
  const row = (sid, k) => { const s = storeMap.get(sid); return s ? `<div class="ing"><span>${s.emoji} ${esc(storeName(s))}</span><span>${cnt(k)}</span></div>` : ''; };
  show(`${head(t('oldTitle'))}<p class="hint">${t('oldSub', { n: OLD_LIST.length })}</p>
    <div class="card pad">${row('s-arab', 'a')}${row('s-super', 's')}${row('s-dm', 'd')}</div>
    <button class="opt" data-x="list"><span class="oe">🛒</span><span><b>${t('oldToList')}</b><small>${t('oldToListSub')}</small></span>${ico('fwd')}</button>
    <button class="opt" data-x="known"><span class="oe">⭐</span><span><b>${t('oldKnown')}</b><small>${t('oldKnownSub')}</small></span>${ico('fwd')}</button>`);
  sheet.onclick = e => {
    const x = e.target.closest('[data-x]')?.dataset.x; if (!x) return;
    if (x === 'close') return close();
    const n = importOld(x === 'list'); close();
    toast(x === 'list' ? t('added', { n }) : t('oldDone', { n: OLD_LIST.length }));
  };
}

/* ---------- KI-Einstellungen ---------- */
function openAI(result = '') {
  const srv = !WORKER ? t('aiOff') : S.ai === true ? t('aiOk') : S.ai === false ? t('aiOff') : S.ai == null ? t('aiCheck') : t('aiErr');
  show(`${head(t('ai'))}<p class="hint">${t('aiInfo')}</p>
    <div class="card menu"><div class="mrow">${ico('globe')}<span>${t('aiServer')}<small>${srv}</small></span><i class="dot ${S.ai === true ? 'on' : 'off'}"></i></div></div>
    <label class="lb">${t('ownKey')}</label>
    <input class="field" id="gKey" type="password" dir="ltr" autocomplete="off" spellcheck="false" placeholder="AIza…" value="${esc(gkey())}">
    <p class="hint">${t('ownKeyHint')} <a class="a" href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a></p>
    ${result}
    <div class="row"><button class="btn ghost" data-x="save">${t('save')}</button><button class="btn" data-x="test">${ico('spark')}${t('aiTest')}</button></div>`);
  const save = () => { const v = $('#gKey').value.trim(); v ? localStorage.setItem('ut:gkey', v) : localStorage.removeItem('ut:gkey'); };
  sheet.onclick = async e => {
    const x = e.target.closest('[data-x]')?.dataset.x; if (!x) return;
    if (x === 'close') return close();
    save();
    if (x === 'save') { toast(t('saved')); return close(); }
    busy(t('aiTesting'));
    const t0 = Date.now();
    try {
      const d = await ai('items', { names: ['Milch', 'خبز'] });
      const sec = ((Date.now() - t0) / 1000).toFixed(1);
      openAI(`<div class="ok"><b>✓ ${t('aiWorks')} (${sec} s)</b><span>${(d.items || []).map(i => `${esc(i.de)} ⇄ ${esc(i.ar)}`).join(' · ')}</span></div>`);
    } catch (err) { if (dlg.open) openAI(`<div class="err"><b>${t('aiFail')}</b><span dir="auto">${esc(err.message)}</span></div>`); }
  };
}

/* ---------- Gesten: Wischen = Löschen, lange drücken + ziehen = anderer Markt ---------- */
function delItem(id) {
  const it = S.items.find(i => i.id === id); if (!it) return;
  store.remove('items', id); vib(12); play('swoosh');
  toast(t('deleted', { name: itemName(it) }), { label: t('undo'), fn: () => store.put('items', it) });
}
function showDropbar() {
  const bar = $('#dropbar');
  bar.innerHTML = `<p>${t('dropHere')}</p><div class="dzs">${stores().map(s => `<div class="dz" data-drop="${s.id}" style="--c:${storeColor(s)}"><span>${s.emoji}</span><b dir="auto">${esc(storeName(s))}</b></div>`).join('')}
    <div class="dz" data-drop=""><span>📍</span><b>${t('noStore')}</b></div><div class="dz del" data-drop="__del"><span>🗑️</span><b>${t('del')}</b></div></div>`;
  bar.classList.add('on');
}
function startDrag() {
  if (!G || !S.items.some(i => i.id === G.id)) return endG(true);
  G.mode = 'drag'; vib(25); haptic();
  const r = G.row.getBoundingClientRect(), gh = G.row.cloneNode(true);
  gh.className = 'it dragGhost'; Object.assign(gh.style, { width: r.width + 'px', left: r.left + 'px', top: r.top + 'px' });
  document.body.append(gh); G.ghost = gh; G.row.classList.add('lifted'); document.body.classList.add('dragging');
  showDropbar(); moveDrag();
  const loop = () => {
    if (!G || G.mode !== 'drag') return;
    const barTop = $('#dropbar').getBoundingClientRect().top;
    if (G.y < 110) scrollBy(0, -9); else if (G.y > barTop - 50 && G.y < barTop) scrollBy(0, 9);
    moveDrag(); G.raf = requestAnimationFrame(loop);
  };
  G.raf = requestAnimationFrame(loop);
}
function moveDrag() {
  G.ghost.style.transform = `translate(${G.x - G.x0}px, ${G.y - G.y0}px) rotate(-1.2deg) scale(1.03)`;
  const over = document.elementFromPoint(G.x, G.y)?.closest('[data-drop]') || null;
  if (over !== G.over) { G.over?.classList.remove('over'); over?.classList.add('over'); if (over) vib(6); G.over = over; }
}
function endG(cancel) {
  if (!G) return;
  const g = G; G = null; clearTimeout(g.lp);
  if (g.mode === 'swipe') {
    suppressClick = Date.now();
    const dx = g.x - g.x0, w = g.row.offsetWidth;
    g.ri.style.transition = 'transform .2s ease';
    if (!cancel && Math.abs(dx) > w * .33) { g.ri.style.transform = `translateX(${Math.sign(dx) * w}px)`; setTimeout(() => { delItem(g.id); flushRender(); }, 170); return; }
    g.ri.style.transform = '';
    setTimeout(() => { g.row.classList.remove('swiping', 'arm', 'l', 'r'); g.ri.style.transition = ''; flushRender(); }, 210);
    return;
  }
  if (g.mode === 'drag') {
    suppressClick = Date.now(); cancelAnimationFrame(g.raf);
    g.ghost.remove(); g.row.classList.remove('lifted'); g.over?.classList.remove('over');
    $('#dropbar').classList.remove('on'); document.body.classList.remove('dragging');
    const it = S.items.find(i => i.id === g.id);
    if (!cancel && g.over && it) {
      const d = g.over.dataset.drop;
      if (d === '__del') delItem(it.id);
      else if (d !== itemStore(it)) { setItemStore(it, d); vib(14); haptic(); play('drop'); toast(t('movedTo', { name: d ? storeName(storeMap.get(d)) : t('noStore') })); }
    }
  }
  flushRender();
}
function flushRender() { if (pendingRender && !G?.mode) { pendingRender = false; render(); } }

document.addEventListener('pointerdown', e => {
  if (dlg.open || e.button > 0 || G) return;
  const row = e.target.closest('#app .it[data-id]');
  if (!row || e.target.closest('.more')) return;
  G = { row, ri: row.querySelector('.ri'), id: row.dataset.id, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, mode: null };
  G.lp = setTimeout(() => { if (G && !G.mode && !row.classList.contains('done')) startDrag(); }, 420);
});
addEventListener('pointermove', e => {
  if (!G) return;
  G.x = e.clientX; G.y = e.clientY;
  const dx = G.x - G.x0, dy = G.y - G.y0;
  if (!G.mode) {
    if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { clearTimeout(G.lp); G = null; return; }
    if (Math.abs(dx) < 12) return;
    clearTimeout(G.lp); G.mode = 'swipe'; G.row.classList.add('swiping');
  }
  if (G.mode === 'swipe') {
    G.ri.style.transform = `translateX(${dx}px)`;
    G.row.classList.toggle('l', dx < 0); G.row.classList.toggle('r', dx > 0);
    const arm = Math.abs(dx) > G.row.offsetWidth * .33;
    if (arm !== G.row.classList.contains('arm')) { G.row.classList.toggle('arm', arm); if (arm) vib(10); }
  } else if (G.mode === 'drag') moveDrag();
}, { passive: true });
addEventListener('pointerup', () => endG(false));
addEventListener('pointercancel', () => endG(true));
document.addEventListener('touchmove', e => { if (G?.mode && e.cancelable) e.preventDefault(); }, { passive: false });
document.addEventListener('error', e => { if (e.target.matches?.('.rcard img')) e.target.remove(); }, true); // kaputtes Bild → Emoji bleibt sichtbar
document.addEventListener('contextmenu', e => { if (e.target.closest('#app .it, #app .rcard')) e.preventDefault(); });

(function start() {
  applyLang();
  const sharedR = location.hash.startsWith('#r=') ? location.hash.slice(3) : '';
  if (sharedR) history.replaceState(null, '', location.pathname);
  const fromLink = sharedR ? '' : normCode(location.hash.slice(1));
  if (fromLink.length === 10) { if (fromLink !== localStorage.getItem('ut:code')) sessionStorage.setItem('ut:joined', '1'); localStorage.setItem('ut:code', fromLink); history.replaceState(null, '', location.pathname); }
  code = localStorage.getItem('ut:code') || localStorage.getItem('unsertisch:code');
  if (!code) code = newCode();
  localStorage.setItem('ut:code', code);
  store = createStore(code, WORKER, data => { Object.assign(S, data); derive(); seed(); migrate(); retryEnrich(); schedule(); }, net => { S.net = net; schedule(); });
  render();
  if (sharedR) setTimeout(() => openShared(sharedR), 300);
  const qs = new URLSearchParams(location.search), inUrl = (qs.get('url') || qs.get('text') || qs.get('title') || '').match(/https?:\/\/\S+/)?.[0];
  if (qs.has('url') || qs.has('text')) history.replaceState(null, '', location.pathname);
  if (inUrl) setTimeout(() => { S.tab = 'recipes'; render(); importSheet('link', inUrl); }, 300);
  if (sessionStorage.getItem('ut:joined')) { sessionStorage.removeItem('ut:joined'); setTimeout(() => toast(t('joined', { code: fmtCode(code) })), 400); }
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
