import { Suspense } from "react";
import FAQ from "@/components/FAQ";
import HeroSlider from "@/components/HeroSlider";
import TrustSection from "@/components/TrustSection";
import CatalogSection from "@/components/CatalogSection";
import CatalogSkeleton from "@/components/CatalogSkeleton";
import HomeSection from "@/components/HomeSection";
import ReviewsCarousel from "@/components/ReviewsCarousel";
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

      <HomeSection delay={0.04}>
        <TrustSection />
      </HomeSection>

      <HomeSection delay={0.08}>
        <Suspense fallback={<CatalogSkeleton />}>
          <CatalogSection products={products} hydrated />
        </Suspense>
      </HomeSection>

      <HomeSection delay={0.16}>
        <ReviewsCarousel />
      </HomeSection>

      <HomeSection delay={0.24}>
        <FAQ />
      </HomeSection>
    </div>
  );
}
