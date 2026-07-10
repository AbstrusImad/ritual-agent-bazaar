import { useCallback, useEffect, useState } from "react";
import { formatEther, type Address } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { bazaarRegistryAbi } from "../lib/abi";
import { BAZAAR_REGISTRY_ADDRESS } from "../lib/ritual";
import { resolveTheme } from "./useListings";
import type { AgentTheme } from "../types";

interface OnChainClone {
  id: bigint;
  listingId: bigint;
  owner: Address;
  name: string;
  mission: string;
  riskLevel: string;
  monthlyBudget: bigint;
  createdAt: bigint;
}
interface OnChainRental {
  id: bigint;
  listingId: bigint;
  renter: Address;
  startTime: bigint;
  endTime: bigint;
  usageMode: string;
}
interface OnChainDeployment {
  id: bigint;
  listingId: bigint;
  deployer: Address;
  network: string;
  deployedAt: bigint;
}
interface OnChainListingLite {
  name: string;
  category: string;
  agentType: number;
  theme: string;
}

export interface VaultClone {
  cloneId: number;
  listingId: number;
  name: string;
  mission: string;
  riskLevel: string;
  budget: string;
  createdAt: number;
  theme: AgentTheme;
  type: string;
  category: string;
}
export interface VaultRental {
  rentalId: number;
  listingId: number;
  name: string;
  usageMode: string;
  startTime: number;
  endTime: number;
  active: boolean;
  theme: AgentTheme;
  type: string;
  category: string;
}
export interface VaultDeployment {
  deploymentId: number;
  listingId: number;
  name: string;
  network: string;
  deployedAt: number;
  theme: AgentTheme;
  type: string;
  category: string;
}

function typeLabel(agentType: number): string {
  return agentType === 0 ? "Sovereign Agent" : "Persistent Agent";
}

export function useMyVault() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [clones, setClones] = useState<VaultClone[]>([]);
  const [rentals, setRentals] = useState<VaultRental[]>([]);
  const [deployments, setDeployments] = useState<VaultDeployment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    if (!publicClient || !address) {
      setClones([]);
      setRentals([]);
      setDeployments([]);
      return;
    }
    setIsLoading(true);
    try {
      const read = (functionName: string, args: unknown[]) =>
        publicClient.readContract({
          address: BAZAAR_REGISTRY_ADDRESS,
          abi: bazaarRegistryAbi,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          functionName: functionName as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          args: args as any,
        });

      const [cloneIds, rentalIds, deployIds] = (await Promise.all([
        read("getClonesByOwner", [address]),
        read("getRentalsByRenter", [address]),
        read("getDeploymentsByDeployer", [address]),
      ])) as unknown as [bigint[], bigint[], bigint[]];

      // Resolve every referenced listing once (name/theme/type/category).
      const [cloneRaw, rentalRaw, deployRaw] = await Promise.all([
        Promise.all(cloneIds.map((id) => read("getClone", [id]))) as Promise<unknown[]>,
        Promise.all(rentalIds.map((id) => read("getRental", [id]))) as Promise<unknown[]>,
        Promise.all(deployIds.map((id) => read("getDeployment", [id]))) as Promise<unknown[]>,
      ]);

      const clonesData = cloneRaw as unknown as OnChainClone[];
      const rentalsData = rentalRaw as unknown as OnChainRental[];
      const deploysData = deployRaw as unknown as OnChainDeployment[];

      const neededListingIds = new Set<number>();
      clonesData.forEach((c) => neededListingIds.add(Number(c.listingId)));
      rentalsData.forEach((r) => neededListingIds.add(Number(r.listingId)));
      deploysData.forEach((d) => neededListingIds.add(Number(d.listingId)));

      const listingMap = new Map<number, OnChainListingLite>();
      await Promise.all(
        [...neededListingIds].map(async (lid) => {
          try {
            const l = (await read("getListing", [BigInt(lid)])) as unknown as OnChainListingLite;
            listingMap.set(lid, l);
          } catch {
            /* listing may not exist; leave unresolved */
          }
        }),
      );

      const present = (lid: number) => listingMap.get(lid);

      setClones(
        clonesData.map((c) => {
          const lid = Number(c.listingId);
          const l = present(lid);
          return {
            cloneId: Number(c.id),
            listingId: lid,
            name: c.name,
            mission: c.mission,
            riskLevel: c.riskLevel,
            budget: `${Number(formatEther(c.monthlyBudget)).toFixed(3).replace(/\.?0+$/, "")} RITUAL/mo`,
            createdAt: Number(c.createdAt),
            theme: resolveTheme(l?.theme ?? ""),
            type: typeLabel(l?.agentType ?? 1),
            category: l?.category ?? "Agent",
          };
        }),
      );

      const now = Math.floor(Date.now() / 1000);
      setRentals(
        rentalsData.map((r) => {
          const lid = Number(r.listingId);
          const l = present(lid);
          return {
            rentalId: Number(r.id),
            listingId: lid,
            name: l?.name ?? `Listing #${lid}`,
            usageMode: r.usageMode,
            startTime: Number(r.startTime),
            endTime: Number(r.endTime),
            active: Number(r.endTime) > now,
            theme: resolveTheme(l?.theme ?? ""),
            type: typeLabel(l?.agentType ?? 1),
            category: l?.category ?? "Agent",
          };
        }),
      );

      setDeployments(
        deploysData.map((d) => {
          const lid = Number(d.listingId);
          const l = present(lid);
          return {
            deploymentId: Number(d.id),
            listingId: lid,
            name: l?.name ?? `Listing #${lid}`,
            network: d.network,
            deployedAt: Number(d.deployedAt),
            theme: resolveTheme(l?.theme ?? ""),
            type: typeLabel(l?.agentType ?? 1),
            category: l?.category ?? "Agent",
          };
        }),
      );
    } catch {
      setClones([]);
      setRentals([]);
      setDeployments([]);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, address]);

  useEffect(() => {
    void load();
  }, [load]);

  return { clones, rentals, deployments, isLoading, reload: load, address };
}
