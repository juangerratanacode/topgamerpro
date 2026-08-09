// Códigos de país para el selector del teléfono en el checkout.
// Priorizamos Venezuela y Latinoamérica/Caribe (que es donde vende
// realmente la tienda), con el resto de países comunes al final.

export interface CountryCode {
  name: string;
  iso: string; // para la bandera (emoji flag construido desde el ISO)
  dial: string; // sin el "+"
}

export const COUNTRY_CODES: CountryCode[] = [
  { name: "Venezuela", iso: "VE", dial: "58" },
  { name: "Colombia", iso: "CO", dial: "57" },
  { name: "México", iso: "MX", dial: "52" },
  { name: "Perú", iso: "PE", dial: "51" },
  { name: "Chile", iso: "CL", dial: "56" },
  { name: "Argentina", iso: "AR", dial: "54" },
  { name: "Ecuador", iso: "EC", dial: "593" },
  { name: "Panamá", iso: "PA", dial: "507" },
  { name: "República Dominicana", iso: "DO", dial: "1" },
  { name: "Bolivia", iso: "BO", dial: "591" },
  { name: "Paraguay", iso: "PY", dial: "595" },
  { name: "Uruguay", iso: "UY", dial: "598" },
  { name: "Costa Rica", iso: "CR", dial: "506" },
  { name: "Guatemala", iso: "GT", dial: "502" },
  { name: "Honduras", iso: "HN", dial: "504" },
  { name: "El Salvador", iso: "SV", dial: "503" },
  { name: "Nicaragua", iso: "NI", dial: "505" },
  { name: "Cuba", iso: "CU", dial: "53" },
  { name: "Puerto Rico", iso: "PR", dial: "1" },
  { name: "España", iso: "ES", dial: "34" },
  { name: "Estados Unidos", iso: "US", dial: "1" },
  { name: "Canadá", iso: "CA", dial: "1" },
  { name: "Brasil", iso: "BR", dial: "55" },
];

export function flagEmoji(iso: string): string {
  return iso
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join("");
}

// Largo real del número nacional (sin el 0 inicial ni el código de país) por
// país, más los prefijos válidos de operadoras móviles cuando se conocen —
// antes solo se validaba el largo, lo que dejaba pasar números obviamente
// falsos como "8888888888" (10 dígitos, pasaba el filtro de Venezuela pero
// "888" no es un prefijo móvil real). República Dominicana, Puerto Rico,
// Estados Unidos y Canadá comparten el dial "1" pero mismo largo, así que
// no hace falta distinguirlos aquí (tampoco tienen prefijos únicos: usan
// códigos de área tipo NANP, no prefijos de operadora fijos).
const NATIONAL_RULES_BY_DIAL: Record<string, { min: number; max: number; prefixes?: string[] }> = {
  "58": { min: 10, max: 10, prefixes: ["412", "414", "416", "422", "424", "426"] }, // Venezuela: Movilnet (412/416/426), Movistar (414/424), Digitel (412/422)
  "57": { min: 10, max: 10, prefixes: ["3"] }, // Colombia: todo móvil empieza con 3
  "52": { min: 10, max: 10 }, // México: formato varía mucho por región, solo largo
  "51": { min: 9, max: 9, prefixes: ["9"] }, // Perú: móvil siempre empieza con 9
  "56": { min: 9, max: 9, prefixes: ["9"] }, // Chile: móvil siempre empieza con 9
  "54": { min: 10, max: 11 }, // Argentina: formato con "9"/"15" históricos, solo largo
  "593": { min: 9, max: 9, prefixes: ["9"] }, // Ecuador: móvil siempre empieza con 9
  "507": { min: 7, max: 8, prefixes: ["6"] }, // Panamá: móvil siempre empieza con 6
  "1": { min: 10, max: 10 }, // RD / PR / US / CA (códigos de área NANP)
  "591": { min: 8, max: 8, prefixes: ["6", "7"] }, // Bolivia
  "595": { min: 9, max: 9, prefixes: ["9"] }, // Paraguay
  "598": { min: 8, max: 9, prefixes: ["9"] }, // Uruguay
  "506": { min: 8, max: 8, prefixes: ["6", "7", "8"] }, // Costa Rica
  "502": { min: 8, max: 8, prefixes: ["3", "4", "5"] }, // Guatemala
  "504": { min: 8, max: 8, prefixes: ["3", "8", "9"] }, // Honduras
  "503": { min: 8, max: 8, prefixes: ["6", "7"] }, // El Salvador
  "505": { min: 8, max: 8, prefixes: ["5", "7", "8"] }, // Nicaragua
  "53": { min: 8, max: 8, prefixes: ["5"] }, // Cuba
  "34": { min: 9, max: 9, prefixes: ["6", "7"] }, // España
  "55": { min: 10, max: 11 }, // Brasil: código de área + 9 + número, solo largo
};

// Solo dígitos, con el largo real Y el prefijo de operadora móvil válido
// para el país elegido (sin el dial code). Si el país no está en el mapa,
// cae en el rango genérico anterior (7 a 12) como respaldo.
export function isValidNationalNumber(value: string, dial?: string): boolean {
  const cleaned = value.trim();
  if (!/^[0-9]+$/.test(cleaned)) return false;
  const rules = dial ? NATIONAL_RULES_BY_DIAL[dial] : undefined;
  if (!rules) return cleaned.length >= 7 && cleaned.length <= 12;
  if (cleaned.length < rules.min || cleaned.length > rules.max) return false;
  if (rules.prefixes && !rules.prefixes.some((p) => cleaned.startsWith(p))) return false;
  return true;
}

export function nationalNumberLengthHint(dial: string): string {
  const rules = dial ? NATIONAL_RULES_BY_DIAL[dial] : undefined;
  if (!rules) return "7 a 12 dígitos";
  const lengthPart = rules.min === rules.max ? `${rules.min} dígitos` : `${rules.min} a ${rules.max} dígitos`;
  if (!rules.prefixes) return lengthPart;
  return `${lengthPart}, empieza con ${rules.prefixes.join(", ")}`;
}
