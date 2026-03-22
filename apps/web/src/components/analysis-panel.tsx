"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InsightCard } from "@/components/insight-card";
import { Microscope, Layers } from "lucide-react";
import type { ForumMessage } from "@/lib/api";

const expertTypeMap: Record<string, "technical" | "economic" | "regulatory" | "environmental"> = {
  "viabilidad técnica": "technical", "impacto económico": "economic", "cumplimiento regulatorio": "regulatory", "sostenibilidad ambiental": "environmental",
};

export function AnalysisPanel({ messages }: { messages: ForumMessage[] }) {
  const analyses = messages.filter((m) => m.message_type === "analysis");
  const integrations = messages.filter((m) => m.message_type === "integration");

  if (!analyses.length && !integrations.length) {
    return (
      <div className="border border-edge rounded p-6 text-center">
        <Microscope className="h-5 w-5 text-faint mx-auto mb-3" />
        <p className="text-xs text-faint">Análisis tras cada ronda.</p>
      </div>
    );
  }

  return (
    <div className="border border-edge rounded p-4">
      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="w-full rounded bg-surface p-0.5 h-7">
          <TabsTrigger value="analysis" className="flex-1 gap-1 rounded text-[10px] h-6 font-bold text-light data-[state=active]:bg-white data-[state=active]:text-dark data-[state=active]:shadow-sm">
            <Microscope className="h-2.5 w-2.5" /> Análisis
          </TabsTrigger>
          <TabsTrigger value="integration" className="flex-1 gap-1 rounded text-[10px] h-6 font-bold text-light data-[state=active]:bg-white data-[state=active]:text-dark data-[state=active]:shadow-sm">
            <Layers className="h-2.5 w-2.5" /> Integración
          </TabsTrigger>
        </TabsList>
        <TabsContent value="analysis" className="mt-3 space-y-3">
          {analyses.map((a) => <InsightCard key={a.id} title={a.agent_name} content={a.content} type={expertTypeMap[(a.metadata?.expert_type as string) || ""] || "technical"} />)}
        </TabsContent>
        <TabsContent value="integration" className="mt-3 space-y-3">
          {integrations.map((m) => <InsightCard key={m.id} title={`Integración — Ronda ${m.round_number}`} content={m.content} type="technical" />)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
