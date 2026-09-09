/** Procedural exercises. All random choices use the supplied RNG for reproducible practice. */
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
    a = int(level === 0 ? 1 : grade === 3 && level === 2 ? 11 : 2,
      grade === 3 && level === 2 ? 30 : level === 0 ? Math.min(5, Math.floor(limit / b)) : 10);
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
  const quotient = c.int(c.level === 2 ? 11 : 1, c.level === 0 ? 5 : c.level === 1 ? 10 : 25);
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
    const a = c.int(operation === '+' ? 1 : c.table, operation === '+' ? c.limit - c.table : c.limit);
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
  const count = c.level === 0 ? 5 : 6;
  const maxStart = Math.floor((c.limit - step * (count - 1)) / step);
  const start = Math.max(0, c.int(0, Math.max(0, maxStart))) * step;
  const descending = c.level === 2 && c.int(0, 1) === 1;
  const values = Array.from({ length: count }, (_, i) => start + step * (descending ? count - 1 - i : i));
  const blank = c.level === 0 ? count - 1 : c.int(1, count - 2);
  return { prompt: 'Finde die Regel. Welche Zahl fehlt?', display: values.map((value, i) => i === blank ? '□' : value).join(' → '),
    answer: String(values[blank]), hint: `Vergleiche zwei benachbarte Zahlen. Die Sprünge sind immer gleich ${descending ? 'zurück' : 'vorwärts'}.`,
    explanation: [`Die Regel lautet: immer ${descending ? 'minus' : 'plus'} ${step}.`,
      `${values[blank - 1]} ${descending ? '−' : '+'} ${step} = ${values[blank]}.`],
    ...(descending ? {} : { visual: { type: 'numberline', start, end: values[count - 1], step, jumps: count - 1, hidden: [values[blank]] } }),
    meta: { kind: 'sequence', values, blank, step, descending } };
}

function placevalue(c) {
  const max = c.grade === 2 ? (c.level === 0 ? 20 : 99) : (c.level === 0 ? 99 : 999);
  const number = c.int(c.level === 2 ? Math.floor(max / 2) : 10, max);
  if (c.level === 0) {
    const place = c.pick([0, 1]);
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
  const half = c.int(1, Math.floor(c.limit / 2));
  const isDouble = c.int(0, 1) === 0;
  const number = isDouble ? half : half * 2, answer = isDouble ? half * 2 : half;
  return { prompt: isDouble ? 'Verdopple die Zahl.' : 'Halbiere die Zahl.', display: String(number), answer: String(answer),
    hint: isDouble ? 'Verdoppeln heißt: dieselbe Zahl noch einmal dazuzählen.' : 'Halbieren heißt: in zwei gleich große Teile aufteilen.',
    explanation: [isDouble ? `${number} + ${number} = ${answer}.` : `${answer} + ${answer} = ${number}. Deshalb ist die Hälfte ${answer}.`],
    meta: { kind: 'double', number, isDouble } };
}

function money(c) {
  if (c.level === 0) {
    const coins = Array.from({ length: c.int(2, c.grade === 2 ? 4 : 6) }, () => c.pick([1, 2, 5, 10, 20]));
    const total = coins.reduce((sum, coin) => sum + coin, 0);
    return { prompt: 'Zähle die Cent-Münzen zusammen.', display: coins.map(coin => `${coin} ct`).join(' + '), answer: String(total), unit: 'ct',
      hint: 'Beginne mit den großen Münzen. Gleiche Münzen kannst du zusammenfassen.',
      explanation: [`${coins.join(' + ')} = ${total}. Zusammen sind das ${total} Cent.`], meta: { kind: 'coins', coins } };
  }
  if (c.grade === 2) {
    const paid = c.pick(c.level === 1 ? [10, 20] : [20, 50, 100]);
    const price = c.int(1, paid - 1);
    return { prompt: `Du bezahlst mit ${paid} €. Wie viel Rückgeld bekommst du?`, display: `Preis: ${price} €`, answer: String(paid - price), unit: '€',
      hint: `Ergänze vom Preis bis ${paid} oder rechne bezahlt minus Preis.`,
      explanation: [`${paid} € − ${price} € = ${paid - price} €.`, `Probe: Preis ${price} € + Rückgeld ${paid - price} € = ${paid} €.`],
      meta: { kind: 'change', paid, price, scale: 1 } };
  }
  const paid = c.pick(c.level === 1 ? [200, 500] : [500, 1000]);
  const price = c.int(1, paid / (c.level === 1 ? 50 : 5) - 1) * (c.level === 1 ? 50 : 5);
  return { prompt: `Du bezahlst mit ${euro(paid)}. Wie viel Euro bekommst du zurück?`, display: `Preis: ${euro(price)}`, answer: formatNumber((paid - price) / 100), unit: '€',
    hint: 'Rechne zuerst alles in Cent. 100 Cent sind 1 Euro. Ein Komma trennt Euro und Cent.',
    explanation: [`${paid} ct − ${price} ct = ${paid - price} ct.`, `${paid - price} Cent sind ${euro(paid - price)}.`],
    meta: { kind: 'change', paid, price, scale: 100 } };
}

function time(c) {
  if (c.level < 2) {
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
  const start = c.int(7, 16) * 60 + c.pick([0, 15, 30, 45]);
  const duration = c.int(1, c.grade === 2 ? 4 : 8) * 15;
  const end = start + duration;
  const asTime = mins => `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')}`;
  const firstStep = Math.min(duration, 60 - start % 60);
  return { prompt: 'Wie viele Minuten dauert es von Anfang bis Ende?', display: `${asTime(start)} Uhr → ${asTime(end)} Uhr`, answer: String(duration), unit: 'Minuten',
    hint: 'Rechne bis zur nächsten vollen Stunde und dann weiter. Eine Stunde hat 60 Minuten.',
    explanation: [`Von ${asTime(start)} Uhr bis ${asTime(start + firstStep)} Uhr sind es ${firstStep} Minuten.`,
      duration > firstStep ? `Danach kommen ${duration - firstStep} Minuten dazu: ${firstStep} + ${duration - firstStep} = ${duration}.` : `Die Zeitspanne beträgt ${duration} Minuten.`],
    meta: { kind: 'duration', start, end } };
}

function lengths(c) {
  if (c.grade === 3 && c.level > 0) {
    const metres = c.int(1, c.level === 1 ? 5 : 9), centimetres = c.level === 1 ? 0 : c.int(1, 99);
    const answer = metres * 100 + centimetres;
    return { prompt: 'Wie viele Zentimeter sind das?', display: `${metres} m${centimetres ? ` ${centimetres} cm` : ''}`, answer: String(answer), unit: 'cm',
      hint: '1 Meter sind 100 Zentimeter.', explanation: [`${metres} m = ${metres * 100} cm.`, `${metres * 100} cm + ${centimetres} cm = ${answer} cm.`],
      meta: { kind: 'lengthconvert', metres, centimetres } };
  }
  const a = c.int(5, c.level === 0 ? 10 : 70), b = c.int(1, Math.min(c.level === 0 ? 10 : 30, 100 - a));
  const subtract = c.level === 2;
  return { prompt: subtract ? `Ein Band ist ${a + b} cm lang. Du schneidest ${b} cm ab. Wie lang ist der Rest?` : 'Du legst zwei Bänder hintereinander. Wie lang sind sie zusammen?',
    display: subtract ? `${a + b} cm − ${b} cm` : `${a} cm + ${b} cm`, answer: String(subtract ? a : a + b), unit: 'cm',
    hint: subtract ? 'Ziehe das abgeschnittene Stück von der ganzen Länge ab.' : 'Beide Längen stehen in Zentimetern. Du kannst sie direkt addieren.',
    explanation: [subtract ? `${a + b} − ${b} = ${a}. Der Rest ist ${a} cm lang.` : `${a} + ${b} = ${a + b}. Zusammen sind es ${a + b} cm.`],
    meta: { kind: 'lengthsum', a, b, subtract } };
}

function weights(c) {
  if (c.level === 0) {
    const scenarios = [
      { object: 'eine Büroklammer', amount: 1, unit: 'g' }, { object: 'ein Kind', amount: 25, unit: 'kg' },
      { object: 'ein Apfel', amount: 150, unit: 'g' }, { object: 'ein Fahrrad', amount: 12, unit: 'kg' },
    ];
    const item = c.pick(scenarios);
    return { prompt: `Welche Einheit passt ungefähr für ${item.object}?`, display: `${item.amount} …`, input: 'choice', choices: ['g', 'kg'], answer: item.unit,
      hint: 'Gramm (g) passen zu leichten Dingen. Kilogramm (kg) passen zu schweren Dingen.',
      explanation: [`Für ${item.object} sind ungefähr ${item.amount} ${item.unit} plausibel.`, '1 Kilogramm besteht aus 1000 Gramm.'],
      meta: { kind: 'weightunit', ...item } };
  }
  if (c.grade === 3 && c.level === 1 && c.int(0, 1) === 0) {
    const grams = c.pick([250, 500, 750, 1000]);
    const toGrams = c.int(0, 1) === 0;
    return { prompt: `Wandle das Gewicht in ${toGrams ? 'Gramm' : 'Kilogramm'} um.`, display: toGrams ? `${formatNumber(grams / 1000)} kg` : `${grams} g`,
      answer: formatNumber(toGrams ? grams : grams / 1000), unit: toGrams ? 'g' : 'kg',
      hint: '1 kg = 1000 g. Ein halbes Kilogramm sind 500 g, ein Viertel sind 250 g.',
      explanation: ['Ein Kilogramm besteht aus 1000 Gramm.', `${formatNumber(grams / 1000)} kg = ${grams} g.`],
      meta: { kind: 'weightconvert', grams, toGrams } };
  }
  if (c.grade === 3 && c.level === 2) {
    const firstGrams = c.int(1, 9) * 100;
    const addedGrams = c.int(1, (1000 - firstGrams) / 25) * 25;
    return { prompt: 'Wie viel Gramm wiegen die beiden Päckchen zusammen?',
      display: `${formatNumber(firstGrams / 1000)} kg + ${addedGrams} g`, answer: String(firstGrams + addedGrams), unit: 'g',
      hint: 'Wandle zuerst Kilogramm in Gramm um. 1 kg = 1000 g. Addiere erst, wenn beide Angaben dieselbe Einheit haben.',
      explanation: [`${formatNumber(firstGrams / 1000)} kg = ${firstGrams} g.`, `${firstGrams} g + ${addedGrams} g = ${firstGrams + addedGrams} g.`],
      meta: { kind: 'weightmixed', firstGrams, addedGrams } };
  }
  const factor = c.grade === 2 ? 1 : c.level === 1 ? 10 : 50;
  const total = c.int(8, c.grade === 2 ? 50 : 20) * factor;
  const part = c.int(1, Math.floor(total / factor) - 1) * factor;
  const unit = c.grade === 2 ? 'kg' : 'g';
  return { prompt: `Zwei Kisten wiegen zusammen ${total} ${unit}. Eine wiegt ${part} ${unit}. Wie schwer ist die andere?`, display: `${total} ${unit} − ${part} ${unit}`, answer: String(total - part), unit,
    hint: 'Gesamtgewicht minus bekanntes Gewicht ergibt das fehlende Gewicht.',
    explanation: [`${total} − ${part} = ${total - part}.`, `Die andere Kiste wiegt ${total - part} ${unit}.`],
    meta: { kind: 'weights', total, part } };
}

function capacity(c) {
  if (c.level === 0) {
    const small = c.pick(['einen Teelöffel', 'eine kleine Medizinpipette', 'einen Tropfen Wasser']);
    const large = c.pick(['einen Eimer', 'eine Badewanne', 'eine Gießkanne']);
    const useSmall = c.int(0, 1) === 0;
    return { prompt: 'Mit welcher Einheit lässt sich der Inhalt besser angeben?', display: `Denke an ${useSmall ? small : large}.`, input: 'choice', choices: ['Milliliter (ml)', 'Liter (l)'],
      answer: useSmall ? 'Milliliter (ml)' : 'Liter (l)', hint: 'Milliliter sind für sehr kleine Mengen. Ein Liter entspricht 1000 Millilitern.',
      explanation: [`Für ${useSmall ? small : large} passen ${useSmall ? 'Milliliter' : 'Liter'} besser.`], meta: { kind: 'capacityunit', small: useSmall } };
  }
  if (c.grade === 3 && c.level === 2) {
    const glass = c.pick([100, 125, 200, 250, 500]), total = 1000;
    return { prompt: `Eine Flasche enthält 1 Liter. Wie viele volle Becher mit je ${glass} ml kannst du füllen?`, display: `1 l : ${glass} ml`, answer: String(total / glass), unit: 'Becher',
      hint: 'Rechne zuerst 1 Liter in Milliliter um: 1 l = 1000 ml.',
      explanation: [`1 l = ${total} ml.`, `${total} : ${glass} = ${total / glass}. Du kannst ${total / glass} volle Becher füllen.`],
      meta: { kind: 'capacitydivision', total, glass } };
  }
  const a = c.int(1, c.level === 1 ? 10 : 20), b = c.int(1, c.level === 1 ? 10 : 20);
  return { prompt: 'Du gießt das Wasser aus zwei Gefäßen zusammen. Wie viel ist es?', display: `${a} l + ${b} l`, answer: String(a + b), unit: 'l',
    hint: 'Beide Mengen stehen in Litern. Addiere die Zahlen.', explanation: [`${a} l + ${b} l = ${a + b} l.`], meta: { kind: 'capacitysum', a, b } };
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
  const prompt = operation === '+' ? `${name} hat ${calc.a} Murmeln und bekommt ${calc.b} dazu. Wie viele Murmeln sind es jetzt?`
    : operation === '-' ? `${name} hat ${calc.a} Murmeln und verschenkt ${calc.b}. Wie viele bleiben übrig?`
      : operation === '*' ? `${name} füllt ${calc.a} Beutel mit jeweils ${calc.b} Murmeln. Wie viele Murmeln sind das insgesamt?`
        : `${name} verteilt ${calc.a} Murmeln gleichmäßig auf ${calc.b} Kinder. Wie viele Murmeln bekommt jedes Kind?`;
  return { prompt, display: 'Welche Rechnung hilft dir?', answer: String(calc.result), unit: 'Murmeln',
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
    const day = c.int(0, 6), offset = c.grade === 2 ? c.pick([1, 2, 7]) : c.int(1, 14);
    const answer = days[(day + offset) % 7];
    return { prompt: `Heute ist ${days[day]}. Welcher Wochentag ist in ${offset} ${offset === 1 ? 'Tag' : 'Tagen'}?`, display: 'Eine Woche hat 7 Tage.', input: 'choice', answer,
      choices: c.shuffle([answer, ...days.filter(name => name !== answer).slice(0, 3)]), hint: 'Gehe die Wochentage der Reihe nach weiter. Nach Sonntag kommt wieder Montag.',
      explanation: [`${offset === 7 ? 'Nach genau einer Woche ist wieder derselbe Wochentag.' : `Zähle ${offset} Tage nach ${days[day]} weiter.`}`, `Dann ist ${answer}.`],
      meta: { kind: 'weekday', day, offset } };
  }
  const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (c.level === 1) {
    const month = c.int(0, 11);
    return { prompt: `Wie viele Tage hat der ${months[month]} 2025?`, display: '2025 ist kein Schaltjahr.', input: 'choice', choices: ['28', '29', '30', '31'], answer: String(daysInMonth[month]),
      hint: 'April, Juni, September und November haben 30 Tage. Februar hat meist 28. Die übrigen Monate haben 31.',
      explanation: [`Der ${months[month]} 2025 hat ${daysInMonth[month]} Tage.`], meta: { kind: 'monthdays', month, year: 2025 } };
  }
  const month = c.int(0, 10), start = c.int(22, daysInMonth[month] - 1), end = c.int(1, 9);
  const duration = daysInMonth[month] - start + end;
  return { prompt: `Wie viele Tage vergehen vom ${start}. ${months[month]} bis zum ${end}. ${months[month + 1]} 2025?`, display: 'Zähle die vergangenen Tage. Der Starttag zählt nicht mit.', answer: String(duration), unit: 'Tage',
    hint: `Der ${months[month]} hat ${daysInMonth[month]} Tage. Rechne erst bis zum Monatsende, dann weiter.`,
    explanation: [`Bis zum letzten Tag im ${months[month]}: ${daysInMonth[month]} − ${start} = ${daysInMonth[month] - start} Tage.`,
      `Dann kommen ${end} Tage dazu: ${daysInMonth[month] - start} + ${end} = ${duration} Tage.`],
    meta: { kind: 'calendarduration', month, start, end, year: 2025 } };
}

function area(c) {
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
