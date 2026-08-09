import type { Metadata } from "next";
import { Suspense } from "react";
import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollMemory from "@/components/ScrollMemory";
import { CartProvider } from "@/lib/cartStore";
import { CurrencyProvider } from "@/lib/currencyStore";

// Poppins: geométrica, muy usada en marcas tech/retail, buen contraste
// de pesos entre titulares y texto — fuente de todo el sitio.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "RecargaTuJuego — Recargas de Videojuegos",
  description: "Recarga tus juegos favoritos en minutos. Pago Móvil y PayPal.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${poppins.variable} font-sans min-h-screen flex flex-col bg-brand-bg text-white`}>
        <CurrencyProvider>
          <CartProvider>
            <Suspense fallback={null}>
              <ScrollMemory />
              <Header />
            </Suspense>
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
