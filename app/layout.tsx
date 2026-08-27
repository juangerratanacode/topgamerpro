import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollMemory from "@/components/ScrollMemory";
import FloatingHelpButton from "@/components/FloatingHelpButton";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { CartProvider } from "@/lib/cartStore";
import { CurrencyProvider } from "@/lib/currencyStore";
import { AuthProvider } from "@/lib/authStore";

// Poppins: geométrica, muy usada en marcas tech/retail, buen contraste
// de pesos entre titulares y texto — fuente de todo el sitio.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

const TITLE = "TopGamerPro — Recargas de Videojuegos";
const DESCRIPTION = "Recarga tus juegos favoritos en minutos. Pago Móvil y PayPal.";

export const metadata: Metadata = {
  // Sin esto, las URLs relativas de Open Graph (og:image, etc.) no se
  // resuelven a una URL absoluta y algunos clientes (WhatsApp, Twitter/X)
  // simplemente no muestran la imagen al compartir un link.
  metadataBase: new URL("https://topgamerpro.com"),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://topgamerpro.com",
    siteName: "TopGamerPro",
    images: [{ url: "/hero/hero-visual.png", width: 1200, height: 630 }],
    locale: "es_VE",
    type: "website",
  },
  // app/icon.png y app/apple-icon.png ya se detectan solos por convención
  // de Next (App Router) — no hace falta declararlos acá.
  //
  // El manifest SÍ hay que declararlo a mano acá (en vez de usar el
  // archivo especial app/manifest.ts): cuando existe ese archivo, Next lo
  // usa para TODAS las páginas sin excepción, ignorando cualquier
  // `metadata.manifest` que se declare en un layout más específico — así
  // era imposible que /staffgate7d3k tuviera su propio manifest de admin.
  // Con esto como string explícito, un layout hijo (ver
  // app/staffgate7d3k/layout.tsx) sí puede pisarlo para su sección.
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    title: "TopGamerPro",
    statusBarStyle: "black-translucent",
  },
};

// themeColor/colorScheme viven en un export separado de metadata desde
// Next 14 (antes daban un warning de deprecación si iban dentro de
// metadata).
export const viewport: Viewport = {
  themeColor: "#05060F",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${poppins.variable} font-sans min-h-screen flex flex-col bg-brand-bg text-white`}>
        <AuthProvider>
          <CurrencyProvider>
            <CartProvider>
              <Suspense fallback={null}>
                <ScrollMemory />
                <Header />
              </Suspense>
              <main className="flex-1">{children}</main>
              <Footer />
              <FloatingHelpButton />
              <ServiceWorkerRegister />
            </CartProvider>
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
