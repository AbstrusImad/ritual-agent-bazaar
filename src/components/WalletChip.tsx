import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, Settings, User, Vault, Wallet } from "lucide-react";
import { useApp } from "../store/AppContext";

function shortAddr(addr?: string) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "Connect";
}

export function WalletChip() {
  const { setActiveView, openOverlay, pushToast, address, isConnected, connectWallet, disconnectWallet } = useApp();
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  if (!isConnected) {
    return (
      <motion.button
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        whileHover={{ scale: 1.03 }}
        onClick={() => void connectWallet()}
        className="glass flex items-center gap-2 rounded-full border border-gold/40 py-2 pl-3 pr-4 transition-all duration-300 hover:border-gold/70 hover:shadow-goldglow"
      >
        <Wallet className="h-4 w-4 text-champagne" />
        <span className="text-xs font-medium tracking-wide text-ivory">Connect Wallet</span>
      </motion.button>
    );
  }

  return (
    <div className="relative">
      <motion.button
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        whileHover={{ scale: 1.03 }}
        onClick={() => setOpen((value) => !value)}
        className="glass flex items-center gap-2 rounded-full border border-gold/40 py-1.5 pl-1.5 pr-3 transition-all duration-300 hover:border-gold/70 hover:shadow-goldglow"
      >
        <span
          className="grid h-7 w-7 place-items-center rounded-full text-[10px] font-semibold text-obsidian"
          style={{ background: "linear-gradient(135deg, #f0d9a4, #a9772a)" }}
        >
          {address ? address.slice(2, 4).toUpperCase() : "AR"}
        </span>
        <span className="text-xs font-medium tracking-wide text-ivory">{shortAddr(address)}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-champagne/70 transition-transform ${open ? "rotate-180" : ""}`} />
      </motion.button>

      <AnimatePresence>
        {open ? (
          <>
            <div className="fixed inset-0 z-40" onClick={close} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              className="glass absolute right-0 top-12 z-50 w-64 rounded-2xl border border-gold/40 p-4 shadow-goldglow"
            >
              <p className="text-[10px] uppercase tracking-[0.18em] text-silver/50">Builder Profile</p>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-silver/60">Wallet</span>
                  <span className="text-ivory">{shortAddr(address)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-silver/60">Network</span>
                  <span className="text-emerald">Ritual (1979)</span>
                </div>
              </div>

              <div className="mt-3 space-y-1 border-t border-gold/15 pt-3">
                <MenuItem icon={Vault} label="My Vault" onClick={() => { setActiveView("vault"); close(); }} />
                <MenuItem icon={User} label="Builder Profile" onClick={() => { openOverlay("profile"); close(); }} />
                <MenuItem icon={Settings} label="Settings" onClick={() => { openOverlay("settings"); close(); }} />
                <MenuItem icon={LogOut} label="Disconnect" onClick={() => { disconnectWallet(); pushToast("Wallet disconnected.", "ruby"); close(); }} />
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick }: { icon: typeof User; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-silver/75 transition hover:bg-gold/10 hover:text-ivory">
      <Icon className="h-4 w-4 text-champagne/70" />
      {label}
    </button>
  );
}
