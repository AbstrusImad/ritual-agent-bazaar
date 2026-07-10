export function RitualSigil({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className="drop-shadow-[0_0_10px_rgba(217,164,65,0.5)]"
    >
      <circle cx="24" cy="24" r="21" stroke="url(#sigil-gold)" strokeWidth="1.4" />
      <circle cx="24" cy="24" r="14" stroke="url(#sigil-gold)" strokeWidth="1" opacity="0.7" />
      <path
        d="M24 3 L24 45 M3 24 L45 24 M9 9 L39 39 M39 9 L9 39"
        stroke="url(#sigil-gold)"
        strokeWidth="0.8"
        opacity="0.5"
      />
      <path
        d="M24 10 L30 24 L24 38 L18 24 Z"
        fill="url(#sigil-gold)"
        opacity="0.85"
      />
      <circle cx="24" cy="24" r="3.4" fill="#f3ede1" />
      <defs>
        <linearGradient id="sigil-gold" x1="0" y1="0" x2="48" y2="48">
          <stop stopColor="#e8c884" />
          <stop offset="1" stopColor="#a9772a" />
        </linearGradient>
      </defs>
    </svg>
  );
}
