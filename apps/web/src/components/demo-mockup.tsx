"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DEMO_MESSAGES = [
  {
    name: "Elena R\u00edos",
    role: "CTO \u00b7 IA/Gemelos Digitales",
    color: "#0F766E",
    type: "statement",
    text: "Los gemelos digitales con IA predictiva ya reducen las p\u00e9rdidas de agua no contabilizada en un 25%. Nuestros modelos anticipan roturas de tuber\u00eda 72 horas antes de que ocurran.",
  },
  {
    name: "Marco Vallejo",
    role: "Gobernanza IA",
    color: "#4338CA",
    type: "challenge",
    text: "Si un algoritmo decide priorizar el suministro a una zona sobre otra en situaci\u00f3n de escasez, \u00bfqui\u00e9n es responsable? Necesitamos marcos de gobernanza algor\u00edtmica para recursos p\u00fablicos esenciales.",
  },
  {
    name: "Elena R\u00edos",
    role: "CTO \u00b7 IA/Gemelos Digitales",
    color: "#0F766E",
    type: "response",
    text: "Proponemos un sandbox regulatorio espec\u00edfico para IA h\u00eddrica, similar al modelo fintech, con auditor\u00edas algor\u00edtmicas obligatorias y transparencia en los criterios de decisi\u00f3n.",
  },
  {
    name: "Sof\u00eda Chen",
    role: "Data Scientist \u00b7 EDAR/ML",
    color: "#059669",
    type: "statement",
    text: "El ML optimiza la dosificaci\u00f3n de reactivos en EDAR con un ahorro del 30% en qu\u00edmicos y una reducci\u00f3n del 40% en generaci\u00f3n de fangos. Los modelos aprenden en tiempo real del efluente.",
  },
  {
    name: "Moderador",
    role: "IA",
    color: "#78716C",
    type: "moderation",
    text: "Carlos, \u00bfc\u00f3mo valoramos econ\u00f3micamente el retorno de inversi\u00f3n en IA para utilities de agua? \u00bfCu\u00e1les son los horizontes realistas?",
  },
];

export function DemoMockup() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount >= DEMO_MESSAGES.length) {
      const timer = setTimeout(() => setVisibleCount(0), 3000);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setVisibleCount((c) => c + 1), 2400);
    return () => clearTimeout(timer);
  }, [visibleCount]);

  return (
    <div className="editorial-card rounded-xl overflow-hidden w-full max-w-2xl mx-auto shadow-sm">
      {/* Fake toolbar */}
      <div className="flex items-center gap-2 border-b border-stone-200 px-5 py-3 bg-stone-50">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-stone-300" />
          <div className="h-2.5 w-2.5 rounded-full bg-stone-300" />
          <div className="h-2.5 w-2.5 rounded-full bg-stone-300" />
        </div>
        <span className="ml-3 text-[11px] text-stone-400 font-medium">
          AquaForum AI — Debate en curso
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse" />
          <span className="text-[10px] text-teal font-medium">En vivo</span>
        </div>
      </div>

      {/* Messages */}
      <div className="p-5 space-y-4 h-[360px] overflow-hidden bg-white">
        <AnimatePresence mode="popLayout">
          {DEMO_MESSAGES.slice(0, visibleCount).map((msg, i) => (
            <motion.div
              key={`${i}-${visibleCount > DEMO_MESSAGES.length ? "r" : ""}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={`flex gap-3 ${
                msg.type === "moderation" ? "justify-center" : ""
              }`}
            >
              {msg.type !== "moderation" && (
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: msg.color }}
                >
                  {msg.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)}
                </div>
              )}
              <div
                className={`flex-1 min-w-0 ${
                  msg.type === "moderation" ? "max-w-md text-center" : ""
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-stone-700">
                    {msg.name}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {msg.role}
                  </span>
                  {msg.type === "challenge" && (
                    <span className="text-[9px] uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-semibold">
                      Interpelaci\u00f3n
                    </span>
                  )}
                </div>
                <p className="text-xs leading-relaxed text-stone-500">
                  {msg.text}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {visibleCount > 0 && visibleCount < DEMO_MESSAGES.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 pl-11"
          >
            <div className="flex gap-1">
              <div className="typing-dot h-1 w-1 rounded-full bg-stone-400" />
              <div className="typing-dot h-1 w-1 rounded-full bg-stone-400" />
              <div className="typing-dot h-1 w-1 rounded-full bg-stone-400" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
