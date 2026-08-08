"use client";

import { usePathname } from "next/navigation";
import clsx from "clsx";

const steps = [
  { key: "producto", label: "Producto", match: (p: string) => p.startsWith("/productos") },
  { key: "carrito", label: "Carrito", match: (p: string) => p.startsWith("/carrito") },
  { key: "checkout", label: "Checkout", match: (p: string) => p.startsWith("/checkout") },
];

export default function ProgressBar() {
  const pathname = usePathname();
  const activeIndex = steps.findIndex((s) => s.match(pathname));
  if (activeIndex === -1) return null;

  return (
    <div className="border-t border-brand-border px-4 py-2 bg-brand-surface">
      <ul className="flex justify-between max-w-md mx-auto">
        {steps.map((step, i) => {
          const state = i < activeIndex ? "completed" : i === activeIndex ? "active" : "pending";
          return (
            <li key={step.key} className="flex-1 text-center relative">
              <span
                className={clsx(
                  "inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold mb-1 transition-colors",
                  state === "pending" && "bg-brand-surfaceLight text-brand-textMuted",
                  (state === "active" || state === "completed") &&
                    "bg-gradient-to-br from-brand-primary to-brand-gold text-white"
                )}
              >
                {i + 1}
              </span>
              <div
                className={clsx(
                  "text-xs",
                  state === "pending" ? "text-brand-textMuted" : "text-white font-semibold"
                )}
              >
                {step.label}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
