import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface ButtonHoldAndReleaseProps {
  holdDuration?: number;
  label?: string;
  holdingLabel?: string;
  onComplete?: () => void;
  className?: string;
  disabled?: boolean;
}

/** A press-and-hold-to-confirm button - instead of a plain confirm dialog, you have to hold it
 *  down for the full duration for the action to fire, which makes destructive actions (deleting
 *  an account, throwing away a recording) much harder to trigger by accident. Releasing early
 *  cancels and resets the fill. */
export function ButtonHoldAndRelease({
  holdDuration = 1500,
  label = "Hold to confirm",
  holdingLabel = "Keep holding…",
  onComplete,
  className,
  disabled,
}: ButtonHoldAndReleaseProps) {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  function stop() {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    startRef.current = null;
    setHolding(false);
    setProgress(0);
  }

  function start() {
    if (disabled || done) return;
    setHolding(true);
    startRef.current = performance.now();
    function tick(now: number) {
      if (startRef.current == null) return;
      const elapsed = now - startRef.current;
      const pct = Math.min(1, elapsed / holdDuration);
      setProgress(pct);
      if (pct >= 1) {
        setDone(true);
        setHolding(false);
        onComplete?.();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  useEffect(() => () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <button
      type="button"
      disabled={disabled || done}
      onMouseDown={start}
      onMouseUp={stop}
      onMouseLeave={stop}
      onTouchStart={start}
      onTouchEnd={stop}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "10px 20px",
        borderRadius: 10,
        border: "1px solid #b23b3b",
        background: "var(--card)",
        // a darker red than the fill sweep behind it, so the label stays legible the whole time
        // you're holding - not just before/after
        color: done ? "#fff" : "#5c1414",
        fontWeight: 700,
        fontSize: 14,
        cursor: disabled || done ? "default" : "pointer",
        userSelect: "none",
        WebkitUserSelect: "none",
        touchAction: "none",
      }}
    >
      <motion.span
        aria-hidden
        animate={{ width: `${progress * 100}%` }}
        transition={{ duration: 0 }}
        style={{
          position: "absolute",
          inset: 0,
          right: "auto",
          background: "#b23b3b",
          zIndex: 0,
        }}
      />
      <span style={{ position: "relative", zIndex: 1 }}>
        {done ? "Done" : holding ? holdingLabel : label}
      </span>
    </button>
  );
}
