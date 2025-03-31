const staticCacheName = "app-pwa-v1"

const assetUrls = [
    "/",
    "/index.html",

    "/resources/logic/app.js",
    "/resources/logic/students.js",
    "/resources/logic/state.js",
    "/resources/logic/jquery-3.7.1.js",

    "/resources/pages/students.html",

    "/resources/styles/common.css",
    "/resources/styles/header.css",
    "/resources/styles/index.css",
    "/resources/styles/main.css",
    "/resources/styles/navbar.css",
    "/resources/styles/responsive.css",
    "/resources/styles/students.css",

    "/resources/icons/icon-48x48.png",
    "/resources/icons/icon-72x72.png",
    "/resources/icons/icon-96x96.png",
    "/resources/icons/icon-128x128.png",
    "/resources/icons/icon-144x144.png",
    "/resources/icons/icon-152x152.png",
    "/resources/icons/icon-192x192.png",
    "/resources/icons/icon-256x256.png",
    "/resources/icons/icon-384x384.png",
    "/resources/icons/icon-512x512.png",
]

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(staticCacheName).then(cache => {
            return Promise.all(
                assetUrls.map(url =>
                    cache.add(url).catch(err => console.error(`Failed to cache: ${url}`, err))
                )
            );
        })
    );
    console.log("Install")
})

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.open(staticCacheName).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {

                const networkFetch = fetch(event.request).then((networkResponse) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });

                return cachedResponse || networkFetch;
            });
        })
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter((key) => key !== staticCacheName) // Знаходимо старі кеші
                    .map((key) => caches.delete(key))   // Видаляємо їх
            );
        }).then(() => {
            console.log("Новий Service Worker активовано.");
            return self.clients.claim(); // Переключаємо новий SW для всіх вкладок
        })
    );
});