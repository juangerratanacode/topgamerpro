"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { supabase } from "@/lib/supabaseClient";

const TABS = [
  { href: "/staffgate7d3k", label: "Resumen" },
  { href: "/staffgate7d3k/catalogo", label: "Catálogo" },
  { href: "/staffgate7d3k/banners", label: "Portadas" },
  { href: "/staffgate7d3k/pedidos", label: "Pedidos" },
  { href: "/staffgate7d3k/clientes", label: "Clientes" },
  { href: "/staffgate7d3k/usuarios", label: "Usuarios" },
  { href: "/staffgate7d3k/comentarios", label: "Comentarios" },
  { href: "/staffgate7d3k/pagos", label: "Métodos de Pago" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    if (supabase) await supabase.auth.signOut();
    router.push("/staffgate7d3k/login");
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
      <div className="flex items-center justify-between gap-1 border-b border-brand-border">
        <div className="flex gap-1 overflow-x-auto" style={{ touchAction: "pan-x" }}>
          {/* touchAction: pan-x — sin esto, un swipe que no es 100%
              horizontal podía resolverse como scroll vertical de toda la
              página en vez de mover esta fila de pestañas, que es angosta
              y queda arriba de todo (más propensa a que el dedo se desvíe
              un poco al deslizar). */}
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={clsx(
                  "px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap",
                  active
                    ? "border-brand-primary text-white"
                    : "border-transparent text-brand-textMuted hover:text-white"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
        <button
          onClick={handleLogout}
          className="px-3 py-2.5 text-sm font-semibold text-brand-textMuted hover:text-white shrink-0"
        >
          Salir
        </button>
      </div>
    </div>
  );
}
