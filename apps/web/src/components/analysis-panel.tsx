"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InsightCard } from "@/components/insight-card";
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
      <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Los análisis aparecerán al finalizar cada ronda de debate.
        </p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="analysis" className="w-full">
      <TabsList className="w-full bg-white/5">
        <TabsTrigger value="analysis" className="flex-1 text-xs">
          Análisis Experto
        </TabsTrigger>
        <TabsTrigger value="integration" className="flex-1 text-xs">
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
  );
}
