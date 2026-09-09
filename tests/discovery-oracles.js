import assert from 'node:assert/strict';

// Fixed mathematical facts, intentionally separate from the generator's catalog.
const properties = {
  triangle: { corners: 3, sides: 3 }, square: { corners: 4, sides: 4 },
  rectangle: { corners: 4, sides: 4 }, circle: { corners: 0, sides: 0 },
  cube: { corners: 8, edges: 12, faces: 6 }, cuboid: { corners: 8, edges: 12, faces: 6 },
};

export function discoveryAnswer(exercise) {
  const m = exercise.meta;
  switch (m.kind) {
    case 'shapeinventory': return m.items.reduce((total, item) => total + item.count * (m.property === 'pieces' ? 1 : properties[item.name][m.property]), 0);
    case 'mirrorpattern': return m.values.at(-m.blank - 1);
    case 'mirrorposition': return m.vertical ? m.cols - m.col : m.rows - m.row;
    case 'fractionquantity': return m.mode === 'whole' ? m.share * m.parts : m.total / m.parts * (m.mode === 'part' ? m.numerator : m.parts - m.numerator);
    case 'bagchance': {
      const total = m.counts.reduce((a, b) => a + b, 0);
      const matches = m.counts.filter((_, index) => m.excluded ? index !== m.index : index === m.index).reduce((a, b) => a + b, 0);
      return m.numeric ? matches : matches === 0 ? 'Unmöglich' : matches === total ? 'Sicher' : 'Möglich, aber nicht sicher';
    }
    case 'branchingchoices': return m.branches.filter((_, index) => index !== m.unavailable).reduce((a, b) => a + b, 0);
    case 'areapieces': return m.widths.reduce((total, width) => total + (m.mode === 'fill' ? Math.max(...m.widths) - width : width), 0);
    case 'borderlengths': return m.sides.reduce((a, b) => a + b, 0);
    case 'fencegap': return m.width + m.height + m.width + m.height - m.opening;
    case 'chartquestions': return m.mode === 'pair' ? m.values[m.first] + m.values[m.second]
      : m.mode === 'difference' ? Math.abs(m.values[m.first] - m.values[m.second]) : m.values.filter((_, index) => index !== m.first).reduce((a, b) => a + b, 0);
    case 'gridjourney': return (m.horizontal ? m.start.col : m.start.row) + m.delta + 1;
    default: return undefined;
  }
}

export function verifyDiscoveryData(exercise, grade) {
  const m = exercise.meta;
  const assertInteger = value => assert.ok(Number.isSafeInteger(value) && value >= 0, `${m.kind}: invalid integer ${value}`);
  const expected = discoveryAnswer(exercise);
  if (expected === undefined) return;
  if (typeof expected === 'number') {
    assertInteger(expected);
    assert.ok(expected <= (grade === 2 ? 100 : 1000), `${m.kind} exceeds the grade's number range`);
  }
  if (m.kind === 'mirrorpattern') {
    assert.deepEqual(m.values, m.values.toReversed());
    assert.equal(exercise.display.match(/□/g).length, 1);
  }
  if (m.kind === 'fractionquantity') {
    assert.equal(m.total, m.parts * m.share);
    assert.ok(m.parts >= 2 && m.numerator > 0 && m.numerator < m.parts);
  }
  if (m.kind === 'bagchance') {
    m.counts.forEach(assertInteger);
    assert.ok(m.counts.reduce((a, b) => a + b, 0) > 0, 'A drawing bag cannot be empty');
  }
  if (m.kind === 'borderlengths') assert.ok(2 * Math.max(...m.sides) < m.sides.reduce((a, b) => a + b, 0), 'Four sides must form a non-degenerate quadrilateral');
  if (m.kind === 'fencegap') assert.ok(m.opening > 0 && m.opening <= m.width, 'Gate must fit in the garden side');
  if (m.kind === 'shapeinventory') for (const item of m.items) assert.ok(item.count >= 1 && Number.isSafeInteger(item.count));
  if (m.kind === 'areapieces') assert.equal(exercise.visual.items.length, m.widths.reduce((a, b) => a + b, 0));
  if (m.kind === 'gridjourney') assert.ok(expected >= 1 && expected <= (m.horizontal ? m.cols : m.rows), 'Journey stays inside the visible grid');
  if (exercise.visual?.type === 'grid') {
    const { rows, cols, items } = exercise.visual;
    assert.ok(rows <= 8 && cols <= 8, 'Grid must fit the supported renderer');
    assert.equal(new Set(items.map(({ row, col }) => `${row},${col}`)).size, items.length);
    for (const { row, col } of items) assert.ok(row >= 0 && row < rows && col >= 0 && col < cols);
  }
}
