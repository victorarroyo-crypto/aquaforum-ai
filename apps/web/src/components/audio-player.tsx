"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, SkipForward } from "lucide-react";
import type { ForumMessage } from "@/lib/api";

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

interface AudioPlayerProps {
  messages: ForumMessage[];
}

export function AudioPlayer({ messages }: AudioPlayerProps) {
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<string | null>(null);
  const [currentColor, setCurrentColor] = useState("#14B8A6");
  const playedRef = useRef<Set<string>>(new Set());
  const queueRef = useRef<ForumMessage[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const busyRef = useRef(false);

  // Queue new messages as they arrive
  useEffect(() => {
    for (const msg of messages) {
      if (!playedRef.current.has(msg.id) && !queueRef.current.find((q) => q.id === msg.id)) {
        queueRef.current.push(msg);
      }
    }
    if (!busyRef.current && !muted && queueRef.current.length > 0) {
      playNext();
    }
  }, [messages.length]);

  const playNext = useCallback(() => {
    const msg = queueRef.current.shift();
    if (!msg) {
      busyRef.current = false;
      setPlaying(false);
      setCurrentAgent(null);
      return;
    }

    playedRef.current.add(msg.id);
    busyRef.current = true;
    setCurrentAgent(msg.agent_name);
    setCurrentColor((msg.metadata?.color as string) || "#14B8A6");
    setPlaying(true);

    const audioUrl = msg.metadata?.audio_url as string | undefined;

    if (audioUrl) {
      // High-quality Chatterbox audio from URL
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => playNext();
      audio.onerror = () => {
        // Fallback to Web Speech if audio URL fails
        speakWithBrowser(msg);
      };
      audio.play().catch(() => speakWithBrowser(msg));
    } else {
      // Fallback: Web Speech API
      speakWithBrowser(msg);
    }
  }, [muted]);

  const speakWithBrowser = (msg: ForumMessage) => {
    if (!window.speechSynthesis) {
      playNext();
      return;
    }
    const clean = msg.content
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\[CHALLENGE:[^\]]+\]/g, "")
      .replace(/#{1,3}\s/g, "")
      .slice(0, 400);

    const utt = new SpeechSynthesisUtterance(clean);
    utt.lang = "es-ES";
    utt.rate = 0.95;
    utt.onend = () => playNext();
    utt.onerror = () => playNext();
    window.speechSynthesis.speak(utt);
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    if (next) {
      // Stop everything
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
      window.speechSynthesis?.cancel();
      busyRef.current = false;
      setPlaying(false);
    } else if (queueRef.current.length > 0) {
      playNext();
    }
  };

  const skip = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
    window.speechSynthesis?.cancel();
    busyRef.current = false;
    playNext();
  };

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

      {playing && currentAgent ? (
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
            style={{ backgroundColor: currentColor }}
          >
            {getInitials(currentAgent)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-[#FAFAFA]">{currentAgent}</span>
              <span className="text-[11px] text-[#52525B]">hablando</span>
            </div>
            <div className="flex items-end gap-[2px] h-3 mt-1">
              {[...Array(12)].map((_, i) => (
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
        <div className="flex-1">
          <span className="text-[12px] text-[#3F3F46]">
            {muted ? "Audio silenciado" : queueRef.current.length > 0 ? "Pulsa 🔊 para escuchar" : "Esperando intervenciones..."}
          </span>
        </div>
      )}

      {queueRef.current.length > 0 && (
        <span className="text-[10px] text-[#52525B] bg-[#18181B] px-2 py-1 rounded-full">
          {queueRef.current.length} en cola
        </span>
      )}
    </div>
  );
}
