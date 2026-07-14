import * as React from "react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { hasAcceptedTerms, acceptTerms } from "@/lib/verity";
import { LogoMark } from "@/components/LogoMark";

/** Blocks the whole app behind a Terms of Use / Privacy Policy acceptance screen on first visit  - 
    except the Legal page itself, which stays readable so people can review it before deciding. */
export function TermsGate({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [accepted, setAccepted] = useState(true);
  const [checked, setChecked] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAccepted(hasAcceptedTerms());
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!accepted && location.pathname !== "/legal") {
    return (
      <div
        className="fixed inset-0 z-[500] flex items-center justify-center p-4"
        style={{ background: "var(--bg)" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="card"
          style={{ maxWidth: 480, width: "100%", padding: "36px 32px" }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <LogoMark size={44} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, textAlign: "center", marginBottom: 10 }}>Welcome to Verity</h1>
          <p className="text-text-soft" style={{ textAlign: "center", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
            Before you get started, please read and accept our{" "}
            <Link to="/legal" style={{ color: "var(--blue-deep)", fontWeight: 600 }}>
              Privacy Policy &amp; Terms of Use
            </Link>
            . In short: your data stays on your device and is encrypted, and Verity is a non-clinical demo, not a medical
            diagnosis.
          </p>

          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13.5, marginBottom: 22, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} style={{ marginTop: 3 }} />
            <span>
              I have read and agree to the{" "}
              <Link to="/legal" style={{ color: "var(--blue-deep)", fontWeight: 600 }}>
                Privacy Policy &amp; Terms of Use
              </Link>
              .
            </span>
          </label>

          <button
            className="btn btn-primary"
            disabled={!checked}
            style={{ width: "100%" }}
            onClick={() => {
              acceptTerms();
              setAccepted(true);
            }}
          >
            Accept &amp; continue
          </button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
