# Pitcharge Nuevo — Reconstrucción custom

Reconstrucción de la tienda de recargas (antes en WooCommerce) usando
Next.js 14 + TypeScript + Tailwind, lista para desplegar en Vercel y
conectar a Supabase.

## Estado actual

Esto es el **scaffold completo de la aplicación**, funcionando con
datos de ejemplo (`lib/mockProducts.ts`). Todavía **no está conectada
la base de datos** (a propósito, ese es el siguiente paso que
haremos juntos). El sitio corre y se puede navegar de punta a punta:
inicio → producto → carrito → checkout → confirmación → WhatsApp.

## Cómo correrlo en tu máquina

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## Estructura del proyecto

```
app/                     Rutas (Next.js App Router)
  page.tsx                 Inicio (catálogo)
  productos/[slug]/        Página de producto
  carrito/                 Carrito de compras
  checkout/                 Checkout con las 3 pasarelas manuales
  pedido-confirmado/       Página de gracias + botón WhatsApp de respaldo
  api/orders/               Endpoint placeholder (todavía sin Supabase)

components/               Componentes de UI
  Header.tsx / Footer.tsx
  ProgressBar.tsx           Barra Producto → Carrito → Checkout
  ProductCard.tsx
  ProductDetailClient.tsx   Selección de variación + campos del juego
  GameSpecialNotice.tsx     Avisos de vinculación (Activision, Konami)
  CheckoutForm.tsx          Las 3 pasarelas + validaciones + envío a WhatsApp

lib/                      Lógica de negocio (portada del PHP original)
  types.ts                  Tipos centrales
  pricing.ts                 Fórmula de precio PayPal (base * 1.057 + 0.31)
  constants.ts               Número de WhatsApp, datos bancarios
  whatsapp.ts                 Constructor del mensaje de WhatsApp
  validation.ts               Validaciones de campos y referencias
  reloadly.ts                  Integración Reloadly (stock + compra automática)
  cartStore.tsx                Carrito en cliente (Context + localStorage)
  supabaseClient.ts             Cliente de Supabase (placeholder, sin conectar)
  mockProducts.ts               Productos de ejemplo — SE BORRA cuando haya DB real
```

## Qué se portó del sitio original (pitcharge.com)

- Las 3 pasarelas manuales (Binance / Pago Móvil / Bancolombia) enrutadas
  por moneda, con validación de referencia y comprobante obligatorio.
- El mensaje de WhatsApp armado automáticamente con todos los datos del
  pedido (cliente, método, referencia, comprobante, productos, campos
  del juego).
- El botón de respaldo en la página de confirmación por si WhatsApp no
  se abrió solo.
- La fórmula real de recargo de PayPal (5.7% + $0.31), calculada
  comparando pitcharge.com vs paypal.pitcharge.com — ya no hace falta
  un sitio aparte para esto, un producto tiene un solo precio base y el
  recargo se calcula al vuelo.
- La lógica de Reloadly (validación de stock antes de comprar + compra
  automática al completar la orden) — lista en `lib/reloadly.ts` pero
  todavía sin conectar a productos reales.
- Los avisos especiales de vinculación de cuenta (Call of Duty /
  Activision, eFootball / Konami ID).
- La barra de progreso Producto → Carrito → Checkout.

## Qué falta (próximos pasos, en orden)

1. **Conectar Supabase**: crear las tablas reales (`products`,
   `product_variations`, `orders`, `order_items`) y reemplazar
   `mockProducts.ts` por consultas reales.
2. **Subida de comprobantes**: conectar `CheckoutForm.tsx` a Supabase
   Storage en vez del placeholder actual.
3. **Reloadly real**: llenar `RELOADLY_CLIENT_ID` / `RELOADLY_CLIENT_SECRET`
   con llaves NUEVAS (rotar las que quedaron expuestas en el export de
   WordPress) y marcar qué variaciones son de Reloadly.
4. **Resend**: correos transaccionales (factura, confirmación).
5. **Desplegar en Vercel** y conectar el dominio propio.
6. **Panel de administración**: vista de pedidos para confirmar pagos
   (equivalente al wc-orders de WooCommerce que usaba Gabriel).

## Variables de entorno

Copia `.env.example` a `.env.local` y llena lo que ya tengas. Las de
Supabase se llenan en el siguiente paso.
