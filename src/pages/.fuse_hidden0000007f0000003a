import * as React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { SignUpBlock } from "@/components/ui/sign-up-block";
import { getUser } from "@/lib/verity";

export default function Signup() {
  const navigate = useNavigate();

  // Already signed in - no reason to show a sign-up form, send them to their dashboard instead.
  useEffect(() => {
    if (getUser()) navigate("/dashboard", { replace: true });
  }, [navigate]);

  return (
    <div className="container" style={{ paddingTop: 64, paddingBottom: 96 }}>
      <RevealOnScroll>
        <SignUpBlock />
      </RevealOnScroll>
    </div>
  );
}
