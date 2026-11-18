const CACHE_NAME = "moon-news-v1";
const STATIC_ASSETS = [
  "/",
  "/latest",
  "/live",
  "/video",
  "/photos",
  "/authors",
  "/register",
  "/login",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

const RUNTIME_CACHE = "moon-news-runtime-v1";

// Install: cache static assets.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME && key !== RUNTIME_CACHE).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: network-first for pages, cache-first for assets.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and non-same-origin requests.
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // API calls: network-first, never cached.
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/data")) {
    event.respondWith(fetch(request));
    return;
  }

  // Static assets: cache-first.
  if (STATIC_ASSETS.includes(url.pathname) || url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((res) => caches.open(CACHE_NAME).then((c) => { c.put(request, res.clone()); return res; })))
    );
    return;
  }

  // Pages and everything else: network-first, fall back to cache.
  event.respondWith(
    fetch(request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(RUNTIME_CACHE).then((c) => c.put(request, resClone));
        return res;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match("/")))
  );
});
