// Tipos centrales del proyecto. Cuando conectemos Supabase, estas
// interfaces van a coincidir con las tablas reales.

export type Currency = "USD" | "VES" | "COP";

export type PaymentMethodId = "pago_movil_manual" | "paypal";

export type PackageIcon = "diamond" | "coin" | "cp" | "uc" | "robux" | "pass" | "card" | "generic";

// Categorías de navegación, igual que en pitcharge.com (Supercell, Fútbol,
// Gift Cards, etc.) — distintas del "category" por juego que ya existía,
// que se usa como subtítulo dentro de la tarjeta de producto.
export type GameGenre =
  | "battle-royale"
  | "moba"
  | "supercell"
  | "futbol"
  | "gift-cards"
  | "otros";

export const GENRE_LABELS: Record<GameGenre, string> = {
  "battle-royale": "Battle Royale / Shooters",
  moba: "MOBA",
  supercell: "Supercell",
  futbol: "Fútbol",
  "gift-cards": "Gift Cards",
  otros: "Otros",
};

// Tipos de campo inspirados en el plugin YayExtra Product Fields del sitio
// original: le permiten al admin pedir cualquier dato extra por juego/paquete
// (ID de jugador, servidor, correo de la cuenta, contraseña temporal, etc.)
export type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "textarea"
  | "select"
  | "checkbox";

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "Texto corto",
  email: "Correo electrónico",
  password: "Contraseña",
  number: "Número",
  textarea: "Texto largo",
  select: "Selección (lista)",
  checkbox: "Casilla (sí/no)",
};

export interface GameFieldDef {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[]; // para type "select" (ej: servidor / zona)
  required?: boolean;
  minLength?: number;
  helpText?: string; // texto de ayuda debajo del campo (ej: "dónde encontrar tu ID")
}

export interface ProductVariation {
  id: string;
  label: string; // ej: "100 Diamantes"
  priceUsd: number; // precio base en USD (Pago Móvil)
  priceUsdPaypal?: number; // precio específico para PayPal, se define a mano en admin
  // (no se calcula con una fórmula adivinada — cada juego puede tener su
  // propio margen para absorber la comisión de PayPal)
  icon: PackageIcon; // respaldo genérico si no se sube imagen propia
  iconImageUrl?: string; // imagen subida por el admin (prioridad sobre icon)
  reloadlyProductId?: number | null;
  fieldsOverride?: GameFieldDef[]; // si un paquete necesita campos distintos al resto del producto
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
  category: string;
  genre: GameGenre;
  variations: ProductVariation[];
  fields: GameFieldDef[]; // campos por defecto para todos los paquetes de este producto
  requiresActivisionLink?: boolean;
  requiresKonamiId?: boolean;
}

export interface GameFieldValue {
  label: string;
  value: string;
}

export interface CartItem {
  cartItemId: string; // id único de esta línea del carrito, distinto de variationId
  productId: string;
  productSlug: string;
  productName: string;
  variationId: string;
  variationLabel: string;
  unitPriceUsd: number;
  unitPriceUsdPaypal?: number;
  quantity: number;
  gameFields: GameFieldValue[];
  reloadlyProductId?: number | null;
  icon?: PackageIcon; // respaldo genérico si no hay iconImageUrl (snapshot del paquete al agregar al carrito)
  iconImageUrl?: string;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface OrderPaymentDetails {
  method: PaymentMethodId;
  reference: string;
  receiptUrl: string;
}

export interface Order {
  id: string;
  createdAt: string;
  customer: CustomerInfo;
  items: CartItem[];
  currency: Currency;
  payment: OrderPaymentDetails;
  status: "on-hold" | "processing" | "completed" | "cancelled";
  totalUsd: number;
}
