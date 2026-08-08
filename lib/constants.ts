// Config general del sitio. El número de WhatsApp y datos bancarios
// vienen del snippet "Número de Whatsapp" / "Envia de comando bs-usdt-pesos whatsapp"
// del sitio original — ahora configurables por variable de entorno,
// no hardcodeados en el código como estaban en PHP.

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+584123542332";

export const PAYMENT_INFO = {
  pagoMovil: {
    banco: process.env.PAGO_MOVIL_BANCO || "Banesco (0134)",
    telefono: process.env.PAGO_MOVIL_TELEFONO || "0412-3542332",
    cedula: process.env.PAGO_MOVIL_CEDULA || "V-27894619",
  },
  binance: {
    cuenta: process.env.BINANCE_CUENTA || "correo@binance.com",
  },
  bancolombia: {
    cuenta: process.env.BANCOLOMBIA_CUENTA || "Ahorros 240-000004-26",
  },
  paypal: {
    correo: process.env.PAYPAL_CORREO || "pagos@novatop.com",
  },
};

// Reglas de validación de campos de juego (mínimo 4 caracteres,
// igual que el "Escudo Anti-Trampas" del snippet original).
export const MIN_FIELD_LENGTH = 4;
