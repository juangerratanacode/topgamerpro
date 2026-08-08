import type { PackageIcon } from "@/lib/types";

// Iconos por tipo de paquete — equivalente moderno al sistema de
// "icono_gemas / icono_monedas / icono_pase" del snippet original
// ("Diseño Dinámico: Iconos y Estilos de Swatches"), pero con SVG
// propios en vez de imágenes subidas a mano.

export default function PackageIconGraphic({ icon, className }: { icon: PackageIcon; className?: string }) {
  const cls = className ?? "w-5 h-5";

  switch (icon) {
    case "diamond":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none">
          <path d="M4 9L12 3l8 6-8 12-8-12z" fill="#22D3EE" stroke="#0891B2" strokeWidth="1" />
          <path d="M4 9h16M9 9l3-6 3 6M9 9l3 12 3-12" stroke="#0891B2" strokeWidth="0.75" />
        </svg>
      );
    case "coin":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none">
          <circle cx="12" cy="12" r="9" fill="#FFB800" stroke="#B8860B" strokeWidth="1" />
          <circle cx="12" cy="12" r="5.5" fill="none" stroke="#B8860B" strokeWidth="0.75" />
          <text x="12" y="15.5" fontSize="7" textAnchor="middle" fill="#8B5A00" fontWeight="bold">
            $
          </text>
        </svg>
      );
    case "cp":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none">
          <rect x="3" y="6" width="18" height="12" rx="2" fill="#3F3F46" stroke="#18181B" strokeWidth="1" />
          <circle cx="8" cy="12" r="2.5" fill="#FF5B2E" />
          <rect x="13" y="10" width="6" height="1.5" fill="#A1A1AA" />
          <rect x="13" y="12.5" width="4" height="1.5" fill="#A1A1AA" />
        </svg>
      );
    case "uc":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none">
          <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" fill="#FBBF24" stroke="#92400E" strokeWidth="1" />
          <text x="12" y="15" fontSize="6.5" textAnchor="middle" fill="#78350F" fontWeight="bold">
            UC
          </text>
        </svg>
      );
    case "robux":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none">
          <rect x="4" y="4" width="16" height="16" rx="3" fill="#E5E7EB" stroke="#71717A" strokeWidth="1" />
          <path d="M8 16V8h4a3 3 0 010 6H8" stroke="#3F3F46" strokeWidth="1.5" fill="none" />
        </svg>
      );
    case "pass":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none">
          <rect x="2" y="6" width="20" height="13" rx="2" fill="#7C3AED" stroke="#4C1D95" strokeWidth="1" />
          <circle cx="7" cy="12.5" r="2.2" fill="#FDE68A" />
          <rect x="11.5" y="10.5" width="8" height="1.4" fill="#DDD6FE" />
          <rect x="11.5" y="13" width="6" height="1.4" fill="#DDD6FE" />
        </svg>
      );
    case "card":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none">
          <rect x="2" y="5" width="20" height="14" rx="2" fill="#2FD675" stroke="#166534" strokeWidth="1" />
          <rect x="2" y="9" width="20" height="2.5" fill="#166534" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none">
          <circle cx="12" cy="12" r="9" fill="#FF5B2E" stroke="#B8360F" strokeWidth="1" />
          <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none" />
        </svg>
      );
  }
}
