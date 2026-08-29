'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useJoinLeague } from '@/hooks/api/useLeagues';
import { JoinLeagueMobile } from '@/app/components/leagues/JoinLeagueMobile';
import { JoinLeagueDesktop } from '@/app/components/leagues/JoinLeagueDesktop';

export default function JoinLeaguePage() {
  const router = useRouter();
  const joinLeague = useJoinLeague();
  
  const [step, setStep] = useState<'signup' | 'signin' | 'code'>('code');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [outcome, setOutcome] = useState<string | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [seconds, setSeconds] = useState(1680);
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(s => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const OUTCOMES: any = {
    verify: {
      tone: "var(--color-brand)", icon: "✉",
      title: "Check your inbox",
      body: "We sent a verification link. The account exists but is not verified yet, so you are not signed in and the join has not happened.",
      secondary: "Resend the email", secondaryOff: true,
      note: "The invitation is still held while you verify."
    },
    pending: {
      tone: "var(--color-warning)", icon: "◷",
      title: "Your request is with the owner",
      body: "This league approves every join by hand. We will tell you the moment somebody decides — until then you cannot see its fixtures or its table.",
      primary: "Back to my leagues", secondary: "Withdraw the request",
      note: "An approved request survives the invitation later being switched off or used up."
    },
    limit: {
      tone: "var(--color-danger)", icon: "!",
      title: "You are in twenty leagues already",
      body: "Twenty unfinished leagues is the limit. Leagues that have finished do not count and stay in your history, so finishing or leaving one makes room.",
      list: true,
      primary: "Choose one to leave",
      note: "Nothing about this invitation is lost. Come back to the link once you have room."
    },
    closed: {
      tone: "var(--text-muted)", icon: "✕",
      title: "This league is not taking anyone new",
      body: "It is already under way and its rules do not allow joining late. That was fixed when the league was published, so it will not change this season.",
      primary: "Enter a different code",
      note: "Ask whoever invited you whether they run another league you could join."
    },
    dead: {
      tone: "var(--text-muted)", icon: "⊘",
      title: "This invitation cannot be used",
      body: "It has expired, been used up, or been withdrawn. For safety we do not say which, and nothing else about the league is revealed.",
      primary: "Enter a code instead",
      note: "Ask whoever invited you for a fresh link."
    },
    welcome: {
      tone: "var(--color-success)", icon: "✓",
      title: "Premier Predictors is yours to play",
      body: "Six fixtures are open right now and the first one locks in 2h 15m. Two questions are open as well.",
      primary: "Start predicting",
      note: "You joined mid-season, so the rounds already played are not yours to score."
    }
  };

  const MY_LEAGUES = [
    ["Office League", "Round 12 of 38 · 4th of 22", "LEAVE", "var(--ident-2)", "OL"],
    ["Alumni League", "Round 3 of 38 · 18th of 64", "LEAVE", "var(--ident-4)", "AL"],
    ["Sunday Six", "Finished · does not count", "—", "var(--ident-6)", "SS"]
  ];

  const onOutcome = outcome !== null;
  const o = outcome ? OUTCOMES[outcome] : {};

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const hold = `${m}m ${String(s).padStart(2, '0')}s`;

  const concealed = outcome === "dead";
  const dead = concealed || outcome === "closed";
  const joined = outcome === "welcome";
  const byCode = step === "code" && !onOutcome;

  const INVITE = joined ? ["YOU ARE IN", "var(--nav-positive)"]
    : dead ? ["INVITATION NO LONGER VALID", "var(--nav-text-faint)"]
    : ["YOU HAVE BEEN INVITED TO", "var(--nav-accent)"];

  const facts = joined
    ? [["129", "MEMBERS"], ["6", "OPEN NOW"], ["3", "COMPETITIONS"]]
    : [["128", "MEMBERS"], ["3", "COMPETITIONS"], ["38", "ROUNDS"]];

  const TAGS = joined
    ? [["JOINED TODAY", "ok"]]
    : concealed ? []
    : dead ? [["NOT ACCEPTING JOINS", "muted"]]
    : [["OWNER APPROVES JOINS", "warn"], [`HELD ${hold}`, "muted"], ["IN PROGRESS", "plain"]];

  const tags = TAGS.map(([label, kind]) => ({
    label,
    style: kind === "warn" ? "bg-[var(--nav-warn,rgba(217,119,6,.22))] text-[var(--state-provisional)]"
      : kind === "ok" ? "bg-[var(--nav-positive)] text-[var(--nav-surface)]"
      : kind === "plain" ? "bg-[rgba(255,255,255,.1)] text-[var(--nav-text-quiet)]"
      : "border border-[var(--nav-border)] text-[var(--nav-text-faint)]"
  }));

  const chromeRight = onOutcome ? "" : step === "signin" ? "Sign in" : step === "code" ? "Join by code" : "Invitation";
  const leagueName = concealed ? "This invitation" : (byCode ? "Which league?" : "Premier Predictors");

  const trySignin = () => {
    if (attempts < 2) setAttempts(a => a + 1);
  };

  const handleJoinCode = () => {
    if (inviteCode.length !== 6 || joinLeague.isPending) return;
    joinLeague.mutate(inviteCode, {
      onSuccess: () => {
        setOutcome("welcome");
      },
      onError: () => {
        setOutcome("dead");
      }
    });
  };

  const handleNavigateHome = () => {
    router.push('/home');
  };

  const sharedProps = {
    leagueName,
    concealed,
    byCode,
    chromeRight,
    joined,
    dead,
    INVITE,
    facts,
    tags,
    step,
    setStep,
    onOutcome,
    outcome,
    setOutcome,
    o,
    inviteCode,
    setInviteCode,
    focus,
    setFocus,
    attempts,
    trySignin,
    joinLeaguePending: joinLeague.isPending,
    onJoinCode: handleJoinCode,
    onNavigateHome: handleNavigateHome,
    MY_LEAGUES
  };

  return (
    <div className={`flex flex-col flex-1 h-[100dvh] md:h-auto overflow-hidden bg-[var(--surface-canvas)] relative ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="md:hidden flex flex-col flex-1 overflow-hidden h-[100dvh]">
        <JoinLeagueMobile {...sharedProps} />
      </div>
      <div className="hidden md:flex flex-col flex-1 overflow-hidden h-full">
        <JoinLeagueDesktop {...sharedProps} />
      </div>
    </div>
  );
}
