// Verificación server-side de Cloudflare Turnstile. SOLO se importa desde
// API routes (server) — usa TURNSTILE_SECRET_KEY, que nunca debe llegar al
// bundle del navegador.

export interface TurnstileVerifyResult {
  success: boolean;
  error?: string;
}

export async function verifyTurnstileToken(
  token: string | undefined | null,
  remoteIp?: string | null
): Promise<TurnstileVerifyResult> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.warn("TURNSTILE_SECRET_KEY no configurada — se rechaza la verificación por seguridad.");
    return { success: false, error: "Verificación no disponible." };
  }

  if (!token) {
    return { success: false, error: "Falta completar la verificación." };
  }

  try {
    const params = new URLSearchParams();
    params.set("secret", secretKey);
    params.set("response", token);
    if (remoteIp) params.set("remoteip", remoteIp);

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });
    const data = (await res.json()) as { success: boolean; "error-codes"?: string[] };

    if (!data.success) {
      console.warn("Turnstile rechazó el token:", data["error-codes"]);
      return { success: false, error: "No se pudo verificar que eres humano. Intenta de nuevo." };
    }
    return { success: true };
  } catch (err) {
    console.error("Error llamando a la API de Turnstile:", err);
    return { success: false, error: "No se pudo verificar en este momento. Intenta de nuevo." };
  }
}
