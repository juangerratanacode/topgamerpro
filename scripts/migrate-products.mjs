// Migra los 16 productos de lib/mockProducts.ts a las tablas reales de
// Supabase (products + product_variations). Se corre una sola vez.
//
// Uso: node scripts/migrate-products.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- Cargar .env.local a mano (sin depender de dotenv) ---
function loadEnvLocal() {
  const envPath = join(__dirname, "..", ".env.local");
  const raw = readFileSync(envPath, "utf-8");
  const env = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    value = value.replace(/^"(.*)"$/, "$1");
    env[key] = value;
  }
  return env;
}

const env = loadEnvLocal();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

// --- Mismos campos reutilizables que mockProducts.ts ---
const ID_JUGADOR = { key: "player_id", label: "ID de Jugador", type: "text", placeholder: "Ej: 123456789", required: true };
const USUARIO_ROBLOX = { key: "roblox_username", label: "Usuario de Roblox", type: "text", placeholder: "Tu nombre de usuario exacto", required: true };
const CORREO_JUEGO = { key: "game_email", label: "Correo vinculado a la cuenta", type: "email", placeholder: "tu@correo.com", required: true };
const ID_SERVIDOR = { key: "server_id", label: "ID de Servidor / Zona", type: "text", placeholder: "Ej: 2001", required: true };

const products = [
  { slug: "free-fire", name: "Free Fire", category: "Free Fire", genre: "battle-royale", description: "Recarga de diamantes Free Fire, entrega manual vía WhatsApp.", image_url: "/productos/free-fire.webp", fields: [ID_JUGADOR], variations: [
    { label: "100 Diamantes", price_usd: 1.4, icon: "diamond" },
    { label: "310 Diamantes", price_usd: 3.9, icon: "diamond" },
    { label: "520 Diamantes", price_usd: 5.9, icon: "diamond" },
    { label: "1060 Diamantes", price_usd: 11.7, icon: "diamond" },
    { label: "2180 Diamantes", price_usd: 22.5, icon: "diamond" },
    { label: "5600 Diamantes", price_usd: 54, icon: "diamond" },
  ]},
  { slug: "call-of-dutty-mobile", name: "Call of Duty Mobile", category: "Call of Duty Mobile", genre: "battle-royale", description: "Recarga de CP para Call of Duty Mobile.", image_url: "/productos/call-of-dutty-mobile.webp", requires_activision_link: true, fields: [ID_JUGADOR], variations: [
    { label: "80 CP", price_usd: 1.4, icon: "cp" },
    { label: "420 CP", price_usd: 4.9, icon: "cp" },
    { label: "880 CP", price_usd: 11.7, icon: "cp" },
    { label: "2400 CP", price_usd: 28, icon: "cp" },
  ]},
  { slug: "roblox", name: "Roblox", category: "Roblox", genre: "otros", description: "Robux directo a tu cuenta.", image_url: "/productos/roblox.webp", fields: [USUARIO_ROBLOX], variations: [
    { label: "80 Robux", price_usd: 1, icon: "robux" },
    { label: "400 Robux", price_usd: 6, icon: "robux" },
    { label: "800 Robux", price_usd: 11.7, icon: "robux" },
  ]},
  { slug: "mobile-legends", name: "Mobile Legends", category: "Mobile Legends", genre: "moba", description: "Diamantes Mobile Legends: Bang Bang.", image_url: "/productos/mobile-legends.png", fields: [ID_JUGADOR, ID_SERVIDOR], variations: [
    { label: "50 Diamantes", price_usd: 1.5, icon: "diamond" },
    { label: "260 Diamantes", price_usd: 7, icon: "diamond" },
    { label: "706 Diamantes", price_usd: 13.6, icon: "diamond" },
  ]},
  { slug: "blood-strike", name: "Blood Strike", category: "Blood Strike", genre: "battle-royale", description: "Recarga de oro Blood Strike.", image_url: "/productos/blood-strike.webp", fields: [ID_JUGADOR], variations: [
    { label: "60 Oro", price_usd: 0.9, icon: "coin" },
    { label: "300 Oro", price_usd: 3.9, icon: "coin" },
    { label: "980 Oro", price_usd: 11.7, icon: "coin" },
  ]},
  { slug: "pubg-mobile", name: "PUBG Mobile", category: "PUBG Mobile", genre: "battle-royale", description: "UC para PUBG Mobile.", image_url: "/productos/pubg-mobile.jpg", fields: [ID_JUGADOR], variations: [
    { label: "60 UC", price_usd: 1.6, icon: "uc" },
    { label: "325 UC", price_usd: 6, icon: "uc" },
    { label: "660 UC", price_usd: 11.7, icon: "uc" },
  ]},
  { slug: "clash-royale", name: "Clash Royale", category: "Clash Royale", genre: "supercell", description: "Gemas Clash Royale.", image_url: "/productos/clash-royale.png", fields: [ID_JUGADOR], variations: [
    { label: "80 Gemas", price_usd: 1.4, icon: "diamond" },
    { label: "500 Gemas", price_usd: 5.9, icon: "diamond" },
    { label: "1200 Gemas", price_usd: 11.5, icon: "diamond" },
  ]},
  { slug: "clash-of-clans", name: "Clash of Clans", category: "Clash of Clans", genre: "supercell", description: "Gemas Clash of Clans.", image_url: "/productos/clash-of-clans.jpg", fields: [ID_JUGADOR], variations: [
    { label: "80 Gemas", price_usd: 1, icon: "diamond" },
    { label: "500 Gemas", price_usd: 4.5, icon: "diamond" },
    { label: "1200 Gemas", price_usd: 9, icon: "diamond" },
  ]},
  { slug: "brawl-stars", name: "Brawl Stars", category: "Brawl Stars", genre: "supercell", description: "Gemas Brawl Stars.", image_url: "/productos/brawl-stars.jpg", fields: [ID_JUGADOR], variations: [
    { label: "80 Gemas", price_usd: 1.5, icon: "diamond" },
    { label: "170 Gemas", price_usd: 3.4, icon: "diamond" },
    { label: "360 Gemas", price_usd: 6, icon: "diamond" },
  ]},
  { slug: "arena-breakout", name: "Arena Breakout", category: "Arena Breakout", genre: "battle-royale", description: "Recarga Arena Breakout.", image_url: "/productos/arena-breakout.png", fields: [ID_JUGADOR], variations: [
    { label: "Paquete Chico", price_usd: 1.5, icon: "coin" },
    { label: "Paquete Mediano", price_usd: 5.1, icon: "coin" },
    { label: "Paquete Grande", price_usd: 9.5, icon: "coin" },
  ]},
  { slug: "delta-force", name: "Delta Force", category: "Delta Force", genre: "battle-royale", description: "Recarga Delta Force.", image_url: "/productos/delta-force.webp", fields: [ID_JUGADOR], variations: [
    { label: "Paquete Chico", price_usd: 1.4, icon: "coin" },
    { label: "Paquete Mediano", price_usd: 5.7, icon: "coin" },
    { label: "Paquete Grande", price_usd: 7.7, icon: "coin" },
  ]},
  { slug: "fortnite", name: "Fortnite", category: "Fortnite", genre: "otros", description: "V-Bucks para Fortnite.", image_url: "/productos/fortnite.webp", fields: [CORREO_JUEGO], variations: [
    { label: "1000 V-Bucks", price_usd: 10, icon: "coin" },
    { label: "1300 V-Bucks", price_usd: 13, icon: "coin" },
    { label: "2800 V-Bucks", price_usd: 28.2, icon: "coin" },
  ]},
  { slug: "efootball", name: "eFootball", category: "eFootball", genre: "futbol", description: "Monedas eFootball, requiere cuenta vinculada a Konami ID.", image_url: "/productos/efootball.png", requires_konami_id: true, fields: [CORREO_JUEGO], variations: [
    { label: "100 Monedas", price_usd: 1.55, icon: "coin" },
    { label: "550 Monedas", price_usd: 3.3, icon: "coin" },
    { label: "1150 Monedas", price_usd: 5.5, icon: "coin" },
  ]},
  { slug: "fc-mobile", name: "FC Mobile", category: "FC Mobile", genre: "futbol", description: "Monedas EA Sports FC Mobile.", image_url: "/productos/fc-mobile.webp", fields: [ID_JUGADOR], variations: [
    { label: "Paquete Chico", price_usd: 1, icon: "coin" },
    { label: "Paquete Mediano", price_usd: 1.9, icon: "coin" },
    { label: "Paquete Grande", price_usd: 3.7, icon: "coin" },
  ]},
  { slug: "dream-league-soccer", name: "Dream League Soccer", category: "Dream League Soccer", genre: "futbol", description: "Monedas Dream League Soccer.", image_url: "/productos/dream-league-soccer.png", fields: [ID_JUGADOR], variations: [
    { label: "Paquete Chico", price_usd: 2.7, icon: "coin" },
    { label: "Paquete Mediano", price_usd: 4.9, icon: "coin" },
    { label: "Paquete Grande", price_usd: 5, icon: "coin" },
  ]},
  { slug: "wild-rift", name: "Wild Rift", category: "Wild Rift", genre: "moba", description: "Wild Cores para Wild Rift.", image_url: "/productos/wild-rift.webp", fields: [ID_JUGADOR, ID_SERVIDOR], variations: [
    { label: "Paquete Chico", price_usd: 5.2, icon: "diamond" },
    { label: "Paquete Mediano", price_usd: 10.7, icon: "diamond" },
    { label: "Paquete Grande", price_usd: 19.5, icon: "diamond" },
  ]},
];

async function main() {
  console.log(`Migrando ${products.length} productos...`);
  let productCount = 0;
  let variationCount = 0;

  for (const [index, p] of products.entries()) {
    const { variations, ...productData } = p;
    const { data: inserted, error } = await supabase
      .from("products")
      .upsert({ ...productData, sort_order: index }, { onConflict: "slug" })
      .select()
      .single();

    if (error) {
      console.error(`Error insertando producto "${p.slug}":`, error.message);
      continue;
    }
    productCount++;

    // Borra variaciones previas de este producto (por si se corre el script 2 veces)
    await supabase.from("product_variations").delete().eq("product_id", inserted.id);

    const variationRows = variations.map((v, vIndex) => ({
      product_id: inserted.id,
      label: v.label,
      price_usd: v.price_usd,
      icon: v.icon,
      sort_order: vIndex,
    }));

    const { error: varError } = await supabase.from("product_variations").insert(variationRows);
    if (varError) {
      console.error(`Error insertando variaciones de "${p.slug}":`, varError.message);
      continue;
    }
    variationCount += variationRows.length;
    console.log(`✓ ${p.name} (${variationRows.length} paquetes)`);
  }

  console.log(`\nListo: ${productCount}/${products.length} productos, ${variationCount} paquetes en total.`);
}

main().catch((err) => {
  console.error("Error inesperado:", err);
  process.exit(1);
});
