import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Upload, Check } from "lucide-react";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { useToast } from "@/components/Toast";
import { ButtonHoldAndRelease } from "@/components/ui/hold-and-release-button";
import { Switch } from "@/components/ui/material-design-3-switch";
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
  exportAllData,
  importAllData,
  THEMES,
  getThemeId,
  setThemeId,
  type ThemeId,
  getAccessibilityPrefs,
  setAccessibilityPrefs,
  type AccessibilityPrefs,
  getSpeechBackendUrl,
  setSpeechBackendUrl,
} from "@/lib/verity";

export default function Settings() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const user = getUser();

  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [email, setEmail] = useState(user?.email || "");
  const [emailPassword, setEmailPassword] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  const [textScale, setTextScaleState] = useState(1);
  const [theme, setThemeState] = useState<ThemeId>("default");
  const [speechBackendUrl, setSpeechBackendUrlState] = useState("");
  const [savingBackend, setSavingBackend] = useState(false);
  const [a11y, setA11yState] = useState<AccessibilityPrefs>(getAccessibilityPrefs());

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    const profile = getUserProfile(user.username);
    setDisplayName(profile.displayName || "");
    setPhone(profile.phone || "");
    setAge(profile.age ? String(profile.age) : "");
    setTextScaleState(getTextScale());
    setThemeState(getThemeId());
    setA11yState(getAccessibilityPrefs());
    setSpeechBackendUrlState(getSpeechBackendUrl());
  }, []);

  if (!user) return null;

  function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    const parsedAge = age.trim() ? parseInt(age.trim(), 10) : undefined;
    if (age.trim() && (Number.isNaN(parsedAge) || parsedAge! < 1 || parsedAge! > 120)) {
      showToast("Please enter a valid age between 1 and 120.");
      return;
    }
    setSavingProfile(true);
    setUserProfile(user!.username, { displayName: displayName.trim(), phone: phone.trim(), age: parsedAge });
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

  function handleTheme(id: ThemeId) {
    setThemeState(id);
    setThemeId(id);
  }

  function handleA11y(key: keyof AccessibilityPrefs, value: boolean) {
    const next = { ...a11y, [key]: value };
    setA11yState(next);
    setAccessibilityPrefs(next);
  }

  function saveSpeechBackend(e: React.FormEvent) {
    e.preventDefault();
    setSavingBackend(true);
    setSpeechBackendUrl(speechBackendUrl);
    setSavingBackend(false);
    showToast(speechBackendUrl ? "Speech model backend saved." : "Speech model backend cleared - back to Gemini/local scoring.");
  }

  function handleBackup() {
    const json = exportAllData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `verity-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Backup downloaded.");
  }

  const fileInputRef = useRef<HTMLInputElement>(null);
  function handleRestoreClick() {
    fileInputRef.current?.click();
  }
  function handleRestoreFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!window.confirm("Restoring a backup will overwrite any matching accounts and data currently on this device. Continue?")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = importAllData(String(reader.result || ""));
      if (!result.ok) {
        showToast(result.reason || "Restore failed.");
        return;
      }
      showToast(`Restored ${result.keysRestored} item${result.keysRestored === 1 ? "" : "s"}. Reloading…`);
      setTimeout(() => window.location.reload(), 1200);
    };
    reader.readAsText(file);
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
          <div>
            <label style={labelStyle}>Age</label>
            <input
              style={inputStyle}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Optional - used to compare your test results to your age group"
              type="number"
              min={1}
              max={120}
            />
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

      <RevealOnScroll delay={0.21}>
        <div className="card" style={{ padding: 22, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Theme</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTheme(t.id)}
                aria-label={`${t.label} theme`}
                title={t.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: t.swatch,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: theme === t.id ? "3px solid var(--text)" : "1px solid var(--border)",
                    boxSizing: "border-box",
                  }}
                >
                  {theme === t.id && <Check size={15} color="#fff" />}
                </span>
                <span style={{ fontSize: 11.5, color: "var(--text-soft)" }}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </RevealOnScroll>

      <RevealOnScroll delay={0.215}>
        <div className="card" style={{ padding: 22, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Accessibility</div>
          <div style={{ fontSize: 12.5, color: "var(--text-soft)", marginBottom: 16 }}>
            These apply across the whole site immediately, and are remembered on this device.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {(
              [
                { key: "reduceMotion", label: "Reduce motion", desc: "Turns off animations and transitions site-wide." },
                { key: "dyslexiaFont", label: "Dyslexia-friendly font", desc: "Switches body text to a more legible, evenly-spaced font." },
                { key: "highContrast", label: "High contrast", desc: "Pure black background with white text and borders for maximum contrast." },
                { key: "underlineLinks", label: "Underline links", desc: "Makes every link underlined, not just colored, so they're distinguishable without color." },
                { key: "largeTargets", label: "Larger click targets", desc: "Increases the size of buttons and inputs for easier tapping and clicking." },
              ] as { key: keyof AccessibilityPrefs; label: string; desc: string }[]
            ).map((item) => (
              <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: "var(--text-soft)", marginTop: 2 }}>{item.desc}</div>
                </div>
                <Switch checked={a11y[item.key]} onCheckedChange={(v) => handleA11y(item.key, v)} haptic="light" />
              </div>
            ))}
          </div>
        </div>
      </RevealOnScroll>

      <RevealOnScroll delay={0.218}>
        <form onSubmit={saveSpeechBackend} className="card" style={{ padding: 22, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Speech model backend (advanced)</div>
          <div style={{ fontSize: 12.5, color: "var(--text-soft)", marginBottom: 14, lineHeight: 1.5 }}>
            Optional. Points the speech test at a real, trained scikit-learn model (logistic regression, trained on the
            EWA-DB dataset, 62 openSMILE eGeMAPSv02 features, validated AUC 0.894) instead of Gemini or the local
            heuristic. Requires running the backend in the repo's <code>/backend</code> folder yourself - see its
            README. Leave blank to keep using Gemini/local scoring.
          </div>
          <input
            value={speechBackendUrl}
            onChange={(e) => setSpeechBackendUrlState(e.target.value)}
            placeholder="https://your-backend.onrender.com"
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--text)",
              fontSize: 14,
              marginBottom: 14,
            }}
          />
          <button className="btn btn-primary" type="submit" disabled={savingBackend} style={{ alignSelf: "flex-start" }}>
            Save
          </button>
        </form>
      </RevealOnScroll>

      <RevealOnScroll delay={0.22}>
        <div className="card" style={{ padding: 22, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Backup & restore</div>
          <div style={{ fontSize: 12.5, color: "var(--text-soft)", marginBottom: 16, lineHeight: 1.5 }}>
            Everything in Verity lives only on this device. Download a backup file now and then to protect against a
            cleared browser cache or a new device - you can restore it here any time.
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-secondary btn-sm" onClick={handleBackup} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Download size={14} />
              Download backup
            </button>
            <button className="btn btn-outline btn-sm" onClick={handleRestoreClick} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Upload size={14} />
              Restore from backup
            </button>
            <input ref={fileInputRef} type="file" accept="application/json" onChange={handleRestoreFile} style={{ display: "none" }} />
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
