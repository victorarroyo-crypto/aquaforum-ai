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

const PANELISTS = [
  { name: "Elena Vásquez", role: "CEO Water Utility · IA", persona: "CEO de utility de agua líder en transformación digital. Experta en gemelos digitales, mantenimiento predictivo con ML, automatización de operaciones. 20 años en el sector.", color: "#0D9488" },
  { name: "Marcus Chen", role: "CEO Tecnología IA", persona: "Fundador de empresa de IA para infraestructura crítica. Visión radical: la IA debe gestionar toda la cadena del agua de forma autónoma. Deep tech, agentes, modelos fundacionales.", color: "#0A0A0A" },
  { name: "Sofia Andersen", role: "CEO Química del Agua", persona: "CEO de multinacional de tratamiento químico. PhD en ingeniería química. ML optimiza dosificación de reactivos, reduce fangos, transforma EDAR. Perspectiva industrial.", color: "#059669" },
  { name: "Ahmed Al-Rashid", role: "CEO Desalación", persona: "CEO de la mayor empresa de desalación del Golfo. Pionero en IA para optimización energética de ósmosis inversa. Visión global nexo agua-energía-IA. Plantas de 2M m³/día.", color: "#B45309" },
  { name: "Dr. Ingrid Hoffmann", role: "Analista Regulatoria · IA", persona: "Regulación de IA en servicios públicos. Asesora CE en AI Act. Gobernanza algorítmica, ética de IA, marcos legales para decisiones automatizadas en recursos hídricos.", color: "#4338CA" },
  { name: "James Okafor", role: "Analista Mercados · Inversión", persona: "Inversión en tech para agua. Ex-Goldman, consultor Banco Mundial. Valoración startups IA hídrica, ROI, tendencias de capital riesgo en water tech.", color: "#78716C" },
];

const RULES = ["Intervenciones concisas con datos.", "Cita casos reales y tecnologías.", "Respeta posiciones al interpelar.", "El moderador puede redirigir."];
const COLORS = ["#0D9488", "#0A0A0A", "#059669", "#B45309", "#4338CA", "#78716C", "#DC2626", "#0369A1"];
const CYCLES = ["¿Dónde invertir primero en IA para agua?", "¿Qué barreras reales nos frenan?", "¿Qué compromiso concreto para 2030?", "¿Qué legado dejamos para la humanidad?"];

export default function SetupPage() {
  const router = useRouter();
  const setSession = useForumStore((s) => s.setSession);
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState("Impacto de la Inteligencia Artificial en la gestión del agua: oportunidades, riesgos y transformación del sector hídrico");
  const [panelists, setPanelists] = useState(PANELISTS);
  const [maxRounds, setMaxRounds] = useState(4);
  const [rules, setRules] = useState(RULES.join("\n"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = () => { if (panelists.length < 8) setPanelists([...panelists, { name: "", role: "", persona: "", color: COLORS[panelists.length % COLORS.length] }]); };
  const remove = (i: number) => { if (panelists.length > 2) setPanelists(panelists.filter((_, j) => j !== i)); };
  const update = (i: number, f: string, v: string) => { const u = [...panelists]; u[i] = { ...u[i], [f]: v }; setPanelists(u); };
  const ok = () => step === 1 ? topic.trim().length > 10 : step === 2 ? panelists.every((p) => p.name && p.role) && panelists.length >= 2 : true;

  const launch = async () => {
    setLoading(true); setError(null);
    try {
      const config: ForumConfig = { topic, panelists, max_rounds: maxRounds, rules: rules.split("\n").filter((r) => r.trim()) };
      const { session_id } = await api.startForum(config);
      setSession(session_id, config);
      router.push(`/forum/${session_id}`);
    } catch (e) { setError(e instanceof Error ? e.message : "Error"); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center px-6 md:px-12 py-5 border-b border-edge">
        <Link href="/" className="flex items-center gap-2 text-light hover:text-dark transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-[0.2em]">AquaForum</span>
        </Link>
      </header>

      {/* Steps */}
      <div className="mx-auto w-full max-w-3xl px-6 pt-8 pb-4 flex items-center justify-center gap-6">
        {[{ id: 1, l: "Tema" }, { id: 2, l: "Panel" }, { id: 3, l: "Config" }].map((s, i) => (
          <div key={s.id} className="flex items-center gap-3">
            <button onClick={() => s.id < step && setStep(s.id)} className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${s.id === step ? "bg-dark text-white" : s.id < step ? "bg-accent/10 text-accent" : "border border-edge text-faint"}`}>
              {s.id < step ? <Check className="h-3.5 w-3.5" /> : s.id}
            </button>
            <span className={`text-sm ${s.id === step ? "font-bold text-dark" : "text-faint"}`}>{s.l}</span>
            {i < 2 && <div className={`w-10 h-px ${s.id < step ? "bg-accent" : "bg-edge"}`} />}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 px-6 md:px-12 pb-8">
        <div className="mx-auto max-w-3xl">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-black tracking-tight text-dark mt-8 mb-3">¿Sobre qué debatimos?</h2>
                <p className="text-mid mb-8">Define el tema. Los 4 ciclos serán progresivos.</p>
                <Textarea value={topic} onChange={(e) => setTopic(e.target.value)} className="min-h-[120px] rounded border-edge text-base placeholder:text-faint focus:border-accent/40 resize-none" />
                <div className="mt-6 border border-edge rounded p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-4">4 ciclos</p>
                  {CYCLES.map((c, i) => (
                    <div key={i} className="flex gap-3 py-1.5"><span className="text-sm font-bold text-accent/30">{i + 1}</span><span className="text-sm text-mid">{c}</span></div>
                  ))}
                </div>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-center justify-between mt-8 mb-8">
                  <div>
                    <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-black tracking-tight text-dark mb-1">Panelistas</h2>
                    <p className="text-mid text-sm">4 CEOs + 2 Analistas. Moderador, Expertos e Integrador son agentes ocultos.</p>
                  </div>
                  <Button onClick={add} disabled={panelists.length >= 8} variant="outline" className="border-edge text-mid hover:border-dark"><Plus className="mr-1 h-3.5 w-3.5" /> Añadir</Button>
                </div>
                <div className="space-y-4">
                  {panelists.map((p, i) => (
                    <motion.div key={i} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-edge rounded p-5" style={{ borderLeft: `3px solid ${p.color}` }}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: p.color }}>{(p.name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}</div>
                          <div><div className="text-sm font-bold text-dark">{p.name || "Nuevo"}</div><div className="text-[11px] text-light">{p.role || "Sin rol"}</div></div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {COLORS.slice(0, 6).map((c) => (<button key={c} onClick={() => update(i, "color", c)} className={`h-3.5 w-3.5 rounded-full hover:scale-125 transition-transform ${p.color === c ? "ring-2 ring-faint ring-offset-2" : "opacity-30 hover:opacity-100"}`} style={{ backgroundColor: c }} />))}
                          <div className="ml-1 h-3 w-px bg-edge" />
                          <Button variant="ghost" size="sm" onClick={() => remove(i)} disabled={panelists.length <= 2} className="h-6 w-6 p-0 text-faint hover:text-red-600"><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input value={p.name} onChange={(e) => update(i, "name", e.target.value)} placeholder="Nombre" className="border-edge placeholder:text-faint text-sm" />
                        <Input value={p.role} onChange={(e) => update(i, "role", e.target.value)} placeholder="Rol" className="border-edge placeholder:text-faint text-sm" />
                      </div>
                      <Textarea value={p.persona} onChange={(e) => update(i, "persona", e.target.value)} placeholder="Perfil y perspectiva..." className="mt-3 min-h-[50px] border-edge text-sm placeholder:text-faint resize-none" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-black tracking-tight text-dark mt-8 mb-3">Configuración</h2>
                <p className="text-mid mb-8">Últimos ajustes antes de lanzar.</p>
                <div className="space-y-6">
                  <div className="border border-edge rounded p-5">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm text-mid">Rondas</label>
                      <span className="text-3xl font-black text-accent">{maxRounds}</span>
                    </div>
                    <Slider value={[maxRounds]} onValueChange={(v) => setMaxRounds(Array.isArray(v) ? v[0] : v)} min={1} max={5} step={1} />
                  </div>
                  <div className="border border-edge rounded p-5">
                    <label className="text-sm text-mid mb-3 block">Reglas</label>
                    <Textarea value={rules} onChange={(e) => setRules(e.target.value)} className="min-h-[100px] border-edge text-sm resize-none" />
                  </div>
                  <div className="border border-edge border-t-2 border-t-accent rounded p-5">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-dark mb-4">Resumen</h3>
                    {[["Panelistas", `${panelists.length} expertos`], ["Agentes ocultos", "3 (Moderador + Expertos + Integrador)"], ["Rondas", String(maxRounds)], ["Duración", `~${maxRounds * 4} min`]].map(([k, v]) => (
                      <div key={k} className="flex justify-between py-1.5 text-sm"><span className="text-light">{k}</span><span className="text-dark font-medium">{v}</span></div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && <div className="mt-4 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

          <div className="flex items-center justify-between mt-10">
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 1} className="text-light"><ArrowLeft className="mr-1 h-3.5 w-3.5" /> Anterior</Button>
            {step < 3 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!ok()} className="bg-dark text-white hover:bg-accent disabled:opacity-30 rounded px-6 font-bold">Siguiente <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>
            ) : (
              <Button onClick={launch} disabled={loading || !ok()} className="group bg-dark text-white hover:bg-accent disabled:opacity-30 rounded px-8 py-3 font-bold uppercase tracking-wider text-sm">
                {loading ? "Iniciando..." : <>Lanzar Foro <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" /></>}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
