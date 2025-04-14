const staticCacheName = "app-pwa-v1"

const assetUrls = [
    "/",
    "/index.html",

    "/src/bll/app.js",
    "/src/bll/students.js",
    "/src/bll/state.js",
    "/src/bll/jquery-3.7.1.js",

    "/src/ui/components/students.html",
    "/src/ui/components/dashboard.html",
    "/src/ui/components/messages.html",
    "/src/ui/components/profile.html",
    "/src/ui/components/tasks.html",

    "/src/ui/styles/common.css",
    "/src/ui/styles/header.css",
    "/src/ui/styles/index.css",
    "/src/ui/styles/main.css",
    "/src/ui/styles/navbar.css",
    "/src/ui/styles/responsive.css",
    "/src/ui/styles/students.css",

    "/assets/icons/icon-48x48.png",
    "/assets/icons/icon-72x72.png",
    "/assets/icons/icon-96x96.png",
    "/assets/icons/icon-128x128.png",
    "/assets/icons/icon-144x144.png",
    "/assets/icons/icon-152x152.png",
    "/assets/icons/icon-192x192.png",
    "/assets/icons/icon-256x256.png",
    "/assets/icons/icon-384x384.png",
    "/assets/icons/icon-512x512.png",

    "/assets/screenshots/add-student-screen.png",
    "/assets/screenshots/main-screen.png",
    "/assets/screenshots/wide-screen.png",
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