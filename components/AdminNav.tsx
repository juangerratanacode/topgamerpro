"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
      <div className="flex gap-1 border-b border-brand-border">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={clsx(
                "px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors",
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
    </div>
  );
}
