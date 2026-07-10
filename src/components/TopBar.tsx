import { motion } from "framer-motion";
import { RitualSigil } from "./RitualSigil";
import { SearchBar } from "./SearchBar";
import { WalletChip } from "./WalletChip";

export function TopBar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative z-30 w-full"
    >
      <div className="flex h-[78px] items-center justify-between px-8">
        {/* Left: logo + name */}
        <div className="flex items-center gap-3">
          <RitualSigil size={30} />
          <span className="font-display text-xl font-semibold tracking-[0.14em] text-ivory">
            Ritual Agent Bazaar
          </span>
        </div>

        {/* Center: search */}
        <div className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <SearchBar />
        </div>

        {/* Right: wallet chip */}
        <WalletChip />
      </div>

      {/* Thin gold separator */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
    </motion.header>
  );
}
