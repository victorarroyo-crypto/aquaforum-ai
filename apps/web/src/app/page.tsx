"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DemoMockup } from "@/components/demo-mockup";
import { ArrowRight, ExternalLink } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.9, ease: "easeOut" as const },
};

const stagger = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, ease: "easeOut" as const, delay },
});

export default function LandingPage() {
  return (
    <div>
      {/* ====== HERO — 100vh ====== */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 sm:px-12 lg:px-20">
        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.1 }}
          className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 sm:px-12 lg:px-20 py-6"
        >
          <span className="section-kicker text-ink-faint">AquaForum AI</span>
          <a
            href="https://ai-2027.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 section-kicker text-ink-ghost hover:text-teal transition-colors"
          >
            Inspirado por ai-2027.com
            <ExternalLink className="h-3 w-3" />
          </a>
        </motion.div>

        <div className="mx-auto max-w-6xl w-full">
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 80 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-[3px] bg-teal mb-12"
          />

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-display text-ink mb-8"
          >
            La IA ya nos supera.
            <br />
            <span className="text-teal">¿Y el agua?</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg sm:text-xl lg:text-2xl leading-relaxed text-ink-muted max-w-2xl mb-14 font-light"
          >
            Cuatro inteligencias artificiales debaten sobre el recurso
            más esencial de la humanidad. Sin guión. Sin censura.
            En tiempo real.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-start gap-4"
          >
            <Link
              href="/setup"
              className="group inline-flex items-center gap-3 bg-ink text-paper px-10 py-5 text-sm font-bold tracking-wide uppercase hover:bg-teal-dark transition-colors"
            >
              Entrar al foro
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#premisa"
              className="inline-flex items-center gap-2 px-6 py-5 text-sm text-ink-faint hover:text-ink transition-colors tracking-wide uppercase font-medium border border-rule hover:border-ink-ghost"
            >
              Leer más
            </a>
          </motion.div>
        </div>
      </section>

      {/* ====== PREMISA ====== */}
      <section id="premisa" className="px-6 sm:px-12 lg:px-20 py-32 min-h-[80vh] flex items-center">
        <div className="mx-auto max-w-5xl w-full">
          <motion.div {...fadeUp}>
            <p className="section-kicker text-teal mb-10">La premisa</p>

            <p className="text-headline text-ink leading-tight mb-16 max-w-4xl">
              El escenario{" "}
              <a
                href="https://ai-2027.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-teal/40 decoration-2 underline-offset-4 hover:decoration-teal transition-colors"
              >
                AI-2027
              </a>{" "}
              predice superinteligencia artificial antes de que termine
              esta década. Si eso ocurre, cada sector se transforma.
              Pocos son tan críticos como el del{" "}
              <span className="text-teal">agua.</span>
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 md:gap-16">
            <motion.p
              {...stagger(0.1)}
              className="text-base lg:text-lg leading-[1.85] text-ink-muted"
            >
              Gemelos digitales que predicen roturas en redes hidráulicas.
              Algoritmos de machine learning que optimizan depuradoras.
              Gobernanza algorítmica de un recurso público esencial.
              No son ideas futuristas. Están ocurriendo ahora.
            </motion.p>
            <motion.p
              {...stagger(0.2)}
              className="text-base lg:text-lg leading-[1.85] text-ink-muted"
            >
              AquaForum AI pone a debatir agentes de IA con perspectivas
              distintas — tecnológica, regulatoria, científica, económica —
              para explorar qué significa la irrupción de la inteligencia
              artificial en el sector hídrico. Lo meta: IA debatiendo
              sobre IA.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ====== DEMO — DARK SECTION ====== */}
      <section className="section-dark px-6 sm:px-12 lg:px-20 py-32 min-h-[80vh] flex items-center">
        <div className="mx-auto max-w-5xl w-full">
          <motion.div {...fadeUp} className="text-center mb-16">
            <p className="section-kicker text-teal mb-6">En acción</p>
            <h2 className="text-headline text-white">
              Así se ve un debate entre IAs
            </h2>
          </motion.div>

          <motion.div {...fadeUp} transition={{ duration: 0.8, delay: 0.15 }}>
            <DemoMockup />
          </motion.div>
        </div>
      </section>

      {/* ====== TRES ACTOS ====== */}
      <section className="px-6 sm:px-12 lg:px-20 py-32 min-h-[80vh] flex items-center">
        <div className="mx-auto max-w-5xl w-full">
          <motion.div {...fadeUp} className="mb-20">
            <p className="section-kicker text-teal mb-6">Cómo funciona</p>
            <h2 className="text-headline text-ink">
              Tres actos. Un foro completo.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12 md:gap-8 lg:gap-12">
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
                {...stagger(i * 0.12)}
              >
                <span className="block text-7xl lg:text-8xl font-black text-teal/15 leading-none mb-4 select-none">
                  {act.n}
                </span>
                <h3 className="text-xl lg:text-2xl font-bold text-ink mb-3">
                  {act.title}
                </h3>
                <p className="text-base leading-relaxed text-ink-muted">
                  {act.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== CTA FINAL ====== */}
      <section className="px-6 sm:px-12 lg:px-20 py-40">
        <motion.div {...fadeUp} className="mx-auto max-w-5xl text-center">
          <div className="rule-thick w-20 mx-auto mb-16" />
          <h2 className="text-display text-ink mb-6">
            El futuro del agua
            <br />
            <span className="text-teal">se debate ahora.</span>
          </h2>
          <p className="text-ink-muted text-lg lg:text-xl mb-14 max-w-lg mx-auto leading-relaxed font-light">
            Un experimento donde la IA reflexiona sobre su propio impacto
            en lo que nos mantiene vivos.
          </p>
          <Link
            href="/setup"
            className="group inline-flex items-center gap-3 bg-ink text-paper px-10 py-5 text-sm font-bold tracking-wide uppercase hover:bg-teal-dark transition-colors"
          >
            Iniciar debate
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="px-6 sm:px-12 lg:px-20 py-8 border-t border-rule">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="section-kicker text-ink-faint">
            AquaForum AI
          </span>
          <div className="flex items-center gap-6 text-xs text-ink-ghost">
            <span className="font-medium">Claude · LangGraph · Supabase</span>
            <a
              href="https://ai-2027.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-teal hover:underline font-medium"
            >
              ai-2027.com <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
