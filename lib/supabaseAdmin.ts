// Cliente de Supabase SOLO para el servidor (API routes). Usa la
// service_role key, que puede saltarse RLS — por eso este archivo nunca
// debe importarse desde un componente "use client".

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// `dynamic = "force-dynamic"` en las API routes no siempre alcanza para que
// las llamadas fetch INTERNAS de supabase-js se salten el Data Cache de
// Vercel/Next — en producción esto se manifestó como el admin devolviendo
// una foto vieja del catálogo (ej. sin el último paquete agregado) aunque
// la base de datos y la tienda pública ya tenían el dato nuevo. Se fuerza
// `cache: "no-store"` directo en el fetch que usa el cliente, sin depender
// de que Next lo infiera.
const noStoreFetch: typeof fetch = (input, init) => fetch(input, { ...init, cache: "no-store" });

export const supabaseAdmin =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
        global: { fetch: noStoreFetch },
      })
    : null;
