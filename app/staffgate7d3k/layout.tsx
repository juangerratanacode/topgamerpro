import type { Metadata } from "next";
import AdminAuthGate from "@/components/AdminAuthGate";

// Manifest propio de esta sección (public/admin-manifest.webmanifest):
// si alguien instala la web app desde acá adentro, queda como un ícono
// separado del de la tienda pública, apuntando directo al panel. Next no
// soporta un manifest.ts anidado por segmento (solo el de la raíz de
// app/), así que el archivo vive como estático en /public y se enlaza acá
// a mano.
export const metadata: Metadata = {
  manifest: "/admin-manifest.webmanifest",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminAuthGate>{children}</AdminAuthGate>;
}
