"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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

  // Subscribe to Supabase Realtime
  useForumRealtime(sessionId);

  // Load initial state
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

  // Auto-scroll on new messages
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
      // Download as markdown file
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

  // Separate discussion messages from analysis messages
  const discussionMessages = messages.filter(
    (m) => !["analysis", "integration"].includes(m.message_type)
  );

  if (initialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Waves className="mx-auto mb-4 h-12 w-12 animate-pulse text-ocean" />
          <p className="text-muted-foreground">Cargando foro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header bar */}
      <header className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Waves className="h-6 w-6 text-ocean" />
          <div>
            <h1 className="text-sm font-semibold">AquaForum AI</h1>
            <p className="max-w-md truncate text-xs text-muted-foreground">
              {topic}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Ronda {currentRound}/{maxRounds}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              status === "running"
                ? "bg-emerald/20 text-emerald"
                : status === "completed"
                ? "bg-ocean/20 text-ocean"
                : status === "error"
                ? "bg-coral/20 text-coral"
                : "bg-amber/20 text-amber"
            }`}
          >
            {status === "running"
              ? "En curso"
              : status === "completed"
              ? "Completado"
              : status === "error"
              ? "Error"
              : "Pausado"}
          </span>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Messages column */}
        <div className="flex flex-1 flex-col">
          {/* Agent badges */}
          {config && (
            <div className="flex flex-wrap gap-2 border-b border-white/10 px-4 py-2">
              {config.panelists.map((p) => (
                <AgentBadge key={p.name} name={p.name} role={p.role} color={p.color} />
              ))}
            </div>
          )}

          {/* Message feed */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-3">
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
                <div className="py-20 text-center">
                  <Waves className="mx-auto mb-4 h-16 w-16 text-ocean/30" />
                  <p className="text-muted-foreground">
                    El debate comenzará en breve...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 border-t border-white/10 px-4 py-3">
            {status !== "completed" && (
              <>
                <Button
                  onClick={handleNextCycle}
                  disabled={loading || status === "running"}
                  className="bg-ocean text-deep hover:bg-ocean/80"
                >
                  <Play className="mr-1 h-4 w-4" />
                  {currentRound < maxRounds ? "Siguiente Ronda" : "Ronda Final"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleStop}
                  disabled={status !== "running"}
                  className="border-white/10"
                >
                  <Pause className="mr-1 h-4 w-4" />
                  Pausar
                </Button>
              </>
            )}
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={loading || messages.length === 0}
              className="ml-auto border-white/10"
            >
              <Download className="mr-1 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="hidden w-80 flex-col gap-4 overflow-y-auto border-l border-white/10 bg-white/[0.02] p-4 lg:flex">
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
