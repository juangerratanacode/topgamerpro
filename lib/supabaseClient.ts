// PLACEHOLDER — todavía no conectamos Supabase (a propósito, según lo
// pedido). Este archivo deja listo el punto de conexión para cuando
// creemos el proyecto en Supabase y llenemos las variables de entorno.
//
// Cuando ese paso llegue, esto va a funcionar tal cual sin tener que
// tocar el resto del código que ya lo importe.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Este cliente se usa tanto en el navegador como en Server Components
// (ej. app/productos/[slug]/page.tsx). En el servidor, `revalidate = 0`
// en la página NO alcanza para forzar que las llamadas fetch INTERNAS de
// supabase-js se salten el Data Cache de Vercel/Next — ya nos pasó
// exactamente esto mismo con el admin (ver lib/supabaseAdmin.ts) y volvió
// a pasar acá: la página de un producto seguía mostrando la descripción
// vieja de hace varias ediciones atrás aunque la base de datos ya tuviera
// la nueva. Se fuerza `cache: "no-store"` directo en el fetch, sin
// depender de que Next lo infiera.
const noStoreFetch: typeof fetch = (input, init) => fetch(input, { ...init, cache: "no-store" });

// Evita que el build truene si todavía no hay variables de entorno.
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, { global: { fetch: noStoreFetch } })
    : null;
