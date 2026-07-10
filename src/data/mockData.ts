import type { DocSection } from "../types";

// Static content for the Docs view (the Ritual Agent Codex) and sensible
// default values to pre-fill the Publish form. All marketplace data
// (listings, clones, rentals, deployments, reviews) is read live from chain.

export const docsSections: DocSection[] = [
  {
    id: "overview",
    title: "Overview",
    body: "Ritual Agent Bazaar is a marketplace for autonomous agents designed to be inspected, cloned, rented, and deployed. All marketplace state and reviews live on-chain.",
    callout: { kind: "Best Practice", text: "Start by inspecting an agent before cloning it into your Vault." },
  },
  {
    id: "agent-types",
    title: "Agent Types",
    body: "Sovereign Agents wake, act, and sleep through scheduled execution cycles. Persistent Agents remain long-lived and stateful for continuous missions.",
    callout: { kind: "Builder Tip", text: "Use Persistent Agents for long-horizon research and Sovereign Agents for scheduled action." },
  },
  {
    id: "cloning",
    title: "Cloning",
    body: "Cloning creates a personal on-chain copy of an agent blueprint that can be customized before deployment. The clone fee is paid directly to the creator.",
  },
  {
    id: "renting",
    title: "Renting",
    body: "Renting lets builders use an existing agent configuration for a pro-rated period without owning or modifying the original blueprint.",
  },
  {
    id: "publishing",
    title: "Publishing",
    body: "Publishing lists an agent for discovery in the Bazaar with its capabilities, pricing model, and mission recorded on-chain.",
  },
  {
    id: "deployment",
    title: "Deployment",
    body: "Deploying records an on-chain deployment for a listing (a real transaction, minimal gas). Live TEE agent execution is launched separately via Ritual's agent factories.",
    callout: { kind: "Safety Note", text: "Deployment records intent on-chain; it does not itself launch a live agent." },
  },
  {
    id: "reviews",
    title: "Reviews & Reputation",
    body: "Ratings and written reviews are stored on-chain. Each address can leave one review per listing and update it; reputation reflects the running on-chain average.",
  },
];

export const docsCodeSample = `// Agent deployment config (illustrative)
agent.setMission("Protect market positions");
agent.enableCapability("Scheduler");
agent.setBudgetLimit("12.4 RITUAL/mo");`;

export const publishDefaults = {
  name: "Liquidity Ranger",
  category: "DeFi",
  agentType: "Persistent Agent",
  creator: "Studio Nine",
  mission: "Tracks liquidity shifts, detects abnormal pool behavior, and prepares defensive strategy suggestions.",
  pricingModel: "Subscription",
  monthlyPrice: "0.026",
  cloneFee: "0.016",
  capabilities: "Pool monitoring, Liquidity analytics, Strategy hints",
};
