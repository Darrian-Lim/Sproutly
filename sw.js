const CACHE_NAME = "sproutly-cache-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // cache.addAll() fails ALL-OR-NOTHING — if a single asset 404s (e.g. a
      // missing icon file), the whole install rejects and the SW never
      // activates, silently killing offline support entirely. Caching each
      // asset individually means one missing file just gets skipped instead.
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
  if (req.url.includes("api.anthropic.com")) return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
