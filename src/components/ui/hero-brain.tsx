import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";

/** A glowing neural-network brain illustration, centered in the hero. Nodes are laid out
    as mirrored left/right pairs around the vertical centerline plus two on-axis nodes, so
    the network is bilaterally symmetric - and each node lights itself (and its connected
    lines) on hover, and sends out a ripple on click, same as the background constellation. */

const NODES = [
  { id: "top", x: 300, y: 140 },
  { id: "l1", x: 200, y: 180 },
  { id: "r1", x: 400, y: 180 },
  { id: "l2", x: 150, y: 230 },
  { id: "r2", x: 450, y: 230 },
  { id: "l3", x: 190, y: 280 },
  { id: "r3", x: 410, y: 280 },
  { id: "l4", x: 240, y: 320 },
  { id: "r4", x: 360, y: 320 },
  { id: "bottom", x: 300, y: 345 },
];

const LINKS: [string, string][] = [
  ["top", "l1"], ["top", "r1"],
  ["l1", "l2"], ["r1", "r2"],
  ["l2", "l3"], ["r2", "r3"],
  ["l3", "l4"], ["r3", "r4"],
  ["l4", "bottom"], ["r4", "bottom"],
  ["l1", "r1"],
  ["top", "bottom"],
];

export default function HeroBrain({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  const [pulses, setPulses] = useState<{ id: string; key: number }[]>([]);

  function nodeIsLit(id: string) {
    if (active === id) return true;
    if (active === null) return false;
    return LINKS.some(([a, b]) => (a === active && b === id) || (b === active && a === id));
  }
  function lineIsLit(a: string, b: string) {
    return active !== null && (active === a || active === b);
  }
  function nodeById(id: string) {
    return NODES.find((n) => n.id === id)!;
  }

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        left: "50%",
        top: "48%",
        width: "82%",
        maxWidth: 980,
        transform: "translate(-50%, -50%)",
      }}
    >
    <motion.svg
      viewBox="0 0 600 500"
      style={{ width: "100%", height: "auto", display: "block" }}
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
      <circle cx="300" cy="230" r="220" fill="url(#brainGlow)" style={{ pointerEvents: "none" }} />

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
        style={{ pointerEvents: "none" }}
      />
      <path d="M300 110 C300 170 300 250 300 360" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" fill="none" style={{ pointerEvents: "none" }} />

      <g strokeWidth="1.4">
        {LINKS.map(([a, b], i) => {
          const na = nodeById(a);
          const nb = nodeById(b);
          const lit = lineIsLit(a, b);
          return (
            <motion.line
              key={i}
              x1={na.x}
              y1={na.y}
              x2={nb.x}
              y2={nb.y}
              stroke={lit ? "#5c8dff" : "#2f6fed"}
              animate={{ opacity: lit ? 1 : 0.55 }}
              transition={{ duration: 0.25 }}
              style={{ pointerEvents: "none" }}
            />
          );
        })}
      </g>

      {pulses.map((p) => {
        const n = nodeById(p.id);
        return (
          <motion.circle
            key={p.key}
            cx={n.x}
            cy={n.y}
            r={6}
            fill="none"
            stroke="#5c8dff"
            strokeWidth={2}
            initial={{ r: 6, opacity: 0.8 }}
            animate={{ r: 34, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            onAnimationComplete={() => setPulses((cur) => cur.filter((x) => x.key !== p.key))}
            style={{ pointerEvents: "none" }}
          />
        );
      })}

      <g fill="#2f6fed">
        {NODES.map((n) => {
          const lit = nodeIsLit(n.id);
          return (
            <motion.circle
              key={n.id}
              cx={n.x}
              cy={n.y}
              r={lit ? 8 : 5.5}
              style={{ cursor: "pointer", pointerEvents: "auto" }}
              animate={{
                opacity: [0.5, 1, 0.5],
                r: active === n.id ? 9 : lit ? 7 : 5.5,
                fill: lit ? "#5c8dff" : "#2f6fed",
              }}
              transition={{
                opacity: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
                r: { duration: 0.2 },
                fill: { duration: 0.2 },
              }}
              onMouseEnter={() => setActive(n.id)}
              onMouseLeave={() => setActive((cur) => (cur === n.id ? null : cur))}
              onClick={() => setPulses((cur) => [...cur, { id: n.id, key: Date.now() + Math.random() }])}
            />
          );
        })}
      </g>
    </motion.svg>
    </div>
  );
}
