"use client";

import { motion } from "framer-motion";
import { Check, Crown, MessageCircle, Eye, Microscope, Layers, FileText } from "lucide-react";

const PIPELINE_NODES = [
  { id: "moderator_open", label: "Apertura", icon: Crown },
  { id: "agent_turn", label: "Debate", icon: MessageCircle },
  { id: "moderator_check", label: "Revisión", icon: Eye },
  { id: "expert_analysis", label: "Análisis", icon: Microscope },
  { id: "integration", label: "Integración", icon: Layers },
  { id: "final_summary", label: "Resumen", icon: FileText },
];

interface PipelineDisplayProps { currentNode: string; progress: number; }

export function PipelineDisplay({ currentNode, progress }: PipelineDisplayProps) {
  const ci = PIPELINE_NODES.findIndex((n) => n.id === currentNode);

  return (
    <div className="border border-rule rounded p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="section-kicker text-ink-faint">Pipeline</h3>
        <span className="text-[11px] font-mono font-bold text-teal">{Math.round(progress * 100)}%</span>
      </div>
      <div className="space-y-0">
        {PIPELINE_NODES.map((node, i) => {
          const done = i < ci;
          const active = node.id === currentNode;
          const Icon = node.icon;
          return (
            <div key={node.id} className="relative flex items-start gap-3 pb-4 last:pb-0">
              {i < PIPELINE_NODES.length - 1 && (
                <div className="absolute left-[11px] top-[26px] h-[calc(100%-14px)] w-px" style={{ background: done ? "#0D9488" : "#E5E5E5" }} />
              )}
              <div className="relative z-10">
                <motion.div
                  animate={{ scale: active ? 1.15 : 1 }}
                  className={`flex h-[24px] w-[24px] items-center justify-center rounded-full ${
                    done ? "bg-teal/10" : active ? "bg-teal/10 ring-2 ring-teal/30 ring-offset-2 ring-offset-paper" : "bg-paper-warm border border-rule"
                  }`}
                >
                  {done ? <Check className="h-3 w-3 text-teal" /> : <Icon className={`h-3 w-3 ${active ? "text-teal" : "text-ink-ghost"}`} />}
                </motion.div>
              </div>
              <span className={`text-xs pt-0.5 ${active ? "font-bold text-teal" : done ? "text-ink-muted" : "text-ink-ghost"}`}>
                {node.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 h-[2px] bg-rule-light rounded-full overflow-hidden">
        <motion.div animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.6 }} className="h-full bg-teal rounded-full" />
      </div>
    </div>
  );
}
