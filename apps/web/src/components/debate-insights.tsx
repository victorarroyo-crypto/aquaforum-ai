"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { MessageSquare, AlertTriangle, Users, TrendingUp, FileText, ChevronRight } from "lucide-react";
import type { ForumMessage } from "@/lib/api";

interface DebateInsightsProps {
  messages: ForumMessage[];
  allMessages: ForumMessage[];
  panelists: { name: string; role: string; color: string }[];
  status: string;
  currentRound: number;
}

export function DebateInsights({ messages, allMessages, panelists, status, currentRound }: DebateInsightsProps) {
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

  const keyQuotes = useMemo(() => {
    return messages
      .filter((m) => m.message_type === "statement" || m.message_type === "challenge")
      .slice(-6)
      .map((m) => {
        const clean = m.content
          .replace(/\*\*([^*]+)\*\*/g, "$1")
          .replace(/\[CHALLENGE:[^\]]+\]\s*/g, "")
          .replace(/^(DECLARACIÓN|APOYO|INTERPELACIÓN|RESPUESTA)\s*/im, "")
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
          <p className="text-[13px] text-[#3F3F46]">Los insights apareceran cuando inicie el debate</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 overflow-y-auto">
      {/* Live stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: MessageSquare, label: "Turnos", value: discussionMessages.length, color: "#14B8A6" },
          { icon: AlertTriangle, label: "Retos", value: stats.totalChallenges, color: "#F59E0B" },
          { icon: Users, label: "Ronda", value: currentRound, color: "#8B5CF6" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-[#131316] border border-[rgba(255,255,255,0.06)] p-3 text-center hover:border-[rgba(255,255,255,0.1)] transition-colors">
            <s.icon className="h-3.5 w-3.5 mx-auto mb-1.5" style={{ color: s.color }} />
            <motion.div
              key={s.value}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="text-[22px] font-bold text-[#FAFAFA]"
            >
              {s.value}
            </motion.div>
            <div className="text-[10px] text-[#3F3F46] uppercase tracking-wider mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Participation bars */}
      <div className="rounded-xl bg-[#131316] border border-[rgba(255,255,255,0.06)] p-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B] mb-4">
          Participacion
        </h3>
        <div className="space-y-3">
          {panelists.map((p) => {
            const count = stats.participation[p.name] || 0;
            const pct = stats.maxParticipation > 0 ? (count / stats.maxParticipation) * 100 : 0;
            return (
              <div key={p.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] text-[#A1A1AA] truncate flex-1">
                    {p.name.startsWith("Dr.") ? p.name.split(" ").slice(0, 2).join(" ") : p.name.split(" ")[0]}
                  </span>
                  <span className="text-[13px] font-bold text-[#FAFAFA] ml-2 tabular-nums">{count}</span>
                </div>
                <div className="h-2 bg-[#1a1a1f] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${p.color}90, ${p.color})`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tension map */}
      {stats.challenges.length > 0 && (
        <div className="rounded-xl bg-[#131316] border border-[rgba(255,255,255,0.06)] p-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B] mb-3">
            Interpelaciones
          </h3>
          <div className="space-y-2">
            {stats.challenges.map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 text-[12px] px-3 py-2 rounded-lg bg-[rgba(245,158,11,0.04)] border border-[rgba(245,158,11,0.08)]"
              >
                <span className="text-[#FAFAFA] font-semibold">{c.from.split(" ")[0]}</span>
                <div className="flex items-center gap-1 text-[#F59E0B]">
                  <div className="h-[1px] w-4 bg-[#F59E0B]/40" />
                  <ChevronRight className="h-3 w-3" />
                </div>
                <span className="text-[#A1A1AA]">{c.to.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key quotes */}
      {keyQuotes.length > 0 && (
        <div className="rounded-xl bg-[#131316] border border-[rgba(255,255,255,0.06)] p-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B] mb-3">
            Citas destacadas
          </h3>
          <div className="space-y-3">
            {keyQuotes.map((q, i) => (
              <div key={i} className="relative border-l-2 pl-3.5 py-1" style={{ borderColor: q.color }}>
                {/* Decorative quote mark */}
                <span
                  className="absolute -left-1 -top-2 text-[28px] font-serif leading-none opacity-15 select-none"
                  style={{ color: q.color }}
                >
                  &ldquo;
                </span>
                <p className="text-[13px] text-[#D4D4D8] leading-relaxed italic">
                  {q.quote}
                </p>
                <span className="text-[11px] text-[#3F3F46] mt-1 block">— {q.agent}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Round summaries */}
      {roundSummaries.length > 0 && (
        <div className="rounded-xl bg-[#131316] border border-[rgba(255,255,255,0.06)] p-4">
          <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#52525B] mb-3">
            <FileText className="h-3.5 w-3.5" />
            Resumenes por ronda
          </h3>
          <div className="space-y-2">
            {roundSummaries.map((rs) => (
              <details key={rs.round} className="group">
                <summary className="flex items-center justify-between cursor-pointer text-[13px] text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors py-2 rounded-lg px-2 hover:bg-[rgba(255,255,255,0.02)]">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-3.5 w-3.5 text-[#3F3F46] transition-transform group-open:rotate-90" />
                    <span className="font-semibold">Ronda {rs.round}</span>
                  </div>
                  <span className="text-[11px] text-[#3F3F46] group-open:hidden">
                    {rs.experts} analisis + sintesis
                  </span>
                </summary>
                <div className="mt-2 space-y-3 pl-3 ml-2 border-l-2 border-[rgba(255,255,255,0.06)]">
                  {rs.expertMessages.map((m, i) => {
                    const clean = m.content.replace(/\*\*/g, "").replace(/\n+/g, " ").trim();
                    const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
                    const highlight = sentences.slice(0, 3).join(" ").trim();
                    return (
                      <div key={i} className="text-[13px] text-[#A1A1AA] leading-relaxed">
                        <span className="text-[#14B8A6] font-semibold block mb-1 text-[12px]">{m.agent_name}</span>
                        <p>{highlight}</p>
                      </div>
                    );
                  })}
                  {rs.integration && (() => {
                    const clean = rs.integration.content.replace(/\*\*/g, "").replace(/\n+/g, " ").trim();
                    const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
                    const highlight = sentences.slice(0, 3).join(" ").trim();
                    return (
                      <div className="text-[13px] text-[#A1A1AA] leading-relaxed border-t border-[rgba(255,255,255,0.04)] pt-2 mt-1">
                        <span className="text-[#8B5CF6] font-semibold block mb-1 text-[12px]">Integrador</span>
                        <p>{highlight}</p>
                      </div>
                    );
                  })()}
                  {rs.summary && (
                    <div className="text-[13px] text-[#E4E4E7] leading-relaxed border-t border-[rgba(255,255,255,0.04)] pt-2 mt-1 bg-[rgba(20,184,166,0.04)] rounded-lg p-3">
                      <span className="text-[#14B8A6] font-semibold block mb-1 text-[12px]">Resumen del Moderador</span>
                      <p className="max-h-[300px] overflow-y-auto">{rs.summary.content.replace(/\*\*/g, "")}</p>
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* Status indicator */}
      <div className="rounded-xl bg-[#131316] border border-[rgba(255,255,255,0.06)] p-3 text-center">
        <div className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${
          status === "running" ? "text-[#22C55E]" : "text-[#3F3F46]"
        }`}>
          {status === "running" && <div className="h-1.5 w-1.5 rounded-full bg-[#22C55E] status-pulse" />}
          {status === "running" ? "Debate en curso" : status === "completed" ? "Debate finalizado" : "En pausa"}
        </div>
      </div>
    </div>
  );
}
