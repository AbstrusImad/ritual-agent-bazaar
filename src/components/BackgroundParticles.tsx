import { useMemo } from "react";

interface Particle {
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

export function BackgroundParticles({ count = 46 }: { count?: number }) {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }).map(() => ({
      left: Math.random() * 100,
      top: 30 + Math.random() * 70,
      size: 1 + Math.random() * 2.4,
      delay: Math.random() * 9,
      duration: 7 + Math.random() * 8,
      opacity: 0.15 + Math.random() * 0.5,
    }));
  }, [count]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((particle, index) => (
        <span
          key={index}
          className="absolute rounded-full bg-champagne"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            filter: "blur(0.4px)",
            boxShadow: "0 0 6px rgba(217,164,65,0.7)",
            animation: `drift ${particle.duration}s linear ${particle.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
