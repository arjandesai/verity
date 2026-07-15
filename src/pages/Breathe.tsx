import * as React from "react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wind } from "lucide-react";
import { RevealOnScroll } from "@/components/RevealOnScroll";

type Phase = "in" | "hold" | "out" | "rest";

const PHASES: { phase: Phase; label: string; ms: number }[] = [
  { phase: "in", label: "Breathe in", ms: 4000 },
  { phase: "hold", label: "Hold", ms: 4000 },
  { phase: "out", label: "Breathe out", ms: 6000 },
  { phase: "rest", label: "Rest", ms: 2000 },
];

/** A simple box-breathing / 4-4-6-2 guided exercise - not a cognitive test or feature, just a
 *  short, calming tool. Chronic stress measurably affects memory and focus, and a stressed
 *  or rushed state can also throw off the speech and handwriting tests, so a minute of this
 *  before testing (or any time) is a genuinely useful, low-effort addition. */
export default function Breathe() {
  const [running, setRunning] = useState(false);
  const [index, setIndex] = useState(0);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (!running) return;
    const current = PHASES[index];
    const t = setTimeout(() => {
      const nextIndex = (index + 1) % PHASES.length;
      setIndex(nextIndex);
      if (nextIndex === 0) setCycles((c) => c + 1);
    }, current.ms);
    return () => clearTimeout(t);
  }, [running, index]);

  function start() {
    setIndex(0);
    setCycles(0);
    setRunning(true);
  }
  function stop() {
    setRunning(false);
    setIndex(0);
  }

  const current = PHASES[index];
  const scale = current.phase === "in" ? 1.3 : current.phase === "out" ? 0.75 : current.phase === "hold" ? 1.3 : 0.75;

  return (
    <div className="container" style={{ paddingTop: 56, paddingBottom: 120, maxWidth: 560, textAlign: "center" }}>
      <RevealOnScroll>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 6 }}>
          <Wind size={26} />
          <h1 style={{ fontSize: 30, fontWeight: 800 }}>Breathe</h1>
        </div>
        <p className="text-text-soft" style={{ marginBottom: 40 }}>
          A short guided breathing exercise. Four seconds in, four held, six out, two to rest - repeat as long as you like.
        </p>
      </RevealOnScroll>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 260, marginBottom: 30 }}>
        <motion.div
          animate={{ scale: running ? scale : 1 }}
          transition={{ duration: current.ms / 1000, ease: "easeInOut" }}
          style={{
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--blue-deep), var(--lavender-deep))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--bg)",
            fontWeight: 700,
            fontSize: 15,
          }}
        >
          {running ? current.label : "Ready"}
        </motion.div>
      </div>

      {running && (
        <p className="text-text-soft" style={{ marginBottom: 20, fontSize: 13 }}>
          {cycles} cycle{cycles === 1 ? "" : "s"} completed
        </p>
      )}

      {running ? (
        <button className="btn btn-secondary" onClick={stop}>
          Stop
        </button>
      ) : (
        <button className="btn btn-primary" onClick={start}>
          Start breathing exercise
        </button>
      )}
    </div>
  );
}
