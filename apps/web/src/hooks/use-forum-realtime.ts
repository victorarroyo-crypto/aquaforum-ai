"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useForumStore } from "@/store/forum-store";
import type { ForumMessage } from "@/lib/api";

export function useForumRealtime(sessionId: string | null) {
  const addMessage = useForumStore((s) => s.addMessage);
  const updatePipeline = useForumStore((s) => s.updatePipeline);

  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`forum-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "forum_messages",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          addMessage(payload.new as ForumMessage);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pipeline_status",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const data = payload.new as {
            current_node: string;
            progress: number;
            metadata: { label?: string };
          };
          updatePipeline({
            current_node: data.current_node,
            progress: data.progress,
            label: data.metadata?.label || data.current_node,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, addMessage, updatePipeline]);
}
