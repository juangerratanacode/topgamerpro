// PLACEHOLDER — todavía no conectamos Supabase (a propósito, según lo
// pedido). Este archivo deja listo el punto de conexión para cuando
// creemos el proyecto en Supabase y llenemos las variables de entorno.
//
// Cuando ese paso llegue, esto va a funcionar tal cual sin tener que
// tocar el resto del código que ya lo importe.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Evita que el build truene si todavía no hay variables de entorno.
export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
