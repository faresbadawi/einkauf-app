import { createStore, cloudEnabled } from './store.js';

const $ = s => document.querySelector(s);
const uid = () => crypto.randomUUID();
const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newCode = () => Array.from(crypto.getRandomValues(new Uint8Array(10)), b => ALPHA[b % 32]).join('');
const fmtCode = c => c.replace(/(.{5})(.{5})/, '$1-$2');
const normCode = c => c.toUpperCase().replace(/[^A-Z0-9]/g, '');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const CATS = [
  ['🥬 Obst & Gemüse', /tomate|gurke|salat|apfel|äpfel|banane|zwiebel|knoblauch|kartoffel|paprika|möhre|karotte|zitrone|orange|beere|pilz|spinat|zucchini|kürbis|brokkoli|obst|gemüse|avocado|ingwer|kräuter|petersilie|basilikum/i],
  ['🥛 Milch & Eier', /milch|käse|joghurt|butter|sahne|quark|ei\b|eier|skyr|mozzarella|parmesan|feta/i],
  ['🥩 Fleisch & Fisch', /fleisch|hack|hähnchen|huhn|wurst|schinken|speck|lachs|fisch|thunfisch|garnele/i],
  ['🍞 Brot & Backen', /brot|brötchen|mehl|hefe|zucker|backpulver|toast|kuchen/i],
  ['🍝 Vorrat', /nudel|pasta|reis|dose|öl\b|essig|soße|sauce|gewürz|salz|pfeffer|linsen|bohnen|müsli|haferflocken|nüsse|honig|tee|kaffee|schoko/i],
  ['🧴 Haushalt', /spül|seife|shampoo|klopapier|toilettenpapier|müllbeutel|waschmittel|zahn|tuch|schwamm/i],
  ['🥤 Getränke', /wasser|saft|bier|wein|cola|limo|getränk/i]
];
const OTHER = '🛒 Sonstiges';
const catOf = n => (CATS.find(([, re]) => re.test(n)) || [OTHER])[0];

const state = { items: [], recipes: [], tab: 'list', q: '' };
let store, code;

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.remove('hidden');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.add('hidden'), 2200);
}

/* ---------- Einkaufsliste ---------- */
function renderList() {
  const body = $('#listBody');
  const open = state.items.filter(i => !i.done), done = state.items.filter(i => i.done);
  $('#badge').textContent = open.length; $('#badge').classList.toggle('hidden', !open.length);
  $('#btnClear').classList.toggle('hidden', !done.length);
  if (!state.items.length) { body.innerHTML = '<div class="empty"><b>🛒</b>Die Liste ist leer.<br>Schreib oben, was fehlt.</div>'; return; }
  const groups = new Map();
  for (const i of open) { const c = i.cat || catOf(i.name); (groups.get(c) || groups.set(c, []).get(c)).push(i); }
  const order = [...CATS.map(c => c[0]), OTHER];
  let html = [...groups].sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]))
    .map(([c, arr]) => `<div class="cat">${esc(c)}</div><div class="card">${arr.sort((a, b) => a.name.localeCompare(b.name, 'de')).map(itemHtml).join('')}</div>`).join('');
  if (done.length) html += `<div class="cat">Erledigt</div><div class="card">${done.map(itemHtml).join('')}</div>`;
  body.innerHTML = html;
}
const itemHtml = i => `<div class="item ${i.done ? 'done' : ''}" data-id="${i.id}">
  <span class="check"><svg viewBox="0 0 24 24"><path d="m9.5 17-5-5 1.4-1.4 3.6 3.6 8.6-8.6L19.5 7l-10 10Z"/></svg></span>
  <span class="name">${esc(i.name)}</span>
  <button class="del" data-del="${i.id}" aria-label="Löschen"><svg viewBox="0 0 24 24"><path d="m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5Z"/></svg></button></div>`;

function addItem(name, cat) {
  name = name.trim(); if (!name) return;
  const dup = state.items.find(i => !i.done && i.name.toLowerCase() === name.toLowerCase());
  if (dup) return toast(`„${name}" steht schon auf der Liste`);
  store.put('items', { id: uid(), name, done: false, cat: cat || null, t: Date.now() });
}

$('#addForm').addEventListener('submit', e => { e.preventDefault(); addItem($('#addInput').value); $('#addInput').value = ''; });
$('#listBody').addEventListener('click', e => {
  const del = e.target.closest('[data-del]');
  if (del) return store.remove('items', del.dataset.del);
  const row = e.target.closest('.item'); if (!row) return;
  const it = state.items.find(i => i.id === row.dataset.id);
  store.put('items', { ...it, done: !it.done });
});
$('#btnClear').addEventListener('click', () => state.items.filter(i => i.done).forEach(i => store.remove('items', i.id)));

/* ---------- Rezepte ---------- */
function renderRecipes() {
  const q = state.q.toLowerCase();
  const list = state.recipes.filter(r => !q || (r.title + ' ' + (r.ingredients || []).join(' ')).toLowerCase().includes(q))
    .sort((a, b) => a.title.localeCompare(b.title, 'de'));
  $('#recipeGrid').innerHTML = list.length ? list.map(r => `<button class="rcard" data-id="${r.id}">
    <div class="pic" ${r.image ? `style="background-image:url('${esc(r.image)}')"` : ''}>${r.image ? '' : '🍽️'}</div>
    <div class="t">${esc(r.title)}<small>${(r.ingredients || []).length} Zutaten</small></div></button>`).join('')
    : `<div class="empty" style="grid-column:1/-1"><b>📖</b>${q ? 'Nichts gefunden.' : 'Noch keine Rezepte.<br>Tippe auf „Rezept".'}</div>`;
}
$('#searchInput').addEventListener('input', e => { state.q = e.target.value; renderRecipes(); });
$('#recipeGrid').addEventListener('click', e => { const c = e.target.closest('.rcard'); if (c) openRecipe(c.dataset.id); });
$('#btnNewRecipe').addEventListener('click', () => editRecipe());

function openRecipe(id) {
  const r = state.recipes.find(x => x.id === id); if (!r) return;
  $('#recipeView').innerHTML = `
    ${r.image ? `<div class="hero" style="background-image:url('${esc(r.image)}')"></div>` : ''}
    <h2>${esc(r.title)}</h2>
    ${r.url ? `<a class="muted" href="${esc(r.url)}" target="_blank" rel="noopener">Originalrezept öffnen ↗</a>` : ''}
    <div class="cat" style="margin:6px 0 0">Zutaten</div>
    <div>${(r.ingredients || []).map(i => `<div class="ing">${esc(i)}</div>`).join('') || '<span class="muted">Keine Zutaten</span>'}</div>
    ${r.steps ? `<div class="cat" style="margin:6px 0 0">Zubereitung</div><div class="steps">${esc(r.steps)}</div>` : ''}
    <button class="primary" id="rToList">Zutaten auf die Einkaufsliste</button>
    <div class="row"><button class="secondary" id="rEdit">Bearbeiten</button><button class="secondary danger" id="rDel">Löschen</button></div>
    <button class="ghost" id="rClose">Schließen</button>`;
  $('#rToList').onclick = () => {
    const have = new Set(state.items.filter(i => !i.done).map(i => i.name.toLowerCase()));
    const add = (r.ingredients || []).filter(i => !have.has(i.toLowerCase()));
    add.forEach(i => addItem(i));
    $('#dlgRecipe').close(); toast(`${add.length} Zutaten hinzugefügt`);
  };
  $('#rEdit').onclick = () => { $('#dlgRecipe').close(); editRecipe(r); };
  $('#rDel').onclick = () => { if (confirm(`„${r.title}" löschen?`)) { store.remove('recipes', r.id); $('#dlgRecipe').close(); } };
  $('#rClose').onclick = () => $('#dlgRecipe').close();
  $('#dlgRecipe').showModal();
}

function editRecipe(r = {}) {
  const f = $('#editForm');
  f.innerHTML = `<h2>${r.id ? 'Rezept bearbeiten' : 'Neues Rezept'}</h2>
    <div><label>Link importieren (optional)</label>
      <div class="row" style="gap:8px"><input id="eUrl" type="url" placeholder="https://…" value="${esc(r.url)}" style="flex:3"><button type="button" class="secondary" id="eImport" style="flex:1">Laden</button></div></div>
    <div><label>Titel</label><input id="eTitle" required value="${esc(r.title)}"></div>
    <div><label>Zutaten (eine pro Zeile)</label><textarea id="eIng">${esc((r.ingredients || []).join('\n'))}</textarea></div>
    <div><label>Zubereitung</label><textarea id="eSteps">${esc(r.steps)}</textarea></div>
    <div><label>Bild-Link (optional)</label><input id="eImg" type="url" value="${esc(r.image)}"></div>
    <div class="row"><button type="button" class="secondary" id="eCancel">Abbrechen</button><button class="primary">Speichern</button></div>`;
  $('#eCancel').onclick = () => $('#dlgEdit').close();
  $('#eImport').onclick = async () => {
    const url = $('#eUrl').value.trim(); if (!url) return;
    $('#eImport').textContent = '…';
    try {
      const d = await importRecipe(url);
      $('#eTitle').value = d.title || $('#eTitle').value;
      $('#eIng').value = d.ingredients.join('\n') || $('#eIng').value;
      $('#eSteps').value = d.steps || $('#eSteps').value;
      $('#eImg').value = d.image || $('#eImg').value;
      toast('Rezept geladen – bitte kurz prüfen');
    } catch { toast('Konnte das Rezept nicht lesen – bitte von Hand eintragen'); }
    $('#eImport').textContent = 'Laden';
  };
  f.onsubmit = () => {
    store.put('recipes', {
      id: r.id || uid(), title: $('#eTitle').value.trim(), url: $('#eUrl').value.trim(), image: $('#eImg').value.trim(),
      ingredients: $('#eIng').value.split('\n').map(s => s.trim()).filter(Boolean), steps: $('#eSteps').value.trim(), t: Date.now()
    });
  };
  $('#dlgEdit').showModal();
}

async function importRecipe(url) {
  const res = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent(url));
  const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
  const find = n => {
    if (Array.isArray(n)) return n.map(find).find(Boolean);
    if (n && typeof n === 'object') {
      const t = [].concat(n['@type'] || []);
      if (t.includes('Recipe')) return n;
      return find(n['@graph'] || Object.values(n));
    }
  };
  let rec;
  for (const s of doc.querySelectorAll('script[type="application/ld+json"]')) {
    try { rec = find(JSON.parse(s.textContent)); } catch {}
    if (rec) break;
  }
  if (!rec) throw new Error('kein Rezept');
  const txt = h => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.trim(); };
  const steps = [].concat(rec.recipeInstructions || []).flatMap(s => s.itemListElement ? s.itemListElement : [s])
    .map(s => txt(typeof s === 'string' ? s : s.text || '')).filter(Boolean).map((s, i) => `${i + 1}. ${s}`).join('\n');
  const img = [].concat(rec.image || [])[0];
  return { title: txt(rec.name || ''), ingredients: [].concat(rec.recipeIngredient || []).map(txt), steps, image: typeof img === 'string' ? img : img?.url };
}

/* ---------- Haushalt / Einstellungen ---------- */
function openSettings() {
  $('#settingsView').innerHTML = `<h2>Euer Haushalt</h2>
    <p class="muted">${cloudEnabled ? 'Wer diesen Code eingibt, sieht dieselbe Liste und dieselben Rezepte.' : 'Cloud-Sync ist noch nicht eingerichtet – die Daten bleiben vorerst nur auf diesem Handy.'}</p>
    <div class="code">${fmtCode(code)}</div>
    <button class="secondary" id="sShare">Code teilen</button>
    <div><label>Anderem Haushalt beitreten</label><input id="sJoin" placeholder="ABCDE-FGHJK" autocapitalize="characters"></div>
    <div class="row"><button class="primary" id="sJoinBtn">Beitreten</button><button class="secondary" id="sNew">Neuer Haushalt</button></div>
    <button class="ghost" id="sClose">Schließen</button>`;
  $('#sClose').onclick = () => $('#dlgSettings').close();
  $('#sShare').onclick = async () => {
    const link = `${location.origin}${location.pathname}#${code}`;
    try { await navigator.share({ title: 'Unser Tisch', text: `Tritt unserem Haushalt bei: ${fmtCode(code)}`, url: link }); }
    catch { await navigator.clipboard?.writeText(link); toast('Link kopiert'); }
  };
  $('#sJoinBtn').onclick = () => { const c = normCode($('#sJoin').value); if (c.length === 10) switchHousehold(c); else toast('Der Code hat 10 Zeichen'); };
  $('#sNew').onclick = () => { if (confirm('Einen neuen, leeren Haushalt starten? Den alten erreichst du nur noch mit seinem Code.')) switchHousehold(newCode()); };
  $('#dlgSettings').showModal();
}
$('#btnSettings').addEventListener('click', openSettings);
function switchHousehold(c) { localStorage.setItem('unsertisch:code', c); location.hash = ''; location.reload(); }

/* ---------- Tabs & Start ---------- */
document.querySelectorAll('.tabs button').forEach(b => b.addEventListener('click', () => {
  state.tab = b.dataset.tab;
  document.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('active', x === b));
  $('#viewList').classList.toggle('hidden', state.tab !== 'list');
  $('#viewRecipes').classList.toggle('hidden', state.tab !== 'recipes');
  $('#title').textContent = state.tab === 'list' ? 'Einkauf' : 'Rezepte';
}));
document.querySelectorAll('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));

(async function start() {
  const fromLink = normCode(location.hash.slice(1));
  if (fromLink.length === 10) { localStorage.setItem('unsertisch:code', fromLink); history.replaceState(null, '', location.pathname); }
  code = localStorage.getItem('unsertisch:code');
  if (!code) { code = newCode(); localStorage.setItem('unsertisch:code', code); }
  store = await createStore(code);
  store.subscribe('items', a => { state.items = a; renderList(); });
  store.subscribe('recipes', a => { state.recipes = a; renderRecipes(); });
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
