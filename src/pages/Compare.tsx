import * as React from "react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { getHistory, getUser, bandLabel, bandColor, type HistoryEntry } from "@/lib/verity";

function EntryPicker({ label, entries, value, onChange }: { label: string; entries: HistoryEntry[]; value: string; onChange: (id: string) => void }) {
  return (
    <div style={{ flex: 1, minWidth: 200 }}>
      <label style={{ display: "block", fontSize: 12.5, color: "var(--text-soft)", marginBottom: 6 }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid var(--border)",
          background: "var(--bg)",
          color: "var(--text)",
          fontSize: 13.5,
        }}
      >
        <option value="">Select a result...</option>
        {entries.map((e) => (
          <option key={e.id} value={e.id}>
            {new Date(e.timestamp).toLocaleDateString()} - {Math.round(e.probability * 100)}% ({e.modality})
          </option>
        ))}
      </select>
    </div>
  );
}

/** Pick any two saved results (same or different modality) and see them side by side - useful
 *  for checking "am I better or worse than three months ago" without scrolling through the raw
 *  history list and doing the mental math yourself. */
export default function Compare() {
  const user = getUser();
  const history = useMemo(() => [...getHistory()].reverse(), []);
  const [idA, setIdA] = useState("");
  const [idB, setIdB] = useState("");

  if (!user) {
    return (
      <div className="container" style={{ paddingTop: 80, textAlign: "center" }}>
        <p className="text-text-soft" style={{ marginBottom: 18 }}>
          Sign in to compare your results.
        </p>
        <Link to="/login" className="btn btn-primary">
          Sign in
        </Link>
      </div>
    );
  }

  const a = history.find((h) => h.id === idA);
  const b = history.find((h) => h.id === idB);
  const delta = a && b ? Math.round((b.probability - a.probability) * 100) : null;

  return (
    <div className="container" style={{ paddingTop: 56, paddingBottom: 120, maxWidth: 720 }}>
      <RevealOnScroll>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 6 }}>Compare results</h1>
        <p className="text-text-soft" style={{ marginBottom: 30 }}>
          Pick any two saved results to see how they stack up against each other.
        </p>
      </RevealOnScroll>

      {history.length < 2 ? (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <p className="text-text-soft" style={{ marginBottom: 16 }}>You need at least two saved results to compare.</p>
          <Link to="/tests" className="btn btn-primary">
            Take a test
          </Link>
        </div>
      ) : (
        <>
          <RevealOnScroll delay={0.05}>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 30 }}>
              <EntryPicker label="First result" entries={history} value={idA} onChange={setIdA} />
              <EntryPicker label="Second result" entries={history} value={idB} onChange={setIdB} />
            </div>
          </RevealOnScroll>

          {a && b && (
            <RevealOnScroll delay={0.1}>
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, flexWrap: "wrap", marginBottom: 20 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: "var(--text-soft)", marginBottom: 4 }}>{new Date(a.timestamp).toLocaleDateString()}</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: bandColor(a.band) }}>{Math.round(a.probability * 100)}%</div>
                    <div style={{ fontSize: 12, color: "var(--text-soft)" }}>{bandLabel(a.band)}</div>
                  </div>
                  <ArrowRight size={20} style={{ color: "var(--text-soft)", flexShrink: 0 }} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: "var(--text-soft)", marginBottom: 4 }}>{new Date(b.timestamp).toLocaleDateString()}</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: bandColor(b.band) }}>{Math.round(b.probability * 100)}%</div>
                    <div style={{ fontSize: 12, color: "var(--text-soft)" }}>{bandLabel(b.band)}</div>
                  </div>
                </div>
                {delta !== null && (
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: 14,
                      fontWeight: 700,
                      color: delta < 0 ? "#3b8a4e" : delta > 0 ? "#b23b3b" : "var(--text-soft)",
                    }}
                  >
                    {delta === 0
                      ? "No change between these two results."
                      : `${Math.abs(delta)}% ${delta < 0 ? "better" : "higher"} in the second result.`}
                  </div>
                )}
                <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20 }}>
                  <Link to={`/result/${a.id}`} className="btn btn-secondary btn-sm">
                    View first in detail
                  </Link>
                  <Link to={`/result/${b.id}`} className="btn btn-secondary btn-sm">
                    View second in detail
                  </Link>
                </div>
              </div>
            </RevealOnScroll>
          )}
        </>
      )}
    </div>
  );
}
