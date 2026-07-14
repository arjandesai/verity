import * as React from "react";
import { useRef, useState } from "react";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { markSecretStep, addMangoCoins } from "@/lib/verity";
import { useAwardPopup } from "@/components/ui/award-popup";

const FOOTER_CLICK_THRESHOLD = 7; // click "Last updated" this many times to find the third hidden step

export default function Legal() {
  const { showAward } = useAwardPopup();
  const clicks = useRef(0);
  const [, forceRender] = useState(0);

  function handleLastUpdatedClick() {
    clicks.current += 1;
    forceRender((n) => n + 1);
    if (clicks.current === FOOTER_CLICK_THRESHOLD) {
      const completedAll = markSecretStep("footer-clicks");
      addMangoCoins(50);
      showAward({ type: "milestone", title: "Secret found: Fine print reader", subtitle: "+50 Mango coins. One step closer to something bigger..." });
      if (completedAll) {
        setTimeout(() => {
          addMangoCoins(500);
          showAward({ type: "platinum", title: "Platinum Trophy: Verity Explorer", subtitle: "You found all three hidden secrets across the site. +500 Mango coins!" });
        }, 1200);
      }
    }
  }

  return (
    <div className="container" style={{ paddingTop: 56, paddingBottom: 100, maxWidth: 760 }}>
      <RevealOnScroll>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Privacy Policy &amp; Terms of Use</h1>
        <p
          className="text-text-soft"
          style={{ marginBottom: 40, cursor: "default", userSelect: "none", width: "fit-content" }}
          onClick={handleLastUpdatedClick}
        >
          Last updated: this demo build.
        </p>
      </RevealOnScroll>

      <RevealOnScroll delay={0.05}>
        <h2 style={{ fontSize: 21, fontWeight: 700, marginBottom: 10 }}>Privacy Policy</h2>
        <div className="flex flex-col gap-4" style={{ marginBottom: 40 }}>
          <p style={{ lineHeight: 1.7 }}>
            <strong>What we store.</strong> Your account, test history, game progress, and any health-context details you
            choose to provide (like date of birth or symptom duration) are stored only in your own browser's local storage  - 
            not on a server we control.
          </p>
          <p style={{ lineHeight: 1.7 }}>
            <strong>Encryption.</strong> Your email address and health-context details are encrypted client-side (AES-GCM)
            using a key derived from your account password before they're ever saved. Only someone who knows your password
            can decrypt that information again.
          </p>
          <p style={{ lineHeight: 1.7 }}>
            <strong>Photo analysis.</strong> If you use the optional handwriting photo-analysis feature, the photo you upload
            is sent to Google's Gemini API for analysis. No other personal information is included in that request.
          </p>
          <p style={{ lineHeight: 1.7 }}>
            <strong>No selling of data.</strong> We don't sell, rent, or share your information with third parties for
            advertising purposes. There are no ads or trackers in this app.
          </p>
          <p style={{ lineHeight: 1.7 }}>
            <strong>Your control.</strong> You can export your test history as a CSV at any time, or permanently clear your
            history from the Dashboard. Clearing your browser's site data will remove everything Verity has stored.
          </p>
        </div>
      </RevealOnScroll>

      <RevealOnScroll delay={0.1}>
        <h2 style={{ fontSize: 21, fontWeight: 700, marginBottom: 10 }}>Terms of Use</h2>
        <div className="flex flex-col gap-4">
          <p style={{ lineHeight: 1.7 }}>
            <strong>Not a medical device.</strong> Verity is a non-clinical, educational demo. It is not a diagnostic tool
            and does not provide medical advice. Nothing in this app should be used as a substitute for professional
            medical evaluation. If you have concerns about your memory, thinking, or health, please talk to a qualified
            healthcare provider.
          </p>
          <p style={{ lineHeight: 1.7 }}>
            <strong>Your responsibility.</strong> You're responsible for keeping your password secure. Because everything is
            stored locally and encrypted with a key derived from your password, we have no way to recover a lost password or
            account.
          </p>
          <p style={{ lineHeight: 1.7 }}>
            <strong>Acceptable use.</strong> Please don't use Verity to store information about anyone other than yourself
            without their consent, or attempt to interfere with the app's normal operation.
          </p>
          <p style={{ lineHeight: 1.7 }}>
            <strong>No warranty.</strong> Verity is provided "as is," without warranties of any kind. We aren't liable for
            any damages arising from your use of the app.
          </p>
          <p style={{ lineHeight: 1.7 }}>
            <strong>Changes.</strong> These terms may be updated from time to time as the app evolves. Continued use of
            Verity means you accept the current version of these terms.
          </p>
        </div>
      </RevealOnScroll>
    </div>
  );
}
