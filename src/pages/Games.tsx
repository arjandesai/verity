import * as React from "react";
import { useEffect, useState } from "react";
import { Grid3x3, Repeat, MessageCircle, Zap, Hash, Calculator, Palette, Search, Tags, Waypoints } from "lucide-react";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { LevelBar, DifficultySelector, DIFF_XP_MULT, type Difficulty } from "@/components/LevelBar";
import { Confetti } from "@/components/Confetti";
import { getGameXP, setGameXP, levelFromXP, addMangoCoins, markDailyActivity } from "@/lib/verity";
import { useToast } from "@/components/Toast";
import { useAwardPopup } from "@/components/ui/award-popup";
import { MemoryMatch } from "@/games/MemoryMatch";
import { SequenceRecall } from "@/games/SequenceRecall";
import { WordAssociation } from "@/games/WordAssociation";
import { ReactionTime } from "@/games/ReactionTime";
import { NumberRecall } from "@/games/NumberRecall";
import { MathSprint } from "@/games/MathSprint";
import { StroopMatch } from "@/games/StroopMatch";
import { OddOneOut } from "@/games/OddOneOut";
import { CategorySort } from "@/games/CategorySort";
import { TrailMaking } from "@/games/TrailMaking";
import { Leaderboard } from "@/components/Leaderboard";

type GameKey = "memory" | "sequence" | "word" | "reaction" | "number" | "math" | "stroop" | "oddoneout" | "category" | "trail";

const GAMES: { key: GameKey; title: string; desc: string; icon: typeof Grid3x3 }[] = [
  { key: "memory", title: "Memory Match", desc: "Flip cards to find every matching pair.", icon: Grid3x3 },
  { key: "sequence", title: "Sequence Recall", desc: "Watch the pattern, then repeat it back.", icon: Repeat },
  { key: "word", title: "Word Association", desc: "Pick the word that best relates to the prompt.", icon: MessageCircle },
  { key: "reaction", title: "Reaction Time", desc: "Tap the box the instant it changes color.", icon: Zap },
  { key: "number", title: "Number Recall", desc: "Memorize a number, then type it back from memory.", icon: Hash },
  { key: "math", title: "Math Sprint", desc: "Solve quick arithmetic problems against the clock.", icon: Calculator },
  { key: "stroop", title: "Color Match", desc: "Name the ink color, not the word - a classic focus test.", icon: Palette },
  { key: "oddoneout", title: "Odd One Out", desc: "Spot the one item that's different from the rest.", icon: Search },
  { key: "category", title: "Category Sort", desc: "Sort each word into the right category, quickly.", icon: Tags },
  { key: "trail", title: "Trail Making", desc: "A real clinical test: connect 1-A-2-B-3-C... in order, as fast as you can.", icon: Waypoints },
];

export default function Games() {
  const [active, setActive] = useState<GameKey | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("Easy");
  const [xp, setXp] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const { showToast } = useToast();
  const { showAward } = useAwardPopup();

  useEffect(() => {
    setXp(getGameXP());
  }, []);

  function awardXP(baseAmount: number, isNewBest?: boolean, gameTitle?: string) {
    markDailyActivity("games");
    const gained = Math.round(baseAmount * DIFF_XP_MULT[difficulty]);
    const prevLevel = levelFromXP(xp).level;
    const next = xp + gained;
    const nextLevel = levelFromXP(next).level;
    setXp(next);
    setGameXP(next);
    showToast(`+${gained} XP earned!`);
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 100);
    if (isNewBest && gameTitle) {
      showAward({ type: "personal-best", title: "New personal best!", subtitle: gameTitle });
    }
    if (nextLevel > prevLevel) {
      const coinsEarned = (nextLevel - prevLevel) * 12;
      addMangoCoins(coinsEarned);
      setTimeout(() => {
        showAward({ type: "level-up", title: `Level ${nextLevel} reached!`, subtitle: `+${coinsEarned} Mango coins` });
      }, isNewBest ? 900 : 0);
    }
  }

  return (
    <div className="container" style={{ paddingTop: 56, paddingBottom: 96, maxWidth: 760 }}>
      {celebrate && <Confetti />}
      <RevealOnScroll>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 20, textAlign: "center" }}>Brain-training games</h1>
      </RevealOnScroll>

      <RevealOnScroll delay={0.05}>
        <LevelBar xp={xp} />
      </RevealOnScroll>

      <RevealOnScroll delay={0.1}>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: "var(--text-soft)", fontWeight: 600 }}>Difficulty</span>
        </div>
        <DifficultySelector value={difficulty} onChange={setDifficulty} />
      </RevealOnScroll>

      {!active && (
        <div className="grid md:grid-cols-3 gap-4" style={{ marginTop: 20 }}>
          {GAMES.map((g, i) => {
            const Icon = g.icon;
            return (
              <RevealOnScroll key={g.key} delay={0.15 + i * 0.05}>
                <button className="card" style={{ padding: 24, textAlign: "left", width: "100%" }} onClick={() => setActive(g.key)}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "var(--blue-deep)",
                      color: "var(--bg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 14,
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>{g.title}</div>
                  <div className="text-text-soft" style={{ fontSize: 13.5 }}>{g.desc}</div>
                </button>
              </RevealOnScroll>
            );
          })}
        </div>
      )}

      {active && (
        <div style={{ marginTop: 24 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setActive(null)} style={{ marginBottom: 18 }}>
            ← Back to games
          </button>
          {active === "memory" && <MemoryMatch difficulty={difficulty} onWin={(best) => awardXP(40, best, "Memory Match")} />}
          {active === "sequence" && <SequenceRecall difficulty={difficulty} onWin={(best) => awardXP(35, best, "Sequence Recall")} />}
          {active === "word" && <WordAssociation difficulty={difficulty} onWin={(best) => awardXP(30, best, "Word Association")} />}
          {active === "reaction" && <ReactionTime difficulty={difficulty} onWin={(best) => awardXP(25, best, "Reaction Time")} />}
          {active === "number" && <NumberRecall difficulty={difficulty} onWin={(best) => awardXP(30, best, "Number Recall")} />}
          {active === "math" && <MathSprint difficulty={difficulty} onWin={(best) => awardXP(30, best, "Math Sprint")} />}
          {active === "stroop" && <StroopMatch difficulty={difficulty} onWin={(best) => awardXP(30, best, "Color Match")} />}
          {active === "oddoneout" && <OddOneOut difficulty={difficulty} onWin={(best) => awardXP(25, best, "Odd One Out")} />}
          {active === "category" && <CategorySort difficulty={difficulty} onWin={(best) => awardXP(25, best, "Category Sort")} />}
          {active === "trail" && <TrailMaking difficulty={difficulty} onWin={(best) => awardXP(35, best, "Trail Making")} />}
        </div>
      )}

      {!active && (
        <RevealOnScroll delay={0.4}>
          <div style={{ marginTop: 40 }}>
            <Leaderboard />
          </div>
        </RevealOnScroll>
      )}
    </div>
  );
}
