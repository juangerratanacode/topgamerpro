"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cartStore";
import { useStorefrontProducts } from "@/lib/adminStore";
import { getCartItemIcon } from "@/lib/pricing";
import PackageIconDisplay from "@/components/PackageIconDisplay";

export default function CarritoPage() {
  const { items, removeItem, totalUsd } = useCart();
  const { products } = useStorefrontProducts();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-brand-textMuted mb-4">Tu carrito está vacío.</p>
        <Link href="/" className="text-brand-primary font-semibold">
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-extrabold mb-6">Tu carrito</h1>

      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div
            key={item.cartItemId}
            className="bg-brand-surface border border-brand-border rounded-2xl p-4 flex justify-between items-start"
          >
            <div className="flex items-start gap-3">
              <PackageIconDisplay
                variation={getCartItemIcon(item, products)}
                className="w-8 h-8 shrink-0 mt-0.5"
              />
              <div>
                <div className="font-semibold text-sm">{item.productName}</div>
                <div className="text-xs text-brand-textMuted">{item.variationLabel}</div>
                {item.gameFields.map((f) => (
                  <div key={f.label} className="text-xs text-brand-textMuted">
                    {f.label}: {f.value}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-brand-green text-sm mb-1">
                ${(item.unitPriceUsd * item.quantity).toFixed(2)}
              </div>
              <button
                onClick={() => removeItem(item.cartItemId)}
                className="text-xs text-red-400 hover:text-red-300 hover:underline"
              >
                Quitar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center border-t border-brand-border pt-4 mb-6">
        <span className="font-semibold">Total</span>
        <span className="font-bold text-lg text-brand-green">${totalUsd.toFixed(2)}</span>
      </div>

      <button
        onClick={() => router.push("/checkout")}
        className="w-full bg-brand-primary hover:bg-brand-primaryDark text-white font-bold py-3 rounded-full transition-colors"
      >
        Ir al checkout
      </button>
    </div>
  );
}
