import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, validateState, readState, writeState, newProfile, recordAnswer, purchaseCompanion } from '../js/store.js';
test('Fortschritt überlebt Speicherung und erneutes Laden', () => {
  const db = new Map(), storage = { getItem: k => db.get(k), setItem: (k,v) => db.set(k,v) };
  const state = initialState();
  recordAnswer(state.profiles[0], 'addition', true);
  recordAnswer(state.profiles[0], 'addition', false);
  recordAnswer(state.profiles[0], 'addition', false, false);
  assert.equal(state.profiles[0].xp, 15);
  assert.equal(state.profiles[0].coins, 3);
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
  state.profiles[0].xp = -40;
  state.profiles[0].solved = Infinity;
  state.profiles[0].stats = JSON.parse('{"__proto__":{"polluted":true}}');
  const clean = validateState(state);
  assert.equal(clean.profiles[0].xp, 0);
  assert.equal(clean.profiles[0].solved, 0);
  assert.equal({}.polluted, undefined);
  state.profiles.push(state.profiles[0]);
  assert.throws(() => validateState(state));
});
test('Profile bleiben voneinander getrennt', () => {
  const a = newProfile('A'), b = newProfile('B');
  recordAnswer(a, 'division', true);
  assert.notEqual(a.id, b.id);
  assert.equal(b.xp, 0);
  assert.deepEqual(b.stats, {});
});
test('Münzen können nur einmal und bei ausreichendem Guthaben ausgegeben werden', () => {
  const p=newProfile();
  assert.equal(purchaseCompanion(p,'penguin'),false);
  p.coins=20;
  assert.equal(purchaseCompanion(p,'penguin'),true);
  assert.equal(p.coins,5);
  assert.equal(p.companion,'penguin');
  assert.equal(purchaseCompanion(p,'penguin'),false);
  assert.equal(purchaseCompanion(p,'unknown'),false);
  assert.equal(p.coins,5);
});
