"use client";
import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface DockItem {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  active?: boolean;
}

interface DockProps {
  items: DockItem[];
  className?: string;
}

// How much each item scales based on how far it is (in items) from the hovered one -
// mimics the macOS dock's magnification falloff: the hovered icon is biggest, its
// immediate neighbors are a little bigger, and it fades back to normal size from there.
function scaleFor(distance: number) {
  if (distance === 0) return 1.55;
  if (distance === 1) return 1.22;
  if (distance === 2) return 1.06;
  return 1;
}

export default function Dock({ items, className }: DockProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div
      className={cn("flex items-end gap-1 rounded-2xl border border-border bg-card px-2 py-1.5 shadow-lg", className)}
      onMouseLeave={() => setHovered(null)}
    >
      {items.map((item, i) => {
        const Icon = item.icon;
        const isOn = hovered === i || item.active;
        const scale = hovered === null ? 1 : scaleFor(Math.abs(i - hovered));
        return (
          <motion.button
            key={item.label}
            onClick={item.onClick}
            onMouseEnter={() => setHovered(i)}
            aria-label={item.label}
            className="relative flex flex-col items-center justify-center rounded-lg"
            style={{ width: 46, height: 44, background: "transparent", cursor: "pointer", transformOrigin: "bottom center" }}
            animate={{ scale, y: hovered === i ? -6 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 26 }}
          >
            <Icon size={18} color={isOn ? "var(--blue-deep)" : "var(--text-soft)"} />
            <span style={{ fontSize: 9.5, marginTop: 2, color: isOn ? "var(--blue-deep)" : "var(--text-soft)", fontWeight: 600 }}>
              {item.label}
            </span>
            <motion.span
              animate={{ width: isOn ? 20 : 0, opacity: isOn ? 1 : 0 }}
              transition={{ duration: 0.18 }}
              style={{
                position: "absolute",
                bottom: -2,
                height: 2,
                borderRadius: 999,
                background: "var(--blue-deep)",
              }}
            />
          </motion.button>
        );
      })}
    </div>
  );
}
