import { useEffect, useState } from "react";
import { Copy, Layers, Sparkles, Star, Vault as VaultIcon } from "lucide-react";
import { usePublicClient } from "wagmi";
import { useApp } from "../../store/AppContext";
import { useMyVault } from "../../hooks/useMyVault";
import { bazaarRegistryAbi } from "../../lib/abi";
import { BAZAAR_REGISTRY_ADDRESS } from "../../lib/ritual";
import { OverlayShell } from "./OverlayShell";
import { GlassButton } from "../GlassButton";

export function ProfileModal() {
  const { closeOverlay, address, isConnected, connectWallet, favorites, listings, setActiveView, pushToast } = useApp();
  const { clones } = useMyVault();
  const publicClient = usePublicClient();
  const [publishedCount, setPublishedCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!publicClient || !address) {
        setPublishedCount(null);
        return;
      }
      try {
        const ids = (await publicClient.readContract({
          address: BAZAAR_REGISTRY_ADDRESS,
          abi: bazaarRegistryAbi,
          functionName: "getListingsByCreator",
          args: [address],
        })) as bigint[];
        if (!cancelled) setPublishedCount(ids.length);
      } catch {
        if (!cancelled) setPublishedCount(0);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [publicClient, address]);

  const favoriteAgents = listings.filter((l) => favorites.includes(l.name));

  return (
    <OverlayShell onClose={closeOverlay} className="w-[460px] max-w-[92vw] p-7" labelledBy="profile-title">
      <div className="flex items-center gap-3">
        <span
          className="grid h-12 w-12 place-items-center rounded-full text-sm font-semibold text-obsidian"
          style={{ background: "linear-gradient(135deg, #f0d9a4, #a9772a)" }}
        >
          {address ? address.slice(2, 4).toUpperCase() : "?"}
        </span>
        <div>
          <h2 id="profile-title" className="font-display text-2xl text-ivory">Builder Profile</h2>
          <p className="text-xs uppercase tracking-[0.16em] text-champagne/70">Ritual Chain · 1979</p>
        </div>
      </div>

      {!isConnected ? (
        <div className="mt-6 text-center">
          <p className="text-sm text-silver/70">Connect your wallet to view your on-chain builder profile.</p>
          <GlassButton variant="gold" className="mt-4" onClick={() => void connectWallet()}>Connect Wallet</GlassButton>
        </div>
      ) : (
        <>
          <button
            onClick={() => {
              void navigator.clipboard?.writeText(address ?? "");
              pushToast("Address copied.", "gold");
            }}
            className="mt-5 flex w-full items-center justify-between rounded-lg border border-gold/15 bg-graphite/40 px-3 py-2.5 text-sm hover:border-gold/40"
          >
            <span className="text-silver/60">Wallet</span>
            <span className="flex items-center gap-2 font-mono text-ivory">{address}<Copy className="h-3.5 w-3.5 text-champagne/70" /></span>
          </button>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <Stat icon={Layers} label="Published" value={publishedCount === null ? "…" : String(publishedCount)} />
            <Stat icon={VaultIcon} label="Cloned" value={String(clones.length)} />
            <Stat icon={Star} label="Favorites" value={String(favorites.length)} />
          </div>

          <div className="mt-5">
            <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-champagne/70">Saved Agents</p>
            {favoriteAgents.length === 0 ? (
              <p className="rounded-lg border border-gold/12 bg-graphite/30 px-3 py-3 text-sm text-silver/50">
                No saved agents yet. Use “Save” on an agent to bookmark it.
              </p>
            ) : (
              <div className="space-y-1.5">
                {favoriteAgents.map((agent) => (
                  <div key={agent.name} className="flex items-center justify-between rounded-lg border border-gold/12 bg-graphite/40 px-3 py-2 text-sm">
                    <span className="text-ivory">{agent.name}</span>
                    <span className="text-xs text-silver/50">{agent.category}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <GlassButton size="sm" variant="emerald" icon={<VaultIcon className="h-3.5 w-3.5" />} onClick={() => { setActiveView("vault"); closeOverlay(); }}>
              Open Vault
            </GlassButton>
            <GlassButton size="sm" variant="gold" icon={<Sparkles className="h-3.5 w-3.5" />} onClick={() => { setActiveView("publish"); closeOverlay(); }}>
              Publish
            </GlassButton>
          </div>
        </>
      )}
    </OverlayShell>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Layers; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gold/15 bg-graphite/40 p-3 text-center">
      <Icon className="mx-auto h-4 w-4 text-champagne/70" />
      <p className="mt-1.5 font-display text-xl text-ivory">{value}</p>
      <p className="text-[10px] uppercase tracking-[0.14em] text-silver/55">{label}</p>
    </div>
  );
}
