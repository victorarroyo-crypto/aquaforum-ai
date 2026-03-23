"use client";

import { useEffect, useRef, useState } from "react";
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
  // All messages including expert analysis for sidebar
  const allMessages = messages;
  // Only show messages that audio player has revealed
  const discussionMessages = allDiscussion.slice(0, revealCount);

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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="h-1 w-16 bg-[#14B8A6] mx-auto mb-8" />
          <p className="text-[16px] text-[#52525B]">Conectando al foro...</p>
        </motion.div>
      </div>
    );
  }

  // Determine the NEXT speaker for typing indicator
  const lastMsg = messages[messages.length - 1];
  const nextAgentIndex = lastMsg
    ? ((config?.panelists.findIndex(p => p.name === lastMsg.agent_name) ?? -1) + 1) % (config?.panelists.length || 1)
    : 0;
  const typingAgent = config?.panelists[nextAgentIndex] || config?.panelists[0];

  return (
    <div className="flex h-screen flex-col bg-[#09090B]">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-[rgba(255,255,255,0.06)] bg-[#0C0C0F]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="p-1.5 text-[#3F3F46] hover:text-[#FAFAFA] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#FAFAFA]">
              AquaForum AI
            </h1>
            <p className="max-w-sm truncate text-[12px] text-[#52525B] mt-0.5">
              {topic}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Round badge */}
          <div className="flex items-center gap-1.5 border border-[rgba(255,255,255,0.06)] rounded-full px-3 py-1.5 bg-[#18181B]">
            <span className="text-[11px] text-[#52525B]">Ronda</span>
            <span className="text-[14px] font-bold text-[#14B8A6]">
              {currentRound}
            </span>
            <span className="text-[11px] text-[#3F3F46]">/ {maxRounds}</span>
          </div>

          {/* Status badge */}
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold ${
              status === "running"
                ? "text-[#22C55E] bg-[rgba(34,197,94,0.08)]"
                : status === "completed"
                  ? "text-[#A1A1AA] bg-[#18181B]"
                  : status === "error"
                    ? "text-[#EF4444] bg-[rgba(239,68,68,0.08)]"
                    : "text-[#F59E0B] bg-[rgba(245,158,11,0.08)]"
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
            className="hidden lg:flex p-1.5 text-[#3F3F46] hover:text-[#FAFAFA] transition-colors"
          >
            {sidebar ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRightOpen className="h-4 w-4" />
            )}
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Message area */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Agent bar */}
          {config && (
            <div className="flex flex-wrap gap-2 border-b border-[rgba(255,255,255,0.06)] px-5 py-2.5 bg-[#0C0C0F]">
              {config.panelists.map((p) => (
                <AgentBadge
                  key={p.name}
                  name={p.name}
                  role={p.role}
                  color={p.color}
                  isActive={status === "running"}
                />
              ))}
            </div>
          )}

          {/* Messages feed */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-3xl px-5 py-6">
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
                  />
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {status === "running" && messages.length > 0 && (
                <TypingIndicator
                  agentName={typingAgent?.name || "Agente"}
                  color={typingAgent?.color || "#14B8A6"}
                />
              )}

              {/* Empty state */}
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-32 text-center"
                >
                  <div className="h-1 w-16 bg-[#14B8A6] mx-auto mb-8" />
                  <p className="text-[28px] font-[800] text-[#27272A]">
                    El debate comenzará en breve
                  </p>
                  <p className="mt-4 text-[16px] text-[#3F3F46]">
                    Pulsa &quot;Siguiente Ronda&quot; para iniciar
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Audio Player — controls which messages are visible */}
          <AudioPlayer messages={allDiscussion} onRevealUpTo={setRevealCount} />

          {/* Controls */}
          <div className="flex items-center gap-3 px-5 py-3 border-t border-[rgba(255,255,255,0.06)] bg-[#0C0C0F]">
            {status !== "completed" && (
              <>
                <button
                  onClick={handleNextCycle}
                  disabled={loading || status === "running"}
                  className="group flex items-center gap-1.5 px-5 py-2.5 bg-[#14B8A6] text-white rounded-lg text-[13px] font-bold hover:bg-[#0D9488] disabled:opacity-30 transition-colors"
                >
                  <Play className="h-3.5 w-3.5" />
                  {currentRound < maxRounds ? "Siguiente Ronda" : "Ronda Final"}
                  <ChevronRight className="h-3 w-3 opacity-50 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={handlePause}
                  disabled={status !== "running"}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-[#52525B] text-[13px] hover:text-[#FAFAFA] disabled:opacity-30 transition-colors"
                >
                  <Pause className="h-3.5 w-3.5" /> Pausar
                </button>
              </>
            )}
            <button
              onClick={async () => { setLoading(true); try { await api.exportDocx(sessionId); } catch {} finally { setLoading(false); } }}
              disabled={loading || !messages.length}
              className="flex items-center gap-2 ml-auto px-5 py-2.5 bg-[#18181B] border border-[rgba(255,255,255,0.1)] text-[#FAFAFA] text-[13px] font-semibold rounded-lg hover:bg-[#27272A] hover:border-[#14B8A6] disabled:opacity-30 transition-colors"
            >
              <FileText className="h-4 w-4 text-[#14B8A6]" /> Generar Informe del Evento
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {sidebar && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="hidden lg:flex flex-col gap-4 overflow-y-auto overflow-x-hidden border-l border-[rgba(255,255,255,0.06)] p-4 bg-[#0C0C0F]"
            >
              <DebateInsights
                messages={discussionMessages}
                allMessages={allMessages}
                panelists={config?.panelists || []}
                status={status}
                currentRound={currentRound}
              />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
