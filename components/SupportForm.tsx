"use client";

import { useState } from "react";
import { WHATSAPP_NUMBER } from "@/lib/constants";

export default function SupportForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanPhone = WHATSAPP_NUMBER.replace("+", "");
    const text = `Hola RecargaTuJuego, soy ${name || "un cliente"} (${email || "sin correo"}).\n\n${message}`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center py-6">
        <p className="font-semibold text-brand-primary mb-1">¡Listo!</p>
        <p className="text-sm text-brand-textMuted">
          Abrimos WhatsApp con tu mensaje — solo confirma el envío allí.
        </p>
        <button
          onClick={() => {
            setSent(false);
            setMessage("");
          }}
          className="mt-4 text-sm underline text-brand-textMuted hover:text-white"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          className="w-full bg-brand-surfaceLight border border-brand-border rounded-lg px-4 py-3 text-sm placeholder:text-brand-textMuted focus:outline-none focus:border-brand-primary"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu correo (opcional)"
          className="w-full bg-brand-surfaceLight border border-brand-border rounded-lg px-4 py-3 text-sm placeholder:text-brand-textMuted focus:outline-none focus:border-brand-primary"
        />
      </div>
      <textarea
        required
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Cuéntanos qué necesitas..."
        rows={4}
        className="w-full bg-brand-surfaceLight border border-brand-border rounded-lg px-4 py-3 text-sm placeholder:text-brand-textMuted focus:outline-none focus:border-brand-primary resize-none"
      />
      <button
        type="submit"
        className="w-full sm:w-auto bg-brand-primary hover:bg-brand-primaryDark text-brand-bg font-bold px-6 py-3 rounded-full transition-colors"
      >
        Enviar por WhatsApp
      </button>
    </form>
  );
}
