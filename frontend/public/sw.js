// Simple Service Worker for static assets and images

/**
 * Pour purger le cache de toutes les images lors d'un nouveau déploiement,
 * incrémentez simplement le nom du cache (CACHE_NAME).
 * Pour purger une image individuellement, elle sera remplacée lors du prochain fetch réussi.
 */
const CACHE_NAME = "galerie-cache-v2";
const ASSETS = [
  "/",
  "/index.html",
  "/vite.svg",
  // Ajoutez ici d'autres assets statiques si besoin
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        // Cache les images et assets statiques
        if (
          response.status === 200 &&
          (request.url.includes("/images/") ||
            request.destination === "image" ||
            request.destination === "script" ||
            request.destination === "style")
        ) {
          // Toujours écraser l'ancienne version si elle existe (cache multi-format)
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return response;
      });
    })
  );
});