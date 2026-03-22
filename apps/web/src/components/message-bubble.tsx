"use client";

import { motion } from "framer-motion";
import { AlertTriangle, MessageSquare, Shield, Sparkles } from "lucide-react";

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
  { icon: React.ElementType; borderClass: string; label: string }
> = {
  statement: { icon: MessageSquare, borderClass: "border-l-ocean", label: "Declaración" },
  challenge: { icon: AlertTriangle, borderClass: "border-l-coral", label: "Interpelación" },
  response: { icon: Shield, borderClass: "border-l-amber", label: "Respuesta" },
  moderation: { icon: Sparkles, borderClass: "border-l-violet", label: "Moderación" },
  analysis: { icon: Sparkles, borderClass: "border-l-emerald", label: "Análisis" },
  integration: { icon: Sparkles, borderClass: "border-l-sky", label: "Integración" },
  summary: { icon: Sparkles, borderClass: "border-l-violet", label: "Resumen" },
};

export function MessageBubble({
  agentName,
  agentRole,
  content,
  messageType,
  color,
  timestamp,
}: MessageBubbleProps) {
  const config = typeConfig[messageType] || typeConfig.statement;
  const Icon = config.icon;

  const isSystem = messageType === "moderation" || messageType === "summary";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-lg border-l-4 ${config.borderClass} bg-white/5 p-4 backdrop-blur-sm ${
        isSystem ? "mx-auto max-w-2xl text-center" : ""
      }`}
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: color || "#06B6D4" }}
        />
        <span className="text-sm font-semibold text-foreground">{agentName}</span>
        <span className="text-xs text-muted-foreground">({agentRole})</span>
        <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
          <Icon className="h-3 w-3" />
          {config.label}
        </span>
      </div>
      <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
        {content}
      </div>
      {timestamp && (
        <div className="mt-2 text-right text-xs text-muted-foreground">
          {new Date(timestamp).toLocaleTimeString("es-ES")}
        </div>
      )}
    </motion.div>
  );
}
