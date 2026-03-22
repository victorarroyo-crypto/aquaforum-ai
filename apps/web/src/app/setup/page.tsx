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
import { ArrowLeft, ArrowRight, Plus, Trash2, Check } from "lucide-react";
import Link from "next/link";

const DEFAULT_PANELISTS = [
  { name: "Elena Vásquez", role: "CEO Water Utility · IA", persona: "CEO de una utility de agua líder en transformación digital. Experta en gemelos digitales de redes hidráulicas, mantenimiento predictivo con ML y automatización de operaciones. 20 años en el sector, evangelista de la IA como motor de eficiencia.", color: "#0D9488" },
  { name: "Marcus Chen", role: "CEO Tecnología IA", persona: "Fundador y CEO de una empresa de IA aplicada a infraestructura crítica. Deep tech, modelos fundacionales, agentes autónomos. Visión radical: la IA debe gestionar toda la cadena del agua de forma autónoma.", color: "#111111" },
  { name: "Sofia Andersen", role: "CEO Química del Agua", persona: "CEO de una multinacional de tratamiento químico del agua. PhD en ingeniería química. Experta en cómo ML optimiza dosificación de reactivos, reduce fangos y transforma EDAR. Perspectiva práctica e industrial.", color: "#059669" },
  { name: "Ahmed Al-Rashid", role: "CEO Desalación", persona: "CEO de la mayor empresa de desalación del Golfo Pérsico. Pionero en IA para optimización energética de ósmosis inversa. Visión global del nexo agua-energía-IA. Datos de plantas que producen 2M m³/día.", color: "#B45309" },
  { name: "Dr. Ingrid Hoffmann", role: "Analista Regulatoria · IA", persona: "Especialista en regulación de IA en servicios públicos esenciales. Asesora de la Comisión Europea en el AI Act. Experta en gobernanza algorítmica, ética de IA y marcos legales para la toma de decisiones automatizada en recursos hídricos.", color: "#4338CA" },
  { name: "James Okafor", role: "Analista Mercados · Inversión IA", persona: "Analista senior de inversión en tecnología para infraestructura del agua. Ex-Goldman Sachs, ahora consultor del Banco Mundial. Experto en valoración de startups de IA hídrica, modelos de ROI y tendencias de capital riesgo en water tech.", color: "#78716C" },
];

const DEFAULT_RULES = [
  "Intervenciones concisas y fundamentadas con datos.",
  "Cita casos reales y tecnologías específicas.",
  "Respeta las posiciones de otros panelistas al interpelar.",
  "El moderador puede intervenir para redirigir.",
];

const COLORS = ["#0D9488", "#111111", "#059669", "#B45309", "#4338CA", "#78716C", "#DC2626", "#0369A1"];

const STEPS = [
  { id: 1, label: "Tema" },
  { id: 2, label: "Panelistas" },
  { id: 3, label: "Configuración" },
];

const CYCLE_TOPICS = [
  "¿Dónde invertir primero en IA para agua?",
  "¿Qué barreras reales nos frenan?",
  "¿Qué compromiso concreto proponemos para 2030?",
  "¿Qué legado dejamos para la humanidad?",
];

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
      const config: ForumConfig = { topic, panelists, max_rounds: maxRounds, rules: rules.split("\n").filter((r) => r.trim()) };
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
      <header className="flex items-center justify-between px-6 sm:px-12 py-5 border-b border-rule">
        <Link href="/" className="flex items-center gap-2 text-ink-faint hover:text-ink transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-widest">AquaForum</span>
        </Link>
      </header>

      {/* Steps */}
      <div className="mx-auto w-full max-w-2xl px-6 pt-8 pb-4">
        <div className="flex items-center justify-center gap-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3">
              <button
                onClick={() => s.id < step && setStep(s.id)}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                  s.id === step ? "bg-ink text-paper" : s.id < step ? "bg-teal/10 text-teal" : "border border-rule text-ink-ghost"
                }`}
              >
                {s.id < step ? <Check className="h-3 w-3" /> : s.id}
              </button>
              <span className={`text-xs ${s.id === step ? "font-semibold text-ink" : "text-ink-ghost"}`}>{s.label}</span>
              {i < STEPS.length - 1 && <div className={`w-12 h-px ${s.id < step ? "bg-teal" : "bg-rule"}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 sm:px-12 pb-8">
        <div className="mx-auto max-w-2xl">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <h2 className="text-headline text-ink mb-2 mt-8">¿Sobre qué debatimos?</h2>
                <p className="text-ink-muted mb-8">Define el tema central. Los 4 ciclos del debate serán progresivos.</p>
                <Textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="El impacto de la IA en la gestión del agua..."
                  className="min-h-[120px] rounded border-rule bg-paper text-ink text-base placeholder:text-ink-ghost focus:border-teal/40 resize-none"
                />
                <div className="mt-6 border border-rule rounded p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal mb-4">4 ciclos progresivos</p>
                  <div className="space-y-3">
                    {CYCLE_TOPICS.map((c, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="text-xs font-serif text-teal/40 pt-0.5">{i + 1}</span>
                        <span className="text-sm text-ink-muted">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="flex items-center justify-between mt-8 mb-8">
                  <div>
                    <h2 className="text-headline text-ink mb-1">Panelistas</h2>
                    <p className="text-ink-muted text-sm">4 CEOs + 2 Analistas. El Moderador, Panel Experto e Integrador son agentes ocultos.</p>
                  </div>
                  <Button onClick={addPanelist} disabled={panelists.length >= 8} variant="outline" className="rounded border-rule text-ink-muted hover:border-ink-ghost">
                    <Plus className="mr-1 h-3.5 w-3.5" /> Añadir
                  </Button>
                </div>
                <div className="space-y-4">
                  {panelists.map((p, i) => (
                    <motion.div key={i} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-rule rounded p-5" style={{ borderLeft: `3px solid ${p.color}` }}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: p.color }}>
                            {(p.name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-ink">{p.name || "Nuevo"}</div>
                            <div className="text-[11px] text-ink-faint">{p.role || "Sin rol"}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {COLORS.slice(0, 6).map((c) => (
                            <button key={c} onClick={() => updatePanelist(i, "color", c)} className={`h-3.5 w-3.5 rounded-full transition-all hover:scale-125 ${p.color === c ? "ring-2 ring-ink-ghost ring-offset-2" : "opacity-30 hover:opacity-100"}`} style={{ backgroundColor: c }} />
                          ))}
                          <div className="ml-1 h-3 w-px bg-rule" />
                          <Button variant="ghost" size="sm" onClick={() => removePanelist(i)} disabled={panelists.length <= 2} className="h-6 w-6 p-0 text-ink-ghost hover:text-red-600 rounded">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input value={p.name} onChange={(e) => updatePanelist(i, "name", e.target.value)} placeholder="Nombre" className="rounded border-rule bg-paper placeholder:text-ink-ghost text-sm" />
                        <Input value={p.role} onChange={(e) => updatePanelist(i, "role", e.target.value)} placeholder="Rol" className="rounded border-rule bg-paper placeholder:text-ink-ghost text-sm" />
                      </div>
                      <Textarea value={p.persona} onChange={(e) => updatePanelist(i, "persona", e.target.value)} placeholder="Perfil y perspectiva..." className="mt-3 min-h-[50px] rounded border-rule bg-paper text-sm placeholder:text-ink-ghost resize-none" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <h2 className="text-headline text-ink mb-2 mt-8">Configuración</h2>
                <p className="text-ink-muted mb-8">Ajusta los parámetros del debate.</p>
                <div className="space-y-6">
                  <div className="border border-rule rounded p-5">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm text-ink-muted">Rondas</label>
                      <span className="text-2xl font-serif text-teal">{maxRounds}</span>
                    </div>
                    <Slider value={[maxRounds]} onValueChange={(v) => setMaxRounds(Array.isArray(v) ? v[0] : v)} min={1} max={5} step={1} />
                  </div>
                  <div className="border border-rule rounded p-5">
                    <label className="text-sm text-ink-muted mb-3 block">Reglas del debate</label>
                    <Textarea value={rules} onChange={(e) => setRules(e.target.value)} className="min-h-[100px] rounded border-rule bg-paper text-sm placeholder:text-ink-ghost resize-none" />
                  </div>
                  {/* Summary */}
                  <div className="border-t-2 border-t-teal border border-rule rounded p-5">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink mb-4">Resumen</h3>
                    <div className="space-y-2.5 text-sm">
                      {[
                        ["Tema", topic.slice(0, 60) + (topic.length > 60 ? "..." : "")],
                        ["Panelistas", `${panelists.length} expertos`],
                        ["Agentes ocultos", "Moderador, Panel Experto, Integrador"],
                        ["Rondas", String(maxRounds)],
                        ["Duración estimada", `~${maxRounds * 4} minutos`],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-ink-faint">{k}</span>
                          <span className="text-ink text-right max-w-[55%] truncate">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between mt-10">
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 1} className="text-ink-faint">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Anterior
            </Button>
            {step < 3 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()} className="bg-ink text-paper hover:bg-teal-dark disabled:opacity-30 rounded px-6">
                Siguiente <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button onClick={handleStart} disabled={loading || !canProceed()} className="group bg-ink text-paper hover:bg-teal-dark disabled:opacity-30 rounded px-8 py-3 text-sm font-medium uppercase tracking-wide">
                {loading ? "Iniciando..." : <>Lanzar Foro <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" /></>}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
