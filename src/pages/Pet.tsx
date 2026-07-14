import * as React from "react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, X } from "lucide-react";
import { MangoAvatar } from "@/components/MangoAvatar";
import { useToast } from "@/components/Toast";
import {
  getMangoAffection,
  addMangoAffection,
  mangoStageFor,
  getMangoCoins,
  addMangoCoins,
  incrementMangoPetCount,
  markSecretStep,
  MANGO_SHOP,
  MangoSlot,
  MangoItem,
  getMangoInventory,
  purchaseMangoItem,
  getMangoEquipped,
  equipMangoItem,
} from "@/lib/verity";
import { useAwardPopup } from "@/components/ui/award-popup";

const SECRET_PET_THRESHOLD = 30;
const PET_LINES = ["Mango wags happily!", "Mango nuzzles you.", "Mango does a happy hop!", "Mango beams at you.", "Mango purrs contentedly."];

const SLOT_TABS: { slot: MangoSlot; label: string }[] = [
  { slot: "hat", label: "Hats" },
  { slot: "outfit", label: "Outfits" },
  { slot: "background", label: "Backgrounds" },
  { slot: "color", label: "Colors" },
];

const BG_STYLES: Record<string, string> = {
  "bg-beach": "linear-gradient(180deg, #8ecfe0 0%, #f2e2a8 70%)",
  "bg-space": "linear-gradient(180deg, #1b1035 0%, #3a1f5c 100%)",
  "bg-garden": "linear-gradient(180deg, #cdeecb 0%, #eaf7e0 100%)",
  "bg-city": "linear-gradient(180deg, #2b2d52 0%, #6b4b7a 100%)",
};

export default function Pet() {
  const { showToast } = useToast();
  const { showAward } = useAwardPopup();
  const [affection, setAffection] = useState(0);
  const [coins, setCoins] = useState(0);
  const [inventory, setInventory] = useState<string[]>([]);
  const [equipped, setEquipped] = useState<Partial<Record<MangoSlot, string>>>({});
  const [activeSlot, setActiveSlot] = useState<MangoSlot>("hat");
  const [pulse, setPulse] = useState(false);
  const [coinBump, setCoinBump] = useState(false);

  useEffect(() => {
    setAffection(getMangoAffection());
    setCoins(getMangoCoins());
    setInventory(getMangoInventory());
    setEquipped(getMangoEquipped());
  }, []);

  function bumpCoinDisplay() {
    setCoinBump(true);
    setTimeout(() => setCoinBump(false), 350);
  }

  function petMango() {
    // Petting builds his affection, but no longer hands out coins - coins only come from
    // achievements and leveling up, so the shop stays meaningful instead of trivially maxed out.
    setAffection(addMangoAffection(1));
    setPulse(true);
    showToast(PET_LINES[Math.floor(Math.random() * PET_LINES.length)]);
    setTimeout(() => setPulse(false), 500);

    const pets = incrementMangoPetCount();
    if (pets === SECRET_PET_THRESHOLD) {
      const completedAll = markSecretStep("pet-mango");
      showAward({ type: "milestone", title: "Secret found: Mango's favorite friend", subtitle: "+50 Mango coins. One step closer to something bigger..." });
      setCoins(addMangoCoins(50));
      if (completedAll) {
        setTimeout(() => {
          setCoins(addMangoCoins(500));
          showAward({ type: "platinum", title: "Platinum Trophy: Verity Explorer", subtitle: "You found all three hidden secrets across the site. +500 Mango coins!" });
        }, 1200);
      }
    }
  }

  function handlePurchase(item: MangoItem) {
    if (inventory.includes(item.id)) {
      equipMangoItem(item.slot, equipped[item.slot] === item.id ? null : item.id);
      setEquipped(getMangoEquipped());
      return;
    }
    if (coins < item.price) {
      showToast("Not enough coins for that yet!");
      return;
    }
    const ok = purchaseMangoItem(item.id);
    if (ok) {
      setInventory(getMangoInventory());
      setCoins(getMangoCoins());
      bumpCoinDisplay();
      equipMangoItem(item.slot, item.id);
      setEquipped(getMangoEquipped());
      showToast(`${item.name} added to Mango's collection!`);
    }
  }

  const stage = mangoStageFor(affection);
  const stageProgress = stage.next ? Math.min(100, Math.round((affection / stage.next) * 100)) : 100;
  const bg = equipped.background ? BG_STYLES[equipped.background] : "linear-gradient(180deg, var(--card) 0%, var(--bg) 100%)";

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: bg, position: "relative", display: "flex", flexDirection: "column" }}>
      {/* coins, top right */}
      <motion.div
        animate={coinBump ? { scale: [1, 1.15, 1] } : { scale: 1 }}
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 30,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 999,
          padding: "8px 16px",
          boxShadow: "0 6px 20px rgba(0,0,0,.12)",
          fontWeight: 700,
        }}
      >
        <Coins size={18} color="#e8b43c" />
        {coins}
      </motion.div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 6 }}>
          <div style={{ fontSize: 28, fontWeight: 800 }}>Mango</div>
          <div style={{ fontSize: 14, color: "var(--text-soft)" }}>
            {stage.emoji} {stage.name}
          </div>
        </div>

        <div style={{ width: 220, height: 6, borderRadius: 999, background: "var(--border)", overflow: "hidden", marginBottom: 28 }}>
          <div style={{ width: `${stageProgress}%`, height: "100%", background: "var(--blue-deep)", transition: "width .3s ease" }} />
        </div>

        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* circular badge frame, styled after Mango's reference art: a soft lavender circle
              with a gradient ring arcing across the top */}
          <div
            style={{
              position: "relative",
              width: 280,
              height: 280,
              borderRadius: "50%",
              background: "#c7cdf2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 20px 50px rgba(0,0,0,.08)",
            }}
          >
            <svg width="280" height="280" viewBox="0 0 280 280" style={{ position: "absolute", inset: 0 }}>
              <defs>
                <linearGradient id="mangoRing" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8f7bf0" />
                  <stop offset="100%" stopColor="#c7cdf2" stopOpacity="0" />
                </linearGradient>
              </defs>
              <circle cx="140" cy="140" r="132" fill="none" stroke="url(#mangoRing)" strokeWidth="6" strokeLinecap="round" strokeDasharray="350 830" transform="rotate(-100 140 140)" />
            </svg>

            <motion.button
              onClick={petMango}
              aria-label="Pet Mango"
              animate={pulse ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={{ duration: 0.4 }}
              style={{ background: "none", border: "none", cursor: "pointer", position: "relative", padding: 0, zIndex: 1 }}
              title="Tap to pet Mango"
            >
              <MangoAvatar
                size={190}
                hat={equipped.hat}
                outfit={equipped.outfit}
                colors={equipped.color ? MANGO_SHOP.find((i) => i.id === equipped.color)?.gradient : undefined}
              />
            </motion.button>
          </div>

          <div style={{ fontSize: 13, color: "var(--text-soft)", marginTop: 14 }}>Tap Mango to pet him - builds affection</div>
        </div>
      </div>

      {/* shop */}
      <div className="card" style={{ margin: "0 auto 40px", width: "min(720px, calc(100% - 32px))", padding: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 12 }}>Mango's Shop</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {SLOT_TABS.map((t) => (
            <button
              key={t.slot}
              className={`diff-btn ${activeSlot === t.slot ? "active" : ""}`}
              onClick={() => setActiveSlot(t.slot)}
              style={{ padding: "6px 14px", fontSize: 13 }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
          {MANGO_SHOP.filter((i) => i.slot === activeSlot).map((item) => {
            const owned = inventory.includes(item.id);
            const isEquipped = equipped[item.slot] === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handlePurchase(item)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: "14px 10px",
                  borderRadius: 12,
                  border: isEquipped ? "2px solid var(--blue-deep)" : "1px solid var(--border)",
                  background: "var(--bg)",
                  cursor: "pointer",
                }}
              >
                {item.slot === "color" && item.gradient ? (
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: `linear-gradient(180deg, ${item.gradient[0]}, ${item.gradient[1]}, ${item.gradient[2]})`,
                      border: "1px solid var(--border)",
                    }}
                  />
                ) : (
                  <div style={{ fontSize: 30 }}>{item.emoji}</div>
                )}
                <div style={{ fontSize: 12.5, fontWeight: 600, textAlign: "center" }}>{item.name}</div>
                <div style={{ fontSize: 11.5, color: owned ? "var(--blue-deep)" : "var(--text-soft)", display: "flex", alignItems: "center", gap: 3 }}>
                  {owned ? (isEquipped ? "Equipped ✓" : "Owned - tap to equip") : (
                    <>
                      <Coins size={11} /> {item.price}
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
