import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, ChevronDown, Mic, PenLine, Gamepad2, ClipboardList, LineChart, Info, ShieldCheck, PawPrint, Settings as SettingsIcon, Coins } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeToggle } from "./ui/theme-toggle";
import { LogoMark } from "./LogoMark";
import { getUser, signOut, getMangoCoins, getMangoEquipped, getDailyActivityCount, MANGO_SHOP, type VerityUser } from "@/lib/verity";
import { MangoAvatar } from "@/components/MangoAvatar";
import { useIsMobile } from "@/lib/useIsMobile";

interface SubLink {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
}

interface MenuEntry {
  label: string;
  to?: string;
  items?: SubLink[];
}

const MENU: MenuEntry[] = [
  { label: "Home", to: "/" },
  {
    label: "Tests",
    items: [
      { title: "All tests", description: "See every screening tool in one place.", icon: <ClipboardList className="size-5 shrink-0" />, to: "/tests" },
      { title: "Speech test", description: "Record a short reading sample for analysis.", icon: <Mic className="size-5 shrink-0" />, to: "/speech" },
      { title: "Handwriting test", description: "Write or upload a sample to check steadiness.", icon: <PenLine className="size-5 shrink-0" />, to: "/handwriting" },
      { title: "Brain-training games", description: "Nine games with levels and difficulty tiers.", icon: <Gamepad2 className="size-5 shrink-0" />, to: "/games" },
    ],
  },
  { label: "Dashboard", to: "/dashboard" },
  { label: "Mango", to: "/pet" },
  {
    label: "About",
    items: [
      { title: "About Verity", description: "What Verity is and how it works.", icon: <Info className="size-5 shrink-0" />, to: "/about" },
      { title: "Privacy & Terms", description: "How your data is handled, and the terms of use.", icon: <ShieldCheck className="size-5 shrink-0" />, to: "/legal" },
    ],
  },
];

// Flat list used by the mobile drawer, where dropdowns don't make sense - every real page, one level.
const MOBILE_LINKS = [
  { to: "/", label: "Home" },
  { to: "/tests", label: "Tests" },
  { to: "/speech", label: "Speech test" },
  { to: "/handwriting", label: "Handwriting test" },
  { to: "/games", label: "Games" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/pet", label: "Mango (pet)" },
  { to: "/about", label: "About" },
  { to: "/legal", label: "Privacy & Terms" },
  { to: "/settings", label: "Settings" },
];

function DesktopDropdown({ entry, active, transparent }: { entry: MenuEntry; active: boolean; transparent?: boolean }) {
  const [open, setOpen] = useState(false);
  const inactiveClass = transparent ? "" : "text-text-soft hover:text-text";
  const inactiveStyle: React.CSSProperties = transparent ? { color: "rgba(255,255,255,0.85)" } : {};
  if (!entry.items) {
    return (
      <Link
        to={entry.to!}
        className={active ? "text-blue-deep font-semibold" : inactiveClass}
        style={{ fontSize: 14, ...(active ? {} : inactiveStyle) }}
      >
        {entry.label}
      </Link>
    );
  }
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        className={active ? "text-blue-deep font-semibold" : inactiveClass}
        style={{
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          gap: 4,
          background: "none",
          border: "none",
          cursor: "pointer",
          ...(active ? {} : inactiveStyle),
        }}
      >
        {entry.label}
        <ChevronDown size={14} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="card"
            style={{ position: "absolute", top: "calc(100% + 10px)", left: -20, width: 340, padding: 10, zIndex: 60 }}
          >
            {entry.items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="hover:bg-card"
                style={{ display: "flex", gap: 12, padding: 10, borderRadius: 10, alignItems: "flex-start" }}
              >
                <span style={{ color: "var(--blue-deep)", marginTop: 2 }}>{item.icon}</span>
                <span>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{item.title}</div>
                  <div className="text-text-soft" style={{ fontSize: 12, marginTop: 2, lineHeight: 1.4 }}>
                    {item.description}
                  </div>
                </span>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Nav() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [user, setUser] = useState<VerityUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [coins, setCoins] = useState(0);
  const [equipped, setEquipped] = useState<Partial<Record<string, string>>>({});
  const [dailyCount, setDailyCount] = useState(0);

  const isHome = location.pathname === "/";

  useEffect(() => {
    setUser(getUser());
    setMenuOpen(false);
    setScrolled(window.scrollY > 40);
    setCoins(getMangoCoins());
    setEquipped(getMangoEquipped());
    setDailyCount(getDailyActivityCount());
  }, [location.pathname]);

  // Keep the coin count (and avatar look) fresh even without a route change (e.g. petting Mango
  // via the Buddy widget, or buying something new while sitting on the same page).
  useEffect(() => {
    const id = setInterval(() => {
      setCoins(getMangoCoins());
      setEquipped(getMangoEquipped());
      setDailyCount(getDailyActivityCount());
    }, 1500);
    return () => clearInterval(id);
  }, []);

  // On the home page, the nav starts transparent over the hero image and only picks up its
  // solid/blurred background once you've scrolled past it - everywhere else it stays solid.
  useEffect(() => {
    if (!isHome) return;
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const transparent = isHome && !scrolled;

  function handleSignOut() {
    signOut();
    setUser(null);
    setMenuOpen(false);
    navigate("/");
  }

  function handleLogoClick(e: React.MouseEvent) {
    e.preventDefault();
    setMenuOpen(false);
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
      // wait a tick for the route to mount before scrolling, in case it lands mid-page
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    }
  }

  function isEntryActive(entry: MenuEntry): boolean {
    if (entry.to) return location.pathname === entry.to;
    return (entry.items || []).some((i) => i.to === location.pathname);
  }

  return (
    <header
      className={`${isHome ? "fixed" : "sticky"} top-0 z-50`}
      style={{
        width: "100%",
        backdropFilter: transparent ? "none" : "blur(10px)",
        background: transparent ? "transparent" : "var(--bg)",
        borderBottom: transparent ? "1px solid transparent" : "1px solid var(--border)",
        opacity: transparent ? 1 : 0.96,
        transition: "background 0.25s ease, border-color 0.25s ease, backdrop-filter 0.25s ease",
        color: transparent ? "#fff" : "var(--text)",
      }}
    >
      <div className="container flex items-center justify-between" style={{ height: isMobile ? 56 : 64 }}>
        <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2 font-extrabold text-lg" style={{ color: "inherit" }}>
          <LogoMark size={isMobile ? 26 : 30} />
          Verity
        </Link>
        <nav className="hidden md:flex items-center gap-7">
          {MENU.map((entry) => (
            <DesktopDropdown key={entry.label} entry={entry} active={isEntryActive(entry)} transparent={transparent} />
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {user && (
            <div
              title={`${dailyCount} of 3 daily activities done today (speech, handwriting, games)`}
              aria-label="Daily activity progress"
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: i < dailyCount ? "var(--blue-deep)" : "transparent",
                    border: `1.5px solid ${i < dailyCount ? "var(--blue-deep)" : transparent ? "rgba(255,255,255,0.4)" : "var(--border)"}`,
                    transition: "background 0.2s ease",
                  }}
                />
              ))}
            </div>
          )}
          {user && (
            <Link
              to="/pet"
              aria-label="Your Mango avatar"
              title="Your Mango avatar"
              style={{ display: "flex", alignItems: "center", borderRadius: "50%", overflow: "hidden", lineHeight: 0 }}
            >
              <MangoAvatar
                size={30}
                mouthOpen={false}
                hat={equipped.hat}
                outfit={equipped.outfit}
                colors={equipped.color ? MANGO_SHOP.find((i) => i.id === equipped.color)?.gradient : undefined}
              />
            </Link>
          )}
          {user && (
            <Link
              to="/pet"
              aria-label="Mango coins"
              title="Mango coins - visit Mango's page to spend them"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 12px",
                borderRadius: 999,
                border: transparent ? "1px solid rgba(255,255,255,0.35)" : "1px solid var(--border)",
                background: transparent ? "rgba(255,255,255,0.12)" : "var(--card)",
                color: "inherit",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              <Coins size={15} color="#e8b43c" />
              {coins}
            </Link>
          )}
          <ThemeToggle />
          {user && (
            <Link
              to="/settings"
              aria-label="Settings"
              className="hidden md:flex"
              style={{ alignItems: "center", justifyContent: "center", color: "inherit" }}
              title="Settings"
            >
              <SettingsIcon size={18} />
            </Link>
          )}
          <div className="hidden md:block">
            {user ? (
              <button className="btn btn-secondary btn-sm" onClick={handleSignOut}>
                Sign out
              </button>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">
                Sign in
              </Link>
            )}
          </div>
          {isMobile && (
            <button
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((o) => !o)}
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: "inherit" }}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isMobile && menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border"
            style={{ overflow: "hidden", background: "var(--card)" }}
          >
            <div className="container flex flex-col gap-1" style={{ padding: "14px 24px 20px" }}>
              {MOBILE_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  style={{
                    padding: "12px 4px",
                    fontSize: 16,
                    fontWeight: location.pathname === l.to ? 700 : 500,
                    color: location.pathname === l.to ? "var(--blue-deep)" : "var(--text)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  {l.label}
                </Link>
              ))}
              <div style={{ marginTop: 14 }}>
                {user ? (
                  <button className="btn btn-secondary" onClick={handleSignOut} style={{ width: "100%" }}>
                    Sign out
                  </button>
                ) : (
                  <Link to="/login" className="btn btn-primary" style={{ width: "100%", display: "block", textAlign: "center" }}>
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
