import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useApp } from "../store/AppContext";

export function SearchBar() {
  const { openOverlay } = useApp();

  return (
    <motion.button
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5 }}
      onClick={() => openOverlay("search")}
      onFocus={() => openOverlay("search")}
      className="glass gold-border flex h-11 w-[440px] max-w-[52vw] items-center gap-3 rounded-full px-4 text-left transition-all duration-300 hover:border-gold/60 hover:shadow-goldglow"
    >
      <Search className="h-4 w-4 text-champagne/70" />
      <span className="text-sm text-silver/50">Search agents, creators, or missions...</span>
    </motion.button>
  );
}
