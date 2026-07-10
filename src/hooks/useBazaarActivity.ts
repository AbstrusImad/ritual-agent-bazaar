import { useCallback, useEffect, useState } from "react";
import type { Address } from "viem";
import { usePublicClient, useWatchContractEvent } from "wagmi";
import { bazaarRegistryAbi } from "../lib/abi";
import { BAZAAR_REGISTRY_ADDRESS } from "../lib/ritual";
import type { ActivityEvent, ActivityType } from "../types";

/**
 * Ritual's public RPC does not reliably serve historical logs/receipts by
 * range, so we reconstruct the activity feed from current on-chain STATE
 * (listings, clones, rentals, deployments) which reads reliably, and
 * additionally listen for NEW events live during the session.
 */

export interface ActivityStats {
  listings: number;
  clones: number;
  rentals: number;
  deployments: number;
}

function shortAddr(addr?: string) {
  if (!addr) return "someone";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

interface OnChainListing {
  id: bigint;
  creator: Address;
  name: string;
  category: string;
}
interface OnChainClone {
  id: bigint;
  listingId: bigint;
  owner: Address;
  name: string;
}
interface OnChainRental {
  id: bigint;
  listingId: bigint;
  renter: Address;
}
interface OnChainDeployment {
  id: bigint;
  listingId: bigint;
  deployer: Address;
}

export function useBazaarActivity() {
  const publicClient = usePublicClient();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [liveEvents, setLiveEvents] = useState<ActivityEvent[]>([]);
  const [stats, setStats] = useState<ActivityStats>({ listings: 0, clones: 0, rentals: 0, deployments: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!publicClient) return;
    setIsLoading(true);
    try {
      const read = (functionName: string, args: unknown[] = []) =>
        publicClient.readContract({
          address: BAZAAR_REGISTRY_ADDRESS,
          abi: bazaarRegistryAbi,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          functionName: functionName as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          args: args as any,
        });

      const [listingCount, cloneCount, rentalCount, deploymentCount] = (await Promise.all([
        read("listingCount"),
        read("cloneCount"),
        read("rentalCount"),
        read("deploymentCount"),
      ])) as [bigint, bigint, bigint, bigint];

      setStats({
        listings: Number(listingCount),
        clones: Number(cloneCount),
        rentals: Number(rentalCount),
        deployments: Number(deploymentCount),
      });

      const derived: ActivityEvent[] = [];

      // Most recent listings (publishes)
      const listingIds = lastN(listingCount, 8);
      const listings = (await Promise.all(listingIds.map((id) => read("getListing", [id])))) as unknown as OnChainListing[];
      listings.forEach((l, i) => {
        derived.push({
          id: `publish-${listingIds[i]}`,
          type: "publish",
          time: "on-chain",
          text: `${shortAddr(l.creator)} published ${l.name}`,
          listingId: Number(listingIds[i]),
        });
      });

      // Recent clones
      const cloneIds = lastN(cloneCount, 8);
      if (cloneIds.length > 0) {
        const clones = (await Promise.all(cloneIds.map((id) => read("getClone", [id])))) as unknown as OnChainClone[];
        clones.forEach((c, i) => {
          derived.push({
            id: `clone-${cloneIds[i]}`,
            type: "clone",
            time: "on-chain",
            text: `${shortAddr(c.owner)} cloned ${c.name}`,
            listingId: Number(c.listingId),
          });
        });
      }

      // Recent rentals
      const rentalIds = lastN(rentalCount, 8);
      if (rentalIds.length > 0) {
        const rentals = (await Promise.all(rentalIds.map((id) => read("getRental", [id])))) as unknown as OnChainRental[];
        rentals.forEach((r, i) => {
          derived.push({
            id: `rent-${rentalIds[i]}`,
            type: "rent",
            time: "on-chain",
            text: `${shortAddr(r.renter)} rented listing #${r.listingId.toString()}`,
            listingId: Number(r.listingId),
          });
        });
      }

      // Recent deployments
      const deployIds = lastN(deploymentCount, 8);
      if (deployIds.length > 0) {
        const deps = (await Promise.all(deployIds.map((id) => read("getDeployment", [id])))) as unknown as OnChainDeployment[];
        deps.forEach((d, i) => {
          derived.push({
            id: `deploy-${deployIds[i]}`,
            type: "deploy",
            time: "on-chain",
            text: `${shortAddr(d.deployer)} deployed listing #${d.listingId.toString()}`,
            listingId: Number(d.listingId),
          });
        });
      }

      // Newest first: clones/rentals/deploys tend to be later than the seed publishes
      derived.reverse();
      setEvents(derived);
    } catch {
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient]);

  useEffect(() => {
    void load();
  }, [load]);

  // Live: prepend new events as they happen this session.
  useWatchContractEvent({
    address: BAZAAR_REGISTRY_ADDRESS,
    abi: bazaarRegistryAbi,
    eventName: "AgentPublished",
    onLogs: (logs) =>
      setLiveEvents((cur) => [
        ...logs.map((l) => {
          const args = l.args as { creator?: string; name?: string; listingId?: bigint };
          return {
            id: `live-pub-${l.transactionHash}`,
            type: "publish" as ActivityType,
            time: "just now",
            text: `${shortAddr(args.creator)} published ${args.name ?? "an agent"}`,
            listingId: args.listingId ? Number(args.listingId) : undefined,
          };
        }),
        ...cur,
      ]),
  });

  useWatchContractEvent({
    address: BAZAAR_REGISTRY_ADDRESS,
    abi: bazaarRegistryAbi,
    eventName: "AgentCloned",
    onLogs: (logs) =>
      setLiveEvents((cur) => [
        ...logs.map((l) => {
          const args = l.args as { owner?: string; name?: string; listingId?: bigint };
          return {
            id: `live-clone-${l.transactionHash}`,
            type: "clone" as ActivityType,
            time: "just now",
            text: `${shortAddr(args.owner)} cloned ${args.name ?? "an agent"}`,
            listingId: args.listingId ? Number(args.listingId) : undefined,
          };
        }),
        ...cur,
      ]),
  });

  useWatchContractEvent({
    address: BAZAAR_REGISTRY_ADDRESS,
    abi: bazaarRegistryAbi,
    eventName: "AgentRented",
    onLogs: (logs) =>
      setLiveEvents((cur) => [
        ...logs.map((l) => {
          const args = l.args as { renter?: string; listingId?: bigint };
          return {
            id: `live-rent-${l.transactionHash}`,
            type: "rent" as ActivityType,
            time: "just now",
            text: `${shortAddr(args.renter)} rented listing #${args.listingId?.toString() ?? "?"}`,
            listingId: args.listingId ? Number(args.listingId) : undefined,
          };
        }),
        ...cur,
      ]),
  });

  useWatchContractEvent({
    address: BAZAAR_REGISTRY_ADDRESS,
    abi: bazaarRegistryAbi,
    eventName: "AgentDeployed",
    onLogs: (logs) =>
      setLiveEvents((cur) => [
        ...logs.map((l) => {
          const args = l.args as { deployer?: string; listingId?: bigint };
          return {
            id: `live-deploy-${l.transactionHash}`,
            type: "deploy" as ActivityType,
            time: "just now",
            text: `${shortAddr(args.deployer)} deployed listing #${args.listingId?.toString() ?? "?"}`,
            listingId: args.listingId ? Number(args.listingId) : undefined,
          };
        }),
        ...cur,
      ]),
  });

  return { events: [...liveEvents, ...events], stats, isLoading, reload: load };
}

function lastN(count: bigint, n: number): bigint[] {
  const total = Number(count);
  if (total <= 0) return [];
  const start = Math.max(1, total - n + 1);
  const ids: bigint[] = [];
  for (let i = total; i >= start; i--) ids.push(BigInt(i));
  return ids;
}
