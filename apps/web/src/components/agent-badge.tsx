"use client";

interface AgentBadgeProps {
  name: string;
  role: string;
  color: string;
  isActive?: boolean;
  isSpeaking?: boolean;
  avatarUrl?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AgentBadge({ name, role, color, isActive, isSpeaking, avatarUrl }: AgentBadgeProps) {
  return (
    <div
      className={`flex items-center gap-3 px-3.5 py-2 rounded-xl border transition-all duration-300 ${
        isSpeaking
          ? "bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.12)]"
          : "bg-[#18181B] border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.1)]"
      }`}
      style={isSpeaking ? { boxShadow: `0 0 20px ${color}15` } : undefined}
    >
      <div className="relative">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-8 h-8 rounded-full object-cover"
            style={{
              boxShadow: `0 0 0 2px ${isSpeaking ? color : 'rgba(255,255,255,0.1)'}`,
            }}
          />
        ) : (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 0 2px ${isSpeaking ? color : 'rgba(255,255,255,0.1)'}`,
            }}
          >
            {getInitials(name)}
          </div>
        )}
        {/* Speaking ring pulse */}
        {isSpeaking && (
          <div
            className="absolute inset-0 rounded-full ring-pulse"
            style={{ color }}
          />
        )}
        {/* Active dot */}
        {isActive && !isSpeaking && (
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#22C55E] border-2 border-[#18181B] status-pulse" />
        )}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[13px] font-semibold text-[#FAFAFA] leading-tight truncate">{name}</span>
        <span className="text-[10px] text-[#52525B] leading-tight truncate">{role}</span>
      </div>
      {isSpeaking && (
        <div className="flex items-center gap-1 ml-1">
          <div className="w-1 h-1 rounded-full bg-[#22C55E] status-pulse" />
        </div>
      )}
    </div>
  );
}
