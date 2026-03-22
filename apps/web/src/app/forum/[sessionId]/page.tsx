"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "@/components/message-bubble";
import { PipelineDisplay } from "@/components/pipeline-display";
import { AnalysisPanel } from "@/components/analysis-panel";
import { AgentBadge } from "@/components/agent-badge";
import { TypingIndicator } from "@/components/typing-indicator";
import { useForumStore } from "@/store/forum-store";
import { useForumRealtime } from "@/hooks/use-forum-realtime";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Download,
  Pause,
  Play,
  Droplets,
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
        // ok
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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    try {
      await api.stopForum(sessionId);
      setStatus("paused");
    } catch (e) {
      console.error(e);
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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const discussionMessages = messages.filter(
    (m) => !["analysis", "integration"].includes(m.message_type)
  );

  // Loading state
  if (initialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-white border border-stone-200 shadow-sm">
            <Droplets className="h-8 w-8 text-teal" />
          </div>
          <p className="text-sm text-stone-400">Conectando al foro...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-stone-50">
      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-4 py-3 border-b border-stone-200 bg-white">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="h-8 w-8 rounded-lg p-0 text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal/10">
            <Droplets className="h-4 w-4 text-teal" />
          </div>

          <div className="hidden sm:block">
            <h1 className="text-xs font-semibold text-stone-800">
              AquaForum AI
            </h1>
            <p className="max-w-xs truncate text-[11px] text-stone-400">
              {topic}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Round badge */}
          <div className="flex items-center gap-1.5 rounded-full bg-stone-100 border border-stone-200 px-3 py-1">
            <span className="text-[11px] text-stone-400">Ronda</span>
            <span className="text-sm font-bold text-teal">
              {currentRound}
            </span>
            <span className="text-[11px] text-stone-400">
              / {maxRounds}
            </span>
          </div>

          {/* Status */}
          <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              status === "running"
                ? "bg-teal-50 text-teal"
                : status === "completed"
                ? "bg-stone-100 text-stone-600"
                : status === "error"
                ? "bg-red-50 text-red-600"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {status === "running" && (
              <Radio className="h-2.5 w-2.5 animate-pulse" />
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex h-8 w-8 rounded-lg p-0 text-stone-400 hover:text-stone-700"
          >
            {sidebarOpen ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRightOpen className="h-4 w-4" />
            )}
          </Button>
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Messages column */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Agent bar */}
          {config && (
            <div className="flex flex-wrap gap-2 border-b border-stone-200 px-4 py-2.5 bg-white">
              {config.panelists.map((p) => (
                <AgentBadge
                  key={p.name}
                  name={p.name}
                  role={p.role}
                  color={p.color}
                  active={status === "running"}
                />
              ))}
            </div>
          )}

          {/* Feed */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
              <AnimatePresence mode="popLayout">
                {discussionMessages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    agentName={msg.agent_name}
                    agentRole={msg.agent_role}
                    content={msg.content}
                    messageType={msg.message_type}
                    color={
                      (msg.metadata?.color as string) || "#0F766E"
                    }
                    timestamp={msg.created_at}
                  />
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {status === "running" && messages.length > 0 && (
                <TypingIndicator
                  agentName={
                    config?.panelists[0]?.name || "Agente"
                  }
                  color={config?.panelists[0]?.color || "#0F766E"}
                />
              )}

              {/* Empty state */}
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-32 text-center"
                >
                  <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-white border border-stone-200">
                    <Droplets className="h-10 w-10 text-stone-300" />
                  </div>
                  <p className="text-lg font-editorial text-stone-400">
                    El debate comenzar\u00e1 en breve
                  </p>
                  <p className="mt-2 text-sm text-stone-400">
                    Haz clic en &quot;Siguiente Ronda&quot; para
                    iniciar
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 px-4 py-3 border-t border-stone-200 bg-white">
            {status !== "completed" && (
              <>
                <Button
                  onClick={handleNextCycle}
                  disabled={loading || status === "running"}
                  className="group btn-primary rounded-lg px-5 text-sm font-semibold disabled:opacity-30"
                >
                  <Play className="mr-1.5 h-3.5 w-3.5" />
                  {currentRound < maxRounds
                    ? "Siguiente Ronda"
                    : "Ronda Final"}
                  <ChevronRight className="ml-1 h-3.5 w-3.5 opacity-50 group-hover:translate-x-0.5 transition-transform" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleStop}
                  disabled={status !== "running"}
                  className="rounded-lg text-stone-400 hover:text-stone-700"
                >
                  <Pause className="mr-1.5 h-3.5 w-3.5" />
                  Pausar
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              onClick={handleExport}
              disabled={loading || messages.length === 0}
              className="ml-auto rounded-lg text-stone-400 hover:text-stone-700"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="hidden lg:flex flex-col gap-4 overflow-y-auto overflow-x-hidden border-l border-stone-200 bg-white p-4"
            >
              {/* Active panelists */}
              {config && (
                <div className="editorial-card rounded-xl p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-500 mb-3">
                    Panelistas
                  </h3>
                  <div className="space-y-2.5">
                    {config.panelists.map((p) => (
                      <div
                        key={p.name}
                        className="flex items-center gap-2.5"
                      >
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-bold text-white"
                          style={{
                            backgroundColor: p.color,
                          }}
                        >
                          {p.name
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium text-stone-700 block truncate">
                            {p.name}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {p.role}
                          </span>
                        </div>
                        {status === "running" && (
                          <div className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <PipelineDisplay
                currentNode={pipeline.current_node}
                progress={pipeline.progress}
              />
              <AnalysisPanel messages={messages} />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
