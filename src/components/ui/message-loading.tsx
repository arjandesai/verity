"use client";
import * as React from "react";
import { motion } from "framer-motion";

/** Three bouncing dots - shown while Mango is "typing" a reply. */
export function MessageLoading() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
          style={{ width: 6, height: 6, borderRadius: 999, background: "var(--text-soft)", display: "inline-block" }}
        />
      ))}
    </div>
  );
}
