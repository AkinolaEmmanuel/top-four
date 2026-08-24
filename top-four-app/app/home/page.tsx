'use client';

import { useState } from 'react';
import { HomeMobile } from '../components/home/HomeMobile';
import { HomeDesktop } from '../components/home/HomeDesktop';
import { usePredictionTasks } from '@/hooks/api/usePredictions';
import { useMyLeagues } from '@/hooks/api/useLeagues';
import { useAuth } from '@/context/auth-context';

const CLUB: Record<string, string> = {
  ARS: "#c8182f", CHE: "#1746a2", LIV: "#b7152b", TOT: "#17233d",
  MCI: "#559ac7", EVE: "#153c85", MUN: "#d1262f", NEW: "#20242a",
  PP: "#0879bf", OL: "#7f56d9", AL: "#0e7a5f"
};

export default function Home() {
  const { user } = useAuth();
  const { data: tasksData, isLoading: tasksLoading } = usePredictionTasks();
  const { data: leaguesData, isLoading: leaguesLoading } = useMyLeagues();

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const isApiLoading = tasksLoading || leaguesLoading;
  const isNewUser = !isApiLoading && leaguesData?.items.length === 0;
  const isLoading = isApiLoading;
  const isReady = !isLoading && !isNewUser;
  
  const taskCount = tasksData?.items.length || 0;
  const caught = isReady && taskCount === 0;
  const urgent = false; // Will be driven by API deadline proximity in future

  const tone = urgent ? "var(--color-danger)" : caught ? "var(--nav-positive)" : "var(--nav-accent)";

  // Build queue from API tasks only
  const queue = caught ? [] : (tasksData?.items.map((t: any) => {
    if (t.kind === 'fixture') {
      return {
        match: `${t.homeTeam.displayName} v ${t.awayTeam.displayName}`,
        competition: 'Match',
        meta: t.league.name,
        time: new Date(t.nextDeadlineAt || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        missing: 'Open',
        homeCode: t.homeTeam.displayName.substring(0, 3).toUpperCase(),
        homeColor: CLUB[t.homeTeam.displayName.substring(0, 3).toUpperCase()] || '#000',
        awayCode: t.awayTeam.displayName.substring(0, 3).toUpperCase(),
        awayColor: CLUB[t.awayTeam.displayName.substring(0, 3).toUpperCase()] || '#000'
      };
    }
    return {
      match: t.question?.questionText || "Question",
      competition: "Custom Question",
      meta: t.league.name,
      time: new Date(t.question?.deadlineAt || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      missing: 'Open',
      homeCode: 'Q', homeColor: '#333', awayCode: 'A', awayColor: '#555'
    };
  }) || []);

  // Build leagues from API only
  const leagues = leaguesData?.items.map(l => ({
    crest: l.name.substring(0, 2).toUpperCase(),
    crestBg: CLUB[l.name.substring(0, 2).toUpperCase()] || CLUB.PP,
    name: l.name,
    meta: `${l.competitions.length > 0 ? l.competitions[0].displayName : 'League'}`,
    position: l.ownStanding ? `${l.ownStanding.rank}th` : "-",
    points: l.ownStanding ? `${l.ownStanding.points} pts` : "-"
  })) || [];

  // Next task for hero section
  const nextTask: any = tasksData?.items[0];
  const isFixture = nextTask?.kind === 'fixture';
  const isQuestion = nextTask?.kind === 'custom_question';

  const hCode = isQuestion ? 'Q' : (isFixture ? nextTask.homeTeam.displayName.substring(0, 3).toUpperCase() : "TBD");
  const aCode = isQuestion ? 'A' : (isFixture ? nextTask.awayTeam.displayName.substring(0, 3).toUpperCase() : "TBD");
  const hName = isQuestion ? 'Question' : (isFixture ? nextTask.homeTeam.displayName : "To Be Decided");
  const aName = isQuestion ? 'Answer' : (isFixture ? nextTask.awayTeam.displayName : "To Be Decided");
  const hColor = isQuestion ? '#333' : (CLUB[hCode] || '#666');
  const aColor = isQuestion ? '#555' : (CLUB[aCode] || '#666');
  const hLeague = nextTask ? nextTask.league.name.toUpperCase() : "YOUR LEAGUES";
  
  const heroTime = nextTask ? new Date(isFixture ? nextTask.nextDeadlineAt : nextTask.question.deadlineAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBD";
  const heroKickerText = caught ? "NEXT KICK-OFF" : "NEXT LOCK";
  const heroSubText = caught ? "and you are ready for it" : "until this one closes";

  const props = {
    user,
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
    homeCode: hCode, homeName: hName, homeColor: hColor,
    awayCode: aCode, awayName: aName, awayColor: aColor,
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

    queueKicker: caught ? "Nothing else owed" : "Also waiting on you",
    queueLink: caught ? "" : (taskCount > 5 ? `SEE ALL ${taskCount} →` : ""),
    queue: queue,
    queueClear: caught,
    
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

      <div className="md:hidden flex flex-col flex-1 overflow-hidden h-[100dvh]">
        <HomeMobile {...props} />
      </div>
      <div className="hidden md:flex flex-col flex-1 overflow-hidden h-full">
        <HomeDesktop {...props} />
      </div>
    </div>
  );
}
