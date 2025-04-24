// Service worker for 100Pi game

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "100pi-offline-cache-v1";

// Offline fallback page
const offlineFallbackPage = "index.html";

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => {
        // Cache the main resources needed for offline use
        return cache.addAll([
          // Main app files
          offlineFallbackPage,
          'manifest.json',
          
          // External scripts
          'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js',
          
          // Fonts
          'https://fonts.googleapis.com/css2?family=Nabla&family=Nova+Square&family=Tilt+Neon&display=swap',
          
          // Pie images - first 25 for initial loading (to avoid cache size issues)
          'https://i.imgur.com/Ve81iBj.png',
          'https://i.imgur.com/wv93jaf.png',
          'https://i.imgur.com/42GNKvZ.png',
          'https://i.imgur.com/qQueGcO.png',
          'https://i.imgur.com/AWayVxk.png',
          'https://i.imgur.com/Z01Qm6L.png',
          'https://i.imgur.com/0llOdWO.png',
          'https://i.imgur.com/n2KuQnG.png',
          'https://i.imgur.com/23lwqk2.png',
          'https://i.imgur.com/q1J3x4G.png',
          'https://i.imgur.com/tt1aIst.png',
          'https://i.imgur.com/uzo9xq9.png',
          'https://i.imgur.com/NfaNaKE.png',
          'https://i.imgur.com/d91WKbh.png',
          'https://i.imgur.com/t98gFde.png',
          'https://i.imgur.com/x9CJFdZ.png',
          'https://i.imgur.com/cvWsiem.png',
          'https://i.imgur.com/clxWGYO.png',
          'https://i.imgur.com/D2iX3zd.png',
          'https://i.imgur.com/hS8ZVyN.png',
          'https://i.imgur.com/7DqyNHF.png',
          'https://i.imgur.com/yhn4NH1.png',
          'https://i.imgur.com/xGLohz7.png',
          'https://i.imgur.com/XMQAUtI.png',
          'https://i.imgur.com/JjETyop.png',
          
          // App icon
          'https://i.imgur.com/hpKNkrW.png'
        ]);
      })
  );
});

// Cache remaining pie images on the first use
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Check if this is an image from imgur
  if (url.hostname === 'i.imgur.com') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }
        
        // Otherwise fetch from network and cache
        return fetch(event.request).then((networkResponse) => {
          // Don't cache if not successful
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          
          // Clone the response
          const responseToCache = networkResponse.clone();
          
          // Add to cache
          caches.open(CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          
          return networkResponse;
        });
      })
    );
    return;
  }
  
  // Handle navigation requests (for the main page)
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResp = await event.preloadResponse;

        if (preloadResp) {
          return preloadResp;
        }

        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {
        const cache = await caches.open(CACHE);
        const cachedResp = await cache.match(offlineFallbackPage);
        return cachedResp;
      }
    })());
    return;
  }
  
  // For all other requests, try the cache first, then network
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
