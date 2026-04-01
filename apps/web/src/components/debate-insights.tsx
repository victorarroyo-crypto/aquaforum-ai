"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { MessageSquare, AlertTriangle, Users, TrendingUp, ChevronRight } from "lucide-react";
import type { ForumMessage } from "@/lib/api";

interface DebateInsightsProps {
  messages: ForumMessage[];
  allMessages: ForumMessage[];
  panelists: { name: string; role: string; color: string }[];
  status: string;
  currentRound: number;
}

export function DebateInsights({ messages, allMessages, panelists, status, currentRound }: DebateInsightsProps) {
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

      {/* Status indicator */}
      <div className="rounded-xl bg-[#131316] border border-[rgba(255,255,255,0.06)] p-2.5 text-center">
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
