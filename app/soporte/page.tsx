import SupportForm from "@/components/SupportForm";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import FAQ from "@/components/FAQ";

export default function SoportePage() {
  const cleanPhone = WHATSAPP_NUMBER.replace("+", "");

  return (
    <div>
      <div className="bg-hero-gradient border-b border-brand-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h1 className="text-3xl sm:text-4xl font-black mb-2">¿Necesitas ayuda?</h1>
          <p className="text-brand-textMuted max-w-lg mx-auto">
            Escríbenos directo o revisa las preguntas frecuentes — normalmente respondemos en
            minutos.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 grid sm:grid-cols-2 gap-4">
        <a
          href={`https://wa.me/${cleanPhone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-brand-surface border border-brand-border rounded-2xl p-6 hover:border-brand-whatsapp transition-colors flex items-center gap-4"
        >
          <span className="w-12 h-12 rounded-full bg-brand-whatsapp/15 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-brand-whatsapp">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.87 9.87 0 004.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2z" />
            </svg>
          </span>
          <div>
            <div className="font-bold">Escríbenos por WhatsApp</div>
            <div className="text-sm text-brand-textMuted">Respuesta directa y rápida</div>
          </div>
        </a>

        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex items-center gap-4">
          <span className="w-12 h-12 rounded-full bg-brand-primary/15 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-brand-primary" fill="none">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <div>
            <div className="font-bold">Horario de atención</div>
            <div className="text-sm text-brand-textMuted">Todos los días, 8am - 11pm</div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-4">
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-4">Escríbenos un mensaje</h2>
          <SupportForm />
        </div>
      </div>

      <FAQ />
    </div>
  );
}
