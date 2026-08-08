"use client";

// fetch() con el token de sesión del admin adjunto — lo usan todos los
// hooks que escriben en /api/admin/* (y PATCH de /api/orders) para que el
// servidor pueda verificar que quien llama está logueado (ver adminAuth.ts).

import { supabase } from "./supabaseClient";

export async function adminFetch(input: string, init: RequestInit = {}): Promise<Response> {
  let token: string | null = null;
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token ?? null;
  }

  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return fetch(input, { ...init, headers });
}
