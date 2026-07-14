import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  showIcons?: boolean;
  checkedIcon?: React.ReactNode;
  uncheckedIcon?: React.ReactNode;
  haptic?: "light" | "heavy" | "none";
  variant?: "default" | "destructive";
  className?: string;
  disabled?: boolean;
}

const TRACK_WIDTH = 52;
const TRACK_HEIGHT = 32;
const KNOB_OFF = 16;
const KNOB_ON = 24;
const PADDING = 4;

/** A short, synthesized "thud" via the Web Audio API so switches have a tactile feel even
    without a real haptic engine - "heavy" is a lower, punchier tone, "light" a quick soft tick.
    Falls back silently if audio can't be created (e.g. autoplay policy before first interaction). */
function playHaptic(kind: "light" | "heavy") {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = kind === "heavy" ? 90 : 220;
    gain.gain.setValueAtTime(kind === "heavy" ? 0.18 : 0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (kind === "heavy" ? 0.12 : 0.05));
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + (kind === "heavy" ? 0.12 : 0.05));
  } catch {
    /* audio unavailable - not essential, fail silently */
  }
  if (navigator.vibrate) {
    navigator.vibrate(kind === "heavy" ? 25 : 8);
  }
}

export function Switch({
  checked,
  onCheckedChange,
  showIcons = false,
  checkedIcon,
  uncheckedIcon,
  haptic = "none",
  variant = "default",
  className,
  disabled = false,
}: SwitchProps) {
  const knobSize = checked ? KNOB_ON : KNOB_OFF;
  const travel = TRACK_WIDTH - knobSize - PADDING * 2;

  function handleClick() {
    if (disabled) return;
    if (haptic !== "none") playHaptic(haptic);
    onCheckedChange(!checked);
  }

  const onColor = variant === "destructive" ? "#a32d2d" : "var(--blue-deep)";
  const onBorder = variant === "destructive" ? "#a32d2d" : "var(--blue-deep)";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleClick}
      className={cn("peer", className)}
      style={{
        width: TRACK_WIDTH,
        height: TRACK_HEIGHT,
        borderRadius: 999,
        border: `2px solid ${checked ? onBorder : "var(--border-strong)"}`,
        background: checked ? onColor : "var(--card)",
        position: "relative",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        padding: 0,
        transition: "background 0.2s ease, border-color 0.2s ease",
        flexShrink: 0,
      }}
    >
      <motion.div
        animate={{
          x: checked ? travel + PADDING : PADDING,
          y: (TRACK_HEIGHT - 4 - knobSize) / 2,
          width: knobSize,
          height: knobSize,
        }}
        transition={{ type: "spring", stiffness: 550, damping: 30 }}
        style={{
          position: "absolute",
          top: 0,
          borderRadius: "50%",
          background: checked ? "#fff" : "var(--text-soft)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {showIcons &&
          (checked ? (
            <span style={{ color: onColor, display: "flex" }}>{checkedIcon}</span>
          ) : (
            <span style={{ color: "var(--card)", display: "flex" }}>{uncheckedIcon}</span>
          ))}
      </motion.div>
    </button>
  );
}
