"use client";

import { motion } from "framer-motion";

interface TypingIndicatorProps {
  agentName?: string;
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-center gap-4 py-3 relative z-10"
    >
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center text-[13px] font-bold text-white shrink-0"
        style={{
          backgroundColor: agentName ? (color || "#3F3F46") : "#27272A",
          boxShadow: "0 0 0 2px #09090B, 0 0 0 4px rgba(255,255,255,0.06)",
        }}
      >
        {agentName ? getInitials(agentName) : "···"}
      </div>
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="flex items-center gap-2 px-5 py-3.5 rounded-xl glass-subtle border border-[rgba(255,255,255,0.06)]"
      >
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#14B8A6] typing-dot" />
          <div className="w-2 h-2 rounded-full bg-[#14B8A6] typing-dot" />
          <div className="w-2 h-2 rounded-full bg-[#14B8A6] typing-dot" />
        </div>
        <span className="ml-2 text-[13px] text-[#52525B]">
          {agentName ? `${agentName} escribe...` : "Elaborando argumento..."}
        </span>
      </motion.div>
    </motion.div>
  );
}
