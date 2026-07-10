import { useCallback } from "react";
import { parseEther } from "viem";
import { useAccount, useConnect, usePublicClient, useSwitchChain, useWriteContract } from "wagmi";
import { injected } from "wagmi/connectors";
import { bazaarRegistryAbi } from "../lib/abi";
import { BAZAAR_REGISTRY_ADDRESS, RITUAL_CHAIN } from "../lib/ritual";

const AGENT_TYPE_CODE: Record<string, number> = { "Sovereign Agent": 0, "Persistent Agent": 1 };
const PRICING_CODE: Record<string, number> = {
  Free: 0,
  Rent: 1,
  Subscription: 2,
  "One-time Clone": 3,
};

export function useBazaarActions() {
  const { address, isConnected, chainId } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const ensureConnected = useCallback(async () => {
    if (!isConnected) {
      await connectAsync({ connector: connectors[0] ?? injected() });
    }
    // All marketplace writes live on Ritual 1979 — nudge the wallet over first.
    if (chainId !== RITUAL_CHAIN.id) {
      await switchChainAsync({ chainId: RITUAL_CHAIN.id });
    }
  }, [isConnected, chainId, connectAsync, connectors, switchChainAsync]);

  const waitFor = useCallback(
    async (hash: `0x${string}`) => {
      if (!publicClient) return;
      await publicClient.waitForTransactionReceipt({ hash });
    },
    [publicClient],
  );

  const publish = useCallback(
    async (input: {
      name: string;
      category: string;
      agentType: string;
      pricingModel: string;
      monthlyPrice: string; // "9.6 RITUAL/mo" or "9.6"
      cloneFee: string; // "24 RITUAL" or "24"
      mission: string;
      theme: string;
      capabilities: string[];
    }) => {
      await ensureConnected();
      const hash = await writeContractAsync({
        address: BAZAAR_REGISTRY_ADDRESS,
        abi: bazaarRegistryAbi,
        functionName: "publishAgent",
        args: [
          input.name,
          input.category,
          AGENT_TYPE_CODE[input.agentType] ?? 1,
          PRICING_CODE[input.pricingModel] ?? 2,
          parseEther(numeric(input.monthlyPrice)),
          parseEther(numeric(input.cloneFee)),
          input.mission,
          input.theme,
          input.capabilities,
        ],
      });
      await waitFor(hash);
      return hash;
    },
    [ensureConnected, writeContractAsync, waitFor],
  );

  const clone = useCallback(
    async (input: {
      listingId: number;
      name: string;
      mission: string;
      riskLevel: string;
      monthlyBudget: string;
      cloneFeeWei: bigint;
    }) => {
      await ensureConnected();
      const hash = await writeContractAsync({
        address: BAZAAR_REGISTRY_ADDRESS,
        abi: bazaarRegistryAbi,
        functionName: "cloneAgent",
        args: [
          BigInt(input.listingId),
          input.name,
          input.mission,
          input.riskLevel,
          parseEther(numeric(input.monthlyBudget)),
        ],
        value: input.cloneFeeWei,
      });
      await waitFor(hash);
      return hash;
    },
    [ensureConnected, writeContractAsync, waitFor],
  );

  const rent = useCallback(
    async (input: { listingId: number; periodDays: number; usageMode: string; monthlyPriceWei: bigint }) => {
      await ensureConnected();
      const cost = (input.monthlyPriceWei * BigInt(input.periodDays)) / 30n;
      const hash = await writeContractAsync({
        address: BAZAAR_REGISTRY_ADDRESS,
        abi: bazaarRegistryAbi,
        functionName: "rentAgent",
        args: [BigInt(input.listingId), BigInt(input.periodDays), input.usageMode],
        value: cost,
      });
      await waitFor(hash);
      return hash;
    },
    [ensureConnected, writeContractAsync, waitFor],
  );

  const deploy = useCallback(
    async (listingId: number) => {
      await ensureConnected();
      const hash = await writeContractAsync({
        address: BAZAAR_REGISTRY_ADDRESS,
        abi: bazaarRegistryAbi,
        functionName: "deployAgent",
        args: [BigInt(listingId), "Ritual Chain 1979"],
      });
      await waitFor(hash);
      return hash;
    },
    [ensureConnected, writeContractAsync, waitFor],
  );

  const rate = useCallback(
    async (listingId: number, stars: number, comment: string) => {
      await ensureConnected();
      const hash = await writeContractAsync({
        address: BAZAAR_REGISTRY_ADDRESS,
        abi: bazaarRegistryAbi,
        functionName: "rateAgent",
        args: [BigInt(listingId), stars, comment],
      });
      await waitFor(hash);
      return hash;
    },
    [ensureConnected, writeContractAsync, waitFor],
  );

  return { address, isConnected, ensureConnected, publish, clone, rent, rate, deploy };
}

function numeric(value: string): string {
  const match = value.match(/[\d.]+/);
  return match ? match[0] : "0";
}
