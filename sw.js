// sw.js — Tokyo Doorway service worker (offline / airplane-mode shell + content).
//
// Standalone classic worker (NOT an ES module). Precaches the full app shell and
// the inline content module so that, after ONE online load, the picker and every
// bundled step renders with zero failing network requests in airplane mode.
//
// All precache URLs are RELATIVE ('./') so the cache survives the GitHub Pages
// /<repo>/ base prefix. The worker is registered by app.js via
// navigator.serviceWorker.register('./sw.js', { scope: './' }); index.html does
// not register it.

'use strict';

// Bump CACHE_NAME on every redeploy to cache-bust old shells. The 'activate'
// handler deletes any cache whose name doesn't match this version.
const CACHE_NAME = 'tokyo-doorway-v1';

// The shared precache list. Must agree with index.html's asset references.
// Relative ('./') so it resolves correctly under /<repo>/.
// sw.js intentionally excludes itself (the browser manages the worker script).
const PRECACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './content.js',
  './manifest.webmanifest',
];

// Install: open the versioned cache and add the shell. Individual icon fetches
// may legitimately 404 in some deploys; add them best-effort so a single missing
// icon never blocks installation of the core offline shell.
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Core shell is required — if any of these fail, installation fails loudly.
      const core = [
        './',
        './index.html',
        './styles.css',
        './app.js',
        './content.js',
        './manifest.webmanifest',
      ];
      await cache.addAll(core);
      // Best-effort extras (icons): tolerate individual failures.
      const extras = PRECACHE.filter((url) => !core.includes(url));
      await Promise.all(
        extras.map((url) =>
          cache.add(url).catch(() => {
            /* missing icon shouldn't break offline shell */
          })
        )
      );
      // Take over without waiting for old tabs to close.
      await self.skipWaiting();
    })()
  );
});

// Activate: drop stale caches from previous versions and claim open clients so
// the new worker controls the page immediately after a redeploy.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

// Fetch: cache-first for same-origin GET navigations and assets. A cache hit is
// served straight from the precache (airplane-mode ready). On a miss we go to the
// network and opportunistically cache the response for next time. For navigation
// requests that fail offline, fall back to the cached app shell (index.html) so a
// cold reload under the Pages base still boots the SPA.
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle GET; never interfere with other methods.
  if (request.method !== 'GET') {
    return;
  }

  // Only handle same-origin requests; let cross-origin pass through untouched.
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Cache-first: serve any precached/runtime-cached response immediately.
      const cached = await cache.match(request, { ignoreSearch: true });
      if (cached) {
        return cached;
      }

      try {
        const response = await fetch(request);
        // Cache successful, basic (same-origin) responses for future offline use.
        if (response && response.ok && response.type === 'basic') {
          cache.put(request, response.clone());
        }
        return response;
      } catch (err) {
        // Offline and not cached. For navigations, fall back to the app shell.
        if (request.mode === 'navigate') {
          const shell =
            (await cache.match('./index.html')) || (await cache.match('./'));
          if (shell) {
            return shell;
          }
        }
        throw err;
      }
    })()
  );
});

// Allow the page to trigger an immediate activation of a waiting worker
// (e.g. after a redeploy) without a manual reload dance.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
