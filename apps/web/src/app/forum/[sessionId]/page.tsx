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
  Waves,
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
    try { await api.nextCycle(sessionId); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleStop = async () => {
    try { await api.stopForum(sessionId); setStatus("paused"); }
    catch (e) { console.error(e); }
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
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const discussionMessages = messages.filter(
    (m) => !["analysis", "integration"].includes(m.message_type)
  );

  // ─── Loading state ───
  if (initialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="relative mx-auto mb-8 h-24 w-24">
            <motion.div animate={{ scale: [1, 1.3], opacity: [0.15, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute inset-0 rounded-2xl bg-ocean/20" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl glass">
              <Waves className="h-10 w-10 text-ocean/60" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground/50">Conectando al foro...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* ═══ Header ═══ */}
      <header className="glass-strong relative z-20 flex items-center justify-between px-4 py-2.5 border-b border-white/[0.03]">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="h-8 w-8 rounded-lg p-0 text-muted-foreground/40 hover:text-foreground hover:bg-white/[0.04]">
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-ocean/20 to-violet/10">
            <Waves className="h-4 w-4 text-ocean/70" />
          </div>

          <div className="hidden sm:block">
            <h1 className="text-xs font-semibold text-foreground/80">AquaForum AI</h1>
            <p className="max-w-xs truncate text-[11px] text-muted-foreground/30">{topic}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Round badge */}
          <div className="flex items-center gap-1.5 rounded-full bg-white/[0.02] border border-white/[0.04] px-3 py-1">
            <span className="text-[11px] text-muted-foreground/40">Ronda</span>
            <span className="text-sm font-bold text-ocean">{currentRound}</span>
            <span className="text-[11px] text-muted-foreground/30">/ {maxRounds}</span>
          </div>

          {/* Status */}
          <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
            status === "running" ? "bg-emerald/[0.06] text-emerald/70" :
            status === "completed" ? "bg-ocean/[0.06] text-ocean/70" :
            status === "error" ? "bg-coral/[0.06] text-coral/70" :
            "bg-amber/[0.06] text-amber/70"
          }`}>
            {status === "running" && <Radio className="h-2.5 w-2.5 animate-pulse" />}
            {status === "running" ? "En curso" : status === "completed" ? "Completado" : status === "error" ? "Error" : "Pausado"}
          </div>

          {/* Sidebar toggle */}
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:flex h-8 w-8 rounded-lg p-0 text-muted-foreground/30 hover:text-foreground">
            {sidebarOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* ═══ Main ═══ */}
      <div className="flex flex-1 overflow-hidden">
        {/* Messages column */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Agent bar */}
          {config && (
            <div className="flex flex-wrap gap-2 border-b border-white/[0.03] px-4 py-2 bg-white/[0.005]">
              {config.panelists.map((p) => (
                <AgentBadge key={p.name} name={p.name} role={p.role} color={p.color} active={status === "running"} />
              ))}
            </div>
          )}

          {/* Feed */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-3xl space-y-3 px-4 py-6">
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

              {/* Typing indicator */}
              {status === "running" && messages.length > 0 && (
                <TypingIndicator
                  agentName={config?.panelists[0]?.name || "Agente"}
                  color={config?.panelists[0]?.color || "#06B6D4"}
                />
              )}

              {/* Empty state */}
              {messages.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 text-center">
                  <div className="relative mx-auto mb-8 h-28 w-28">
                    <motion.div
                      animate={{ scale: [1, 1.15, 1], opacity: [0.05, 0.1, 0.05] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-ocean/10"
                    />
                    <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-white/[0.03]">
                      <Waves className="h-14 w-14 text-ocean/10" />
                    </div>
                  </div>
                  <p className="text-lg font-medium text-muted-foreground/30">El debate comenzará en breve</p>
                  <p className="mt-2 text-sm text-muted-foreground/20">Haz clic en &quot;Siguiente Ronda&quot; para iniciar</p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="glass-strong flex items-center gap-3 px-4 py-3 border-t border-white/[0.03]">
            {status !== "completed" && (
              <>
                <Button
                  onClick={handleNextCycle}
                  disabled={loading || status === "running"}
                  className="group rounded-full bg-gradient-to-r from-ocean to-sky px-5 text-[#030712] text-sm font-semibold glow-btn transition-all hover:brightness-110 disabled:opacity-30 disabled:shadow-none"
                >
                  <Play className="mr-1.5 h-3.5 w-3.5" />
                  {currentRound < maxRounds ? "Siguiente Ronda" : "Ronda Final"}
                  <ChevronRight className="ml-1 h-3.5 w-3.5 opacity-40 group-hover:translate-x-0.5 transition-transform" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleStop}
                  disabled={status !== "running"}
                  className="rounded-full text-muted-foreground/40 hover:text-foreground"
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
              className="ml-auto rounded-full text-muted-foreground/40 hover:text-foreground"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Exportar
            </Button>
          </div>
        </div>

        {/* ═══ Sidebar ═══ */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="hidden lg:flex flex-col gap-4 overflow-y-auto overflow-x-hidden border-l border-white/[0.03] bg-white/[0.005] p-4"
            >
              {/* Active panelists */}
              {config && (
                <div className="glass rounded-xl p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/40 mb-3">Panelistas</h3>
                  <div className="space-y-2">
                    {config.panelists.map((p) => (
                      <div key={p.name} className="flex items-center gap-2.5">
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-bold"
                          style={{ backgroundColor: `${p.color}12`, color: p.color }}
                        >
                          {p.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium text-foreground/70 block truncate">{p.name}</span>
                          <span className="text-[10px] text-muted-foreground/30">{p.role}</span>
                        </div>
                        {status === "running" && (
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald/40 animate-pulse" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <PipelineDisplay currentNode={pipeline.current_node} progress={pipeline.progress} />
              <AnalysisPanel messages={messages} />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
