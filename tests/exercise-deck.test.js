import test from 'node:test';
import assert from 'node:assert/strict';
import { TOPICS, DIFFICULTIES } from '../js/engine.js';
import { createExerciseBatch, exerciseKey, HISTORY_LIMIT } from '../js/exercise-deck.js';
import { initialState, validateState } from '../js/store.js';

function seeded(seed) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}

test('IDs, shuffled choices and new hints do not disguise duplicate tasks', () => {
  const task = { prompt: 'Wie schwer?', display: '5 kg = ? g', unit: 'g', choices: ['5', '5000'] };
  assert.equal(exerciseKey(task), exerciseKey({ ...task, id: 'new', choices: ['5000', '5'], hint: 'Neu' }));
  assert.notEqual(exerciseKey(task), exerciseKey({ ...task, display: '6 kg = ? g' }));
  const grid = { ...task, visual: { type: 'grid', rows: 2, cols: 2, items: [{ row: 0, col: 0, label: 'A' }, { row: 1, col: 1, label: 'B' }] } };
  assert.equal(exerciseKey(grid), exerciseKey({ ...grid, visual: { ...grid.visual, items: [...grid.visual.items].reverse() } }));
});

for (const topic of TOPICS) for (const grade of topic.grades) for (const { id: difficulty } of DIFFICULTIES) {
  test(`each round and worksheet contains distinct tasks: ${topic.id}/${grade}/${difficulty}`, () => {
    const options = { topic: topic.id, grade, difficulty }, rng = seeded(173);
    let history = [];
    for (const length of [1, 20, 20, 16]) {
      const batch = createExerciseBatch(options, length, { rng, history });
      const keys = batch.exercises.map(exerciseKey);
      assert.equal(new Set(keys).size, length);
      assert.ok(!history.length || keys[0] !== history.at(-1), 'No immediate repetition across batches');
      history = batch.history;
    }
  });
}

test('every chosen times table supports a full 20-task round, including the smallest tables', () => {
  for (const topic of ['multiplication', 'division', 'missing', 'operators', 'sequences', 'remainder']) {
    for (const grade of topic === 'remainder' ? [3] : [2, 3]) for (const { id: difficulty } of DIFFICULTIES) {
      for (let table = topic === 'remainder' ? 2 : 1; table <= 10; table += 1) {
        const batch = createExerciseBatch({ topic, grade, difficulty, table }, 20, { rng: seeded(97) });
        assert.equal(new Set(batch.exercises.map(exerciseKey)).size, 20, `${topic}/${grade}/${difficulty}/table${table}`);
      }
    }
  }
});

test('new weights stay different across five rounds, worksheets and a reload', () => {
  for (const grade of [2, 3]) for (const { id: difficulty } of DIFFICULTIES) {
    const state = initialState(), options = { topic: 'weights', grade, difficulty };
    let history = [], all = [];
    for (let round = 0; round < 6; round += 1) {
      const batch = createExerciseBatch(options, round === 5 ? 16 : 20, { history, rng: seeded(42 + round) });
      all.push(...batch.exercises.map(exerciseKey));
      state.profiles[0].exerciseHistory = batch.history;
      history = validateState(JSON.parse(JSON.stringify(state))).profiles[0].exerciseHistory;
    }
    assert.equal(new Set(all).size, all.length, `${grade}/${difficulty}: weights repeat too soon`);
  }
});

test('mixed rounds cover distinct available topics and deterministic history is bounded', () => {
  const options = { topic: 'mixed', grade: 2, difficulty: 'easy' };
  const batch = createExerciseBatch(options, 20, { rng: seeded(64) });
  assert.equal(new Set(batch.exercises.map(q => q.topic)).size, 20);
  assert.deepEqual(batch, createExerciseBatch(options, 20, { rng: seeded(64) }));
  const history = Array.from({ length: HISTORY_LIMIT }, (_, i) => i.toString(16).padStart(16, '0'));
  const next = createExerciseBatch(options, 20, { history, rng: seeded(99) });
  assert.equal(next.history.length, HISTORY_LIMIT);
  assert.equal(history[0], '0000000000000000', 'The input history is not mutated');
});

test('invalid lengths and exhausted random streams fail instead of repeating forever', () => {
  for (const length of [0, -1, 21, NaN, 1.5]) assert.throws(() => createExerciseBatch({}, length), RangeError);
  assert.throws(() => createExerciseBatch({}, 2, { rng: () => 0 }), /unterschiedlichen Aufgaben/);
});

test('old profiles remain compatible, histories are bounded and validated separately for each child', () => {
  const state = initialState();
  delete state.profiles[0].exerciseHistory;
  assert.deepEqual(validateState(state).profiles[0].exerciseHistory, []);
  state.profiles[0].exerciseHistory = ['<script>', null, ...Array.from({ length: 1100 }, (_, i) => i.toString(16).padStart(16, '0'))];
  assert.equal(validateState(state).profiles[0].exerciseHistory.length, HISTORY_LIMIT);
});
