// Cloudflare Worker für "Unser Tisch"
//  1) Live-Sync:  wss://…/sync/<HAUSHALTSCODE>  (ein Durable Object pro Haushalt, alle Geräte sehen Änderungen sofort)
//  2) KI (Gemini): Rezept aus Link oder Text lesen/übersetzen, Artikel einordnen und DE/AR benennen
// Geheimnis (nicht im Code!): GEMINI_API_KEY  – per `wrangler secret put GEMINI_API_KEY` oder im Cloudflare-Dashboard.
// Reihenfolge der Modelle: ist eines überlastet, wird nach kurzer Wartezeit das nächste versucht
const FAST = ['gemini-flash-lite-latest', 'gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-flash-latest'];
const SMART = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-2.0-flash'];
const MAX_HTML = 2_500_000, MAX_TEXT = 25_000;
const RCATS = ['main', 'salad', 'soup', 'breakfast', 'dessert'];
const ICATS = ['obst', 'gemuese', 'kraeuter', 'milch', 'fleisch', 'brot', 'vorrat', 'konserven', 'gewuerze', 'backen', 'fruehstueck', 'snacks', 'getraenke', 'tk', 'orient', 'drogerie', 'haushalt', 'baby', 'sonst'];
const COLS = new Set(['items', 'recipes', 'plan', 'stores', 'prefs', 'custom', 'meta']);

const RECIPE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    ingredients: { type: 'ARRAY', items: { type: 'STRING' } },
    steps: { type: 'STRING' },
    time: { type: 'INTEGER' },
    servings: { type: 'INTEGER' },
    category: { type: 'STRING', enum: RCATS },
    emoji: { type: 'STRING' }
  },
  required: ['title', 'ingredients', 'steps']
};
const ITEMS_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: { name: { type: 'STRING' }, de: { type: 'STRING' }, ar: { type: 'STRING' }, cat: { type: 'STRING', enum: ICATS }, emoji: { type: 'STRING' } },
    required: ['name', 'de', 'ar', 'cat', 'emoji']
  }
};

const json = (obj, status, cors) => new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors } });

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const origin = req.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    const okOrigin = !allowed.length || !origin || allowed.includes(origin) || /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+)(:\d+)?$/.test(origin);
    const cors = { 'Access-Control-Allow-Origin': okOrigin ? (origin || '*') : 'null', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-Gemini-Key', 'Vary': 'Origin' };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (!okOrigin) return json({ error: 'Origin nicht erlaubt' }, 403, cors);

    if (url.pathname.startsWith('/sync/')) {
      const code = url.pathname.slice(6).toUpperCase();
      if (!/^[A-Z0-9]{10}$/.test(code)) return json({ error: 'Ungültiger Code' }, 400, cors);
      return env.HOUSEHOLD.get(env.HOUSEHOLD.idFromName(code)).fetch(req);
    }
    // Eigener Schlüssel aus der App (optional) hat Vorrang vor dem hinterlegten
    const userKey = (req.headers.get('X-Gemini-Key') || '').trim();
    const key = /^[\w-]{20,80}$/.test(userKey) ? userKey : env.GEMINI_API_KEY;
    if (url.pathname === '/health') return json({ ok: true, ai: !!env.GEMINI_API_KEY }, 200, cors);

    try {
      if (req.method === 'POST') {
        const body = await req.json().catch(() => ({}));
        if (!key) return json({ error: 'KI nicht eingerichtet (GEMINI_API_KEY fehlt)' }, 501, cors);
        if (url.pathname === '/text') {
          const text = String(body.text || '').trim();
          if (text.length < 10) return json({ error: 'Kein Text' }, 400, cors);
          const out = await recipeAI(key, text, lang(body.lang));
          return json({ ...out, source: 'ai' }, 200, cors);
        }
        if (url.pathname === '/items') {
          const names = [].concat(body.names || []).map(s => String(s).slice(0, 80)).filter(Boolean).slice(0, 30);
          if (!names.length) return json({ items: [] }, 200, cors);
          return json({ items: await itemsAI(key, names) }, 200, cors);
        }
        return json({ error: 'Unbekannter Pfad' }, 404, cors);
      }
      if (url.searchParams.get('url')) return await importUrl(url.searchParams, key, cors);
      return json({ error: 'Ungültiger Link' }, 400, cors);
    } catch (e) {
      return json({ error: 'KI-Fehler: ' + (e.message || e) }, 502, cors);
    }
  }
};

const lang = l => (l === 'de' || l === 'ar') ? l : 'orig';

/* ---------- Rezept aus Link ---------- */
async function importUrl(q, key, cors) {
  let target;
  try { target = new URL(q.get('url')); if (!/^https?:$/.test(target.protocol)) throw 0; } catch { return json({ error: 'Ungültiger Link' }, 400, cors); }
  const lg = lang(q.get('lang') || (q.get('de') === '1' ? 'de' : 'orig'));

  let html;
  try {
    const r = await fetch(target, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36', 'Accept': 'text/html,application/xhtml+xml', 'Accept-Language': 'de,en;q=0.8,ar;q=0.6' },
      redirect: 'follow', signal: AbortSignal.timeout(15000)
    });
    if (!r.ok) return json({ error: `Seite antwortet mit ${r.status}` }, 502, cors);
    html = (await r.text()).slice(0, MAX_HTML);
  } catch { return json({ error: 'Seite nicht erreichbar' }, 502, cors); }

  const structured = fromJsonLd(html);
  const image = structured?.image || meta(html, 'og:image');
  const base = { image: image || '', url: target.href };
  if (!key) {
    if (structured) return json({ ...structured, ...base, source: 'structured', warning: 'GEMINI_API_KEY fehlt' }, 200, cors);
    return json({ error: 'KI nicht eingerichtet (GEMINI_API_KEY fehlt)' }, 501, cors);
  }
  try {
    const out = await recipeAI(key, structured ? JSON.stringify(structured) : pageText(html), lg);
    return json({ ...out, ...base, source: structured ? 'structured+ai' : 'ai' }, 200, cors);
  } catch (e) {
    if (structured) return json({ ...structured, ...base, source: 'structured', warning: 'KI-Fehler: ' + (e.message || e) }, 200, cors);
    return json({ error: 'KI-Fehler: ' + (e.message || e) }, 502, cors);
  }
}

/* ---------- Gemini: gestaffelte Anfragen ----------
   Ein Modell wird gefragt; antwortet es nicht innerhalb von HEDGE ms (oder schlägt fehl), startet parallel das nächste.
   Die erste brauchbare Antwort gewinnt, die anderen werden abgebrochen. So bremst ein überlastetes Modell nicht mehr alles aus. */
const TOTAL = 40000;
function gemini(key, prompt, schema, models, HEDGE = 2500) {
  const t0 = Date.now(), ctrls = [], errs = [];
  let next = 0, running = 0, done = false, timer = 0;
  return new Promise((resolve, reject) => {
    const finish = (fn, v) => { if (done) return; done = true; clearTimeout(timer); ctrls.forEach(c => c.abort()); fn(v); };
    const launch = () => {
      if (done) return;
      if (next >= models.length) { if (!running) finish(reject, new Error(errs.at(-1) || 'keine Antwort')); return; }
      const model = models[next++], ctrl = new AbortController(); ctrls.push(ctrl); running++;
      clearTimeout(timer); timer = setTimeout(launch, HEDGE);
      call(model, ctrl.signal).then(out => finish(resolve, { out, model, ms: Date.now() - t0 }), e => {
        running--; errs.push(`${model}: ${e.message || e}`);
        if (e.fatal) return finish(reject, e);
        launch();
      });
    };
    const call = async (model, signal) => {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, signal: AbortSignal.any([signal, AbortSignal.timeout(TOTAL)]),
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', responseSchema: schema, temperature: 0.1, ...(/2\.5/.test(model) ? { thinkingConfig: { thinkingBudget: 0 } } : {}) } })
      });
      if (!r.ok) {
        const msg = `${r.status}: ${(await r.text()).slice(0, 160)}`;
        throw Object.assign(new Error(msg), { fatal: [400, 401, 403].includes(r.status) && /API key|API_KEY|permission|PERMISSION/.test(msg) });
      }
      const d = await r.json();
      const text = d.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
      if (!text) throw new Error('leere Antwort');
      return JSON.parse(text);
    };
    launch();
  });
}

const LANG_RULE = {
  de: 'Write EVERYTHING in German (translate title, ingredients and steps if needed). Use these unit abbreviations: g, kg, ml, l, EL, TL, Stk., Bund, Dose, Prise, Zehe, Tasse.',
  ar: 'Write EVERYTHING in Modern Standard Arabic (translate title, ingredients and steps if needed). Use these units: غ، كغ، مل، ل، ملعقة كبيرة، ملعقة صغيرة، كوب، حبة، رشة، فص، حزمة، علبة. Use Western digits (0-9).',
  orig: 'Keep the original language of the source. Abbreviate common units (e.g. g, kg, ml, l, EL, TL in German).'
};

async function recipeAI(key, input, lg) {
  const prompt = `You get the text of a web page, a pasted recipe, or already extracted recipe data. Extract exactly ONE cooking recipe and return JSON.
- ingredients: one ingredient per entry in the format "<amount> <unit> <ingredient>", e.g. "500 g Nudeln", "2 EL Olivenöl", "1/2 Zitrone", "3 Eier". Amount as a number (decimals or simple fractions, no ranges). If there is no amount, give just the ingredient name. Keep entries short: drop preparation notes such as "finely chopped".
- steps: numbered steps separated by line breaks ("1. …\\n2. …").
- time: total time in minutes (0 if unknown). servings: number of persons (0 if unknown).
- category: main, salad, soup, breakfast or dessert. emoji: one fitting food emoji.
- ${LANG_RULE[lg]}
- Do not invent anything. Ignore ads, comments and navigation. If there is no recipe, return an empty title.

SOURCE:
${input.slice(0, MAX_TEXT)}`;
  const { out, model, ms } = await gemini(key, prompt, RECIPE_SCHEMA, SMART, 7000);
  out._ai = `${model} ${ms}ms`;
  if (!out.title) throw new Error('Kein Rezept gefunden');
  return out;
}

async function itemsAI(key, names) {
  const prompt = `These are entries of a household shopping list (German or Arabic, may contain typos). For each entry return:
- name: the entry exactly as given
- de: the product name in German (short, as on a shopping list)
- ar: the product name in Modern Standard Arabic (short)
- cat: obst (fruit), gemuese (vegetables), kraeuter (fresh herbs), milch (dairy & eggs), fleisch (meat & fish), brot (bread & bakery), vorrat (pasta, rice, legumes), konserven (cans & sauces), gewuerze (spices & oils), backen (baking), fruehstueck (breakfast, spreads, coffee, tea), snacks (sweets & snacks), getraenke (drinks), tk (frozen), orient (oriental specialities), drogerie (personal care), haushalt (household & cleaning), baby, sonst (other)
- emoji: one fitting emoji
Entries:
${names.map(n => '- ' + n).join('\n')}`;
  const { out } = await gemini(key, prompt, ITEMS_SCHEMA, FAST);
  return Array.isArray(out) ? out : [];
}

/* ---------- HTML lesen ---------- */
function meta(html, prop) {
  const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']+)["']`, 'i'))
    || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${prop}["']`, 'i'));
  return m ? decode(m[1]) : '';
}
const decode = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
const plain = s => decode(String(s ?? '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

function pageText(html) {
  return decode(html.replace(/<(script|style|noscript|svg|nav|footer|header|form)[\s\S]*?<\/\1>/gi, ' ').replace(/<br\s*\/?>|<\/(p|div|li|h\d|tr)>/gi, '\n').replace(/<[^>]+>/g, ' '))
    .replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
}

function fromJsonLd(html) {
  const find = n => {
    if (Array.isArray(n)) { for (const x of n) { const r = find(x); if (r) return r; } return null; }
    if (n && typeof n === 'object') { if ([].concat(n['@type'] || []).includes('Recipe')) return n; return find(n['@graph'] || Object.values(n)); }
    return null;
  };
  let rec = null;
  for (const m of html.matchAll(/<script[^>]*ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) { try { rec = find(JSON.parse(m[1])); } catch {} if (rec) break; }
  if (!rec) return null;
  const steps = [].concat(rec.recipeInstructions || []).flatMap(s => s.itemListElement ? s.itemListElement : [s])
    .map(s => plain(typeof s === 'string' ? s : s.text || '')).filter(Boolean).map((s, i) => `${i + 1}. ${s}`).join('\n');
  const img = [].concat(rec.image || [])[0];
  const mins = /PT(?:(\d+)H)?(?:(\d+)M)?/.exec(rec.totalTime || '');
  return {
    title: plain(rec.name), ingredients: [].concat(rec.recipeIngredient || []).map(plain).filter(Boolean), steps,
    image: typeof img === 'string' ? img : img?.url || '', time: mins ? (+mins[1] || 0) * 60 + (+mins[2] || 0) : 0,
    servings: parseInt([].concat(rec.recipeYield || [])[0]) || 0, category: '', emoji: ''
  };
}

/* ---------- Live-Sync: ein Durable Object pro Haushalt ---------- */
export class Household {
  constructor(ctx) {
    this.ctx = ctx;
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong'));
  }

  async fetch(req) {
    if (req.headers.get('Upgrade') !== 'websocket') return new Response('WebSocket erwartet', { status: 426 });
    if (this.ctx.getWebSockets().length >= 40) return new Response('Zu viele Geräte', { status: 429 });
    const pair = new WebSocketPair();
    this.ctx.acceptWebSocket(pair[1]);
    this.peers();
    return new Response(null, { status: 101, webSocket: pair[0] });
  }

  cast(obj, except) {
    const s = JSON.stringify(obj);
    for (const ws of this.ctx.getWebSockets()) if (ws !== except) { try { ws.send(s); } catch {} }
  }
  peers(leaving) {
    const n = this.ctx.getWebSockets().filter(w => w !== leaving).length;
    this.cast({ t: 'peers', n }, leaving);
  }

  /** Wendet eine Änderung an. Bei "put" gewinnt der neuere Stand (Feld u). */
  async apply(op, ws) {
    if (!op || !COLS.has(op.col)) return;
    if (op.t === 'put') {
      const doc = op.doc;
      if (!doc || typeof doc.id !== 'string' || !doc.id || doc.id.length > 160 || JSON.stringify(doc).length > 300_000) return;
      const key = `${op.col}/${doc.id}`, cur = await this.ctx.storage.get(key);
      if (cur && (cur.u || 0) > (doc.u || 0)) { try { ws.send(JSON.stringify({ t: 'put', col: op.col, doc: cur })); } catch {} return; }
      await this.ctx.storage.put(key, doc);
      this.cast({ t: 'put', col: op.col, doc }, ws);
    } else if (op.t === 'del' && typeof op.id === 'string') {
      await this.ctx.storage.delete(`${op.col}/${op.id}`);
      this.cast({ t: 'del', col: op.col, id: op.id }, ws);
    }
  }

  async webSocketMessage(ws, raw) {
    let m; try { m = JSON.parse(raw); } catch { return; }
    if (m.t === 'hello') {
      const ops = Array.isArray(m.ops) ? m.ops.slice(0, 2000) : [];
      for (const op of ops) await this.apply(op, ws);
      ws.send(JSON.stringify({ t: 'snap-begin' }));
      const all = await this.ctx.storage.list();
      let chunk = [], size = 0;
      for (const [key, doc] of all) {
        const col = key.slice(0, key.indexOf('/'));
        chunk.push([col, doc]); size += JSON.stringify(doc).length;
        if (chunk.length >= 200 || size > 400_000) { ws.send(JSON.stringify({ t: 'docs', docs: chunk })); chunk = []; size = 0; }
      }
      if (chunk.length) ws.send(JSON.stringify({ t: 'docs', docs: chunk }));
      ws.send(JSON.stringify({ t: 'snap-end', ack: ops.map(o => o.n), peers: this.ctx.getWebSockets().length }));
    } else if (m.t === 'put' || m.t === 'del') {
      await this.apply(m, ws);
      ws.send(JSON.stringify({ t: 'ack', ack: [m.n] }));
    }
  }

  webSocketClose(ws) { this.peers(ws); }
  webSocketError(ws) { this.peers(ws); }
}
