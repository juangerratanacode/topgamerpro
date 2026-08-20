"use client";

import Link from "next/link";
import { useAuth } from "@/lib/authStore";
import { useAccountOrders } from "@/lib/useAccountOrders";

export default function MiCuentaEscritorioPage() {
  const { user } = useAuth();
  const { orders, points, pointsRedeemedTotal, loading } = useAccountOrders();

  const fullName = (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ?? "";
  const memberSince = user
    ? new Date(user.created_at).toLocaleDateString("es-VE", { month: "short", year: "numeric" })
    : "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Hola, {fullName || "de nuevo"}</h1>
        <p className="text-brand-textMuted text-sm">
          Desde tu panel puedes ver tus pedidos recientes, tus puntos y editar tu información.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<BagIcon />}
          value={loading ? "..." : String(orders?.length ?? 0)}
          label="Pedidos"
        />
        <StatCard
          icon={<StarIcon />}
          value={loading ? "..." : points.toLocaleString("es-VE")}
          label="Puntos"
          accent
        />
        <StatCard icon={<UserIcon />} value={memberSince} label="Miembro desde" />
      </div>

      <div>
        <h2 className="font-bold text-lg mb-3">Acceso rápido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <QuickLink href="/mi-cuenta/pedidos" icon={<BagIcon />} label="Mis pedidos" />
          <QuickLink href="/mi-cuenta/perfil" icon={<UserIcon />} label="Editar perfil" />
          <QuickLink href="/" icon={<StoreIcon />} label="Ir a la tienda" />
        </div>
      </div>

      <div className="bg-gradient-to-r from-brand-primary/15 to-brand-accent/15 border border-brand-primary/30 rounded-2xl p-5 flex items-center justify-between gap-4">
        <p className="text-sm text-brand-textMuted">
          Ganas <span className="text-brand-primary font-bold">20 puntos</span> por cada $1 en
          pedidos confirmados. Cada <span className="text-brand-primary font-bold">1,000 puntos</span>{" "}
          equivalen a <span className="text-brand-primary font-bold">$1</span> de descuento —
          podés usarlos en el checkout de tu próximo pedido.
        </p>
      </div>

      {!loading && pointsRedeemedTotal > 0 && (
        <p className="text-xs text-brand-textMuted">
          Ya canjeaste{" "}
          <span className="text-white font-semibold">{pointsRedeemedTotal.toLocaleString("es-VE")}</span>{" "}
          puntos en total (${(pointsRedeemedTotal / 1000).toFixed(2)} en descuentos).
        </p>
      )}
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  accent,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 flex items-center gap-4">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
          accent ? "bg-brand-primary/15 text-brand-primary" : "bg-brand-surfaceLight text-brand-textMuted"
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xl font-extrabold leading-none">{value}</p>
        <p className="text-xs text-brand-textMuted mt-1">{label}</p>
      </div>
    </div>
  );
}

function QuickLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="bg-brand-surface border border-brand-border rounded-2xl p-5 flex flex-col items-center gap-2 text-center hover:border-brand-primary/60 transition-colors"
    >
      <div className="w-10 h-10 rounded-xl bg-brand-surfaceLight text-brand-primary flex items-center justify-center">
        {icon}
      </div>
      <span className="text-sm font-semibold">{label}</span>
    </Link>
  );
}

function BagIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l1.5-3h15L21 7M3 7h18M3 7v12a1 1 0 001 1h16a1 1 0 001-1V7M9 11a3 3 0 006 0" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
function StoreIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l1-5h16l1 5M3 9h18M3 9v10a1 1 0 001 1h16a1 1 0 001-1V9M9 21V13h6v8" />
    </svg>
  );
}
