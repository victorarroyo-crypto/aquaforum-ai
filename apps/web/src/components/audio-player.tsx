"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, SkipForward } from "lucide-react";
import type { ForumMessage } from "@/lib/api";

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export function AudioPlayer({ messages }: { messages: ForumMessage[] }) {
  const [muted, setMuted] = useState(true); // Start muted — user activates
  const [playing, setPlaying] = useState(false);
  const [agent, setAgent] = useState<string | null>(null);
  const [color, setColor] = useState("#14B8A6");

  const playedRef = useRef(new Set<string>());
  const queueRef = useRef<ForumMessage[]>([]);
  const busyRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mutedRef = useRef(true);

  // Keep mutedRef in sync
  useEffect(() => { mutedRef.current = muted; }, [muted]);

  // Queue new messages
  useEffect(() => {
    let added = false;
    for (const msg of messages) {
      if (!playedRef.current.has(msg.id) && !queueRef.current.some((q) => q.id === msg.id)) {
        queueRef.current.push(msg);
        added = true;
      }
    }
    if (added && !busyRef.current && !mutedRef.current) {
      processQueue();
    }
  }, [messages.length]);

  function processQueue() {
    // Stop anything currently playing
    stopAll();

    const msg = queueRef.current.shift();
    if (!msg || mutedRef.current) {
      busyRef.current = false;
      setPlaying(false);
      setAgent(null);
      return;
    }

    playedRef.current.add(msg.id);
    busyRef.current = true;
    setAgent(msg.agent_name);
    setColor((msg.metadata?.color as string) || "#14B8A6");
    setPlaying(true);

    const audioUrl = msg.metadata?.audio_url as string | undefined;

    if (audioUrl) {
      playFromUrl(audioUrl);
    } else {
      playFromBrowser(msg);
    }
  }

  function playFromUrl(url: string) {
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => processQueue();
    audio.onerror = () => processQueue();
    audio.play().catch(() => processQueue());
  }

  function playFromBrowser(msg: ForumMessage) {
    if (!window.speechSynthesis) { processQueue(); return; }

    // CRITICAL: cancel any pending speech first
    window.speechSynthesis.cancel();

    const clean = msg.content
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\[CHALLENGE:[^\]]+\]/g, "")
      .replace(/#{1,3}\s/g, "")
      .trim()
      .slice(0, 300);

    if (clean.length < 5) { processQueue(); return; }

    const utt = new SpeechSynthesisUtterance(clean);
    utt.lang = "es-ES";
    utt.rate = 0.9;
    utt.pitch = 1.0;

    // Wait for speech to actually finish before next
    utt.onend = () => {
      setTimeout(() => processQueue(), 500); // 500ms pause between speakers
    };
    utt.onerror = () => {
      setTimeout(() => processQueue(), 200);
    };

    window.speechSynthesis.speak(utt);
  }

  function stopAll() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    mutedRef.current = next;

    if (next) {
      stopAll();
      busyRef.current = false;
      setPlaying(false);
      setAgent(null);
    } else {
      // Start playing queue
      if (queueRef.current.length > 0 && !busyRef.current) {
        processQueue();
      }
    }
  }

  function skip() {
    stopAll();
    busyRef.current = false;
    processQueue();
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-t border-[rgba(255,255,255,0.06)] bg-[#111113]">
      <button
        onClick={toggleMute}
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
            {getInitials(agent)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-[#FAFAFA]">{agent}</span>
              <span className="text-[11px] text-[#52525B]">hablando</span>
            </div>
            <div className="flex items-end gap-[2px] h-3 mt-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [3, 6 + Math.random() * 6, 3] }}
                  transition={{ duration: 0.3 + Math.random() * 0.3, repeat: Infinity, repeatType: "reverse", delay: i * 0.04 }}
                  className="w-[3px] rounded-full bg-[#14B8A6]"
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
          {muted ? "Pulsa 🔊 para escuchar el debate" : queueRef.current.length > 0 ? "Preparando..." : "Esperando intervenciones..."}
        </span>
      )}

      {queueRef.current.length > 0 && (
        <span className="text-[10px] text-[#52525B] bg-[#18181B] px-2 py-1 rounded-full">
          {queueRef.current.length}
        </span>
      )}
    </div>
  );
}
