self.addEventListener('install',(e) => {
    console.log('[SW] Installing service worker...',e)
    e.waitUntil(caches.open('static').then((cache) => {
        console.log('[SW] Precaching...')
        cache.add('/')
        cache.add('/index.html')
        cache.add('/src/js/app.js')
    }))
})

self.addEventListener('activate',(e) => {
    console.log('[SW] Activating service worker...',e)
    // return self.ClientRectList.
})

self.addEventListener('fetch',(e) => {
    e.respondWith(
        caches.match(e.request).then((res) => {
            if(res){
                return res
            }else {
                return fetch(e.request)
            }
        })
    )
})