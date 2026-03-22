"use client";

import { motion } from "framer-motion";
import { Check, Crown, MessageCircle, Eye, Microscope, Layers, FileText } from "lucide-react";

const PIPELINE_NODES = [
  { id: "moderator_open", label: "Apertura", icon: Crown, color: "#FBBF24" },
  { id: "agent_turn", label: "Debate", icon: MessageCircle, color: "#06B6D4" },
  { id: "moderator_check", label: "Revisión", icon: Eye, color: "#A78BFA" },
  { id: "expert_analysis", label: "Análisis", icon: Microscope, color: "#34D399" },
  { id: "integration", label: "Integración", icon: Layers, color: "#38BDF8" },
  { id: "final_summary", label: "Resumen", icon: FileText, color: "#F87171" },
];

interface PipelineDisplayProps {
  currentNode: string;
  progress: number;
}

export function PipelineDisplay({ currentNode, progress }: PipelineDisplayProps) {
  const currentIndex = PIPELINE_NODES.findIndex((n) => n.id === currentNode);

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">Pipeline</h3>
        <span className="text-xs font-mono text-ocean/60">{Math.round(progress * 100)}%</span>
      </div>

      <div className="space-y-0">
        {PIPELINE_NODES.map((node, index) => {
          const isDone = index < currentIndex;
          const isActive = node.id === currentNode;
          const Icon = node.icon;

          return (
            <div key={node.id} className="relative flex items-start gap-3 pb-5 last:pb-0">
              {/* Connector line */}
              {index < PIPELINE_NODES.length - 1 && (
                <div
                  className="absolute left-[14px] top-[32px] h-[calc(100%-20px)] w-px transition-colors"
                  style={{
                    background: isDone
                      ? `linear-gradient(to bottom, ${node.color}40, ${PIPELINE_NODES[index + 1]?.color || node.color}20)`
                      : "rgba(255,255,255,0.03)",
                  }}
                />
              )}

              {/* Node */}
              <div className="relative z-10">
                <motion.div
                  animate={{ scale: isActive ? 1.15 : 1 }}
                  className={`flex h-[30px] w-[30px] items-center justify-center rounded-lg transition-colors ${
                    isDone
                      ? "bg-emerald/10"
                      : isActive
                      ? "ring-2 ring-offset-1 ring-offset-[#030712]"
                      : "bg-white/[0.02]"
                  }`}
                  style={isActive ? { backgroundColor: `${node.color}12` } : {}}
                >
                  {isDone ? (
                    <Check className="h-3.5 w-3.5 text-emerald" />
                  ) : (
                    <Icon className={`h-3.5 w-3.5`} style={{ color: isActive ? node.color : "rgba(255,255,255,0.12)" }} />
                  )}
                </motion.div>

                {isActive && (
                  <motion.div
                    animate={{ scale: [1, 1.6], opacity: [0.2, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-lg"
                    style={{ backgroundColor: `${node.color}15` }}
                  />
                )}
              </div>

              {/* Label */}
              <div className="pt-1.5">
                <span className={`text-sm transition-colors ${
                  isActive ? "font-semibold" : isDone ? "text-foreground/50" : "text-muted-foreground/25"
                }`} style={isActive ? { color: node.color } : {}}>
                  {node.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-5 h-[3px] overflow-hidden rounded-full bg-white/[0.03]">
        <motion.div
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-ocean via-emerald/50 to-emerald"
          style={{ boxShadow: "0 0 12px rgba(6,182,212,0.3)" }}
        />
      </div>
    </div>
  );
}
