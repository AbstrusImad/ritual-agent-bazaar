import { createRoot } from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { wagmiConfig } from "./lib/wagmi";
import "./index.css";

// StrictMode intentionally omitted: framer-motion's AnimatePresence can leave
// entering elements stranded at their exit state under the dev double-mount.
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </WagmiProvider>,
);
