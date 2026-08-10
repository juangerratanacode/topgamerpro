"use client";

import { useState } from "react";
import { useAuth } from "@/lib/authStore";

export default function MiCuentaSeguridadPage() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  async function handleSave() {
    setMessage(null);
    if (password.length < 6) {
      setMessage({ type: "error", text: "La contraseña debe tener al menos 6 caracteres." });
      return;
    }
    if (password !== confirm) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden." });
      return;
    }
    setSaving(true);
    const { error } = await updatePassword(password);
    setSaving(false);
    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }
    setPassword("");
    setConfirm("");
    setMessage({ type: "ok", text: "Tu contraseña se actualizó correctamente." });
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-extrabold">Seguridad</h1>

      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4">
        <p className="text-sm text-brand-textMuted">
          Cambia la contraseña de tu cuenta. Vas a seguir con la sesión iniciada en este
          dispositivo.
        </p>

        <div>
          <label className="block text-sm font-semibold mb-1 text-brand-textMuted">
            Nueva contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-brand-surfaceLight border border-brand-border rounded-lg px-4 py-3 text-sm placeholder:text-brand-textMuted focus:outline-none focus:border-brand-primary"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-brand-textMuted">
            Confirmar nueva contraseña
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="w-full bg-brand-surfaceLight border border-brand-border rounded-lg px-4 py-3 text-sm placeholder:text-brand-textMuted focus:outline-none focus:border-brand-primary"
            placeholder="Repite la contraseña"
          />
        </div>

        {message && (
          <p className={`text-sm ${message.type === "ok" ? "text-brand-green" : "text-red-400"}`}>
            {message.text}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={saving || !password || !confirm}
          className="bg-brand-primary hover:bg-brand-primaryDark disabled:opacity-60 text-brand-bg font-bold px-6 py-3 rounded-full transition-colors text-sm"
        >
          {saving ? "Guardando..." : "Actualizar contraseña"}
        </button>
      </div>
    </div>
  );
}
