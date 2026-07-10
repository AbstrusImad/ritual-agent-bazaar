import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { injected } from "wagmi/connectors";
import { RITUAL_CHAIN } from "../lib/ritual";
import type { Agent, ViewId } from "../types";
import { useListings, type BazaarListing } from "../hooks/useListings";
import { applySettings, loadFavorites, loadSettings, saveSettings, toggleFavorite, type Settings } from "../lib/prefs";

export interface ToastItem {
  id: number;
  message: string;
  tone: "gold" | "emerald" | "ruby";
}

type OverlayKind = "inspect" | "clone" | "rent" | "deploy" | "search" | "settings" | "profile" | null;

interface AppState {
  activeView: ViewId;
  setActiveView: (view: ViewId) => void;

  listings: BazaarListing[];
  listingsLoading: boolean;
  listingsError: string | null;
  reloadListings: () => Promise<void>;

  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  selectedAgent: Agent | undefined;
  selectedListing: BazaarListing | undefined;
  requestSelectNewest: () => void;

  // paginated gallery window
  galleryAgents: BazaarListing[];
  galleryPage: number;
  galleryPageCount: number;
  galleryTotal: number;
  galleryFrom: number;
  galleryTo: number;
  galleryStreaming: boolean;
  nextGalleryPage: () => void;
  prevGalleryPage: () => void;

  overlay: OverlayKind;
  overlayAgent: Agent | null;
  openOverlay: (kind: Exclude<OverlayKind, null>, agent?: Agent | null) => void;
  closeOverlay: () => void;

  // wallet
  address?: `0x${string}`;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;

  // settings + favorites (client-side prefs)
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  favorites: string[];
  isFavorite: (name: string) => boolean;
  toggleFavorite: (name: string) => void;

  // category filter for the gallery/search
  categoryFilter: string | null;
  setCategoryFilter: (category: string | null) => void;

  toasts: ToastItem[];
  pushToast: (message: string, tone?: ToastItem["tone"]) => void;
  dismissToast: (id: number) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const initialSettings = loadSettings();
  const [activeView, setActiveView] = useState<ViewId>(initialSettings.defaultView);
  const [selectedIndex, setSelectedIndex] = useState(2);
  const [overlay, setOverlay] = useState<OverlayKind>(null);
  const [overlayAgent, setOverlayAgent] = useState<Agent | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [favorites, setFavorites] = useState<string[]>(() => loadFavorites());
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const toastId = useRef(0);

  // Apply glow/motion prefs to the document on mount and whenever they change.
  useEffect(() => {
    applySettings(settings);
  }, [settings]);

  const {
    listings,
    isLoading: listingsLoading,
    isComplete: listingsComplete,
    error: listingsError,
    reload: reloadListings,
  } = useListings();

  const { address, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();

  // The gallery shows one page (WINDOW capsules) at a time. Listings stream in
  // progressively (see useListings); a category filter narrows the set.
  const WINDOW = 5;
  const [galleryPage, setGalleryPageState] = useState(0);

  const galleryListings = useMemo(() => {
    if (!categoryFilter) return listings;
    const q = categoryFilter.toLowerCase();
    return listings.filter((l) => l.category.toLowerCase().includes(q));
  }, [listings, categoryFilter]);

  const galleryPageCount = Math.max(1, Math.ceil(galleryListings.length / WINDOW));
  const safePage = Math.min(galleryPage, galleryPageCount - 1);
  const galleryAgents = galleryListings.slice(safePage * WINDOW, safePage * WINDOW + WINDOW);
  const safeSelected = Math.min(selectedIndex, Math.max(0, galleryAgents.length - 1));
  const selectedListing = galleryAgents[safeSelected] ?? galleryAgents[0];
  const selectedAgent = selectedListing;
  const galleryFrom = galleryListings.length === 0 ? 0 : safePage * WINDOW + 1;
  const galleryTo = Math.min(safePage * WINDOW + WINDOW, galleryListings.length);

  // Keep the page index in range as the loaded/filtered set changes.
  useEffect(() => {
    if (galleryPage > galleryPageCount - 1) setGalleryPageState(galleryPageCount - 1);
  }, [galleryPage, galleryPageCount]);

  const nextGalleryPage = useCallback(() => {
    setGalleryPageState((p) => p + 1);
    setSelectedIndex(0);
  }, []);
  const prevGalleryPage = useCallback(() => {
    setGalleryPageState((p) => Math.max(0, p - 1));
    setSelectedIndex(0);
  }, []);

  // Changing the category resets to the first page and first capsule.
  const changeCategoryFilter = useCallback((category: string | null) => {
    setCategoryFilter(category);
    setGalleryPageState(0);
    setSelectedIndex(0);
  }, []);

  // After a publish, jump to the last page and select the newest listing so the
  // user immediately sees the agent they just listed.
  const selectNewestRef = useRef(false);
  const requestSelectNewest = useCallback(() => {
    selectNewestRef.current = true;
  }, []);
  useEffect(() => {
    if (selectNewestRef.current && listingsComplete && listings.length > 0) {
      setGalleryPageState(Math.max(0, Math.ceil(listings.length / WINDOW) - 1));
      setSelectedIndex((listings.length - 1) % WINDOW);
      selectNewestRef.current = false;
    }
  }, [listings, listingsComplete]);

  const pushToast = useCallback((message: string, tone: ToastItem["tone"] = "gold") => {
    const id = ++toastId.current;
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 2800);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const openOverlay = useCallback((kind: Exclude<OverlayKind, null>, agent: Agent | null = null) => {
    setOverlayAgent(agent);
    setOverlay(kind);
  }, []);

  const closeOverlay = useCallback(() => setOverlay(null), []);

  const connectWallet = useCallback(async () => {
    try {
      // Use the configured connector so the session persists across refreshes.
      await connectAsync({ connector: connectors[0] ?? injected() });
      // Suggest Ritual Chain: switches if present, offers to add it otherwise.
      try {
        await switchChainAsync({ chainId: RITUAL_CHAIN.id });
      } catch {
        pushToast("Tip: switch your wallet to Ritual Chain 1979.", "gold");
      }
    } catch {
      pushToast("Wallet connection was cancelled.", "ruby");
    }
  }, [connectAsync, connectors, switchChainAsync, pushToast]);

  const disconnectWallet = useCallback(() => disconnect(), [disconnect]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((name: string) => favorites.includes(name), [favorites]);
  const handleToggleFavorite = useCallback((name: string) => {
    setFavorites(toggleFavorite(name));
  }, []);

  const value = useMemo<AppState>(
    () => ({
      activeView,
      setActiveView,
      listings,
      listingsLoading,
      listingsError,
      reloadListings,
      selectedIndex: safeSelected,
      setSelectedIndex,
      selectedAgent,
      selectedListing,
      requestSelectNewest,
      galleryAgents,
      galleryPage: safePage,
      galleryPageCount,
      galleryTotal: galleryListings.length,
      galleryFrom,
      galleryTo,
      galleryStreaming: !listingsComplete,
      nextGalleryPage,
      prevGalleryPage,
      overlay,
      overlayAgent,
      openOverlay,
      closeOverlay,
      address,
      isConnected,
      connectWallet,
      disconnectWallet,
      settings,
      updateSettings,
      favorites,
      isFavorite,
      toggleFavorite: handleToggleFavorite,
      categoryFilter,
      setCategoryFilter: changeCategoryFilter,
      toasts,
      pushToast,
      dismissToast,
    }),
    [activeView, listings, listingsLoading, listingsError, reloadListings, safeSelected, selectedAgent, selectedListing, requestSelectNewest, galleryAgents, safePage, galleryPageCount, galleryListings.length, galleryFrom, galleryTo, listingsComplete, nextGalleryPage, prevGalleryPage, overlay, overlayAgent, openOverlay, closeOverlay, address, isConnected, connectWallet, disconnectWallet, settings, updateSettings, favorites, isFavorite, handleToggleFavorite, categoryFilter, changeCategoryFilter, pushToast, dismissToast],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
