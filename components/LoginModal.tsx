"use client";

// UI del modal de inicio de sesión. Todavía no está conectado a
// autenticación real — eso llega con Supabase Auth. Se renderiza vía
// portal directo a <body> porque el Header tiene backdrop-blur, y
// backdrop-filter crea un "containing block" para elementos position:fixed,
// lo que rompía el centrado del modal (quedaba pegado dentro del header).

import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export default function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-brand-surface border border-brand-border rounded-2xl overflow-hidden my-auto"
          >
            <div className="flex border-b border-brand-border">
              <button
                onClick={() => setTab("login")}
                className={clsx(
                  "flex-1 py-3 text-sm font-semibold transition-colors",
                  tab === "login" ? "text-brand-primary border-b-2 border-brand-primary" : "text-brand-textMuted"
                )}
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => setTab("register")}
                className={clsx(
                  "flex-1 py-3 text-sm font-semibold transition-colors",
                  tab === "register" ? "text-brand-primary border-b-2 border-brand-primary" : "text-brand-textMuted"
                )}
              >
                Crear cuenta
              </button>
            </div>

            <div className="p-6 space-y-3">
              {tab === "register" && (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-brand-surfaceLight border border-brand-border rounded-lg px-4 py-3 text-sm placeholder:text-brand-textMuted focus:outline-none focus:border-brand-primary"
                  placeholder="Nombre completo"
                />
              )}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-brand-surfaceLight border border-brand-border rounded-lg px-4 py-3 text-sm placeholder:text-brand-textMuted focus:outline-none focus:border-brand-primary"
                placeholder="Correo electrónico"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-brand-surfaceLight border border-brand-border rounded-lg px-4 py-3 text-sm placeholder:text-brand-textMuted focus:outline-none focus:border-brand-primary"
                placeholder="Contraseña"
              />

              {tab === "login" && (
                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "La recuperación de contraseña por correo llega cuando conectemos Supabase Auth + Resend."
                    )
                  }
                  className="text-xs text-brand-textMuted hover:text-white underline block"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              )}

              <button
                onClick={() =>
                  alert(
                    "El inicio de sesión real (y el correo de bienvenida / recuperación de clave) se conecta cuando tengamos Supabase Auth + Resend funcionando. Por ahora esto es solo la interfaz."
                  )
                }
                className="w-full bg-brand-primary hover:bg-brand-primaryDark text-brand-bg font-bold py-3 rounded-full transition-colors"
              >
                {tab === "login" ? "Entrar" : "Crear cuenta"}
              </button>

              <p className="text-center text-xs text-brand-textMuted">
                No necesitas cuenta para comprar — puedes hacerlo como invitado.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
