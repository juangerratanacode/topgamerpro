import Image from "next/image";
import SupportForm from "@/components/SupportForm";
import FAQ from "@/components/FAQ";

export default function SoportePage() {
  return (
    <div>
      <div className="relative overflow-hidden border-b border-brand-border">
        <Image
          src="/soporte/soporte-hero.png"
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover object-right"
        />
        {/* Degradado para que el título/texto sigan legibles sobre la imagen,
            más fuerte a la izquierda (donde va el texto) y sobre el fondo
            oscuro de marca en los bordes. */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-bg via-brand-bg/80 to-brand-bg/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-brand-bg/40" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-black mb-2">¿Necesitas ayuda?</h1>
          <p className="text-brand-textMuted max-w-lg mx-auto sm:mx-0">
            Completa el formulario y te contactamos por WhatsApp — normalmente respondemos en
            minutos.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-4">Escríbenos un mensaje</h2>
          <SupportForm />
        </div>
      </div>

      <FAQ />
    </div>
  );
}
