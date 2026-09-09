/** Additional, genuinely different tasks for geometry, data and sharing. */
const FLAT = [
  { name: 'triangle', title: 'Dreiecke', corners: 3, sides: 3 },
  { name: 'square', title: 'Quadrate', corners: 4, sides: 4 },
  { name: 'rectangle', title: 'Rechtecke', corners: 4, sides: 4 },
  { name: 'circle', title: 'Kreise', corners: 0, sides: 0 },
];
const SOLID = [
  { name: 'cube', title: 'Würfel', corners: 8, edges: 12, faces: 6 },
  { name: 'cuboid', title: 'Quader', corners: 8, edges: 12, faces: 6 },
];
const sum = values => values.reduce((total, value) => total + value, 0);

export function shapeInventory(c) {
  const solids = c.level > 0 && c.int(0, 2) === 0;
  const catalog = solids ? SOLID : FLAT;
  const selected = c.shuffle(catalog).slice(0, solids ? 2 : c.int(2, 3));
  const property = c.pick(solids ? ['corners', 'edges', 'faces'] : ['corners', 'sides', 'pieces']);
  const names = { corners: 'Ecken', sides: 'gerade Seiten', edges: 'Kanten', faces: 'Flächen', pieces: 'Formen' };
  let remaining = c.limit;
  const items = selected.map((shape, index) => {
    const perShape = property === 'pieces' ? 1 : shape[property];
    const reserve = selected.slice(index + 1).reduce((total, other) => total + (property === 'pieces' ? 1 : other[property]), 0);
    const count = c.int(1, perShape ? Math.min(c.level === 0 ? 5 : 6, Math.floor((remaining - reserve) / perShape)) : 6);
    remaining -= count * perShape;
    return { name: shape.name, count, title: shape.title, perShape };
  });
  const total = sum(items.map(item => item.count * item.perShape));
  return { prompt: `Die ${solids ? 'Körper' : 'Formen'} liegen einzeln nebeneinander. Wie viele ${names[property]} haben sie zusammen?`,
    display: items.map(item => `${item.count} ${item.title}`).join(' + '), answer: String(total), unit: names[property],
    hint: property === 'pieces' ? 'Zähle die Anzahl aller Formen zusammen.' : `Finde die Anzahl der ${names[property]} bei einer Form. Zähle dann für jede Gruppe und addiere.`,
    explanation: [...items.map(item => `${item.count} ${item.title}: ${item.count} · ${item.perShape} = ${item.count * item.perShape} ${names[property]}.`),
      `Zusammen: ${items.map(item => item.count * item.perShape).join(' + ')} = ${total}.`],
    meta: { kind: 'shapeinventory', property, items: items.map(({ name, count }) => ({ name, count })) } };
}

export function mirrorTask(c) {
  if (c.int(0, 1) === 0) {
    const length = c.int(3, c.level === 0 ? 4 : 6);
    const left = Array.from({ length }, () => c.int(1, c.level === 0 ? 9 : 20));
    const values = [...left, ...left.toReversed()];
    const blank = c.int(0, values.length - 1);
    return { prompt: 'Die Zahlenreihe soll links und rechts der Spiegelachse genau zusammenpassen. Welche Zahl fehlt?',
      display: values.map((value, index) => `${index === length ? '│ ' : ''}${index === blank ? '□' : value}`).join('   '), answer: String(values[blank]),
      hint: 'Die beiden Zahlen direkt neben der Achse gehören zusammen. Gehe von dort auf beiden Seiten gleich weit nach außen.',
      explanation: [`Das Kästchen steht an Stelle ${blank + 1}. Die passende Spiegelstelle ist ${values.length - blank}.`,
        `An der Spiegelstelle steht ${values[values.length - blank - 1]}. Deshalb gehört diese Zahl ins Kästchen.`],
      meta: { kind: 'mirrorpattern', values, blank } };
  }
  const rows = c.pick([4, 6, 8]), cols = c.pick([4, 6, 8]);
  const row = c.int(0, rows - 1), col = c.int(0, cols - 1);
  const vertical = c.int(0, 1) === 0;
  const size = vertical ? cols : rows;
  const answer = size - (vertical ? col : row);
  return { prompt: `Spiegle den Stern an der ${vertical ? 'senkrechten' : 'waagerechten'} Mittellinie. In welcher ${vertical ? 'Spalte' : 'Zeile'} liegt sein Spiegelbild?`,
    display: `Zähle Zeilen von oben und Spalten von links ab 1. Die Achse liegt zwischen ${vertical ? 'Spalte' : 'Zeile'} ${size / 2} und ${size / 2 + 1}.`,
    answer: String(answer), unit: vertical ? 'Spalte' : 'Zeile',
    visual: { type: 'grid', rows, cols, items: [{ row, col, label: '★' }] },
    hint: 'Das Spiegelbild liegt auf der anderen Seite der Mittellinie, gleich weit von ihr entfernt.',
    explanation: [`Der Stern steht in Zeile ${row + 1}, Spalte ${col + 1}.`,
      `Bei ${size} ${vertical ? 'Spalten' : 'Zeilen'} gehören die Positionen 1 und ${size}, 2 und ${size - 1} zusammen.`,
      `Die gesuchte Position ist ${size + 1} − ${vertical ? col + 1 : row + 1} = ${answer}.`],
    meta: { kind: 'mirrorposition', rows, cols, row, col, vertical } };
}

export function fractionQuantity(c) {
  const parts = c.pick(c.level === 0 ? [2, 4] : c.level === 1 ? [2, 3, 4] : [2, 3, 4, 5, 6, 8, 10]);
  const numerator = c.level === 0 ? 1 : c.int(1, parts - 1);
  const share = c.int(1, Math.floor((c.level === 0 ? 100 : c.limit) / parts));
  const total = share * parts, selected = share * numerator;
  const mode = c.pick(['part', 'rest', 'whole']);
  const answer = mode === 'part' ? selected : mode === 'rest' ? total - selected : total;
  return { prompt: mode === 'whole' ? `${share} Murmeln sind genau ein gleich großer Teil von ${parts} Teilen. Wie viele Murmeln sind es insgesamt?`
    : `Du verteilst ${total} Murmeln gleichmäßig auf ${parts} Schalen. ${mode === 'part' ? `Wie viele Murmeln liegen in ${numerator} ${numerator === 1 ? 'Schale' : 'Schalen'}?` : `Du nimmst ${numerator} ${numerator === 1 ? 'Schale' : 'Schalen'} weg. Wie viele Murmeln bleiben in den übrigen Schalen?`}`,
    display: mode === 'whole' ? `Ein Anteil 1/${parts}: ${share} Murmeln` : `Das Ganze: ${total} Murmeln · ${numerator}/${parts} ${mode === 'part' ? 'gesucht' : 'weggenommen'}`,
    answer: String(answer), unit: 'Murmeln',
    hint: mode === 'whole' ? 'Wenn ein Teil bekannt ist, nimm ihn so oft, wie es Teile gibt.' : 'Teile zuerst die ganze Menge durch die Anzahl der gleich großen Teile.',
    explanation: mode === 'whole' ? [`${parts} gleiche Teile mit je ${share} Murmeln: ${parts} · ${share} = ${total}.`]
      : [`In einer Schale liegen ${total} : ${parts} = ${share} Murmeln.`,
        `${numerator} ${numerator === 1 ? 'Schale enthält' : 'Schalen enthalten'} ${numerator} · ${share} = ${selected} Murmeln.`,
        mode === 'rest' ? `Übrig bleiben ${total} − ${selected} = ${answer} Murmeln.` : `Der Anteil ${numerator}/${parts} beträgt ${answer} Murmeln.`],
    meta: { kind: 'fractionquantity', parts, numerator, share, total, mode } };
}

export function bagChance(c) {
  const colors = ['rot', 'blau', 'grün'];
  const counts = [c.int(0, 8), c.int(0, 6), c.int(0, 6)];
  if (sum(counts) === 0) counts[c.int(0, 2)] = 1;
  const index = c.int(0, 2), excluded = c.int(0, 1) === 1;
  const favorable = excluded ? sum(counts) - counts[index] : counts[index];
  const numeric = c.level === 2 && c.int(0, 1) === 0;
  const answer = numeric ? String(favorable) : favorable === 0 ? 'Unmöglich' : favorable === sum(counts) ? 'Sicher' : 'Möglich, aber nicht sicher';
  return { prompt: numeric ? `Wie viele Kugeln im Beutel sind ${excluded ? 'nicht ' : ''}${colors[index]}?`
    : `Du ziehst ohne Hinzusehen eine Kugel. Sie ist ${excluded ? 'nicht ' : ''}${colors[index]}. Ist das sicher, möglich oder unmöglich?`,
    display: `${counts[0]} rote, ${counts[1]} blaue und ${counts[2]} grüne Kugeln`, answer,
    ...(numeric ? { unit: 'Kugeln' } : { input: 'choice', choices: ['Sicher', 'Möglich, aber nicht sicher', 'Unmöglich'] }),
    hint: excluded ? '„Nicht“ bedeutet: Zähle die Kugeln der anderen Farben.' : 'Sicher: alle Kugeln passen. Unmöglich: keine passt. Sonst ist es möglich, aber nicht sicher.',
    explanation: [`Von insgesamt ${sum(counts)} Kugeln passen ${favorable} zur Beschreibung „${excluded ? 'nicht ' : ''}${colors[index]}“.`,
      numeric ? `Es sind ${favorable} Kugeln.` : favorable === 0 ? 'Keine Kugel passt. Das Ereignis ist unmöglich.'
        : favorable === sum(counts) ? 'Alle Kugeln passen. Das Ereignis ist sicher.' : 'Einige Kugeln passen, andere nicht. Es ist möglich, aber nicht sicher.'],
    meta: { kind: 'bagchance', counts, index, excluded, numeric } };
}

export function branchingChoices(c) {
  const branchNames = c.shuffle(['rot', 'blau', 'gelb', 'grün']);
  const count = c.int(2, 4);
  const branches = Array.from({ length: count }, () => c.int(1, c.level === 0 ? 5 : c.level === 1 ? 10 : 20));
  const mode = c.level > 0 && c.int(0, 1) === 0 ? 'remaining' : 'all';
  const unavailable = mode === 'remaining' ? c.int(0, count - 1) : -1;
  const answer = sum(branches) - (unavailable < 0 ? 0 : branches[unavailable]);
  return { prompt: `Du wählst ein Armband aus einer Farbe und einem Muster. Jede Farbe gibt es mit den unten genannten unterschiedlichen Mustern.${unavailable < 0 ? '' : ` Die Farbe ${branchNames[unavailable]} ist ausverkauft.`} Wie viele verschiedene Armbänder kannst du wählen?`,
    display: branches.map((value, index) => `${branchNames[index]}: ${value} Muster`).join(' · '), answer: String(answer), unit: 'Möglichkeiten',
    hint: 'Zähle die Muster aller verfügbaren Farben zusammen. Jede Kombination aus Farbe und Muster zählt einmal.',
    explanation: [unavailable < 0 ? 'Alle Farben sind verfügbar.' : `Die ${branches[unavailable]} Muster in ${branchNames[unavailable]} fallen weg.`,
      `${branches.filter((_, index) => index !== unavailable).join(' + ')} = ${answer} Möglichkeiten.`],
    meta: { kind: 'branchingchoices', branches, unavailable } };
}

export function areaPieces(c) {
  const maxWidth = c.level === 0 ? 5 : 8, rowCount = c.int(2, c.level === 0 ? 4 : 6);
  const widths = Array.from({ length: rowCount }, () => c.int(1, maxWidth));
  const mode = c.level === 2 && c.int(0, 1) === 0 ? 'fill' : 'count';
  const total = sum(widths), cols = Math.max(...widths);
  const answer = mode === 'fill' ? cols * rowCount - total : total;
  return { prompt: mode === 'fill' ? 'Wie viele Kästchen fehlen, um das Raster ganz zu füllen?' : 'Wie viele gefüllte Kästchen gehören zur Figur?',
    display: '■ ist ein gefülltes Kästchen. Punkte sind freie Plätze.', answer: String(answer), unit: 'Kästchen',
    visual: { type: 'grid', rows: rowCount, cols, items: widths.flatMap((width, row) => Array.from({ length: width }, (_, col) => ({ row, col, label: '■' }))) },
    hint: mode === 'fill' ? 'Zähle in jeder Reihe die freien Plätze oder ziehe die gefüllten Plätze von allen Plätzen ab.' : 'Zähle die Kästchen Reihe für Reihe und addiere die Anzahlen.',
    explanation: [`Die Reihen enthalten ${widths.join(', ')} gefüllte Kästchen.`, `${widths.join(' + ')} = ${total} gefüllte Kästchen.`,
      mode === 'fill' ? `Im ganzen Raster gibt es ${cols} · ${rowCount} = ${cols * rowCount} Plätze. Es fehlen ${cols * rowCount} − ${total} = ${answer} Kästchen.` : `Die Fläche besteht aus ${total} Kästchen.`],
    meta: { kind: 'areapieces', widths, mode } };
}

export function borderTask(c) {
  if (c.int(0, 1) === 0) {
    const sides = Array.from({ length: 4 }, () => c.int(2, c.level === 0 ? 5 : c.grade === 2 ? 20 : 50));
    // Four lengths form a non-degenerate quadrilateral only if the longest
    // is shorter than the other three together.
    const largest = sides.indexOf(Math.max(...sides));
    sides[largest] = Math.min(sides[largest], sum(sides) - sides[largest] - 1);
    return { prompt: 'Ein Viereck hat diese vier Seitenlängen. Wie lang ist sein ganzer Rand?',
      display: sides.map((length, index) => `Seite ${index + 1}: ${length} cm`).join(' · '), answer: String(sum(sides)), unit: 'cm',
      hint: 'Addiere alle vier Seiten. Du gehst einmal außen um das Viereck herum.',
      explanation: [`${sides.join(' + ')} = ${sum(sides)} cm. Der Umfang ist die Summe aller Seitenlängen.`],
      meta: { kind: 'borderlengths', sides } };
  }
  const width = c.int(2, c.level === 0 ? 6 : c.grade === 2 ? 20 : 50);
  const height = c.int(1, c.level === 0 ? 10 - width : c.grade === 2 ? 20 : 40);
  const opening = c.int(1, width);
  const perimeter = 2 * (width + height), answer = perimeter - opening;
  return { prompt: `Ein rechteckiger Garten bekommt einen Zaun. Für ein ${opening} m breites Tor bleibt eine Lücke. Wie viele Meter Zaun werden gebraucht?`,
    display: `${width} m breit · ${height} m lang · Tor: ${opening} m`, answer: String(answer), unit: 'm',
    hint: 'Berechne zuerst den ganzen Rand. Ziehe danach die Breite des Tores ab.',
    explanation: [`Ganzer Rand: ${width} + ${height} + ${width} + ${height} = ${perimeter} m.`, `${perimeter} − ${opening} = ${answer} m Zaun.`],
    meta: { kind: 'fencegap', width, height, opening } };
}

export function chartQuestions(c) {
  const labels = c.shuffle(['Fußball', 'Schwimmen', 'Tanzen', 'Turnen']).slice(0, c.level === 0 ? 3 : 4);
  const values = labels.map(() => c.int(1, c.level === 0 ? 9 : c.grade === 2 ? 20 : 50));
  const indices = c.shuffle(labels.map((_, index) => index)).slice(0, 2);
  const [first, second] = indices;
  const mode = c.pick(['pair', 'difference', 'without']);
  const answer = mode === 'pair' ? values[first] + values[second] : mode === 'difference' ? Math.abs(values[first] - values[second]) : sum(values) - values[first];
  return { prompt: mode === 'pair' ? `Wie viele Stimmen haben ${labels[first]} und ${labels[second]} zusammen?`
    : mode === 'difference' ? `Wie groß ist der Unterschied zwischen den Stimmen für ${labels[first]} und ${labels[second]}?`
      : `Wie viele Stimmen haben alle Sportarten außer ${labels[first]} zusammen?`,
    display: 'Jedes Kind hat eine Lieblingssportart gewählt.', answer: String(answer), unit: 'Stimmen',
    visual: { type: 'bars', labels, values, unit: 'Stimmen' },
    hint: mode === 'difference' ? 'Ziehe die kleinere der beiden Stimmenzahlen von der größeren ab.' : 'Lies nur die gesuchten Sportarten ab und zähle ihre Stimmen zusammen.',
    explanation: [labels.map((label, index) => `${label}: ${values[index]}`).join(', ') + '.',
      mode === 'difference' ? `${Math.max(values[first], values[second])} − ${Math.min(values[first], values[second])} = ${answer}.`
        : `${(mode === 'pair' ? indices.map(index => values[index]) : values.filter((_, index) => index !== first)).join(' + ')} = ${answer}.`],
    meta: { kind: 'chartquestions', values, first, second, mode } };
}

export function gridJourney(c) {
  const rows = c.int(4, c.level === 0 ? 5 : 8), cols = c.int(4, c.level === 0 ? 5 : 8);
  const start = { row: c.int(0, rows - 1), col: c.int(0, cols - 1) };
  const horizontal = c.int(0, 1) === 0;
  const axis = horizontal ? 'col' : 'row', size = horizontal ? cols : rows;
  const possible = Array.from({ length: size }, (_, value) => value).filter(value => value !== start[axis]);
  const end = { ...start, [axis]: c.pick(possible) };
  const delta = end[axis] - start[axis];
  const direction = horizontal ? delta > 0 ? 'rechts' : 'links' : delta > 0 ? 'unten' : 'oben';
  return { prompt: `Starte beim Stern. Gehe ${Math.abs(delta)} ${Math.abs(delta) === 1 ? 'Feld' : 'Felder'} nach ${direction}. In welcher ${horizontal ? 'Spalte' : 'Zeile'} landest du?`,
    display: 'Zähle Zeilen von oben und Spalten von links ab 1. Das Startfeld zählt nicht als Schritt.', answer: String(end[axis] + 1), unit: horizontal ? 'Spalte' : 'Zeile',
    visual: { type: 'grid', rows, cols, items: [{ ...start, label: '★' }] },
    hint: 'Setze einen Finger auf den Stern. Bewege ihn für jeden Schritt genau ein Kästchen in die genannte Richtung.',
    explanation: [`Der Stern startet in Zeile ${start.row + 1}, Spalte ${start.col + 1}.`,
      `${start[axis] + 1} ${delta > 0 ? '+' : '−'} ${Math.abs(delta)} = ${end[axis] + 1}. Du landest in ${horizontal ? 'Spalte' : 'Zeile'} ${end[axis] + 1}.`],
    meta: { kind: 'gridjourney', rows, cols, start, horizontal, delta } };
}
