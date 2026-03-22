interface AgentBadgeProps {
  name: string;
  role: string;
  color: string;
  size?: "sm" | "md";
}

export function AgentBadge({ name, role, color, size = "sm" }: AgentBadgeProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="group inline-flex items-center gap-2.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 transition-all hover:bg-white/[0.04] hover:border-white/10">
      <div
        className="flex items-center justify-center rounded-full text-[10px] font-bold"
        style={{
          backgroundColor: `${color}15`,
          color: color,
          width: size === "sm" ? 22 : 28,
          height: size === "sm" ? 22 : 28,
        }}
      >
        {initials}
      </div>
      <span className="text-sm font-medium text-foreground/90">{name}</span>
      <span className="text-xs text-muted-foreground/60">{role}</span>
    </div>
  );
}
