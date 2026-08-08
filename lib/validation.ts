import { MIN_FIELD_LENGTH } from "./constants";
import type { GameFieldValue } from "./types";

// Puerto de pitcharge_validacion_estricta_yayextra() — el "Escudo
// Anti-Trampas": mínimo 4 caracteres, formato de correo si el campo
// lo pide.
export function validateGameFields(fields: GameFieldValue[]): string | null {
  for (const field of fields) {
    const value = field.value.trim();
    if (value.length === 0) {
      return "No puedes dejar campos obligatorios en blanco.";
    }
    if (value.length < MIN_FIELD_LENGTH) {
      return `El campo "${field.label}" es muy corto, escribe al menos ${MIN_FIELD_LENGTH} caracteres.`;
    }
    if (field.label.toLowerCase().includes("correo")) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return `El campo "${field.label}" debe ser un correo válido.`;
      }
    }
  }
  return null;
}

export function validatePaymentReference(method: string, reference: string): string | null {
  const cleaned = reference.trim();
  if (method === "binance_manual" && cleaned.length !== 6) {
    return "El ID de Binance debe tener exactamente 6 dígitos.";
  }
  if ((method === "pago_movil_manual" || method === "bancolombia_manual") && cleaned.length !== 4) {
    return "La referencia debe tener exactamente 4 dígitos.";
  }
  return null;
}
