// Cloudflare Worker für "Unser Tisch": holt eine Rezeptseite und liefert das Rezept als JSON.
// 1) Hat die Seite maschinenlesbare Rezeptdaten (schema.org), werden die benutzt (genau, ohne KI).
// 2) Sonst liest Gemini den Seitentext. Mit de=1 wird ins Deutsche übersetzt.
// Geheimnis (nicht im Code!): GEMINI_API_KEY  – wird im Cloudflare-Dashboard unter Einstellungen > Variablen eingetragen.
const MODEL = 'gemini-flash-latest';
const MAX_HTML = 2_500_000, MAX_TEXT = 25_000;

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    ingredients: { type: 'ARRAY', items: { type: 'STRING' } },
    steps: { type: 'STRING' },
    time: { type: 'INTEGER' },
    servings: { type: 'INTEGER' },
    category: { type: 'STRING', enum: ['Hauptgerichte', 'Salate', 'Suppen', 'Frühstück', 'Desserts'] },
    emoji: { type: 'STRING' }
  },
  required: ['title', 'ingredients', 'steps']
};

const json = (obj, status, cors) => new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors } });

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    const okOrigin = !allowed.length || allowed.includes(origin) || /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+)(:\d+)?$/.test(origin);
    const cors = { 'Access-Control-Allow-Origin': okOrigin ? (origin || '*') : 'null', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Vary': 'Origin' };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (!okOrigin) return json({ error: 'Origin nicht erlaubt' }, 403, cors);

    const q = new URL(req.url).searchParams;
    let target;
    try { target = new URL(q.get('url')); if (!/^https?:$/.test(target.protocol)) throw 0; } catch { return json({ error: 'Ungültiger Link' }, 400, cors); }
    const de = q.get('de') === '1';

    let html;
    try {
      const r = await fetch(target, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; UnserTisch)', 'Accept-Language': 'de,en;q=0.8,ar;q=0.6' }, redirect: 'follow' });
      if (!r.ok) return json({ error: `Seite antwortet mit ${r.status}` }, 502, cors);
      html = (await r.text()).slice(0, MAX_HTML);
    } catch { return json({ error: 'Seite nicht erreichbar' }, 502, cors); }

    const structured = fromJsonLd(html);
    const image = structured?.image || meta(html, 'og:image');
    try {
      if (structured && !de) return json({ ...structured, source: 'structured' }, 200, cors);
      if (!env.GEMINI_API_KEY) {
        if (structured) return json({ ...structured, source: 'structured', warning: 'GEMINI_API_KEY fehlt (Secret nicht gesetzt oder nicht deployed)' }, 200, cors);
        return json({ error: 'KI nicht eingerichtet (GEMINI_API_KEY fehlt)' }, 501, cors);
      }
      const input = structured ? JSON.stringify(structured) : pageText(html);
      const out = await gemini(env.GEMINI_API_KEY, input, de);
      return json({ ...out, image: out.image || image || '', url: target.href, source: structured ? 'structured+ai' : 'ai' }, 200, cors);
    } catch (e) {
      if (structured) return json({ ...structured, source: 'structured', warning: 'KI-Fehler: ' + (e.message || e) }, 200, cors);
      return json({ error: 'KI-Fehler: ' + (e.message || e) }, 502, cors);
    }
  }
};

async function gemini(key, input, de) {
  const prompt = `Du bekommst den Text einer Webseite (oder bereits ausgelesene Rezeptdaten). Extrahiere genau EIN Rezept.
- ingredients: eine Zutat pro Eintrag im Format "Menge Einheit Zutat", z. B. "500 g Nudeln", "2 EL Olivenöl", "1/2 Zitrone". Gib Mengen als Zahl an, Einheiten abgekürzt (g, kg, ml, l, EL, TL, Stk.).
- steps: nummerierte Schritte, durch Zeilenumbruch getrennt ("1. …\\n2. …").
- time: Gesamtzeit in Minuten (0 wenn unbekannt). servings: Personen (0 wenn unbekannt).
- category passend wählen, emoji ein passendes Speise-Emoji.
${de ? '- Übersetze ALLES ins Deutsche (Titel, Zutaten, Schritte).' : '- Bleibe in der Originalsprache der Seite.'}
- Erfinde nichts. Ignoriere Werbung, Kommentare und Menüs. Ist kein Rezept enthalten, gib einen leeren title zurück.

TEXT:
${input.slice(0, MAX_TEXT)}`;
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', responseSchema: SCHEMA, temperature: 0.1 } })
  });
  if (!r.ok) throw new Error(`Gemini ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const d = await r.json();
  const out = JSON.parse(d.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
  if (!out.title) throw new Error('Kein Rezept gefunden');
  return out;
}

function meta(html, prop) {
  const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']+)["']`, 'i'));
  return m ? decode(m[1]) : '';
}
const decode = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
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
