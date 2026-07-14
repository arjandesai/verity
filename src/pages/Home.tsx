import * as React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUser, getAccountCount, type VerityUser } from "@/lib/verity";
import { MagneticButton } from "@/components/MagneticButton";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { FlipWord } from "@/components/TypewriterText";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { AnimatedText } from "@/components/ui/animated-underline-text-one";
import { GetStartedButton } from "@/components/ui/get-started-button";
import ProgressIndicator from "@/components/ui/progress-indicator";
import { AnimatedCarousel } from "@/components/ui/logo-carousel";
import ClippedVideoTab from "@/components/ui/clipped-video-tab";
import Testimonials from "@/components/ui/testimonial-v2";
import { BouncyCardsFeatures } from "@/components/ui/bounce-card-features";
import { InteractiveDots } from "@/components/ui/interactive-dots-1";
import HeroBrain from "@/components/ui/hero-brain";

const TECH_LOGOS = [
  { src: "https://cdn.simpleicons.org/react/61DAFB", alt: "React" },
  { src: "https://cdn.simpleicons.org/typescript/3178C6", alt: "TypeScript" },
  { src: "https://cdn.simpleicons.org/tailwindcss/06B6D4", alt: "Tailwind CSS" },
  { src: "https://cdn.simpleicons.org/vercel/000000", alt: "Vercel" },
  { src: "https://cdn.simpleicons.org/framer/0055FF", alt: "Framer Motion" },
  { src: "https://cdn.simpleicons.org/vite/646CFF", alt: "Vite" },
  { src: "https://cdn.simpleicons.org/github/181717", alt: "GitHub" },
  { src: "https://cdn.simpleicons.org/kaggle/20BEFF", alt: "Kaggle" },
  { src: "https://cdn.simpleicons.org/apple/000000", alt: "Apple" },
  { src: "https://cdn.simpleicons.org/googlegemini/8E75B2", alt: "Gemini" },
  { src: "https://cdn.simpleicons.org/nodedotjs/5FA04E", alt: "Node.js" },
];


export default function Home() {
  const [user, setUser] = useState<VerityUser | null>(null);
  const [accountCount, setAccountCount] = useState(0);

  useEffect(() => {
    setUser(getUser());
    setAccountCount(getAccountCount());
  }, []);

  return (
    <div>
      {/* Full-bleed hero: fills the viewport edge-to-edge behind the transparent nav, with the
          headline and CTA anchored toward the bottom - same shape as the Sonic template's hero. */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "flex-end",
          overflow: "hidden",
          background: "#0a0a0a",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "#0a0a0a" }} />
        <InteractiveDots dotColor="#3d6bd6" dotSize={2.5} spacing={64} repelRadius={100} />
        <HeroBrain />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.85) 100%)",
          }}
        />
        <div className="container" style={{ position: "relative", paddingBottom: 90, paddingTop: 140, color: "#fff" }}>
          <RevealOnScroll>
            <div style={{ marginBottom: 18 }}>
              <TextShimmer className="text-sm font-semibold tracking-wide uppercase" duration={2.4}>
                Cognitive health screening, reimagined
              </TextShimmer>
            </div>
          </RevealOnScroll>
          <AnimatedText
            text="Notice changes early. Stay in the know."
            textClassName="text-4xl md:text-6xl font-extrabold leading-tight max-w-3xl"
            underlineClassName="text-blue-deep"
          />
          <RevealOnScroll delay={0.15}>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 18, maxWidth: 560, marginTop: 24 }}>
              Verity is a friendly, non-clinical demo that looks at speech and handwriting patterns and turns them
              into <span style={{ color: "#fff" }}><FlipWord words={["simple insights.", "clear scores.", "gentle nudges.", "useful trends."]} className="font-semibold" /></span>
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={0.3}>
            <div className="mt-9 flex items-center gap-4">
              <Link to="/tests">
                <MagneticButton>Start a screening</MagneticButton>
              </Link>
              <Link
                to="/about"
                className="btn"
                style={{ display: "inline-flex", background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}
              >
                Learn more
              </Link>
            </div>
          </RevealOnScroll>
          {accountCount > 0 && (
            <RevealOnScroll delay={0.4}>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13.5, marginTop: 18 }}>
                {accountCount.toLocaleString()} {accountCount === 1 ? "person has" : "people have"} joined Verity so far
              </p>
            </RevealOnScroll>
          )}
        </div>
      </section>

      <section className="container" style={{ paddingTop: 64, paddingBottom: 64 }}>
        <RevealOnScroll>
          <p className="text-text-soft text-center text-sm font-semibold mb-5">A five-minute screening flow</p>
          <ProgressIndicator />
        </RevealOnScroll>
      </section>

      <section className="container" style={{ paddingBottom: 64, textAlign: "center" }}>
        <RevealOnScroll>
          <p className="text-text-soft text-sm font-semibold mb-5">See it in action</p>
          <ClippedVideoTab />
        </RevealOnScroll>
      </section>

      <section className="container" style={{ paddingBottom: 110 }}>
        <RevealOnScroll>
          <h3 style={{ fontSize: 16, fontWeight: 700, textAlign: "center", marginBottom: 24 }}>How it actually works, under the hood</h3>
          <div className="grid md:grid-cols-2 gap-4" style={{ maxWidth: 780, margin: "0 auto" }}>
            {[
              {
                title: "Speech: pace and pauses",
                fact: "Any gap longer than 250ms is counted as a genuine pause, not just a normal breath - the same threshold speech-science research uses to separate hesitation from natural rhythm.",
              },
              {
                title: "Speech: words per minute",
                fact: "Estimated speaking rate is derived from how much of the recording is actual speech versus silence, then clamped to a realistic 20-220 WPM range.",
              },
              {
                title: "Handwriting: motor steadiness",
                fact: "Pen-speed variability above 250 px/sec, more than 4 mid-stroke pauses, or unusually high stroke counts all nudge the geometric score toward \"some signs.\"",
              },
              {
                title: "Handwriting: is it even real writing?",
                fact: "Before scoring anything, Verity checks that the ink spans the box, doesn't pile up in one spot, and has enough up-and-down pen reversals to plausibly be real letters - not just a scribble.",
              },
              {
                title: "Handwriting: content verification",
                fact: "With a Gemini API key set, your writing is transcribed and cross-checked word-for-word against the sentence you were asked to write, not just judged on smoothness.",
              },
              {
                title: "Everything stays on your device",
                fact: "All scoring math runs client-side in your browser. Nothing is uploaded anywhere unless you opt into the photo/AI handwriting check, which sends only the image.",
              },
            ].map((f, i) => (
              <RevealOnScroll key={f.title} delay={i * 0.05}>
                <div className="card" style={{ padding: 20, textAlign: "left", height: "100%" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{f.title}</div>
                  <p className="text-text-soft" style={{ fontSize: 13, lineHeight: 1.6 }}>
                    {f.fact}
                  </p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </RevealOnScroll>
      </section>

      <section className="container" style={{ paddingBottom: 130 }}>
        <RevealOnScroll>
          <h2 style={{ fontSize: 26, fontWeight: 800, textAlign: "center", marginBottom: 10 }}>Everything in one place</h2>
          <p className="text-text-soft" style={{ textAlign: "center", marginBottom: 44 }}>
            Hover a card to see it lift.
          </p>
        </RevealOnScroll>
        <BouncyCardsFeatures />
      </section>

      <section className="container" style={{ paddingBottom: 130 }}>
        <RevealOnScroll>
          <h2 style={{ fontSize: 26, fontWeight: 800, textAlign: "center", marginBottom: 10 }}>What people are saying</h2>
          <p className="text-text-soft" style={{ textAlign: "center", marginBottom: 44 }}>
            A few notes from people who've tried Verity.
          </p>
        </RevealOnScroll>
        <Testimonials />
      </section>

      <section className="container" style={{ paddingBottom: 100, textAlign: "center" }}>
        <RevealOnScroll>
          <AnimatedCarousel title="Built with" logos={TECH_LOGOS} autoPlay itemsPerViewDesktop={5} itemsPerViewMobile={3} />
        </RevealOnScroll>
      </section>

      {!user && (
        <section className="container" style={{ paddingBottom: 160, textAlign: "center" }}>
          <RevealOnScroll>
            <div className="card" style={{ padding: "48px 32px", maxWidth: 720, margin: "0 auto" }}>
              <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}>Ready to see where you stand?</h2>
              <p className="text-text-soft" style={{ marginBottom: 24 }}>
                Takes about five minutes. Everything stays on your device.
              </p>
              <Link to="/signup">
                <GetStartedButton label="Create a free account" />
              </Link>
            </div>
          </RevealOnScroll>
        </section>
      )}

      {user && (
        <section className="container" style={{ paddingBottom: 160, textAlign: "center" }}>
          <RevealOnScroll>
            <div className="card" style={{ padding: "48px 32px", maxWidth: 720, margin: "0 auto" }}>
              <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}>Welcome back, {user.username}.</h2>
              <p className="text-text-soft" style={{ marginBottom: 24 }}>
                Pick up where you left off.
              </p>
              <Link to="/dashboard">
                <GetStartedButton label="Go to your dashboard" />
              </Link>
            </div>
          </RevealOnScroll>
        </section>
      )}
    </div>
  );
}
