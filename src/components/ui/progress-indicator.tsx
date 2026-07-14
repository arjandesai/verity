"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  steps?: string[];
  activeStep?: number;
  autoPlay?: boolean;
  intervalMs?: number;
  className?: string;
}

const DEFAULT_STEPS = ["Speech", "Handwriting", "Games", "Results"];

export default function ProgressIndicator({
  steps = DEFAULT_STEPS,
  activeStep,
  autoPlay = true,
  intervalMs = 1600,
  className,
}: ProgressIndicatorProps) {
  const [internalStep, setInternalStep] = useState(0);
  const step = activeStep ?? internalStep;

  useEffect(() => {
    if (activeStep !== undefined || !autoPlay) return;
    const id = setInterval(() => {
      setInternalStep((s) => (s + 1) % steps.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [activeStep, autoPlay, intervalMs, steps.length]);

  return (
    <div className={cn("flex items-center justify-center gap-3", className)}>
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-3">
          <div className="flex flex-col items-center gap-1.5">
            <motion.div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
              animate={{
                backgroundColor: i <= step ? "var(--blue-deep)" : "var(--bg)",
                color: i <= step ? "var(--bg)" : "var(--text-soft)",
                borderColor: i <= step ? "var(--blue-deep)" : "var(--border)",
                scale: i === step ? 1.12 : 1,
              }}
              style={{ border: "1px solid var(--border)" }}
              transition={{ duration: 0.3 }}
            >
              {i + 1}
            </motion.div>
            <span className="text-[11px] text-text-soft">{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className="h-[2px] w-8 overflow-hidden rounded-full bg-border" style={{ marginBottom: 16 }}>
              <motion.div
                className="h-full bg-blue-deep"
                animate={{ width: i < step ? "100%" : "0%" }}
                transition={{ duration: 0.35 }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
