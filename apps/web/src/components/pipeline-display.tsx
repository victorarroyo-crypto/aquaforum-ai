"use client";

import {
  MessageSquare,
  AlertTriangle,
  Reply,
  BarChart3,
  Layers,
  CheckCircle2,
  Crown,
  Eye,
  FileText,
} from "lucide-react";

const pipelineNodes = [
  { id: "moderator_open", label: "Apertura", icon: Crown },
  { id: "agent_turn", label: "Debate", icon: MessageSquare },
  { id: "moderator_check", label: "Revisión", icon: Eye },
  { id: "statements", label: "Posiciones", icon: MessageSquare },
  { id: "challenges", label: "Interpelaciones", icon: AlertTriangle },
  { id: "responses", label: "Respuestas", icon: Reply },
  { id: "expert_analysis", label: "Análisis", icon: BarChart3 },
  { id: "integration", label: "Integración", icon: Layers },
  { id: "final_summary", label: "Resumen", icon: FileText },
];

interface PipelineDisplayProps {
  currentNode: string;
  progress: number;
}

export function PipelineDisplay({ currentNode, progress }: PipelineDisplayProps) {
  const currentIndex = pipelineNodes.findIndex((n) => n.id === currentNode);
  const normalizedProgress = progress > 1 ? progress : progress * 100;

  return (
    <div className="rounded-lg bg-[#18181B] border border-[rgba(255,255,255,0.06)] p-4">
      <h3 className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-4">
        Pipeline
      </h3>

      <div className="space-y-0.5">
        {pipelineNodes.map((node, index) => {
          const isDone = currentIndex >= 0 && index < currentIndex;
          const isCurrent = node.id === currentNode;
          const Icon = node.icon;

          return (
            <div key={node.id} className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                    isDone
                      ? "bg-[#22C55E] border-[#22C55E]"
                      : isCurrent
                        ? "border-[#14B8A6] bg-[rgba(20,184,166,0.1)] pulse-glow"
                        : "border-[#3F3F46] bg-transparent"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 size={14} className="text-white" />
                  ) : (
                    <Icon
                      size={13}
                      className={isCurrent ? "text-[#14B8A6]" : "text-[#52525B]"}
                    />
                  )}
                </div>
                {index < pipelineNodes.length - 1 && (
                  <div
                    className={`w-0.5 h-3 ${
                      isDone ? "bg-[#22C55E]" : "bg-[#27272A]"
                    }`}
                  />
                )}
              </div>

              <span
                className={`text-[13px] ${
                  isDone
                    ? "text-[#22C55E] font-medium"
                    : isCurrent
                      ? "text-[#14B8A6] font-semibold"
                      : "text-[#52525B]"
                }`}
              >
                {node.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-[#52525B]">Progreso</span>
          <span className="text-[11px] text-[#A1A1AA] font-mono">
            {Math.round(normalizedProgress)}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-[#27272A] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#14B8A6] rounded-full transition-all duration-500"
            style={{ width: `${normalizedProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
