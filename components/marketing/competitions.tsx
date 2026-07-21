"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { PURPLE, PINK, GREEN, CYAN } from "@/lib/brand/colors";

export function Competitions() {
  return (
    <section id="competitions" className="bg-white px-6 py-24">
      <div className="mx-auto max-w-6xl">
        {/* ── Primary: Rooms ── */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: PINK }}
        >
          Your rooms
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="mt-3 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl"
        >
          Create a room. Predict with friends.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-3 max-w-xl text-black/60"
        >
          Invite your group chat, submit predictions together, and settle
          the argument on your own private leaderboard.
        </motion.p>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <ShowcaseReveal delay={0}>
            <RoomShowcaseCard />
          </ShowcaseReveal>
          <ShowcaseReveal delay={0.1}>
            <FixturesCard
              league="The Group Chat"
              gameweek="Gameweek 1"
              fixtures={PL_FIXTURES}
              accent={GREEN}
            />
          </ShowcaseReveal>
        </div>

        {/* ── Secondary: Global ── */}
        <div className="mt-20 border-t border-black/10 pt-14">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: CYAN }}
          >
            Prefer to go it alone?
          </motion.p>
          <motion.h3
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="mt-3 max-w-xl text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Jump into Global.
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-3 max-w-xl text-black/60"
          >
            No room required — predict against everyone on the platform on
            one shared leaderboard.
          </motion.p>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <ShowcaseReveal delay={0}>
              <LeaderboardCard />
            </ShowcaseReveal>

            <div className="flex flex-col gap-6">
              <ShowcaseReveal delay={0.1}>
                <TableCard />
              </ShowcaseReveal>

              <div className="grid gap-6 sm:grid-cols-2">
                <ShowcaseReveal delay={0.18}>
                  <FixturesCard league="Premier League" gameweek="Gameweek 1" fixtures={PL_FIXTURES} accent={GREEN} />
                </ShowcaseReveal>
                <ShowcaseReveal delay={0.26}>
                  <FixturesCard league="La Liga" gameweek="Jornada 1" fixtures={LALIGA_FIXTURES} accent={PINK} />
                </ShowcaseReveal>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RoomShowcaseCard() {
  const members = LEADERBOARD_ROWS.slice(0, 3);

  return (
    <div className="h-full overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition-shadow hover:shadow-xl">
      <WindowChrome title="The Group Chat" subtitle="6 members · Premier League predictions" />
      <div className="p-5">
        <div
          className="flex items-center justify-between rounded-xl p-4"
          style={{ backgroundColor: `${GREEN}1a` }}
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-black/50">
              Invite code
            </p>
            <p className="text-lg font-extrabold tracking-widest text-black">4F92XQ</p>
          </div>
          <div className="flex -space-x-2">
            {members.map((m) => (
              <span
                key={m.name}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white"
                style={{ backgroundColor: m.color }}
              >
                {m.name.split(" ").map((p) => p[0]).join("")}
              </span>
            ))}
          </div>
        </div>

        <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-black/40">
          Room leaderboard
        </p>
        <div className="mt-2 space-y-1.5">
          {members.map((m) => (
            <div key={m.name} className="flex items-center gap-2.5 rounded-lg bg-black/[0.03] px-3 py-2">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold text-white"
                style={{ backgroundColor: m.color }}
              >
                {m.rank}
              </span>
              <span className="flex-1 truncate text-xs font-semibold text-black">{m.name}</span>
              <span className="text-xs font-extrabold text-black">{m.points}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ShowcaseReveal({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}

function WindowChrome({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-black/5 px-5 py-4">
      <div className="flex gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
        <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
        <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
      </div>
      <div className="ml-1">
        <p className="text-sm font-bold text-black">{title}</p>
        <p className="text-xs text-black/40">{subtitle}</p>
      </div>
    </div>
  );
}

const LEADERBOARD_ROWS = [
  { rank: 1, name: "Alex Gaffer", points: 142, trend: "up" as const, color: GREEN },
  { rank: 2, name: "Sam Striker", points: 138, trend: "up" as const, color: CYAN },
  { rank: 3, name: "Jordan Baller", points: 131, trend: "down" as const, color: PINK },
  { rank: 4, name: "Robin Winger", points: 127, trend: "same" as const, color: PURPLE },
  { rank: 5, name: "Taylor Nutmeg", points: 119, trend: "up" as const, color: GREEN },
  { rank: 6, name: "Casey Keeper", points: 114, trend: "down" as const, color: CYAN },
  { rank: 7, name: "Morgan Baller", points: 108, trend: "same" as const, color: PINK },
];

function LeaderboardCard() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition-shadow hover:shadow-xl">
      <WindowChrome title="Global Leaderboard" subtitle="Premier League predictions · Live" />
      <div className="flex-1 divide-y divide-black/5">
        {LEADERBOARD_ROWS.map((row) => (
          <div key={row.rank} className="flex items-center gap-3 px-5 py-3.5">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                row.rank <= 3 ? "text-black" : "text-black/40"
              }`}
              style={{ backgroundColor: row.rank <= 3 ? GREEN : "#00000010" }}
            >
              {row.rank}
            </span>
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: row.color }}
            >
              {row.name
                .split(" ")
                .map((p) => p[0])
                .join("")}
            </span>
            <span className="flex-1 truncate text-sm font-semibold text-black">{row.name}</span>
            {row.trend === "up" && <TrendingUp className="h-3.5 w-3.5 text-[#0a8f4a]" />}
            {row.trend === "down" && <TrendingDown className="h-3.5 w-3.5 text-[#c81e4a]" />}
            {row.trend === "same" && <Minus className="h-3.5 w-3.5 text-black/20" />}
            <span className="w-10 text-right text-sm font-extrabold text-black">{row.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const PL_TABLE = [
  { pos: 1, club: "Arsenal", gd: 18, pts: 41 },
  { pos: 2, club: "Manchester City", gd: 22, pts: 39 },
  { pos: 3, club: "Liverpool", gd: 15, pts: 37 },
  { pos: 4, club: "Chelsea", gd: 9, pts: 33 },
  { pos: 5, club: "Newcastle United", gd: 7, pts: 30 },
  { pos: 6, club: "Aston Villa", gd: 3, pts: 28 },
];

function TableCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition-shadow hover:shadow-xl">
      <WindowChrome title="Premier League" subtitle="Predicted final table" />
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] font-bold uppercase tracking-wide text-black/40">
            <th className="px-5 py-2 font-bold">Pos</th>
            <th className="px-2 py-2 font-bold">Club</th>
            <th className="px-2 py-2 text-right font-bold">GD</th>
            <th className="px-5 py-2 text-right font-bold">Pts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5">
          {PL_TABLE.map((row) => (
            <tr key={row.club}>
              <td className="px-5 py-2.5">
                <span
                  className="flex h-5 w-5 items-center justify-center rounded text-xs font-bold text-white"
                  style={{ backgroundColor: row.pos <= 4 ? PURPLE : "#00000030" }}
                >
                  {row.pos}
                </span>
              </td>
              <td className="px-2 py-2.5 font-semibold text-black">{row.club}</td>
              <td className="px-2 py-2.5 text-right text-black/60">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
              <td className="px-5 py-2.5 text-right font-extrabold text-black">{row.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type Fixture = { home: string; away: string; homeScore: number; awayScore: number };

const PL_FIXTURES: Fixture[] = [
  { home: "Arsenal", away: "Newcastle Utd", homeScore: 2, awayScore: 1 },
  { home: "Man City", away: "Aston Villa", homeScore: 3, awayScore: 1 },
  { home: "Liverpool", away: "Man United", homeScore: 2, awayScore: 2 },
  { home: "Chelsea", away: "Tottenham", homeScore: 1, awayScore: 1 },
];

const LALIGA_FIXTURES: Fixture[] = [
  { home: "Real Madrid", away: "Villarreal", homeScore: 3, awayScore: 0 },
  { home: "Barcelona", away: "Sevilla", homeScore: 2, awayScore: 1 },
  { home: "Atlético Madrid", away: "Valencia", homeScore: 1, awayScore: 0 },
  { home: "Athletic Bilbao", away: "Real Sociedad", homeScore: 1, awayScore: 1 },
];

function FixturesCard({
  league,
  gameweek,
  fixtures,
  accent,
}: {
  league: string;
  gameweek: string;
  fixtures: Fixture[];
  accent: string;
}) {
  return (
    <div className="h-full overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition-shadow hover:shadow-xl">
      <WindowChrome title={league} subtitle={`${gameweek} · Your predictions`} />
      <div className="divide-y divide-black/5">
        {fixtures.map((f) => (
          <div key={`${f.home}-${f.away}`} className="flex items-center justify-between px-5 py-3">
            <span className="w-24 truncate text-xs font-semibold text-black">{f.home}</span>
            <div className="flex items-center gap-1.5">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-extrabold text-black"
                style={{ backgroundColor: `${accent}33` }}
              >
                {f.homeScore}
              </span>
              <span className="text-xs text-black/30">–</span>
              <span
                className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-extrabold text-black"
                style={{ backgroundColor: `${accent}33` }}
              >
                {f.awayScore}
              </span>
            </div>
            <span className="w-24 truncate text-right text-xs font-semibold text-black">{f.away}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
