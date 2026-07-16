import * as React from "react";
import { useParams, Link } from "react-router-dom";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { ScoreBlock } from "@/components/ScoreBlock";
import { getHistory, getUser, getUserProfile } from "@/lib/verity";

/** A permalink-style detail view for a single saved test result - the dashboard list only shows
 *  a score and date, this shows the full metric breakdown for that specific attempt, which is
 *  useful to revisit (or to point a doctor at) without re-reading the whole history CSV. */
export default function ResultDetail() {
  const { id } = useParams<{ id: string }>();
  const user = getUser();
  const entry = getHistory().find((h) => h.id === id);

  if (!user) {
    return (
      <div className="container" style={{ paddingTop: 80, textAlign: "center" }}>
        <p className="text-text-soft" style={{ marginBottom: 18 }}>
          Sign in to view your results.
        </p>
        <Link to="/login" className="btn btn-primary">
          Sign in
        </Link>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="container" style={{ paddingTop: 80, textAlign: "center" }}>
        <p className="text-text-soft" style={{ marginBottom: 18 }}>
          That result couldn't be found - it may have been cleared.
        </p>
        <Link to="/dashboard" className="btn btn-primary">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const age = getUserProfile(user.username).age;
  const m = entry.metrics || {};
  const isGemini =
    m.fluency !== undefined ||
    m.pauseSeverity !== undefined ||
    m.coherence !== undefined ||
    m.legibility !== undefined ||
    m.strokeSteadiness !== undefined;

  return (
    <div className="container" style={{ paddingTop: 56, paddingBottom: 120, maxWidth: 640 }}>
      <RevealOnScroll>
        <Link to="/dashboard" className="btn btn-secondary btn-sm" style={{ marginBottom: 20, display: "inline-block" }}>
          ← Back to dashboard
        </Link>
        <div style={{ marginBottom: 6 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, textTransform: "capitalize" }}>{entry.modality} test result</h1>
          <p className="text-text-soft" style={{ fontSize: 13.5, marginTop: 4 }}>{new Date(entry.timestamp).toLocaleString()}</p>
        </div>
      </RevealOnScroll>

      <RevealOnScroll delay={0.05}>
        <div className="runner-card" style={{ marginTop: 24 }}>
          <ScoreBlock
            probability={entry.probability}
            band={entry.band}
            modality={`${entry.modality} test`}
            age={age}
            usedAi={isGemini}
            aiConfidence={m.confidence ?? null}
          />
        </div>
      </RevealOnScroll>

      <RevealOnScroll delay={0.1}>
        <div className="card" style={{ padding: 22, marginTop: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 14 }}>Full metric breakdown</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {isGemini ? (
              <>
                {m.fluency !== undefined && <Metric label="Fluency" value={`${m.fluency}/100`} />}
                {m.pauseSeverity !== undefined && <Metric label="Pause severity" value={`${m.pauseSeverity}/100`} />}
                {m.wordFindingDifficulty !== undefined && <Metric label="Word-finding difficulty" value={`${m.wordFindingDifficulty}/100`} />}
                {m.coherence !== undefined && <Metric label="Coherence" value={`${m.coherence}/100`} />}
                {m.legibility !== undefined && <Metric label="Legibility" value={`${m.legibility}/100`} />}
                {m.strokeSteadiness !== undefined && <Metric label="Stroke steadiness" value={`${m.strokeSteadiness}/100`} />}
                {m.spacingConsistency !== undefined && <Metric label="Spacing consistency" value={`${m.spacingConsistency}/100`} />}
                {m.letterSizeConsistency !== undefined && <Metric label="Letter size consistency" value={`${m.letterSizeConsistency}/100`} />}
                {m.confidence != null && <Metric label="Confidence" value={`${m.confidence}/100`} />}
                {m.transcription && <Metric label="Transcription" value={`"${m.transcription}"`} />}
                {m.notes && <Metric label="AI notes" value={m.notes} />}
              </>
            ) : entry.modality === "speech" ? (
              <>
                {m.estWordsPerMin != null && <Metric label="Pace" value={`${Math.round(m.estWordsPerMin)} words/min`} />}
                {m.silenceRatio != null && <Metric label="Silence ratio" value={`${Math.round(m.silenceRatio * 100)}%`} />}
                {m.pauseCount != null && <Metric label="Pause count" value={String(m.pauseCount)} />}
                {m.avgVol != null && <Metric label="Average volume" value={m.avgVol.toFixed(3)} />}
                {m.variability != null && <Metric label="Volume variability" value={m.variability.toFixed(3)} />}
              </>
            ) : (
              <>
                {m.strokeCount != null && <Metric label="Stroke count" value={String(m.strokeCount)} />}
                {m.avgSpeed != null && <Metric label="Average pen speed" value={m.avgSpeed.toFixed(1)} />}
                {m.speedVariability != null && <Metric label="Speed variability" value={m.speedVariability.toFixed(1)} />}
                {m.pauseCount != null && <Metric label="Pauses" value={String(m.pauseCount)} />}
              </>
            )}
            {entry.source && <Metric label="Source" value={entry.source} />}
          </div>
        </div>
      </RevealOnScroll>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, fontSize: 13.5, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
      <span className="text-text-soft">{label}</span>
      <span style={{ fontWeight: 600, textAlign: "right" }}>{value}</span>
    </div>
  );
}
