"use client";

interface AgentBadgeProps {
  name: string;
  role: string;
  color: string;
  size?: "sm" | "md" | "lg";
  active?: boolean;
}

export function AgentBadge({ name, role, color, size = "sm", active }: AgentBadgeProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sizes = {
    sm: { avatar: 24, text: "text-[10px]", nameText: "text-xs", roleText: "text-[10px]", px: "px-2.5 py-1" },
    md: { avatar: 32, text: "text-[11px]", nameText: "text-sm", roleText: "text-xs", px: "px-3 py-1.5" },
    lg: { avatar: 40, text: "text-sm", nameText: "text-base", roleText: "text-sm", px: "px-4 py-2" },
  };
  const s = sizes[size];

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-white/[0.04] bg-white/[0.02] ${s.px} transition-all hover:bg-white/[0.04]`}
    >
      <div className="relative">
        <div
          className={`flex items-center justify-center rounded-full font-bold ${s.text}`}
          style={{
            width: s.avatar,
            height: s.avatar,
            backgroundColor: `${color}12`,
            color: color,
          }}
        >
          {initials || "?"}
        </div>
        {active && (
          <div
            className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2"
            style={{
              backgroundColor: color,
              borderColor: "#030712",
            }}
          />
        )}
      </div>
      <div className="flex flex-col">
        <span className={`${s.nameText} font-medium text-foreground/90 leading-tight`}>{name}</span>
        <span className={`${s.roleText} text-muted-foreground/50 leading-tight`}>{role}</span>
      </div>
    </div>
  );
}
