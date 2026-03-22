"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { api, type ForumConfig } from "@/lib/api";
import { useForumStore } from "@/store/forum-store";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Droplets,
  Check,
  MessageSquare,
  Users,
  Settings,
} from "lucide-react";
import Link from "next/link";

const DEFAULT_PANELISTS = [
  {
    name: "Elena R\u00edos",
    role: "CTO Water Utility \u00b7 IA/Gemelos Digitales",
    persona:
      "CTO de una utility de agua que lidera la transformaci\u00f3n digital con IA. Experta en gemelos digitales de redes hidr\u00e1ulicas, mantenimiento predictivo con ML y optimizaci\u00f3n de operaciones con algoritmos de IA. 15 a\u00f1os en el sector.",
    color: "#0F766E",
  },
  {
    name: "Marco Vallejo",
    role: "Gobernanza IA \u00b7 Pol\u00edtica H\u00eddrica",
    persona:
      "Especialista en regulaci\u00f3n de IA aplicada a servicios p\u00fablicos esenciales. Experto en el AI Act europeo, gobernanza algor\u00edtmica y marcos \u00e9ticos para el uso de IA en gesti\u00f3n de recursos h\u00eddricos. Asesor de la Comisi\u00f3n Europea.",
    color: "#4338CA",
  },
  {
    name: "Sof\u00eda Chen",
    role: "Data Scientist \u00b7 EDAR/ML",
    persona:
      "Data scientist especializada en machine learning para optimizaci\u00f3n de estaciones depuradoras (EDAR). Desarrolla modelos de IA para dosificaci\u00f3n de reactivos, predicci\u00f3n de calidad de efluente y reducci\u00f3n energ\u00e9tica. PhD en ingenier\u00eda ambiental computacional.",
    color: "#059669",
  },
  {
    name: "Carlos Mendoza",
    role: "Economista \u00b7 ROI de IA en Agua",
    persona:
      "Economista especializado en an\u00e1lisis de retorno de inversi\u00f3n de tecnolog\u00edas de IA en el sector del agua. Consultor del Banco Mundial en proyectos de digitalizaci\u00f3n h\u00eddrica. Experto en modelos de financiaci\u00f3n de infraestructura inteligente.",
    color: "#D97706",
  },
];

const DEFAULT_RULES = [
  "Mant\u00e9n las intervenciones concisas y fundamentadas.",
  "Cita datos reales cuando sea posible.",
  "Respeta las posiciones de otros panelistas incluso al interpelar.",
  "El moderador puede intervenir para redirigir el debate.",
];

const COLORS = [
  "#0F766E",
  "#059669",
  "#4338CA",
  "#D97706",
  "#DC2626",
  "#78716C",
];

const STEPS = [
  { id: 1, label: "Tema", icon: MessageSquare },
  { id: 2, label: "Panelistas", icon: Users },
  { id: 3, label: "Configuraci\u00f3n", icon: Settings },
];

export default function SetupPage() {
  const router = useRouter();
  const setSession = useForumStore((s) => s.setSession);

  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState(
    "Impacto de la Inteligencia Artificial en la gesti\u00f3n del agua: oportunidades, riesgos y transformaci\u00f3n del sector h\u00eddrico"
  );
  const [panelists, setPanelists] = useState(DEFAULT_PANELISTS);
  const [maxRounds, setMaxRounds] = useState(3);
  const [rules, setRules] = useState(DEFAULT_RULES.join("\n"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addPanelist = () => {
    if (panelists.length >= 8) return;
    setPanelists([
      ...panelists,
      {
        name: "",
        role: "",
        persona: "",
        color: COLORS[panelists.length % COLORS.length],
      },
    ]);
  };

  const removePanelist = (i: number) => {
    if (panelists.length <= 2) return;
    setPanelists(panelists.filter((_, idx) => idx !== i));
  };

  const updatePanelist = (i: number, field: string, value: string) => {
    const u = [...panelists];
    u[i] = { ...u[i], [field]: value };
    setPanelists(u);
  };

  const canProceed = () => {
    if (step === 1) return topic.trim().length > 10;
    if (step === 2)
      return (
        panelists.every((p) => p.name && p.role) && panelists.length >= 2
      );
    return true;
  };

  const handleStart = async () => {
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
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al iniciar el foro"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-stone-200">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-stone-500 hover:text-stone-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <Droplets className="h-4 w-4 text-teal" />
          <span className="text-sm font-semibold text-stone-700">
            AquaForum
          </span>
        </Link>
      </header>

      {/* Step indicator */}
      <div className="mx-auto w-full max-w-2xl px-6 pt-8 pb-6">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className="flex items-center flex-1 last:flex-none"
            >
              <button
                onClick={() => s.id < step && setStep(s.id)}
                className={`flex items-center gap-2.5 transition-all ${
                  s.id === step
                    ? "text-teal"
                    : s.id < step
                    ? "text-teal/60"
                    : "text-stone-300"
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                    s.id === step
                      ? "bg-teal text-white"
                      : s.id < step
                      ? "bg-teal/10 text-teal"
                      : "bg-stone-100 text-stone-400"
                  }`}
                >
                  {s.id < step ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <s.icon className="h-4 w-4" />
                  )}
                </div>
                <span className="text-sm font-medium hidden sm:block">
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-4 h-px flex-1 transition-colors ${
                    s.id < step ? "bg-teal/30" : "bg-stone-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 px-6 pb-8">
        <div className="mx-auto max-w-2xl">
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
                <h2 className="text-editorial-subheadline text-stone-900 mb-2">
                  Sobre que quieres debatir?
                </h2>
                <p className="text-stone-500 mb-8">
                  Define el tema central del foro. Cuanto mas especifico,
                  mejores seran las intervenciones.
                </p>
                <div className="editorial-card rounded-xl p-6">
                  <Textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ej: Estrategias para la reutilizaci\u00f3n de aguas residuales en zonas de estr\u00e9s h\u00eddrico..."
                    className="min-h-[140px] rounded-lg border-stone-200 bg-stone-50 text-lg text-stone-800 placeholder:text-stone-400 focus:border-teal/40 focus:ring-teal/20 resize-none"
                  />
                  <div className="mt-3 text-right text-xs text-stone-400">
                    {topic.length} caracteres
                  </div>
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
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-editorial-subheadline text-stone-900 mb-2">
                      Panelistas
                    </h2>
                    <p className="text-stone-500">
                      Configura los expertos que participaran en el debate.
                    </p>
                  </div>
                  <Button
                    onClick={addPanelist}
                    disabled={panelists.length >= 8}
                    variant="outline"
                    className="rounded-lg border-stone-300 text-stone-600 hover:bg-stone-100"
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Anadir
                  </Button>
                </div>

                <div className="space-y-4">
                  {panelists.map((p, i) => (
                    <motion.div
                      key={i}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="editorial-card rounded-xl p-5"
                      style={{ borderLeft: `3px solid ${p.color}` }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm text-white"
                            style={{ backgroundColor: p.color }}
                          >
                            {(p.name || "?")
                              .split(" ")
                              .map((w) => w[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-stone-800">
                              {p.name || "Nuevo panelista"}
                            </div>
                            <div className="text-xs text-stone-400">
                              {p.role || "Sin rol"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {COLORS.map((c) => (
                            <button
                              key={c}
                              onClick={() =>
                                updatePanelist(i, "color", c)
                              }
                              className={`h-4 w-4 rounded-full transition-all hover:scale-125 ${
                                p.color === c
                                  ? "ring-2 ring-stone-400 ring-offset-2"
                                  : "opacity-40 hover:opacity-100"
                              }`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                          <div className="ml-2 h-4 w-px bg-stone-200" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePanelist(i)}
                            disabled={panelists.length <= 2}
                            className="h-7 w-7 p-0 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          value={p.name}
                          onChange={(e) =>
                            updatePanelist(i, "name", e.target.value)
                          }
                          placeholder="Nombre"
                          className="rounded-lg border-stone-200 bg-stone-50 placeholder:text-stone-400"
                        />
                        <Input
                          value={p.role}
                          onChange={(e) =>
                            updatePanelist(i, "role", e.target.value)
                          }
                          placeholder="Rol (CTO, Analista...)"
                          className="rounded-lg border-stone-200 bg-stone-50 placeholder:text-stone-400"
                        />
                      </div>
                      <Textarea
                        value={p.persona}
                        onChange={(e) =>
                          updatePanelist(i, "persona", e.target.value)
                        }
                        placeholder="Describe la perspectiva y experiencia de este panelista..."
                        className="mt-3 min-h-[60px] rounded-lg border-stone-200 bg-stone-50 text-sm placeholder:text-stone-400 resize-none"
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Settings */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-editorial-subheadline text-stone-900 mb-2">
                  Configuraci\u00f3n
                </h2>
                <p className="text-stone-500 mb-8">
                  Ajusta los par\u00e1metros del debate.
                </p>

                <div className="space-y-6">
                  <div className="editorial-card rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-medium text-stone-700">
                        Rondas de debate
                      </label>
                      <span className="text-2xl font-bold text-teal font-editorial">
                        {maxRounds}
                      </span>
                    </div>
                    <Slider
                      value={[maxRounds]}
                      onValueChange={(v) =>
                        setMaxRounds(Array.isArray(v) ? v[0] : v)
                      }
                      min={1}
                      max={5}
                      step={1}
                    />
                    <p className="mt-3 text-xs text-stone-400">
                      Cada ronda incluye debate + an\u00e1lisis experto +
                      integraci\u00f3n.
                    </p>
                  </div>

                  <div className="editorial-card rounded-xl p-6">
                    <label className="text-sm font-medium text-stone-700 mb-3 block">
                      Reglas del debate
                    </label>
                    <Textarea
                      value={rules}
                      onChange={(e) => setRules(e.target.value)}
                      className="min-h-[120px] rounded-lg border-stone-200 bg-stone-50 text-sm placeholder:text-stone-400 resize-none"
                    />
                  </div>

                  {/* Summary */}
                  <div className="editorial-card rounded-xl p-6 border-t-3 border-t-teal accent-top">
                    <h3 className="text-sm font-semibold text-stone-800 mb-4">
                      Resumen
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-stone-500">Tema</span>
                        <span className="text-right max-w-[60%] truncate text-stone-700">
                          {topic}
                        </span>
                      </div>
                      <div className="h-px bg-stone-100" />
                      <div className="flex justify-between">
                        <span className="text-stone-500">Panelistas</span>
                        <span className="text-stone-700">
                          {panelists.length} expertos
                        </span>
                      </div>
                      <div className="h-px bg-stone-100" />
                      <div className="flex justify-between">
                        <span className="text-stone-500">Rondas</span>
                        <span className="text-stone-700">{maxRounds}</span>
                      </div>
                      <div className="h-px bg-stone-100" />
                      <div className="flex justify-between">
                        <span className="text-stone-500">
                          Duraci\u00f3n estimada
                        </span>
                        <span className="text-stone-700">
                          ~{maxRounds * 3} minutos
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 1}
              className="rounded-lg text-stone-500"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Anterior
            </Button>

            {step < 3 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
                className="rounded-lg bg-teal text-white hover:bg-teal-dark disabled:opacity-30"
              >
                Siguiente
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleStart}
                disabled={loading || !canProceed()}
                className="group btn-primary rounded-lg px-8 py-3 text-sm font-semibold disabled:opacity-30"
              >
                {loading ? (
                  <>
                    <Droplets className="mr-2 h-4 w-4 animate-pulse" />
                    Iniciando...
                  </>
                ) : (
                  <>
                    Lanzar Foro
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
