"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/lib/authStore";
import { useAccountOrders } from "@/lib/useAccountOrders";

const NAV_LINKS = [
  { href: "/mi-cuenta", label: "Escritorio", icon: DashboardIcon },
  { href: "/mi-cuenta/pedidos", label: "Pedidos", icon: OrdersIcon },
  { href: "/mi-cuenta/perfil", label: "Editar perfil", icon: ProfileIcon },
  { href: "/mi-cuenta/seguridad", label: "Seguridad", icon: LockIcon },
];

export default function MiCuentaLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const { points } = useAccountOrders();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-brand-textMuted">
        Cargando...
      </div>
    );
  }

  const fullName = (user.user_metadata?.full_name as string | undefined) ?? "";
  const memberSince = new Date(user.created_at).toLocaleDateString("es-VE", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 items-start">
      {/* Sidebar */}
      <aside className="bg-brand-surface border border-brand-border rounded-2xl p-5 md:sticky md:top-24">
        <div className="flex flex-col items-center text-center pb-5 mb-4 border-b border-brand-border">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center text-2xl font-extrabold text-brand-bg mb-3">
            {(fullName || user.email || "?").charAt(0).toUpperCase()}
          </div>
          <p className="font-bold">{fullName || "Sin nombre"}</p>
          <p className="text-xs text-brand-textMuted break-all">{user.email}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-5">
          <div className="bg-brand-surfaceLight border border-brand-border rounded-xl p-3 text-center">
            <p className="text-lg font-extrabold text-brand-primary">{points.toLocaleString("es-VE")}</p>
            <p className="text-[10px] text-brand-textMuted uppercase tracking-wide">Puntos</p>
          </div>
          <div className="bg-brand-surfaceLight border border-brand-border rounded-xl p-3 text-center">
            <p className="text-lg font-extrabold">{memberSince}</p>
            <p className="text-[10px] text-brand-textMuted uppercase tracking-wide">Miembro desde</p>
          </div>
        </div>

        <nav className="space-y-1">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors",
                  active
                    ? "bg-brand-primary/15 text-brand-primary"
                    : "text-brand-textMuted hover:text-white hover:bg-brand-surfaceLight"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {link.label}
              </Link>
            );
          })}
          <button
            onClick={() => {
              signOut();
              router.push("/");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-brand-textMuted hover:text-white hover:bg-brand-surfaceLight transition-colors"
          >
            <LogoutIcon className="w-4 h-4 shrink-0" />
            Salir
          </button>
        </nav>
      </aside>

      {/* Contenido */}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h8v8H3V3zm10 0h8v5h-8V3zM3 13h8v8H3v-8zm10 3h8v5h-8v-5z" />
    </svg>
  );
}
function OrdersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l1.5-3h15L21 7M3 7h18M3 7v12a1 1 0 001 1h16a1 1 0 001-1V7M9 11a3 3 0 006 0" />
    </svg>
  );
}
function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}
function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 5v1a3 3 0 01-3 3H6a3 3 0 01-3-3V6a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}
