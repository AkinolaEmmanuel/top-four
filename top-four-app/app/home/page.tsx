'use client';

import { useState, useEffect, useMemo } from 'react';
import { HomeScreen } from '../components/home/HomeScreen';
import { usePredictionTasks } from '@/hooks/api/usePredictions';
import { useMyLeagues } from '@/hooks/api/useLeagues';
import { useUnreadNotifications } from '@/hooks/api/useNotifications';
import { useAuth } from '@/context/auth-context';

const CLUB: Record<string, string> = {
  ARS: "#c8182f", CHE: "#1746a2", LIV: "#b7152b", TOT: "#17233d",
  MCI: "#559ac7", EVE: "#153c85", MUN: "#d1262f", NEW: "#20242a",
  PP: "#0879bf", OL: "#7f56d9", AL: "#0e7a5f"
};

// Fixtures more than this far apart in kickoff time are treated as
// different gameweeks. Premier League rounds run Fri-Mon then leave a
// ~5-day gap to the next round's Friday/Saturday kickoffs, so a 4-day gap
// reliably splits one round from the next without also splitting a single
// round's own Friday-to-Monday spread.
const GAMEWEEK_GAP_MS = 4 * 24 * 60 * 60 * 1000;

function clusterByKickoff(rows: any[]): any[][] {
  const sorted = [...rows].sort((a, b) => a.kickoffMs - b.kickoffMs);
  const batches: any[][] = [];
  let current: any[] = [];
  let lastKickoffMs: number | null = null;
  for (const row of sorted) {
    if (lastKickoffMs !== null && row.kickoffMs - lastKickoffMs > GAMEWEEK_GAP_MS) {
      batches.push(current);
      current = [];
    }
    current.push(row);
    lastKickoffMs = row.kickoffMs;
  }
  if (current.length > 0) batches.push(current);
  return batches;
}

function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

export default function Home() {
  const { user } = useAuth();
  const { data: tasksData, isLoading: tasksLoading } = usePredictionTasks();
  const { data: leaguesData, isLoading: leaguesLoading } = useMyLeagues();
  const { data: unreadCount = 0 } = useUnreadNotifications(!!user);

  // The app is dark-only (see app/layout.tsx); this was dead state with no
  // real toggle anywhere.
  const theme = 'dark';
  const setTheme = () => {};
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isApiLoading = tasksLoading || leaguesLoading;
  const isNewUser = !isApiLoading && leaguesData?.items.length === 0;
  const isLoading = isApiLoading;
  const isReady = !isLoading && !isNewUser;

  const taskCount = tasksData?.items.length || 0;
  const caught = isReady && taskCount === 0;

  // The server's own clock, captured once per fresh response and held fixed
  // while `now` ticks locally, so a client with a fast/slow clock still
  // counts down against the deadline the server will actually enforce.
  const clockOffsetMs = useMemo(() => {
    if (!tasksData?.serverTime) return 0;
    return new Date(tasksData.serverTime).getTime() - Date.now();
  }, [tasksData?.serverTime]);

  // Build queue from API tasks. Tasks are per (league, fixture): a member
  // in several leagues that all share the same real-world fixture used to
  // get one full-size row per league for the exact same match, bloating the
  // list with visual duplicates. Fixture tasks are now grouped by the
  // canonical fixtureId (not leagueFixtureId, which is per-league) into one
  // row per real match, with a chip per league you can still predict it in.
  // Custom questions aren't grouped -- each is a distinct per-league entity,
  // not a shared fixture, so there is nothing to consolidate.
  //
  // Fixture rows are then split into gameweeks by kickoff-time clustering
  // (see GAMEWEEK_GAP_MS) -- this gameweek's matches are the main list you
  // can act on right away; anything in a later gameweek is real but not
  // actionable yet (markets for it may not even be open), so it's held
  // behind an explicit "next gameweek" reveal instead of bloating the main
  // list with fixtures nobody can predict this week anyway. Custom
  // questions have their own deadlines independent of any gameweek, so they
  // always stay in the main list rather than risk being buried.
  const { queue, queueNext, queueNextLabel } = caught ? { queue: [], queueNext: [], queueNextLabel: '' } : (() => {
    const items: any[] = tasksData?.items || [];
    const fixtureGroups = new Map<string, any[]>();
    const questionRows: any[] = [];

    items.forEach((t) => {
      if (t.kind === 'fixture') {
        const list = fixtureGroups.get(t.fixtureId) || [];
        list.push(t);
        fixtureGroups.set(t.fixtureId, list);
      }
    });

    items.forEach((t) => {
      if (t.kind !== 'custom_question') return;
      const deadlineMs = new Date(t.question?.deadlineAt || 0).getTime();
      questionRows.push({
        match: t.question?.questionText || "Question",
        competition: "Custom Question",
        meta: t.league.name,
        time: new Date(t.question?.deadlineAt || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        missing: 'Open',
        homeCode: 'Q', homeColor: '#333', homeLogo: null, awayCode: 'A', awayColor: '#555', awayLogo: null,
        href: `/leagues/${t.league.id}/questions`,
        sortMs: deadlineMs,
      });
    });

    const fixtureRows: any[] = [];
    fixtureGroups.forEach((group, fixtureId) => {
      const first = group[0];
      const homeCode = first.homeTeam.code || first.homeTeam.displayName.substring(0, 3).toUpperCase();
      const awayCode = first.awayTeam.code || first.awayTeam.displayName.substring(0, 3).toUpperCase();
      const soonestMs = group.reduce((min: number, g: any) => {
        const ms = new Date(g.nextDeadlineAt || 0).getTime();
        return ms < min ? ms : min;
      }, Infinity);
      const kickoffMs = first.kickoffAt ? new Date(first.kickoffAt).getTime() : soonestMs;

      const leagueOptions = group
        .map((g: any) => {
          const missingCount = g.missingPredictions?.length || 0;
          return {
            id: g.league.id,
            name: g.league.name,
            href: `/predict/fixture/${g.leagueFixtureId}?leagueId=${g.league.id}`,
            missing: missingCount > 0 ? `${missingCount} open` : 'Open',
          };
        })
        .sort((a: any, b: any) => a.name.localeCompare(b.name));

      const base = {
        match: `${first.homeTeam.displayName} v ${first.awayTeam.displayName}`,
        competition: first.competition?.displayName || 'Match',
        time: new Date(Number.isFinite(soonestMs) ? soonestMs : Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        homeCode, homeColor: CLUB[homeCode] || '#000', homeLogo: first.homeTeam.logoUrl || null,
        awayCode, awayColor: CLUB[awayCode] || '#000', awayLogo: first.awayTeam.logoUrl || null,
        sortMs: soonestMs,
        kickoffMs,
      };

      if (leagueOptions.length === 1) {
        fixtureRows.push({ ...base, href: leagueOptions[0].href, meta: leagueOptions[0].name, missing: leagueOptions[0].missing });
      } else {
        fixtureRows.push({ ...base, meta: `${leagueOptions.length} leagues`, leagueOptions });
      }
    });

    const gameweekBatches = clusterByKickoff(fixtureRows);
    const thisGameweek = gameweekBatches[0] || [];
    const laterGameweeks = gameweekBatches.slice(1).flat();

    const queue = [...questionRows, ...thisGameweek].sort((a, b) => a.sortMs - b.sortMs);
    const queueNext = laterGameweeks.sort((a, b) => a.kickoffMs - b.kickoffMs);
    const nextKickoffMs = queueNext.length > 0 ? queueNext[0].kickoffMs : null;
    const queueNextLabel = queueNext.length === 0 ? '' : (
      `Next gameweek · ${queueNext.length} match${queueNext.length === 1 ? '' : 'es'}` +
      (nextKickoffMs ? ` · from ${new Date(nextKickoffMs).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}` : '')
    );

    return { queue, queueNext, queueNextLabel };
  })();

  // Build leagues from API only
  // ownStanding carries `position`/`totalPoints`, not `rank`/`points` -- the
  // wrong field names here were silently `undefined` (this field is typed
  // `any`, so nothing caught it), so every league on this screen showed a
  // literal "-" position and "- pts" regardless of real standing.
  const leagues = leaguesData?.items.map(l => ({
    id: l.id,
    crest: l.name.substring(0, 2).toUpperCase(),
    crestBg: CLUB[l.name.substring(0, 2).toUpperCase()] || CLUB.PP,
    name: l.name,
    meta: `${l.competitions.length > 0 ? l.competitions[0].displayName : 'League'}`,
    position: l.ownStanding ? ordinal(l.ownStanding.position) : "-",
    points: l.ownStanding ? `${l.ownStanding.totalPoints} pts` : "-"
  })) || [];

  // Next task for hero section
  const nextTask: any = tasksData?.items[0];
  const isFixture = nextTask?.kind === 'fixture';
  const isQuestion = nextTask?.kind === 'custom_question';

  const hCode = isQuestion ? 'Q' : (isFixture ? (nextTask.homeTeam.code || nextTask.homeTeam.displayName.substring(0, 3).toUpperCase()) : "TBD");
  const aCode = isQuestion ? 'A' : (isFixture ? (nextTask.awayTeam.code || nextTask.awayTeam.displayName.substring(0, 3).toUpperCase()) : "TBD");
  const hName = isQuestion ? 'Question' : (isFixture ? nextTask.homeTeam.displayName : "To Be Decided");
  const aName = isQuestion ? 'Answer' : (isFixture ? nextTask.awayTeam.displayName : "To Be Decided");
  const hColor = isQuestion ? '#333' : (CLUB[hCode] || '#666');
  const aColor = isQuestion ? '#555' : (CLUB[aCode] || '#666');
  const hLogo = isFixture ? (nextTask.homeTeam.logoUrl || null) : null;
  const aLogo = isFixture ? (nextTask.awayTeam.logoUrl || null) : null;
  const hLeague = nextTask ? nextTask.league.name.toUpperCase() : "YOUR LEAGUES";

  const nextDeadlineMs = nextTask
    ? new Date(isFixture ? nextTask.nextDeadlineAt : nextTask.question.deadlineAt).getTime()
    : null;
  const secondsRemaining = nextDeadlineMs !== null ? Math.max(0, Math.round((nextDeadlineMs - (now + clockOffsetMs)) / 1000)) : null;
  const urgent = !caught && secondsRemaining !== null && secondsRemaining > 0 && secondsRemaining <= 900;
  const tone = urgent ? "var(--color-danger)" : caught ? "var(--nav-positive)" : "var(--nav-accent)";

  const heroTime = secondsRemaining === null ? "TBD" : (() => {
    const h = Math.floor(secondsRemaining / 3600), m = Math.floor((secondsRemaining % 3600) / 60), s = secondsRemaining % 60;
    return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}:${String(s).padStart(2, '0')}`;
  })();
  const heroKickerText = caught ? "NEXT KICK-OFF" : "NEXT LOCK";
  const heroSubText = caught ? "and you are ready for it" : "until this one closes";

  const props = {
    user, unreadCount,
    theme, setTheme,
    headSub: new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }),
    headRight: isReady ? (caught ? "Everything answered" : `${taskCount} markets open`) : "",
    
    heroStyle: {
      position: 'relative' as any,
      overflow: 'hidden',
      color: 'var(--nav-text)',
      padding: '30px 0 34px',
      borderBottom: '1px solid rgba(255,255,255,.1)',
      background: `linear-gradient(103deg, color-mix(in srgb, ${hColor} 42%, transparent) 0%, transparent 52%), linear-gradient(257deg, color-mix(in srgb, ${aColor} 42%, transparent) 0%, transparent 52%), var(--nav-surface)`
    },
    heroDotStyle: {
      width: '7px', height: '7px', borderRadius: '999px', flex: 'none', background: tone,
      animation: urgent ? 'tfpulse 1.4s ease-in-out infinite' : 'none'
    },
    heroKicker: heroKickerText,
    heroToneColor: tone,
    heroLeague: hLeague,
    heroClock: heroTime,
    heroClockSub: heroSubText,
    heroClockColor: urgent ? "var(--color-danger)" : "var(--nav-text)",
    homeCode: hCode, homeName: hName, homeColor: hColor, homeLogo: hLogo,
    awayCode: aCode, awayName: aName, awayColor: aColor, awayLogo: aLogo,
    kickoff: nextTask ? "UPCOMING" : "NO FIXTURES",
    heroBarStyle: {
      width: caught ? '100%' : '50%',
      height: '100%',
      borderRadius: '999px',
      background: caught ? "var(--nav-positive)" : "var(--nav-accent)"
    },
    heroProgress: caught ? "Finished" : "Open",
    heroCta: caught ? "Review your answers" : "Predict now",
    heroCtaStyle: {
      flex: 'none',
      height: '48px',
      minWidth: '188px',
      padding: '0 26px',
      borderRadius: '12px',
      display: 'grid',
      placeItems: 'center',
      cursor: 'pointer',
      font: "700 14px 'DM Sans', sans-serif",
      letterSpacing: '-.1px',
      border: caught ? '1px solid var(--nav-border)' : 'none',
      color: caught ? 'var(--nav-text)' : 'var(--nav-on-accent)',
      background: caught ? 'transparent' : 'var(--nav-accent)'
    },

    queueKicker: caught ? "Nothing else owed" : "This gameweek",
    queueLink: caught ? "" : (taskCount > 5 ? `SEE ALL ${taskCount} →` : ""),
    queue: queue,
    queueClear: caught,
    queueNext: queueNext,
    queueNextLabel: queueNextLabel,
    
    // Weekend card — hidden when no real data
    weekendStyle: {
      borderRadius: '14px',
      padding: '20px',
      background: 'var(--tf-green-800)',
      display: leagues.length > 0 ? 'block' : 'none'
    },
    weekendBadge: `${leagues.length} LEAGUE${leagues.length !== 1 ? 'S' : ''}`,
    weekendPoints: "-",
    weekendRows: [],

    leagues: leagues,
    leagueCount: String(leagues.length),

    // State props for component compatibility
    isLoading,
    isNewUser,
    isReady,
    state: isLoading ? 'loading' : isNewUser ? 'newuser' : caught ? 'caughtup' : 'live',
    setState: () => {}, // No-op, no dev tools
  };

  return (
    <div className="flex flex-col flex-1 h-[100dvh] md:h-auto overflow-hidden bg-[var(--surface-canvas)]">
      <HomeScreen {...props} />
    </div>
  );
}
