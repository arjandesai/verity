import * as React from "react";
import { useEffect, useState } from "react";

interface TypewriterTextProps {
  text: string;
  speedMs?: number;
  className?: string;
  cursor?: boolean;
}

export function TypewriterText({ text, speedMs = 32, className, cursor = true }: TypewriterTextProps) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    setShown("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speedMs);
    return () => clearInterval(id);
  }, [text, speedMs]);

  return (
    <span className={className}>
      {shown}
      {cursor && shown.length < text.length && <span className="animate-pulse">|</span>}
    </span>
  );
}

interface FlipWordProps {
  words: string[];
  intervalMs?: number;
  className?: string;
}

export function FlipWord({ words, intervalMs = 2200, className }: FlipWordProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), intervalMs);
    return () => clearInterval(id);
  }, [words, intervalMs]);

  return <span className={className}>{words[index]}</span>;
}
