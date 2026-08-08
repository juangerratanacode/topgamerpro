import { Suspense } from "react";
import FAQ from "@/components/FAQ";
import HeroSlider from "@/components/HeroSlider";
import CatalogSection from "@/components/CatalogSection";
import CatalogSkeleton from "@/components/CatalogSkeleton";

export default function HomePage() {
  return (
    <div>
      <HeroSlider />

      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogSection />
      </Suspense>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { title: "Entrega rápida", desc: "Tu recarga se procesa en minutos, no en horas." },
            { title: "Pago local", desc: "Pago Móvil, Binance y Bancolombia, sin complicaciones." },
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

      <FAQ />
    </div>
  );
}
