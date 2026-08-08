"use client";

import { usePaymentSettings } from "@/lib/paymentSettingsStore";
import SaveBar from "@/components/SaveBar";

export default function PagosPage() {
  const { settings, hydrated, update } = usePaymentSettings();

  if (!hydrated) {
    return <div className="max-w-3xl mx-auto px-4 py-10 text-brand-textMuted">Cargando...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-extrabold mb-2">Métodos de pago</h1>
      <p className="text-sm text-brand-textMuted mb-8">
        Estos son los datos que ve el cliente en el checkout para cada método. Cámbialos aquí
        cuando cambies de banco, cuenta de Binance o de PayPal — se actualiza en todo el sitio al
        instante.
      </p>

      <div className="space-y-6">
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
          <h2 className="font-bold mb-4">Pago Móvil (Bolívares)</h2>
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
          <h2 className="font-bold mb-4">Binance (USDT)</h2>
          <Field
            label="Correo / ID de Binance Pay"
            value={settings.binance.cuenta}
            onChange={(v) => update("binance", { cuenta: v })}
          />
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
          <h2 className="font-bold mb-4">Bancolombia (COP)</h2>
          <Field
            label="Número de cuenta"
            value={settings.bancolombia.cuenta}
            onChange={(v) => update("bancolombia", { cuenta: v })}
          />
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
          <h2 className="font-bold mb-1">PayPal</h2>
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
      </div>

      <SaveBar />
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
