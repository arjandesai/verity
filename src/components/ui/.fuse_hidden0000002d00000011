"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface AnimatedMarqueeHeroProps {
  tagline?: string;
  title: React.ReactNode;
  description?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  images: string[];
  className?: string;
}

/** A hero section with a centered headline/CTA over a backdrop of several vertically
 *  auto-scrolling image columns (alternating direction), fading toward the edges. */
export function AnimatedMarqueeHero({ tagline, title, description, ctaText, onCtaClick, images, className }: AnimatedMarqueeHeroProps) {
  const columns = React.useMemo(() => {
    const cols = 5;
    const perCol = Math.max(3, Math.ceil((images.length * 2) / cols));
    return Array.from({ length: cols }, (_, c) =>
      Array.from({ length: perCol }, (_, i) => images[(c * perCol + i) % images.length])
    );
  }, [images]);

  return (
    <div className={cn("relative w-full overflow-hidden", className)} style={{ minHeight: 560, background: "var(--bg)" }}>
      <div className="absolute inset-0 flex gap-3 px-3" style={{ opacity: 0.5 }}>
        {columns.map((col, ci) => (
          <div key={ci} className="flex-1 overflow-hidden" style={{ position: "relative" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                animation: `verity-marquee-${ci % 2 === 0 ? "up" : "down"} ${18 + ci * 3}s linear infinite`,
              }}
            >
              {[...col, ...col].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  loading="lazy"
                  style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 14, flexShrink: 0 }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, var(--bg) 0%, color-mix(in srgb, var(--bg) 85%, transparent) 45%, transparent 75%)",
        }}
      />

      <div className="relative container flex flex-col items-center text-center" style={{ paddingTop: 110, paddingBottom: 110 }}>
        {tagline && (
          <div
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: "var(--text-soft)", marginBottom: 16, padding: "6px 14px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--card)" }}
          >
            {tagline}
          </div>
        )}
        <h1 className="font-extrabold" style={{ fontSize: "clamp(32px, 5vw, 56px)", lineHeight: 1.1, maxWidth: 720 }}>
          {title}
        </h1>
        {description && (
          <p className="text-text-soft" style={{ fontSize: 16, maxWidth: 520, marginTop: 20 }}>
            {description}
          </p>
        )}
        {ctaText && (
          <button className="btn btn-primary" style={{ marginTop: 28 }} onClick={onCtaClick}>
            {ctaText}
          </button>
        )}
      </div>

      <style>{`
        @keyframes verity-marquee-up {
          from { transform: translateY(0); }
          to { transform: translateY(-50%); }
        }
        @keyframes verity-marquee-down {
          from { transform: translateY(-50%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
