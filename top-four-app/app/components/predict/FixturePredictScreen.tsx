'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LeagueContextBar } from '../leagues/LeagueContextBar';
import { LineupPicker } from './LineupPicker';
import { PlayerPickerPanel } from './PlayerPickerPanel';
import { MARKET_TYPE, type PickerMarket, type PickerSquad } from '@/lib/predict/player-picker';
import { useSubmitPrediction, useSubmitLineupPrediction, useCopyPredictions } from '@/hooks/api/useFixturePrediction';
import { usePredictionHistory } from '@/hooks/api/usePredictionHistory';
import { failureMessage } from '@/lib/api/failure';
import { ApiError } from '@/lib/api/fetcher';
import { fetchOwnPredictions } from '@/lib/api/predictions-fixture';
import { lockLabel, countdownLabel } from '@/lib/format';
import { Breadcrumb } from '../Breadcrumb';
import { TeamCrest } from '../TeamCrest';
import { PlayerFace } from '../PlayerFace';
import { heroGradient } from '@/lib/crest-colour';
import { useTeamPalettes } from '@/hooks/useTeamPalettes';
import {
  carryLabelsFor,
  progressOf,
  toAnswerPayload,
  toCopySummaries,
  type CopyLeagueSummary,
  type FixtureAnswers,
  type FixtureMarket,
  type FixturePhase,
  answerLabelFor,
  readStoredAnswer,
} from '@/lib/predict/fixture-predict';
import type { StandardAnswerValue } from '@/lib/api/predictions-fixture';
import { pluralise } from '@/lib/format';

/**
 * Fixture Predict — one component for both platforms.
 *
 * Every market saves on its own the moment it is picked, so this holds the
 * answers in flight and the version each one must be written against. A
 * rejected write restores the pre-click value and says why: the member is
 * scored on what the server kept, so showing them anything else is a lie.
 */


/** The design lists a handful of names per market; the rest live in the picker. */
const INLINE_PLAYERS = 3;

const HERO_COPY: Record<FixturePhase, [kicker: string, caption: string, blurb: string]> = {
  open: ['OPEN', 'until everything locks', 'Lineups close two hours earlier. Everything else stays open until the whistle.'],
  urgent: ['LOCKING NOW', 'until everything locks', 'Anything still unanswered when the whistle goes scores nothing. Lineups have already closed.'],
  locked: ['LOCKED', 'kick-off', 'Nothing can change now. Any unanswered markets will score nothing.'],
  settled: ['PROVISIONAL', 'so far', 'Provisional until review closes. A voided market scores nothing for everyone.'],
};


const timeOfDay = (at: string | null) =>
  at ? new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '—';

/**
 * The kickoff with its day, as the design's hero has it: "Sat 15:00".
 *
 * On a screen whose whole subject is a deadline the day is the half that
 * matters — a fixture three days out and one this afternoon read identically
 * without it. Today drops the weekday, because there it says nothing.
 */
const kickoffLabel = (at: string | null, nowMs: number) => {
  if (!at) return '—';
  const when = new Date(at);
  if (Number.isNaN(when.getTime())) return '—';
  const today = new Date(nowMs);
  const sameDay = when.getFullYear() === today.getFullYear()
    && when.getMonth() === today.getMonth()
    && when.getDate() === today.getDate();
  const time = timeOfDay(at);
  return sameDay ? time : `${when.toLocaleDateString([], { weekday: 'short' }).toUpperCase()} ${time}`;
};

/**
 * A write the server refused because the stored answer had already moved.
 *
 * `stored` is read back from the API after the refusal rather than guessed, and
 * is `undefined` when the other device cleared the answer instead of changing it.
 */
interface MarketConflict {
  market: FixtureMarket;
  /** What this device was about to save. */
  attempted: unknown;
  stored: unknown;
}

export function FixturePredictScreen({
  leagueId, fixtureId, leagueName, competition,
  homeName, awayName, homeCode, awayCode, homeLogo, awayLogo,
  kickoffAt, nextDeadlineAt, lineupDeadlineAt, serverTime,
  phase, markets, initialAnswers, versions, lineupVersions, snapshotId, squads,
  pointsAtStake, pointsEarned, otherLeagueCount, totalGoalsLine,
}: {
  leagueId: string;
  fixtureId: string;
  leagueName: string;
  competition: string;
  homeName: string;
  awayName: string;
  homeCode: string;
  awayCode: string;
  homeLogo: string | null;
  awayLogo: string | null;
  kickoffAt: string | null;
  nextDeadlineAt: string | null;
  lineupDeadlineAt: string | null;
  /** The clock every deadline is measured against, so a wrong device clock cannot open a closed market. */
  serverTime: string;
  phase: FixturePhase;
  markets: FixtureMarket[];
  initialAnswers: FixtureAnswers;
  versions: Record<string, number>;
  lineupVersions: { home: number; away: number };
  snapshotId: string | null;
  /** Both squads, so the full picker opens here rather than on its own route. */
  squads: PickerSquad[];
  pointsAtStake: number;
  pointsEarned: number;
  otherLeagueCount: number;
  /** The league's own frozen over/under line, e.g. 2.5. */
  totalGoalsLine: number;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<FixtureAnswers>(initialAnswers);
  const [marketVersions, setMarketVersions] = useState(versions);
  const [sideVersions, setSideVersions] = useState(lineupVersions);
  const [saved, setSaved] = useState<string | null>(null);
  const [failed, setFailed] = useState<Record<string, string>>({});
  const [editingLineup, setEditingLineup] = useState<'home' | 'away' | null>(null);
  const [pickingPlayers, setPickingPlayers] = useState<PickerMarket | null>(null);
  const [openTrail, setOpenTrail] = useState<string | null>(null);
  const [copyView, setCopyView] = useState<'closed' | 'confirm' | 'done'>('closed');
  const [conflict, setConflict] = useState<MarketConflict | null>(null);
  const [copyReport, setCopyReport] = useState<CopyLeagueSummary[] | null>(null);
  const [now, setNow] = useState(() => Date.parse(serverTime));

  const submitPrediction = useSubmitPrediction(leagueId, fixtureId);
  const submitLineup = useSubmitLineupPrediction(leagueId, fixtureId);
  const copyPredictions = useCopyPredictions(leagueId, fixtureId);

  // Deadlines belong to the server. The offset is measured once against the
  // clock that issued them and applied to every countdown after.
  const offset = useRef(Date.parse(serverTime) - Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now() + offset.current), 1000);
    return () => clearInterval(timer);
  }, []);

  const settled = phase === 'settled';
  const locked = phase === 'locked';
  const editable = !settled && !locked;

  const countdown = (at: string | null) => {
    if (!at) return '—';
    return countdownLabel(Date.parse(at) - now);
  };

  const progress = progressOf(markets, answers);
  const carryLabels = carryLabelsFor(markets, answers);
  const [heroKicker, heroCaption, heroBlurb] = HERO_COPY[phase];

  // The countdown runs to the *soonest* deadline, which before kickoff is the
  // lineup lock two hours earlier — not the moment everything closes. Naming
  // the wrong one put the hero at odds with the line right beneath it.
  const nextIsLineups = phase === 'open'
    && nextDeadlineAt !== null
    && lineupDeadlineAt !== null
    && Date.parse(nextDeadlineAt) === Date.parse(lineupDeadlineAt);
  const countdownCaption = nextIsLineups ? 'until lineups lock' : heroCaption;
  const heroTone = phase === 'urgent' ? 'var(--color-danger)'
    : settled ? 'var(--state-provisional)'
      : locked ? 'var(--nav-text-faint)' : 'var(--nav-accent)';

  const clearFailure = (key: string) => setFailed(prev => {
    if (!(key in prev)) return prev;
    const { [key]: _removed, ...rest } = prev;
    return rest;
  });

  const showReceipt = (key: string) => {
    clearFailure(key);
    setSaved(key);
    setTimeout(() => setSaved(current => (current === key ? null : current)), 2200);
  };

  const recordFailure = (key: string, snapshot: FixtureAnswers, error: unknown) => {
    answersRef.current = snapshot;
    setAnswers(snapshot);
    setSaved(current => (current === key ? null : current));
    setFailed(prev => ({ ...prev, [key]: failureMessage(error, 'Not saved.') }));
  };

  /*
   * One write at a time per market, and the freshest value wins.
   *
   * Every tap used to fire its own write carrying the version this page was
   * built with. Setting a 1–0 is two taps, so the second left before the first
   * came back, arrived with a version the server had already moved past, and
   * was refused — "Changed somewhere else" against nobody but yourself. The
   * exact-score stepper could not be finished before it started complaining.
   *
   * So: a market with a write in flight parks the new value instead of racing
   * it, and sends it once the first returns with the version it produced.
   * Nothing is dropped, nothing is sent against a stale version, and a run of
   * taps collapses to one follow-up rather than one write each.
   */
  /** What is on screen right now, readable between renders. */
  const answersRef = useRef<FixtureAnswers>(initialAnswers);
  const inFlight = useRef<Record<string, boolean>>({});
  const queued = useRef<Record<string, unknown>>({});
  const versionRef = useRef<Record<string, number>>(versions);

  /*
   * Awaited through the promise, never through `mutate`'s callbacks.
   *
   * Every market shares one mutation, and React Query keeps only the newest:
   * a second `mutate` detaches the observer from the first, so the first
   * call's onSuccess/onError/onSettled never run. One score tap writes three
   * markets at once — the score, and the both-teams and over/under lines it
   * implies — so the score's own onSettled was cancelled by its siblings,
   * `inFlight` stayed true for the life of the page, and every later tap
   * parked itself in `queued` waiting on a callback that would never come.
   * The stored score stayed at whatever the first tap left. The promise each
   * call returns belongs to that call and settles whatever starts after it.
   */
  const writeMarket = (market: FixtureMarket, value: unknown, snapshot: FixtureAnswers) => {
    inFlight.current[market.key] = true;

    const drain = () => {
      inFlight.current[market.key] = false;
      if (!(market.key in queued.current)) return;
      const next = queued.current[market.key];
      delete queued.current[market.key];
      writeMarket(market, next, snapshot);
    };

    submitPrediction.mutateAsync({
      marketType: market.marketType,
      expectedVersion: versionRef.current[market.marketType] ?? 0,
      answer: toAnswerPayload(market.marketType, value, snapshotId ?? undefined) as StandardAnswerValue,
    }).then(
      result => {
        versionRef.current[market.marketType] = result.version;
        setMarketVersions(prev => ({ ...prev, [market.marketType]: result.version }));
        showReceipt(market.key);
        router.refresh();
        drain();
      },
      error => {
        recordFailure(market.key, snapshot, error);
        if (error instanceof ApiError && error.status === 409) void openConflict(market, value);
        drain();
      },
    );
  };

  /*
   * A refused write, turned into a choice rather than a dead end.
   *
   * A 409 means the stored answer moved under this device — the same account on
   * a phone and a laptop, most often. The row can say so on its own, but saying
   * so is all it can do: it does not know what the other device stored, so the
   * member is left to guess whether to try again.
   *
   * So the refusal is followed by a read. Once the stored answer is in hand the
   * panel can name both sides and offer the two real options, which is what the
   * design asked for and what the old hardcoded version only pretended to do.
   */
  const openConflict = async (market: FixtureMarket, attempted: unknown) => {
    const fresh = await fetchOwnPredictions(leagueId, fixtureId).catch(() => null);
    // Without the read there is nothing true to put in the panel, so the row's
    // own message stands as the whole of the report.
    if (!fresh) return;

    const slot = fresh.markets.find(m => m.marketType === market.marketType);
    const storedVersion = slot?.version ?? versionRef.current[market.marketType] ?? 0;

    // Adopt the server's version either way: whichever option is taken next,
    // the next write has to carry the version the store actually holds.
    versionRef.current[market.marketType] = storedVersion;
    setMarketVersions(prev => ({ ...prev, [market.marketType]: storedVersion }));

    setConflict({
      market,
      attempted,
      stored: slot?.answer ? readStoredAnswer(slot.answer.value) : undefined,
    });
  };

  const applyAnswer = (market: FixtureMarket, value: unknown) => {
    const next = { ...answersRef.current };
    if (value === undefined) delete next[market.key];
    else next[market.key] = value;
    answersRef.current = next;
    setAnswers(next);
    clearFailure(market.key);
    return next;
  };

  const keepStored = () => {
    if (!conflict) return;
    applyAnswer(conflict.market, conflict.stored);
    setConflict(null);
    router.refresh();
  };

  const replaceStored = () => {
    if (!conflict) return;
    const { market, attempted } = conflict;
    setConflict(null);
    writeMarket(market, attempted, applyAnswer(market, attempted));
  };

  const answerMarket = (market: FixtureMarket, value: unknown) => {
    if (!editable || !market.open) return;
    const snapshot = answersRef.current;
    answersRef.current = { ...answersRef.current, [market.key]: value };
    setAnswers(answersRef.current);
    clearFailure(market.key);

    if (inFlight.current[market.key]) {
      queued.current[market.key] = value;
      return;
    }
    writeMarket(market, value, snapshot);
  };

  /**
   * A scoreline settles both teams to score and the over/under line on its
   * own — 2-1 can only mean both teams scored, and, on the league's own
   * line, over. Left independent, a 2-1 sat next to a "No" for both teams to
   * score not as a second opinion but as a mistake nobody caught until
   * settlement halved what the market should have paid. Only touches a
   * market that disagrees with the score and is still open — `answerMarket`
   * itself is the guard for a market that has locked or that this fixture
   * does not carry at all.
   */
  const syncDerivedMarkets = (score: [number, number]) => {
    const [home, away] = score;
    const btts = markets.find(m => m.key === 'both_teams_to_score');
    if (btts) {
      const derived = home > 0 && away > 0 ? 'yes' : 'no';
      if (answersRef.current.both_teams_to_score !== derived) answerMarket(btts, derived);
    }
    const totalGoals = markets.find(m => m.key === 'total_goals');
    if (totalGoals) {
      const derived = home + away > totalGoalsLine ? 'over' : 'under';
      if (answersRef.current.total_goals !== derived) answerMarket(totalGoals, derived);
    }
  };

  /*
   * Read from the ref, not from render state: three taps in a row all see the
   * same `answers` from the same render, so each one computed its result from
   * 0–0 and the last overwrote the rest. Tapping home three times and away once
   * produced 0–1.
   */
  const bumpScore = (market: FixtureMarket, index: 0 | 1, delta: number) => {
    const current = (answersRef.current.exact_score as [number, number] | undefined) ?? [0, 0];
    const next: [number, number] = [current[0], current[1]];
    next[index] = Math.max(0, Math.min(9, next[index] + delta));
    answerMarket(market, next);
    syncDerivedMarkets(next);
  };

  const saveLineup = (side: 'home' | 'away', playerIds: string[]) => {
    const key = `${side}_lineup`;
    if (!snapshotId) {
      setFailed(prev => ({ ...prev, [key]: 'The squad list is still loading — try again in a moment.' }));
      return;
    }

    const snapshot = answers;
    setAnswers(prev => ({ ...prev, [key]: playerIds }));
    clearFailure(key);
    setEditingLineup(null);

    // Through the promise for the same reason as `writeMarket`: home and away
    // share one mutation, so saving the second side while the first is still
    // in flight cancelled the first's callbacks and left its version stale.
    submitLineup.mutateAsync({ side, expectedVersion: sideVersions[side], playerIds, snapshotId }).then(
      result => {
        setSideVersions(prev => ({ ...prev, [side]: result.version }));
        showReceipt(key);
        router.refresh();
      },
      error => recordFailure(key, snapshot, error),
    );
  };

  const runCopy = () => {
    copyPredictions.mutate(undefined, {
      onSuccess: report => {
        setCopyReport(toCopySummaries(report.leagues));
        setCopyView('done');
        router.refresh();
      },
      onError: () => {
        setCopyReport(null);
        setCopyView('done');
      },
    });
  };

  const [homePalette, awayPalette] = useTeamPalettes(
    { code: homeCode, logoUrl: homeLogo },
    { code: awayCode, logoUrl: awayLogo },
  );
  const heroBg = heroGradient(homePalette, awayPalette);

  const standardMarkets = markets.filter(m => m.kind !== 'lineup');
  const lineupMarkets = markets.filter(m => m.kind === 'lineup');
  const exactScore = markets.find(m => m.kind === 'score');
  const settledScore = exactScore?.landedScore ?? null;

  const lineupsOpen = lineupMarkets.some(m => m.open);
  const lineupDeadlineLabel = settled ? ''
    : !lineupsOpen ? 'CLOSED'
      : `CLOSE AT ${timeOfDay(lineupDeadlineAt)} · ${countdown(lineupDeadlineAt)}`;

  return (
    <div className="flex flex-col flex-1 min-h-0 h-[100dvh] md:h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] relative">
      <Breadcrumb trail={[
        { label: 'Leagues', href: '/leagues' },
        { label: leagueName, href: `/leagues/${leagueId}/fixtures` },
        { label: `${homeName} v ${awayName}` },
      ]} />

      <header className="flex-none bg-[var(--nav-surface)] text-[var(--nav-text)] pt-[calc(8px+env(safe-area-inset-top))] px-[var(--gutter)] pb-[6px] md:hidden">
        <div className="flex items-center gap-[11px]">
          <Link
            href={`/leagues/${leagueId}/fixtures`}
            aria-label="Back to fixtures"
            className="tf-tap w-[40px] h-[40px] rounded-full border border-[var(--nav-border)] grid place-items-center flex-none text-[var(--nav-text-quiet)] text-[15px]"
          >‹</Link>
          <div className="min-w-0 flex-1">
            <div className="font-heading font-[650] text-[15px] leading-[1.1] tracking-[-0.3px] truncate">{leagueName || 'League'}</div>
            <div className="text-[10.5px] text-[var(--nav-text-faint)] mt-[4px]">{competition}</div>
          </div>
        </div>
      </header>

      <LeagueContextBar
        leagueId={leagueId}
        leagueName={leagueName}
        meta={competition}
        linkName
      />

      <main className="tf-scroll flex-1 min-h-0 overflow-auto">

        <section className="relative overflow-hidden text-[var(--nav-text)] px-[var(--gutter)] pt-[8px] md:px-0 md:pt-[22px]" style={{ background: heroBg, transition: 'background 240ms ease' }}>
          {/* Pitch markings: a halfway line and a centre circle. They only read
              as markings together — the line alone read as a rule drawn through
              the fixture. Fainter than the design's own .06, which sits over a
              flat panel; here they sit over a team-coloured wash that already
              carries the eye, and at that weight they competed with it. */}
          <div aria-hidden="true" className="absolute left-0 right-0 top-1/2 h-px bg-[rgba(255,255,255,0.03)]" />
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 w-[300px] h-[300px] -ml-[150px] -mt-[150px] rounded-full border border-[rgba(255,255,255,0.03)]"
          />
          <div className="relative md:max-w-[1080px] md:mx-auto md:px-[24px]">
            <div className="flex items-center gap-[8px]">
              <span
                className={`w-[7px] h-[7px] rounded-full flex-none ${phase === 'urgent' ? 'animate-[tfpulse_1.4s_ease-in-out_infinite]' : ''}`}
                style={{ background: heroTone }}
              />
              <span className="tf-kicker" style={{ color: heroTone }}>{heroKicker}</span>
            </div>

            <div className="flex items-end gap-[10px] mt-[9px]">
              <div
                className="tf-num font-heading font-bold text-[46px] md:text-[52px] leading-[0.9] tracking-[-2px]"
                style={{ color: phase === 'urgent' ? 'var(--color-danger)' : 'var(--nav-text)' }}
              >
                {settled ? `+${pointsEarned}` : locked ? timeOfDay(kickoffAt) : countdown(nextDeadlineAt)}
              </div>
              <div className="text-[11px] leading-[1.4] text-[var(--nav-text-faint)] pb-[6px]">{countdownCaption}</div>
            </div>

            <div className="flex items-center gap-[8px] md:gap-[14px] mt-[20px] md:max-w-[780px] md:mx-auto md:mt-[24px]">
              <div className="flex-1 flex items-center gap-[7px] md:gap-[9px] min-w-0">
                <TeamCrest code={homeCode} logoUrl={homeLogo} size={36} />
                <span className="font-heading font-[650] text-[14px] md:text-[17px] leading-[1.15] tracking-[-0.3px] truncate">{homeName}</span>
              </div>
              <span className={settledScore
                ? 'font-heading font-bold text-[19px] md:text-[26px] tracking-[-0.6px] flex-none tf-num'
                : 'font-heading font-semibold text-[10px] md:text-[12px] text-[var(--nav-text-faint)] flex-none'}>
                {settledScore ? `${settledScore[0]} — ${settledScore[1]}` : kickoffLabel(kickoffAt, now)}
              </span>
              <div className="flex-1 flex items-center gap-[7px] md:gap-[9px] justify-end min-w-0">
                <span className="font-heading font-[650] text-[14px] md:text-[17px] leading-[1.15] tracking-[-0.3px] truncate text-right">{awayName}</span>
                <TeamCrest code={awayCode} logoUrl={awayLogo} size={36} />
              </div>
            </div>

            {!settled && (
              <div className="flex items-center gap-[10px] mt-[20px] md:max-w-[780px] md:mx-auto">
                <div className="flex-1 h-[5px] rounded-full bg-[rgba(255,255,255,0.16)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-200"
                    style={{
                      width: `${progress.pct}%`,
                      background: locked ? 'var(--nav-text-faint)' : phase === 'urgent' ? 'var(--color-danger)' : 'var(--nav-accent)',
                    }}
                  />
                </div>
                <span className="tf-num font-heading font-bold text-[11px] flex-none">{progress.answered} of {progress.total}</span>
              </div>
            )}

            <div className="text-[10.5px] md:text-[11.5px] leading-[1.5] text-[var(--nav-text-faint)] mt-[14px] pb-[16px] md:pb-[26px]">{heroBlurb}</div>
          </div>
        </section>

        <div className="md:max-w-[1080px] md:mx-auto md:px-[24px]">

          <section className="mt-[20px] md:mt-[26px]">
            <div className="flex items-baseline justify-between px-[var(--gutter)] pb-[12px] md:px-0">
              <span className="tf-kicker text-[var(--text-muted)]">{settled ? 'HOW IT SCORED' : 'MARKETS'}</span>
              {settled && (
                <Link
                  href={`/predict/fixture/${fixtureId}/results?leagueId=${leagueId}`}
                  className="font-heading font-bold text-[10px] tracking-[0.05em] text-[var(--text-link)]"
                >
                  HOW OTHERS DID →
                </Link>
              )}
              <span className="tf-num font-heading font-bold text-[10px] text-[var(--text-muted)]">
                {settled ? `+${pointsEarned} OF ${pointsAtStake}` : `${pointsAtStake} POINTS AT STAKE`}
              </span>
            </div>

            {standardMarkets.map((market, index) => {
              const mine = answers[market.key];
              const unanswered = mine === null || mine === undefined;
              const marketLocked = !settled && !market.open;
              const canAnswer = editable && market.open;

              return (
                <div
                  key={market.key}
                  className={`p-[15px_var(--gutter)] md:px-0 md:py-[18px] border-t border-[var(--surface-border)] ${index === standardMarkets.length - 1 ? 'border-b' : ''} ${(canAnswer && unanswered) ? 'bg-[var(--accent-surface)] shadow-[inset_3px_0_0_0_var(--color-brand)] md:bg-transparent md:shadow-none' : ''}`}
                >
                  <div className="md:grid md:grid-cols-[250px_minmax(0,1fr)_150px] md:gap-[30px] md:items-start">

                    <div className="flex items-center gap-[10px] md:block">
                      <span className="font-heading font-[650] text-[14px] leading-[1.2] tracking-[-0.2px]">{market.name}</span>
                      {!settled && (
                        <span className="font-heading font-semibold text-[10px] text-[var(--text-muted)] flex-none md:block md:mt-[4px]">{market.pointsLabel}</span>
                      )}
                      <span className="flex-1 md:hidden" />
                      <span className={`font-heading font-bold flex-none md:hidden ${settled ? 'text-[17px] tracking-[-0.4px] tf-num' : 'text-[9.5px] tracking-[0.05em]'} ${settled ? '' : marketLocked ? 'text-[var(--text-muted)]' : unanswered ? 'text-[var(--accent-text-strong)]' : 'text-[var(--text-muted)]'}`}
                        style={settled ? { color: market.outcome === 'hit' ? 'var(--prediction-correct)' : 'var(--text-muted)' } : undefined}>
                        {settled
                          ? (market.outcome === 'review' ? 'IN REVIEW' : market.outcome === 'void' ? 'VOID' : market.pointsAwarded !== null ? (market.pointsAwarded > 0 ? `+${market.pointsAwarded}` : '0') : '0')
                          : marketLocked ? (unanswered ? 'NO ANSWER' : 'LOCKED')
                            : unanswered ? 'OPEN' : 'ANSWERED'}
                      </span>
                    </div>

                    <div>
                      {market.kind === 'tiles' && (
                        <div className="flex gap-[7px] mt-[11px] md:mt-0" role="group" aria-label={market.name}>
                          {market.tiles.map(tile => {
                            const isMine = mine === tile.id;
                            const isLanded = settled && market.landed === tile.id;
                            const sub = settled
                              ? (isMine && isLanded ? 'YOURS · LANDED' : isMine ? 'YOURS' : isLanded ? 'LANDED' : '')
                              : tile.sub;
                            return (
                              <button
                                key={tile.id}
                                type="button"
                                disabled={!canAnswer}
                                aria-pressed={isMine}
                                onClick={() => answerMarket(market, tile.id)}
                                className={`flex-1 min-w-0 min-h-[52px] rounded-[11px] flex flex-col justify-center items-center gap-[3px] p-[6px_4px] text-center transition-colors duration-150 ${canAnswer ? 'cursor-pointer' : 'cursor-default'} ${
                                  !settled
                                    ? (isMine
                                      ? 'border border-[var(--color-brand)] bg-[var(--brand-fill)] text-[var(--color-on-brand)] shadow-[var(--elev-glow)]'
                                      : 'border border-[var(--surface-border-strong)] bg-transparent text-[var(--text-primary)]')
                                    : isMine && isLanded ? 'border border-[var(--color-success)] bg-[var(--color-success)] text-[var(--tf-white)]'
                                      : isMine ? 'border border-[var(--color-danger)] bg-transparent text-[var(--danger-text)]'
                                        : isLanded ? 'border border-dashed border-[var(--success-text)] bg-transparent text-[var(--success-text)]'
                                          : 'border border-[var(--surface-border)] bg-transparent text-[var(--text-muted)]'
                                }`}
                              >
                                <span className="font-heading font-[650] text-[12.5px] leading-[1.1]">{tile.label}</span>
                                {/* The space keeps the two lines apart in the accessible name. */}
                                {sub && <span className="font-heading font-semibold text-[8.5px] tracking-[0.07em] uppercase opacity-80">{' '}{sub}</span>}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {market.kind === 'score' && (
                        <div>
                          <div className="flex items-end gap-[14px] mt-[11px] md:mt-0">
                            {([[homeName, homeCode, 0], [awayName, awayCode, 1]] as const).map(([team, code, index]) => {
                              const score = answers.exact_score as [number, number] | undefined;
                              return (
                                <div key={code} className="flex-1 min-w-0">
                                  <div className="flex items-center gap-[7px] mb-[7px]">
                                    <TeamCrest code={code} logoUrl={code === homeCode ? homeLogo : awayLogo} size={18} />
                                    <span className="font-heading font-[650] text-[11px] truncate">{team}</span>
                                  </div>
                                  <div className="flex items-center gap-[6px]">
                                    {canAnswer && (
                                      <button
                                        type="button"
                                        aria-label={`One fewer goal for ${team}`}
                                        onClick={() => bumpScore(market, index, -1)}
                                        className="w-[34px] h-[46px] flex-none rounded-[10px] border border-[var(--surface-border-strong)] grid place-items-center text-[18px] text-[var(--text-secondary)] cursor-pointer"
                                      >−</button>
                                    )}
                                    <div className={`flex-1 min-w-0 h-[46px] rounded-[10px] grid place-items-center font-heading font-bold text-[20px] tf-num ${score ? 'bg-[var(--text-primary)] text-[var(--surface-canvas)]' : 'border border-dashed border-[var(--surface-border-strong)] text-[var(--text-muted)]'}`}>
                                      {score ? score[index] : '–'}
                                    </div>
                                    {canAnswer && (
                                      <button
                                        type="button"
                                        aria-label={`One more goal for ${team}`}
                                        onClick={() => bumpScore(market, index, 1)}
                                        className="w-[34px] h-[46px] flex-none rounded-[10px] border border-[var(--surface-border-strong)] grid place-items-center text-[18px] text-[var(--text-secondary)] cursor-pointer"
                                      >+</button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <ScoreNote
                            picked={answers.exact_score as [number, number] | undefined}
                            landed={market.landedScore}
                            settled={settled}
                            locked={marketLocked}
                            homeName={homeName}
                            awayName={awayName}
                          />
                        </div>
                      )}

                      {market.kind === 'players' && (
                        <div className="mt-[11px] md:mt-0">
                          <PlayerChoices
                            market={market}
                            picked={typeof mine === 'string' ? mine : null}
                            settled={settled}
                            locked={marketLocked}
                            canAnswer={canAnswer}
                            onPick={id => answerMarket(market, id)}
                          />
                          {canAnswer && (
                            <button
                              type="button"
                              onClick={() => setPickingPlayers(market.marketType === 'player_card' ? 'card' : 'scorer')}
                              className="tf-hit inline-block mt-[9px] font-heading font-bold text-[9.5px] tracking-[0.05em] text-[var(--text-link)]"
                            >
                              SEARCH ALL PLAYERS →
                            </button>
                          )}
                        </div>
                      )}

                      <div className={`flex items-center gap-[10px] min-h-[20px] mt-[10px] ${(saved !== market.key && !failed[market.key]) ? 'hidden' : ''}`}>
                        {failed[market.key] && (
                          <span className="font-heading font-semibold text-[10.5px] leading-[1.45] text-[var(--danger-text)]" role="alert">
                            {failed[market.key]}
                          </span>
                        )}
                        <span className="flex-1" />
                        {saved === market.key && (
                          <span className="font-heading font-bold text-[9.5px] tracking-[0.05em] p-[4px_8px] rounded-[6px] bg-[var(--color-success)] text-[var(--tf-white)] animate-[tfsaved_2.2s_ease_forwards]">SAVED</span>
                        )}
                      </div>
                    </div>

                    <div className="hidden md:flex md:flex-col md:items-end md:gap-[6px]">
                      <span className="font-heading font-semibold text-[10px] tracking-[0.03em] px-[9px] py-[3px] rounded-full whitespace-nowrap"
                        style={settled
                          ? (market.outcome === 'review' || market.outcome === 'void'
                            ? { border: '1px solid var(--surface-border-strong)', color: 'var(--text-muted)' }
                            : { background: 'var(--state-provisional)', color: 'var(--nav-on-accent)' })
                          : marketLocked
                            ? { background: 'var(--state-locked)', color: 'var(--color-on-brand)' }
                            : { background: 'var(--surface-subtle)', color: 'var(--text-secondary)' }}>
                        {settled ? (market.outcome === 'review' ? 'In review' : market.outcome === 'void' ? 'Void' : 'Provisional') : marketLocked ? 'Locked' : 'Open'}
                      </span>
                      {settled && (
                        <span className="font-heading font-bold text-[17px] tracking-[-0.4px] tf-num"
                          style={{ color: market.outcome === 'hit' ? 'var(--prediction-correct)' : 'var(--text-muted)' }}>
                          {market.pointsAwarded !== null ? (market.pointsAwarded > 0 ? `+${market.pointsAwarded}` : '0') : '0'}
                        </span>
                      )}
                      {/* The answer in words, which the controls stop saying the
                          moment a market locks or settles and they disappear. */}
                      {answerLabelFor(market, mine) && (
                        <span className="font-heading font-semibold text-[12px] text-right text-[var(--text-primary)] truncate max-w-[150px]">
                          {answerLabelFor(market, mine)}
                        </span>
                      )}
                      {/* Absolute before relative: a countdown alone cannot be
                          checked against a calendar, and a member deciding
                          whether they have time needs the actual clock time. */}
                      <span className="text-[10.5px] text-[var(--text-muted)] text-right">
                        {settled ? 'Settled'
                          : marketLocked ? 'Locked at kick-off'
                            : market.deadlineAt
                              ? `Locks ${lockLabel(market.deadlineAt)} · ${countdown(market.deadlineAt)}`
                              : `Locks in ${countdown(market.deadlineAt)}`}
                      </span>
                    </div>

                  </div>

                  {/* The edit trail. Reached from every phase including after
                      settlement, which is exactly when a member disputing a
                      score reaches for it. */}
                  <EditTrail
                    leagueId={leagueId}
                    fixtureId={fixtureId}
                    market={market}
                    version={marketVersions[market.marketType] ?? 0}
                    open={openTrail === market.key}
                    onToggle={() => setOpenTrail(openTrail === market.key ? null : market.key)}
                  />
                </div>
              );
            })}
          </section>

          {lineupMarkets.length > 0 && (
            <section className="mt-[22px] md:mt-[30px]">
              <div className="flex items-baseline justify-between px-[var(--gutter)] pb-[12px] md:px-0">
                <span className="tf-kicker text-[var(--text-muted)]">LINEUPS</span>
                <span className={`font-heading font-bold text-[9.5px] tracking-[0.05em] ${lineupsOpen ? 'text-[var(--danger-text)]' : 'text-[var(--text-muted)]'}`}>
                  {lineupDeadlineLabel}
                </span>
              </div>

              <div className="md:grid md:grid-cols-2 md:gap-[14px]">
                {lineupMarkets.map((market, index) => {
                  const picked = answers[market.key];
                  const count = Array.isArray(picked) ? picked.length : 0;
                  const isSet = count > 0;
                  const code = market.side === 'home' ? homeCode : awayCode;

                  const sub = settled ? (isSet ? 'Lineup settled' : 'Not set — no points from this one')
                    : !market.open ? (isSet ? '11 named · locked' : 'Not set — this one closed')
                      : isSet ? `${count} named · you can still change it` : 'Nothing named yet';

                  const right = settled ? (market.pointsAwarded !== null ? `+${market.pointsAwarded}` : '0')
                    : !market.open ? (isSet ? 'VIEW' : 'MISSED')
                      : isSet ? 'EDIT →' : 'PICK →';

                  const tone = settled ? (isSet ? 'var(--prediction-correct)' : 'var(--text-muted)')
                    : !market.open ? (isSet ? 'var(--text-muted)' : 'var(--danger-text)')
                      : isSet ? 'var(--text-link)' : 'var(--accent-text-strong)';

                  return (
                    <button
                      key={market.key}
                      type="button"
                      /* Openable after the lock too. A closed lineup still has
                         something to say — what was stored, and once the XI is
                         confirmed, which of the eleven actually started. Only a
                         market with nothing behind it is inert. */
                      disabled={!market.side || (!market.open && !isSet && !settled)}
                      onClick={() => market.side && setEditingLineup(market.side)}
                      className={`tf-tap w-full text-left flex items-center gap-[12px] p-[14px_var(--gutter)] md:px-[14px] md:rounded-[13px] md:border border-t border-[var(--surface-border)] ${index === lineupMarkets.length - 1 ? 'border-b md:border' : ''} ${(!isSet && editable && market.open) ? 'bg-[var(--surface-subtle)]' : ''}`}
                    >
                      <TeamCrest code={code} logoUrl={code === homeCode ? homeLogo : awayLogo} size={30} />
                      <div className="flex-1 min-w-0">
                        <div className="font-heading font-[650] text-[13.5px] tracking-[-0.2px] truncate">{market.name}</div>
                        <div className={`text-[10.5px] mt-[3px] ${isSet ? 'text-[var(--text-muted)]' : (settled || !market.open) ? 'text-[var(--danger-text)]' : 'text-[var(--text-secondary)]'}`}>{sub}</div>
                        {failed[market.key] && (
                          <div className="font-heading font-semibold text-[10.5px] text-[var(--danger-text)] mt-[4px]" role="alert">{failed[market.key]}</div>
                        )}
                      </div>
                      {!settled && <span className="font-heading font-semibold text-[10px] text-[var(--text-muted)] flex-none">{market.pointsLabel}</span>}
                      <span
                        className={`flex-none font-heading font-bold ${settled ? 'text-[17px] tracking-[-0.4px] tf-num' : 'text-[9.5px] tracking-[0.05em]'}`}
                        style={{ color: tone }}
                      >{right}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {editable && otherLeagueCount > 0 && carryLabels.length > 0 && (
            <button
              type="button"
              onClick={() => setCopyView('confirm')}
              className="tf-tap w-full text-left flex items-center gap-[12px] mt-[22px] p-[15px_var(--gutter)] md:px-[14px] md:rounded-[13px] md:border border-y border-[var(--surface-border)]"
            >
              <span className="w-[28px] h-[28px] rounded-[8px] bg-[var(--surface-subtle)] grid place-items-center font-heading font-bold text-[13px] text-[var(--text-muted)] flex-none">⇉</span>
              <div className="flex-1 min-w-0">
                <div className="font-heading font-semibold text-[13px]">Answer this match once</div>
                <div className="text-[10.5px] text-[var(--text-muted)] mt-[3px]">
                  {pluralise(carryLabels.length, 'answer')} ready to carry into your other leagues
                </div>
              </div>
              <span className="font-heading font-bold text-[10px] text-[var(--text-link)] flex-none">COPY →</span>
            </button>
          )}

          {/* Only the settled note survives. The open-state line explained that
              the screen has no save button, which is a fact about the interface
              rather than about the member's predictions. */}
          {settled && (
            <p className="p-[18px_var(--gutter)_26px] md:px-0 md:max-w-[640px] text-[10.5px] md:text-[11.5px] leading-[1.6] text-[var(--text-muted)]">
              Provisional scores become final once review closes. If a market is voided it scores
              nothing for everyone, so nobody gains on you.
            </p>
          )}

          {/* The list's own bottom margin. It used to come from the note above,
              so removing that note left the last row flush against the edge of
              the scroll area with nothing under it. */}
          <div className="h-[26px] pb-[env(safe-area-inset-bottom)]" />
        </div>
      </main>

      {conflict && (
        <div className="absolute inset-0 z-50 bg-[var(--scrim)] flex flex-col justify-end md:items-center md:justify-center md:p-[20px]">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="This answer changed somewhere else"
            className="bg-[var(--surface-card)] rounded-[18px_18px_0_0] md:rounded-[18px] md:max-w-[460px] md:w-full animate-[tfsheet_0.18s_ease]"
          >
            <div className="p-[12px_var(--gutter)_20px] md:p-[22px]">
              <div className="w-[34px] h-[4px] rounded-full bg-[var(--surface-border-strong)] mx-auto mb-[16px] md:hidden" />

              <h2 className="font-heading font-bold text-[19px] leading-[1.15] tracking-[-0.5px]">
                {conflict.market.name} changed somewhere else
              </h2>
              <p className="text-[12.5px] leading-[1.6] text-[var(--text-secondary)] mt-[9px]">
                Another device saved this market after this page was opened. Both answers are below —
                pick the one to keep.
              </p>

              <div className="mt-[18px] rounded-[12px] border border-[var(--surface-border-strong)] overflow-hidden">
                <div className="p-[12px_14px]">
                  <div className="tf-kicker text-[var(--text-muted)]">Stored now</div>
                  <div className="font-heading font-semibold text-[14px] mt-[4px]">
                    {answerLabelFor(conflict.market, conflict.stored)
                      ?? <span className="italic text-[var(--text-muted)]">No answer</span>}
                  </div>
                </div>
                <div className="p-[12px_14px] border-t border-[var(--surface-border)] bg-[var(--surface-subtle)]">
                  <div className="tf-kicker text-[var(--text-muted)]">This device was about to save</div>
                  <div className="font-heading font-semibold text-[14px] mt-[4px]">
                    {answerLabelFor(conflict.market, conflict.attempted)
                      ?? <span className="italic text-[var(--text-muted)]">No answer</span>}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={replaceStored}
                className="w-full mt-[18px] h-[48px] rounded-[13px] grid place-items-center font-heading font-bold text-[13.5px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] cursor-pointer shadow-[var(--elev-glow)]"
              >
                Replace it with mine
              </button>
              <button
                type="button"
                onClick={keepStored}
                className="tf-tap w-full mt-[8px] h-[44px] grid place-items-center font-heading font-bold text-[12px] text-[var(--text-secondary)]"
              >
                Keep what is stored
              </button>
            </div>
          </div>
        </div>
      )}

      {copyView !== 'closed' && (
        <div className="absolute inset-0 z-50 bg-[var(--scrim)] flex flex-col justify-end md:items-center md:justify-center md:p-[20px]">
          <div className="tf-scroll bg-[var(--surface-card)] rounded-[18px_18px_0_0] md:rounded-[18px] md:max-w-[520px] md:w-full max-h-[88%] overflow-auto animate-[tfsheet_0.18s_ease]">
            <div className="p-[12px_var(--gutter)_20px]">
              <div className="w-[34px] h-[4px] rounded-full bg-[var(--surface-border-strong)] mx-auto mb-[16px] md:hidden" />

              {copyView === 'confirm' && (
                <div>
                  <h2 className="font-heading font-bold text-[20px] leading-[1.15] tracking-[-0.5px]">Use these answers elsewhere</h2>
                  {/* The endpoint takes no target list: it writes into every other
                      league that has this match. Saying so beats offering a choice
                      that is not honoured. */}
                  <p className="text-[12.5px] leading-[1.6] text-[var(--text-secondary)] mt-[9px]">
                    This copies into every other league you are in that includes this match. Each keeps its own
                    copy — a later edit here changes nothing there, and running it again is safe.
                  </p>

                  <div className="tf-kicker text-[var(--text-muted)] mt-[20px]">ANSWERS BEING COPIED</div>
                  <div className="flex flex-wrap gap-[6px] mt-[10px]">
                    {carryLabels.map(label => (
                      <span key={label} className="font-heading font-semibold text-[10.5px] p-[6px_10px] rounded-[7px] bg-[var(--surface-subtle)] text-[var(--text-secondary)]">{label}</span>
                    ))}
                  </div>
                  <p className="text-[10.5px] leading-[1.55] text-[var(--text-muted)] mt-[9px]">
                    Only markets you have answered travel. Anything still blank here stays blank there.
                  </p>

                  <button
                    type="button"
                    onClick={runCopy}
                    disabled={copyPredictions.isPending}
                    className="w-full mt-[18px] h-[48px] rounded-[13px] grid place-items-center font-heading font-bold text-[13.5px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] cursor-pointer shadow-[var(--elev-glow)] disabled:opacity-60"
                  >
                    {copyPredictions.isPending ? 'Copying…' : 'Copy these answers'}
                  </button>
                  <button type="button" onClick={() => setCopyView('closed')} className="tf-tap w-full mt-[8px] h-[44px] grid place-items-center font-heading font-bold text-[12px] text-[var(--text-secondary)]">Not now</button>
                </div>
              )}

              {copyView === 'done' && (
                <div>
                  <h2 className="font-heading font-bold text-[20px] leading-[1.15] tracking-[-0.5px]">
                    {copyReport === null ? 'Nothing was copied'
                      : copyReport.length === 0 ? 'No other league has this match'
                        : `Copied into ${pluralise(copyReport.filter(l => l.copied > 0).length, 'league')}`}
                  </h2>

                  {copyReport === null && (
                    <p className="text-[12.5px] leading-[1.6] text-[var(--danger-text)] mt-[9px]" role="alert">
                      That did not go through. Your answers here are unchanged.
                    </p>
                  )}

                  <div className="flex flex-col mt-[14px]">
                    {(copyReport ?? []).map(league => (
                      <div key={league.leagueId} className="flex gap-[11px] items-start py-[13px] border-t border-[var(--surface-border)]">
                        <span
                          className="w-[20px] h-[20px] rounded-full flex-none grid place-items-center font-heading font-bold text-[10.5px] mt-[1px] text-[var(--tf-white)]"
                          style={{ background: league.copied > 0 ? 'var(--color-success)' : 'var(--surface-border-strong)' }}
                        >{league.copied > 0 ? '✓' : '–'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-heading font-[650] text-[13px]">{league.leagueName}</div>
                          <div className="text-[11.5px] leading-[1.5] text-[var(--text-secondary)] mt-[3px]">
                            {league.copied} of {pluralise(league.total, 'answer')} copied
                            {league.refusals.length > 0 && ` · ${league.refusals.join(' · ')}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => { setCopyView('closed'); setCopyReport(null); }}
                    className="tf-tap w-full mt-[16px] h-[48px] rounded-[13px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] grid place-items-center font-heading font-bold text-[13.5px]"
                  >Back to the fixture</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* The design puts the full squad list over the fixture, not on a route
          of its own: you are choosing a scorer *for this match*, and leaving
          the match to do it loses the eight answers around it. The route still
          exists, for a link shared into the picker. */}
      {pickingPlayers && (
        <div className="absolute inset-0 z-50 bg-[var(--scrim)] flex flex-col justify-end md:items-center md:justify-center md:p-[20px]">
          <button
            type="button"
            aria-label="Close the squad list"
            onClick={() => setPickingPlayers(null)}
            className="absolute inset-0"
          />
          <div className="relative bg-[var(--surface-canvas)] w-full md:max-w-[1032px] h-[86vh] md:h-[80vh] rounded-t-[18px] md:rounded-[16px] overflow-hidden flex flex-col">
            <PlayerPickerPanel
              leagueId={leagueId}
              fixtureId={fixtureId}
              market={pickingPlayers}
              squads={squads}
              savedPlayerId={(answers[MARKET_TYPE[pickingPlayers]] as string | undefined) ?? null}
              expectedVersion={marketVersions[MARKET_TYPE[pickingPlayers]] ?? 0}
              snapshotId={snapshotId}
              price={markets.find(m => m.marketType === MARKET_TYPE[pickingPlayers])?.pointsLabel ?? ''}
              deadlineAt={markets.find(m => m.marketType === MARKET_TYPE[pickingPlayers])?.deadlineAt ?? null}
              onClose={() => setPickingPlayers(null)}
              onSaved={(playerId, version) => {
                const key = MARKET_TYPE[pickingPlayers];
                setAnswers(prev => ({ ...prev, [key]: playerId }));
                setMarketVersions(prev => ({ ...prev, [key]: version }));
                setPickingPlayers(null);
                showReceipt(key);
              }}
            />
          </div>
        </div>
      )}

      {editingLineup && (
        <div className="absolute inset-0 z-50 flex justify-center bg-[var(--surface-canvas)] md:bg-[rgba(0,0,0,0.5)] md:items-center md:p-[20px]">
          {/* The 500px cap belongs to the wide dialog, not to a phone.
              Applied at every width it capped the sheet on any viewport between
              500 and 768px — a large phone or a tablet held upright — and since
              the wrapper only centred at `md`, the panel sat against the left
              edge with a dead strip beside it. Below `md` this is full-bleed,
              which is what every other sheet on the app already does. */}
          <div className="bg-[var(--surface-canvas)] w-full h-full md:h-auto md:max-w-[500px] rounded-[16px] overflow-hidden flex flex-col md:max-h-[86vh]">
            <div className="flex justify-between items-center p-[16px] border-b border-[var(--surface-border)]">
              <h2 className="font-heading font-bold text-[18px]">{editingLineup === 'home' ? homeName : awayName} Starting XI</h2>
              <button type="button" aria-label="Close" onClick={() => setEditingLineup(null)} className="w-[32px] h-[32px] -mr-[6px] grid place-items-center text-[24px] leading-none text-[var(--text-muted)]">×</button>
            </div>
            {/* The picker manages its own column, so this only gives it the
                space that is left. Scrolling here would take Save with it. */}
            <div className="flex-1 min-h-0 p-[16px] flex flex-col">
              {(() => {
                const market = markets.find(m => m.key === `${editingLineup}_lineup`);
                // The players go through unremapped now: the picker takes the
                // domain's own PlayerOption, so a renamed field is a compile
                // error rather than a silently empty pitch.
                return (
                  <LineupPicker
                    players={market?.players ?? []}
                    onSave={playerIds => saveLineup(editingLineup, playerIds)}
                    isSaving={submitLineup.isPending}
                    initialSelection={(answers[`${editingLineup}_lineup`] as string[] | undefined) ?? []}
                    phase={settled ? 'scored' : market?.open ? 'editable' : 'locked'}
                    started={market?.startedPlayerIds ?? null}
                    pointsLabel={market && market.pointsAwarded !== null
                      ? (market.pointsAwarded > 0 ? `+${market.pointsAwarded}` : '0')
                      : null}
                    failure={failed[`${editingLineup}_lineup`] ?? null}
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** What the member said against what finished, in one line. */
function ScoreNote({ picked, landed, settled, locked, homeName, awayName }: {
  picked: [number, number] | undefined;
  landed: [number, number] | null;
  settled: boolean;
  locked: boolean;
  homeName: string;
  awayName: string;
}) {
  const said = picked ? `${picked[0]}–${picked[1]}` : null;
  const hit = settled && picked && landed && picked[0] === landed[0] && picked[1] === landed[1];

  const text = settled
    ? `You said ${said ?? 'nothing'}${landed ? ` · it finished ${landed[0]}–${landed[1]}` : ''}`
    : locked ? (said ? `Locked at ${said}` : 'Nothing was ever saved here.')
      : picked ? `${homeName} ${picked[0]} · ${awayName} ${picked[1]}`
        : 'Untouched — an exact score is not assumed to be 0–0.';

  return (
    <div className={`text-[10.5px] md:text-[12px] leading-[1.5] mt-[9px] ${hit ? 'text-[var(--success-text)]' : (settled || (locked && !picked)) ? 'text-[var(--danger-text)]' : 'text-[var(--text-muted)]'}`}>
      {text}
    </div>
  );
}

/**
 * A handful of names, as the design has it, with the rest behind the picker.
 * Listing both full squads put 136 rows on one screen, twice over.
 */
/** What the market's own verb is, in both directions. */
const LANDED_COPY: Record<string, { did: string; nobody: string }> = {
  anytime_goalscorer: { did: 'Scored', nobody: 'Nobody scored' },
  player_card: { did: 'Booked', nobody: 'Nobody was booked' },
};

/**
 * Who actually scored or was booked.
 *
 * Only the member's own pick can be marked right or wrong, because several
 * players can score — so a wrong answer used to end there, saying nothing about
 * what the right one was. Nothing is drawn while the result is unknown: an
 * empty list is a claim that nobody did it, and only the settlement can make it.
 */
function LandedPlayers({ market }: { market: FixtureMarket }) {
  const copy = LANDED_COPY[market.marketType];
  if (!copy || market.landedPlayers === null) return null;

  if (market.landedPlayers.length === 0) {
    return <div className="text-[11.5px] text-[var(--text-muted)] mt-[7px]">{copy.nobody}.</div>;
  }

  return (
    <div className="flex items-center flex-wrap gap-x-[10px] gap-y-[6px] mt-[9px]">
      <span className="tf-kicker text-[var(--text-muted)] flex-none">{copy.did}</span>
      {market.landedPlayers.map(player => (
        <span key={player.id} className="flex items-center gap-[6px] min-w-0">
          <PlayerFace
            name={player.name}
            initials={player.initials}
            photoUrl={player.photoUrl}
            size={22}
            background="var(--surface-subtle)"
            foreground="var(--text-secondary)"
          />
          <span className="font-heading font-semibold text-[12px] text-[var(--text-primary)] truncate">{player.name}</span>
        </span>
      ))}
    </div>
  );
}

function PlayerChoices({ market, picked, settled, locked, canAnswer, onPick }: {
  market: FixtureMarket;
  picked: string | null;
  settled: boolean;
  locked: boolean;
  canAnswer: boolean;
  onPick: (id: string) => void;
}) {
  const chosen = picked ? market.players.find(p => p.id === picked) : undefined;

  if (settled || locked) {
    return (
      <div className="text-[12.5px] text-[var(--text-secondary)]">
        {chosen ? chosen.name : <span className="italic text-[var(--text-muted)]">Not answered — no points from this one</span>}
        {settled && <LandedPlayers market={market} />}
      </div>
    );
  }

  // The member's own pick always shows, even when it is not in the first few.
  const shortlist = market.players.slice(0, INLINE_PLAYERS);
  const visible = chosen && !shortlist.some(p => p.id === chosen.id) ? [chosen, ...shortlist] : shortlist;

  return (
    <div className="flex flex-col gap-[6px]" role="group" aria-label={market.name}>
      {visible.map(player => {
        const isMine = player.id === picked;
        return (
          <button
            key={player.id}
            type="button"
            disabled={!canAnswer}
            aria-pressed={isMine}
            onClick={() => onPick(player.id)}
            className={`flex items-center gap-[10px] min-h-[46px] rounded-[11px] p-[7px_11px] text-left ${canAnswer ? 'cursor-pointer' : 'cursor-default'} ${isMine ? 'border border-[var(--color-brand)] bg-[var(--accent-surface)]' : 'border border-[var(--surface-border-strong)] bg-transparent'}`}
          >
            <PlayerFace
              name={player.name}
              initials={player.initials}
              photoUrl={player.photoUrl}
              size={30}
              background={isMine ? 'var(--brand-fill)' : 'var(--surface-subtle)'}
              foreground={isMine ? 'var(--color-on-brand)' : 'var(--text-secondary)'}
            />
            <span className={`flex-1 min-w-0 font-heading ${isMine ? 'font-bold' : 'font-semibold'} text-[13px] truncate`}>{player.name}</span>
            <span className="text-[10.5px] text-[var(--text-muted)] flex-none">{player.meta}</span>
            <span className={`flex-none text-[13px] text-[var(--color-brand)] ${isMine ? '' : 'invisible'}`}>✓</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Every answer this member has given to one market, newest first.
 *
 * Only the top line counted. Earlier answers are kept so a score can be
 * checked, never re-scored — which is why this stays available after
 * settlement rather than disappearing with the controls.
 */
function EditTrail({ leagueId, fixtureId, market, version, open, onToggle }: {
  leagueId: string;
  fixtureId: string;
  market: FixtureMarket;
  /** The stored version: N revisions means N − 1 edits. */
  version: number;
  open: boolean;
  onToggle: () => void;
}) {
  const history = usePredictionHistory(leagueId, fixtureId, open ? market.marketType : null);
  const edits = Math.max(0, version - 1);

  return (
    <div className="px-[var(--gutter)] md:px-0 pb-[14px] md:pb-0 md:pt-[10px]">
      <button
        type="button"
        onClick={onToggle}
        disabled={edits === 0}
        className={`tf-hit font-heading font-semibold text-[10.5px] ${edits > 0 ? 'text-[var(--text-link)]' : 'text-[var(--text-muted)] cursor-default'}`}
      >
        {edits === 0 ? 'Never changed' : open ? 'Hide edits' : `Edited ${edits}×`}
      </button>

      {open && (
        <div className="mt-[9px] border-t border-[var(--surface-border)] pt-[10px]">
          {history.isPending && <p className="text-[10.5px] text-[var(--text-muted)]">Reading the trail…</p>}
          {history.isError && (
            <p role="alert" className="text-[10.5px] text-[var(--danger-text)]">
              {failureMessage(history.error, 'Could not read the edits.')}
            </p>
          )}
          {history.data?.revisions.map((revision, i) => (
            <div key={revision.revisionId} className="flex items-baseline gap-[11px] py-[7px]">
              <span
                className="w-[7px] h-[7px] rounded-full flex-none"
                style={{ background: i === 0 ? 'var(--color-brand)' : 'var(--surface-border-strong)' }}
              />
              <span className={`text-[12px] ${i === 0 ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                {answerLabelFor(market, readStoredAnswer((revision.answer as { value?: unknown }).value)) ?? 'No answer'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
