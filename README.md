# Verity (React + TypeScript + Tailwind)

This is Verity rebuilt on React, TypeScript, Tailwind CSS, and shadcn-style
component conventions, so real component code from sites like 21st.dev can be
dropped straight into `src/components/ui/`.

## Run it locally

```bash
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173).

## What's included
- All 9 pages ported from the original site: Home, Tests, Speech, Handwriting,
  Dashboard, Games, About, Login, Signup — routed with react-router-dom.
- `src/lib/verity.ts` — every piece of business logic from the original
  app.js (auth/hashing, speech + handwriting scoring with the accuracy fixes,
  Gemini photo analysis, history, XP/leveling).
- `src/components/ui/` — shadcn-style primitives (Button, TextShimmer,
  AnimatedText) — drop any more 21st.dev/shadcn component files in here.
- framer-motion powered scroll reveals, a magnetic CTA button, typewriter/flip
  text, and a confetti burst on game wins.

## Notes
- No API keys are hardcoded. The Gemini key you enter on the Handwriting page
  is stored only in your browser's local storage.
- This sandbox had no network access to npm's registry, so the project could
  not be `npm install`ed or bundled here — `npm install && npm run dev` on your
  machine is the way to actually run it. The core logic file
  (`src/lib/verity.ts`) was executed and exercised directly with Node to
  confirm it works correctly.
