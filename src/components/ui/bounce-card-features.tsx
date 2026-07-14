"use client";
import * as React from "react";
import { motion } from "framer-motion";
import { Mic, PenLine, Gamepad2, LineChart, type LucideIcon } from "lucide-react";

interface FeatureCard {
  title: string;
  description: string;
  icon: LucideIcon;
  background: string;
}

const DEFAULT_FEATURES: FeatureCard[] = [
  {
    title: "Speech analysis",
    description: "Pacing, pauses, and voice steadiness from a short reading sample.",
    icon: Mic,
    background: "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)",
  },
  {
    title: "Handwriting analysis",
    description: "Stroke steadiness, spacing, and letter-size consistency, verified for real content.",
    icon: PenLine,
    background: "linear-gradient(135deg, #2f6fed 0%, #1a3f8f 100%)",
  },
  {
    title: "Brain-training games",
    description: "Nine games with levels, difficulty tiers, and personal bests.",
    icon: Gamepad2,
    background: "linear-gradient(135deg, #3b8a4e 0%, #1f4d2b 100%)",
  },
  {
    title: "Progress dashboard",
    description: "Trends, streaks, and achievements - all stored privately on your device.",
    icon: LineChart,
    background: "linear-gradient(135deg, #7a3bb2 0%, #3f1d5c 100%)",
  },
];

/** A row of cards that bounce upward on hover, each revealing its description. */
export function BouncyCardsFeatures({ features = DEFAULT_FEATURES }: { features?: FeatureCard[] }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5" style={{ maxWidth: 1040, margin: "0 auto" }}>
      {features.map((f, i) => {
        const Icon = f.icon;
        return (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            whileHover={{ y: -10, scale: 1.02 }}
            style={{
              cursor: "pointer",
              borderRadius: 18,
              padding: 24,
              minHeight: 220,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              background: f.background,
              color: "#fff",
              boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.55, opacity: 0.85 }}>{f.description}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
