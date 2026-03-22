"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, SkipForward } from "lucide-react";
import type { ForumMessage } from "@/lib/api";

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export function AudioPlayer({ messages }: { messages: ForumMessage[] }) {
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [agent, setAgent] = useState<string | null>(null);
  const [color, setColor] = useState("#14B8A6");

  const played = useRef(new Set<string>());
  const queue = useRef<ForumMessage[]>([]);
  const audio = useRef<HTMLAudioElement | null>(null);
  const busy = useRef(false);
  const isMuted = useRef(true);

  useEffect(() => { isMuted.current = muted; }, [muted]);

  // Queue messages with audio_url
  useEffect(() => {
    for (const msg of messages) {
      if (msg.metadata?.audio_url && !played.current.has(msg.id) && !queue.current.some((q) => q.id === msg.id)) {
        queue.current.push(msg);
      }
    }
    if (!busy.current && !isMuted.current && queue.current.length > 0) {
      next();
    }
  }, [messages, messages.length]);

  function next() {
    stop();
    const msg = queue.current.shift();
    if (!msg || isMuted.current) {
      busy.current = false;
      setPlaying(false);
      setAgent(null);
      return;
    }

    const url = msg.metadata?.audio_url as string;
    if (!url) { next(); return; }

    played.current.add(msg.id);
    busy.current = true;
    setAgent(msg.agent_name);
    setColor((msg.metadata?.color as string) || "#14B8A6");
    setPlaying(true);

    const a = new Audio(url);
    audio.current = a;
    a.onended = () => { setTimeout(next, 600); }; // 600ms pause between speakers
    a.onerror = () => { setTimeout(next, 200); };
    a.play().catch(() => next());
  }

  function stop() {
    if (audio.current) {
      audio.current.pause();
      audio.current.src = "";
      audio.current = null;
    }
  }

  function toggle() {
    const on = !muted;
    setMuted(on);
    isMuted.current = on;
    if (on) {
      stop();
      busy.current = false;
      setPlaying(false);
      setAgent(null);
    } else if (queue.current.length > 0) {
      next();
    }
  }

  function skip() {
    stop();
    busy.current = false;
    next();
  }

  const hasAudio = messages.some((m) => m.metadata?.audio_url);
  const pending = queue.current.length;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-t border-[rgba(255,255,255,0.06)] bg-[#111113]">
      <button
        onClick={toggle}
        className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
          muted ? "bg-[#27272A] text-[#52525B]" : "bg-[rgba(20,184,166,0.15)] text-[#14B8A6]"
        }`}
      >
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
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
              <span className="text-[13px] font-semibold text-[#FAFAFA]">{agent}</span>
              <span className="text-[11px] text-[#52525B]">hablando</span>
            </div>
            <div className="flex items-end gap-[2px] h-3 mt-1">
              {Array.from({ length: 14 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [2, 5 + Math.random() * 7, 2] }}
                  transition={{ duration: 0.25 + Math.random() * 0.25, repeat: Infinity, repeatType: "reverse", delay: i * 0.03 }}
                  className="w-[2.5px] rounded-full bg-[#14B8A6]"
                  style={{ minHeight: 2 }}
                />
              ))}
            </div>
          </div>
          <button onClick={skip} className="p-1.5 text-[#52525B] hover:text-[#FAFAFA] transition-colors">
            <SkipForward className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <span className="flex-1 text-[12px] text-[#3F3F46]">
          {muted
            ? hasAudio ? "Pulsa 🔊 para escuchar el debate" : "Audio disponible cuando inicie el debate"
            : pending > 0 ? "Preparando audio..." : "Esperando intervenciones..."}
        </span>
      )}

      {pending > 0 && !muted && (
        <span className="text-[10px] text-[#52525B] bg-[#18181B] px-2 py-1 rounded-full">{pending}</span>
      )}
    </div>
  );
}
