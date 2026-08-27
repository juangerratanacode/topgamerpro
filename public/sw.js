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

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
