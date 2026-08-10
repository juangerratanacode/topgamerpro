"use client";

import { useState } from "react";
import { useAuth } from "@/lib/authStore";

export default function MiCuentaPerfilPage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState((user?.user_metadata?.full_name as string | undefined) ?? "");
  const [phone, setPhone] = useState((user?.user_metadata?.phone as string | undefined) ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const { error } = await updateProfile(name.trim(), phone.trim());
    setSaving(false);
    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }
    setMessage({ type: "ok", text: "Tus datos se guardaron correctamente." });
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-extrabold">Editar perfil</h1>

      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1 text-brand-textMuted">Nombre completo</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-brand-surfaceLight border border-brand-border rounded-lg px-4 py-3 text-sm placeholder:text-brand-textMuted focus:outline-none focus:border-brand-primary"
            placeholder="Tu nombre completo"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-brand-textMuted">
            Correo electrónico
          </label>
          <input
            value={user?.email ?? ""}
            disabled
            className="w-full bg-brand-surfaceLight/50 border border-brand-border rounded-lg px-4 py-3 text-sm text-brand-textMuted cursor-not-allowed"
          />
          <p className="text-xs text-brand-textMuted/70 mt-1">
            El correo no se puede cambiar por ahora.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-brand-textMuted">
            Teléfono (opcional)
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-brand-surfaceLight border border-brand-border rounded-lg px-4 py-3 text-sm placeholder:text-brand-textMuted focus:outline-none focus:border-brand-primary"
            placeholder="+58 4XX XXX XXXX"
          />
        </div>

        {message && (
          <p className={`text-sm ${message.type === "ok" ? "text-brand-green" : "text-red-400"}`}>
            {message.text}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="bg-brand-primary hover:bg-brand-primaryDark disabled:opacity-60 text-brand-bg font-bold px-6 py-3 rounded-full transition-colors text-sm"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
