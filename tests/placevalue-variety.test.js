import test from 'node:test';
import assert from 'node:assert/strict';
import { generateExercise } from '../js/engine.js';
import { createExerciseBatch, exerciseKey } from '../js/exercise-deck.js';

function seeded(seed) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}

const options = { topic: 'placevalue', grade: 2, difficulty: 'easy' };
test('reading a digit uses the whole two-digit number range without requiring number construction', () => {
  const tasks = Array.from({ length: 3000 }, (_, index) => generateExercise(options, seeded(index)));
  assert.ok(new Set(tasks.map(exerciseKey)).size >= 150);
  assert.ok(tasks.some(task => task.meta.number > 90));
  assert.ok(tasks.some(task => task.meta.number < 10));
  for (const task of tasks) {
    assert.equal(task.meta.kind, 'placevalue');
    assert.ok(task.meta.number >= 0 && task.meta.number <= 99);
    const digits = String(task.meta.number);
    assert.equal(task.answer, digits.at(-task.meta.place - 1));
  }
});

test('five complete easy place-value rounds do not repeat a seen task', () => {
  let history = [];
  const seen = new Set(), rng = seeded(100);
  for (let round = 0; round < 5; round += 1) {
    const batch = createExerciseBatch(options, 20, { history, rng });
    for (const task of batch.exercises) {
      const key = exerciseKey(task);
      assert.ok(!seen.has(key), `Repeated task: ${task.prompt} ${task.display}`);
      seen.add(key);
    }
    history = batch.history;
  }
  assert.equal(seen.size, 100);
});
