"use client";

import { motion } from "framer-motion";
import type { ForumMessage } from "@/lib/api";

const borderColorMap: Record<string, string> = {
  statement: "#52525B",
  challenge: "#F59E0B",
  interpelacion: "#F59E0B",
  response: "#14B8A6",
  moderation: "#8B5CF6",
  round_summary: "#14B8A6",
  analysis: "#22C55E",
  integration: "#14B8A6",
  synthesis: "#6366F1",
  summary: "#8B5CF6",
};

const bgTintMap: Record<string, string> = {
  challenge: "rgba(245, 158, 11, 0.04)",
  interpelacion: "rgba(245, 158, 11, 0.04)",
  round_summary: "rgba(20, 184, 166, 0.06)",
};

function getInitials(name: string): string {
  const parts = name.replace("Dr.", "Dr").split(" ");
  return parts
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function cleanContent(content: string): string {
  // Remove [CHALLENGE:Name] tags
  let clean = content.replace(/\[CHALLENGE:[^\]]+\]\s*/g, "");
  // Remove bold markdown labels like **DECLARACIÓN**, **APOYO**, etc.
  clean = clean.replace(/^\*\*(DECLARACIÓN|APOYO|INTERPELACIÓN|RESPUESTA)\*\*\s*/i, "");
  return clean.trim();
}

interface MessageBubbleProps {
  message: ForumMessage;
  color?: string;
}

export function MessageBubble({ message, color }: MessageBubbleProps) {
  const borderColor = borderColorMap[message.message_type] || "#52525B";
  const bgTint = bgTintMap[message.message_type] || "transparent";
  const isModeration = message.message_type === "moderation" || message.message_type === "summary";
  const isRoundSummary = message.message_type === "round_summary";

  const displayContent = cleanContent(message.content);

  // Moderation messages (short, centered)
  if (isModeration) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-center py-4"
      >
        <div className="flex items-center gap-2 px-5 py-3 rounded-full border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.05)] max-w-lg">
          <span className="text-[14px] italic text-[#A1A1AA] leading-relaxed text-center">
            {displayContent}
          </span>
        </div>
      </motion.div>
    );
  }

  // Round summary — prominent card
  if (isRoundSummary) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="py-6"
      >
        <div className="rounded-xl border border-[rgba(20,184,166,0.3)] bg-[rgba(20,184,166,0.06)] p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-1 w-6 bg-[#14B8A6] rounded-full" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#14B8A6]">
              Resumen Ronda {message.round_number}
            </span>
          </div>
          <p className="text-[15px] leading-[1.8] text-[#D4D4D8] whitespace-pre-wrap">
            {displayContent}
          </p>
        </div>
      </motion.div>
    );
  }

  // Challenge label
  const challengeLabel = message.message_type === "challenge" ? "Interpelación" :
                         message.message_type === "response" ? "Respuesta" : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-3.5 py-3"
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold text-white"
        style={{ backgroundColor: color || borderColor }}
      >
        {getInitials(message.agent_name)}
      </div>

      <div className="flex-1 min-w-0">
        <div
          className="rounded-lg px-4 py-3.5 border border-[rgba(255,255,255,0.06)]"
          style={{
            borderLeft: `3px solid ${borderColor}`,
            backgroundColor: bgTint !== "transparent" ? bgTint : "#18181B",
          }}
        >
          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="text-[14px] font-semibold text-[#FAFAFA]">
              {message.agent_name}
            </span>
            <span className="text-[12px] text-[#52525B]">{message.agent_role}</span>
            {challengeLabel && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#F59E0B] bg-[rgba(245,158,11,0.1)] px-2 py-0.5 rounded">
                {challengeLabel}
              </span>
            )}
          </div>

          <p className="text-[15px] leading-[1.75] text-[#D4D4D8] whitespace-pre-wrap">
            {displayContent}
          </p>

          <div className="flex items-center gap-3 mt-2.5">
            <span className="text-[10px] text-[#52525B] font-mono">
              R{message.round_number} / T{message.turn_number}
            </span>
            <span className="text-[10px] text-[#3F3F46]">
              {new Date(message.created_at).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
