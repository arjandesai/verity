import * as React from "react";

interface LogoMarkProps {
  size?: number;
}

/** Verity's mark - a minimal pulse/waveform inside a rounded square, evoking a health signal. */
export function LogoMark({ size = 30 }: LogoMarkProps) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: "var(--blue-deep)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.62}
        height={size * 0.62}
        fill="none"
        stroke="var(--bg)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 13h3.2l1.8-4 3 8 2.6-11 2.4 7h6" />
      </svg>
    </span>
  );
}
