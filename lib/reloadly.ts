// Puerto del snippet "motor reloadly" (compra automática de gift cards)
// y "Escáner de Stock Reloadly" (validación de stock antes de comprar).
//
// OJO: las llaves reales van en variables de entorno (.env.local),
// nunca hardcodeadas como estaban en el PHP original. Genera llaves
// NUEVAS en el panel de Reloadly antes de usar esto en producción —
// las viejas quedaron expuestas en el export de WordPress.

const RELOADLY_AUTH_URL = "https://auth.reloadly.com/oauth/token";
const RELOADLY_API_URL = "https://giftcards.reloadly.com";

async function getReloadlyToken(): Promise<string> {
  const res = await fetch(RELOADLY_AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.RELOADLY_CLIENT_ID,
      client_secret: process.env.RELOADLY_CLIENT_SECRET,
      grant_type: "client_credentials",
      audience: RELOADLY_API_URL,
    }),
  });
  if (!res.ok) throw new Error("No se pudo autenticar con Reloadly");
  const data = await res.json();
  return data.access_token;
}

// Equivalente a pitcharge_bloqueo_sin_stock_estricto()
export async function checkReloadlyStock(reloadlyProductId: number): Promise<{ inStock: boolean; reason?: string }> {
  try {
    const token = await getReloadlyToken();
    const res = await fetch(`${RELOADLY_API_URL}/products/${reloadlyProductId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/com.reloadly.giftcards-v1+json",
      },
    });
    if (!res.ok) return { inStock: false, reason: "Producto no encontrado en el proveedor." };
    const data = await res.json();
    if (data.globalStatus && String(data.globalStatus).toUpperCase() !== "ACTIVE") {
      return { inStock: false, reason: "Agotado temporalmente en el proveedor." };
    }
    return { inStock: true };
  } catch {
    // Si Reloadly falla, dejamos pasar la venta (igual que el original)
    // para no bloquear ventas por un error de red temporal.
    return { inStock: true };
  }
}

// Equivalente a pitcharge_reloadly_comprar_tarjeta()
export async function purchaseReloadlyCard(params: {
  reloadlyProductId: number;
  quantity: number;
  unitPriceUsd: number;
  recipientEmail: string;
}): Promise<{ success: boolean; codes?: string[]; error?: string }> {
  // Escudo anti-bolívares del original: nunca mandar un monto absurdo
  if (params.unitPriceUsd <= 0 || params.unitPriceUsd > 300) {
    return { success: false, error: "Monto inválido, revisa el precio en USD del producto." };
  }

  try {
    const token = await getReloadlyToken();
    const res = await fetch(`${RELOADLY_API_URL}/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/com.reloadly.giftcards-v1+json",
      },
      body: JSON.stringify({
        productId: params.reloadlyProductId,
        quantity: params.quantity,
        unitPrice: params.unitPriceUsd.toFixed(2),
        senderName: "Pitanga Store",
        recipientEmail: params.recipientEmail,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.transactionId) {
      return { success: false, error: JSON.stringify(data) };
    }

    const codes: string[] = (data.cards ?? []).map((card: any) => {
      const parts = [];
      if (card.cardNumber) parts.push(`Tarjeta: ${card.cardNumber}`);
      if (card.pinCode) parts.push(`PIN: ${card.pinCode}`);
      if (card.redeemCode) parts.push(`Código: ${card.redeemCode}`);
      if (card.claimUrl) parts.push(`Enlace: ${card.claimUrl}`);
      return parts.join(" | ");
    });

    return { success: true, codes };
  } catch (e: any) {
    return { success: false, error: e?.message ?? "Error desconocido" };
  }
}
