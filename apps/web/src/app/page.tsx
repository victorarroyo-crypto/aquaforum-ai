"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DemoMockup } from "@/components/demo-mockup";
import { ArrowRight, ExternalLink } from "lucide-react";

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.8, ease: "easeOut" as const },
};

export default function LandingPage() {
  return (
    <div>
      {/* ═══ HERO ═══ */}
      <section className="min-h-screen flex flex-col justify-center px-6 sm:px-12 py-24">
        <div className="mx-auto max-w-3xl w-full">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <div className="w-12 h-px bg-teal mb-16" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-display text-ink mb-12"
          >
            La IA ya{" "}
            <em className="font-serif italic text-teal">nos supera.</em>
            <br />
            <span className="text-ink-ghost">¿Y el agua?</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg sm:text-xl leading-relaxed text-ink-muted max-w-xl mb-16"
          >
            Cuatro inteligencias artificiales debaten sobre el recurso
            más esencial de la humanidad. Sin guión. Sin censura.
            En tiempo real.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-start gap-5"
          >
            <Link
              href="/setup"
              className="group inline-flex items-center gap-3 bg-ink text-paper px-8 py-4 text-sm font-medium tracking-wide uppercase hover:bg-teal-dark transition-colors"
            >
              Entrar al foro
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#premisa"
              className="inline-flex items-center gap-2 px-4 py-4 text-sm text-ink-faint hover:text-ink transition-colors tracking-wide uppercase"
            >
              Leer más
            </a>
          </motion.div>
        </div>
      </section>

      {/* ═══ PREMISA ═══ */}
      <section id="premisa" className="px-6 sm:px-12 py-24">
        <div className="mx-auto max-w-3xl">
          <div className="rule mb-20" />

          <motion.div {...fade}>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-teal mb-10">
              La premisa
            </p>

            <p className="text-headline text-ink leading-snug mb-12">
              El escenario{" "}
              <a
                href="https://ai-2027.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-teal/30 underline-offset-4 hover:decoration-teal transition-colors"
              >
                AI-2027
              </a>{" "}
              predice superinteligencia artificial antes de que termine
              esta década. Si eso ocurre, cada sector se transforma.
              Pocos son tan críticos como el del{" "}
              <em className="font-serif italic">agua.</em>
            </p>

            <div className="space-y-6 text-base leading-[1.85] text-ink-muted max-w-2xl">
              <p>
                Gemelos digitales que predicen roturas en redes hidráulicas.
                Algoritmos de machine learning que optimizan depuradoras.
                Gobernanza algorítmica de un recurso público esencial.
                No son ideas futuristas. Están ocurriendo ahora.
              </p>
              <p>
                AquaForum AI pone a debatir agentes de IA con perspectivas
                distintas — tecnológica, regulatoria, científica, económica —
                para explorar qué significa la irrupción de la inteligencia
                artificial en el sector hídrico. Lo meta: IA debatiendo
                sobre IA.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ DEMO ═══ */}
      <section className="px-6 sm:px-12 py-24 bg-paper-warm">
        <div className="mx-auto max-w-3xl">
          <motion.div {...fade} className="text-center mb-16">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-teal mb-6">
              En acción
            </p>
            <h2 className="text-headline text-ink">
              Así se ve un debate entre IAs
            </h2>
          </motion.div>

          <motion.div {...fade} transition={{ duration: 0.8, delay: 0.15 }}>
            <DemoMockup />
          </motion.div>
        </div>
      </section>

      {/* ═══ TRES ACTOS ═══ */}
      <section className="px-6 sm:px-12 py-24">
        <div className="mx-auto max-w-3xl">
          <motion.div {...fade} className="mb-20">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-teal mb-6">
              Cómo funciona
            </p>
            <h2 className="text-headline text-ink">
              Tres actos. Un foro completo.
            </h2>
          </motion.div>

          <div className="space-y-16">
            {[
              {
                n: "I",
                title: "Configura",
                text: "Define el tema. Diseña a los panelistas: nombre, rol, perspectiva, sesgo. Cada agente tendrá una voz única e irrepetible.",
              },
              {
                n: "II",
                title: "Observa",
                text: "Los agentes debaten en tiempo real. Se interpelan. Responden. Construyen consensos. El moderador gestiona la dinámica de forma autónoma.",
              },
              {
                n: "III",
                title: "Comprende",
                text: "Un panel de analistas IA evalúa cada ronda desde cuatro ejes: técnico, económico, regulatorio y ambiental. Exporta el reporte completo.",
              },
            ].map((act, i) => (
              <motion.div
                key={act.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="flex gap-8 items-start"
              >
                <span className="text-5xl font-serif text-teal/30 leading-none pt-1 select-none">
                  {act.n}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-ink mb-2">
                    {act.title}
                  </h3>
                  <p className="text-base leading-relaxed text-ink-muted">
                    {act.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="px-6 sm:px-12 py-32">
        <motion.div {...fade} className="mx-auto max-w-2xl text-center">
          <div className="rule-thick w-16 mx-auto mb-16" />
          <h2 className="text-display text-ink mb-8">
            El futuro del agua
            <br />
            <em className="font-serif italic text-teal">se debate ahora.</em>
          </h2>
          <p className="text-ink-muted text-lg mb-12 max-w-md mx-auto leading-relaxed">
            Un experimento donde la IA reflexiona sobre su propio impacto
            en lo que nos mantiene vivos.
          </p>
          <Link
            href="/setup"
            className="group inline-flex items-center gap-3 bg-ink text-paper px-8 py-4 text-sm font-medium tracking-wide uppercase hover:bg-teal-dark transition-colors"
          >
            Iniciar debate
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="px-6 sm:px-12 py-8 border-t border-rule">
        <div className="mx-auto max-w-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs font-medium text-ink-faint tracking-wide uppercase">
            AquaForum AI
          </span>
          <div className="flex items-center gap-4 text-xs text-ink-ghost">
            <span>Claude · LangGraph · Supabase</span>
            <a
              href="https://ai-2027.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-teal hover:underline"
            >
              ai-2027.com <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
