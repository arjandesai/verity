import * as React from "react";
import { motion } from "framer-motion";

/** A glowing neural-network brain illustration for the hero's empty right-hand side -
    echoes the "active regions" brain diagram used on the About page, but styled to sit
    quietly on a dark hero background: soft outline, pulsing synapse dots, gentle float. */
export default function HeroBrain({ className }: { className?: string }) {
  return (
    <motion.svg
      className={className}
      viewBox="0 0 600 500"
      style={{ position: "absolute", right: "4%", top: "50%", width: "38%", maxWidth: 480, pointerEvents: "none" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: [0, -14, 0] }}
      transition={{
        opacity: { duration: 1, delay: 0.3 },
        y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      <defs>
        <radialGradient id="brainGlow" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#2f6fed" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#2f6fed" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="300" cy="230" r="220" fill="url(#brainGlow)" />

      <path
        d="M300 90
          C 220 90 170 130 155 185
          C 110 195 85 240 100 280
          C 90 315 115 350 155 360
          C 175 385 215 395 250 385
          C 275 400 325 400 350 385
          C 385 395 425 385 445 360
          C 485 350 505 315 495 280
          C 510 240 485 195 440 185
          C 425 130 375 90 300 90 Z"
        fill="none"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="2.5"
      />
      <path d="M300 110 C300 170 300 250 300 360" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" fill="none" />

      <g stroke="#2f6fed" strokeWidth="1.4" opacity="0.55">
        <line x1="170" y1="160" x2="230" y2="190" />
        <line x1="230" y1="190" x2="290" y2="160" />
        <line x1="290" y1="160" x2="350" y2="190" />
        <line x1="350" y1="190" x2="410" y2="165" />
        <line x1="170" y1="160" x2="150" y2="220" />
        <line x1="150" y1="220" x2="180" y2="270" />
        <line x1="410" y1="165" x2="440" y2="220" />
        <line x1="440" y1="220" x2="410" y2="275" />
        <line x1="180" y1="270" x2="240" y2="310" />
        <line x1="240" y1="310" x2="300" y2="330" />
        <line x1="300" y1="330" x2="360" y2="310" />
        <line x1="360" y1="310" x2="410" y2="275" />
        <line x1="230" y1="190" x2="240" y2="310" />
        <line x1="350" y1="190" x2="360" y2="310" />
      </g>

      <g fill="#2f6fed">
        {[
          [170, 160, 6], [230, 190, 5], [290, 160, 5], [350, 190, 5], [410, 165, 6],
          [150, 220, 5], [180, 270, 5], [440, 220, 5], [410, 275, 5],
          [240, 310, 5], [300, 330, 6], [360, 310, 5],
        ].map(([cx, cy, r], i) => (
          <motion.circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
          />
        ))}
      </g>
    </motion.svg>
  );
}
