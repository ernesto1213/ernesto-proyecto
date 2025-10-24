const CACHE_NAME = 'mantenimiento-naval-v1';
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

// Interceptar peticiones y responder desde caché
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(respuesta =>
      respuesta || fetch(event.request)
    )
  );
});
