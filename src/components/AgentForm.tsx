import type { AgentTheme } from "../types";

/**
 * Abstract floating agent "core" rendered per theme.
 * Each returns an SVG artifact meant to float inside a glass capsule.
 */
export function AgentForm({ theme }: { theme: AgentTheme }) {
  switch (theme) {
    case "emerald-shield":
      return <EmeraldShield />;
    case "ivory-crystal":
      return <IvoryCrystal />;
    case "gold-market-core":
      return <GoldMarketCore />;
    case "emerald-network":
      return <EmeraldNetwork />;
    case "ruby-crystal":
      return <RubyCrystal />;
    case "bronze-ring":
      return <BronzeRing />;
    default:
      return null;
  }
}

function BronzeRing() {
  return (
    <svg viewBox="0 0 120 160" className="h-full w-full animate-float">
      <defs>
        <radialGradient id="bz-glow" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#d79a63" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#5a3a22" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="82" r="44" fill="url(#bz-glow)" opacity="0.55" />
      <g className="animate-spinslow" style={{ transformOrigin: "60px 82px" }}>
        <circle cx="60" cy="82" r="30" fill="none" stroke="#b86f45" strokeWidth="2.2" strokeDasharray="6 5" />
      </g>
      <g className="animate-spinslowrev" style={{ transformOrigin: "60px 82px" }}>
        <circle cx="60" cy="82" r="20" fill="none" stroke="#e8c884" strokeWidth="1.4" strokeDasharray="3 6" />
      </g>
      {Array.from({ length: 8 }).map((_, index) => {
        const angle = (index / 8) * Math.PI * 2;
        const x = 60 + Math.cos(angle) * 30;
        const y = 82 + Math.sin(angle) * 30;
        return <rect key={index} x={x - 2} y={y - 2} width="4" height="4" fill="#b86f45" />;
      })}
      <circle cx="60" cy="82" r="8" fill="#e8c884" />
    </svg>
  );
}

function EmeraldShield() {
  return (
    <svg viewBox="0 0 120 160" className="h-full w-full animate-float">
      <defs>
        <radialGradient id="em-glow" cx="50%" cy="60%" r="60%">
          <stop offset="0%" stopColor="#4fd8a0" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#1f6b4d" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="em-rim" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#e8c884" />
          <stop offset="1" stopColor="#4fd8a0" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="120" rx="46" ry="20" fill="url(#em-glow)" />
      <path d="M60 40 L94 56 V90 Q94 118 60 132 Q26 118 26 90 V56 Z" fill="none" stroke="url(#em-rim)" strokeWidth="2" />
      <path d="M60 54 L82 64 V88 Q82 106 60 116 Q38 106 38 88 V64 Z" fill="rgba(79,216,160,0.14)" stroke="#4fd8a0" strokeWidth="1.2" />
      <circle cx="60" cy="86" r="9" fill="none" stroke="#e8c884" strokeWidth="1.6" />
      <rect x="57" y="84" width="6" height="10" rx="2" fill="#e8c884" />
      <circle cx="60" cy="86" r="20" fill="none" stroke="#4fd8a0" strokeWidth="0.6" opacity="0.5" className="animate-spinslow" style={{ transformOrigin: "60px 86px" }} />
    </svg>
  );
}

function IvoryCrystal() {
  return (
    <svg viewBox="0 0 120 160" className="h-full w-full animate-float">
      <defs>
        <radialGradient id="iv-glow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#f3ede1" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#c9c3b6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="80" r="40" fill="url(#iv-glow)" opacity="0.5" />
      <g className="animate-spinslow" style={{ transformOrigin: "60px 80px" }}>
        <ellipse cx="60" cy="80" rx="42" ry="16" fill="none" stroke="#f3ede1" strokeWidth="0.8" opacity="0.4" />
        <ellipse cx="60" cy="80" rx="30" ry="44" fill="none" stroke="#e8c884" strokeWidth="0.7" opacity="0.35" />
      </g>
      <path d="M60 52 L74 74 L60 108 L46 74 Z" fill="rgba(243,237,225,0.22)" stroke="#f3ede1" strokeWidth="1.4" />
      <path d="M60 52 L60 108 M46 74 L74 74" stroke="#e8c884" strokeWidth="0.8" opacity="0.7" />
      {[
        [30, 58],
        [92, 66],
        [36, 104],
        [88, 100],
      ].map(([x, y], index) => (
        <circle key={index} cx={x} cy={y} r="2.2" fill="#f3ede1" opacity="0.8" />
      ))}
    </svg>
  );
}

function GoldMarketCore() {
  return (
    <svg viewBox="0 0 120 160" className="h-full w-full animate-float">
      <defs>
        <radialGradient id="gm-glow" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#f0d9a4" stopOpacity="1" />
          <stop offset="60%" stopColor="#d9a441" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#a9772a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="80" r="50" fill="url(#gm-glow)" opacity="0.6" />
      <g className="animate-spinslow" style={{ transformOrigin: "60px 80px" }}>
        <ellipse cx="60" cy="80" rx="48" ry="18" fill="none" stroke="#e8c884" strokeWidth="1" opacity="0.55" />
      </g>
      <g className="animate-spinslowrev" style={{ transformOrigin: "60px 80px" }}>
        <ellipse cx="60" cy="80" rx="34" ry="46" fill="none" stroke="#d9a441" strokeWidth="1" opacity="0.5" />
      </g>
      <circle cx="60" cy="80" r="16" fill="#f0d9a4" opacity="0.9" />
      <circle cx="60" cy="80" r="16" fill="none" stroke="#fff6e0" strokeWidth="1" />
      {/* market waveform */}
      <path
        d="M22 128 L34 122 L44 130 L54 116 L66 126 L78 110 L90 122 L98 116"
        fill="none"
        stroke="#e8c884"
        strokeWidth="1.6"
        opacity="0.85"
      />
    </svg>
  );
}

function EmeraldNetwork() {
  const nodes = [
    [60, 60],
    [36, 82],
    [84, 82],
    [48, 110],
    [78, 108],
    [60, 88],
  ];
  const links = [
    [0, 5],
    [1, 5],
    [2, 5],
    [3, 5],
    [4, 5],
    [1, 3],
    [2, 4],
    [0, 1],
    [0, 2],
  ];
  return (
    <svg viewBox="0 0 120 160" className="h-full w-full animate-float">
      <defs>
        <radialGradient id="en-glow" cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor="#4fd8a0" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#1f6b4d" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="120" rx="44" ry="18" fill="url(#en-glow)" />
      <g className="animate-spinslow" style={{ transformOrigin: "60px 86px" }}>
        {links.map(([a, b], index) => (
          <line
            key={index}
            x1={nodes[a][0]}
            y1={nodes[a][1]}
            x2={nodes[b][0]}
            y2={nodes[b][1]}
            stroke="#4fd8a0"
            strokeWidth="0.8"
            opacity="0.5"
          />
        ))}
        {nodes.map(([x, y], index) => (
          <circle key={index} cx={x} cy={y} r={index === 5 ? 5 : 3} fill={index === 5 ? "#e8c884" : "#4fd8a0"} />
        ))}
      </g>
    </svg>
  );
}

function RubyCrystal() {
  return (
    <svg viewBox="0 0 120 160" className="h-full w-full animate-float">
      <defs>
        <radialGradient id="rb-glow" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#d14e56" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#7d2b34" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="82" r="42" fill="url(#rb-glow)" opacity="0.55" />
      <g className="animate-spinslowrev" style={{ transformOrigin: "60px 82px" }}>
        <rect x="44" y="66" width="32" height="32" rx="3" fill="rgba(209,78,86,0.2)" stroke="#d14e56" strokeWidth="1.4" transform="rotate(45 60 82)" />
      </g>
      <rect x="52" y="74" width="16" height="16" rx="2" fill="#d14e56" transform="rotate(45 60 82)" />
      {[
        [30, 56],
        [90, 60],
        [34, 108],
        [88, 104],
      ].map(([x, y], index) => (
        <path key={index} d={`M ${x} ${y} l 5 3 l -3 5 l -5 -3 Z`} fill="#d14e56" opacity="0.7" />
      ))}
      <path d="M26 118 L40 118 M80 120 L96 120" stroke="#d14e56" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}
