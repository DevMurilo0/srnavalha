"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export function ScissorScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const x = useTransform(
    scrollYProgress,
    [0, 0.18, 0.62, 1],
    ["-42vw", "-8vw", "12vw", "58vw"],
  );
  const y = useTransform(
    scrollYProgress,
    [0, 0.28, 0.7, 1],
    ["10vh", "0vh", "-3vh", "-18vh"],
  );
  const rotate = useTransform(scrollYProgress, [0, 0.45, 1], [-32, 12, 58]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [18, -8, 24]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.72, 1], [0.76, 1, 1.06, 0.78]);
  const opacity = useTransform(scrollYProgress, [0, 0.12, 0.82, 1], [0, 1, 1, 0]);

  return (
    <section ref={sectionRef} className="scissor-stage" aria-hidden="true">
      <div className="scissor-sticky">
        <motion.div
          className="scissor-object"
          style={
            reducedMotion
              ? { opacity: 0.82 }
              : { x, y, rotate, rotateX, scale, opacity }
          }
        >
          <svg
            viewBox="0 0 760 430"
            role="presentation"
            focusable="false"
            className="scissor-svg"
          >
            <defs>
              <linearGradient id="steel-a" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#fafafa" />
                <stop offset="0.3" stopColor="#9da1a3" />
                <stop offset="0.62" stopColor="#f4f4f1" />
                <stop offset="1" stopColor="#666a6d" />
              </linearGradient>
              <linearGradient id="steel-b" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#6b6f72" />
                <stop offset="0.42" stopColor="#f5f4ef" />
                <stop offset="0.72" stopColor="#a3a6a8" />
                <stop offset="1" stopColor="#4d5052" />
              </linearGradient>
              <radialGradient id="ring" cx="38%" cy="30%" r="75%">
                <stop offset="0" stopColor="#3c403f" />
                <stop offset="0.55" stopColor="#171a19" />
                <stop offset="1" stopColor="#070908" />
              </radialGradient>
              <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="20" stdDeviation="18" floodColor="#000" floodOpacity=".34" />
              </filter>
            </defs>

            <g filter="url(#shadow)">
              <path
                d="M338 219 721 57c17-7 30 12 16 25L392 265Z"
                fill="url(#steel-a)"
                stroke="#3f4345"
                strokeWidth="5"
              />
              <path
                d="M354 237 716 368c18 7 14 31-5 32L394 281Z"
                fill="url(#steel-b)"
                stroke="#3f4345"
                strokeWidth="5"
              />
              <path
                d="M362 241 221 201"
                stroke="url(#steel-a)"
                strokeWidth="34"
                strokeLinecap="round"
              />
              <path
                d="M369 258 225 312"
                stroke="url(#steel-b)"
                strokeWidth="34"
                strokeLinecap="round"
              />
              <ellipse cx="151" cy="181" rx="91" ry="72" fill="url(#ring)" stroke="#5f6463" strokeWidth="12" />
              <ellipse cx="154" cy="181" rx="47" ry="35" fill="#0b0d0e" stroke="#8f9493" strokeWidth="5" />
              <ellipse cx="156" cy="333" rx="95" ry="74" fill="url(#ring)" stroke="#5f6463" strokeWidth="12" />
              <ellipse cx="158" cy="333" rx="50" ry="37" fill="#0b0d0e" stroke="#8f9493" strokeWidth="5" />
              <circle cx="370" cy="250" r="31" fill="#111413" stroke="#c9c7c0" strokeWidth="8" />
              <circle cx="370" cy="250" r="8" fill="#b98b68" />
              <path d="M401 239 690 111" stroke="#fff" strokeOpacity=".38" strokeWidth="3" />
              <path d="M406 268 682 364" stroke="#fff" strokeOpacity=".24" strokeWidth="3" />
            </g>
          </svg>
        </motion.div>
      </div>
    </section>
  );
}
