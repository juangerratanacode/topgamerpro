"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useCart } from "@/lib/cartStore";
import { usePaymentSettings, type PaymentSettings } from "@/lib/paymentSettingsStore";
import { getCartTotalForMethod, getCartItemIcon } from "@/lib/pricing";
import { useStorefrontProducts } from "@/lib/adminStore";
import { validatePaymentReference } from "@/lib/validation";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { fileToDataUrl } from "@/lib/ordersStore";
import { useCurrency, CURRENCY_META as CURRENCY_DISPLAY_META } from "@/lib/currencyStore";
import { useAuth } from "@/lib/authStore";
import { useAccountOrders } from "@/lib/useAccountOrders";
import { maxRedeemablePoints, pointsToUsd, POINTS_REDEMPTION_STEP } from "@/lib/loyalty";
import PhoneInput, { isPhoneValid, formatPhoneE164, type PhoneValue } from "@/components/PhoneInput";
import PackageIconDisplay from "@/components/PackageIconDisplay";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import type { Currency, PaymentMethodId } from "@/lib/types";
import clsx from "clsx";

const METHOD_META: Record<PaymentMethodId, { label: string; hint: string; currency: Currency }> = {
  pago_movil_manual: { label: "Pago Móvil", hint: "Bolívares", currency: "VES" },
  paypal: { label: "PayPal", hint: "Pago directo", currency: "USD" },
  binance: { label: "Binance", hint: "USDT", currency: "USD" },
};

// Qué métodos puede elegir el cliente según la moneda que tiene
// seleccionada en el switcher del header: en Bolívares, solo Pago Móvil;
// si eligió específicamente "PayPal" como moneda, ese va primero (así ve
// el precio real con comisión y el método ya viene preseleccionado); en
// Dólares "genéricos" van Binance primero y PayPal como alternativa.
function methodsForDisplayCurrency(display: Currency): PaymentMethodId[] {
  if (display === "VES") return ["pago_movil_manual"];
  if (display === "PAYPAL") return ["paypal", "binance"];
  return ["binance", "paypal"];
}

const SETTINGS_KEY_BY_METHOD: Record<PaymentMethodId, keyof PaymentSettings> = {
  pago_movil_manual: "pagoMovil",
  paypal: "paypal",
  binance: "binance",
};

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const CHECKOUT_DRAFT_KEY = "tgp_checkout_draft_v1";

export default function CheckoutForm() {
  const { items, clearCart } = useCart();
  const { products } = useStorefrontProducts();
  const { rates, display } = useCurrency();
  const { settings: paymentSettings, hydrated: paymentsHydrated } = usePaymentSettings();
  const { user, session } = useAuth();
  const { points: pointsAvailable } = useAccountOrders();
  const router = useRouter();

  const [usePoints, setUsePoints] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  // Solo se le pide Turnstile a invitados (sin sesión) — un cliente
  // logueado ya pasó la verificación una vez al crear la cuenta.
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const needsTurnstile = !user && !!TURNSTILE_SITE_KEY;

  // Los métodos disponibles dependen de la moneda que el cliente eligió en
  // el switcher del header: en Bs. solo Pago Móvil, en USD/COP Binance o
  // PayPal — así el cliente nunca ve un método que no aplica a su moneda.
  // Además se filtran los que el admin desactivó desde /staffgate7d3k/pagos.
  const availableMethods = methodsForDisplayCurrency(display).filter(
    (m) => paymentSettings[SETTINGS_KEY_BY_METHOD[m]].enabled
  );

  const [step, setStep] = useState<1 | 2>(1);
  // Al pasar de "Tus datos" a "Pago" (o volver), el scroll se queda donde
  // estaba — si el cliente llegó a "Continuar al pago" habiendo scrolleado
  // hasta el fondo del formulario, el resumen y el método de pago quedan
  // fuera de vista y hay que hacer scroll manual para verlos.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);
  const [method, setMethod] = useState<PaymentMethodId>(
    availableMethods[0] ?? methodsForDisplayCurrency(display)[0]
  );

  // Si el cliente cambia de moneda (ej. de Bs. a USD) mientras está en el
  // checkout, el método activo puede dejar de ser válido — lo reajustamos
  // al primero disponible para esa moneda.
  useEffect(() => {
    if (availableMethods.length > 0 && !availableMethods.includes(method)) setMethod(availableMethods[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [display]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState<PhoneValue>({ dial: "58", national: "" });
  const [reference, setReference] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [paypalOpened, setPaypalOpened] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // En algunos celulares el navegador descarga la pestaña del checkout por
  // falta de memoria (típico si el cliente cambia de app a mitad del
  // proceso, ej. para copiar el número de referencia del pago) y al volver
  // la recarga de cero — el estado en memoria se pierde y el formulario
  // aparece "reseteado" pidiendo los datos otra vez, aunque el cliente
  // nunca los borró. Guardamos un borrador en sessionStorage para poder
  // recuperarlo si eso pasa.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CHECKOUT_DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft.firstName) setFirstName(draft.firstName);
      if (draft.lastName) setLastName(draft.lastName);
      if (draft.email) setEmail(draft.email);
      if (draft.phone) setPhone(draft.phone);
      if (draft.step === 2) setStep(2);
    } catch {
      // borrador corrupto, se ignora
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        CHECKOUT_DRAFT_KEY,
        JSON.stringify({ firstName, lastName, email, phone, step })
      );
    } catch {
      // ej. modo incógnito con storage bloqueado — no es crítico
    }
  }, [firstName, lastName, email, phone, step]);

  // Si el cliente tiene sesión iniciada, le precargamos su nombre/correo
  // guardados en la cuenta para que no los vuelva a escribir — sigue
  // pudiendo editarlos, esto es solo un punto de partida.
  useEffect(() => {
    if (!user) return;
    const fullName = (user.user_metadata?.full_name as string | undefined) ?? "";
    const [fName, ...rest] = fullName.split(" ");
    setFirstName((prev) => prev || fName || "");
    setLastName((prev) => prev || rest.join(" "));
    setEmail((prev) => prev || user.email || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const currency = METHOD_META[method].currency;
  const subtotalUsd = getCartTotalForMethod(items, method);

  // Tope de puntos canjeables: no más de lo que el cliente tiene, no más
  // del 50% del pedido, y siempre en múltiplos de POINTS_REDEMPTION_STEP —
  // recalculado cada vez que cambia el carrito/método (el subtotal en USD
  // puede variar) o el balance de puntos.
  const maxPoints = user ? maxRedeemablePoints(subtotalUsd, pointsAvailable) : 0;
  useEffect(() => {
    if (!usePoints) {
      setPointsToRedeem(0);
      return;
    }
    setPointsToRedeem((prev) => Math.min(prev > 0 ? prev : maxPoints, maxPoints));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usePoints, maxPoints]);

  const discountUsd = pointsToUsd(pointsToRedeem);
  const total = Math.max(0, subtotalUsd - discountUsd);
  const convertedTotal = total * (rates[currency] ?? 1);
  const convertedSubtotal = subtotalUsd * (rates[currency] ?? 1);
  const totalDecimals = currency === "USD" ? 2 : 0;
  const formatAmount = (usd: number) =>
    `${CURRENCY_DISPLAY_META[currency].symbol}${(usd * (rates[currency] ?? 1)).toLocaleString("es-VE", {
      minimumFractionDigits: totalDecimals,
      maximumFractionDigits: totalDecimals,
    })}`;
  const formattedTotal = formatAmount(total);
  const formatPriceInCurrency = formatAmount;

  const paypalUrl = `https://paypal.me/${paymentSettings.paypal.paypalMeUser}/${total.toFixed(2)}USD`;

  const step1Valid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    isPhoneValid(phone);

  // Para PayPal el "comprobante" es el pago mismo hecho a través del
  // botón; Pago Móvil y Binance sí piden captura de pantalla porque no hay
  // forma automática de validarlos.
  const receiptRequired = method === "pago_movil_manual" || method === "binance";
  // No basta con "no vacío" — tiene que cumplir el largo exacto que pide
  // cada método (4 dígitos Pago Móvil, 6 Binance) antes de habilitar el
  // botón, no solo al hacer click.
  const canSubmit =
    step1Valid &&
    availableMethods.length > 0 &&
    reference.trim().length > 0 &&
    !validatePaymentReference(method, reference) &&
    (!receiptRequired || receiptFile !== null) &&
    (!needsTurnstile || !!turnstileToken);

  async function handleSubmit() {
    const refError = validatePaymentReference(method, reference);
    if (refError) {
      alert(refError);
      return;
    }
    if (receiptRequired && !receiptFile) {
      alert("Debes adjuntar el comprobante de pago.");
      return;
    }
    if (needsTurnstile && !turnstileToken) {
      alert("Completa la verificación antes de confirmar el pedido.");
      return;
    }

    // Abrimos la pestaña YA, antes de cualquier "await" — los navegadores
    // (sobre todo en mobile) solo permiten window.open() sin bloqueo si
    // pasa de forma síncrona dentro del gesto de click. Si se llama después
    // de un fetch/await, ya "perdió" ese permiso y el popup se bloquea sin
    // avisar. Recién le seteamos la URL real de WhatsApp cuando el mensaje
    // está listo.
    //
    // Antes esto abría "about:blank" — mientras se sube la foto del
    // comprobante y se crea el pedido (lo más lento del checkout, sobre
    // todo con mala señal), el cliente se queda mirando ESTA pestaña
    // nueva (el navegador le da foco a ella, no a la de checkout que sí
    // tiene su "Procesando..."), y una pantalla en blanco sin nada da la
    // sensación de que se rompió algo. redirigiendo.html es una página
    // mínima con spinner + texto para que quede claro que se está
    // procesando en vez de parecer un error.
    const waWindow = window.open("/redirigiendo.html", "_blank");

    setSubmitting(true);
    try {
      const customer = { firstName, lastName, email, phone: formatPhoneE164(phone) };
      const receiptDataUrl = receiptFile ? await fileToDataUrl(receiptFile) : null;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          customer,
          items,
          currency,
          payment: { method, reference, receiptDataUrl },
          // Se manda el SUBTOTAL sin descuento — el servidor es quien resta
          // los puntos canjeados después de validar que el cliente
          // realmente los tiene disponibles, nunca se confía en un total
          // ya descontado que venga del navegador.
          totalUsd: subtotalUsd,
          totalConverted: convertedSubtotal,
          pointsRedeemed: usePoints ? pointsToRedeem : 0,
          turnstileToken: needsTurnstile ? turnstileToken : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Cerramos la pestaña en blanco que abrimos para WhatsApp — nunca
        // va a tener a dónde ir. El token de Turnstile es de un solo uso,
        // así que también hay que pedir uno nuevo antes de reintentar.
        waWindow?.close();
        setTurnstileToken(null);
        turnstileRef.current?.reset();
        alert(data.error ?? "No se pudo crear el pedido. Intenta de nuevo.");
        return;
      }
      const orderId = data.orderId ?? `TEMP-${Date.now()}`;

      // El pedido YA quedó creado en la base de datos en este punto — si
      // algo falla armando el mensaje de WhatsApp (ej. un item viejo del
      // carrito guardado en localStorage de antes de que existiera algún
      // campo nuevo), no puede perderse la redirección: sin este try/catch
      // la pestaña de WhatsApp se quedaba pegada en "Confirmando tu
      // pedido..." para siempre y el cliente nunca se enteraba de que el
      // pedido sí se hizo.
      let waUrl: string;
      try {
        // wa.me solo puede pre-llenar texto — no hay forma de adjuntar la
        // imagen automáticamente al abrir el chat, así que en vez de decir
        // "adjunto en este chat" (que nunca pasaba solo) se manda un link
        // corto con dominio propio (topgamerpro.com) que redirige a la foto
        // real — así el cliente no ve el dominio técnico de Supabase en el
        // chat, y el link sigue abriendo la imagen con un toque.
        const message = buildWhatsAppMessage(
          customer,
          {
            method,
            reference,
            receiptUrl: data.receiptShortUrl
              ? data.receiptShortUrl
              : method === "paypal"
              ? "pago realizado vía PayPal"
              : "pago realizado vía Binance",
          },
          items,
          orderId,
          { formatPrice: formatPriceInCurrency, formattedTotal },
          usePoints && pointsToRedeem > 0
            ? { points: pointsToRedeem, discountLabel: formatAmount(discountUsd) }
            : undefined
        );
        waUrl = buildWhatsAppUrl(message);
      } catch (err) {
        console.error("No se pudo armar el mensaje de WhatsApp:", err);
        waUrl = buildWhatsAppUrl(
          `¡Hola! Quiero realizar un pedido:\nOrden: #${orderId.slice(0, 8).toUpperCase()}\nCliente: ${customer.firstName} ${customer.lastName}\nWhatsApp: ${customer.phone}`
        );
      }

      clearCart();
      try {
        sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);
      } catch {
        // no crítico
      }
      if (waWindow) {
        // Redirige la pestaña que ya estaba abierta — esto sí lo permiten
        // los navegadores porque la ventana ya existía.
        waWindow.location.href = waUrl;
      } else {
        // Bloqueado igual (raro, pero pasa): mandamos la URL de WhatsApp a
        // la página de confirmación para que el cliente tenga un botón real
        // con el que abrirlo a mano.
      }
      router.push(`/pedido-confirmado?orderId=${orderId}&wa=${encodeURIComponent(waUrl)}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return <p className="text-brand-textMuted">Tu carrito está vacío.</p>;
  }

  // Una sola fuente para el resumen — se muestra dos veces (arriba del
  // método de pago en mobile, y en la barra lateral en desktop) sin
  // duplicar la lógica ni arriesgarse a que una copia quede desactualizada
  // respecto a la otra.
  const orderSummary = (
    <>
      <h3 className="font-bold">Resumen del pedido</h3>
      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.cartItemId} className="flex items-center gap-3">
            <PackageIconDisplay variation={getCartItemIcon(item, products)} className="w-7 h-7 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{item.productName}</p>
              <p className="text-xs text-brand-textMuted">
                {item.variationLabel}
                {item.quantity > 1 ? ` × ${item.quantity}` : ""}
              </p>
            </div>
            <span className="text-sm font-semibold shrink-0">
              ${(item.unitPriceUsd * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      {usePoints && pointsToRedeem > 0 && (
        <div className="border-t border-brand-border pt-3 space-y-1.5 text-sm">
          <div className="flex justify-between text-brand-textMuted">
            <span>Subtotal</span>
            <span>{formatAmount(subtotalUsd)}</span>
          </div>
          <div className="flex justify-between text-brand-primary font-semibold">
            <span>Descuento por puntos</span>
            <span>-{formatAmount(discountUsd)}</span>
          </div>
        </div>
      )}
      <div
        className={clsx(
          !usePoints || pointsToRedeem === 0 ? "border-t border-brand-border pt-4" : "pt-1",
          "flex justify-between items-center"
        )}
      >
        <span className="font-semibold text-brand-textMuted">Total</span>
        <div className="text-right">
          <span className="font-bold text-xl text-brand-primary">{formattedTotal}</span>
          {/* Solo se muestra el equivalente en USD cuando la moneda de
              visualización es PayPal (ahí el monto ya tiene la comisión
              sumada, y aclarar el USD de base tiene sentido). En Bs. y en
              USD/Binance el total ya es el número final — mostrar el
              mismo monto dos veces es ruido, no información nueva. */}
          {currency === "PAYPAL" && (
            <span className="block text-xs text-brand-textMuted">${total.toFixed(2)} USD</span>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
      {/* Left: steps */}
      <div className="space-y-6 min-w-0">
        {/* Step indicator */}
        <div className="flex items-center gap-3 text-sm font-semibold">
          <StepDot active={step === 1} done={step === 2} n={1} label="Tus datos" />
          <div className="flex-1 h-px bg-brand-border" />
          <StepDot active={step === 2} done={false} n={2} label="Pago" />
        </div>

        {step === 1 && (
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-lg">¿Quién recibe la confirmación?</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-brand-textMuted mb-1">Nombre</label>
                <input
                  className="w-full bg-brand-surfaceLight border border-brand-border rounded-lg px-4 py-3 text-white placeholder:text-brand-textMuted focus:outline-none focus:border-brand-primary"
                  placeholder="Nombre"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-textMuted mb-1">Apellido</label>
                <input
                  className="w-full bg-brand-surfaceLight border border-brand-border rounded-lg px-4 py-3 text-white placeholder:text-brand-textMuted focus:outline-none focus:border-brand-primary"
                  placeholder="Apellido"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-textMuted mb-1">Correo electrónico</label>
              <input
                className="w-full bg-brand-surfaceLight border border-brand-border rounded-lg px-4 py-3 text-white placeholder:text-brand-textMuted focus:outline-none focus:border-brand-primary"
                placeholder="Correo electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-textMuted mb-1">
                Número de WhatsApp
              </label>
              <PhoneInput value={phone} onChange={setPhone} />
            </div>
            <p className="text-xs text-brand-textMuted">
              Lo usamos solo para contactarte sobre tu recarga si hay algún problema.
            </p>
            <button
              onClick={() => step1Valid && setStep(2)}
              disabled={!step1Valid}
              className={clsx(
                "w-full font-bold py-3 rounded-full transition-colors",
                step1Valid
                  ? "bg-brand-primary hover:bg-brand-primaryDark text-brand-bg"
                  : "bg-brand-surfaceLight text-brand-textMuted cursor-not-allowed"
              )}
            >
              Continuar al pago
            </button>
          </div>
        )}

        {step === 2 && paymentsHydrated && (
          <>
            {/* Copia mobile del resumen, arriba del método de pago — en
                desktop ya se ve en la barra lateral al mismo tiempo, así
                que acá se oculta para no repetirlo dos veces. */}
            <div className="lg:hidden bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4">
              {orderSummary}
            </div>

            <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-bold text-lg">Elige tu método de pago</h2>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-brand-textMuted hover:text-white underline shrink-0"
                >
                  Editar datos
                </button>
              </div>

              {/* Antes solo se podía cambiar de moneda subiendo al switcher
                  del header — acá el cliente ya está viendo los métodos de
                  pago disponibles, así que conviene poder cambiar de
                  Bs./USD sin salir de esta sección. */}
              <div className="flex items-center justify-between gap-2 bg-brand-surfaceLight border border-brand-border rounded-xl px-3 py-2">
                <span className="text-xs text-brand-textMuted">Moneda</span>
                <CurrencySwitcher />
              </div>

            {availableMethods.length === 0 ? (
              <p className="text-sm text-brand-textMuted bg-brand-surfaceLight border border-brand-border rounded-xl p-4">
                No hay métodos de pago disponibles en esta moneda por ahora. Probá cambiando de
                moneda arriba, o escribinos por WhatsApp.
              </p>
            ) : (
              <div className={clsx("grid gap-2", availableMethods.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
                {availableMethods.map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setMethod(m);
                      setPaypalOpened(false);
                    }}
                    className={clsx(
                      "border-2 rounded-xl py-3 text-sm font-semibold transition-colors text-center",
                      method === m
                        ? "border-brand-primary bg-brand-primary/10 text-white"
                        : "border-brand-border bg-brand-surfaceLight text-brand-textMuted hover:border-brand-textMuted"
                    )}
                  >
                    <div>{METHOD_META[m].label}</div>
                    <div className="text-[10px] font-normal opacity-70">{METHOD_META[m].hint}</div>
                  </button>
                ))}
              </div>
            )}

            {user && maxPoints >= POINTS_REDEMPTION_STEP && (
              <div className="bg-brand-surfaceLight border border-brand-border rounded-xl p-4">
                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <span className="text-sm font-semibold">
                    Usar mis puntos{" "}
                    <span className="text-brand-textMuted font-normal">
                      ({pointsAvailable.toLocaleString("es-VE")} disponibles)
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    checked={usePoints}
                    onChange={(e) => setUsePoints(e.target.checked)}
                    className="w-5 h-5 accent-brand-primary shrink-0"
                  />
                </label>

                {usePoints && (
                  <div className="mt-3 space-y-2">
                    <input
                      type="range"
                      min={0}
                      max={maxPoints}
                      step={POINTS_REDEMPTION_STEP}
                      value={pointsToRedeem}
                      onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                      className="w-full accent-brand-primary"
                    />
                    <div className="flex items-center justify-between text-xs text-brand-textMuted">
                      <span>
                        {pointsToRedeem.toLocaleString("es-VE")} puntos ={" "}
                        <span className="text-brand-primary font-semibold">
                          -{formatAmount(discountUsd)}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setPointsToRedeem(maxPoints)}
                        className="underline hover:text-white"
                      >
                        Usar el máximo
                      </button>
                    </div>
                    <p className="text-[11px] text-brand-textMuted">
                      El descuento no puede superar el 50% del pedido. Se canjea en múltiplos de{" "}
                      {POINTS_REDEMPTION_STEP.toLocaleString("es-VE")}.
                    </p>
                  </div>
                )}
              </div>
            )}

            {method === "pago_movil_manual" && (
              <PaymentBox title="Datos para el Pago Móvil">
                Banco: {paymentSettings.pagoMovil.banco}
                <br />
                Teléfono: {paymentSettings.pagoMovil.telefono}
                <br />
                Cédula: {paymentSettings.pagoMovil.cedula}
              </PaymentBox>
            )}
            {method === "binance" && (
              <PaymentBox title="Datos para el pago por Binance">
                Envía {formattedTotal} en USDT a través de Binance Pay o P2P a:
                <br />
                Correo/ID: {paymentSettings.binance.correoOId}
                <br />
                Nombre: {paymentSettings.binance.nombre}
              </PaymentBox>
            )}
            {method === "paypal" && (
              <div className="space-y-3">
                <PaymentBox title="Pago directo con PayPal">
                  Pulsa el botón para ir a PayPal con el monto exacto ({formattedTotal}) ya
                  cargado a la cuenta {paymentSettings.paypal.correo}. Cuando termines de pagar,
                  vuelve aquí y confirma con el ID de transacción.
                </PaymentBox>
                <a
                  href={paypalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setPaypalOpened(true)}
                  className="flex items-center justify-center gap-2 w-full bg-[#0070BA] hover:bg-[#005ea6] text-white font-bold py-3 rounded-full transition-colors"
                >
                  Pagar {formattedTotal} con PayPal
                </a>
                {!paypalOpened && (
                  <p className="text-xs text-brand-textMuted text-center">
                    Se abre en una pestaña nueva — vuelve aquí después de pagar.
                  </p>
                )}
              </div>
            )}
            <input
              className="w-full bg-brand-surfaceLight border border-brand-border rounded-lg px-4 py-3 text-white placeholder:text-brand-textMuted focus:outline-none focus:border-brand-primary"
              placeholder={
                method === "paypal"
                  ? "ID de transacción de PayPal"
                  : method === "binance"
                  ? "Últimos 6 dígitos del ID de transacción"
                  : "Últimos 4 dígitos de la referencia"
              }
              value={reference}
              onChange={(e) =>
                setReference(method === "paypal" ? e.target.value : e.target.value.replace(/[^0-9]/g, ""))
              }
              inputMode={method === "paypal" ? "text" : "numeric"}
              maxLength={method === "paypal" ? undefined : method === "binance" ? 6 : 4}
            />

            {receiptRequired && (
              <div>
                <label className="block text-sm font-semibold mb-2 text-brand-textMuted">
                  Comprobante de pago
                </label>
                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-brand-border rounded-xl py-6 cursor-pointer hover:border-brand-primary transition-colors text-sm text-brand-textMuted">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
                  />
                  {receiptFile ? receiptFile.name : "Haz clic para subir la imagen"}
                </label>
              </div>
            )}

            <div className="flex items-center gap-3 bg-brand-whatsapp/10 border border-brand-whatsapp/30 rounded-xl p-3">
              <span className="w-9 h-9 rounded-full bg-brand-whatsapp/20 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-brand-whatsapp">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.87 9.87 0 004.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2z" />
                </svg>
              </span>
              <p className="text-xs text-brand-textMuted">
                <span className="text-white font-semibold">Un paso más:</span> al confirmar se abre
                WhatsApp con tu pedido ya redactado — solo tienes que darle enviar.
              </p>
            </div>

            {needsTurnstile && (
              <div className="flex justify-center">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={TURNSTILE_SITE_KEY!}
                  onSuccess={setTurnstileToken}
                  onExpire={() => setTurnstileToken(null)}
                  onError={() => setTurnstileToken(null)}
                  options={{ theme: "dark", size: "flexible" }}
                />
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className={clsx(
                "w-full font-bold py-3 rounded-full text-white flex items-center justify-center gap-2 transition-colors",
                canSubmit
                  ? "bg-brand-whatsapp hover:bg-brand-whatsappDark"
                  : "bg-brand-surfaceLight text-brand-textMuted cursor-not-allowed"
              )}
            >
              {submitting ? "Procesando..." : "Confirmar por WhatsApp"}
            </button>
            </div>
          </>
        )}
      </div>

      {/* Right: sticky order summary — en desktop se ve siempre (pasos 1 y
          2); en mobile se oculta durante el paso 2 porque ahí ya se
          muestra la copia de arriba, justo encima del método de pago. */}
      <div
        className={clsx(
          "lg:sticky lg:top-24 bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4",
          step === 2 && "hidden lg:block"
        )}
      >
        {orderSummary}
      </div>
    </div>
  );
}

function StepDot({ active, done, n, label }: { active: boolean; done: boolean; n: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={clsx(
          "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
          active
            ? "bg-brand-primary text-brand-bg"
            : done
            ? "bg-brand-primary/20 text-brand-primary"
            : "bg-brand-surfaceLight text-brand-textMuted"
        )}
      >
        {n}
      </span>
      <span className={active ? "text-white" : "text-brand-textMuted"}>{label}</span>
    </div>
  );
}

function PaymentBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-brand-surfaceLight border border-brand-border rounded-xl p-4 text-sm">
      <strong className="text-white block mb-1">{title}</strong>
      <span className="text-brand-textMuted">{children}</span>
    </div>
  );
}
