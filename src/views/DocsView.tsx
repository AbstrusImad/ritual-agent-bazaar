import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Check, Copy, Lightbulb, ShieldAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { docsCodeSample, docsSections } from "../data/mockData";
import { useApp } from "../store/AppContext";
import type { DocCallout } from "../types";
import { cn } from "../lib/cn";

const calloutMeta: Record<DocCallout["kind"], { icon: LucideIcon; color: string }> = {
  "Best Practice": { icon: Check, color: "#4fd8a0" },
  "Safety Note": { icon: ShieldAlert, color: "#d14e56" },
  "Builder Tip": { icon: Lightbulb, color: "#d9a441" },
};

export function DocsView() {
  const { pushToast } = useApp();
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(docsSections[0].id);
  const [copied, setCopied] = useState(false);

  const visibleSections = useMemo(
    () => docsSections.filter((section) => section.title.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  const active = docsSections.find((section) => section.id === activeId) ?? docsSections[0];

  function copyCode() {
    void navigator.clipboard?.writeText(docsCodeSample).catch(() => undefined);
    setCopied(true);
    pushToast("Copied to clipboard.", "gold");
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col px-8 pt-2">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="font-display text-3xl font-semibold text-ivory">Ritual Agent Codex</h1>
        <p className="mt-1 text-sm text-silver/70">Understand how autonomous agents are listed, cloned, rented, and deployed.</p>
      </motion.div>

      {/* Codex book */}
      <div className="glass mt-6 grid flex-1 grid-cols-1 overflow-hidden rounded-3xl border border-gold/30 shadow-goldglow lg:grid-cols-[240px_1fr]">
        {/* Section list (inside codex) */}
        <div className="border-b border-gold/15 p-4 lg:border-b-0 lg:border-r">
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-gold/20 bg-graphite/50 px-3 py-1.5">
            <BookOpen className="h-3.5 w-3.5 text-champagne/70" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search codex..."
              className="w-full bg-transparent text-xs text-ivory placeholder:text-silver/40 focus:outline-none"
            />
          </div>
          {visibleSections.length === 0 ? (
            <p className="px-2 py-4 text-xs text-silver/50">No codex entry found.</p>
          ) : (
            <nav className="hall-scroll max-h-[42vh] space-y-1 overflow-y-auto lg:max-h-none">
              {visibleSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveId(section.id)}
                  className={cn(
                    "block w-full rounded-lg px-3 py-2 text-left text-sm transition-all",
                    section.id === activeId ? "bg-gold/12 text-gold shadow-goldglow" : "text-silver/60 hover:text-ivory",
                  )}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          )}
        </div>

        {/* Content */}
        <div className="hall-scroll overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="font-display text-2xl text-champagne">{active.title}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-silver/80">{active.body}</p>

              {active.callout ? (
                <div
                  className="mt-5 flex items-start gap-3 rounded-xl border p-4"
                  style={{ borderColor: `${calloutMeta[active.callout.kind].color}44` }}
                >
                  {(() => {
                    const Icon = calloutMeta[active.callout.kind].icon;
                    return <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: calloutMeta[active.callout.kind].color }} />;
                  })()}
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em]" style={{ color: calloutMeta[active.callout.kind].color }}>
                      {active.callout.kind}
                    </p>
                    <p className="mt-1 text-sm text-silver/80">{active.callout.text}</p>
                  </div>
                </div>
              ) : null}

              {active.id === "deployment" ? (
                <div className="mt-6 overflow-hidden rounded-xl border border-gold/20 bg-black/50">
                  <div className="flex items-center justify-between border-b border-gold/15 px-4 py-2">
                    <span className="text-xs text-silver/60">deployment.config.sol</span>
                    <button onClick={copyCode} className="flex items-center gap-1.5 text-xs text-champagne/80 hover:text-gold">
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <pre className="hall-scroll overflow-x-auto p-4 text-xs leading-relaxed text-emerald/90">
                    <code>{docsCodeSample}</code>
                  </pre>
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
