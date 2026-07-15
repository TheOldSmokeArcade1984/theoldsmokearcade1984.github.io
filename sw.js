const CACHE_NAME = 'oldsmoke-os-v3.0';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest-v3.json'
];

// Installazione e salvataggio in cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => {
            console.log('[SW v3.0] Caching asset principali');
            return cache.addAll(ASSETS_TO_CACHE);
        })
        .then(() => self.skipWaiting())
    );
});

// Pulizia cache vecchie
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[SW v3.0] Eliminazione vecchia cache', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Intercettazione richieste (Strategia: Network First, Fallback to Cache)
self.addEventListener('fetch', (event) => {
    // Escludiamo le chiamate esterne (es. iframe giochi su itch.io)
    if (!event.request.url.startsWith(self.location.origin)) {
        return; 
    }

    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});