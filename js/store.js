// Datenhaltung: alles liegt lokal auf dem Gerät (funktioniert offline) und wird – wenn ein Worker
// eingetragen ist – per WebSocket live mit allen Geräten des Haushalts abgeglichen.
export const COLS = ['items', 'recipes', 'plan', 'stores', 'prefs', 'custom', 'meta'];

const load = k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };

/**
 * @param code    Haushaltscode
 * @param url     Worker-Adresse (leer = nur lokal)
 * @param onData  ({items:[…], recipes:[…], …}) bei jeder Änderung
 * @param onNet   ({state:'local'|'connecting'|'online'|'offline', peers, synced})
 */
export function createStore(code, url, onData, onNet) {
  const kData = `ut2:${code}:data`, kOut = `ut2:${code}:out`;
  const cache = load(kData) || {};
  for (const c of COLS) cache[c] ||= {};
  let out = load(kOut) || [];
  let n = out.reduce((m, o) => Math.max(m, o.n), 0);
  let ws = null, snap = null, retry = 0, timer = 0, ping = 0, saveT = 0, closed = false;
  const net = { state: url ? 'connecting' : 'local', peers: 1, synced: !url || !!load(`ut2:${code}:synced`) };

  const persist = () => { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(kData, JSON.stringify(cache)); } catch {} }, 120); };
  const saveOut = () => { try { localStorage.setItem(kOut, JSON.stringify(out)); } catch {} };
  const emit = () => { persist(); onData(Object.fromEntries(COLS.map(c => [c, Object.values(cache[c])]))); };
  const setNet = patch => { Object.assign(net, patch); onNet({ ...net }); };
  const applyLocal = op => { if (op.t === 'put') cache[op.col][op.doc.id] = op.doc; else delete cache[op.col][op.id]; };
  const ack = ns => { if (ns?.length) { out = out.filter(o => !ns.includes(o.n)); saveOut(); } };

  function connect() {
    if (!url || closed || ws) return;
    clearTimeout(timer);
    let sock;
    try { sock = new WebSocket(url.replace(/^http/, 'ws').replace(/\/?$/, '/') + 'sync/' + code); } catch { return again(); }
    ws = sock;
    sock.onopen = () => { retry = 0; sock.send(JSON.stringify({ t: 'hello', ops: out })); clearInterval(ping); ping = setInterval(() => { try { sock.send('ping'); } catch {} }, 25000); };
    sock.onmessage = e => {
      if (e.data === 'pong') return;
      let m; try { m = JSON.parse(e.data); } catch { return; }
      if (m.t === 'snap-begin') snap = Object.fromEntries(COLS.map(c => [c, {}]));
      else if (m.t === 'docs' && snap) { for (const [col, doc] of m.docs) if (snap[col]) snap[col][doc.id] = doc; }
      else if (m.t === 'snap-end' && snap) {
        ack(m.ack);
        for (const c of COLS) cache[c] = snap[c];
        snap = null;
        for (const op of out) { applyLocal(op); sock.send(JSON.stringify(op)); }   // Änderungen, die während des Abgleichs entstanden sind
        try { localStorage.setItem(`ut2:${code}:synced`, '1'); } catch {}
        Object.assign(net, { state: 'online', peers: m.peers || 1, synced: true });
        emit(); onNet({ ...net });
      }
      else if (m.t === 'ack') ack(m.ack);
      else if (m.t === 'peers') setNet({ peers: m.n });
      else if (m.t === 'put' && cache[m.col]) { cache[m.col][m.doc.id] = m.doc; emit(); }
      else if (m.t === 'del' && cache[m.col]) { delete cache[m.col][m.id]; emit(); }
    };
    sock.onclose = sock.onerror = () => { if (ws !== sock) return; ws = null; clearInterval(ping); if (!closed) { setNet({ state: 'offline', peers: 1 }); again(); } };
  }
  function again() { clearTimeout(timer); timer = setTimeout(connect, Math.min(15000, 800 * 2 ** retry++)); }

  function push(op) {
    op.n = ++n; applyLocal(op); emit();
    if (!url) return;
    out.push(op); saveOut();
    if (ws?.readyState === 1 && net.state === 'online') ws.send(JSON.stringify(op));
  }

  if (url) {
    addEventListener('online', () => { retry = 0; connect(); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden && !ws) { retry = 0; connect(); } });
  }
  setTimeout(() => { emit(); onNet({ ...net }); connect(); }, 0);

  return {
    put(col, doc) { push({ t: 'put', col, doc: { ...doc, u: Date.now() } }); },
    remove(col, id) { if (cache[col]?.[id]) push({ t: 'del', col, id }); },
    get net() { return net; },
    close() { closed = true; clearTimeout(timer); clearInterval(ping); try { ws?.close(); } catch {} }
  };
}
