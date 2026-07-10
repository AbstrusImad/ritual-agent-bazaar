import { motion } from "framer-motion";

export function LoadingShimmer({ text = "Preparing gallery..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative h-44 w-28 overflow-hidden rounded-[999px_999px_20px_20px] border border-gold/25">
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, transparent 20%, rgba(217,164,65,0.28) 50%, transparent 80%)",
          }}
          animate={{ x: ["-120%", "120%"] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        />
        <div className="absolute inset-x-0 bottom-4 flex justify-center">
          <span className="h-8 w-8 animate-pulseglow rounded-full bg-gold/30" />
        </div>
      </div>
      <p className="text-sm tracking-[0.2em] text-champagne/70">{text}</p>
    </div>
  );
}
