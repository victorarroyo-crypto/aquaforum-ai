interface AgentBadgeProps {
  name: string;
  role: string;
  color: string;
}

export function AgentBadge({ name, role, color }: AgentBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-sm font-medium text-foreground">{name}</span>
      <span className="text-xs text-muted-foreground">{role}</span>
    </div>
  );
}
