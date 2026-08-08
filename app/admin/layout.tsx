"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AdminNav from "@/components/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (isLoginPage || !supabase) {
      setChecked(true);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/admin/login");
      } else {
        setAuthed(true);
      }
      setChecked(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/admin/login");
    });

    return () => listener.subscription.unsubscribe();
  }, [isLoginPage, router]);

  if (isLoginPage) return <div>{children}</div>;

  if (!checked) {
    return <div className="max-w-4xl mx-auto px-4 py-10 text-brand-textMuted">Verificando acceso...</div>;
  }

  if (!authed) return null; // se está redirigiendo a /admin/login

  return (
    <div>
      <AdminNav />
      {children}
    </div>
  );
}
