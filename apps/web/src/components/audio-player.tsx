"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, SkipForward } from "lucide-react";
import type { ForumMessage } from "@/lib/api";
import { api } from "@/lib/api";

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export function AudioPlayer({
  messages,
  onRevealUpTo,
}: {
  messages: ForumMessage[];
  onRevealUpTo: (n: number) => void;
}) {
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [agent, setAgent] = useState<string | null>(null);
  const [color, setColor] = useState("#14B8A6");

  const audio = useRef<HTMLAudioElement | null>(null);
  const idx = useRef(0);
  const isMuted = useRef(true);

  useEffect(() => {
    isMuted.current = muted;
  }, [muted]);

  // When muted, show all messages
  useEffect(() => {
    if (muted) onRevealUpTo(messages.length);
  }, [muted, messages.length, onRevealUpTo]);

  // When new messages arrive and unmuted, start if idle
  useEffect(() => {
    if (!isMuted.current && idx.current < messages.length && !playing) {
      play(idx.current);
    }
  }, [messages.length]);

  async function play(i: number) {
    if (i >= messages.length || isMuted.current) {
      setPlaying(false);
      setAgent(null);
      return;
    }

    const msg = messages[i];
    onRevealUpTo(i + 1);
    idx.current = i;
    setAgent(msg.agent_name);
    setColor((msg.metadata?.color as string) || "#14B8A6");
    setPlaying(true);

    try {
      // Request audio from backend (generates on demand if needed)
      const { audio_url } = await api.getMessageAudio(msg.session_id, msg.id);

      stopAudio();
      const a = new Audio(audio_url);
      audio.current = a;
      a.onended = () => {
        idx.current = i + 1;
        setTimeout(() => play(i + 1), 600);
      };
      a.onerror = () => {
        idx.current = i + 1;
        setTimeout(() => play(i + 1), 200);
      };
      a.play().catch(() => {
        idx.current = i + 1;
        setTimeout(() => play(i + 1), 1000);
      });
    } catch {
      // API failed — skip to next message after pause
      idx.current = i + 1;
      setTimeout(() => play(i + 1), 2000);
    }
  }

  function stopAudio() {
    if (audio.current) {
      audio.current.pause();
      audio.current.src = "";
      audio.current = null;
    }
  }

  function toggle() {
    const nowMuted = !muted;
    setMuted(nowMuted);
    isMuted.current = nowMuted;
    if (nowMuted) {
      stopAudio();
      setPlaying(false);
      setAgent(null);
      onRevealUpTo(messages.length);
    } else if (idx.current < messages.length) {
      play(idx.current);
    }
  }

  function skip() {
    stopAudio();
    const next = idx.current + 1;
    idx.current = next;
    onRevealUpTo(next);
    play(next);
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-t border-[rgba(255,255,255,0.06)] bg-[#111113]">
      <button
        onClick={toggle}
        className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
          muted
            ? "bg-[#27272A] text-[#52525B]"
            : "bg-[rgba(20,184,166,0.15)] text-[#14B8A6]"
        }`}
      >
        {muted ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </button>

      {playing && agent ? (
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
            style={{ backgroundColor: color }}
          >
            {initials(agent)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-[#FAFAFA]">
                {agent}
              </span>
              <span className="text-[11px] text-[#52525B]">hablando</span>
            </div>
            <div className="flex items-end gap-[2px] h-3 mt-1">
              {Array.from({ length: 14 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: [2, 5 + Math.random() * 7, 2],
                  }}
                  transition={{
                    duration: 0.25 + Math.random() * 0.25,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: i * 0.03,
                  }}
                  className="w-[2.5px] rounded-full bg-[#14B8A6]"
                  style={{ minHeight: 2 }}
                />
              ))}
            </div>
          </div>
          <button
            onClick={skip}
            className="p-1.5 text-[#52525B] hover:text-[#FAFAFA] transition-colors"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <span className="flex-1 text-[12px] text-[#3F3F46]">
          {muted
            ? "Pulsa 🔊 para escuchar el debate"
            : "Esperando intervenciones..."}
        </span>
      )}
    </div>
  );
}
