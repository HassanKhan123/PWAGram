const STATIC_CACHE = "static-v7";
const DYNAMIC_CACHE = "dynamic";

self.addEventListener("install", (e) => {
  console.log("[SW] Installing service worker...", e);
  e.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("[SW] Precaching...");
      cache.addAll([
        "/",
        "/index.html",
        "/src/js/app.js",
        "/src/js/feed.js",
        "/src/js/promise.js",
        "/src/js/fetch.js",
        "/src/js/material.min.js",
        "/src/css/app.css",
        "/src/css/feed.css",
        "/src/images/main-image.jpg",
        "https://fonts.googleapis.com/css?family=Roboto:400,700",
        "https://fonts.googleapis.com/icon?family=Material+Icons",
        "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
      ]);
    })
  );
});

self.addEventListener("activate", (e) => {
  console.log("[SW] Activating service worker...", e);
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
            console.log("[SW] Removing old cache...", key);
            caches.delete(key);
          }
        })
      );
    })
  );
  // return self.ClientRectList.
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      if (res) {
        return res;
      } else {
        return fetch(e.request)
          .then((resp) => {
            return caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(e.request.url, resp.clone());
              return resp;
            });
          })
          .catch((err) => {});
      }
    })
  );
});
