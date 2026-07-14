import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";

interface MangoAvatarProps {
  size?: number;
  mouthOpen?: boolean;
  className?: string;
  onClick?: () => void;
  /** Shop item ids (see MANGO_SHOP in lib/verity.ts) - when set, he actually wears/holds them. */
  hat?: string | null;
  outfit?: string | null;
  /** A 3-stop gradient (top/mid/bottom) to recolor his body - from the shop's "color" items. */
  colors?: [string, string, string] | null;
  /** A unique id so multiple copies on the same page don't collide on their gradient id. */
  gradientId?: string;
}

/** Accessories drawn BEHIND the body (a cape draping down the back). */
function renderOutfitBack(outfit?: string | null) {
  if (outfit === "outfit-cape") {
    return (
      <path
        d="M30 58 C 20 74 20 94 26 108 C 34 102 66 102 74 108 C 80 94 80 74 70 58 C 62 66 38 66 30 58 Z"
        fill="#c1483b"
        stroke="#8f2f26"
        strokeWidth="1.5"
      />
    );
  }
  return null;
}

/** Accessories drawn on top of the body (worn outfits, glasses). */
function renderOutfitFront(outfit?: string | null) {
  switch (outfit) {
    case "outfit-scarf":
      return (
        <>
          <path d="M30 72 Q50 84 70 72 L70 80 Q50 90 30 80 Z" fill="#c1483b" />
          <rect x="45" y="86" width="6.5" height="18" rx="3" fill="#c1483b" transform="rotate(-8 48 86)" />
        </>
      );
    case "outfit-bowtie":
      return <path d="M42 76 L49 72 L49 81 L42 77 Z M58 76 L51 72 L51 81 L58 77 Z" fill="#2b3a67" />;
    case "outfit-cape":
      return null;
    case "outfit-sweater":
      return (
        <path
          d="M20 70 C 18 88 26 100 50 102 C 74 100 82 88 80 70 C 72 76 64 78 58 74 L 50 78 L 42 74 C 36 78 28 76 20 70 Z"
          fill="#7fb0a3"
          opacity={0.92}
        />
      );
    case "outfit-sunglasses":
      return (
        <>
          <rect x="26" y="52" width="22" height="12" rx="6" fill="#1c1c1e" />
          <rect x="52" y="52" width="22" height="12" rx="6" fill="#1c1c1e" />
          <rect x="48" y="55" width="4" height="3.5" rx="1.5" fill="#1c1c1e" />
        </>
      );
    default:
      return null;
  }
}

/** Accessories worn on top of the head. */
function renderHat(hat?: string | null) {
  switch (hat) {
    case "hat-crown":
      return <path d="M35 22 L38 8 L45 17 L50 6 L55 17 L62 8 L65 22 Z" fill="#f5c542" stroke="#c99a1f" strokeWidth="1.5" />;
    case "hat-party":
      return (
        <>
          <path d="M40 22 L50 -4 L60 22 Z" fill="#e0609c" stroke="#a83f6f" strokeWidth="1" />
          <circle cx="50" cy="-4" r="3" fill="#fff" />
        </>
      );
    case "hat-wizard":
      return (
        <>
          <ellipse cx="50" cy="22" rx="17" ry="3.5" fill="#5b3fa0" />
          <path d="M40 22 L50 -8 L60 22 Z" fill="#6b4bb3" stroke="#4a3380" strokeWidth="1" />
          <circle cx="48" cy="6" r="1.4" fill="#f5d76e" />
        </>
      );
    case "hat-bow":
      return (
        <path
          d="M38 14 L47 10 L47 18 L38 21 Z M62 14 L53 10 L53 18 L62 21 Z M47 11 L53 11 L53 17 L47 17 Z"
          fill="#e888b0"
          stroke="#c1608c"
          strokeWidth="1"
        />
      );
    case "hat-cap":
      return (
        <>
          <path d="M32 20 A18 13 0 0 1 68 20 L68 25 L32 25 Z" fill="#3b5fb2" />
          <path d="M50 24 Q64 24 68 28 Q58 26 50 27 Z" fill="#2b4788" />
        </>
      );
    case "hat-halo":
      return <ellipse cx="50" cy="6" rx="14" ry="4" fill="none" stroke="#f5d76e" strokeWidth="3" opacity={0.9} />;
    default:
      return null;
  }
}

/** Verity's mascot: a soft, puffy 5-point star - a friendly, abstract shape rather than a
 *  fruit or animal. Eyes track the mouse wherever it moves on the page, and clicking makes
 *  him react like he's just been poked. */
export function MangoAvatar({ size = 56, mouthOpen = true, className, onClick, hat, outfit, colors, gradientId = "mangoBody" }: MangoAvatarProps) {
  const [c1, c2, c3] = colors || ["#8f7bf0", "#6f5fd6", "#4d3fb0"];
  const rootRef = useRef<SVGSVGElement>(null);
  const rafRef = useRef<number | null>(null);
  const [pupil, setPupil] = useState({ x: 0, y: 0 });
  const [poked, setPoked] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const el = rootRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy) || 1;
        const maxOffset = 3;
        const reach = Math.min(1, dist / 140);
        setPupil({ x: (dx / dist) * maxOffset * reach, y: (dy / dist) * maxOffset * reach });
      });
    }
    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function handleClick() {
    setPoked(true);
    controls.start({
      scaleX: [1, 1.1, 0.94, 1.02, 1],
      scaleY: [1, 0.88, 1.05, 0.98, 1],
      rotate: [0, -6, 5, -2, 0],
      transition: { duration: 0.45, ease: "easeOut" },
    });
    setTimeout(() => setPoked(false), 220);
    onClick?.();
  }

  return (
    <motion.svg
      ref={rootRef}
      viewBox="0 -10 100 120"
      width={size}
      height={size * 1.2}
      className={className}
      onClick={handleClick}
      animate={controls}
      style={{ cursor: "pointer", transformOrigin: "50% 90%" }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="55%" stopColor={c2} />
          <stop offset="100%" stopColor={c3} />
        </linearGradient>
      </defs>

      {/* legs - short, close together, tucked under the bottom two points of the star */}
      <rect x="41" y="98" width="7" height="12" rx="3.5" fill="#3d3080" />
      <rect x="52" y="98" width="7" height="12" rx="3.5" fill="#3d3080" />

      {/* arms - simple rounded sticks, attached at the star's left/right points */}
      <rect x="4" y="46" width="8" height="22" rx="4" fill="#6f5fd6" transform="rotate(-16 8 57)" />
      <rect x="88" y="46" width="8" height="22" rx="4" fill="#6f5fd6" transform="rotate(16 92 57)" />

      {renderOutfitBack(outfit)}

      {/* body - a soft, puffy 5-point star (rounded, no sharp corners) */}
      <path
        d="M37 46 C 46 30 46 30 55 46 C 74 51 74 51 61 65 C 65 84 65 84 47 76 C 29 84 29 84 33 65 C 20 51 20 51 39 46 Z"
        fill={`url(#${gradientId})`}
      />

      {/* blush cheeks */}
      <ellipse cx="30" cy="66" rx="5.5" ry="3.2" fill="#ff8fae" opacity={0.32} />
      <ellipse cx="70" cy="66" rx="5.5" ry="3.2" fill="#ff8fae" opacity={0.32} />

      {/* eyes - simple, round, clearly separated from the mouth; pupils follow the cursor */}
      <circle cx="38" cy="52" r="10" fill="#fff" />
      <circle cx="62" cy="52" r="10" fill="#fff" />
      <motion.circle animate={{ cx: 38 + pupil.x, cy: 52 + pupil.y }} r="5.5" fill="#241f26" />
      <motion.circle animate={{ cx: 62 + pupil.x, cy: 52 + pupil.y }} r="5.5" fill="#241f26" />
      <motion.circle animate={{ cx: 35.8 + pupil.x * 0.5, cy: 49.3 + pupil.y * 0.5 }} r="1.9" fill="#fff" />
      <motion.circle animate={{ cx: 59.8 + pupil.x * 0.5, cy: 49.3 + pupil.y * 0.5 }} r="1.9" fill="#fff" />

      {/* mouth - a simple, friendly smile; a small round open mouth when talking/celebrating */}
      {mouthOpen ? (
        <ellipse cx="50" cy="68" rx="6.5" ry="5" fill="#241f26" />
      ) : (
        <path d="M41 66 Q50 73 59 66" stroke="#241f26" strokeWidth="3" fill="none" strokeLinecap="round" />
      )}

      {renderOutfitFront(outfit)}
      {renderHat(hat)}
    </motion.svg>
  );
}
