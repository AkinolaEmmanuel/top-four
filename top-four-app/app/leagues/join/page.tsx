'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEstablishInvitationIntent, useConsumeInvitationIntent } from '@/hooks/api/useLeagues';
import { JoinLeagueMobile } from '@/app/components/leagues/JoinLeagueMobile';
import { JoinLeagueDesktop } from '@/app/components/leagues/JoinLeagueDesktop';

export default function JoinLeaguePage() {
  const router = useRouter();
  const establishIntent = useEstablishInvitationIntent();
  const consumeIntent = useConsumeInvitationIntent();
  
  const [step, setStep] = useState<'signup' | 'signin' | 'code'>('code');
  const [theme] = useState<'light' | 'dark'>('dark');
  const [outcome, setOutcome] = useState<string | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [inviteCode, setInviteCode] = useState('');
  const [joinedLeague, setJoinedLeague] = useState<any>(null);

  const joinedLeagueName = joinedLeague?.name || joinedLeague?.league?.name || "Your league";

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
      title: `${joinedLeagueName} is yours to play`,
      body: "You have joined the league. Fixtures and questions are ready for predictions.",
      primary: "Start predicting",
      note: "You are in. The next round of fixtures will be scored for you."
    }
  };

  const MY_LEAGUES: any[] = [];

  const onOutcome = outcome !== null;
  const o = outcome ? OUTCOMES[outcome] : {};

  const concealed = outcome === "dead";
  const dead = concealed || outcome === "closed";
  const joined = outcome === "welcome";
  const byCode = step === "code" && !onOutcome;

  const INVITE = joined ? ["YOU ARE IN", "var(--nav-positive)"]
    : dead ? ["INVITATION NO LONGER VALID", "var(--nav-text-faint)"]
    : ["YOU HAVE BEEN INVITED TO", "var(--nav-accent)"];

  const facts: [string, string][] = [];

  const TAGS = joined
    ? [["JOINED TODAY", "ok"]]
    : concealed ? []
    : dead ? [["NOT ACCEPTING JOINS", "muted"]]
    : [];

  const tags = TAGS.map(([label, kind]) => ({
    label,
    style: kind === "warn" ? "bg-[var(--nav-warn,rgba(217,119,6,.22))] text-[var(--state-provisional)]"
      : kind === "ok" ? "bg-[var(--nav-positive)] text-[var(--nav-surface)]"
      : kind === "plain" ? "bg-[rgba(255,255,255,.1)] text-[var(--nav-text-quiet)]"
      : "border border-[var(--nav-border)] text-[var(--nav-text-faint)]"
  }));

  const chromeRight = onOutcome ? "" : step === "signin" ? "Sign in" : step === "code" ? "Join by code" : "Invitation";
  const leagueName = concealed ? "This invitation" : (byCode ? "Which league?" : joinedLeagueName);

  const trySignin = () => {
    if (attempts < 2) setAttempts(a => a + 1);
  };

  const handleJoinCode = () => {
    if (inviteCode.length !== 10 || establishIntent.isPending || consumeIntent.isPending) return;
    establishIntent.mutate({ joinCode: inviteCode }, {
      onSuccess: (preview) => {
        consumeIntent.mutate(undefined, {
          onSuccess: (outcome) => {
            if (outcome.outcome === 'pending') {
              setJoinedLeague({ name: preview.league.name });
              setOutcome("pending");
            } else {
              setJoinedLeague({ name: preview.league.name, id: outcome.leagueId });
              setOutcome("welcome");
            }
          },
          onError: (err: any) => {
            setOutcome(err?.data?.code === 'USER_LEAGUE_LIMIT_REACHED' ? "limit" : "dead");
          }
        });
      },
      onError: () => {
        // The backend deliberately collapses expired/used-up/withdrawn/closed
        // invitations into one generic error — nothing to disambiguate here.
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
    joinLeaguePending: establishIntent.isPending || consumeIntent.isPending,
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
