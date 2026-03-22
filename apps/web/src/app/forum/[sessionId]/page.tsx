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
import { ArrowLeft, Download, Pause, Play, Radio, ChevronRight, PanelRightOpen, PanelRightClose } from "lucide-react";

export default function ForumView() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const { messages, pipeline, status, topic, currentRound, maxRounds, config, setSession, setMessages, setStatus, setRound } = useForumStore();
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
        if (state.config && !config) setSession(sessionId, state.config);
      } catch { /* ok */ } finally { setInitialLoading(false); }
    }
    load();
  }, [sessionId]);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages.length]);

  const handleNextCycle = async () => { setLoading(true); try { await api.nextCycle(sessionId); } catch (e) { console.error(e); } finally { setLoading(false); } };
  const handleStop = async () => { try { await api.stopForum(sessionId); setStatus("paused"); } catch (e) { console.error(e); } };
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
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const discussionMessages = messages.filter((m) => !["analysis", "integration"].includes(m.message_type));

  if (initialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="w-12 h-[3px] bg-teal mx-auto mb-8" />
          <p className="text-ink-faint text-base font-medium">Conectando al foro...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-rule bg-paper">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="h-7 w-7 rounded p-0 text-ink-ghost hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
          <div>
            <h1 className="section-kicker text-ink">AquaForum AI</h1>
            <p className="max-w-sm truncate text-[11px] text-ink-faint mt-0.5">{topic}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 border border-rule rounded-full px-3 py-1">
            <span className="text-[10px] text-ink-ghost font-medium">Ronda</span>
            <span className="text-sm font-black text-teal">{currentRound}</span>
            <span className="text-[10px] text-ink-ghost font-medium">/ {maxRounds}</span>
          </div>
          <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
            status === "running" ? "text-teal bg-teal/5" :
            status === "completed" ? "text-ink-muted bg-paper-warm" :
            status === "error" ? "text-red-600 bg-red-50" :
            "text-challenge bg-challenge-bg"
          }`}>
            {status === "running" && <Radio className="h-2.5 w-2.5 animate-pulse" />}
            {status === "running" ? "En curso" : status === "completed" ? "Completado" : status === "error" ? "Error" : "Pausado"}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:flex h-7 w-7 rounded p-0 text-ink-ghost hover:text-ink">
            {sidebarOpen ? <PanelRightClose className="h-3.5 w-3.5" /> : <PanelRightOpen className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Feed */}
        <div className="flex flex-1 flex-col min-w-0">
          {config && (
            <div className="flex flex-wrap gap-2 border-b border-rule px-5 py-2.5">
              {config.panelists.map((p) => (
                <AgentBadge key={p.name} name={p.name} role={p.role} color={p.color} active={status === "running"} />
              ))}
            </div>
          )}

          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-3xl px-5 py-6">
              <AnimatePresence mode="popLayout">
                {discussionMessages.map((msg) => (
                  <MessageBubble key={msg.id} agentName={msg.agent_name} agentRole={msg.agent_role} content={msg.content} messageType={msg.message_type} color={(msg.metadata?.color as string) || "#0D9488"} timestamp={msg.created_at} />
                ))}
              </AnimatePresence>

              {status === "running" && messages.length > 0 && (
                <TypingIndicator agentName={config?.panelists[0]?.name || "Agente"} color={config?.panelists[0]?.color || "#0D9488"} />
              )}

              {messages.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 text-center">
                  <div className="w-12 h-[3px] bg-teal mx-auto mb-8" />
                  <p className="text-2xl font-bold text-ink-ghost">El debate comenzará en breve</p>
                  <p className="mt-3 text-sm text-ink-ghost">Haz clic en &quot;Siguiente Ronda&quot; para iniciar</p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 px-5 py-3 border-t border-rule bg-paper">
            {status !== "completed" && (
              <>
                <Button onClick={handleNextCycle} disabled={loading || status === "running"} className="group bg-ink text-paper hover:bg-teal-dark disabled:opacity-30 rounded px-5 text-xs font-bold uppercase tracking-wide">
                  <Play className="mr-1.5 h-3 w-3" />
                  {currentRound < maxRounds ? "Siguiente Ronda" : "Ronda Final"}
                  <ChevronRight className="ml-1 h-3 w-3 opacity-40 group-hover:translate-x-0.5 transition-transform" />
                </Button>
                <Button variant="ghost" onClick={handleStop} disabled={status !== "running"} className="rounded text-ink-ghost hover:text-ink text-xs font-medium">
                  <Pause className="mr-1 h-3 w-3" /> Pausar
                </Button>
              </>
            )}
            <Button variant="ghost" onClick={handleExport} disabled={loading || messages.length === 0} className="ml-auto rounded text-ink-ghost hover:text-ink text-xs font-medium">
              <Download className="mr-1 h-3 w-3" /> Exportar
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="hidden lg:flex flex-col gap-4 overflow-y-auto overflow-x-hidden border-l border-rule p-4 bg-paper-warm"
            >
              {config && (
                <div className="border border-rule rounded p-4">
                  <h3 className="section-kicker text-ink-faint mb-3">Panelistas</h3>
                  <div className="space-y-2">
                    {config.panelists.map((p) => (
                      <div key={p.name} className="flex items-center gap-2.5">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full text-[8px] font-bold text-white" style={{ backgroundColor: p.color }}>
                          {p.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[12px] font-bold text-ink block truncate">{p.name}</span>
                          <span className="text-[10px] text-ink-ghost">{p.role}</span>
                        </div>
                        {status === "running" && <div className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse" />}
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
