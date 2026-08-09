export default function PoliticaReembolsoPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-extrabold mb-2">Política de Reembolso</h1>
      <p className="text-xs text-brand-textMuted mb-8">Última actualización: agosto de 2026</p>

      <div className="space-y-6 text-sm text-brand-textMuted leading-relaxed">
        <section>
          <h2 className="text-white font-bold mb-2">1. Naturaleza de las recargas</h2>
          <p>
            Las recargas de diamantes, monedas, UC, Robux, V-Bucks y demás monedas virtuales son
            productos digitales de entrega inmediata. Una vez procesada la recarga en tu cuenta del
            juego, la transacción no puede revertirse — por eso no se aceptan devoluciones después
            de que el producto fue entregado correctamente.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">2. Verifica tus datos antes de pagar</h2>
          <p>
            Es tu responsabilidad revisar que el ID de jugador, usuario, servidor o correo que
            indicas al comprar sea el correcto. RecargaTuJuego no se hace responsable por recargas
            enviadas a una cuenta equivocada debido a datos mal escritos por el comprador.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">3. Cuándo sí hay reembolso</h2>
          <p>Ofrecemos reembolso completo o el reenvío de la recarga cuando:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Se confirma el pago pero la recarga no llega dentro del tiempo estimado.</li>
            <li>Hay un error de nuestro lado en el monto o el paquete entregado.</li>
            <li>El juego o proveedor reporta stock agotado después de haber confirmado tu pago.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">4. Cómo solicitar un reembolso</h2>
          <p>
            Escríbenos por WhatsApp o desde{" "}
            <a href="/soporte" className="text-brand-primary hover:underline">
              Soporte
            </a>{" "}
            indicando tu número de pedido y el problema. Revisamos cada caso en un máximo de 24
            horas.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">5. Métodos de reembolso</h2>
          <p>
            El reembolso se realiza por el mismo método de pago que usaste originalmente (Pago
            Móvil o PayPal), salvo que acuerdes otra cosa directamente con soporte.
          </p>
        </section>
      </div>
    </div>
  );
}
