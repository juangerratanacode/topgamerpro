"use client";

import { motion } from "framer-motion";

// Envoltorio chico solo para la animación de entrada — el contenido real
// (banner, catálogo) ya viene resuelto desde el servidor, esto SOLO anima
// la aparición, no bloquea ni retrasa nada.
export default function HomeSection({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      {children}
    </motion.div>
  );
}
