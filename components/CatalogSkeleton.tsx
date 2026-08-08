// Esqueleto con (aprox.) la misma altura que CatalogSection real. Se usa
// tanto como fallback de <Suspense> (mientras el árbol hace bail-out a
// client-only por useSearchParams) como mientras el store de productos
// hidrata desde localStorage — en ambos casos, si la altura colapsara a 0,
// la restauración de scroll del navegador (ej. al volver atrás) "aterriza"
// en el punto equivocado de la página.
export default function CatalogSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 animate-pulse">
      <div className="h-7 w-52 bg-brand-surface rounded-lg mb-6" />
      <div className="flex gap-2.5 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-10 w-28 bg-brand-surface rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-square bg-brand-surface rounded-2xl" />
        ))}
      </div>
    </section>
  );
}
