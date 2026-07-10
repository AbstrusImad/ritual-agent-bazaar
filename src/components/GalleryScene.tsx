import { useEffect, useRef } from "react";
import type { Agent } from "../types";
import { AgentCapsule } from "./AgentCapsule";

interface GallerySceneProps {
  agents: Agent[];
  selectedIndex: number;
  onInspect: (index: number) => void;
}

export function GalleryScene({ agents, selectedIndex, onInspect }: GallerySceneProps) {
  const selectedRef = useRef<HTMLDivElement>(null);

  // Keep the selected capsule centered if the row overflows (small screens).
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [selectedIndex, agents.length]);

  return (
    <div className="hall-scroll relative flex w-full items-end justify-center gap-7 overflow-x-auto px-10 pb-6 pt-10 lg:gap-12">
      {agents.map((agent, index) => {
        // Perspective: neighbours recede — slightly raised and already smaller,
        // so the hall reads with depth around the dominant center capsule.
        const lift = Math.min(30, Math.abs(index - selectedIndex) * 14);
        const isSelected = index === selectedIndex;
        return (
          <div
            key={`${agent.name}-${index}`}
            ref={isSelected ? selectedRef : undefined}
            style={{ transform: `translateY(${-lift}px)` }}
            className="shrink-0 transition-transform duration-500"
          >
            <AgentCapsule
              agent={agent}
              index={index}
              isSelected={isSelected}
              onInspect={() => onInspect(index)}
            />
          </div>
        );
      })}
    </div>
  );
}
