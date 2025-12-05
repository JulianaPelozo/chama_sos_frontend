const CACHE_NAME = 'chama-sos-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

const STATIC_FILES = [
  '/',
  '/index.html',
  '/login.html',
  '/dashboard.html',
  '/style.css',
  '/index.js',
  '/login.js',
  '/dashboard.js',
  '/ocorrencias.js',
  '/nova.js',
  '/api.js',
  '/icons/icon-72x72.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Cacheando arquivos estáticos');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker ativado');
  
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE && key !== CACHE_NAME) {
            console.log('Removendo cache antigo:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  if (event.request.url.indexOf('chrome-extension') > -1) return;
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request)
          .then((networkResponse) => {
            // Cache dinâmico para APIs e outros recursos
            if (event.request.url.indexOf('/api/') === -1) {
              return caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(event.request, networkResponse.clone());
                  return networkResponse;
                });
            }
            return networkResponse;
          })
          .catch(() => {
            // Fallback para páginas offline
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
            
            // Fallback para imagens
            if (event.request.headers.get('accept').includes('image')) {
              return caches.match('/icons/icon-512x512.png');
            }
          });
      })
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-ocorrencias') {
    event.waitUntil(syncOcorrencias());
  }
});

async function syncOcorrencias() {
  try {
    const requests = await getPendingRequests();
    
    for (const request of requests) {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body
      });
      
      if (response.ok) {
        await removePendingRequest(request.id);
      }
    }
  } catch (error) {
    console.error('Erro na sincronização:', error);
  }
}


self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'ver',
        title: 'Ver ocorrência',
        icon: '/icons/eye-72x72.png'
      },
      {
        action: 'fechar',
        title: 'Fechar',
        icon: '/icons/close-72x72.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('CHAMA SOS - Nova Ocorrência', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'ver') {
    event.waitUntil(
      clients.openWindow('/dashboard.html?tab=ocorrencias')
    );
  }
});

async function getPendingRequests() {
  const cache = await caches.open(DYNAMIC_CACHE);
  const responses = await cache.matchAll('/api/pending/*');
  return Promise.all(responses.map(res => res.json()));
}

async function removePendingRequest(id) {
  const cache = await caches.open(DYNAMIC_CACHE);
  return cache.delete(`/api/pending/${id}`);
}