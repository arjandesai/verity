import * as React from "react";
import { useEffect, useState } from "react";
import { shuffle, updateGameBest } from "@/lib/verity";
import type { Difficulty } from "@/components/LevelBar";

interface Prompt {
  word: string;
  correct: string;
  decoys: string[];
}

const EASY: Prompt[] = [
  { word: "Ocean", correct: "Wave", decoys: ["Pencil", "Guitar", "Ladder"] },
  { word: "Bread", correct: "Toast", decoys: ["Rocket", "Painting", "Violin"] },
  { word: "Winter", correct: "Snow", decoys: ["Sand", "Leaf", "Cactus"] },
];
const MEDIUM: Prompt[] = [
  { word: "Doctor", correct: "Stethoscope", decoys: ["Hammer", "Compass", "Kettle"] },
  { word: "Library", correct: "Silence", decoys: ["Thunder", "Traffic", "Applause"] },
  { word: "Garden", correct: "Bloom", decoys: ["Freeze", "Melt", "Erode"] },
];
const HARD: Prompt[] = [
  { word: "Justice", correct: "Balance", decoys: ["Chaos", "Volume", "Texture"] },
  { word: "Nostalgia", correct: "Memory", decoys: ["Ambition", "Velocity", "Density"] },
  { word: "Ecosystem", correct: "Balance", decoys: ["Isolation", "Currency", "Rhythm"] },
];
const EXTREME: Prompt[] = [
  { word: "Ephemeral", correct: "Fleeting", decoys: ["Permanent", "Heavy", "Loud"] },
  { word: "Serendipity", correct: "Chance", decoys: ["Routine", "Precision", "Debt"] },
  { word: "Paradox", correct: "Contradiction", decoys: ["Harmony", "Sequence", "Volume"] },
];

const BANKS: Record<Difficulty, Prompt[]> = { Easy: EASY, Medium: MEDIUM, Hard: HARD, Extreme: EXTREME };
const ROUNDS = 5;

export function WordAssociation({ difficulty, onWin }: { difficulty: Difficulty; onWin: (isNewBest?: boolean) => void }) {
  const [round, setRound] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [current, setCurrent] = useState<Prompt | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);

  useEffect(() => {
    nextRound(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  function nextRound(r: number) {
    const bank = BANKS[difficulty];
    const p = bank[r % bank.length];
    setCurrent(p);
    setChoices(shuffle([p.correct, ...p.decoys]));
    setSelected(null);
  }

  function handleChoice(choice: string) {
    if (selected || !current) return;
    setSelected(choice);
    const correct = choice === current.correct;
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (round + 1 >= ROUNDS) {
        const finalScore = score + (correct ? 1 : 0);
        setDone(true);
        const best = updateGameBest("word", finalScore, true);
        setIsNewBest(best);
        if (finalScore >= Math.ceil(ROUNDS * 0.6)) onWin(best);
      } else {
        setRound((r) => r + 1);
        nextRound(round + 1);
      }
    }, 650);
  }

  function reset() {
    setRound(0);
    setScore(0);
    setDone(false);
    setIsNewBest(false);
    nextRound(0);
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
  if (!current) return null;

  return (
    <div style={{ textAlign: "center" }}>
      <p className="text-text-soft" style={{ marginBottom: 6 }}>
        Round {round + 1}/{ROUNDS} · Score {score}
      </p>
      <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>{current.word}</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
        {choices.map((c) => {
          const isCorrect = c === current.correct;
          const showState = selected !== null;
          return (
            <span
              key={c}
              className={`word-chip ${showState && isCorrect ? "hit" : ""} ${showState && selected === c && !isCorrect ? "miss" : ""}`}
              style={{ cursor: selected ? "default" : "pointer" }}
              onClick={() => handleChoice(c)}
            >
              {c}
            </span>
          );
        })}
      </div>
    </div>
  );
}
