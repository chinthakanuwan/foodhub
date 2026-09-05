const CACHE_NAME = 'silvas-express-v1';  // ← අලුත් Cache Name එක (පරණ foodhub cache එක delete වෙයි)
const urlsToCache = [
    './',
    './index.html?v=4',   // ← Version එක වැඩි කළා (අලුත් files load වෙන්න)
    './app.js?v=4',
    './manifest.json?v=4'
];

self.addEventListener('install', event => {
    console.log('Silvas Express Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened new cache');
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting(); // කෙලින්ම අලුත් version එක activate වෙන්න
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response; // Cache එකේ තියෙනවා නම් ඒක දෙනවා
                }
                return fetch(event.request).then(response => {
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    return response;
                });
            })
    );
});

self.addEventListener('activate', event => {
    console.log('Silvas Express Service Worker activating...');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // පරණ cache (foodhub-v3 වගේ) තියෙනවා නම් ඒක delete කරනවා
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker activated successfully');
            return self.clients.claim();
        })
    );
});
