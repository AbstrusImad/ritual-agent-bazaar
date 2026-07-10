import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { GalleryScene } from "../components/GalleryScene";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingShimmer } from "../components/ui/LoadingShimmer";
import { useApp } from "../store/AppContext";

export function BazaarView() {
  const {
    galleryAgents,
    selectedIndex,
    setSelectedIndex,
    openOverlay,
    setActiveView,
    categoryFilter,
    setCategoryFilter,
    listingsLoading,
    galleryPage,
    galleryPageCount,
    galleryTotal,
    galleryFrom,
    galleryTo,
    galleryStreaming,
    nextGalleryPage,
    prevGalleryPage,
  } = useApp();

  // Only the very first page blocks with a loader; further pages stream in.
  if (listingsLoading && galleryTotal === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <LoadingShimmer text="Loading the bazaar..." />
      </div>
    );
  }

  if (galleryTotal === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4">
        <EmptyState
          title={categoryFilter ? `No agents in “${categoryFilter}”.` : "The bazaar is quiet."}
          subtitle={categoryFilter ? "Try a different category or clear the filter." : "No agents are listed yet. Publish the first autonomous entity."}
          actionLabel={categoryFilter ? "Clear filter" : "Publish an Agent"}
          onAction={() => (categoryFilter ? setCategoryFilter(null) : setActiveView("publish"))}
        />
      </div>
    );
  }

  const canPrev = galleryPage > 0;
  const canNext = galleryPage < galleryPageCount - 1;

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {/* Top: category chip + subtle page counter */}
      <div className="absolute left-1/2 top-2 z-20 flex -translate-x-1/2 items-center gap-2">
        {categoryFilter ? (
          <button
            onClick={() => setCategoryFilter(null)}
            className="rounded-full border border-gold/40 bg-graphite/70 px-3 py-1 text-xs text-champagne backdrop-blur hover:border-gold/70"
          >
            Category: {categoryFilter} · clear ✕
          </button>
        ) : null}
        {galleryPageCount > 1 || galleryStreaming ? (
          <span className="rounded-full border border-gold/15 bg-black/40 px-3 py-1 text-[11px] tracking-wide text-silver/60 backdrop-blur">
            {galleryFrom}–{galleryTo} of {galleryTotal}
            {galleryStreaming ? <Loader2 className="ml-1.5 inline h-3 w-3 animate-spin text-gold/70" /> : null}
          </span>
        ) : null}
      </div>

      {/* Side navigation: previous / next exhibition wing */}
      {canPrev ? (
        <button
          onClick={prevGalleryPage}
          aria-label="Previous agents"
          className="group absolute left-5 top-1/2 z-30 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-gold/30 bg-black/45 text-champagne/80 backdrop-blur transition-all hover:border-gold/70 hover:bg-gold/10 hover:text-champagne hover:shadow-goldglow focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 xl:left-10"
        >
          <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
        </button>
      ) : null}
      {canNext ? (
        <button
          onClick={nextGalleryPage}
          aria-label="Next agents"
          className="group absolute right-5 top-1/2 z-30 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-gold/30 bg-black/45 text-champagne/80 backdrop-blur transition-all hover:border-gold/70 hover:bg-gold/10 hover:text-champagne hover:shadow-goldglow focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 xl:right-10"
        >
          <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
        </button>
      ) : null}

      <GalleryScene
        agents={galleryAgents}
        selectedIndex={selectedIndex}
        onInspect={(index) => {
          setSelectedIndex(index);
          openOverlay("inspect", galleryAgents[index]);
        }}
      />
    </div>
  );
}
