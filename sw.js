// Bump cache name to invalidate old assets when deploying updates
const CACHE_NAME = 'timer-app-v10';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/icons/stopwatch-96x96.png',
  '/icons/countdown-96x96.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  // Force SW to take control immediately after installation
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
// Prefer network for HTML and JS to avoid stale UI, fallback to cache when offline
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const isHTML = req.destination === 'document' || (req.headers.get('accept') || '').includes('text/html');
  const isJS = req.destination === 'script' || req.url.endsWith('/script.js');

  if (isHTML || isJS) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          return res;
        })
        .catch(() => caches.match(req))
    );
  } else {
    // Cache-first for other assets
    event.respondWith(
      caches.match(req).then((res) => res || fetch(req))
    );
  }
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => key !== CACHE_NAME ? caches.delete(key) : Promise.resolve())
      );
      // Claim clients so the updated SW controls open pages without reload
      await self.clients.claim();
    })()
  );
});

// Background sync for timer completion notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'timer-notification') {
    event.waitUntil(
      self.registration.showNotification('Timer App', {
        body: 'Timer finished!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        vibrate: [200, 100, 200]
      })
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll().then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Timer notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open Timer',
        icon: '/icons/stopwatch-96x96.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-96x96.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Timer App', options)
  );
});