"use client";
import * as React from "react";
import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Check, X } from "lucide-react";
import { createAccount, isValidEmail, setUser, setSessionPersonalInfo } from "@/lib/verity";
import { useToast } from "@/components/Toast";

interface FieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  valid: boolean | null; // null = no feedback yet (e.g. empty)
  autoComplete?: string;
}

function ValidatedField({ label, type = "text", value, onChange, valid, autoComplete }: FieldProps) {
  return (
    <div className="field">
      <label>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          style={{ paddingRight: 38 }}
        />
        {valid !== null && (
          <span
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: valid ? "var(--text)" : "var(--text-soft)",
              display: "flex",
            }}
          >
            {valid ? <Check size={16} /> : <X size={16} />}
          </span>
        )}
      </div>
    </div>
  );
}

const SYMPTOM_DURATIONS = ["Not experiencing symptoms", "Less than 3 months", "3–6 months", "6–12 months", "1–2 years", "More than 2 years"];

type Step = "account" | "intake";

export function SignUpBlock() {
  const [step, setStep] = useState<Step>("account");
  const navigate = useNavigate();
  const { showToast } = useToast();

  // step 1 - account fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // step 2 - health intake fields (encrypted before storage)
  const [dob, setDob] = useState("");
  const [symptomDuration, setSymptomDuration] = useState(SYMPTOM_DURATIONS[0]);
  const [notes, setNotes] = useState("");

  const usernameValid = username.trim().length === 0 ? null : username.trim().length >= 3;
  const emailValid = email.trim().length === 0 ? null : isValidEmail(email.trim());
  const passwordValid = password.length === 0 ? null : password.length >= 6;
  const confirmValid = confirmPassword.length === 0 ? null : confirmPassword === password && password.length >= 6;

  const step1Ready = useMemo(
    () => usernameValid === true && emailValid === true && passwordValid === true && confirmValid === true,
    [usernameValid, emailValid, passwordValid, confirmValid]
  );

  function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (usernameValid !== true) {
      setError("Username must be at least 3 characters.");
      return;
    }
    if (emailValid !== true) {
      setError("Please enter a real, valid email address.");
      return;
    }
    if (passwordValid !== true) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (confirmValid !== true) {
      setError("Passwords don't match.");
      return;
    }
    setStep("intake");
  }

  async function handleFinish(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const personalInfo = {
        email: email.trim(),
        dob: dob || undefined,
        symptomDuration,
        notes: notes.trim() || undefined,
      };
      await createAccount(username.trim(), password, personalInfo);
      setUser({ username: username.trim(), email: email.trim() });
      setSessionPersonalInfo(personalInfo);
      showToast("Account created - welcome to Verity!");
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong creating your account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="runner-card">
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, textAlign: "center" }}>
        {step === "account" ? "Create your account" : "A little about you"}
      </h1>
      <p className="text-text-soft" style={{ textAlign: "center", marginBottom: 28, fontSize: 14 }}>
        {step === "account" ? "Free, private, and stored only on your device" : "Optional - helps put your results in context. Encrypted before it's ever saved."}
      </p>

      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
        <span style={{ width: step === "account" ? 20 : 8, height: 8, borderRadius: 999, background: "var(--blue-deep)", transition: "all .2s ease" }} />
        <span style={{ width: step === "intake" ? 20 : 8, height: 8, borderRadius: 999, background: step === "intake" ? "var(--blue-deep)" : "var(--border)", transition: "all .2s ease" }} />
      </div>

      {step === "account" ? (
        <form onSubmit={handleContinue} className="flex flex-col gap-4">
          <ValidatedField label="Username" value={username} onChange={setUsername} valid={usernameValid} autoComplete="username" />
          <ValidatedField label="Email" type="email" value={email} onChange={setEmail} valid={emailValid} autoComplete="email" />
          <ValidatedField label="Password" type="password" value={password} onChange={setPassword} valid={passwordValid} autoComplete="new-password" />
          <ValidatedField label="Confirm password" type="password" value={confirmPassword} onChange={setConfirmPassword} valid={confirmValid} autoComplete="new-password" />
          {error && <div style={{ color: "var(--text)", fontWeight: 700, fontSize: 13.5, borderLeft: "3px solid var(--text)", paddingLeft: 10 }}>{error}</div>}
          <button className="btn btn-primary" disabled={!step1Ready} style={{ marginTop: 8 }}>
            Continue
          </button>
        </form>
      ) : (
        <form onSubmit={handleFinish} className="flex flex-col gap-4">
          <div className="field">
            <label>Date of birth (optional)</label>
            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
          </div>
          <div className="field">
            <label>How long have you noticed any symptoms?</label>
            <select
              value={symptomDuration}
              onChange={(e) => setSymptomDuration(e.target.value)}
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 14 }}
            >
              {SYMPTOM_DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Anything else you'd like to note? (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
          {error && <div style={{ color: "var(--text)", fontWeight: 700, fontSize: 13.5, borderLeft: "3px solid var(--text)", paddingLeft: 10 }}>{error}</div>}
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setStep("account")} style={{ flex: 1 }}>
              Back
            </button>
            <button className="btn btn-primary" disabled={busy} style={{ flex: 2 }}>
              {busy ? "Creating…" : "Create account"}
            </button>
          </div>
        </form>
      )}

      <p className="text-text-soft" style={{ textAlign: "center", marginTop: 20, fontSize: 13.5 }}>
        Already have an account? <Link to="/login" style={{ color: "var(--blue-deep)", fontWeight: 600 }}>Sign in</Link>
      </p>
    </div>
  );
}

export default SignUpBlock;
