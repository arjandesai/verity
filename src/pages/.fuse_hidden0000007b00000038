import * as React from "react";
import { Link } from "react-router-dom";
import { Mic, PenLine } from "lucide-react";
import { RevealOnScroll } from "@/components/RevealOnScroll";

const TESTS = [
  {
    to: "/speech",
    title: "Speech test",
    desc: "Read a short passage aloud. We'll analyze your pacing, pauses, and voice steadiness.",
    minutes: "~2 min",
    icon: Mic,
  },
  {
    to: "/handwriting",
    title: "Handwriting test",
    desc: "Write a sentence on screen, or upload a photo of your handwriting for analysis.",
    minutes: "~2 min",
    icon: PenLine,
  },
];

export default function Tests() {
  return (
    <div className="container" style={{ paddingTop: 56, paddingBottom: 96, maxWidth: 820 }}>
      <RevealOnScroll>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, textAlign: "center" }}>Choose a test</h1>
        <p className="text-text-soft" style={{ textAlign: "center", marginBottom: 44 }}>
          Each test takes just a couple of minutes and gives you a plain-language result.
        </p>
      </RevealOnScroll>
      <div className="grid md:grid-cols-2 gap-6">
        {TESTS.map((t, i) => {
          const Icon = t.icon;
          return (
            <RevealOnScroll key={t.to} delay={i * 0.1}>
              <Link to={t.to} className="card block" style={{ padding: 30, height: "100%" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "var(--blue-deep)",
                    color: "var(--bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 18,
                  }}
                >
                  <Icon size={22} />
                </div>
                <h2 style={{ fontSize: 21, fontWeight: 700, marginBottom: 8 }}>{t.title}</h2>
                <p className="text-text-soft" style={{ fontSize: 14.5, marginBottom: 14 }}>
                  {t.desc}
                </p>
                <span style={{ fontSize: 13, color: "var(--text-soft)", fontWeight: 600 }}>{t.minutes}</span>
              </Link>
            </RevealOnScroll>
          );
        })}
      </div>
    </div>
  );
}
