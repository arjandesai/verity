"use client";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mic, Square } from "lucide-react";

interface AIVoiceInputProps {
  onStart?: () => void;
  onStop?: (duration: number) => void;
  /** Live 0-1 volume levels to visualize while recording — if omitted, falls back to a gentle
   *  idle pulse so the component still looks alive on its own. */
  levels?: number[];
  className?: string;
}

const IDLE_BARS = Array.from({ length: 24 }, (_, i) => 0.15 + 0.1 * Math.sin(i));

/** A pill-shaped mic control: tap to start, tap again to stop. Shows an elapsed timer and an
 *  animated bar visualizer while recording. */
export function AIVoiceInput({ onStart, onStop, levels, className }: AIVoiceInputProps) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const startRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current != null) window.clearInterval(timerRef.current);
    },
    []
  );

  function handleClick() {
    if (!recording) {
      setRecording(true);
      setSeconds(0);
      startRef.current = Date.now();
      timerRef.current = window.setInterval(() => {
        setSeconds(Math.round((Date.now() - startRef.current) / 1000));
      }, 200);
      onStart?.();
    } else {
      setRecording(false);
      if (timerRef.current != null) window.clearInterval(timerRef.current);
      const duration = (Date.now() - startRef.current) / 1000;
      onStop?.(duration);
    }
  }

  const bars = recording && levels?.length ? levels : IDLE_BARS;

  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 3, height: 48 }}>
        {bars.map((lvl, i) => (
          <motion.span
            key={i}
            animate={{ height: recording ? `${10 + lvl * 38}px` : "8px" }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{
              width: 4,
              borderRadius: 999,
              background: recording ? "var(--blue-deep)" : "var(--border)",
              display: "inline-block",
            }}
          />
        ))}
      </div>

      {recording && <div style={{ fontSize: 28, fontWeight: 800 }}>{seconds}s</div>}

      <motion.button
        type="button"
        onClick={handleClick}
        aria-label={recording ? "Stop recording" : "Start recording"}
        animate={
          recording
            ? { boxShadow: ["0 0 0 0 rgba(178,59,59,0.5)", "0 0 0 12px rgba(178,59,59,0)"] }
            : { boxShadow: "0 0 0 0 rgba(178,59,59,0)" }
        }
        transition={{ duration: 1.4, repeat: recording ? Infinity : 0, ease: "easeOut" }}
        style={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          border: "none",
          background: recording ? "#b23b3b" : "var(--blue-deep)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        {recording ? <Square size={22} fill="#fff" /> : <Mic size={24} />}
      </motion.button>

      <span style={{ fontSize: 12.5, color: "var(--text-soft)" }}>
        {recording ? "Tap to stop" : "Tap to start recording"}
      </span>
    </div>
  );
}
