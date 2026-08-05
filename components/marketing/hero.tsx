"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PreviewCardChrome, PreviewFixtureCard } from "@/components/marketing/game-preview";
import { getFixtures } from "@/lib/api-football/client";
import { MARKETING_IMAGES } from "@/lib/marketing/images";
import { INK, CHARCOAL, CHALK, SMOKE } from "@/lib/brand/colors";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export function Hero() {
  const { data: fixtures } = useQuery({
    queryKey: ["preview-fixtures", "hero"],
    queryFn: async () => (await getFixtures({ status: "NS", competitionIds: [39] })).response,
  });

  return (
    <section className="relative overflow-hidden py-20" style={{ backgroundColor: INK }}>
      <Image
        src={MARKETING_IMAGES.pitchNightLights}
        alt=""
        fill
        priority
        className="object-cover opacity-25"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: `linear-gradient(180deg, ${INK}e6 0%, ${INK}f5 60%, ${INK} 100%)` }}
      />

      {/* monochrome gradient mesh */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-0 h-[560px] w-[560px] rounded-full blur-[140px]"
        style={{ backgroundColor: `${SMOKE}30` }}
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-0 h-[520px] w-[520px] rounded-full blur-[140px]"
        style={{ backgroundColor: `${CHARCOAL}90` }}
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-6 lg:grid-cols-2">
        {/* ── Left: the pitch ── */}
        <div className="text-center lg:text-left">
          <motion.h1
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1], delay: 0.04 }}
            className="text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl"
          >
            Make Predictions{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(90deg, ${CHALK}, ${SMOKE})` }}
            >
              amongst friends
            </span>
            . Win the group chat.
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1], delay: 0.08 }}
            className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/70 lg:mx-0"
          >
            Create a room and predict with your friends, or jump straight
            into Global — no room required. This is the actual board, live
            right now.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1], delay: 0.12 }}
            className="mt-10 flex items-center justify-center gap-3 lg:justify-start"
          >
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-black transition-all duration-150 ease-out active:scale-95 hover:scale-105"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-3.5 text-sm font-bold text-white transition-all duration-150 ease-out active:scale-95 hover:bg-white/15"
            >
              Sign in to play
            </Link>
          </motion.div>
        </div>

        {/* ── Right: the actual Lobby, locked ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1], delay: 0.16 }}
          className="overflow-hidden rounded-2xl border border-white/10 bg-card/95 shadow-2xl backdrop-blur"
        >
          <PreviewCardChrome title="Premier League" subtitle="Gameweek 2 · Lobby" />
          <div className="space-y-3 p-4">
            {(fixtures ?? []).slice(0, 2).map((fixture) => (
              <PreviewFixtureCard key={fixture.id} fixture={fixture} />
            ))}
            {!fixtures && <div className="h-40 animate-pulse rounded-xl bg-black/20" />}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
