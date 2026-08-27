"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useOrders } from "@/lib/ordersStore";
import { useStorefrontProducts } from "@/lib/adminStore";
import AnimatedCounter from "@/components/AnimatedCounter";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function isoDay(iso: string) {
  return iso.slice(0, 10);
}

export default function AdminDashboard() {
  const { orders, hydrated } = useOrders();
  const { products } = useStorefrontProducts();
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    fetch("/api/reviews", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { reviews: [] }))
      .then((data) => setTotalReviews(Array.isArray(data.reviews) ? data.reviews.length : 0))
      .catch(() => {});
  }, []);

  const stats = useMemo(() => {
    const confirmed = orders.filter((o) => o.status === "confirmado");
    const pending = orders.filter((o) => o.status === "pendiente");
    const revenue = confirmed.reduce((acc, o) => acc + o.totalUsd, 0);

    const uniqueCustomers = new Set(orders.map((o) => o.customer.email.toLowerCase()));

    // últimos 14 días
    const days: { date: string; label: string; ventas: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        date: key,
        label: d.toLocaleDateString("es-VE", { day: "2-digit", month: "2-digit" }),
        ventas: 0,
      });
    }
    for (const o of confirmed) {
      const day = isoDay(o.createdAt);
      const bucket = days.find((d) => d.date === day);
      if (bucket) bucket.ventas += o.totalUsd;
    }

    const revenueByProduct = new Map<string, number>();
    for (const o of confirmed) {
      for (const it of o.items) {
        revenueByProduct.set(
          it.productName,
          (revenueByProduct.get(it.productName) ?? 0) + it.unitPriceUsd * it.quantity
        );
      }
    }
    const topProducts = Array.from(revenueByProduct.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      orderCount: orders.length,
      pendingCount: pending.length,
      revenue,
      customerCount: uniqueCustomers.size,
      days,
      topProducts,
      recent: orders.slice(0, 5),
    };
  }, [orders]);

  if (!hydrated) {
    return <div className="max-w-6xl mx-auto px-4 py-10 text-brand-textMuted">Cargando...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold mb-1">Resumen del negocio</h1>
        <p className="text-sm text-brand-textMuted mb-8">
          Vista general de {products.length} juegos activos, {stats.orderCount} pedidos y{" "}
          {totalReviews.toLocaleString()} reseñas reales de tus clientes.
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <StatCard
          label="Ventas confirmadas"
          value={<AnimatedCounter value={stats.revenue} prefix="$" decimals={2} />}
          accent="from-brand-primary to-brand-accent"
        />
        <StatCard
          label="Pedidos totales"
          value={<AnimatedCounter value={stats.orderCount} />}
          accent="from-brand-accent to-brand-gold"
        />
        <StatCard
          label="Pedidos pendientes"
          value={<AnimatedCounter value={stats.pendingCount} />}
          accent="from-brand-gold to-brand-green"
          href="/staffgate7d3k/pedidos"
        />
        <StatCard
          label="Clientes únicos"
          value={<AnimatedCounter value={stats.customerCount} />}
          accent="from-brand-green to-brand-primary"
          href="/staffgate7d3k/clientes"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="bg-brand-surface border border-brand-border rounded-2xl p-5 mb-8"
      >
        <h2 className="font-bold text-sm mb-4">Ventas de los últimos 14 días</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.days} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ventasGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#22D3EE" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#232B3D" vertical={false} />
              <XAxis dataKey="label" stroke="#8A93A6" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#8A93A6" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "#161C2C",
                  border: "1px solid #232B3D",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number) => [`$${v.toFixed(2)}`, "Ventas"]}
              />
              <Area
                type="monotone"
                dataKey="ventas"
                stroke="#22D3EE"
                strokeWidth={2}
                fill="url(#ventasGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-brand-surface border border-brand-border rounded-2xl p-5"
        >
          <h2 className="font-bold text-sm mb-4">Juegos más vendidos</h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-xs text-brand-textMuted">
              Todavía no hay ventas confirmadas para mostrar un ranking.
            </p>
          ) : (
            <div className="space-y-3">
              {stats.topProducts.map(([name, revenue], i) => {
                const max = stats.topProducts[0][1];
                const pct = Math.max(8, (revenue / max) * 100);
                return (
                  <div key={name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold">
                        {i + 1}. {name}
                      </span>
                      <span className="text-brand-green font-semibold">${revenue.toFixed(2)}</span>
                    </div>
                    <div className="h-2 bg-brand-surfaceLight rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: 0.1 * i }}
                        className="h-full bg-gradient-to-r from-brand-primary to-brand-accent rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="bg-brand-surface border border-brand-border rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm">Pedidos recientes</h2>
            <Link href="/staffgate7d3k/pedidos" className="text-xs text-brand-primary font-semibold hover:underline">
              Ver todos →
            </Link>
          </div>
          {stats.recent.length === 0 ? (
            <p className="text-xs text-brand-textMuted">Todavía no hay pedidos.</p>
          ) : (
            <div className="space-y-2">
              {stats.recent.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between text-xs bg-brand-surfaceLight border border-brand-border rounded-lg px-3 py-2"
                >
                  <div>
                    <div className="font-semibold">
                      {o.customer.firstName} {o.customer.lastName}
                    </div>
                    <div className="text-brand-textMuted">
                      {new Date(o.createdAt).toLocaleDateString("es-VE")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-brand-green">${o.totalUsd.toFixed(2)}</div>
                    <div
                      className={
                        o.status === "confirmado"
                          ? "text-brand-green"
                          : o.status === "rechazado"
                          ? "text-red-400"
                          : "text-brand-gold"
                      }
                    >
                      {o.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  href,
}: {
  label: string;
  value: React.ReactNode;
  accent: string;
  href?: string;
}) {
  const content = (
    <motion.div
      variants={item}
      whileHover={{ y: -3 }}
      className="relative bg-brand-surface border border-brand-border rounded-2xl p-5 overflow-hidden group"
    >
      <div
        className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-2xl group-hover:opacity-30 transition-opacity`}
      />
      <p className="text-xs text-brand-textMuted mb-1 relative">{label}</p>
      <p className="text-2xl font-black relative">{value}</p>
    </motion.div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
