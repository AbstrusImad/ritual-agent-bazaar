import type { AgentStatus } from "../../types";
import { cn } from "../../lib/cn";

const config: Record<AgentStatus, { label: string; dot: string; text: string; border: string }> = {
  active: { label: "Active", dot: "bg-emerald", text: "text-emerald", border: "border-emerald/40" },
  sleeping: { label: "Sleeping", dot: "bg-gold", text: "text-gold", border: "border-gold/40" },
  draft: { label: "Draft", dot: "bg-silver", text: "text-silver", border: "border-silver/30" },
  failed: { label: "Failed", dot: "bg-ruby", text: "text-ruby", border: "border-ruby/40" },
};

export function StatusPill({ status }: { status: AgentStatus }) {
  const c = config[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px]", c.border, c.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
      {c.label}
    </span>
  );
}
