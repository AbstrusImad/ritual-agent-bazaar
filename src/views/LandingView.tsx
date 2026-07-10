import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Copy,
  Eye,
  KeyRound,
  Rocket,
  ShieldCheck,
  Upload,
  Wallet,
} from "lucide-react";
import { useConnect, usePublicClient, useSwitchChain } from "wagmi";
import { injected } from "wagmi/connectors";
import type { AgentTheme } from "../types";
import { bazaarRegistryAbi } from "../lib/abi";
import { BAZAAR_REGISTRY_ADDRESS, RITUAL_CHAIN } from "../lib/ritual";
import { themeTokens } from "../lib/theme";
import { cn } from "../lib/cn";
import { HallBackground } from "../components/HallBackground";
import { RitualSigil } from "../components/RitualSigil";
import { BellJar } from "../components/BellJar";

/* ------------------------------------------------------------------ */
/*  The exhibits that rotate through the showcase vitrine              */
/* ------------------------------------------------------------------ */

const SHOWCASE: { name: string; category: string; theme: AgentTheme; line: string }[] = [
  { name: "Market Sentinel", category: "DeFi", theme: "gold-market-core", line: "Watches markets and shields value in real time." },
  { name: "Wallet Guardian", category: "Security", theme: "emerald-shield", line: "Blocks suspicious transfers before they settle." },
  { name: "Research Oracle", category: "Research", theme: "ivory-crystal", line: "Distills on-chain signals into long-term memory." },
  { name: "Community Operator", category: "Community", theme: "emerald-network", line: "Keeps a community routed, synced, and alive." },
  { name: "Contract Watcher", category: "Security", theme: "ruby-crystal", line: "Flags risky contract patterns before harm." },
];

const FEATURES = [
  { icon: Eye, title: "Inspect", text: "Open any capsule: mission, capabilities, and written reviews — all stored on-chain." },
  { icon: Copy, title: "Clone", text: "Mint your own copy into the Vault. The fee pays the creator; any excess refunds itself." },
  { icon: KeyRound, title: "Rent", text: "Borrow an agent for 7–90 days at a pro-rated price, settled wallet-to-wallet." },
  { icon: Rocket, title: "Deploy", text: "Record deployments on Ritual and track every one of them from your Vault." },
  { icon: Upload, title: "Publish", text: "Exhibit your own agent — or re-list a clone you have customized." },
];

interface ChainStats {
  agents: number;
  clones: number;
  deployments: number;
}

/* ------------------------------------------------------------------ */

export function LandingView() {
  const { connectAsync, connectors } = useConnect();
  const { switchChainAsync } = useSwitchChain();
  const publicClient = usePublicClient();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ChainStats | null>(null);
  const [exhibit, setExhibit] = useState(0);
  const timer = useRef<number | null>(null);

  /* live registry numbers — read without a wallet */
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!publicClient) return;
      try {
        const read = (fn: "listingCount" | "cloneCount" | "deploymentCount") =>
          publicClient.readContract({ address: BAZAAR_REGISTRY_ADDRESS, abi: bazaarRegistryAbi, functionName: fn });
        const [agents, clones, deployments] = (await Promise.all([
          read("listingCount"),
          read("cloneCount"),
          read("deploymentCount"),
        ])) as [bigint, bigint, bigint];
        if (!cancelled) setStats({ agents: Number(agents), clones: Number(clones), deployments: Number(deployments) });
      } catch {
        /* decorative */
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [publicClient]);

  /* rotating vitrine */
  const startRotation = useCallback(() => {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      if (document.documentElement.dataset.motion === "off") return;
      setExhibit((e) => (e + 1) % SHOWCASE.length);
    }, 4600);
  }, []);

  useEffect(() => {
    startRotation();
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [startRotation]);

  function pickExhibit(i: number) {
    setExhibit(i);
    startRotation();
  }

  async function enter() {
    setError(null);
    if (typeof window !== "undefined" && !(window as { ethereum?: unknown }).ethereum) {
      setError("No EVM wallet detected — install MetaMask or any injected wallet, then reload.");
      return;
    }
    setPending(true);
    try {
      await connectAsync({ connector: connectors[0] ?? injected() });
      try {
        await switchChainAsync({ chainId: RITUAL_CHAIN.id });
      } catch {
        /* declined the chain switch — still allowed in; actions re-prompt */
      }
    } catch {
      setError("Connection cancelled. The gallery only opens to a connected wallet.");
    } finally {
      setPending(false);
    }
  }

  const current = SHOWCASE[exhibit];
  const tokens = themeTokens[current.theme];

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-obsidian">
      <HallBackground />

      {/* museum lights sweeping across the hall */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="animate-lightsweep absolute top-0 h-full w-[38%]"
          style={{
            background:
              "linear-gradient(100deg, transparent 0%, rgba(232,200,132,0.05) 45%, rgba(232,200,132,0.09) 50%, rgba(232,200,132,0.05) 55%, transparent 100%)",
          }}
        />
      </div>

      <div className="relative z-10 flex h-full flex-col px-6 md:px-10 xl:px-16">
        {/* ============ top bar ============ */}
        <motion.header
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex h-[64px] shrink-0 items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <RitualSigil size={26} />
            <span className="font-display text-lg font-semibold tracking-[0.12em] text-ivory">Ritual Agent Bazaar</span>
          </div>
          <span className="rounded-full border border-gold/25 bg-black/40 px-3.5 py-1.5 text-[10px] uppercase tracking-[0.28em] text-champagne/80 backdrop-blur">
            Ritual Chain · 1979
          </span>
        </motion.header>

        {/* ============ stage ============ */}
        <div className="grid min-h-0 flex-1 grid-cols-1 items-center gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10">
          {/* ---- narrative ---- */}
          <div className="flex min-w-0 flex-col items-center text-center lg:items-start lg:text-left">
            {/* eyebrow */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="mb-3 flex items-center gap-3"
            >
              <span className="hidden h-px w-10 bg-gradient-to-r from-gold/70 to-transparent lg:block" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-champagne/70">The on-chain agent gallery</span>
            </motion.div>

            {/* masked title reveal */}
            <h1
              className="font-display font-semibold leading-[1.04] text-ivory"
              style={{ fontSize: "clamp(2.1rem, 4.6vw, 4rem)" }}
            >
              {["Living agents,", "held in glass,", "traded on-chain."].map((line, i) => (
                <span key={line} className="block overflow-hidden">
                  <motion.span
                    className={cn("block", i === 2 && "text-glow-gold text-champagne")}
                    initial={{ y: "112%" }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.35 + i * 0.14, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.6 }}
              className="mt-4 max-w-lg text-[13px] leading-relaxed text-silver/75 md:text-[15px]"
            >
              A marketplace where autonomous agents are exhibited like rare artifacts.
              Every listing, clone, rental, deployment, and review is a real transaction
              on Ritual — nothing mocked, nothing off-chain.
            </motion.p>

            {/* what you can do — the descriptive spine */}
            <div className="mt-6 hidden w-full max-w-xl flex-col gap-2.5 lg:flex">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: -22 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 + i * 0.09, duration: 0.5 }}
                  className="group flex items-center gap-4 border-l border-gold/15 py-1 pl-4 transition-colors hover:border-gold/60"
                >
                  <f.icon className="h-4 w-4 shrink-0 text-gold/70 transition-all group-hover:text-gold group-hover:drop-shadow-[0_0_8px_rgba(217,164,65,0.8)]" />
                  <span className="w-16 shrink-0 font-display text-[15px] font-semibold tracking-wide text-champagne">{f.title}</span>
                  <span className="truncate text-[12.5px] text-silver/65 transition-colors group-hover:text-silver/90">{f.text}</span>
                </motion.div>
              ))}
            </div>

            {/* compact feature chips on small screens */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              className="mt-5 flex flex-wrap justify-center gap-2 lg:hidden"
            >
              {FEATURES.map((f) => (
                <span key={f.title} className="flex items-center gap-1.5 rounded-full border border-gold/20 bg-black/40 px-3 py-1 text-[11px] text-champagne/85">
                  <f.icon className="h-3 w-3 text-gold/70" />
                  {f.title}
                </span>
              ))}
            </motion.div>

            {/* CTA — rotating sigil ring */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.35, duration: 0.6 }}
              className="mt-7 flex flex-col items-center gap-2.5 lg:items-start"
            >
              <div className="relative overflow-hidden rounded-full p-[1.5px]">
                <div
                  className="animate-orbit absolute -inset-[150%]"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent 0deg, transparent 285deg, rgba(232,200,132,0.9) 325deg, rgba(240,217,164,1) 335deg, rgba(232,200,132,0.9) 345deg, transparent 360deg)",
                  }}
                />
                <button
                  onClick={() => void enter()}
                  disabled={pending}
                  className="group relative flex items-center gap-3 rounded-full border border-gold/35 bg-[#0d0a08]/95 px-9 py-3.5 text-[15px] font-medium tracking-wide text-champagne transition-all duration-300 hover:bg-gold/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 disabled:opacity-60"
                >
                  <Wallet className="h-[18px] w-[18px]" />
                  {pending ? "Opening your wallet..." : "Connect Wallet to Enter"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
              <p className="flex items-center gap-1.5 text-[11px] text-silver/50">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald" />
                Non-custodial · suggests Ritual Chain 1979 · session survives refresh
              </p>
              {error ? <p className="max-w-md text-xs text-ruby">{error}</p> : null}
            </motion.div>
          </div>

          {/* ---- the vitrine ---- */}
          <div className="relative hidden min-w-0 flex-col items-center justify-center lg:flex">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mb-1 text-[10px] uppercase tracking-[0.34em] text-silver/45"
            >
              Now showing
            </motion.span>

            <div className="relative h-[min(58vh,520px)] w-[min(24vw,240px)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.name}
                  initial={{ opacity: 0, y: 18, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -14, scale: 0.985 }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                  className="absolute inset-0"
                  style={{ filter: `drop-shadow(0 0 38px ${tokens.glow})` }}
                >
                  <BellJar theme={current.theme} intense className="h-full w-full" />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* museum placard */}
            <AnimatePresence mode="wait">
              <motion.div
                key={current.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="glass -mt-2 w-[270px] rounded-xl border border-gold/25 px-5 py-3 text-center"
              >
                <p className="font-display text-xl font-semibold text-ivory">{current.name}</p>
                <p className={cn("text-[11px] uppercase tracking-[0.16em]", tokens.categoryClass)}>{current.category}</p>
                <p className="mt-1 text-[12px] text-silver/65">{current.line}</p>
              </motion.div>
            </AnimatePresence>

            {/* exhibit selector */}
            <div className="mt-3 flex items-center gap-2">
              {SHOWCASE.map((s, i) => (
                <button
                  key={s.name}
                  onClick={() => pickExhibit(i)}
                  aria-label={`Show ${s.name}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-400",
                    i === exhibit ? "w-6 bg-gold shadow-goldglow" : "w-1.5 bg-silver/30 hover:bg-silver/60",
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ============ ledger strip ============ */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="flex h-[54px] shrink-0 items-center justify-center gap-x-6 gap-y-1 border-t border-gold/10 text-[11px] text-silver/50 md:gap-x-10"
        >
          <Stat value={stats ? stats.agents : null} label="agents on display" />
          <Dot />
          <Stat value={stats ? stats.clones : null} label="clones minted" />
          <Dot />
          <Stat value={stats ? stats.deployments : null} label="deployments" />
          <Dot className="hidden md:block" />
          <a
            href={`${RITUAL_CHAIN.blockExplorers.default.url}/address/${BAZAAR_REGISTRY_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
            className="hidden font-mono text-silver/55 transition-colors hover:text-champagne md:block"
          >
            registry {BAZAAR_REGISTRY_ADDRESS.slice(0, 8)}…{BAZAAR_REGISTRY_ADDRESS.slice(-6)}
          </a>
        </motion.footer>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: number | null; label: string }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="font-display text-lg leading-none text-champagne">{value ?? "—"}</span>
      <span className="uppercase tracking-[0.14em]">{label}</span>
    </span>
  );
}

function Dot({ className }: { className?: string }) {
  return <span className={cn("h-1 w-1 rounded-full bg-gold/40", className)} />;
}
