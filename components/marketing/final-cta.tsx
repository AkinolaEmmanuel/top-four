"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { MARKETING_IMAGES } from "@/lib/marketing/images";
import { PURPLE, PINK, CYAN } from "@/lib/brand/colors";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden px-6 py-24">
      <Image src={MARKETING_IMAGES.huddleRed} alt="" fill className="object-cover" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: `linear-gradient(115deg, ${PINK}f0 0%, ${PURPLE}f5 65%)` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full blur-[100px]"
        style={{ backgroundColor: `${CYAN}55` }}
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto max-w-3xl text-center"
      >
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Ready to make the call?
        </h2>
        <p className="mt-4 text-white/80">
          Create a group and predict with friends — or free to play, in the
          world&apos;s biggest one. Submit your first prediction in under a
          minute.
        </p>
        <Link
          href="/signup"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-black px-8 py-3.5 text-sm font-bold text-white transition-transform hover:scale-105"
        >
          Get Started
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </section>
  );
}
