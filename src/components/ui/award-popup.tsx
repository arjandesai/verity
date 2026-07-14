"use client";
import * as React from "react";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export type AwardPopupType =
  | "streak"
  | "personal-best"
  | "level-up"
  | "milestone"
  | "bronze"
  | "silver"
  | "gold"
  | "first-time"
  | "consistency"
  | "improvement"
  | "platinum";

interface AwardPopupData {
  id: number;
  type: AwardPopupType;
  title: string;
  subtitle?: string;
}

interface AwardPopupContextValue {
  showAward: (data: Omit<AwardPopupData, "id">) => void;
}

const AwardPopupContext = createContext<AwardPopupContextValue | null>(null);

const TYPE_STYLE: Record<AwardPopupType, { ring: string; fill: string; label: string }> = {
  streak: { ring: "#a8791a", fill: "#e8c35c", label: "Streak" },
  "personal-best": { ring: "#3b5fb2", fill: "#7d9de8", label: "Personal best" },
  "level-up": { ring: "#7a3bb2", fill: "#b28ae0", label: "Level up" },
  milestone: { ring: "#3b8a4e", fill: "#7ec98f", label: "Milestone" },
  bronze: { ring: "#8a5a2e", fill: "#c98a4b", label: "Bronze award" },
  silver: { ring: "#9a9a9a", fill: "#c7c7c7", label: "Silver award" },
  gold: { ring: "#a8791a", fill: "#e8c35c", label: "Gold award" },
  "first-time": { ring: "#3b8a4e", fill: "#7ec98f", label: "First time" },
  consistency: { ring: "#b23b6b", fill: "#e08ab0", label: "Consistency" },
  improvement: { ring: "#3b5fb2", fill: "#7d9de8", label: "Improvement" },
  platinum: { ring: "#3fa8c9", fill: "#bdf0ff", label: "Platinum" },
};

function Ribbon({ type, large }: { type: AwardPopupType; large?: boolean }) {
  const s = TYPE_STYLE[type];
  const size = large ? 84 : 44;
  const h = large ? 96 : 50;
  return (
    <svg width={size} height={h} viewBox="0 0 40 46" style={{ flexShrink: 0 }}>
      <path d="M10 2h20l-4 16h-12z" fill={s.ring} opacity={0.7} />
      <circle cx="20" cy="27" r="15" fill={s.fill} stroke={s.ring} strokeWidth="2.5" />
      <circle cx="20" cy="27" r="9.5" fill="none" stroke="var(--bg)" strokeWidth="1.5" opacity={0.7} />
      <path d="M20 21 L22 26 L27 26 L23 29 L24.5 34 L20 31 L15.5 34 L17 29 L13 26 L18 26 Z" fill="var(--bg)" />
    </svg>
  );
}

/** A full-screen "cutscene" moment - dims the whole page, and animates a big, mouse-reactive
 *  award card into the center of the screen showing the achievement's real name. The card tilts
 *  toward the cursor and sweeps a soft highlight across it, like a physical medal catching the
 *  light. Click anywhere, or wait, to dismiss. Only one shows at a time; if several unlock at
 *  once they queue up and play one after another. */
function AwardCutscene({ data, onClose }: { data: AwardPopupData; onClose: () => void }) {
  const s = TYPE_STYLE[data.type];
  const cardRef = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-8, 8]), { stiffness: 200, damping: 18 });
  const glowX = useSpring(useTransform(mx, [0, 1], [0, 100]), { stiffness: 200, damping: 20 });
  const glowY = useSpring(useTransform(my, [0, 1], [0, 100]), { stiffness: 200, damping: 20 });
  const glowBg = useTransform([glowX, glowY] as any, ([gx, gy]: number[]) => `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.35), transparent 55%)`);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  }
  function handleLeave() {
    mx.set(0.5);
    my.set(0.5);
  }

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        initial={{ opacity: 0, scale: 0.7, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 10 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        style={
          {
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "18px 26px",
            minWidth: 400,
            maxWidth: 440,
            borderRadius: 14,
            background: "linear-gradient(135deg, #1c1c1e 0%, #0a0a0c 100%)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
            transformStyle: "preserve-3d",
            transformPerspective: 700,
            rotateX: rx,
            rotateY: ry,
          } as any
        }
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: glowBg as any }} />
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.1 }}
          style={{ position: "relative", flexShrink: 0 }}
        >
          <Ribbon type={data.type} large />
        </motion.div>
        <div style={{ position: "relative", textAlign: "left", minWidth: 0 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: s.ring, marginBottom: 3 }}>
            {s.label} unlocked
          </div>
          <div style={{ fontWeight: 800, fontSize: 17, color: "#fff", lineHeight: 1.25 }}>{data.title}</div>
          {data.subtitle && (
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)", marginTop: 3, lineHeight: 1.4 }}>{data.subtitle}</div>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Dismiss"
          style={{
            position: "relative",
            marginLeft: "auto",
            flexShrink: 0,
            background: "rgba(255,255,255,0.08)",
            border: "none",
            color: "rgba(255,255,255,0.7)",
            width: 26,
            height: 26,
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: 14,
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </motion.div>
    </motion.div>
  );
}

export function AwardPopupProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<AwardPopupData[]>([]);

  const showAward = useCallback((data: Omit<AwardPopupData, "id">) => {
    const id = Date.now() + Math.random();
    setQueue((prev) => [...prev, { ...data, id }]);
  }, []);

  const current = queue[0];

  function dismissCurrent() {
    setQueue((prev) => prev.slice(1));
  }

  // Auto-advance so an unattended queue doesn't get stuck on the first cutscene forever.
  React.useEffect(() => {
    if (!current) return;
    const t = setTimeout(dismissCurrent, 5000);
    return () => clearTimeout(t);
  }, [current]);

  return (
    <AwardPopupContext.Provider value={{ showAward }}>
      {children}
      <AnimatePresence>{current && <AwardCutscene key={current.id} data={current} onClose={dismissCurrent} />}</AnimatePresence>
    </AwardPopupContext.Provider>
  );
}

export function useAwardPopup(): AwardPopupContextValue {
  const ctx = useContext(AwardPopupContext);
  if (!ctx) throw new Error("useAwardPopup must be used within AwardPopupProvider");
  return ctx;
}
