import { useCallback, useEffect, useRef, useState } from "react";
import { formatEther, type Address } from "viem";
import { usePublicClient } from "wagmi";
import { bazaarRegistryAbi } from "../lib/abi";
import { BAZAAR_REGISTRY_ADDRESS } from "../lib/ritual";
import type { Agent, AgentTheme } from "../types";

const PRICING_LABEL = ["Free", "Rent", "Subscription", "One-time Clone"];
const KNOWN_THEMES: AgentTheme[] = [
  "emerald-shield",
  "ivory-crystal",
  "gold-market-core",
  "emerald-network",
  "ruby-crystal",
  "bronze-ring",
];

// Fetch listings in throttled network rounds instead of firing 6×N reads at
// once (which would overwhelm the public RPC). The first round paints fast; the
// rest stream in. MAX_LISTINGS is a safety cap for the public RPC — real scale
// beyond this needs an off-chain indexer.
const LOAD_PAGE = 12;
const MAX_LISTINGS = 300;

interface OnChainListing {
  id: bigint;
  creator: Address;
  name: string;
  category: string;
  agentType: number;
  pricingModel: number;
  monthlyPrice: bigint;
  cloneFee: bigint;
  mission: string;
  theme: string;
  capabilities: readonly string[];
  active: boolean;
  createdAt: bigint;
}

interface OnChainReview {
  rater: Address;
  stars: number;
  comment: string;
  createdAt: bigint;
}

export function resolveTheme(value: string): AgentTheme {
  return (KNOWN_THEMES.includes(value as AgentTheme) ? value : "gold-market-core") as AgentTheme;
}

/** Format a wei amount of RITUAL with up to 3 decimals, trailing zeros trimmed. */
export function formatRitual(wei: bigint): string {
  const n = Number(formatEther(wei));
  if (n === 0) return "0";
  return n.toFixed(3).replace(/\.?0+$/, "");
}

function priceLabel(wei: bigint): string {
  return `${formatRitual(wei)} RITUAL/mo`;
}

function overviewFrom(mission: string): string[] {
  const parts = mission
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [mission];
}

function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function timeAgo(unixSeconds: number): string {
  const diff = Math.max(0, Math.floor(Date.now() / 1000) - unixSeconds);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export interface BazaarListing extends Agent {
  listingId: number;
  creatorAddress: Address;
  cloneFeeWei: bigint;
  monthlyPriceWei: bigint;
  pricingModel: string;
  active: boolean;
  ratingCount: number;
}

export function useListings() {
  const publicClient = usePublicClient();
  const [listings, setListings] = useState<BazaarListing[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // first page only
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadToken = useRef(0);

  const load = useCallback(async () => {
    if (!publicClient) return;
    const token = ++loadToken.current;
    setIsLoading(true);
    setIsComplete(false);
    setError(null);
    setListings([]);

    const read = (functionName: string, args: unknown[]) =>
      publicClient.readContract({
        address: BAZAAR_REGISTRY_ADDRESS,
        abi: bazaarRegistryAbi,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        functionName: functionName as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args: args as any,
      });

    const mapListing = async (id: bigint): Promise<BazaarListing> => {
      const [listingRaw, avgRaw, reviewsRaw, clonesRaw, deploysRaw, rentsRaw] = await Promise.all([
        read("getListing", [id]),
        read("getAverageRating", [id]),
        read("getReviews", [id]),
        read("listingClones", [id]),
        read("listingDeployments", [id]),
        read("listingRentals", [id]),
      ]);

      const listing = listingRaw as unknown as OnChainListing;
      const avgTimes100 = avgRaw as bigint;
      const onchainReviews = reviewsRaw as unknown as OnChainReview[];
      const cloneN = Number(clonesRaw as bigint);
      const deployN = Number(deploysRaw as bigint);
      const rentN = Number(rentsRaw as bigint);
      const ratingCount = onchainReviews.length;

      const reviews = onchainReviews.map((r) => ({
        author: shortAddr(r.rater),
        stars: Number(r.stars).toFixed(1),
        text: r.comment,
        time: timeAgo(Number(r.createdAt)),
      }));

      const rating = avgTimes100 > 0n ? (Number(avgTimes100) / 100).toFixed(1) : "New";
      const subtitle = listing.mission.length > 46 ? `${listing.mission.slice(0, 46)}…` : listing.mission;

      return {
        listingId: Number(id),
        creatorAddress: listing.creator,
        cloneFeeWei: listing.cloneFee,
        monthlyPriceWei: listing.monthlyPrice,
        pricingModel: PRICING_LABEL[listing.pricingModel] ?? "Subscription",
        active: listing.active,
        ratingCount,
        name: listing.name,
        category: listing.category,
        rating,
        price: priceLabel(listing.monthlyPrice),
        theme: resolveTheme(listing.theme),
        subtitle,
        type: listing.agentType === 0 ? "Sovereign Agent" : "Persistent Agent",
        creator: shortAddr(listing.creator),
        mission: listing.mission,
        overview: overviewFrom(listing.mission),
        capabilities: [...listing.capabilities],
        usage: [
          `Cloned ${cloneN} ${cloneN === 1 ? "time" : "times"}`,
          `Deployed ${deployN} ${deployN === 1 ? "time" : "times"}`,
          `Rented ${rentN} ${rentN === 1 ? "time" : "times"}`,
          `${ratingCount} on-chain ${ratingCount === 1 ? "rating" : "ratings"}`,
        ],
        reviews,
      };
    };

    try {
      const count = Number((await read("listingCount", [])) as bigint);
      if (token !== loadToken.current) return;
      setTotal(count);

      if (count === 0) {
        setListings([]);
        setIsComplete(true);
        setIsLoading(false);
        return;
      }

      const cap = Math.min(count, MAX_LISTINGS);
      // Listing ids are sequential (1..count), so we can page without an extra
      // getListingPage round-trip, then fetch details only for that page.
      for (let offset = 0; offset < cap; offset += LOAD_PAGE) {
        const end = Math.min(offset + LOAD_PAGE, cap);
        const pageIds = Array.from({ length: end - offset }, (_, i) => BigInt(offset + i + 1));
        const pageMapped = await Promise.all(pageIds.map(mapListing));
        if (token !== loadToken.current) return; // a newer load superseded this one
        setListings((prev) => [...prev, ...pageMapped]);
        if (offset === 0) setIsLoading(false); // first page painted
      }
      setIsComplete(true);
    } catch (err) {
      if (token !== loadToken.current) return;
      setError(err instanceof Error ? err.message : "Could not load listings.");
    } finally {
      if (token === loadToken.current) setIsLoading(false);
    }
  }, [publicClient]);

  useEffect(() => {
    void load();
  }, [load]);

  return { listings, total, isLoading, isComplete, error, reload: load };
}
