import test from 'node:test';
import assert from 'node:assert/strict';
import { TOPICS, DIFFICULTIES, generateExercise, checkAnswer } from '../js/engine.js';

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

function compute({ a, b, operation }) {
  return operation === '+' ? a + b : operation === '-' ? a - b : operation === '*' ? a * b : a / b;
}

// This oracle derives each result from the task data independently of the supplied answer.
function expectedAnswer(exercise) {
  const m = exercise.meta;
  switch (m.kind) {
    case 'arithmetic': case 'word': case 'written': return compute(m);
    case 'remainder': return `${Math.floor(m.dividend / m.divisor)} Rest ${m.dividend % m.divisor}`;
    case 'missing': return m[m.blank];
    case 'operators': {
      const possibilities = { '+': m.a + m.b, '−': m.a - m.b, '·': m.a * m.b, ':': m.a / m.b };
      const matches = Object.entries(possibilities).filter(([, result]) => result === m.result);
      assert.equal(matches.length, 1, 'A sign exercise must have exactly one valid answer');
      return matches[0][0];
    }
    case 'sequence': return m.values[m.blank];
    case 'placevalue': return Number(String(m.number).at(-m.place - 1));
    case 'buildnumber': return m.hundreds * 100 + m.tens * 10 + m.ones;
    case 'neighbor': return m.base + m.offset;
    case 'comparison': return m.left < m.right ? '<' : m.left > m.right ? '>' : '=';
    case 'nextten': return (Math.floor(m.number / 10) + 1) * 10;
    case 'rounding': return Math.round(m.number / m.base) * m.base;
    case 'double': return m.isDouble ? m.number * 2 : m.number / 2;
    case 'coins': return m.coins.reduce((total, coin) => total + coin, 0);
    case 'change': return (m.paid - m.price) / m.scale;
    case 'clock': return `${m.hour}:${String(m.minute).padStart(2, '0')} Uhr`;
    case 'duration': return m.end - m.start;
    case 'lengthconvert': return m.metres * 100 + m.centimetres;
    case 'lengthsum': return m.subtract ? m.a : m.a + m.b;
    case 'weightunit': return { 'eine Büroklammer': 'g', 'ein Kind': 'kg', 'ein Apfel': 'g', 'ein Fahrrad': 'kg' }[m.object];
    case 'weights': return m.total - m.part;
    case 'weightconvert': return m.toGrams ? m.grams : m.grams / 1000;
    case 'weightmixed': return m.firstGrams + m.addedGrams;
    case 'capacityunit': return m.small ? 'Milliliter (ml)' : 'Liter (l)';
    case 'capacitydivision': return m.total / m.glass;
    case 'capacitysum': return m.a + m.b;
    case 'shapename': return { triangle: 'Dreieck', square: 'Quadrat', rectangle: 'Rechteck', circle: 'Kreis' }[m.name];
    case 'solidname': return { cube: 'Würfel', cuboid: 'Quader', sphere: 'Kugel', cylinder: 'Zylinder' }[m.name];
    case 'solidcount': return m.property === 'faces' ? 6 : ['cube', 'cuboid'].includes(m.name) ? 8 : 0;
    case 'symmetryexists': return 'Ja';
    case 'symmetryclaim': return 'Nein';
    case 'symmetry': return { square: 4, rectangle: 2, triangle: 3 }[exercise.visual.name];
    case 'symmetryremaining': return { square: 4, rectangle: 2, triangle: 3 }[exercise.visual.name] - 1;
    case 'perimeter': return m.area ? m.width * m.height : 2 * m.width + 2 * m.height;
    case 'fraction': return `${m.shaded}/${m.parts}`;
    case 'chart': return m.mode === 'read' ? m.values[m.index] : m.mode === 'sum' ? m.values.reduce((total, value) => total + value, 0) : Math.max(...m.values) - Math.min(...m.values);
    case 'chance': return m.count === 0 ? 'Unmöglich' : m.count === m.red + m.blue ? 'Sicher' : 'Möglich, aber nicht sicher';
    case 'combinations': return m.shirts * m.trousers;
    case 'wordmulti': return m.boxes * m.perBox - m.given;
    case 'order': return m.brackets ? (m.a + m.b) * m.d : m.a + m.b * m.d;
    case 'parity': return m.number % 2 === 0 ? 'Gerade' : 'Ungerade';
    case 'digitsum': return String(m.number).split('').reduce((total, digit) => total + Number(digit), 0);
    case 'divisibility': return m.number % m.divisor === 0 ? 'Ja' : 'Nein';
    case 'weekday': return ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'][(m.day + m.offset) % 7];
    case 'monthdays': return new Date(Date.UTC(m.year, m.month + 1, 0)).getUTCDate();
    case 'calendarduration': return (Date.UTC(m.year, m.month + 1, m.end) - Date.UTC(m.year, m.month, m.start)) / 86_400_000;
    case 'area': return m.width * m.height;
    case 'areacomparison': {
      const a = m.width * m.height, b = m.secondWidth * m.secondHeight;
      return a > b ? 'A ist größer' : a < b ? 'B ist größer' : 'Beide sind gleich groß';
    }
    case 'spatial': return m.subject.col < m.reference.col ? 'Links' : m.subject.col > m.reference.col ? 'Rechts' : m.subject.row < m.reference.row ? 'Darüber' : 'Darunter';
    case 'combinations3': return m.a * m.b * m.extra;
    default: assert.fail(`Missing independent oracle for ${m.kind}`);
  }
}

function verifyExercise(exercise, grade) {
  assert.ok(exercise.id && exercise.topic);
  assert.equal(typeof exercise.answer, 'string');
  assert.ok(exercise.answer.length > 0);
  for (const text of [exercise.prompt, exercise.display, exercise.hint, ...exercise.explanation]) {
    assert.equal(typeof text, 'string');
    assert.ok(text.trim().length > 0);
    assert.doesNotMatch(text, /undefined|NaN|Infinity|<script/);
  }
  assert.ok(exercise.explanation.length > 0);
  assert.ok(checkAnswer(exercise, exercise.answer));
  assert.ok(!checkAnswer(exercise, ''));
  assert.ok(!checkAnswer(exercise, '<script>alert(1)</script>'));
  assert.ok(!checkAnswer(exercise, `${exercise.answer} falsch`));
  if (exercise.input === 'choice') {
    assert.ok(exercise.choices.length >= 2 && exercise.choices.length <= 7);
    assert.equal(new Set(exercise.choices).size, exercise.choices.length, 'Choices must be unique');
    assert.equal(exercise.choices.filter(choice => checkAnswer(exercise, choice)).length, 1);
  } else {
    assert.equal(exercise.input, 'number');
    assert.ok(Number.isFinite(Number(exercise.answer.replace(',', '.'))));
    assert.ok(Number(exercise.answer.replace(',', '.')) >= 0, 'No negative numeric answers');
    assert.ok(checkAnswer(exercise, `  ${exercise.answer.replace(',', '.')}  `));
    assert.ok(!checkAnswer(exercise, String(Number(exercise.answer.replace(',', '.')) + 1)));
  }
  const expected = expectedAnswer(exercise);
  assert.ok(checkAnswer(exercise, String(expected)), `Wrong answer: ${exercise.display}; expected ${expected}, received ${exercise.answer}`);
  const m = exercise.meta;
  if (m.operation) {
    assert.equal(compute(m), m.result, 'Arithmetic source data must be consistent');
    for (const number of [m.a, m.b, m.result]) {
      assert.ok(Number.isSafeInteger(number));
      assert.ok(number >= 0 && number <= (grade === 2 ? 100 : 1000), `Out of range: ${number} in grade ${grade}`);
    }
    if (m.operation === '/') assert.ok(m.b > 0, 'Never divide by zero');
  }
  if (m.kind === 'remainder') {
    assert.ok(m.rest > 0 && m.rest < m.divisor);
    assert.ok(m.dividend <= 1000);
  }
  if (m.kind === 'sequence') {
    for (let i = 1; i < m.values.length; i += 1) assert.equal(m.values[i] - m.values[i - 1], m.descending ? -m.step : m.step);
    assert.ok(m.values.every(value => value >= 0 && value <= (grade === 2 ? 100 : 1000)));
  }
  if (exercise.visual?.type === 'clock') {
    assert.ok(exercise.visual.hour >= 1 && exercise.visual.hour <= 12);
    assert.ok(exercise.visual.minute >= 0 && exercise.visual.minute < 60);
  }
  if (exercise.visual?.type === 'grid') {
    assert.equal(new Set(exercise.visual.items.map(item => `${item.row},${item.col}`)).size, exercise.visual.items.length);
    for (const item of exercise.visual.items) {
      assert.ok(item.row >= 0 && item.row < exercise.visual.rows);
      assert.ok(item.col >= 0 && item.col < exercise.visual.cols);
    }
  }
}

test('topic and difficulty catalogs are coherent', () => {
  assert.equal(TOPICS.length, 31);
  assert.equal(new Set(TOPICS.map(topic => topic.id)).size, TOPICS.length);
  for (const topic of TOPICS) {
    assert.ok(topic.title && topic.description && topic.icon && topic.color);
    assert.ok(['Rechnen', 'Zahlen', 'Alltag', 'Entdecken'].includes(topic.category));
    assert.ok(topic.grades.every(grade => [2, 3].includes(grade)));
  }
  assert.deepEqual(DIFFICULTIES.map(item => item.id), ['easy', 'medium', 'hard']);
});

for (const topic of TOPICS) {
  for (const grade of topic.grades) {
    for (const { id: difficulty } of DIFFICULTIES) {
      test(`${topic.id} · grade ${grade} · ${difficulty}: 150 reproducible exercises`, () => {
        for (let seed = 1; seed <= 150; seed += 1) {
          const options = { topic: topic.id, grade, difficulty, table: 0 };
          const exercise = generateExercise(options, seeded(seed));
          assert.deepEqual(exercise, generateExercise(options, seeded(seed)), 'Identical seeds must give identical exercises');
          verifyExercise(exercise, grade);
        }
      });
    }
  }
}

test('the selected times table is used in multiplication, division, missing numbers, signs and number lines', () => {
  for (const topic of ['multiplication', 'division', 'sequences', 'missing', 'operators']) {
    for (const grade of [2, 3]) for (const difficulty of ['easy', 'medium', 'hard']) for (let table = 1; table <= 10; table += 1) {
      for (let seed = 0; seed < 20; seed += 1) {
        const exercise = generateExercise({ topic, grade, difficulty, table }, seeded(seed));
        verifyExercise(exercise, grade);
        assert.equal(topic === 'sequences' ? exercise.meta.step : exercise.meta.b, table);
      }
    }
  }
});

test('division with a chosen nontrivial table has a smaller nonzero remainder', () => {
  for (let table = 2; table <= 10; table += 1) for (const difficulty of ['easy', 'medium', 'hard']) {
    for (let seed = 0; seed < 30; seed += 1) {
      const exercise = generateExercise({ topic: 'remainder', grade: 3, difficulty, table }, seeded(seed));
      verifyExercise(exercise, 3);
      assert.equal(exercise.meta.divisor, table);
    }
  }
});

test('zero is practiced without ever dividing by zero', () => {
  for (const topic of ['addition', 'subtraction', 'multiplication', 'division']) {
    const exercises = Array.from({ length: 150 }, (_, seed) => generateExercise({ topic, grade: 2, difficulty: 'medium' }, seeded(seed)));
    assert.ok(exercises.some(exercise => topic === 'addition' ? exercise.meta.a === 0 : exercise.meta.result === 0), `${topic} includes zero`);
    if (topic === 'division') assert.ok(exercises.every(exercise => exercise.meta.b > 0));
  }
});

test('written multiplication uses a three-digit factor and one-digit multiplier up to 1000', () => {
  const exercises = Array.from({ length: 400 }, (_, seed) => generateExercise({ topic: 'written', grade: 3, difficulty: 'hard' }, seeded(seed)));
  const multiplication = exercises.filter(exercise => exercise.meta.operation === '*');
  assert.ok(multiplication.length > 50);
  for (const exercise of multiplication) {
    const { a, b, result } = exercise.meta;
    assert.ok(a >= 100 && a <= 999);
    assert.ok(b >= 2 && b <= 9);
    assert.equal(a * b, result);
    assert.ok(result <= 1000);
    assert.ok(exercise.explanation.some(step => step.startsWith('Hunderter:')));
  }
});

test('written column explanations compute correct digits, including carries and borrowing across zeros', () => {
  let carryExamples = 0, zeroBorrowExamples = 0;
  for (let seed = 0; seed < 3000; seed += 1) {
    const exercise = generateExercise({ topic: 'written', grade: 3, difficulty: 'hard' }, seeded(seed));
    if (exercise.explanation.some(step => step.includes('Übertrag'))) carryExamples += 1;
    if (exercise.explanation.some(step => step.includes(', danach '))) zeroBorrowExamples += 1;
    for (const step of exercise.explanation) {
      const match = step.match(/^(Einer|Zehner|Hunderter|Tausender): (\d+) ([+·−]) (\d+)(?: \+ (\d+) Übertrag)? = (\d+)\. Schreibe (\d+)/);
      if (!match) continue;
      const [, place, first, operation, second, carry, subtotal, digit] = match;
      const a = Number(first), b = Number(second), c = Number(carry || 0);
      const computed = (operation === '+' ? a + b : operation === '·' ? a * b : a - b) + c;
      assert.equal(Number(subtotal), computed, step);
      assert.equal(Number(digit), computed % 10, step);
      const index = ['Einer', 'Zehner', 'Hunderter', 'Tausender'].indexOf(place);
      const resultDigit = Math.floor(Number(exercise.answer) / 10 ** index) % 10;
      assert.equal(Number(digit), resultDigit, `${exercise.display}: ${step}`);
    }
  }
  assert.ok(carryExamples > 300, 'Exercise sample contains many carry examples');
  assert.ok(zeroBorrowExamples > 10, 'Exercise sample includes borrowing through a zero');
});

test('weight conversions practice both directions and mixed units', () => {
  const medium = Array.from({ length: 250 }, (_, seed) => generateExercise({ topic: 'weights', grade: 3, difficulty: 'medium' }, seeded(seed)));
  assert.ok(medium.some(exercise => exercise.meta.kind === 'weightconvert' && exercise.meta.toGrams));
  assert.ok(medium.some(exercise => exercise.meta.kind === 'weightconvert' && !exercise.meta.toGrams));
  for (let seed = 0; seed < 100; seed += 1) {
    const exercise = generateExercise({ topic: 'weights', grade: 3, difficulty: 'hard' }, seeded(seed));
    assert.equal(exercise.meta.kind, 'weightmixed');
    assert.ok(Number(exercise.answer) <= 1000);
    verifyExercise(exercise, 3);
  }
});

test('random range boundaries are safe for every topic and grade', () => {
  for (const topic of TOPICS) for (const grade of topic.grades) for (const { id: difficulty } of DIFFICULTIES) {
    for (const value of [0, 0.00000001, 0.5, 0.9999999999999999]) {
      verifyExercise(generateExercise({ topic: topic.id, grade, difficulty }, () => value), grade);
    }
  }
});

test('difficulty changes arithmetic scale and task structure', () => {
  for (const grade of [2, 3]) {
    for (const topic of ['addition', 'subtraction']) {
      const mean = difficulty => Array.from({ length: 200 }, (_, i) => generateExercise({ topic, grade, difficulty }, seeded(i)).meta)
        .reduce((sum, m) => sum + Math.max(m.a, m.b, m.result), 0) / 200;
      assert.ok(mean('hard') > mean('easy') * 2, `${topic} grade ${grade} must scale up`);
    }
  }
  assert.equal(generateExercise({ topic: 'placevalue', grade: 3, difficulty: 'easy' }, seeded(4)).meta.kind, 'placevalue');
  assert.equal(generateExercise({ topic: 'placevalue', grade: 3, difficulty: 'medium' }, seeded(4)).meta.kind, 'buildnumber');
  assert.equal(generateExercise({ topic: 'placevalue', grade: 3, difficulty: 'hard' }, seeded(4)).meta.kind, 'neighbor');
  assert.equal(generateExercise({ topic: 'time', grade: 3, difficulty: 'hard' }, seeded(4)).meta.kind, 'duration');
});

test('normalization accepts exact decimal equivalents without evaluating input', () => {
  const decimal = { input: 'number', answer: '2,50' };
  for (const value of ['2,5', '2.5', ' 2,50 ', '002.500', '+2,5', 2.5]) assert.ok(checkAnswer(decimal, value), `${value} should match`);
  for (const value of ['2,51', '2,5000000000000001', '2e0', '0x2', '2+0.5', '2 5', '2,5 €', '', ' ', '.', 'Infinity', NaN, null, undefined, {}, []]) assert.ok(!checkAnswer(decimal, value), `${String(value)} should not match`);
  const thousand = { input: 'number', answer: '1000' };
  for (const value of ['1 000', '1\u00a0000', '1\u202f000', '1000.0', ' 1000 ']) assert.ok(checkAnswer(thousand, value));
  for (const value of ['10 00', '1.000', '1,000', '1,000.00', '1 0 0 0']) assert.ok(!checkAnswer(thousand, value));
  assert.ok(checkAnswer({ input: 'number', answer: '0' }, '-0,000'));
  assert.ok(!checkAnswer({ input: 'number', answer: '0' }, '-0,00001'));
  assert.ok(!checkAnswer({ input: 'number', answer: '9007199254740992' }, '9007199254740993'), 'Do not lose precision by coercing to Number');
  assert.ok(checkAnswer({ input: 'choice', answer: '4 Rest 2' }, ' 4  REST  2 '));
  assert.ok(!checkAnswer({ input: 'choice', answer: '4 Rest 2' }, '4 Rest 3'));
});

test('invalid options and invalid RNG output fail explicitly', () => {
  assert.throws(() => generateExercise({ topic: 'nope' }), RangeError);
  assert.throws(() => generateExercise({ grade: 1 }), RangeError);
  assert.throws(() => generateExercise({ topic: 'remainder', grade: 2 }), RangeError);
  assert.throws(() => generateExercise({ difficulty: 'impossible' }), RangeError);
  assert.throws(() => generateExercise({ table: 11 }), RangeError);
  assert.throws(() => generateExercise({ table: 1.5 }), RangeError);
  for (const value of [1, -0.1, NaN, Infinity]) assert.throws(() => generateExercise({}, () => value), RangeError);
});
