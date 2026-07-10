import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";

type Variant = "ghost" | "gold" | "emerald" | "primary";

interface GlassButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: Variant;
  className?: string;
  icon?: ReactNode;
  size?: "sm" | "md";
}

const variantClass: Record<Variant, string> = {
  ghost:
    "glass gold-border text-ivory hover:border-gold/60 hover:shadow-goldglow",
  gold:
    "glass border border-gold/45 text-champagne hover:border-gold hover:shadow-goldglow",
  emerald:
    "glass border border-emerald/45 text-emerald hover:border-emerald hover:shadow-emeraldglow",
  primary:
    "border border-gold/70 text-obsidian font-semibold hover:shadow-goldglow",
};

export function GlassButton({
  children,
  onClick,
  variant = "ghost",
  className,
  icon,
  size = "md",
}: GlassButtonProps) {
  const primaryStyle =
    variant === "primary"
      ? {
          background:
            "linear-gradient(135deg, #f0d9a4 0%, #d9a441 55%, #a9772a 100%)",
        }
      : undefined;

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={primaryStyle}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full transition-all duration-300",
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
        variantClass[variant],
        className,
      )}
    >
      {icon}
      {children}
    </motion.button>
  );
}
