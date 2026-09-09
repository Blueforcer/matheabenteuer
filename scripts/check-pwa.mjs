import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = fileURLToPath(new URL('../', import.meta.url));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
let updated = false;
// Serve the same app at / and at a GitHub-Pages-style repository subdirectory.
const server = http.createServer(async (req, res) => {
  try {
    let name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (name.startsWith('/matheabenteuer/')) name = name.slice('/matheabenteuer'.length);
    if (name.endsWith('/')) name += 'index.html';
    const filename = path.resolve(root, '.' + name);
    if (!filename.startsWith(root)) { res.writeHead(403).end(); return; }
    let content = await readFile(filename);
    if (name === '/sw.js' && updated) content = Buffer.from(content.toString().replace('2026-09-09-v1', '2026-09-09-test-update'));
    res.writeHead(200, { 'Content-Type': types[path.extname(filename)] || 'text/plain', 'Cache-Control': 'no-store' }).end(content);
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome' });

try {
  for (const prefix of ['/', '/matheabenteuer/']) {
    updated = false;
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.setDefaultTimeout(12000);
    await context.addInitScript(() => {
      if (!localStorage.getItem('matheabenteuer.v1')) localStorage.setItem('matheabenteuer.v1', JSON.stringify({
        version: 1, active: 'legacy', profiles: [{ id: 'legacy', name: 'Test', avatar: '🦇', xp: 1000, coins: 31, solved: 120, rounds: 12, owned: ['fine'], companion: 'fine' }],
        settings: { grade: 2, difficulty: 'easy', length: 5 }
      }));
    });
    await page.goto(origin + prefix);
    await page.locator('#quick-start').waitFor();
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(() => navigator.serviceWorker.controller);
    const manifest = await page.evaluate(async () => {
      const url = document.querySelector('link[rel="manifest"]').href;
      const data = await (await fetch(url)).json();
      return { url, data, icons: await Promise.all(data.icons.map(icon => new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve([image.naturalWidth, image.naturalHeight]);
        image.onerror = reject; image.src = new URL(icon.src, url).href;
      }))) };
    });
    assert.equal(new URL(manifest.data.start_url, manifest.url).pathname, prefix);
    assert.equal(new URL(manifest.data.scope, manifest.url).pathname, prefix);
    assert.equal(manifest.data.display, 'standalone');
    assert.deepEqual(manifest.icons, [[192, 192], [512, 512], [512, 512]]);
    const cdp = await context.newCDPSession(page);
    const installability = await cdp.send('Page.getInstallabilityErrors');
    // Playwright's isolated contexts are incognito; that browser-level install
    // restriction is expected. All manifest/icon/application criteria must pass.
    assert.deepEqual(installability.installabilityErrors.filter(error => error.errorId !== 'in-incognito'), [], 'Chrome installability criteria pass');

    await page.locator('#fullscreen-button').click();
    await page.waitForFunction(() => document.fullscreenElement === document.documentElement);
    assert.equal(await page.locator('#fullscreen-button').getAttribute('aria-pressed'), 'true');
    await page.locator('#fullscreen-button').click();
    await page.waitForFunction(() => !document.fullscreenElement);

    await context.setOffline(true);
    await page.reload();
    await page.locator('#quick-start').waitFor();
    assert.equal(await page.locator('#header-stars').innerText(), '16 ★');
    await page.locator('#quick-start').click();
    await page.locator('#start-round').click();
    const equation = await page.locator('.equation').innerText();
    const [, a, b] = equation.match(/^(\d+) \+ (\d+) = \?$/);
    await page.locator('#answer-input').fill('99999');
    await page.locator('#check-answer').click();
    assert.equal(await page.locator('#header-stars').innerText(), '16 ★');
    await page.locator('#answer-input').fill(String(Number(a) + Number(b)));
    await page.locator('#check-answer').click();
    assert.equal(await page.locator('#header-stars').innerText(), '17 ★');
    assert.match(await page.locator('#feedback').innerText(), /\+1 Stern/);
    assert.doesNotMatch(await page.locator('.practice-shell').innerText(), /Münzen|🪙/);

    await context.setOffline(false);
    await page.evaluate(() => caches.open('unrelated-site-cache'));
    updated = true;
    await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update());
    await page.locator('#update-app').waitFor({ state: 'visible' });
    await page.locator('#update-app').click();
    assert.match(await page.locator('#toast').innerText(), /Beende zuerst deine Runde/);
    assert.ok(await page.locator('.practice-shell').count());
    await page.locator('#back-home').click();
    await page.locator('#leave-round').click();
    await page.locator('[data-view="progress"]').first().click();
    const stickersBefore = await page.locator('.reward-card:not(.locked)').count();
    await page.locator('[data-shop="penguin"]').click();
    assert.equal(await page.locator('#header-stars').innerText(), '2 ★');
    assert.equal(await page.locator('.reward-card:not(.locked)').count(), stickersBefore);
    const state = await page.evaluate(() => JSON.parse(localStorage.getItem('matheabenteuer.v1')));
    assert.equal(state.version, 2);
    assert.equal(state.profiles[0].companion, 'penguin');
    assert.ok(!('coins' in state.profiles[0]) && !('xp' in state.profiles[0]));
    await page.locator('#update-app').click();
    await page.waitForFunction(() => document.querySelector('#quick-start') && document.querySelector('#header-stars')?.textContent === '2 ★');
    await page.waitForFunction(async () => (await caches.keys()).some(key => key.endsWith('test-update')));
    const cacheNames = await page.evaluate(() => caches.keys());
    assert.ok(cacheNames.includes('unrelated-site-cache'));
    assert.ok(!cacheNames.some(key => key.endsWith('2026-09-09-v1')));
    await context.setOffline(true);
    await page.reload();
    await page.locator('#quick-start').waitFor();
    assert.equal(await page.locator('#header-stars').innerText(), '2 ★');
    assert.match(await page.locator('.companion-banner').innerText(), /Pippa/);
    assert.deepEqual(errors, []);
    await context.close();
    console.log(`${prefix}: installable manifest, decoded icons, fullscreen enter/exit, offline reload/practice, single-star rewards, old-profile migration, redemption and safe update passed`);
  }

  const context = await browser.newContext({ viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true });
  await context.addInitScript(() => {
    Object.defineProperty(document, 'fullscreenEnabled', { get: () => false });
    Object.defineProperty(document, 'webkitFullscreenEnabled', { get: () => false });
  });
  const page = await context.newPage();
  await page.goto(origin + '/');
  await page.locator('#fullscreen-button').click();
  assert.match(await page.locator('#modal').innerText(), /Zum Home-Bildschirm/);
  await page.locator('#modal-close').click();
  await page.evaluate(() => {
    const event = new Event('beforeinstallprompt', { cancelable: true });
    event.prompt = async () => { window.installWasPrompted = true; };
    event.userChoice = Promise.resolve({ outcome: 'accepted' });
    window.dispatchEvent(event);
  });
  await page.locator('#install-button').click();
  await page.locator('#confirm-install').click();
  assert.equal(await page.evaluate(() => window.installWasPrompted), true);
  await page.evaluate(() => window.dispatchEvent(new Event('appinstalled')));
  assert.equal(await page.locator('#install-button').isHidden(), true);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await context.close();
  console.log('Unsupported fullscreen offers Home Screen instructions; install button invokes a deferred prompt only after a user click.');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
