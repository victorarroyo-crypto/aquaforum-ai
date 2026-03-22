"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { AgentBadge } from "@/components/agent-badge";
import { api, type ForumConfig } from "@/lib/api";
import { useForumStore } from "@/store/forum-store";
import {
  Plus,
  Trash2,
  Waves,
  Droplets,
  Zap,
  Users,
  Settings,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const DEFAULT_PANELISTS = [
  {
    name: "Elena Ríos",
    role: "CEO Utility",
    persona:
      "CEO de una empresa de servicios de agua con 20 años de experiencia. Enfocada en eficiencia operativa, sostenibilidad financiera y transformación digital del sector.",
    color: "#06B6D4",
  },
  {
    name: "Marco Vallejo",
    role: "Analista Regulatorio",
    persona:
      "Experto en regulación del agua con experiencia en la Directiva Marco del Agua de la UE. Conoce profundamente el marco normativo y las políticas hídricas.",
    color: "#A78BFA",
  },
  {
    name: "Sofía Chen",
    role: "Ingeniera Ambiental",
    persona:
      "Ingeniera especializada en tratamiento de aguas y economía circular. Defensora de soluciones basadas en la naturaleza y tecnologías de reutilización.",
    color: "#34D399",
  },
  {
    name: "Carlos Mendoza",
    role: "Economista del Agua",
    persona:
      "Economista especializado en valoración de recursos hídricos, tarifas del agua y financiación de infraestructuras. Consultor del Banco Mundial.",
    color: "#FBBF24",
  },
];

const DEFAULT_RULES = [
  "Mantén las intervenciones concisas y fundamentadas.",
  "Cita datos reales cuando sea posible.",
  "Respeta las posiciones de otros panelistas incluso al interpelar.",
  "El moderador puede intervenir para redirigir el debate.",
];

const COLORS = ["#06B6D4", "#34D399", "#38BDF8", "#A78BFA", "#FBBF24", "#F87171"];

export default function ConfigScreen() {
  const router = useRouter();
  const setSession = useForumStore((s) => s.setSession);

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

  const removePanelist = (index: number) => {
    if (panelists.length <= 2) return;
    setPanelists(panelists.filter((_, i) => i !== index));
  };

  const updatePanelist = (index: number, field: string, value: string) => {
    const updated = [...panelists];
    updated[index] = { ...updated[index], [field]: value };
    setPanelists(updated);
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
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-10">
      {/* ─── Hero header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center"
      >
        <div className="mb-6 flex items-center justify-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-ocean/20 blur-xl" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-ocean to-violet/60">
              <Waves className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
        <h1 className="mb-2 text-5xl font-bold tracking-tight">
          Aqua<span className="text-gradient">Forum</span>{" "}
          <span className="text-foreground/50 font-light">AI</span>
        </h1>
        <p className="mx-auto max-w-lg text-lg text-muted-foreground">
          Foro de expertos con inteligencia artificial para el sector del agua.
          Debate multi-agente en tiempo real.
        </p>

        {/* Feature pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {[
            { icon: Sparkles, label: "IA Multi-Agente", color: "ocean" },
            { icon: Droplets, label: "Sector Hídrico", color: "sky" },
            { icon: Zap, label: "Tiempo Real", color: "amber" },
          ].map((f) => (
            <div
              key={f.label}
              className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm text-muted-foreground"
            >
              <f.icon className={`h-3.5 w-3.5 text-${f.color}`} />
              {f.label}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ─── Topic card ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass glow-sm mb-6 rounded-2xl p-6"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ocean/10">
            <Zap className="h-4 w-4 text-ocean" />
          </div>
          <h2 className="text-lg font-semibold">Tema del Debate</h2>
        </div>
        <Textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Describe el tema a debatir..."
          className="min-h-[80px] rounded-xl border-white/6 bg-white/[0.02] text-foreground/90 placeholder:text-muted-foreground/50 focus:border-ocean/30 focus:ring-ocean/10"
        />
      </motion.div>

      {/* ─── Panelists card ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass mb-6 rounded-2xl p-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet/10">
              <Users className="h-4 w-4 text-violet" />
            </div>
            <h2 className="text-lg font-semibold">Panelistas</h2>
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">
              {panelists.length}/8
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addPanelist}
            disabled={panelists.length >= 8}
            className="rounded-xl border-ocean/20 bg-ocean/5 text-ocean hover:bg-ocean/10 hover:border-ocean/30 transition-all"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Añadir
          </Button>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {panelists.map((p, i) => (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="glass-subtle rounded-xl p-5 transition-all hover:border-white/10"
                style={{
                  borderLeft: `3px solid ${p.color}`,
                }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <AgentBadge name={p.name || "Nuevo"} role={p.role || "Rol"} color={p.color} />
                  <div className="ml-auto flex items-center gap-1.5">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => updatePanelist(i, "color", c)}
                        className={`h-4 w-4 rounded-full transition-all hover:scale-125 ${
                          p.color === c
                            ? "ring-2 ring-white/60 ring-offset-2 ring-offset-deep"
                            : ""
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <div className="mx-1 h-4 w-px bg-white/10" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePanelist(i)}
                      disabled={panelists.length <= 2}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-coral hover:bg-coral/10 rounded-lg"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    value={p.name}
                    onChange={(e) => updatePanelist(i, "name", e.target.value)}
                    placeholder="Nombre"
                    className="rounded-lg border-white/6 bg-white/[0.02] placeholder:text-muted-foreground/40 focus:border-white/15"
                  />
                  <Input
                    value={p.role}
                    onChange={(e) => updatePanelist(i, "role", e.target.value)}
                    placeholder="Rol (ej: CEO, Analista)"
                    className="rounded-lg border-white/6 bg-white/[0.02] placeholder:text-muted-foreground/40 focus:border-white/15"
                  />
                </div>
                <Textarea
                  value={p.persona}
                  onChange={(e) => updatePanelist(i, "persona", e.target.value)}
                  placeholder="Describe el perfil y perspectiva de este panelista..."
                  className="mt-3 min-h-[60px] rounded-lg border-white/6 bg-white/[0.02] text-sm placeholder:text-muted-foreground/40 focus:border-white/15"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ─── Settings card ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass mb-8 rounded-2xl p-6"
      >
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald/10">
            <Settings className="h-4 w-4 text-emerald" />
          </div>
          <h2 className="text-lg font-semibold">Configuración</h2>
        </div>

        <div className="space-y-6">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Rondas de debate</label>
              <span className="rounded-lg bg-ocean/10 px-3 py-1 text-sm font-semibold text-ocean">
                {maxRounds}
              </span>
            </div>
            <Slider
              value={[maxRounds]}
              onValueChange={(v) => setMaxRounds(Array.isArray(v) ? v[0] : v)}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted-foreground">
              Reglas del debate
            </label>
            <Textarea
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              className="min-h-[100px] rounded-lg border-white/6 bg-white/[0.02] text-sm placeholder:text-muted-foreground/40 focus:border-white/15"
            />
          </div>
        </div>
      </motion.div>

      {/* ─── Error ─── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 rounded-xl border border-coral/20 bg-coral/5 p-4 text-sm text-coral"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Launch button ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Button
          onClick={handleStart}
          disabled={loading || !topic.trim() || panelists.some((p) => !p.name || !p.role)}
          className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-ocean to-ocean-light py-7 text-lg font-semibold text-deep shadow-lg shadow-ocean/20 transition-all hover:shadow-xl hover:shadow-ocean/30 hover:brightness-110 disabled:opacity-40 disabled:shadow-none"
          size="lg"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <Waves className="h-5 w-5 animate-pulse" />
                Iniciando foro...
              </>
            ) : (
              <>
                Iniciar Foro
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </span>
        </Button>
      </motion.div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-muted-foreground/50">
        Powered by Claude AI &middot; LangGraph &middot; Supabase
      </div>
    </div>
  );
}
