"use client";
import * as React from "react";
import { motion } from "framer-motion";

interface SocialLink {
  label: string;
  href: string;
  icon: React.ReactNode;
  hoverColor: string;
}

const GITHUB_ICON = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.57.11.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.8 1.19 1.83 1.19 3.09 0 4.43-2.7 5.41-5.27 5.69.42.36.78 1.08.78 2.17 0 1.57-.01 2.83-.01 3.22 0 .31.2.67.79.55A10.5 10.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
  </svg>
);

const INSTAGRAM_ICON = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

const LINKS: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/arjandesai", icon: GITHUB_ICON, hoverColor: "#ffffff" },
  { label: "Instagram", href: "https://instagram.com/arjideee", icon: INSTAGRAM_ICON, hoverColor: "#e1306c" },
];

/** A row of social icons that lift and tint on hover. */
export function SocialIcons({ className }: { className?: string }) {
  return (
    <div className={className} style={{ display: "flex", gap: 20, alignItems: "center" }}>
      {LINKS.map((l) => (
        <motion.a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={l.label}
          whileHover={{ y: -4, scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: 14,
            border: "1px solid var(--border)",
            color: "var(--text-soft)",
            background: "var(--card)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = l.hoverColor)}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-soft)")}
        >
          {l.icon}
        </motion.a>
      ))}
    </div>
  );
}
