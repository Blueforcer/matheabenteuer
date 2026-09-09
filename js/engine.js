/** Procedural exercises. All random choices use the supplied RNG for reproducible practice. */
import { shapeInventory, mirrorTask, fractionQuantity, bagChance, branchingChoices, areaPieces, borderTask, chartQuestions, gridJourney } from './discovery.js';
export const DIFFICULTIES = [
  { id: 'easy', title: 'Entdecken', description: 'Kleine Schritte und übersichtliche Zahlen' },
  { id: 'medium', title: 'Üben', description: 'Mehr Zahlen und etwas mehr Denkarbeit' },
  { id: 'hard', title: 'Knobeln', description: 'Größere Zahlen und mehrere Schritte' },
];

export const TOPICS = [
  ['addition', 'Plusrechnen', '+', 'Zusammenzählen, Zehnerübergang und Rechenwege', 'Rechnen', 'coral'],
  ['subtraction', 'Minusrechnen', '−', 'Wegnehmen, ergänzen und geschickt zerlegen', 'Rechnen', 'peach'],
  ['multiplication', 'Malrechnen', '×', 'Das kleine Einmaleins und größere Malaufgaben', 'Rechnen', 'purple'],
  ['division', 'Geteiltrechnen', '÷', 'Gerecht verteilen und die Umkehraufgabe nutzen', 'Rechnen', 'blue'],
  ['remainder', 'Teilen mit Rest', '↗', 'Gleich große Gruppen bilden: Was bleibt übrig?', 'Rechnen', 'blue', [3]],
  ['missing', 'Lückendetektive', '□', 'Die fehlende Zahl in einer Rechnung finden', 'Rechnen', 'yellow'],
  ['operators', 'Zeichen gesucht', '±', 'Das passende Rechenzeichen einsetzen', 'Rechnen', 'pink'],
  ['sequences', 'Zahlen hüpfen', '↝', 'Zahlenfolgen und Einmaleins am Zahlenstrahl', 'Zahlen', 'green'],
  ['placevalue', 'Zahlen bauen', '123', 'Einer, Zehner, Hunderter und Nachbarzahlen', 'Zahlen', 'blue'],
  ['comparison', 'Zahlen vergleichen', '≷', 'Größer, kleiner oder gleich?', 'Zahlen', 'purple'],
  ['rounding', 'Zahlen runden', '≈', 'Nachbarzehner, Nachbarhunderter und Runden', 'Zahlen', 'peach'],
  ['double', 'Doppelt & halb', '½', 'Verdoppeln und gerecht in zwei Teile teilen', 'Zahlen', 'green'],
  ['written', 'Schriftlich rechnen', '≡', 'Stellen untereinander schreiben und Überträge verstehen', 'Rechnen', 'blue', [3]],
  ['order', 'Rechenreihenfolge', '( )', 'Klammern und Punktrechnung vor Strichrechnung', 'Rechnen', 'purple', [3]],
  ['divisibility', 'Zahlendetektive', '#', 'Quersummen und Teilbarkeit durch 2, 5 und 10', 'Zahlen', 'yellow', [3]],
  ['money', 'Einkaufen', '€', 'Euro, Cent und das passende Rückgeld', 'Alltag', 'yellow'],
  ['time', 'Uhr & Zeit', '◷', 'Uhrzeiten lesen und Zeitspannen ausrechnen', 'Alltag', 'blue'],
  ['calendar', 'Im Kalender', '▣', 'Wochentage, Monate und Zeitspannen entdecken', 'Alltag', 'pink'],
  ['lengths', 'Längen messen', '↔', 'Mit Zentimetern und Metern rechnen', 'Alltag', 'green'],
  ['weights', 'Wie schwer?', '⚖', 'Gramm und Kilogramm entdecken', 'Alltag', 'peach'],
  ['capacity', 'Wie viel passt rein?', '◡', 'Liter, Milliliter und Gefäße vergleichen', 'Alltag', 'blue'],
  ['shapes', 'Formen & Körper', '◇', 'Flache Formen und räumliche Körper erkennen', 'Entdecken', 'purple'],
  ['symmetry', 'Spiegelbilder', '⋈', 'Spiegelachsen in regelmäßigen Formen finden', 'Entdecken', 'pink'],
  ['perimeter', 'Rand & Fläche', '▦', 'Umfang messen und Kästchenflächen zählen', 'Entdecken', 'green'],
  ['area', 'Flächen auslegen', '▤', 'Flächen mit gleich großen Kästchen vergleichen', 'Entdecken', 'green'],
  ['spatial', 'Wo ist was?', '⌖', 'Lagebeziehungen in einem kleinen Raster beschreiben', 'Entdecken', 'purple'],
  ['fractions', 'Gerecht teilen', '¼', 'Hälften, Drittel und Viertel kennenlernen', 'Entdecken', 'yellow', [3]],
  ['charts', 'Daten entdecken', '▥', 'Tabellen und kleine Diagramme lesen', 'Entdecken', 'blue'],
  ['chance', 'Zufall & Möglichkeiten', '?', 'Sicher, möglich oder unmöglich? Kombinationen zählen', 'Entdecken', 'pink'],
  ['combinations', 'Alle Möglichkeiten', '⋮', 'Kombinationen systematisch sammeln und zählen', 'Entdecken', 'peach'],
  ['wordproblems', 'Mathegeschichten', '✦', 'Rechnen im Alltag – auch in mehreren Schritten', 'Alltag', 'coral'],
].map(([id, title, icon, description, category, color, grades = [2, 3]]) =>
  ({ id, title, icon, description, category, color, grades }));

const SYMBOLS = { '+': '+', '-': '−', '*': '·', '/': ':' };
const PLACES = ['Einer', 'Zehner', 'Hunderter'];
const TABLES = [[2, 5, 10], [2, 3, 4, 5, 6, 10], [2, 3, 4, 5, 6, 7, 8, 9, 10]];
const formatNumber = value => String(value).replace('.', ',');
const euro = cents => `${(cents / 100).toFixed(2).replace('.', ',')} €`;

function context(options, rng) {
  const { topic = 'addition', grade = 2, difficulty = 'medium', table = 0 } = options;
  const selected = TOPICS.find(item => item.id === topic);
  if (!selected) throw new RangeError(`Unbekanntes Thema: ${topic}`);
  if (![2, 3].includes(grade) || !selected.grades.includes(grade)) throw new RangeError('Dieses Thema gibt es in dieser Klassenstufe nicht.');
  const level = DIFFICULTIES.findIndex(item => item.id === difficulty);
  if (level < 0) throw new RangeError(`Unbekannte Schwierigkeit: ${difficulty}`);
  if (!Number.isInteger(table) || table < 0 || table > 10) throw new RangeError('Die Reihe muss zwischen 0 und 10 liegen.');
  const random = () => {
    const value = rng();
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw new RangeError('Der Zufallsgenerator muss Werte von 0 bis kleiner als 1 liefern.');
    return value;
  };
  const int = (min, max) => Math.floor(random() * (max - min + 1)) + min;
  const pick = items => items[int(0, items.length - 1)];
  const shuffle = items => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = int(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  return { topic, grade, difficulty, table, level, int, pick, shuffle,
    limit: grade === 2 ? [20, 100, 100][level] : [100, 1000, 1000][level],
    id: `${topic}-${grade}-${difficulty}-${int(0, 0x7fffffff).toString(36)}` };
}

function arithmetic(c, operation) {
  const { int, pick, level, grade, table, limit } = c;
  let a, b, result;
  if (operation === '+' || operation === '-') {
    if (grade === 3 && level === 1) {
      result = int(12, 99) * 10;
      b = int(1, Math.floor(result / 10) - 1) * 10;
    } else {
      result = int(level === 2 ? Math.floor(limit * 0.55) : 3, limit);
      b = int(level === 2 ? 11 : 1, result - 1);
    }
    a = result - b;
    if (operation === '-') [a, result] = [result, a];
  } else {
    b = table || pick(TABLES[level]);
    // A selected row needs its complete set of facts, also during first practice.
    a = int(level === 0 ? 1 : grade === 3 && level === 2 ? 11 : 2,
      grade === 3 && level === 2 ? 30 : 10);
    result = a * b;
    if (operation === '/') [a, result] = [result, a];
  }
  return { a, b, result, operation };
}

function explainArithmetic({ a, b, result, operation }) {
  if (operation === '+') {
    if (b < 10) {
      const toTen = (10 - (a % 10)) % 10;
      if (toTen > 0 && b > toTen) return [
        `Ergänze zuerst bis zum nächsten Zehner: ${a} + ${toTen} = ${a + toTen}.`,
        `Von ${b} bleiben ${b - toTen} übrig. ${a + toTen} + ${b - toTen} = ${result}.`,
      ];
      return [`Beginne bei ${a} und zähle ${b} weiter.`, `${a} + ${b} = ${result}.`];
    }
    const pieces = [Math.floor(b / 100) * 100, Math.floor((b % 100) / 10) * 10, b % 10].filter(Boolean);
    let running = a;
    return [`Zerlege ${b} in ${pieces.join(' + ')}.`, ...pieces.map(piece => {
      const previous = running;
      running += piece;
      return `${previous} + ${piece} = ${running}.`;
    })];
  }
  if (operation === '-') {
    const pieces = [Math.floor(b / 100) * 100, Math.floor((b % 100) / 10) * 10, b % 10].filter(Boolean);
    let running = a;
    return [`Nimm ${b} in kleinen Schritten weg${pieces.length > 1 ? `: ${pieces.join(' und ')}` : ''}.`, ...pieces.map(piece => {
      const previous = running;
      running -= piece;
      return `${previous} − ${piece} = ${running}.`;
    }), `Probe: ${result} + ${b} = ${a}.`];
  }
  if (operation === '*') {
    if (a > 10) {
      const tens = Math.floor(a / 10) * 10;
      const ones = a % 10;
      return [`Zerlege ${a}: ${tens} + ${ones}.`, `${tens} · ${b} = ${tens * b} und ${ones} · ${b} = ${ones * b}.`,
        `Fasse zusammen: ${tens * b} + ${ones * b} = ${result}.`];
    }
    return [`${a} · ${b} bedeutet: ${a} Gruppen mit je ${b}.`, `Zähle in ${b}er-Schritten ${a} Schritte weiter: ${result}.`];
  }
  return [`Frage dich: Welche Zahl mal ${b} ergibt ${a}?`, `${result} · ${b} = ${a}. Also ist ${a} : ${b} = ${result}.`];
}

function arithmeticExercise(c, operation) {
  const calc = arithmetic(c, operation);
  if (c.int(0, 11) === 0) {
    // Zero is part of the number range, including 0 : n. The divisor stays nonzero.
    if (operation === '*' || operation === '/') {
      calc.a = 0;
      calc.result = 0;
    } else if (operation === '+') {
      calc.a = 0;
      calc.result = calc.b;
    } else {
      calc.b = calc.a;
      calc.result = 0;
    }
  }
  if (operation === '*' || operation === '/') {
    const mode = c.int(0, 3);
    if (mode === 1) return {
      prompt: operation === '*' ? 'Wie viele Gruppen ergeben diese Gesamtzahl?' : 'Welche Zahl wurde gleichmäßig verteilt?',
      display: `□ ${SYMBOLS[operation]} ${calc.b} = ${calc.result}`, answer: String(calc.a),
      hint: operation === '*' ? `Teile ${calc.result} durch ${calc.b}.` : `Rechne ${calc.result} mal ${calc.b}.`,
      explanation: [operation === '*' ? `${calc.result} : ${calc.b} = ${calc.a}.` : `${calc.result} · ${calc.b} = ${calc.a}.`,
        `Probe: ${calc.a} ${SYMBOLS[operation]} ${calc.b} = ${calc.result}.`],
      meta: { kind: 'missing', ...calc, blank: 'a' },
    };
    const groups = operation === '*' ? calc.a : calc.result;
    if (mode >= 2 && groups >= 2) {
      const firstGroups = c.int(1, groups - 1), secondGroups = groups - firstGroups;
      const first = operation === '*' ? firstGroups : firstGroups * calc.b;
      const second = operation === '*' ? secondGroups : secondGroups * calc.b;
      return {
        prompt: operation === '*' ? 'Zwei Stapel mit gleich großen Gruppen: Wie viel ist es zusammen?' : 'Verteile beide Mengen gleichmäßig. Wie viel bekommt jede Gruppe insgesamt?',
        display: `${first} ${SYMBOLS[operation]} ${calc.b} + ${second} ${SYMBOLS[operation]} ${calc.b} = ?`,
        answer: String(calc.result), hint: 'Rechne zuerst die beiden Mal- oder Geteiltaufgaben. Addiere dann die Ergebnisse.',
        explanation: operation === '*' ? [`${first} · ${calc.b} = ${first * calc.b} und ${second} · ${calc.b} = ${second * calc.b}.`,
          `${first * calc.b} + ${second * calc.b} = ${calc.result}.`]
          : [`${first} : ${calc.b} = ${firstGroups} und ${second} : ${calc.b} = ${secondGroups}.`,
            `${firstGroups} + ${secondGroups} = ${calc.result}.`],
        meta: { kind: 'arithmeticsplit', ...calc, first, second },
      };
    }
  }
  return {
    prompt: ({ '+': 'Zähle zusammen.', '-': 'Rechne aus, was übrig bleibt.', '*': 'Wie viel ist das zusammen?', '/': 'Teile in gleich große Gruppen.' })[operation],
    display: `${calc.a} ${SYMBOLS[operation]} ${calc.b} = ?`, answer: String(calc.result),
    hint: operation === '/' ? `Denke an die Umkehraufgabe: ? · ${calc.b} = ${calc.a}.` : operation === '*' ? `Nutze die ${calc.b}er-Reihe. Du kannst die Aufgabe auch zerlegen.` : 'Zerlege die zweite Zahl in Hunderter, Zehner und Einer. Rechne Schritt für Schritt.',
    explanation: explainArithmetic(calc),
    ...(c.level === 0 && (operation === '*' || operation === '/') && calc.a > 0 && calc.a <= 50
      ? { visual: { type: 'groups', groups: operation === '*' ? calc.a : calc.result, itemsPerGroup: calc.b, label: 'Gleich große Gruppen' } } : {}),
    meta: { kind: 'arithmetic', ...calc, limit: c.limit },
  };
}

function remainder(c) {
  const divisor = c.table > 1 ? c.table : c.pick(c.level === 0 ? [2, 3, 5] : [3, 4, 6, 7, 8, 9, 10]);
  const quotient = c.int(c.level === 2 ? 11 : 1,
    Math.min([30, 50, 80][c.level], Math.floor((c.limit - divisor + 1) / divisor)));
  const rest = c.int(1, divisor - 1);
  const dividend = quotient * divisor + rest;
  const answer = `${quotient} Rest ${rest}`;
  return { prompt: 'Wie oft passt die Zahl hinein? Was bleibt übrig?', display: `${dividend} : ${divisor} = ?`,
    input: 'choice', answer, choices: c.shuffle([answer, `${quotient + 1} Rest ${rest}`, `${quotient} Rest ${rest - 1}`, `${quotient - 1} Rest ${rest}`]),
    hint: `Suche das größte Ergebnis der ${divisor}er-Reihe, das nicht größer als ${dividend} ist.`,
    explanation: [`${quotient} · ${divisor} = ${quotient * divisor}.`, `${dividend} − ${quotient * divisor} = ${rest}.`,
      `Der Rest ${rest} ist kleiner als ${divisor}. Deshalb lautet die Lösung: ${answer}.`],
    meta: { kind: 'remainder', dividend, divisor, quotient, rest } };
}

function missing(c) {
  const operation = c.pick(c.table ? ['*', '/'] : c.level === 0 ? ['+', '-'] : ['+', '-', '*', '/']);
  const calc = arithmetic(c, operation);
  const blank = c.pick(['a', 'b']);
  const display = `${blank === 'a' ? '□' : calc.a} ${SYMBOLS[operation]} ${blank === 'b' ? '□' : calc.b} = ${calc.result}`;
  const inverse = operation === '+' ? `${calc.result} − ${blank === 'a' ? calc.b : calc.a} = ${calc[blank]}`
    : operation === '-' ? blank === 'a' ? `${calc.result} + ${calc.b} = ${calc.a}` : `${calc.a} − ${calc.result} = ${calc.b}`
      : operation === '*' ? `${calc.result} : ${blank === 'a' ? calc.b : calc.a} = ${calc[blank]}`
        : blank === 'a' ? `${calc.result} · ${calc.b} = ${calc.a}` : `${calc.a} : ${calc.result} = ${calc.b}`;
  return { prompt: 'Welche Zahl versteckt sich im Kästchen?', display, answer: String(calc[blank]),
    hint: 'Nutze die Umkehraufgabe: Plus und Minus gehören zusammen, Mal und Geteilt auch.',
    explanation: [`Rechne rückwärts: ${inverse}.`, `Setze die Zahl zur Probe ein: ${calc.a} ${SYMBOLS[operation]} ${calc.b} = ${calc.result}.`],
    meta: { kind: 'missing', ...calc, blank } };
}

function operators(c) {
  const operation = c.pick(c.level === 0 || c.table === 1 ? ['+', '-'] : ['+', '-', '*', '/']);
  let calc = arithmetic(c, operation);
  if (c.table && (operation === '+' || operation === '-')) {
    const range = Math.max(c.limit, c.table * 10);
    const a = c.int(operation === '+' ? 1 : c.table, operation === '+' ? range - c.table : range);
    calc = { a, b: c.table, result: operation === '+' ? a + c.table : a - c.table, operation };
  }
  // The chosen equation must have exactly one matching operation (e.g. 2 + 2 = 2 · 2 is ambiguous).
  const matches = ({ a, b, result }) => [a + b, a - b, a * b, a / b].filter(value => value === result).length;
  if (matches(calc) !== 1) {
    const b = c.table || 3;
    calc = operation === '+' ? { a: 3, b, result: 3 + b, operation }
      : operation === '-' ? { a: b + 3, b, result: 3, operation }
        : operation === '*' ? { a: 3, b, result: 3 * b, operation } : { a: 3 * b, b, result: 3, operation };
  }
  return { prompt: 'Welches Rechenzeichen macht die Rechnung richtig?', display: `${calc.a} □ ${calc.b} = ${calc.result}`,
    input: 'choice', choices: ['+', '−', '·', ':'], answer: SYMBOLS[operation],
    hint: 'Probiere die Zeichen aus. Wird die Zahl größer oder kleiner? Prüfe dein Ergebnis genau.',
    explanation: [`Mit ${SYMBOLS[operation]} stimmt die Rechnung: ${calc.a} ${SYMBOLS[operation]} ${calc.b} = ${calc.result}.`, ...explainArithmetic(calc)],
    meta: { kind: 'operators', ...calc } };
}

function sequences(c) {
  const step = c.table || c.pick(c.level === 0 ? [2, 5, 10] : c.level === 1 ? [3, 4, 6, 9, 10] : c.grade === 3 ? [7, 8, 9, 20, 25, 50] : [3, 6, 7, 8, 9]);
  const count = c.int(c.level === 0 ? 3 : 4, c.level === 0 ? 5 : 6);
  const range = Math.min(c.grade === 2 ? 100 : 1000, Math.max(c.limit, 10 * step));
  const maxStart = range - step * (count - 1);
  const start = c.table ? c.int(0, Math.floor(maxStart / step)) * step : c.int(0, maxStart);
  const descending = c.int(0, 1) === 1;
  const values = Array.from({ length: count }, (_, i) => start + step * (descending ? count - 1 - i : i));
  const blank = c.int(1, count - 1);
  return { prompt: 'Finde die Regel. Welche Zahl fehlt?', display: values.map((value, i) => i === blank ? '□' : value).join(' → '),
    answer: String(values[blank]), hint: `Vergleiche zwei benachbarte Zahlen. Die Sprünge sind immer gleich ${descending ? 'zurück' : 'vorwärts'}.`,
    explanation: [`Die Regel lautet: immer ${descending ? 'minus' : 'plus'} ${step}.`,
      `${values[blank - 1]} ${descending ? '−' : '+'} ${step} = ${values[blank]}.`],
    ...(descending ? {} : { visual: { type: 'numberline', start, end: values[count - 1], step, jumps: count - 1, hidden: [values[blank]] } }),
    meta: { kind: 'sequence', values, blank, step, descending } };
}

function placevalue(c) {
  // Reading a single digit stays accessible across all two-digit numbers.
  const max = c.grade === 2 ? 99 : (c.level === 0 ? 99 : 999);
  const number = c.int(c.level === 2 ? Math.floor(max / 2) : c.level === 0 ? 0 : 10, max);
  if (c.level === 0) {
    const place = number < 10 ? 0 : c.pick([0, 1]);
    const answer = Math.floor(number / 10 ** place) % 10;
    return { prompt: `Welche Ziffer steht an der ${PLACES[place]}stelle?`, display: String(number), answer: String(answer),
      hint: 'Lies von rechts: Einer, Zehner, Hunderter.',
      explanation: [`${number} besteht aus ${Math.floor(number / 10)} Zehnern und ${number % 10} Einern.`, `An der ${PLACES[place]}stelle steht ${answer}.`],
      meta: { kind: 'placevalue', number, place, answer } };
  }
  if (c.level === 1) {
    const hundreds = Math.floor(number / 100), tens = Math.floor((number % 100) / 10), ones = number % 10;
    return { prompt: 'Baue die Zahl aus ihren Stellenwerten.', display: `${c.grade === 3 ? `${hundreds} H + ` : ''}${tens} Z + ${ones} E`, answer: String(number),
      hint: 'H steht für Hunderter, Z für Zehner und E für Einer.',
      explanation: [`${c.grade === 3 ? `${hundreds} H = ${hundreds * 100}, ` : ''}${tens} Z = ${tens * 10}, ${ones} E = ${ones}.`,
        `${c.grade === 3 ? `${hundreds * 100} + ` : ''}${tens * 10} + ${ones} = ${number}.`],
      meta: { kind: 'buildnumber', number, hundreds, tens, ones } };
  }
  const offset = c.pick(c.grade === 3 ? [-100, -10, -1, 1, 10, 100] : [-10, -1, 1]);
  const base = Math.min(Math.max(number, -offset), (c.grade === 3 ? 1000 : 100) - Math.max(0, offset));
  return { prompt: `Welche Zahl ist um ${Math.abs(offset)} ${offset > 0 ? 'größer' : 'kleiner'}?`, display: String(base), answer: String(base + offset),
    hint: `Verändere ${Math.abs(offset) === 100 ? 'die Hunderter' : Math.abs(offset) === 10 ? 'die Zehner' : 'die Einer'}. Achte auf einen Übergang.`,
    explanation: [`${base} ${offset > 0 ? '+' : '−'} ${Math.abs(offset)} = ${base + offset}.`],
    meta: { kind: 'neighbor', base, offset } };
}

function comparison(c) {
  let left = c.int(1, c.limit), right = c.int(1, c.limit), leftDisplay = String(left), rightDisplay = String(right);
  if (c.int(0, 5) === 0) right = left;
  rightDisplay = String(right);
  if (c.level === 2) {
    const a = c.int(0, left), b = c.int(0, right);
    leftDisplay = `${a} + ${left - a}`;
    rightDisplay = `${b} + ${right - b}`;
  }
  const answer = left > right ? '>' : left < right ? '<' : '=';
  return { prompt: 'Welches Vergleichszeichen passt?', display: `${leftDisplay} □ ${rightDisplay}`, input: 'choice', choices: ['<', '=', '>'], answer,
    hint: 'Die offene Seite des Zeichens zeigt zur größeren Zahl. Rechne zuerst aus, falls du Plusaufgaben siehst.',
    explanation: [`Links steht ${left}, rechts steht ${right}.`, `${left} ist ${left > right ? 'größer als' : left < right ? 'kleiner als' : 'genauso groß wie'} ${right}. Also: ${left} ${answer} ${right}.`],
    meta: { kind: 'comparison', left, right } };
}

function rounding(c) {
  const base = c.grade === 3 && c.level === 2 ? 100 : 10;
  const number = c.int(1, c.grade === 2 ? 99 : c.level === 0 ? 99 : 999);
  const lower = Math.floor(number / base) * base, upper = lower + base;
  if (c.grade === 2 && c.level === 0) return { prompt: 'Wie heißt der nächste größere Zehner?', display: String(number), answer: String(upper),
    hint: 'Gehe vorwärts bis zum nächsten neuen Zehner. Auch nach einer glatten Zehnerzahl kommt ein weiterer Zehner.',
    explanation: [`Die Zehner in der Nähe sind ${lower} und ${upper}.`, `Der nächste größere Zehner nach ${number} ist ${upper}.`],
    meta: { kind: 'nextten', number, answer: upper } };
  const answer = Math.floor((number + base / 2) / base) * base;
  return { prompt: `Runde auf den nächsten ${base === 10 ? 'Zehner' : 'Hunderter'}.`, display: String(number), answer: String(answer),
    hint: `Schau auf die ${base === 10 ? 'Einer' : 'Zehner'}: 0 bis 4 abrunden, 5 bis 9 aufrunden.`,
    explanation: [`${number} liegt zwischen ${lower} und ${upper}.`,
      number % base === 0 ? `${number} ist bereits ein voller ${base === 10 ? 'Zehner' : 'Hunderter'} und bleibt unverändert.`
        : `Ab ${lower + base / 2} wird aufgerundet. ${number} wird deshalb zu ${answer}.`],
    meta: { kind: 'rounding', number, base } };
}

function double(c) {
  const split = c.int(0, 1) === 1;
  const half = c.int(split ? 2 : 1, Math.floor(c.limit / 2));
  const isDouble = c.int(0, 1) === 0;
  const number = isDouble ? half : half * 2, answer = isDouble ? half * 2 : half;
  if (split) {
    const firstHalf = c.int(1, half - 1);
    const first = isDouble ? firstHalf : firstHalf * 2, second = number - first;
    return { prompt: isDouble ? 'Zähle beide Mengen zusammen und verdopple das Ergebnis.' : 'Zähle beide Mengen zusammen und halbiere das Ergebnis.',
      display: `${first} + ${second}`, answer: String(answer),
      hint: 'Bestimme zuerst die Summe. Verdoppeln heißt mal zwei, halbieren heißt geteilt durch zwei.',
      explanation: [`${first} + ${second} = ${number}.`, isDouble ? `${number} + ${number} = ${answer}.` : `${number} : 2 = ${answer}.`],
      meta: { kind: 'double', number, isDouble, first, second } };
  }
  return { prompt: isDouble ? 'Verdopple die Zahl.' : 'Halbiere die Zahl.', display: String(number), answer: String(answer),
    hint: isDouble ? 'Verdoppeln heißt: dieselbe Zahl noch einmal dazuzählen.' : 'Halbieren heißt: in zwei gleich große Teile aufteilen.',
    explanation: [isDouble ? `${number} + ${number} = ${answer}.` : `${answer} + ${answer} = ${number}. Deshalb ist die Hälfte ${answer}.`],
    meta: { kind: 'double', number, isDouble } };
}

function money(c) {
  const mode = c.int(0, 3);
  if (c.level === 0 && mode === 0) {
    let remaining = c.limit;
    const coins = Array.from({ length: c.int(2, c.grade === 2 ? 4 : 6) }, (_, index) => {
      const coin = c.pick([1, 2, 5, 10, 20].filter(value => value <= remaining - (5 - index)));
      remaining -= coin;
      return coin;
    });
    const total = coins.reduce((sum, coin) => sum + coin, 0);
    return { prompt: 'Zähle die Cent-Münzen zusammen.', display: coins.map(coin => `${coin} ct`).join(' + '), answer: String(total), unit: 'ct',
      hint: 'Beginne mit den großen Münzen. Gleiche Münzen kannst du zusammenfassen.',
      explanation: [`${coins.join(' + ')} = ${total}. Zusammen sind das ${total} Cent.`], meta: { kind: 'coins', coins } };
  }
  if (mode > 0 || c.level === 0) {
    const scale = c.grade === 3 && c.level > 0 ? 100 : 1;
    const unit = c.level === 0 ? 'ct' : '€';
    const step = scale === 100 ? (c.level === 1 ? 10 : 5) : 1;
    const max = Math.floor(c.limit / step);
    const total = c.int(3, max) * step;
    const first = c.int(1, total / step - 1) * step;
    const second = total - first;
    const price = value => scale === 100 ? euro(value) : `${value} ${unit}`;
    const answer = mode === 1 ? total : second;
    const prompt = mode === 1 ? 'Ein Heft und ein Stift kosten zusammen wie viel?'
      : mode === 2 ? 'Du kaufst ein Heft. Wie viel Geld bleibt in deinem Geldbeutel?'
        : 'Du kaufst ein Heft und einen Stift. Wie viel kostet der Stift?';
    const display = mode === 1 ? `Heft: ${price(first)} · Stift: ${price(second)}`
      : mode === 2 ? `Im Geldbeutel: ${price(total)} · Heft: ${price(first)}`
        : `Zusammen: ${price(total)} · Heft: ${price(first)} · Stift: ?`;
    return { prompt, display, answer: formatNumber(answer / scale), unit,
      hint: mode === 1 ? 'Addiere die beiden Preise.' : 'Ziehe den bekannten Preis vom Gesamtbetrag ab.',
      explanation: [mode === 1 ? `${price(first)} + ${price(second)} = ${price(total)}.` : `${price(total)} − ${price(first)} = ${price(second)}.`],
      meta: { kind: 'moneycalc', total, first, mode, scale } };
  }
  if (c.grade === 2) {
    const paid = c.pick(c.level === 1 ? [10, 20] : [20, 50, 100]);
    const price = c.int(1, paid - 1);
    return { prompt: `Du bezahlst mit ${paid} €. Wie viel Rückgeld bekommst du?`, display: `Preis: ${price} €`, answer: String(paid - price), unit: '€',
      hint: `Ergänze vom Preis bis ${paid} oder rechne bezahlt minus Preis.`,
      explanation: [`${paid} € − ${price} € = ${paid - price} €.`, `Probe: Preis ${price} € + Rückgeld ${paid - price} € = ${paid} €.`],
      meta: { kind: 'change', paid, price, scale: 1 } };
  }
  const paid = c.pick([200, 500, 1000]);
  const price = c.int(1, paid / (c.level === 1 ? 10 : 5) - 1) * (c.level === 1 ? 10 : 5);
  return { prompt: `Du bezahlst mit ${euro(paid)}. Wie viel Euro bekommst du zurück?`, display: `Preis: ${euro(price)}`, answer: formatNumber((paid - price) / 100), unit: '€',
    hint: 'Rechne zuerst alles in Cent. 100 Cent sind 1 Euro. Ein Komma trennt Euro und Cent.',
    explanation: [`${paid} ct − ${price} ct = ${paid - price} ct.`, `${paid - price} Cent sind ${euro(paid - price)}.`],
    meta: { kind: 'change', paid, price, scale: 100 } };
}

function time(c) {
  const mode = c.int(0, 3);
  const asTime = mins => `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')}`;
  if (c.level < 2 && mode === 0) {
    const hour = c.int(1, 12), minute = c.pick(c.level === 0 ? [0, 30] : c.grade === 2 ? [0, 15, 30, 45] : [5, 10, 15, 20, 25, 35, 40, 45, 50, 55]);
    const text = `${hour}:${String(minute).padStart(2, '0')} Uhr`;
    const choices = new Set([text, `${hour}:${String((minute + 15) % 60).padStart(2, '0')} Uhr`,
      `${hour % 12 + 1}:${String(minute).padStart(2, '0')} Uhr`, `${(hour + 10) % 12 + 1}:${String((minute + 30) % 60).padStart(2, '0')} Uhr`]);
    return { prompt: 'Welche Uhrzeit zeigt die Uhr?', display: 'Schau auf beide Zeiger.', answer: text, input: 'choice', choices: c.shuffle([...choices]),
      visual: { type: 'clock', hour, minute },
      hint: 'Der kurze Zeiger zeigt die Stunden. Der lange zeigt die Minuten: von Zahl zu Zahl sind es 5 Minuten.',
      explanation: [`Der lange Zeiger zeigt ${minute} Minuten nach der vollen Stunde.`,
        `Der kurze Zeiger ${minute === 0 ? `steht auf der ${hour}` : `ist zwischen ${hour} und ${hour % 12 + 1}`}. Es ist ${text}.`],
      meta: { kind: 'clock', hour, minute } };
  }
  if (c.level === 0 && mode === 1) {
    const start = c.int(1, 18) * 60;
    const hours = c.int(1, 5);
    const end = start + hours * 60;
    return { prompt: 'Wie viele Stunden liegen zwischen diesen Uhrzeiten?', display: `${asTime(start)} Uhr → ${asTime(end)} Uhr`,
      answer: String(hours), unit: 'Stunden', hint: 'Zähle von der Startstunde bis zur Endstunde weiter.',
      explanation: [`${end / 60} − ${start / 60} = ${hours}. Es vergehen ${hours} Stunden.`],
      meta: { kind: 'durationhours', start, end } };
  }
  if (mode >= 2) {
    const step = c.level === 0 ? 30 : c.level === 1 ? 15 : 5;
    const start = c.int(1, 18) * 60 + c.int(0, 60 / step - 1) * step;
    const duration = c.int(1, c.level === 0 ? 2 : c.level === 1 ? 4 : 12) * step;
    const end = start + duration;
    const seekStart = mode === 3;
    const answer = `${asTime(seekStart ? start : end)} Uhr`;
    const target = seekStart ? start : end;
    const choices = [target, target + step, target - step, target + 60 + step].map(value => `${asTime(value)} Uhr`);
    return { prompt: seekStart ? 'Wann hat die Aktivität angefangen?' : 'Wann ist die Aktivität zu Ende?',
      display: `${seekStart ? 'Ende' : 'Anfang'}: ${asTime(seekStart ? end : start)} Uhr · Dauer: ${duration} Minuten`,
      answer, input: 'choice', choices: c.shuffle(choices),
      hint: seekStart ? 'Gehe die Dauer von der Endzeit zurück.' : 'Gehe die Dauer von der Anfangszeit weiter.',
      explanation: [`Von ${asTime(start)} Uhr bis ${asTime(end)} Uhr vergehen ${duration} Minuten.`],
      meta: { kind: 'clockshift', start, end, seekStart } };
  }
  const start = c.int(7, 16) * 60 + c.pick([0, 15, 30, 45]);
  const duration = c.int(1, c.grade === 2 ? 4 : 8) * 15;
  const end = start + duration;
  const firstStep = Math.min(duration, 60 - start % 60);
  return { prompt: 'Wie viele Minuten dauert es von Anfang bis Ende?', display: `${asTime(start)} Uhr → ${asTime(end)} Uhr`, answer: String(duration), unit: 'Minuten',
    hint: 'Rechne bis zur nächsten vollen Stunde und dann weiter. Eine Stunde hat 60 Minuten.',
    explanation: [`Von ${asTime(start)} Uhr bis ${asTime(start + firstStep)} Uhr sind es ${firstStep} Minuten.`,
      duration > firstStep ? `Danach kommen ${duration - firstStep} Minuten dazu: ${firstStep} + ${duration - firstStep} = ${duration}.` : `Die Zeitspanne beträgt ${duration} Minuten.`],
    meta: { kind: 'duration', start, end } };
}

function lengths(c) {
  const mode = c.int(0, 4);
  if (c.grade === 3 && c.level > 0 && mode < 2) {
    const answer = c.int(1, c.level === 1 ? 100 : 1000) * (c.level === 1 ? 10 : 1);
    const metres = Math.floor(answer / 100), centimetres = answer % 100;
    if (mode === 1) {
      const wholeMetres = Math.floor(answer / 100), rest = answer % 100;
      return { prompt: 'Wie viele Zentimeter bleiben nach den ganzen Metern übrig?',
        display: `${answer} cm = ${wholeMetres} m und □ cm`, answer: String(rest), unit: 'cm',
        hint: 'Jede Gruppe von 100 Zentimetern bildet einen ganzen Meter.',
        explanation: [`${wholeMetres} m = ${wholeMetres * 100} cm.`, `${answer} − ${wholeMetres * 100} = ${rest} cm bleiben übrig.`],
        meta: { kind: 'lengthrest', centimetres: answer } };
    }
    return { prompt: 'Wie viele Zentimeter sind das?', display: `${metres} m${centimetres ? ` ${centimetres} cm` : ''}`, answer: String(answer), unit: 'cm',
      hint: '1 Meter sind 100 Zentimeter.', explanation: [`${metres} m = ${metres * 100} cm.`, `${metres * 100} cm + ${centimetres} cm = ${answer} cm.`],
      meta: { kind: 'lengthconvert', metres, centimetres } };
  }
  if (mode === 4) {
    const a = c.int(1, c.limit), b = c.int(0, 4) === 0 ? a : c.int(1, c.limit);
    const answer = a < b ? '<' : a > b ? '>' : '=';
    return { prompt: 'Vergleiche die beiden Längen.', display: `${a} cm □ ${b} cm`, input: 'choice', choices: ['<', '=', '>'], answer,
      hint: 'Beide Angaben haben dieselbe Einheit. Vergleiche die Zahlen.',
      explanation: [`${a} cm ${answer} ${b} cm.`], meta: { kind: 'lengthcompare', a, b } };
  }
  const total = c.int(3, c.limit), a = c.int(1, total - 1), b = total - a;
  const sum = mode === 0;
  const prompt = sum ? 'Du legst zwei Bänder hintereinander. Wie lang sind sie zusammen?'
    : mode === 1 ? `Ein Band ist ${total} cm lang. Du schneidest ${b} cm ab. Wie lang ist der Rest?`
      : mode === 2 ? 'Ein Stift liegt auf dem Lineal. Wie lang ist er?'
        : `Ein Weg ist ${total} m lang. ${b} m bist du schon gegangen. Wie viele Meter fehlen noch?`;
  const unit = mode === 3 ? 'm' : 'cm';
  return { prompt, display: sum ? `${a} cm + ${b} cm` : mode === 2 ? `Anfang bei ${b} cm · Ende bei ${total} cm` : `${total} ${unit} − ${b} ${unit}`,
    answer: String(sum ? total : a), unit,
    hint: sum ? 'Addiere die beiden Längen.' : 'Ziehe die bekannte Länge von der gesamten Länge ab.',
    explanation: [sum ? `${a} + ${b} = ${total}. Zusammen sind es ${total} cm.` : `${total} − ${b} = ${a}. Gesucht sind ${a} ${unit}.`],
    meta: { kind: 'lengthsum', a, b, subtract: !sum } };
}

function weights(c) {
  const mode = c.int(0, 5);
  if (c.level === 0 && mode === 0) {
    const scenarios = [
      { object: 'eine Büroklammer', amount: 1, unit: 'g' }, { object: 'ein Kind', amount: 25, unit: 'kg' },
      { object: 'ein Apfel', amount: 150, unit: 'g' }, { object: 'ein Fahrrad', amount: 12, unit: 'kg' },
      { object: 'ein Teebeutel', amount: 2, unit: 'g' }, { object: 'ein Brief', amount: 20, unit: 'g' },
      { object: 'eine Tafel Schokolade', amount: 100, unit: 'g' }, { object: 'eine Erdbeere', amount: 15, unit: 'g' },
      { object: 'ein Hühnerei', amount: 60, unit: 'g' }, { object: 'eine Scheibe Brot', amount: 40, unit: 'g' },
      { object: 'ein Radiergummi', amount: 20, unit: 'g' }, { object: 'ein Bleistift', amount: 7, unit: 'g' },
      { object: 'eine Münze', amount: 5, unit: 'g' }, { object: 'ein Tennisball', amount: 58, unit: 'g' },
      { object: 'eine Katze', amount: 4, unit: 'kg' }, { object: 'ein großer Hund', amount: 30, unit: 'kg' },
      { object: 'ein voller Schulranzen', amount: 5, unit: 'kg' }, { object: 'ein Reisekoffer', amount: 20, unit: 'kg' },
      { object: 'eine Waschmaschine', amount: 70, unit: 'kg' }, { object: 'ein Stuhl', amount: 6, unit: 'kg' },
      { object: 'ein Sack Kartoffeln', amount: 10, unit: 'kg' }, { object: 'ein Kürbis', amount: 3, unit: 'kg' },
      { object: 'ein Baby', amount: 4, unit: 'kg' }, { object: 'ein Pony', amount: 200, unit: 'kg' },
    ];
    const item = c.pick(scenarios);
    return { prompt: `Welche Einheit passt ungefähr für ${item.object}?`, display: `${item.amount} …`, input: 'choice', choices: ['g', 'kg'], answer: item.unit,
      hint: 'Gramm (g) passen zu leichten Dingen. Kilogramm (kg) passen zu schweren Dingen.',
      explanation: [`Für ${item.object} sind ungefähr ${item.amount} ${item.unit} plausibel.`, '1 Kilogramm besteht aus 1000 Gramm.'],
      meta: { kind: 'weightunit', ...item } };
  }
  if (c.grade === 3 && c.level > 0 && mode < 2) {
    const grams = c.int(1, c.level === 1 ? 100 : 200) * (c.level === 1 ? 10 : 5);
    const toGrams = c.int(0, 1) === 0;
    return { prompt: `Wandle das Gewicht in ${toGrams ? 'Gramm' : 'Kilogramm'} um.`, display: toGrams ? `${formatNumber(grams / 1000)} kg` : `${grams} g`,
      answer: formatNumber(toGrams ? grams : grams / 1000), unit: toGrams ? 'g' : 'kg',
      hint: '1 kg = 1000 g. Ein halbes Kilogramm sind 500 g, ein Viertel sind 250 g.',
      explanation: ['Ein Kilogramm besteht aus 1000 Gramm.', `${formatNumber(grams / 1000)} kg = ${grams} g.`],
      meta: { kind: 'weightconvert', grams, toGrams } };
  }
  if (mode === 5) {
    const mixed = c.grade === 3 && c.level > 0;
    const leftGrams = mixed ? c.int(1, 100) * 10 : c.int(1, c.limit);
    const rightGrams = c.int(0, 4) === 0 ? leftGrams : mixed ? c.int(1, 100) * 10 : c.int(1, c.limit);
    const unit = mixed || c.grade === 3 ? 'g' : 'kg';
    const answer = leftGrams < rightGrams ? '<' : leftGrams > rightGrams ? '>' : '=';
    return { prompt: 'Vergleiche die Gewichte. Welches Zeichen passt?',
      display: `${mixed ? `${formatNumber(leftGrams / 1000)} kg` : `${leftGrams} ${unit}`} □ ${rightGrams} ${unit}`,
      answer, input: 'choice', choices: ['<', '=', '>'],
      hint: mixed ? 'Wandle Kilogramm zuerst in Gramm um. Vergleiche dann die Zahlen.' : 'Beide Gewichte haben dieselbe Einheit. Vergleiche ihre Zahlen.',
      explanation: [...(mixed ? [`${formatNumber(leftGrams / 1000)} kg = ${leftGrams} g.`] : []), `${leftGrams} ${unit} ${answer} ${rightGrams} ${unit}.`],
      meta: { kind: 'weightcompare', leftGrams, rightGrams } };
  }
  const factor = c.grade === 3 && c.level > 0 ? (c.level === 1 ? 10 : 5) : 1;
  const total = c.int(3, c.limit / factor) * factor;
  const part = c.int(1, Math.floor(total / factor) - 1) * factor;
  const unit = c.grade === 2 ? 'kg' : 'g';
  if (c.grade === 3 && c.level === 2 && mode === 2) {
    const firstGrams = part, addedGrams = total - part;
    return { prompt: 'Wie viel Gramm wiegen die beiden Päckchen zusammen?',
      display: `${formatNumber(firstGrams / 1000)} kg + ${addedGrams} g`, answer: String(total), unit: 'g',
      hint: 'Wandle zuerst Kilogramm in Gramm um. 1 kg = 1000 g. Addiere erst, wenn beide Angaben dieselbe Einheit haben.',
      explanation: [`${formatNumber(firstGrams / 1000)} kg = ${firstGrams} g.`, `${firstGrams} g + ${addedGrams} g = ${total} g.`],
      meta: { kind: 'weightmixed', firstGrams, addedGrams } };
  }
  if (mode === 1 || mode === 2) {
    return { prompt: 'Wie schwer sind die beiden Kisten zusammen?', display: `${part} ${unit} + ${total - part} ${unit}`,
      answer: String(total), unit, hint: 'Addiere die Gewichte. Beide Angaben haben dieselbe Einheit.',
      explanation: [`${part} + ${total - part} = ${total}. Beide Kisten wiegen zusammen ${total} ${unit}.`],
      meta: { kind: 'weightsum', a: part, b: total - part } };
  }
  if (mode === 3) {
    const mixed = c.grade === 3 && c.level === 2;
    return { prompt: 'Aus einer Kiste wird etwas herausgenommen. Wie schwer ist der verbleibende Inhalt?',
      display: `Vorher: ${mixed ? `${formatNumber(total / 1000)} kg` : `${total} ${unit}`} · Herausgenommen: ${part} ${unit}`,
      answer: String(total - part), unit, hint: mixed ? 'Rechne Kilogramm in Gramm um und ziehe das herausgenommene Gewicht ab.' : 'Ziehe das herausgenommene Gewicht vom Anfangsgewicht ab.',
      explanation: [...(mixed ? [`${formatNumber(total / 1000)} kg = ${total} g.`] : []), `${total} − ${part} = ${total - part} ${unit}.`],
      meta: { kind: 'weights', total, part } };
  }
  return { prompt: `Zwei Kisten wiegen zusammen ${total} ${unit}. Eine wiegt ${part} ${unit}. Wie schwer ist die andere?`, display: `${total} ${unit} − ${part} ${unit}`, answer: String(total - part), unit,
    hint: 'Gesamtgewicht minus bekanntes Gewicht ergibt das fehlende Gewicht.',
    explanation: [`${total} − ${part} = ${total - part}.`, `Die andere Kiste wiegt ${total - part} ${unit}.`],
    meta: { kind: 'weights', total, part } };
}

function capacity(c) {
  const mode = c.int(0, 5);
  if (c.level === 0 && mode === 0) {
    const small = c.pick(['einen Teelöffel', 'eine kleine Medizinpipette', 'einen Esslöffel', 'ein Parfümfläschchen', 'eine kleine Spritze', 'einen Schluck Wasser']);
    const large = c.pick(['einen Eimer', 'eine Badewanne', 'eine Gießkanne', 'ein Aquarium', 'ein großes Fass', 'einen Wassertank']);
    const useSmall = c.int(0, 1) === 0;
    return { prompt: 'Mit welcher Einheit lässt sich der Inhalt besser angeben?', display: `Denke an ${useSmall ? small : large}.`, input: 'choice', choices: ['Milliliter (ml)', 'Liter (l)'],
      answer: useSmall ? 'Milliliter (ml)' : 'Liter (l)', hint: 'Milliliter sind für sehr kleine Mengen. Ein Liter entspricht 1000 Millilitern.',
      explanation: [`Für ${useSmall ? small : large} passen ${useSmall ? 'Milliliter' : 'Liter'} besser.`], meta: { kind: 'capacityunit', small: useSmall } };
  }
  if (c.grade === 3 && c.level > 0 && mode === 0) {
    const millilitres = c.int(1, 100) * 10;
    const toMl = c.int(0, 1) === 0;
    return { prompt: `Wandle den Inhalt in ${toMl ? 'Milliliter' : 'Liter'} um.`,
      display: toMl ? `${formatNumber(millilitres / 1000)} l` : `${millilitres} ml`,
      answer: formatNumber(toMl ? millilitres : millilitres / 1000), unit: toMl ? 'ml' : 'l',
      hint: 'Ein Liter enthält 1000 Milliliter.',
      explanation: [`${formatNumber(millilitres / 1000)} l = ${millilitres} ml.`],
      meta: { kind: 'capacityconvert', millilitres, toMl } };
  }
  if (c.grade === 3 && c.level === 2 && mode === 1) {
    const glass = c.pick([25, 50, 75, 100, 125, 150, 200, 250]);
    const total = c.int(2, Math.floor(1000 / glass)) * glass;
    return { prompt: `Eine Flasche enthält ${formatNumber(total / 1000)} Liter. Wie viele volle Becher mit je ${glass} ml kannst du füllen?`, display: `${formatNumber(total / 1000)} l : ${glass} ml`, answer: String(total / glass), unit: 'Becher',
      hint: 'Rechne zuerst Liter in Milliliter um: 1 l = 1000 ml.',
      explanation: [`${formatNumber(total / 1000)} l = ${total} ml.`, `${total} : ${glass} = ${total / glass}. Du kannst ${total / glass} volle Becher füllen.`],
      meta: { kind: 'capacitydivision', total, glass } };
  }
  const step = c.grade === 3 && c.level > 0 ? 10 : 1;
  const unit = c.grade === 3 && c.level > 0 ? 'ml' : 'l';
  if (mode === 5) {
    const a = c.int(1, c.limit / step) * step;
    const b = c.int(0, 4) === 0 ? a : c.int(1, c.limit / step) * step;
    const mixed = c.grade === 3 && c.level === 2;
    const answer = a < b ? '<' : a > b ? '>' : '=';
    return { prompt: 'Vergleiche den Inhalt der beiden Gefäße.', display: `${mixed ? `${formatNumber(a / 1000)} l` : `${a} ${unit}`} □ ${b} ${unit}`,
      answer, input: 'choice', choices: ['<', '=', '>'],
      hint: mixed ? 'Wandle die Liter zuerst in Milliliter um.' : 'Beide Mengen haben dieselbe Einheit. Vergleiche die Zahlen.',
      explanation: [...(mixed ? [`${formatNumber(a / 1000)} l = ${a} ml.`] : []), `${a} ${unit} ${answer} ${b} ${unit}.`],
      meta: { kind: 'capacitycompare', a, b } };
  }
  const total = c.int(3, c.limit / step) * step;
  const a = c.int(1, total / step - 1) * step, b = total - a;
  if (mode === 3 || mode === 4) {
    return { prompt: mode === 3 ? 'Du gießt einen Teil des Wassers aus. Wie viel bleibt im Gefäß?'
      : 'Wie viel Wasser musst du noch nachfüllen, damit das Gefäß voll ist?',
      display: mode === 3 ? `Anfang: ${total} ${unit} · Ausgegossen: ${a} ${unit}` : `Fassungsvermögen: ${total} ${unit} · Bereits gefüllt: ${a} ${unit}`,
      answer: String(b), unit, hint: 'Ziehe die bekannte Teilmenge von der Gesamtmenge ab.',
      explanation: [`${total} − ${a} = ${b} ${unit}.`], meta: { kind: 'capacitydifference', total, part: a } };
  }
  return { prompt: 'Du gießt das Wasser aus zwei Gefäßen zusammen. Wie viel ist es?', display: `${a} ${unit} + ${b} ${unit}`, answer: String(total), unit,
    hint: 'Beide Mengen haben dieselbe Einheit. Addiere die Zahlen.', explanation: [`${a} ${unit} + ${b} ${unit} = ${total} ${unit}.`], meta: { kind: 'capacitysum', a, b } };
}

const FLAT_SHAPES = [
  { name: 'triangle', title: 'Dreieck', corners: 3, sides: 3 },
  { name: 'square', title: 'Quadrat', corners: 4, sides: 4 },
  { name: 'rectangle', title: 'Rechteck', corners: 4, sides: 4 },
  { name: 'circle', title: 'Kreis', corners: 0, sides: 0 },
];
const SOLIDS = [
  { name: 'cube', title: 'Würfel', example: 'Ein Spielwürfel', corners: 8, faces: 6 },
  { name: 'cuboid', title: 'Quader', example: 'Ein rechteckiger Schuhkarton', corners: 8, faces: 6 },
  { name: 'sphere', title: 'Kugel', example: 'Ein runder Ball', corners: 0 },
  { name: 'cylinder', title: 'Zylinder', example: 'Eine gerade Konservendose', corners: 0 },
];

function shapes(c) {
  if (c.int(0, 4) !== 0) return shapeInventory(c);
  if (c.level === 0) {
    const shape = c.pick(FLAT_SHAPES);
    return { prompt: 'Wie heißt diese Form möglichst genau?', display: 'Schau auf die Form.', input: 'choice', answer: shape.title,
      choices: c.shuffle(FLAT_SHAPES.map(item => item.title)), visual: { type: 'shape', name: shape.name },
      hint: 'Zähle die Ecken. Hat die Form gerade Seiten? Sind alle Seiten gleich lang?',
      explanation: [shape.name === 'circle' ? 'Der Kreis hat keine Ecken und keine geraden Seiten.'
        : shape.name === 'square' ? 'Das Quadrat hat vier gleich lange Seiten und vier rechte Winkel.'
          : shape.name === 'rectangle' ? 'Dieses Rechteck hat vier rechte Winkel. Gegenüberliegende Seiten sind gleich lang.' : 'Das Dreieck hat drei gerade Seiten und drei Ecken.'],
      meta: { kind: 'shapename', name: shape.name, title: shape.title } };
  }
  const solid = c.pick(SOLIDS);
  if (c.level === 1) return { prompt: 'Welcher geometrische Körper passt?', display: `${solid.example} hat ungefähr diese Form.`, input: 'choice', answer: solid.title,
    choices: c.shuffle(SOLIDS.map(item => item.title)), hint: 'Stelle dir den Gegenstand vor. Ist er rund? Hat er ebene Flächen?',
    explanation: [`${solid.example} hat ungefähr die Form ${solid.name === 'sphere' ? 'einer Kugel' : `eines ${solid.title === 'Würfel' ? 'Würfels' : solid.title === 'Quader' ? 'Quaders' : 'Zylinders'}`}.`],
    meta: { kind: 'solidname', name: solid.name, title: solid.title } };
  const faces = c.grade === 3 && Boolean(solid.faces) && c.int(0, 1) === 0;
  return { prompt: `Wie viele ${faces ? 'Flächen' : 'Ecken'} hat ein${solid.name === 'sphere' ? 'e' : ''} ${solid.title}?`, display: solid.title,
    answer: String(faces ? solid.faces : solid.corners),
    hint: faces ? 'Denke an oben, unten, vorne, hinten, links und rechts.' : 'Eine Ecke ist ein Punkt, an dem gerade Kanten zusammentreffen. Runde Körper können keine Ecken haben.',
    explanation: [`${solid.name === 'sphere' ? 'Die' : 'Der'} ${solid.title} hat ${faces ? solid.faces : solid.corners} ${faces ? 'Flächen' : 'Ecken'}.`],
    meta: { kind: 'solidcount', name: solid.name, property: faces ? 'faces' : 'corners', count: faces ? solid.faces : solid.corners } };
}

function symmetry(c) {
  if (c.int(0, 4) !== 0) return mirrorTask(c);
  const shapes = [
    { name: 'square', title: 'Ein Quadrat', count: 4, explanation: 'Eine waagerechte, eine senkrechte und zwei diagonale Spiegelachsen: zusammen 4.' },
    { name: 'rectangle', title: 'Ein Rechteck, das kein Quadrat ist', count: 2, explanation: 'Die waagerechte und die senkrechte Mittellinie sind Spiegelachsen: zusammen 2.' },
    { name: 'triangle', title: 'Ein gleichseitiges Dreieck', count: 3, explanation: 'Von jeder der drei Ecken führt eine Spiegelachse zur Mitte der gegenüberliegenden Seite: zusammen 3.' },
  ];
  const shape = c.pick(c.level === 0 ? shapes.slice(0, 2) : shapes);
  if (c.level === 0 && c.int(0, 1) === 0) return { prompt: 'Ist jede beliebige Linie durch ein Quadrat eine Spiegelachse?', display: 'Denke auch an eine Linie ganz nah am Rand.', answer: 'Nein', input: 'choice', choices: ['Ja', 'Nein'],
    visual: { type: 'shape', name: 'square' }, hint: 'Beim Falten an einer Spiegelachse müssen die beiden Hälften genau aufeinanderpassen.',
    explanation: ['Nein. Eine Linie nahe am Rand teilt das Quadrat in ungleich große Teile.', 'Ein Quadrat hat genau vier Spiegelachsen: zwei Mittellinien und zwei Diagonalen.'],
    meta: { kind: 'symmetryclaim', answer: 'Nein' } };
  if (c.level === 0) return { prompt: 'Hat diese Form mindestens eine Spiegelachse?', display: shape.title, answer: 'Ja', input: 'choice', choices: ['Ja', 'Nein'],
    visual: { type: 'shape', name: shape.name }, hint: 'Stelle dir vor, du faltest die Form in der Mitte. Können beide Hälften genau aufeinanderliegen?',
    explanation: [`Ja. ${shape.explanation}`], meta: { kind: 'symmetryexists', count: shape.count } };
  if (c.level === 2) return { prompt: 'Eine Spiegelachse wurde schon gefunden. Wie viele weitere hat diese Form?', display: shape.title, answer: String(shape.count - 1),
    visual: { type: 'shape', name: shape.name }, hint: 'Finde zuerst die Gesamtzahl der Spiegelachsen. Ziehe die eine bereits gefundene Achse ab.',
    explanation: [shape.explanation, `Eine ist bereits gefunden: ${shape.count} − 1 = ${shape.count - 1} weitere Spiegelachsen.`],
    meta: { kind: 'symmetryremaining', count: shape.count } };
  return { prompt: 'Wie viele Spiegelachsen hat diese Form insgesamt?', display: shape.title, answer: String(shape.count),
    visual: { type: 'shape', name: shape.name }, hint: 'Eine Spiegelachse teilt die Form in zwei genau passende Spiegelhälften. Denke auch an schräge Achsen.',
    explanation: [shape.explanation], meta: { kind: 'symmetry', count: shape.count } };
}

function perimeter(c) {
  if (c.int(0, 4) !== 0) return borderTask(c);
  const width = c.int(2, c.level === 0 ? 5 : c.grade === 2 ? 9 : 12), height = c.int(2, c.level === 0 ? 4 : c.grade === 2 ? 8 : 10);
  const area = c.level === 0 || (c.level === 2 && c.int(0, 1) === 0);
  const answer = area ? width * height : 2 * (width + height);
  return { prompt: area ? 'Wie viele Einheitsquadrate passen in dieses Rechteck?' : 'Wie lang ist der ganze Rand des Rechtecks?',
    display: area ? `${width} Kästchen breit · ${height} Kästchen hoch` : `${width} cm breit · ${height} cm hoch`, answer: String(answer), unit: area ? 'Kästchen' : 'cm',
    visual: { type: 'shape', name: 'rectangle', width, height, grid: area },
    hint: area ? 'Zähle die Kästchen in einer Reihe. Wie viele solcher Reihen gibt es?' : 'Der Umfang ist der Weg einmal außen herum. Zähle alle vier Seiten zusammen.',
    explanation: area ? [`In jeder Reihe liegen ${width} Kästchen. Es gibt ${height} Reihen.`, `${width} · ${height} = ${answer} Kästchen. Das ist die Fläche.`]
      : [`Gegenüberliegende Seiten sind gleich lang.`, `${width} + ${height} + ${width} + ${height} = ${answer}. Der Umfang beträgt ${answer} cm.`],
    meta: { kind: 'perimeter', width, height, area } };
}

function fractions(c) {
  if (c.int(0, 4) !== 0) return fractionQuantity(c);
  const parts = c.pick(c.level === 0 ? [2, 4] : c.level === 1 ? [2, 3, 4] : [3, 4, 6, 8]);
  const shaded = c.level === 0 ? 1 : c.int(1, parts - 1);
  const answer = `${shaded}/${parts}`;
  const possible = new Set([answer, `${parts}/${shaded}`, `${shaded}/${parts + 1}`, `${shaded + 1}/${parts}`]);
  return { prompt: 'Welcher Bruch beschreibt den gefärbten Anteil?', display: 'Alle Teile sind gleich groß.', answer, input: 'choice', choices: c.shuffle([...possible]),
    visual: { type: 'fraction', parts, shaded },
    hint: 'Unten steht die Anzahl aller gleich großen Teile. Oben steht die Anzahl der gefärbten Teile.',
    explanation: [`Das Ganze besteht aus ${parts} gleich großen Teilen. Davon sind ${shaded} gefärbt.`, `Der gefärbte Anteil ist ${shaded}/${parts}.`],
    meta: { kind: 'fraction', parts, shaded } };
}

function charts(c) {
  if (c.int(0, 4) !== 0) return chartQuestions(c);
  const labels = ['Äpfel', 'Birnen', 'Bananen', 'Pflaumen'].slice(0, c.level === 0 ? 3 : 4);
  const values = labels.map(() => c.int(1, c.level === 0 ? 5 : c.level === 1 ? 10 : 20));
  const i = c.int(0, labels.length - 1);
  let prompt, answer, explanation, mode;
  if (c.level === 0) {
    prompt = `Wie viele Kinder mögen ${labels[i]} am liebsten?`;
    answer = values[i]; mode = 'read';
    explanation = [`Suche ${labels[i]} in der Tabelle oder im Diagramm.`, `Der Wert ist ${values[i]}. Also mögen ${values[i]} Kinder ${labels[i]} am liebsten.`];
  } else if (c.level === 1) {
    prompt = 'Jedes Kind hat genau eine Lieblingsfrucht gewählt. Wie viele Kinder haben insgesamt abgestimmt?';
    answer = values.reduce((sum, value) => sum + value, 0); mode = 'sum';
    explanation = [`Addiere alle Anzahlen: ${values.join(' + ')} = ${answer}.`, `Insgesamt haben ${answer} Kinder abgestimmt.`];
  } else {
    const high = Math.max(...values), low = Math.min(...values);
    prompt = 'Wie groß ist der Unterschied zwischen der größten und der kleinsten Stimmenzahl?';
    answer = high - low; mode = 'difference';
    explanation = [`Die größte Stimmenzahl ist ${high}, die kleinste ${low}.`, `${high} − ${low} = ${answer}.`];
  }
  return { prompt, display: 'Lieblingsobst unserer Klasse', answer: String(answer), unit: 'Kinder',
    visual: { type: 'bars', labels, values, unit: 'Kinder' },
    hint: c.level === 0 ? 'Lies den Wert beim gesuchten Obst ab.' : c.level === 1 ? 'Zähle die Stimmen für alle Früchte zusammen.' : 'Ziehe die kleinste Stimmenzahl von der größten ab.',
    explanation, meta: { kind: 'chart', values, index: i, mode } };
}

function chance(c) {
  if (c.int(0, 4) !== 0) return bagChance(c);
  if (c.level < 2) {
    const red = c.int(1, c.level === 0 ? 3 : 6), blue = c.level === 0 ? 0 : c.int(1, 5);
    const asked = c.pick(['rot', 'blau', 'grün']);
    const count = asked === 'rot' ? red : asked === 'blau' ? blue : 0;
    const answer = count === 0 ? 'Unmöglich' : count === red + blue ? 'Sicher' : 'Möglich, aber nicht sicher';
    return { prompt: `Du ziehst ohne Hinzusehen eine Kugel. Sie ist ${asked}. Wie ist dieses Ereignis?`,
      display: `Im Beutel: ${red} rote ${blue ? `und ${blue} blaue Kugeln` : `Kugel${red === 1 ? '' : 'n'}`}.`,
      input: 'choice', choices: ['Sicher', 'Möglich, aber nicht sicher', 'Unmöglich'], answer,
      hint: 'Sicher: alle Kugeln passen. Unmöglich: keine passt. Möglich: einige passen, andere nicht.',
      explanation: [count === 0 ? `Es gibt keine ${asked === 'blau' ? 'blauen' : 'grünen'} Kugeln im Beutel. Deshalb ist es unmöglich.`
        : count === red + blue ? 'Alle Kugeln im Beutel sind rot. Du ziehst sicher eine rote Kugel.'
          : `Es gibt ${asked === 'rot' ? 'rote' : 'blaue'} Kugeln, aber auch eine andere Farbe. Das Ereignis ist möglich, aber nicht sicher.`],
      meta: { kind: 'chance', red, blue, asked, count } };
  }
  const shirts = c.int(2, c.grade === 2 ? 3 : 5), trousers = c.int(2, c.grade === 2 ? 3 : 5);
  return { prompt: `Du hast ${shirts} verschiedene T-Shirts und ${trousers} verschiedene Hosen. Wie viele Outfits aus je einem T-Shirt und einer Hose sind möglich?`,
    display: `${shirts} T-Shirts · ${trousers} Hosen`, answer: String(shirts * trousers), unit: 'Outfits',
    hint: 'Zu jedem T-Shirt kannst du jede der Hosen tragen. Zähle die Möglichkeiten systematisch.',
    explanation: [`Zu jedem der ${shirts} T-Shirts passen ${trousers} Hosen.`, `${shirts} · ${trousers} = ${shirts * trousers}. Es gibt ${shirts * trousers} verschiedene Outfits.`],
    meta: { kind: 'combinations', shirts, trousers } };
}

function wordproblems(c) {
  const name = c.pick(['Mila', 'Emil', 'Lina', 'Noah', 'Sam', 'Alex']);
  if (c.level === 2) {
    const form = c.pick(['multiply-subtract', 'multiply-add', 'add-subtract', 'add-divide', 'subtract-divide']);
    if (form === 'multiply-add') {
      const a = c.int(2, c.grade === 2 ? 8 : 15), b = c.int(2, c.grade === 2 ? 10 : 20);
      const d = c.int(1, Math.min(c.limit - a * b, c.grade === 2 ? 20 : 100));
      return { prompt: `In der Aula stehen ${a} Reihen mit je ${b} Stühlen. Dazu kommen ${d} einzelne Stühle. Wie viele Sitzplätze gibt es?`,
        display: 'Zuerst die Reihen. Dann die zusätzlichen Plätze.', answer: String(a * b + d), unit: 'Sitzplätze',
        hint: 'Multipliziere die Reihen mit den Stühlen pro Reihe. Addiere die einzelnen Stühle.',
        explanation: [`${a} · ${b} = ${a * b}.`, `${a * b} + ${d} = ${a * b + d} Sitzplätze.`],
        meta: { kind: 'wordsteps', a, b, d, form } };
    }
    if (form === 'add-subtract') {
      const total = c.int(6, c.grade === 2 ? 100 : 200), a = c.int(2, total - 2), b = total - a;
      const d = c.int(1, total - 1);
      return { prompt: `Im Bus sitzen ${a} Menschen. An der Haltestelle steigen ${b} ein und ${d} aus. Wie viele Menschen sitzen danach im Bus?`,
        display: 'Einsteigen bedeutet dazu. Aussteigen bedeutet weg.', answer: String(total - d), unit: 'Menschen',
        hint: 'Addiere die Einsteigenden. Ziehe danach die Aussteigenden ab.',
        explanation: [`${a} + ${b} = ${total}.`, `${total} − ${d} = ${total - d} Menschen.`],
        meta: { kind: 'wordsteps', a, b, d, form } };
    }
    if (form === 'add-divide') {
      const d = c.int(2, 10), each = c.int(2, c.grade === 2 ? 10 : 20), total = d * each;
      const a = c.int(1, total - 1), b = total - a;
      return { prompt: `Auf einem Teller liegen ${a} Kekse, auf einem zweiten ${b}. ${d} Kinder teilen alle Kekse gerecht. Wie viele bekommt jedes Kind?`,
        display: 'Erst alle Kekse zählen. Dann gerecht verteilen.', answer: String(each), unit: 'Kekse',
        hint: 'Addiere beide Mengen und teile die Summe durch die Zahl der Kinder.',
        explanation: [`${a} + ${b} = ${total}.`, `${total} : ${d} = ${each} Kekse pro Kind.`],
        meta: { kind: 'wordsteps', a, b, d, form } };
    }
    if (form === 'subtract-divide') {
      const d = c.int(2, c.grade === 2 ? 8 : 12), each = c.int(2, c.grade === 2 ? 10 : 20);
      const b = c.int(1, Math.min(20, c.limit - d * each)), a = d * each + b;
      return { prompt: `Die Klasse sammelt ${a} Bücher. ${b} bleiben auf dem Lesetisch. Die übrigen kommen gleichmäßig auf ${d} Regalbretter. Wie viele Bücher stehen auf jedem Brett?`,
        display: 'Zuerst die Bücher für das Regal bestimmen.', answer: String(each), unit: 'Bücher',
        hint: 'Ziehe die Bücher auf dem Lesetisch ab. Teile den Rest durch die Zahl der Regalbretter.',
        explanation: [`${a} − ${b} = ${a - b}.`, `${a - b} : ${d} = ${each} Bücher je Brett.`],
        meta: { kind: 'wordsteps', a, b, d, form } };
    }
    const boxes = c.int(3, c.grade === 2 ? 8 : 12), perBox = c.int(3, c.grade === 2 ? 10 : 20);
    const given = c.int(1, Math.min(20, boxes * perBox - 1));
    return { prompt: `${name} hat ${boxes} Schachteln mit je ${perBox} Buntstiften. ${given} Stifte werden verschenkt. Wie viele Stifte bleiben übrig?`,
      display: 'Erst zusammenzählen. Dann wegnehmen.', answer: String(boxes * perBox - given), unit: 'Stifte',
      hint: 'Schritt 1: Schachteln mal Stifte pro Schachtel. Schritt 2: Verschenkte Stifte abziehen.',
      explanation: [`Zuerst: ${boxes} · ${perBox} = ${boxes * perBox} Stifte.`, `Dann: ${boxes * perBox} − ${given} = ${boxes * perBox - given}.`],
      meta: { kind: 'wordmulti', boxes, perBox, given } };
  }
  const operation = c.pick(c.level === 0 ? ['+', '-'] : ['+', '-', '*', '/']);
  const calc = arithmetic(c, operation);
  const stories = {
    '+': [
      [`${name} hat ${calc.a} Murmeln und bekommt ${calc.b} dazu. Wie viele Murmeln sind es jetzt?`, 'Murmeln'],
      [`Auf dem Schulhof spielen ${calc.a} Kinder. ${calc.b} weitere kommen dazu. Wie viele Kinder spielen nun dort?`, 'Kinder'],
      [`Ein Buch hat ${calc.a} Seiten. Das andere hat ${calc.b} Seiten mehr. Wie viele Seiten hat das zweite Buch?`, 'Seiten'],
      [`${name} geht zuerst ${calc.a} Meter zum Tor und dann ${calc.b} Meter zum Spielplatz. Wie lang ist der ganze Weg?`, 'm'],
      [`Im Garten blühen ${calc.a} rote und ${calc.b} gelbe Tulpen. Wie viele Tulpen sind es zusammen?`, 'Tulpen'],
    ],
    '-': [
      [`${name} hat ${calc.a} Murmeln und verschenkt ${calc.b}. Wie viele bleiben übrig?`, 'Murmeln'],
      [`Für die Feier werden ${calc.a} Becher gebraucht. ${calc.b} stehen schon bereit. Wie viele fehlen noch?`, 'Becher'],
      [`Ein Turm ist ${calc.a} Zentimeter hoch, ein anderer ${calc.b} Zentimeter. Um wie viele Zentimeter ist der erste höher?`, 'cm'],
      [`Ein Buch hat ${calc.a} Seiten. ${name} hat ${calc.b} Seiten gelesen. Wie viele Seiten fehlen noch?`, 'Seiten'],
      [`Auf dem Parkplatz gibt es ${calc.a} Plätze. ${calc.b} sind belegt. Wie viele Plätze sind frei?`, 'Plätze'],
    ],
    '*': [
      [`${name} füllt ${calc.a} Beutel mit jeweils ${calc.b} Murmeln. Wie viele Murmeln sind das insgesamt?`, 'Murmeln'],
      [`Im Saal stehen ${calc.a} Reihen mit je ${calc.b} Stühlen. Wie viele Stühle stehen dort?`, 'Stühle'],
      [`${calc.a} Kinder bekommen jeweils ${calc.b} Aufkleber. Wie viele Aufkleber werden gebraucht?`, 'Aufkleber'],
      [`Ein Wegstück ist ${calc.b} Meter lang. ${name} geht es ${calc.a} Mal. Wie viele Meter sind das?`, 'm'],
    ],
    '/': [
      [`${name} verteilt ${calc.a} Murmeln gleichmäßig auf ${calc.b} Kinder. Wie viele Murmeln bekommt jedes Kind?`, 'Murmeln'],
      [`${calc.a} Blumen werden zu Sträußen mit je ${calc.b} Blumen gebunden. Wie viele Sträuße entstehen?`, 'Sträuße'],
      [`Ein ${calc.a} Meter langes Seil wird in ${calc.b} gleich lange Stücke geteilt. Wie lang ist ein Stück?`, 'm'],
      [`${calc.a} Kekse kommen in Tüten mit jeweils ${calc.b} Keksen. Wie viele Tüten werden gefüllt?`, 'Tüten'],
    ],
  };
  const [prompt, unit] = c.pick(stories[operation]);
  return { prompt, display: 'Welche Rechnung hilft dir?', answer: String(calc.result), unit,
    hint: operation === '+' ? 'Es kommt etwas dazu: Rechne plus.' : operation === '-' ? 'Es wird etwas weggegeben: Rechne minus.' : operation === '*' ? 'Gleich große Gruppen: Rechne mal.' : 'Gleichmäßig verteilen: Rechne geteilt.',
    explanation: explainArithmetic(calc), meta: { kind: 'word', ...calc } };
}

function written(c) {
  const operation = c.level === 0 ? '+' : c.pick(c.level === 1 ? ['+', '-'] : ['+', '-', '*']);
  const calc = arithmetic({ ...c, level: c.level === 0 ? 1 : 2 }, operation);
  if (operation === '*') {
    calc.b = c.int(2, 9);
    calc.a = c.int(100, Math.floor(1000 / calc.b));
    calc.result = calc.a * calc.b;
  }
  const steps = ['Schreibe Einer unter Einer, Zehner unter Zehner und Hunderter unter Hunderter. Rechne von rechts nach links.'];
  const names = ['Einer', 'Zehner', 'Hunderter', 'Tausender'];
  if (operation === '+' || operation === '*') {
    let carry = 0;
    const digits = Math.max(String(calc.a).length, operation === '+' ? String(calc.b).length : 1);
    for (let place = 0; place < digits; place += 1) {
      const da = Math.floor(calc.a / 10 ** place) % 10;
      const db = operation === '+' ? Math.floor(calc.b / 10 ** place) % 10 : calc.b;
      const value = (operation === '+' ? da + db : da * db) + carry;
      const carryText = carry ? ` + ${carry} Übertrag` : '';
      const nextCarry = Math.floor(value / 10);
      steps.push(`${names[place]}: ${da} ${SYMBOLS[operation]} ${db}${carryText} = ${value}. Schreibe ${value % 10}${nextCarry ? ` und merke ${nextCarry} als Übertrag` : ''}.`);
      carry = nextCarry;
    }
    if (carry) steps.push(`Den letzten Übertrag ${carry} schreibst du ganz links.`);
  } else {
    const digits = String(calc.a).split('').reverse().map(Number);
    for (let place = 0; place < digits.length; place += 1) {
      const db = Math.floor(calc.b / 10 ** place) % 10;
      if (digits[place] < db) {
        let from = place + 1;
        while (digits[from] === 0) from += 1;
        const exchanges = [];
        for (let k = from; k > place; k -= 1) exchanges.push(`1 ${names[k]} in 10 ${names[k - 1]}`);
        digits[from] -= 1;
        for (let k = from - 1; k > place; k -= 1) digits[k] = 9;
        digits[place] += 10;
        steps.push(`${names[place]}: ${digits[place] - 10} reichen nicht, um ${db} abzuziehen. Tausche ${exchanges.join(', danach ')}.`);
        steps.push(`Jetzt stehen hier ${digits[place]} ${names[place]}. Links davon bleiben ${digits.slice(place + 1, from + 1).map((digit, index) => `${digit} ${names[place + index + 1]}`).join(' und ')}.`);
      }
      steps.push(`${names[place]}: ${digits[place]} − ${db} = ${digits[place] - db}. Schreibe ${digits[place] - db}.`);
    }
  }
  steps.push(`Ergebnis: ${calc.a} ${SYMBOLS[operation]} ${calc.b} = ${calc.result}.`);
  return { prompt: 'Rechne schriftlich. Papier und Stift dürfen dir helfen.', display: `${calc.a} ${SYMBOLS[operation]} ${calc.b} = ?`,
    answer: String(calc.result), visual: { type: 'written', a: calc.a, b: calc.b, operator: SYMBOLS[operation] },
    hint: operation === '-' ? 'Beginne rechts. Reichen die Einer nicht, tausche einen Zehner in zehn Einer. Über eine Null hinweg musst du weiter links entbündeln.'
      : 'Beginne rechts. Ab zehn Einern schreibst du nur die Einerziffer und nimmst die Zehner als Übertrag zur nächsten Stelle mit.',
    explanation: steps, meta: { kind: 'written', ...calc } };
}

function order(c) {
  const a = c.int(2, c.level === 0 ? 10 : 30), b = c.int(2, 9), d = c.int(2, 9);
  const brackets = c.level === 2 && c.int(0, 1) === 1;
  const answer = brackets ? (a + b) * d : a + b * d;
  return { prompt: 'Achte auf die Reihenfolge der Rechenschritte.', display: brackets ? `(${a} + ${b}) · ${d} = ?` : `${a} + ${b} · ${d} = ?`, answer: String(answer),
    hint: 'Zuerst Klammern, dann Mal und Geteilt, danach Plus und Minus.',
    explanation: brackets ? [`Rechne zuerst die Klammer: ${a} + ${b} = ${a + b}.`, `Dann: ${a + b} · ${d} = ${answer}.`]
      : [`Punkt vor Strich: Rechne zuerst ${b} · ${d} = ${b * d}.`, `Dann: ${a} + ${b * d} = ${answer}.`],
    meta: { kind: 'order', a, b, d, brackets } };
}

function divisibility(c) {
  const number = c.int(10, c.level === 0 ? 99 : 999);
  if (c.level === 0) {
    const answer = number % 2 === 0 ? 'Gerade' : 'Ungerade';
    return { prompt: 'Ist diese Zahl gerade oder ungerade?', display: String(number), input: 'choice', answer, choices: ['Gerade', 'Ungerade'],
      hint: 'Gerade Zahlen enden auf 0, 2, 4, 6 oder 8. Man kann sie ohne Rest durch 2 teilen.',
      explanation: [`Die letzte Ziffer von ${number} ist ${number % 10}. Deshalb ist ${number} ${answer.toLowerCase()}.`],
      meta: { kind: 'parity', number } };
  }
  if (c.level === 1) {
    const digits = String(number).split('').map(Number);
    const sum = digits.reduce((total, digit) => total + digit, 0);
    return { prompt: 'Wie groß ist die Quersumme?', display: String(number), answer: String(sum),
      hint: 'Die Quersumme ist die Summe aller Ziffern. Addiere jede Ziffer einmal.',
      explanation: [`${digits.join(' + ')} = ${sum}. Die Quersumme von ${number} ist ${sum}.`], meta: { kind: 'digitsum', number } };
  }
  const divisor = c.pick([2, 5, 10]);
  return { prompt: `Ist die Zahl ohne Rest durch ${divisor} teilbar?`, display: String(number), input: 'choice', answer: number % divisor === 0 ? 'Ja' : 'Nein', choices: ['Ja', 'Nein'],
    hint: divisor === 2 ? 'Teilbar durch 2: Die letzte Ziffer ist 0, 2, 4, 6 oder 8.' : divisor === 5 ? 'Teilbar durch 5: Die Zahl endet auf 0 oder 5.' : 'Teilbar durch 10: Die Zahl endet auf 0.',
    explanation: [`${number} endet auf ${number % 10}.`, number % divisor === 0 ? `${number} : ${divisor} = ${number / divisor}. Es bleibt kein Rest.`
      : `${number} : ${divisor} = ${Math.floor(number / divisor)} Rest ${number % divisor}. Also ist die Zahl nicht ohne Rest teilbar.`],
    meta: { kind: 'divisibility', number, divisor } };
}

function calendar(c) {
  const days = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
  if (c.level === 0) {
    const day = c.int(0, 6), distance = c.int(1, c.grade === 2 ? 14 : 20);
    const offset = c.int(0, 1) === 0 ? distance : -distance;
    const answer = days[((day + offset) % 7 + 7) % 7];
    return { prompt: `Heute ist ${days[day]}. Welcher Wochentag ${offset > 0 ? 'ist in' : 'war vor'} ${distance} ${distance === 1 ? 'Tag' : 'Tagen'}?`, display: 'Eine Woche hat 7 Tage.', input: 'choice', answer,
      choices: c.shuffle([answer, ...days.filter(name => name !== answer).slice(0, 3)]), hint: `Gehe die Wochentage der Reihe nach ${offset > 0 ? 'vorwärts' : 'rückwärts'}. Nach 7 Tagen bist du wieder beim selben Wochentag.`,
      explanation: [`Gehe von ${days[day]} aus ${distance} Tage ${offset > 0 ? 'vorwärts' : 'zurück'}.`, `Dann ist ${answer}.`],
      meta: { kind: 'weekday', day, offset } };
  }
  const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const year = c.pick([2024, 2025, 2026, 2027, 2028]);
  const leap = year % 4 === 0;
  const daysInMonth = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (c.level === 1) {
    const month = c.int(0, 11);
    const mode = c.int(0, 2);
    if (mode === 1) {
      const date = c.int(1, daysInMonth[month] - 1);
      const answer = daysInMonth[month] - date;
      return { prompt: `Heute ist der ${date}. ${months[month]} ${year}. Wie viele Tage vergehen noch bis zum Monatsende?`,
        display: `Der ${months[month]} hat ${daysInMonth[month]} Tage. Der heutige Tag zählt nicht mit.`, answer: String(answer), unit: 'Tage',
        hint: 'Ziehe das heutige Tagesdatum von der Anzahl der Monatstage ab.',
        explanation: [`${daysInMonth[month]} − ${date} = ${answer}. Bis zum Monatsende vergehen ${answer} Tage.`],
        meta: { kind: 'monthremaining', month, year, date } };
    }
    if (mode === 2) {
      const distance = c.int(1, 6), offset = c.int(0, 1) === 0 ? distance : -distance;
      const target = (month + offset + 12) % 12, answer = months[target];
      return { prompt: `Jetzt ist ${months[month]}. Welcher Monat ${offset > 0 ? 'kommt in' : 'war vor'} ${distance} ${distance === 1 ? 'Monat' : 'Monaten'}?`,
        display: 'Ein Jahr hat 12 Monate.', answer, input: 'choice', choices: c.shuffle([answer, ...months.filter(value => value !== answer).slice(0, 3)]),
        hint: `Gehe in der Monatsfolge ${offset > 0 ? 'vorwärts' : 'rückwärts'}. Nach Dezember kommt Januar.`,
        explanation: [`Von ${months[month]} aus ${distance} ${distance === 1 ? 'Monat' : 'Monate'} ${offset > 0 ? 'weiter' : 'zurück'}: ${answer}.`],
        meta: { kind: 'monthshift', month, offset } };
    }
    return { prompt: `Wie viele Tage hat der ${months[month]} ${year}?`, display: `${year} ist ${leap ? 'ein' : 'kein'} Schaltjahr.`, input: 'choice', choices: ['28', '29', '30', '31'], answer: String(daysInMonth[month]),
      hint: 'April, Juni, September und November haben 30 Tage. Februar hat meist 28. Die übrigen Monate haben 31.',
      explanation: [`Der ${months[month]} ${year} hat ${daysInMonth[month]} Tage.`, ...(month === 1 && leap ? ['In einem Schaltjahr hat der Februar einen zusätzlichen Tag.'] : [])], meta: { kind: 'monthdays', month, year } };
  }
  const month = c.int(0, 10), start = c.int(22, daysInMonth[month] - 1), end = c.int(1, 9);
  const duration = daysInMonth[month] - start + end;
  return { prompt: `Wie viele Tage vergehen vom ${start}. ${months[month]} bis zum ${end}. ${months[month + 1]} ${year}?`, display: 'Zähle die vergangenen Tage. Der Starttag zählt nicht mit.', answer: String(duration), unit: 'Tage',
    hint: `Der ${months[month]} hat ${daysInMonth[month]} Tage. Rechne erst bis zum Monatsende, dann weiter.`,
    explanation: [`Bis zum letzten Tag im ${months[month]}: ${daysInMonth[month]} − ${start} = ${daysInMonth[month] - start} Tage.`,
      `Dann kommen ${end} Tage dazu: ${daysInMonth[month] - start} + ${end} = ${duration} Tage.`],
    meta: { kind: 'calendarduration', month, start, end, year } };
}

function area(c) {
  if (c.int(0, 4) !== 0) return areaPieces(c);
  const width = c.int(2, c.level === 0 ? 4 : c.grade === 2 ? 10 : 15), height = c.int(2, c.level === 0 ? 3 : c.grade === 2 ? 8 : 12);
  if (c.level === 2) {
    const secondWidth = c.int(2, c.grade === 2 ? 10 : 15), secondHeight = c.int(2, c.grade === 2 ? 8 : 12);
    const first = width * height, second = secondWidth * secondHeight;
    return { prompt: 'Vergleiche die Flächen. Alle Kästchen sind gleich groß.', display: `A: ${width} × ${height} Kästchen · B: ${secondWidth} × ${secondHeight} Kästchen`,
      input: 'choice', choices: ['A ist größer', 'B ist größer', 'Beide sind gleich groß'], answer: first > second ? 'A ist größer' : first < second ? 'B ist größer' : 'Beide sind gleich groß',
      hint: 'Rechne bei jedem Rechteck: Kästchen pro Reihe mal Anzahl der Reihen.',
      explanation: [`Fläche A: ${width} · ${height} = ${first} Kästchen.`, `Fläche B: ${secondWidth} · ${secondHeight} = ${second} Kästchen.`,
        first === second ? 'Die Flächen sind gleich groß, auch wenn ihre Formen verschieden sein können.' : `Die Fläche mit ${Math.max(first, second)} Kästchen ist größer.`],
      meta: { kind: 'areacomparison', width, height, secondWidth, secondHeight } };
  }
  return { prompt: 'Wie viele Kästchen bedecken die ganze Fläche?', display: `${width} Kästchen pro Reihe, ${height} Reihen`, answer: String(width * height), unit: 'Kästchen',
    visual: { type: 'shape', name: 'rectangle', width, height, grid: true }, hint: 'Jede Reihe hat gleich viele Kästchen. Du kannst die Reihen addieren oder malnehmen.',
    explanation: [`${height} Reihen mit je ${width} Kästchen.`, `${height} · ${width} = ${height * width} Kästchen.`],
    meta: { kind: 'area', width, height } };
}

function spatial(c) {
  if (c.int(0, 4) !== 0) return gridJourney(c);
  const labels = c.shuffle(['Sonne', 'Blume', 'Stern', 'Ball']);
  const row = c.int(0, 1), col = c.int(0, 1), horizontal = c.int(0, 1) === 0;
  const backwards = c.level > 0 && c.int(0, 1) === 0;
  const first = { row, col, label: labels[0] };
  const second = { row: row + (horizontal ? 0 : 1), col: col + (horizontal ? 1 : 0), label: labels[1] };
  const subject = backwards ? first : second, reference = backwards ? second : first;
  const answer = horizontal ? backwards ? 'Links' : 'Rechts' : backwards ? 'Darüber' : 'Darunter';
  const items = [first, second];
  if (c.level === 2) {
    const occupied = new Set(items.map(item => `${item.row},${item.col}`));
    const empty = [];
    for (let r = 0; r < 3; r += 1) for (let k = 0; k < 3; k += 1) if (!occupied.has(`${r},${k}`)) empty.push({ row: r, col: k });
    const distractors = c.shuffle(empty).slice(0, 2);
    items.push(...distractors.map((position, i) => ({ ...position, label: labels[i + 2] })));
  }
  return { prompt: `Wo liegt „${subject.label}“ im Vergleich zu „${reference.label}“?`, display: 'Schau auf das Raster.', input: 'choice', choices: ['Links', 'Rechts', 'Darüber', 'Darunter'], answer,
    visual: { type: 'grid', rows: 3, cols: 3, items }, hint: 'Suche zuerst das zweite genannte Symbol. Schau von dort zum ersten Symbol.',
    explanation: [`„${subject.label}“ liegt ${answer === 'Links' ? 'links von' : answer === 'Rechts' ? 'rechts von' : answer === 'Darüber' ? 'über' : 'unter'} „${reference.label}“.`],
    meta: { kind: 'spatial', subject, reference } };
}

function combinations(c) {
  if (c.int(0, 4) !== 0) return branchingChoices(c);
  const a = c.int(2, c.level === 0 ? 2 : c.level === 1 ? 3 : 5), b = c.int(2, c.level === 0 ? 3 : c.level === 1 ? 4 : 5);
  const extra = c.grade === 3 && c.level === 2 ? c.int(2, 3) : 1;
  return { prompt: `Im Eisladen gibt es ${a} Sorten Eis und ${b} Sorten Streusel${extra > 1 ? ` sowie ${extra} verschiedene Waffeln` : ''}. Du wählst genau eine Eissorte und eine Streuselsorte${extra > 1 ? ' und eine Waffel' : ''}. Wie viele Kombinationen gibt es?`,
    display: 'Sammle die Möglichkeiten systematisch.', answer: String(a * b * extra), unit: 'Möglichkeiten',
    hint: `Zu jeder Eissorte passen alle ${b} Streuselsorten.${extra > 1 ? ` Jede Kombination gibt es mit ${extra} Waffeln.` : ''}`,
    explanation: [`${a} Eissorten · ${b} Streuselsorten = ${a * b} Kombinationen.${extra > 1 ? ` Dazu ${extra} Waffeln: ${a * b} · ${extra} = ${a * b * extra}.` : ''}`,
      `Insgesamt sind ${a * b * extra} verschiedene Kombinationen möglich.`],
    meta: { kind: 'combinations3', a, b, extra } };
}

const GENERATORS = {
  addition: c => arithmeticExercise(c, '+'), subtraction: c => arithmeticExercise(c, '-'),
  multiplication: c => arithmeticExercise(c, '*'), division: c => arithmeticExercise(c, '/'),
  remainder, missing, operators, sequences, placevalue, comparison, rounding, double,
  money, time, lengths, weights, capacity, shapes, symmetry, perimeter, fractions, charts, chance, wordproblems,
  written, order, divisibility, calendar, area, spatial, combinations,
};

export function generateExercise(options = {}, rng = Math.random) {
  const c = context(options, rng);
  return { id: c.id, topic: c.topic, input: 'number', ...GENERATORS[c.topic](c) };
}

function normalizeDecimal(value) {
  let text = String(value).trim().replace(/\u2212/g, '-');
  // Accept grouped thousands, but never turn arbitrary separated digits into a new answer.
  if (/^[+-]?\d{1,3}(?:[ \u00a0\u202f]\d{3})+(?:[.,]\d+)?$/.test(text)) text = text.replace(/[ \u00a0\u202f]/g, '');
  if (!/^[+-]?\d+(?:[.,]\d+)?$/.test(text)) return null;
  const negative = text.startsWith('-');
  text = text.replace(/^[+-]/, '').replace(',', '.');
  let [whole, fraction = ''] = text.split('.');
  whole = whole.replace(/^0+(?=\d)/, '');
  fraction = fraction.replace(/0+$/, '');
  const zero = whole === '0' && !fraction;
  return `${negative && !zero ? '-' : ''}${whole}${fraction ? `.${fraction}` : ''}`;
}

export function checkAnswer(exercise, value) {
  if (!exercise || value === null || value === undefined || !['string', 'number'].includes(typeof value)) return false;
  if (exercise.input === 'number') {
    const actual = normalizeDecimal(value), expected = normalizeDecimal(exercise.answer);
    return actual !== null && expected !== null && actual === expected;
  }
  const normalize = text => String(text).trim().replace(/\s+/g, ' ').toLocaleLowerCase('de-DE');
  return normalize(value) === normalize(exercise.answer);
}
