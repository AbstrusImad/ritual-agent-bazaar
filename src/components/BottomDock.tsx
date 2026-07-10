import { motion } from "framer-motion";
import { Activity, BookOpen, Compass, Sparkles, Vault } from "lucide-react";
import { useApp } from "../store/AppContext";
import type { ViewId } from "../types";
import { DockItem } from "./DockItem";

const items: { id: ViewId; label: string; icon: typeof Compass }[] = [
  { id: "bazaar", label: "Bazaar", icon: Compass },
  { id: "vault", label: "Vault", icon: Vault },
  { id: "publish", label: "Publish", icon: Sparkles },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "docs", label: "Docs", icon: BookOpen },
];

export function BottomDock() {
  const { activeView, setActiveView } = useApp();

  return (
    <motion.nav
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
      className="mx-auto flex h-[84px] w-[660px] max-w-[94vw] items-center justify-between gap-1 rounded-full border border-gold/30 px-10"
      style={{
        background: "linear-gradient(180deg, rgba(22,19,15,0.82), rgba(8,7,6,0.92))",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        boxShadow:
          "0 18px 50px -18px rgba(0,0,0,0.9), 0 0 40px -10px rgba(217,164,65,0.25), inset 0 1px 0 rgba(240,217,164,0.10)",
      }}
    >
      {items.map((item) => (
        <DockItem
          key={item.id}
          icon={item.icon}
          label={item.label}
          active={activeView === item.id}
          onClick={() => setActiveView(item.id)}
        />
      ))}
    </motion.nav>
  );
}
