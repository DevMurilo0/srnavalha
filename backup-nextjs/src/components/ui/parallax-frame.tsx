"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/** A small, compositor-only translation. Never blocks reading or scrolling. */
export function ParallaxFrame({ children, distance = 19 }: { children: ReactNode; distance?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-distance, distance]);
  return <motion.div className="sr-parallax-media" ref={ref} style={{ y: reduced ? 0 : y }}>
    {children}
  </motion.div>;
}
