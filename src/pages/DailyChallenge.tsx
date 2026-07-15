import * as React from "react";
import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { useToast } from "@/components/Toast";
import { addMangoCoins, safeGet, safeSet, userKey } from "@/lib/verity";

type ChallengeType = "recall" | "riddle" | "math" | "unscramble";
interface Challenge {
  type: ChallengeType;
  prompt: string;
  options?: string[];
  answer: string;
}

/** A date-seeded pseudo-random number generator - so everyone (and every visit) gets the same
 *  puzzle on the same calendar day, without needing a server to coordinate it. */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
function dayseed(): number {
  const d = new Date();
  return d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate();
}

const RIDDLES: { prompt: string; answer: string }[] = [
  { prompt: "What has keys but no locks, space but no room, and you can enter but not go inside?", answer: "a keyboard" },
  { prompt: "The more you take, the more you leave behind. What am I?", answer: "footsteps" },
  { prompt: "What has a face and two hands but no arms or legs?", answer: "a clock" },
  { prompt: "What gets wetter the more it dries?", answer: "a towel" },
  { prompt: "What can travel around the world while staying in a corner?", answer: "a stamp" },
];

const WORDS: string[] = ["MEMORY", "COGNITION", "FOCUS", "NEURON", "LANGUAGE", "STEADY", "PATTERN", "ATTENTION"];

function buildChallenge(): Challenge {
  const rand = seededRandom(dayseed());
  const roll = Math.floor(rand() * 3);
  if (roll === 0) {
    const riddle = RIDDLES[Math.floor(rand() * RIDDLES.length)];
    return { type: "riddle", prompt: riddle.prompt, answer: riddle.answer };
  }
  if (roll === 1) {
    const a = Math.floor(rand() * 40) + 10;
    const b = Math.floor(rand() * 20) + 2;
    const c = Math.floor(rand() * 9) + 2;
    const result = a + b * c;
    return { type: "math", prompt: `What is ${a} + (${b} × ${c})?`, answer: String(result) };
  }
  const word = WORDS[Math.floor(rand() * WORDS.length)];
  const letters = word.split("");
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  return { type: "unscramble", prompt: `Unscramble this word: ${letters.join("")}`, answer: word.toLowerCase() };
}

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/^(a|an|the)\s+/, "").replace(/[^a-z0-9]/g, "");
}

const LS_KEY = "verity_daily_challenge_done";

/** One small puzzle a day, different from the full brain-training games - low commitment (a
 *  minute, no difficulty picker), and the same puzzle for everyone on a given day since it's
 *  seeded from the date rather than fully random. */
export default function DailyChallenge() {
  const { showToast } = useToast();
  const challenge = useMemo(buildChallenge, []);
  const todayKey = new Date().toISOString().slice(0, 10);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<"correct" | "incorrect" | null>(() => {
    const done = safeGet(userKey(LS_KEY));
    return done === todayKey ? "correct" : null;
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (result === "correct") return;
    const ok = normalize(answer) === normalize(challenge.answer);
    setResult(ok ? "correct" : "incorrect");
    if (ok) {
      safeSet(userKey(LS_KEY), todayKey);
      addMangoCoins(5);
      showToast("Correct! +5 Mango coins");
    }
  }

  const alreadyDone = safeGet(userKey(LS_KEY)) === todayKey;

  return (
    <div className="container" style={{ paddingTop: 56, paddingBottom: 120, maxWidth: 560, textAlign: "center" }}>
      <RevealOnScroll>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 6 }}>
          <Sparkles size={26} />
          <h1 style={{ fontSize: 30, fontWeight: 800 }}>Daily challenge</h1>
        </div>
        <p className="text-text-soft" style={{ marginBottom: 30 }}>
          One small puzzle a day. Same challenge for everyone, new one tomorrow.
        </p>
      </RevealOnScroll>

      <RevealOnScroll delay={0.05}>
        <div className="card" style={{ padding: 30 }}>
          <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 22, lineHeight: 1.5 }}>{challenge.prompt}</p>

          {result === "correct" ? (
            <div>
              <p style={{ fontWeight: 700, color: "#3b8a4e", marginBottom: 6 }}>
                {alreadyDone && !answer ? "Already solved today - nice work." : "Correct! 🎉"}
              </p>
              <p className="text-text-soft" style={{ fontSize: 13 }}>Come back tomorrow for a new one.</p>
            </div>
          ) : (
            <form onSubmit={submit}>
              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Your answer..."
                autoFocus
                style={{
                  width: "100%",
                  maxWidth: 320,
                  padding: "11px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "var(--bg)",
                  color: "var(--text)",
                  fontSize: 14,
                  textAlign: "center",
                  marginBottom: 14,
                }}
              />
              <div>
                <button className="btn btn-primary" type="submit">
                  Submit
                </button>
              </div>
              {result === "incorrect" && (
                <p style={{ marginTop: 14, color: "var(--text-soft)", fontSize: 13.5 }}>Not quite - give it another try.</p>
              )}
            </form>
          )}
        </div>
      </RevealOnScroll>
    </div>
  );
}
