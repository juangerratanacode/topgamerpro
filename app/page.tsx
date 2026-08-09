import { Suspense } from "react";
import FAQ from "@/components/FAQ";
import HeroSlider from "@/components/HeroSlider";
import CatalogSection from "@/components/CatalogSection";
import CatalogSkeleton from "@/components/CatalogSkeleton";
import HomeSection from "@/components/HomeSection";
import { getHomeData } from "@/lib/homeData.server";

// Server Component: los datos ya vienen resueltos en el HTML que manda el
// servidor — no hay useEffect, no hay fetch en el navegador, no hay
// pantalla en blanco esperando JS. El banner y el catálogo llegan juntos,
// en el orden en que están escritos acá abajo.
export const revalidate = 0;

export default async function HomePage() {
  const { banners, products } = await getHomeData();

  return (
    <div>
      <HomeSection>
        <HeroSlider banners={banners} hydrated />
      </HomeSection>

      <HomeSection delay={0.08}>
        <Suspense fallback={<CatalogSkeleton />}>
          <CatalogSection products={products} hydrated />
        </Suspense>
      </HomeSection>

      <HomeSection delay={0.16}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { title: "Entrega rápida", desc: "Tu recarga se procesa en minutos, no en horas." },
              { title: "Pago local", desc: "Pago Móvil, sin complicaciones." },
              { title: "Soporte directo", desc: "Atención personal por WhatsApp en cada pedido." },
            ].map((b) => (
              <div
                key={b.title}
                className="bg-brand-surface border border-brand-border rounded-2xl p-5"
              >
                <div className="font-bold mb-1">{b.title}</div>
                <div className="text-sm text-brand-textMuted">{b.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </HomeSection>

      <HomeSection delay={0.24}>
        <FAQ />
      </HomeSection>
    </div>
  );
}
