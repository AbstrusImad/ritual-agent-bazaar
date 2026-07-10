import { AnimatePresence } from "framer-motion";
import { useApp } from "../../store/AppContext";
import { AgentInspectOverlay } from "./AgentInspectOverlay";
import { CloneAgentModal } from "./CloneAgentModal";
import { RentAgentModal } from "./RentAgentModal";
import { DeployAgentModal } from "./DeployAgentModal";
import { SearchOverlay } from "./SearchOverlay";
import { SettingsModal } from "./SettingsModal";
import { ProfileModal } from "./ProfileModal";

export function OverlayManager() {
  const { overlay, overlayAgent, selectedAgent } = useApp();
  const agent = overlayAgent ?? selectedAgent;

  const agentOverlayOpen = overlay === "inspect" || overlay === "clone" || overlay === "rent" || overlay === "deploy";

  return (
    <AnimatePresence>
      {agentOverlayOpen && agent ? (
        <>
          {overlay === "inspect" ? <AgentInspectOverlay key="inspect" agent={agent} /> : null}
          {overlay === "clone" ? <CloneAgentModal key="clone" agent={agent} /> : null}
          {overlay === "rent" ? <RentAgentModal key="rent" agent={agent} /> : null}
          {overlay === "deploy" ? <DeployAgentModal key="deploy" agent={agent} /> : null}
        </>
      ) : null}
      {overlay === "search" ? <SearchOverlay key="search" /> : null}
      {overlay === "settings" ? <SettingsModal key="settings" /> : null}
      {overlay === "profile" ? <ProfileModal key="profile" /> : null}
    </AnimatePresence>
  );
}
