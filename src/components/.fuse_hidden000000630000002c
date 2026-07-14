import * as React from "react";

interface Point {
  label: string;
  value: number; // 0-100, lower is better (fewer signs)
}

interface ScoreTrendChartProps {
  points: Point[];
  height?: number;
}

/** A simple monochrome line chart showing score-over-time, lower values shown as improvement. */
export function ScoreTrendChart({ points, height = 140 }: ScoreTrendChartProps) {
  if (points.length < 2) {
    return (
      <p className="text-text-soft" style={{ fontSize: 13.5, padding: "20px 0", textAlign: "center" }}>
        Take at least two tests to see your trend chart here.
      </p>
    );
  }

  const width = 100; // percentage-based viewBox, scales with container
  const padding = 6;
  const maxVal = 100;
  const stepX = (width - padding * 2) / (points.length - 1);

  const coords = points.map((p, i) => ({
    x: padding + i * stepX,
    y: padding + (1 - p.value / maxVal) * (height - padding * 2),
  }));

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${height - padding} L ${coords[0].x} ${height - padding} Z`;

  const first = points[0].value;
  const last = points[points.length - 1].value;
  const improved = last < first;
  const deltaPct = Math.abs(Math.round(first - last));

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none">
        <path d={areaPath} fill="var(--blue)" opacity={0.6} />
        <path d={linePath} fill="none" stroke="var(--blue-deep)" strokeWidth={1.6} vectorEffect="non-scaling-stroke" />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={1.4} fill="var(--blue-deep)" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="flex items-center justify-between" style={{ marginTop: 6 }}>
        <span className="text-text-soft" style={{ fontSize: 12 }}>
          {points[0].label}
        </span>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text)" }}>
          {deltaPct === 0 ? "Steady" : improved ? `↓ ${deltaPct}% (improving)` : `↑ ${deltaPct}%`}
        </span>
        <span className="text-text-soft" style={{ fontSize: 12 }}>
          {points[points.length - 1].label}
        </span>
      </div>
    </div>
  );
}
