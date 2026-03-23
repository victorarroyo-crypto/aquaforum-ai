"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DemoMockup } from "@/components/demo-mockup";
import {
  ArrowRight,
  Brain,
  Zap,
  Shield,
  BarChart3,
  ExternalLink,
} from "lucide-react";

const panelists = [
  {
    name: "Elena Vásquez",
    role: "CEO Water Utility · IA",
    img: "https://randomuser.me/api/portraits/women/44.jpg",
    icon: "⚙️",
  },
  {
    name: "Marcus Chen",
    role: "CEO Tecnología IA",
    img: "https://randomuser.me/api/portraits/men/32.jpg",
    icon: "🧠",
  },
  {
    name: "Sofia Andersen",
    role: "CEO Química del Agua",
    img: "https://randomuser.me/api/portraits/women/65.jpg",
    icon: "🧪",
  },
  {
    name: "Ahmed Al-Rashid",
    role: "CEO Desalación",
    img: "https://randomuser.me/api/portraits/men/75.jpg",
    icon: "🌊",
  },
  {
    name: "Dr. Ingrid Hoffmann",
    role: "Analista Regulatoria",
    img: "https://randomuser.me/api/portraits/women/57.jpg",
    icon: "⚖️",
  },
  {
    name: "James Okafor",
    role: "Analista Mercados",
    img: "https://randomuser.me/api/portraits/men/52.jpg",
    icon: "📊",
  },
  {
    name: "Laura Martínez",
    role: "Directora IA Industrial",
    img: "https://randomuser.me/api/portraits/women/33.jpg",
    icon: "🏭",
  },
];

const capabilities = [
  {
    icon: Brain,
    title: "7 agentes con personalidad",
    desc: "4 CEOs + 2 analistas + 1 experta IA industrial. Cada uno con experiencia real, datos del sector, y visiones opuestas.",
  },
  {
    icon: Zap,
    title: "Debate autónomo",
    desc: "El moderador IA gestiona turnos, interpelaciones y síntesis. Los agentes debaten sin intervención humana.",
  },
  {
    icon: Shield,
    title: "Panel experto oculto",
    desc: "Tras cada ronda, expertos ocultos analizan: viabilidad técnica, impacto económico, regulación, sostenibilidad.",
  },
  {
    icon: BarChart3,
    title: "4 ciclos progresivos",
    desc: "Dónde invertir, qué nos frena, compromiso 2030, legado para la humanidad. Cada ronda profundiza.",
  },
];

const steps = [
  {
    n: "01",
    title: "Configura",
    text: "Elige el tema. Define a los panelistas: nombre, rol, expertise, perspectiva. Cada uno debatirá desde su visión única.",
  },
  {
    n: "02",
    title: "Observa",
    text: "Los agentes debaten en tiempo real. Se interpelan, responden, provocan. El moderador gestiona la dinámica de forma autónoma.",
  },
  {
    n: "03",
    title: "Comprende",
    text: "Analistas IA evalúan cada ronda. Integración estratégica. Reporte exportable con todas las conclusiones y tensiones.",
  },
];

export default function LandingPage() {
  return (
    <div className="bg-[#09090B] text-[#FAFAFA]">
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex flex-col">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 md:px-12 lg:px-20 py-6 relative z-10">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#FAFAFA]">
            AquaForum AI
          </span>
          <a
            href="https://ai-2027.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-[12px] text-[#52525B] hover:text-[#14B8A6] transition-colors"
          >
            Inspirado por ai-2027.com <ExternalLink className="h-3 w-3" />
          </a>
        </nav>

        {/* Hero content */}
        <div className="flex-1 flex items-center px-6 md:px-12 lg:px-20 pb-24">
          <div className="w-full max-w-[1200px] mx-auto">
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 120 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="h-1 bg-[#14B8A6] mb-12"
            />

            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="text-[clamp(3.5rem,9vw,8rem)] font-[800] leading-[0.9] tracking-[-0.04em] text-[#FAFAFA] mb-10"
            >
              La IA ya
              <br />
              nos supera.
              <br />
              <span className="text-[#14B8A6]">¿Y el agua?</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="max-w-xl mb-14"
            >
              <p className="text-[20px] md:text-[24px] text-[#A1A1AA] leading-relaxed">
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
                className="group inline-flex items-center gap-3 bg-[#14B8A6] text-white px-10 py-4 rounded-lg text-[15px] font-bold hover:bg-[#0D9488] transition-colors"
              >
                Lanzar debate
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#panelists"
                className="inline-flex items-center gap-2 border border-[rgba(255,255,255,0.1)] text-[#A1A1AA] px-8 py-4 rounded-lg text-[15px] font-bold hover:border-[rgba(255,255,255,0.2)] hover:text-[#FAFAFA] transition-colors"
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
          className="border-t border-[rgba(255,255,255,0.06)] px-6 md:px-12 lg:px-20 py-4 flex items-center justify-between text-[13px] text-[#52525B]"
        >
          <span>7 agentes IA · 4 ciclos progresivos · Análisis en tiempo real</span>
          <span className="hidden md:block font-mono text-[12px]">
            Powered by Claude · LangGraph · Supabase
          </span>
        </motion.div>
      </section>

      {/* ===== AI-2027 CONTEXT ===== */}
      <section className="border-t border-[rgba(255,255,255,0.06)] bg-[#0C0C0F]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            {/* Left: The context */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#F59E0B] mb-6">
                Por qué este debate es urgente
              </p>
              <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-[800] tracking-tight text-[#FAFAFA] mb-8 leading-tight">
                En 2027, la IA podría superar la inteligencia humana en todo.
                <br />
                <span className="text-[#F59E0B]">¿Quién gestiona el agua entonces?</span>
              </h2>
              <p className="text-[17px] text-[#A1A1AA] leading-relaxed mb-6">
                El escenario <a href="https://ai-2027.com" target="_blank" rel="noopener noreferrer" className="text-[#14B8A6] hover:underline font-semibold">AI-2027</a> predice
                que la inteligencia artificial alcanzará capacidades sobrehumanas antes de 2028. No es ciencia ficción: es un análisis construido con 25 ejercicios de simulación y feedback de más de 100 expertos en IA.
              </p>
              <p className="text-[17px] text-[#A1A1AA] leading-relaxed mb-8">
                Si esto ocurre, el sector del agua — infraestructura crítica que abastece a 8.000 millones de personas — necesita prepararse <strong className="text-[#FAFAFA]">ahora</strong>. AquaForum AI es el primer foro donde agentes de IA debaten entre sí sobre este impacto, citando datos reales del sector, regulaciones vigentes, y casos documentados.
              </p>
              <a
                href="https://ai-2027.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[14px] font-bold text-[#14B8A6] hover:text-[#0D9488] transition-colors"
              >
                Leer el escenario AI-2027 completo <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </motion.div>

            {/* Right: The authors */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="bg-[#18181B] border border-[rgba(255,255,255,0.06)] rounded-xl p-8"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#52525B] mb-6">
                Autores de AI-2027
              </p>
              <div className="space-y-5">
                {[
                  {
                    name: "Daniel Kokotajlo",
                    bio: "Ex-investigador de OpenAI. TIME100. Sus predicciones previas sobre IA se han cumplido.",
                  },
                  {
                    name: "Eli Lifland",
                    bio: "Co-fundador de AI Digest. #1 en el RAND Forecasting Initiative — el mejor predictor de IA del mundo.",
                  },
                  {
                    name: "Thomas Larsen",
                    bio: "Fundó el Center for AI Policy. Investigador de seguridad en IA en MIRI.",
                  },
                  {
                    name: "Scott Alexander",
                    bio: "Autor y divulgador. Reescribió el escenario en formato narrativo accesible.",
                  },
                  {
                    name: "Romeo Dean",
                    bio: "Harvard CS. Ex-AI Policy Fellow. Perspectiva técnica de nueva generación.",
                  },
                ].map((author) => (
                  <div key={author.name} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#F59E0B] mt-2 shrink-0" />
                    <div>
                      <span className="text-[14px] font-bold text-[#FAFAFA] block">{author.name}</span>
                      <span className="text-[13px] text-[#71717A] leading-relaxed">{author.bio}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-[rgba(255,255,255,0.06)]">
                <p className="text-[12px] text-[#52525B] leading-relaxed italic">
                  &ldquo;Las afirmaciones sobre el futuro suelen ser frustrante vagas. Intentamos ser lo más concretos y cuantitativos posible.&rdquo;
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== PANELISTS ===== */}
      <section id="panelists" className="border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#14B8A6] mb-6">
              El panel
            </p>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-[800] tracking-tight text-[#FAFAFA]">
              7 agentes. 7 perspectivas.
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-14 max-w-3xl mx-auto">
            {panelists.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="relative mb-5">
                  <div className="w-[120px] h-[120px] rounded-full border-2 border-[rgba(255,255,255,0.08)] group-hover:border-[#14B8A6] transition-colors duration-300 overflow-hidden">
                    <img
                      src={p.img}
                      alt={p.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#18181B] border border-[rgba(255,255,255,0.08)] rounded-full w-8 h-8 flex items-center justify-center text-sm">
                    {p.icon}
                  </div>
                </div>
                <h3 className="text-[15px] font-bold text-[#FAFAFA] mt-1">
                  {p.name}
                </h3>
                <p className="text-[13px] text-[#52525B] mt-0.5">{p.role}</p>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center text-[13px] text-[#3F3F46] mt-14"
          >
            + 3 agentes ocultos: Moderador IA · Panel de Expertos · Integrador
            Estratégico
          </motion.p>
        </div>
      </section>

      {/* ===== DEMO ===== */}
      <section className="bg-[#111113] border-t border-b border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#14B8A6] mb-6">
              En vivo
            </p>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-[800] tracking-tight text-[#FAFAFA]">
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

      {/* ===== CAPABILITIES ===== */}
      <section>
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#14B8A6] mb-6">
              Capacidades
            </p>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-[800] tracking-tight text-[#FAFAFA] max-w-2xl">
              Diseñado para pensar en grande sobre agua e IA
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {capabilities.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-[#18181B] border border-[rgba(255,255,255,0.06)] rounded-lg p-8 hover:border-[rgba(255,255,255,0.1)] transition-colors"
                style={{ borderLeft: "3px solid #14B8A6" }}
              >
                <f.icon className="h-6 w-6 text-[#14B8A6] mb-5" />
                <h3 className="text-[16px] font-bold text-[#FAFAFA] mb-2">
                  {f.title}
                </h3>
                <p className="text-[15px] text-[#A1A1AA] leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#14B8A6] mb-6">
              Cómo funciona
            </p>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-[800] tracking-tight text-[#FAFAFA]">
              Tres pasos. Un foro completo.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-16 md:gap-12">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <span className="text-[6rem] font-[800] text-[rgba(20,184,166,0.12)] leading-none block mb-2 select-none">
                  {s.n}
                </span>
                <h3 className="text-[22px] font-bold text-[#FAFAFA] mb-3">
                  {s.title}
                </h3>
                <p className="text-[16px] text-[#A1A1AA] leading-relaxed">
                  {s.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(20,184,166,0.08)] to-[rgba(139,92,246,0.06)]" />
        <div className="relative max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20 py-32 md:py-40 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="h-1 w-20 bg-[#14B8A6] mx-auto mb-14" />
            <h2 className="text-[clamp(2.5rem,7vw,5rem)] font-[800] leading-[0.95] tracking-[-0.03em] text-[#FAFAFA] mb-8">
              El futuro del agua
              <br />
              <span className="text-[#14B8A6]">se decide ahora.</span>
            </h2>
            <p className="text-[20px] text-[#71717A] max-w-lg mx-auto mb-14 leading-relaxed">
              La IA reflexionando sobre su propio impacto en lo que nos
              mantiene vivos. Lanza el debate.
            </p>
            <Link
              href="/setup"
              className="group inline-flex items-center gap-3 bg-[#14B8A6] text-white px-12 py-5 rounded-lg text-[15px] font-bold hover:bg-[#0D9488] transition-colors"
            >
              Comenzar ahora
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-[rgba(255,255,255,0.06)] px-6 md:px-12 lg:px-20 py-6">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#52525B]">
            AquaForum AI
          </span>
          <div className="flex items-center gap-5 text-[12px] text-[#3F3F46]">
            <span>Claude · LangGraph · Supabase</span>
            <a
              href="https://ai-2027.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#14B8A6] hover:underline inline-flex items-center gap-1"
            >
              ai-2027.com <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
