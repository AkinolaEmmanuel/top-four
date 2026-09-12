'use client';

import { useState } from 'react';
import { ApiError } from '@/lib/api/fetcher';
import { useRouter } from 'next/navigation';
import { useEstablishInvitationIntent, useConsumeInvitationIntent, useCancelJoinRequest, useMyLeagues, useLeaveAnyLeague } from '@/hooks/api/useLeagues';
import { JoinLeagueScreen, JOIN_CODE_LENGTH, type JoinOutcome } from '@/app/components/leagues/JoinLeagueScreen';

export default function JoinLeaguePage() {
  const router = useRouter();
  const establishIntent = useEstablishInvitationIntent();
  const consumeIntent = useConsumeInvitationIntent();
  const cancelJoinRequestMutation = useCancelJoinRequest();
  const { data: myLeaguesData } = useMyLeagues();
  const leaveAnyLeague = useLeaveAnyLeague();

  const [outcome, setOutcome] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [joinedLeague, setJoinedLeague] = useState<any>(null);
  const [pendingRequest, setPendingRequest] = useState<{ leagueId: string; requestId: string } | null>(null);

  const joinedLeagueName = joinedLeague?.name || joinedLeague?.league?.name || "Your league";

  /*
   * What to tell a member, and what to leave out.
   *
   * Each of these used to carry a `note` explaining how the invitation system
   * behaves behind the scenes — that an approved request survives the link
   * being switched off, that the intent is held while an email is verified.
   * None of it is something the reader can act on, and all of it was written
   * from the API's point of view rather than theirs.
   */
  const OUTCOMES: Record<string, JoinOutcome> = {
    verify: {
      tone: "var(--color-brand)", icon: "\u2709",
      title: "Check your inbox",
      body: "We sent a verification link. Open it and the join will finish.",
      secondary: "Resend the email", secondaryOff: true,
    },
    pending: {
      tone: "var(--color-warning)", icon: "\u25f7",
      title: "Your request is with the owner",
      body: "This league approves every join by hand. We will tell you the moment somebody decides.",
      primary: "Back to my leagues", secondary: "Withdraw the request",
    },
    limit: {
      tone: "var(--color-danger)", icon: "!",
      title: "You are in twenty leagues already",
      body: "Finished leagues do not count, so finishing or leaving one makes room.",
      list: true,
      primary: "Back to my leagues",
    },
    closed: {
      tone: "var(--text-muted)", icon: "\u2715",
      title: "This league is not taking anyone new",
      body: "It is already under way and its rules do not allow joining late.",
      primary: "Enter a different code",
    },
    dead: {
      tone: "var(--text-muted)", icon: "\u2298",
      title: "This invitation cannot be used",
      body: "It has expired, been used up, or been withdrawn. Ask whoever invited you for a fresh one.",
      primary: "Enter a different code",
    },
    welcome: {
      tone: "var(--color-success)", icon: "\u2713",
      title: `${joinedLeagueName} is yours to play`,
      body: "Fixtures and questions are ready for predictions.",
      primary: "Start predicting",
    }
  };

  const MY_LEAGUES = (myLeaguesData?.items || [])
    .filter(l => !['completed', 'archived', 'cancelled'].includes(l.lifecycleState))
    .map(l => ({ id: l.id, name: l.name, competition: l.competitions?.[0]?.displayName || 'League' }));

  const handleLeaveLeague = (leagueId: string) => {
    if (leaveAnyLeague.isPending) return;
    if (!window.confirm('Leave this league to make room for the one you are trying to join?')) return;
    leaveAnyLeague.mutate({ leagueId }, {
      onSuccess: () => setOutcome(null),
      onError: () => window.alert("Couldn't leave that league"),
    });
  };

  const onOutcome = outcome !== null;
  const o = outcome ? OUTCOMES[outcome] : {};

  const concealed = outcome === "dead";
  const dead = concealed || outcome === "closed";
  const joined = outcome === "welcome";
  const byCode = !onOutcome;

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

  const chromeRight = onOutcome ? "" : "Join by code";
  const leagueName = concealed ? "This invitation" : (byCode ? "Which league?" : joinedLeagueName);

  const handleJoinCode = () => {
    if (inviteCode.length !== JOIN_CODE_LENGTH || establishIntent.isPending || consumeIntent.isPending) return;
    establishIntent.mutate({ joinCode: inviteCode }, {
      onSuccess: (preview) => {
        consumeIntent.mutate(undefined, {
          onSuccess: (outcome) => {
            if (outcome.outcome === 'pending') {
              setJoinedLeague({ name: preview.league.name });
              setPendingRequest({ leagueId: outcome.leagueId, requestId: outcome.joinRequestId });
              setOutcome("pending");
            } else {
              setJoinedLeague({ name: preview.league.name, id: outcome.leagueId });
              setOutcome("welcome");
            }
          },
          onError: (err: unknown) => {
            const limitReached = err instanceof ApiError && err.code === 'USER_LEAGUE_LIMIT_REACHED';
            setOutcome(limitReached ? "limit" : "dead");
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

  const handleWithdrawRequest = () => {
    if (!pendingRequest || cancelJoinRequestMutation.isPending) return;
    cancelJoinRequestMutation.mutate(pendingRequest, {
      onSuccess: () => {
        setPendingRequest(null);
        setOutcome(null);
        setInviteCode('');
      }
    });
  };

  const detail = outcome ? OUTCOMES[outcome] ?? null : null;

  return (
    <JoinLeagueScreen
      outcome={outcome}
      detail={detail}
      inviteCode={inviteCode}
      setInviteCode={setInviteCode}
      pending={establishIntent.isPending || consumeIntent.isPending}
      onJoinCode={handleJoinCode}
      onPrimary={() => {
        if (outcome === 'welcome') { router.push(joinedLeague?.id ? `/leagues/${joinedLeague.id}` : '/home'); return; }
        if (outcome === 'closed' || outcome === 'dead') { setOutcome(null); setInviteCode(''); return; }
        handleNavigateHome();
      }}
      onSecondary={outcome === 'pending' ? handleWithdrawRequest : undefined}
      onLeaveLeague={handleLeaveLeague}
      myLeagues={MY_LEAGUES}
    />
  );
}
