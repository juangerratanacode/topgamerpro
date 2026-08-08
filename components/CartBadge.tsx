"use client";

import Link from "next/link";
import { useCart } from "@/lib/cartStore";

export default function CartBadge() {
  const { items } = useCart();

  return (
    <Link
      href="/carrito"
      className="relative flex items-center gap-2 bg-brand-surfaceLight hover:bg-brand-border border border-brand-border rounded-full px-4 py-2 text-sm font-semibold transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 4.6A1 1 0 005.6 19H18M9 21a1 1 0 100-2 1 1 0 000 2zM19 21a1 1 0 100-2 1 1 0 000 2z"
        />
      </svg>
      <span className="hidden sm:inline">Carrito</span>
      {items.length > 0 && (
        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-brand-primary text-white text-[11px] font-bold flex items-center justify-center">
          {items.length}
        </span>
      )}
    </Link>
  );
}
