const CACHE_NAME = "pengiriman-shell-v1";
const APP_SHELL = [
    "./",
    "./index.html",
    "./login.html",
    "./dashboard.html",
    "./inputdata.html",
    "./monitoring.html",
    "./laporan.html",
    "./style.css",
    "./logo.png",
    "./manifest.webmanifest"
];

self.addEventListener("install", function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(APP_SHELL);
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(keys.filter(function (key) {
                return key !== CACHE_NAME;
            }).map(function (key) {
                return caches.delete(key);
            }));
        })
    );
    self.clients.claim();
});

self.addEventListener("fetch", function (event) {
    if (event.request.method !== "GET") return;

    event.respondWith(
        fetch(event.request).then(function (response) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(function (cache) {
                cache.put(event.request, copy);
            });
            return response;
        }).catch(function () {
            return caches.match(event.request);
        })
    );
});
