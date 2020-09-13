importScripts("/src/js/idb.js");

const STATIC_CACHE = "static-v15";
const DYNAMIC_CACHE = "dynamic";
let STATIC_FILES = [
  "/",
  "/index.html",
  "/offline.html",
  "/src/js/app.js",
  "/src/js/feed.js",
  "/src/js/idb.js",
  "/src/js/promise.js",
  "/src/js/fetch.js",
  "/src/js/material.min.js",
  "/src/css/app.css",
  "/src/css/feed.css",
  "/src/images/main-image.jpg",
  "https://fonts.googleapis.com/css?family=Roboto:400,700",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
];

let dbPromise = idb.open("posts-store", 1, (db) => {
  if (!db.objectStoreNames.contains("posts")) {
    db.createObjectStore("posts", { keyPath: "id" });
  }
});

//For trimming a cache
// function trimCache(cacheName, maxItems) {
//   caches.open(cacheName).then((cache) => {
//     return cache.keys().then((keys) => {
//       if (keys.length > maxItems) {
//         cache.delete(keys[0]).then(trimCache(cacheName, maxItems));
//       }
//     });
//   });
// }

self.addEventListener("install", (e) => {
  console.log("[SW] Installing service worker...", e);
  e.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("[SW] Precaching...");
      cache.addAll(STATIC_FILES);
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

function isInArray(string, array) {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === string) {
      return true;
    }
  }
  return false;
}

self.addEventListener("fetch", (e) => {
  let url = "https://pwagram-4319d.firebaseio.com/posts.json";
  if (e.request.url.indexOf(url) > -1) {
    e.respondWith(
      fetch(e.request).then((res) => {
        let clonedRes = res.clone();
        clonedRes.json().then((data) => {
          for (let key in data) {
            dbPromise.then((db) => {
              let tx = db.transaction("posts", "readwrite");
              let store = tx.objectStore("posts");
              store.put(data[key]);
              return tx.complete;
            });
          }
        });
        return res;
      })
    );
  } else if (isInArray(e.request.url, STATIC_FILES)) {
    e.respondWith(caches.match(e.request));
  } else {
    e.respondWith(
      caches.match(e.request).then((res) => {
        if (res) {
          return res;
        } else {
          return fetch(e.request)
            .then((resp) => {
              return caches.open(DYNAMIC_CACHE).then((cache) => {
                // trimCache(DYNAMIC_CACHE, 20);
                cache.put(e.request.url, resp.clone());
                return resp;
              });
            })
            .catch((err) => {
              return caches.open(STATIC_CACHE).then((cache) => {
                if (e.request.headers.get("accept").includes("text/html")) {
                  return cache.match("/offline.html");
                }
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
