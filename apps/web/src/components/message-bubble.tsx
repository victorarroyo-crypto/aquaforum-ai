"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  MessageSquare,
  Shield,
  Sparkles,
  Crown,
  FileText,
} from "lucide-react";

interface MessageBubbleProps {
  agentName: string;
  agentRole: string;
  content: string;
  messageType: string;
  color?: string;
  timestamp?: string;
}

const typeConfig: Record<
  string,
  { icon: React.ElementType; accent: string; label: string; bg: string }
> = {
  statement: {
    icon: MessageSquare,
    accent: "border-l-ocean/50",
    label: "Declaración",
    bg: "bg-ocean/[0.03]",
  },
  challenge: {
    icon: AlertTriangle,
    accent: "border-l-coral/50",
    label: "Interpelación",
    bg: "bg-coral/[0.03]",
  },
  response: {
    icon: Shield,
    accent: "border-l-amber/50",
    label: "Respuesta",
    bg: "bg-amber/[0.03]",
  },
  moderation: {
    icon: Crown,
    accent: "border-l-violet/50",
    label: "Moderación",
    bg: "bg-violet/[0.03]",
  },
  analysis: {
    icon: Sparkles,
    accent: "border-l-emerald/50",
    label: "Análisis",
    bg: "bg-emerald/[0.03]",
  },
  integration: {
    icon: FileText,
    accent: "border-l-sky/50",
    label: "Integración",
    bg: "bg-sky/[0.03]",
  },
  summary: {
    icon: Sparkles,
    accent: "border-l-violet/50",
    label: "Resumen Final",
    bg: "bg-violet/[0.03]",
  },
};

export function MessageBubble({
  agentName,
  agentRole,
  content,
  messageType,
  color = "#06B6D4",
  timestamp,
}: MessageBubbleProps) {
  const cfg = typeConfig[messageType] || typeConfig.statement;
  const Icon = cfg.icon;

  const isSystem = messageType === "moderation" || messageType === "summary";

  const initials = agentName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`group rounded-xl border-l-[3px] ${cfg.accent} ${cfg.bg} border border-l-0 border-white/[0.04] p-5 backdrop-blur-sm transition-all hover:border-white/[0.08] ${
        isSystem ? "mx-auto max-w-2xl" : ""
      }`}
    >
      {/* Header */}
      <div className="mb-3 flex items-center gap-3">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-bold"
          style={{
            backgroundColor: `${color}15`,
            color: color,
          }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground/95">{agentName}</span>
            <span className="text-xs text-muted-foreground/50">{agentRole}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-md bg-white/[0.03] px-2 py-0.5">
          <Icon className="h-3 w-3 text-muted-foreground/50" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80 pl-11">
        {content}
      </div>

      {/* Timestamp */}
      {timestamp && (
        <div className="mt-3 pl-11 text-[10px] text-muted-foreground/30">
          {new Date(timestamp).toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      )}
    </motion.div>
  );
}
