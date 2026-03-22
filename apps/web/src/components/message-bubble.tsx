"use client";

import { motion } from "framer-motion";
import { AlertTriangle, MessageSquare, Shield, Crown, Sparkles, FileText } from "lucide-react";

interface MessageBubbleProps {
  agentName: string;
  agentRole: string;
  content: string;
  messageType: string;
  color?: string;
  timestamp?: string;
}

const types: Record<string, { icon: React.ElementType; label: string; accent: string; badge: string }> = {
  statement:   { icon: MessageSquare, label: "Declaración",   accent: "border-l-ink-ghost",    badge: "text-ink-faint bg-paper-warm" },
  challenge:   { icon: AlertTriangle, label: "Interpelación", accent: "border-l-challenge",     badge: "text-challenge bg-challenge-bg" },
  response:    { icon: Shield,        label: "Respuesta",     accent: "border-l-teal",          badge: "text-teal bg-teal/5" },
  moderation:  { icon: Crown,         label: "Moderación",    accent: "",                        badge: "text-moderation bg-moderation-bg" },
  analysis:    { icon: Sparkles,      label: "Análisis",      accent: "border-l-teal",          badge: "text-teal bg-teal/5" },
  integration: { icon: FileText,      label: "Integración",   accent: "border-l-ink-muted",     badge: "text-ink-muted bg-paper-warm" },
  summary:     { icon: Sparkles,      label: "Resumen Final", accent: "",                        badge: "text-moderation bg-moderation-bg" },
};

export function MessageBubble({ agentName, agentRole, content, messageType, color = "#0D9488", timestamp }: MessageBubbleProps) {
  const cfg = types[messageType] || types.statement;
  const Icon = cfg.icon;
  const isMod = messageType === "moderation" || messageType === "summary";
  const initials = agentName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  if (isMod) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-lg text-center py-6"
      >
        <div className="rule w-8 mx-auto mb-4" />
        <p className="text-sm leading-[1.8] text-ink-muted font-serif italic">{content}</p>
        <p className="text-[10px] text-ink-ghost mt-3 uppercase tracking-widest">{cfg.label}</p>
        {timestamp && (
          <p className="text-[10px] text-ink-ghost mt-1">
            {new Date(timestamp).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex gap-4 py-5 border-l-2 ${cfg.accent} pl-5`}
    >
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm font-semibold text-ink">{agentName}</span>
          <span className="text-xs text-ink-faint">{agentRole}</span>
          <span className={`ml-auto text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${cfg.badge}`}>
            <Icon className="inline h-2.5 w-2.5 mr-0.5 -mt-px" />
            {cfg.label}
          </span>
        </div>
        <div className="text-sm leading-[1.8] text-ink-light whitespace-pre-wrap">{content}</div>
        {timestamp && (
          <div className="mt-2 text-[10px] text-ink-ghost">
            {new Date(timestamp).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
