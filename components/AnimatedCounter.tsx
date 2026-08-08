"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, useTransform, animate, motion } from "framer-motion";

export default function AnimatedCounter({
  value,
  prefix = "",
  decimals = 0,
}: {
  value: number;
  prefix?: string;
  decimals?: number;
}) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) =>
    `${prefix}${v.toLocaleString("es-VE", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`
  );
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 1, ease: "easeOut" });
    return controls.stop;
  }, [value, motionValue]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}
