import type { AgentTheme } from "../types";
import { themeTokens } from "../lib/theme";
import { AgentForm } from "./AgentForm";
import { cn } from "../lib/cn";

interface CapsulePreviewProps {
  theme: AgentTheme;
  size?: "sm" | "lg";
  className?: string;
}

export function CapsulePreview({ theme, size = "sm", className }: CapsulePreviewProps) {
  const tokens = themeTokens[theme];
  return (
    <div
      className={cn(
        "relative flex items-end justify-center overflow-hidden rounded-[999px_999px_22px_22px]",
        size === "lg" ? "h-[320px] w-[160px]" : "h-[220px] w-[112px]",
        className,
      )}
      style={{
        background: "linear-gradient(180deg, rgba(243,237,225,0.06), rgba(6,5,5,0.5))",
        border: `1px solid ${tokens.rim}`,
        boxShadow: `0 0 44px -12px ${tokens.glow}, inset 0 16px 44px -16px ${tokens.glow}`,
      }}
    >
      <div className="absolute inset-x-0 top-5 bottom-8 flex items-center justify-center px-3">
        <AgentForm theme={theme} />
      </div>
      <div className="absolute bottom-3 h-3.5 w-3/4 rounded-full" style={{ background: `radial-gradient(closest-side, ${tokens.ring}, transparent)` }} />
    </div>
  );
}
