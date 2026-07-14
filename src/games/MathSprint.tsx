import * as React from "react";
import { useEffect, useState } from "react";
import { shuffle, updateGameBest } from "@/lib/verity";
import type { Difficulty } from "@/components/LevelBar";

const ROUNDS = 6;

interface Problem {
  question: string;
  answer: number;
}

function makeProblem(difficulty: Difficulty): Problem {
  const ranges: Record<Difficulty, number> = { Easy: 10, Medium: 25, Hard: 50, Extreme: 100 };
  const max = ranges[difficulty];
  const a = 1 + Math.floor(Math.random() * max);
  const b = 1 + Math.floor(Math.random() * max);
  const useMultiply = (difficulty === "Hard" || difficulty === "Extreme") && Math.random() < 0.35;
  if (useMultiply) {
    const smallA = 2 + Math.floor(Math.random() * 11);
    const smallB = 2 + Math.floor(Math.random() * 11);
    return { question: `${smallA} × ${smallB}`, answer: smallA * smallB };
  }
  const subtract = Math.random() < 0.5;
  if (subtract) {
    const hi = Math.max(a, b);
    const lo = Math.min(a, b);
    return { question: `${hi} − ${lo}`, answer: hi - lo };
  }
  return { question: `${a} + ${b}`, answer: a + b };
}

function makeChoices(answer: number): number[] {
  const set = new Set<number>([answer]);
  while (set.size < 4) {
    const delta = Math.floor(Math.random() * 9) - 4;
    const candidate = answer + delta;
    if (candidate !== answer && candidate >= 0) set.add(candidate);
  }
  return shuffle(Array.from(set));
}

export function MathSprint({ difficulty, onWin }: { difficulty: Difficulty; onWin: (isNewBest?: boolean) => void }) {
  const [round, setRound] = useState(0);
  const [problem, setProblem] = useState<Problem>(() => makeProblem(difficulty));
  const [choices, setChoices] = useState<number[]>(() => makeChoices(problem.answer));
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  function nextProblem() {
    const p = makeProblem(difficulty);
    setProblem(p);
    setChoices(makeChoices(p.answer));
    setSelected(null);
  }

  function reset() {
    setRound(0);
    setScore(0);
    setDone(false);
    setIsNewBest(false);
    nextProblem();
  }

  function handleChoice(value: number) {
    if (selected !== null) return;
    setSelected(value);
    const correct = value === problem.answer;
    setTimeout(() => {
      if (round + 1 >= ROUNDS) {
        const finalScore = score + (correct ? 1 : 0);
        setDone(true);
        const best = updateGameBest("math", finalScore, true);
        setIsNewBest(best);
        if (finalScore >= Math.ceil(ROUNDS * 0.6)) onWin(best);
      } else {
        if (correct) setScore((s) => s + 1);
        setRound((r) => r + 1);
        nextProblem();
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
      <h3 style={{ fontSize: 32, fontWeight: 800, marginBottom: 22 }}>{problem.question}</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
        {choices.map((c) => {
          const isCorrect = c === problem.answer;
          const showState = selected !== null;
          return (
            <button
              key={c}
              className={`word-chip ${showState && isCorrect ? "hit" : ""} ${showState && selected === c && !isCorrect ? "miss" : ""}`}
              style={{ cursor: selected !== null ? "default" : "pointer", fontSize: 16, minWidth: 60 }}
              onClick={() => handleChoice(c)}
            >
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}
