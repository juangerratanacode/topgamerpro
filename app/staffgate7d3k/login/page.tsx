"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setError("Supabase no está configurado.");
      return;
    }
    setLoading(true);
    setError(null);

    // Antes de intentar, preguntamos si este correo ya gastó sus intentos
    // fallidos recientes — evita fuerza bruta (probar contraseñas una tras
    // otra) sin depender de nada del lado del cliente, que se puede
    // saltear con solo llamar signInWithPassword directo.
    const guardRes = await fetch("/api/admin/login-guard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const guard = await guardRes.json().catch(() => ({ blocked: false }));
    if (guard.blocked) {
      setLoading(false);
      setError(
        `Demasiados intentos fallidos. Esperá ${guard.windowMinutes ?? 15} minutos antes de volver a intentar.`
      );
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      fetch("/api/admin/login-attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).catch(() => {});
      setError("Correo o contraseña incorrectos.");
      return;
    }
    router.push("/staffgate7d3k");
    router.refresh();
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-brand-surface border border-brand-border rounded-2xl p-6"
      >
        <h1 className="text-xl font-extrabold mb-1">Panel de administración</h1>
        <p className="text-sm text-brand-textMuted mb-6">Acceso restringido.</p>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded-xl p-3">
            {error}
          </div>
        )}

        <label className="block text-xs font-semibold text-brand-textMuted mb-1">Correo</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-brand-surfaceLight border border-brand-border rounded-lg px-3 py-2 text-sm mb-4"
        />

        <label className="block text-xs font-semibold text-brand-textMuted mb-1">Contraseña</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-brand-surfaceLight border border-brand-border rounded-lg px-3 py-2 text-sm mb-6"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-primary hover:bg-brand-primaryDark disabled:opacity-50 text-white font-bold text-sm py-2.5 rounded-full transition-colors"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
