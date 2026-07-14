import * as React from "react";
import { levelFromXP } from "@/lib/verity";

export function LevelBar({ xp }: { xp: number }) {
  const { level, into, need } = levelFromXP(xp);
  const pct = Math.min(100, Math.round((into / need) * 100));
  return (
    <div className="level-card">
      <div className="level-badge">Lv {level}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: "var(--text-soft)", marginBottom: 6 }}>
          {into} / {need} XP to level {level + 1}
        </div>
        <div className="level-bar">
          <div className="level-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

const DIFFICULTIES = ["Easy", "Medium", "Hard", "Extreme"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export function DifficultySelector({
  value,
  onChange,
}: {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", margin: "14px 0" }}>
      {DIFFICULTIES.map((d) => (
        <button key={d} className={`diff-btn ${value === d ? "active" : ""}`} onClick={() => onChange(d)}>
          {d}
        </button>
      ))}
    </div>
  );
}

export const DIFF_XP_MULT: Record<Difficulty, number> = {
  Easy: 1,
  Medium: 1.5,
  Hard: 2,
  Extreme: 3,
};
