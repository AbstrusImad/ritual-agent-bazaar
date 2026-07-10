import { useId } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import type { Agent } from "../types";
import { themeTokens } from "../lib/theme";
import { cn } from "../lib/cn";
import { AgentForm } from "./AgentForm";

interface AgentCapsuleProps {
  agent: Agent;
  isSelected: boolean;
  index: number;
  onInspect: () => void;
}

/**
 * Hand-drawn museum bell jar, pure SVG (zero assets, zero libraries).
 *
 * Three stacked layers sell the volume:
 *  1. BACK   — inner glow, god-beam, back rim (seen "through" the glass),
 *              floor shadow, caustic pool, pulse rings, reflection.
 *  2. MIDDLE — the hologram (AgentForm) with orbiting rings + dust motes.
 *  3. FRONT  — the glass itself: silhouette fill, fresnel edges, dome
 *              speculars, streak reflections, front rim, and the pedestal.
 */
export function AgentCapsule({ agent, isSelected, index, onInspect }: AgentCapsuleProps) {
  const tokens = themeTokens[agent.theme];
  const uid = useId().replace(/[:]/g, "");
  const W = isSelected ? 206 : 152;

  return (
    <motion.div
      initial={{ opacity: 0, y: 44, scale: 0.92 }}
      animate={{ opacity: isSelected ? 1 : 0.8, y: 0, scale: 1 }}
      transition={{ delay: 0.25 + index * 0.1, duration: 0.7, ease: "easeOut" }}
      className="group relative flex flex-col items-center"
      style={{ zIndex: isSelected ? 20 : 10 }}
    >
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
        {/* ================= BACK LAYER ================= */}
        <svg viewBox="0 0 200 440" className="block w-full" aria-hidden>
          <defs>
            <radialGradient id={`ig-${uid}`} cx="50%" cy="62%" r="55%">
              <stop offset="0%" stopColor={tokens.glow} />
              <stop offset="55%" stopColor={tokens.glow} stopOpacity="0.35" />
              <stop offset="100%" stopColor={tokens.glow} stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`beam-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={tokens.glow} stopOpacity="0.16" />
              <stop offset="100%" stopColor={tokens.glow} stopOpacity="0" />
            </linearGradient>
            <radialGradient id={`pool-${uid}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={tokens.ring} stopOpacity="0.5" />
              <stop offset="60%" stopColor={tokens.ring} stopOpacity="0.14" />
              <stop offset="100%" stopColor={tokens.ring} stopOpacity="0" />
            </radialGradient>
            <filter id={`b6-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
            <filter id={`b10-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="10" />
            </filter>
          </defs>

          {/* volumetric glow inside the jar */}
          <ellipse
            cx="100"
            cy="288"
            rx="58"
            ry="88"
            fill={`url(#ig-${uid})`}
            filter={`url(#b10-${uid})`}
            className="animate-pulseglow"
          />
          {/* god-beam from the hologram down to the base */}
          <path d="M100 84 L62 314 L138 314 Z" fill={`url(#beam-${uid})`} style={{ mixBlendMode: "screen" }} />
          {/* back rim of the jar, visible through the glass */}
          <ellipse cx="100" cy="316" rx="76" ry="12" fill="none" stroke="rgba(243,237,225,0.12)" strokeWidth="1" />

          {/* contact shadow under the pedestal */}
          <ellipse cx="100" cy="390" rx="95" ry="10" fill="rgba(0,0,0,0.6)" filter={`url(#b6-${uid})`} />
          {/* caustic light pool */}
          <ellipse cx="100" cy="396" rx="104" ry="15" fill={`url(#pool-${uid})`} className="animate-pulseglow" />
          {/* expanding rings for the selected capsule */}
          {isSelected
            ? [0, 1, 2].map((i) => (
                <ellipse
                  key={i}
                  cx="100"
                  cy="396"
                  rx="100"
                  ry="14"
                  fill="none"
                  stroke={tokens.ring}
                  strokeWidth="1"
                  className="svg-ringpulse"
                  style={{ animationDelay: `${i * 1.15}s` }}
                />
              ))
            : null}
          {/* reflection: light spilling down the marble */}
          <ellipse cx="100" cy="406" rx="62" ry="9" fill={tokens.glow} opacity="0.3" filter={`url(#b6-${uid})`} />
          <ellipse cx="100" cy="426" rx="38" ry="9" fill={tokens.glow} opacity="0.14" filter={`url(#b10-${uid})`} />
        </svg>

        {/* ================= HOLOGRAM LAYER ================= */}
        <div className="absolute" style={{ left: "13%", right: "13%", top: "17.5%", bottom: "29%" }}>
          {/* orbiting rings + moons */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
            <g className="svg-spin">
              <ellipse cx="50" cy="55" rx="44" ry="11" fill="none" stroke={tokens.rim} strokeWidth="0.7" opacity="0.55" />
              <circle cx="94" cy="55" r="1.7" fill={tokens.base} />
              <circle cx="16.3" cy="62.7" r="1.3" fill={tokens.base} opacity="0.85" />
              <circle cx="35" cy="43.7" r="1" fill={tokens.base} opacity="0.7" />
            </g>
            <g className="svg-spin-rev">
              <ellipse
                cx="50"
                cy="52"
                rx="38"
                ry="26"
                fill="none"
                stroke={tokens.rim}
                strokeWidth="0.5"
                opacity="0.3"
                transform="rotate(64 50 52)"
              />
              <circle cx="82" cy="70" r="1.2" fill={tokens.base} opacity="0.8" />
            </g>
          </svg>
          {/* the entity itself */}
          <div className="animate-flicker absolute inset-[6%]">
            <AgentForm theme={agent.theme} />
          </div>
          {/* dust motes drifting upward */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
            {[
              [22, 78, 0], [70, 84, 1.6], [40, 90, 3.1], [82, 62, 4.4], [30, 55, 5.6], [58, 70, 7.2],
            ].map(([x, y, delay], i) => (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={i % 2 === 0 ? 0.9 : 0.6}
                fill={tokens.base}
                opacity="0.7"
                className="animate-drift"
                style={{ animationDelay: `${delay}s`, animationDuration: `${7 + i}s` }}
              />
            ))}
          </svg>
        </div>

        {/* ================= FRONT GLASS + PEDESTAL ================= */}
        <svg viewBox="0 0 200 440" className="absolute inset-0 block w-full" aria-hidden>
          <defs>
            <linearGradient id={`glass-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(243,237,225,0.11)" />
              <stop offset="30%" stopColor="rgba(243,237,225,0.03)" />
              <stop offset="72%" stopColor="rgba(10,8,6,0.08)" />
              <stop offset="100%" stopColor="rgba(4,3,3,0.30)" />
            </linearGradient>
            <linearGradient id={`edge-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(243,237,225,0.70)" />
              <stop offset="28%" stopColor="rgba(243,237,225,0.26)" />
              <stop offset="78%" stopColor="rgba(243,237,225,0.10)" />
              <stop offset="100%" stopColor={tokens.rim} />
            </linearGradient>
            <linearGradient id={`streak-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(243,237,225,0.20)" />
              <stop offset="70%" stopColor="rgba(243,237,225,0.05)" />
              <stop offset="100%" stopColor="rgba(243,237,225,0)" />
            </linearGradient>
            <linearGradient id={`ped-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#221b13" />
              <stop offset="55%" stopColor="#100d09" />
              <stop offset="100%" stopColor="#070604" />
            </linearGradient>
            <linearGradient id={`pedtop-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#33291a" />
              <stop offset="100%" stopColor="#15110c" />
            </linearGradient>
            <filter id={`fb2-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2" />
            </filter>
            <filter id={`fb4-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>

          {/* glass body */}
          <path
            d="M24 316 L24 76 A76 60 0 0 1 176 76 L176 316 A76 12 0 0 1 24 316 Z"
            fill={`url(#glass-${uid})`}
          />
          {/* fresnel edge — soft halo then crisp line */}
          <path
            d="M24 316 L24 76 A76 60 0 0 1 176 76 L176 316"
            fill="none"
            stroke={`url(#edge-${uid})`}
            strokeWidth="3.5"
            opacity="0.5"
            filter={`url(#fb2-${uid})`}
          />
          <path
            d="M24 316 L24 76 A76 60 0 0 1 176 76 L176 316"
            fill="none"
            stroke={`url(#edge-${uid})`}
            strokeWidth="1.4"
          />
          {/* dome specular arc */}
          <path
            d="M44 54 A72 46 0 0 1 118 20"
            fill="none"
            stroke="rgba(255,250,238,0.55)"
            strokeWidth="4"
            strokeLinecap="round"
            filter={`url(#fb4-${uid})`}
          />
          <path
            d="M48 50 A68 42 0 0 1 114 22"
            fill="none"
            stroke="rgba(255,250,238,0.75)"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <ellipse cx="132" cy="33" rx="7" ry="2.6" fill="rgba(255,252,242,0.75)" transform="rotate(24 132 33)" filter={`url(#fb2-${uid})`} />
          {/* long streak reflections on the glass */}
          <rect x="36" y="88" width="9" height="204" rx="4.5" fill={`url(#streak-${uid})`} />
          <rect x="154" y="108" width="5" height="150" rx="2.5" fill={`url(#streak-${uid})`} opacity="0.5" />
          {/* front bottom rim (theme-lit) */}
          <path d="M24 316 A76 12 0 0 0 176 316" fill="none" stroke={tokens.rim} strokeWidth="2.4" opacity="0.6" filter={`url(#fb2-${uid})`} />
          <path d="M24 316 A76 12 0 0 0 176 316" fill="none" stroke="rgba(243,237,225,0.55)" strokeWidth="1" />

          {/* ---- pedestal ---- */}
          {/* glowing seat ring where the glass meets the drum */}
          <ellipse cx="100" cy="319" rx="83" ry="12.5" fill="none" stroke={tokens.base} strokeWidth="4" opacity="0.65" filter={`url(#fb4-${uid})`} className="animate-pulseglow" />
          <ellipse cx="100" cy="319" rx="83" ry="12.5" fill="none" stroke={tokens.base} strokeWidth="1.4" />
          {/* drum body */}
          <path
            d="M10 323 A90 14 0 0 0 190 323 L182 380 A82 12 0 0 1 18 380 Z"
            fill={`url(#ped-${uid})`}
            stroke="rgba(217,164,65,0.20)"
            strokeWidth="1"
          />
          {/* top face */}
          <ellipse cx="100" cy="323" rx="90" ry="14" fill={`url(#pedtop-${uid})`} stroke="rgba(217,164,65,0.42)" strokeWidth="1" />
          <path d="M28 318 A72 9 0 0 1 172 318" fill="none" stroke="rgba(240,217,164,0.22)" strokeWidth="1" />
          {/* engraved gold trims */}
          <ellipse cx="100" cy="340" rx="87" ry="13" fill="none" stroke="#8a6433" strokeWidth="0.9" opacity="0.55" />
          <ellipse cx="100" cy="354" rx="85.5" ry="12.6" fill="none" stroke="rgba(217,164,65,0.20)" strokeWidth="0.8" strokeDasharray="3 7" />
          <ellipse cx="100" cy="371" rx="83.5" ry="12.2" fill="none" stroke="#6b4e22" strokeWidth="1" opacity="0.6" />
          {/* base plinth */}
          <ellipse cx="100" cy="381" rx="82" ry="12" fill="#080605" stroke="rgba(217,164,65,0.28)" strokeWidth="1" />
        </svg>
      </motion.button>

      {/* ================= EXHIBITION PLAQUE ================= */}
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
