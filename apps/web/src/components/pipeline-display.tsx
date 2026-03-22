"use client";

import { motion } from "framer-motion";
import { Check, Crown, MessageCircle, Eye, Microscope, Layers, FileText } from "lucide-react";

const NODES = [
  { id: "moderator_open", label: "Apertura", icon: Crown },
  { id: "agent_turn", label: "Debate", icon: MessageCircle },
  { id: "moderator_check", label: "Revisión", icon: Eye },
  { id: "expert_analysis", label: "Análisis", icon: Microscope },
  { id: "integration", label: "Integración", icon: Layers },
  { id: "final_summary", label: "Resumen", icon: FileText },
];

export function PipelineDisplay({ currentNode, progress }: { currentNode: string; progress: number }) {
  const ci = NODES.findIndex((n) => n.id === currentNode);
  return (
    <div className="border border-edge rounded p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-light">Pipeline</h3>
        <span className="text-[11px] font-mono font-bold text-accent">{Math.round(progress * 100)}%</span>
      </div>
      {NODES.map((node, i) => {
        const done = i < ci, active = node.id === currentNode;
        const Icon = node.icon;
        return (
          <div key={node.id} className="relative flex items-start gap-3 pb-4 last:pb-0">
            {i < NODES.length - 1 && <div className="absolute left-[11px] top-[26px] h-[calc(100%-14px)] w-px" style={{ background: done ? "#0D9488" : "#E5E5E5" }} />}
            <motion.div animate={{ scale: active ? 1.15 : 1 }} className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full ${done ? "bg-accent/10" : active ? "bg-accent/10 ring-2 ring-accent/30 ring-offset-2" : "bg-surface border border-edge"}`}>
              {done ? <Check className="h-3 w-3 text-accent" /> : <Icon className={`h-3 w-3 ${active ? "text-accent" : "text-faint"}`} />}
            </motion.div>
            <span className={`text-xs pt-0.5 ${active ? "font-bold text-accent" : done ? "text-mid" : "text-faint"}`}>{node.label}</span>
          </div>
        );
      })}
      <div className="mt-4 h-[2px] bg-surface rounded-full overflow-hidden">
        <motion.div animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.6 }} className="h-full bg-accent rounded-full" />
      </div>
    </div>
  );
}
