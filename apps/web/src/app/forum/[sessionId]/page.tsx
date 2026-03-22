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
  const [sidebar, setSidebar] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useForumRealtime(sessionId);
  useEffect(() => { (async () => { try { const s = await api.getState(sessionId); setMessages(s.messages); setStatus(s.status); setRound(s.current_round); if (s.config && !config) setSession(sessionId, s.config); } catch {} finally { setInitialLoading(false); } })(); }, [sessionId]);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages.length]);

  const discussionMessages = messages.filter((m) => !["analysis", "integration"].includes(m.message_type));

  if (initialLoading) return (
    <div className="flex min-h-screen items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
        <div className="h-1 w-12 bg-accent mx-auto mb-8" />
        <p className="text-light text-sm">Conectando...</p>
      </motion.div>
    </div>
  );

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between px-5 py-3 border-b border-edge bg-white">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="h-7 w-7 p-0 text-faint hover:text-dark"><ArrowLeft className="h-3.5 w-3.5" /></Button>
          <div>
            <h1 className="text-[10px] font-black uppercase tracking-[0.25em] text-dark">AquaForum AI</h1>
            <p className="max-w-sm truncate text-[11px] text-light mt-0.5">{topic}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 border border-edge rounded-full px-3 py-1">
            <span className="text-[10px] text-faint">Ronda</span>
            <span className="text-sm font-black text-accent">{currentRound}</span>
            <span className="text-[10px] text-faint">/ {maxRounds}</span>
          </div>
          <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${status === "running" ? "text-accent bg-accent/5" : status === "completed" ? "text-mid bg-surface" : status === "error" ? "text-red-600 bg-red-50" : "text-warn bg-warn-bg"}`}>
            {status === "running" && <Radio className="h-2.5 w-2.5 animate-pulse" />}
            {status === "running" ? "En curso" : status === "completed" ? "Completado" : status === "error" ? "Error" : "Pausado"}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSidebar(!sidebar)} className="hidden lg:flex h-7 w-7 p-0 text-faint hover:text-dark">
            {sidebar ? <PanelRightClose className="h-3.5 w-3.5" /> : <PanelRightOpen className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col min-w-0">
          {config && (
            <div className="flex flex-wrap gap-2 border-b border-edge px-5 py-2.5 bg-white">
              {config.panelists.map((p) => <AgentBadge key={p.name} name={p.name} role={p.role} color={p.color} active={status === "running"} />)}
            </div>
          )}

          <div ref={scrollRef} className="flex-1 overflow-y-auto bg-surface/30">
            <div className="mx-auto max-w-3xl px-5 py-6">
              <AnimatePresence mode="popLayout">
                {discussionMessages.map((msg) => (
                  <MessageBubble key={msg.id} agentName={msg.agent_name} agentRole={msg.agent_role} content={msg.content} messageType={msg.message_type} color={(msg.metadata?.color as string) || "#0D9488"} timestamp={msg.created_at} />
                ))}
              </AnimatePresence>
              {status === "running" && messages.length > 0 && <TypingIndicator agentName={config?.panelists[0]?.name || "Agente"} color={config?.panelists[0]?.color || "#0D9488"} />}
              {messages.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 text-center">
                  <div className="h-1 w-12 bg-accent mx-auto mb-8" />
                  <p className="text-2xl font-black text-faint">El debate comenzará en breve</p>
                  <p className="mt-3 text-sm text-faint">Pulsa &quot;Siguiente Ronda&quot; para iniciar</p>
                </motion.div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 px-5 py-3 border-t border-edge bg-white">
            {status !== "completed" && (
              <>
                <Button onClick={async () => { setLoading(true); try { await api.nextCycle(sessionId); } catch {} finally { setLoading(false); } }} disabled={loading || status === "running"} className="group bg-dark text-white hover:bg-accent disabled:opacity-30 rounded px-5 text-xs font-bold uppercase tracking-wider">
                  <Play className="mr-1.5 h-3 w-3" />{currentRound < maxRounds ? "Siguiente Ronda" : "Ronda Final"}<ChevronRight className="ml-1 h-3 w-3 opacity-40 group-hover:translate-x-0.5 transition-transform" />
                </Button>
                <Button variant="ghost" onClick={async () => { try { await api.stopForum(sessionId); setStatus("paused"); } catch {} }} disabled={status !== "running"} className="text-light hover:text-dark text-xs"><Pause className="mr-1 h-3 w-3" /> Pausar</Button>
              </>
            )}
            <Button variant="ghost" onClick={async () => { setLoading(true); try { const r = await api.exportForum(sessionId); const b = new Blob([r.content], { type: "text/markdown" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = `aquaforum-${sessionId.slice(0, 8)}.md`; a.click(); URL.revokeObjectURL(u); } catch {} finally { setLoading(false); } }} disabled={loading || !messages.length} className="ml-auto text-light hover:text-dark text-xs">
              <Download className="mr-1 h-3 w-3" /> Exportar
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {sidebar && (
            <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 300, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="hidden lg:flex flex-col gap-4 overflow-y-auto overflow-x-hidden border-l border-edge p-4 bg-white">
              {config && (
                <div className="border border-edge rounded p-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-light mb-3">Panelistas</h3>
                  {config.panelists.map((p) => (
                    <div key={p.name} className="flex items-center gap-2.5 py-1.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full text-[8px] font-bold text-white" style={{ backgroundColor: p.color }}>{p.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</div>
                      <div className="flex-1 min-w-0"><span className="text-[12px] font-bold text-dark block truncate">{p.name}</span><span className="text-[10px] text-light">{p.role}</span></div>
                      {status === "running" && <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />}
                    </div>
                  ))}
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
