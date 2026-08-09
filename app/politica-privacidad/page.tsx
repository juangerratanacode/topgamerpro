export default function PoliticaPrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 prose-invert">
      <h1 className="text-2xl font-extrabold mb-2">Política de Privacidad</h1>
      <p className="text-xs text-brand-textMuted mb-8">Última actualización: agosto de 2026</p>

      <div className="space-y-6 text-sm text-brand-textMuted leading-relaxed">
        <section>
          <h2 className="text-white font-bold mb-2">1. Qué datos recopilamos</h2>
          <p>
            Cuando realizas un pedido en TopGamerPro recopilamos: nombre, correo electrónico, número de
            WhatsApp, los datos del juego que nos indiques (ID de jugador, usuario, correo de la
            cuenta u otros campos que pida cada producto), el método de pago elegido y, cuando
            aplica, la imagen del comprobante de pago que subes.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">2. Para qué usamos tus datos</h2>
          <p>
            Usamos esta información únicamente para procesar tu recarga, contactarte por WhatsApp
            sobre el estado de tu pedido, y llevar un historial de compras para brindarte soporte.
            No vendemos ni compartimos tus datos con terceros para fines publicitarios.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">3. Comprobantes de pago</h2>
          <p>
            Las imágenes de comprobantes de pago se usan exclusivamente para verificar tu
            transacción y se conservan como respaldo del pedido. No se comparten fuera del equipo
            de TopGamerPro.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">4. WhatsApp</h2>
          <p>
            El proceso de compra utiliza WhatsApp como canal de confirmación. Al continuar con tu
            pedido, aceptas que te contactemos por ese medio para completar la recarga.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">5. Tus derechos</h2>
          <p>
            Puedes solicitar en cualquier momento que eliminemos tus datos de nuestros registros,
            escribiéndonos por WhatsApp o desde la sección de{" "}
            <a href="/soporte" className="text-brand-primary hover:underline">
              Soporte
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
