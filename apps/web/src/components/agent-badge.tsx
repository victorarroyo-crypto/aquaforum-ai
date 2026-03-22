"use client";

interface AgentBadgeProps {
  name: string;
  role: string;
  color: string;
  isActive?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AgentBadge({ name, role, color, isActive }: AgentBadgeProps) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#18181B] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.1)] transition-colors">
      <div className="relative">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {getInitials(name)}
        </div>
        {isActive && (
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#22C55E] border-2 border-[#18181B] status-pulse" />
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-[13px] font-semibold text-[#FAFAFA] leading-tight">{name}</span>
        <span className="text-[10px] text-[#52525B] leading-tight">{role}</span>
      </div>
    </div>
  );
}
