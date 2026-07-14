import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  safeGet,
  safeSet,
  getMangoAffection,
  addMangoAffection,
  mangoStageFor,
  addMangoCoins,
  incrementMangoPetCount,
  markSecretStep,
} from "@/lib/verity";
import { MangoAvatar } from "@/components/MangoAvatar";
import { MessageLoading } from "@/components/ui/message-loading";
import { useToast } from "@/components/Toast";
import { useAwardPopup } from "@/components/ui/award-popup";

const SECRET_PET_THRESHOLD = 30; // pet Mango this many times (lifetime) to find the second hidden step

interface Slide {
  title: string;
  body: string;
}

// Ordered to match the site's actual page order: Home -> Tests (Speech, Handwriting) -> Games -> Dashboard -> About.
const SLIDES: Slide[] = [
  {
    title: "Hi, I'm Mango!",
    body: "I'm here to help you use Verity. Tap through these steps whenever you'd like, and I'll explain things one simple step at a time.",
  },
  {
    title: "The Tests Page",
    body: "This is where you choose which screening to take: the Speech test or the Handwriting test. Either one takes just a couple of minutes.",
  },
  {
    title: "The Speech Test",
    body: "You'll read a few sentences out loud into your microphone. That's it - just talk normally, like you always do.",
  },
  {
    title: "The Handwriting Test",
    body: "You'll write a short sentence with your finger or mouse, or take a photo of your handwriting. No wrong way to do it.",
  },
  {
    title: "The Games",
    body: "These are fun brain games, like matching cards and remembering patterns. They also help keep your mind active.",
  },
  {
    title: "Your Dashboard",
    body: "This page keeps track of everything you've done, so you can see how you're doing over time.",
  },
  {
    title: "About & Your Privacy",
    body: "The About page explains how everything works in plain language. And everything you do stays on your own device - nothing is shared unless you choose to share it.",
  },
  {
    title: "You're All Set!",
    body: "You can ask me a question any time, or come back to this tour with the Tour button. Have a wonderful time exploring!",
  },
];

const TIP_BY_PATH: Record<string, string> = {
  "/": "This is the home page. Tap \"Start a screening\" when you're ready to begin.",
  "/tests": "Pick either the Speech test or the Handwriting test to get started.",
  "/speech": "Tap \"Start recording,\" then read the sentence out loud at your normal pace.",
  "/handwriting": "Write the sentence shown, or upload a photo of handwriting instead.",
  "/games": "Pick a game below. You can change the difficulty anytime with the buttons at the top.",
  "/dashboard": "This shows all your past results and how you're trending over time.",
  "/about": "Here's a plain-language explanation of how Verity works.",
  "/login": "Enter your username and password to sign back in.",
  "/signup": "Fill in the three boxes to create your free account.",
};

const FAQ: { keywords: string[]; answer: string }[] = [
  { keywords: ["speech", "talk", "microphone", "mic", "record"], answer: "For the speech test, tap Start recording and read the sentence out loud in your normal voice. Tap Stop when you're done, and I'll show your result right away." },
  { keywords: ["handwrit", "write", "draw", "photo", "picture", "upload"], answer: "For handwriting, write right on the screen with your finger or mouse, or upload a clear photo of handwriting instead. Either way works fine." },
  { keywords: ["game", "play", "match", "sequence", "word association", "xp", "difficulty", "level up", "easy", "medium", "hard", "extreme"], answer: "The games page has three fun brain games - Memory Match, Sequence Recall, and Word Association. Pick Easy, Medium, Hard, or Extreme at the top, and you'll earn XP to level up each time you win." },
  { keywords: ["dashboard", "history", "trend", "streak", "achievement", "progress"], answer: "Your dashboard keeps every test result you've saved, along with your streak and achievements, so you can see how things change over time." },
  { keywords: ["privacy", "private", "my data", "safe", "secure", "store", "gemini", "photo analysis"], answer: "Everything you do is stored only on this device - nothing is sent anywhere unless you use the photo-analysis feature, which only sends the photo itself to Google's Gemini API." },
  { keywords: ["sign up", "signup", "create account", "register", "new account"], answer: "You can create a free account from the Sign up page - just pick a username, enter your email, and choose a password." },
  { keywords: ["sign in", "login", "log in"], answer: "You can sign back in any time from the Sign in page using the username and password you created." },
  { keywords: ["forgot", "reset password", "lost password", "can't sign in", "cant sign in"], answer: "This demo doesn't have password recovery yet - since everything is stored on this device, you'd need to create a new account if you forget your password. Sorry about that!" },
  { keywords: ["delete", "remove my data", "clear history", "start over", "erase"], answer: "You can clear your test history any time from the Dashboard page using the \"Clear history\" button." },
  { keywords: ["export", "download", "csv", "save my results"], answer: "Yes! On the Dashboard, there's an \"Export CSV\" button that downloads all your results as a spreadsheet file." },
  { keywords: ["diagnos", "doctor", "medical", "disease", "condition", "dementia", "alzheimer"], answer: "Just a friendly reminder - Verity is a screening demo, not a medical diagnosis. If you're ever concerned about your memory or thinking, it's always best to talk with a real doctor." },
  { keywords: ["score", "result", "band", "percent", "what does it mean", "normal", "some signs", "many signs"], answer: "Your score shows how similar your results are to patterns some studies link with early cognitive change. A lower percentage is generally a good sign, but it's just one piece of information - not a diagnosis." },
  { keywords: ["accura", "reliable", "trust", "real test"], answer: "Verity is a demo that looks at real behavioral patterns (pacing, pauses, stroke steadiness), but it isn't a clinical or validated diagnostic tool - think of it as a fun, informative screening rather than a medical instrument." },
  { keywords: ["how long", "how much time", "minutes", "takes"], answer: "Each test takes about two minutes, so a full screening usually takes around five minutes total." },
  { keywords: ["cost", "free", "price", "pay", "subscription"], answer: "Verity is completely free to use - there's no cost and no subscription." },
  { keywords: ["dark mode", "light mode", "theme", "night mode"], answer: "You can switch between light and dark mode any time using the little sun/moon button near the top of the page." },
  { keywords: ["mobile", "phone", "tablet", "ipad"], answer: "Verity works on phones and tablets too - the handwriting test even works great with a finger or stylus on a touchscreen." },
  { keywords: ["browser", "chrome", "safari", "firefox", "internet"], answer: "Verity works in any modern web browser. You'll just need to allow microphone access for the speech test." },
  { keywords: ["cst", "non-drug", "non drug", "therapy", "cognitive stimulation"], answer: "Cognitive Stimulation Therapy (CST) is a non-drug approach - structured group activities like themes, puzzles, and discussion - shown in research to help support thinking skills. You can read more on the About page." },
  { keywords: ["sign out", "log out", "logout"], answer: "You can sign out any time using the \"Sign out\" button near the top-right of the page." },
  { keywords: ["camera", "microphone permission", "access denied", "not working"], answer: "If a test isn't working, check that you've allowed microphone or camera access for this site in your browser's permission settings, then try again." },
  { keywords: ["retake", "try again", "redo"], answer: "Of course - just tap \"Try again\" at the bottom of any test result to take it again." },
  { keywords: ["who are you", "what are you", "your name", "mango"], answer: "I'm Mango, Verity's helper! I'm here to answer questions and walk you through anything on the site." },
  { keywords: ["what can you do", "help me", "what do you do"], answer: "I can explain any part of Verity - the speech test, handwriting test, games, dashboard, privacy, or accounts. Just ask, or tap the Tour tab for a full walkthrough." },
  { keywords: ["bug", "broken", "error", "not working", "issue", "glitch"], answer: "Sorry you're running into trouble! Try refreshing the page first. If that doesn't help, it may be a browser permission issue - check your microphone or camera settings." },
  { keywords: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"], answer: "Hello there! Ask me about the speech test, the handwriting test, the games, your dashboard, or anything else on Verity." },
  { keywords: ["how are you"], answer: "I'm doing great, thanks for asking! How can I help you with Verity today?" },
  { keywords: ["bye", "goodbye", "see you", "later"], answer: "Goodbye for now - I'll be right here if you need anything else!" },
  { keywords: ["thank", "thanks", "appreciate"], answer: "You're very welcome! I'm always here if you need anything else." },
  { keywords: ["joke", "funny"], answer: "Here's one: Why did the scarecrow win an award? Because he was outstanding in his field! 🌾 Now, how can I help with Verity?" },
  { keywords: ["how many people", "who built", "who made", "who created", "team", "company", "developer", "made this app", "made verity"], answer: "Just one person works on Verity! It's a solo project, built and refined over many rounds of feedback - but it's grown into a pretty full-featured app for something made by one person." },
  { keywords: ["what is verity", "what does verity do", "about verity", "what is this app", "what is this site"], answer: "Verity is a friendly, non-clinical demo that looks at speech and handwriting patterns and turns them into simple, plain-language insights - plus some brain-training games along the way." },
  { keywords: ["age", "old are you", "how old"], answer: "I don't really have an age - I'm just a little helper built to answer your questions about Verity!" },
  { keywords: ["language", "translate", "spanish", "french"], answer: "Right now Verity is only available in English, but that's a great idea for the future!" },
  { keywords: ["real ai", "chatgpt", "gpt", "openai", "are you ai", "are you real"], answer: "I'm a simple built-in helper, not a full AI model - I answer based on common questions about Verity. For anything I can't answer, the Tour tab covers the basics of every page." },
  { keywords: ["favorite", "favourite"], answer: "If I had to pick, I'd say the games are my favorite part - Memory Match especially!" },
];
const FALLBACK =
  "That's a good question! I'm best with things about Verity itself - the speech test, handwriting test, games, dashboard, accounts, or privacy. Ask me about any of those, or tap the Tour tab above for a full walkthrough.";

function findAnswer(input: string): string {
  const lower = input.toLowerCase().trim();
  if (!lower) return "I didn't quite catch that - could you type your question again?";
  for (const entry of FAQ) {
    if (entry.keywords.some((k) => lower.includes(k))) return entry.answer;
  }
  return FALLBACK;
}

interface ChatMessage {
  from: "user" | "mango";
  text: string;
}

const SEEN_KEY = "verity_mango_seen";
const FONT_STEP = 2;

const PET_LINES = ["Mango wags happily!", "Mango nuzzles your hand.", "Mango does a little happy hop!", "Mango beams at you."];

export function Buddy() {
  const location = useLocation();
  const { showToast } = useToast();
  const { showAward } = useAwardPopup();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"chat" | "tour">("chat");
  const [slide, setSlide] = useState(0);
  const [fontBoost, setFontBoost] = useState(0);
  const [showBubble, setShowBubble] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { from: "mango", text: "Hi, I'm Mango! Ask me anything about Verity, any time." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [affection, setAffection] = useState(0);
  const [petPulse, setPetPulse] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAffection(getMangoAffection());
  }, []);

  function bumpAffection(amount: number) {
    setAffection(addMangoAffection(amount));
  }

  function petMango() {
    // Petting builds affection only - coins come from achievements/leveling up, not repeatable petting.
    bumpAffection(3);
    setPetPulse(true);
    showToast(PET_LINES[Math.floor(Math.random() * PET_LINES.length)]);
    setTimeout(() => setPetPulse(false), 500);

    const pets = incrementMangoPetCount();
    if (pets === SECRET_PET_THRESHOLD) {
      const completedAll = markSecretStep("pet-mango");
      showAward({ type: "milestone", title: "Secret found: Mango's favorite friend", subtitle: "+50 Mango coins. One step closer to something bigger..." });
      addMangoCoins(50);
      if (completedAll) {
        setTimeout(() => {
          addMangoCoins(500);
          showAward({ type: "platinum", title: "Platinum Trophy: Verity Explorer", subtitle: "You found all three hidden secrets across the site. +500 Mango coins!" });
        }, 1200);
      }
    }
  }

  useEffect(() => {
    if (!safeGet(SEEN_KEY)) {
      const t = setTimeout(() => {
        setMode("tour");
        setOpen(true);
      }, 1000);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    setShowBubble(true);
    const t = setTimeout(() => setShowBubble(false), 5000);
    return () => clearTimeout(t);
  }, [location.pathname]);

  // gentle attention-getting bounce every so often when closed
  useEffect(() => {
    const id = setInterval(() => {
      if (!open) {
        setBounce(true);
        setTimeout(() => setBounce(false), 700);
      }
    }, 9000);
    return () => clearInterval(id);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, mode, typing]);

  function closeTutorial() {
    setOpen(false);
    safeSet(SEEN_KEY, "1");
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || typing) return;
    const answer = findAnswer(text);
    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");
    setTyping(true);
    bumpAffection(2);
    const delay = Math.min(2200, 500 + answer.length * 14);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { from: "mango", text: answer }]);
    }, delay);
  }

  const tip = TIP_BY_PATH[location.pathname];
  const baseSize = 14.5 + fontBoost * FONT_STEP;

  return (
    <>
      {/* floating tip bubble for the current page */}
      <AnimatePresence>
        {showBubble && tip && !open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed z-40"
            style={{ right: 20, bottom: 92, maxWidth: 260 }}
          >
            <div className="card" style={{ padding: "12px 16px", fontSize: 14.5, lineHeight: 1.5 }}>
              <strong>Mango:</strong> {tip}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* floating launcher button, fixed at the bottom of the screen on every page */}
      <motion.button
        aria-label="Open Mango, your Verity helper"
        onClick={() => {
          setOpen((o) => !o);
        }}
        animate={bounce ? { y: [0, -12, 0] } : { y: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        className="fixed z-40 flex items-center justify-center rounded-full shadow-lg"
        style={{
          right: 20,
          bottom: 20,
          width: 62,
          height: 62,
          background: "var(--card)",
          border: "2px solid var(--border)",
          cursor: "pointer",
          padding: 2,
        }}
      >
        <MangoAvatar size={40} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed z-[150] flex flex-col card"
            style={{
              right: 20,
              bottom: 92,
              width: "min(380px, calc(100vw - 40px))",
              height: "min(560px, calc(100vh - 140px))",
              transformOrigin: "bottom right",
              boxShadow: "0 20px 50px rgba(0,0,0,.18)",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
              <motion.button
                onClick={petMango}
                aria-label="Pet Mango"
                animate={petPulse ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                transition={{ duration: 0.4 }}
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                title="Pet Mango"
              >
                <MangoAvatar size={30} />
              </motion.button>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Mango</div>
                <div style={{ fontSize: 10.5, color: "var(--text-soft)" }}>
                  {mangoStageFor(affection).emoji} {mangoStageFor(affection).name}
                </div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                <button className={`diff-btn ${mode === "chat" ? "active" : ""}`} onClick={() => setMode("chat")} style={{ padding: "5px 12px", fontSize: 12 }}>
                  Chat
                </button>
                <button className={`diff-btn ${mode === "tour" ? "active" : ""}`} onClick={() => setMode("tour")} style={{ padding: "5px 12px", fontSize: 12 }}>
                  Tour
                </button>
              </div>
              <button
                onClick={closeTutorial}
                aria-label="Close"
                style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-soft)" }}
              >
                ×
              </button>
            </div>

            {mode === "chat" ? (
              <>
                <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        alignSelf: m.from === "user" ? "flex-end" : "flex-start",
                        maxWidth: "85%",
                        background: m.from === "user" ? "var(--blue-deep)" : "var(--bg)",
                        color: m.from === "user" ? "var(--bg)" : "var(--text)",
                        border: m.from === "mango" ? "1px solid var(--border)" : "none",
                        borderRadius: 14,
                        padding: "10px 14px",
                        fontSize: 14,
                        lineHeight: 1.5,
                      }}
                    >
                      {m.text}
                    </div>
                  ))}
                  {typing && (
                    <div
                      style={{
                        alignSelf: "flex-start",
                        background: "var(--bg)",
                        border: "1px solid var(--border)",
                        borderRadius: 14,
                        padding: "12px 16px",
                      }}
                    >
                      <MessageLoading />
                    </div>
                  )}
                </div>
                <form onSubmit={handleSend} style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid var(--border)" }}>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Mango a question…"
                    disabled={typing}
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: 999,
                      border: "1px solid var(--border)",
                      background: "var(--bg)",
                      color: "var(--text)",
                      fontSize: 14,
                    }}
                  />
                  <button className="btn btn-primary btn-sm" type="submit" disabled={typing}>
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div style={{ flex: 1, overflowY: "auto", padding: "24px 22px", display: "flex", flexDirection: "column" }}>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                    <MangoAvatar size={64} />
                  </div>
                  <h2 style={{ fontSize: baseSize + 6, fontWeight: 800, marginBottom: 10 }}>{SLIDES[slide].title}</h2>
                  <p style={{ fontSize: baseSize, lineHeight: 1.7, color: "var(--text-soft)" }}>{SLIDES[slide].body}</p>
                </div>

                <div style={{ display: "flex", justifyContent: "center", gap: 8, margin: "18px 0" }}>
                  {SLIDES.map((_, i) => (
                    <span
                      key={i}
                      style={{
                        width: i === slide ? 18 : 8,
                        height: 8,
                        borderRadius: 999,
                        background: i === slide ? "var(--blue-deep)" : "var(--border)",
                        transition: "all .2s ease",
                      }}
                    />
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 14 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setFontBoost((f) => Math.max(0, f - 1))} aria-label="Smaller text">
                    A-
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setFontBoost((f) => Math.min(3, f + 1))} aria-label="Bigger text">
                    A+
                  </button>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <button className="btn btn-secondary" disabled={slide === 0} onClick={() => setSlide((s) => Math.max(0, s - 1))} style={{ flex: 1 }}>
                    Back
                  </button>
                  {slide < SLIDES.length - 1 ? (
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setSlide((s) => s + 1);
                        bumpAffection(1);
                      }}
                      style={{ flex: 1 }}
                    >
                      Next
                    </button>
                  ) : (
                    <button className="btn btn-primary" onClick={closeTutorial} style={{ flex: 1 }}>
                      Got it!
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
