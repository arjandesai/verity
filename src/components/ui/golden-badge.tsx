"use client";
import * as React from "react";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

type BadgeType = "golden-kitty" | "product-of-the-day" | "product-of-the-week" | "product-of-the-month";

interface AwardBadgeProps {
  type: BadgeType;
  place?: number;
  link?: string;
  className?: string;
}

const BADGE_COPY: Record<BadgeType, { eyebrow: string; ring: string; fill: string }> = {
  "golden-kitty": { eyebrow: "GOLDEN KITTY AWARDS", ring: "#a8791a", fill: "#e8c35c" },
  "product-of-the-day": { eyebrow: "PRODUCT OF THE DAY", ring: "#3b5fb2", fill: "#7d9de8" },
  "product-of-the-week": { eyebrow: "PRODUCT OF THE WEEK", ring: "#3b8a4e", fill: "#7ec98f" },
  "product-of-the-month": { eyebrow: "PRODUCT OF THE MONTH", ring: "#7a3bb2", fill: "#b28ae0" },
};

/** A tilting, mouse-reactive award badge - moving the cursor over it tips the card toward the
 *  pointer and sweeps a soft highlight across it, like a physical medal catching the light. */
export function AwardBadge({ type, place, link, className }: AwardBadgeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const copy = BADGE_COPY[type];

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [10, -10]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-10, 10]), { stiffness: 200, damping: 18 });
  const glowX = useSpring(useTransform(mx, [0, 1], [0, 100]), { stiffness: 200, damping: 20 });
  const glowY = useSpring(useTransform(my, [0, 1], [0, 100]), { stiffness: 200, damping: 20 });

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  }
  function handleLeave() {
    mx.set(0.5);
    my.set(0.5);
  }

  const content = (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileHover={{ scale: 1.03 }}
      className="card"
      style={
        {
          position: "relative",
          overflow: "hidden",
          padding: "22px 26px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          cursor: link ? "pointer" : "default",
          transformStyle: "preserve-3d",
          rotateX: rx,
          rotateY: ry,
          transformPerspective: 700,
        } as any
      }
    >
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: useTransform(
            [glowX, glowY] as any,
            ([gx, gy]: number[]) => `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.35), transparent 55%)`
          ) as any,
        }}
      />
      <svg width="52" height="60" viewBox="0 0 40 46" style={{ flexShrink: 0, position: "relative" }}>
        <path d="M10 2h20l-4 16h-12z" fill={copy.ring} opacity={0.7} />
        <circle cx="20" cy="27" r="15" fill={copy.fill} stroke={copy.ring} strokeWidth="2.5" />
        <circle cx="20" cy="27" r="9.5" fill="none" stroke="var(--bg)" strokeWidth="1.5" opacity={0.7} />
        <path d="M20 21 L22 26 L27 26 L23 29 L24.5 34 L20 31 L15.5 34 L17 29 L13 26 L18 26 Z" fill="var(--bg)" />
        {place && (
          <text x="20" y="31" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--bg)">
            #{place}
          </text>
        )}
      </svg>
      <div style={{ position: "relative" }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: copy.ring, marginBottom: 4 }}>{copy.eyebrow}</div>
        <div style={{ fontWeight: 800, fontSize: 15 }}>Verity</div>
        <div className="text-text-soft" style={{ fontSize: 11.5, marginTop: 1 }}>A cognitive screening demo</div>
      </div>
    </motion.div>
  );

  if (link) {
    return (
      <a href={link} target="_blank" rel="noreferrer noopener" className={className} style={{ display: "block" }}>
        {content}
      </a>
    );
  }
  return <div className={className}>{content}</div>;
}

export const GoldenKitty = ({ link }: { link?: string }) => (
  <div className="grid grid-cols-1 gap-4">
    <AwardBadge type="golden-kitty" link={link} />
  </div>
);
export const ProductOfTheDay = ({ link }: { link?: string }) => (
  <div className="grid grid-cols-1 gap-4">
    <AwardBadge type="product-of-the-day" place={1} link={link} />
  </div>
);
export const ProductOfTheMonth = ({ link }: { link?: string }) => (
  <div className="grid grid-cols-1 gap-4">
    <AwardBadge type="product-of-the-month" place={2} link={link} />
  </div>
);
export const ProductOfTheWeek = ({ link }: { link?: string }) => (
  <div className="grid grid-cols-1 gap-4">
    <AwardBadge type="product-of-the-week" place={3} link={link} />
  </div>
);
