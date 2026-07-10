import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, KeyRound, Rocket, RotateCcw, Upload } from "lucide-react";
import { useApp } from "../store/AppContext";
import { useMyVault, type VaultClone, type VaultDeployment, type VaultRental } from "../hooks/useMyVault";
import { formatRitual } from "../hooks/useListings";
import { saveDraft } from "../lib/prefs";
import { themeTokens } from "../lib/theme";
import type { AgentTheme } from "../types";
import { AgentForm } from "../components/AgentForm";
import { GlassButton } from "../components/GlassButton";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingShimmer } from "../components/ui/LoadingShimmer";

type Tab = "clones" | "rentals" | "deployments";

function timeAgo(unixSeconds: number): string {
  const diff = Math.max(0, Math.floor(Date.now() / 1000) - unixSeconds);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function dateLabel(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function VaultView() {
  const { setActiveView, isConnected, connectWallet, openOverlay, listings, pushToast } = useApp();
  const { clones, rentals, deployments, isLoading, reload } = useMyVault();
  const [tab, setTab] = useState<Tab>("clones");

  const tabs: { id: Tab; label: string; count: number }[] = useMemo(
    () => [
      { id: "clones", label: "Cloned", count: clones.length },
      { id: "rentals", label: "Rented", count: rentals.length },
      { id: "deployments", label: "Deployed", count: deployments.length },
    ],
    [clones.length, rentals.length, deployments.length],
  );

  function openListing(listingId: number) {
    const match = listings.find((l) => l.listingId === listingId);
    if (match) openOverlay("inspect", match);
    else pushToast("Parent listing not found on-chain.", "gold");
  }

  // Publish one of your clones as a brand-new Bazaar listing (you become the
  // creator). Pre-fills the Publish flow with the clone + parent listing data.
  function listClone(clone: VaultClone) {
    const parent = listings.find((l) => l.listingId === clone.listingId);
    saveDraft({
      name: clone.name,
      category: clone.category,
      agentType: clone.type,
      creator: "You",
      mission: clone.mission,
      pricingModel: parent?.pricingModel ?? "Subscription",
      monthlyPrice: clone.budget.split(" ")[0] || "0.02",
      cloneFee: parent ? formatRitual(parent.cloneFeeWei) : "0.01",
      capabilities: parent ? parent.capabilities.join(", ") : "",
    });
    pushToast("Draft prepared from your clone — review and publish.", "gold");
    setActiveView("publish");
  }

  if (!isConnected) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <EmptyState
          title="Connect to open your Vault."
          subtitle="Your cloned, rented, and deployed agents live on-chain. Connect a wallet to view them."
          actionLabel="Connect Wallet"
          onAction={() => void connectWallet()}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-6xl flex-col px-8 pt-2">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="font-display text-3xl font-semibold text-ivory">My Agent Vault</h1>
        <p className="mt-1 text-sm text-silver/70">
          Your private collection of cloned, rented, and deployed autonomous agents — read live from Ritual Chain.
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="mt-5 flex items-center justify-center gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`rounded-full border px-4 py-1.5 text-xs transition-all ${
              tab === item.id
                ? "border-gold bg-gold/15 text-champagne shadow-goldglow"
                : "border-gold/20 text-silver/60 hover:border-gold/40"
            }`}
          >
            {item.label} <span className="ml-1 text-[10px] text-silver/50">({item.count})</span>
          </button>
        ))}
        <GlassButton
          size="sm"
          variant="ghost"
          className="ml-2"
          onClick={() => {
            pushToast("Vault refreshed.", "gold");
            void reload();
          }}
          icon={<RotateCcw className="h-3.5 w-3.5" />}
        >
          Refresh
        </GlassButton>
      </div>

      <div className="hall-scroll mt-6 flex-1 overflow-y-auto pb-6">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <LoadingShimmer text="Reading your vault..." />
          </div>
        ) : (
          <>
            {tab === "clones" ? (
              clones.length === 0 ? (
                <VaultEmpty label="No cloned agents yet." action="Explore Bazaar" onAction={() => setActiveView("bazaar")} />
              ) : (
                <Grid>
                  {clones.map((c) => (
                    <CloneCard key={c.cloneId} clone={c} onOpen={() => openListing(c.listingId)} onList={() => listClone(c)} />
                  ))}
                </Grid>
              )
            ) : null}

            {tab === "rentals" ? (
              rentals.length === 0 ? (
                <VaultEmpty label="No active rentals." action="Explore Bazaar" onAction={() => setActiveView("bazaar")} />
              ) : (
                <Grid>
                  {rentals.map((r) => (
                    <RentalCard key={r.rentalId} rental={r} onOpen={() => openListing(r.listingId)} />
                  ))}
                </Grid>
              )
            ) : null}

            {tab === "deployments" ? (
              deployments.length === 0 ? (
                <VaultEmpty label="No deployments yet." action="Explore Bazaar" onAction={() => setActiveView("bazaar")} />
              ) : (
                <Grid>
                  {deployments.map((d) => (
                    <DeploymentCard key={d.deploymentId} deployment={d} onOpen={() => openListing(d.listingId)} />
                  ))}
                </Grid>
              )
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function VaultEmpty({ label, action, onAction }: { label: string; action: string; onAction: () => void }) {
  return (
    <div className="flex h-full min-h-[240px] items-center justify-center">
      <EmptyState title={label} subtitle="Clone, rent, or deploy an agent from the Bazaar to begin." actionLabel={action} onAction={onAction} />
    </div>
  );
}

function CardShell({
  theme,
  title,
  subtitle,
  children,
  actions,
}: {
  theme: AgentTheme;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  actions: React.ReactNode;
}) {
  const tokens = themeTokens[theme];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass flex flex-col rounded-2xl border border-gold/20 p-4"
      style={{ boxShadow: `0 0 34px -18px ${tokens.glow}` }}
    >
      <div className="flex items-center gap-3">
        <div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full"
          style={{ background: `radial-gradient(closest-side, ${tokens.glow}, transparent)`, border: `1px solid ${tokens.rim}` }}
        >
          <div className="h-8 w-8">
            <AgentForm theme={theme} />
          </div>
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg text-ivory">{title}</h3>
          <p className="truncate text-[11px] uppercase tracking-[0.14em] text-champagne/70">{subtitle}</p>
        </div>
      </div>

      <div className="mt-3 space-y-1.5 border-t border-gold/12 pt-3 text-sm">{children}</div>

      <div className="mt-3 flex gap-2">{actions}</div>
    </motion.div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-silver/55">{label}</span>
      <span className="truncate text-right" style={{ color: accent ?? "#f3ede1" }}>{value}</span>
    </div>
  );
}

function CloneCard({ clone, onOpen, onList }: { clone: VaultClone; onOpen: () => void; onList: () => void }) {
  return (
    <CardShell
      theme={clone.theme}
      title={clone.name}
      subtitle={`${clone.type} · ${clone.category}`}
      actions={
        <>
          <GlassButton size="sm" variant="ghost" className="flex-1" onClick={onOpen} icon={<ExternalLink className="h-3.5 w-3.5" />}>
            Open
          </GlassButton>
          <GlassButton size="sm" variant="gold" className="flex-1" onClick={onList} icon={<Upload className="h-3.5 w-3.5" />}>
            List in Bazaar
          </GlassButton>
        </>
      }
    >
      <Row label="Risk Level" value={clone.riskLevel} accent="#f0d9a4" />
      <Row label="Budget" value={clone.budget} />
      <Row label="Cloned" value={timeAgo(clone.createdAt)} />
      <p className="pt-1 text-xs text-silver/70">{clone.mission}</p>
    </CardShell>
  );
}

function RentalCard({ rental, onOpen }: { rental: VaultRental; onOpen: () => void }) {
  return (
    <CardShell
      theme={rental.theme}
      title={rental.name}
      subtitle={`${rental.type} · ${rental.category}`}
      actions={
        <GlassButton size="sm" variant="gold" className="w-full" onClick={onOpen} icon={<ExternalLink className="h-3.5 w-3.5" />}>
          Open Listing
        </GlassButton>
      }
    >
      <Row label="Status" value={rental.active ? "Active" : "Expired"} accent={rental.active ? "#4fd8a0" : "#d14e56"} />
      <Row label="Usage Mode" value={rental.usageMode} />
      <Row label="Ends" value={dateLabel(rental.endTime)} />
      <p className="flex items-center gap-1.5 pt-1 text-xs text-silver/60">
        <KeyRound className="h-3 w-3 text-emerald" /> Rented on {dateLabel(rental.startTime)}
      </p>
    </CardShell>
  );
}

function DeploymentCard({ deployment, onOpen }: { deployment: VaultDeployment; onOpen: () => void }) {
  return (
    <CardShell
      theme={deployment.theme}
      title={deployment.name}
      subtitle={`${deployment.type} · ${deployment.category}`}
      actions={
        <GlassButton size="sm" variant="gold" className="w-full" onClick={onOpen} icon={<ExternalLink className="h-3.5 w-3.5" />}>
          Open Listing
        </GlassButton>
      }
    >
      <Row label="Network" value={deployment.network} accent="#f0d9a4" />
      <Row label="Deployed" value={timeAgo(deployment.deployedAt)} />
      <Row label="Record #" value={`#${deployment.deploymentId}`} />
      <p className="flex items-center gap-1.5 pt-1 text-xs text-silver/60">
        <Rocket className="h-3 w-3 text-gold" /> On-chain deployment on {dateLabel(deployment.deployedAt)}
      </p>
    </CardShell>
  );
}
