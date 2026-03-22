"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "@/components/message-bubble";
import { PipelineDisplay } from "@/components/pipeline-display";
import { AnalysisPanel } from "@/components/analysis-panel";
import { AgentBadge } from "@/components/agent-badge";
import { useForumStore } from "@/store/forum-store";
import { useForumRealtime } from "@/hooks/use-forum-realtime";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Download,
  Pause,
  Play,
  Waves,
  Radio,
  ChevronRight,
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useForumRealtime(sessionId);

  useEffect(() => {
    async function load() {
      try {
        const state = await api.getState(sessionId);
        setMessages(state.messages);
        setStatus(state.status);
        setRound(state.current_round);
        if (state.config && !config) {
          setSession(sessionId, state.config);
        }
      } catch {
        // Session might not exist yet
      } finally {
        setInitialLoading(false);
      }
    }
    load();
  }, [sessionId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleNextCycle = async () => {
    setLoading(true);
    try {
      await api.nextCycle(sessionId);
    } catch (err) {
      console.error("Error starting next cycle:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    try {
      await api.stopForum(sessionId);
      setStatus("paused");
    } catch (err) {
      console.error("Error stopping forum:", err);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const result = await api.exportForum(sessionId);
      const blob = new Blob([result.content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aquaforum-${sessionId.slice(0, 8)}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting:", err);
    } finally {
      setLoading(false);
    }
  };

  const discussionMessages = messages.filter(
    (m) => !["analysis", "integration"].includes(m.message_type)
  );

  if (initialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative mx-auto mb-6 h-20 w-20">
            <div className="absolute inset-0 animate-ping rounded-full bg-ocean/20" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-ocean/20 to-violet/10 backdrop-blur-xl">
              <Waves className="h-10 w-10 text-ocean" />
            </div>
          </div>
          <p className="text-muted-foreground">Cargando foro...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* ─── Header ─── */}
      <header className="glass relative z-20 flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="h-8 w-8 rounded-lg p-0 hover:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-ocean to-violet/60">
              <Waves className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight">AquaForum AI</h1>
              <p className="max-w-sm truncate text-xs text-muted-foreground">{topic}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass-subtle flex items-center gap-2 rounded-full px-3 py-1.5">
            <span className="text-xs text-muted-foreground">Ronda</span>
            <span className="text-sm font-semibold text-ocean">
              {currentRound}/{maxRounds}
            </span>
          </div>

          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
              status === "running"
                ? "bg-emerald/10 text-emerald"
                : status === "completed"
                ? "bg-ocean/10 text-ocean"
                : status === "error"
                ? "bg-coral/10 text-coral"
                : "bg-amber/10 text-amber"
            }`}
          >
            {status === "running" && <Radio className="h-3 w-3 animate-pulse" />}
            {status === "running"
              ? "En curso"
              : status === "completed"
              ? "Completado"
              : status === "error"
              ? "Error"
              : "Pausado"}
          </div>
        </div>
      </header>

      {/* ─── Main content ─── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Messages column */}
        <div className="flex flex-1 flex-col">
          {/* Agent strip */}
          {config && (
            <div className="flex flex-wrap gap-2 border-b border-white/[0.04] bg-white/[0.01] px-5 py-2.5">
              {config.panelists.map((p) => (
                <AgentBadge key={p.name} name={p.name} role={p.role} color={p.color} />
              ))}
            </div>
          )}

          {/* Message feed */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5">
            <div className="mx-auto max-w-3xl space-y-4">
              <AnimatePresence mode="popLayout">
                {discussionMessages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    agentName={msg.agent_name}
                    agentRole={msg.agent_role}
                    content={msg.content}
                    messageType={msg.message_type}
                    color={(msg.metadata?.color as string) || "#06B6D4"}
                    timestamp={msg.created_at}
                  />
                ))}
              </AnimatePresence>

              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-24 text-center"
                >
                  <div className="relative mx-auto mb-6 h-24 w-24">
                    <div className="absolute inset-0 rounded-full bg-ocean/5 blur-2xl" />
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/[0.04]">
                      <Waves className="h-12 w-12 text-ocean/20" />
                    </div>
                  </div>
                  <p className="text-lg font-medium text-muted-foreground/60">
                    El debate comenzará en breve
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground/40">
                    Los panelistas se están preparando...
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* ─── Controls ─── */}
          <div className="glass flex items-center gap-3 px-5 py-3">
            {status !== "completed" && (
              <>
                <Button
                  onClick={handleNextCycle}
                  disabled={loading || status === "running"}
                  className="group rounded-xl bg-gradient-to-r from-ocean to-ocean-light px-5 text-deep shadow-md shadow-ocean/20 hover:shadow-lg hover:shadow-ocean/30 hover:brightness-110 transition-all disabled:opacity-40 disabled:shadow-none"
                >
                  <Play className="mr-1.5 h-4 w-4" />
                  {currentRound < maxRounds ? "Siguiente Ronda" : "Ronda Final"}
                  <ChevronRight className="ml-1 h-4 w-4 opacity-50 transition-transform group-hover:translate-x-0.5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleStop}
                  disabled={status !== "running"}
                  className="rounded-xl border-white/6 bg-white/[0.02] hover:bg-white/5"
                >
                  <Pause className="mr-1.5 h-4 w-4" />
                  Pausar
                </Button>
              </>
            )}
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={loading || messages.length === 0}
              className="ml-auto rounded-xl border-white/6 bg-white/[0.02] hover:bg-white/5"
            >
              <Download className="mr-1.5 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* ─── Sidebar ─── */}
        <aside className="hidden w-80 flex-col gap-4 overflow-y-auto border-l border-white/[0.04] bg-white/[0.01] p-4 lg:flex">
          <PipelineDisplay
            currentNode={pipeline.current_node}
            progress={pipeline.progress}
          />
          <AnalysisPanel messages={messages} />
        </aside>
      </div>
    </div>
  );
}
