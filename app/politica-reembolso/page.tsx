export default function PoliticaReembolsoPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-extrabold mb-2">Política de Reembolso</h1>
      <p className="text-xs text-brand-textMuted mb-8">Última actualización: agosto de 2026</p>

      <div className="space-y-6 text-sm text-brand-textMuted leading-relaxed">
        <section>
          <h2 className="text-white font-bold mb-2">1. Naturaleza del servicio digital</h2>
          <p>
            Las recargas de divisas virtuales (diamantes, UC, Robux, V-Bucks, entre otras)
            representan bienes digitales de acreditación inmediata. Una vez procesada y entregada
            la recarga en la cuenta indicada, la transacción adquiere carácter definitivo e
            irreversible, por lo que no admitimos devoluciones.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">2. Responsabilidad en los datos de compra</h2>
          <p>
            Es responsabilidad exclusiva del cliente verificar la exactitud del ID de jugador,
            usuario, servidor o correo suministrado. TopGamerPro no asumirá reembolsos ni reenvíos
            por recargas acreditadas en cuentas incorrectas debido a errores en los datos provistos
            por el comprador.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">3. Casos aplicables para reembolso</h2>
          <p>
            TopGamerPro garantizará el reembolso total o el reenvío inmediato de la recarga en los
            siguientes escenarios:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Pago validado sin que la acreditación se efectúe dentro del tiempo de entrega estipulado.</li>
            <li>Inconsistencias imputables a nuestro sistema en el monto o paquete entregado.</li>
            <li>Agotamiento de inventario reportado por el proveedor tras la confirmación de su pago.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">4. Gestión de solicitudes</h2>
          <p>
            Para reportar un inconveniente, contáctenos vía WhatsApp o a través del portal de{" "}
            <a href="/soporte" className="text-brand-primary hover:underline">
              Soporte
            </a>{" "}
            adjuntando su número de pedido y una descripción del caso. Toda solicitud será evaluada
            en un plazo máximo de 24 horas.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">5. Canales de reembolso</h2>
          <p>
            Las devoluciones aprobadas se procesarán mediante el mismo método de pago utilizado en
            la compra original (Pago Móvil, Binance o PayPal), salvo acuerdo explícito en contrario
            con el equipo de soporte.
          </p>
        </section>
      </div>
    </div>
  );
}
