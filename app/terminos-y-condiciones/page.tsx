export default function TerminosYCondicionesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-extrabold mb-2">Términos y Condiciones de Uso y Compra</h1>
      <p className="text-xs text-brand-textMuted mb-8">Última actualización: 11 de septiembre de 2026</p>

      <p className="text-sm text-brand-textMuted leading-relaxed mb-8">
        Al ingresar a nuestro sitio web, utilizar nuestros servicios o realizar una compra en
        TopGamerPro, confirmas que has leído y aceptas estos Términos y Condiciones, junto con
        nuestra Política de Reembolso y cualquier condición particular indicada para el producto
        que estés adquiriendo. Si no estás de acuerdo con alguno de estos puntos, te recomendamos
        no continuar con el uso del sitio ni con la compra.
      </p>

      <div className="space-y-6 text-sm text-brand-textMuted leading-relaxed">
        <section>
          <h2 className="text-white font-bold mb-2">1. Requisitos para comprar en TopGamerPro</h2>
          <p>
            Para procesar tu pedido necesitamos que la información que nos entregues sea correcta,
            completa y esté actualizada. Antes de confirmar tu compra, revisa bien los datos que
            ingresaste — eres tú quien debe verificarlos.
          </p>
          <p className="mt-2">Según el juego o producto que elijas, es posible que te pidamos datos como:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Nombre y correo electrónico de contacto.</li>
            <li>ID o UID del jugador.</li>
            <li>Usuario / nickname dentro del juego.</li>
            <li>Servidor o región de la cuenta.</li>
            <li>Cualquier otro dato necesario para completar la recarga.</li>
          </ul>
          <p className="mt-2">
            TopGamerPro no se hace responsable por demoras, pérdidas o inconvenientes que resulten
            de datos incorrectos, incompletos o desactualizados que el cliente haya proporcionado
            al momento de comprar.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">2. Sobre las recargas de videojuegos</h2>
          <p>
            Cada recarga se procesa usando exactamente los datos que nos entregaste y el método
            correspondiente al juego seleccionado. Por eso insistimos: revisa tu ID, usuario,
            servidor o cuenta antes de pagar.
          </p>
          <p className="mt-2">
            Dependiendo del título, una recarga puede requerir ID/UID, nickname, cuenta vinculada,
            servidor, región u otro dato específico exigido por el juego o su proveedor.
          </p>
          <p className="mt-2">
            Una vez que los diamantes, monedas o créditos fueron acreditados correctamente en la
            cuenta indicada por el cliente, consideramos la recarga como completada.
          </p>
          <p className="mt-2">
            <strong className="text-white">Importante:</strong> TopGamerPro no tiene control sobre
            las políticas, servidores ni decisiones de los desarrolladores de cada videojuego. Por
            eso, algunos servicios pueden verse afectados por restricciones de región,
            disponibilidad del proveedor, cambios del desarrollador, mantenimientos programados u
            otros requisitos propios de cada plataforma — situaciones que están fuera de nuestro
            control directo.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">3. Responsabilidad sobre los datos que nos entregas</h2>
          <p>
            Cuando una compra requiere que nos des un ID, UID, usuario, servidor u otro dato de tu
            cuenta, la responsabilidad de que esa información sea correcta es tuya, antes de
            confirmar el pedido.
          </p>
          <p className="mt-2">
            Si procesamos correctamente una recarga con los datos que nos diste, TopGamerPro no
            responde por errores originados en información incorrecta suministrada por el cliente.
            Por eso recomendamos revisar todo dos veces antes de pagar.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">
            4. Servicios que requieren datos de acceso (usuario y contraseña)
          </h2>
          <p>
            Algunos juegos (como eFootball o Call of Duty Mobile) solo pueden recargarse si nos das
            temporalmente el usuario y contraseña de la cuenta vinculada (KONAMI ID o Activision,
            según el caso). Cuando esto aplique:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Te avisamos con anticipación qué datos necesitamos, antes de que pagues.</li>
            <li>Esos datos se usan únicamente para completar tu recarga, nada más.</li>
            <li>No te pedimos información que no sea estrictamente necesaria para el servicio.</li>
            <li>Una vez terminado el proceso, no guardamos ni compartimos esos datos de acceso.</li>
          </ul>
          <p className="mt-2">
            Como medida extra de seguridad, te recomendamos cambiar tu contraseña apenas se
            complete la recarga, especialmente si nos diste una contraseña u otro dato sensible.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">5. Códigos digitales y tarjetas de regalo (si aplica)</h2>
          <p>
            Si en el futuro ofrecemos gift cards o códigos digitales, estos podrán estar sujetos a
            restricciones de país, región, plataforma, cuenta, moneda o denominación. Es tu
            responsabilidad confirmar que el producto sea compatible con tu cuenta y ubicación
            antes de comprarlo.
          </p>
          <p className="mt-2">
            Una vez que un código fue entregado o puesto a tu disposición, queda bajo tu control y
            responsabilidad usarlo correctamente. Por la naturaleza de este tipo de producto, un
            código ya entregado generalmente no puede recuperarse ni anularse, y no podemos
            verificar quién tuvo acceso a él después de la entrega. Estos casos se rigen por
            nuestra{" "}
            <a href="/politica-reembolso" className="text-brand-primary hover:underline">
              Política de Reembolso
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">6. Cómo procesamos tu pedido</h2>
          <p>
            Después de confirmar el pago, tu pedido pasa por distintos estados: Pendiente →
            Procesando → Confirmado. El tiempo que tarda cada recarga depende del juego, del método
            de entrega y de la disponibilidad del proveedor en ese momento. Los tiempos que
            mostramos en la web son estimados y no constituyen una garantía de entrega inmediata
            cuando dependemos de sistemas externos al nuestro.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">7. Verificaciones adicionales</h2>
          <p>
            En algunos casos podemos revisar un pedido antes de completarlo — por ejemplo, si
            detectamos datos inconsistentes, si el proveedor pide validación extra, o si
            identificamos algo que amerite revisión por seguridad. Mientras dure esa revisión, tu
            pedido puede quedar en estado pendiente, y podríamos contactarte por WhatsApp para
            pedirte información adicional.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">8. Cancelaciones y reembolsos</h2>
          <p>
            Toda cancelación o solicitud de reembolso se rige por nuestra{" "}
            <a href="/politica-reembolso" className="text-brand-primary hover:underline">
              Política de Reembolso
            </a>
            , disponible en topgamerpro.com/politica-reembolso. Por tratarse de productos
            digitales, muchas operaciones no pueden revertirse una vez procesadas o acreditadas. Te
            recomendamos revisar esa política antes de comprar.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">9. Errores al hacer tu pedido</h2>
          <p>
            Si te equivocaste al elegir el juego, el paquete, el servidor o escribiste mal tu ID,
            contáctanos de inmediato por WhatsApp o desde{" "}
            <a href="/soporte" className="text-brand-primary hover:underline">
              Soporte
            </a>
            . Una vez que una recarga fue procesada y acreditada correctamente con los datos que
            diste, generalmente ya no es posible modificarla, cancelarla ni revertirla.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">10. Disponibilidad de los productos</h2>
          <p>
            Trabajamos con distintos proveedores para ofrecer nuestro catálogo de juegos. Por eso,
            la disponibilidad de un producto puede cambiar por mantenimiento, cambios del
            proveedor, restricciones de región, decisiones del desarrollador o problemas técnicos
            puntuales. Si no podemos garantizar una entrega confiable, podemos pausar temporalmente
            la venta de ese producto.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">11. Relación con las marcas de los videojuegos</h2>
          <p>
            Los juegos, plataformas y marcas que aparecen en TopGamerPro pertenecen a sus
            respectivos desarrolladores y propietarios. No somos dueños de esas marcas ni las
            representamos oficialmente, salvo que se indique expresamente lo contrario. Comprar una
            recarga a través de nosotros no implica ningún tipo de afiliación, patrocinio o
            representación oficial con el desarrollador del juego.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">12. Uso adecuado de la plataforma</h2>
          <p>
            Al usar TopGamerPro te comprometes a hacerlo de forma legal y responsable. No está
            permitido usar nuestra plataforma para:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Actividades fraudulentas o intentos de engaño.</li>
            <li>Uso de métodos de pago no autorizados o robados.</li>
            <li>Lavado de dinero.</li>
            <li>Uso indebido de promociones o descuentos.</li>
            <li>Cualquier actividad que perjudique a TopGamerPro, a otros clientes o a nuestros proveedores.</li>
            <li>Cualquier actividad contraria a la ley.</li>
          </ul>
          <p className="mt-2">
            Podemos cancelar o restringir un pedido cuando tengamos motivos razonables para pensar
            que representa un riesgo de fraude o seguridad.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">13. Propiedad intelectual</h2>
          <p>
            El contenido propio de TopGamerPro — textos, diseño, logotipo, gráficos e imágenes del
            sitio — está protegido por las leyes de propiedad intelectual aplicables. No está
            permitido copiarlo, reproducirlo o usarlo sin nuestra autorización previa. Las marcas
            de terceros mencionadas en el sitio (nombres de juegos, logos, etc.) pertenecen a sus
            respectivos dueños y se usan únicamente con fines identificativos.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">14. Límites de responsabilidad</h2>
          <p>
            Hacemos lo posible por mantener nuestros servicios disponibles y procesar cada pedido
            correctamente. Sin embargo, hay situaciones fuera de nuestro control, como fallas en
            servidores de terceros, mantenimientos de los videojuegos, cambios de los
            desarrolladores, interrupciones de proveedores externos o problemas de conectividad.
            Cuando algo así afecte tu pedido, haremos lo posible por informarte y buscar una
            solución razonable dentro de lo que el proveedor correspondiente nos permita.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">15. Cambios a estos Términos y Condiciones</h2>
          <p>
            Podemos actualizar estos Términos y Condiciones cuando sea necesario, ya sea por
            cambios en nuestros servicios, en nuestros proveedores, en nuestros procesos internos o
            por requisitos legales. Te recomendamos revisar esta página de vez en cuando para estar
            al tanto de cualquier actualización.
          </p>
        </section>

        <p>
          ¿Tienes dudas sobre estos Términos y Condiciones? Escríbenos por WhatsApp o visita{" "}
          <a href="/soporte" className="text-brand-primary hover:underline">
            Soporte
          </a>{" "}
          en topgamerpro.com.
        </p>
      </div>
    </div>
  );
}
