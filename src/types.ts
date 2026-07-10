export type AgentTheme =
  | "emerald-shield"
  | "ivory-crystal"
  | "gold-market-core"
  | "emerald-network"
  | "ruby-crystal"
  | "bronze-ring";

export interface Agent {
  name: string;
  category: string;
  rating: string;
  price: string;
  theme: AgentTheme;
  subtitle: string;
  type: string;
  creator: string;
  mission: string;
  overview: string[];
  capabilities: string[];
  reviews: { author: string; stars: string; text: string; time?: string }[];
  usage?: string[];
  selected?: boolean;
}

export type AgentStatus = "active" | "sleeping" | "draft" | "failed";

export interface VaultAgent {
  name: string;
  status: AgentStatus;
  type: string;
  label: string;
  theme: AgentTheme;
  mission: string;
  lastRun: string;
  mode: string;
  budget: string;
  health: string;
  memory: string;
}

export type ActivityType = "clone" | "rent" | "deploy" | "publish" | "recovery" | "update";

export interface ActivityEvent {
  id: string;
  text: string;
  time: string;
  type: ActivityType;
  listingId?: number;
}

export interface DocCallout {
  kind: "Best Practice" | "Safety Note" | "Builder Tip";
  text: string;
}

export interface DocSection {
  id: string;
  title: string;
  body: string;
  callout?: DocCallout;
}

export type ViewId = "bazaar" | "vault" | "publish" | "activity" | "docs";
