'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LeagueTabs } from '../leagues/LeagueTabs';
import { LineupPicker } from './LineupPicker';
import { useSubmitPrediction, useSubmitLineupPrediction, useCopyPredictions } from '@/hooks/api/useFixturePrediction';
import { ApiError } from '@/lib/api/fetcher';
import {
  carryLabelsFor, progressOf, toAnswerPayload, toCopySummaries,
  type CopyLeagueSummary, type FixtureAnswers, type FixtureMarket, type FixturePhase,
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

const CLUB_TINTS: Record<string, string> = {
  ARS: '#c8182f', CHE: '#1746a2', LIV: '#b7152b', TOT: '#17233d',
  MCI: '#559ac7', EVE: '#153c85', MUN: '#d1262f', NEW: '#20242a',
};
const tintFor = (code: string) => CLUB_TINTS[code] || '#4b5563';

/** The design lists a handful of names per market; the rest live in the picker. */
const INLINE_PLAYERS = 3;

const HERO_COPY: Record<FixturePhase, [kicker: string, caption: string, blurb: string]> = {
  open: ['OPEN', 'until everything locks', 'Lineups close two hours earlier. Everything else stays open until the whistle.'],
  urgent: ['LOCKING NOW', 'until everything locks', 'Anything still unanswered when the whistle goes scores nothing. Lineups have already closed.'],
  locked: ['LOCKED', 'kick-off', 'Nothing can change now. Any unanswered markets will score nothing.'],
  settled: ['PROVISIONAL', 'so far', 'Provisional until review closes. A voided market scores nothing for everyone.'],
};

function Crest({ logo, code, size }: { logo: string | null; code: string; size: number }) {
  if (logo) {
    return (
      <span className="tf-crest relative overflow-hidden bg-white flex-none" style={{ width: size, height: Math.round(size * 1.08) }}>
        <Image src={logo} alt="" fill sizes={`${size}px`} className="object-contain p-[3px]" />
      </span>
    );
  }
  return (
    <span
      className="tf-crest flex-none"
      style={{ width: size, height: Math.round(size * 1.08), background: tintFor(code), fontSize: Math.round(size * 0.28) }}
    >
      {code}
    </span>
  );
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}:${String(s).padStart(2, '0')}`;
}

const timeOfDay = (at: string | null) =>
  at ? new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '—';

export function FixturePredictScreen({
  leagueId, fixtureId, leagueName, competition,
  homeName, awayName, homeCode, awayCode, homeLogo, awayLogo,
  kickoffAt, nextDeadlineAt, lineupDeadlineAt, serverTime,
  phase, markets, initialAnswers, versions, lineupVersions, snapshotId,
  pointsAtStake, pointsEarned, otherLeagueCount,
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
  pointsAtStake: number;
  pointsEarned: number;
  otherLeagueCount: number;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<FixtureAnswers>(initialAnswers);
  const [marketVersions, setMarketVersions] = useState(versions);
  const [sideVersions, setSideVersions] = useState(lineupVersions);
  const [saved, setSaved] = useState<string | null>(null);
  const [failed, setFailed] = useState<Record<string, string>>({});
  const [editingLineup, setEditingLineup] = useState<'home' | 'away' | null>(null);
  const [copyView, setCopyView] = useState<'closed' | 'confirm' | 'done'>('closed');
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
    return formatDuration(Math.max(0, Math.round((Date.parse(at) - now) / 1000)));
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

  const failureText = (error: unknown): string => {
    if (error instanceof ApiError && error.status === 409) {
      return 'Changed somewhere else — reopen to see the stored answer.';
    }
    return error instanceof Error && error.message ? error.message : 'Not saved.';
  };

  const recordFailure = (key: string, snapshot: FixtureAnswers, error: unknown) => {
    setAnswers(snapshot);
    setSaved(current => (current === key ? null : current));
    setFailed(prev => ({ ...prev, [key]: failureText(error) }));
  };

  const answerMarket = (market: FixtureMarket, value: unknown) => {
    if (!editable || !market.open) return;
    const snapshot = answers;
    setAnswers(prev => ({ ...prev, [market.key]: value }));
    clearFailure(market.key);

    submitPrediction.mutate(
      {
        marketType: market.marketType,
        expectedVersion: marketVersions[market.marketType] ?? 0,
        answer: toAnswerPayload(market.marketType, value, snapshotId ?? undefined) as StandardAnswerValue,
      },
      {
        onSuccess: result => {
          // The server's new version, so a second edit of the same market is
          // not refused as a conflict against the one this page was built with.
          setMarketVersions(prev => ({ ...prev, [market.marketType]: result.version }));
          showReceipt(market.key);
          router.refresh();
        },
        onError: error => recordFailure(market.key, snapshot, error),
      },
    );
  };

  const bumpScore = (market: FixtureMarket, index: 0 | 1, delta: number) => {
    const current = (answers.exact_score as [number, number] | undefined) ?? [0, 0];
    const next: [number, number] = [current[0], current[1]];
    next[index] = Math.max(0, Math.min(9, next[index] + delta));
    answerMarket(market, next);
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

    submitLineup.mutate(
      { side, expectedVersion: sideVersions[side], playerIds, snapshotId },
      {
        onSuccess: result => {
          setSideVersions(prev => ({ ...prev, [side]: result.version }));
          showReceipt(key);
          router.refresh();
        },
        onError: error => recordFailure(key, snapshot, error),
      },
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

  const heroBg = `linear-gradient(103deg, color-mix(in srgb, ${tintFor(homeCode)} 42%, transparent) 0%, transparent 52%), linear-gradient(257deg, color-mix(in srgb, ${tintFor(awayCode)} 42%, transparent) 0%, transparent 52%), var(--nav-surface)`;

  const standardMarkets = markets.filter(m => m.kind !== 'lineup');
  const lineupMarkets = markets.filter(m => m.kind === 'lineup');
  const exactScore = markets.find(m => m.kind === 'score');
  const settledScore = exactScore?.landedScore ?? null;

  const lineupsOpen = lineupMarkets.some(m => m.open);
  const lineupDeadlineLabel = settled ? ''
    : !lineupsOpen ? 'CLOSED'
      : `CLOSE AT ${timeOfDay(lineupDeadlineAt)} · ${countdown(lineupDeadlineAt)}`;

  return (
    <div className="flex flex-col flex-1 h-[100dvh] md:h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] relative">

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

      <div className="hidden md:block">
        <LeagueTabs leagueId={leagueId} active="fixtures" />
      </div>

      <main className="tf-scroll flex-1 overflow-auto">

        <section className="relative overflow-hidden text-[var(--nav-text)] px-[var(--gutter)] pt-[8px] md:px-0 md:pt-[22px]" style={{ background: heroBg }}>
          <div className="absolute left-0 right-0 top-1/2 h-px bg-[rgba(255,255,255,0.07)]" />
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

            <div className="flex items-center gap-[14px] mt-[20px] md:max-w-[780px] md:mx-auto md:mt-[24px]">
              <div className="flex-1 flex items-center gap-[9px] min-w-0">
                <Crest logo={homeLogo} code={homeCode} size={40} />
                <span className="font-heading font-[650] text-[15px] md:text-[17px] leading-[1.15] tracking-[-0.3px] truncate">{homeName}</span>
              </div>
              <span className={settledScore
                ? 'font-heading font-bold text-[19px] md:text-[26px] tracking-[-0.6px] flex-none tf-num'
                : 'font-heading font-semibold text-[10px] md:text-[12px] text-[var(--nav-text-faint)] flex-none'}>
                {settledScore ? `${settledScore[0]} — ${settledScore[1]}` : timeOfDay(kickoffAt)}
              </span>
              <div className="flex-1 flex items-center gap-[9px] justify-end min-w-0">
                <span className="font-heading font-[650] text-[15px] md:text-[17px] leading-[1.15] tracking-[-0.3px] truncate text-right">{awayName}</span>
                <Crest logo={awayLogo} code={awayCode} size={40} />
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
                                    <span className="tf-crest w-[18px] h-[19px] text-[6.5px] flex-none" style={{ background: tintFor(code) }}>{code}</span>
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
                            <Link
                              href={`/predict/fixture/${fixtureId}/player?leagueId=${leagueId}&market=${market.marketType === 'player_card' ? 'card' : 'scorer'}`}
                              className="inline-block mt-[9px] font-heading font-bold text-[9.5px] tracking-[0.05em] text-[var(--text-link)]"
                            >
                              SEARCH ALL PLAYERS →
                            </Link>
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
                      <span className="text-[10.5px] text-[var(--text-muted)] text-right">
                        {settled ? 'Settled' : marketLocked ? 'Locked' : `Locks in ${countdown(market.deadlineAt)}`}
                      </span>
                    </div>

                  </div>
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
                      disabled={!editable || !market.open}
                      onClick={() => market.side && setEditingLineup(market.side)}
                      className={`tf-tap w-full text-left flex items-center gap-[12px] p-[14px_var(--gutter)] md:px-[14px] md:rounded-[13px] md:border border-t border-[var(--surface-border)] ${index === lineupMarkets.length - 1 ? 'border-b md:border' : ''} ${(!isSet && editable && market.open) ? 'bg-[var(--surface-subtle)]' : ''}`}
                    >
                      <span className="tf-crest w-[30px] h-[32px] text-[9px] flex-none" style={{ background: tintFor(code) }}>{code}</span>
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

          <p className="p-[18px_var(--gutter)_26px] md:px-0 md:max-w-[640px] text-[10.5px] md:text-[11.5px] leading-[1.6] text-[var(--text-muted)]">
            {settled
              ? 'Provisional scores become final once review closes. If a market is voided it scores nothing for everyone, so nobody gains on you.'
              : 'There is no save button on this screen. Each market stores its own answer the moment you pick it, and you can change any of them until it locks.'}
          </p>
        </div>
      </main>

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

      {editingLineup && (
        <div className="absolute inset-0 z-50 bg-[var(--surface-canvas)] md:bg-[rgba(0,0,0,0.5)] md:flex md:items-center md:justify-center md:p-[20px]">
          <div className="bg-[var(--surface-canvas)] w-full max-w-[500px] rounded-[16px] overflow-hidden flex flex-col md:max-h-[80vh]">
            <div className="flex justify-between items-center p-[16px] border-b border-[var(--surface-border)]">
              <h2 className="font-heading font-bold text-[18px]">{editingLineup === 'home' ? homeName : awayName} Starting XI</h2>
              <button type="button" aria-label="Close" onClick={() => setEditingLineup(null)} className="text-[24px] text-[var(--text-muted)]">×</button>
            </div>
            <div className="p-[16px] overflow-y-auto">
              <LineupPicker
                players={(markets.find(m => m.key === `${editingLineup}_lineup`)?.players ?? []).map(p => ({
                  id: p.id, displayName: p.name,
                }))}
                onSave={playerIds => saveLineup(editingLineup, playerIds)}
                isSaving={submitLineup.isPending}
                initialSelection={(answers[`${editingLineup}_lineup`] as string[] | undefined) ?? []}
              />
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
            <span className={`w-[30px] h-[30px] rounded-full flex-none grid place-items-center font-heading font-bold text-[10px] ${isMine ? 'bg-[var(--color-brand)] text-[var(--color-on-brand)]' : 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]'}`}>
              {player.initials}
            </span>
            <span className={`flex-1 min-w-0 font-heading ${isMine ? 'font-bold' : 'font-semibold'} text-[13px] truncate`}>{player.name}</span>
            <span className="text-[10.5px] text-[var(--text-muted)] flex-none">{player.meta}</span>
            <span className={`flex-none text-[13px] text-[var(--color-brand)] ${isMine ? '' : 'invisible'}`}>✓</span>
          </button>
        );
      })}
    </div>
  );
}
