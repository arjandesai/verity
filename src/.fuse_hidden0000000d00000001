import * as React from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Home as HomeIcon, ClipboardList, Gamepad2, LineChart } from "lucide-react";
import { Nav } from "@/components/Nav";
import { CinematicFooter } from "@/components/ui/motion-footer";
import { ToastProvider } from "@/components/Toast";
import { AwardPopupProvider } from "@/components/ui/award-popup";
import { Buddy } from "@/components/Buddy";
import { SecretHunter } from "@/components/SecretHunter";
import Dock from "@/components/ui/dock";
import { TermsGate } from "@/components/TermsGate";
import { useIsMobile } from "@/lib/useIsMobile";
import Home from "@/pages/Home";
import Tests from "@/pages/Tests";
import Speech from "@/pages/Speech";
import Handwriting from "@/pages/Handwriting";
import Dashboard from "@/pages/Dashboard";
import Games from "@/pages/Games";
import About from "@/pages/About";
import Legal from "@/pages/Legal";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Pet from "@/pages/Pet";
import Settings from "@/pages/Settings";
import { getTextScale, applyTextScale } from "@/lib/verity";

function GlobalDock() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  if (isMobile) return null; // mobile uses the Nav's hamburger menu instead, to keep the screen uncluttered
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <Dock
        items={[
          { icon: HomeIcon, label: "Home", onClick: () => navigate("/"), active: location.pathname === "/" },
          { icon: ClipboardList, label: "Tests", onClick: () => navigate("/tests"), active: ["/tests", "/speech", "/handwriting"].includes(location.pathname) },
          { icon: Gamepad2, label: "Games", onClick: () => navigate("/games"), active: location.pathname === "/games" },
          { icon: LineChart, label: "Dashboard", onClick: () => navigate("/dashboard"), active: location.pathname === "/dashboard" },
        ]}
      />
    </div>
  );
}

export default function App() {
  React.useEffect(() => {
    applyTextScale(getTextScale());
  }, []);
  return (
    <ToastProvider>
      <AwardPopupProvider>
      <TermsGate>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <Nav />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tests" element={<Tests />} />
              <Route path="/speech" element={<Speech />} />
              <Route path="/handwriting" element={<Handwriting />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/games" element={<Games />} />
              <Route path="/about" element={<About />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/pet" element={<Pet />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
          <CinematicFooter />
          <GlobalDock />
          <Buddy />
          <SecretHunter />
        </div>
      </TermsGate>
      </AwardPopupProvider>
    </ToastProvider>
  );
}
