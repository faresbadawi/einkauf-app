import { createStore } from './store.js';
import { workerUrl } from './config.js';
import { t, getLang, setLang, applyLang } from './i18n.js';
import { CATS, CAT, CAT_ORDER, PRODUCTS, PRODUCT, norm, search, findProduct } from './catalog.js';
import { demoRecipes } from './demo.js';

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
const COLORS = ['#2f7d5b', '#c2703d', '#3b6fb5', '#b0468a', '#8a6d1f', '#5b5fc7', '#c0392b', '#3a8f8f'];
const EMOJIS = ['🛒', '🧆', '🧴', '💊', '🥬', '🥩', '🥖', '🐟', '🏪', '🏬', '🧺', '🌿', '🧀', '📦', '🕌', '⭐'];
const RCATS = [['all', '🍽️'], ['main', '🥘'], ['salad', '🥗'], ['soup', '🍲'], ['breakfast', '🍳'], ['dessert', '🍰']];
const LEGACY_RCAT = { Hauptgerichte: 'main', Salate: 'salad', Suppen: 'soup', 'Frühstück': 'breakfast', Desserts: 'dessert' };
const rcatOf = r => LEGACY_RCAT[r.category] || (RCATS.some(c => c[0] === r.category) ? r.category : 'main');

function derive() {
  storeMap = new Map(S.stores.map(s => [s.id, s]));
  prefMap = new Map(S.prefs.map(p => [p.id, p.store]));
  const cust = S.custom.filter(c => !PRODUCT[c.id]).map(c => ({ ...c, cat: CAT[c.cat] ? c.cat : 'sonst', custom: true, n: [norm(c.de), norm(c.ar)].filter(Boolean) }));
  customMap = new Map(cust.map(c => [c.id, c]));
  allProducts = [...PRODUCTS, ...cust];
}
const prod = key => PRODUCT[key] || customMap.get(key);
const pName = p => p[getLang()] || p.de || p.ar || '';
const itemName = i => { const p = prod(i.key); return p ? pName(p) : i.name; };
const itemEmoji = i => prod(i.key)?.emoji || '🛒';
const itemCat = i => prod(i.key)?.cat || 'sonst';
const catName = id => CAT[id][getLang()];
const stores = () => [...S.stores].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
const storeName = s => s.name || (s.std ? t('store_' + s.std) : '');
const storeColor = s => COLORS[(s.color || 0) % COLORS.length];
const itemStore = i => storeMap.has(i.store) ? i.store : '';
const recipe = id => S.recipes.find(r => r.id === id);

function toast(msg) {
  const el = $('#toast'); el.textContent = msg; el.classList.remove('hidden');
  clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.add('hidden'), 2400);
}

/* ---------- Mengen ---------- */
const UNITS = 'kg|g|ml|cl|l|EL|TL|Stk\\.?|Stück|Bund|Dosen?|Pck\\.?|Packung(?:en)?|Zehen?|Prisen?|Tassen?|Gläser|Glas|Scheiben?|Becher|Flaschen?|Beutel|ملعقة كبيرة|ملعقة صغيرة|ملاعق كبيرة|ملاعق صغيرة|أكواب|كوب|كيلو|كغ|غرام|غ|مل|لتر|ل|حبات|حبة|قطعة|قطع|رشة|فصوص|فص|حزمة|علبة|عود|قرن';
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
const fmtNum = n => String(Math.round(n * 100) / 100).replace('.', getLang() === 'ar' ? '.' : ',');
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
function defaultStore(key, cat) {
  if (prefMap.has(key)) { const s = prefMap.get(key); return storeMap.has(s) ? s : ''; }
  const d = { orient: 's-arab', drogerie: 's-dm', haushalt: 's-dm', baby: 's-dm' }[cat] || 's-super';
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
  const batch = [...aiQ]; aiQ.clear();
  try {
    const r = await fetch(WORKER + 'items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ names: batch.map(b => b[1]) }), signal: AbortSignal.timeout(60000) });
    const d = await r.json();
    for (const [key, name] of batch) {
      const hit = (d.items || []).find(x => norm(x.name) === norm(name)), cur = customMap.get(key);
      if (!hit || !cur || cur.ai) continue;
      const cat = CAT[hit.cat] ? hit.cat : 'sonst';
      store.put('custom', { id: key, de: cur.de || hit.de || '', ar: cur.ar || hit.ar || '', cat, emoji: hit.emoji || '🛒', ai: 1 });
      const it = S.items.find(i => i.key === key), ds = defaultStore(key, cat);
      if (it && it.auto && it.store !== ds) store.put('items', { ...it, store: ds });
    }
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
  const f = d => d.toLocaleDateString(getLang() === 'ar' ? 'ar-u-nu-latn' : 'de-DE', { day: 'numeric', month: 'short' });
  return `${f(a)} – ${f(b)}`;
};
const planOf = off => S.plan.find(p => p.id === weekId(off)) || { id: weekId(off), slots: [null, null, null] };
const savePlan = (off, slots) => store.put('plan', { id: weekId(off), slots });
function suggest(off) {
  const ids = S.recipes.filter(r => !['dessert', 'breakfast'].includes(rcatOf(r))).map(r => r.id);
  if (!ids.length) return toast(t('needRecipes'));
  for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
  savePlan(off, [0, 1, 2].map(i => ids[i] || null));
  toast(t('suggested'));
}
function aggregate(p) {
  const map = new Map();
  for (const id of p.slots) {
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
  const st = s === 'online' ? `<i class="dot on"></i>${t('live')}${S.net.peers > 1 ? ' · ' + t('devices', { n: S.net.peers }) : ''}`
    : s === 'offline' ? `<i class="dot off"></i>${t('offline')}` : s === 'connecting' ? `<i class="dot"></i>${t('connecting')}` : '';
  return [st, n].filter(Boolean).join('<span class="sep">·</span>');
}
function itemRow(i) {
  const sub = [i.qty, i.note].filter(Boolean).map(esc).join(' · ');
  return `<div class="it ${i.done ? 'done' : ''}" data-id="${i.id}"><span class="chk">${ico('check')}</span><span class="em">${itemEmoji(i)}</span>
    <span class="nm"><b dir="auto">${esc(itemName(i))}</b>${sub ? `<small dir="auto">${sub}</small>` : ''}</span>
    <button class="more" data-item="${i.id}" aria-label="${t('edit')}">${ico('dots')}</button></div>`;
}
const byCatName = (a, b) => CAT_ORDER[itemCat(a)] - CAT_ORDER[itemCat(b)] || itemName(a).localeCompare(itemName(b), getLang());
const group = (title, arr, style = '') => arr.length ? `<section class="grp"><h3 ${style}>${title}<small>${arr.length}</small></h3><div class="card">${arr.sort(byCatName).map(itemRow).join('')}</div></section>` : '';

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
    ${sts.map(s => `<button class="chip ${S.storeF === s.id ? 'on' : ''}" data-sf="${s.id}" style="--c:${storeColor(s)}"><span>${s.emoji}</span>${esc(storeName(s))}${count(s.id) ? `<i>${count(s.id)}</i>` : ''}</button>`).join('')}
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
    body = sts.map(s => group(`<span class="ge">${s.emoji}</span>${esc(storeName(s))}`, open.filter(i => itemStore(i) === s.id), `style="--c:${storeColor(s)}" class="st"`)).join('')
      + group(`<span class="ge">📍</span>${sts.length ? t('noStore') : t('list')}`, open.filter(i => !itemStore(i)))
      + (!open.length ? `<div class="empty small"><div class="art">✅</div><b>${t('allDone')}</b></div>` : '');
  }
  const doneHtml = done.length ? `<details class="doneBox" id="doneBox" ${S.doneOpen ? 'open' : ''}><summary>${t('done')}<small>${done.length}</small></summary>
    <div class="card">${done.map(itemRow).join('')}</div><button class="btn ghost" id="clearDone">${ico('trash')}${t('clearDone')}</button></details>` : '';

  return `<header class="top"><div><h1>${t('list')}</h1><p class="sub">${netLine(open.length)}</p></div></header>
  <form class="add" id="addForm" autocomplete="off"><label class="inp">${ico('plus')}<input id="addInput" dir="auto" placeholder="${t('addPh')}" enterkeyhint="done"></label>
    <button type="button" class="catBtn" id="openCatalog">${ico('grid')}<span>${t('catalog')}</span></button></form>
  <div class="sugg" id="sugg"></div>${chips}${body}${doneHtml}`;
}

/* ---------- Ansicht: Rezepte ---------- */
const picCls = r => `pic p${[...r.title].reduce((a, c) => a + c.codePointAt(0), 0) % 6}`;
const picStyle = r => r.image ? `style="background-image:url('${esc(r.image)}')"` : '';
const picIn = r => r.image ? '' : esc(r.emoji || '🍽️');
const rMeta = r => [r.time ? `${r.time} ${t('min')}` : '', r.servings ? `${r.servings} ${t('persons')}` : ''].filter(Boolean).join(' · ');

function vRecipes() {
  const q = norm(S.q);
  const list = S.recipes.filter(r => (!S.fav || r.fav) && (S.rcat === 'all' || rcatOf(r) === S.rcat) && (!q || norm(r.title + ' ' + (r.ingredients || []).join(' ')).includes(q)))
    .sort((a, b) => a.title.localeCompare(b.title, getLang()));
  const hasDemo = S.recipes.some(r => r.demo);
  return `<header class="top"><div><h1>${t('recipes')}</h1><p class="sub">${S.recipes.length || ''}</p></div><button class="round acc" id="newRecipe" aria-label="${t('newRecipe')}">${ico('plus')}</button></header>
  ${S.recipes.length ? `<label class="inp search">${ico('search')}<input id="rSearch" type="search" dir="auto" value="${esc(S.q)}" placeholder="${t('searchRecipes')}"></label>
  <div class="chips"><button class="chip ${S.fav ? 'on' : ''}" id="favF" style="--c:#c0392b">${ico('heart')}${t('favs')}</button>
    ${RCATS.map(([c, e]) => `<button class="chip ${S.rcat === c ? 'on' : ''}" data-rcat="${c}"><span>${e}</span>${t('rc_' + c)}</button>`).join('')}</div>` : ''}
  <div class="rgrid">${list.map(r => `<article class="rcard" data-open="${r.id}"><div class="${picCls(r)}" ${picStyle(r)}>${picIn(r)}</div>
    <button class="fav ${r.fav ? 'on' : ''}" data-fav="${r.id}" aria-label="${t('favs')}">${ico('heart')}</button>
    <div class="meta"><b dir="auto">${esc(r.title)}</b><small>${rMeta(r)}</small></div></article>`).join('')}</div>
  ${!list.length ? (S.recipes.length ? `<div class="empty small"><div class="art">🔎</div><b>${t('nothing')}</b></div>`
    : `<div class="empty"><div class="art">📖</div><b>${t('noRecipes')}</b><p>${t('noRecipesSub')}</p><button class="btn" id="newRecipe2">${ico('plus')}${t('newRecipe')}</button>
       ${hasDemo ? '' : `<button class="btn ghost" id="demoBtn">${ico('spark')}${t('loadDemo')}</button>`}</div>`) : ''}`;
}

/* ---------- Ansicht: Wochenplan ---------- */
function vPlan() {
  const off = S.week, p = planOf(off), agg = aggregate(p);
  return `<header class="top"><div><h1>${t('plan')}</h1><p class="sub">${weekLabel(off)}${off === 0 ? ' · ' + t('thisWeek') : ''}</p></div>
    <div class="nav2"><button class="round" id="wPrev" aria-label="‹">${ico('back')}</button><button class="round" id="wNext" aria-label="›">${ico('fwd')}</button></div></header>
  ${p.slots.map((id, i) => { const r = recipe(id);
    return r ? `<div class="slot" data-pick="${i}"><div class="${picCls(r)}" ${picStyle(r)}>${picIn(r)}</div><div class="tx"><span class="tag">${t('slot' + i)}</span><b dir="auto">${esc(r.title)}</b><small>${rMeta(r)}</small></div>${ico('edit')}</div>`
      : `<button class="slot none" data-pick="${i}"><div class="pic">${ico('plus')}</div><div class="tx"><span class="tag">${t('slot' + i)}</span><b>${t('pickDish')}</b></div></button>`; }).join('')}
  <button class="btn ghost" id="suggest">${ico('shuffle')}${t('suggest')}</button>
  <section class="grp"><h3>${t('weekShop')}<small>${agg.length || ''}</small></h3>
  ${agg.length ? `<div class="card pad">${agg.map(a => `<div class="ing"><span dir="auto">${esc(a.name)}</span><span>${esc(fmtQty(a.num, a.unit))}</span></div>`).join('')}</div>
    <button class="btn" id="planToList">${ico('bag')}${t('toList')}</button>` : `<p class="hint">${t('planEmpty')}</p>`}</section>`;
}

/* ---------- Ansicht: Einstellungen ---------- */
function vMore() {
  const hasDemo = S.recipes.some(r => r.demo), L = getLang();
  const ai = !WORKER ? t('aiOff') : S.ai == null ? t('aiCheck') : S.ai === true ? t('aiOk') : S.ai === false ? t('aiOff') : t('aiErr');
  return `<header class="top"><div><h1>${t('more')}</h1></div></header>
  <section class="grp"><h3>${t('language')}</h3><div class="seg"><button data-lang="de" class="${L === 'de' ? 'on' : ''}">Deutsch</button><button data-lang="ar" class="${L === 'ar' ? 'on' : ''}">العربية</button></div></section>
  <section class="grp"><h3>${t('household')}</h3><div class="card pad stack">
    <p class="hint">${WORKER ? t('householdSub') : t('householdLocal')}</p>
    <div class="code" dir="ltr">${fmtCode(code)}</div>
    <p class="sub center">${netLine(0, false) || t('localOnly')}</p>
    <button class="btn" id="mShare">${ico('share')}${t('share')}</button>
    <div class="row"><input class="field" id="mJoin" dir="ltr" placeholder="${t('joinPh')}" autocapitalize="characters" autocomplete="off"><button class="btn ghost fit" id="mJoinBtn">${t('join')}</button></div>
    <button class="linkBtn" id="mNew">${t('newHousehold')}</button></div></section>
  <section class="grp"><div class="card menu">
    <button id="manageStores">${ico('store')}<span>${t('manageStores')}<small>${t('nStores', { n: S.stores.length })}</small></span>${ico('fwd')}</button>
    <button id="demoBtn">${ico('spark')}<span>${hasDemo ? t('removeDemo') : t('loadDemo')}<small>${t('demoSub')}</small></span></button>
    <div class="mrow">${ico('globe')}<span>${t('ai')}<small>${ai}</small></span><i class="dot ${S.ai === true ? 'on' : S.ai == null ? '' : 'off'}"></i></div>
  </div></section>`;
}

/* ---------- Render ---------- */
const TABS = [['list', 'tabList', 'bag'], ['recipes', 'tabRecipes', 'book'], ['plan', 'tabPlan', 'cal'], ['more', 'tabMore', 'sliders']];
let sheetRefresh = null, raf = 0;
const schedule = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; render(); }); };
function render() {
  const act = document.activeElement, keep = act?.id && ['addInput', 'rSearch', 'mJoin'].includes(act.id) ? act.id : null;
  const sel = keep ? [act.selectionStart, act.selectionEnd] : null;
  const vals = { addInput: $('#addInput')?.value, mJoin: $('#mJoin')?.value };
  $('#app').innerHTML = { list: vList, recipes: vRecipes, plan: vPlan, more: vMore }[S.tab]();
  const open = S.items.filter(i => !i.done).length;
  $('#tabs').innerHTML = TABS.map(([k, l, i]) => `<button data-tab="${k}" class="${S.tab === k ? 'on' : ''}">${ico(i)}<span>${t(l)}</span>${k === 'list' && open ? `<i>${open}</i>` : ''}</button>`).join('');
  for (const [k, v] of Object.entries(vals)) if (v && $('#' + k)) $('#' + k).value = v;
  if ($('#addInput')?.value) $('#sugg').innerHTML = suggHtml($('#addInput').value);
  if (keep && $('#' + keep)) { const el = $('#' + keep); el.focus(); try { el.setSelectionRange(...sel); } catch {} }
  sheetRefresh?.();
}

/* ---------- Sheets (Dialog) ---------- */
const dlg = $('#dlg'), sheet = $('#sheet');
function show(html, cls = '') {
  sheet.onclick = sheet.oninput = sheet.onchange = null; sheetRefresh = null;
  dlg.className = cls; sheet.innerHTML = html; sheet.scrollTop = 0;
  if (!dlg.open) { dlg.showModal(); history.pushState({ sheet: 1 }, ''); }
}
const close = () => { if (dlg.open) dlg.close(); };
dlg.addEventListener('close', () => { sheetRefresh = null; if (history.state?.sheet) history.back(); });
dlg.addEventListener('click', e => { if (e.target === dlg) close(); });
addEventListener('popstate', () => { if (dlg.open) dlg.close(); });
const head = (title, sub = '') => `<div class="sh"><div><h2 dir="auto">${title}</h2>${sub ? `<small>${sub}</small>` : ''}</div><button class="round" data-x="close" aria-label="×">${ico('close')}</button></div>`;

/* Katalog */
function openCatalog() {
  const st = { cat: 'all', q: '' };
  show(`<div class="cHead"><button class="round" data-x="close" aria-label="‹">${ico('back')}</button><label class="inp search">${ico('search')}<input id="cSearch" type="search" dir="auto" placeholder="${t('searchProducts')}" autocomplete="off"></label></div>
    <div class="chips" id="cChips"></div><div class="tiles" id="cTiles"></div>
    <div class="cFoot"><button class="btn" data-x="close" id="cDone"></button></div>`, 'full');
  const onKeys = () => new Set(S.items.filter(i => !i.done).map(i => i.key));
  const tile = (p, on) => `<button class="tile ${on.has(p.id) ? 'on' : ''}" data-key="${esc(p.id)}"><span class="em">${p.emoji}</span><span class="nm" dir="auto">${esc(pName(p))}</span><i>${ico('check')}</i></button>`;
  const draw = () => {
    const on = onKeys(), hasMine = customMap.size > 0;
    $('#cChips').innerHTML = `<button class="chip ${st.cat === 'all' ? 'on' : ''}" data-cc="all">${t('all')}</button>${hasMine ? `<button class="chip ${st.cat === 'mine' ? 'on' : ''}" data-cc="mine"><span>⭐</span>${t('mine')}</button>` : ''}`
      + CATS.filter(c => c.id !== 'sonst').map(c => `<button class="chip ${st.cat === c.id ? 'on' : ''}" data-cc="${c.id}"><span>${c.emoji}</span>${c[getLang()]}</button>`).join('');
    let html;
    if (st.q.trim()) {
      const hits = search(allProducts, st.q, 90), exact = hits.some(p => p.n.includes(norm(st.q)));
      html = (exact ? '' : `<button class="tile new" data-new="1"><span class="em">＋</span><span class="nm" dir="auto">${esc(t('addCustom', { name: st.q.trim() }))}</span></button>`) + hits.map(p => tile(p, on)).join('');
    } else if (st.cat === 'all') {
      html = CATS.map(c => { const ps = allProducts.filter(p => p.cat === c.id); return ps.length ? `<h4><span>${c.emoji}</span>${c[getLang()]}</h4>` + ps.map(p => tile(p, on)).join('') : ''; }).join('');
    } else {
      html = allProducts.filter(p => st.cat === 'mine' ? p.custom : p.cat === st.cat).map(p => tile(p, on)).join('') || `<p class="hint center">${t('nothing')}</p>`;
    }
    $('#cTiles').innerHTML = html; foot(on);
  };
  const foot = on => { $('#cDone').textContent = on.size ? t('finishN', { n: on.size }) : t('finish'); };
  sheetRefresh = () => { const on = onKeys(); for (const el of sheet.querySelectorAll('.tile[data-key]')) el.classList.toggle('on', on.has(el.dataset.key)); foot(on); };
  sheet.oninput = e => { if (e.target.id === 'cSearch') { st.q = e.target.value; draw(); $('#cTiles').scrollTop = 0; } };
  sheet.onclick = e => {
    if (e.target.closest('[data-x="close"]')) return close();
    const cc = e.target.closest('[data-cc]'); if (cc) { st.cat = cc.dataset.cc; st.q = ''; $('#cSearch').value = ''; draw(); $('#cTiles').scrollTop = 0; return; }
    if (e.target.closest('[data-new]')) { addText(st.q); st.q = ''; $('#cSearch').value = ''; st.cat = 'mine'; draw(); return; }
    const tl = e.target.closest('.tile[data-key]'); if (!tl) return;
    const key = tl.dataset.key, it = S.items.find(i => i.key === key && !i.done);
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
  show(`<div class="hero ${picCls(r)}" ${picStyle(r)}>${picIn(r)}<button class="round glass s" data-x="close" aria-label="‹">${ico('back')}</button><button class="round glass e ${r.fav ? 'on' : ''}" data-x="fav" aria-label="${t('favs')}">${ico('heart')}</button></div>
    <div class="rbody"><h2 dir="auto">${esc(r.title)}</h2>
    <div class="facts">${r.time ? `<span>⏱ ${r.time} ${t('min')}</span>` : ''}<span>${RCATS.find(c => c[0] === rcatOf(r))[1]} ${t('rc_' + rcatOf(r))}</span></div>
    <div class="secHead"><h3>${t('ingredients')}</h3>${base ? `<div class="stepper"><button data-x="s-" aria-label="−">${ico('minus')}</button><span>${serv} ${t('persons')}</span><button data-x="s+" aria-label="+">${ico('plus')}</button></div>` : ''}</div>
    ${lines.length ? `<div class="card">${lines.map((p, i) => `<button class="it ing2 ${st.off.has(i) ? '' : 'sel'}" data-i="${i}"><span class="chk">${ico('check')}</span><span class="nm"><b dir="auto">${esc(p.name)}</b></span><span class="q" dir="auto">${esc(fmtQty(f === 1 ? p.num : niceNum(p.num == null ? null : p.num * f, p.unit), p.unit))}</span></button>`).join('')}</div>
      <button class="btn" data-x="tolist" ${n ? '' : 'disabled'}>${ico('bag')}${t('toListN', { n })}</button>` : `<p class="hint">${t('noIngredients')}</p>`}
    <div class="secHead"><h3>${t('steps')}</h3></div>
    <div class="steps" dir="auto">${esc(r.steps) || `<span class="hint">${t('noSteps')}</span>`}</div>
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
    else if (x === 'tr') translateRecipe(r);
    else if (x === 'del' && confirm(t('delRecipeQ', { name: r.title }))) { store.remove('recipes', r.id); close(); }
  };
}

/* KI-Aufrufe */
async function ai(path, body, query = '') {
  if (!WORKER) throw new Error(t('aiNoWorker'));
  let r;
  try {
    r = await fetch(WORKER + path + query, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(120000) } : { signal: AbortSignal.timeout(120000) });
  } catch { throw new Error(t('aiErr')); }
  const d = await r.json().catch(() => ({ error: 'HTTP ' + r.status }));
  if (!r.ok || d.error) throw new Error(d.error || 'HTTP ' + r.status);
  return d;
}
const busy = msg => show(`<div class="busy"><div class="spin"></div><b>${msg}</b></div>`);

function translateRecipe(r) {
  show(`${head(t('translateTo'))}<div class="row"><button class="btn ghost" data-lg="de">Deutsch</button><button class="btn ghost" data-lg="ar">العربية</button></div>`);
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
  show(`${head(t('newRecipe'))}${WORKER ? opt('link', '🔗', 'fromLink', 'fromLinkSub') + opt('text', '📋', 'fromText', 'fromTextSub') : ''}${opt('manual', '✍️', 'manual', 'manualSub')}`);
  sheet.onclick = e => { const x = e.target.closest('[data-x]')?.dataset.x;
    if (x === 'close') close(); else if (x === 'manual') editRecipe(); else if (x) importSheet(x); };
}
function importSheet(mode, val = '', error = '') {
  let lg = localStorage.getItem('ut:rlang') || getLang();
  const draw = () => show(`${head(t(mode === 'link' ? 'fromLink' : 'fromText'), t(mode === 'link' ? 'fromLinkSub' : 'fromTextSub'))}
    ${mode === 'link' ? `<input class="field" id="imp" type="url" inputmode="url" dir="ltr" placeholder="${t('linkPh')}" value="${esc(val)}" autocomplete="off">`
      : `<textarea class="field tall" id="imp" dir="auto" placeholder="${t('textPh')}">${esc(val)}</textarea>`}
    <label class="lb">${t('recipeLang')}</label>
    <div class="seg">${[['orig', t('original')], ['de', 'Deutsch'], ['ar', 'العربية']].map(([k, l]) => `<button data-lg="${k}" class="${lg === k ? 'on' : ''}">${l}</button>`).join('')}</div>
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
    busy(t('aiWorking'));
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

function pickRecipe(slot) {
  const list = [...S.recipes].sort((a, b) => a.title.localeCompare(b.title, getLang()));
  show(`${head(t('dishFor', { slot: t('slot' + slot) }))}
    ${list.map(r => `<button class="opt" data-r="${r.id}"><span class="${picCls(r)} sm" ${picStyle(r)}>${picIn(r)}</span><span><b dir="auto">${esc(r.title)}</b><small>${rMeta(r)}</small></span></button>`).join('') || `<p class="hint">${t('needRecipes')}</p>`}
    <button class="btn ghost danger" data-r="">${t('clearSlot')}</button>`);
  sheet.onclick = e => {
    if (e.target.closest('[data-x="close"]')) return close();
    const b = e.target.closest('[data-r]'); if (!b) return;
    const slots = [...planOf(S.week).slots]; slots[slot] = b.dataset.r || null; savePlan(S.week, slots); close();
  };
}

/* ---------- Haushalt & Beispieldaten ---------- */
function toggleDemo() {
  const demo = S.recipes.filter(r => r.demo);
  if (demo.length) demo.forEach(r => store.remove('recipes', r.id));
  else demoRecipes(getLang()).forEach(r => store.put('recipes', r));
}
function switchHousehold(c) { localStorage.setItem('ut:code', c); location.hash = ''; location.reload(); }
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
  if (dlg.open) return;
  const sg = el.closest('[data-sugg]');
  if (sg) { const inp = $('#addInput'), parts = inp.value.split(/[,،]/), last = parseLine(parts.pop());
    if (!addEntry(sg.dataset.sugg, pName(prod(sg.dataset.sugg)), fmtQty(last.num, last.unit))) toast(t('onList'));
    inp.value = ''; $('#sugg').innerHTML = ''; inp.focus(); return; }
  const sf = el.closest('[data-sf]'); if (sf) { S.storeF = sf.dataset.sf; return render(); }
  const itemBtn = el.closest('[data-item]'); if (itemBtn) return openItem(itemBtn.dataset.item);
  const row = el.closest('.it[data-id]');
  if (row) { const it = S.items.find(i => i.id === row.dataset.id); if (it) store.put('items', { ...it, done: !it.done }); return; }
  const fav = el.closest('[data-fav]'); if (fav) { const r = recipe(fav.dataset.fav); if (r) store.put('recipes', { ...r, fav: !r.fav }); return; }
  const op = el.closest('[data-open]'); if (op) return openRecipe(op.dataset.open);
  const rc = el.closest('[data-rcat]'); if (rc) { S.rcat = rc.dataset.rcat; return render(); }
  const pk = el.closest('[data-pick]'); if (pk) return S.recipes.length ? pickRecipe(+pk.dataset.pick) : toast(t('needRecipes'));
  const lg = el.closest('[data-lang]'); if (lg) { setLang(lg.dataset.lang); return render(); }
  const id = el.closest('[id]')?.id;
  if (id === 'openCatalog' || id === 'openCatalog2') openCatalog();
  else if (id === 'manageStores') openStores();
  else if (id === 'clearDone') S.items.filter(i => i.done).forEach(i => store.remove('items', i.id));
  else if (id === 'newRecipe' || id === 'newRecipe2') newRecipe();
  else if (id === 'favF') { S.fav = !S.fav; render(); }
  else if (id === 'demoBtn') toggleDemo();
  else if (id === 'suggest') suggest(S.week);
  else if (id === 'wPrev') { S.week--; render(); } else if (id === 'wNext') { S.week++; render(); }
  else if (id === 'planToList') { const n = addIngredients(aggregate(planOf(S.week)).map(a => `${fmtQty(a.num, a.unit)} ${a.name}`.trim())); toast(t('added', { n })); }
  else if (id === 'mShare') {
    const link = `${location.origin}${location.pathname}#${code}`;
    try { await navigator.share({ title: t('app'), text: `${t('shareText')} ${fmtCode(code)}`, url: link }); }
    catch { try { await navigator.clipboard.writeText(link); toast(t('copied')); } catch { toast(fmtCode(code)); } }
  }
  else if (id === 'mJoinBtn') { const c = normCode($('#mJoin').value); c.length === 10 ? switchHousehold(c) : toast(t('codeLen')); }
  else if (id === 'mNew' && confirm(t('newHouseholdQ'))) switchHousehold(newCode());
});
document.addEventListener('submit', e => {
  if (e.target.id !== 'addForm') return;
  e.preventDefault();
  const i = $('#addInput'), v = i.value.trim(); if (!v) return;
  if (!addText(v)) toast(t('onList'));
  i.value = ''; $('#sugg').innerHTML = ''; i.focus();
});
document.addEventListener('input', e => {
  if (e.target.id === 'addInput') $('#sugg').innerHTML = suggHtml(e.target.value);
  if (e.target.id === 'rSearch') { S.q = e.target.value; render(); }
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

(function start() {
  applyLang();
  const fromLink = normCode(location.hash.slice(1));
  if (fromLink.length === 10) { localStorage.setItem('ut:code', fromLink); history.replaceState(null, '', location.pathname); }
  code = localStorage.getItem('ut:code') || localStorage.getItem('unsertisch:code');
  if (!code) code = newCode();
  localStorage.setItem('ut:code', code);
  store = createStore(code, WORKER, data => { Object.assign(S, data); derive(); seed(); schedule(); }, net => { S.net = net; schedule(); });
  render();
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
