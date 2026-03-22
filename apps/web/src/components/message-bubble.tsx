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

const CFG: Record<string, { icon: React.ElementType; label: string; border: string; badge: string }> = {
  statement:   { icon: MessageSquare, label: "Declaración",   border: "border-l-faint",    badge: "text-light bg-surface" },
  challenge:   { icon: AlertTriangle, label: "Interpelación", border: "border-l-warn",     badge: "text-warn bg-warn-bg" },
  response:    { icon: Shield,        label: "Respuesta",     border: "border-l-accent",   badge: "text-accent bg-accent/5" },
  moderation:  { icon: Crown,         label: "Moderación",    border: "",                   badge: "text-info bg-info-bg" },
  analysis:    { icon: Sparkles,      label: "Análisis",      border: "border-l-accent",   badge: "text-accent bg-accent/5" },
  integration: { icon: FileText,      label: "Integración",   border: "border-l-mid",      badge: "text-mid bg-surface" },
  summary:     { icon: Sparkles,      label: "Resumen Final", border: "",                   badge: "text-info bg-info-bg" },
};

export function MessageBubble({ agentName, agentRole, content, messageType, color = "#0D9488", timestamp }: MessageBubbleProps) {
  const c = CFG[messageType] || CFG.statement;
  const Icon = c.icon;
  const isMod = messageType === "moderation" || messageType === "summary";
  const initials = agentName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  if (isMod) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mx-auto max-w-lg text-center py-8">
        <div className="h-px w-8 bg-edge mx-auto mb-4" />
        <p className="text-sm leading-[1.8] text-mid italic">{content}</p>
        <p className="text-[9px] text-light mt-3 font-bold uppercase tracking-[0.2em]">{c.label}</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className={`flex gap-4 py-5 border-l-2 ${c.border} pl-5`}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: color }}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm font-bold text-dark">{agentName}</span>
          <span className="text-xs text-light">{agentRole}</span>
          <span className={`ml-auto text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${c.badge}`}>
            {c.label}
          </span>
        </div>
        <div className="text-[15px] leading-[1.8] text-mid whitespace-pre-wrap">{content}</div>
        {timestamp && <div className="mt-2 text-[10px] text-faint">{new Date(timestamp).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</div>}
      </div>
    </motion.div>
  );
}
