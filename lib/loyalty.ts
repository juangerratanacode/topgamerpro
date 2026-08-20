import type { SupabaseClient } from "@supabase/supabase-js";

// Server-only: usa supabaseAdmin (service role), nunca se importa desde un
// archivo "use client". Centraliza el cálculo del balance de puntos para
// que /api/mi-cuenta/orders (mostrarlo) y /api/orders (validar un canje)
// nunca queden desincronizados.

export const POINTS_PER_USD = 20; // 2% de cashback efectivo (20 / 1000)
export const POINTS_PER_USD_DISCOUNT = 1000; // conversión: 1000 puntos = $1 de descuento
export const POINTS_REDEMPTION_STEP = 100; // mínimo canjeable y múltiplo permitido (=$0.10)
export const MAX_REDEMPTION_RATIO = 0.5; // el descuento no puede superar el 50% del total

export interface PointsBalance {
  earned: number;
  redeemed: number;
  net: number;
}

// Ganados = 20 puntos por cada $1 en pedidos YA confirmados (no pendientes
// ni rechazados). Canjeados = suma de loyalty_redemptions del usuario.
// Neto = ganados - canjeados; nunca se guarda un "balance" directo en una
// columna propia para evitar que se desincronice de la fuente real
// (pedidos confirmados + canjes), que es lo único que se persiste.
export async function getNetPointsBalance(
  supabaseAdmin: SupabaseClient,
  userId: string
): Promise<PointsBalance> {
  const [{ data: orders }, { data: redemptions }] = await Promise.all([
    supabaseAdmin.from("orders").select("total_usd").eq("user_id", userId).eq("status", "confirmado"),
    supabaseAdmin.from("loyalty_redemptions").select("points_used").eq("user_id", userId),
  ]);

  const earned = (orders ?? []).reduce(
    (sum, o: any) => sum + Math.round(Number(o.total_usd) * POINTS_PER_USD),
    0
  );
  const redeemed = (redemptions ?? []).reduce((sum, r: any) => sum + r.points_used, 0);

  return { earned, redeemed, net: earned - redeemed };
}

// Cuántos puntos como máximo se pueden canjear en un pedido de `subtotalUsd`
// (antes de descuento), dado un balance neto disponible. Redondea siempre
// hacia abajo al múltiplo de POINTS_REDEMPTION_STEP más cercano.
export function maxRedeemablePoints(subtotalUsd: number, availablePoints: number): number {
  const capByOrder =
    Math.floor((subtotalUsd * MAX_REDEMPTION_RATIO * POINTS_PER_USD_DISCOUNT) / POINTS_REDEMPTION_STEP) *
    POINTS_REDEMPTION_STEP;
  const capByBalance = Math.floor(availablePoints / POINTS_REDEMPTION_STEP) * POINTS_REDEMPTION_STEP;
  return Math.max(0, Math.min(capByOrder, capByBalance));
}

export function pointsToUsd(points: number): number {
  return points / POINTS_PER_USD_DISCOUNT;
}
