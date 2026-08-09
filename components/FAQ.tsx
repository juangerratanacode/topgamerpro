"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "¿Cuánto tarda mi recarga en llegar?",
    a: "La mayoría de las recargas se procesan en minutos una vez confirmamos tu pago por WhatsApp. En horas pico puede tardar un poco más.",
  },
  {
    q: "¿Qué métodos de pago aceptan?",
    a: "Pago Móvil (bolívares) y PayPal (USD). Elige el que prefieras al momento de pagar.",
  },
  {
    q: "¿Qué pasa si me equivoco en mi ID de jugador?",
    a: "Revisa muy bien tu ID antes de enviar el pedido. Si la recarga ya fue procesada con un ID incorrecto, no podemos revertirla — por eso pedimos confirmar los datos con cuidado.",
  },
  {
    q: "¿Necesito crear una cuenta para comprar?",
    a: "No, puedes comprar directamente sin registrarte. Solo necesitamos tu nombre, correo y los datos de tu juego.",
  },
  {
    q: "¿Cómo sé que mi pedido fue recibido?",
    a: "Después de pagar, te vamos a redirigir a WhatsApp con todos los datos de tu pedido ya armados. Ahí confirmamos tu pago y procesamos la recarga.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-1.5 h-6 bg-brand-primary rounded-full" />
        <h2 className="text-xl sm:text-2xl font-extrabold">Preguntas Frecuentes</h2>
      </div>

      <div className="space-y-2">
        {faqs.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={item.q}
              className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between text-left px-5 py-4 font-semibold text-sm"
              >
                {item.q}
                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-brand-primary text-xl leading-none"
                >
                  +
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-sm text-brand-textMuted">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
