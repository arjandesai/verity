import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { useToast } from "@/components/Toast";
import { ButtonHoldAndRelease } from "@/components/ui/hold-and-release-button";
import {
  getUser,
  setUser,
  signOut,
  getUserProfile,
  setUserProfile,
  changePassword,
  updatePersonalInfo,
  isValidEmail,
  getTextScale,
  setTextScale,
  deleteAccount,
} from "@/lib/verity";

export default function Settings() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const user = getUser();

  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [email, setEmail] = useState(user?.email || "");
  const [emailPassword, setEmailPassword] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  const [textScale, setTextScaleState] = useState(1);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    const profile = getUserProfile(user.username);
    setDisplayName(profile.displayName || "");
    setPhone(profile.phone || "");
    setTextScaleState(getTextScale());
  }, []);

  if (!user) return null;

  function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setUserProfile(user!.username, { displayName: displayName.trim(), phone: phone.trim() });
    setSavingProfile(false);
    showToast("Profile updated!");
  }

  async function saveEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      showToast("Please enter a valid email address.");
      return;
    }
    if (!emailPassword) {
      showToast("Enter your current password to confirm this change.");
      return;
    }
    setSavingEmail(true);
    const ok = await updatePersonalInfo(user!.username, emailPassword, { email });
    setSavingEmail(false);
    if (!ok) {
      showToast("That password wasn't right - email not changed.");
      return;
    }
    setUser({ ...user!, email });
    setEmailPassword("");
    showToast("Email updated!");
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPw.length < 6) {
      showToast("New password should be at least 6 characters.");
      return;
    }
    if (newPw !== confirmPw) {
      showToast("New passwords don't match.");
      return;
    }
    setSavingPw(true);
    const ok = await changePassword(user!.username, currentPw, newPw);
    setSavingPw(false);
    if (!ok) {
      showToast("Current password is incorrect.");
      return;
    }
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    showToast("Password changed!");
  }

  function handleTextScale(v: number) {
    setTextScaleState(v);
    setTextScale(v);
  }

  function handleSignOut() {
    signOut();
    navigate("/");
  }

  function handleDeleteAccount() {
    deleteAccount(user!.username);
    signOut();
    showToast("Your account has been deleted.");
    navigate("/");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text)",
    fontSize: 14.5,
  };
  const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block", color: "var(--text-soft)" };

  return (
    <div className="container" style={{ paddingTop: 56, paddingBottom: 100, maxWidth: 640 }}>
      <RevealOnScroll>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 6 }}>Settings</h1>
        <p style={{ color: "var(--text-soft)", marginBottom: 32 }}>
          Signed in as <strong>{user.username}</strong>
        </p>
      </RevealOnScroll>

      <RevealOnScroll delay={0.05}>
        <form onSubmit={saveProfile} className="card" style={{ padding: 22, marginBottom: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Profile</div>
          <div>
            <label style={labelStyle}>Display name</label>
            <input style={inputStyle} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="How Mango and the site greet you" />
          </div>
          <div>
            <label style={labelStyle}>Phone number</label>
            <input style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" type="tel" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={savingProfile} style={{ alignSelf: "flex-start" }}>
            Save profile
          </button>
        </form>
      </RevealOnScroll>

      <RevealOnScroll delay={0.1}>
        <form onSubmit={saveEmail} className="card" style={{ padding: 22, marginBottom: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Email</div>
          <div>
            <label style={labelStyle}>Email address</label>
            <input style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          </div>
          <div>
            <label style={labelStyle}>Current password (to confirm)</label>
            <input style={inputStyle} value={emailPassword} onChange={(e) => setEmailPassword(e.target.value)} type="password" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={savingEmail} style={{ alignSelf: "flex-start" }}>
            Update email
          </button>
        </form>
      </RevealOnScroll>

      <RevealOnScroll delay={0.15}>
        <form onSubmit={savePassword} className="card" style={{ padding: 22, marginBottom: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Password</div>
          <div>
            <label style={labelStyle}>Current password</label>
            <input style={inputStyle} value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} type="password" />
          </div>
          <div>
            <label style={labelStyle}>New password</label>
            <input style={inputStyle} value={newPw} onChange={(e) => setNewPw(e.target.value)} type="password" />
          </div>
          <div>
            <label style={labelStyle}>Confirm new password</label>
            <input style={inputStyle} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} type="password" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={savingPw} style={{ alignSelf: "flex-start" }}>
            Change password
          </button>
        </form>
      </RevealOnScroll>

      <RevealOnScroll delay={0.2}>
        <div className="card" style={{ padding: 22, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Text size</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 12, color: "var(--text-soft)" }}>A</span>
            <input
              type="range"
              min={0.85}
              max={1.4}
              step={0.05}
              value={textScale}
              onChange={(e) => handleTextScale(parseFloat(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: 20, color: "var(--text-soft)" }}>A</span>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--text-soft)", marginTop: 8 }}>
            Adjusts text size across the whole site. Currently {Math.round(textScale * 100)}%.
          </div>
        </div>
      </RevealOnScroll>

      <RevealOnScroll delay={0.25}>
        <div className="card" style={{ padding: 22, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Sign out</div>
            <div style={{ fontSize: 13, color: "var(--text-soft)" }}>You can sign back in any time.</div>
          </div>
          <button className="btn btn-secondary" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </RevealOnScroll>

      <RevealOnScroll delay={0.3}>
        <div className="card" style={{ padding: 22, marginTop: 20, border: "1px solid #b23b3b55" }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#b23b3b" }}>Danger zone</div>
          <div style={{ fontSize: 13, color: "var(--text-soft)", margin: "6px 0 16px" }}>
            This permanently deletes your account and everything stored with it - history, achievements, Mango, coins. This
            can't be undone. Press and hold the button for the full 3 seconds to confirm.
          </div>
          <ButtonHoldAndRelease
            holdDuration={3000}
            label="Hold to delete account"
            holdingLabel="Keep holding to delete…"
            onComplete={handleDeleteAccount}
          />
        </div>
      </RevealOnScroll>
    </div>
  );
}
