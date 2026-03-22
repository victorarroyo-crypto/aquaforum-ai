"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { WaterParticles } from "@/components/water-particles";
import { DemoMockup } from "@/components/demo-mockup";
import {
  Waves,
  Users,
  Zap,
  Microscope,
  MessageSquare,
  BarChart3,
  FileText,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6 },
};

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export default function LandingPage() {
  return (
    <div className="relative">
      {/* ═══════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════ */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
        {/* Particle canvas */}
        <div className="absolute inset-0">
          <WaterParticles className="absolute inset-0" />
        </div>

        {/* Hero glow */}
        <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="h-[500px] w-[500px] rounded-full bg-ocean/[0.06] blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 mx-auto max-w-4xl text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-ocean" />
            <span className="text-xs font-medium text-muted-foreground">
              Foro de expertos impulsado por IA
            </span>
          </motion.div>

          {/* Headline */}
          <h1 className="mb-6 text-6xl font-bold leading-[1.05] tracking-tight sm:text-7xl md:text-8xl">
            <span className="text-gradient">Debate</span>{" "}
            <span className="text-foreground">inteligente</span>
            <br />
            <span className="text-foreground/60">para el sector del</span>{" "}
            <span className="text-gradient-cyan">agua</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground sm:text-xl">
            Panelistas IA con personalidades únicas debaten temas hídricos en
            tiempo real. Moderación autónoma. Análisis experto. Todo en un foro.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/setup"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-ocean to-sky px-8 py-3.5 text-sm font-semibold text-[#030712] glow-btn transition-all hover:brightness-110"
            >
              Crear Foro
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#demo"
              className="glass glass-hover inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-medium text-foreground/70"
            >
              Ver Demo
            </a>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-8 w-5 rounded-full border border-white/10 flex items-start justify-center pt-1.5"
          >
            <div className="h-1.5 w-1 rounded-full bg-white/20" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          DEMO SECTION
          ═══════════════════════════════════════════ */}
      <section id="demo" className="relative py-32 px-6">
        <motion.div {...fadeUp} className="mx-auto max-w-4xl text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Debate autónomo.{" "}
            <span className="text-gradient">En tiempo real.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Observa cómo panelistas IA con perspectivas únicas debaten, se interpelan
            y construyen consensos sobre temas complejos del agua.
          </p>
        </motion.div>

        <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }}>
          <DemoMockup />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURES
          ═══════════════════════════════════════════ */}
      <section className="py-32 px-6">
        <motion.div {...fadeUp} className="mx-auto max-w-4xl text-center mb-20">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Todo lo que necesitas para un{" "}
            <span className="text-gradient">debate experto</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Diseñado para profesionales del agua que buscan insights profundos
            desde múltiples perspectivas.
          </p>
        </motion.div>

        <div className="mx-auto max-w-5xl grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Users,
              title: "Multi-Agente IA",
              desc: "Hasta 8 panelistas con personalidades, roles y estilos de debate únicos. CEOs, reguladores, ingenieros, economistas.",
              color: "#06B6D4",
            },
            {
              icon: Zap,
              title: "Tiempo Real",
              desc: "Los mensajes aparecen en vivo mientras los agentes debaten. WebSocket powered by Supabase Realtime.",
              color: "#FBBF24",
            },
            {
              icon: Microscope,
              title: "Análisis Experto",
              desc: "Panel de expertos analiza cada ronda: viabilidad técnica, impacto económico, cumplimiento regulatorio.",
              color: "#A78BFA",
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              {...stagger}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="glass glass-hover rounded-2xl p-8 group"
            >
              <div
                className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${f.color}10` }}
              >
                <f.icon className="h-6 w-6" style={{ color: f.color }} />
              </div>
              <h3 className="mb-3 text-lg font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════════ */}
      <section className="py-32 px-6">
        <motion.div {...fadeUp} className="mx-auto max-w-4xl text-center mb-20">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Tres pasos.{" "}
            <span className="text-gradient">Un foro completo.</span>
          </h2>
        </motion.div>

        <div className="mx-auto max-w-3xl">
          {[
            {
              step: "01",
              icon: MessageSquare,
              title: "Define el debate",
              desc: "Elige el tema, configura los panelistas con sus roles y perspectivas, establece las reglas del foro.",
              color: "#06B6D4",
            },
            {
              step: "02",
              icon: BarChart3,
              title: "Observa el debate",
              desc: "Los agentes debaten en tiempo real. El moderador gestiona turnos, interpelaciones y síntesis. Tú observas.",
              color: "#34D399",
            },
            {
              step: "03",
              icon: FileText,
              title: "Obtén insights",
              desc: "Análisis experto por ronda, integración de perspectivas, y reporte final exportable con todas las conclusiones.",
              color: "#A78BFA",
            },
          ].map((s, i) => (
            <motion.div
              key={s.step}
              {...stagger}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="group relative flex gap-6 pb-12 last:pb-0"
            >
              {/* Vertical line */}
              {i < 2 && (
                <div className="absolute left-[23px] top-[52px] h-[calc(100%-52px)] w-px bg-gradient-to-b from-white/[0.06] to-transparent" />
              )}

              {/* Step number */}
              <div
                className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                style={{ backgroundColor: `${s.color}10`, color: s.color }}
              >
                {s.step}
              </div>

              <div className="pt-1">
                <h3 className="mb-2 text-lg font-semibold">{s.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground max-w-md">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA FINAL
          ═══════════════════════════════════════════ */}
      <section className="py-32 px-6">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <div className="gradient-border glass rounded-3xl p-12">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-ocean to-violet/50">
              <Waves className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">
              Crea tu primer foro
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Configura panelistas, elige un tema y lanza un debate inteligente
              en menos de 2 minutos.
            </p>
            <Link
              href="/setup"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-ocean to-sky px-8 py-3.5 text-sm font-semibold text-[#030712] glow-btn transition-all hover:brightness-110"
            >
              Comenzar ahora
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.04] py-8 px-6">
        <div className="mx-auto max-w-4xl flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Waves className="h-4 w-4 text-ocean/60" />
            <span className="text-sm text-muted-foreground/50">AquaForum AI</span>
          </div>
          <p className="text-xs text-muted-foreground/30">
            Powered by Claude AI · LangGraph · Supabase
          </p>
        </div>
      </footer>
    </div>
  );
}
