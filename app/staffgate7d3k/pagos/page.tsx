"use client";

import { usePaymentSettings, type PaymentSettings } from "@/lib/paymentSettingsStore";
import SaveBar from "@/components/SaveBar";
import clsx from "clsx";

export default function PagosPage() {
  const { settings, hydrated, saving, saveError, save, update } = usePaymentSettings();

  if (!hydrated) {
    return <div className="max-w-3xl mx-auto px-4 py-10 text-brand-textMuted">Cargando...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-extrabold mb-2">Métodos de pago</h1>
      <p className="text-sm text-brand-textMuted mb-8">
        Estos son los datos que ve el cliente en el checkout para cada método. Cámbialos aquí
        cuando cambies de banco o de PayPal — se actualiza en todo el sitio al instante. Con el
        interruptor de arriba de cada uno lo podés apagar temporalmente (ej. mientras no tenés
        saldo en esa cuenta) sin perder los datos cargados.
      </p>

      <div className="space-y-6">
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
          <MethodHeader
            title="Pago Móvil (Bolívares)"
            enabled={settings.pagoMovil.enabled}
            onToggle={(v) => update("pagoMovil", { enabled: v })}
          />
          <div className="grid sm:grid-cols-3 gap-3">
            <Field
              label="Banco"
              value={settings.pagoMovil.banco}
              onChange={(v) => update("pagoMovil", { banco: v })}
            />
            <Field
              label="Teléfono"
              value={settings.pagoMovil.telefono}
              onChange={(v) => update("pagoMovil", { telefono: v })}
            />
            <Field
              label="Cédula"
              value={settings.pagoMovil.cedula}
              onChange={(v) => update("pagoMovil", { cedula: v })}
            />
          </div>
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
          <MethodHeader
            title="PayPal"
            enabled={settings.paypal.enabled}
            onToggle={(v) => update("paypal", { enabled: v })}
          />
          <p className="text-xs text-brand-textMuted mb-4">
            El botón "Pagar con PayPal" del checkout lleva al cliente directo a
            paypal.me/{settings.paypal.paypalMeUser || "tu-usuario"} con el monto exacto ya
            cargado — necesitas crear tu link de PayPal.Me en paypal.com/paypalme si aún no lo
            tienes.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              label="Usuario de PayPal.Me (sin 'paypal.me/')"
              value={settings.paypal.paypalMeUser}
              onChange={(v) => update("paypal", { paypalMeUser: v })}
            />
            <Field
              label="Correo de PayPal (referencia visible)"
              value={settings.paypal.correo}
              onChange={(v) => update("paypal", { correo: v })}
            />
          </div>
        </div>
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
          <MethodHeader
            title="Binance"
            enabled={settings.binance.enabled}
            onToggle={(v) => update("binance", { enabled: v })}
          />
          <p className="text-xs text-brand-textMuted mb-4">
            Se muestra a los clientes que pagan en Dólares — piden los últimos 6 dígitos del ID de
            la transacción de Binance Pay/P2P como referencia.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              label="Correo o ID de Binance Pay"
              value={settings.binance.correoOId}
              onChange={(v) => update("binance", { correoOId: v })}
            />
            <Field
              label="Nombre del titular"
              value={settings.binance.nombre}
              onChange={(v) => update("binance", { nombre: v })}
            />
          </div>
        </div>
      </div>

      <SaveBar onSave={save} saving={saving} error={saveError} />
    </div>
  );
}

function MethodHeader({
  title,
  enabled,
  onToggle,
}: {
  title: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between mb-1">
      <h2 className="font-bold">{title}</h2>
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <span className={clsx("text-xs font-semibold", enabled ? "text-brand-green" : "text-brand-textMuted")}>
          {enabled ? "Activo" : "Desactivado"}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => onToggle(!enabled)}
          className={clsx(
            "w-10 h-6 rounded-full transition-colors relative shrink-0",
            enabled ? "bg-brand-primary" : "bg-brand-surfaceLight border border-brand-border"
          )}
        >
          <span
            className={clsx(
              "absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform",
              enabled ? "translate-x-[18px]" : "translate-x-0.5"
            )}
          />
        </button>
      </label>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-brand-textMuted mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-brand-surfaceLight border border-brand-border rounded-lg px-3 py-2 text-sm"
      />
    </div>
  );
}
