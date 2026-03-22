"use client";

export function TypingIndicator({ agentName, color }: { agentName: string; color: string }) {
  return (
    <div className="flex items-center gap-3 px-1 py-2">
      <div
        className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {agentName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
      </div>
      <div className="flex items-center gap-1">
        <div className="typing-dot h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
        <div className="typing-dot h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
        <div className="typing-dot h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
      </div>
      <span className="text-xs text-muted-foreground/40">{agentName} está escribiendo</span>
    </div>
  );
}
