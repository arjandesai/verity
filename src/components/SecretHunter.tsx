import * as React from "react";
import { useEffect, useRef } from "react";
import { markSecretStep, addMangoCoins } from "@/lib/verity";
import { useAwardPopup } from "@/components/ui/award-popup";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

/** Listens anywhere on the site for the Konami code - one of three hidden steps toward Verity's
 *  secret platinum trophy. Renders nothing; just watches keystrokes for as long as the app is
 *  mounted. */
export function SecretHunter() {
  const { showAward } = useAwardPopup();
  const progress = useRef<string[]>([]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      progress.current.push(key);
      if (progress.current.length > KONAMI.length) progress.current.shift();
      if (progress.current.length === KONAMI.length && progress.current.every((k, i) => k === KONAMI[i])) {
        progress.current = [];
        const completedAll = markSecretStep("konami");
        addMangoCoins(50);
        showAward({ type: "milestone", title: "Secret found: Konami Code", subtitle: "+50 Mango coins. One step closer to something bigger..." });
        if (completedAll) {
          setTimeout(() => {
            addMangoCoins(500);
            showAward({ type: "platinum", title: "Platinum Trophy: Verity Explorer", subtitle: "You found all three hidden secrets across the site. +500 Mango coins!" });
          }, 1200);
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
