// Cliente de Supabase SOLO para el server-side render del home y de la
// página de producto (app/page.tsx vía lib/homeData.server.ts, y
// app/productos/[slug]/page.tsx). Separado de lib/supabaseClient.ts a
// propósito: ese otro cliente lo usan también hooks del navegador y el
// login, que sí necesitan datos siempre al segundo (auth, carrito,
// disponibilidad real de un paquete) — acá el catálogo público puede
// convivir con hasta 30s de atraso a cambio de no bloquear cada visita.
//
// `cache: "no-store"` (lo que usan los otros clientes) vuelve la página
// 100% bloqueante: CADA visita espera a Supabase antes de poder mandar
// cualquier HTML — la causa real de la pantalla negra al navegar entre
// páginas, sobre todo con Supabase lento o en cold start. `next:
// { revalidate }` es el punto medio real (ISR / stale-while-revalidate):
// el visitante siempre recibe al instante la versión ya cacheada por
// Vercel, mientras en segundo plano se revalida contra Supabase — la
// visita que llega después de esa ventana ya trae lo nuevo. Tiene que
// coincidir con el `export const revalidate` de cada página que lo usa,
// si no uno de los dos termina mandando.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

const REVALIDATE_SECONDS = 30;

const isrFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, next: { revalidate: REVALIDATE_SECONDS } });

export const supabasePublicServer =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, { global: { fetch: isrFetch } })
    : null;
