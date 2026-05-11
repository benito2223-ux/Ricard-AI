// Ricard AI — Service Worker (minimal, stable)
// Rôle : satisfaire les critères PWA installable sur Chrome/Android
// Ne jamais interférer avec le chargement de l'app

const CACHE = 'ricard-ai-v18';

// Install : activation immédiate
self.addEventListener('install', () => self.skipWaiting());

// Message : permet à la page de forcer le skip waiting
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

// Activate : PAS de clients.claim() — laisser les pages existantes tranquilles
// Nettoyer les anciens caches uniquement
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  // NE PAS appeler clients.claim() — c'est ça qui causait la page blanche
});

// Fetch : ne gérer QUE les requêtes de navigation (chargement de la page)
// Toutes les autres requêtes (API, CDN, fonts) passent directement au réseau
self.addEventListener('fetch', e => {
  // Ignorer tout ce qui n'est pas une navigation
  if (e.request.mode !== 'navigate') return;

  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Mettre en cache la page pour l'accès hors-ligne
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      })
      .catch(() =>
        // Hors-ligne : servir la version cachée
        caches.open(CACHE).then(c => c.match('./index.html'))
      )
  );
});
