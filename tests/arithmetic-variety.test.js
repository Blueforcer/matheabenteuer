import test from 'node:test';
import assert from 'node:assert/strict';
import { generateExercise } from '../js/engine.js';

function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const visibleKey = exercise => JSON.stringify([exercise.prompt, exercise.display, exercise.unit, exercise.visual]);

test('every selected row offers at least 30 distinct arithmetic and sequence problems at every level', () => {
  for (const topic of ['multiplication', 'division', 'missing', 'operators', 'sequences']) {
    for (const grade of [2, 3]) for (const difficulty of ['easy', 'medium', 'hard']) for (let table = 1; table <= 10; table += 1) {
      const exercises = Array.from({ length: 1000 }, (_, seed) => generateExercise({ topic, grade, difficulty, table }, seeded(seed)));
      const distinct = new Set(exercises.map(visibleKey)).size;
      assert.ok(distinct >= 30, `${topic}, class ${grade}, ${difficulty}, row ${table}: only ${distinct} different problems`);
      for (const exercise of exercises) {
        const m = exercise.meta;
        assert.equal(topic === 'sequences' ? m.step : m.b, table);
        if (topic === 'sequences') {
          assert.ok(m.values.every(value => value >= 0 && value <= (grade === 2 ? 100 : 1000)));
          assert.ok(m.values.every(value => value % table === 0));
          assert.equal(Number(exercise.answer), m.values[m.blank]);
        } else {
          assert.ok([m.a, m.b, m.result].every(value => value >= 0 && value <= (grade === 2 ? 100 : 1000)));
        }
      }
    }
  }
});

test('split arithmetic calculations match the two displayed calculations', () => {
  for (const topic of ['multiplication', 'division']) {
    const seen = new Set();
    for (const grade of [2, 3]) for (const difficulty of ['easy', 'medium', 'hard']) {
      for (let seed = 0; seed < 300; seed += 1) {
        const exercise = generateExercise({ topic, grade, difficulty, table: 10 }, seeded(seed));
        const m = exercise.meta;
        seen.add(m.kind);
        if (m.kind === 'arithmeticsplit') {
          const match = exercise.display.match(/^(\d+) ([·:]) (\d+) \+ (\d+) [·:] (\d+) = \?$/);
          assert.ok(match, exercise.display);
          const [, left, operator, divisor, right, secondDivisor] = match;
          const expected = operator === '·' ? Number(left) * Number(divisor) + Number(right) * Number(secondDivisor)
            : Number(left) / Number(divisor) + Number(right) / Number(secondDivisor);
          assert.equal(Number(exercise.answer), expected);
          assert.equal(m.first + m.second, m.a);
        } else if (m.kind === 'missing') {
          assert.equal(Number(exercise.answer), m.a);
          assert.ok(exercise.display.startsWith('□'));
        }
      }
    }
    assert.deepEqual([...seen].sort(), ['arithmetic', 'arithmeticsplit', 'missing']);
  }
});

test('easy doubling and halving include many different composed quantities within 20', () => {
  const exercises = Array.from({ length: 1200 }, (_, seed) => generateExercise({ topic: 'double', grade: 2, difficulty: 'easy' }, seeded(seed)));
  assert.ok(new Set(exercises.map(visibleKey)).size >= 90);
  assert.ok(exercises.some(exercise => exercise.meta.first && exercise.meta.isDouble));
  assert.ok(exercises.some(exercise => exercise.meta.first && !exercise.meta.isDouble));
  for (const exercise of exercises) {
    const { number, isDouble, first, second } = exercise.meta;
    if (first !== undefined) assert.equal(first + second, number);
    assert.equal(Number(exercise.answer), isDouble ? number * 2 : number / 2);
    assert.ok(number <= 20 && Number(exercise.answer) <= 20);
  }
});

test('easy number sequences vary their direction, missing position and length', () => {
  const exercises = Array.from({ length: 250 }, (_, seed) => generateExercise({ topic: 'sequences', grade: 2, difficulty: 'easy', table: 10 }, seeded(seed)));
  assert.equal(new Set(exercises.map(exercise => exercise.meta.descending)).size, 2);
  assert.equal(new Set(exercises.map(exercise => exercise.meta.values.length)).size, 3);
  assert.ok(new Set(exercises.map(exercise => exercise.meta.blank)).size >= 3);
  assert.ok(new Set(exercises.map(exercise => exercise.meta.values[0])).size >= 8);
});
