"use client";

interface AgentBadgeProps {
  name: string;
  role: string;
  color: string;
  size?: "sm" | "md";
  active?: boolean;
}

export function AgentBadge({ name, role, color, size = "sm", active }: AgentBadgeProps) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const dim = size === "sm" ? 22 : 28;

  return (
    <div className="inline-flex items-center gap-2 border border-rule rounded-full px-2.5 py-1 hover:border-ink-ghost transition-colors">
      <div className="relative">
        <div
          className="flex items-center justify-center rounded-full text-white font-bold"
          style={{ width: dim, height: dim, backgroundColor: color, fontSize: size === "sm" ? 9 : 10 }}
        >
          {initials || "?"}
        </div>
        {active && (
          <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-paper bg-teal" />
        )}
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-xs font-medium text-ink">{name}</span>
        <span className="text-[10px] text-ink-faint">{role}</span>
      </div>
    </div>
  );
}
