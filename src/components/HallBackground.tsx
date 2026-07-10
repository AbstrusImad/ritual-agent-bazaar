import { BackgroundParticles } from "./BackgroundParticles";

/**
 * Cinematic exhibition hall: cathedral columns with capitals, arched vaults,
 * warm volumetric light falling from above, a polished reflective floor with
 * concentric ring inlays, and a heavy vignette so the capsules own the light.
 */

// Column x-centers as % of width; wider hall reads through the gaps.
const COLUMNS = [6, 20, 36, 64, 80, 94];

export function HallBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Base vault gradient — deep warm brown fading to black */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(130% 100% at 50% -20%, #2a2013 0%, #16110b 38%, #0a0806 62%, #050404 100%)",
        }}
      />

      {/* Warm cone of light from above, centered on the gallery */}
      <div
        className="absolute inset-x-0 top-0 h-[75%]"
        style={{
          background:
            "radial-gradient(46% 90% at 50% 0%, rgba(228,178,86,0.20), rgba(217,164,65,0.06) 55%, rgba(6,5,5,0) 78%)",
        }}
      />

      {/* Architectural columns + arches */}
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="col-face" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(217,164,65,0.02)" />
            <stop offset="45%" stopColor="rgba(228,190,120,0.10)" />
            <stop offset="55%" stopColor="rgba(228,190,120,0.10)" />
            <stop offset="100%" stopColor="rgba(217,164,65,0.02)" />
          </linearGradient>
          <linearGradient id="col-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(217,164,65,0)" />
            <stop offset="30%" stopColor="rgba(217,164,65,0.55)" />
            <stop offset="100%" stopColor="rgba(217,164,65,0.9)" />
          </linearGradient>
        </defs>

        {COLUMNS.map((pct) => {
          const x = (pct / 100) * 1440;
          return (
            <g key={pct} opacity="0.5">
              {/* shaft */}
              <rect x={x - 26} y={120} width={52} height={520} fill="url(#col-face)" />
              {/* shaft edge lines */}
              <line x1={x - 26} y1={140} x2={x - 26} y2={640} stroke="rgba(217,164,65,0.14)" strokeWidth="1" />
              <line x1={x + 26} y1={140} x2={x + 26} y2={640} stroke="rgba(217,164,65,0.14)" strokeWidth="1" />
              {/* capital */}
              <rect x={x - 36} y={104} width={72} height={16} rx={3} fill="rgba(217,164,65,0.10)" stroke="rgba(217,164,65,0.16)" strokeWidth="1" />
              <rect x={x - 30} y={92} width={60} height={10} rx={3} fill="rgba(217,164,65,0.07)" />
              {/* base */}
              <rect x={x - 36} y={640} width={72} height={14} rx={3} fill="rgba(217,164,65,0.10)" stroke="rgba(217,164,65,0.14)" strokeWidth="1" />
            </g>
          );
        })}

        {/* Arches spanning between columns */}
        {COLUMNS.slice(0, -1).map((pct, i) => {
          const x1 = (pct / 100) * 1440;
          const x2 = (COLUMNS[i + 1] / 100) * 1440;
          const mid = (x1 + x2) / 2;
          return (
            <path
              key={`arch-${i}`}
              d={`M ${x1 + 26} 150 Q ${mid} ${20} ${x2 - 26} 150`}
              fill="none"
              stroke="rgba(217,164,65,0.12)"
              strokeWidth="1.5"
              opacity="0.7"
            />
          );
        })}

        {/* faint inner second arch line */}
        {COLUMNS.slice(0, -1).map((pct, i) => {
          const x1 = (pct / 100) * 1440;
          const x2 = (COLUMNS[i + 1] / 100) * 1440;
          const mid = (x1 + x2) / 2;
          return (
            <path
              key={`arch2-${i}`}
              d={`M ${x1 + 26} 168 Q ${mid} ${44} ${x2 - 26} 168`}
              fill="none"
              stroke="rgba(217,164,65,0.06)"
              strokeWidth="1"
            />
          );
        })}
      </svg>

      {/* Volumetric light beams */}
      <div className="absolute inset-0">
        {[28, 50, 72].map((left, index) => (
          <div
            key={index}
            className="animate-pulseglow absolute top-0 h-[68%] w-[160px]"
            style={{
              left: `${left}%`,
              transform: "translateX(-50%) skewX(-2deg)",
              background:
                "linear-gradient(to bottom, rgba(228,178,86,0.13), rgba(217,164,65,0.04) 55%, rgba(217,164,65,0) 85%)",
              filter: "blur(16px)",
              animationDelay: `${index * 1.1}s`,
            }}
          />
        ))}
      </div>

      <BackgroundParticles />

      {/* ---- Polished floor ---- */}
      {/* floor plane */}
      <div
        className="absolute inset-x-0 bottom-0 h-[34%]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(42,32,19,0.85) 0%, rgba(16,12,8,0.96) 30%, #070605 70%)",
        }}
      />
      {/* floor junction highlight line */}
      <div
        className="absolute inset-x-0 bottom-[34%] h-px"
        style={{ background: "linear-gradient(to right, transparent 8%, rgba(217,164,65,0.22) 50%, transparent 92%)" }}
      />
      {/* warm reflection pool under the center capsule */}
      <div
        className="animate-sheen absolute bottom-[6%] left-1/2 h-[26%] w-[70%] -translate-x-1/2"
        style={{
          background: "radial-gradient(50% 60% at 50% 0%, rgba(228,178,86,0.16), rgba(6,5,5,0) 75%)",
          filter: "blur(6px)",
        }}
      />
      {/* concentric ring inlays on the floor (perspective ellipses) */}
      <div className="absolute bottom-[3%] left-1/2 -translate-x-1/2">
        {[520, 780, 1060].map((w, i) => (
          <div
            key={w}
            className="absolute left-1/2 -translate-x-1/2 rounded-[50%]"
            style={{
              width: `${w}px`,
              height: `${w * 0.20}px`,
              bottom: `${-w * 0.05}px`,
              border: `1px solid rgba(217,164,65,${0.16 - i * 0.045})`,
              boxShadow: `0 0 18px -6px rgba(217,164,65,${0.25 - i * 0.07})`,
            }}
          />
        ))}
      </div>

      {/* column reflections on the floor */}
      <div className="absolute inset-x-0 bottom-0 h-[30%] opacity-25" style={{ transform: "scaleY(-1)" }}>
        <svg viewBox="0 0 1440 300" preserveAspectRatio="xMidYMin slice" className="h-full w-full">
          {COLUMNS.map((pct) => {
            const x = (pct / 100) * 1440;
            return (
              <rect
                key={pct}
                x={x - 22}
                y={0}
                width={44}
                height={220}
                fill="url(#col-face)"
                opacity="0.5"
              />
            );
          })}
        </svg>
      </div>

      {/* Heavy vignette so light concentrates center-stage */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(75% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(4,3,3,0.55) 82%, rgba(3,2,2,0.85) 100%)",
        }}
      />
    </div>
  );
}
