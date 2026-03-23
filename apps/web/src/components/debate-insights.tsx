"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { MessageSquare, AlertTriangle, Users, TrendingUp } from "lucide-react";
import type { ForumMessage } from "@/lib/api";

interface DebateInsightsProps {
  messages: ForumMessage[];
  allMessages: ForumMessage[];
  panelists: { name: string; role: string; color: string }[];
  status: string;
  currentRound: number;
}

export function DebateInsights({ messages, allMessages, panelists, status, currentRound }: DebateInsightsProps) {
  // Build round summaries from expert analysis, integration, and round_summary messages
  const roundSummaries = useMemo(() => {
    const rounds: Record<number, {
      round: number;
      experts: number;
      expertMessages: ForumMessage[];
      integration: ForumMessage | null;
      summary: ForumMessage | null;
    }> = {};

    for (const m of allMessages) {
      const r = m.round_number;
      if (!rounds[r]) {
        rounds[r] = { round: r, experts: 0, expertMessages: [], integration: null, summary: null };
      }
      if (m.message_type === "analysis") {
        rounds[r].experts++;
        rounds[r].expertMessages.push(m);
      }
      if (m.message_type === "integration") {
        rounds[r].integration = m;
      }
      if (m.message_type === "round_summary") {
        rounds[r].summary = m;
      }
    }

    return Object.values(rounds)
      .filter((r) => r.experts > 0 || r.integration || r.summary)
      .sort((a, b) => a.round - b.round);
  }, [allMessages]);
  const stats = useMemo(() => {
    const participation: Record<string, number> = {};
    const challenges: { from: string; to: string }[] = [];
    let totalStatements = 0;
    let totalChallenges = 0;

    for (const m of messages) {
      if (m.message_type === "moderation" || m.message_type === "summary") continue;
      if (m.message_type === "analysis" || m.message_type === "integration") continue;

      participation[m.agent_name] = (participation[m.agent_name] || 0) + 1;

      if (m.message_type === "statement") totalStatements++;
      if (m.message_type === "challenge") {
        totalChallenges++;
        // Try to find who was challenged from content
        const match = m.content.match(/\[CHALLENGE:([^\]]+)\]/i) ||
                      m.content.match(/interpelación a (\w+ \w+)/i) ||
                      m.content.match(/a (\w+):/i);
        if (match) {
          challenges.push({ from: m.agent_name, to: match[1].trim() });
        }
      }
    }

    const maxParticipation = Math.max(...Object.values(participation), 1);

    return { participation, challenges, totalStatements, totalChallenges, maxParticipation };
  }, [messages]);

  // Extract key quotes (first sentence of statements, max 3)
  const keyQuotes = useMemo(() => {
    return messages
      .filter((m) => m.message_type === "statement" || m.message_type === "challenge")
      .slice(-6)
      .map((m) => {
        // Get first meaningful sentence
        const clean = m.content
          .replace(/\*\*([^*]+)\*\*/g, "$1")
          .replace(/\[CHALLENGE:[^\]]+\]/g, "")
          .replace(/^(DECLARACIÓN|APOYO)\s*/i, "")
          .trim();
        const firstSentence = clean.split(/[.!?]/)[0]?.trim();
        return {
          agent: m.agent_name,
          color: (m.metadata?.color as string) || "#52525B",
          quote: firstSentence ? firstSentence.slice(0, 120) : clean.slice(0, 120),
          type: m.message_type,
        };
      })
      .filter((q) => q.quote.length > 20)
      .slice(-3);
  }, [messages]);

  const discussionMessages = messages.filter(
    (m) => !["moderation", "summary", "analysis", "integration"].includes(m.message_type)
  );

  if (discussionMessages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <TrendingUp className="h-6 w-6 text-[#27272A] mx-auto mb-3" />
          <p className="text-[13px] text-[#3F3F46]">Los insights aparecerán cuando inicie el debate</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto">
      {/* Live stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: MessageSquare, label: "Turnos", value: discussionMessages.length, color: "#14B8A6" },
          { icon: AlertTriangle, label: "Retos", value: stats.totalChallenges, color: "#F59E0B" },
          { icon: Users, label: "Ronda", value: currentRound, color: "#8B5CF6" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg bg-[#18181B] border border-[rgba(255,255,255,0.06)] p-3 text-center">
            <s.icon className="h-3.5 w-3.5 mx-auto mb-1.5" style={{ color: s.color }} />
            <div className="text-[20px] font-bold text-[#FAFAFA]">{s.value}</div>
            <div className="text-[10px] text-[#52525B] uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Participation bars */}
      <div className="rounded-lg bg-[#18181B] border border-[rgba(255,255,255,0.06)] p-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#71717A] mb-4">
          Participación
        </h3>
        <div className="space-y-3">
          {panelists.map((p) => {
            const count = stats.participation[p.name] || 0;
            const pct = stats.maxParticipation > 0 ? (count / stats.maxParticipation) * 100 : 0;
            return (
              <div key={p.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] text-[#A1A1AA] truncate flex-1">{p.name.split(" ")[0]}</span>
                  <span className="text-[12px] font-bold text-[#FAFAFA] ml-2">{count}</span>
                </div>
                <div className="h-1.5 bg-[#27272A] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tension map */}
      {stats.challenges.length > 0 && (
        <div className="rounded-lg bg-[#18181B] border border-[rgba(255,255,255,0.06)] p-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#71717A] mb-3">
            Interpelaciones
          </h3>
          <div className="space-y-2">
            {stats.challenges.map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-[12px]">
                <span className="text-[#FAFAFA] font-medium">{c.from.split(" ")[0]}</span>
                <span className="text-[#F59E0B]">→</span>
                <span className="text-[#A1A1AA]">{c.to.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key quotes */}
      {keyQuotes.length > 0 && (
        <div className="rounded-lg bg-[#18181B] border border-[rgba(255,255,255,0.06)] p-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#71717A] mb-3">
            Citas destacadas
          </h3>
          <div className="space-y-3">
            {keyQuotes.map((q, i) => (
              <div key={i} className="border-l-2 pl-3 py-1" style={{ borderColor: q.color }}>
                <p className="text-[12px] text-[#D4D4D8] leading-relaxed italic">
                  &ldquo;{q.quote}&rdquo;
                </p>
                <span className="text-[10px] text-[#52525B] mt-1 block">— {q.agent}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Round summaries — from moderator + experts + integrator */}
      {roundSummaries.length > 0 && (
        <div className="rounded-lg bg-[#18181B] border border-[rgba(255,255,255,0.06)] p-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#71717A] mb-3">
            📋 Resúmenes por ronda
          </h3>
          <div className="space-y-2">
            {roundSummaries.map((rs) => (
              <details key={rs.round} className="group">
                <summary className="flex items-center justify-between cursor-pointer text-[13px] text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors py-1.5">
                  <span className="font-medium">Ronda {rs.round}</span>
                  <span className="text-[10px] text-[#52525B] group-open:hidden">
                    {rs.experts} análisis + síntesis
                  </span>
                </summary>
                <div className="mt-2 space-y-2 pl-2 border-l border-[rgba(255,255,255,0.06)]">
                  {rs.expertMessages.map((m, i) => (
                    <div key={i} className="text-[11px] text-[#71717A] leading-relaxed">
                      <span className="text-[#14B8A6] font-medium block mb-0.5">{m.agent_name}</span>
                      <p className="line-clamp-3">{m.content.replace(/\*\*/g, "").slice(0, 200)}...</p>
                    </div>
                  ))}
                  {rs.integration && (
                    <div className="text-[11px] text-[#71717A] leading-relaxed border-t border-[rgba(255,255,255,0.04)] pt-2">
                      <span className="text-[#8B5CF6] font-medium block mb-0.5">Integrador</span>
                      <p className="line-clamp-4">{rs.integration.content.replace(/\*\*/g, "").slice(0, 300)}...</p>
                    </div>
                  )}
                  {rs.summary && (
                    <div className="text-[11px] text-[#D4D4D8] leading-relaxed border-t border-[rgba(255,255,255,0.04)] pt-2 bg-[rgba(20,184,166,0.05)] rounded p-2">
                      <span className="text-[#14B8A6] font-medium block mb-0.5">Resumen del Moderador</span>
                      <p className="line-clamp-6">{rs.summary.content.replace(/\*\*/g, "").slice(0, 400)}...</p>
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* Status indicator */}
      <div className="rounded-lg bg-[#18181B] border border-[rgba(255,255,255,0.06)] p-3 text-center">
        <div className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${
          status === "running" ? "text-[#22C55E]" : "text-[#52525B]"
        }`}>
          {status === "running" && <div className="h-1.5 w-1.5 rounded-full bg-[#22C55E] status-pulse" />}
          {status === "running" ? "Debate en curso" : status === "completed" ? "Debate finalizado" : "En pausa"}
        </div>
      </div>
    </div>
  );
}
