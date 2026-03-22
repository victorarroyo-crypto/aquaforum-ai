"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, SkipForward } from "lucide-react";
import type { ForumMessage } from "@/lib/api";

// Assign distinct voices to each panelist
const VOICE_PREFS: Record<string, { lang: string; pitch: number; rate: number; gender: "male" | "female" }> = {
  "Elena Vásquez":      { lang: "es-ES", pitch: 1.1,  rate: 0.95, gender: "female" },
  "Marcus Chen":        { lang: "es-ES", pitch: 0.8,  rate: 1.0,  gender: "male" },
  "Sofia Andersen":     { lang: "es-ES", pitch: 1.2,  rate: 0.9,  gender: "female" },
  "Ahmed Al-Rashid":    { lang: "es-ES", pitch: 0.7,  rate: 0.92, gender: "male" },
  "Dr. Ingrid Hoffmann": { lang: "es-ES", pitch: 1.0, rate: 0.88, gender: "female" },
  "James Okafor":       { lang: "es-ES", pitch: 0.85, rate: 0.95, gender: "male" },
  "Moderador":          { lang: "es-ES", pitch: 0.9,  rate: 1.0,  gender: "male" },
  "Integrador":         { lang: "es-ES", pitch: 0.95, rate: 0.9,  gender: "male" },
};

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function pickVoice(agentName: string, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const prefs = VOICE_PREFS[agentName];
  const lang = prefs?.lang || "es";
  const gender = prefs?.gender || "male";

  // Filter Spanish voices
  const esVoices = voices.filter((v) => v.lang.startsWith("es"));
  if (esVoices.length === 0) return voices[0] || null;

  // Try to match gender by name heuristics
  const femaleKeywords = ["female", "femenin", "mujer", "woman", "mónica", "lucia", "elena", "paulina", "conchita"];
  const maleKeywords = ["male", "masculin", "hombre", "man", "jorge", "pablo", "enrique", "diego"];

  if (gender === "female") {
    const match = esVoices.find((v) => femaleKeywords.some((k) => v.name.toLowerCase().includes(k)));
    if (match) return match;
  } else {
    const match = esVoices.find((v) => maleKeywords.some((k) => v.name.toLowerCase().includes(k)));
    if (match) return match;
  }

  // Fallback: assign by index based on agent name hash
  const hash = agentName.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return esVoices[hash % esVoices.length];
}

interface AudioPlayerProps {
  messages: ForumMessage[];
}

export function AudioPlayer({ messages }: AudioPlayerProps) {
  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<string | null>(null);
  const [currentColor, setCurrentColor] = useState<string>("#14B8A6");
  const playedRef = useRef<Set<string>>(new Set());
  const queueRef = useRef<ForumMessage[]>([]);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const isSpeakingRef = useRef(false);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis?.getVoices() || [];
    };
    loadVoices();
    window.speechSynthesis?.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", loadVoices);
  }, []);

  // Queue new messages
  useEffect(() => {
    for (const msg of messages) {
      if (!playedRef.current.has(msg.id) && !queueRef.current.find((q) => q.id === msg.id)) {
        queueRef.current.push(msg);
      }
    }
    if (!isSpeakingRef.current && !muted && queueRef.current.length > 0) {
      speakNext();
    }
  }, [messages.length]);

  const speakNext = useCallback(() => {
    if (!window.speechSynthesis || muted) {
      isSpeakingRef.current = false;
      setSpeaking(false);
      return;
    }

    const msg = queueRef.current.shift();
    if (!msg) {
      isSpeakingRef.current = false;
      setSpeaking(false);
      setCurrentAgent(null);
      return;
    }

    playedRef.current.add(msg.id);
    isSpeakingRef.current = true;

    // Clean text
    let text = msg.content
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\[CHALLENGE:[^\]]+\]/g, "")
      .replace(/#{1,3}\s/g, "")
      .slice(0, 500); // Limit length for speech

    const prefs = VOICE_PREFS[msg.agent_name] || { lang: "es-ES", pitch: 1, rate: 0.95, gender: "male" };
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = prefs.lang;
    utterance.pitch = prefs.pitch;
    utterance.rate = prefs.rate;

    const voice = pickVoice(msg.agent_name, voicesRef.current);
    if (voice) utterance.voice = voice;

    setCurrentAgent(msg.agent_name);
    setCurrentColor((msg.metadata?.color as string) || "#14B8A6");
    setSpeaking(true);

    utterance.onend = () => speakNext();
    utterance.onerror = () => speakNext();

    window.speechSynthesis.speak(utterance);
  }, [muted]);

  const toggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    if (newMuted) {
      window.speechSynthesis?.cancel();
      isSpeakingRef.current = false;
      setSpeaking(false);
    } else if (queueRef.current.length > 0) {
      speakNext();
    }
  };

  const skip = () => {
    window.speechSynthesis?.cancel();
    isSpeakingRef.current = false;
    speakNext();
  };

  // Activate on first user click (browser requirement)
  const activate = () => {
    if (!speaking && queueRef.current.length > 0 && !muted) {
      speakNext();
    }
  };

  if (typeof window === "undefined" || !window.speechSynthesis) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-t border-[rgba(255,255,255,0.06)] bg-[#111113]">
      {/* Mute toggle */}
      <button
        onClick={() => { toggleMute(); activate(); }}
        className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
          muted ? "bg-[#27272A] text-[#52525B]" : "bg-[rgba(20,184,166,0.15)] text-[#14B8A6]"
        }`}
      >
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>

      {/* Now speaking */}
      {speaking && currentAgent ? (
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
