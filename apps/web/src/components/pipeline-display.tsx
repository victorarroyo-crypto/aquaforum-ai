"use client";

import { motion } from "framer-motion";
import { Check, Crown, MessageCircle, Eye, Microscope, Layers, FileText } from "lucide-react";

const PIPELINE_NODES = [
  { id: "moderator_open", label: "Moderador", icon: Crown },
  { id: "agent_turn", label: "Debate", icon: MessageCircle },
  { id: "moderator_check", label: "Revisión", icon: Eye },
  { id: "expert_analysis", label: "Análisis", icon: Microscope },
  { id: "integration", label: "Integración", icon: Layers },
  { id: "final_summary", label: "Resumen", icon: FileText },
];

interface PipelineDisplayProps {
  currentNode: string;
  progress: number;
}

export function PipelineDisplay({ currentNode, progress }: PipelineDisplayProps) {
  const currentIndex = PIPELINE_NODES.findIndex((n) => n.id === currentNode);

  return (
    <div className="glass rounded-xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground/90">Pipeline</h3>
        <span className="text-xs text-muted-foreground/50">
          {Math.round(progress * 100)}%
        </span>
      </div>

      <div className="relative space-y-0">
        {PIPELINE_NODES.map((node, index) => {
          const isDone = index < currentIndex;
          const isActive = node.id === currentNode;
          const Icon = node.icon;

          return (
            <div key={node.id} className="relative flex items-start gap-3 pb-4 last:pb-0">
              {/* Vertical line */}
              {index < PIPELINE_NODES.length - 1 && (
                <div
                  className="absolute left-[15px] top-[30px] h-[calc(100%-18px)] w-px"
                  style={{
                    background: isDone
                      ? "linear-gradient(to bottom, #34D399, rgba(52,211,153,0.2))"
                      : "rgba(255,255,255,0.04)",
                  }}
                />
              )}

              {/* Node circle */}
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                className={`relative z-10 flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                  isDone
                    ? "bg-emerald/15"
                    : isActive
                    ? "bg-ocean/15 ring-2 ring-ocean/30 ring-offset-1 ring-offset-deep"
                    : "bg-white/[0.03]"
                }`}
              >
                {isDone ? (
                  <Check className="h-3.5 w-3.5 text-emerald" />
                ) : (
                  <Icon
                    className={`h-3.5 w-3.5 ${
                      isActive ? "text-ocean" : "text-muted-foreground/30"
                    }`}
                  />
                )}

                {/* Active pulse */}
                {isActive && (
                  <motion.div
                    animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-ocean/20"
                  />
                )}
              </motion.div>

              {/* Label */}
              <div className="pt-1">
                <span
                  className={`text-sm ${
                    isActive
                      ? "font-semibold text-ocean"
                      : isDone
                      ? "font-medium text-emerald/70"
                      : "text-muted-foreground/40"
                  }`}
                >
                  {node.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/[0.04]">
        <motion.div
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-ocean via-emerald/60 to-emerald"
          style={{
            boxShadow: "0 0 12px rgba(6,182,212,0.3)",
          }}
        />
      </div>
    </div>
  );
}
