"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { AgentBadge } from "@/components/agent-badge";
import { api, type ForumConfig } from "@/lib/api";
import { useForumStore } from "@/store/forum-store";
import { Plus, Trash2, Waves } from "lucide-react";

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
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 flex items-center justify-center gap-3">
          <Waves className="h-10 w-10 text-ocean" />
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Aqua<span className="text-ocean">Forum</span> AI
          </h1>
        </div>
        <p className="text-muted-foreground">
          Foro de expertos con IA para el sector del agua
        </p>
      </div>

      {/* Topic */}
      <Card className="mb-6 border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-lg">Tema del Debate</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Describe el tema a debatir..."
            className="min-h-[80px] border-white/10 bg-white/5"
          />
        </CardContent>
      </Card>

      {/* Panelists */}
      <Card className="mb-6 border-white/10 bg-white/5">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Panelistas</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={addPanelist}
            disabled={panelists.length >= 8}
            className="border-ocean/30 text-ocean hover:bg-ocean/10"
          >
            <Plus className="mr-1 h-4 w-4" /> Añadir
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {panelists.map((p, i) => (
            <div
              key={i}
              className="rounded-lg border border-white/10 bg-white/5 p-4"
              style={{ borderLeftColor: p.color, borderLeftWidth: 4 }}
            >
              <div className="mb-3 flex items-center gap-3">
                <AgentBadge name={p.name || "Nuevo"} role={p.role || "Rol"} color={p.color} />
                <div className="ml-auto flex items-center gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => updatePanelist(i, "color", c)}
                      className={`h-5 w-5 rounded-full border-2 ${
                        p.color === c ? "border-white" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePanelist(i)}
                    disabled={panelists.length <= 2}
                    className="text-muted-foreground hover:text-coral"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={p.name}
                  onChange={(e) => updatePanelist(i, "name", e.target.value)}
                  placeholder="Nombre"
                  className="border-white/10 bg-white/5"
                />
                <Input
                  value={p.role}
                  onChange={(e) => updatePanelist(i, "role", e.target.value)}
                  placeholder="Rol (ej: CEO, Analista)"
                  className="border-white/10 bg-white/5"
                />
              </div>
              <Textarea
                value={p.persona}
                onChange={(e) => updatePanelist(i, "persona", e.target.value)}
                placeholder="Describe el perfil y perspectiva de este panelista..."
                className="mt-3 min-h-[60px] border-white/10 bg-white/5"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Settings */}
      <Card className="mb-6 border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-lg">Configuración</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="mb-2 block text-sm text-muted-foreground">
              Rondas de debate: {maxRounds}
            </label>
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
              Reglas del debate (una por línea)
            </label>
            <Textarea
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              className="min-h-[100px] border-white/10 bg-white/5"
            />
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-coral/30 bg-coral/10 p-3 text-sm text-coral">
          {error}
        </div>
      )}

      {/* Start */}
      <Button
        onClick={handleStart}
        disabled={loading || !topic.trim() || panelists.some((p) => !p.name || !p.role)}
        className="w-full bg-ocean py-6 text-lg font-semibold text-deep hover:bg-ocean/80"
        size="lg"
      >
        {loading ? "Iniciando foro..." : "Iniciar Foro"}
      </Button>
    </div>
  );
}
