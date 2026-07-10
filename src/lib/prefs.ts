import type { ViewId } from "../types";

// ---------- Settings ----------
export interface Settings {
  motion: boolean;
  glow: "Low" | "Medium" | "High";
  defaultView: ViewId;
}

export const DEFAULT_SETTINGS: Settings = {
  motion: true,
  glow: "Medium",
  defaultView: "bazaar",
};

const SETTINGS_KEY = "bazaar.settings";
const FAVORITES_KEY = "bazaar.favorites";
const DRAFT_KEY = "bazaar.publishDraft";

export const SETTINGS_CHANGED = "bazaar:settings-changed";

function safeStorage(): Storage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function loadSettings(): Settings {
  try {
    const raw = safeStorage()?.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(next: Settings): Settings {
  safeStorage()?.setItem(SETTINGS_KEY, JSON.stringify(next));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SETTINGS_CHANGED, { detail: next }));
  }
  return next;
}

/** Apply settings to the document root (glow intensity + motion). */
export function applySettings(settings: Settings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const glowMap = { Low: "0.4", Medium: "0.75", High: "1.1" };
  root.style.setProperty("--glow-scale", glowMap[settings.glow]);
  root.dataset.motion = settings.motion ? "on" : "off";
}

// ---------- Favorites ----------
export function loadFavorites(): string[] {
  try {
    const raw = safeStorage()?.getItem(FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(name: string): string[] {
  const current = loadFavorites();
  const next = current.includes(name) ? current.filter((n) => n !== name) : [...current, name];
  safeStorage()?.setItem(FAVORITES_KEY, JSON.stringify(next));
  return next;
}

// ---------- Publish draft ----------
export function loadDraft<T>(): T | null {
  try {
    const raw = safeStorage()?.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function saveDraft<T>(draft: T) {
  safeStorage()?.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function clearDraft() {
  safeStorage()?.removeItem(DRAFT_KEY);
}
