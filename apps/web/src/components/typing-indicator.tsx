"use client";

export function TypingIndicator({ agentName, color }: { agentName: string; color: string }) {
  return (
    <div className="flex items-center gap-3 py-2 pl-5">
      <div
        className="flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {agentName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
      </div>
      <div className="flex items-center gap-1">
        <div className="typing-dot h-1 w-1 rounded-full bg-ink-ghost" />
        <div className="typing-dot h-1 w-1 rounded-full bg-ink-ghost" />
        <div className="typing-dot h-1 w-1 rounded-full bg-ink-ghost" />
      </div>
      <span className="text-xs text-ink-ghost font-medium">{agentName}</span>
    </div>
  );
}
