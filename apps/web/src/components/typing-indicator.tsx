"use client";

export function TypingIndicator({
  agentName,
  color,
}: {
  agentName: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 px-1 py-2">
      <div
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {agentName
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()}
      </div>
      <div className="flex items-center gap-1">
        <div className="typing-dot h-1.5 w-1.5 rounded-full bg-stone-400" />
        <div className="typing-dot h-1.5 w-1.5 rounded-full bg-stone-400" />
        <div className="typing-dot h-1.5 w-1.5 rounded-full bg-stone-400" />
      </div>
      <span className="text-xs text-stone-400">
        {agentName} est\u00e1 escribiendo
      </span>
    </div>
  );
}
