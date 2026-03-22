"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DEMO_MESSAGES = [
  { name: "Elena Ríos", role: "CEO Utility", color: "#06B6D4", type: "statement", text: "La IA predictiva ya reduce las pérdidas de agua no contabilizada en un 25%. Nuestros gemelos digitales anticipan roturas antes de que ocurran..." },
  { name: "Marco Vallejo", role: "Regulador", color: "#A78BFA", type: "challenge", text: "¿Qué marcos regulatorios necesitamos para gobernar algoritmos que toman decisiones sobre un recurso público esencial?" },
  { name: "Elena Ríos", role: "CEO Utility", color: "#06B6D4", type: "response", text: "Proponemos un sandbox regulatorio específico para IA hídrica, similar al modelo fintech, con auditorías algorítmicas obligatorias..." },
  { name: "Sofía Chen", role: "Ing. Ambiental", color: "#34D399", type: "statement", text: "El machine learning optimiza la dosificación de reactivos en EDAR con un ahorro del 30% en químicos y una reducción del 40% en fangos..." },
  { name: "Moderador", role: "IA", color: "#FBBF24", type: "moderation", text: "Carlos, ¿cómo valoramos económicamente el retorno de inversión en IA para utilities de agua?" },
];

export function DemoMockup() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount >= DEMO_MESSAGES.length) {
      const timer = setTimeout(() => setVisibleCount(0), 3000);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setVisibleCount((c) => c + 1), 2200);
    return () => clearTimeout(timer);
  }, [visibleCount]);

  return (
    <div className="glass-strong rounded-2xl overflow-hidden w-full max-w-2xl mx-auto">
      {/* Fake toolbar */}
      <div className="flex items-center gap-2 border-b border-white/[0.04] px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-coral/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald/60" />
        </div>
        <span className="ml-3 text-[11px] text-muted-foreground/40">AquaForum AI — Debate en curso</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse" />
          <span className="text-[10px] text-emerald/60">En vivo</span>
        </div>
      </div>

      {/* Messages */}
      <div className="p-4 space-y-3 h-[320px] overflow-hidden">
        <AnimatePresence mode="popLayout">
          {DEMO_MESSAGES.slice(0, visibleCount).map((msg, i) => (
            <motion.div
              key={`${i}-${visibleCount > DEMO_MESSAGES.length ? "r" : ""}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={`flex gap-3 ${msg.type === "moderation" ? "justify-center" : ""}`}
            >
              {msg.type !== "moderation" && (
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{ backgroundColor: `${msg.color}15`, color: msg.color }}
                >
                  {msg.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </div>
              )}
              <div className={`flex-1 min-w-0 ${msg.type === "moderation" ? "max-w-md text-center" : ""}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-foreground/80">{msg.name}</span>
                  <span className="text-[10px] text-muted-foreground/40">{msg.role}</span>
                  {msg.type === "challenge" && (
                    <span className="text-[9px] uppercase tracking-wider text-coral/60 bg-coral/5 px-1.5 py-0.5 rounded">Interpelación</span>
                  )}
                </div>
                <p className="text-xs leading-relaxed text-foreground/50">{msg.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator if not all messages shown */}
        {visibleCount > 0 && visibleCount < DEMO_MESSAGES.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 pl-11"
          >
            <div className="flex gap-1">
              <div className="typing-dot h-1 w-1 rounded-full bg-muted-foreground/30" />
              <div className="typing-dot h-1 w-1 rounded-full bg-muted-foreground/30" />
              <div className="typing-dot h-1 w-1 rounded-full bg-muted-foreground/30" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
