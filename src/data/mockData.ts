import type { DocSection } from "../types";

// Static content for the Docs view (the Ritual Agent Codex) and sensible
// default values to pre-fill the Publish form. All marketplace data
// (listings, clones, rentals, deployments, reviews) is read live from chain.

export const docsSections: DocSection[] = [
  {
    id: "overview",
    title: "Overview",
    body: "Ritual Agent Bazaar is an on-chain marketplace where autonomous agents are exhibited like artifacts in a gallery. Every listing, clone, rental, deployment, and review is a real transaction against the BazaarRegistry contract on Ritual Chain (1979) — nothing you see is mocked or stored off-chain. Browse the Bazaar five capsules at a time, open any capsule to inspect it, and act directly from the inspect panel.",
    callout: { kind: "Best Practice", text: "Start by inspecting an agent — mission, capabilities, usage counters, and written reviews — before paying a clone fee." },
  },
  {
    id: "wallet",
    title: "Wallet & Access",
    body: "The gallery only opens to a connected wallet: connect any injected EVM wallet (MetaMask, Rabby, …) from the landing page. The app suggests switching to Ritual Chain 1979 and offers to add it if your wallet doesn't know it yet. Your session persists across page refreshes; disconnecting from the wallet menu returns you to the gate. The app is non-custodial — it never holds keys or funds, and nothing is signed until you act.",
    callout: { kind: "Builder Tip", text: "If you decline the chain switch you can still browse; any transaction will re-prompt you to switch to Ritual 1979." },
  },
  {
    id: "agent-types",
    title: "Agent Types",
    body: "Sovereign Agents wake, act, and sleep through scheduled execution cycles — best for periodic, well-scoped actions. Persistent Agents remain long-lived and stateful for continuous missions such as monitoring or research. The type is set when an agent is published and is recorded on-chain with the listing.",
    callout: { kind: "Builder Tip", text: "Use Persistent Agents for long-horizon research and Sovereign Agents for scheduled action." },
  },
  {
    id: "cloning",
    title: "Cloning",
    body: "Cloning mints a personal copy of an agent blueprint into your Vault, with your own name, mission adjustment, risk level, and monthly budget. The clone fee is paid inside the same transaction directly to the creator — and if you send more than the fee, the excess is automatically refunded to you. Inactive listings cannot be cloned.",
    callout: { kind: "Best Practice", text: "A clone is yours to customize — and later re-publish as a brand-new listing from the Vault." },
  },
  {
    id: "renting",
    title: "Renting",
    body: "Renting lets you use an existing agent for 7, 30, or 90 days without owning the blueprint. The cost is pro-rated from the monthly price (days ÷ 30) and settles wallet-to-wallet with the creator; overpayment refunds automatically. Creators cannot rent their own listings — the contract rejects self-rent so rental counters stay honest.",
  },
  {
    id: "publishing",
    title: "Publishing",
    body: "Publishing lists an agent for discovery in the Bazaar: identity, mission, capabilities, pricing model, monthly price, and clone fee are all recorded on-chain, and you become the listing's creator. Drafts save locally in your browser so you can prepare a listing across sessions. After publishing, the gallery jumps straight to your new capsule.",
    callout: { kind: "Builder Tip", text: "Capabilities are comma-separated and stored on-chain — they become the chips buyers see in the inspect panel." },
  },
  {
    id: "republish",
    title: "Re-publishing a Clone",
    body: "Any clone in your Vault has a 'List in Bazaar' action. It pre-fills the Publish flow with the clone's name, mission, and the parent listing's category, pricing, and capabilities — confirm and it becomes a new listing with you as creator, earning you the clone fees and rentals it attracts.",
  },
  {
    id: "vault",
    title: "The Vault",
    body: "The Vault is your private on-chain collection, read live for the connected wallet in three tabs: Cloned (copies you minted, with risk level and budget), Rented (active and expired rentals with their windows), and Deployed (every deployment you recorded, with network and date). Each card links back to its parent listing in the Bazaar.",
  },
  {
    id: "deployment",
    title: "Deployment",
    body: "Deploying records an on-chain deployment for a listing — a real transaction with minimal gas — and it appears immediately in your Vault's Deployed tab and in the Activity feed. Live TEE agent execution is launched separately via Ritual's agent factories; the Bazaar records the intent and provenance.",
    callout: { kind: "Safety Note", text: "Deployment records intent on-chain; it does not itself launch a live agent." },
  },
  {
    id: "reviews",
    title: "Reviews & Reputation",
    body: "Ratings are 1–5 stars with a written comment, stored fully on-chain with the reviewer's address and timestamp. Each address gets one review per listing and can update it in place — the running average adjusts accordingly. Reviews are permissionless by design: weigh them together with usage counters (clones, rentals, deployments) rather than in isolation.",
    callout: { kind: "Best Practice", text: "Leave a review from the inspect panel's Reviews tab after using an agent — it costs only gas." },
  },
  {
    id: "safety",
    title: "Safety",
    body: "Constrain agents before going live: set a monthly budget on clones, keep missions narrow, and prefer simulation-style usage modes while testing. On the market side the contract enforces exact-fee forwarding with automatic refunds, blocks cloning or renting inactive listings, and prevents creators from renting their own agents. Do your own diligence before paying fees — reviews and counters are signals, not guarantees.",
    callout: { kind: "Safety Note", text: "Always set a budget limit and start in a simulation mode before granting an agent real reach." },
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
