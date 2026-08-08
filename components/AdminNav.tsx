"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { supabase } from "@/lib/supabaseClient";

const TABS = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/catalogo", label: "Catálogo" },
  { href: "/admin/banners", label: "Portadas" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/comentarios", label: "Comentarios" },
  { href: "/admin/pagos", label: "Métodos de Pago" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    if (supabase) await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
      <div className="flex items-center justify-between gap-1 border-b border-brand-border">
        <div className="flex gap-1 overflow-x-auto">
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
