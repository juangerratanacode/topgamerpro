"use client";

import { useEffect } from "react";

// Registra el service worker (ver public/sw.js) — sin esto, aunque exista
// el archivo, ningún navegador lo activa solo. Es el otro requisito
// (junto con el manifest) para que Chrome/Android ofrezcan "Instalar app".
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return null;
}
