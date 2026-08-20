import type { Metadata } from "next";
import { Suspense } from "react";
import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollMemory from "@/components/ScrollMemory";
import FloatingHelpButton from "@/components/FloatingHelpButton";
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
            </CartProvider>
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
