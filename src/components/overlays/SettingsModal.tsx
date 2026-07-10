import { useApp } from "../../store/AppContext";
import type { Settings } from "../../lib/prefs";
import { cn } from "../../lib/cn";
import { OverlayShell } from "./OverlayShell";
import { GlassButton } from "../GlassButton";

const views: { id: Settings["defaultView"]; label: string }[] = [
  { id: "bazaar", label: "Bazaar" },
  { id: "vault", label: "Vault" },
  { id: "publish", label: "Publish" },
  { id: "activity", label: "Activity" },
  { id: "docs", label: "Docs" },
];

export function SettingsModal() {
  const { closeOverlay, pushToast, settings, updateSettings } = useApp();

  return (
    <OverlayShell onClose={closeOverlay} className="w-[400px] max-w-[92vw] p-7" labelledBy="settings-title">
      <h2 id="settings-title" className="font-display text-2xl text-ivory">Settings</h2>
      <p className="mt-1 text-sm text-silver/70">Preferences are saved in this browser and applied instantly.</p>

      <div className="mt-5 space-y-4">
        <RowStatic label="Theme" value="Obsidian Gold" />

        <ToggleRow
          label="Motion"
          detail="Enable ambient animations and glows."
          checked={settings.motion}
          onChange={(v) => updateSettings({ motion: v })}
        />

        <SelectRow
          label="Glow Intensity"
          value={settings.glow}
          options={["Low", "Medium", "High"]}
          onChange={(v) => updateSettings({ glow: v as Settings["glow"] })}
        />

        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-champagne/70">Default View</p>
          <div className="grid grid-cols-3 gap-2">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => updateSettings({ defaultView: view.id })}
                className={cn(
                  "rounded-lg border px-2 py-1.5 text-xs transition-all",
                  settings.defaultView === view.id ? "border-gold bg-gold/15 text-champagne shadow-goldglow" : "border-gold/20 text-silver/65 hover:border-gold/40",
                )}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <GlassButton size="sm" variant="primary" onClick={() => { pushToast("Settings saved.", "gold"); closeOverlay(); }}>Done</GlassButton>
      </div>
    </OverlayShell>
  );
}

function RowStatic({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gold/15 bg-graphite/40 px-3 py-2.5 text-sm">
      <span className="text-silver/60">{label}</span>
      <span className="text-champagne">{value}</span>
    </div>
  );
}

function ToggleRow({ label, detail, checked, onChange }: { label: string; detail: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gold/15 bg-graphite/40 px-3 py-2.5 text-sm">
      <div>
        <p className="text-silver/80">{label}</p>
        <p className="text-[11px] text-silver/50">{detail}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative h-5 w-9 shrink-0 rounded-full border transition", checked ? "border-emerald/50 bg-emerald/30" : "border-silver/25 bg-graphite")}
      >
        <span className={cn("absolute top-0.5 h-3.5 w-3.5 rounded-full bg-ivory transition-all", checked ? "left-4" : "left-0.5")} />
      </button>
    </div>
  );
}

function SelectRow({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-gold/15 bg-graphite/40 px-3 py-2 text-sm">
      <span className="text-silver/70">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-md border border-gold/20 bg-graphite/70 px-2 py-1 text-sm text-ivory focus:border-gold/50 focus:outline-none">
        {options.map((option) => (
          <option key={option} value={option} className="bg-graphite">{option}</option>
        ))}
      </select>
    </label>
  );
}
