"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Buscador de juegos. Escribe a la URL (?buscar=) para que CatalogSection
// filtre — así funciona sin importar si estás en el inicio o llegaste desde
// otra página, y el resultado se puede compartir/recargar.
export default function SearchBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("buscar") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // si el usuario navega y vuelve, refleja lo que haya en la URL
  useEffect(() => {
    setValue(searchParams.get("buscar") ?? "");
  }, [searchParams]);

  function pushQuery(q: string) {
    const params = new URLSearchParams(pathname === "/" ? searchParams.toString() : "");
    if (q) params.set("buscar", q);
    else params.delete("buscar");
    const qs = params.toString();
    router.push(`/${qs ? `?${qs}` : ""}#catalogo`, { scroll: false });
  }

  function handleChange(v: string) {
    setValue(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushQuery(v), 300);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (debounceRef.current) clearTimeout(debounceRef.current);
        pushQuery(value);
      }}
      className={`relative ${className}`}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Buscar juego..."
        className="w-full bg-brand-surfaceLight border border-brand-border rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder:text-brand-textMuted focus:outline-none focus:border-brand-primary transition-colors"
      />
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-textMuted"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </form>
  );
}
