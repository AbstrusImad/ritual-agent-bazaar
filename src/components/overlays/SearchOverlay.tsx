import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useApp } from "../../store/AppContext";
import { cn } from "../../lib/cn";

const categories = ["DeFi", "Security", "Research"];

export function SearchOverlay() {
  const { closeOverlay, openOverlay, pushToast, listings, setCategoryFilter, setActiveView } = useApp();
  const [query, setQuery] = useState("");
  const agents = listings;
  const suggested = listings.slice(0, 3).map((l) => l.name);
  const recent = listings.slice(3, 5).map((l) => l.name);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeOverlay();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeOverlay]);

  const results = useMemo(() => {
    if (!query.trim()) return null;
    return agents.filter((agent) => agent.name.toLowerCase().includes(query.toLowerCase()) || agent.category.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  function openAgent(name: string) {
    const agent = agents.find((item) => item.name === name);
    if (agent) openOverlay("inspect", agent);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[68] flex justify-center bg-black/60 px-4 pt-24 backdrop-blur-md"
      onClick={closeOverlay}
    >
      <motion.div
        initial={{ opacity: 0, y: -16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12 }}
        onClick={(event) => event.stopPropagation()}
        className="glass h-fit w-[560px] max-w-[94vw] rounded-2xl border border-gold/45 p-4 shadow-goldglow"
      >
        <div className="flex items-center gap-3 rounded-xl border border-gold/25 bg-graphite/50 px-3 py-2.5">
          <Search className="h-4 w-4 text-champagne/70" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search agents, creators, or missions..."
            className="w-full bg-transparent text-sm text-ivory placeholder:text-silver/45 focus:outline-none"
          />
          <span className="rounded-md border border-gold/20 px-1.5 py-0.5 text-[10px] text-silver/50">Esc</span>
        </div>

        <div className="mt-4 space-y-4">
          {results ? (
            results.length > 0 ? (
              <Group title="Results">
                {results.map((agent) => (
                  <ResultRow key={agent.name} label={agent.name} sub={agent.category} onClick={() => openAgent(agent.name)} />
                ))}
              </Group>
            ) : (
              <p className="px-1 py-3 text-sm text-silver/50">No agents match “{query}”.</p>
            )
          ) : (
            <>
              <Group title="Suggested Agents">
                {suggested.map((name) => (
                  <ResultRow key={name} label={name} onClick={() => openAgent(name)} />
                ))}
              </Group>
              <Group title="Categories">
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setCategoryFilter(category);
                        setActiveView("bazaar");
                        closeOverlay();
                        pushToast(`Filtering Bazaar by ${category}.`, "gold");
                      }}
                      className="rounded-full border border-gold/25 px-3 py-1 text-xs text-champagne/85 hover:border-gold/50"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </Group>
              <Group title="Recent">
                {recent.map((name) => (
                  <ResultRow key={name} label={name} onClick={() => openAgent(name)} />
                ))}
              </Group>
            </>
          )}
        </div>

        <p className="mt-4 text-center text-[11px] text-silver/45">Press Esc to close</p>
      </motion.div>
    </motion.div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 px-1 text-[10px] uppercase tracking-[0.18em] text-silver/50">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function ResultRow({ label, sub, onClick }: { label: string; sub?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn("flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-ivory transition hover:bg-gold/10")}>
      <span>{label}</span>
      {sub ? <span className="text-xs text-silver/50">{sub}</span> : null}
    </button>
  );
}
