"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AdminNav from "@/components/AdminNav";

// Lógica de sesión del panel — vive en un Client Component aparte porque
// app/staffgate7d3k/layout.tsx ahora es un Server Component (necesario
// para poder exportar `metadata` con el manifest propio del admin; un
// archivo "use client" no puede exportar metadata).
export default function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/staffgate7d3k/login";
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (isLoginPage || !supabase) {
      setChecked(true);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/staffgate7d3k/login");
      } else {
        setAuthed(true);
      }
      setChecked(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/staffgate7d3k/login");
    });

    return () => listener.subscription.unsubscribe();
  }, [isLoginPage, router]);

  if (isLoginPage) return <div>{children}</div>;

  if (!checked) {
    return <div className="max-w-4xl mx-auto px-4 py-10 text-brand-textMuted">Verificando acceso...</div>;
  }

  if (!authed) return null; // se está redirigiendo a /staffgate7d3k/login

  return (
    <div>
      <AdminNav />
      {children}
    </div>
  );
}
