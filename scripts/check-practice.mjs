/** Browser smoke test. Start npm run dev first. Install Playwright separately or
 * set PLAYWRIGHT_MODULE to its package directory. Uses an isolated profile.
 * Optional: APP_URL, PLAYWRIGHT_CHANNEL, PLAYWRIGHT_EXECUTABLE_PATH.
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
  ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}) });
const context = await browser.newContext({ viewport: { width: 1365, height: 1000 }, locale: 'de-DE' });
const page = await context.newPage();
page.setDefaultTimeout(10000);
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const seen = new Set();
const key = ([prompt, display]) => JSON.stringify([prompt.trim(), display.trim()]);
const readTask = () => page.locator('.exercise-card').evaluate(card => [card.querySelector('.exercise-prompt').textContent, card.querySelector('.equation').textContent]);
const history = () => page.evaluate(() => {
  const state = JSON.parse(localStorage.getItem('matheabenteuer.v1'));
  return state.profiles.find(profile => profile.id === state.active).exerciseHistory;
});
function remember(task) {
  const identity = key(task);
  assert.ok(!seen.has(identity), `Unexpected duplicate: ${identity}`);
  seen.add(identity);
}
async function answerTask([prompt, display]) {
  const choices = await page.locator('.choice').allTextContents();
  const values = [...display.matchAll(/\d+(?:[.,]\d+)?/g)].map(match => Number(match[0].replace(',', '.')));
  let answer;
  if (choices.includes('kg')) {
    const gramObjects = ['Büroklammer', 'Apfel', 'Teebeutel', 'Brief', 'Tafel Schokolade', 'Erdbeere', 'Hühnerei', 'Scheibe Brot', 'Radiergummi', 'Bleistift', 'Münze', 'Tennisball'];
    answer = gramObjects.some(object => prompt.includes(object)) ? 'g' : 'kg';
  } else if (choices.includes('<')) {
    answer = values[0] < values[1] ? '<' : values[0] > values[1] ? '>' : '=';
  } else {
    assert.equal(values.length, 2, `Unsupported weight question: ${prompt} ${display}`);
    answer = String(display.includes('+') ? values[0] + values[1] : values[0] - values[1]);
  }
  if (choices.length) await page.getByRole('button', { name: answer, exact: true }).click();
  else await page.locator('#answer-input').fill(answer);
  await page.locator('#check-answer').click();
  assert.ok(await page.locator('#feedback.success').isVisible(), `Answer ${answer} rejected for ${prompt} ${display}`);
}
async function completeRound({ guidedFirst = false } = {}) {
  let guided;
  for (let index = 0; index < 20; index += 1) {
    const task = await readTask();
    remember(task);
    assert.match(await page.locator('.round-track').getAttribute('aria-label'), new RegExp(`Aufgabe ${index + 1} von 20`));
    if (guidedFirst && index === 0) {
      guided = task;
      await page.locator('#solution-button').click();
      assert.ok(await page.locator('#feedback.guided').isVisible());
    } else await answerTask(task);
    await page.locator('#next-question').click();
  }
  await page.locator('.summary-card').waitFor();
  return guided;
}

try {
  await page.addInitScript(() => { window.print = () => { window.__printCalls = (window.__printCalls || 0) + 1; }; });
  await page.goto(process.env.APP_URL || 'http://127.0.0.1:4173');
  await page.locator('#round-length').selectOption('20');
  await page.locator('[data-topic="weights"]').click();
  await page.locator('#example-button').click();
  const example = [await page.locator('#modal-body > p').first().textContent(), await page.locator('.example-equation').textContent()];
  remember(example);
  await page.locator('#example-start').click();
  const guided = await completeRound({ guidedFirst: true });
  assert.equal((await history()).length, 21, 'Example and full round share one persisted history');

  // The explicit review button is allowed to repeat the one task the child requested.
  await page.locator('#repeat-missed').click();
  assert.equal(key(await readTask()), key(guided));
  assert.equal(await page.locator('.round-track').getAttribute('aria-label'), 'Aufgabe 1 von 1');
  await answerTask(guided);
  await page.locator('#next-question').click();
  assert.equal((await history()).length, 21, 'An explicit review does not generate or record an unrelated task');

  await page.locator('#another-round').click();
  await completeRound();
  assert.equal((await history()).length, 41);
  await page.getByRole('button', { name: 'Für heute geschafft', exact: true }).click();
  await page.locator('[data-topic="weights"]').click();
  await page.locator('#worksheet-button').click();
  const worksheet = await page.locator('#print-sheet .worksheet-grid article').evaluateAll(articles => articles.map(article => [
    article.querySelector('strong').textContent.replace(/^\d+\.\s*/, ''), article.querySelector('.worksheet-display').textContent,
  ]));
  assert.equal(worksheet.length, 16);
  worksheet.forEach(remember);
  assert.equal(await page.evaluate(() => window.__printCalls), 1);
  const beforeReload = await history();
  assert.equal(beforeReload.length, 57);

  await page.reload();
  await page.locator('[data-topic="weights"]').waitFor();
  assert.deepEqual(await history(), beforeReload, 'History survives reload');
  await page.locator('[data-topic="weights"]').click();
  await page.locator('#start-round').click();
  await completeRound();
  assert.equal((await history()).length, 77);
  assert.equal(seen.size, 77);
  assert.deepEqual(errors, [], 'No uncaught browser errors');
  console.log('Practice smoke passed: 77 distinct tasks across an example, three 20-task rounds, a 16-task worksheet and reload; explicit one-task review passed; no browser errors.');
} finally {
  await context.close();
  await browser.close();
}
