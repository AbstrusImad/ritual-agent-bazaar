import { createConfig, createStorage, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { RITUAL_CHAIN } from "./ritual";

// Connection state persists in localStorage so a connected wallet survives
// page refreshes (WagmiProvider reconnects on mount); shimDisconnect keeps
// an explicit in-app disconnect sticky across reloads too.
export const wagmiConfig = createConfig({
  chains: [RITUAL_CHAIN],
  connectors: [injected({ shimDisconnect: true })],
  storage: createStorage({ storage: window.localStorage }),
  transports: {
    [RITUAL_CHAIN.id]: http(),
  },
});
