import { defineChain } from "viem";

export const RITUAL_CHAIN = defineChain({
  id: 1979,
  name: "Ritual",
  nativeCurrency: { name: "RITUAL", symbol: "RITUAL", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.ritualfoundation.org"] },
  },
  blockExplorers: {
    default: { name: "Ritual Explorer", url: "https://explorer.ritualfoundation.org" },
  },
});

export const BAZAAR_REGISTRY_ADDRESS =
  (import.meta.env.VITE_BAZAAR_REGISTRY as `0x${string}` | undefined) ??
  "0x9cf5315cA95Dd69c5D83B4E74B5aA449A894d0a6";

export const BAZAAR_DEPLOY_BLOCK = 43_691_000n;
