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

export default function Dock({ items, className }: DockProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className={cn("flex items-center gap-1 rounded-2xl border border-border bg-card px-2 py-1.5 shadow-lg", className)}>
      {items.map((item, i) => {
        const Icon = item.icon;
        const isOn = hovered === i || item.active;
        return (
          <button
            key={item.label}
            onClick={item.onClick}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            aria-label={item.label}
            className="relative flex flex-col items-center justify-center rounded-lg"
            style={{ width: 46, height: 44, background: "transparent", cursor: "pointer" }}
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
          </button>
        );
      })}
    </div>
  );
}
