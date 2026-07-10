# Ritual Agent Bazaar

**An on-chain marketplace for autonomous agents, built on [Ritual Chain](https://ritualfoundation.org).** Agents are exhibited as living holographic entities inside glass bell jars in a dark, gold-lit gallery — and every marketplace action (publish, clone, rent, deploy, review) is a real transaction against a single registry contract.

<p>
  <a href="https://abstrusimad.github.io/ritual-agent-bazaar/"><img alt="Live App" src="https://img.shields.io/badge/live-app-d9a441"></a>
  <img alt="Chain" src="https://img.shields.io/badge/chain-Ritual%201979-19D184">
  <img alt="Solidity" src="https://img.shields.io/badge/solidity-0.8.24-363636">
  <img alt="React" src="https://img.shields.io/badge/react-18-61dafb">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue">
</p>

| | |
|---|---|
| **Live app** | https://abstrusimad.github.io/ritual-agent-bazaar/ |
| **Registry contract** | [`0x9cf5315cA95Dd69c5D83B4E74B5aA449A894d0a6`](https://explorer.ritualfoundation.org/address/0x9cf5315cA95Dd69c5D83B4E74B5aA449A894d0a6) |
| **Network** | Ritual Chain — chain id `1979`, RPC `https://rpc.ritualfoundation.org` |
| **Contract version** | `3` |

---

## Table of Contents

- [How It Works](#how-it-works)
- [Features](#features)
- [Architecture](#architecture)
- [Smart Contract](#smart-contract)
- [Getting Started](#getting-started)
- [Contract Development](#contract-development)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Security Notes](#security-notes)
- [License](#license)

---

## How It Works

The app is gated by a wallet connection: the landing hall opens only after an injected EVM wallet connects (the app suggests — and offers to add — Ritual Chain 1979 automatically). The session persists across page refreshes.

Once inside, the experience is organized around a floating dock with five zones:

| Zone | What it does |
|---|---|
| **Bazaar** | The capsule gallery — 5 agents per page, paged with side arrows, read live from the registry |
| **Vault** | Your on-chain collection in three tabs: **Cloned**, **Rented**, **Deployed** |
| **Publish** | A step-by-step listing ceremony that publishes a new agent on-chain (name, mission, capabilities, pricing) |
| **Activity** | A live timeline reconstructed from on-chain state plus real-time contract events |
| **Docs** | The Agent Codex — concepts, lifecycle, and safety notes |

**Everything visible is real chain data.** Listings, ratings, written reviews, capabilities, usage counters ("cloned N times"), vault contents, and activity are all read from the registry — there is no mocked marketplace data.

## Features

- **Publish** — list an agent with mission, capabilities, pricing model, monthly price and clone fee (`publishAgent`)
- **Clone** — mint a personal, customizable copy of a listing; the clone fee is forwarded to the creator and any overpayment is refunded (`cloneAgent`)
- **Rent** — pro-rated rental for 7/30/90 days, paid on-chain to the creator (`rentAgent`)
- **Deploy** — record an on-chain deployment for a listing; your deployments appear in the Vault (`deployAgent`)
- **Review** — 1–5 stars **with written text stored on-chain**, one review per address per listing, updatable (`rateAgent`)
- **Re-publish a clone** — "List in Bazaar" on any of your clones pre-fills the Publish flow so a customized clone becomes a new listing you own
- **Wallet UX** — persistent connection across refreshes, automatic Ritual Chain suggestion, live per-listing stats without a connected wallet on the landing page
- **Hand-crafted visuals** — the bell-jar capsules are pure layered SVG (fresnel edges, dome speculars, orbiting rings, caustic floor pools): zero image assets, zero 3D libraries, ~1 KB of art

## Architecture

```
┌────────────────────────────┐        JSON-RPC        ┌──────────────────────────┐
│  React 18 + TypeScript     │  ─── reads (viem) ───▶ │  Ritual Chain (1979)     │
│  Vite · Tailwind · Framer  │                        │                          │
│  wagmi (injected wallet)   │  ─── writes (txs) ───▶ │  BazaarRegistry v3       │
│                            │  ◀── contract events ──│  (single contract,      │
│  GitHub Pages (static)     │                        │   no admin keys)         │
└────────────────────────────┘                        └──────────────────────────┘
```

- **No backend.** The frontend talks directly to the public RPC. Listings stream in paged batches to stay friendly to the RPC (12 per round, first page paints immediately).
- **No custody.** The app never holds keys or funds; payments flow wallet → creator inside the contract call.
- **Events + state.** The activity feed derives from current on-chain state (reliable on the public RPC) and subscribes to live `AgentPublished/Cloned/Rented/Deployed/Rated` events for the session.

## Smart Contract

`contracts/src/BazaarRegistry.sol` — a single registry holding all marketplace state. Solidity `0.8.24`, checks-effects-interactions with a reentrancy guard, custom errors throughout.

### Write API

| Function | Payable | Description |
|---|---|---|
| `publishAgent(name, category, agentType, pricingModel, monthlyPrice, cloneFee, mission, theme, capabilities[])` | — | List an agent; caller becomes its creator |
| `updateListing(listingId, monthlyPrice, cloneFee, active)` | — | Creator-only price/active update |
| `cloneAgent(listingId, name, mission, riskLevel, monthlyBudget)` | ✔ | Pays `cloneFee` to the creator, **refunds overpayment**, requires an active listing |
| `rentAgent(listingId, periodDays, usageMode)` | ✔ | Pro-rated cost (`monthlyPrice × days / 30`) to the creator, refunds overpayment; **creators cannot rent their own listing** |
| `deployAgent(listingId, network)` | — | Records a deployment for the caller |
| `rateAgent(listingId, stars, comment)` | — | 1–5 stars + text; one review per address, updates in place |
| `recoverClone(cloneId)` | — | Owner-only lifecycle signal (event) |

### Read API

`getListing`, `getListingPage(offset, limit)`, `getClone`, `getRental`, `getDeployment`, `getReviews(listingId)`, `getAverageRating` (×100), `getClonesByOwner`, `getRentalsByRenter`, `getDeploymentsByDeployer`, `getListingsByCreator`, plus per-listing counters `listingClones / listingRentals / listingDeployments`.

### Guarantees enforced on-chain

- Exact-fee forwarding: creators receive precisely the fee/cost; **any excess is refunded to the caller** (nothing can get stuck in the contract)
- Inactive listings cannot be cloned or rented
- Self-rent is rejected (`SelfRentNotAllowed`) so rental counters cannot be inflated by creators
- Rating average is maintained as a running sum with per-address review slots

## Getting Started

**Prerequisites:** Node 18+, an injected EVM wallet (MetaMask, Rabby, …).

```bash
git clone https://github.com/AbstrusImad/ritual-agent-bazaar.git
cd ritual-agent-bazaar
npm install
npm run dev
```

The app defaults to the live registry. To point elsewhere:

```bash
cp .env.example .env
# VITE_BAZAAR_REGISTRY=0x9cf5315cA95Dd69c5D83B4E74B5aA449A894d0a6
```

Open the app, press **Connect Wallet to Enter** — the wallet is offered a switch (or add) to Ritual Chain 1979 — and the gallery opens. Ratings cost only gas; cloning and renting pay the listed price to the creator.

## Contract Development

```bash
cd contracts
forge build
forge test        # 21 tests: payments, refunds, guards, reviews, pagination
```

Deploy + seed a fresh registry (six curated listings with capabilities and initial reviews):

```bash
forge script script/DeployAndSeed.s.sol:DeployAndSeed \
  --rpc-url https://rpc.ritualfoundation.org \
  --private-key $PK --broadcast --slow
```

Then update `VITE_BAZAAR_REGISTRY` (and `src/lib/ritual.ts` default) with the new address.

## Deployment

Static build published to GitHub Pages from the `gh-pages` branch:

```bash
GHPAGES=1 npm run build     # emits base path /ritual-agent-bazaar/
```

The deploy copies `dist/` to `gh-pages` with a `404.html` SPA fallback and a `.nojekyll` marker.

## Project Structure

```
contracts/
  src/BazaarRegistry.sol        # the registry (v3)
  test/BazaarRegistry.t.sol     # Foundry suite
  script/DeployAndSeed.s.sol    # deploy + seed
src/
  views/                        # Landing gate, Bazaar, Vault, Publish, Activity, Docs
  components/                   # SVG bell jars, hall background, dock, overlays
  hooks/                        # useListings (paged reads), useMyVault, useBazaarActions, useBazaarActivity
  lib/                          # chain config, ABI, wagmi (persistent sessions), theme tokens
  store/AppContext.tsx          # app state: gallery paging, wallet, overlays, prefs
```

## Security Notes

- All value transfer happens inside the registry call, directly to the listing creator; the contract holds no balance by construction (overpayments are refunded in the same transaction).
- The frontend is fully client-side and non-custodial; disconnecting the wallet returns you to the gate.
- On-chain reviews are permissionless by design — reputation reflects any address's vote. Do your own diligence before paying clone fees.
- Never commit private keys. `.env` is git-ignored; `WALLET_PRIVATE_KEY` is only read by Foundry deploy scripts.

## License

MIT
