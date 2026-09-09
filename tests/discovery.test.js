import test from 'node:test';
import assert from 'node:assert/strict';
import { generateExercise, checkAnswer } from '../js/engine.js';
import { discoveryAnswer, verifyDiscoveryData } from './discovery-oracles.js';

function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const topics = ['shapes', 'symmetry', 'fractions', 'chance', 'spatial', 'combinations', 'area', 'perimeter', 'charts'];
for (const topic of topics) for (const grade of topic === 'fractions' ? [3] : [2, 3]) for (const difficulty of ['easy', 'medium', 'hard']) {
  test(`${topic}, grade ${grade}, ${difficulty}: wide content pool and independent answers`, () => {
    const visible = new Set(), mathematical = new Set(), kinds = new Set();
    for (let seed = 1; seed <= 3000; seed += 1) {
      const exercise = generateExercise({ topic, grade, difficulty }, seeded(seed));
      const expected = discoveryAnswer(exercise);
      if (expected === undefined) continue;
      kinds.add(exercise.meta.kind);
      assert.ok(checkAnswer(exercise, String(expected)), `${exercise.display}: expected ${expected}, got ${exercise.answer}`);
      verifyDiscoveryData(exercise, grade);
      assert.ok(exercise.explanation.length >= 1);
      for (const value of [exercise.prompt, exercise.display, exercise.hint, ...exercise.explanation]) {
        assert.equal(typeof value, 'string');
        assert.ok(value.trim());
        assert.doesNotMatch(value, /undefined|NaN|Infinity/);
      }
      if (exercise.input === 'choice') {
        assert.equal(exercise.choices.length, new Set(exercise.choices).size);
        assert.equal(exercise.choices.filter(choice => checkAnswer(exercise, choice)).length, 1);
      }
      visible.add(JSON.stringify([exercise.prompt, exercise.display, exercise.visual]));
      // IDs, story names and shuffled answer choices never count as mathematical variety.
      mathematical.add(JSON.stringify(exercise.meta));
    }
    assert.ok(kinds.size >= 1);
    assert.ok(visible.size >= 100, `${topic}/${grade}/${difficulty}: only ${visible.size} visibly different tasks`);
    assert.ok(mathematical.size >= 100, `${topic}/${grade}/${difficulty}: only ${mathematical.size} mathematical tasks`);
  });
}

test('new discovery families include safe RNG boundary cases', () => {
  for (const topic of topics) for (const grade of topic === 'fractions' ? [3] : [2, 3]) for (const difficulty of ['easy', 'medium', 'hard']) {
    for (const value of [0.25, 0.5, 0.75, 0.9999999999999999]) {
      const exercise = generateExercise({ topic, grade, difficulty }, () => value);
      const expected = discoveryAnswer(exercise);
      if (expected !== undefined) {
        assert.ok(checkAnswer(exercise, String(expected)));
        verifyDiscoveryData(exercise, grade);
      }
    }
  }
});
