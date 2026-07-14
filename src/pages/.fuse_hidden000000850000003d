import * as React from "react";
import { useNavigate } from "react-router-dom";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { ImageComparison } from "@/components/ui/image-comparison-slider";
import { AnimatedMarqueeHero } from "@/components/ui/hero-3";

const MARQUEE_IMAGES = [
  "https://images.unsplash.com/photo-1756312148347-611b60723c7a?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1757865579201-693dd2080c73?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1756786605218-28f7dd95a493?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1757519740947-eef07a74c4ab?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1757263005786-43d955f07fb1?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1757207445614-d1e12b8f753e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1757269746970-dc477517268f?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1755119902709-a53513bcbedc?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0",
];

const SECTIONS = [
  {
    title: "What Verity is",
    body: "Verity is a demo app that looks at how you speak and write, and compares patterns in that behavior to trends described in published research on early cognitive change. It gives you a plain-language score, not a diagnosis.",
  },
  {
    title: "How the speech test works",
    body: "You read a short passage out loud. We measure pacing, how much of the recording is silence versus speech, and how many longer pauses show up. These are the same broad categories (pace, pausing, voice steadiness) that show up in speech-science research.",
  },
  {
    title: "How the handwriting test works",
    body: "You write a sentence on screen (or upload a photo of handwriting). We track how steady your strokes are, how consistent your spacing and letter sizes are, and how often you pause mid-stroke.",
  },
  {
    title: "Non-drug approaches",
    body: "Alongside screening, many caregivers and clinicians use non-drug strategies such as Cognitive Stimulation Therapy (CST) - structured group activities (themes, puzzles, discussion) shown in trials to support thinking skills and quality of life for people with mild-to-moderate dementia.",
  },
  {
    title: "Your data",
    body: "Everything - your account, test history, and settings - lives in your browser's local storage on your own device. Nothing is uploaded anywhere unless you choose to use the optional photo-analysis feature, which sends only the photo to Google's Gemini API.",
  },
];

export default function About() {
  const navigate = useNavigate();
  return (
    <div>
      <AnimatedMarqueeHero
        tagline="A closer look at Verity"
        title={
          <>
            Understand the science
            <br />
            behind the screening
          </>
        }
        description="Verity turns everyday speech and handwriting into plain-language insights - built to be private, accessible, and honest about what it can and can't tell you."
        ctaText="Start a screening"
        onCtaClick={() => navigate("/tests")}
        images={MARQUEE_IMAGES}
      />

      <div className="container" style={{ paddingTop: 56, paddingBottom: 96, maxWidth: 760 }}>
      <RevealOnScroll>
        <h1 style={{ fontSize: 34, fontWeight: 800, marginBottom: 12 }}>About Verity</h1>
        <p className="text-text-soft" style={{ marginBottom: 40 }}>
          A closer look at how the screening works and what's behind it.
        </p>
      </RevealOnScroll>
      <div className="flex flex-col gap-8">
        {SECTIONS.map((s, i) => (
          <RevealOnScroll key={s.title} delay={i * 0.05}>
            <div>
              <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 8 }}>{s.title}</h2>
              <p className="text-text-soft" style={{ lineHeight: 1.7 }}>
                {s.body}
              </p>
            </div>
          </RevealOnScroll>
        ))}
      </div>

      <RevealOnScroll delay={0.3}>
        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 8 }}>An illustrative example: staying mentally active</h2>
          <p className="text-text-soft" style={{ lineHeight: 1.7, marginBottom: 20 }}>
            Verity doesn't scan or measure your actual brain activity - it only looks at speech and handwriting
            patterns. The graphic below is a conceptual illustration (not a real scan of you or anyone else) of an
            idea backed by research: regularly engaging in activities like reading, writing, and brain-training
            games is associated with more active neural connections, versus a more sedentary routine with fewer.
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ImageComparison
              beforeImage="/brain-before.svg"
              afterImage="/brain-after.svg"
              altBefore="Illustration of a brain with sparse, dim neural connections, representing a less mentally active routine"
              altAfter="Illustration of a brain with dense, bright neural connections, representing regular mental engagement"
              beforeLabel="Less active routine"
              afterLabel="Regularly engaged"
            />
          </div>
          <p className="text-text-soft" style={{ fontSize: 12, marginTop: 12, textAlign: "center" }}>
            Illustrative only - not derived from any brain scan or medical measurement.
          </p>
        </div>
      </RevealOnScroll>
      </div>
    </div>
  );
}
