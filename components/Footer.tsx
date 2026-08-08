import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-brand-surface border-t border-brand-border py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo size="sm" />
        <p className="text-xs text-brand-textMuted text-center">
          © {new Date().getFullYear()} RecargaTuJuego. Todos los derechos reservados.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/soporte" className="text-xs text-brand-textMuted hover:text-white">
            Soporte
          </Link>
          <Link href="/politica-privacidad" className="text-xs text-brand-textMuted hover:text-white">
            Privacidad
          </Link>
          <Link href="/politica-reembolso" className="text-xs text-brand-textMuted hover:text-white">
            Reembolsos
          </Link>
        </div>
      </div>
    </footer>
  );
}
