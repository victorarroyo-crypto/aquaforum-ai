"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DemoMockup } from "@/components/demo-mockup";
import {
  ArrowRight,
  Droplets,
  Brain,
  Users,
  BarChart3,
  FileText,
  ExternalLink,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: "easeOut" as const },
};

export default function LandingPage() {
  return (
    <div className="relative">
      {/* ═══════════════════════════════════════════
          HERO — Editorial provocation
          ═══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 py-24">
        {/* Subtle top accent */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal via-teal-light to-transparent" />

        <div className="mx-auto max-w-4xl">
          {/* Kicker */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <a
              href="https://ai-2027.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-teal transition-colors border-b border-stone-300 hover:border-teal pb-0.5"
            >
              Inspirado por AI-2027
              <ExternalLink className="h-3 w-3" />
            </a>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-editorial-display text-stone-900 mb-8"
          >
            Para 2027, la IA podria{" "}
            <em className="text-teal">superar la inteligencia humana.</em>
            <br />
            <span className="text-stone-400">
              Que significa eso para el agua?
            </span>
          </motion.h1>

          {/* Lead paragraph */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="max-w-2xl mb-12"
          >
            <p className="text-lg leading-relaxed text-stone-600 mb-6">
              AquaForum AI es un experimento: agentes de inteligencia artificial
              debaten entre si sobre el impacto de la IA en la gestion del agua.
              Es meta y es provocador. La IA reflexionando sobre su propio
              futuro en el recurso mas esencial de la humanidad.
            </p>
            <p className="text-base leading-relaxed text-stone-500">
              Cuatro expertos artificiales. Un moderador autonomo. Debate en
              tiempo real. Analisis multidimensional. Todo impulsado por
              LangGraph y Claude.
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-start gap-4"
          >
            <Link
              href="/setup"
              className="group inline-flex items-center gap-3 btn-primary rounded-lg px-7 py-3.5 text-sm font-semibold"
            >
              Iniciar un debate
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium text-stone-500 hover:text-stone-700 transition-colors"
            >
              Como funciona
            </a>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="h-8 w-[1px] bg-gradient-to-b from-stone-300 to-transparent"
          />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          THE PROVOCATION
          ═══════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-3xl">
          <div className="section-divider mb-16" />

          <motion.div {...fadeUp}>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal mb-6">
              La premisa
            </p>
            <blockquote className="editorial-quote text-xl leading-relaxed mb-8">
              El escenario AI-2027 predice que la inteligencia artificial
              alcanzara capacidades sobrehumanas antes del final de esta decada.
              Si eso ocurre, cada sector se transformara. Pero pocos sectores son
              tan criticos — y tan vulnerables — como el del agua.
            </blockquote>
            <p className="text-base leading-relaxed text-stone-600 mb-6">
              Gemelos digitales que predicen roturas en redes. Algoritmos de ML
              que optimizan depuradoras. Gobernanza algortimica de un recurso
              publico. Modelos de inversion para infraestructura inteligente.
              Estas no son ideas futuristas: estan ocurriendo ahora.
            </p>
            <p className="text-base leading-relaxed text-stone-600">
              AquaForum AI pone a debatir a agentes de IA con distintas
              perspectivas — tecnologica, regulatoria, cientifica, economica —
              para explorar que significa realmente la irrupcion de la IA en el
              sector hidrico. Y lo hace en tiempo real, con moderacion autonoma y
              analisis experto.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          DEMO
          ═══════════════════════════════════════════ */}
      <section id="demo" className="py-24 px-6 bg-white">
        <div className="mx-auto max-w-4xl">
          <motion.div {...fadeUp} className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal mb-4">
              En accion
            </p>
            <h2 className="text-editorial-headline text-stone-900 mb-4">
              IA debatiendo sobre IA y agua
            </h2>
            <p className="text-base text-stone-500 max-w-lg mx-auto">
              Asi se ve un debate en tiempo real. Cada agente aporta su
              perspectiva, interpela a los demas, y el moderador guia la
              conversacion.
            </p>
          </motion.div>

          <motion.div {...fadeUp} transition={{ duration: 0.7, delay: 0.2 }}>
            <DemoMockup />
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS — Three Acts
          ═══════════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="mx-auto max-w-4xl">
          <motion.div {...fadeUp} className="text-center mb-20">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal mb-4">
              Tres actos
            </p>
            <h2 className="text-editorial-headline text-stone-900">
              Configura, observa, comprende
            </h2>
          </motion.div>

          <div className="grid gap-16 md:grid-cols-3 md:gap-8">
            {[
              {
                step: "I",
                icon: Users,
                title: "Configura el panel",
                desc: "Define el tema de debate y configura a los panelistas: su nombre, su rol, su perspectiva. Cada agente de IA tendra una voz unica.",
              },
              {
                step: "II",
                icon: Brain,
                title: "Observa el debate",
                desc: "Los agentes debaten en tiempo real. Se interpelan, responden, construyen consensos. El moderador IA gestiona turnos y dinamica.",
              },
              {
                step: "III",
                icon: BarChart3,
                title: "Obten insights",
                desc: "Un panel de analistas IA evalua cada ronda: viabilidad tecnica, impacto economico, regulacion, sostenibilidad. Exporta el reporte completo.",
              },
            ].map((act, i) => (
              <motion.div
                key={act.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="text-center md:text-left"
              >
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-full border-2 border-teal/20 text-teal font-editorial text-xl mb-6">
                  {act.step}
                </div>
                <h3 className="text-lg font-semibold text-stone-900 mb-3">
                  {act.title}
                </h3>
                <p className="text-sm leading-relaxed text-stone-500">
                  {act.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURES
          ═══════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-white">
        <div className="mx-auto max-w-4xl">
          <motion.div {...fadeUp} className="mb-16">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal mb-4">
              Capacidades
            </p>
            <h2 className="text-editorial-headline text-stone-900 max-w-xl">
              Construido para profesionales del agua que piensan en el futuro
            </h2>
          </motion.div>

          <div className="grid gap-px bg-stone-200 md:grid-cols-2 border border-stone-200 rounded-lg overflow-hidden">
            {[
              {
                icon: Brain,
                title: "Agentes con personalidad",
                desc: "Cada panelista tiene un perfil unico: experiencia, sesgo, estilo de argumentacion. No son chatbots; son voces con perspectiva.",
              },
              {
                icon: Droplets,
                title: "Especializados en agua + IA",
                desc: "Gemelos digitales, ML para EDAR, gobernanza algoritmica, ROI de digitalizacion. Los agentes conocen ambos mundos.",
              },
              {
                icon: BarChart3,
                title: "Analisis multidimensional",
                desc: "Cada ronda se analiza desde cuatro ejes: viabilidad tecnica, impacto economico, cumplimiento regulatorio, sostenibilidad ambiental.",
              },
              {
                icon: FileText,
                title: "Reporte exportable",
                desc: "Al finalizar, exporta el debate completo con todos los analisis y la integracion de perspectivas en formato Markdown.",
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white p-8"
              >
                <f.icon className="h-5 w-5 text-teal mb-4" />
                <h3 className="text-base font-semibold text-stone-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-stone-500">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA FINAL — Dark section
          ═══════════════════════════════════════════ */}
      <section className="dark-section py-24 px-6">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <Droplets className="h-8 w-8 text-teal-light mx-auto mb-8" />
          <h2 className="font-editorial text-3xl sm:text-4xl text-stone-100 mb-6 leading-tight">
            El futuro del agua se decide{" "}
            <em className="text-teal-light">ahora</em>
          </h2>
          <p className="text-stone-400 mb-10 max-w-md mx-auto leading-relaxed">
            Si la IA alcanza capacidades sobrehumanas en 2027, el sector del
            agua no sera el mismo. Lanza un debate y explora las posibilidades.
          </p>
          <Link
            href="/setup"
            className="group inline-flex items-center gap-3 bg-teal-light hover:bg-teal text-stone-900 rounded-lg px-7 py-3.5 text-sm font-semibold transition-all"
          >
            Comenzar ahora
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════ */}
      <footer className="border-t border-stone-200 py-8 px-6">
        <div className="mx-auto max-w-4xl flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-teal" />
            <span className="text-sm font-semibold text-stone-700">
              AquaForum AI
            </span>
          </div>
          <p className="text-xs text-stone-400">
            Claude AI &middot; LangGraph &middot; Supabase &middot; Inspirado
            por{" "}
            <a
              href="https://ai-2027.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal hover:underline"
            >
              ai-2027.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
