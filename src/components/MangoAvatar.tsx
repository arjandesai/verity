import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";

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

/** Verity's mascot. The body shape, gradient, eye/pupil layout, mouth shape, breathing
 *  animation, drag-squash, and click-hearts are ported directly and faithfully from a
 *  user-supplied reference build (a small standalone HTML/CSS/JS blob character) - the same
 *  proportions, colors, and interactions, just translated into this SVG's coordinate space so
 *  it can be reused as a React component with the existing hat/outfit/recolor system layered
 *  on top. */
export function MangoAvatar({ size = 56, mouthOpen = true, className, onClick, hat, outfit, colors, gradientId = "mangoBody" }: MangoAvatarProps) {
  const [c1, , c3] = colors || ["#ff8d96", "#ffaa76", "#ffc857"];
  const rootRef = useRef<SVGSVGElement>(null);
  const rafRef = useRef<number | null>(null);
  const [pupil, setPupil] = useState({ x: 0, y: 0 });
  const [poked, setPoked] = useState(false);
  const [showHearts, setShowHearts] = useState(false);
  const [heartsBurst, setHeartsBurst] = useState(0);
  const [blinking, setBlinking] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const controls = useAnimation();

  // Pupils track the cursor anywhere on the page, clamped to a small radius within the eye -
  // same relative reach (~38% of the eye's radius) as the reference build.
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
        const maxOffset = 2.1;
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

  // Press-and-drag: squashes while held and follows the pointer within its own space, then
  // springs back to rest on release - matching the reference build's grab interaction without
  // repositioning the element in the page's own layout.
  function handlePointerDown(e: React.PointerEvent) {
    dragStart.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
    controls.start({ scaleX: 1.1, scaleY: 0.9, transition: { duration: 0.15 } });
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }
  function handlePointerMove(e: PointerEvent) {
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const max = 22;
    controls.set({ x: Math.max(-max, Math.min(max, dx)), y: Math.max(-max, Math.min(max, dy)) });
  }
  function handlePointerUp() {
    setDragging(false);
    controls.start({ x: 0, y: 0, scaleX: 1, scaleY: 1, transition: { type: "spring", stiffness: 300, damping: 14 } });
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  }

  // Click (not a drag release) has a 50/50 chance of popping a small burst of hearts - same odds
  // as the reference build.
  function handleClick() {
    if (dragging) return;
    setPoked(true);
    setTimeout(() => setPoked(false), 220);
    if (Math.random() < 0.5) {
      setHeartsBurst((n) => n + 1);
      setShowHearts(true);
      setTimeout(() => setShowHearts(false), 1700);
    }
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
      onPointerDown={handlePointerDown}
      animate={controls}
      style={{ cursor: "grab", transformOrigin: "50% 50%" }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c3} />
        </linearGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="50" cy="86" rx="20" ry="2.6" fill="#000" opacity={0.1} />

      {/* gentle "breathing" scale pulse, matching the reference build's keyframes */}
      <motion.g
        animate={{ scaleX: [1, 1.02, 1], scaleY: [1, 0.98, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "50% 50px" }}
      >
        {renderOutfitBack(outfit)}

        {/* body - a heavily rounded blob rect, ported from the reference's 220x260 div at
            border-radius: 48% */}
        <rect x="22" y="16.9" width="56" height="66.2" rx="26.9" ry="31.8" fill={`url(#${gradientId})`} />

        {/* eyes - white circles with dark pupils that track the cursor, or a closed blink arc */}
        {blinking ? (
          <>
            <path d="M34.7 40.1 Q40.1 44.5 45.5 40.1" stroke="#222" strokeWidth="1.4" fill="none" strokeLinecap="round" />
            <path d="M54.5 40.1 Q59.9 44.5 65.3 40.1" stroke="#222" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="40.1" cy="40.1" r="5.4" fill="#fff" />
            <circle cx="59.9" cy="40.1" r="5.4" fill="#fff" />
            <motion.circle animate={{ cx: 40.1 + pupil.x, cy: 40.1 + pupil.y }} r="2.3" fill="#222" />
            <motion.circle animate={{ cx: 59.9 + pupil.x, cy: 40.1 + pupil.y }} r="2.3" fill="#222" />
          </>
        )}

        {/* mouth - flat top, rounded bottom corners, ported from the reference build */}
        {mouthOpen ? (
          <path
            d="M46.2 50 L53.8 50 L53.8 51.3 Q53.8 55.1 50 55.1 Q46.2 55.1 46.2 51.3 Z"
            fill="#433"
          />
        ) : (
          <path d="M45 51 Q50 54.5 55 51" stroke="#433" strokeWidth="2" fill="none" strokeLinecap="round" />
        )}

        {renderOutfitFront(outfit)}
        {renderHat(hat)}
      </motion.g>

      {/* a small burst of hearts on a lucky click, same 50/50 odds as the reference build */}
      <AnimatePresence>
        {showHearts &&
          Array.from({ length: 6 }).map((_, i) => (
            <motion.text
              key={`${heartsBurst}-${i}`}
              x={50 + (i - 2.5) * 6}
              y={20}
              fontSize={7}
              textAnchor="middle"
              fill="#ff6478"
              initial={{ opacity: 1, y: 30 }}
              animate={{ opacity: 0, y: -20 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, delay: i * 0.04, ease: "easeOut" }}
            >
              ♥
            </motion.text>
          ))}
      </AnimatePresence>
    </motion.svg>
  );
}
