import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "../store/AppContext";
import { useBazaarActions } from "../hooks/useBazaarActions";
import { publishDefaults } from "../data/mockData";
import { categoryToTheme, themeTokens } from "../lib/theme";
import { cn } from "../lib/cn";
import { clearDraft, loadDraft, saveDraft } from "../lib/prefs";
import { AgentForm } from "../components/AgentForm";
import { GlassButton } from "../components/GlassButton";
import { readError } from "../components/overlays/CloneAgentModal";

interface PublishDraft {
  name: string;
  category: string;
  agentType: string;
  creator: string;
  mission: string;
  pricingModel: string;
  monthlyPrice: string;
  cloneFee: string;
  capabilities: string;
}

const steps = ["Identity", "Mission", "Pricing", "Preview", "Publish"];
const categories = ["DeFi", "Security", "Research", "Community", "Automation"];
const pricingModels = ["Free", "Rent", "Subscription", "One-time Clone"];

export function PublishView() {
  const { pushToast, setActiveView, reloadListings, requestSelectNewest, setCategoryFilter } = useApp();
  const { publish } = useBazaarActions();
  const [step, setStep] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const draft = loadDraft<PublishDraft>();
  const [name, setName] = useState(draft?.name ?? publishDefaults.name);
  const [category, setCategory] = useState(draft?.category ?? publishDefaults.category);
  const [agentType, setAgentType] = useState(draft?.agentType ?? publishDefaults.agentType);
  const [creator, setCreator] = useState(draft?.creator ?? publishDefaults.creator);
  const [mission, setMission] = useState(draft?.mission ?? publishDefaults.mission);
  const [pricingModel, setPricingModel] = useState(draft?.pricingModel ?? publishDefaults.pricingModel);
  const [monthlyPrice, setMonthlyPrice] = useState(draft?.monthlyPrice ?? publishDefaults.monthlyPrice);
  const [cloneFee, setCloneFee] = useState(draft?.cloneFee ?? publishDefaults.cloneFee);
  const [capabilities, setCapabilities] = useState(draft?.capabilities ?? publishDefaults.capabilities);

  const theme = useMemo(() => categoryToTheme(category), [category]);
  const tokens = themeTokens[theme];

  const capabilityList = useMemo(
    () => capabilities.split(",").map((c) => c.trim()).filter(Boolean),
    [capabilities],
  );

  function currentDraft(): PublishDraft {
    return { name, category, agentType, creator, mission, pricingModel, monthlyPrice, cloneFee, capabilities };
  }

  async function confirmPublish() {
    setPending(true);
    try {
      pushToast("Confirm the listing in your wallet...", "gold");
      await publish({
        name,
        category,
        agentType,
        pricingModel,
        monthlyPrice,
        cloneFee,
        mission,
        theme,
        capabilities: capabilityList,
      });
      setConfirmOpen(false);
      clearDraft();
      pushToast("Agent published to Bazaar.", "emerald");
      // Clear any category filter and jump the gallery to the newest listing so
      // the freshly published agent is front and centre.
      setCategoryFilter(null);
      requestSelectNewest();
      await reloadListings();
      setActiveView("bazaar");
    } catch (error) {
      pushToast(readError(error), "ruby");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-6xl flex-col px-8 pt-2">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="font-display text-3xl font-semibold text-ivory">Publish an Agent</h1>
        <p className="mt-1 text-sm text-silver/70">Prepare an autonomous entity for the Bazaar.</p>
      </motion.div>

      {/* Rune step indicators */}
      <div className="mt-5 flex items-center justify-center gap-3">
        {steps.map((label, index) => (
          <button key={label} onClick={() => setStep(index)} className="flex items-center gap-3">
            <span className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-full border text-xs transition-all",
                  index === step
                    ? "border-gold bg-gold/20 text-champagne shadow-goldglow"
                    : index < step
                      ? "border-gold/50 text-gold/70"
                      : "border-silver/25 text-silver/40",
                )}
              >
                {index + 1}
              </span>
              <span className={cn("text-[10px] tracking-wide", index === step ? "text-ivory" : "text-silver/50")}>{label}</span>
            </span>
            {index < steps.length - 1 ? <span className="h-px w-6 bg-gold/25" /> : null}
          </button>
        ))}
      </div>

      <div className="mt-6 grid flex-1 grid-cols-1 items-center gap-8 lg:grid-cols-[360px_1fr]">
        {/* Presentation capsule */}
        <div className="flex justify-center">
          <div className="flex flex-col items-center">
            <div
              className="relative flex h-[300px] w-[150px] items-end justify-center overflow-hidden rounded-[999px_999px_24px_24px]"
              style={{
                background: "linear-gradient(180deg, rgba(243,237,225,0.06), rgba(6,5,5,0.5))",
                border: `1px solid ${tokens.rim}`,
                boxShadow: `0 0 50px -10px ${tokens.glow}, inset 0 18px 50px -18px ${tokens.glow}`,
              }}
            >
              <div className="absolute inset-x-0 top-6 bottom-10 flex items-center justify-center px-3">
                <AgentForm theme={theme} />
              </div>
              <div className="absolute bottom-3 h-4 w-3/4 rounded-full" style={{ background: `radial-gradient(closest-side, ${tokens.ring}, transparent)` }} />
            </div>
            <p className="mt-4 font-display text-lg text-ivory">{name}</p>
            <span className={cn("text-[11px] uppercase tracking-[0.16em]", tokens.categoryClass)}>{category}</span>
            <span className="text-xs text-silver/60">Presentation Capsule</span>
          </div>
        </div>

        {/* Floating form panels */}
        <div className="grid gap-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="glass rounded-2xl border border-gold/25 p-5"
            >
              {step === 0 ? (
                <Panel title="Identity">
                  <Field label="Agent Name" value={name} onChange={setName} />
                  <SelectField label="Category" value={category} options={categories} onChange={setCategory} />
                  <SelectField label="Agent Type" value={agentType} options={["Sovereign Agent", "Persistent Agent"]} onChange={setAgentType} />
                  <Field label="Creator Alias" value={creator} onChange={setCreator} />
                </Panel>
              ) : null}

              {step === 1 ? (
                <Panel title="Mission">
                  <label className="text-[11px] uppercase tracking-[0.16em] text-champagne/70">Describe what this agent does</label>
                  <textarea
                    value={mission}
                    onChange={(event) => setMission(event.target.value)}
                    rows={4}
                    placeholder="Describe what this agent does..."
                    className="mt-2 w-full resize-none rounded-xl border border-gold/20 bg-graphite/50 p-3 text-sm text-ivory placeholder:text-silver/40 focus:border-gold/60 focus:outline-none"
                  />
                  <label className="mt-3 block text-[11px] uppercase tracking-[0.16em] text-champagne/70">
                    Capabilities (comma-separated)
                  </label>
                  <input
                    value={capabilities}
                    onChange={(event) => setCapabilities(event.target.value)}
                    placeholder="Threat detection, Risk scoring, Live adaptation"
                    className="mt-2 w-full rounded-xl border border-gold/20 bg-graphite/50 p-3 text-sm text-ivory placeholder:text-silver/40 focus:border-gold/60 focus:outline-none"
                  />
                  {capabilityList.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {capabilityList.map((cap) => (
                        <span key={cap} className="rounded-full border border-gold/25 bg-graphite/50 px-2.5 py-0.5 text-xs text-champagne/85">
                          {cap}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </Panel>
              ) : null}

              {step === 2 ? (
                <Panel title="Pricing">
                  <div className="grid grid-cols-2 gap-2">
                    {pricingModels.map((model) => (
                      <button
                        key={model}
                        onClick={() => setPricingModel(model)}
                        className={cn(
                          "rounded-xl border px-3 py-2 text-sm transition-all",
                          pricingModel === model ? "border-gold bg-gold/15 text-champagne shadow-goldglow" : "border-gold/20 text-silver/70 hover:border-gold/40",
                        )}
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <Field label="Monthly Price" value={monthlyPrice} onChange={setMonthlyPrice} />
                    <Field label="Clone Fee" value={cloneFee} onChange={setCloneFee} />
                  </div>
                </Panel>
              ) : null}

              {step === 3 ? (
                <Panel title="Preview">
                  <Row label="Agent" value={name} />
                  <Row label="Category" value={category} />
                  <Row label="Type" value={agentType} />
                  <Row label="Creator" value={creator} />
                  <Row label="Pricing" value={`${pricingModel} · ${monthlyPrice}`} />
                  <Row label="Capabilities" value={capabilityList.length > 0 ? `${capabilityList.length} listed` : "—"} />
                  <p className="mt-2 text-sm text-silver/70">{mission}</p>
                </Panel>
              ) : null}

              {step === 4 ? (
                <Panel title="Publish">
                  <p className="text-sm text-silver/75">
                    Everything is ready. Publishing lists this presentation capsule in the Bazaar for discovery.
                  </p>
                </Panel>
              ) : null}
            </motion.div>
          </AnimatePresence>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-end gap-2">
            {step > 0 ? (
              <GlassButton size="sm" variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))}>
                Back
              </GlassButton>
            ) : null}
            <GlassButton size="sm" variant="ghost" onClick={() => { saveDraft(currentDraft()); pushToast("Draft saved in this browser.", "gold"); }}>
              Save Draft
            </GlassButton>
            <GlassButton size="sm" variant="gold" onClick={() => { setStep(3); pushToast("Preview ready.", "gold"); }}>
              Preview Listing
            </GlassButton>
            {step < steps.length - 1 ? (
              <GlassButton size="sm" variant="emerald" onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}>
                Next
              </GlassButton>
            ) : (
              <GlassButton size="sm" variant="primary" onClick={() => setConfirmOpen(true)}>
                Publish to Bazaar
              </GlassButton>
            )}
          </div>
        </div>
      </div>

      {/* Confirm modal — mounts with an enter animation, unmounts instantly on
          close (no AnimatePresence: a stuck exit would block all clicks). */}
      {confirmOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4 backdrop-blur-md"
          onClick={() => setConfirmOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            onClick={(event) => event.stopPropagation()}
            className="glass w-[380px] max-w-[90vw] rounded-3xl border border-gold/40 p-6 shadow-goldglow"
          >
            <h3 className="font-display text-xl text-ivory">Publish Agent to Bazaar</h3>
            <div className="mt-4 space-y-2 border-t border-gold/15 pt-4 text-sm">
              <Row label="Agent" value={name} />
              <Row label="Category" value={category} />
              <Row label="Pricing" value={monthlyPrice} />
              <Row label="Visibility" value="Public" />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <GlassButton size="sm" variant="ghost" onClick={() => setConfirmOpen(false)}>
                Cancel
              </GlassButton>
              <GlassButton size="sm" variant="primary" onClick={() => void confirmPublish()}>
                {pending ? "Publishing..." : "Confirm Publish"}
              </GlassButton>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-display text-lg text-champagne">{title}</h3>
      <div className="mt-3 grid gap-3">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[11px] uppercase tracking-[0.16em] text-champagne/70">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-gold/20 bg-graphite/50 px-3 py-2 text-sm text-ivory focus:border-gold/60 focus:outline-none"
      />
    </label>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[11px] uppercase tracking-[0.16em] text-champagne/70">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-gold/20 bg-graphite/70 px-3 py-2 text-sm text-ivory focus:border-gold/60 focus:outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-graphite">
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-silver/55">{label}</span>
      <span className="text-ivory">{value}</span>
    </div>
  );
}
