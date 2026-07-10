import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Build with GHPAGES=1 to emit "/ritual-agent-bazaar/" base for project pages.
const base = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.GHPAGES
  ? "/ritual-agent-bazaar/"
  : "/";

export default defineConfig({
  base,
  plugins: [react()],
});
