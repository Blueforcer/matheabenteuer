// Increment this version whenever a precached application file changes.
const VERSION = '2026-09-09-v1';
const BASE = new URL(self.registration.scope);
const PREFIX = `matheabenteuer-${BASE.pathname}-`;
const CACHE = PREFIX + VERSION;
const FILES = [
  './index.html', './styles.css', './extras.css', './manifest.webmanifest',
  './js/app.js', './js/engine.js', './js/store.js', './js/exercise-deck.js', './js/discovery.js', './js/pwa.js',
  './assets/icon.svg', './assets/fine.svg', './assets/icon-192.png', './assets/icon-512.png', './assets/icon-maskable-512.png',
  './docs/LERNBEREICHE.md',
];
const URLS = new Set(FILES.map(file => new URL(file, BASE).href));
const INDEX = new URL('./index.html', BASE).href;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(
    [...URLS].map(url => new Request(url, { cache: 'reload' }))
  )));
  // An update waits until the previous app closes or the user chooses to reload.
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(PREFIX) && name !== CACHE).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') event.waitUntil(self.skipWaiting());
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== BASE.origin) return;
  url.search = '';
  url.hash = '';
  const key = request.mode === 'navigate' && (url.href === BASE.href || url.href === INDEX) ? INDEX : url.href;
  if (!URLS.has(key)) return;
  // A complete, versioned shell stays internally consistent, including offline.
  // Unknown URLs and external links never grow the cache or become app routes.
  event.respondWith(caches.open(CACHE).then(async cache => (await cache.match(key)) || fetch(request)));
});
