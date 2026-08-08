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

// Validación básica: solo dígitos, entre 7 y 12 (número nacional sin el dial code).
export function isValidNationalNumber(value: string): boolean {
  return /^[0-9]{7,12}$/.test(value.trim());
}
