"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MSGS = [
  { name: "Elena Vásquez", role: "CEO Water Utility", color: "#0D9488", type: "statement", text: "Nuestros gemelos digitales con IA predictiva reducen pérdidas de agua no contabilizada en un 25%. Anticipamos roturas 72 horas antes de que ocurran." },
  { name: "Dr. Ingrid Hoffmann", role: "Reguladora", color: "#4338CA", type: "challenge", text: "Si un algoritmo prioriza el suministro a un hospital sobre un barrio residencial durante sequía extrema, ¿quién responde legalmente?" },
  { name: "Marcus Chen", role: "CEO Tech IA", color: "#0A0A0A", type: "response", text: "La trazabilidad algorítmica resuelve eso. Cada decisión de la IA queda registrada. El problema no es técnico, es de voluntad política." },
  { name: "Sofia Andersen", role: "CEO Química", color: "#059669", type: "statement", text: "ML optimiza dosificación de reactivos en EDAR: −30% químicos, −40% fangos. Los modelos aprenden en tiempo real de la composición del efluente." },
  { name: "Moderador IA", role: "", color: "#A3A3A3", type: "moderation", text: "James, ¿cuál es el horizonte realista de ROI para una utility que invierte en IA hoy?" },
];

export function DemoMockup() {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (n >= MSGS.length) { const t = setTimeout(() => setN(0), 3000); return () => clearTimeout(t); }
    const t = setTimeout(() => setN((v) => v + 1), 2400);
    return () => clearTimeout(t);
  }, [n]);

  return (
    <div className="bg-white rounded-lg shadow-2xl shadow-black/25 border border-white/10 mx-auto max-w-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100 bg-neutral-50">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
            <div className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
            <div className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
          </div>
          <span className="ml-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400">Debate en curso</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-600">EN VIVO</span>
        </div>
      </div>

      <div className="p-5 space-y-4 h-[360px] overflow-hidden">
        <AnimatePresence mode="popLayout">
          {MSGS.slice(0, n).map((m, i) => (
            <motion.div
              key={`${i}-${n > MSGS.length ? "r" : ""}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className={m.type === "moderation" ? "text-center py-2" : "flex gap-3"}
            >
              {m.type === "moderation" ? (
                <p className="text-[11px] italic text-neutral-400 max-w-sm mx-auto">{m.text}</p>
              ) : (
                <>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: m.color }}>
                    {m.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-neutral-900">{m.name}</span>
                      <span className="text-[10px] text-neutral-400">{m.role}</span>
                      {m.type === "challenge" && (
                        <span className="text-[8px] uppercase tracking-widest font-black text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">Interpelación</span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed text-neutral-600">{m.text}</p>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {n > 0 && n < MSGS.length && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1 pl-10">
            <div className="typing-dot h-1 w-1 rounded-full bg-neutral-300" />
            <div className="typing-dot h-1 w-1 rounded-full bg-neutral-300" />
            <div className="typing-dot h-1 w-1 rounded-full bg-neutral-300" />
          </motion.div>
        )}
      </div>
    </div>
  );
}
