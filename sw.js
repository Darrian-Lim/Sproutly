const CACHE_NAME = "sproutly-cache-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // cache.addAll() fails ALL-OR-NOTHING. Caching each
      // asset individually ensures one missing file doesn't break the registration.
      Promise.all(
        ASSETS_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => {
            console.warn("Sproutly SW: skipped caching (not found?)", url, err);
          })
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for navigation/HTML, cache-first for everything else.
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Never intercept calls to the Anthropic API — those must always hit the network.
  if (req.url.includes("api.anthropic.com")) {
    return;
  }

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("./index.html"))
    );
  } else {
    event.respondWith(
      caches.match(req).then((cachedRes) => {
        return cachedRes || fetch(req);
      })
    );
  }
});