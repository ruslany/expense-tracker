// Minimal service worker — presence of a fetch handler satisfies
// Android Chrome's PWA installability requirement. We intentionally
// do not intercept any requests since we have no offline strategy.

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// eslint-disable-next-line no-unused-vars
self.addEventListener('fetch', (_event) => {
  // No-op: let the browser handle all requests normally.
});
