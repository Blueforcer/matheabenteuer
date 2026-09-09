import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { TOPICS } from '../js/engine.js';

// Use an installed Playwright, optionally supplied through NODE_PATH or PLAYWRIGHT_MODULE.
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const url = process.env.MOBILE_TEST_URL || 'http://127.0.0.1:4173';
const output = path.resolve(process.env.MOBILE_SCREENSHOTS || 'test-results/mobile');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome' });
const errors = [];

async function noOverflow(page, label) {
  const size = await page.evaluate(() => ({ width: innerWidth, content: document.documentElement.scrollWidth }));
  assert.ok(size.content <= size.width, `${label}: ${size.content}px content exceeds ${size.width}px viewport`);
  const content = await page.locator('.exercise-card, .equation, .choice, .keypad, .spatial-grid, .chart-visual, .area-grid, .group-visual, .written-visual, #help-content').evaluateAll(elements => elements.filter(element => element.checkVisibility()).map(element => {
    const bounds = element.getBoundingClientRect();
    return { name: element.className || element.id, left: bounds.left, right: bounds.right, width: element.clientWidth, content: element.scrollWidth };
  }));
  for(const element of content) {
    assert.ok(element.left >= -1 && element.right <= size.width + 1, `${label}: ${element.name} extends beyond the viewport`);
    assert.ok(element.content <= element.width + 1, `${label}: ${element.name} clips ${element.content - element.width}px of content`);
  }
  const modal = page.locator('dialog[open]');
  if(await modal.count()) {
    const dimensions = await modal.evaluate(element => ({ client: element.clientWidth, scroll: element.scrollWidth }));
    assert.ok(dimensions.scroll <= dimensions.client + 1, `${label}: dialog content overflows`);
  }
}

try {
  for(const [width, height] of [[320,568], [375,667], [390,844], [430,932]]) {
    const context = await browser.newContext({ viewport: { width, height }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(url);
    await page.locator('#quick-start').waitFor();
    await noOverflow(page, `home ${width}`);
    assert.equal(await page.locator('[data-topic]:visible').count(), 6);
    assert.match(await page.locator('.companion-banner').innerText(), /Fine/);
    const nodes = await page.locator('.daily-goal .mission-node').evaluateAll(elements => elements.map(element => element.getBoundingClientRect().top));
    assert.equal(new Set(nodes).size, 1, 'All five mission steps share one row');
    await page.screenshot({ path: path.join(output, `home-${width}.png`), fullPage: true });
    await page.locator('#more-topics').click();
    assert.equal(await page.locator('[data-topic]:visible').count(), 26);
    await page.locator('#more-topics').click();
    await page.locator('[data-category="Alltag"]').click();
    assert.ok(await page.locator('[data-topic="weights"]').isVisible());
    await page.locator('[data-view="parents"]').first().click();
    await noOverflow(page, `parents ${width}`);
    await page.locator('#manage-profiles').click();
    await noOverflow(page, `profiles ${width}`);
    await page.screenshot({ path: path.join(output, `profiles-${width}.png`) });
    await page.locator('#modal-close').click();
    await page.locator('[data-view="home"]').first().click();
    await page.locator('#round-length').selectOption('5');
    await page.locator('#quick-start').click();
    await noOverflow(page, `round dialog ${width}`);
    await page.locator('#start-round').click();
    await noOverflow(page, `practice ${width}`);
    const buddyBounds = await page.locator('.companion-banner').boundingBox();
    assert.ok(buddyBounds.y >= 0 && buddyBounds.y + buddyBounds.height < height, `Companion is immediately visible at ${width}`);
    for(const button of await page.locator('.keypad .key').all()) {
      const bounds = await button.boundingBox();
      assert.ok(bounds.width >= 44 && bounds.height >= 44, `Key target is at least 44px at ${width}`);
    }
    await page.screenshot({ path: path.join(output, `practice-${width}.png`), fullPage: true });
    for(let question = 0; question < 5; question += 1) {
      await page.locator('#solution-button').click();
      await page.locator('#next-question').click();
    }
    assert.match(await page.locator('.summary-card .companion-banner').innerText(), /Geschafft/);
    await noOverflow(page, `summary ${width}`);
    await page.locator('[data-view="progress"]').last().click();
    await noOverflow(page, `shop ${width}`);
    await page.evaluate(() => {
      const stored = JSON.parse(localStorage.getItem('matheabenteuer.v1'));
      stored.profiles[0].owned.push('penguin'); stored.profiles[0].companion = 'penguin';
      localStorage.setItem('matheabenteuer.v1', JSON.stringify(stored));
    });
    await page.reload();
    assert.match(await page.locator('.companion-banner').innerText(), /Pippa/);
    await page.locator('[data-category="Alltag"]').click();
    await page.locator('[data-topic="weights"]').click();
    await page.locator('#start-round').click();
    assert.match(await page.locator('.companion-banner').innerText(), /Pippa/);
    await noOverflow(page, `weights ${width}`);
    await page.screenshot({ path: path.join(output, `weights-${width}.png`), fullPage: true });
    await context.close();
    console.log(`${width}×${height}: home, all topics, profiles, parents, practice, summary, shop and chosen companion verified`);
  }
  const context = await browser.newContext({ viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  for(const topic of TOPICS) {
    const target = new URL(url);
    target.searchParams.set('mobile-topic', topic.id);
    target.hash = 'klasse=3&stufe=hard&reihe=0&runde=5';
    await page.goto(target.href);
    if(await page.locator('#more-topics').isVisible()) await page.locator('#more-topics').click();
    await page.locator(`[data-topic="${topic.id}"]`).click();
    await page.locator('#start-round').click();
    await noOverflow(page, `all topics ${topic.id}/3/hard at 320`);
    await page.locator('#hint-button').click();
    assert.ok(await page.locator('#help-content').isVisible());
    await noOverflow(page, `hint ${topic.id}/3/hard at 320`);
    await page.locator('#solution-button').click();
    await noOverflow(page, `solution ${topic.id}/3/hard at 320`);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: path.join(output, `topic-${topic.id}-320.png`), fullPage: true });
  }
  await context.close();
  console.log('All 31 topics: class 3, hard difficulty, 320px task, hint and solution content verified without clipping');
  assert.deepEqual(errors, [], 'No browser JavaScript errors');
  console.log(`Mobile screenshots: ${output}`);
} finally {
  await browser.close();
}
