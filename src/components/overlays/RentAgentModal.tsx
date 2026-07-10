import { useState } from "react";
import type { Agent } from "../../types";
import type { BazaarListing } from "../../hooks/useListings";
import { useApp } from "../../store/AppContext";
import { useBazaarActions } from "../../hooks/useBazaarActions";
import { cn } from "../../lib/cn";
import { OverlayShell } from "./OverlayShell";
import { CapsulePreview } from "../CapsulePreview";
import { GlassButton } from "../GlassButton";
import { readError } from "./CloneAgentModal";

const periods = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];
const modes = ["Simulation Only", "Active Deployment"];

export function RentAgentModal({ agent }: { agent: Agent }) {
  const listing = agent as BazaarListing;
  const { closeOverlay, pushToast } = useApp();
  const { rent } = useBazaarActions();
  const [days, setDays] = useState(30);
  const [mode, setMode] = useState("Simulation Only");
  const [pending, setPending] = useState(false);

  async function confirmRent() {
    if (!listing.listingId) {
      pushToast("This agent is not an on-chain listing.", "ruby");
      return;
    }
    setPending(true);
    try {
      pushToast("Confirm the rental in your wallet...", "gold");
      await rent({
        listingId: listing.listingId,
        periodDays: days,
        usageMode: mode,
        monthlyPriceWei: listing.monthlyPriceWei ?? 0n,
      });
      closeOverlay();
      pushToast("Rental activated.", "emerald");
    } catch (error) {
      pushToast(readError(error), "ruby");
    } finally {
      setPending(false);
    }
  }

  return (
    <OverlayShell onClose={closeOverlay} className="w-[600px] max-w-[94vw] p-7" labelledBy="rent-title">
      <h2 id="rent-title" className="font-display text-2xl text-ivory">Rent {agent.name}</h2>
      <p className="mt-1 text-sm text-silver/70">Use this agent without modifying the original blueprint. Cost is pro-rated and paid on-chain.</p>

      <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-[150px_1fr]">
        <div className="flex justify-center">
          <CapsulePreview theme={agent.theme} />
        </div>

        <div className="grid gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-[0.16em] text-champagne/70">Rental Period</span>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {periods.map((item) => (
                <button key={item.days} onClick={() => setDays(item.days)} className={cn("rounded-lg border px-2 py-1.5 text-xs transition-all", days === item.days ? "border-gold bg-gold/15 text-champagne shadow-goldglow" : "border-gold/20 text-silver/65 hover:border-gold/40")}>{item.label}</button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-gold/15 bg-graphite/40 px-3 py-2 text-sm">
            <span className="text-silver/55">Monthly cost</span>
            <span className="float-right text-champagne">{agent.price}</span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-[0.16em] text-champagne/70">Usage Mode</span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {modes.map((item) => (
                <button key={item} onClick={() => setMode(item)} className={cn("rounded-lg border px-2 py-1.5 text-xs transition-all", mode === item ? "border-emerald bg-emerald/15 text-emerald shadow-emeraldglow" : "border-gold/20 text-silver/65 hover:border-gold/40")}>{item}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <GlassButton size="sm" variant="ghost" onClick={closeOverlay}>Cancel</GlassButton>
        <GlassButton size="sm" variant="primary" onClick={() => void confirmRent()}>
          {pending ? "Renting..." : "Confirm Rent"}
        </GlassButton>
      </div>
    </OverlayShell>
  );
}
