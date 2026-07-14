"use client";
import * as React from "react";
import { createContext, useContext, useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

interface StackingCardsContextValue {
  scrollYProgress: MotionValue<number>;
  totalCards: number;
  scaleMultiplier: number;
}
const StackingCardsContext = createContext<StackingCardsContextValue | null>(null);

interface StackingCardsProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  totalCards: number;
  scaleMultiplier?: number;
  scrollOptions?: { container?: React.RefObject<HTMLElement> };
}

/** Wraps a set of StackingCardItems and drives their pinned/scaling scroll effect off a shared
 *  scroll progress value, either from the page or from a scrollable container. */
export function StackingCards({ children, className, style, totalCards, scaleMultiplier = 0.05, scrollOptions }: StackingCardsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll(
    scrollOptions?.container ? { container: scrollOptions.container, target: ref, offset: ["start start", "end end"] } : { target: ref, offset: ["start start", "end end"] }
  );

  return (
    <StackingCardsContext.Provider value={{ scrollYProgress, totalCards, scaleMultiplier }}>
      <div ref={ref} className={className} style={{ position: "relative", ...style }}>
        {children}
      </div>
    </StackingCardsContext.Provider>
  );
}

interface StackingCardItemProps {
  children: React.ReactNode;
  index: number;
  topPosition?: string;
}

/** A single card in the stack. Each item gets its own full-height "slot" (a fraction of the
 *  container's total scroll height) - the card inside that slot is sticky, so it pins at
 *  `topPosition` for the whole time its slot is scrolling past, then the next slot's card pins
 *  on top of it. Without a dedicated slot per item, every sticky card pins at the same instant
 *  and they all bunch together instead of stacking one at a time. */
export function StackingCardItem({ children, index, topPosition = "0px" }: StackingCardItemProps) {
  const ctx = useContext(StackingCardsContext);
  if (!ctx) throw new Error("StackingCardItem must be used within StackingCards");
  const { scrollYProgress, totalCards, scaleMultiplier } = ctx;

  const start = index / totalCards;
  const end = (index + 1) / totalCards;
  const scale = useTransform(scrollYProgress, [start, end], [1, 1 - scaleMultiplier * (totalCards - index)]);
  const opacity = useTransform(scrollYProgress, [Math.max(0, start - 0.08), start + 0.08], [index === 0 ? 1 : 0, 1]);

  return (
    <div style={{ height: `${100 / totalCards}%`, position: "relative" }}>
      <motion.div
        style={{
          position: "sticky",
          top: topPosition,
          scale,
          opacity,
          zIndex: index + 1,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
