"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// El navegador intenta restaurar el scroll solo al volver atrás, pero como
// el catálogo carga desde localStorage y las tarjetas animan su entrada,
// la altura real de la página cambia unos milisegundos después del primer
// pintado — justo cuando el navegador ya decidió a dónde saltar. El
// resultado: "atrás" te deja más abajo (o arriba) de donde estabas.
//
// Esto guarda la posición de scroll de cada ruta por su cuenta (sessionStorage)
// y la reintenta aplicar varias veces mientras el contenido real termina de
// asentarse, en vez de confiar en la restauración automática del navegador.
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

    if (saved) {
      const y = parseInt(saved, 10);
      const delays = [0, 50, 120, 250, 450, 700];
      const timers = delays.map((ms) => setTimeout(() => window.scrollTo(0, y), ms));
      return () => timers.forEach(clearTimeout);
    } else {
      window.scrollTo(0, 0);
    }
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
