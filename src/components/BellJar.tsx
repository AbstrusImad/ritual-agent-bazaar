import { useId } from "react";
import type { AgentTheme } from "../types";
import { themeTokens } from "../lib/theme";
import { AgentForm } from "./AgentForm";

interface BellJarProps {
  theme: AgentTheme;
  /** Brighter glow + floor pulse rings (the "spotlight" treatment). */
  intense?: boolean;
  className?: string;
}

/**
 * The hand-drawn museum bell jar (pure SVG, ~1 KB). Three stacked layers:
 * back (glow, god-beam, back rim, floor light), hologram (entity + orbiting
 * rings + dust), front (glass with fresnel edges, dome speculars, pedestal).
 * Width is controlled by the parent; the art scales via viewBox.
 */
export function BellJar({ theme, intense = false, className }: BellJarProps) {
  const tokens = themeTokens[theme];
  const uid = useId().replace(/[:]/g, "");

  return (
    <div className={className} style={{ position: "relative" }}>
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

        <ellipse
          cx="100"
          cy="288"
          rx="58"
          ry="88"
          fill={`url(#ig-${uid})`}
          filter={`url(#b10-${uid})`}
          className="animate-pulseglow"
        />
        <path d="M100 84 L62 314 L138 314 Z" fill={`url(#beam-${uid})`} style={{ mixBlendMode: "screen" }} />
        <ellipse cx="100" cy="316" rx="76" ry="12" fill="none" stroke="rgba(243,237,225,0.12)" strokeWidth="1" />

        <ellipse cx="100" cy="390" rx="95" ry="10" fill="rgba(0,0,0,0.6)" filter={`url(#b6-${uid})`} />
        <ellipse cx="100" cy="396" rx="104" ry="15" fill={`url(#pool-${uid})`} className="animate-pulseglow" />
        {intense
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
        <ellipse cx="100" cy="406" rx="62" ry="9" fill={tokens.glow} opacity="0.3" filter={`url(#b6-${uid})`} />
        <ellipse cx="100" cy="426" rx="38" ry="9" fill={tokens.glow} opacity="0.14" filter={`url(#b10-${uid})`} />
      </svg>

      {/* ================= HOLOGRAM LAYER ================= */}
      <div className="absolute" style={{ left: "13%", right: "13%", top: "17.5%", bottom: "29%" }}>
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
        <div className="animate-flicker absolute inset-[6%]">
          <AgentForm theme={theme} />
        </div>
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

        <path d="M24 316 L24 76 A76 60 0 0 1 176 76 L176 316 A76 12 0 0 1 24 316 Z" fill={`url(#glass-${uid})`} />
        <path
          d="M24 316 L24 76 A76 60 0 0 1 176 76 L176 316"
          fill="none"
          stroke={`url(#edge-${uid})`}
          strokeWidth="3.5"
          opacity="0.5"
          filter={`url(#fb2-${uid})`}
        />
        <path d="M24 316 L24 76 A76 60 0 0 1 176 76 L176 316" fill="none" stroke={`url(#edge-${uid})`} strokeWidth="1.4" />
        <path
          d="M44 54 A72 46 0 0 1 118 20"
          fill="none"
          stroke="rgba(255,250,238,0.55)"
          strokeWidth="4"
          strokeLinecap="round"
          filter={`url(#fb4-${uid})`}
        />
        <path d="M48 50 A68 42 0 0 1 114 22" fill="none" stroke="rgba(255,250,238,0.75)" strokeWidth="1.3" strokeLinecap="round" />
        <ellipse cx="132" cy="33" rx="7" ry="2.6" fill="rgba(255,252,242,0.75)" transform="rotate(24 132 33)" filter={`url(#fb2-${uid})`} />
        <rect x="36" y="88" width="9" height="204" rx="4.5" fill={`url(#streak-${uid})`} />
        <rect x="154" y="108" width="5" height="150" rx="2.5" fill={`url(#streak-${uid})`} opacity="0.5" />
        <path d="M24 316 A76 12 0 0 0 176 316" fill="none" stroke={tokens.rim} strokeWidth="2.4" opacity="0.6" filter={`url(#fb2-${uid})`} />
        <path d="M24 316 A76 12 0 0 0 176 316" fill="none" stroke="rgba(243,237,225,0.55)" strokeWidth="1" />

        <ellipse
          cx="100"
          cy="319"
          rx="83"
          ry="12.5"
          fill="none"
          stroke={tokens.base}
          strokeWidth="4"
          opacity="0.65"
          filter={`url(#fb4-${uid})`}
          className="animate-pulseglow"
        />
        <ellipse cx="100" cy="319" rx="83" ry="12.5" fill="none" stroke={tokens.base} strokeWidth="1.4" />
        <path
          d="M10 323 A90 14 0 0 0 190 323 L182 380 A82 12 0 0 1 18 380 Z"
          fill={`url(#ped-${uid})`}
          stroke="rgba(217,164,65,0.20)"
          strokeWidth="1"
        />
        <ellipse cx="100" cy="323" rx="90" ry="14" fill={`url(#pedtop-${uid})`} stroke="rgba(217,164,65,0.42)" strokeWidth="1" />
        <path d="M28 318 A72 9 0 0 1 172 318" fill="none" stroke="rgba(240,217,164,0.22)" strokeWidth="1" />
        <ellipse cx="100" cy="340" rx="87" ry="13" fill="none" stroke="#8a6433" strokeWidth="0.9" opacity="0.55" />
        <ellipse cx="100" cy="354" rx="85.5" ry="12.6" fill="none" stroke="rgba(217,164,65,0.20)" strokeWidth="0.8" strokeDasharray="3 7" />
        <ellipse cx="100" cy="371" rx="83.5" ry="12.2" fill="none" stroke="#6b4e22" strokeWidth="1" opacity="0.6" />
        <ellipse cx="100" cy="381" rx="82" ry="12" fill="#080605" stroke="rgba(217,164,65,0.28)" strokeWidth="1" />
      </svg>
    </div>
  );
}
