"use client";

import { motion } from "framer-motion";
import {
  Check,
  Crown,
  MessageCircle,
  Eye,
  Microscope,
  Layers,
  FileText,
} from "lucide-react";

const PIPELINE_NODES = [
  { id: "moderator_open", label: "Apertura", icon: Crown, color: "#D97706" },
  { id: "agent_turn", label: "Debate", icon: MessageCircle, color: "#0F766E" },
  { id: "moderator_check", label: "Revisi\u00f3n", icon: Eye, color: "#4338CA" },
  {
    id: "expert_analysis",
    label: "An\u00e1lisis",
    icon: Microscope,
    color: "#059669",
  },
  { id: "integration", label: "Integraci\u00f3n", icon: Layers, color: "#0F766E" },
  {
    id: "final_summary",
    label: "Resumen",
    icon: FileText,
    color: "#78716C",
  },
];

interface PipelineDisplayProps {
  currentNode: string;
  progress: number;
}

export function PipelineDisplay({
  currentNode,
  progress,
}: PipelineDisplayProps) {
  const currentIndex = PIPELINE_NODES.findIndex((n) => n.id === currentNode);

  return (
    <div className="editorial-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-500">
          Pipeline
        </h3>
        <span className="text-xs font-mono text-teal">
          {Math.round(progress * 100)}%
        </span>
      </div>

      <div className="space-y-0">
        {PIPELINE_NODES.map((node, index) => {
          const isDone = index < currentIndex;
          const isActive = node.id === currentNode;
          const Icon = node.icon;

          return (
            <div
              key={node.id}
              className="relative flex items-start gap-3 pb-5 last:pb-0"
            >
              {/* Connector line */}
              {index < PIPELINE_NODES.length - 1 && (
                <div
                  className="absolute left-[14px] top-[32px] h-[calc(100%-20px)] w-px transition-colors"
                  style={{
                    background: isDone ? node.color : "#E7E5E4",
                  }}
                />
              )}

              {/* Node */}
              <div className="relative z-10">
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  className={`flex h-[30px] w-[30px] items-center justify-center rounded-lg transition-all ${
                    isDone
                      ? "bg-teal/10"
                      : isActive
                      ? "ring-2 ring-offset-2 ring-offset-white"
                      : "bg-stone-100"
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: `${node.color}15`,
                        }
                      : {}
                  }
                >
                  {isDone ? (
                    <Check className="h-3.5 w-3.5 text-teal" />
                  ) : (
                    <Icon
                      className="h-3.5 w-3.5"
                      style={{
                        color: isActive ? node.color : "#D6D3D1",
                      }}
                    />
                  )}
                </motion.div>

                {isActive && (
                  <motion.div
                    animate={{
                      scale: [1, 1.5],
                      opacity: [0.15, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                    className="absolute inset-0 rounded-lg"
                    style={{ backgroundColor: `${node.color}20` }}
                  />
                )}
              </div>

              {/* Label */}
              <div className="pt-1.5">
                <span
                  className={`text-sm transition-colors ${
                    isActive
                      ? "font-semibold"
                      : isDone
                      ? "text-stone-500"
                      : "text-stone-300"
                  }`}
                  style={isActive ? { color: node.color } : {}}
                >
                  {node.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-5 h-[3px] overflow-hidden rounded-full bg-stone-100">
        <motion.div
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-teal to-teal-light"
        />
      </div>
    </div>
  );
}
