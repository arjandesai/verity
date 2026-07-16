import * as React from "react";
import { useEffect, useState } from "react";
import { shuffle, updateGameBest } from "@/lib/verity";
import type { Difficulty } from "@/components/LevelBar";

const ROUNDS = 6;
const COLOR_NAMES = ["Red", "Blue", "Green", "Purple", "Orange"];
// Bright, fully-saturated colors so each one reads unmistakably as its own hue at a glance,
// rather than the site's muted/desaturated palette which made them harder to tell apart.
const COLOR_HEX: Record<string, string> = {
  Red: "#ef2b2b",
  Blue: "#1e6bf0",
  Green: "#16a34a",
  Purple: "#9333ea",
  Orange: "#f97316",
};

// Higher difficulty uses more color options and a higher chance the word and ink color disagree
// (the classic Stroop-effect challenge - reading "Blue" printed in red ink, etc.).
const OPTION_COUNT: Record<Difficulty, number> = { Easy: 3, Medium: 4, Hard: 5, Extreme: 5 };
const MISMATCH_CHANCE: Record<Difficulty, number> = { Easy: 0.5, Medium: 0.7, Hard: 0.85, Extreme: 1 };

interface Round {
  word: string;
  inkColor: string;
}

function makeRound(difficulty: Difficulty): Round {
  const pool = COLOR_NAMES.slice(0, OPTION_COUNT[difficulty]);
  const word = pool[Math.floor(Math.random() * pool.length)];
  const mismatch = Math.random() < MISMATCH_CHANCE[difficulty];
  let inkColor = word;
  if (mismatch) {
    const others = pool.filter((c) => c !== word);
    inkColor = others[Math.floor(Math.random() * others.length)];
  }
  return { word, inkColor };
}

export function StroopMatch({ difficulty, onWin }: { difficulty: Difficulty; onWin: (isNewBest?: boolean) => void }) {
  const [round, setRound] = useState(0);
  const [current, setCurrent] = useState<Round>(() => makeRound(difficulty));
  const [choices, setChoices] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  function nextRound() {
    const r = makeRound(difficulty);
    setCurrent(r);
    setChoices(shuffle(COLOR_NAMES.slice(0, OPTION_COUNT[difficulty])));
    setSelected(null);
  }

  function reset() {
    setRound(0);
    setScore(0);
    setDone(false);
    setIsNewBest(false);
    nextRound();
  }

  function handleChoice(color: string) {
    if (selected) return;
    setSelected(color);
    const correct = color === current.inkColor;
    setTimeout(() => {
      if (round + 1 >= ROUNDS) {
        const finalScore = score + (correct ? 1 : 0);
        setDone(true);
        const best = updateGameBest("stroop", finalScore, true);
        setIsNewBest(best);
        if (finalScore >= Math.ceil(ROUNDS * 0.6)) onWin(best);
      } else {
        if (correct) setScore((s) => s + 1);
        setRound((r) => r + 1);
        nextRound();
      }
    }, 550);
  }

  if (done) {
    return (
      <div style={{ textAlign: "center" }}>
        <p style={{ fontWeight: 700, marginBottom: 10 }}>
          You got {score}/{ROUNDS} right{score >= Math.ceil(ROUNDS * 0.6) ? " 🎉" : ""} {isNewBest && "New personal best!"}
        </p>
        <button className="btn btn-primary" onClick={reset}>
          Play again
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center" }}>
      <p className="text-text-soft" style={{ marginBottom: 6 }}>
        Round {round + 1}/{ROUNDS} · Score {score}
      </p>
      <p className="text-text-soft" style={{ marginBottom: 10, fontSize: 13 }}>What color is this word printed in?</p>
      <h3 style={{ fontSize: 40, fontWeight: 800, marginBottom: 22, color: COLOR_HEX[current.inkColor] }}>{current.word}</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
        {choices.map((c) => {
          const isCorrect = c === current.inkColor;
          const showState = selected !== null;
          const wasWrongPick = showState && selected === c && !isCorrect;
          const hex = COLOR_HEX[c];
          return (
            <button
              key={c}
              onClick={() => handleChoice(c)}
              disabled={selected !== null}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px 10px 12px",
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 700,
                cursor: selected !== null ? "default" : "pointer",
                background: hex,
                color: "#fff",
                border: showState && isCorrect ? "3px solid #111" : "3px solid transparent",
                opacity: wasWrongPick ? 0.45 : 1,
                boxShadow: showState && isCorrect ? "0 0 0 3px rgba(0,0,0,0.08)" : "0 2px 6px rgba(0,0,0,0.15)",
                transition: "opacity 0.2s ease, border-color 0.2s ease",
              }}
            >
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: "#fff",
                  opacity: 0.9,
                  flexShrink: 0,
                }}
              />
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}
