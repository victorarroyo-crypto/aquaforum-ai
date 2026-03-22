"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, SkipForward } from "lucide-react";
import type { ForumMessage } from "@/lib/api";

interface AudioPlayerProps {
  messages: ForumMessage[];
}

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export function AudioPlayer({ messages }: AudioPlayerProps) {
  const [muted, setMuted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playedIdsRef = useRef<Set<string>>(new Set());
  const queueRef = useRef<number[]>([]);

  // Find messages with audio that haven't been played yet
  const audioMessages = messages.filter(
    (m) => m.metadata?.audio_b64 && !playedIdsRef.current.has(m.id)
  );

  // When new audio messages arrive, add them to queue
  useEffect(() => {
    const newIndices: number[] = [];
    messages.forEach((m, i) => {
      if (m.metadata?.audio_b64 && !playedIdsRef.current.has(m.id)) {
        if (!queueRef.current.includes(i)) {
          newIndices.push(i);
        }
      }
    });

    if (newIndices.length > 0) {
      queueRef.current = [...queueRef.current, ...newIndices];
      // If not currently playing, start
      if (!playing && !muted) {
        playNext();
      }
    }
  }, [messages.length]);

  const playNext = useCallback(() => {
    if (queueRef.current.length === 0) {
      setPlaying(false);
      setCurrentIndex(-1);
      return;
    }

    const nextIdx = queueRef.current.shift()!;
    const msg = messages[nextIdx];
    if (!msg?.metadata?.audio_b64) {
      playNext();
      return;
    }

    // Mark as played
    playedIdsRef.current.add(msg.id);
    setCurrentIndex(nextIdx);
    setPlaying(true);

    // Create and play audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    const audio = new Audio(`data:audio/mpeg;base64,${msg.metadata.audio_b64}`);
    audioRef.current = audio;
    audio.volume = muted ? 0 : 1;

    audio.onended = () => {
      playNext();
    };

    audio.onerror = () => {
      playNext();
    };

    audio.play().catch(() => {
      // Browser blocked autoplay — user needs to interact first
      setPlaying(false);
    });
  }, [messages, muted]);

  // Toggle mute
  const toggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    if (audioRef.current) {
      audioRef.current.volume = newMuted ? 0 : 1;
    }
    // If unmuting and there are queued messages, start playing
    if (!newMuted && queueRef.current.length > 0 && !playing) {
      playNext();
    }
  };

  // Skip current
  const skip = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    playNext();
  };

  // Enable autoplay on first user interaction
  const enableAutoplay = () => {
    if (!playing && queueRef.current.length > 0) {
      playNext();
    }
  };

  const currentMsg = currentIndex >= 0 ? messages[currentIndex] : null;
  const hasAudioMessages = messages.some((m) => m.metadata?.audio_b64);

  if (!hasAudioMessages) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-3 px-4 py-2 border-t border-[rgba(255,255,255,0.06)] bg-[#111113]"
      >
        {/* Mute/Unmute */}
        <button
          onClick={() => { toggleMute(); enableAutoplay(); }}
          className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
            muted
              ? "bg-[#27272A] text-[#52525B]"
              : "bg-[rgba(20,184,166,0.1)] text-[#14B8A6]"
          }`}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>

        {/* Now playing */}
        {currentMsg && playing ? (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Speaking avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
              style={{
                backgroundColor: (currentMsg.metadata?.color as string) || "#14B8A6",
                boxShadow: "0 0 12px rgba(20,184,166,0.3)",
              }}
            >
              {getInitials(currentMsg.agent_name)}
            </div>

            {/* Waveform / info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-[#FAFAFA]">
                  {currentMsg.agent_name}
                </span>
                <span className="text-[11px] text-[#52525B]">hablando</span>
              </div>
              {/* Animated bars */}
              <div className="flex items-end gap-[2px] h-3 mt-1">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: playing ? [4, 8 + Math.random() * 4, 4] : 2,
                    }}
                    transition={{
                      duration: 0.4 + Math.random() * 0.3,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: i * 0.05,
                    }}
                    className="w-[3px] rounded-full bg-[#14B8A6]"
                    style={{ minHeight: 2 }}
                  />
                ))}
              </div>
            </div>

            {/* Skip */}
            <button
              onClick={skip}
              className="p-1.5 text-[#52525B] hover:text-[#FAFAFA] transition-colors"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex-1">
            <span className="text-[12px] text-[#3F3F46]">
              {muted ? "Audio silenciado" : queueRef.current.length > 0 ? "Listo para reproducir" : "Esperando intervenciones..."}
            </span>
          </div>
        )}

        {/* Queue count */}
        {queueRef.current.length > 0 && (
          <span className="text-[10px] text-[#52525B] bg-[#18181B] px-2 py-1 rounded-full">
            {queueRef.current.length} en cola
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
