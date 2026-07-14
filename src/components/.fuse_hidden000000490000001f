import * as React from "react";
import { useEffect, useState } from "react";
import { getGameBests } from "@/lib/verity";

interface GameDef {
  key: string;
  label: string;
  unit: string;
  higherIsBetter: boolean;
  format: (v: number) => string;
}

const GAME_DEFS: GameDef[] = [
  { key: "memory", label: "Memory Match", unit: "seconds", higherIsBetter: false, format: (v) => `${v}s` },
  { key: "sequence", label: "Sequence Recall", unit: "length", higherIsBetter: true, format: (v) => `${v} steps` },
  { key: "word", label: "Word Association", unit: "score", higherIsBetter: true, format: (v) => `${v}/5` },
  { key: "reaction", label: "Reaction Time", unit: "ms", higherIsBetter: false, format: (v) => `${v}ms` },
  { key: "number", label: "Number Recall", unit: "digits", higherIsBetter: true, format: (v) => `${v} digits` },
  { key: "math", label: "Math Sprint", unit: "score", higherIsBetter: true, format: (v) => `${v}/6` },
  { key: "stroop", label: "Color Match", unit: "score", higherIsBetter: true, format: (v) => `${v}/6` },
  { key: "oddoneout", label: "Odd One Out", unit: "score", higherIsBetter: true, format: (v) => `${v}/5` },
  { key: "category", label: "Category Sort", unit: "score", higherIsBetter: true, format: (v) => `${v}/6` },
];

// Sample scores shown alongside your own, so there's something to compare against even on a
// fresh device. There's no backend behind this app, so these are illustrative rather than real
// scores from other people - see the note below the table.
const SAMPLE_SCORES: Record<string, number> = {
  memory: 22,
  sequence: 9,
  word: 4,
  reaction: 310,
  number: 6,
  math: 5,
  stroop: 5,
  oddoneout: 4,
  category: 5,
};

export function Leaderboard() {
  const [bests, setBests] = useState<Record<string, number>>({});

  useEffect(() => {
    setBests(getGameBests());
  }, []);

  return (
    <div className="card" style={{ padding: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Top scores</h3>
      <p className="text-text-soft" style={{ fontSize: 12.5, marginBottom: 16 }}>
        Your personal bests on this device, compared to a sample score for context.
      </p>
      <div className="flex flex-col gap-2">
        {GAME_DEFS.map((g) => {
          const mine = bests[g.key];
          const sample = SAMPLE_SCORES[g.key];
          const winning = mine !== undefined && (g.higherIsBetter ? mine >= sample : mine <= sample);
          return (
            <div
              key={g.key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 4px",
                borderBottom: "1px solid var(--border)",
                fontSize: 13.5,
              }}
            >
              <span>{g.label}</span>
              <span style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <span className="text-text-soft" style={{ fontSize: 12 }}>
                  Sample: {g.format(sample)}
                </span>
                <span style={{ fontWeight: 700, color: winning ? "var(--text)" : "var(--text-soft)" }}>
                  {mine !== undefined ? `You: ${g.format(mine)}` : "Not played yet"}
                </span>
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-text-soft" style={{ fontSize: 11.5, marginTop: 14, lineHeight: 1.5 }}>
        Verity doesn't have a server, so scores stay on your own device - this compares you to a sample
        score rather than real scores from other people.
      </p>
    </div>
  );
}
