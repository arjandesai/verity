import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

interface Shortcut {
  keys: string[];
  label: string;
  to?: string;
}

const SHORTCUTS: Shortcut[] = [
  { keys: ["g", "h"], label: "Go to Home", to: "/" },
  { keys: ["g", "t"], label: "Go to Tests", to: "/tests" },
  { keys: ["g", "s"], label: "Go to Speech test", to: "/speech" },
  { keys: ["g", "w"], label: "Go to Handwriting test", to: "/handwriting" },
  { keys: ["g", "g"], label: "Go to Games", to: "/games" },
  { keys: ["g", "d"], label: "Go to Dashboard", to: "/dashboard" },
  { keys: ["g", "c"], label: "Go to Compare", to: "/compare" },
  { keys: ["g", "y"], label: "Go to Daily challenge", to: "/challenge" },
  { keys: ["g", "j"], label: "Go to Journal", to: "/journal" },
  { keys: ["g", "p"], label: "Go to Mango", to: "/pet" },
  { keys: ["g", "b"], label: "Go to Breathe", to: "/breathe" },
  { keys: ["?"], label: "Show this shortcuts menu" },
];

/** Gmail/Linear-style "press g then a letter" navigation, plus "?" to see the list - a small
 *  power-user convenience layered on top of the mouse-driven nav, and a step toward better
 *  keyboard accessibility generally. Ignored while typing in a text field. */
export function KeyboardShortcuts() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [pendingG, setPendingG] = useState(false);

  useEffect(() => {
    let clearPending: number;
    function isTypingTarget(el: EventTarget | null): boolean {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName.toLowerCase();
      return tag === "input" || tag === "textarea" || el.isContentEditable;
    }

    function handleKey(e: KeyboardEvent) {
      if (isTypingTarget(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "?") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (e.key === "Escape") {
        setOpen(false);
        setPendingG(false);
        return;
      }
      if (e.key.toLowerCase() === "g" && !pendingG) {
        setPendingG(true);
        window.clearTimeout(clearPending);
        clearPending = window.setTimeout(() => setPendingG(false), 1200);
        return;
      }
      if (pendingG) {
        const match = SHORTCUTS.find((s) => s.keys[0] === "g" && s.keys[1] === e.key.toLowerCase());
        setPendingG(false);
        if (match?.to) {
          navigate(match.to);
        }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.clearTimeout(clearPending);
    };
  }, [pendingG, navigate]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            onClick={(e) => e.stopPropagation()}
            className="card"
            style={{ padding: 28, maxWidth: 380, width: "100%" }}
          >
            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 4 }}>Keyboard shortcuts</div>
            <div style={{ fontSize: 12.5, color: "var(--text-soft)", marginBottom: 18 }}>Press "g" then a letter to jump anywhere.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SHORTCUTS.map((s) => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13.5 }}>
                  <span>{s.label}</span>
                  <span style={{ display: "flex", gap: 4 }}>
                    {s.keys.map((k) => (
                      <kbd
                        key={k}
                        style={{
                          padding: "2px 8px",
                          borderRadius: 6,
                          border: "1px solid var(--border)",
                          background: "var(--bg)",
                          fontSize: 12,
                          fontFamily: "inherit",
                        }}
                      >
                        {k}
                      </kbd>
                    ))}
                  </span>
                </div>
              ))}
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setOpen(false)} style={{ marginTop: 20, width: "100%" }}>
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
