"use client";
import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type AwardTier = "bronze" | "silver" | "gold" | "platinum";

interface AwardBadgeProps {
  tier: AwardTier;
  title: string;
  description?: string;
  unlocked?: boolean;
  className?: string;
}

const TIER_STYLES: Record<AwardTier, { ring: string; fill: string; label: string }> = {
  bronze: { ring: "#8a5a2e", fill: "#c98a4b", label: "Bronze" },
  silver: { ring: "#9a9a9a", fill: "#c7c7c7", label: "Silver" },
  gold: { ring: "#a8791a", fill: "#e8c35c", label: "Gold" },
  platinum: { ring: "#3fa8c9", fill: "#bdf0ff", label: "Platinum" },
};

/** A ranked achievement badge - bronze, silver, or gold - with a medal icon and custom title/description. */
export function AwardBadge({ tier, title, description, unlocked = true, className }: AwardBadgeProps) {
  const style = TIER_STYLES[tier];

  return (
    <motion.div
      className={cn("flex items-center gap-3 rounded-2xl border p-4", className)}
      style={{
        borderColor: unlocked ? "var(--border)" : "var(--border)",
        background: unlocked ? "var(--card)" : "var(--bg)",
        opacity: unlocked ? 1 : 0.5,
      }}
      whileHover={unlocked ? { y: -2 } : undefined}
    >
      <svg width="40" height="46" viewBox="0 0 40 46" style={{ flexShrink: 0, filter: unlocked ? "none" : "grayscale(1)" }}>
        <path d="M10 2h20l-4 16h-12z" fill={style.ring} opacity={0.7} />
        <circle cx="20" cy="27" r="15" fill={style.fill} stroke={style.ring} strokeWidth="2.5" />
        <circle cx="20" cy="27" r="9.5" fill="none" stroke={unlocked ? "var(--bg)" : "var(--card)"} strokeWidth="1.5" opacity={0.7} />
        <path d="M20 21 L22 26 L27 26 L23 29 L24.5 34 L20 31 L15.5 34 L17 29 L13 26 L18 26 Z" fill={unlocked ? "var(--bg)" : "var(--card)"} />
      </svg>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: style.ring, marginBottom: 2 }}>
          {style.label}
        </div>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div>
        {description && (
          <div className="text-text-soft" style={{ fontSize: 12, marginTop: 2 }}>
            {description}
          </div>
        )}
      </div>
    </motion.div>
  );
}
