import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { verifyCredentials, findAccount, setUser, getUser, getAccountPersonalInfo, setSessionPersonalInfo } from "@/lib/verity";
import { useToast } from "@/components/Toast";
import { RevealOnScroll } from "@/components/RevealOnScroll";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Already signed in - no reason to show a login form, send them to their dashboard instead.
  useEffect(() => {
    if (getUser()) navigate("/dashboard", { replace: true });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("Please enter your username and password.");
      return;
    }
    setBusy(true);
    try {
      const ok = await verifyCredentials(username, password);
      if (!ok) {
        setError("Incorrect username or password.");
        return;
      }
      const account = findAccount(username);
      if (account) {
        const personalInfo = await getAccountPersonalInfo(account.username, password);
        setUser({ username: account.username, email: personalInfo?.email || "" });
        setSessionPersonalInfo(personalInfo);
        showToast(`Welcome back, ${account.username}!`);
        navigate("/dashboard");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container" style={{ paddingTop: 64, paddingBottom: 96 }}>
      <RevealOnScroll>
        <div className="runner-card">
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, textAlign: "center" }}>Sign in</h1>
          <p className="text-text-soft" style={{ textAlign: "center", marginBottom: 28, fontSize: 14 }}>
            Welcome back to Verity
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="field">
              <label>Username</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </div>
            {error && (
              <div style={{ color: "var(--text)", fontWeight: 700, fontSize: 13.5, borderLeft: "3px solid var(--text)", paddingLeft: 10 }}>{error}</div>
            )}
            <button className="btn btn-primary" disabled={busy} style={{ marginTop: 8 }}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <p className="text-text-soft" style={{ textAlign: "center", marginTop: 20, fontSize: 13.5 }}>
            Don't have an account? <Link to="/signup" style={{ color: "var(--blue-deep)", fontWeight: 600 }}>Create one</Link>
          </p>
        </div>
      </RevealOnScroll>
    </div>
  );
}
