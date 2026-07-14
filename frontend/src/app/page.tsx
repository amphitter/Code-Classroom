"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 32,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const STATS = [
  { value: "30", label: "Day Program" },
  { value: "6+", label: "Real Projects" },
  { value: "500+", label: "Students" },
  { value: "AI", label: "Powered" },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0B0B0B] text-white flex flex-col items-center justify-center selection:bg-[#B30017]/30">

      {/* ── Ambient Glows ── */}
      <div className="pointer-events-none absolute -top-60 -left-60 h-[600px] w-[600px] rounded-full bg-[#B30017] opacity-[0.07] blur-[160px]" />
      <div className="pointer-events-none absolute -bottom-60 -right-60 h-[600px] w-[600px] rounded-full bg-[#B30017] opacity-[0.07] blur-[160px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFD400] opacity-[0.025] blur-[120px]" />

      {/* ── Grid ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
        }}
      />

      {/* ── Noise texture ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Main Container ── */}
      <div className="relative z-10 flex w-full max-w-6xl flex-col items-center px-6 py-20 sm:px-10">

        {/* ── Partner Logos ── */}
        <motion.div
          className="mb-14 flex items-center gap-6"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <div className="flex items-center gap-6 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-8 py-4 backdrop-blur-sm">
            <img
              src="/btc.png"
              alt="Build The Circle"
              className="h-30 object-contain opacity-90 transition-opacity duration-200 hover:opacity-100"
            />
          </div>
        </motion.div>

        {/* ── Eyebrow ── */}
        <motion.div
          className="mb-8 flex items-center gap-3"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          <div className="h-px w-8 bg-[#B30017]" />
          <span
            className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-[#B30017]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Code · Build · Launch
          </span>
          <div className="h-px w-8 bg-[#B30017]" />
        </motion.div>

        {/* ── Headline ── */}
        <motion.div
          className="mb-6 text-center"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
        >
          <h1
            className="text-[clamp(56px,11vw,128px)] font-black leading-[0.88] tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <span className="block text-white">CODE BUILD</span>
            <span
              className="block text-transparent"
              style={{ WebkitTextStroke: "2px rgba(255,255,255,0.85)" }}
            >
              LAUNCH
            </span>
          </h1>
        </motion.div>

        {/* ── Sub-headline ── */}
        <motion.p
          className="mb-12 max-w-xl text-center text-base font-light leading-relaxed text-[#9CA3AF] sm:text-lg"
          style={{ fontFamily: "'Inter', sans-serif" }}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
        >
          Learn. Build. Compete. Launch real projects. Manage students,
          teachers, assignments, leaderboards, and AI-powered learning
          — all from one platform.
        </motion.p>

        {/* ── CTA Buttons ── */}
        <motion.div
          className="mb-20 flex flex-col items-center gap-4 sm:flex-row"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={4}
        >
          <Link
            href="/teacher/sessions"
            className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-xl bg-[#B30017] px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#8B0012] hover:shadow-[0_0_32px_rgba(179,0,23,0.4)] active:scale-[0.98]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <span className="relative z-10">Teacher Portal</span>
            <svg
              className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
            {/* shine sweep */}
            <span className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/10 transition-transform duration-500 group-hover:translate-x-full" />
          </Link>

          <Link
            href="/student/sessions"
            className="group inline-flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.98]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <span>Student Portal</span>
            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </motion.div>

        {/* ── Stats Bar ── */}
        <motion.div
          className="w-full max-w-2xl"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={5}
        >
          <div className="grid grid-cols-4 divide-x divide-white/[0.06] rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-sm">
            {STATS.map(({ value, label }) => (
              <div
                key={label}
                className="group flex flex-col items-center gap-1 px-4 py-5 transition-colors duration-200 hover:bg-white/[0.03]"
              >
                <span
                  className="text-2xl font-black text-white"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {value}
                </span>
                <span
                  className="text-center text-[11px] font-medium uppercase tracking-wider text-[#9CA3AF]"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Bottom tagline ── */}
        <motion.p
          className="mt-10 text-center font-mono text-[11px] tracking-widest text-white/15"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={6}
        >
          POWERED BY TEAM EKLAVYA · BUILD THE CIRCLE · 2026
        </motion.p>
      </div>
    </main>
  );
}