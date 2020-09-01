self.addEventListener('install',(e) => {
    console.log('[SW] Installing service worker...',e)
})

self.addEventListener('activate',(e) => {
    console.log('[SW] Activating service worker...',e)
    // return self.ClientRectList.
})

self.addEventListener('fetch',(e) => {
    console.log('[SW] Fetching something...',e)
    e.respondWith(fetch(e.request))
})