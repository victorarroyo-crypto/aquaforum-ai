"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api, type ForumConfig } from "@/lib/api";
import { useForumStore } from "@/store/forum-store";
import { ArrowLeft, ArrowRight, Plus, Trash2, Check } from "lucide-react";
import Link from "next/link";

const DEFAULT_PANELISTS = [
  {
    name: "Elena Vásquez",
    role: "CEO Water Utility · IA",
    persona:
      "CEO de utility de agua líder en transformación digital. Experta en gemelos digitales, mantenimiento predictivo con ML, automatización de operaciones. 20 años en el sector.",
    color: "#14B8A6",
    avatar_url: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Marcus Chen",
    role: "CEO Tecnología IA",
    persona:
      "Fundador de empresa de IA para infraestructura crítica. Visión radical: la IA debe gestionar toda la cadena del agua de forma autónoma. Deep tech, agentes, modelos fundacionales.",
    color: "#8B5CF6",
    avatar_url: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Sofia Andersen",
    role: "CEO Química del Agua",
    persona:
      "CEO de multinacional de tratamiento químico. PhD en ingeniería química. ML optimiza dosificación de reactivos, reduce fangos, transforma EDAR. Perspectiva industrial.",
    color: "#22C55E",
    avatar_url: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    name: "Ahmed Al-Rashid",
    role: "CEO Desalación",
    persona:
      "CEO de la mayor empresa de desalación del Golfo. Pionero en IA para optimización energética de ósmosis inversa. Visión global nexo agua-energía-IA.",
    color: "#F59E0B",
    avatar_url: "https://randomuser.me/api/portraits/men/75.jpg",
  },
  {
    name: "Dr. Ingrid Hoffmann",
    role: "Analista Regulatoria",
    persona:
      "Regulación de IA en servicios públicos. Asesora CE en AI Act. Gobernanza algorítmica, ética de IA, marcos legales para decisiones automatizadas en recursos hídricos.",
    color: "#6366F1",
    avatar_url: "https://randomuser.me/api/portraits/women/57.jpg",
  },
  {
    name: "James Okafor",
    role: "Analista Mercados",
    persona:
      "Inversión en tech para agua. Ex-Goldman, consultor Banco Mundial. Valoración startups IA hídrica, ROI, tendencias de capital riesgo en water tech.",
    color: "#A1A1AA",
    avatar_url: "https://randomuser.me/api/portraits/men/52.jpg",
  },
  {
    name: "Laura Martínez",
    role: "Directora IA Industrial",
    avatar_url: "https://randomuser.me/api/portraits/women/33.jpg",
    persona:
      "Experta en IA aplicada a procesos industriales. Provocadora: cree que el 80% de las EDAR deberían operarse con IA autónoma ya. Ha implementado gemelos digitales en 12 plantas, ML para dosificación de reactivos, y RL para optimización de aireación. Datos de sus proyectos: -25% consumo energético, -30% uso de reactivos. Reta a los conservadores con casos reales de automatización total. 15 años en ingeniería de procesos + 5 en IA industrial.",
    color: "#EF4444",
  },
];

const COLOR_OPTIONS = [
  "#14B8A6",
  "#8B5CF6",
  "#22C55E",
  "#F59E0B",
  "#6366F1",
  "#A1A1AA",
  "#EF4444",
  "#0EA5E9",
];

const CYCLES = [
  "¿Dónde invertir primero en IA para agua?",
  "¿Qué barreras reales nos frenan?",
  "¿Qué compromiso concreto para 2030?",
  "¿Qué legado dejamos para la humanidad?",
];

const DEFAULT_RULES = [
  "Intervenciones concisas con datos.",
  "Cita casos reales y tecnologías.",
  "Respeta posiciones al interpelar.",
  "El moderador puede redirigir.",
];

function getInitials(name: string): string {
  return (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function SetupPage() {
  const router = useRouter();
  const setSession = useForumStore((s) => s.setSession);
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState(
    "Impacto de la Inteligencia Artificial en la gestión del agua: oportunidades, riesgos y transformación del sector hídrico"
  );
  const [panelists, setPanelists] = useState(DEFAULT_PANELISTS);
  const [maxRounds, setMaxRounds] = useState(4);
  const [rules, setRules] = useState(DEFAULT_RULES.join("\n"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addPanelist = () => {
    if (panelists.length < 8)
      setPanelists([
        ...panelists,
        {
          name: "",
          role: "",
          persona: "",
          color: COLOR_OPTIONS[panelists.length % COLOR_OPTIONS.length],
          avatar_url: "",
        },
      ]);
  };

  const removePanelist = (i: number) => {
    if (panelists.length > 2) setPanelists(panelists.filter((_, j) => j !== i));
  };

  const updatePanelist = (i: number, field: string, value: string) => {
    const updated = [...panelists];
    updated[i] = { ...updated[i], [field]: value };
    setPanelists(updated);
  };

  const isStepValid = () => {
    if (step === 1) return topic.trim().length > 10;
    if (step === 2) return panelists.every((p) => p.name && p.role) && panelists.length >= 2;
    return true;
  };

  const launch = async () => {
    setLoading(true);
    setError(null);
    try {
      const config: ForumConfig = {
        topic,
        panelists,
        max_rounds: maxRounds,
        rules: rules.split("\n").filter((r) => r.trim()),
      };
      const { session_id } = await api.startForum(config);
      setSession(session_id, config);
      router.push(`/forum/${session_id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al iniciar");
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = [
    { id: 1, label: "Tema" },
    { id: 2, label: "Panel" },
    { id: 3, label: "Config" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#09090B]">
      {/* Header */}
      <header className="flex items-center px-6 md:px-12 py-5 border-b border-[rgba(255,255,255,0.06)]">
        <Link
          href="/"
          className="flex items-center gap-2 text-[#52525B] hover:text-[#FAFAFA] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
            AquaForum
          </span>
        </Link>
      </header>

      {/* Step indicators */}
      <div className="mx-auto w-full max-w-3xl px-6 pt-10 pb-4 flex items-center justify-center gap-6">
        {stepLabels.map((s, i) => (
          <div key={s.id} className="flex items-center gap-3">
            <button
              onClick={() => s.id < step && setStep(s.id)}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-bold transition-colors ${
                s.id === step
                  ? "bg-[#14B8A6] text-white"
                  : s.id < step
                    ? "bg-[rgba(20,184,166,0.15)] text-[#14B8A6]"
                    : "border border-[rgba(255,255,255,0.1)] text-[#52525B]"
              }`}
            >
              {s.id < step ? <Check className="h-4 w-4" /> : s.id}
            </button>
            <span
              className={`text-[14px] ${
                s.id === step
                  ? "font-bold text-[#FAFAFA]"
                  : s.id < step
                    ? "text-[#14B8A6]"
                    : "text-[#52525B]"
              }`}
            >
              {s.label}
            </span>
            {i < 2 && (
              <div
                className={`w-12 h-px ${
                  s.id < step ? "bg-[#14B8A6]" : "bg-[rgba(255,255,255,0.06)]"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 px-6 md:px-12 pb-10">
        <div className="mx-auto max-w-3xl">
          <AnimatePresence mode="wait">
            {/* Step 1: Topic */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-[800] tracking-tight text-[#FAFAFA] mt-8 mb-3">
                  ¿Sobre qué debatimos?
                </h2>
                <p className="text-[16px] text-[#A1A1AA] mb-8">
                  Define el tema central. Los 4 ciclos serán progresivos.
                </p>

                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full min-h-[140px] rounded-lg bg-[#18181B] border border-[rgba(255,255,255,0.06)] text-[16px] text-[#FAFAFA] placeholder-[#3F3F46] p-4 focus:outline-none focus:border-[#14B8A6] resize-none transition-colors"
                  placeholder="Describe el tema del debate..."
                />

                <div className="mt-8 rounded-lg bg-[#18181B] border border-[rgba(255,255,255,0.06)] p-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#14B8A6] mb-5">
                    4 Ciclos
                  </p>
                  {CYCLES.map((c, i) => (
                    <div key={i} className="flex gap-3 py-2">
                      <span className="text-[16px] font-bold text-[rgba(20,184,166,0.3)] font-mono">
                        {i + 1}
                      </span>
                      <span className="text-[15px] text-[#A1A1AA]">{c}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Panelists */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mt-8 mb-8">
                  <div>
                    <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-[800] tracking-tight text-[#FAFAFA] mb-1">
                      Panelistas
                    </h2>
                    <p className="text-[15px] text-[#A1A1AA]">
                      4 CEOs + 2 Analistas. Moderador, Expertos e Integrador
                      son agentes ocultos.
                    </p>
                  </div>
                  <button
                    onClick={addPanelist}
                    disabled={panelists.length >= 8}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] text-[#A1A1AA] text-[13px] font-medium hover:border-[rgba(255,255,255,0.2)] hover:text-[#FAFAFA] disabled:opacity-30 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> Añadir
                  </button>
                </div>

                <div className="space-y-4">
                  {panelists.map((p, i) => (
                    <motion.div
                      key={i}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-lg bg-[#18181B] border border-[rgba(255,255,255,0.06)] p-5"
                      style={{ borderLeft: `3px solid ${p.color}` }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                            style={{ backgroundColor: p.color }}
                          >
                            {getInitials(p.name)}
                          </div>
                          <div>
                            <div className="text-[16px] font-bold text-[#FAFAFA]">
                              {p.name || "Nuevo panelista"}
                            </div>
                            <div className="text-[12px] text-[#52525B]">
                              {p.role || "Sin rol"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {COLOR_OPTIONS.slice(0, 6).map((c) => (
                            <button
                              key={c}
                              onClick={() => updatePanelist(i, "color", c)}
                              className={`h-4 w-4 rounded-full hover:scale-125 transition-transform ${
                                p.color === c
                                  ? "ring-2 ring-[#FAFAFA] ring-offset-2 ring-offset-[#18181B]"
                                  : "opacity-40 hover:opacity-100"
                              }`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                          <div className="ml-2 h-4 w-px bg-[rgba(255,255,255,0.06)]" />
                          <button
                            onClick={() => removePanelist(i)}
                            disabled={panelists.length <= 2}
                            className="p-1.5 text-[#3F3F46] hover:text-[#EF4444] disabled:opacity-30 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <input
                          value={p.name}
                          onChange={(e) => updatePanelist(i, "name", e.target.value)}
                          placeholder="Nombre"
                          className="w-full rounded-md bg-[#27272A] border border-[rgba(255,255,255,0.06)] text-[15px] text-[#FAFAFA] placeholder-[#3F3F46] px-3 py-2.5 focus:outline-none focus:border-[#14B8A6] transition-colors"
                        />
                        <input
                          value={p.role}
                          onChange={(e) => updatePanelist(i, "role", e.target.value)}
                          placeholder="Rol"
                          className="w-full rounded-md bg-[#27272A] border border-[rgba(255,255,255,0.06)] text-[15px] text-[#FAFAFA] placeholder-[#3F3F46] px-3 py-2.5 focus:outline-none focus:border-[#14B8A6] transition-colors"
                        />
                      </div>
                      <textarea
                        value={p.persona}
                        onChange={(e) => updatePanelist(i, "persona", e.target.value)}
                        placeholder="Perfil y perspectiva del panelista..."
                        className="w-full mt-3 min-h-[60px] rounded-md bg-[#27272A] border border-[rgba(255,255,255,0.06)] text-[14px] text-[#D4D4D8] placeholder-[#3F3F46] px-3 py-2.5 focus:outline-none focus:border-[#14B8A6] resize-none transition-colors"
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Config */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-[800] tracking-tight text-[#FAFAFA] mt-8 mb-3">
                  Configuración
                </h2>
                <p className="text-[16px] text-[#A1A1AA] mb-8">
                  Últimos ajustes antes de lanzar.
                </p>

                <div className="space-y-6">
                  {/* Rounds */}
                  <div className="rounded-lg bg-[#18181B] border border-[rgba(255,255,255,0.06)] p-6">
                    <div className="flex items-center justify-between mb-5">
                      <label className="text-[15px] text-[#A1A1AA]">Rondas</label>
                      <span className="text-[36px] font-[800] text-[#14B8A6]">
                        {maxRounds}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={maxRounds}
                      onChange={(e) => setMaxRounds(Number(e.target.value))}
                      className="w-full h-1.5 bg-[#27272A] rounded-full appearance-none cursor-pointer accent-[#14B8A6]"
                    />
                    <div className="flex justify-between mt-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span
                          key={n}
                          className={`text-[11px] ${
                            n === maxRounds ? "text-[#14B8A6] font-bold" : "text-[#3F3F46]"
                          }`}
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Rules */}
                  <div className="rounded-lg bg-[#18181B] border border-[rgba(255,255,255,0.06)] p-6">
                    <label className="text-[15px] text-[#A1A1AA] mb-3 block">
                      Reglas del debate
                    </label>
                    <textarea
                      value={rules}
                      onChange={(e) => setRules(e.target.value)}
                      className="w-full min-h-[100px] rounded-md bg-[#27272A] border border-[rgba(255,255,255,0.06)] text-[14px] text-[#D4D4D8] placeholder-[#3F3F46] px-3 py-2.5 focus:outline-none focus:border-[#14B8A6] resize-none transition-colors"
                    />
                  </div>

                  {/* Summary */}
                  <div
                    className="rounded-lg bg-[#18181B] border border-[rgba(255,255,255,0.06)] p-6"
                    style={{ borderTop: "3px solid #14B8A6" }}
                  >
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#FAFAFA] mb-4">
                      Resumen
                    </h3>
                    {[
                      ["Panelistas", `${panelists.length} expertos`],
                      ["Agentes ocultos", "3 (Moderador + Expertos + Integrador)"],
                      ["Rondas", String(maxRounds)],
                      ["Duración estimada", `~${maxRounds * 4} min`],
                    ].map(([k, v]) => (
                      <div
                        key={k}
                        className="flex justify-between py-2 text-[15px]"
                      >
                        <span className="text-[#52525B]">{k}</span>
                        <span className="text-[#FAFAFA] font-medium">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-lg border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.05)] p-4 text-[14px] text-[#EF4444]">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10">
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 1}
              className="flex items-center gap-1.5 px-4 py-2.5 text-[14px] text-[#52525B] hover:text-[#FAFAFA] disabled:opacity-30 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Anterior
            </button>

            {step < 3 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!isStepValid()}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-[#18181B] border border-[rgba(255,255,255,0.1)] text-[#FAFAFA] rounded-lg text-[14px] font-bold hover:bg-[#27272A] disabled:opacity-30 transition-colors"
              >
                Siguiente <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={launch}
                disabled={loading || !isStepValid()}
                className="group flex items-center gap-2 px-8 py-3 bg-[#14B8A6] text-white rounded-lg text-[14px] font-bold uppercase tracking-wider hover:bg-[#0D9488] disabled:opacity-30 transition-colors"
              >
                {loading ? (
                  "Iniciando..."
                ) : (
                  <>
                    Lanzar Foro
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
