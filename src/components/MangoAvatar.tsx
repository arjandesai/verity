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
        d="M28 60 C 18 78 18 98 24 112 C 34 105 66 105 76 112 C 82 98 82 78 72 60 C 62 68 38 68 28 60 Z"
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
          <path d="M28 76 Q50 88 72 76 L72 84 Q50 94 28 84 Z" fill="#c1483b" />
          <rect x="45" y="90" width="6.5" height="18" rx="3" fill="#c1483b" transform="rotate(-8 48 90)" />
        </>
      );
    case "outfit-bowtie":
      return <path d="M42 80 L49 76 L49 85 L42 81 Z M58 80 L51 76 L51 85 L58 81 Z" fill="#2b3a67" />;
    case "outfit-cape":
      return null;
    case "outfit-sweater":
      return (
        <path
          d="M18 74 C 16 92 26 104 50 106 C 74 104 84 92 82 74 C 72 80 64 82 58 78 L 50 82 L 42 78 C 36 82 28 80 18 74 Z"
          fill="#7fb0a3"
          opacity={0.92}
        />
      );
    case "outfit-sunglasses":
      return (
        <>
          <rect x="24" y="46" width="22" height="12" rx="6" fill="#1c1c1e" />
          <rect x="54" y="46" width="22" height="12" rx="6" fill="#1c1c1e" />
          <rect x="46" y="49" width="8" height="3.5" rx="1.5" fill="#1c1c1e" />
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
      return <path d="M35 18 L38 4 L45 13 L50 2 L55 13 L62 4 L65 18 Z" fill="#f5c542" stroke="#c99a1f" strokeWidth="1.5" />;
    case "hat-party":
      return (
        <>
          <path d="M40 18 L50 -8 L60 18 Z" fill="#e0609c" stroke="#a83f6f" strokeWidth="1" />
          <circle cx="50" cy="-8" r="3" fill="#fff" />
        </>
      );
    case "hat-wizard":
      return (
        <>
          <ellipse cx="50" cy="18" rx="17" ry="3.5" fill="#5b3fa0" />
          <path d="M40 18 L50 -12 L60 18 Z" fill="#6b4bb3" stroke="#4a3380" strokeWidth="1" />
          <circle cx="48" cy="2" r="1.4" fill="#f5d76e" />
        </>
      );
    case "hat-bow":
      return (
        <path
          d="M38 10 L47 6 L47 14 L38 17 Z M62 10 L53 6 L53 14 L62 17 Z M47 7 L53 7 L53 13 L47 13 Z"
          fill="#e888b0"
          stroke="#c1608c"
          strokeWidth="1"
        />
      );
    case "hat-cap":
      return (
        <>
          <path d="M32 16 A18 13 0 0 1 68 16 L68 21 L32 21 Z" fill="#3b5fb2" />
          <path d="M50 20 Q64 20 68 24 Q58 22 50 23 Z" fill="#2b4788" />
        </>
      );
    case "hat-halo":
      return <ellipse cx="50" cy="2" rx="14" ry="4" fill="none" stroke="#f5d76e" strokeWidth="3" opacity={0.9} />;
    default:
      return null;
  }
}

/** Verity's mascot: a small, soft kawaii blob/fruit creature - a rounded oval body (wider at
 *  the bottom), coral-to-orange-to-yellow gradient, tiny curved arms, thin stick legs with flat
 *  feet, and a friendly open smile with a couple of tiny teeth and a little tongue. Eyes track
 *  the mouse wherever it moves on the page, and clicking makes him react like he's just been
 *  poked. */
export function MangoAvatar({ size = 56, mouthOpen = true, className, onClick, hat, outfit, colors, gradientId = "mangoBody" }: MangoAvatarProps) {
  const [c1, c2, c3] = colors || ["#f2665c", "#f5924a", "#f7c94a"];
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
      viewBox="0 -14 100 124"
      width={size}
      height={size * 1.24}
      className={className}
      onClick={handleClick}
      animate={controls}
      style={{ cursor: "pointer", transformOrigin: "50% 90%" }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="50%" stopColor={c2} />
          <stop offset="100%" stopColor={c3} />
        </linearGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="50" cy="117" rx="24" ry="4" fill="#000" opacity={0.1} />

      {/* legs - thin sticks with small flat feet, close together */}
      <rect x="42" y="98" width="5" height="17" rx="1" fill="#f0a441" />
      <rect x="53" y="98" width="5" height="17" rx="1" fill="#f0a441" />
      <rect x="40" y="112" width="9" height="4" rx="2" fill="#e8912f" />
      <rect x="51" y="112" width="9" height="4" rx="2" fill="#e8912f" />

      {/* arms - small rounded nubs at the sides, same warm color as the body top */}
      <ellipse cx="15" cy="68" rx="7" ry="11" fill={c1} transform="rotate(18 15 68)" />
      <ellipse cx="85" cy="68" rx="7" ry="11" fill={c1} transform="rotate(-18 85 68)" />

      {renderOutfitBack(outfit)}

      {/* body - a smooth rounded oval blob, a little wider at the bottom, no sharp edges */}
      <path
        d="M50 12
           C 72 12 84 32 84 56
           C 84 84 70 100 50 100
           C 30 100 16 84 16 56
           C 16 32 28 12 50 12 Z"
        fill={`url(#${gradientId})`}
      />

      {/* a tiny leaf/stem sprout on top, like a real mango */}
      <path d="M46 13 C 44 5 48 -1 53 -3 C 51 3 51 9 48 14 Z" fill="#7fae54" />
      <path d="M52 12 C 53 4 59 0 65 0 C 61 5 58 10 54 13 Z" fill="#8fc262" />

      {/* freckle-like speckles on the lower body, echoing real mango skin texture */}
      <g fill="#000" opacity={0.08}>
        <ellipse cx="32" cy="72" rx="2.4" ry="4" transform="rotate(20 32 72)" />
        <ellipse cx="28" cy="84" rx="2" ry="3.4" transform="rotate(10 28 84)" />
        <ellipse cx="36" cy="90" rx="1.8" ry="3" transform="rotate(-8 36 90)" />
        <ellipse cx="30" cy="60" rx="1.6" ry="2.6" transform="rotate(24 30 60)" />
      </g>

      {/* blush cheeks */}
      <ellipse cx="27" cy="60" rx="4.5" ry="2.6" fill="#ff8fae" opacity={0.4} />
      <ellipse cx="73" cy="60" rx="4.5" ry="2.6" fill="#ff8fae" opacity={0.4} />

      {/* eyes - large, round, kawaii-style with a shiny highlight; pupils follow the cursor */}
      <circle cx="35" cy="50" r="11" fill="#fff" />
      <circle cx="65" cy="50" r="11" fill="#fff" />
      <motion.circle animate={{ cx: 35 + pupil.x, cy: 51 + pupil.y }} r="6.5" fill="#241f26" />
      <motion.circle animate={{ cx: 65 + pupil.x, cy: 51 + pupil.y }} r="6.5" fill="#241f26" />
      <motion.circle animate={{ cx: 32.6 + pupil.x * 0.5, cy: 48 + pupil.y * 0.5 }} r="2.3" fill="#fff" />
      <motion.circle animate={{ cx: 62.6 + pupil.x * 0.5, cy: 48 + pupil.y * 0.5 }} r="2.3" fill="#fff" />

      {/* mouth - small open smile with a dark interior, tiny teeth up top, and a tongue peeking out */}
      {mouthOpen ? (
        <>
          <path d="M43 65 Q50 78 57 65 Q50 71 43 65 Z" fill="#241f26" />
          <path d="M45.5 66.5 L48 65 L48 68 Z M54.5 66.5 L52 65 L52 68 Z" fill="#fff" />
          <path d="M47 72 Q50 78 53 72 Q50 74.5 47 72 Z" fill="#ef8f7a" />
        </>
      ) : (
        <path d="M42 70 Q50 77 58 70" stroke="#241f26" strokeWidth="3" fill="none" strokeLinecap="round" />
      )}

      {renderOutfitFront(outfit)}
      {renderHat(hat)}
    </motion.svg>
  );
}
