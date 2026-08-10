"use client";

// Contexto de autenticación de clientes (separado del admin, que usa su
// propio login en /admin/login). Envuelve Supabase Auth: sesión, signIn,
// signUp y signOut, y escucha onAuthStateChange para mantenerse en sync
// si el usuario cierra sesión en otra pestaña.

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (fullName: string, phone: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: "Supabase no configurado" };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    if (!supabase) return { error: "Supabase no configurado" };
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        // Sin esto, el link del correo de confirmación usa el "Site URL"
        // configurado en el proyecto de Supabase — que quedó en
        // localhost:3000 desde que se armó en desarrollo. Esto fuerza la
        // URL real sin importar esa configuración (igual hay que agregar
        // el dominio de producción a la lista de Redirect URLs permitidas
        // en Supabase, o el link va a fallar con "requested path is invalid").
        emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/mi-cuenta` : undefined,
      },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  // Editar nombre/teléfono desde /mi-cuenta/perfil — se guardan como
  // user_metadata de Supabase Auth, no hace falta una tabla aparte.
  const updateProfile = useCallback(async (fullName: string, phone: string) => {
    if (!supabase) return { error: "Supabase no configurado" };
    const { error } = await supabase.auth.updateUser({ data: { full_name: fullName, phone } });
    return { error: error?.message ?? null };
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    if (!supabase) return { error: "Supabase no configurado" };
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error?.message ?? null };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
