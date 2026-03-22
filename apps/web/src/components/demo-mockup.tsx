"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DEMO_MESSAGES = [
  {
    name: "Elena Vásquez",
    role: "CEO Water Utility · IA",
    color: "#0D9488",
    type: "statement",
    text: "Nuestros gemelos digitales con IA predictiva reducen pérdidas de agua no contabilizada en un 25%. Anticipamos roturas 72 horas antes de que ocurran.",
  },
  {
    name: "Dr. Ingrid Hoffmann",
    role: "Analista Regulatoria",
    color: "#4338CA",
    type: "challenge",
    text: "Si un algoritmo prioriza el suministro a un hospital sobre un barrio residencial durante sequía extrema, ¿quién responde legalmente?",
  },
  {
    name: "Marcus Chen",
    role: "CEO Tecnología IA",
    color: "#111111",
    type: "response",
    text: "La trazabilidad algorítmica resuelve eso. Cada decisión de la IA queda registrada con su cadena de razonamiento. El problema no es técnico, es de voluntad política.",
  },
  {
    name: "Sofia Andersen",
    role: "CEO Química del Agua",
    color: "#059669",
    type: "statement",
    text: "ML optimiza dosificación de reactivos en EDAR: −30% químicos, −40% fangos. Los modelos aprenden en tiempo real de la composición del efluente.",
  },
  {
    name: "Moderador",
    role: "IA",
    color: "#999999",
    type: "moderation",
    text: "James, ¿cuál es el horizonte realista de ROI para una utility que invierte en IA hoy? Ahmed, ¿cómo cambia la ecuación en desalación?",
  },
];

export function DemoMockup() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount >= DEMO_MESSAGES.length) {
      const timer = setTimeout(() => setVisibleCount(0), 3500);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setVisibleCount((c) => c + 1), 2600);
    return () => clearTimeout(timer);
  }, [visibleCount]);

  return (
    <div className="border border-rule rounded overflow-hidden mx-auto max-w-2xl">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-rule bg-paper-warm">
        <span className="text-[11px] text-ink-faint font-medium tracking-wide uppercase">
          AquaForum AI — Debate en curso
        </span>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse" />
          <span className="text-[10px] text-teal font-medium">En vivo</span>
        </div>
      </div>

      {/* Messages */}
      <div className="p-5 space-y-5 h-[380px] overflow-hidden">
        <AnimatePresence mode="popLayout">
          {DEMO_MESSAGES.slice(0, visibleCount).map((msg, i) => (
            <motion.div
              key={`${i}-${visibleCount > DEMO_MESSAGES.length ? "r" : ""}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className={msg.type === "moderation" ? "text-center py-2" : "flex gap-3"}
            >
              {msg.type === "moderation" ? (
                <p className="text-xs italic text-ink-faint font-serif leading-relaxed max-w-md mx-auto">
                  {msg.text}
                </p>
              ) : (
                <>
                  <div
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white mt-0.5"
                    style={{ backgroundColor: msg.color }}
                  >
                    {msg.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-ink">{msg.name}</span>
                      <span className="text-[10px] text-ink-faint">{msg.role}</span>
                      {msg.type === "challenge" && (
                        <span className="text-[9px] uppercase tracking-wider font-semibold text-challenge bg-challenge-bg px-1.5 py-0.5 rounded">
                          Interpelación
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed text-ink-muted">{msg.text}</p>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {visibleCount > 0 && visibleCount < DEMO_MESSAGES.length && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 pl-10">
            <div className="typing-dot h-1 w-1 rounded-full bg-ink-ghost" />
            <div className="typing-dot h-1 w-1 rounded-full bg-ink-ghost" />
            <div className="typing-dot h-1 w-1 rounded-full bg-ink-ghost" />
          </motion.div>
        )}
      </div>
    </div>
  );
}
