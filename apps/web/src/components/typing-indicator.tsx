"use client";

interface TypingIndicatorProps {
  agentName: string;
  color?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function TypingIndicator({ agentName, color }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-3.5 py-3">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold text-white shrink-0"
        style={{ backgroundColor: color || "#3F3F46" }}
      >
        {getInitials(agentName)}
      </div>
      <div className="flex items-center gap-1.5 px-4 py-3 rounded-lg bg-[#18181B] border border-[rgba(255,255,255,0.06)]">
        <div className="w-1.5 h-1.5 rounded-full bg-[#A1A1AA] typing-dot" />
        <div className="w-1.5 h-1.5 rounded-full bg-[#A1A1AA] typing-dot" />
        <div className="w-1.5 h-1.5 rounded-full bg-[#A1A1AA] typing-dot" />
        <span className="ml-2 text-[13px] text-[#52525B]">{agentName} escribe...</span>
      </div>
    </div>
  );
}
