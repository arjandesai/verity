import * as React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, BookOpen, Download } from "lucide-react";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { useToast } from "@/components/Toast";
import {
  getUser,
  getJournal,
  addJournalEntry,
  deleteJournalEntry,
  journalToCsv,
  addMangoCoins,
  JOURNAL_MOODS,
  type JournalEntry,
  type JournalMood,
} from "@/lib/verity";

/** A short, private daily check-in - separate from the speech/handwriting tests, this is just a
 *  quick "how did today feel" log (mood + an optional note) that builds its own record over
 *  time. It's meant to capture day-to-day texture (a rough night, a foggy afternoon) that a
 *  once-in-a-while test can't, and to give something worth looking back on during a doctor's
 *  visit alongside the test history. Entirely local to this device, same as everything else. */
export default function Journal() {
  const user = getUser();
  const { showToast } = useToast();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [mood, setMood] = useState<JournalMood | null>(null);
  const [note, setNote] = useState("");
  const [sleepHours, setSleepHours] = useState("");

  useEffect(() => {
    setEntries(getJournal());
  }, []);

  if (!user) {
    return (
      <div className="container" style={{ paddingTop: 80, textAlign: "center" }}>
        <p className="text-text-soft" style={{ marginBottom: 18 }}>
          Sign in to keep a private journal.
        </p>
        <Link to="/login" className="btn btn-primary">
          Sign in
        </Link>
      </div>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!mood) {
      showToast("Pick how today felt first.");
      return;
    }
    const hours = sleepHours.trim() ? parseFloat(sleepHours.trim()) : undefined;
    addJournalEntry(mood, note, hours != null && !Number.isNaN(hours) ? hours : undefined);
    addMangoCoins(2);
    setEntries(getJournal());
    setMood(null);
    setNote("");
    setSleepHours("");
    showToast("Logged - thanks for checking in.");
  }

  function remove(id: string) {
    deleteJournalEntry(id);
    setEntries(getJournal());
  }

  function exportCsv() {
    const csv = journalToCsv(entries);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "verity-journal.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="container" style={{ paddingTop: 56, paddingBottom: 120, maxWidth: 680 }}>
      <RevealOnScroll>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <BookOpen size={26} />
          <h1 style={{ fontSize: 30, fontWeight: 800 }}>Journal</h1>
        </div>
        <p className="text-text-soft" style={{ marginBottom: 30 }}>
          A quick, private daily check-in. Takes ten seconds, and builds a record worth looking back on.
        </p>
      </RevealOnScroll>

      <RevealOnScroll delay={0.05}>
        <form onSubmit={submit} className="card" style={{ padding: 22, marginBottom: 28 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>How did today feel?</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {JOURNAL_MOODS.map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => setMood(m.id)}
                className={`diff-btn ${mood === m.id ? "active" : ""}`}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px" }}
              >
                <span style={{ fontSize: 16 }}>{m.emoji}</span>
                {m.label}
              </button>
            ))}
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Anything you want to note - optional (a rough night's sleep, trouble finding a word, or just a normal day)."
            rows={3}
            style={{
              width: "100%",
              padding: "11px 14px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--text)",
              fontSize: 14,
              fontFamily: "inherit",
              resize: "vertical",
              marginBottom: 14,
            }}
          />
          <div style={{ marginBottom: 16, maxWidth: 200 }}>
            <label style={{ display: "block", fontSize: 12.5, color: "var(--text-soft)", marginBottom: 6 }}>Hours of sleep last night (optional)</label>
            <input
              type="number"
              min={0}
              max={24}
              step={0.5}
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: 14,
              }}
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Log today
          </button>
        </form>
      </RevealOnScroll>

      <RevealOnScroll delay={0.1}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>
            Past entries <span className="text-text-soft" style={{ fontWeight: 500, fontSize: 13 }}>({entries.length})</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={exportCsv} disabled={!entries.length} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Download size={13} />
            Export CSV
          </button>
        </div>
        {!entries.length ? (
          <div className="card" style={{ padding: 30, textAlign: "center" }}>
            <p className="text-text-soft">No entries yet - log your first check-in above.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {[...entries].reverse().map((e) => {
              const m = JOURNAL_MOODS.find((x) => x.id === e.mood)!;
              return (
                <div key={e.id} className="card" style={{ padding: 16, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 14 }}>
                      <span style={{ fontSize: 17 }}>{m.emoji}</span>
                      {m.label}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-soft)", marginTop: 2 }}>
                      {new Date(e.timestamp).toLocaleString()}
                      {e.sleepHours != null && ` · ${e.sleepHours}h sleep`}
                    </div>
                    {e.note && <div style={{ fontSize: 13.5, marginTop: 8, lineHeight: 1.5 }}>{e.note}</div>}
                  </div>
                  <button
                    className="btn btn-ghost btn-icon"
                    aria-label="Delete entry"
                    onClick={() => remove(e.id)}
                    style={{ color: "var(--text-soft)" }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </RevealOnScroll>
    </div>
  );
}
