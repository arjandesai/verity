"use client";
import * as React from "react";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ImageComparisonProps {
  beforeImage: string;
  afterImage: string;
  altBefore?: string;
  altAfter?: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

/** A drag-to-reveal before/after image comparison slider. */
export function ImageComparison({
  beforeImage,
  afterImage,
  altBefore = "Before",
  altAfter = "After",
  beforeLabel = "Before",
  afterLabel = "After",
  className,
}: ImageComparisonProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState(50); // percent
  const dragging = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, pct)));
  }, []);

  function handlePointerDown(e: React.PointerEvent) {
    dragging.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    updateFromClientX(e.clientX);
  }
  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    updateFromClientX(e.clientX);
  }
  function handlePointerUp() {
    dragging.current = false;
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full max-w-2xl select-none rounded-2xl overflow-hidden border border-border", className)}
      style={{ aspectRatio: "3 / 2", touchAction: "none", cursor: "ew-resize" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <img src={afterImage} alt={altAfter} className="absolute inset-0 w-full h-full object-cover pointer-events-none" draggable={false} />
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ width: `${pos}%` }}>
        <img
          src={beforeImage}
          alt={altBefore}
          className="absolute inset-0 h-full object-cover pointer-events-none"
          style={{ width: containerRef.current ? containerRef.current.getBoundingClientRect().width : "100%" }}
          draggable={false}
        />
      </div>

      <div
        className="absolute inset-y-0 pointer-events-none"
        style={{ left: `calc(${pos}% - 1px)`, width: 2, background: "rgba(255,255,255,0.9)", boxShadow: "0 0 0 1px rgba(0,0,0,0.2)" }}
      />
      <div
        className="absolute pointer-events-none flex items-center justify-center rounded-full"
        style={{
          left: `calc(${pos}% - 18px)`,
          top: "calc(50% - 18px)",
          width: 36,
          height: 36,
          background: "#fff",
          boxShadow: "0 2px 10px rgba(0,0,0,0.35)",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />
        </svg>
      </div>

      <div className="absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}>
        {beforeLabel}
      </div>
      <div className="absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}>
        {afterLabel}
      </div>
    </div>
  );
}
