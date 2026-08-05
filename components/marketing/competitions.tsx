"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { PreviewCardChrome, PreviewFixtureCard, PreviewLeaderboardCard, type PreviewLeaderboardRow } from "@/components/marketing/game-preview";
import { getFixtures } from "@/lib/api-football/client";
import { MARKETING_IMAGES } from "@/lib/marketing/images";
import { cn } from "@/lib/utils";

async function fetchGlobalLeaderboard(): Promise<PreviewLeaderboardRow[]> {
  const res = await fetch("/api/rooms/global/leaderboard");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return [];
  return (data.leaderboard ?? []).slice(0, 6);
}

export function Competitions() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        {/* ── Primary: Rooms ── */}
        <div id="rooms" className="scroll-mt-24">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-widest text-foreground"
          >
            Your rooms
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="mt-3 max-w-xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Create a room. Predict with friends.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-3 max-w-xl text-muted-foreground"
          >
            Invite your group chat, submit predictions together, and settle
            the argument on your own private Board.
          </motion.p>

          <div className="mt-10 grid gap-6 lg:grid-cols-5">
            <ShowcaseReveal delay={0} className="lg:col-span-3">
              <RoomShowcaseCard />
            </ShowcaseReveal>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1], delay: 0.08 }}
              className="relative hidden overflow-hidden rounded-2xl border border-border lg:col-span-2 lg:block"
            >
              <Image
                src={MARKETING_IMAGES.huddleYellow}
                alt=""
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 400px, 0px"
              />
            </motion.div>
          </div>
        </div>

        {/* ── Secondary: Global ── */}
        <div id="global" className="mt-20 scroll-mt-24 border-t border-border pt-14">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
          >
            Prefer to go it alone? · Live
          </motion.p>
          <motion.h3
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="mt-3 max-w-xl text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            This is the real Global Board, right now.
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-3 max-w-xl text-muted-foreground"
          >
            No room required — predict against everyone on the platform on
            one shared leaderboard.
          </motion.p>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <ShowcaseReveal delay={0}>
              <GlobalLeaderboardPreview />
            </ShowcaseReveal>

            <div className="grid gap-6 sm:grid-cols-2">
              <ShowcaseReveal delay={0.08}>
                <FixturesPreview league="Premier League" competitionId={39} />
              </ShowcaseReveal>
              <ShowcaseReveal delay={0.14}>
                <FixturesPreview league="La Liga" competitionId={140} />
              </ShowcaseReveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ShowcaseReveal({
  children,
  delay,
  className,
}: {
  children: React.ReactNode;
  delay: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1], delay }}
      whileHover={{ y: -3 }}
      className={cn("h-full transition-transform duration-150 ease-out", className)}
    >
      {children}
    </motion.div>
  );
}

function RoomShowcaseCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <PreviewCardChrome title="The Group Chat" subtitle="Example room · 6 members · Premier League" />
      <div className="p-5">
        <div className="flex items-center justify-between rounded-xl bg-primary/10 p-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Invite code
            </p>
            <p className="text-lg font-extrabold tracking-widest text-foreground">4F92XQ</p>
          </div>
          <div className="flex -space-x-2">
            {["AG", "SS", "JB"].map((initials) => (
              <span
                key={initials}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-primary text-xs font-bold text-primary-foreground"
              >
                {initials}
              </span>
            ))}
          </div>
        </div>

        <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Room board
        </p>
        <div className="mt-2 space-y-1.5">
          {[
            { rank: 1, name: "Alex Gaffer", points: 42 },
            { rank: 2, name: "Sam Striker", points: 38 },
            { rank: 3, name: "Jordan Baller", points: 31 },
          ].map((row) => (
            <div key={row.name} className="flex items-center gap-2.5 rounded-lg bg-black/[0.15] px-3 py-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-extrabold text-primary-foreground">
                {row.rank}
              </span>
              <span className="flex-1 truncate text-xs font-semibold text-foreground">{row.name}</span>
              <span className="text-xs font-extrabold text-foreground">{row.points}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GlobalLeaderboardPreview() {
  const { data: rows, isLoading } = useQuery({
    queryKey: ["preview-leaderboard", "global"],
    queryFn: fetchGlobalLeaderboard,
  });

  return (
    <PreviewLeaderboardCard
      title="Global Board"
      subtitle="Every prediction, one leaderboard · Live"
      rows={
        rows && rows.length > 0
          ? rows
          : isLoading
            ? []
            : [{ rank: 1, displayName: "Be the first to predict", points: 0 }]
      }
    />
  );
}

function FixturesPreview({ league, competitionId }: { league: string; competitionId: number }) {
  const { data: fixtures } = useQuery({
    queryKey: ["preview-fixtures", competitionId],
    queryFn: async () => (await getFixtures({ status: "NS", competitionIds: [competitionId] })).response,
  });

  return (
    <div className="h-full overflow-hidden rounded-2xl border border-border bg-card">
      <PreviewCardChrome title={league} subtitle="Next fixture · Live" />
      <div className="p-4">
        {fixtures && fixtures.length > 0 ? (
          <PreviewFixtureCard fixture={fixtures[0]} />
        ) : (
          <div className="h-32 animate-pulse rounded-xl bg-black/20" />
        )}
      </div>
    </div>
  );
}
