"use client";

import { motion } from "framer-motion";
import { Zap, MessageCircle } from "lucide-react";
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
  challenge: "rgba(245, 158, 11, 0.05)",
  interpelacion: "rgba(245, 158, 11, 0.05)",
  response: "rgba(20, 184, 166, 0.04)",
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
  let clean = content.replace(/\[CHALLENGE:[^\]]+\]\s*/g, "");
  clean = clean.replace(/^\*\*(DECLARACIÓN|APOYO|INTERPELACIÓN|RESPUESTA)\*\*[:\s]*/gim, "");
  clean = clean.replace(/^(DECLARACIÓN|APOYO|INTERPELACIÓN|RESPUESTA)[:\s]*/gim, "");
  return clean.trim();
}

interface MessageBubbleProps {
  message: ForumMessage;
  color?: string;
  avatarUrl?: string;
}

export function MessageBubble({ message, color, avatarUrl }: MessageBubbleProps) {
  const borderColor = borderColorMap[message.message_type] || "#52525B";
  const bgTint = bgTintMap[message.message_type] || "transparent";
  const isModeration = message.message_type === "moderation" || message.message_type === "summary";
  const isRoundSummary = message.message_type === "round_summary";
  const isChallenge = message.message_type === "challenge" || message.message_type === "interpelacion";
  const isResponse = message.message_type === "response";

  const displayContent = cleanContent(message.content);

  // Moderation messages — flanking gradient lines
  if (isModeration) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex items-center gap-4 py-5 relative z-10"
      >
        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[rgba(139,92,246,0.3)] to-transparent" />
        <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.06)] glass-subtle">
          <span className="text-[13px] italic text-[#A1A1AA] leading-relaxed text-center">
            {displayContent}
          </span>
        </div>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[rgba(139,92,246,0.3)] to-transparent" />
      </motion.div>
    );
  }

  // Round summary — gradient top border card
  if (isRoundSummary) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="py-6 relative z-10"
      >
        <div className="rounded-xl overflow-hidden">
          {/* Gradient top border */}
          <div className="h-[2px] bg-gradient-to-r from-[#14B8A6] via-[#8B5CF6] to-[#14B8A6]" />
          <div className="bg-[rgba(20,184,166,0.06)] border border-t-0 border-[rgba(20,184,166,0.15)] rounded-b-xl p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-1.5 w-1.5 rounded-full bg-[#14B8A6]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#14B8A6]">
                Resumen Ronda {message.round_number}
              </span>
            </div>
            <p className="text-[15px] leading-[1.85] text-[#D4D4D8] whitespace-pre-wrap">
              {displayContent}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Challenge / Response label
  const typeLabel = isChallenge ? "Interpelacion" : isResponse ? "Respuesta" : null;
  const TypeIcon = isChallenge ? Zap : isResponse ? MessageCircle : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="flex gap-4 py-3 relative z-10"
    >
      {/* Avatar with color ring */}
      <div className="relative shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={message.agent_name}
            className="w-11 h-11 rounded-full object-cover"
            style={{
              boxShadow: `0 0 0 2px #09090B, 0 0 0 4px ${color || borderColor}`,
            }}
          />
        ) : (
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-[13px] font-bold text-white"
            style={{
              backgroundColor: color || borderColor,
              boxShadow: `0 0 0 2px #09090B, 0 0 0 4px ${color || borderColor}40`,
            }}
          >
            {getInitials(message.agent_name)}
          </div>
        )}
        {/* Type-specific glow */}
        {(isChallenge || isResponse) && (
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              boxShadow: `0 0 12px ${borderColor}30`,
            }}
          />
        )}
      </div>

      {/* Message card */}
      <div className="flex-1 min-w-0">
        <div
          className="rounded-xl px-4.5 py-4 border border-[rgba(255,255,255,0.06)] transition-colors duration-200 hover:border-[rgba(255,255,255,0.1)]"
          style={{
            backgroundColor: bgTint !== "transparent" ? bgTint : "#131316",
            borderTop: `2px solid ${borderColor}`,
          }}
        >
          {/* Agent name row */}
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-[14px] font-semibold text-[#FAFAFA]">
              {message.agent_name}
            </span>
            <span className="text-[11px] text-[#52525B]">{message.agent_role}</span>
            {typeLabel && TypeIcon && (
              <span
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                style={{
                  color: borderColor,
                  backgroundColor: `${borderColor}15`,
                }}
              >
                <TypeIcon className="h-3 w-3" />
                {typeLabel}
              </span>
            )}
          </div>

          {/* Content */}
          <p className="text-[15px] leading-[1.8] text-[#D4D4D8] whitespace-pre-wrap">
            {displayContent}
          </p>

          {/* Metadata row */}
          <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-[rgba(255,255,255,0.04)]">
            <span className="text-[10px] text-[#3F3F46] font-mono tracking-wider">
              R{message.round_number} · T{message.turn_number}
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
