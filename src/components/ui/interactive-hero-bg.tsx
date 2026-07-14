import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";

/** Same constellation background as hero-bg.svg, but rendered as real inline SVG so each
    node can react to hover/click - lighting up itself and the lines connected to it, instead
    of being a flat, inert background image. */

const NODES = [
  { id: 0, x: 200, y: 180 },
  { id: 1, x: 360, y: 260 },
  { id: 2, x: 520, y: 200 },
  { id: 3, x: 700, y: 290 },
  { id: 4, x: 880, y: 220 },
  { id: 5, x: 1040, y: 300 },
  { id: 6, x: 1220, y: 240 },
  { id: 7, x: 1380, y: 320 },
  { id: 8, x: 330, y: 420 },
  { id: 9, x: 720, y: 460 },
  { id: 10, x: 1060, y: 480 },
  { id: 11, x: 500, y: 500 },
  { id: 12, x: 880, y: 540 },
  { id: 13, x: 1240, y: 560 },
];

const LINKS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7],
  [1, 8], [3, 9], [5, 10], [8, 11], [9, 12], [10, 13], [11, 9], [12, 10],
];

export default function InteractiveHeroBg({ className }: { className?: string }) {
  const [active, setActive] = useState<number | null>(null);
  const [pulses, setPulses] = useState<{ id: number; key: number }[]>([]);

  function nodeIsLit(id: number) {
    if (active === id) return true;
    if (active === null) return false;
    return LINKS.some(([a, b]) => (a === active && b === id) || (b === active && a === id));
  }
  function lineIsLit(a: number, b: number) {
    return active !== null && (active === a || active === b);
  }

  return (
    <svg
      className={className}
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <defs>
        <linearGradient id="heroBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0a0a0a" />
          <stop offset="55%" stopColor="#161616" />
          <stop offset="100%" stopColor="#0a0a0a" />
        </linearGradient>
        <radialGradient id="heroGlow" cx="70%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#2f6fed" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#2f6fed" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="1000" fill="url(#heroBg)" />
      <rect width="1600" height="1000" fill="url(#heroGlow)" />

      <g strokeWidth="1.2">
        {LINKS.map(([a, b], i) => {
          const na = NODES[a];
          const nb = NODES[b];
          const lit = lineIsLit(a, b);
          return (
            <motion.line
              key={i}
              x1={na.x}
              y1={na.y}
              x2={nb.x}
              y2={nb.y}
              stroke={lit ? "#2f6fed" : "#333333"}
              animate={{ opacity: lit ? 0.9 : 0.6 }}
              transition={{ duration: 0.25 }}
            />
          );
        })}
      </g>

      {pulses.map((p) => {
        const n = NODES[p.id];
        return (
          <motion.circle
            key={p.key}
            cx={n.x}
            cy={n.y}
            r={5}
            fill="none"
            stroke="#2f6fed"
            strokeWidth={2}
            initial={{ r: 5, opacity: 0.8 }}
            animate={{ r: 40, opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            onAnimationComplete={() => setPulses((cur) => cur.filter((x) => x.key !== p.key))}
          />
        );
      })}

      <g>
        {NODES.map((n) => {
          const lit = nodeIsLit(n.id);
          return (
            <motion.circle
              key={n.id}
              cx={n.x}
              cy={n.y}
              r={lit ? 8 : 5}
              fill={lit ? "#2f6fed" : "#555555"}
              style={{ cursor: "pointer" }}
              animate={{
                r: active === n.id ? 9 : lit ? 7 : 5,
                fill: lit ? "#2f6fed" : "#555555",
              }}
              transition={{ duration: 0.25 }}
              onMouseEnter={() => setActive(n.id)}
              onMouseLeave={() => setActive((cur) => (cur === n.id ? null : cur))}
              onClick={() => setPulses((cur) => [...cur, { id: n.id, key: Date.now() + Math.random() }])}
            />
          );
        })}
      </g>
    </svg>
  );
}
