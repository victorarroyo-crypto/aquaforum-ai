"use client";

import { useState } from "react";
import { InsightCard } from "./insight-card";
import { Microscope } from "lucide-react";
import type { ForumMessage } from "@/lib/api";

const expertTypeMap: Record<string, string> = {
  "viabilidad técnica": "technical",
  "impacto económico": "economic",
  "cumplimiento regulatorio": "regulatory",
  "sostenibilidad ambiental": "environmental",
};

const tabs = [
  { id: "analysis", label: "Análisis" },
  { id: "integration", label: "Integración" },
];

interface AnalysisPanelProps {
  messages: ForumMessage[];
}

export function AnalysisPanel({ messages }: AnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState("analysis");

  const analyses = messages.filter((m) => m.message_type === "analysis");
  const integrations = messages.filter((m) => m.message_type === "integration");

  if (!analyses.length && !integrations.length) {
    return (
      <div className="rounded-lg bg-[#18181B] border border-[rgba(255,255,255,0.06)] p-6 text-center">
        <Microscope className="h-5 w-5 text-[#3F3F46] mx-auto mb-3" />
        <p className="text-[13px] text-[#52525B]">
          Análisis tras cada ronda.
        </p>
      </div>
    );
  }

  const items = activeTab === "analysis" ? analyses : integrations;

  return (
    <div className="rounded-lg bg-[#18181B] border border-[rgba(255,255,255,0.06)] overflow-hidden">
      <div className="flex border-b border-[rgba(255,255,255,0.06)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2.5 text-[13px] font-medium transition-colors ${
              activeTab === tab.id
                ? "text-[#FAFAFA] bg-[#27272A]"
                : "text-[#52525B] hover:text-[#A1A1AA] bg-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
        {items.length > 0 ? (
          items.map((msg) => (
            <InsightCard
              key={msg.id}
              type={
                activeTab === "analysis"
                  ? expertTypeMap[(msg.metadata?.expert_type as string) || ""] || "technical"
                  : "technical"
              }
              title={
                activeTab === "analysis"
                  ? msg.agent_name
                  : `Integración — Ronda ${msg.round_number}`
              }
              content={msg.content}
            />
          ))
        ) : (
          <div className="py-8 text-center">
            <p className="text-[13px] text-[#52525B]">Sin datos aún</p>
          </div>
        )}
      </div>
    </div>
  );
}
