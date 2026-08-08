"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// El navegador intenta restaurar el scroll solo al volver atrás, pero el
// contenido real (imágenes del catálogo, hero, animaciones de entrada)
// termina de asentar su altura unos milisegundos después del primer
// pintado — justo cuando el navegador ya decidió a dónde saltar. El
// resultado: "atrás" te deja más abajo (o arriba) de donde estabas.
//
// Esto guarda la posición de scroll de cada ruta por su cuenta
// (sessionStorage) y la reaplica en un loop con requestAnimationFrame
// hasta que la altura del documento deja de cambiar (o pasa un máximo de
// tiempo) — en vez de confiar en una lista fija de reintentos a ciegas.
const MAX_RESTORE_MS = 2500;
const STABLE_FRAMES_NEEDED = 6; // ~6 frames seguidos sin cambio de altura

export default function ScrollMemory() {
  const pathname = usePathname();

  useEffect(() => {
    // Apagamos la restauración nativa: si no, compite con la nuestra y
    // termina saltando dos veces (o a mitad de camino entre ambas).
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    const key = `scrollpos:${pathname}`;
    const saved = sessionStorage.getItem(key);

    if (!saved) {
      window.scrollTo(0, 0);
      return;
    }

    const targetY = parseInt(saved, 10);
    const start = performance.now();
    let lastHeight = -1;
    let stableFrames = 0;
    let rafId: number;

    function tick(now: number) {
      const currentHeight = document.documentElement.scrollHeight;
      const heightChanged = currentHeight !== lastHeight;
      lastHeight = currentHeight;
      stableFrames = heightChanged ? 0 : stableFrames + 1;

      // Reaplicamos mientras la página siga "moviéndose" bajo nuestros pies.
      if (Math.abs(window.scrollY - targetY) > 2) {
        window.scrollTo(0, targetY);
      }

      const elapsed = now - start;
      const settled = stableFrames >= STABLE_FRAMES_NEEDED;
      if (!settled && elapsed < MAX_RESTORE_MS) {
        rafId = requestAnimationFrame(tick);
      }
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [pathname]);

  useEffect(() => {
    const key = `scrollpos:${pathname}`;
    function onScroll() {
      sessionStorage.setItem(key, String(window.scrollY));
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return null;
}
