import { useApp } from "../../store/AppContext";
import { AgentInspectOverlay } from "./AgentInspectOverlay";
import { CloneAgentModal } from "./CloneAgentModal";
import { RentAgentModal } from "./RentAgentModal";
import { DeployAgentModal } from "./DeployAgentModal";
import { SearchOverlay } from "./SearchOverlay";
import { SettingsModal } from "./SettingsModal";
import { ProfileModal } from "./ProfileModal";

/**
 * Overlays mount with an enter animation and unmount instantly on close.
 * No AnimatePresence here on purpose: a stuck exit animation leaves the
 * invisible fixed backdrop in the DOM swallowing every click (the "app is
 * frozen until refresh" bug). Instant unmount cannot get stuck.
 */
export function OverlayManager() {
  const { overlay, overlayAgent, selectedAgent } = useApp();
  const agent = overlayAgent ?? selectedAgent;

  if (!overlay) return null;

  if (agent) {
    if (overlay === "inspect") return <AgentInspectOverlay agent={agent} />;
    if (overlay === "clone") return <CloneAgentModal agent={agent} />;
    if (overlay === "rent") return <RentAgentModal agent={agent} />;
    if (overlay === "deploy") return <DeployAgentModal agent={agent} />;
  }

  if (overlay === "search") return <SearchOverlay />;
  if (overlay === "settings") return <SettingsModal />;
  if (overlay === "profile") return <ProfileModal />;

  return null;
}
