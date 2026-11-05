import { createStore, cloudEnabled } from './store.js';
import { demoRecipes, demoItems } from './demo.js';
import { proxyUrl } from './config.js';

const $ = s => document.querySelector(s);
const uid = () => Array.from(crypto.getRandomValues(new Uint8Array(8)), b => b.toString(16).padStart(2, '0')).join('');
const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newCode = () => Array.from(crypto.getRandomValues(new Uint8Array(10)), b => ALPHA[b % 32]).join('');
const fmtCode = c => c.replace(/(.{5})(.{5})/, '$1-$2');
const normCode = c => c.toUpperCase().replace(/[^A-Z0-9]/g, '');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const IC = {
  home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  chef: 'M11 9H9V2H7v7H5V2H3v7c0 2.1 1.6 3.8 3.6 4v9h2.8v-9c2-.2 3.6-1.9 3.6-4V2h-2v7zm5-3v8h2.5v8H21V2c-2.8 0-5 2.2-5 4z',
  cart: 'M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM1 2v2h2l3.6 7.6-1.4 2.4c-.1.3-.2.6-.2 1 0 1.1.9 2 2 2h12v-2H7.4l.9-1.8h7.5c.8 0 1.4-.4 1.7-1l3.6-6.5c.1-.2.1-.3.1-.5 0-.6-.4-1-1-1H5.2L4.3 2H1zm16 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
  cal: 'M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V10h14v10zM7 12h4v4H7z',
  more: 'M6 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
  heart: 'M12 21l-1.5-1.3C5.4 15.4 2 12.3 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 3.8-3.4 6.9-8.5 11.2L12 21z',
  search: 'M15.5 14h-.8l-.3-.3A6.5 6.5 0 1 0 14 15.5l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z',
  back: 'M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20z',
  plus: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z',
  close: 'm6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4z',
  check: 'm9.5 17-5-5 1.4-1.4 3.6 3.6 8.6-8.6L19.5 7z',
  left: 'M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z',
  right: 'M8.6 16.6 10 18l6-6-6-6-1.4 1.4 4.6 4.6z',
  spark: 'm12 2 2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2z',
  shuffle: 'M10.6 9.2 5.4 4 4 5.4l5.2 5.2zM14.5 4l2.1 2.1L4 18.6 5.4 20 18 7.5l2 2V4zm.3 10.8-1.4 1.4 3.2 3.2-2.1 2.1H20v-5.5l-2.1 2.1z',
  share: 'M18 16.1c-.8 0-1.5.3-2 .8l-7.1-4.2c.1-.2.1-.5.1-.7s0-.5-.1-.7L16 7.2c.5.5 1.2.8 2 .8 1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3c0 .2 0 .5.1.7L8 9.8C7.500 9.300 6.800 9 6 9c-1.700 0-3 1.300-3 3s1.300 3 3 3c.8 0 1.500-.3 2-.8l7.100 4.200c-.1.200-.1.400-.1.600 0 1.600 1.300 2.900 2.900 2.900s2.900-1.300 2.900-2.900-1.200-3-2.800-3z',
  clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm.5 5H11v6l5.2 3.200.8-1.300-4.500-2.700z',
  people: 'M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 2c-2.300 0-7 1.200-7 3.500V19h14v-2.500C15 14.200 10.300 13 8 13zm8 0c-.3 0-.6 0-.9.100 1.100.8 1.900 1.900 1.900 3.400V19h6v-2.500c0-2.300-4.700-3.500-7-3.500z',
  trash: 'M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6zM19 4h-3.500l-1-1h-5l-1 1H5v2h14z',
  edit: 'M3 17.250V21h3.750L17.810 9.940l-3.750-3.750zM20.710 7.040a1 1 0 0 0 0-1.410l-2.340-2.340a1 1 0 0 0-1.410 0l-1.830 1.830 3.750 3.750z'
};
const ico = n => `<svg viewBox="0 0 24 24"><path d="${IC[n]}"/></svg>`;

const CATS = [
  ['🥬 Obst & Gemüse', /tomate|gurke|salat|apfel|äpfel|banane|zwiebel|knoblauch|kartoffel|paprika|möhre|karotte|zitrone|orange|beere|pilz|spinat|zucchini|kürbis|brokkoli|obst|gemüse|avocado|ingwer|kräuter|petersilie|basilikum|aubergine|römer/i],
  ['🥛 Milch & Kühlung', /milch|käse|joghurt|butter|sahne|quark|\bei\b|eier|skyr|mozzarella|parmesan|feta|halloumi|ricotta/i],
  ['🥩 Fleisch & Fisch', /fleisch|hack|hähnchen|huhn|wurst|schinken|speck|lachs|fisch|thunfisch|garnele/i],
  ['🍞 Brot & Backen', /brot|brötchen|mehl|hefe|zucker|backpulver|toast|kuchen/i],
  ['🍝 Vorrat', /nudel|pasta|spaghetti|reis|dose|öl\b|essig|soße|sauce|gewürz|salz|pfeffer|linsen|bohnen|müsli|haferflocken|nüsse|mandeln|rosinen|honig|tee|kaffee|schoko|tahin|kichererbsen|lasagne|kreuzkümmel|kurkuma|sumach|tomatenmark/i],
  ['🧴 Haushalt', /spül|seife|shampoo|klopapier|toilettenpapier|müllbeutel|waschmittel|zahn|tuch|schwamm/i],
  ['🥤 Getränke', /wasser|saft|bier|wein|cola|limo|getränk/i]
];
const OTHER = '🛒 Sonstiges';
const catOf = n => (CATS.find(([, re]) => re.test(n)) || [OTHER])[0];
const RCATS = [['Alle', '🍽️'], ['Hauptgerichte', '🥘'], ['Salate', '🥗'], ['Suppen', '🍲'], ['Frühstück', '🍳'], ['Desserts', '🍰']];

/* "500 g Nudeln" -> {num, unit, name} */
const QRE = /^(\d+\/\d+|\d+(?:[.,]\d+)?|[½¼¾])\s*(kg|g|ml|l|EL|TL|Stk\.?|Stück|Bund|Dosen?|Pck\.?|Zehen?|Prise|ملعقة كبيرة|ملعقة صغيرة|كوب|كيلو|حبة كبيرة|حبة|قطعة|فص|عود|قرن)?\s+(.+)$/i;
function parseLine(s) {
  s = s.trim(); const m = s.match(QRE);
  if (!m) return { num: null, unit: '', name: s };
  const fr = m[1].split('/');
  const num = { '½': .5, '¼': .25, '¾': .75 }[m[1]] ?? (fr.length === 2 ? fr[0] / fr[1] : parseFloat(m[1].replace(',', '.')));
  return { num, unit: m[2] || '', name: m[3] };
}
const fmtNum = n => String(Math.round(n * 100) / 100).replace('.', ',');
const fmtQty = (num, unit) => num == null ? '' : `${fmtNum(num)}${unit ? ' ' + unit : ''}`;

const state = { items: [], recipes: [], plan: [], tab: 'home', q: '', cat: 'Alle', favOnly: false, planSeg: 'plan', weekOffset: 0 };
let store, code;
const SLOTS = ['Mo – Di', 'Mi – Do', 'Fr – So'];

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.remove('hidden');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.add('hidden'), 2200);
}
const recipe = id => state.recipes.find(r => r.id === id);
const pic = r => `class="pic p${(r.title.length) % 6}" ${r.image ? `style="background-image:url('${esc(r.image)}')"` : ''}`;
const picIn = r => r.image ? '' : (r.emoji || '🍽️');

/* ---------- Woche ---------- */
function monday(off = 0) {
  const d = new Date(); d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + off * 7); return d;
}
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const weekId = (off = 0) => 'w' + iso(monday(off));
const weekLabel = off => {
  const a = monday(off), b = new Date(a); b.setDate(b.getDate() + 6);
  const f = d => d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
  return `${f(a)} – ${f(b)}`;
};
const planOf = off => state.plan.find(p => p.id === weekId(off)) || { id: weekId(off), slots: [null, null, null] };
const savePlan = (off, slots) => store.put('plan', { id: weekId(off), slots });
function suggest(off) {
  const ids = state.recipes.filter(r => r.category !== 'Desserts' && r.category !== 'Frühstück').map(r => r.id);
  for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
  savePlan(off, [0, 1, 2].map(i => ids[i] || null));
  toast('Neuer Vorschlag ✨');
}

/* ---------- Einkaufsliste ---------- */
function addItem(text, qty) {
  let name = text.trim(); if (!name) return false;
  if (qty == null) { const p = parseLine(name); name = p.name; qty = fmtQty(p.num, p.unit); }
  if (state.items.some(i => !i.done && i.name.toLowerCase() === name.toLowerCase())) return false;
  store.put('items', { id: uid(), name, qty, done: false, cat: null, t: Date.now() });
  return true;
}
function addIngredients(lines) {
  let n = 0; for (const l of lines) { const p = parseLine(l); if (addItem(p.name, fmtQty(p.num, p.unit))) n++; }
  return n;
}
const itemRow = i => `<div class="it ${i.done ? 'done' : ''}" data-id="${i.id}"><span class="box">${ico('check')}</span><span class="nm" dir="auto">${esc(i.name)}</span><span class="qty">${esc(i.qty)}</span><button class="x" data-del="${i.id}" aria-label="Löschen">${ico('close')}</button></div>`;

/* ---------- Views ---------- */
function vHome() {
  const open = state.items.filter(i => !i.done).length, p = planOf(0);
  const n = p.slots.filter(Boolean).length;
  return `<div class="hero"><div class="logo">👨‍🍳</div><h1>Unser Tisch</h1><p>Planen • Kochen • Einkaufen</p></div>
  <label class="search">${ico('search')}<input id="homeSearch" placeholder="Rezepte oder Zutaten suchen …" enterkeyhint="search"></label>
  <div class="tiles">
    <button class="tile t-gold" data-go="plan">${ico('cal')}<b>Wochenplan</b><small>3 Gerichte pro Woche</small></button>
    <button class="tile t-green" data-go="list">${ico('cart')}<b>Einkaufsliste</b><small>${open} Artikel</small></button>
    <button class="tile t-lilac" data-go="recipes">${ico('chef')}<b>Rezepte</b><small>${state.recipes.length} Rezepte</small></button>
    <button class="tile t-rose" data-go="favs">${ico('heart')}<b>Favoriten</b><small>${state.recipes.filter(r => r.fav).length} Rezepte</small></button>
  </div>
  <h2 class="sec">Dein Wochenplan<small>${weekLabel(0)}</small></h2>
  <div class="panel"><div class="mini">${p.slots.map((id, i) => { const r = recipe(id);
    return r ? `<button class="mcard" data-open="${r.id}"><div ${pic(r)} style="height:68px">${picIn(r)}</div><span><b dir="auto">${esc(r.title.split(' ')[0])}</b>${SLOTS[i]}</span></button>`
      : `<button class="mcard empty" data-go="plan">${SLOTS[i]}<br>frei</button>`; }).join('')}</div>
  <button class="btn" style="margin-top:14px" id="newPlan">${ico('spark')} ${n ? 'Neuen Plan erstellen' : 'Plan erstellen'}</button></div>`;
}

function vRecipes() {
  const q = state.q.toLowerCase();
  const list = state.recipes.filter(r => (!state.favOnly || r.fav) && (state.cat === 'Alle' || r.category === state.cat) &&
    (!q || (r.title + ' ' + (r.ingredients || []).join(' ')).toLowerCase().includes(q))).sort((a, b) => a.title.localeCompare(b.title, 'de'));
  return `<div class="head"><h1>${ico('chef')} ${state.favOnly ? 'Favoriten' : 'Rezepte'}</h1>
    ${state.favOnly ? '<button class="circle" id="allRecipes" aria-label="Alle">' + ico('close') + '</button>' : ''}</div>
  <label class="search">${ico('search')}<input id="rSearch" value="${esc(state.q)}" placeholder="Rezepte suchen …" type="search"></label>
  <div class="chips">${RCATS.map(([c, e]) => `<button class="chip ${state.cat === c ? 'on' : ''}" data-cat="${c}"><i>${e}</i>${c}</button>`).join('')}</div>
  <h2 class="sec">${state.favOnly ? 'Deine Lieblingsrezepte' : 'Alle Rezepte'}<small>${list.length}</small></h2>
  <div class="grid">${list.map(r => `<div class="rcard" data-open="${r.id}"><div ${pic(r)} style="${r.image ? '' : ''}">${picIn(r)}</div>
    <button class="heart ${r.fav ? 'on' : ''}" data-fav="${r.id}" aria-label="Favorit">${ico('heart')}</button>
    <div class="meta"><b dir="auto">${esc(r.title)}</b><small><span>⏱ ${r.time || '–'} Min</span><span>👥 ${r.servings || '–'}</span></small></div></div>`).join('')
    || `<div class="empty" style="grid-column:1/-1"><b>📖</b>${state.q ? 'Nichts gefunden.' : 'Noch keine Rezepte.'}</div>`}</div>
  <button class="fab" id="newRecipe" aria-label="Neues Rezept">${ico('plus')}</button>`;
}

function vList() {
  const open = state.items.filter(i => !i.done), done = state.items.filter(i => i.done);
  const groups = new Map();
  for (const i of open) { const c = i.cat || catOf(i.name); (groups.get(c) || groups.set(c, []).get(c)).push(i); }
  const order = [...CATS.map(c => c[0]), OTHER];
  const g = [...groups].sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  return `<div class="head"><h1>${ico('cart')} Einkaufsliste</h1></div>
  <form class="add" id="addForm" autocomplete="off"><input id="addInput" placeholder="Was fehlt? z. B. 2 Tomaten" enterkeyhint="done"><button aria-label="Hinzufügen">${ico('plus')}</button></form>
  ${!state.items.length ? '<div class="empty"><b>🛒</b>Die Liste ist leer.<br>Schreib oben, was fehlt – oder füge Zutaten aus einem Rezept hinzu.</div>' : ''}
  ${g.map(([c, arr]) => `<details class="cat" open><summary>${esc(c)} (${arr.length})</summary>${arr.sort((a, b) => a.name.localeCompare(b.name, 'de')).map(itemRow).join('')}</details>`).join('')}
  ${done.length ? `<details class="cat"><summary>✅ Erledigt (${done.length})</summary>${done.map(itemRow).join('')}</details><button class="btn sec2" id="clearDone">Erledigte entfernen</button>` : ''}`;
}

function aggregate(p) {
  const map = new Map();
  for (const id of p.slots) { const r = recipe(id); if (!r) continue;
    for (const l of r.ingredients || []) { const x = parseLine(l), k = x.name.toLowerCase() + '|' + x.unit.toLowerCase();
      const e = map.get(k); if (e && e.num != null && x.num != null) e.num += x.num; else if (!e) map.set(k, { ...x }); } }
  return [...map.values()];
}

function vPlan() {
  const off = state.weekOffset, p = planOf(off), n = p.slots.filter(Boolean).length;
  const head = `<div class="head"><h1>${ico('cal')} Wochenplan</h1></div>
  <div class="weeknav"><button class="circle" id="wPrev" aria-label="Zurück">${ico('left')}</button><div class="lbl">${weekLabel(off)}${off === 0 ? ' · diese Woche' : ''}</div><button class="circle" id="wNext" aria-label="Weiter">${ico('right')}</button></div>
  <div class="seg"><button data-seg="plan" class="${state.planSeg === 'plan' ? 'on' : ''}">Plan</button><button data-seg="shop" class="${state.planSeg === 'shop' ? 'on' : ''}">Einkaufsliste</button></div>`;
  if (state.planSeg === 'shop') {
    const agg = aggregate(p);
    return head + (agg.length ? `<div class="panel">${agg.map(a => `<div class="ing"><span>${esc(a.name)}</span><span>${esc(fmtQty(a.num, a.unit))}</span></div>`).join('')}</div>
      <button class="btn" style="margin-top:14px" id="planToList">${ico('cart')} Alles auf die Einkaufsliste</button>`
      : '<div class="empty"><b>🧺</b>Wähle erst Gerichte im Plan.</div>');
  }
  return head + `<div class="banner">${ico('spark')}<div><b>Dein Wochenmenü</b><span>${n} ausgewählte Gerichte</span></div></div>
  ${p.slots.map((id, i) => { const r = recipe(id);
    return r ? `<div class="slot" data-pick="${i}"><div ${pic(r)} style="width:86px;height:76px;border-radius:14px;display:grid;place-items:center;font-size:2.2rem;flex:none">${picIn(r)}</div>
      <div><span class="tag">${SLOTS[i]}</span><b dir="auto">${esc(r.title)}</b><small>⏱ ${r.time || '–'} Min · 👥 ${r.servings || '–'}</small></div><span class="sw">${ico('edit')}</span></div>`
      : `<button class="slot empty2" data-pick="${i}"><div><span class="tag">${SLOTS[i]}</span><b>Gericht auswählen</b></div></button>`; }).join('')}
  <button class="btn" id="suggest">${ico('shuffle')} Neu vorschlagen</button>`;
}

function vMore() {
  const hasDemo = state.recipes.some(r => r.demo) || state.items.some(i => i.demo);
  return `<div class="head"><h1>${ico('more')} Mehr</h1></div>
  <h2 class="sec" style="margin-top:6px">Euer Haushalt</h2>
  <div class="panel" style="display:flex;flex-direction:column;gap:12px">
    <p class="muted" style="margin:0">${cloudEnabled ? 'Wer diesen Code eingibt, sieht dieselbe Liste und dieselben Rezepte.' : 'Cloud-Sync ist noch nicht eingerichtet – die Daten bleiben vorerst nur auf diesem Handy.'}</p>
    <div class="code">${fmtCode(code)}</div>
    <button class="btn sec2" id="mShare">${ico('share')} Code teilen</button>
    <input class="field" id="mJoin" placeholder="Code eines anderen Haushalts" autocapitalize="characters">
    <div class="row"><button class="btn" id="mJoinBtn">Beitreten</button><button class="btn sec2" id="mNew">Neuer Haushalt</button></div></div>
  <h2 class="sec">Beispieldaten</h2>
  <div class="list"><button id="mDemo">${ico('spark')}<span>${hasDemo ? 'Beispieldaten entfernen' : 'Beispieldaten laden'}<small>${hasDemo ? 'Löscht nur die Demo-Rezepte und -Artikel' : '10 Rezepte, Einkaufsliste und Wochenplan'}</small></span></button></div>`;
}

/* ---------- Render ---------- */
const TABS = [['home', 'Start', 'home'], ['recipes', 'Rezepte', 'chef'], ['list', 'Einkauf', 'cart'], ['plan', 'Plan', 'cal'], ['more', 'Mehr', 'more']];
let focusId = null;
function render() {
  const keep = document.activeElement?.id;
  const sel = keep ? [document.activeElement.selectionStart, document.activeElement.selectionEnd] : null;
  const vals = { homeSearch: $('#homeSearch')?.value, rSearch: $('#rSearch')?.value, addInput: $('#addInput')?.value };
  $('#app').innerHTML = { home: vHome, recipes: vRecipes, list: vList, plan: vPlan, more: vMore }[state.tab]();
  const open = state.items.filter(i => !i.done).length;
  $('#tabs').innerHTML = TABS.map(([k, l, i]) => `<button data-tab="${k}" class="${state.tab === k ? 'on' : ''}">${ico(i)}${l}${k === 'list' && open ? `<i>${open}</i>` : ''}</button>`).join('');
  for (const [k, v] of Object.entries(vals)) if (v && $('#' + k)) $('#' + k).value = v;
  if (keep && $('#' + keep)) { const el = $('#' + keep); el.focus(); try { el.setSelectionRange(...sel); } catch {} }
}

/* ---------- Detail / Edit / Picker ---------- */
const dlg = $('#dlg'), sheet = $('#sheet');
const show = html => { sheet.innerHTML = html; if (!dlg.open) dlg.showModal(); };
const close = () => dlg.close();

function openRecipe(id, seg = 'z') {
  const r = recipe(id); if (!r) return;
  show(`<div class="dhero p${r.title.length % 6}" ${r.image ? `style="background-image:url('${esc(r.image)}')"` : ''}>${picIn(r)}
      <button class="circle l" data-x="close">${ico('back')}</button><button class="circle r" data-x="fav" style="${r.fav ? 'color:#ff7d7d' : ''}">${ico('heart')}</button></div>
    <h2 dir="auto">${esc(r.title)}</h2>
    <div class="facts"><span>⏱ ${r.time || '–'} Min</span><span>👥 ${r.servings || '–'} Personen</span><span>${esc(r.category || '')}</span></div>
    <div class="seg" style="margin:4px 0"><button data-x="z" class="${seg === 'z' ? 'on' : ''}">Zutaten</button><button data-x="s" class="${seg === 's' ? 'on' : ''}">Zubereitung</button></div>
    ${seg === 'z' ? (r.ingredients || []).map(l => { const p = parseLine(l); return `<div class="ing"><span dir="auto">${esc(p.name)}</span><span>${esc(fmtQty(p.num, p.unit))}</span></div>`; }).join('') || '<p class="muted">Keine Zutaten.</p>'
      : `<div class="steps">${esc(r.steps) || '<span class="muted">Noch keine Zubereitung.</span>'}</div>`}
    ${r.url ? `<a class="link" href="${esc(r.url)}" target="_blank" rel="noopener">Originalrezept öffnen ↗</a>` : ''}
    <button class="btn" data-x="tolist">${ico('cart')} Zur Einkaufsliste hinzufügen</button>
    <div class="row"><button class="btn sec2" data-x="edit">Bearbeiten</button><button class="btn sec2 danger" data-x="del">Löschen</button></div>`);
  sheet.onclick = e => {
    const x = e.target.closest('[data-x]')?.dataset.x; if (!x) return;
    if (x === 'close') close();
    else if (x === 'z' || x === 's') openRecipe(id, x);
    else if (x === 'fav') { store.put('recipes', { ...r, fav: !r.fav }); r.fav = !r.fav; openRecipe(id, seg); }
    else if (x === 'tolist') { const n = addIngredients(r.ingredients || []); close(); toast(`${n} Zutaten hinzugefügt`); }
    else if (x === 'edit') editRecipe(r);
    else if (x === 'del' && confirm(`„${r.title}" löschen?`)) { store.remove('recipes', r.id); close(); }
  };
}

function editRecipe(r = {}) {
  const opt = RCATS.slice(1).map(([c]) => `<option ${((r.category || 'Hauptgerichte') === c) ? 'selected' : ''}>${c}</option>`).join('');
  show(`<h2>${r.id ? 'Rezept bearbeiten' : 'Neues Rezept'}</h2>
    <div><label>Link importieren (optional)</label><div class="row" style="gap:8px"><input class="field" id="eUrl" type="url" placeholder="https://…" value="${esc(r.url)}" style="flex:3"><button class="btn sec2" id="eImport" style="flex:1;padding:10px">Laden</button></div></div>
    <div class="row"><div style="flex:0 0 80px"><label>Emoji</label><input class="field" id="eEmoji" value="${esc(r.emoji || '🍽️')}" style="text-align:center"></div><div><label>Titel</label><input class="field" dir="auto" id="eTitle" value="${esc(r.title)}"></div></div>
    <div class="row"><div><label>Kategorie</label><select class="field" id="eCat">${opt}</select></div><div><label>Minuten</label><input class="field" id="eTime" type="number" inputmode="numeric" value="${r.time || ''}"></div><div><label>Personen</label><input class="field" id="eServ" type="number" inputmode="numeric" value="${r.servings || ''}"></div></div>
    <div><label>Zutaten (eine pro Zeile, z. B. 500 g Nudeln)</label><textarea class="field" dir="auto" id="eIng">${esc((r.ingredients || []).join('\n'))}</textarea></div>
    <div><label>Zubereitung</label><textarea class="field" dir="auto" id="eSteps">${esc(r.steps)}</textarea></div>
    <div><label>Bild-Link (optional)</label><input class="field" id="eImg" type="url" value="${esc(r.image)}"></div>
    <div class="row"><button class="btn sec2" data-x="cancel">Abbrechen</button><button class="btn" data-x="save">Speichern</button></div>`);
  sheet.onclick = async e => {
    const x = e.target.closest('button')?.dataset.x, id = e.target.closest('button')?.id;
    if (x === 'cancel') return r.id ? openRecipe(r.id) : close();
    if (id === 'eImport') {
      const url = $('#eUrl').value.trim(); if (!url) return; e.target.textContent = '…';
      try { const d = await importRecipe(url);
        if (d.title) $('#eTitle').value = d.title; if (d.ingredients.length) $('#eIng').value = d.ingredients.join('\n');
        if (d.steps) $('#eSteps').value = d.steps; if (d.image) $('#eImg').value = d.image;
        if (d.time) $('#eTime').value = d.time; if (d.servings) $('#eServ').value = d.servings; toast('Rezept geladen – bitte kurz prüfen');
      } catch { toast('Konnte das Rezept nicht lesen – bitte von Hand eintragen'); }
      e.target.textContent = 'Laden'; return;
    }
    if (x === 'save') {
      const title = $('#eTitle').value.trim(); if (!title) return toast('Bitte einen Titel eingeben');
      const rec = { ...r, id: r.id || uid(), title, emoji: $('#eEmoji').value.trim() || '🍽️', category: $('#eCat').value, url: $('#eUrl').value.trim(), image: $('#eImg').value.trim(),
        time: +$('#eTime').value || 0, servings: +$('#eServ').value || 0, fav: !!r.fav, t: Date.now(),
        ingredients: $('#eIng').value.split('\n').map(s => s.trim()).filter(Boolean), steps: $('#eSteps').value.trim() };
      await store.put('recipes', rec); close();
    }
  };
}

async function getHtml(url) {
  const enc = encodeURIComponent(url);
  const ways = ['proxy?url=' + enc, proxyUrl && proxyUrl + enc, 'https://api.allorigins.win/raw?url=' + enc, 'https://corsproxy.io/?url=' + enc].filter(Boolean);
  for (const w of ways) {
    try {
      const r = await fetch(w, { signal: AbortSignal.timeout(12000) });
      const t = await r.text();
      if (r.ok && t.includes('ld+json')) return t;
    } catch {}
  }
  throw new Error('nicht erreichbar');
}

async function importRecipe(url) {
  const doc = new DOMParser().parseFromString(await getHtml(url), 'text/html');
  const find = n => {
    if (Array.isArray(n)) return n.map(find).find(Boolean);
    if (n && typeof n === 'object') { if ([].concat(n['@type'] || []).includes('Recipe')) return n; return find(n['@graph'] || Object.values(n)); }
  };
  let rec;
  for (const s of doc.querySelectorAll('script[type="application/ld+json"]')) { try { rec = find(JSON.parse(s.textContent)); } catch {} if (rec) break; }
  if (!rec) throw new Error('kein Rezept');
  const txt = h => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.trim(); };
  const steps = [].concat(rec.recipeInstructions || []).flatMap(s => s.itemListElement ? s.itemListElement : [s])
    .map(s => txt(typeof s === 'string' ? s : s.text || '')).filter(Boolean).map((s, i) => `${i + 1}. ${s}`).join('\n');
  const img = [].concat(rec.image || [])[0];
  const mins = /PT(?:(\d+)H)?(?:(\d+)M)?/.exec(rec.totalTime || '');
  return { title: txt(rec.name || ''), ingredients: [].concat(rec.recipeIngredient || []).map(txt), steps, image: typeof img === 'string' ? img : img?.url,
    time: mins ? (+mins[1] || 0) * 60 + (+mins[2] || 0) : 0, servings: parseInt([].concat(rec.recipeYield || [])[0]) || 0 };
}

function pickRecipe(slot) {
  show(`<h2>Gericht für ${SLOTS[slot]}</h2>
    ${state.recipes.map(r => `<button class="pick" data-r="${r.id}"><div ${pic(r)} style="width:48px;height:48px;border-radius:12px;display:grid;place-items:center;font-size:1.6rem">${picIn(r)}</div><div><b dir="auto">${esc(r.title)}</b><br><span class="muted">${esc(r.category || '')} · ${r.time || '–'} Min</span></div></button>`).join('') || '<p class="muted">Lege zuerst Rezepte an.</p>'}
    <button class="btn sec2 danger" data-r="">Slot leeren</button>`);
  sheet.onclick = e => { const b = e.target.closest('[data-r]'); if (!b) return;
    const slots = [...planOf(state.weekOffset).slots]; slots[slot] = b.dataset.r || null; savePlan(state.weekOffset, slots); close(); };
}

/* ---------- Beispieldaten & Haushalt ---------- */
async function toggleDemo() {
  const has = state.recipes.some(r => r.demo) || state.items.some(i => i.demo);
  if (has) { await Promise.all([...state.recipes.filter(r => r.demo).map(r => store.remove('recipes', r.id)), ...state.items.filter(i => i.demo).map(i => store.remove('items', i.id)),
      ...state.plan.filter(p => p.demo).map(p => store.remove('plan', p.id))]); toast('Beispieldaten entfernt'); }
  else { await loadDemo(); toast('Beispieldaten geladen'); }
}
async function loadDemo() {
  await Promise.all([...demoRecipes.map(r => store.put('recipes', r)), ...demoItems.map(i => store.put('items', i)),
    store.put('plan', { id: weekId(0), demo: true, slots: ['demo-linsen', 'demo-mandi', 'demo-fattoush'] })]);
}
function switchHousehold(c) { localStorage.setItem('unsertisch:code', c); location.hash = ''; location.reload(); }

/* ---------- Events ---------- */
document.addEventListener('click', async e => {
  const t = e.target;
  const tab = t.closest('[data-tab]'); if (tab && tab.closest('#tabs')) { state.tab = tab.dataset.tab; if (state.tab === 'recipes') { state.favOnly = false; } scrollTo(0, 0); return render(); }
  if (dlg.open) return;
  const go = t.closest('[data-go]')?.dataset.go;
  if (go) { if (go === 'favs') { state.tab = 'recipes'; state.favOnly = true; state.cat = 'Alle'; } else { state.tab = go; state.favOnly = false; } scrollTo(0, 0); return render(); }
  const fav = t.closest('[data-fav]'); if (fav) { e.stopPropagation(); const r = recipe(fav.dataset.fav); return store.put('recipes', { ...r, fav: !r.fav }); }
  const op = t.closest('[data-open]')?.dataset.open; if (op) return openRecipe(op);
  const cat = t.closest('[data-cat]')?.dataset.cat; if (cat) { state.cat = cat; return render(); }
  const seg = t.closest('[data-seg]')?.dataset.seg; if (seg) { state.planSeg = seg; return render(); }
  const pk = t.closest('[data-pick]'); if (pk) return pickRecipe(+pk.dataset.pick);
  const del = t.closest('[data-del]'); if (del) return store.remove('items', del.dataset.del);
  const row = t.closest('.it'); if (row) { const it = state.items.find(i => i.id === row.dataset.id); return store.put('items', { ...it, done: !it.done }); }
  const id = t.closest('[id]')?.id;
  if (id === 'newRecipe') editRecipe();
  else if (id === 'allRecipes') { state.favOnly = false; render(); }
  else if (id === 'newPlan' || id === 'suggest') { if (!state.recipes.length) return toast('Lege zuerst Rezepte an'); const off = id === 'newPlan' ? 0 : state.weekOffset; suggest(off); if (id === 'newPlan') { state.tab = 'plan'; state.weekOffset = 0; render(); } }
  else if (id === 'wPrev') { state.weekOffset--; render(); } else if (id === 'wNext') { state.weekOffset++; render(); }
  else if (id === 'planToList') { const n = addIngredients(aggregate(planOf(state.weekOffset)).map(a => `${fmtQty(a.num, a.unit)} ${a.name}`.trim())); toast(`${n} Artikel hinzugefügt`); }
  else if (id === 'clearDone') state.items.filter(i => i.done).forEach(i => store.remove('items', i.id));
  else if (id === 'mDemo') toggleDemo();
  else if (id === 'mShare') { const link = `${location.origin}${location.pathname}#${code}`; try { await navigator.share({ title: 'Unser Tisch', text: `Tritt unserem Haushalt bei: ${fmtCode(code)}`, url: link }); } catch { try { await navigator.clipboard.writeText(link); toast('Link kopiert'); } catch { toast('Bitte den Code abtippen'); } } }
  else if (id === 'mJoinBtn') { const c = normCode($('#mJoin').value); c.length === 10 ? switchHousehold(c) : toast('Der Code hat 10 Zeichen'); }
  else if (id === 'mNew' && confirm('Einen neuen, leeren Haushalt starten? Den alten erreichst du nur noch mit seinem Code.')) switchHousehold(newCode());
});
document.addEventListener('submit', e => { if (e.target.id === 'addForm') { e.preventDefault(); const i = $('#addInput'); if (!addItem(i.value) && i.value.trim()) toast('Steht schon auf der Liste'); i.value = ''; i.focus(); } });
document.addEventListener('input', e => {
  if (e.target.id === 'homeSearch') { state.q = e.target.value; }
  if (e.target.id === 'rSearch') { state.q = e.target.value; render(); }
});
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'homeSearch') { state.tab = 'recipes'; state.favOnly = false; state.cat = 'Alle'; render(); } });
dlg.addEventListener('click', e => { if (e.target === dlg) close(); });

/* ---------- Start ---------- */
(async function start() {
  const fromLink = normCode(location.hash.slice(1));
  if (fromLink.length === 10) { localStorage.setItem('unsertisch:code', fromLink); history.replaceState(null, '', location.pathname); }
  code = localStorage.getItem('unsertisch:code');
  if (!code) { code = newCode(); localStorage.setItem('unsertisch:code', code); }
  store = await createStore(code);
  for (const c of ['items', 'recipes', 'plan']) store.subscribe(c, a => { state[c] = a; render(); });
  render();
  if (!cloudEnabled && !localStorage.getItem('unsertisch:seeded')) { localStorage.setItem('unsertisch:seeded', '1'); loadDemo(); }
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
