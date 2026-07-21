"use client";

import { motion } from "framer-motion";
import { PINK, GREEN, CYAN } from "@/lib/brand/colors";

const STEPS = [
  {
    color: GREEN,
    title: "Create a group",
    description:
      "Start a room with your friends, or jump into a global group chat — same game, bigger crowd.",
  },
  {
    color: CYAN,
    title: "Predict with friends",
    description: "Sign in and submit your predictions before each deadline — league tables, scorelines, and awards.",
  },
  {
    color: PINK,
    title: "Climb the leaderboard",
    description: "Points are tallied automatically. See exactly where you rank, in your group and globally.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-black/10 bg-[#f7f7f8] px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl font-bold tracking-tight sm:text-3xl"
        >
          How it works
        </motion.h2>

        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex items-start gap-4"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: step.color }}
              >
                {i + 1}
              </span>
              <div>
                <h3 className="font-bold text-black">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-black/60">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
