const STATIC_CACHE = "static-v11";
const DYNAMIC_CACHE = "dynamic";

self.addEventListener("install", (e) => {
  console.log("[SW] Installing service worker...", e);
  e.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("[SW] Precaching...");
      cache.addAll([
        "/",
        "/index.html",
        "/offline.html",
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
});

self.addEventListener("fetch", (e) => {
  let url = "https://httpbin.org/get";
  if (e.request.url.indexOf(url) > -1) {
    e.respondWith(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return fetch(e.request).then((res) => {
          cache.put(e.request, res.clone());
          return res;
        });
      })
    );
  } else {
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
            .catch((err) => {
              return caches.open(STATIC_CACHE).then((cache) => {
                return cache.match("/offline.html");
              });
            });
        }
      })
    );
  }
});

// self.addEventListener("fetch", (e) => {
//   e.respondWith(
// caches.match(e.request).then((res) => {
//   if (res) {
//     return res;
//   } else {
//     return fetch(e.request)
//       .then((resp) => {
//         return caches.open(DYNAMIC_CACHE).then((cache) => {
//           cache.put(e.request.url, resp.clone());
//           return resp;
//         });
//       })
//       .catch((err) => {
//         return caches.open(STATIC_CACHE).then((cache) => {
//           return cache.match("/offline.html");
//         });
//       });
//   }
// })
//   );
// });

// Strategy Network first with dynamic caching with Cache fallback
// self.addEventListener("fetch", (e) => {
//   e.respondWith(
//     fetch(e.request)
//       .then((res) => {
//         return caches.open(DYNAMIC_CACHE).then((cache) => {
//           cache.put(e.request.url, res.clone());
//           return res;
//         });
//       })
//       .catch((err) => {
//         return caches.match(e.request);
//       })
//   );
// });

//Strategy Cache Only
// self.addEventListener("fetch", (e) => {
//   e.respondWith(caches.match(e.request));
// });

//Strategy Network only
// self.addEventListener("fetch", (e) => {
//   e.respondWith(fetch(e.request));
// });
