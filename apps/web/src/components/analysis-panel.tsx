"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InsightCard } from "@/components/insight-card";
import { Microscope, Layers } from "lucide-react";
import type { ForumMessage } from "@/lib/api";

interface AnalysisPanelProps {
  messages: ForumMessage[];
}

const expertTypeMap: Record<string, "technical" | "economic" | "regulatory" | "environmental"> = {
  "viabilidad técnica": "technical",
  "impacto económico": "economic",
  "cumplimiento regulatorio": "regulatory",
  "sostenibilidad ambiental": "environmental",
};

export function AnalysisPanel({ messages }: AnalysisPanelProps) {
  const analyses = messages.filter((m) => m.message_type === "analysis");
  const integrations = messages.filter((m) => m.message_type === "integration");

  if (analyses.length === 0 && integrations.length === 0) {
    return (
      <div className="glass rounded-xl p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.02]">
          <Microscope className="h-5 w-5 text-muted-foreground/20" />
        </div>
        <p className="text-xs text-muted-foreground/35 leading-relaxed">
          Los análisis expertos aparecerán aquí al finalizar cada ronda de debate.
        </p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-4">
      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="w-full rounded-lg bg-white/[0.02] p-0.5 h-8">
          <TabsTrigger
            value="analysis"
            className="flex-1 gap-1.5 rounded-md text-[11px] h-7 data-[state=active]:bg-white/[0.04] data-[state=active]:text-foreground"
          >
            <Microscope className="h-3 w-3" />
            Análisis
          </TabsTrigger>
          <TabsTrigger
            value="integration"
            className="flex-1 gap-1.5 rounded-md text-[11px] h-7 data-[state=active]:bg-white/[0.04] data-[state=active]:text-foreground"
          >
            <Layers className="h-3 w-3" />
            Integración
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="mt-3 space-y-3">
          {analyses.map((a) => (
            <InsightCard
              key={a.id}
              title={a.agent_name}
              content={a.content}
              type={expertTypeMap[(a.metadata?.expert_type as string) || ""] || "technical"}
            />
          ))}
        </TabsContent>

        <TabsContent value="integration" className="mt-3 space-y-3">
          {integrations.map((i) => (
            <InsightCard
              key={i.id}
              title={`Integración — Ronda ${i.round_number}`}
              content={i.content}
              type="technical"
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
