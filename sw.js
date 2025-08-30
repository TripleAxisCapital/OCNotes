/* OC Notes Service Worker */
const CACHE_NAME = 'oc-notes-v1';
const PRECACHE = [
  './',
  './index.html',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/quill@1.3.7/dist/quill.snow.css',
  'https://cdn.jsdelivr.net/npm/quill@1.3.7/dist/quill.min.js',
  'https://cdn.jsdelivr.net/npm/fabric@5.3.0/dist/fabric.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html-docx-js/0.4.1/html-docx.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  // Cache-first for same-origin and known CDNs
  const isCDN = /cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|cdn\.tailwindcss\.com/.test(url.hostname);
  if (url.origin === location.origin || isCDN) {
    e.respondWith(
      caches.match(req).then(cached => {
        const fetchAndCache = fetch(req, { mode: req.mode, credentials: req.credentials }).then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy)).catch(() => {});
          return res;
        }).catch(() => cached);
        return cached || fetchAndCache;
      })
    );
  }
});

