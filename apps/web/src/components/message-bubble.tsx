"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import type { ForumMessage } from "@/lib/api";

const borderColorMap: Record<string, string> = {
  statement: "#52525B",
  challenge: "#F59E0B",
  interpelacion: "#F59E0B",
  response: "#14B8A6",
  moderation: "#8B5CF6",
  analysis: "#22C55E",
  integration: "#14B8A6",
  synthesis: "#6366F1",
  summary: "#8B5CF6",
};

const bgTintMap: Record<string, string> = {
  challenge: "rgba(245, 158, 11, 0.04)",
  interpelacion: "rgba(245, 158, 11, 0.04)",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface MessageBubbleProps {
  message: ForumMessage;
  color?: string;
}

export function MessageBubble({ message, color }: MessageBubbleProps) {
  const borderColor = borderColorMap[message.message_type] || "#52525B";
  const bgTint = bgTintMap[message.message_type] || "transparent";
  const isModeration = message.message_type === "moderation" || message.message_type === "summary";
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [hasAudio] = useState(() => !!(message.metadata?.audio_b64));

  // Auto-play audio when message first appears
  useEffect(() => {
    const audio_b64 = message.metadata?.audio_b64 as string | undefined;
    if (!audio_b64) return;
    const audio = new Audio(`data:audio/mpeg;base64,${audio_b64}`);
    audioRef.current = audio;
    audio.onplay = () => setPlaying(true);
    audio.onended = () => setPlaying(false);
    audio.onpause = () => setPlaying(false);
    // Auto-play (may be blocked by browser)
    audio.play().catch(() => {});
    return () => { audio.pause(); audio.src = ""; };
  }, [message.id]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); }
    else { audioRef.current.currentTime = 0; audioRef.current.play().catch(() => {}); }
  };

  if (isModeration) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-center py-4"
      >
        <div className="flex items-center gap-2 px-5 py-3 rounded-full border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.05)] max-w-lg">
          <span className="text-[14px] italic text-[#A1A1AA] leading-relaxed text-center">
            {message.content}
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-3.5 py-3"
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold text-white"
        style={{ backgroundColor: color || borderColor }}
      >
        {getInitials(message.agent_name)}
      </div>

      <div className="flex-1 min-w-0">
        <div
          className="rounded-lg px-4 py-3.5 border border-[rgba(255,255,255,0.06)]"
          style={{
            borderLeft: `3px solid ${borderColor}`,
            backgroundColor: bgTint !== "transparent" ? bgTint : "#18181B",
          }}
        >
          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="text-[14px] font-semibold text-[#FAFAFA]">
              {message.agent_name}
            </span>
            <span className="text-[12px] text-[#52525B]">{message.agent_role}</span>
          </div>

          <p className="text-[15px] leading-[1.75] text-[#D4D4D8] whitespace-pre-wrap">
            {message.content}
          </p>

          <div className="flex items-center gap-3 mt-2.5">
            <span className="text-[10px] text-[#52525B] font-mono">
              R{message.round_number} / T{message.turn_number}
            </span>
            <span className="text-[10px] text-[#3F3F46]">
              {new Date(message.created_at).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
            {hasAudio && (
              <button
                onClick={toggleAudio}
                className={`ml-auto flex items-center gap-1 px-2 py-0.5 rounded text-[10px] transition-colors ${
                  playing
                    ? "text-[#14B8A6] bg-[rgba(20,184,166,0.1)]"
                    : "text-[#52525B] hover:text-[#A1A1AA]"
                }`}
              >
                {playing ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
                {playing ? "Reproduciendo" : "Escuchar"}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
