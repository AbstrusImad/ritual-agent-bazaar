import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Copy, KeyRound, Pause, Play, RefreshCw, Rocket, Sparkles, Upload } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useApp } from "../store/AppContext";
import { useBazaarActivity } from "../hooks/useBazaarActivity";
import type { ActivityType } from "../types";
import { cn } from "../lib/cn";
import { GlassButton } from "../components/GlassButton";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingShimmer } from "../components/ui/LoadingShimmer";

const filters: { id: "all" | ActivityType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "clone", label: "Clones" },
  { id: "rent", label: "Rentals" },
  { id: "deploy", label: "Deploys" },
  { id: "publish", label: "Publishes" },
  { id: "recovery", label: "Recoveries" },
];

const typeMeta: Record<ActivityType, { color: string; label: string; icon: LucideIcon }> = {
  clone: { color: "#d9a441", label: "Clone", icon: Copy },
  rent: { color: "#4fd8a0", label: "Rent", icon: KeyRound },
  deploy: { color: "#f0d9a4", label: "Deploy", icon: Rocket },
  publish: { color: "#f3ede1", label: "Publish", icon: Upload },
  recovery: { color: "#d14e56", label: "Recovery", icon: RefreshCw },
  update: { color: "#c9c3b6", label: "Update", icon: Sparkles },
};

export function ActivityView() {
  const { pushToast, listings, openOverlay } = useApp();
  const { events, stats, isLoading, reload } = useBazaarActivity();
  const [filter, setFilter] = useState<"all" | ActivityType>("all");
  const [paused, setPaused] = useState(false);

  const totalEntities = stats.listings + stats.clones;
  const totalActions = stats.clones + stats.rentals + stats.deployments;

  function viewEvent(event: { listingId?: number; text: string }) {
    const match =
      (event.listingId ? listings.find((l) => l.listingId === event.listingId) : undefined) ??
      listings.find((l) => event.text.includes(l.name));
    if (match) {
      openOverlay("inspect", match);
    } else {
      pushToast("This event's listing is not loaded.", "gold");
    }
  }

  const filtered = useMemo(
    () => (filter === "all" ? events : events.filter((event) => event.type === filter)),
    [filter, events],
  );

  return (
    <div className="mx-auto flex h-full w-full max-w-6xl flex-col px-8 pt-2">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="font-display text-3xl font-semibold text-ivory">Bazaar Activity</h1>
        <p className="mt-1 text-sm text-silver/70">Live movement across autonomous agents, creators, and deployments.</p>
      </motion.div>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-all",
              filter === item.id ? "border-gold bg-gold/15 text-champagne shadow-goldglow" : "border-gold/20 text-silver/60 hover:border-gold/40",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid flex-1 grid-cols-1 gap-8 overflow-hidden lg:grid-cols-[1fr_300px]">
        {/* Timeline */}
        <div className="hall-scroll relative overflow-y-auto pr-2">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <LoadingShimmer text="Reading on-chain activity..." />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <EmptyState title="No activity yet." />
            </div>
          ) : (
            <div className="relative pl-6">
              {/* vertical line */}
              <div className="absolute bottom-2 left-2 top-2 w-px bg-gradient-to-b from-gold/40 via-gold/15 to-transparent" />
              <div className="space-y-3">
                {filtered.map((event, index) => {
                  const meta = typeMeta[event.type];
                  const Icon = meta.icon;
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.06 }}
                      className="relative"
                    >
                      {/* pulse dot */}
                      <span
                        className={cn("absolute -left-[18px] top-4 h-3 w-3 rounded-full", !paused && "animate-pulseglow")}
                        style={{ background: meta.color, boxShadow: `0 0 12px ${meta.color}` }}
                      />
                      <div className="glass flex items-center justify-between gap-3 rounded-xl border border-gold/15 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="grid h-8 w-8 place-items-center rounded-lg border" style={{ borderColor: `${meta.color}55`, color: meta.color }}>
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-sm text-ivory">{event.text}</p>
                            <p className="text-[11px]" style={{ color: meta.color }}>
                              {meta.label} · <span className="text-silver/50">{event.time}</span>
                            </p>
                          </div>
                        </div>
                        <GlassButton size="sm" variant="ghost" onClick={() => viewEvent(event)}>
                          View
                        </GlassButton>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Live pulse radar */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass h-fit rounded-3xl border border-gold/30 p-6 shadow-goldglow">
          <div className="relative mx-auto grid h-40 w-40 place-items-center">
            {[0, 1, 2].map((ring) => (
              <span
                key={ring}
                className={cn("absolute rounded-full border border-emerald/30", !paused && "animate-pulseglow")}
                style={{ width: `${40 + ring * 40}px`, height: `${40 + ring * 40}px`, animationDelay: `${ring * 0.5}s` }}
              />
            ))}
            {!paused ? <span className="absolute h-40 w-40 origin-center animate-spinslow" style={{ background: "conic-gradient(from 0deg, transparent 70%, rgba(79,216,160,0.35))", borderRadius: "9999px" }} /> : null}
            <span className="relative h-3 w-3 rounded-full bg-emerald shadow-emeraldglow" />
          </div>
          <div className="mt-4 text-center">
            <p className="font-display text-lg text-ivory">Live Bazaar Pulse</p>
            <p className="mt-1 text-sm text-emerald">{totalEntities} on-chain entities</p>
            <p className="text-xs text-silver/60">{totalActions} marketplace actions recorded</p>
          </div>
          <GlassButton
            size="sm"
            variant="ghost"
            className="mt-4 w-full"
            onClick={() => {
              setPaused((p) => !p);
              pushToast(paused ? "Feed resumed." : "Feed paused.", "gold");
            }}
            icon={paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          >
            {paused ? "Resume Feed" : "Pause Feed"}
          </GlassButton>
          <GlassButton
            size="sm"
            variant="gold"
            className="mt-2 w-full"
            onClick={() => { void reload(); pushToast("Refreshing activity.", "gold"); }}
            icon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Refresh
          </GlassButton>
        </motion.div>
      </div>
    </div>
  );
}
