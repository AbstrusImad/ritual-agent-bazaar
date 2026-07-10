import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { GlassButton } from "../GlassButton";

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export function EmptyState({ title, subtitle, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center"
    >
      {/* Empty glass capsule */}
      <div
        className="mb-6 grid h-40 w-24 place-items-center rounded-[999px_999px_20px_20px] border border-gold/25"
        style={{
          background: "linear-gradient(180deg, rgba(243,237,225,0.05), rgba(6,5,5,0.4))",
          boxShadow: "inset 0 16px 40px -16px rgba(217,164,65,0.3)",
        }}
      >
        {icon ?? <span className="h-10 w-10 animate-pulseglow rounded-full bg-gold/20" />}
      </div>
      <h3 className="font-display text-2xl text-ivory">{title}</h3>
      {subtitle ? <p className="mt-2 max-w-sm text-sm text-silver/70">{subtitle}</p> : null}
      {actionLabel && onAction ? (
        <GlassButton variant="gold" className="mt-5" onClick={onAction}>
          {actionLabel}
        </GlassButton>
      ) : null}
    </motion.div>
  );
}
