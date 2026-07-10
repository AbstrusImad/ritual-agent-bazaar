import { useState } from "react";
import type { Agent } from "../../types";
import type { BazaarListing } from "../../hooks/useListings";
import { useApp } from "../../store/AppContext";
import { useBazaarActions } from "../../hooks/useBazaarActions";
import { cn } from "../../lib/cn";
import { OverlayShell } from "./OverlayShell";
import { CapsulePreview } from "../CapsulePreview";
import { GlassButton } from "../GlassButton";

const riskLevels = ["Conservative", "Balanced", "Aggressive"];

export function CloneAgentModal({ agent }: { agent: Agent }) {
  const listing = agent as BazaarListing;
  const { closeOverlay, pushToast, setActiveView } = useApp();
  const { clone } = useBazaarActions();
  const [name, setName] = useState(`${agent.name} Clone`);
  const [mission, setMission] = useState("Protect my selected wallets from abnormal market movements.");
  const [risk, setRisk] = useState("Balanced");
  const [budget, setBudget] = useState(agent.price);
  const [pending, setPending] = useState(false);

  async function createClone() {
    if (!listing.listingId) {
      pushToast("This agent is not an on-chain listing.", "ruby");
      return;
    }
    setPending(true);
    try {
      pushToast("Confirm the clone in your wallet...", "gold");
      await clone({
        listingId: listing.listingId,
        name,
        mission,
        riskLevel: risk,
        monthlyBudget: budget,
        cloneFeeWei: listing.cloneFeeWei ?? 0n,
      });
      closeOverlay();
      pushToast("Agent cloned into your Vault.", "emerald");
      setActiveView("vault");
    } catch (error) {
      pushToast(readError(error), "ruby");
    } finally {
      setPending(false);
    }
  }

  const feeLabel = listing.cloneFeeWei && listing.cloneFeeWei > 0n ? ` (fee ${agent.price.split(" ")[0]} → creator)` : "";

  return (
    <OverlayShell onClose={closeOverlay} className="w-[640px] max-w-[94vw] p-7" labelledBy="clone-title">
      <h2 id="clone-title" className="font-display text-2xl text-ivory">Clone {agent.name}</h2>
      <p className="mt-1 text-sm text-silver/70">Create your own on-chain copy of this autonomous agent{feeLabel}.</p>

      <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-[160px_1fr]">
        <div className="flex justify-center">
          <CapsulePreview theme={agent.theme} />
        </div>

        <div className="grid gap-3">
          <Field label="New Agent Name" value={name} onChange={setName} />
          <label className="grid gap-1.5">
            <span className="text-[11px] uppercase tracking-[0.16em] text-champagne/70">Mission Adjustment</span>
            <textarea
              value={mission}
              onChange={(event) => setMission(event.target.value)}
              rows={3}
              className="resize-none rounded-lg border border-gold/20 bg-graphite/50 p-3 text-sm text-ivory focus:border-gold/60 focus:outline-none"
            />
          </label>
          <div>
            <span className="text-[11px] uppercase tracking-[0.16em] text-champagne/70">Risk Level</span>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {riskLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => setRisk(level)}
                  className={cn("rounded-lg border px-2 py-1.5 text-xs transition-all", risk === level ? "border-gold bg-gold/15 text-champagne shadow-goldglow" : "border-gold/20 text-silver/65 hover:border-gold/40")}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          <Field label="Monthly Budget" value={budget} onChange={setBudget} />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <GlassButton size="sm" variant="ghost" onClick={closeOverlay}>Cancel</GlassButton>
        <GlassButton size="sm" variant="primary" onClick={() => void createClone()}>
          {pending ? "Cloning..." : "Create Clone"}
        </GlassButton>
      </div>
    </OverlayShell>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[11px] uppercase tracking-[0.16em] text-champagne/70">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="rounded-lg border border-gold/20 bg-graphite/50 px-3 py-2 text-sm text-ivory focus:border-gold/60 focus:outline-none" />
    </label>
  );
}

export function readError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("User rejected") || error.message.includes("denied")) return "Transaction rejected.";
    if (error.message.includes("insufficient")) return "Insufficient balance for this action.";
    return error.message.split("\n")[0].slice(0, 90);
  }
  return "Transaction failed.";
}
