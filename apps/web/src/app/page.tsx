"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DemoMockup } from "@/components/demo-mockup";
import { ArrowRight, ExternalLink, Zap, Shield, Brain, BarChart3 } from "lucide-react";

export default function LandingPage() {
  return (
    <div>
      {/* ━━━ HERO: FULL SCREEN ━━━ */}
      <section className="relative min-h-screen flex flex-col">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 md:px-12 lg:px-20 py-6">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-dark">
            AquaForum AI
          </span>
          <a
            href="https://ai-2027.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-light hover:text-accent transition-colors"
          >
            Inspirado por ai-2027.com <ExternalLink className="h-3 w-3" />
          </a>
        </nav>

        {/* Hero content */}
        <div className="flex-1 flex items-center px-6 md:px-12 lg:px-20 pb-20">
          <div className="w-full max-w-[1200px] mx-auto">
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 100 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="h-1 bg-accent mb-10"
            />

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="text-[clamp(3rem,9vw,7.5rem)] font-black leading-[0.92] tracking-[-0.04em] text-dark mb-10"
            >
              La IA ya
              <br />
              nos supera.
              <br />
              <span className="text-accent">¿Y el agua?</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="max-w-xl mb-12"
            >
              <p className="text-xl md:text-2xl text-mid leading-relaxed">
                Un experimento radical: agentes de IA debaten en tiempo real
                sobre cómo la inteligencia artificial transformará la gestión
                del recurso más vital del planeta.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                href="/setup"
                className="group inline-flex items-center gap-3 bg-dark text-white px-10 py-4 text-sm font-bold uppercase tracking-wider hover:bg-accent transition-colors"
              >
                Lanzar debate
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#que-es"
                className="inline-flex items-center gap-2 border-2 border-edge text-mid px-8 py-4 text-sm font-bold uppercase tracking-wider hover:border-dark hover:text-dark transition-colors"
              >
                Descubrir más
              </a>
            </motion.div>
          </div>
        </div>

        {/* Bottom ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="border-t border-edge px-6 md:px-12 lg:px-20 py-4 flex items-center justify-between text-xs text-light"
        >
          <span>6 agentes IA · 4 ciclos progresivos · Análisis en tiempo real</span>
          <span className="hidden md:block">Powered by Claude · LangGraph · Supabase</span>
        </motion.div>
      </section>

      {/* ━━━ QUÉ ES ━━━ */}
      <section id="que-es" className="bg-surface">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent mb-8">
              El concepto
            </p>
            <div className="grid md:grid-cols-2 gap-12 md:gap-20">
              <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black leading-[1.05] tracking-tight text-dark">
                IA debatiendo sobre el futuro de la IA.
                <span className="text-light"> En el sector más crítico.</span>
              </h2>
              <div className="space-y-6 text-lg text-mid leading-[1.8]">
                <p>
                  El escenario <a href="https://ai-2027.com" target="_blank" rel="noopener noreferrer" className="text-accent font-semibold hover:underline">AI-2027</a> predice
                  que la IA alcanzará capacidades sobrehumanas esta década.
                  Gemelos digitales, ML en depuradoras, gobernanza algorítmica
                  del agua — ya no es ciencia ficción.
                </p>
                <p>
                  AquaForum reúne a CEOs, reguladores, científicos y
                  economistas artificiales que debaten, interpelan y
                  construyen visiones sobre este futuro. Es meta. Es
                  provocador. Y ocurre en tiempo real.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ━━━ DEMO: DARK ━━━ */}
      <section className="bg-dark text-white">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent mb-6">
              En vivo
            </p>
            <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-black tracking-tight">
              Mira cómo debaten
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <DemoMockup />
          </motion.div>
        </div>
      </section>

      {/* ━━━ PANELISTAS ━━━ */}
      <section>
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent mb-6">
              El panel
            </p>
            <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-black tracking-tight text-dark">
              6 agentes. 6 perspectivas.
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-14 max-w-3xl mx-auto">
            {[
              { name: "Elena Vásquez", role: "CEO Water Utility · IA", img: "https://randomuser.me/api/portraits/women/44.jpg", icon: "⚙️" },
              { name: "Marcus Chen", role: "CEO Tecnología IA", img: "https://randomuser.me/api/portraits/men/32.jpg", icon: "🧠" },
              { name: "Sofia Andersen", role: "CEO Química del Agua", img: "https://randomuser.me/api/portraits/women/65.jpg", icon: "🧪" },
              { name: "Ahmed Al-Rashid", role: "CEO Desalación", img: "https://randomuser.me/api/portraits/men/75.jpg", icon: "🌊" },
              { name: "Dr. Ingrid Hoffmann", role: "Analista Regulatoria", img: "https://randomuser.me/api/portraits/women/57.jpg", icon: "⚖️" },
              { name: "James Okafor", role: "Analista Mercados", img: "https://randomuser.me/api/portraits/men/52.jpg", icon: "📊" },
            ].map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="relative mb-4">
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-2 border-edge group-hover:border-accent transition-colors overflow-hidden">
                    <img
                      src={p.img}
                      alt={p.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white border border-edge rounded-full w-8 h-8 flex items-center justify-center text-sm shadow-sm">
                    {p.icon}
                  </div>
                </div>
                <h3 className="text-sm font-bold text-dark mt-1">{p.name}</h3>
                <p className="text-xs text-light mt-0.5">{p.role}</p>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center text-xs text-faint mt-12"
          >
            + Moderador IA · Panel de Expertos oculto · Integrador Estratégico
          </motion.p>
        </div>
      </section>

      {/* ━━━ 4 CAPACIDADES ━━━ */}
      <section>
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent mb-6">
              Capacidades
            </p>
            <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-black tracking-tight text-dark max-w-2xl">
              Diseñado para pensar en grande sobre agua e IA
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-1 bg-edge">
            {[
              { icon: Brain, title: "6 agentes con personalidad", desc: "4 CEOs + 2 analistas, cada uno con experiencia, sesgo y estilo propios. No son chatbots. Son perspectivas." },
              { icon: Zap, title: "Debate autónomo", desc: "El moderador IA gestiona turnos, interpelaciones y síntesis. Los agentes debaten sin intervención humana." },
              { icon: Shield, title: "Panel experto oculto", desc: "Tras cada ronda, expertos ocultos analizan: viabilidad técnica, impacto económico, regulación, sostenibilidad." },
              { icon: BarChart3, title: "4 ciclos progresivos", desc: "Dónde invertir → Qué nos frena → Compromiso 2030 → Legado para la humanidad. Cada ronda profundiza." },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-white p-8 md:p-10"
              >
                <f.icon className="h-6 w-6 text-accent mb-5" />
                <h3 className="text-base font-bold text-dark mb-2">{f.title}</h3>
                <p className="text-sm text-mid leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ CÓMO FUNCIONA ━━━ */}
      <section className="bg-surface">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent mb-6">
              Cómo funciona
            </p>
            <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-black tracking-tight text-dark">
              Tres pasos. Un foro completo.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-16 md:gap-12">
            {[
              { n: "01", title: "Configura", text: "Elige el tema. Define a los panelistas: nombre, rol, expertise, perspectiva. Cada uno debatirá desde su visión única." },
              { n: "02", title: "Observa", text: "Los agentes debaten en tiempo real. Se interpelan, responden, provocan. El moderador gestiona la dinámica de forma autónoma." },
              { n: "03", title: "Comprende", text: "Analistas IA evalúan cada ronda. Integración estratégica. Reporte exportable con todas las conclusiones y tensiones." },
            ].map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <span className="text-[5rem] font-black text-accent/10 leading-none block mb-2 select-none">
                  {s.n}
                </span>
                <h3 className="text-xl font-bold text-dark mb-3">{s.title}</h3>
                <p className="text-base text-mid leading-relaxed">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ CTA FINAL ━━━ */}
      <section className="bg-dark text-white">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20 py-32 md:py-40 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="h-1 w-20 bg-accent mx-auto mb-14" />
            <h2 className="text-[clamp(2.5rem,7vw,5rem)] font-black leading-[0.95] tracking-[-0.03em] mb-8">
              El futuro del agua
              <br />
              <span className="text-accent">se decide ahora.</span>
            </h2>
            <p className="text-xl text-neutral-400 max-w-lg mx-auto mb-14 leading-relaxed">
              La IA reflexionando sobre su propio impacto en lo que nos
              mantiene vivos. Lanza el debate.
            </p>
            <Link
              href="/setup"
              className="group inline-flex items-center gap-3 bg-accent text-white px-12 py-5 text-sm font-bold uppercase tracking-wider hover:bg-accent-hover transition-colors"
            >
              Comenzar ahora
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ━━━ FOOTER ━━━ */}
      <footer className="border-t border-edge px-6 md:px-12 lg:px-20 py-6">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-light">AquaForum AI</span>
          <div className="flex items-center gap-5 text-xs text-faint">
            <span>Claude · LangGraph · Supabase</span>
            <a href="https://ai-2027.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline inline-flex items-center gap-1">
              ai-2027.com <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
