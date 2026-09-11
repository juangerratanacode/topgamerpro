// Ícono genérico de "celular" — se usa como respaldo para Android/iPhone
// en la selección de dispositivo hasta que el admin suba sus propios
// íconos desde /staffgate7d3k/catalogo. A propósito es el mismo dibujo
// para los dos (no un logo de Android ni de Apple): son marcas de
// terceros, y el admin va a reemplazar esto con sus propias imágenes.
export default function DeviceIcon({ className }: { device: "android" | "iphone"; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="7" y="2" width="10" height="20" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 18h2" strokeLinecap="round" />
    </svg>
  );
}
