import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, ShieldCheck } from "lucide-react";
import type { Agent } from "../../types";
import type { BazaarListing } from "../../hooks/useListings";
import { useApp } from "../../store/AppContext";
import { useBazaarActions } from "../../hooks/useBazaarActions";
import { OverlayShell } from "./OverlayShell";
import { GlassButton } from "../GlassButton";
import { readError } from "./CloneAgentModal";

const progressSteps = [
  "Preparing capsule",
  "Validating mission",
  "Recording deployment on-chain",
  "Confirming transaction",
];

export function DeployAgentModal({ agent }: { agent: Agent }) {
  const listing = agent as BazaarListing;
  const { closeOverlay, pushToast, address, isConnected, connectWallet } = useApp();
  const { deploy } = useBazaarActions();
  const [phase, setPhase] = useState<"review" | "progress">("review");
  const [stepIndex, setStepIndex] = useState(0);
  const walletLabel = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "not connected";

  async function runDeploy() {
    if (!listing.listingId) {
      pushToast("This agent is not an on-chain listing.", "ruby");
      return;
    }
    setPhase("progress");
    setStepIndex(0);
    try {
      // Advance the first two visual steps, then send the real tx.
      setStepIndex(1);
      await sleep(500);
      setStepIndex(2);
      pushToast("Confirm the deployment in your wallet...", "gold");
      await deploy(listing.listingId);
      setStepIndex(3);
      await sleep(400);
      pushToast("Agent deployment recorded on-chain.", "emerald");
      closeOverlay();
    } catch (error) {
      pushToast(readError(error), "ruby");
      setPhase("review");
    }
  }

  return (
    <OverlayShell onClose={closeOverlay} className="w-[440px] max-w-[92vw] p-7" labelledBy="deploy-title">
      <h2 id="deploy-title" className="font-display text-2xl text-ivory">Deploy {agent.name}</h2>
      <p className="mt-1 text-sm text-silver/70">Record this deployment on Ritual Chain.</p>

      <AnimatePresence mode="wait">
        {phase === "review" ? (
          <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mt-5 space-y-2 border-y border-gold/15 py-4 text-sm">
              <Row label="Agent" value={agent.name} />
              <Row label="Type" value={agent.type} />
              <Row label="Network" value="Ritual Chain 1979" />
              <Row label="Monthly Cost" value={agent.price} />
              <Row label="Wallet" value={walletLabel} />
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald/30 bg-emerald/5 p-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald" />
              <p className="text-xs text-silver/80">
                This records the deployment on-chain (a real transaction, minimal gas). Live TEE agent
                execution is launched separately via Ritual's agent factories.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <GlassButton size="sm" variant="ghost" onClick={closeOverlay}>Cancel</GlassButton>
              {isConnected ? (
                <GlassButton size="sm" variant="primary" onClick={() => void runDeploy()}>Deploy On-Chain</GlassButton>
              ) : (
                <GlassButton size="sm" variant="primary" onClick={() => void connectWallet()}>Connect Wallet</GlassButton>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6 space-y-3">
            {progressSteps.map((step, index) => {
              const complete = index < stepIndex;
              const current = index === stepIndex;
              return (
                <div key={step} className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full border border-gold/30">
                    {complete ? (
                      <Check className="h-4 w-4 text-emerald" />
                    ) : current ? (
                      <Loader2 className="h-4 w-4 animate-spin text-gold" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-silver/30" />
                    )}
                  </span>
                  <span className={complete ? "text-sm text-ivory" : current ? "text-sm text-champagne" : "text-sm text-silver/50"}>{step}</span>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </OverlayShell>
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-silver/55">{label}</span>
      <span className="text-ivory">{value}</span>
    </div>
  );
}
