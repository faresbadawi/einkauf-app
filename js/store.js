import { firebaseConfig } from './firebase-config.js';

export const cloudEnabled = !!firebaseConfig.apiKey;
const FB = 'https://www.gstatic.com/firebasejs/11.0.2/';

/** Gemeinsame Schnittstelle: subscribe(col, cb) -> unsubscribe, put(col, obj), remove(col, id) */
export async function createStore(code) {
  return cloudEnabled ? cloudStore(code) : localStore(code);
}

function localStore(code) {
  const key = col => `unsertisch:${code}:${col}`;
  const read = col => { try { return JSON.parse(localStorage.getItem(key(col))) || []; } catch { return []; } };
  const write = (col, arr) => { localStorage.setItem(key(col), JSON.stringify(arr)); fire(col); };
  const subs = new Set();
  const fire = col => subs.forEach(s => s.col === col && s.cb(read(col)));
  addEventListener('storage', e => e.key?.startsWith(`unsertisch:${code}:`) && fire(e.key.split(':')[2]));
  return {
    mode: 'local',
    subscribe(col, cb) { const s = { col, cb }; subs.add(s); cb(read(col)); return () => subs.delete(s); },
    async put(col, obj) {
      const arr = read(col), i = arr.findIndex(x => x.id === obj.id);
      i >= 0 ? arr[i] = obj : arr.push(obj); write(col, arr);
    },
    async remove(col, id) { write(col, read(col).filter(x => x.id !== id)); }
  };
}

async function cloudStore(code) {
  const [{ initializeApp }, fs] = await Promise.all([
    import(FB + 'firebase-app.js'), import(FB + 'firebase-firestore.js')
  ]);
  const app = initializeApp(firebaseConfig);
  const db = fs.initializeFirestore(app, { localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() }) });
  const colRef = col => fs.collection(db, 'households', code, col);
  return {
    mode: 'cloud',
    subscribe(col, cb) {
      return fs.onSnapshot(colRef(col), snap => cb(snap.docs.map(d => ({ ...d.data(), id: d.id }))));
    },
    async put(col, obj) { const { id, ...rest } = obj; await fs.setDoc(fs.doc(colRef(col), id), rest); },
    async remove(col, id) { await fs.deleteDoc(fs.doc(colRef(col), id)); }
  };
}
