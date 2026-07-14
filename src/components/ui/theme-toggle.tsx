"use client";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useAnimation } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { applyTheme, getTheme, toggleTheme, setTheme as setThemeStorage } from "@/lib/verity";

const TRACK_WIDTH = 52;
const KNOB_SIZE = 20;
const PADDING = 3;
const TRAVEL = TRACK_WIDTH - KNOB_SIZE - PADDING * 2; // distance the knob can slide

/** A sun/moon pill switch you can tap OR drag - snaps to whichever side is closer when released. */
export function ThemeToggle() {
  const [theme, setThemeState] = useState<"light" | "dark">("light");
  const isDark = theme === "dark";
  const x = useMotionValue(0);
  const controls = useAnimation();
  const draggedRef = useRef(false);

  useEffect(() => {
    const t = getTheme();
    setThemeState(t);
    applyTheme(t);
    x.set(t === "dark" ? TRAVEL : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyAndSet(next: "light" | "dark") {
    setThemeState(next);
    setThemeStorage(next);
    applyTheme(next);
    controls.start({ x: next === "dark" ? TRAVEL : 0, transition: { type: "spring", stiffness: 500, damping: 32 } });
  }

  function handleClick() {
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    applyAndSet(isDark ? "light" : "dark");
  }

  function handleDragEnd() {
    const current = x.get();
    const next: "light" | "dark" = current > TRAVEL / 2 ? "dark" : "light";
    applyAndSet(next);
    setTimeout(() => {
      draggedRef.current = false;
    }, 50);
  }

  return (
    <button
      aria-label="Toggle dark mode"
      onClick={handleClick}
      style={{
        width: TRACK_WIDTH,
        height: 28,
        borderRadius: 999,
        border: "1.5px solid var(--text-soft)",
        background: "var(--card)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
        position: "relative",
        cursor: "pointer",
        padding: PADDING,
        display: "flex",
        alignItems: "center",
      }}
    >
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: TRAVEL }}
        dragElastic={0.15}
        dragMomentum={false}
        onDragStart={() => {
          draggedRef.current = true;
        }}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{
          x,
          width: KNOB_SIZE,
          height: KNOB_SIZE,
          borderRadius: "50%",
          background: "var(--blue-deep)",
          color: "var(--bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "grab",
        }}
        whileTap={{ scale: 1.15 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span key="moon" initial={{ opacity: 0, rotate: -60 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 60 }} transition={{ duration: 0.2 }} style={{ display: "flex" }}>
              <Moon size={12} />
            </motion.span>
          ) : (
            <motion.span key="sun" initial={{ opacity: 0, rotate: 60 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -60 }} transition={{ duration: 0.2 }} style={{ display: "flex" }}>
              <Sun size={12} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  );
}
