import type { AgentTheme } from "../types";

interface ThemeTokens {
  glow: string;
  rim: string;
  ring: string;
  base: string;
  categoryClass: string;
}

export const themeTokens: Record<AgentTheme, ThemeTokens> = {
  "emerald-shield": {
    glow: "rgba(79,216,160,0.35)",
    rim: "rgba(79,216,160,0.55)",
    ring: "rgba(79,216,160,0.5)",
    base: "rgba(79,216,160,0.7)",
    categoryClass: "text-emerald",
  },
  "ivory-crystal": {
    glow: "rgba(243,237,225,0.3)",
    rim: "rgba(232,200,132,0.5)",
    ring: "rgba(243,237,225,0.5)",
    base: "rgba(243,237,225,0.65)",
    categoryClass: "text-silver",
  },
  "gold-market-core": {
    glow: "rgba(217,164,65,0.5)",
    rim: "rgba(240,217,164,0.85)",
    ring: "rgba(217,164,65,0.75)",
    base: "rgba(217,164,65,0.95)",
    categoryClass: "text-champagne",
  },
  "emerald-network": {
    glow: "rgba(79,216,160,0.32)",
    rim: "rgba(79,216,160,0.5)",
    ring: "rgba(79,216,160,0.45)",
    base: "rgba(79,216,160,0.65)",
    categoryClass: "text-emerald",
  },
  "ruby-crystal": {
    glow: "rgba(209,78,86,0.35)",
    rim: "rgba(209,78,86,0.55)",
    ring: "rgba(209,78,86,0.5)",
    base: "rgba(209,78,86,0.72)",
    categoryClass: "text-ruby",
  },
  "bronze-ring": {
    glow: "rgba(184,111,69,0.4)",
    rim: "rgba(184,111,69,0.6)",
    ring: "rgba(184,111,69,0.55)",
    base: "rgba(184,111,69,0.8)",
    categoryClass: "text-champagne",
  },
};

export function categoryToTheme(category: string): AgentTheme {
  const key = category.toLowerCase();
  if (key.includes("security")) return "emerald-shield";
  if (key.includes("research")) return "ivory-crystal";
  if (key.includes("community")) return "emerald-network";
  if (key.includes("automation")) return "bronze-ring";
  return "gold-market-core";
}
