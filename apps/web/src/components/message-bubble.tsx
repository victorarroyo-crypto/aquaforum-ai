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

const typeConfig: Record<string, { icon: React.ElementType; label: string; accent: string; bg: string; badge: string }> = {
  statement:   { icon: MessageSquare, label: "Declaración",   accent: "border-l-ocean/40",   bg: "",                    badge: "text-ocean/40 bg-ocean/[0.04]" },
  challenge:   { icon: AlertTriangle, label: "Interpelación", accent: "border-l-coral",       bg: "bg-coral/[0.02]",     badge: "text-coral bg-coral/[0.06]" },
  response:    { icon: Shield,        label: "Respuesta",     accent: "border-l-amber/50",    bg: "bg-amber/[0.02]",     badge: "text-amber/60 bg-amber/[0.04]" },
  moderation:  { icon: Crown,         label: "Moderación",    accent: "",                      bg: "",                    badge: "text-violet/50 bg-violet/[0.04]" },
  analysis:    { icon: Sparkles,      label: "Análisis",      accent: "border-l-emerald/40",  bg: "bg-emerald/[0.02]",   badge: "text-emerald/50 bg-emerald/[0.04]" },
  integration: { icon: FileText,      label: "Integración",   accent: "border-l-sky/40",      bg: "bg-sky/[0.02]",       badge: "text-sky/50 bg-sky/[0.04]" },
  summary:     { icon: Sparkles,      label: "Resumen Final", accent: "",                      bg: "",                    badge: "text-violet/50 bg-violet/[0.04]" },
};

export function MessageBubble({ agentName, agentRole, content, messageType, color = "#06B6D4", timestamp }: MessageBubbleProps) {
  const cfg = typeConfig[messageType] || typeConfig.statement;
  const Icon = cfg.icon;
  const isMod = messageType === "moderation" || messageType === "summary";

  const initials = agentName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  if (isMod) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto max-w-xl"
      >
        <div className="gradient-border glass rounded-2xl p-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Crown className="h-4 w-4 text-violet/50" />
            <span className="text-xs font-semibold text-violet/60 uppercase tracking-wider">{cfg.label}</span>
          </div>
          <p className="text-sm leading-relaxed text-foreground/70">{content}</p>
          {timestamp && (
            <div className="mt-3 text-[10px] text-muted-foreground/25">
              {new Date(timestamp).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`flex gap-3.5 ${cfg.bg} rounded-xl p-4 border-l-[3px] ${cfg.accent} border border-l-0 border-white/[0.03] transition-all hover:border-white/[0.06]`}
    >
      {/* Avatar */}
      <div
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold mt-0.5"
        style={{ backgroundColor: `${color}12`, color }}
      >
        {initials}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm font-semibold text-foreground/90">{agentName}</span>
          <span className="text-xs text-muted-foreground/35">{agentRole}</span>
          <span className={`ml-auto inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${cfg.badge}`}>
            <Icon className="h-2.5 w-2.5" />
            {cfg.label}
          </span>
        </div>
        <div className="whitespace-pre-wrap text-sm leading-[1.7] text-foreground/70">{content}</div>
        {timestamp && (
          <div className="mt-2 text-[10px] text-muted-foreground/20">
            {new Date(timestamp).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
