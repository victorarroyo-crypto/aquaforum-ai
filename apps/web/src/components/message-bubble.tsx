"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  MessageSquare,
  Shield,
  Crown,
  Sparkles,
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
  {
    icon: React.ElementType;
    label: string;
    borderClass: string;
    bgClass: string;
    labelColor: string;
  }
> = {
  statement: {
    icon: MessageSquare,
    label: "Declaraci\u00f3n",
    borderClass: "border-l-stone-300",
    bgClass: "",
    labelColor: "text-stone-500 bg-stone-100",
  },
  challenge: {
    icon: AlertTriangle,
    label: "Interpelaci\u00f3n",
    borderClass: "border-l-warm-amber",
    bgClass: "msg-challenge",
    labelColor: "text-amber-700 bg-amber-50",
  },
  response: {
    icon: Shield,
    label: "Respuesta",
    borderClass: "border-l-teal",
    bgClass: "",
    labelColor: "text-teal bg-teal-50",
  },
  moderation: {
    icon: Crown,
    label: "Moderaci\u00f3n",
    borderClass: "",
    bgClass: "msg-moderation",
    labelColor: "text-indigo bg-indigo-50",
  },
  analysis: {
    icon: Sparkles,
    label: "An\u00e1lisis",
    borderClass: "border-l-warm-emerald",
    bgClass: "msg-analysis",
    labelColor: "text-emerald-700 bg-emerald-50",
  },
  integration: {
    icon: FileText,
    label: "Integraci\u00f3n",
    borderClass: "border-l-teal",
    bgClass: "msg-integration",
    labelColor: "text-teal bg-teal-50",
  },
  summary: {
    icon: Sparkles,
    label: "Resumen Final",
    borderClass: "",
    bgClass: "msg-moderation",
    labelColor: "text-indigo bg-indigo-50",
  },
};

export function MessageBubble({
  agentName,
  agentRole,
  content,
  messageType,
  color = "#0F766E",
  timestamp,
}: MessageBubbleProps) {
  const cfg = typeConfig[messageType] || typeConfig.statement;
  const Icon = cfg.icon;
  const isMod = messageType === "moderation" || messageType === "summary";

  const initials = agentName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (isMod) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto max-w-xl"
      >
        <div className="rounded-xl border border-indigo/10 bg-indigo/[0.03] p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Crown className="h-4 w-4 text-indigo" />
            <span className="text-xs font-semibold text-indigo uppercase tracking-wider">
              {cfg.label}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-stone-600 font-editorial italic">
            {content}
          </p>
          {timestamp && (
            <div className="mt-3 text-[10px] text-stone-400">
              {new Date(timestamp).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}
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
      className={`flex gap-4 rounded-lg p-5 border-l-[3px] ${cfg.borderClass} ${cfg.bgClass} border border-l-0 border-stone-200 transition-all hover:shadow-sm`}
    >
      {/* Avatar */}
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white mt-0.5"
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold text-stone-800">
            {agentName}
          </span>
          <span className="text-xs text-stone-400">{agentRole}</span>
          <span
            className={`ml-auto inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cfg.labelColor}`}
          >
            <Icon className="h-2.5 w-2.5" />
            {cfg.label}
          </span>
        </div>
        <div className="whitespace-pre-wrap text-sm leading-[1.75] text-stone-600">
          {content}
        </div>
        {timestamp && (
          <div className="mt-2 text-[10px] text-stone-400">
            {new Date(timestamp).toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
