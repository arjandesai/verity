"use client";
import * as React from "react";
import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface SpotlightProps {
  className?: string;
  fill?: string;
  size?: number;
}

/** A soft radial glow that follows the pointer within its parent, for dark hero-style panels. */
export function Spotlight({ className, fill = "white", size = 500 }: SpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const x = useSpring(mouseX, { stiffness: 200, damping: 30 });
  const y = useSpring(mouseY, { stiffness: 200, damping: 30 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  React.useEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    parent.style.position = parent.style.position || "relative";
    const move = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    };
    const enter = () => setVisible(true);
    const leave = () => setVisible(false);
    parent.addEventListener("mousemove", move);
    parent.addEventListener("mouseenter", enter);
    parent.addEventListener("mouseleave", leave);
    return () => {
      parent.removeEventListener("mousemove", move);
      parent.removeEventListener("mouseenter", enter);
      parent.removeEventListener("mouseleave", leave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      ref={ref}
      className={cn("pointer-events-none absolute z-0", className)}
      animate={{ opacity: visible ? 0.7 : 0 }}
      transition={{ duration: 0.3 }}
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        translateX: "-50%",
        translateY: "-50%",
        borderRadius: "50%",
        background: `radial-gradient(circle, ${fill} 0%, transparent 70%)`,
        filter: "blur(60px)",
      }}
      onMouseMove={handleMouseMove}
    />
  );
}
