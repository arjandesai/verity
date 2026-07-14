"use client";
import * as React from "react";
import { Star } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  rating: number;
  initials: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Margaret H.",
    role: "Using Verity for 3 months",
    quote: "The speech test is so easy to use, and I like seeing my results change over the weeks. It's become part of my morning routine.",
    rating: 5,
    initials: "MH",
  },
  {
    name: "Daniel R.",
    role: "Caregiver",
    quote: "I use this with my father once a week. The plain-language results make it much easier for us to talk about how he's doing.",
    rating: 5,
    initials: "DR",
  },
  {
    name: "Priya K.",
    role: "Using Verity for 6 months",
    quote: "The brain games are actually fun, not just a chore. I like that the difficulty increases as I get better.",
    rating: 4,
    initials: "PK",
  },
  {
    name: "Walter S.",
    role: "Retired teacher",
    quote: "Simple, private, and doesn't feel clinical. Mango the helper made it easy to figure out on my first try.",
    rating: 5,
    initials: "WS",
  },
  {
    name: "Elena V.",
    role: "Using Verity for 1 year",
    quote: "I love watching my trend chart on the dashboard. Seeing steady progress keeps me motivated to check in every week.",
    rating: 5,
    initials: "EV",
  },
  {
    name: "Tom B.",
    role: "Caregiver",
    quote: "The streaks and achievements are a surprisingly nice touch. My mom enjoys the little celebration when she hits a milestone.",
    rating: 4,
    initials: "TB",
  },
  {
    name: "Grace L.",
    role: "Using Verity for 2 months",
    quote: "Mango is genuinely helpful - I asked a random question and got a clear answer right away, no digging through menus.",
    rating: 5,
    initials: "GL",
  },
  {
    name: "Harold P.",
    role: "Retired engineer",
    quote: "The handwriting photo upload is a great option for days when I don't feel like drawing on a screen.",
    rating: 4,
    initials: "HP",
  },
];

function Card({ t }: { t: Testimonial }) {
  return (
    <div className="card" style={{ padding: 24, width: 320, flexShrink: 0 }}>
      <div style={{ display: "flex", gap: 2, marginBottom: 14 }}>
        {Array.from({ length: 5 }).map((_, s) => (
          <Star key={s} size={15} fill={s < t.rating ? "var(--blue-deep)" : "none"} stroke="var(--blue-deep)" />
        ))}
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 18 }}>&ldquo;{t.quote}&rdquo;</p>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "var(--blue-deep)",
            color: "var(--bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {t.initials}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13.5 }}>{t.name}</div>
          <div className="text-text-soft" style={{ fontSize: 12.5 }}>{t.role}</div>
        </div>
      </div>
    </div>
  );
}

/** An infinitely cycling row of testimonial cards, pausing on hover. */
export default function Component() {
  const track = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <div style={{ overflow: "hidden", position: "relative" }} className="group">
      <div
        style={{
          display: "flex",
          gap: 20,
          width: "max-content",
          animation: "verity-marquee 38s linear infinite",
        }}
        className="group-hover:[animation-play-state:paused]"
      >
        {track.map((t, i) => (
          <Card key={`${t.name}-${i}`} t={t} />
        ))}
      </div>
      <style>{`
        @keyframes verity-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
