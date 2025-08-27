const CACHE_NAME = 'saberes-v1.0.0';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/receitas', 
  '/agricultura',
  '/atividades',
  '/auth/signin',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Cache dinâmico para recursos
const DYNAMIC_CACHE = 'saberes-dynamic-v1';

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Service Worker installed');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.log('[SW] Install failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE)
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests and non-GET requests
  if (url.origin !== location.origin || request.method !== 'GET') {
    return;
  }

  // API requests - network first, cache as fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets and pages - cache first, network as fallback
  event.respondWith(
    caches.match(request)
      .then((cached) => {
        if (cached) {
          console.log('[SW] Serving from cache:', request.url);
          return cached;
        }

        // If not in cache, fetch from network
        return fetch(request)
          .then((response) => {
            // Cache successful responses
            if (response.status === 200 && response.type === 'basic') {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
            }
            return response;
          })
          .catch(() => {
            // If request is for an HTML page and network fails, show offline page
            if (request.destination === 'document') {
              return new Response(`
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Offline - Resgatando Saberes</title>
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
                           text-align: center; padding: 50px; background: #f8fafc; }
                    .container { max-width: 400px; margin: 0 auto; }
                    .icon { font-size: 64px; margin-bottom: 20px; }
                    h1 { color: #1e293b; margin-bottom: 10px; }
                    p { color: #64748b; line-height: 1.5; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="icon">🌱</div>
                    <h1>Você está offline</h1>
                    <p>Verifique sua conexão com a internet e tente novamente.</p>
                    <button onclick="window.location.reload()" 
                            style="background: #f59e0b; color: white; border: none; 
                                   padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px;">
                      Tentar Novamente
                    </button>
                  </div>
                </body>
                </html>
              `, {
                headers: { 'Content-Type': 'text/html' }
              });
            }
          });
      })
  );
});

// Background sync for form submissions when online
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-form-data') {
    event.waitUntil(syncFormData());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'Nova atualização disponível!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: data.url || '/',
    actions: [
      {
        action: 'open',
        title: 'Abrir',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Resgatando Saberes', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/')
    );
  }
});

// Helper function for form data sync
async function syncFormData() {
  try {
    // Implement form data sync logic here
    console.log('[SW] Syncing form data...');
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}