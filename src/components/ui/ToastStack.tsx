import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";
import { useApp } from "../../store/AppContext";
import { cn } from "../../lib/cn";

const toneClass = {
  gold: "border-gold/50 text-champagne",
  emerald: "border-emerald/50 text-emerald",
  ruby: "border-ruby/50 text-ruby",
};

export function ToastStack() {
  const { toasts } = useApp();

  return (
    <div className="pointer-events-none fixed bottom-[120px] right-6 z-[60] flex flex-col items-end gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className={cn(
              // pointer-events stay OFF: toasts are informational, and an
              // interactive pill stuck mid-exit would invisibly block the dock.
              "glass flex items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm shadow-goldglow",
              toneClass[toast.tone],
            )}
          >
            {toast.tone === "emerald" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span className="text-ivory">{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
