"use client";
import * as React from "react";
import { useRef } from "react";
import { motion, useAnimationFrame, useMotionTemplate, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface MovingBorderProps {
  children: React.ReactNode;
  radius?: number;
  borderWidth?: number;
  gradientWidth?: number;
  duration?: number;
  colors?: string[];
  isCircle?: boolean;
  className?: string;
  containerClassName?: string;
}

export function MovingBorder({
  children,
  radius = 10,
  borderWidth = 2,
  gradientWidth = 60,
  duration = 3,
  colors = ["#111111", "#555555", "#999999"],
  isCircle = false,
  className,
  containerClassName,
}: MovingBorderProps) {
  const pathRef = useRef<SVGRectElement | SVGCircleElement>(null);
  const progress = useMotionValue(0);

  useAnimationFrame((time) => {
    const el = pathRef.current as any;
    if (!el || !el.getTotalLength) return;
    const length = el.getTotalLength();
    if (!length) return;
    const pxPerMs = length / (duration * 1000);
    const val = (time * pxPerMs) % length;
    progress.set(val);
  });

  const x = useTransform(progress, (val) => (pathRef.current as any)?.getPointAtLength?.(val)?.x ?? 0);
  const y = useTransform(progress, (val) => (pathRef.current as any)?.getPointAtLength?.(val)?.y ?? 0);
  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translate(-50%, -50%)`;

  const gradient = `linear-gradient(90deg, ${colors.join(", ")})`;

  return (
    <div
      className={cn(
        "relative inline-block",
        isCircle ? "rounded-full" : "",
        containerClassName
      )}
      style={{ padding: borderWidth }}
    >
      <div
        className={cn("absolute inset-0 overflow-hidden", isCircle ? "rounded-full" : "")}
        style={{ borderRadius: isCircle ? "9999px" : radius }}
      >
        <svg className="absolute h-full w-full" width="100%" height="100%">
          {isCircle ? (
            <circle ref={pathRef as any} cx="50%" cy="50%" r="49%" fill="none" />
          ) : (
            <rect
              ref={pathRef as any}
              fill="none"
              width="100%"
              height="100%"
              rx={radius}
              ry={radius}
            />
          )}
        </svg>
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: gradientWidth,
            height: gradientWidth,
            background: gradient,
            transform,
            filter: "blur(6px)",
          }}
        />
      </div>
      <div className={cn("relative", isCircle ? "rounded-full" : "", className)} style={{ borderRadius: isCircle ? "9999px" : radius }}>
        {children}
      </div>
    </div>
  );
}
