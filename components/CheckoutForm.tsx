"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cartStore";
import { usePaymentSettings } from "@/lib/paymentSettingsStore";
import { getCartTotalForMethod, getCartItemIcon } from "@/lib/pricing";
import { useStorefrontProducts } from "@/lib/adminStore";
import { validatePaymentReference } from "@/lib/validation";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { fileToDataUrl } from "@/lib/ordersStore";
import { useCurrency, CURRENCY_META as CURRENCY_DISPLAY_META } from "@/lib/currencyStore";
import PhoneInput, { isPhoneValid, formatPhoneE164, type PhoneValue } from "@/components/PhoneInput";
import PackageIconDisplay from "@/components/PackageIconDisplay";
import type { Currency, PaymentMethodId } from "@/lib/types";
import clsx from "clsx";

const METHOD_META: Record<PaymentMethodId, { label: string; hint: string; currency: Currency }> = {
  pago_movil_manual: { label: "Pago Móvil", hint: "Bolívares", currency: "VES" },
  paypal: { label: "PayPal", hint: "Pago directo", currency: "USD" },
};

const METHOD_ORDER: PaymentMethodId[] = ["pago_movil_manual", "paypal"];

export default function CheckoutForm() {
  const { items, clearCart } = useCart();
  const { products } = useStorefrontProducts();
  const { rates } = useCurrency();
  const { settings: paymentSettings, hydrated: paymentsHydrated } = usePaymentSettings();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [method, setMethod] = useState<PaymentMethodId>("pago_movil_manual");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState<PhoneValue>({ dial: "58", national: "" });
  const [reference, setReference] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [paypalOpened, setPaypalOpened] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currency = METHOD_META[method].currency;
  const total = getCartTotalForMethod(items, method);
  const convertedTotal = total * (rates[currency] ?? 1);
  const totalDecimals = currency === "USD" ? 2 : 0;
  const formattedTotal = `${CURRENCY_DISPLAY_META[currency].symbol}${convertedTotal.toLocaleString(
    "es-VE",
    { minimumFractionDigits: totalDecimals, maximumFractionDigits: totalDecimals }
  )}`;
  const formatPriceInCurrency = (usd: number) => {
    const converted = usd * (rates[currency] ?? 1);
    return `${CURRENCY_DISPLAY_META[currency].symbol}${converted.toLocaleString("es-VE", {
      minimumFractionDigits: totalDecimals,
      maximumFractionDigits: totalDecimals,
    })}`;
  };

  const paypalUrl = `https://paypal.me/${paymentSettings.paypal.paypalMeUser}/${total.toFixed(2)}USD`;

  const step1Valid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    isPhoneValid(phone);

  // Para PayPal el "comprobante" es el pago mismo hecho a través del botón;
  // no exigimos captura, solo el ID de transacción.
  const receiptRequired = method !== "paypal";
  const canSubmit =
    step1Valid && reference.trim().length > 0 && (!receiptRequired || receiptFile !== null);

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

    setSubmitting(true);
    try {
      const customer = { firstName, lastName, email, phone: formatPhoneE164(phone) };
      const receiptDataUrl = receiptFile ? await fileToDataUrl(receiptFile) : null;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          items,
          currency,
          payment: { method, reference, receiptDataUrl },
          totalUsd: total,
        }),
      });
      const data = await res.json();
      const orderId = data.orderId ?? `TEMP-${Date.now()}`;

      const message = buildWhatsAppMessage(
        customer,
        {
          method,
          reference,
          receiptUrl: receiptDataUrl ? "adjunto en este chat" : "pago realizado vía PayPal",
        },
        items,
        orderId,
        { formatPrice: formatPriceInCurrency, formattedTotal }
      );
      const waUrl = buildWhatsAppUrl(message);

      clearCart();
      window.open(waUrl, "_blank");
      router.push(`/pedido-confirmado?orderId=${orderId}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return <p className="text-brand-textMuted">Tu carrito está vacío.</p>;
  }

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
              <input
                className="bg-brand-surfaceLight border border-brand-border rounded-lg px-4 py-3 text-white placeholder:text-brand-textMuted focus:outline-none focus:border-brand-primary"
                placeholder="Nombre"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                className="bg-brand-surfaceLight border border-brand-border rounded-lg px-4 py-3 text-white placeholder:text-brand-textMuted focus:outline-none focus:border-brand-primary"
                placeholder="Apellido"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <input
              className="w-full bg-brand-surfaceLight border border-brand-border rounded-lg px-4 py-3 text-white placeholder:text-brand-textMuted focus:outline-none focus:border-brand-primary"
              placeholder="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div>
              <label className="block text-xs font-semibold text-brand-textMuted mb-1">
                Número de WhatsApp
              </label>
              <PhoneInput value={phone} onChange={setPhone} />
            </div>
            <p className="text-xs text-brand-textMuted">
              Lo usamos solo para contactarte sobre tu recarga si hay algún problema. No necesitas
              crear una cuenta — puedes continuar como invitado.
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
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">Elige tu método de pago</h2>
              <button
                onClick={() => setStep(1)}
                className="text-xs text-brand-textMuted hover:text-white underline"
              >
                Editar datos
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {METHOD_ORDER.map((m) => (
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

            {method === "pago_movil_manual" && (
              <PaymentBox title="Datos para el Pago Móvil">
                Banco: {paymentSettings.pagoMovil.banco}
                <br />
                Teléfono: {paymentSettings.pagoMovil.telefono}
                <br />
                Cédula: {paymentSettings.pagoMovil.cedula}
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
                method === "paypal" ? "ID de transacción de PayPal" : "Últimos 4 dígitos de la referencia"
              }
              value={reference}
              onChange={(e) =>
                setReference(method === "paypal" ? e.target.value : e.target.value.replace(/[^0-9]/g, ""))
              }
              inputMode={method === "paypal" ? "text" : "numeric"}
              maxLength={method === "paypal" ? undefined : 4}
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
        )}
      </div>

      {/* Right: sticky order summary */}
      <div className="lg:sticky lg:top-24 bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4">
        <h3 className="font-bold">Resumen del pedido</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={item.cartItemId} className="flex items-center gap-3">
              <PackageIconDisplay
                variation={getCartItemIcon(item, products)}
                className="w-7 h-7 shrink-0"
              />
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
        <div className="border-t border-brand-border pt-4 flex justify-between items-center">
          <span className="font-semibold text-brand-textMuted">Total</span>
          <div className="text-right">
            <span className="font-bold text-xl text-brand-primary">{formattedTotal}</span>
            {currency !== "USD" && (
              <span className="block text-xs text-brand-textMuted">${total.toFixed(2)} USD</span>
            )}
          </div>
        </div>
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
