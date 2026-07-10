import { useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";

interface OverlayShellProps {
  onClose: () => void;
  children: ReactNode;
  className?: string;
  labelledBy?: string;
}

export function OverlayShell({ onClose, children, className, labelledBy }: OverlayShellProps) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[65] grid place-items-center bg-black/72 p-4 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
        onClick={(event) => event.stopPropagation()}
        className={cn("glass relative max-h-[90vh] overflow-y-auto rounded-3xl border border-gold/40 shadow-goldglow", className)}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full text-silver/60 transition hover:bg-white/5 hover:text-ivory"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}
