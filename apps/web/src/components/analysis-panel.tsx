"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InsightCard } from "@/components/insight-card";
import { Microscope, Layers } from "lucide-react";
import type { ForumMessage } from "@/lib/api";

interface AnalysisPanelProps {
  messages: ForumMessage[];
}

const expertTypeMap: Record<
  string,
  "technical" | "economic" | "regulatory" | "environmental"
> = {
  "viabilidad t\u00e9cnica": "technical",
  "impacto econ\u00f3mico": "economic",
  "cumplimiento regulatorio": "regulatory",
  "sostenibilidad ambiental": "environmental",
};

export function AnalysisPanel({ messages }: AnalysisPanelProps) {
  const analyses = messages.filter((m) => m.message_type === "analysis");
  const integrations = messages.filter(
    (m) => m.message_type === "integration"
  );

  if (analyses.length === 0 && integrations.length === 0) {
    return (
      <div className="editorial-card rounded-xl p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100">
          <Microscope className="h-5 w-5 text-stone-400" />
        </div>
        <p className="text-xs text-stone-400 leading-relaxed">
          Los an\u00e1lisis expertos aparecer\u00e1n aqu\u00ed al finalizar cada ronda de
          debate.
        </p>
      </div>
    );
  }

  return (
    <div className="editorial-card rounded-xl p-4">
      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="w-full rounded-lg bg-stone-100 p-0.5 h-8">
          <TabsTrigger
            value="analysis"
            className="flex-1 gap-1.5 rounded-md text-[11px] h-7 data-[state=active]:bg-white data-[state=active]:text-stone-800 data-[state=active]:shadow-sm text-stone-500"
          >
            <Microscope className="h-3 w-3" />
            An\u00e1lisis
          </TabsTrigger>
          <TabsTrigger
            value="integration"
            className="flex-1 gap-1.5 rounded-md text-[11px] h-7 data-[state=active]:bg-white data-[state=active]:text-stone-800 data-[state=active]:shadow-sm text-stone-500"
          >
            <Layers className="h-3 w-3" />
            Integraci\u00f3n
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="mt-3 space-y-3">
          {analyses.map((a) => (
            <InsightCard
              key={a.id}
              title={a.agent_name}
              content={a.content}
              type={
                expertTypeMap[
                  (a.metadata?.expert_type as string) || ""
                ] || "technical"
              }
            />
          ))}
        </TabsContent>

        <TabsContent value="integration" className="mt-3 space-y-3">
          {integrations.map((intg) => (
            <InsightCard
              key={intg.id}
              title={`Integraci\u00f3n \u2014 Ronda ${intg.round_number}`}
              content={intg.content}
              type="technical"
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
