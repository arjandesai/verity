import * as React from "react";
import { useMemo } from "react";

const DAY_MS = 86400000;
const WEEKS = 14;

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** A GitHub-style contribution calendar showing which days had any activity (a test, a journal
 *  entry, or a game played) over the last ~14 weeks - a quick visual of consistency, which
 *  matters more for this kind of tool than any single day's result. */
export function ActivityHeatmap({ timestamps }: { timestamps: number[] }) {
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    timestamps.forEach((t) => {
      const key = dateKey(new Date(t));
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [timestamps]);

  const { cols, monthLabels } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Align the grid so the last column ends on today, and the first row of each column is Sunday.
    const endDow = today.getDay();
    const totalDays = WEEKS * 7;
    const start = new Date(today.getTime() - (totalDays - 1 - endDow) * DAY_MS - endDow * DAY_MS);
    const days: Date[] = [];
    for (let i = 0; i < totalDays; i++) days.push(new Date(start.getTime() + i * DAY_MS));

    const columns: Date[][] = [];
    for (let w = 0; w < WEEKS; w++) columns.push(days.slice(w * 7, w * 7 + 7));

    const labels: { col: number; label: string }[] = [];
    let lastMonth = -1;
    columns.forEach((col, i) => {
      const m = col[0].getMonth();
      if (m !== lastMonth) {
        labels.push({ col: i, label: col[0].toLocaleDateString(undefined, { month: "short" }) });
        lastMonth = m;
      }
    });
    return { cols: columns, monthLabels: labels };
  }, []);

  function colorFor(count: number): string {
    if (count === 0) return "var(--bg)";
    if (count === 1) return "color-mix(in srgb, var(--blue-deep) 35%, var(--bg))";
    if (count === 2) return "color-mix(in srgb, var(--blue-deep) 65%, var(--bg))";
    return "var(--blue-deep)";
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "flex", gap: 3, marginBottom: 4, marginLeft: 2, minWidth: WEEKS * 14 }}>
        {monthLabels.map((m) => (
          <span
            key={`${m.col}-${m.label}`}
            style={{ position: "relative", left: m.col * 14, fontSize: 10, color: "var(--text-soft)", whiteSpace: "nowrap" }}
          >
            {m.label}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 3 }}>
        {cols.map((col, ci) => (
          <div key={ci} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {col.map((day, di) => {
              const key = dateKey(day);
              const count = counts.get(key) || 0;
              const isFuture = day.getTime() > Date.now();
              return (
                <div
                  key={di}
                  title={`${day.toLocaleDateString(undefined, { month: "short", day: "numeric" })}: ${count} ${count === 1 ? "activity" : "activities"}`}
                  style={{
                    width: 11,
                    height: 11,
                    borderRadius: 2.5,
                    background: isFuture ? "transparent" : colorFor(count),
                    border: isFuture ? "1px dashed var(--border)" : "1px solid var(--border)",
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 8, fontSize: 11, color: "var(--text-soft)" }}>
        Less
        {[0, 1, 2, 3].map((n) => (
          <div key={n} style={{ width: 11, height: 11, borderRadius: 2.5, background: colorFor(n), border: "1px solid var(--border)" }} />
        ))}
        More
      </div>
    </div>
  );
}
