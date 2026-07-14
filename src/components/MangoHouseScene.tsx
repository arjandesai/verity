import * as React from "react";

interface MangoHouseSceneProps {
  houseId?: string;
  size?: number;
  children: React.ReactNode;
}

/** Draws a little house scene behind whatever's passed as children (Mango himself), sized so
 *  he appears to be standing right in the doorway of his house. Each house id gets its own
 *  roof/wall styling. */
export function MangoHouseScene({ houseId, size = 300, children }: MangoHouseSceneProps) {
  if (!houseId) return <>{children}</>;

  const houses: Record<string, { roof: string; wall: string; accent: string; shape: "triangle" | "castle" | "tent" | "tree" }> = {
    "house-cottage": { roof: "#b2493b", wall: "#f3e2c4", accent: "#8a3226", shape: "triangle" },
    "house-castle": { roof: "#5b6b8c", wall: "#c7cdd6", accent: "#3d4a63", shape: "castle" },
    "house-tent": { roof: "#e0a23b", wall: "#f0c46b", accent: "#a8721f", shape: "tent" },
    "house-treehouse": { roof: "#7a5535", wall: "#a9754a", accent: "#5c3d24", shape: "tree" },
  };
  const h = houses[houseId] || houses["house-cottage"];

  return (
    <div style={{ position: "relative", width: size, height: size * 0.95, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <svg width={size} height={size * 0.95} viewBox="0 0 300 285" style={{ position: "absolute", inset: 0 }}>
        {h.shape === "castle" ? (
          <>
            <rect x="30" y="150" width="45" height="110" fill={h.wall} />
            <rect x="225" y="150" width="45" height="110" fill={h.wall} />
            <polygon points="30,150 52.5,110 75,150" fill={h.roof} />
            <polygon points="225,150 247.5,110 270,150" fill={h.roof} />
            <rect x="75" y="120" width="150" height="140" fill={h.wall} />
            <rect x="75" y="110" width="150" height="16" fill={h.accent} />
            <path d="M120 260 L120 190 Q150 165 180 190 L180 260 Z" fill={h.accent} />
          </>
        ) : h.shape === "tent" ? (
          <>
            <polygon points="60,260 150,90 240,260" fill={h.roof} />
            <polygon points="120,260 150,150 180,260" fill="#00000022" />
            <polygon points="130,260 150,180 170,260" fill={h.wall} />
          </>
        ) : h.shape === "tree" ? (
          <>
            <rect x="130" y="180" width="24" height="90" fill="#6b4a2e" />
            <rect x="70" y="140" width="160" height="90" fill={h.wall} rx="4" />
            <polygon points="60,140 150,80 240,140" fill={h.roof} />
            <path d="M120 230 L120 165 Q150 145 180 165 L180 230 Z" fill={h.accent} />
          </>
        ) : (
          <>
            <rect x="75" y="140" width="150" height="120" fill={h.wall} />
            <polygon points="60,140 150,60 240,140" fill={h.roof} />
            <path d="M120 260 L120 185 Q150 162 180 185 L180 260 Z" fill={h.accent} />
            <rect x="90" y="160" width="26" height="26" fill="#cfe6f5" stroke={h.accent} strokeWidth="3" />
            <rect x="184" y="160" width="26" height="26" fill="#cfe6f5" stroke={h.accent} strokeWidth="3" />
          </>
        )}
      </svg>
      <div style={{ position: "relative", zIndex: 2, marginBottom: h.shape === "castle" ? 6 : 2 }}>{children}</div>
    </div>
  );
}
