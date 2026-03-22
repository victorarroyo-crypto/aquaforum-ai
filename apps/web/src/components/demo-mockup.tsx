"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const demoMessages = [
  {
    name: "Elena Vásquez",
    role: "CEO Water Utility",
    color: "#14B8A6",
    content:
      "Nuestros gemelos digitales con IA predictiva reducen pérdidas de agua no contabilizada en un 25%. Anticipamos roturas 72 horas antes.",
    type: "statement",
  },
  {
    name: "Marcus Chen",
    role: "CEO Tecnología IA",
    color: "#8B5CF6",
    content:
      "Los modelos predictivos de calidad del agua alcanzan 97% de precisión con datos en tiempo real de sensores IoT.",
    type: "statement",
  },
  {
    name: "Ahmed Al-Rashid",
    role: "CEO Desalación",
    color: "#F59E0B",
    content:
      "Interpelación a Elena: ¿Ese 25% incluye el costo de ciberseguridad para sistemas SCADA conectados a IA?",
    type: "challenge",
  },
  {
    name: "Elena Vásquez",
    role: "CEO Water Utility",
    color: "#14B8A6",
    content:
      "Excelente punto. El análisis incluye inversión en seguridad, pero reconozco que el riesgo evoluciona más rápido que nuestras defensas.",
    type: "response",
  },
  {
    name: "Dr. Ingrid Hoffmann",
    role: "Analista Regulatoria",
    color: "#6366F1",
    content:
      "Si un algoritmo prioriza el suministro a un hospital sobre un barrio residencial durante sequía extrema, ¿quién responde legalmente?",
    type: "challenge",
  },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const borderMap: Record<string, string> = {
  statement: "#52525B",
  challenge: "#F59E0B",
  response: "#14B8A6",
};

export function DemoMockup() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount >= demoMessages.length) {
      const timer = setTimeout(() => setVisibleCount(0), 3500);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(
      () => setVisibleCount((c) => c + 1),
      visibleCount === 0 ? 600 : 2200
    );
    return () => clearTimeout(timer);
  }, [visibleCount]);

  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#0C0C0F] overflow-hidden shadow-2xl shadow-black/40 max-w-2xl mx-auto">
      {/* Window chrome */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#18181B] border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#EF4444]/60" />
          <div className="w-3 h-3 rounded-full bg-[#F59E0B]/60" />
          <div className="w-3 h-3 rounded-full bg-[#22C55E]/60" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#22C55E] status-pulse" />
          <span className="text-[11px] font-bold text-[#22C55E] uppercase tracking-wider">
            En vivo
          </span>
        </div>
        <span className="text-[11px] text-[#3F3F46] font-mono">AquaForum AI</span>
      </div>

      {/* Topic bar */}
      <div className="px-4 py-2 bg-[#111113] border-b border-[rgba(255,255,255,0.04)]">
        <span className="text-[12px] text-[#52525B]">Debate:</span>{" "}
        <span className="text-[12px] text-[#A1A1AA] font-medium">
          IA en infraestructura hídrica: riesgos y oportunidades
        </span>
      </div>

      {/* Messages */}
      <div className="p-4 space-y-3 min-h-[340px]">
        <AnimatePresence>
          {demoMessages.slice(0, visibleCount).map((msg, i) => (
            <motion.div
              key={`${i}-${visibleCount > demoMessages.length ? "r" : ""}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex gap-2.5"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5"
                style={{ backgroundColor: msg.color }}
              >
                {getInitials(msg.name)}
              </div>
              <div
                className="flex-1 rounded-lg px-3.5 py-2.5 border border-[rgba(255,255,255,0.06)]"
                style={{
                  borderLeft: `2px solid ${borderMap[msg.type] || "#52525B"}`,
                  backgroundColor:
                    msg.type === "challenge" ? "rgba(245,158,11,0.04)" : "#18181B",
                }}
              >
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-[12px] font-semibold text-[#FAFAFA]">
                    {msg.name}
                  </span>
                  <span className="text-[10px] text-[#52525B]">{msg.role}</span>
                </div>
                <p className="text-[13px] leading-relaxed text-[#D4D4D8]">
                  {msg.content}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {visibleCount > 0 && visibleCount < demoMessages.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2.5 px-1"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
              style={{
                backgroundColor: demoMessages[visibleCount]?.color || "#3F3F46",
              }}
            >
              {getInitials(demoMessages[visibleCount]?.name || "?")}
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-[rgba(255,255,255,0.06)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#71717A] typing-dot" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#71717A] typing-dot" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#71717A] typing-dot" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
