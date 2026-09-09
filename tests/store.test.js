import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, validateState, readState, writeState, newProfile, recordAnswer, purchaseCompanion } from '../js/store.js';
test('Fortschritt überlebt Speicherung und erneutes Laden', () => {
  const db = new Map(), storage = { getItem: k => db.get(k), setItem: (k,v) => db.set(k,v) };
  const state = initialState();
  recordAnswer(state.profiles[0], 'addition', true);
  recordAnswer(state.profiles[0], 'addition', false);
  recordAnswer(state.profiles[0], 'addition', false, false);
  assert.equal(state.profiles[0].stars, 2);
  assert.ok(!('coins' in state.profiles[0]) && !('xp' in state.profiles[0]));
  assert.equal(state.profiles[0].solved, 2);
  assert.equal(writeState(storage, state), true);
  assert.deepEqual(readState(storage).state, state);
});
test('Blockierter oder beschädigter Speicher lässt Üben weiter zu', () => {
  assert.equal(readState({ getItem() { throw Error(); } }).available, false);
  assert.equal(readState({ getItem() { return '{kaputt'; } }).state.profiles.length, 1);
  assert.equal(writeState({ setItem() { throw Error(); } }, initialState()), false);
});
test('Import validiert Struktur und begrenzt unzuverlässige Werte', () => {
  assert.throws(() => validateState({}));
  const state = initialState();
  state.profiles[0].stars = -40;
  state.profiles[0].solved = Infinity;
  state.profiles[0].stats = JSON.parse('{"__proto__":{"polluted":true}}');
  const clean = validateState(state);
  assert.equal(clean.profiles[0].stars, 0);
  assert.equal(clean.profiles[0].solved, 0);
  assert.equal({}.polluted, undefined);
  state.profiles.push(state.profiles[0]);
  assert.throws(() => validateState(state));
});
test('Profile bleiben voneinander getrennt', () => {
  const a = newProfile('A'), b = newProfile('B');
  recordAnswer(a, 'division', true);
  assert.notEqual(a.id, b.id);
  assert.equal(b.stars, 0);
  assert.deepEqual(b.stats, {});
});
test('Sterne können nur einmal und bei ausreichendem Guthaben ausgegeben werden', () => {
  const p=newProfile();
  assert.equal(purchaseCompanion(p,'penguin'),false);
  p.stars=20;
  assert.equal(purchaseCompanion(p,'penguin'),true);
  assert.equal(p.stars,5);
  assert.equal(p.companion,'penguin');
  assert.equal(purchaseCompanion(p,'penguin'),false);
  assert.equal(purchaseCompanion(p,'unknown'),false);
  assert.equal(p.stars,5);
});

test('jede selbst gelöste Aufgabe gibt genau einen Stern, gemeinsames Lösen keinen', () => {
  const p = newProfile();
  assert.equal(recordAnswer(p, 'weights', true), 1);
  assert.equal(recordAnswer(p, 'weights', false), 1);
  assert.equal(recordAnswer(p, 'weights', false, false), 0);
  assert.equal(p.stars, 2);
  assert.equal(p.solved, 2);
  assert.deepEqual(p.stats.weights, { attempts: 3, correct: 1, solved: 2 });
});

test('alte Profile werden einmalig auf eine Stern-Währung umgestellt', () => {
  const state = initialState();
  state.version = 1;
  Object.assign(state.profiles[0], { xp: 1000, coins: 31, solved: 120, rounds: 12, owned: ['fine', 'penguin'], companion: 'penguin' });
  delete state.profiles[0].stars;
  const migrated = validateState(state), p = migrated.profiles[0];
  assert.equal(migrated.version, 2);
  assert.equal(p.stars, 16);
  assert.equal(p.solved, 120);
  assert.equal(p.rounds, 12);
  assert.equal(p.companion, 'penguin');
  assert.deepEqual(p.owned, ['fine', 'penguin']);
  assert.ok(!('xp' in p) && !('coins' in p));
  assert.deepEqual(validateState(JSON.parse(JSON.stringify(migrated))), migrated);
  const storage = { getItem: () => JSON.stringify(state) };
  assert.equal(readState(storage).state.profiles[0].stars, 16);
});

test('Einlösen erhält Lernfortschritt und neue Spielstände werden nicht erneut umgerechnet', () => {
  const state = initialState(), p = state.profiles[0];
  for (let i = 0; i < 15; i += 1) recordAnswer(p, 'addition', true);
  assert.equal(purchaseCompanion(p, 'penguin'), true);
  assert.equal(p.stars, 0);
  assert.equal(p.solved, 15);
  assert.equal(p.stats.addition.solved, 15);
  assert.deepEqual(validateState(state), state);
});
