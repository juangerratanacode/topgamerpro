// Service worker mínimo — solo existe para que el sitio cumpla el
// requisito técnico de "instalable" (Chrome/Android exige un SW con
// listener de fetch para mostrar el banner de instalar app). No cachea
// nada todavía: cada pedido va directo a la red, tal cual como si no
// existiera. Si más adelante se quiere soporte offline de verdad, acá es
// donde se agregaría una estrategia de caché (ver cacheName + install/
// activate más abajo, dejados listos pero sin usar).
const CACHE_NAME = "topgamerpro-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// No se llama a event.respondWith() a propósito — con eso alcanza para que
// Chrome/Android considere el sitio "instalable" (solo exige que exista un
// listener de fetch). Antes acá se re-enviaba cada petición manualmente
// con event.respondWith(fetch(event.request)): si esa petición interna
// fallaba por cualquier motivo (red inestable, la app pasa a segundo
// plano, iOS cancela la conexión), Safari mostraba una pantalla de error
// nativa ("FetchEvent.respondWith received an error") en vez de dejar que
// el navegador reintentara normalmente. Sin respondWith, cada fetch la
// maneja el navegador tal cual como si el service worker no existiera.
self.addEventListener("fetch", () => {});
