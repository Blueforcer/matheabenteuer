export const STORAGE_KEY = 'matheabenteuer.v1';
const avatars = ['🦇', '🦊', '🐼', '🐸', '🐱', '🐨', '🦄'];
export const AVATARS = avatars;
export const SHOP = [
  { id:'fine', icon:'🦇', name:'Fine, die Fledermaus', price:0 },
  { id:'penguin', icon:'🐧', name:'Pippa, die Zahlenforscherin', price:15 },
  { id:'dino', icon:'🦕', name:'Dino, der Knobelfreund', price:30 },
  { id:'astronaut', icon:'🧑‍🚀', name:'Alex, der Sternensammler', price:50 },
  { id:'dragon', icon:'🐲', name:'Funkel, der Mutmacher', price:75 },
  { id:'unicorn', icon:'🦄', name:'Lumi, das Zaubereinhorn', price:100 },
];
const count = (n, max = 1e9) => Number.isFinite(n) ? Math.min(max, Math.max(0, Math.floor(n))) : 0;
const uid = () => globalThis.crypto?.randomUUID?.() || `p-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export function newProfile(name = 'Mathe-Fan', avatar = '🦇') {
  return { id: uid(), name: String(name).trim().slice(0, 24) || 'Mathe-Fan', avatar: avatars.includes(avatar) ? avatar : '🦇', xp: 0, coins: 0, owned: ['fine'], companion: 'fine', solved: 0, rounds: 0, stats: {}, days: {} };
}
export function initialState() {
  const p = newProfile();
  return { version: 1, active: p.id, profiles: [p], settings: { grade: 2, difficulty: 'easy', table: 0, length: 10, category: 'Alle' } };
}
export function validateState(raw) {
  if (!raw || raw.version !== 1 || !Array.isArray(raw.profiles) || !raw.profiles.length || raw.profiles.length > 12) throw new Error('Diese Datei ist kein passender Matheabenteuer-Spielstand.');
  const seen = new Set();
  const profiles = raw.profiles.map(p => {
    if (!p || typeof p.name !== 'string' || typeof p.id !== 'string' || !p.id || p.id.length > 100 || seen.has(p.id)) throw new Error('Die Profile in der Datei sind ungültig.');
    seen.add(p.id);
    const clean = { ...newProfile(p.name, p.avatar), id: p.id, xp: count(p.xp), solved: count(p.solved), rounds: count(p.rounds) };
    clean.coins = count(p.coins);
    clean.owned = [...new Set(['fine', ...(Array.isArray(p.owned) ? p.owned.filter(id=>SHOP.some(item=>item.id===id)) : [])])];
    clean.companion = clean.owned.includes(p.companion) ? p.companion : 'fine';
    for (const [key, value] of Object.entries(p.stats || {}).slice(0, 100)) {
      if (!/^[a-z]+$/.test(key) || ['constructor','prototype'].includes(key) || !value) continue;
      const attempts = count(value.attempts), correct = Math.min(attempts, count(value.correct));
      clean.stats[key] = { attempts, correct, solved: count(value.solved) };
    }
    for (const [key, val] of Object.entries(p.days || {}).slice(-366)) if (/^\d{4}-\d{2}-\d{2}$/.test(key)) clean.days[key] = count(val);
    return clean;
  });
  const s = raw.settings || {};
  return { version: 1, profiles, active: profiles.some(p => p.id === raw.active) ? raw.active : profiles[0].id, settings: { grade: s.grade === 3 ? 3 : 2, difficulty: ['easy','medium','hard'].includes(s.difficulty) ? s.difficulty : 'easy', table: count(s.table, 10), length: [5,10,20].includes(s.length) ? s.length : 10, category: ['Alle','Rechnen','Zahlen','Alltag','Entdecken'].includes(s.category) ? s.category : 'Alle' } };
}
export function readState(storage) {
  try { const raw = storage.getItem(STORAGE_KEY); return { state: raw ? validateState(JSON.parse(raw)) : initialState(), available: true }; }
  catch { return { state: initialState(), available: false }; }
}
export function writeState(storage, state) {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; } catch { return false; }
}
export function localDay(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
export function recordAnswer(profile, topic, firstTry, award = true) {
  const stat = profile.stats[topic] ||= { attempts: 0, correct: 0, solved: 0 };
  stat.attempts += 1;
  if (firstTry && award) stat.correct += 1;
  const points = award ? (firstTry ? 10 : 5) : 0;
  if (award) { stat.solved += 1; profile.solved += 1; profile.xp += points; profile.coins += firstTry ? 2 : 1; profile.days[localDay()] = (profile.days[localDay()] || 0) + 1; }
  return points;
}
export function purchaseCompanion(profile, id) {
  const item = SHOP.find(item=>item.id===id);
  if(!item || profile.owned.includes(id) || profile.coins < item.price) return false;
  profile.coins -= item.price;
  profile.owned.push(id);
  profile.companion = id;
  return true;
}
