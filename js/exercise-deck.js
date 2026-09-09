import { TOPICS, generateExercise } from './engine.js';

export const HISTORY_LIMIT = 1000;

// Identify the task the child sees, independently of random IDs, answer ordering,
// distractors, explanations and difficulty labels. Store only compact fingerprints.
export function exerciseKey(exercise) {
  const canonical = value => Array.isArray(value) ? value.map(canonical)
    : value && typeof value === 'object'
      ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
  let visual = exercise.visual || null;
  if (visual?.type === 'grid') visual = { ...visual,
    items: [...visual.items].sort((a, b) => a.row - b.row || a.col - b.col) };
  const text = JSON.stringify(canonical([exercise.prompt, exercise.display, exercise.unit || '', visual]));
  let first = 2166136261, second = 5381;
  for (let i = 0; i < text.length; i += 1) {
    first = Math.imul(first ^ text.charCodeAt(i), 16777619);
    second = Math.imul(second, 33) ^ text.charCodeAt(i);
  }
  return [first, second].map(value => (value >>> 0).toString(16).padStart(8, '0')).join('');
}

/** One shared selection path for rounds, examples and worksheets.
 * A batch never repeats. Previously seen tasks are used only when sampling finds
 * no new task in this topic; then the least recently seen eligible task wins.
 * History is returned transactionally and stays bounded across long-term use.
 */
export function createExerciseBatch(options, length, { history = [], rng = Math.random } = {}) {
  if (!Number.isInteger(length) || length < 1 || length > 20) throw new RangeError('Eine Runde enthält 1 bis 20 Aufgaben.');
  const recent = new Map(history.slice(-HISTORY_LIMIT).map((key, index) => [key, index]));
  const blocked = new Set(), exercises = [];
  let sequence = history.length, topicBag = [];
  const nextTopic = () => {
    if (options.topic !== 'mixed') return options.topic;
    if (!topicBag.length) {
      topicBag = TOPICS.filter(topic => topic.grades.includes(options.grade)).map(topic => topic.id);
      for (let i = topicBag.length - 1; i > 0; i -= 1) {
        const value = rng();
        if (!Number.isFinite(value) || value < 0 || value >= 1) throw new RangeError('Ungültiger Zufallswert.');
        const j = Math.floor(value * (i + 1));
        [topicBag[i], topicBag[j]] = [topicBag[j], topicBag[i]];
      }
    }
    return topicBag.pop();
  };
  for (let index = 0; index < length; index += 1) {
    const topic = nextTopic();
    let selected = null, selectedKey, oldest = Infinity;
    for (let attempt = 0; attempt < 600; attempt += 1) {
      const candidate = generateExercise({ ...options, topic }, rng), key = exerciseKey(candidate);
      if (blocked.has(key)) continue;
      if (!recent.has(key)) { selected = candidate; selectedKey = key; break; }
      if (recent.get(key) < oldest) { selected = candidate; selectedKey = key; oldest = recent.get(key); }
    }
    // Fail explicitly instead of silently filling a round with duplicates.
    if (!selected) throw new RangeError('Für diese Auswahl konnten keine weiteren unterschiedlichen Aufgaben erstellt werden.');
    exercises.push(selected);
    blocked.add(selectedKey);
    recent.delete(selectedKey);
    recent.set(selectedKey, sequence++);
  }
  return { exercises, history: [...recent.keys()].slice(-HISTORY_LIMIT) };
}
