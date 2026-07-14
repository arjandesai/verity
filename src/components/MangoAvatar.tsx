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

/** Verity's mascot: a small, soft blob creature that gently bobs up and down and blinks every
 *  few seconds, on top of the original poke/mouse-tracking behavior. Body proportions and the
 *  pink-to-yellow-green gradient are ported directly from an original procedural drawing
 *  (each shape's position/size converted from its source 512x512 canvas into this SVG's
 *  coordinate space) rather than traced from any illustration. */
export function MangoAvatar({ size = 56, mouthOpen = true, className, onClick, hat, outfit, colors, gradientId = "mangoBody" }: MangoAvatarProps) {
  const [c1, c2, c3] = colors || ["#ff7882", "#ebaa5a", "#d7dc32"];
  const rootRef = useRef<SVGSVGElement>(null);
  const rafRef = useRef<number | null>(null);
  const [pupil, setPupil] = useState({ x: 0, y: 0 });
  const [poked, setPoked] = useState(false);
  const [blinking, setBlinking] = useState(false);
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

  // Blinks for ~150ms every 3-4 seconds, at a random-ish interval so multiple copies on the
  // same page don't all blink in perfect unison.
  useEffect(() => {
    let timeout: number;
    function scheduleBlink() {
      timeout = window.setTimeout(() => {
        setBlinking(true);
        setTimeout(() => setBlinking(false), 150);
        scheduleBlink();
      }, 3000 + Math.random() * 1500);
    }
    scheduleBlink();
    return () => clearTimeout(timeout);
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
      viewBox="0 -8 100 108"
      width={size}
      height={size * 1.08}
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

      {/* ground shadow - stays put while the body floats above it */}
      <ellipse cx="49.8" cy="83" rx="20.5" ry="2.9" fill="#000" opacity={0.12} />

      {/* everything below gently bobs up and down, like it's floating */}
      <motion.g
        animate={{ y: [0, -3.5, 0, 3.5, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* legs - thin sticks with small flat feet */}
        <rect x="41" y="68.3" width="2" height="11.7" fill="#ffaa28" />
        <rect x="57.6" y="68.3" width="2" height="11.7" fill="#ffaa28" />
        <ellipse cx="41.5" cy="80" rx="3.4" ry="2" fill="#ffaa28" />
        <ellipse cx="60" cy="80" rx="3.4" ry="2" fill="#ffaa28" />

        {/* arms */}
        <ellipse cx="24.4" cy="56.6" rx="4.9" ry="7.8" fill="#ff7882" />
        <ellipse cx="75.6" cy="56.6" rx="4.9" ry="7.8" fill="#ff7882" />

        {renderOutfitBack(outfit)}

        {/* body */}
        <ellipse cx="49.8" cy="50" rx="26.4" ry="20.5" fill={`url(#${gradientId})`} />

        {/* small antenna on top */}
        <ellipse cx="49.8" cy="28.3" rx="2.9" ry="3.9" fill="#ff6478" />

        {/* eyes - open, with a shine; pupils follow the cursor - or a closed blink arc */}
        {blinking ? (
          <>
            <path d="M32.3 45.9 Q39.1 51 45.9 45.9" stroke="#241f26" strokeWidth="1.4" fill="none" strokeLinecap="round" />
            <path d="M53.7 45.9 Q60.5 51 67.3 45.9" stroke="#241f26" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="39.1" cy="45.9" r="6.8" fill="#fff" />
            <circle cx="60.5" cy="45.9" r="6.8" fill="#fff" />
            <motion.circle animate={{ cx: 39.1 + pupil.x, cy: 46.9 + pupil.y }} r="3.9" fill="#281e3c" />
            <motion.circle animate={{ cx: 60.5 + pupil.x, cy: 46.9 + pupil.y }} r="3.9" fill="#281e3c" />
            <motion.circle animate={{ cx: 37.7 + pupil.x * 0.5, cy: 44.9 + pupil.y * 0.5 }} r="1.4" fill="#fff" />
            <motion.circle animate={{ cx: 59.1 + pupil.x * 0.5, cy: 44.9 + pupil.y * 0.5 }} r="1.4" fill="#fff" />
          </>
        )}

        {/* mouth - a rounded dark opening with a couple of teeth and a little tongue */}
        {mouthOpen ? (
          <>
            <rect x="44.9" y="52.7" width="9.8" height="9.8" rx="2.9" fill="#3c1e46" />
            <rect x="47.9" y="52.7" width="2.9" height="2.9" fill="#fff" />
            <ellipse cx="49.8" cy="60" rx="2" ry="1.5" fill="#ff8282" />
          </>
        ) : (
          <path d="M42 60 Q49.8 66 57.6 60" stroke="#3c1e46" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        )}

        {renderOutfitFront(outfit)}
        {renderHat(hat)}
      </motion.g>
    </motion.svg>
  );
}
