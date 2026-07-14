"use client";
import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Tab {
  label: string;
  videoSrc?: string;
  posterGradient?: string;
  caption?: string;
  preview: "speech" | "handwriting" | "games";
}

interface ClippedVideoTabProps {
  tabs?: Tab[];
  className?: string;
}

const DEFAULT_TABS: Tab[] = [
  {
    label: "Speech test",
    posterGradient: "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)",
    caption: "Read a short passage aloud - Verity listens for pacing and pauses.",
    preview: "speech",
  },
  {
    label: "Handwriting test",
    posterGradient: "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
    caption: "Write on screen or upload a photo of handwriting.",
    preview: "handwriting",
  },
  {
    label: "Games",
    posterGradient: "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)",
    caption: "Brain-training games with levels and difficulty tiers.",
    preview: "games",
  },
];

const WAVE_HEIGHTS = [22, 40, 60, 34, 50, 70, 28, 44, 62, 36, 48, 58, 24, 42, 66, 30, 46, 56, 26, 38];

function SpeechPreview() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6" style={{ color: "#fff" }}>
      <p style={{ fontSize: 14, opacity: 0.7 }}>"The early bird catches the worm."</p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80 }}>
        {WAVE_HEIGHTS.map((h, i) => (
          <span key={i} style={{ width: 5, height: h, borderRadius: 999, background: "#2f6fed" }} />
        ))}
      </div>
      <div style={{ width: 44, height: 44, borderRadius: 999, background: "#b23b3b", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ width: 12, height: 12, borderRadius: 999, background: "#fff" }} />
      </div>
    </div>
  );
}

function HandwritingPreview() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
      <p style={{ fontSize: 13, color: "#555" }}>Write: "The early bird catches the worm."</p>
      <svg width="260" height="70" viewBox="0 0 260 70">
        <path
          d="M5 40 C 20 20, 35 60, 50 40 C 65 20, 80 60, 95 40 C 110 20, 125 60, 140 40 C 155 20, 170 60, 185 40 C 200 20, 215 60, 230 40 C 240 30, 250 45, 255 38"
          fill="none"
          stroke="#111"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <p style={{ fontSize: 11.5, color: "#777" }}>Legibility 91 · Steadiness 88 · Spacing 94</p>
    </div>
  );
}

function GamesPreview() {
  const cards = [
    { label: "Memory Match", tag: "MM" },
    { label: "Sequence Recall", tag: "SR" },
    { label: "Math Sprint", tag: "MS" },
  ];
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-3 px-6">
      {cards.map((c) => (
        <div
          key={c.label}
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: 14, width: 110 }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background: "#2f6fed",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 10,
            }}
          >
            {c.tag}
          </div>
          <div style={{ color: "#fff", fontSize: 12.5, fontWeight: 600 }}>{c.label}</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10.5, marginTop: 2 }}>Lv. 3 · Hard</div>
        </div>
      ))}
    </div>
  );
}

const clipShapes = [
  "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
  "polygon(2% 0%, 100% 2%, 98% 100%, 0% 98%)",
  "polygon(0% 2%, 98% 0%, 100% 98%, 2% 100%)",
];

export default function Component({ tabs = DEFAULT_TABS, className }: ClippedVideoTabProps) {
  const [active, setActive] = useState(0);
  const tab = tabs[active];

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <div className="flex items-center justify-center gap-2 mb-5 flex-wrap">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setActive(i)}
            className={cn("diff-btn", active === i && "active")}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="relative rounded-verity overflow-hidden border border-border" style={{ aspectRatio: "16/10" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, clipPath: clipShapes[1] }}
            animate={{ opacity: 1, clipPath: clipShapes[0] }}
            exit={{ opacity: 0, clipPath: clipShapes[2] }}
            transition={{ duration: 0.55, ease: "easeInOut" }}
            className="absolute inset-0 flex items-end p-6"
            style={{ background: tab.posterGradient }}
          >
            {tab.videoSrc ? (
              <video
                src={tab.videoSrc}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <>
                {tab.preview === "speech" && <SpeechPreview />}
                {tab.preview === "handwriting" && <HandwritingPreview />}
                {tab.preview === "games" && <GamesPreview />}
              </>
            )}
            <div className="relative z-10 card" style={{ padding: "12px 16px", maxWidth: 320 }}>
              <p style={{ fontSize: 13.5, lineHeight: 1.5 }}>{tab.caption}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
