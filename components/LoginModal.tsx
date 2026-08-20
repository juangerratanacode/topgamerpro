"use client";

// UI del modal de inicio de sesión / registro, conectada a Supabase Auth
// (useAuth de lib/authStore.tsx). Se renderiza vía portal directo a
// <body> porque el Header tiene backdrop-blur, y backdrop-filter crea un
// "containing block" para elementos position:fixed, lo que rompía el
// centrado del modal (quedaba pegado dentro del header).

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import clsx from "clsx";
import { useAuth } from "@/lib/authStore";
import { supabase } from "@/lib/supabaseClient";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  if (typeof document === "undefined") return null;

  function reset() {
    setName("");
    setEmail("");
    setPassword("");
    setError(null);
    setInfo(null);
    setTurnstileToken(null);
    turnstileRef.current?.reset();
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit() {
    setError(null);
    setInfo(null);

    if (!email.trim() || !password.trim() || (tab === "register" && !name.trim())) {
      setError("Completa todos los campos.");
      return;
    }
    if (tab === "register" && TURNSTILE_SITE_KEY && !turnstileToken) {
      setError("Completa la verificación antes de continuar.");
      return;
    }

    setSubmitting(true);
    try {
      if (tab === "login") {
        const { error } = await signIn(email.trim(), password);
        if (error) {
          setError(
            error.toLowerCase().includes("invalid")
              ? "Correo o contraseña incorrectos."
              : error
          );
          return;
        }
        handleClose();
      } else {
        const { error } = await signUp(name.trim(), email.trim(), password, turnstileToken ?? "");
        if (error) {
          setError(
            error.toLowerCase().includes("already registered")
              ? "Ya existe una cuenta con ese correo."
              : error
          );
          // El token de Turnstile es de un solo uso — si el registro falló
          // (por el motivo que sea), hay que pedir uno nuevo para reintentar.
          setTurnstileToken(null);
          turnstileRef.current?.reset();
          return;
        }
        setInfo("¡Cuenta creada! Revisa tu correo para confirmarla antes de iniciar sesión.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setError("Escribe tu correo arriba y luego pulsa \"¿Olvidaste tu contraseña?\".");
      return;
    }
    if (!supabase) return;
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/mi-cuenta` : undefined,
    });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    setInfo("Te enviamos un correo con el enlace para restablecer tu contraseña.");
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
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
                onClick={() => {
                  setTab("login");
                  setError(null);
                  setInfo(null);
                  setTurnstileToken(null);
                }}
                className={clsx(
                  "flex-1 py-3 text-sm font-semibold transition-colors",
                  tab === "login" ? "text-brand-primary border-b-2 border-brand-primary" : "text-brand-textMuted"
                )}
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => {
                  setTab("register");
                  setError(null);
                  setInfo(null);
                }}
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
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="w-full bg-brand-surfaceLight border border-brand-border rounded-lg px-4 py-3 text-sm placeholder:text-brand-textMuted focus:outline-none focus:border-brand-primary"
                placeholder="Contraseña"
              />

              {tab === "register" && TURNSTILE_SITE_KEY && (
                <div className="flex justify-center">
                  <Turnstile
                    ref={turnstileRef}
                    siteKey={TURNSTILE_SITE_KEY}
                    onSuccess={setTurnstileToken}
                    onExpire={() => setTurnstileToken(null)}
                    onError={() => setTurnstileToken(null)}
                    options={{ theme: "dark", size: "flexible" }}
                  />
                </div>
              )}

              {error && <p className="text-xs text-red-400">{error}</p>}
              {info && <p className="text-xs text-brand-green">{info}</p>}

              {tab === "login" && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-brand-textMuted hover:text-white underline block"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting || (tab === "register" && !!TURNSTILE_SITE_KEY && !turnstileToken)}
                className="w-full bg-brand-primary hover:bg-brand-primaryDark disabled:opacity-60 text-brand-bg font-bold py-3 rounded-full transition-colors"
              >
                {submitting ? "Un momento..." : tab === "login" ? "Entrar" : "Crear cuenta"}
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
