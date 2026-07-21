"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { FootballBall } from "@/components/brand/football-ball";
import { PURPLE, PINK, GREEN, CYAN } from "@/lib/brand/colors";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export function Hero() {
  return (
    <section
      className="relative flex min-h-[92vh] items-center overflow-hidden pt-16"
      style={{ backgroundColor: PURPLE }}
    >
      {/* animated gradient mesh */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-0 h-[560px] w-[560px] rounded-full blur-[140px]"
        style={{ backgroundColor: `${CYAN}45` }}
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-0 h-[520px] w-[520px] rounded-full blur-[140px]"
        style={{ backgroundColor: `${PINK}40` }}
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* animated pitch lines, drawn in on load */}
      <svg
        aria-hidden
        viewBox="0 0 1200 800"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]"
        fill="none"
      >
        <motion.circle
          cx="950"
          cy="650"
          r="160"
          stroke="white"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
        />
        <motion.line
          x1="0"
          y1="650"
          x2="1200"
          y2="650"
          stroke="white"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />
        <motion.rect
          x="850"
          y="560"
          width="280"
          height="180"
          stroke="white"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, ease: "easeInOut", delay: 0.2 }}
        />
      </svg>

      {/* bouncing football */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-16 top-28 hidden h-16 w-16 lg:block"
        animate={{ y: [0, -26, 0, -12, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
        >
          <FootballBall className="drop-shadow-2xl text-white w-40 h-40" />
        </motion.div>
      </motion.div>

      <div className="relative mx-auto w-full max-w-6xl px-6 py-20">
        {/* <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white"
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: GREEN }} />
          Private rooms for your group chat
        </motion.div> */}

        <motion.h1
          initial="hidden"
          animate="show" 
          variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="max-w-2xl text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl"
        >
          Group chat predictions.{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(90deg, ${GREEN}, ${CYAN})` }}
          >
              Create a group · Predict with friends
          </span>
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.16 }}
          className="mt-6 max-w-xl text-lg leading-relaxed text-white/70"
        >
          Create a room and predict with your friends — Premier League,
          Champions League, La Liga, FA Cup, and season awards. Prefer to go
          solo? Jump into the global leaderboard instead.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.24 }}
          className="mt-10 flex flex-wrap gap-3"
        >
          <Link
            href="/signup"
            className="group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-black transition-transform hover:scale-105"
            style={{ backgroundColor: GREEN }}
          >
            Get Started
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/15"
          >
            Sign in to play
          </Link>
        </motion.div>

        <motion.p
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 text-xs font-semibold uppercase tracking-widest text-white/40"
        >
          8 global group chats · Free forever · Sign in to submit picks
        </motion.p>
      </div>
    </section>
  );
}
