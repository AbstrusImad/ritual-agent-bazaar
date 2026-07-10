import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { AppProvider, useApp } from "./store/AppContext";
import { HallBackground } from "./components/HallBackground";
import { TopBar } from "./components/TopBar";
import { BottomDock } from "./components/BottomDock";
import { OverlayManager } from "./components/overlays/OverlayManager";
import { ToastStack } from "./components/ui/ToastStack";
import { LoadingShimmer } from "./components/ui/LoadingShimmer";
import { BazaarView } from "./views/BazaarView";
import { VaultView } from "./views/VaultView";
import { PublishView } from "./views/PublishView";
import { ActivityView } from "./views/ActivityView";
import { DocsView } from "./views/DocsView";
import { LandingView } from "./views/LandingView";

function ActiveView() {
  const { activeView } = useApp();
  switch (activeView) {
    case "vault":
      return <VaultView />;
    case "publish":
      return <PublishView />;
    case "activity":
      return <ActivityView />;
    case "docs":
      return <DocsView />;
    default:
      return <BazaarView />;
  }
}

function Shell() {
  const { activeView } = useApp();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-obsidian">
      <HallBackground />

      <div className="relative z-10 flex h-full flex-col">
        <TopBar />

        <main className="relative min-h-0 flex-1 overflow-hidden">
          {/*
            No AnimatePresence "mode=wait" here on purpose: combined with the
            double-mount in dev it could strand the entering view at its exit
            state (opacity 0). A keyed motion.div re-mounts per view and only
            plays the enter animation, which is reliable in dev and production.
          */}
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 18, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 overflow-y-auto"
          >
            <ActiveView />
          </motion.div>
        </main>

        <div className="relative z-20 pb-6">
          <BottomDock />
        </div>
      </div>

      <OverlayManager />
      <ToastStack />
    </div>
  );
}

function ConnectedApp() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 1100);
    return () => window.clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="relative grid h-screen w-screen place-items-center overflow-hidden bg-obsidian">
        <HallBackground />
        <div className="relative z-10">
          <LoadingShimmer />
        </div>
      </div>
    );
  }

  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}

export default function App() {
  const { status } = useAccount();

  // Restoring a persisted session after a refresh: hold the doors briefly
  // instead of flashing the landing gate.
  if (status === "reconnecting") {
    return (
      <div className="relative grid h-screen w-screen place-items-center overflow-hidden bg-obsidian">
        <HallBackground />
        <div className="relative z-10">
          <LoadingShimmer text="Restoring your session..." />
        </div>
      </div>
    );
  }

  // The bazaar only opens to a connected wallet.
  if (status !== "connected") {
    return <LandingView />;
  }

  return <ConnectedApp />;
}
