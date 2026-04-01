"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MessageBubble } from "@/components/message-bubble";
import { AgentBadge } from "@/components/agent-badge";
import { DebateInsights } from "@/components/debate-insights";
import { TypingIndicator } from "@/components/typing-indicator";
import { AudioPlayer } from "@/components/audio-player";
import { useForumStore } from "@/store/forum-store";
import { useForumRealtime } from "@/hooks/use-forum-realtime";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Download,
  FileText,
  Pause,
  Play,
  Radio,
  ChevronRight,
  PanelRightOpen,
  PanelRightClose,
  MessageSquare,
} from "lucide-react";

export default function ForumView() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const {
    messages,
    pipeline,
    status,
    topic,
    currentRound,
    maxRounds,
    config,
    setSession,
    setMessages,
    setStatus,
    setRound,
  } = useForumStore();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [sidebar, setSidebar] = useState(true);
  const [revealCount, setRevealCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useForumRealtime(sessionId);

  useEffect(() => {
    (async () => {
      try {
        const s = await api.getState(sessionId);
        setMessages(s.messages);
        setStatus(s.status);
        setRound(s.current_round);
        if (s.config && !config) setSession(sessionId, s.config);
      } catch {
        /* ignore */
      } finally {
        setInitialLoading(false);
      }
    })();
  }, [sessionId]);

  // Poll for new messages every 3s as fallback for Realtime
  useEffect(() => {
    if (!sessionId) return;
    const interval = setInterval(async () => {
      try {
        const s = await api.getState(sessionId);
        if (s.messages.length > messages.length) {
          setMessages(s.messages);
        }
        if (s.status !== status) setStatus(s.status);
        if (s.current_round !== currentRound) setRound(s.current_round);
      } catch { /* ignore */ }
    }, 3000);
    return () => clearInterval(interval);
  }, [sessionId, messages.length, status, currentRound]);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length]);

  const allDiscussion = messages.filter(
    (m) => !["analysis", "integration"].includes(m.message_type)
  );
  const allMessages = messages;
  const discussionMessages = allDiscussion;

  // Determine last speaker for agent bar highlight
  const lastSpeaker = useMemo(() => {
    const discussion = messages.filter(
      (m) => !["moderation", "summary", "analysis", "integration", "round_summary"].includes(m.message_type)
    );
    return discussion.length > 0 ? discussion[discussion.length - 1].agent_name : null;
  }, [messages]);

  // Count discussion interventions
  const interventionCount = useMemo(() => {
    return messages.filter(
      (m) => !["moderation", "summary", "analysis", "integration"].includes(m.message_type)
    ).length;
  }, [messages]);

  const handleNextCycle = async () => {
    setLoading(true);
    try {
      await api.nextCycle(sessionId);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    try {
      await api.stopForum(sessionId);
      setStatus("paused");
    } catch {
      /* ignore */
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const r = await api.exportForum(sessionId);
      const b = new Blob([r.content], { type: "text/markdown" });
      const u = URL.createObjectURL(b);
      const a = document.createElement("a");
      a.href = u;
      a.download = `aquaforum-${sessionId.slice(0, 8)}.md`;
      a.click();
      URL.revokeObjectURL(u);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (initialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090B]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="h-1 w-16 bg-gradient-to-r from-[#14B8A6] to-[#8B5CF6] mx-auto mb-8 rounded-full" />
          <p className="text-[16px] text-[#52525B]">Conectando al foro...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#09090B]">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="relative sticky top-0 z-50 glass border-b border-transparent">
        {/* Ambient glow */}
        {status === "running" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-1/4 w-64 h-16 bg-[rgba(20,184,166,0.06)] blur-3xl ambient-glow" />
          </div>
        )}

        <div className="flex items-center justify-between px-5 py-3 relative">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="p-1.5 text-[#3F3F46] hover:text-[#FAFAFA] transition-colors rounded-lg hover:bg-[rgba(255,255,255,0.04)]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#52525B]">
                AquaForum AI
              </h1>
              <p className="max-w-md text-[16px] font-semibold text-[#FAFAFA] mt-0.5 truncate">
                {topic}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Round dots indicator */}
            <div className="flex items-center gap-2 border border-[rgba(255,255,255,0.06)] rounded-full px-4 py-2 bg-[rgba(24,24,27,0.6)]">
              <span className="text-[11px] text-[#52525B] mr-1">Ronda</span>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: maxRounds || 4 }, (_, i) => {
                  const roundNum = i + 1;
                  const isCurrent = roundNum === currentRound;
                  const isPast = roundNum < currentRound;
                  return (
                    <div
                      key={i}
                      className={`rounded-full transition-all duration-300 ${
                        isCurrent
                          ? "w-2.5 h-2.5 bg-[#14B8A6] dot-active"
                          : isPast
                            ? "w-2 h-2 bg-[#14B8A6]"
                            : "w-2 h-2 bg-[#27272A]"
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Status badge */}
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all ${
                status === "running"
                  ? "text-[#22C55E] bg-[rgba(34,197,94,0.1)] shadow-[0_0_12px_rgba(34,197,94,0.1)]"
                  : status === "completed"
                    ? "text-[#A1A1AA] bg-[#18181B]"
                    : status === "error"
                      ? "text-[#EF4444] bg-[rgba(239,68,68,0.1)]"
                      : "text-[#F59E0B] bg-[rgba(245,158,11,0.1)]"
              }`}
            >
              {status === "running" && (
                <Radio className="h-3 w-3 status-pulse" />
              )}
              {status === "running"
                ? "En curso"
                : status === "completed"
                  ? "Completado"
                  : status === "error"
                    ? "Error"
                    : "Pausado"}
            </div>

            {/* Sidebar toggle */}
            <button
              onClick={() => setSidebar(!sidebar)}
              className="hidden lg:flex p-2 text-[#3F3F46] hover:text-[#FAFAFA] transition-colors rounded-lg hover:bg-[rgba(255,255,255,0.04)]"
            >
              {sidebar ? (
                <PanelRightClose className="h-4 w-4" />
              ) : (
                <PanelRightOpen className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Gradient bottom border */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#14B8A6]/30 to-transparent" />
      </header>

      {/* ── Main content ───────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Message area */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Agent bar */}
          {config && (
            <div className="glass-subtle border-b border-transparent">
              <div className="flex flex-wrap gap-2 px-5 py-2.5">
                {config.panelists.map((p) => (
                  <AgentBadge
                    key={p.name}
                    name={p.name}
                    role={p.role}
                    color={p.color}
                    isActive={status === "running"}
                    isSpeaking={status === "running" && lastSpeaker === p.name}
                    avatarUrl={p.avatar_url}
                  />
                ))}
              </div>
              <div className="h-[1px] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.06)] to-transparent" />
            </div>
          )}

          {/* Messages feed */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-4xl px-5 py-6 timeline-feed">
              <AnimatePresence mode="popLayout">
                {discussionMessages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    color={
                      (msg.metadata?.color as string) ||
                      config?.panelists.find((p) => p.name === msg.agent_name)
                        ?.color ||
                      "#52525B"
                    }
                    avatarUrl={
                      config?.panelists.find((p) => p.name === msg.agent_name)
                        ?.avatar_url
                    }
                  />
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              <AnimatePresence>
                {status === "running" && messages.length > 0 && (
                  <TypingIndicator />
                )}
              </AnimatePresence>

              {/* Empty state */}
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-32 text-center"
                >
                  <div className="h-1 w-16 bg-gradient-to-r from-[#14B8A6] to-[#8B5CF6] mx-auto mb-8 rounded-full" />
                  <p className="text-[28px] font-[800] text-[#27272A]">
                    El debate comenzara en breve
                  </p>
                  <p className="mt-4 text-[16px] text-[#3F3F46]">
                    Pulsa &quot;Siguiente Ronda&quot; para iniciar
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* ── Controls ─────────────────────────────────── */}
          <div className="relative glass border-t border-transparent">
            {/* Gradient top border */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.08)] to-transparent" />

            <div className="flex items-center gap-3 px-5 py-3">
              {status !== "completed" && (
                <>
                  <motion.button
                    onClick={handleNextCycle}
                    disabled={loading || status === "running"}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group flex items-center gap-1.5 px-5 py-2.5 bg-[#14B8A6] text-white rounded-lg text-[13px] font-bold hover:bg-[#0D9488] disabled:opacity-30 transition-all shadow-[0_0_20px_rgba(20,184,166,0.2)] hover:shadow-[0_0_30px_rgba(20,184,166,0.35)]"
                  >
                    <Play className="h-3.5 w-3.5" />
                    {status === "paused"
                      ? "Reanudar"
                      : currentRound < maxRounds
                        ? "Siguiente Ronda"
                        : "Ronda Final"}
                    <ChevronRight className="h-3 w-3 opacity-50 group-hover:translate-x-0.5 transition-transform" />
                  </motion.button>
                  <button
                    onClick={handlePause}
                    disabled={status !== "running"}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-[#52525B] text-[13px] hover:text-[#FAFAFA] disabled:opacity-30 transition-colors rounded-lg hover:bg-[rgba(255,255,255,0.04)]"
                  >
                    <Pause className="h-3.5 w-3.5" /> Pausar
                  </button>
                </>
              )}

              {/* Intervention counter */}
              {interventionCount > 0 && (
                <div className="flex items-center gap-1.5 text-[12px] text-[#3F3F46] ml-2">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{interventionCount} intervenciones</span>
                </div>
              )}

              <motion.button
                onClick={async () => { setLoading(true); try { await api.exportDocx(sessionId); } catch {} finally { setLoading(false); } }}
                disabled={loading || !messages.length}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 ml-auto px-5 py-2.5 bg-[#131316] border border-[rgba(255,255,255,0.08)] text-[#FAFAFA] text-[13px] font-semibold rounded-lg hover:bg-[#1a1a1f] hover:border-[#14B8A6]/40 disabled:opacity-30 transition-all"
              >
                <FileText className="h-4 w-4 text-[#14B8A6]" /> Generar Informe del Evento
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── Sidebar ──────────────────────────────────── */}
        <AnimatePresence>
          {sidebar && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="hidden lg:flex flex-col overflow-y-auto overflow-x-hidden border-l border-[rgba(255,255,255,0.04)] bg-[#0A0A0D]"
            >
              {/* Speaker spotlight */}
              {(() => {
                const speaker = config?.panelists.find((p) => p.name === lastSpeaker);
                if (!speaker) return null;
                return (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={speaker.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="relative shrink-0"
                    >
                      {speaker.avatar_url ? (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={speaker.avatar_url}
                            alt={speaker.name}
                            className="w-full h-full object-cover object-top"
                          />
                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0D] via-transparent to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <p className="text-[15px] font-bold text-[#FAFAFA]">{speaker.name}</p>
                            <p className="text-[11px] text-[#A1A1AA]">{speaker.role}</p>
                          </div>
                          {/* Color accent line */}
                          <div
                            className="absolute bottom-0 left-0 right-0 h-[2px]"
                            style={{ backgroundColor: speaker.color }}
                          />
                        </div>
                      ) : (
                        <div className="p-4 flex items-center gap-3 border-b border-[rgba(255,255,255,0.06)]">
                          <div
                            className="w-14 h-14 rounded-full flex items-center justify-center text-[18px] font-bold text-white shrink-0"
                            style={{ backgroundColor: speaker.color }}
                          >
                            {speaker.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-[15px] font-bold text-[#FAFAFA]">{speaker.name}</p>
                            <p className="text-[11px] text-[#A1A1AA]">{speaker.role}</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                );
              })()}

              <div className="p-3 flex-1 overflow-y-auto">
                <DebateInsights
                  messages={discussionMessages}
                  allMessages={allMessages}
                  panelists={config?.panelists || []}
                  status={status}
                  currentRound={currentRound}
                />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
