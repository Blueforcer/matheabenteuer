import test from 'node:test';
import assert from 'node:assert/strict';
import { TOPICS, DIFFICULTIES, generateExercise, checkAnswer } from '../js/engine.js';
import { discoveryAnswer } from './discovery-oracles.js';

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
  const discovery = discoveryAnswer(exercise);
  if (discovery !== undefined) return discovery;
  switch (m.kind) {
    case 'arithmetic': case 'word': case 'written': return compute(m);
    case 'arithmeticsplit': return m.operation === '*' ? m.first * m.b + m.second * m.b : m.first / m.b + m.second / m.b;
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
    case 'moneycalc': return (m.mode === 1 ? m.total : m.total - m.first) / m.scale;
    case 'clock': return `${m.hour}:${String(m.minute).padStart(2, '0')} Uhr`;
    case 'duration': return m.end - m.start;
    case 'durationhours': return (m.end - m.start) / 60;
    case 'clockshift': {
      const value = m.seekStart ? m.start : m.end;
      return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')} Uhr`;
    }
    case 'lengthconvert': return m.metres * 100 + m.centimetres;
    case 'lengthrest': return m.centimetres % 100;
    case 'lengthcompare': case 'capacitycompare': return m.a < m.b ? '<' : m.a > m.b ? '>' : '=';
    case 'lengthsum': return m.subtract ? m.a : m.a + m.b;
    case 'weightunit': {
      const gramObjects = ['eine Büroklammer', 'ein Apfel', 'ein Teebeutel', 'ein Brief', 'eine Tafel Schokolade', 'eine Erdbeere', 'ein Hühnerei', 'eine Scheibe Brot', 'ein Radiergummi', 'ein Bleistift', 'eine Münze', 'ein Tennisball'];
      const kiloObjects = ['ein Kind', 'ein Fahrrad', 'eine Katze', 'ein großer Hund', 'ein voller Schulranzen', 'ein Reisekoffer', 'eine Waschmaschine', 'ein Stuhl', 'ein Sack Kartoffeln', 'ein Kürbis', 'ein Baby', 'ein Pony'];
      assert.ok([...gramObjects, ...kiloObjects].includes(m.object), `Unknown weight example: ${m.object}`);
      return gramObjects.includes(m.object) ? 'g' : 'kg';
    }
    case 'weights': return m.total - m.part;
    case 'weightsum': return m.a + m.b;
    case 'weightcompare': return m.leftGrams < m.rightGrams ? '<' : m.leftGrams > m.rightGrams ? '>' : '=';
    case 'weightconvert': return m.toGrams ? m.grams : m.grams / 1000;
    case 'weightmixed': return m.firstGrams + m.addedGrams;
    case 'capacityunit': return m.small ? 'Milliliter (ml)' : 'Liter (l)';
    case 'capacitydivision': return m.total / m.glass;
    case 'capacitysum': return m.a + m.b;
    case 'capacitydifference': return m.total - m.part;
    case 'capacityconvert': return m.toMl ? m.millilitres : m.millilitres / 1000;
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
    case 'wordsteps': return ({
      'multiply-add': m.a * m.b + m.d,
      'add-subtract': m.a + m.b - m.d,
      'add-divide': (m.a + m.b) / m.d,
      'subtract-divide': (m.a - m.b) / m.d,
    })[m.form];
    case 'order': return m.brackets ? (m.a + m.b) * m.d : m.a + m.b * m.d;
    case 'parity': return m.number % 2 === 0 ? 'Gerade' : 'Ungerade';
    case 'digitsum': return String(m.number).split('').reduce((total, digit) => total + Number(digit), 0);
    case 'divisibility': return m.number % m.divisor === 0 ? 'Ja' : 'Nein';
    case 'weekday': return ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'][((m.day + m.offset) % 7 + 7) % 7];
    case 'monthdays': return new Date(Date.UTC(m.year, m.month + 1, 0)).getUTCDate();
    case 'monthremaining': return new Date(Date.UTC(m.year, m.month + 1, 0)).getUTCDate() - m.date;
    case 'monthshift': return ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'][(m.month + m.offset + 12) % 12];
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
  const hardKinds = new Set();
  for (let seed = 0; seed < 300; seed += 1) {
    const exercise = generateExercise({ topic: 'weights', grade: 3, difficulty: 'hard' }, seeded(seed));
    hardKinds.add(exercise.meta.kind);
    if (exercise.input === 'number') assert.ok(Number(exercise.answer.replace(',', '.')) <= 1000);
    verifyExercise(exercise, 3);
  }
  for (const kind of ['weightmixed', 'weightconvert', 'weights', 'weightcompare']) assert.ok(hardKinds.has(kind), `Missing weight task: ${kind}`);
});

test('every everyday topic offers over 100 different mathematical tasks at every level', () => {
  for (const topic of ['money', 'time', 'lengths', 'weights', 'capacity', 'wordproblems', 'calendar']) {
    for (const grade of [2, 3]) for (const { id: difficulty } of DIFFICULTIES) {
      const content = new Set();
      for (let seed = 0; seed < 2000; seed += 1) {
        const exercise = generateExercise({ topic, grade, difficulty }, seeded(seed));
        // IDs, names, shuffled answers and incidental years cannot inflate this count.
        // The metadata describes the quantities and mathematical question being asked.
        const { year: _year, ...mathematicalTask } = exercise.meta;
        content.add(JSON.stringify(mathematicalTask));
        verifyExercise(exercise, grade);
      }
      assert.ok(content.size >= 100, `${topic}/${grade}/${difficulty} has only ${content.size} distinct mathematical tasks`);
    }
  }
});

test('easy weights mix many familiar objects with calculation and comparison within the number range', () => {
  const objects = new Set(), kinds = new Set(), calculations = new Set();
  for (let seed = 0; seed < 3000; seed += 1) {
    const exercise = generateExercise({ topic: 'weights', grade: 2, difficulty: 'easy' }, seeded(seed));
    const m = exercise.meta;
    kinds.add(m.kind);
    if (m.kind === 'weightunit') objects.add(m.object);
    else {
      calculations.add(JSON.stringify(m));
      for (const value of Object.values(m).filter(value => typeof value === 'number')) assert.ok(value >= 0 && value <= 20);
    }
  }
  assert.equal(objects.size, 24);
  for (const kind of ['weightunit', 'weightsum', 'weights', 'weightcompare']) assert.ok(kinds.has(kind));
  assert.ok(calculations.size >= 300, `Expected hundreds of quantitative weight tasks, got ${calculations.size}`);
});

test('hard stories practice all five different two-step operations', () => {
  for (const grade of [2, 3]) {
    const forms = new Set();
    for (let seed = 0; seed < 500; seed += 1) {
      const exercise = generateExercise({ topic: 'wordproblems', grade, difficulty: 'hard' }, seeded(seed));
      forms.add(exercise.meta.kind === 'wordmulti' ? 'multiply-subtract' : exercise.meta.form);
      assert.ok(Number(exercise.answer) <= (grade === 2 ? 100 : 1000));
    }
    assert.deepEqual([...forms].sort(), ['add-divide', 'add-subtract', 'multiply-add', 'multiply-subtract', 'subtract-divide']);
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
  const timeKinds = new Set(Array.from({ length: 100 }, (_, seed) => generateExercise({ topic: 'time', grade: 3, difficulty: 'hard' }, seeded(seed)).meta.kind));
  assert.ok(timeKinds.has('duration') && timeKinds.has('clockshift'));
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
