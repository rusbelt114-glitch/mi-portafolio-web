// Service Worker - Nuestro Espacio App
// Guarda la app completa para que funcione SIN INTERNET

const CACHE_NAME = 'nuestro-espacio-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './icon.png',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Outfit:wght@400;600;800&display=swap',
  'https://unpkg.com/@phosphor-icons/web',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// INSTALACIÓN: Guarda todos los archivos en caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Guardando app en caché...');
      // Guardamos los archivos locales de forma segura (ignorando los externos si fallan)
      return cache.addAll(['./index.html', './style.css', './app.js', './icon.png', './manifest.json'])
        .then(() => {
          console.log('[SW] Archivos locales guardados ✅');
        });
    })
  );
  self.skipWaiting();
});

// ACTIVACIÓN: Limpia cachés viejas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// FETCH: Estrategia "Network First, Cache Fallback"
// Intenta conectarse a internet. Si falla, usa la versión guardada.
self.addEventListener('fetch', event => {
  // No interceptar peticiones a Supabase (base de datos)
  if (event.request.url.includes('supabase.co')) {
    return; // Dejar pasar normalmente
  }

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Si hay internet, actualiza la caché
        const clone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return networkResponse;
      })
      .catch(() => {
        // Sin internet: sirve desde caché
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          // Si nada en caché, devuelve la página principal
          return caches.match('./index.html');
        });
      })
  );
});
