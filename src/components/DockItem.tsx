import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "../lib/cn";

interface DockItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function DockItem({ icon: Icon, label, active, onClick }: DockItemProps) {
  return (
    <motion.button
      whileHover={{ y: -3 }}
      onClick={onClick}
      className="relative flex flex-1 flex-col items-center gap-1 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian"
    >
      {/* icon emblem: the active one sits in a glowing ringed circle */}
      <span
        className={cn(
          "grid h-9 w-9 place-items-center rounded-full transition-all duration-300",
          active
            ? "border border-gold/60 bg-gold/10 shadow-goldglow"
            : "border border-transparent group-hover:border-gold/20",
        )}
      >
        <Icon
          className={cn(
            "h-[18px] w-[18px] transition-all duration-300",
            active
              ? "text-gold drop-shadow-[0_0_10px_rgba(240,217,164,0.8)]"
              : "text-silver/55 hover:text-champagne",
          )}
        />
      </span>
      <span
        className={cn(
          "text-[12px] tracking-wide transition-colors",
          active ? "text-ivory" : "text-silver/50",
        )}
      >
        {label}
      </span>
      {active ? (
        <motion.span
          layoutId="dock-active-dot"
          className="absolute -bottom-1.5 h-1 w-1 rounded-full bg-gold shadow-goldglow"
        />
      ) : null}
    </motion.button>
  );
}
