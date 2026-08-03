"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { CHALK, ERROR_RED } from "@/lib/brand/colors";
import { PreviewCardChrome } from "@/components/marketing/game-preview";
import { MARKETING_IMAGES } from "@/lib/marketing/images";

const RECEIPTS = [
  { label: "Match Result", fixture: "Man City vs Newcastle · Final: 2–0", state: "correct" as const, points: 2 },
  { label: "Exact Score", fixture: "Man City vs Newcastle · Final: 2–0", state: "incorrect" as const, points: 0 },
  { label: "Both Teams to Score", fixture: "Spurs vs Aston Villa · Kicks off Sun", state: "locked" as const, points: 0 },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 border-t border-border px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
        >
          How scoring works
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="mt-3 max-w-xl text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
        >
          This is your Vault. Every pick ends up here.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-3 max-w-xl text-muted-foreground"
        >
          Lock in a prediction before kickoff. Once the fulltime whistle
          blows, we grade it against the 90-minute score — extra time and
          penalties never overturn a graded pick — and it lands here.
        </motion.p>

        <div className="mt-10 grid gap-6 lg:grid-cols-5">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative hidden overflow-hidden rounded-2xl border border-border lg:col-span-2 lg:block"
          >
            <Image
              src={MARKETING_IMAGES.ballCloseup}
              alt=""
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 400px, 0px"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="overflow-hidden rounded-2xl border border-border bg-card lg:col-span-3"
          >
            <PreviewCardChrome title="Vault" subtitle="Example — graded receipts" />
            <div className="divide-y divide-border">
              {RECEIPTS.map((r) => (
                <div key={r.label} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{r.fixture}</p>
                    <p className="text-xs text-muted-foreground">Predicted {r.label}</p>
                  </div>
                  <ReceiptBadge state={r.state} label={r.label} points={r.points} />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ReceiptBadge({
  state,
  label,
  points,
}: {
  state: "correct" | "incorrect" | "locked";
  label: string;
  points: number;
}) {
  if (state === "locked") {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1 text-xs font-bold text-muted-foreground">
        <Lock className="h-3 w-3" />
        🔒 RECEIPT LOCKED
      </span>
    );
  }

  const correct = state === "correct";
  const color = correct ? CHALK : ERROR_RED;

  return (
    <span
      className="rounded-full px-3 py-1 text-xs font-bold"
      style={{ backgroundColor: `${color}22`, color }}
    >
      {label.toUpperCase()} — {correct ? `CORRECT (+${points} PTS)` : "INCORRECT (0 PTS)"}
    </span>
  );
}
