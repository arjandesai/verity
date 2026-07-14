import * as React from "react";
import { useEffect, useState } from "react";

interface Piece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  rotate: number;
}

const COLORS = ["#111111", "#3a3a3a", "#6b6b6b", "#9a9a9a", "#cfcfcf"];

export function Confetti({ pieceCount = 60 }: { pieceCount?: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    const arr: Piece[] = Array.from({ length: pieceCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 2.2 + Math.random() * 1.6,
      color: COLORS[i % COLORS.length],
      rotate: Math.random() * 360,
    }));
    setPieces(arr);
    const timeout = setTimeout(() => setPieces([]), 4200);
    return () => clearTimeout(timeout);
  }, [pieceCount]);

  if (!pieces.length) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            top: "-10px",
            left: `${p.left}%`,
            width: 8,
            height: 8,
            background: p.color,
            borderRadius: 2,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}
