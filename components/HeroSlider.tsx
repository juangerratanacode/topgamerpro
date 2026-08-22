"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { useBanners, type Banner } from "@/lib/bannersStore";

const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD = 60;

// El atributo HTML autoPlay no siempre alcanza en mobile: algunos
// navegadores lo ignoran cuando el <video> lo inserta React en vez de
// venir en el HTML inicial, y se queda mostrando el poster con el ícono de
// play sin arrancar solo. Forzar .play() explícito desde JS (con muted
// seteado también por propiedad, no solo atributo) es lo que efectivamente
// hace que el autoplay funcione en esos casos. Si el navegador igual lo
// bloquea (ej. Modo de Bajo Consumo de iOS, que desactiva el autoplay de
// video a nivel sistema), .play() rechaza la promesa y no hay nada más que
// hacer desde acá — se ignora en silencio en vez de mostrar un error.
function HeroVideo({ src, poster }: { src: string; poster?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = true;
    const playPromise = el.play();
    if (playPromise) playPromise.catch(() => {});
  }, [src]);

  return (
    <video
      ref={videoRef}
      key={src}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      poster={poster || undefined}
      className="absolute inset-0 w-full h-full object-cover object-center"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}

interface HeroSliderProps {
  banners?: Banner[];
  hydrated?: boolean;
}

export default function HeroSlider({ banners: bannersProp, hydrated: hydratedProp }: HeroSliderProps = {}) {
  // Si el padre (home) ya trajo los datos sincronizados con el catálogo,
  // los usamos tal cual; si no, este componente se las arregla solo (ej.
  // si se usa suelto en otra página).
  const own = useBanners();
  const banners = bannersProp ?? own.banners;
  const hydrated = hydratedProp ?? own.hydrated;
  const [index, setIndex] = useState(0);

  const count = banners.length;

  const goTo = useCallback(
    (i: number) => {
      if (count === 0) return;
      setIndex(((i % count) + count) % count);
    },
    [count]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Parallax: la imagen se desplaza más lento que el scroll de la página
  // mientras el hero sale de vista, en vez de moverse pegada 1:1 al fondo.
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  useEffect(() => {
    if (count <= 1) return;
    const t = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [next, count]);

  // si se borran/agregan portadas y el índice queda fuera de rango
  useEffect(() => {
    if (index >= count && count > 0) setIndex(0);
  }, [count, index]);

  if (!hydrated || count === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="rounded-3xl bg-brand-surface h-56 sm:h-80 lg:h-96 animate-pulse" />
      </div>
    );
  }

  const slide = banners[index];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
      <div
        ref={sectionRef}
        className="relative rounded-3xl overflow-hidden border border-brand-border bg-brand-surface h-56 sm:h-80 lg:h-96"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
            drag={count > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={(_e, info) => {
              if (info.offset.x < -SWIPE_THRESHOLD) next();
              else if (info.offset.x > SWIPE_THRESHOLD) prev();
            }}
          >
            <motion.div style={{ y: parallaxY }} className="absolute -inset-x-0 -top-[10%] h-[120%]">
              {slide.videoUrl ? (
                <HeroVideo src={slide.videoUrl} poster={slide.imageUrl} />
              ) : (
                <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  fill
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  priority={index === 0}
                  className="object-cover object-center"
                />
              )}
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-r from-brand-bg via-brand-bg/40 to-transparent" />

            <div className="absolute inset-0 flex items-center pb-10 sm:pb-8">
              <div className="px-6 sm:px-10 max-w-lg">
                <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight drop-shadow">
                  {slide.title.split(" ").map((word, i) => (
                    <span key={i} className="inline-block overflow-hidden align-bottom mr-[0.28em] pb-1 -mb-1">
                      <motion.span
                        className="inline-block"
                        initial={{ y: "110%" }}
                        animate={{ y: "0%" }}
                        transition={{ duration: 0.6, delay: 0.1 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {word}
                      </motion.span>
                    </span>
                  ))}
                </h2>
                {slide.subtitle && (
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className="text-sm sm:text-base text-brand-textMuted mt-2 max-w-sm"
                  >
                    {slide.subtitle}
                  </motion.p>
                )}
                {slide.ctaLabel && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="mt-5"
                  >
                    <Link
                      href={slide.ctaHref || "#catalogo"}
                      className="inline-block bg-brand-primary hover:bg-brand-primaryDark text-white font-bold px-5 py-2.5 rounded-full transition-colors shadow-glow text-sm sm:text-base"
                    >
                      {slide.ctaLabel}
                    </Link>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {count > 1 && (
          <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 flex items-center justify-center gap-3">
            <button
              onClick={prev}
              aria-label="Anterior"
              className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex gap-1.5">
              {banners.map((b, i) => (
                <button
                  key={b.id}
                  onClick={() => goTo(i)}
                  aria-label={`Ir a la portada ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-6 bg-brand-primary" : "w-1.5 bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              aria-label="Siguiente"
              className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
