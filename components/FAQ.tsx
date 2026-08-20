"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "¿Cuánto tiempo tarda en llegar mi recarga?",
    a: "Se procesa y acredita en menos de 10 minutos tras confirmar el pago. En horas pico o mantenimientos del juego, puede tardar hasta 1 hora.",
  },
  {
    q: "¿Qué datos debo proporcionar para recibir mis créditos o diamantes?",
    a: "Solo requerimos tu ID de jugador o usuario. Si un juego exige datos adicionales para recarga manual, se indicará en la ficha del producto.",
  },
  {
    q: "¿Cómo sé si mi pedido fue recibido y procesado con éxito?",
    a: "Recibirás una confirmación por nuestros canales de atención al enviar tu comprobante, y una notificación final en cuanto los créditos entren a tu cuenta.",
  },
  {
    q: "¿Qué sucede si cometí un error al ingresar mi ID de jugador?",
    a: "Notifícalo de inmediato a soporte. Si la orden no se ha procesado o el ID no existe, lo corregiremos. Si el ID pertenecía a otro usuario y ya se envió la recarga, el proceso no se podrá revertir.",
  },
  {
    q: "¿Qué métodos de pago aceptan en Topgamerpro?",
    a: "Aceptamos Pago Móvil (Bs.), Binance Pay (USDT) y PayPal (USD).",
  },
  {
    q: "¿Existe alguna comisión adicional sobre el precio publicado?",
    a: "No cobramos comisiones ocultas. Únicamente los pagos por PayPal están sujetos a una pequeña tarifa cobrada directamente por su pasarela.",
  },
  {
    q: "¿Qué tan seguro es recargar a través de Topgamerpro?",
    a: "Es 100% seguro. Contamos con el respaldo de una amplia comunidad de clientes y un sistema transparente de garantías y reembolsos ante fallas del servicio.",
  },
  {
    q: "¿Cómo protegen mis datos personales y las contraseñas de mis juegos?",
    a: "Usamos cifrado de alta seguridad. En recargas manuales, los datos se usan exclusivamente para la transacción y se eliminan automáticamente al finalizar.",
  },
  {
    q: "¿Es posible solicitar un reembolso si ocurre un problema con mi compra?",
    a: "Sí. Si ocurre un error técnico imprevisto en nuestro sistema que impida completar la entrega, procesaremos la devolución o el ajuste correspondiente.",
  },
  {
    q: "¿Cuál es el horario de atención al cliente de Topgamerpro?",
    a: "La web recibe pedidos las 24 horas, los 7 días de la semana. El soporte personalizado atiende de lunes a domingo, de 8:00 a.m. a 11:00 p.m.",
  },
  {
    q: "¿Por qué la atención por WhatsApp de Topgamerpro es exclusivamente por mensaje escrito?",
    a: "Atendemos solo por texto para mantener un historial documentado del caso, consultar los sistemas en tiempo real y dar respuestas precisas. No atendemos llamadas ni notas de voz.",
  },
  {
    q: "¿Qué debo hacer si mi recarga no llega en el tiempo estipulado?",
    a: "Escribe a nuestro WhatsApp con tu número de orden o comprobante para verificar el estatus con el servidor del juego y resolver el problema.",
  },
  {
    q: "¿Necesito crear una cuenta en el sitio web para poder comprar?",
    a: "No es obligatorio. Sin embargo, registrarte te permite rastrear pedidos, ver tu historial de transacciones y agilizar futuras compras.",
  },
  {
    q: "¿En qué moneda están expresados los precios?",
    a: "Están publicados de forma transparente en la sección de cada juego en Bolívares (Bs.) y Dólares (USD).",
  },
  {
    q: "¿Ofrecen descuentos o promociones especiales?",
    a: "Sí, continuamente lanzamos ofertas de temporada y bonificaciones. Revisa la web y nuestras redes sociales para aprovecharlas.",
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
