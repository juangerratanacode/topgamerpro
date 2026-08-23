"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Primer segmento de la ruta (ej. "/mi-cuenta/pedidos" -> "mi-cuenta"). Se
// usa para detectar navegación "interna" dentro de un mismo panel con
// layout persistente (mi-cuenta, admin) — ahí el usuario espera que el
// contenido cambie en el lugar, sin que la página salte a arriba de todo.
//
// Ojo: esto es una lista explícita, no "cualquier segmento compartido".
// Antes comparaba el primer segmento tal cual, y como /productos/[slug] no
// tiene layout persistente (cada producto es una página distinta, sin
// sidebar ni nada que se quede montado), pasar de /productos/cod a
// /productos/efootball también contaba como "mismo panel" y se saltaba el
// scroll-to-top — el usuario abría el producto nuevo a mitad de página.
const PERSISTENT_LAYOUT_SEGMENTS = new Set(["admin", "mi-cuenta"]);

// Rutas donde SIEMPRE se arranca arriba de todo, sin importar si el
// usuario ya había visitado esa misma URL antes en esta sesión. La memoria
// de scroll (de acá abajo) existe para que un "atrás" en el catálogo te
// devuelva donde estabas — pero en una página de producto no tiene sentido
// "recordar" el scroll: cada vez que entrás a un producto (aunque sea el
// mismo de antes) esperás verlo desde arriba, no a mitad de la página.
const ALWAYS_TOP_SEGMENTS = new Set(["productos"]);

function topSegment(pathname: string): string {
  return pathname.split("/").filter(Boolean)[0] ?? "";
}

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
  const prevPathname = useRef<string | null>(null);

  useEffect(() => {
    // Apagamos la restauración nativa: si no, compite con la nuestra y
    // termina saltando dos veces (o a mitad de camino entre ambas).
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    const prevTop = prevPathname.current !== null ? topSegment(prevPathname.current) : null;
    const currentTop = topSegment(pathname);
    const isInternalTabSwitch =
      prevTop !== null && prevTop === currentTop && PERSISTENT_LAYOUT_SEGMENTS.has(currentTop);
    prevPathname.current = pathname;

    // Cambiar de "pestaña" dentro del mismo panel (ej. mi-cuenta/pedidos ->
    // mi-cuenta/perfil) no debe mover el scroll para nada — el layout
    // (sidebar, header) sigue montado, solo cambia el contenido.
    if (isInternalTabSwitch) return;

    const key = `scrollpos:${pathname}`;
    const saved = ALWAYS_TOP_SEGMENTS.has(currentTop) ? null : sessionStorage.getItem(key);

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
