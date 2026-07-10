import { motion } from "framer-motion";
import { Star } from "lucide-react";
import type { Agent } from "../types";
import { themeTokens } from "../lib/theme";
import { cn } from "../lib/cn";
import { BellJar } from "./BellJar";

interface AgentCapsuleProps {
  agent: Agent;
  isSelected: boolean;
  index: number;
  onInspect: () => void;
}

/** A bell jar on exhibition: the jar art, its light, and the plaque below. */
export function AgentCapsule({ agent, isSelected, index, onInspect }: AgentCapsuleProps) {
  const tokens = themeTokens[agent.theme];
  const W = isSelected ? 206 : 152;

  return (
    <motion.div
      initial={{ opacity: 0, y: 44, scale: 0.92 }}
      animate={{ opacity: isSelected ? 1 : 0.8, y: 0, scale: 1 }}
      transition={{ delay: 0.25 + index * 0.1, duration: 0.7, ease: "easeOut" }}
      className="group relative flex flex-col items-center"
      style={{ zIndex: isSelected ? 20 : 10 }}
    >
      {/* Clicking anywhere on the jar or pedestal opens the inspect modal */}
      <motion.button
        onClick={onInspect}
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        className="relative focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian"
        aria-label={`Inspect ${agent.name}`}
        style={{
          width: W,
          filter: `drop-shadow(0 0 ${isSelected ? 34 : 18}px ${tokens.glow})`,
        }}
      >
        <BellJar theme={agent.theme} intense={isSelected} />
      </motion.button>

      {/* Exhibition plaque */}
      <div className="mt-3 flex w-[200px] flex-col items-center text-center">
        <h3 className={cn("font-display font-semibold tracking-wide text-ivory", isSelected ? "text-[22px]" : "text-lg")}>
          {agent.name}
        </h3>
        <span className={cn("mt-0.5 text-[11px] tracking-[0.08em]", tokens.categoryClass)}>{agent.category}</span>
        <span className="mt-1 flex items-center gap-1 text-[13px] text-gold">
          <Star className="h-3.5 w-3.5 fill-gold text-gold" />
          {agent.rating}
        </span>
        <span className="mt-0.5 text-[13px] text-ivory/90">
          {agent.price.split(" ")[0]} <span className="text-silver/70">{agent.price.split(" ")[1]}</span>
        </span>
        <button
          onClick={onInspect}
          className={cn(
            "mt-2.5 rounded-lg border text-[13px] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50",
            isSelected
              ? "border-gold/60 bg-gold/10 px-7 py-1.5 text-champagne shadow-goldglow hover:bg-gold/20"
              : "border-gold/25 bg-black/30 px-5 py-1 text-silver/80 hover:border-gold/50 hover:text-champagne",
          )}
        >
          Inspect
        </button>
      </div>
    </motion.div>
  );
}
