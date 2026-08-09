import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cómo recargar — TopGamerPro",
  description: "El paso a paso para recargar tu juego favorito en minutos.",
};

const STEPS = [
  {
    n: 1,
    title: "Elige tu juego y paquete",
    desc: "Busca tu juego en el catálogo y selecciona el paquete de monedas, diamantes o pases que quieras recargar.",
  },
  {
    n: 2,
    title: "Paga con Pago Móvil o PayPal",
    desc: "Completa tus datos y elige el método de pago que prefieras — todo el proceso es en la misma página, sin crear cuenta.",
  },
  {
    n: 3,
    title: "Tu pago se valida automáticamente",
    desc: "Adjuntas tu comprobante y confirmamos la referencia al instante, sin que tengas que esperar horas.",
  },
  {
    n: 4,
    title: "Recibes tu recarga en minutos",
    desc: "En cuanto se valida el pago, procesamos la recarga directo a tu cuenta — normalmente en menos de 10 minutos.",
  },
];

export default function ComoRecargarPage() {
  return (
    <div>
      <div className="bg-hero-gradient border-b border-brand-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h1 className="text-3xl sm:text-4xl font-black mb-2">¿Cómo funciona la recarga?</h1>
          <p className="text-brand-textMuted max-w-lg mx-auto">
            4 pasos simples, sin cuentas ni complicaciones — de elegir tu paquete a tener la
            recarga en tu cuenta.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-4">
        {STEPS.map((step) => (
          <div
            key={step.n}
            className="flex items-start gap-4 bg-brand-surface border border-brand-border rounded-2xl p-5"
          >
            <span className="shrink-0 w-9 h-9 rounded-full bg-brand-primary/15 text-brand-primary font-bold flex items-center justify-center">
              {step.n}
            </span>
            <div>
              <div className="font-bold text-white mb-1">{step.title}</div>
              <div className="text-sm text-brand-textMuted">{step.desc}</div>
            </div>
          </div>
        ))}

        <div className="pt-4 text-center">
          <Link
            href="/#catalogo"
            className="inline-flex items-center justify-center bg-brand-primary hover:bg-brand-primaryDark text-white font-bold py-3 px-8 rounded-full transition-colors"
          >
            Ver catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
