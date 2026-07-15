import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { AwardBadge, type AwardTier } from "@/components/ui/award-badge";
import ProgressIndicator from "@/components/ui/progress-indicator";
import { ScoreTrendChart } from "@/components/ScoreTrendChart";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { Confetti } from "@/components/Confetti";
import { useToast } from "@/components/Toast";
import { useAwardPopup } from "@/components/ui/award-popup";
import {
  getHistory,
  clearHistory,
  historyToCsv,
  computeTrend,
  bandLabel,
  bandColor,
  getUser,
  getGameXP,
  levelFromXP,
  safeGet,
  safeSet,
  userKey,
  getSeenAchievements,
  markAchievementsSeen,
  getGameBests,
  hasPlatinumTrophy,
  getSecretSteps,
  SECRET_STEPS,
  addMangoCoins,
  getJournal,
  getUserProfile,
  type HistoryEntry,
} from "@/lib/verity";

type ModalityFilter = "all" | "speech" | "handwriting";

const ACHIEVEMENTS_PAGE_SIZE = 10;
const STREAK_KEY = "verity_last_streak_celebrated";
const STREAK_MILESTONES = [3, 7, 14, 30];

const BAND_STEPS = ["Typical", "Some signs", "Several signs"];
function bandIndex(band: HistoryEntry["band"]): number {
  return { typical: 0, some: 1, several: 2 }[band];
}

function computeStreak(history: HistoryEntry[]): number {
  if (!history.length) return 0;
  const days = new Set(history.map((h) => new Date(h.timestamp).toDateString()));
  let streak = 0;
  const cursor = new Date();
  while (days.has(cursor.toDateString())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

interface Achievement {
  tier: AwardTier;
  title: string;
  description: string;
  unlocked: boolean;
}

const GAME_LABELS: Record<string, string> = {
  memory: "Memory Match",
  sequence: "Sequence Recall",
  word: "Word Association",
  reaction: "Reaction Time",
  number: "Number Recall",
  math: "Math Sprint",
  stroop: "Color Match",
  oddoneout: "Odd One Out",
  category: "Category Sort",
  trail: "Trail Making",
};

function tierFor(rank: number, total: number): AwardTier {
  const pct = rank / total;
  if (pct < 0.34) return "bronze";
  if (pct < 0.7) return "silver";
  return "gold";
}

/** Builds a numeric-threshold ladder of achievements (e.g. "5 screenings logged", "10 screenings
 *  logged", ...) from a list of thresholds, so a whole family of related achievements can be
 *  generated from one line instead of typed out individually. */
function ladder(thresholds: number[], value: number, titleFor: (n: number) => string, descFor: (n: number) => string): Achievement[] {
  return thresholds.map((n, i) => ({
    tier: tierFor(i, thresholds.length),
    title: titleFor(n),
    description: descFor(n),
    unlocked: value >= n,
  }));
}

function achievementsFor(
  history: HistoryEntry[],
  xp: number,
  streak: number,
  trendDown: boolean,
  trendPct: number,
  gamesPlayed: number,
  gameBests: Record<string, number>
): Achievement[] {
  const level = levelFromXP(xp).level;
  const modalities = new Set(history.map((h) => h.modality)).size;
  const speechCount = history.filter((h) => h.modality === "speech").length;
  const handwritingCount = history.filter((h) => h.modality === "handwriting").length;

  const misc: Achievement[] = [
    { tier: "bronze", title: "Welcome to Verity", description: "Create your account", unlocked: true },
    { tier: "bronze", title: "First time playing", description: "Play any brain game once", unlocked: xp > 0 },
    { tier: "bronze", title: "First screening completed", description: "Finish your very first test", unlocked: history.length >= 1 },
    { tier: "bronze", title: "First words", description: "Complete your first speech test", unlocked: speechCount >= 1 },
    { tier: "bronze", title: "First strokes", description: "Complete your first handwriting test", unlocked: handwritingCount >= 1 },
    { tier: "silver", title: "Well-rounded", description: "Try both the Speech and Handwriting tests", unlocked: modalities >= 2 },
    {
      tier: "platinum",
      title: "??? Platinum Trophy",
      description: hasPlatinumTrophy()
        ? "You found all 3 secrets hidden across Verity. Legendary."
        : `A secret, extremely hard achievement. Find ${SECRET_STEPS.length} hidden steps scattered across the site to unlock it. (${getSecretSteps().length}/${SECRET_STEPS.length} found)`,
      unlocked: hasPlatinumTrophy(),
    },
  ];

  const screenings = ladder(
    [1, 2, 3, 5, 7, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 125],
    history.length,
    (n) => `${n} screening${n === 1 ? "" : "s"} logged`,
    (n) => `Complete ${n} test${n === 1 ? "" : "s"} total`
  );

  const speech = ladder(
    [1, 3, 5, 10, 15, 20, 25, 30, 40, 50],
    speechCount,
    (n) => (n === 1 ? "First words" : `Speech: ${n} completed`),
    (n) => `Complete ${n} speech test${n === 1 ? "" : "s"}`
  ).slice(1); // skip n=1 here, already covered in misc as "First words"

  const handwriting = ladder(
    [1, 3, 5, 10, 15, 20, 25, 30, 40, 50],
    handwritingCount,
    (n) => (n === 1 ? "First strokes" : `Handwriting: ${n} completed`),
    (n) => `Complete ${n} handwriting test${n === 1 ? "" : "s"}`
  ).slice(1);

  const streaks = ladder(
    [2, 3, 5, 7, 10, 14, 21, 30, 45, 60, 90, 100, 120, 150, 180, 365],
    streak,
    (n) => `${n}-day streak`,
    (n) => `Use Verity ${n} days in a row`
  );

  const levels = ladder(
    Array.from({ length: 20 }, (_, i) => i + 1),
    level,
    (n) => `Reached Level ${n}`,
    (n) => `Earn enough XP from games to hit level ${n}`
  );

  const xpMilestones = ladder(
    [100, 250, 500, 1000, 2000, 3000, 5000, 7500, 10000],
    xp,
    (n) => `${n.toLocaleString()} XP earned`,
    (n) => `Earn ${n.toLocaleString()} total XP from games`
  );

  const gamesExplored = ladder(
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    gamesPlayed,
    (n) => (n === 10 ? "Game master" : `Tried ${n} game${n === 1 ? "" : "s"}`),
    (n) => (n === 10 ? "Play all ten brain-training games at least once" : `Play ${n} different brain-training game${n === 1 ? "" : "s"}`)
  );

  const perGameBests: Achievement[] = Object.keys(GAME_LABELS).map((key) => ({
    tier: "silver",
    title: `Personal best: ${GAME_LABELS[key]}`,
    description: `Set your first personal best in ${GAME_LABELS[key]}`,
    unlocked: gameBests[key] !== undefined,
  }));

  const improvement = ladder(
    [10, 15, 20, 25, 30, 40, 50],
    trendDown ? trendPct : 0,
    (n) => `Improved ${n}%+`,
    (n) => `Improve your score by ${n}% or more over time`
  );

  return [...misc, ...screenings, ...speech, ...handwriting, ...streaks, ...levels, ...xpMilestones, ...gamesExplored, ...perGameBests, ...improvement];
}

export default function Dashboard() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [filter, setFilter] = useState<ModalityFilter>("all");
  const [xp, setXp] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const [journalCount, setJournalCount] = useState(0);
  const [hasAge, setHasAge] = useState(false);
  const user = getUser();
  const { showToast } = useToast();
  const { showAward } = useAwardPopup();

  useEffect(() => {
    const h = getHistory();
    setHistory(h);
    setXp(getGameXP());
    setJournalCount(getJournal().length);
    if (user) setHasAge(!!getUserProfile(user.username).age);

    const streak = computeStreak(h);
    const lastCelebrated = parseInt(safeGet(userKey(STREAK_KEY)) || "0", 10);
    const justHit = STREAK_MILESTONES.filter((m) => streak >= m && lastCelebrated < m).sort((a, b) => b - a)[0];
    if (justHit) {
      safeSet(userKey(STREAK_KEY), String(justHit));
      setCelebrate(true);
      showToast(`🎉 ${justHit}-day streak achieved!`);
      showAward({ type: "streak", title: `${justHit}-day streak!`, subtitle: "You've used Verity every day - keep it going." });
      setTimeout(() => setCelebrate(false), 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? history : history.filter((h) => h.modality === filter)),
    [history, filter]
  );

  const trend = useMemo(() => computeTrend(filtered), [filtered]);
  const streak = useMemo(() => computeStreak(history), [history]);
  const gameBests = useMemo(() => getGameBests(), [xp]);
  const gamesPlayed = useMemo(() => Object.keys(gameBests).length, [gameBests]);
  const achievements = useMemo(
    () => achievementsFor(history, xp, streak, trend.direction === "down", trend.deltaPct, gamesPlayed, gameBests),
    [history, xp, streak, trend, gamesPlayed, gameBests]
  );
  // Unlocked achievements (and the still-locked ones right behind them) are the most interesting,
  // so they're shown first - "Show all" reveals the rest of the (large) list.
  const sortedAchievements = useMemo(() => [...achievements].sort((a, b) => Number(b.unlocked) - Number(a.unlocked)), [achievements]);
  const visibleAchievements = showAllAchievements ? sortedAchievements : sortedAchievements.slice(0, ACHIEVEMENTS_PAGE_SIZE);

  // The moment an achievement first becomes unlocked, pop up a celebration card for it  - 
  // tracked in localStorage so each one only pops once, ever, on this device.
  useEffect(() => {
    if (!achievements.length) return;
    const seen = new Set(getSeenAchievements());
    const newlyUnlocked = achievements.filter((a) => a.unlocked && !seen.has(a.title));
    if (newlyUnlocked.length) {
      newlyUnlocked.forEach((a, i) => {
        setTimeout(() => {
          showAward({ type: a.tier, title: a.title, subtitle: a.description });
        }, i * 900);
        // Coins earned per achievement, scaled by rarity - the platinum trophy already awards
        // its own big bonus separately when the secret sequence completes.
        if (a.tier !== "platinum") {
          addMangoCoins({ bronze: 5, silver: 10, gold: 20, platinum: 0 }[a.tier]);
        }
      });
      markAchievementsSeen(newlyUnlocked.map((a) => a.title));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [achievements]);

  const speechTrend = useMemo(
    () =>
      history
        .filter((h) => h.modality === "speech")
        .map((h) => ({ label: new Date(h.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" }), value: Math.round(h.probability * 100) })),
    [history]
  );
  const handwritingTrend = useMemo(
    () =>
      history
        .filter((h) => h.modality === "handwriting")
        .map((h) => ({ label: new Date(h.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" }), value: Math.round(h.probability * 100) })),
    [history]
  );

  const activityTimestamps = useMemo(() => {
    return [...history.map((h) => h.timestamp), ...getJournal().map((j) => j.timestamp)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  const onboardingSteps = useMemo(
    () => [
      { label: "Create your account", done: true },
      { label: "Take your first test", done: history.length > 0, to: "/tests" },
      { label: "Play a brain game", done: gamesPlayed > 0, to: "/games" },
      { label: "Add your age for age-adjusted results", done: hasAge, to: "/settings" },
      { label: "Log your first journal check-in", done: journalCount > 0, to: "/journal" },
      { label: "Download a backup of your data", done: false, to: "/settings" },
    ],
    [history.length, gamesPlayed, hasAge, journalCount]
  );
  const onboardingDone = onboardingSteps.filter((s) => s.done).length;

  function handleClear() {
    if (window.confirm("Clear all your saved test history? This can't be undone.")) {
      clearHistory();
      setHistory([]);
    }
  }
  function handleExport() {
    const csv = historyToCsv(history);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "verity-history.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!user) {
    return (
      <div className="container" style={{ paddingTop: 80, textAlign: "center" }}>
        <p className="text-text-soft" style={{ marginBottom: 18 }}>
          Sign in to see your dashboard.
        </p>
        <Link to="/login" className="btn btn-primary">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 56, paddingBottom: 120, maxWidth: 880 }}>
      {celebrate && <Confetti />}
      <RevealOnScroll>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 6 }}>Your dashboard</h1>
            <p className="text-text-soft" style={{ marginBottom: 30 }}>
              {history.length} screening{history.length === 1 ? "" : "s"} logged
              {streak > 0 && ` · ${streak}-day streak 🔥`}
            </p>
          </div>
          {history.length > 0 && (
            <button className="btn btn-secondary btn-sm no-print" onClick={() => window.print()}>
              Print summary
            </button>
          )}
        </div>
      </RevealOnScroll>

      {onboardingDone < onboardingSteps.length && (
        <RevealOnScroll delay={0.01}>
          <div className="card" style={{ padding: 22, marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Getting started</div>
              <span className="text-text-soft" style={{ fontSize: 12.5 }}>
                {onboardingDone}/{onboardingSteps.length}
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 999, background: "var(--blue)", overflow: "hidden", marginBottom: 14 }}>
              <div
                style={{
                  height: "100%",
                  width: `${(onboardingDone / onboardingSteps.length) * 100}%`,
                  background: "var(--blue-deep)",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {onboardingSteps.map((s) => (
                <Link
                  key={s.label}
                  to={s.to || "#"}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 13.5,
                    color: s.done ? "var(--text-soft)" : "var(--text)",
                    textDecoration: s.done ? "line-through" : "none",
                    pointerEvents: s.to ? "auto" : "none",
                  }}
                >
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      border: `1.5px solid ${s.done ? "var(--blue-deep)" : "var(--border)"}`,
                      background: s.done ? "var(--blue-deep)" : "transparent",
                      flexShrink: 0,
                    }}
                  />
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        </RevealOnScroll>
      )}

      {history.length > 0 && (
        <RevealOnScroll delay={0.02}>
          <div className="card" style={{ padding: 24, marginBottom: 24, textAlign: "center" }}>
            <p className="text-text-soft" style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
              Latest rating - {[...history].reverse()[0].modality}
            </p>
            <ProgressIndicator
              steps={BAND_STEPS}
              activeStep={bandIndex([...history].reverse()[0].band)}
              autoPlay={false}
            />
          </div>
        </RevealOnScroll>
      )}

      <RevealOnScroll delay={0.05}>
        <div className="grid md:grid-cols-3 gap-4" style={{ marginBottom: 30 }}>
          <div className="card" style={{ padding: 22 }}>
            <div style={{ fontSize: 13, color: "var(--text-soft)" }}>Recent trend</div>
            <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6 }}>
              {trend.direction === "flat" ? "Steady" : trend.direction === "up" ? `↑ ${trend.deltaPct}%` : `↓ ${trend.deltaPct}%`}
            </div>
          </div>
          <div className="card" style={{ padding: 22 }}>
            <div style={{ fontSize: 13, color: "var(--text-soft)" }}>Current streak</div>
            <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6 }}>{streak} day{streak === 1 ? "" : "s"}</div>
          </div>
          <div className="card" style={{ padding: 22 }}>
            <div style={{ fontSize: 13, color: "var(--text-soft)" }}>Achievements</div>
            <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6 }}>
              {achievements.filter((a) => a.unlocked).length}/{achievements.length}
            </div>
          </div>
        </div>
      </RevealOnScroll>

      {activityTimestamps.length > 0 && (
        <RevealOnScroll delay={0.07}>
          <div className="card no-print" style={{ padding: 22, marginBottom: 30 }}>
            <h3 style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 12 }}>Activity</h3>
            <ActivityHeatmap timestamps={activityTimestamps} />
          </div>
        </RevealOnScroll>
      )}

      {(speechTrend.length >= 2 || handwritingTrend.length >= 2) && (
        <RevealOnScroll delay={0.08}>
          <div className="grid md:grid-cols-2 gap-4" style={{ marginBottom: 30 }}>
            <div className="card" style={{ padding: 22 }}>
              <h3 style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 10 }}>Speech trend</h3>
              <ScoreTrendChart points={speechTrend} />
            </div>
            <div className="card" style={{ padding: 22 }}>
              <h3 style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 10 }}>Handwriting trend</h3>
              <ScoreTrendChart points={handwritingTrend} />
            </div>
          </div>
        </RevealOnScroll>
      )}

      <RevealOnScroll delay={0.12}>
        <div style={{ marginBottom: 30 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>
              Achievements <span className="text-text-soft" style={{ fontWeight: 500, fontSize: 13 }}>({achievements.filter((a) => a.unlocked).length}/{achievements.length})</span>
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {visibleAchievements.map((a) => (
              <AwardBadge key={a.title} tier={a.tier} title={a.title} description={a.description} unlocked={a.unlocked} />
            ))}
          </div>
          {achievements.length > ACHIEVEMENTS_PAGE_SIZE && (
            <button className="btn btn-secondary btn-sm" style={{ marginTop: 16 }} onClick={() => setShowAllAchievements((v) => !v)}>
              {showAllAchievements ? "Show less" : `Show all ${achievements.length}`}
            </button>
          )}
        </div>
      </RevealOnScroll>

      <RevealOnScroll delay={0.16}>
        <div className="no-print" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {(["all", "speech", "handwriting"] as ModalityFilter[]).map((f) => (
              <button key={f} className={`diff-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                {f === "all" ? "All" : f === "speech" ? "Speech" : "Handwriting"}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={handleExport} disabled={!history.length}>
              Export CSV
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handleClear} disabled={!history.length}>
              Clear history
            </button>
          </div>
        </div>

        {!filtered.length ? (
          <div className="card" style={{ padding: 40, textAlign: "center" }}>
            <p className="text-text-soft" style={{ marginBottom: 16 }}>No test results yet.</p>
            <Link to="/tests" className="btn btn-primary">
              Take a test
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {[...filtered].reverse().map((h) => (
              <Link
                to={`/result/${h.id}`}
                key={h.id}
                className="card"
                style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, color: "inherit" }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14.5, textTransform: "capitalize" }}>{h.modality}</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-soft)" }}>{new Date(h.timestamp).toLocaleString()}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: bandColor(h.band) }}>{Math.round(h.probability * 100)}%</div>
                  <div style={{ fontSize: 12, color: "var(--text-soft)" }}>{bandLabel(h.band)}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </RevealOnScroll>
    </div>
  );
}
