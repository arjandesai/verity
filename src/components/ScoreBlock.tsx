import * as React from "react";
import { useState } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Copy, Check } from "lucide-react";
import { bandClass, bandColor, bandLabel, compareToAgeNorm, type Band } from "@/lib/verity";

interface ScoreBlockProps {
  probability: number;
  band: Band;
  /** When set, shows a "Copy summary" button that copies a plain-text result summary - handy
   *  for pasting into a message to a doctor or family member without screenshotting. */
  modality?: string;
  /** When set (from the user's saved profile), shows a rough age-adjusted comparison alongside
   *  the raw score. */
  age?: number;
}

/** Converts a 0-1 probability into a friendlier 1-10 scale, 1 = very low, 10 = very high. */
export function scaleOf10(probability: number): number {
  return Math.min(10, Math.max(1, Math.round(probability * 10) || 1));
}

/** A plain-language "was this good or bad" verdict, since the percentage/band wording alone
 *  can be ambiguous to a first-time user. */
export function verdictFor(band: Band): { label: string; note: string; icon: typeof CheckCircle2; color: string } {
  if (band === "typical") {
    return {
      label: "Good result",
      note: "Your pacing and steadiness look typical - nothing here stands out as a concern.",
      icon: CheckCircle2,
      color: "#3b8a4e",
    };
  }
  if (band === "some") {
    return {
      label: "Okay - a few things to watch",
      note: "A handful of patterns were a bit off from typical. Not alarming on its own, but worth keeping an eye on over time.",
      icon: AlertTriangle,
      color: "#c98a2e",
    };
  }
  return {
    label: "Several signs worth discussing",
    note: "More patterns stood out than usual. It's a good idea to mention this result to a doctor for a proper opinion.",
    icon: AlertCircle,
    color: "#b23b3b",
  };
}

export function ScoreBlock({ probability, band, modality, age }: ScoreBlockProps) {
  const pct = Math.round(probability * 100);
  const scale = scaleOf10(probability);
  const verdict = verdictFor(band);
  const Icon = verdict.icon;
  const [copied, setCopied] = useState(false);
  const ageComparison = age ? compareToAgeNorm(probability, age) : null;

  async function copySummary() {
    const date = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    const text =
      `Verity ${modality || "screening"} result - ${date}\n` +
      `Score: ${pct}% (${scale}/10, lower is generally better)\n` +
      `Status: ${bandLabel(band)}\n` +
      `${verdict.note}\n` +
      (ageComparison ? `${ageComparison.label}: ${ageComparison.note}\n` : "") +
      `\nThis is from a non-clinical screening demo, not a medical diagnosis.`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard permission denied - fail quietly, button just won't confirm */
    }
  }

  return (
    <div className="score-hero">
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 16px",
          borderRadius: 999,
          background: `${verdict.color}1a`,
          border: `1px solid ${verdict.color}55`,
          color: verdict.color,
          fontWeight: 700,
          fontSize: 14.5,
          marginBottom: 14,
        }}
      >
        <Icon size={18} />
        {verdict.label}
      </div>
      <div className="score-num" style={{ color: bandColor(band) }}>
        {pct}%
      </div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 6, marginTop: 4 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: bandColor(band) }}>{scale}/10</span>
        <span className="text-text-soft" style={{ fontSize: 12.5 }}>on a 1 (low) to 10 (high) scale</span>
      </div>
      <div className="score-sub">A lower number is generally a good sign. This isn't a diagnosis - just one helpful data point.</div>
      <div style={{ fontSize: 13, color: "var(--text-soft)", maxWidth: 420, margin: "10px auto 0", lineHeight: 1.6 }}>{verdict.note}</div>
      <div className={`band-pill ${bandClass(band)}`} style={{ marginTop: 10 }}>
        {bandLabel(band)}
      </div>
      {ageComparison && (
        <div
          style={{
            marginTop: 14,
            padding: "10px 16px",
            borderRadius: 10,
            background: "var(--bg)",
            border: "1px solid var(--border)",
            maxWidth: 420,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700 }}>{ageComparison.label}</div>
          <div style={{ fontSize: 12, color: "var(--text-soft)", marginTop: 4, lineHeight: 1.5 }}>{ageComparison.note}</div>
        </div>
      )}
      {modality && (
        <button
          className="btn btn-secondary btn-sm"
          onClick={copySummary}
          style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy summary"}
        </button>
      )}
    </div>
  );
}

interface BreakdownItem {
  value: string;
  label: string;
  note?: string;
}

export function BreakdownGrid({ items }: { items: BreakdownItem[] }) {
  return (
    <div className="breakdown-grid">
      {items.map((item, i) => (
        <div className="breakdown-item" key={i}>
          <div className="bv">{item.value}</div>
          <div className="bl">{item.label}</div>
          {item.note && <div className="bn">{item.note}</div>}
        </div>
      ))}
    </div>
  );
}
