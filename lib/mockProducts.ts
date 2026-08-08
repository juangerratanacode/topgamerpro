// Datos de ejemplo SOLO para poder ver el sitio funcionando en el
// navegador antes de conectar Supabase. Cuando armemos la base de
// datos, este archivo se reemplaza por una consulta real y se borra.
//
// Las imágenes en /public/productos/ son las MISMAS que ya usabas en
// pitcharge.com, extraídas directo del export de WordPress.

import type { Product, GameFieldDef } from "./types";

const ID_JUGADOR: GameFieldDef = {
  key: "player_id",
  label: "ID de Jugador",
  type: "text",
  placeholder: "Ej: 123456789",
  required: true,
};

const USUARIO_ROBLOX: GameFieldDef = {
  key: "roblox_username",
  label: "Usuario de Roblox",
  type: "text",
  placeholder: "Tu nombre de usuario exacto",
  required: true,
};

const CORREO_JUEGO: GameFieldDef = {
  key: "game_email",
  label: "Correo vinculado a la cuenta",
  type: "email",
  placeholder: "tu@correo.com",
  required: true,
};

const ID_SERVIDOR: GameFieldDef = {
  key: "server_id",
  label: "ID de Servidor / Zona",
  type: "text",
  placeholder: "Ej: 2001",
  required: true,
};

export const mockProducts: Product[] = [
  {
    id: "1",
    slug: "free-fire",
    name: "Free Fire",
    category: "Free Fire",
    genre: "battle-royale",
    description: "Recarga de diamantes Free Fire, entrega manual vía WhatsApp.",
    imageUrl: "/productos/free-fire.webp",
    fields: [ID_JUGADOR],
    variations: [
      { id: "v1", label: "100 Diamantes", priceUsd: 1.4, icon: "diamond" },
      { id: "v2", label: "310 Diamantes", priceUsd: 3.9, icon: "diamond" },
      { id: "v3", label: "520 Diamantes", priceUsd: 5.9, icon: "diamond" },
      { id: "v4", label: "1060 Diamantes", priceUsd: 11.7, icon: "diamond" },
      { id: "v5", label: "2180 Diamantes", priceUsd: 22.5, icon: "diamond" },
      { id: "v6", label: "5600 Diamantes", priceUsd: 54, icon: "diamond" },
    ],
  },
  {
    id: "2",
    slug: "call-of-dutty-mobile",
    name: "Call of Duty Mobile",
    category: "Call of Duty Mobile",
    genre: "battle-royale",
    description: "Recarga de CP para Call of Duty Mobile.",
    imageUrl: "/productos/call-of-dutty-mobile.webp",
    requiresActivisionLink: true,
    fields: [ID_JUGADOR],
    variations: [
      { id: "v1", label: "80 CP", priceUsd: 1.4, icon: "cp" },
      { id: "v2", label: "420 CP", priceUsd: 4.9, icon: "cp" },
      { id: "v3", label: "880 CP", priceUsd: 11.7, icon: "cp" },
      { id: "v4", label: "2400 CP", priceUsd: 28, icon: "cp" },
    ],
  },
  {
    id: "3",
    slug: "roblox",
    name: "Roblox",
    category: "Roblox",
    genre: "otros",
    description: "Robux directo a tu cuenta.",
    imageUrl: "/productos/roblox.webp",
    fields: [USUARIO_ROBLOX],
    variations: [
      { id: "v1", label: "80 Robux", priceUsd: 1, icon: "robux" },
      { id: "v2", label: "400 Robux", priceUsd: 6, icon: "robux" },
      { id: "v3", label: "800 Robux", priceUsd: 11.7, icon: "robux" },
    ],
  },
  {
    id: "4",
    slug: "mobile-legends",
    name: "Mobile Legends",
    category: "Mobile Legends",
    genre: "moba",
    description: "Diamantes Mobile Legends: Bang Bang.",
    imageUrl: "/productos/mobile-legends.png",
    fields: [ID_JUGADOR, ID_SERVIDOR],
    variations: [
      { id: "v1", label: "50 Diamantes", priceUsd: 1.5, icon: "diamond" },
      { id: "v2", label: "260 Diamantes", priceUsd: 7, icon: "diamond" },
      { id: "v3", label: "706 Diamantes", priceUsd: 13.6, icon: "diamond" },
    ],
  },
  {
    id: "5",
    slug: "blood-strike",
    name: "Blood Strike",
    category: "Blood Strike",
    genre: "battle-royale",
    description: "Recarga de oro Blood Strike.",
    imageUrl: "/productos/blood-strike.webp",
    fields: [ID_JUGADOR],
    variations: [
      { id: "v1", label: "60 Oro", priceUsd: 0.9, icon: "coin" },
      { id: "v2", label: "300 Oro", priceUsd: 3.9, icon: "coin" },
      { id: "v3", label: "980 Oro", priceUsd: 11.7, icon: "coin" },
    ],
  },
  {
    id: "6",
    slug: "pubg-mobile",
    name: "PUBG Mobile",
    category: "PUBG Mobile",
    genre: "battle-royale",
    description: "UC para PUBG Mobile.",
    imageUrl: "/productos/pubg-mobile.jpg",
    fields: [ID_JUGADOR],
    variations: [
      { id: "v1", label: "60 UC", priceUsd: 1.6, icon: "uc" },
      { id: "v2", label: "325 UC", priceUsd: 6, icon: "uc" },
      { id: "v3", label: "660 UC", priceUsd: 11.7, icon: "uc" },
    ],
  },
  {
    id: "7",
    slug: "clash-royale",
    name: "Clash Royale",
    category: "Clash Royale",
    genre: "supercell",
    description: "Gemas Clash Royale.",
    imageUrl: "/productos/clash-royale.png",
    fields: [ID_JUGADOR],
    variations: [
      { id: "v1", label: "80 Gemas", priceUsd: 1.4, icon: "diamond" },
      { id: "v2", label: "500 Gemas", priceUsd: 5.9, icon: "diamond" },
      { id: "v3", label: "1200 Gemas", priceUsd: 11.5, icon: "diamond" },
    ],
  },
  {
    id: "8",
    slug: "clash-of-clans",
    name: "Clash of Clans",
    category: "Clash of Clans",
    genre: "supercell",
    description: "Gemas Clash of Clans.",
    imageUrl: "/productos/clash-of-clans.jpg",
    fields: [ID_JUGADOR],
    variations: [
      { id: "v1", label: "80 Gemas", priceUsd: 1, icon: "diamond" },
      { id: "v2", label: "500 Gemas", priceUsd: 4.5, icon: "diamond" },
      { id: "v3", label: "1200 Gemas", priceUsd: 9, icon: "diamond" },
    ],
  },
  {
    id: "9",
    slug: "brawl-stars",
    name: "Brawl Stars",
    category: "Brawl Stars",
    genre: "supercell",
    description: "Gemas Brawl Stars.",
    imageUrl: "/productos/brawl-stars.jpg",
    fields: [ID_JUGADOR],
    variations: [
      { id: "v1", label: "80 Gemas", priceUsd: 1.5, icon: "diamond" },
      { id: "v2", label: "170 Gemas", priceUsd: 3.4, icon: "diamond" },
      { id: "v3", label: "360 Gemas", priceUsd: 6, icon: "diamond" },
    ],
  },
  {
    id: "10",
    slug: "arena-breakout",
    name: "Arena Breakout",
    category: "Arena Breakout",
    genre: "battle-royale",
    description: "Recarga Arena Breakout.",
    imageUrl: "/productos/arena-breakout.png",
    fields: [ID_JUGADOR],
    variations: [
      { id: "v1", label: "Paquete Chico", priceUsd: 1.5, icon: "coin" },
      { id: "v2", label: "Paquete Mediano", priceUsd: 5.1, icon: "coin" },
      { id: "v3", label: "Paquete Grande", priceUsd: 9.5, icon: "coin" },
    ],
  },
  {
    id: "11",
    slug: "delta-force",
    name: "Delta Force",
    category: "Delta Force",
    genre: "battle-royale",
    description: "Recarga Delta Force.",
    imageUrl: "/productos/delta-force.webp",
    fields: [ID_JUGADOR],
    variations: [
      { id: "v1", label: "Paquete Chico", priceUsd: 1.4, icon: "coin" },
      { id: "v2", label: "Paquete Mediano", priceUsd: 5.7, icon: "coin" },
      { id: "v3", label: "Paquete Grande", priceUsd: 7.7, icon: "coin" },
    ],
  },
  {
    id: "12",
    slug: "fortnite",
    name: "Fortnite",
    category: "Fortnite",
    genre: "otros",
    description: "V-Bucks para Fortnite.",
    imageUrl: "/productos/fortnite.webp",
    fields: [CORREO_JUEGO],
    variations: [
      { id: "v1", label: "1000 V-Bucks", priceUsd: 10, icon: "coin" },
      { id: "v2", label: "1300 V-Bucks", priceUsd: 13, icon: "coin" },
      { id: "v3", label: "2800 V-Bucks", priceUsd: 28.2, icon: "coin" },
    ],
  },
  {
    id: "13",
    slug: "efootball",
    name: "eFootball",
    category: "eFootball",
    genre: "futbol",
    description: "Monedas eFootball, requiere cuenta vinculada a Konami ID.",
    imageUrl: "/productos/efootball.png",
    requiresKonamiId: true,
    fields: [CORREO_JUEGO],
    variations: [
      { id: "v1", label: "100 Monedas", priceUsd: 1.55, icon: "coin" },
      { id: "v2", label: "550 Monedas", priceUsd: 3.3, icon: "coin" },
      { id: "v3", label: "1150 Monedas", priceUsd: 5.5, icon: "coin" },
    ],
  },
  {
    id: "14",
    slug: "fc-mobile",
    name: "FC Mobile",
    category: "FC Mobile",
    genre: "futbol",
    description: "Monedas EA Sports FC Mobile.",
    imageUrl: "/productos/fc-mobile.webp",
    fields: [ID_JUGADOR],
    variations: [
      { id: "v1", label: "Paquete Chico", priceUsd: 1, icon: "coin" },
      { id: "v2", label: "Paquete Mediano", priceUsd: 1.9, icon: "coin" },
      { id: "v3", label: "Paquete Grande", priceUsd: 3.7, icon: "coin" },
    ],
  },
  {
    id: "15",
    slug: "dream-league-soccer",
    name: "Dream League Soccer",
    category: "Dream League Soccer",
    genre: "futbol",
    description: "Monedas Dream League Soccer.",
    imageUrl: "/productos/dream-league-soccer.png",
    fields: [ID_JUGADOR],
    variations: [
      { id: "v1", label: "Paquete Chico", priceUsd: 2.7, icon: "coin" },
      { id: "v2", label: "Paquete Mediano", priceUsd: 4.9, icon: "coin" },
      { id: "v3", label: "Paquete Grande", priceUsd: 5, icon: "coin" },
    ],
  },
  {
    id: "16",
    slug: "wild-rift",
    name: "Wild Rift",
    category: "Wild Rift",
    genre: "moba",
    description: "Wild Cores para Wild Rift.",
    imageUrl: "/productos/wild-rift.webp",
    fields: [ID_JUGADOR, ID_SERVIDOR],
    variations: [
      { id: "v1", label: "Paquete Chico", priceUsd: 5.2, icon: "diamond" },
      { id: "v2", label: "Paquete Mediano", priceUsd: 10.7, icon: "diamond" },
      { id: "v3", label: "Paquete Grande", priceUsd: 19.5, icon: "diamond" },
    ],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return mockProducts.find((p) => p.slug === slug);
}

export function getVariationFields(product: Product, variationId: string): GameFieldDef[] {
  const variation = product.variations.find((v) => v.id === variationId);
  return variation?.fieldsOverride ?? product.fields;
}
