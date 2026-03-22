"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const PIPELINE_NODES = [
  { id: "moderator_open", label: "Moderador" },
  { id: "agent_turn", label: "Debate" },
  { id: "moderator_check", label: "Revisión" },
  { id: "expert_analysis", label: "Análisis" },
  { id: "integration", label: "Integración" },
  { id: "final_summary", label: "Resumen" },
];

interface PipelineDisplayProps {
  currentNode: string;
  progress: number;
}

export function PipelineDisplay({ currentNode, progress }: PipelineDisplayProps) {
  const currentIndex = PIPELINE_NODES.findIndex((n) => n.id === currentNode);

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Pipeline</h3>

      <div className="space-y-2">
        {PIPELINE_NODES.map((node, index) => {
          const isDone = index < currentIndex;
          const isActive = node.id === currentNode;

          return (
            <div key={node.id} className="flex items-center gap-3">
              <motion.div
                animate={{
                  scale: isActive ? 1.2 : 1,
                  backgroundColor: isDone
                    ? "#34D399"
                    : isActive
                    ? "#06B6D4"
                    : "rgba(255,255,255,0.1)",
                }}
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs"
              >
                {isDone ? (
                  <Check className="h-3 w-3 text-deep" />
                ) : (
                  <span className={isActive ? "text-deep font-bold" : "text-muted-foreground"}>
                    {index + 1}
                  </span>
                )}
              </motion.div>
              <span
                className={`text-xs ${
                  isActive
                    ? "font-semibold text-ocean"
                    : isDone
                    ? "text-emerald"
                    : "text-muted-foreground"
                }`}
              >
                {node.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5 }}
          className="h-full rounded-full bg-gradient-to-r from-ocean to-emerald"
        />
      </div>
    </div>
  );
}
