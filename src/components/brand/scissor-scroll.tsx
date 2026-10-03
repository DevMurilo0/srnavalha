"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef } from "react";

export function ScissorScroll() {
  const layerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: layerRef,
    offset: ["start end", "end start"],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 78,
    damping: 24,
    mass: 0.34,
  });

  const x = useTransform(
    progress,
    [0, 0.2, 0.56, 0.82, 1],
    ["-42vw", "-10vw", "4vw", "22vw", "58vw"],
  );
  const y = useTransform(
    progress,
    [0, 0.26, 0.62, 1],
    ["22vh", "6vh", "12vh", "-14vh"],
  );
  const rotate = useTransform(progress, [0, 0.42, 0.72, 1], [-18, 3, -7, 28]);
  const rotateX = useTransform(progress, [0, 0.48, 1], [18, -7, 24]);
  const rotateY = useTransform(progress, [0, 0.5, 1], [34, -10, -34]);
  const scale = useTransform(progress, [0, 0.26, 0.74, 1], [0.76, 1, 1.04, 0.8]);
  const opacity = useTransform(progress, [0, 0.12, 0.84, 1], [0, 1, 1, 0]);

  return (
    <div ref={layerRef} className="scissor-float-layer" aria-hidden="true">
      <motion.div
        className="scissor-3d"
        style={
          reducedMotion
            ? undefined
            : { x, y, rotate, rotateX, rotateY, scale, opacity }
        }
      >
        <div className="scissor-3d-shadow" />
        <svg
          className="scissor-real"
          viewBox="0 0 840 500"
          role="presentation"
          focusable="false"
        >
          <defs>
            <linearGradient id="blade-top" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.1" stopColor="#9fa5a8" />
              <stop offset="0.24" stopColor="#f8f9f8" />
              <stop offset="0.46" stopColor="#707679" />
              <stop offset="0.63" stopColor="#f6f7f5" />
              <stop offset="0.82" stopColor="#a1a6a8" />
              <stop offset="1" stopColor="#52575a" />
            </linearGradient>
            <linearGradient id="blade-bottom" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="#4e5356" />
              <stop offset="0.2" stopColor="#d8dcdd" />
              <stop offset="0.44" stopColor="#777d80" />
              <stop offset="0.64" stopColor="#f5f6f4" />
              <stop offset="0.84" stopColor="#989da0" />
              <stop offset="1" stopColor="#4c5154" />
            </linearGradient>
            <linearGradient id="blade-edge" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2e3336" />
              <stop offset="0.45" stopColor="#757b7e" />
              <stop offset="1" stopColor="#222628" />
            </linearGradient>
            <radialGradient id="handle-shell" cx="35%" cy="25%" r="80%">
              <stop offset="0" stopColor="#575f60" />
              <stop offset="0.18" stopColor="#242a29" />
              <stop offset="0.58" stopColor="#080b0a" />
              <stop offset="0.82" stopColor="#1c211f" />
              <stop offset="1" stopColor="#030504" />
            </radialGradient>
            <linearGradient id="handle-rim" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#d9dddc" />
              <stop offset="0.22" stopColor="#515859" />
              <stop offset="0.52" stopColor="#f0f1ee" />
              <stop offset="0.78" stopColor="#4a5051" />
              <stop offset="1" stopColor="#1f2425" />
            </linearGradient>
            <radialGradient id="pivot" cx="35%" cy="28%" r="75%">
              <stop offset="0" stopColor="#f7f7f2" />
              <stop offset="0.28" stopColor="#8f9597" />
              <stop offset="0.52" stopColor="#2e3335" />
              <stop offset="0.72" stopColor="#d5d7d5" />
              <stop offset="1" stopColor="#3c4143" />
            </radialGradient>
            <linearGradient id="warm-screw" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#e1b286" />
              <stop offset="0.5" stopColor="#b98b68" />
              <stop offset="1" stopColor="#755036" />
            </linearGradient>
            <filter id="soft-shadow" x="-30%" y="-35%" width="165%" height="180%">
              <feDropShadow
                dx="0"
                dy="22"
                stdDeviation="18"
                floodColor="#090b0b"
                floodOpacity=".34"
              />
            </filter>
            <filter id="tiny-blur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>

          <ellipse
            cx="438"
            cy="394"
            rx="310"
            ry="34"
            fill="#141817"
            opacity=".2"
            filter="url(#tiny-blur)"
          />

          <g filter="url(#soft-shadow)">
            <path
              d="M367 243 796 89c19-7 35 14 23 30L421 284Z"
              fill="#33383a"
              transform="translate(0 13)"
              opacity=".9"
            />
            <path
              d="M365 238 799 78c24-9 41 20 22 37L417 271Z"
              fill="url(#blade-top)"
              stroke="#42484a"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            <path
              d="M421 271 821 115l-10 13-393 160Z"
              fill="url(#blade-edge)"
              opacity=".95"
            />
            <path
              d="M420 273 790 418c22 9 17 40-7 42L389 309Z"
              fill="#2c3133"
              transform="translate(0 11)"
              opacity=".9"
            />
            <path
              d="M416 265 792 407c26 10 20 43-7 45L385 298Z"
              fill="url(#blade-bottom)"
              stroke="#42484a"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            <path
              d="M386 298 785 452l-15 9-390-150Z"
              fill="url(#blade-edge)"
              opacity=".9"
            />

            <path
              d="M390 264 247 211"
              stroke="#3a4041"
              strokeWidth="48"
              strokeLinecap="round"
              transform="translate(0 10)"
            />
            <path
              d="M390 256 246 203"
              stroke="url(#blade-top)"
              strokeWidth="43"
              strokeLinecap="round"
            />
            <path
              d="M390 295 243 350"
              stroke="#333839"
              strokeWidth="48"
              strokeLinecap="round"
              transform="translate(0 10)"
            />
            <path
              d="M389 286 242 341"
              stroke="url(#blade-bottom)"
              strokeWidth="43"
              strokeLinecap="round"
            />

            <ellipse
              cx="158"
              cy="175"
              rx="100"
              ry="79"
              fill="#161b1a"
              stroke="url(#handle-rim)"
              strokeWidth="13"
            />
            <ellipse
              cx="158"
              cy="175"
              rx="82"
              ry="64"
              fill="url(#handle-shell)"
              stroke="#080b0a"
              strokeWidth="4"
            />
            <ellipse
              cx="158"
              cy="175"
              rx="48"
              ry="36"
              fill="#070908"
              stroke="#b7bcbb"
              strokeWidth="7"
            />
            <ellipse
              cx="132"
              cy="144"
              rx="36"
              ry="15"
              fill="#fff"
              opacity=".08"
              transform="rotate(-21 132 144)"
            />

            <ellipse
              cx="156"
              cy="363"
              rx="105"
              ry="82"
              fill="#151a19"
              stroke="url(#handle-rim)"
              strokeWidth="13"
            />
            <ellipse
              cx="156"
              cy="363"
              rx="86"
              ry="66"
              fill="url(#handle-shell)"
              stroke="#080b0a"
              strokeWidth="4"
            />
            <ellipse
              cx="157"
              cy="363"
              rx="50"
              ry="37"
              fill="#070908"
              stroke="#b7bcbb"
              strokeWidth="7"
            />
            <ellipse
              cx="129"
              cy="331"
              rx="38"
              ry="15"
              fill="#fff"
              opacity=".08"
              transform="rotate(-21 129 331)"
            />

            <circle
              cx="392"
              cy="278"
              r="38"
              fill="url(#pivot)"
              stroke="#202526"
              strokeWidth="6"
            />
            <circle
              cx="392"
              cy="278"
              r="19"
              fill="#111514"
              stroke="#d3d4cf"
              strokeWidth="3"
            />
            <circle cx="392" cy="278" r="9" fill="url(#warm-screw)" />

            <path
              d="M437 245 768 123"
              stroke="#fff"
              strokeOpacity=".44"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M438 289 749 406"
              stroke="#fff"
              strokeOpacity=".27"
              strokeWidth="3"
              strokeLinecap="round"
            />

            <text
              x="582"
              y="193"
              fill="#34393a"
              opacity=".55"
              fontSize="18"
              letterSpacing="6"
              fontFamily="Arial, sans-serif"
            >
              SR NAVALHA
            </text>
          </g>
        </svg>
      </motion.div>
    </div>
  );
}
