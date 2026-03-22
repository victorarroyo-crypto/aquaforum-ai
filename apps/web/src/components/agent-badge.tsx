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
  const dim = size === "sm" ? 24 : 30;

  return (
    <div className="inline-flex items-center gap-2 border border-rule rounded-full px-3 py-1.5 hover:border-ink-ghost transition-colors">
      <div className="relative">
        <div
          className="flex items-center justify-center rounded-full text-white font-bold"
          style={{ width: dim, height: dim, backgroundColor: color, fontSize: size === "sm" ? 9 : 11 }}
        >
          {initials || "?"}
        </div>
        {active && (
          <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-paper bg-teal" />
        )}
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-[13px] font-bold text-ink">{name}</span>
        <span className="text-[10px] text-ink-faint">{role}</span>
      </div>
    </div>
  );
}
