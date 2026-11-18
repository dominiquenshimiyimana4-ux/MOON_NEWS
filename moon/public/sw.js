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

// Push: show a notification when a push is received.
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Moon News";
  const options = {
    body: data.body || "Breaking news from Moon News.",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    tag: data.tag || "moon-news-push",
    data: data.url ? { url: data.url } : {},
    actions: data.actions
      ? data.actions.map((a) => ({ action: a.action, title: a.title }))
      : [{ action: "open", title: "Open" }],
    requireInteraction: data.requireInteraction ?? false,
    silent: data.silent ?? false,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click: open the article or focus the app.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      // Focus an existing window if one is already open.
      for (const client of clients) {
        if (client.url.includes(url) || client.url === self.location.origin + url) {
          return client.focus();
        }
      }
      // Otherwise open a new window.
      return self.clients.openWindow(url);
    })
  );
});

// Notification dismiss (close).
self.addEventListener("notificationclose", (event) => {
  const { notification } = event;
  // Optionally track dismissal analytics here.
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
