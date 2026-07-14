import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { updateGameBest } from "@/lib/verity";
import type { Difficulty } from "@/components/LevelBar";

const COLORS = ["#111111", "#3a3a3a", "#6b6b6b", "#9a9a9a"];
const TARGET_LENGTH: Record<Difficulty, number> = { Easy: 4, Medium: 6, Hard: 8, Extreme: 12 };
const SPEED_MS: Record<Difficulty, number> = { Easy: 700, Medium: 550, Hard: 420, Extreme: 300 };

export function SequenceRecall({ difficulty, onWin }: { difficulty: Difficulty; onWin: (isNewBest?: boolean) => void }) {
  const target = TARGET_LENGTH[difficulty];
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [lit, setLit] = useState<number | null>(null);
  const [phase, setPhase] = useState<"idle" | "showing" | "input" | "won" | "lost">("idle");
  const [isNewBest, setIsNewBest] = useState(false);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    reset();
    return () => timeoutsRef.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  function reset() {
    timeoutsRef.current.forEach(clearTimeout);
    setSequence([]);
    setUserInput([]);
    setPhase("idle");
  }

  function start() {
    const seq = Array.from({ length: target }, () => Math.floor(Math.random() * 4));
    setSequence(seq);
    setUserInput([]);
    playSequence(seq);
  }

  function playSequence(seq: number[]) {
    setPhase("showing");
    seq.forEach((val, i) => {
      const t1 = window.setTimeout(() => setLit(val), i * (SPEED_MS[difficulty] + 200));
      const t2 = window.setTimeout(() => setLit(null), i * (SPEED_MS[difficulty] + 200) + SPEED_MS[difficulty]);
      timeoutsRef.current.push(t1, t2);
    });
    const done = window.setTimeout(() => setPhase("input"), seq.length * (SPEED_MS[difficulty] + 200));
    timeoutsRef.current.push(done);
  }

  function handlePress(i: number) {
    if (phase !== "input") return;
    const next = [...userInput, i];
    setUserInput(next);
    const idx = next.length - 1;
    if (sequence[idx] !== i) {
      setPhase("lost");
      return;
    }
    if (next.length === sequence.length) {
      setPhase("won");
      const best = updateGameBest("sequence", sequence.length, true);
      setIsNewBest(best);
      onWin(best);
    }
  }

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 260, margin: "0 auto 22px" }}>
        {COLORS.map((c, i) => (
          <button
            key={i}
            className={`seq-btn ${lit === i ? "lit" : ""}`}
            style={{ background: c, border: "none", height: 100 }}
            onClick={() => handlePress(i)}
            disabled={phase !== "input"}
          />
        ))}
      </div>

      {phase === "idle" && (
        <button className="btn btn-primary" onClick={start}>
          Start
        </button>
      )}
      {phase === "showing" && <p className="text-text-soft">Watch closely…</p>}
      {phase === "input" && (
        <p className="text-text-soft">
          Your turn - {userInput.length}/{sequence.length}
        </p>
      )}
      {phase === "won" && (
        <div>
          <p style={{ fontWeight: 700, marginBottom: 10 }}>Perfect recall! 🎉 {isNewBest && "New personal best!"}</p>
          <button className="btn btn-primary" onClick={reset}>
            Play again
          </button>
        </div>
      )}
      {phase === "lost" && (
        <div>
          <p style={{ fontWeight: 700, marginBottom: 10 }}>Not quite - try again.</p>
          <button className="btn btn-primary" onClick={reset}>
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
