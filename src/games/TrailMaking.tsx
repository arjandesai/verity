import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { updateGameBest } from "@/lib/verity";
import type { Difficulty } from "@/components/LevelBar";

/** The Trail Making Test is a real, widely-used neuropsychological task - connect the circles
 *  in order, alternating number and letter (1-A-2-B-3-C...), as fast as you can without
 *  mistakes. It's one of the more validated pen-and-paper cognitive tests in actual clinical use
 *  (commonly used to screen for processing speed and visual attention), so it's a natural fit
 *  alongside Verity's other brain-training games - this is a digital, self-paced version of it. */

const PAIR_COUNT: Record<Difficulty, number> = { Easy: 6, Medium: 8, Hard: 11, Extreme: 13 };
const LETTERS = "ABCDEFGHIJKLMNOP";

interface Node {
  id: string; // e.g. "1" or "A"
  order: number; // 0-based position in the correct sequence
  x: number;
  y: number;
}

function buildNodes(pairs: number): Node[] {
  const total = pairs * 2;
  const sequence: string[] = [];
  for (let i = 1; i <= pairs; i++) {
    sequence.push(String(i));
    if (i - 1 < LETTERS.length) sequence.push(LETTERS[i - 1]);
  }
  const trimmed = sequence.slice(0, total);
  // Scatter nodes on a loose grid with random jitter so the path isn't a straight line,
  // then shuffle grid cell assignment so the visual order doesn't match the sequence order.
  const cols = Math.ceil(Math.sqrt(total * 1.4));
  const rows = Math.ceil(total / cols);
  const cells: { x: number; y: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({
        x: 8 + (c / Math.max(1, cols - 1)) * 84 + (Math.random() * 8 - 4),
        y: 8 + (r / Math.max(1, rows - 1)) * 84 + (Math.random() * 8 - 4),
      });
    }
  }
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return trimmed.map((id, i) => ({ id, order: i, x: cells[i].x, y: cells[i].y }));
}

type Phase = "playing" | "done" | "failed";

export function TrailMaking({ difficulty, onWin }: { difficulty: Difficulty; onWin: (isNewBest?: boolean) => void }) {
  const pairs = PAIR_COUNT[difficulty];
  const [nodes, setNodes] = useState<Node[]>(() => buildNodes(pairs));
  const [next, setNext] = useState(0);
  const [phase, setPhase] = useState<Phase>("playing");
  const [mistakes, setMistakes] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);
  const startRef = useRef(Date.now());
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  useEffect(() => {
    if (phase !== "playing") return;
    function tick() {
      setElapsedMs(Date.now() - startRef.current);
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);

  function reset() {
    setNodes(buildNodes(pairs));
    setNext(0);
    setPhase("playing");
    setMistakes(0);
    setElapsedMs(0);
    setIsNewBest(false);
    startRef.current = Date.now();
  }

  function handleTap(node: Node) {
    if (phase !== "playing") return;
    if (node.order === next) {
      const nextIndex = next + 1;
      setNext(nextIndex);
      if (nextIndex >= nodes.length) {
        setPhase("done");
        // Score: lower total time (with a mistake penalty baked in) is better, so store as
        // "time" with higherIsBetter=false.
        const totalSeconds = Math.round((Date.now() - startRef.current) / 1000) + mistakes * 2;
        const best = updateGameBest("trail", totalSeconds, false);
        setIsNewBest(best);
        onWin(best);
      }
    } else {
      setMistakes((m) => m + 1);
    }
  }

  const pathD = useMemo(() => {
    if (next < 2) return "";
    const pts = nodes.slice(0, next).sort((a, b) => a.order - b.order);
    return pts.map((n, i) => `${i === 0 ? "M" : "L"} ${n.x} ${n.y}`).join(" ");
  }, [nodes, next]);

  const seconds = (elapsedMs / 1000).toFixed(1);

  return (
    <div style={{ textAlign: "center" }}>
      {phase === "playing" && (
        <p className="text-text-soft" style={{ marginBottom: 10, fontSize: 13.5 }}>
          Tap 1, A, 2, B, 3, C... in order, alternating number and letter, as fast as you can.
        </p>
      )}
      <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 12, fontSize: 13, color: "var(--text-soft)" }}>
        <span>Time: <strong style={{ color: "var(--text)" }}>{seconds}s</strong></span>
        <span>Mistakes: <strong style={{ color: "var(--text)" }}>{mistakes}</strong></span>
      </div>

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 460,
          aspectRatio: "1",
          margin: "0 auto",
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: 14,
        }}
      >
        <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          {pathD && <path d={pathD} stroke="var(--blue-deep)" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.6} />}
        </svg>
        {nodes.map((n) => {
          const done = n.order < next;
          const isNext = n.order === next && phase === "playing";
          return (
            <button
              key={n.id}
              onClick={() => handleTap(n)}
              disabled={phase !== "playing"}
              aria-label={`Node ${n.id}`}
              style={{
                position: "absolute",
                left: `${n.x}%`,
                top: `${n.y}%`,
                transform: "translate(-50%, -50%)",
                width: 34,
                height: 34,
                borderRadius: "50%",
                border: isNext ? "2px solid var(--blue-deep)" : "1px solid var(--border)",
                background: done ? "var(--blue-deep)" : "var(--card)",
                color: done ? "var(--bg)" : "var(--text)",
                fontWeight: 700,
                fontSize: 13,
                cursor: phase === "playing" ? "pointer" : "default",
                boxShadow: isNext ? "0 0 0 4px rgba(0,0,0,0.06)" : "none",
              }}
            >
              {n.id}
            </button>
          );
        })}
      </div>

      {phase === "done" && (
        <div style={{ marginTop: 20 }}>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>Done in {seconds}s{mistakes > 0 ? ` (${mistakes} mistake${mistakes === 1 ? "" : "s"})` : ""}! 🎉</p>
          {isNewBest && <p style={{ fontSize: 13, color: "var(--text-soft)", marginBottom: 10 }}>New personal best.</p>}
          <button className="btn btn-secondary" onClick={reset} style={{ marginTop: 10 }}>
            Play again
          </button>
        </div>
      )}
    </div>
  );
}
