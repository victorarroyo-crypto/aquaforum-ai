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
  Waves,
  Zap,
  Users,
  Settings,
  Rocket,
  Check,
} from "lucide-react";
import Link from "next/link";

const DEFAULT_PANELISTS = [
  { name: "Elena Ríos", role: "CEO Utility", persona: "CEO de una empresa de servicios de agua con 20 años de experiencia. Enfocada en eficiencia operativa, sostenibilidad financiera y transformación digital del sector.", color: "#06B6D4" },
  { name: "Marco Vallejo", role: "Analista Regulatorio", persona: "Experto en regulación del agua con experiencia en la Directiva Marco del Agua de la UE. Conoce profundamente el marco normativo y las políticas hídricas.", color: "#A78BFA" },
  { name: "Sofía Chen", role: "Ingeniera Ambiental", persona: "Ingeniera especializada en tratamiento de aguas y economía circular. Defensora de soluciones basadas en la naturaleza y tecnologías de reutilización.", color: "#34D399" },
  { name: "Carlos Mendoza", role: "Economista del Agua", persona: "Economista especializado en valoración de recursos hídricos, tarifas del agua y financiación de infraestructuras. Consultor del Banco Mundial.", color: "#FBBF24" },
];

const DEFAULT_RULES = [
  "Mantén las intervenciones concisas y fundamentadas.",
  "Cita datos reales cuando sea posible.",
  "Respeta las posiciones de otros panelistas incluso al interpelar.",
  "El moderador puede intervenir para redirigir el debate.",
];

const COLORS = ["#06B6D4", "#34D399", "#38BDF8", "#A78BFA", "#FBBF24", "#F87171"];

const STEPS = [
  { id: 1, label: "Tema", icon: Zap },
  { id: 2, label: "Panelistas", icon: Users },
  { id: 3, label: "Configuración", icon: Settings },
];

export default function SetupPage() {
  const router = useRouter();
  const setSession = useForumStore((s) => s.setSession);

  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState(
    "Estrategias innovadoras para la gestión sostenible del agua urbana en el contexto del cambio climático"
  );
  const [panelists, setPanelists] = useState(DEFAULT_PANELISTS);
  const [maxRounds, setMaxRounds] = useState(3);
  const [rules, setRules] = useState(DEFAULT_RULES.join("\n"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addPanelist = () => {
    if (panelists.length >= 8) return;
    setPanelists([...panelists, { name: "", role: "", persona: "", color: COLORS[panelists.length % COLORS.length] }]);
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
    if (step === 2) return panelists.every((p) => p.name && p.role) && panelists.length >= 2;
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
      setError(err instanceof Error ? err.message : "Error al iniciar el foro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <Waves className="h-5 w-5 text-ocean/60" />
          <span className="text-sm font-medium">AquaForum</span>
        </Link>
      </header>

      {/* Step indicator */}
      <div className="mx-auto w-full max-w-2xl px-6 pt-4 pb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => s.id < step && setStep(s.id)}
                className={`flex items-center gap-2 transition-all ${
                  s.id === step ? "text-ocean" : s.id < step ? "text-emerald" : "text-muted-foreground/30"
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                    s.id === step
                      ? "bg-ocean/15 text-ocean ring-2 ring-ocean/20"
                      : s.id < step
                      ? "bg-emerald/15 text-emerald"
                      : "bg-white/[0.03] text-muted-foreground/30"
                  }`}
                >
                  {s.id < step ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                </div>
                <span className="text-sm font-medium hidden sm:block">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`mx-4 h-px flex-1 ${s.id < step ? "bg-emerald/20" : "bg-white/[0.04]"}`} />
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
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <h2 className="text-3xl font-bold mb-2">¿Sobre qué quieres debatir?</h2>
                <p className="text-muted-foreground mb-8">Define el tema central del foro. Cuanto más específico, mejores serán las intervenciones.</p>
                <div className="glass rounded-2xl p-6">
                  <Textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ej: Estrategias para la reutilización de aguas residuales en zonas de estrés hídrico..."
                    className="min-h-[140px] rounded-xl border-white/[0.04] bg-white/[0.02] text-lg placeholder:text-muted-foreground/30 focus:border-ocean/20 resize-none"
                  />
                  <div className="mt-3 text-right text-xs text-muted-foreground/30">{topic.length} caracteres</div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Panelists */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Panelistas</h2>
                    <p className="text-muted-foreground">Configura los expertos que participarán en el debate.</p>
                  </div>
                  <Button onClick={addPanelist} disabled={panelists.length >= 8} className="rounded-xl bg-ocean/10 text-ocean border-0 hover:bg-ocean/20">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Añadir
                  </Button>
                </div>

                <div className="space-y-4">
                  {panelists.map((p, i) => (
                    <motion.div
                      key={i}
                      layout
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass rounded-2xl p-5 group"
                      style={{ borderLeft: `3px solid ${p.color}` }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm"
                            style={{ backgroundColor: `${p.color}12`, color: p.color }}
                          >
                            {(p.name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold">{p.name || "Nuevo panelista"}</div>
                            <div className="text-xs text-muted-foreground/40">{p.role || "Sin rol"}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {COLORS.map((c) => (
                            <button
                              key={c}
                              onClick={() => updatePanelist(i, "color", c)}
                              className={`h-4 w-4 rounded-full transition-all hover:scale-125 ${
                                p.color === c ? "ring-2 ring-white/50 ring-offset-1 ring-offset-[#030712]" : "opacity-40 hover:opacity-100"
                              }`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                          <div className="ml-2 h-4 w-px bg-white/[0.06]" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePanelist(i)}
                            disabled={panelists.length <= 2}
                            className="h-7 w-7 p-0 text-muted-foreground/30 hover:text-coral hover:bg-coral/10 rounded-lg"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Input value={p.name} onChange={(e) => updatePanelist(i, "name", e.target.value)} placeholder="Nombre" className="rounded-lg border-white/[0.04] bg-white/[0.02] placeholder:text-muted-foreground/25" />
                        <Input value={p.role} onChange={(e) => updatePanelist(i, "role", e.target.value)} placeholder="Rol (CEO, Analista...)" className="rounded-lg border-white/[0.04] bg-white/[0.02] placeholder:text-muted-foreground/25" />
                      </div>
                      <Textarea
                        value={p.persona}
                        onChange={(e) => updatePanelist(i, "persona", e.target.value)}
                        placeholder="Describe la perspectiva y experiencia de este panelista..."
                        className="mt-3 min-h-[60px] rounded-lg border-white/[0.04] bg-white/[0.02] text-sm placeholder:text-muted-foreground/25 resize-none"
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Settings */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <h2 className="text-3xl font-bold mb-2">Configuración</h2>
                <p className="text-muted-foreground mb-8">Ajusta los parámetros del debate.</p>

                <div className="space-y-6">
                  <div className="glass rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-medium">Rondas de debate</label>
                      <span className="text-2xl font-bold text-ocean">{maxRounds}</span>
                    </div>
                    <Slider value={[maxRounds]} onValueChange={(v) => setMaxRounds(Array.isArray(v) ? v[0] : v)} min={1} max={5} step={1} />
                    <p className="mt-3 text-xs text-muted-foreground/40">Cada ronda incluye debate + análisis experto + integración.</p>
                  </div>

                  <div className="glass rounded-2xl p-6">
                    <label className="text-sm font-medium mb-3 block">Reglas del debate</label>
                    <Textarea value={rules} onChange={(e) => setRules(e.target.value)} className="min-h-[120px] rounded-lg border-white/[0.04] bg-white/[0.02] text-sm placeholder:text-muted-foreground/25 resize-none" />
                  </div>

                  {/* Summary */}
                  <div className="glass rounded-2xl p-6 gradient-border">
                    <h3 className="text-sm font-semibold mb-4">Resumen</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tema</span>
                        <span className="text-right max-w-[60%] truncate text-foreground/80">{topic}</span>
                      </div>
                      <div className="h-px bg-white/[0.04]" />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Panelistas</span>
                        <span className="text-foreground/80">{panelists.length} expertos</span>
                      </div>
                      <div className="h-px bg-white/[0.04]" />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rondas</span>
                        <span className="text-foreground/80">{maxRounds}</span>
                      </div>
                      <div className="h-px bg-white/[0.04]" />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duración estimada</span>
                        <span className="text-foreground/80">~{maxRounds * 3} minutos</span>
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
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 rounded-xl border border-coral/10 bg-coral/5 p-4 text-sm text-coral">
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
              className="rounded-xl text-muted-foreground"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Anterior
            </Button>

            {step < 3 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
                className="rounded-xl bg-ocean/10 text-ocean border-0 hover:bg-ocean/20 disabled:opacity-30"
              >
                Siguiente
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleStart}
                disabled={loading || !canProceed()}
                className="group rounded-full bg-gradient-to-r from-ocean to-sky px-8 py-3 text-sm font-semibold text-[#030712] glow-btn transition-all hover:brightness-110 disabled:opacity-30 disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <Waves className="mr-2 h-4 w-4 animate-pulse" />
                    Iniciando...
                  </>
                ) : (
                  <>
                    <Rocket className="mr-2 h-4 w-4" />
                    Lanzar Foro
                    <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
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
