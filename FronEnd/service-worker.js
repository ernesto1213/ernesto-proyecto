const CACHE_NAME = 'mantenimiento-naval-v2';
const ARCHIVOS_PARA_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Instalar y guardar archivos en caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ARCHIVOS_PARA_CACHE))
  );
  console.log('✅ Service Worker instalado y cacheado');
});

// Activar: limpiar cachés antiguos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  console.log('🧹 Cachés antiguos eliminados');
});

// Interceptar peticiones
self.addEventListener('fetch', event => {
  const { request } = event;

  // 🔒 No interceptar peticiones a la API backend (localhost:8080)
  if (request.url.includes('localhost:8080')) {
    return; // Deja que vayan directo al servidor
  }

  // Para todo lo demás (archivos estáticos)
  event.respondWith(
    caches.match(request).then(respuesta =>
      respuesta ||
      fetch(request).then(fetchRes => {
        // Guarda en caché nuevas respuestas
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(request, fetchRes.clone());
          return fetchRes;
        });
      }).catch(() => caches.match('/index.html'))
    )
  );
});
