import * as React from "react";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { RevealOnScroll } from "@/components/RevealOnScroll";

const FAQS: { q: string; a: string }[] = [
  {
    q: "Is Verity a medical diagnosis tool?",
    a: "No. Verity is a non-clinical screening tool - it looks for patterns in speech and handwriting that are studied as early markers of cognitive change, but it has not been clinically validated. A result from Verity should never replace a real doctor's opinion, especially if it flags something worth discussing.",
  },
  {
    q: "Where is my data stored?",
    a: "Locally, on your own device, in your browser's storage. Nothing is sent to or stored on a central server we control. If you use a personal Gemini API key for the stricter AI-assisted scoring mode, your audio or handwriting sample for that specific test is sent to Google's API for analysis, but Verity itself doesn't keep a copy anywhere else.",
  },
  {
    q: "What happens if I clear my browser data?",
    a: "Everything - your account, test history, journal, and Mango progress - lives only in that browser's local storage, so clearing it will erase everything. Go to Settings and download a backup regularly to protect against this.",
  },
  {
    q: "Can I use Verity on a different device or browser?",
    a: "Not automatically - your data doesn't sync between devices or browsers. Download a backup from Settings on your original device, then restore it on the new one to bring your history and account across.",
  },
  {
    q: "Do I need the Gemini API key?",
    a: "No, it's optional. Both tests work without one, using signal analysis done entirely in your browser. Adding a personal Gemini API key unlocks a stricter, AI-assisted scoring mode that reads more context (like actual word-finding difficulty in speech, or legibility in handwriting) rather than relying on timing and geometry alone.",
  },
  {
    q: "How is my score calculated?",
    a: "From patterns studied in published research on early cognitive change - pacing, pauses, and volume variability for speech; stroke steadiness, pen speed, and pressure variability for handwriting. These are converted into a single probability score, rather than a strict pass/fail cutoff, so a result reflects how far your patterns sit from a typical range.",
  },
  {
    q: "Why does the tool ask for my age?",
    a: "Entering your age (optional, in Settings) lets a result be compared against a rough age-adjusted expectation, since some mild slowing in pace or handwriting steadiness is a normal part of ageing. This is illustrative, not a clinical norm table.",
  },
  {
    q: "What's the levelling system and Mango for?",
    a: "A single test tells you very little on its own - a trend over repeated tests is far more useful. The games, levels, coins, and Mango exist to make it more appealing to come back and test again over time, rather than testing once and never returning.",
  },
  {
    q: "I got a concerning result. What should I do?",
    a: "Talk to a doctor - that's the most useful next step, not another screening tool. Visit the Resources page for helplines and guidance on preparing for that conversation, and consider bringing your dashboard history or a copied result summary with you.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card" style={{ marginBottom: 10, overflow: "hidden" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          padding: "16px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          fontWeight: 700,
          fontSize: 14.5,
          color: "var(--text)",
        }}
      >
        {q}
        <ChevronDown size={16} style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
      </button>
      {open && (
        <div style={{ padding: "0 18px 18px", fontSize: 13.5, lineHeight: 1.6, color: "var(--text-soft)" }}>{a}</div>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <div className="container" style={{ paddingTop: 56, paddingBottom: 120, maxWidth: 680 }}>
      <RevealOnScroll>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 6 }}>Frequently asked questions</h1>
        <p className="text-text-soft" style={{ marginBottom: 30 }}>
          The most common questions about how Verity works, your data, and what a result means.
        </p>
      </RevealOnScroll>
      <RevealOnScroll delay={0.05}>
        <div>
          {FAQS.map((f) => (
            <FAQItem key={f.q} {...f} />
          ))}
        </div>
      </RevealOnScroll>
    </div>
  );
}
