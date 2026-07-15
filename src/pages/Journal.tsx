import * as React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, BookOpen } from "lucide-react";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { useToast } from "@/components/Toast";
import {
  getUser,
  getJournal,
  addJournalEntry,
  deleteJournalEntry,
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
    addJournalEntry(mood, note);
    addMangoCoins(2);
    setEntries(getJournal());
    setMood(null);
    setNote("");
    showToast("Logged - thanks for checking in.");
  }

  function remove(id: string) {
    deleteJournalEntry(id);
    setEntries(getJournal());
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
          <button className="btn btn-primary" type="submit">
            Log today
          </button>
        </form>
      </RevealOnScroll>

      <RevealOnScroll delay={0.1}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
          Past entries <span className="text-text-soft" style={{ fontWeight: 500, fontSize: 13 }}>({entries.length})</span>
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
                    <div style={{ fontSize: 12, color: "var(--text-soft)", marginTop: 2 }}>{new Date(e.timestamp).toLocaleString()}</div>
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
