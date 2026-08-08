/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
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
