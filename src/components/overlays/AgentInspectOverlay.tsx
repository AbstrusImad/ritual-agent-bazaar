import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, KeyRound, Rocket, Save, Star } from "lucide-react";
import type { Agent } from "../../types";
import type { BazaarListing } from "../../hooks/useListings";
import { themeTokens } from "../../lib/theme";
import { cn } from "../../lib/cn";
import { useApp } from "../../store/AppContext";
import { useBazaarActions } from "../../hooks/useBazaarActions";
import { OverlayShell } from "./OverlayShell";
import { CapsulePreview } from "../CapsulePreview";
import { GlassButton } from "../GlassButton";
import { readError } from "./CloneAgentModal";

type Tab = "Overview" | "Capabilities" | "Usage" | "Reviews";
const tabs: Tab[] = ["Overview", "Capabilities", "Usage", "Reviews"];

export function AgentInspectOverlay({ agent }: { agent: Agent }) {
  const { closeOverlay, openOverlay, pushToast, isFavorite, toggleFavorite, reloadListings } = useApp();
  const { rate } = useBazaarActions();
  const listing = agent as BazaarListing;
  const [tab, setTab] = useState<Tab>("Overview");
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(false);
  const tokens = themeTokens[agent.theme];
  const saved = isFavorite(agent.name);

  useEffect(() => setTab("Overview"), [agent.name]);

  async function submitReview() {
    if (!listing.listingId) {
      pushToast("This agent is not an on-chain listing.", "ruby");
      return;
    }
    if (comment.trim().length === 0) {
      pushToast("Add a short comment for your review.", "gold");
      return;
    }
    setRating(true);
    try {
      pushToast("Confirm your review in your wallet...", "gold");
      await rate(listing.listingId, stars, comment.trim());
      setComment("");
      pushToast("Review recorded on-chain.", "emerald");
      await reloadListings();
    } catch (error) {
      pushToast(readError(error), "ruby");
    } finally {
      setRating(false);
    }
  }

  const [priceValue, priceUnit] = agent.price.split(" ");

  return (
    <OverlayShell onClose={closeOverlay} className="w-[720px] max-w-[94vw] p-0" labelledBy="inspect-title">
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
        {/* Capsule side */}
        <div
          className="relative flex flex-col items-center justify-center gap-4 p-8"
          style={{ background: `radial-gradient(80% 60% at 50% 30%, ${tokens.glow}, transparent 75%)` }}
        >
          <CapsulePreview theme={agent.theme} size="lg" />
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.16em] text-champagne/70">{agent.creator}</p>
          </div>
        </div>

        {/* Details */}
        <div className="p-7">
          <p className={cn("text-[11px] uppercase tracking-[0.18em]", tokens.categoryClass)}>{agent.category}</p>
          <h2 id="inspect-title" className="mt-1 font-display text-3xl font-semibold text-ivory">{agent.name}</h2>
          <p className="mt-1 text-sm text-silver/70">{agent.subtitle}</p>

          <div className="mt-4 flex items-end justify-between border-y border-gold/15 py-4">
            <div className="space-y-1 text-sm">
              <p className="text-silver/60">Type · <span className="text-ivory">{agent.type}</span></p>
              <p className="flex items-center gap-1 text-gold">
                <Star className="h-3.5 w-3.5 fill-gold text-gold" /> {agent.rating}
              </p>
            </div>
            <div className="text-right">
              <span className="font-display text-3xl text-champagne text-glow-gold">{priceValue}</span>
              <span className="ml-1 text-xs text-silver/70">{priceUnit}</span>
            </div>
          </div>

          <p className="mt-3 text-sm text-silver/75">{agent.mission}</p>

          {/* Tabs */}
          <div className="mt-5 flex gap-5 border-b border-gold/15">
            {tabs.map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={cn("relative pb-2 text-sm transition-colors", tab === item ? "text-gold" : "text-silver/55 hover:text-ivory")}
              >
                {item}
                {tab === item ? <motion.span layoutId="inspect-tab" className="absolute -bottom-px left-0 h-0.5 w-full rounded-full bg-gold" /> : null}
              </button>
            ))}
          </div>

          <div className="mt-4 min-h-[96px]">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
                {tab === "Overview" ? (
                  <ul className="space-y-2">
                    {agent.overview.map((line) => (
                      <li key={line} className="flex items-start gap-2 text-sm text-silver">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                        {line}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {tab === "Capabilities" ? (
                  <div className="flex flex-wrap gap-2">
                    {agent.capabilities.map((cap) => (
                      <span key={cap} className="rounded-full border border-gold/25 bg-graphite/50 px-3 py-1 text-xs text-champagne/85">{cap}</span>
                    ))}
                  </div>
                ) : null}
                {tab === "Usage" ? (
                  <ul className="space-y-2">
                    {(agent.usage ?? ["No usage data yet."]).map((line) => (
                      <li key={line} className="flex items-start gap-2 text-sm text-silver">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald" />
                        {line}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {tab === "Reviews" ? (
                  <div className="space-y-3">
                    {agent.reviews.length === 0 ? (
                      <p className="text-sm text-silver/50">No on-chain reviews yet. Be the first to leave one.</p>
                    ) : (
                      <div className="max-h-[150px] space-y-2.5 overflow-y-auto pr-1">
                        {agent.reviews.map((review, i) => (
                          <div key={`${review.author}-${i}`} className="text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-ivory/90">{review.author}</span>
                              <span className="flex items-center gap-1 text-gold">
                                <Star className="h-3 w-3 fill-gold text-gold" />
                                {review.stars}
                                {review.time ? <span className="ml-2 text-[10px] text-silver/45">{review.time}</span> : null}
                              </span>
                            </div>
                            <p className="text-silver/70">{review.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Leave an on-chain review */}
                    <div className="rounded-xl border border-gold/20 bg-graphite/40 p-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-champagne/70">Leave an on-chain review</p>
                      <div className="mt-2 flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} onClick={() => setStars(s)} aria-label={`${s} stars`}>
                            <Star className={cn("h-5 w-5 transition-colors", s <= stars ? "fill-gold text-gold" : "text-silver/40")} />
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={2}
                        placeholder="Share your experience with this agent..."
                        className="mt-2 w-full resize-none rounded-lg border border-gold/20 bg-graphite/60 p-2 text-sm text-ivory placeholder:text-silver/40 focus:border-gold/60 focus:outline-none"
                      />
                      <GlassButton size="sm" variant="gold" className="mt-2 w-full" onClick={() => void submitReview()}>
                        {rating ? "Submitting..." : "Submit Review"}
                      </GlassButton>
                    </div>
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="mt-5 grid grid-cols-4 gap-2">
            <GlassButton size="sm" variant="gold" icon={<Copy className="h-3.5 w-3.5" />} onClick={() => openOverlay("clone", agent)}>Clone</GlassButton>
            <GlassButton size="sm" variant="emerald" icon={<KeyRound className="h-3.5 w-3.5" />} onClick={() => openOverlay("rent", agent)}>Rent</GlassButton>
            <GlassButton size="sm" variant="primary" icon={<Rocket className="h-3.5 w-3.5" />} onClick={() => openOverlay("deploy", agent)}>Deploy</GlassButton>
            <GlassButton
              size="sm"
              variant={saved ? "gold" : "ghost"}
              icon={<Save className="h-3.5 w-3.5" />}
              onClick={() => {
                toggleFavorite(agent.name);
                pushToast(saved ? "Removed from saved." : "Agent saved to profile.", saved ? "ruby" : "emerald");
              }}
            >
              {saved ? "Saved" : "Save"}
            </GlassButton>
          </div>
        </div>
      </div>
    </OverlayShell>
  );
}
