/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
    // Las imágenes ya se comprimen del lado del cliente antes de subirlas
    // (fileToUploadedUrl / fileToUploadedVideoUrl en lib/image.ts: máx.
    // 1600-1920px, calidad 0.8-0.85, íconos a 300x300), así que no
    // necesitan una segunda pasada de optimización en Vercel. Con
    // `unoptimized: true`, next/image sirve el archivo tal cual viene de
    // Supabase Storage — sin pasar por el pipeline de Image Optimization
    // de Vercel — así el contador de "transformaciones" del plan gratis se
    // queda en cero para siempre, sin importar cuántas imágenes se
    // agreguen al catálogo. El costo es que el navegador no recibe
    // WebP/AVIF automático ni un srcset por breakpoint, pero como ya
    // salen livianas de por sí, no vale la pena gastar cuota por eso.
    unoptimized: true,
  },
  experimental: {
    // Por defecto el App Router vuelve a pedir las páginas dinámicas cada
    // vez que navegás "atrás" (staleTime de 0), lo que retrasa el repintado
    // el tiempo suficiente como para que la restauración de scroll llegue
    // tarde. Con esto, volver atrás usa la versión ya en caché del cliente
    // (instantánea) en vez de re-fetchear, dándole tiempo real al scroll
    // para restaurarse antes de que el usuario note el salto.
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};

module.exports = nextConfig;
