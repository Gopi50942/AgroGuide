const CACHE_NAME = "agroguide-v1";
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/farm",
  "/weather",
  "/soil",
  "/market",
  "/government",
  "/finance",
  "/calendar",
  "/diary",
  "/community",
  "/crop-doctor",
  "/emergency",
  "/favicon.svg",
  "/manifest.json"
];

// Install event — precache essential app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("PWA precache warning:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event — clean up old cache versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch event — network-first for navigation, stale-while-revalidate for static assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and browser-extension / API requests
  if (request.method !== "GET" || url.pathname.startsWith("/api/")) {
    return;
  }

  // Static assets (CSS, JS, Fonts, Images) -> Stale-while-revalidate
  if (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "image" ||
    request.destination === "font"
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // HTML Page Navigation -> Network first, fallback to cached app shell
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          const dashboardFallback = await caches.match("/dashboard");
          if (dashboardFallback) return dashboardFallback;
          return caches.match("/");
        })
    );
  }
});
