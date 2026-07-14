"use client";
import * as React from "react";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { SocialIcons } from "@/components/ui/social-icons";

const COLUMNS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "Screening",
    links: [
      { label: "Speech test", to: "/speech" },
      { label: "Handwriting test", to: "/handwriting" },
      { label: "Games", to: "/games" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Dashboard", to: "/dashboard" },
      { label: "Sign in", to: "/login" },
      { label: "Create account", to: "/signup" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "About Verity", to: "/about" },
      { label: "Privacy & Terms", to: "/legal" },
    ],
  },
];

export function CinematicFooter() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], [40, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <footer ref={ref} className="border-t border-border mt-24" style={{ background: "var(--card)" }}>
      <div className="container" style={{ paddingTop: 56, paddingBottom: 40 }}>
        <motion.h2
          style={{ y, opacity }}
          className="text-3xl md:text-5xl font-light tracking-[0.15em] uppercase text-center mb-14"
        >
          Notice changes early
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8 mb-14">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--text-soft)", marginBottom: 12 }}>
                {col.title}
              </div>
              <div className="flex flex-col gap-2">
                {col.links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="text-sm hover:text-blue-deep transition-colors"
                    style={{
                      width: "fit-content",
                      backgroundImage: "linear-gradient(currentColor, currentColor)",
                      backgroundPosition: "0% 100%",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "0% 1px",
                      transition: "background-size 0.2s ease, color 0.2s ease",
                      paddingBottom: 1,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundSize = "100% 1px")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundSize = "0% 1px")}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4 mb-10">
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--text-soft)" }}>
            Connect with me
          </div>
          <SocialIcons />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-text-soft border-t border-border pt-6">
          <span>© {new Date().getFullYear()} Verity. A cognitive screening demo, not a medical diagnosis.</span>
          <span>Built with React + Tailwind</span>
        </div>
      </div>
    </footer>
  );
}
