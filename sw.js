const staticCacheName = "app-pwa-v1"

const assetUrls = [
    "/",
    "/index.html",

    "/resources/logic/app.js",
    "/resources/logic/students.js",
    "/resources/logic/state.js",
    "/resources/logic/jquery-3.7.1.js",

    "/resources/pages/students.html",
    "/resources/pages/dashboard.html",
    "/resources/pages/messages.html",
    "/resources/pages/profile.html",
    "/resources/pages/tasks.html",

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

    "/resources/screenshots/add-student-screen.png",
    "/resources/screenshots/main-screen.png",
    "/resources/screenshots/wide-screen.png",
]

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(staticCacheName).then((cache) => {
            console.log("Кешування ресурсів...");
            return cache.addAll(assetUrls).catch(console.error);
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.open(staticCacheName).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
                return cachedResponse || fetch(event.request).then((networkResponse) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                }).catch(() => {
                    console.warn("⚠️ Network request failed, serving fallback.");
                    return new Response("You are offline. The requested resource is not in cache.", {
                        status: 503,
                        statusText: "Service Unavailable",
                        headers: { "Content-Type": "text/plain" }
                    });
                });
            });
        })
    );
});


self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter((key) => key !== staticCacheName)
                    .map((key) => caches.delete(key))
            );
        }).then(() => {
            console.log("Новий Service Worker активовано.");
            return self.clients.claim();
        })
    );
});