import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Copy as CopyIcon, KeyRound, Rocket, ShieldCheck, Star, Wallet } from "lucide-react";
import { useConnect, usePublicClient, useSwitchChain } from "wagmi";
import { injected } from "wagmi/connectors";
import { bazaarRegistryAbi } from "../lib/abi";
import { BAZAAR_REGISTRY_ADDRESS, RITUAL_CHAIN } from "../lib/ritual";
import { HallBackground } from "../components/HallBackground";
import { RitualSigil } from "../components/RitualSigil";
import { CapsulePreview } from "../components/CapsulePreview";

interface ChainStats {
  agents: number;
  clones: number;
  deployments: number;
}

/**
 * Full-screen, no-scroll gate. The bazaar only opens to a connected wallet;
 * connecting also suggests (or adds) Ritual Chain 1979.
 */
export function LandingView() {
  const { connectAsync, connectors } = useConnect();
  const { switchChainAsync } = useSwitchChain();
  const publicClient = usePublicClient();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ChainStats | null>(null);

  // Live marketplace numbers straight from the registry — no wallet needed.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!publicClient) return;
      try {
        const read = (functionName: "listingCount" | "cloneCount" | "deploymentCount") =>
          publicClient.readContract({ address: BAZAAR_REGISTRY_ADDRESS, abi: bazaarRegistryAbi, functionName });
        const [agents, clones, deployments] = (await Promise.all([
          read("listingCount"),
          read("cloneCount"),
          read("deploymentCount"),
        ])) as [bigint, bigint, bigint];
        if (!cancelled) setStats({ agents: Number(agents), clones: Number(clones), deployments: Number(deployments) });
      } catch {
        /* stats are decorative here; the gate works without them */
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [publicClient]);

  async function enter() {
    setError(null);
    if (typeof window !== "undefined" && !(window as { ethereum?: unknown }).ethereum) {
      setError("No EVM wallet detected. Install MetaMask (or any injected wallet) and reload.");
      return;
    }
    setPending(true);
    try {
      await connectAsync({ connector: connectors[0] ?? injected() });
      // Suggest Ritual: switch if the wallet knows it, offer to add it if not.
      try {
        await switchChainAsync({ chainId: RITUAL_CHAIN.id });
      } catch {
        /* user declined the switch — they are still let in, actions will re-prompt */
      }
    } catch {
      setError("Connection was cancelled. The gallery only opens to a connected wallet.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-obsidian">
      <HallBackground />

      <div className="relative z-10 flex h-full flex-col items-center justify-between px-6 py-6">
        {/* ---- eyebrow ---- */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <RitualSigil size={26} />
          <span className="text-[11px] uppercase tracking-[0.34em] text-champagne/75">
            Ritual Chain · 1979
          </span>
        </motion.div>

        {/* ---- hero ---- */}
        <div className="flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-5">
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-glow-gold text-center font-display font-semibold leading-none text-ivory"
            style={{ fontSize: "clamp(2.6rem, 6vw, 4.6rem)" }}
          >
            Ritual Agent Bazaar
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="max-w-xl text-center text-sm leading-relaxed text-silver/75 md:text-base"
          >
            A dark gallery of autonomous agents held in glass. Inspect living entities,
            clone them into your vault, rent their craft, and deploy them on-chain —
            every action a real transaction on Ritual.
          </motion.p>

          {/* capsule trio */}
          <div className="flex items-end gap-6 md:gap-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 0.78, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="hidden animate-float sm:block"
              style={{ animationDelay: "1.2s" }}
            >
              <CapsulePreview theme="emerald-shield" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 36, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.42 }}
              className="animate-float"
            >
              <CapsulePreview theme="gold-market-core" size="lg" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 0.78, y: 0 }}
              transition={{ duration: 0.8, delay: 0.65 }}
              className="hidden animate-float sm:block"
              style={{ animationDelay: "2.1s" }}
            >
              <CapsulePreview theme="ruby-crystal" />
            </motion.div>
          </div>

          {/* live stats */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex items-center gap-3 md:gap-4"
          >
            <StatChip icon={Star} label="Agents on display" value={stats ? String(stats.agents) : "—"} />
            <StatChip icon={CopyIcon} label="Clones minted" value={stats ? String(stats.clones) : "—"} />
            <StatChip icon={Rocket} label="Deployments" value={stats ? String(stats.deployments) : "—"} />
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.95 }}
            className="flex flex-col items-center gap-2.5"
          >
            <button
              onClick={() => void enter()}
              disabled={pending}
              className="group relative flex items-center gap-3 rounded-full border border-gold/60 bg-gold/10 px-9 py-3.5 text-[15px] font-medium tracking-wide text-champagne shadow-goldglow transition-all duration-300 hover:bg-gold/20 hover:shadow-[0_0_60px_-8px_rgba(217,164,65,0.7)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 disabled:opacity-60"
            >
              <Wallet className="h-5 w-5" />
              {pending ? "Opening your wallet..." : "Connect Wallet to Enter"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <p className="flex items-center gap-1.5 text-[11px] text-silver/55">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald" />
              Injected EVM wallet · auto-suggests Ritual Chain 1979 · no custody, no signatures until you act
            </p>
            {error ? <p className="max-w-md text-center text-xs text-ruby">{error}</p> : null}
          </motion.div>
        </div>

        {/* ---- footer ---- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[11px] text-silver/45"
        >
          <span className="flex items-center gap-1.5">
            <KeyRound className="h-3 w-3 text-gold/60" />
            Marketplace state 100% on-chain
          </span>
          <a
            href={`${RITUAL_CHAIN.blockExplorers.default.url}/address/${BAZAAR_REGISTRY_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-silver/55 transition-colors hover:text-champagne"
          >
            {BAZAAR_REGISTRY_ADDRESS.slice(0, 10)}…{BAZAAR_REGISTRY_ADDRESS.slice(-8)}
          </a>
        </motion.div>
      </div>
    </div>
  );
}

function StatChip({ icon: Icon, label, value }: { icon: typeof Star; label: string; value: string }) {
  return (
    <div className="glass flex items-center gap-2.5 rounded-full border border-gold/20 px-4 py-2">
      <Icon className="h-3.5 w-3.5 text-gold/80" />
      <span className="font-display text-lg leading-none text-ivory">{value}</span>
      <span className="text-[10px] uppercase tracking-[0.12em] text-silver/55">{label}</span>
    </div>
  );
}
