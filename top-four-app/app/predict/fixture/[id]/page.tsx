'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { FixtureMobile } from '../../../components/predict/FixtureMobile';
import { FixtureDesktop } from '../../../components/predict/FixtureDesktop';
import { LineupPicker } from '../../../components/predict/LineupPicker';
import { useFixtureData, useSubmitPrediction, useSubmitLineupPrediction, useCopyPredictions, useMarketHistory } from '@/hooks/api/useFixturePrediction';
import { useMyLeagues, useLeague } from '@/hooks/api/useLeagues';
import type { CopyPredictionsResponse, CopyAnswerOutcome } from '@/lib/api/predictions-fixture';

const CLUB: Record<string, string> = {
  ARS: "#c8182f", CHE: "#1746a2", LIV: "#b7152b", TOT: "#17233d",
  MCI: "#559ac7", EVE: "#153c85", MUN: "#d1262f", NEW: "#20242a",
  PP: "#0879bf", OL: "#7f56d9", AL: "#0e7a5f"
};

export default function FixturePredictPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const leagueId = searchParams?.get('leagueId') || '';
  const fixtureId = params.id;

  const { availability, predictions, selectablePlayers, results, isLoading: dataLoading, isError } = useFixtureData(leagueId, fixtureId);
  const { data: leaguesData } = useMyLeagues();
  const { data: leagueDetail } = useLeague(leagueId);
  const rulesetMarkets = leagueDetail?.ruleset?.markets || [];
  const marketPoints = (marketType: string) => {
    const m = rulesetMarkets.find((rm) => rm.marketType === marketType);
    if (!m) return null;
    return `${m.points} ${m.points === 1 ? 'pt' : 'pts'}`;
  };
  const marketEnabled = (marketType: string) => rulesetMarkets.length === 0 || rulesetMarkets.some((rm) => rm.marketType === marketType && rm.enabled);
  const totalGoalsLine = leagueDetail?.ruleset?.totalGoalsLine ?? 2.5;
  const totalPointsAtStake = rulesetMarkets.length > 0
    ? rulesetMarkets.filter((rm) => rm.enabled).reduce((sum, rm) => sum + (rm.marketType === 'lineup' ? rm.points * 22 : rm.points), 0)
    : 18;
  const kickoffTimeLabel = availability?.kickoff?.at
    ? new Date(availability.kickoff.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : "TBD";
  const submitPrediction = useSubmitPrediction(leagueId, fixtureId);
  const submitLineup = useSubmitLineupPrediction(leagueId, fixtureId);
  const copyPredictionsMutation = useCopyPredictions(leagueId, fixtureId);

  // Team identity comes straight from the fixture's own availability record.
  const hName = availability?.homeTeam.displayName || "Home Team";
  const aName = availability?.awayTeam.displayName || "Away Team";
  const hCode = availability?.homeTeam.code || "HOM";
  const aCode = availability?.awayTeam.code || "AWA";
  const hLogo = availability?.homeTeam.logoUrl || null;
  const aLogo = availability?.awayTeam.logoUrl || null;

  // Derive player options dynamically from selectablePlayers API
  const homePlayersList = useMemo(() => {
    if (!selectablePlayers?.players) return [];
    return selectablePlayers.players.filter(p => p.side === 'home');
  }, [selectablePlayers]);

  const awayPlayersList = useMemo(() => {
    if (!selectablePlayers?.players) return [];
    return selectablePlayers.players.filter(p => p.side === 'away');
  }, [selectablePlayers]);

  const scorerPlayers = useMemo(() => {
    if (!selectablePlayers?.players || selectablePlayers.players.length === 0) {
      return [];
    }
    return selectablePlayers.players.map(p => {
      const code = p.side === 'home' ? hCode : aCode;
      const initials = p.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      return [p.playerId, p.displayName, p.shirtNumber ? `${code} ${p.shirtNumber}` : code, initials];
    });
  }, [selectablePlayers, hCode, aCode]);

  const cardPlayers = scorerPlayers;

  const homeLineupRoster = useMemo(() => {
    return homePlayersList.map(p => ({
      id: p.playerId,
      displayName: p.displayName,
      position: p.position || undefined,
      shirtNumber: p.shirtNumber || undefined
    }));
  }, [homePlayersList]);

  const awayLineupRoster = useMemo(() => {
    return awayPlayersList.map(p => ({
      id: p.playerId,
      displayName: p.displayName,
      position: p.position || undefined,
      shirtNumber: p.shirtNumber || undefined
    }));
  }, [awayPlayersList]);

  const DEFS = useMemo(() => [
    { key: "match_result", name: "Match result", pts: marketPoints("match_result") || "2 pts", enabled: marketEnabled("match_result"), kind: "tiles", options: [["home", hName, "win"], ["draw", "Draw", ""], ["away", aName, "win"]] },
    { key: "exact_score", name: "Exact score", pts: marketPoints("exact_score") || "5 pts", enabled: marketEnabled("exact_score"), kind: "score" },
    { key: "both_teams_to_score", name: "Both teams to score", pts: marketPoints("both_teams_to_score") || "1 pt", enabled: marketEnabled("both_teams_to_score"), kind: "tiles", options: [["yes", "Yes", ""], ["no", "No", ""]] },
    { key: "total_goals", name: "Total goals", pts: marketPoints("total_goals") || "1 pt", enabled: marketEnabled("total_goals"), kind: "tiles", options: [["over", `Over ${totalGoalsLine}`, ""], ["under", `Under ${totalGoalsLine}`, ""]] },
    { key: "anytime_goalscorer", name: "Anytime goalscorer", pts: marketPoints("anytime_goalscorer") || "5 pts", enabled: marketEnabled("anytime_goalscorer"), kind: "players", players: scorerPlayers },
    { key: "player_card", name: "Player to be carded", pts: marketPoints("player_card") || "4 pts", enabled: marketEnabled("player_card"), kind: "players", players: cardPlayers },
    { key: "home_lineup", name: `${hName} Starting XI`, pts: `${marketPoints("lineup") || "1 pt"} each`, enabled: marketEnabled("lineup"), kind: "lineup", side: "home", players: homeLineupRoster },
    { key: "away_lineup", name: `${aName} Starting XI`, pts: `${marketPoints("lineup") || "1 pt"} each`, enabled: marketEnabled("lineup"), kind: "lineup", side: "away", players: awayLineupRoster }
  ], [hName, aName, scorerPlayers, cardPlayers, homeLineupRoster, awayLineupRoster, rulesetMarkets, totalGoalsLine]);

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [history, setHistory] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);
  const [copy, setCopy] = useState<'idle' | 'done' | null>(null);
  const [copyResult, setCopyResult] = useState<CopyPredictionsResponse | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [editingLineup, setEditingLineup] = useState<'home' | 'away' | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const ACTUAL: Record<string, any> = { score: [0, 0] };
  const OUTCOME: Record<string, string> = {};
  const EARNED: Record<string, string> = {};
  if (results?.markets) {
    for (const m of results.markets) {
      const key = m.marketType === 'lineup' ? `${m.side}_lineup` : m.marketType;
      if (m.marketType === 'exact_score' && m.resolvedAnswer) {
        const ra = m.resolvedAnswer as { homeGoals?: number; awayGoals?: number };
        if (typeof ra.homeGoals === 'number' && typeof ra.awayGoals === 'number') {
          ACTUAL.score = [ra.homeGoals, ra.awayGoals];
        }
      }
      if (m.viewerOutcome) {
        OUTCOME[key] = m.viewerOutcome.outcome === 'correct' ? 'hit' : m.viewerOutcome.outcome === 'void' ? 'void' : 'miss';
        EARNED[key] = m.viewerOutcome.pointsDelta > 0 ? `+${m.viewerOutcome.pointsDelta}` : '0';
      } else if (m.state === 'pending_review') {
        OUTCOME[key] = 'review';
      }
    }
  }
  // Fetched only for the currently-expanded market's history panel, not
  // eagerly for every market -- `history` already tracks which key (if any)
  // is open. Each market's edit *count* still needs to be known before the
  // panel is ever opened (to show "EDITED n" at all), but that comes for
  // free from the market's own version number below, with no extra request.
  const marketHistoryQuery = useMarketHistory(leagueId, fixtureId, history);
  const answerLabel = (marketType: string, value: any): string => {
    switch (marketType) {
      case 'match_result':
        if (value?.outcome === 'home') return hName;
        if (value?.outcome === 'away') return aName;
        return 'Draw';
      case 'exact_score':
        return typeof value?.homeGoals === 'number' && typeof value?.awayGoals === 'number'
          ? `${value.homeGoals}–${value.awayGoals}` : '—';
      case 'both_teams_to_score':
        return value?.bothScore ? 'Yes' : 'No';
      case 'total_goals':
        return value?.selection === 'over' ? `Over ${totalGoalsLine}` : `Under ${totalGoalsLine}`;
      case 'anytime_goalscorer':
      case 'player_card': {
        const list = marketType === 'anytime_goalscorer' ? scorerPlayers : cardPlayers;
        const found = (list as any[]).find((p) => p[0] === value?.playerId);
        return found ? found[1] : 'Unknown player';
      }
      default:
        return '—';
    }
  };
  const formatWhen = (iso: string) => new Date(iso).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const EDITS: Record<string, string[][]> = {};
  if (history && marketHistoryQuery.data?.marketType === history) {
    EDITS[history] = marketHistoryQuery.data.revisions.map((r) => [
      answerLabel(marketHistoryQuery.data!.marketType, r.answer.value),
      formatWhen(r.answer.submittedAt),
    ]);
  }
  const totalPointsEarned = (results?.markets || []).reduce((sum, m) => sum + (m.viewerOutcome?.pointsDelta || 0), 0);

  const isLoading = dataLoading;
  const isReady = !isLoading && !isError;
  const isLocked = !!availability && !availability.hasOpenMarkets && (availability.marketStateCounts.settled || 0) === 0;
  const isSettled = !!availability && (availability.marketStateCounts.settled || 0) > 0 && availability.hasOpenMarkets === false;

  // The server's own clock, captured once per fresh availability response and
  // held fixed while `now` ticks locally -- so a client with a fast or slow
  // clock still counts down against the deadline the server will actually
  // enforce, not against its own idea of the current time.
  const clockOffsetMs = useMemo(() => {
    if (!availability?.serverTime) return 0;
    return new Date(availability.serverTime).getTime() - Date.now();
  }, [availability?.serverTime]);
  const deadlineMs = availability?.nextDeadlineAt ? new Date(availability.nextDeadlineAt).getTime() : null;
  const secondsRemaining = deadlineMs !== null ? Math.max(0, Math.round((deadlineMs - (now + clockOffsetMs)) / 1000)) : null;
  const urgent = !isSettled && !isLocked && secondsRemaining !== null && secondsRemaining > 0 && secondsRemaining <= 900;

  useEffect(() => {
    if (!predictions) return;
    const initial: Record<string, any> = {};
    for (const slot of predictions.markets) {
      if (!slot.answer) continue;
      const v = slot.answer.value;
      switch (slot.marketType) {
        case 'match_result':
          initial.match_result = v.outcome;
          break;
        case 'exact_score':
          if (typeof v.homeGoals === 'number' && typeof v.awayGoals === 'number') {
            initial.exact_score = [v.homeGoals, v.awayGoals];
            initial.score = [v.homeGoals, v.awayGoals];
          }
          break;
        case 'both_teams_to_score':
          initial.both_teams_to_score = v.bothScore ? 'yes' : 'no';
          break;
        case 'total_goals':
          initial.total_goals = v.selection;
          break;
        case 'anytime_goalscorer':
        case 'player_card':
          initial[slot.marketType] = v.playerId;
          break;
      }
    }
    if (predictions.lineups.home) initial.home_lineup = predictions.lineups.home.answer.value.playerIds;
    if (predictions.lineups.away) initial.away_lineup = predictions.lineups.away.answer.value.playerIds;
    setAnswers(initial);
  }, [predictions]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fmt = (sec: number) => {
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}:${String(s).padStart(2, "0")}`;
  };

  const showReceipt = (key: string) => {
    setSaved(key);
    setTimeout(() => setSaved(null), 2200);
  };

  // Turns the local UI value (a raw id/string the tiles compare against) into
  // the shaped answer body each market actually requires on the wire.
  const buildAnswerPayload = (marketType: string, value: any): any => {
    switch (marketType) {
      case 'match_result': return { outcome: value };
      case 'both_teams_to_score': return { bothScore: value === 'yes' };
      case 'total_goals': return { selection: value };
      case 'anytime_goalscorer':
      case 'player_card':
        return { playerId: value, snapshotId: selectablePlayers?.snapshot?.snapshotId };
      default: return value;
    }
  };

  const handleSet = (key: string, value: any, editable: boolean) => {
    if (!editable || isLocked || isSettled) return;
    const previous = answers[key];
    setAnswers(prev => ({ ...prev, [key]: value }));

    if (leagueId && predictions) {
      const slot = predictions.markets.find(m => m.marketType === key);
      const expectedVersion = slot?.version || 0;
      submitPrediction.mutate({ marketType: key, expectedVersion, answer: buildAnswerPayload(key, value) }, {
        onSuccess: () => showReceipt(key),
        onError: (err: any) => {
          setAnswers(prev => ({ ...prev, [key]: previous }));
          window.alert(err?.message || "Couldn't save that answer — please try again.");
        },
      });
    } else {
      showReceipt(key);
    }
  };

  const handleBump = (i: number, d: number, editable: boolean) => {
    if (!editable) return;
    const previous = (answers.exact_score || answers.score || [0, 0]).slice();
    const sc = previous.slice();
    sc[i] = Math.max(0, Math.min(9, sc[i] + d));
    setAnswers(prev => ({ ...prev, exact_score: sc, score: sc }));
    if (leagueId && predictions) {
      const slot = predictions.markets.find(m => m.marketType === 'exact_score');
      const expectedVersion = slot?.version || 0;
      submitPrediction.mutate({ marketType: 'exact_score', expectedVersion, answer: { homeGoals: sc[0], awayGoals: sc[1] } }, {
        onSuccess: () => showReceipt("exact_score"),
        onError: (err: any) => {
          setAnswers(prev => ({ ...prev, exact_score: previous, score: previous }));
          window.alert(err?.message || "Couldn't save that score — please try again.");
        },
      });
    } else {
      showReceipt("exact_score");
    }
  };

  const handleSetLineup = (side: 'home' | 'away', lineup: string[]) => {
    const previous = answers[`${side}_lineup`];
    setAnswers(prev => ({ ...prev, [`${side}_lineup`]: lineup }));
    setEditingLineup(null);
    if (leagueId && predictions) {
      const slot = side === 'home' ? predictions.lineups.home : predictions.lineups.away;
      const expectedVersion = slot?.version || 0;
      const snapshotId = predictions.lineups.snapshot?.snapshotId || selectablePlayers?.snapshot?.snapshotId;
      if (snapshotId) {
        submitLineup.mutate({ side, expectedVersion, playerIds: lineup, snapshotId }, {
          onSuccess: () => showReceipt(`${side}_lineup`),
          onError: (err: any) => {
            setAnswers(prev => ({ ...prev, [`${side}_lineup`]: previous }));
            window.alert(err?.message || "Couldn't save that lineup — please try again.");
          },
        });
        return;
      }
    }
    showReceipt(`${side}_lineup`);
  };

  const locked = isLocked, settled = isSettled;
  const conflict = false;
  const editable = isReady && !locked && !settled;
  const seconds = secondsRemaining ?? 0;
  const clock = fmt(seconds);

  const a = conflict ? { ...answers, match_result: "draw" } : answers;

  const heroTone = urgent ? "var(--color-danger)" : settled ? "var(--state-provisional)" : locked ? "var(--nav-text-faint)" : "var(--nav-accent)";
  const MARKET_KEYS = ["match_result", "exact_score", "both_teams_to_score", "total_goals", "anytime_goalscorer", "player_card"];
  const enabledDefs = DEFS.filter((d) => d.enabled);
  const enabledStandardKeys = enabledDefs.filter((d) => d.kind !== 'lineup').map((d) => d.key);
  const enabledLineupCount = enabledDefs.filter((d) => d.kind === 'lineup').length;
  const answeredMarkets = enabledStandardKeys.filter(k => a[k] !== null && a[k] !== undefined).length;
  const lineupsSetCount = ['home_lineup', 'away_lineup'].filter(k => Array.isArray(a[k]) && a[k].length === 11).length;
  const answeredTotal = answeredMarkets + lineupsSetCount;
  const totalAnswerable = enabledStandardKeys.length + enabledLineupCount;
  const pct = totalAnswerable > 0 ? Math.round((answeredTotal / totalAnswerable) * 100) : 0;

  const tileStyleMobile = (mine: boolean, won: boolean) => {
    const base = `flex-1 min-w-0 min-h-[52px] rounded-[11px] flex flex-col justify-center items-center gap-[3px] p-[6px_4px] text-center transition-all duration-140 ${editable ? 'cursor-pointer' : 'cursor-default'} `;
    if (!settled) return base + (mine ? "border border-[var(--color-brand)] bg-[var(--brand-fill)] text-[var(--color-on-brand)] shadow-[var(--elev-glow)]" : "border border-[var(--surface-border-strong)] bg-transparent text-[var(--text-primary)]");
    if (mine && won) return base + "border border-[var(--color-success)] bg-[var(--color-success)] text-[var(--tf-white)]";
    if (mine) return base + "border border-[var(--color-danger)] bg-transparent text-[var(--danger-text)]";
    if (won) return base + "border border-dashed border-[var(--success-text)] bg-transparent text-[var(--success-text)]";
    return base + "border border-[var(--surface-border)] bg-transparent text-[var(--text-muted)]";
  };

  const tileStyleDesktop = (mine: boolean, won: boolean) => {
    return {
      flex: 1, minHeight: '52px', borderRadius: '11px', display: 'flex', flexDirection: 'column' as any, justifyContent: 'center', alignItems: 'center', gap: '2px', padding: '7px 5px', cursor: editable ? 'pointer' : 'default', transition: 'background .14s, border-color .14s',
      border: (!settled && mine) ? '1px solid var(--color-brand)' : '1px solid var(--surface-border-strong)',
      background: (!settled && mine) ? 'var(--color-brand)' : 'transparent',
      color: (!settled && mine) ? 'var(--color-on-brand)' : 'inherit',
      boxShadow: (!settled && mine) ? 'var(--elev-glow)' : 'none'
    };
  };

  const markets = DEFS.filter((d) => d.enabled).map((d, i, arr) => {
    const mine = a[d.key];
    const out = OUTCOME[d.key];
    const histOpen = history === d.key;
    const unanswered = mine === null || mine === undefined;

    // The fixture-wide `locked`/`editable` above come from a status field this
    // page never actually updates, so they can't tell one market's real state
    // from another's -- a market the backend has genuinely locked (kickoff
    // passed, its own deadline passed) still read as open here, and a pick on
    // it silently no-opped since handleSet correctly checks the real
    // per-market data anyway. Each market's own submissionAllowed/state from
    // predictions.markets is the actual source of truth.
    const marketSlot = predictions?.markets.find(ms => ms.marketType === d.key);
    // version 1 is the first submission, so version-1 is the edit count --
    // known synchronously from data already on the page, with no need to
    // fetch every market's full history just to show how many times it
    // changed. The full list of past values (edits below) is fetched lazily,
    // only once this specific market's panel is opened.
    const editCount = Math.max(0, (marketSlot?.version || (unanswered ? 0 : 1)) - 1);
    const edits = (histOpen ? EDITS[d.key] : undefined) || [];
    const marketLocked = !settled && (locked || marketSlot?.submissionAllowed === false);
    const editable = isReady && !marketLocked && !settled;

    let right, rightStyle;
    if (settled) {
      right = EARNED[d.key] || "0";
      rightStyle = `font-heading font-bold text-[17px] tracking-[-0.4px] flex-none tf-num ${out === "hit" ? 'text-[var(--prediction-correct)]' : 'text-[var(--text-muted)]'}`;
    } else if (marketLocked) {
      right = unanswered ? "NO ANSWER" : "LOCKED";
      rightStyle = `font-heading font-bold text-[9.5px] tracking-[0.05em] flex-none ${unanswered ? 'text-[var(--danger-text)]' : 'text-[var(--text-muted)]'}`;
    } else {
      right = unanswered ? "OPEN" : "ANSWERED";
      rightStyle = `font-heading font-bold text-[9.5px] tracking-[0.05em] flex-none ${unanswered ? 'text-[var(--accent-text-strong)]' : 'text-[var(--text-muted)]'}`;
    }

    if (settled && (out === "review" || out === "void")) {
      right = out === "review" ? "IN REVIEW" : "VOID";
      rightStyle = `font-heading font-bold text-[9.5px] tracking-[0.05em] flex-none p-[5px_8px] rounded-[6px] border ${out === "void" ? 'border-dashed' : 'border-solid'} border-[var(--surface-border-strong)] text-[var(--text-muted)]`;
    }

    const m = {
      ...d, right, rightStyle,
      ptsStyle: `font-heading font-semibold text-[10px] text-[var(--text-muted)] flex-none ${settled ? 'hidden' : ''}`,
      blockStyle: `p-[15px_var(--gutter)] border-t border-[var(--surface-border)] ${i === arr.length - 1 ? 'border-b' : ''} ${(!settled && !marketLocked && unanswered) ? 'bg-[var(--accent-surface)] shadow-[inset_3px_0_0_0_var(--color-brand)]' : ''}`,
      cardStyle: `border-top: 1px solid var(--surface-border); ${!editable ? 'opacity: .96;' : ''} ${editable && unanswered ? 'background: var(--accent-surface); box-shadow: inset 3px 0 0 0 var(--color-brand);' : ''}`,
      historyLink: editCount ? (histOpen ? "HIDE EDITS" : `EDITED ${editCount}×`) : "Never changed",
      historyStyle: editCount ? `font-heading font-bold text-[9.5px] tracking-[0.05em] text-[var(--text-link)] cursor-pointer` : "hidden",
      toggleHistory: () => setHistory(histOpen ? null : d.key),
      historyLinkStyle: `flex-none font-heading font-semibold text-[10.5px] ${editCount ? 'color-[var(--text-link)] cursor-pointer' : 'text-[var(--text-muted)]'}`,
      showHistory: histOpen && editCount > 0,
      histories: edits.map((e, j) => ({
        value: e[0], when: e[1],
        dotStyle: `w-[6px] h-[6px] rounded-full flex-none ${j === 0 ? 'bg-[var(--color-brand)]' : 'bg-[var(--surface-border-strong)]'}`,
        valueStyle: `font-heading ${j === 0 ? 'font-bold' : 'font-normal'} text-[11.5px] ${j === 0 ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`
      })),
      history: edits.map((e, j) => ({
        value: e[0], when: e[1],
        dotStyle: { width: '7px', height: '7px', borderRadius: '999px', flex: 'none', background: j === 0 ? 'var(--color-brand)' : 'var(--surface-border-strong)' },
        valueStyle: { font: `${j === 0 ? '600' : '400'} 12px 'DM Sans', sans-serif`, color: j === 0 ? 'var(--text-primary)' : 'var(--text-muted)' }
      })),
      savedStyle: `font-heading font-bold text-[9.5px] tracking-[0.05em] p-[4px_8px] rounded-[6px] bg-[var(--color-success)] text-[var(--tf-white)] ${saved === d.key ? 'animate-[tfsaved_2.2s_ease_forwards]' : 'opacity-0 invisible'}`,
      footStyle: `flex items-center min-h-[20px] mt-[10px] ${(!editCount && saved !== d.key) ? 'hidden' : ''}`,
      showChoices: editable && d.kind === "tiles",
      tiles: d.kind === "tiles" ? (d.options || []).map(([id, label, sub]) => {
        const isMine = mine === id, isWon = settled && ACTUAL[d.key] === id;
        let s2 = sub;
        if (settled) s2 = isMine && isWon ? "YOURS · LANDED" : isMine ? "YOURS" : isWon ? "LANDED" : "";
        return {
          label, sub: s2,
          subStyle: `font-heading font-semibold text-[8.5px] tracking-[0.07em] uppercase opacity-80 ${s2 ? '' : 'hidden'}`,
          style: tileStyleMobile(isMine, isWon),
          pick: () => handleSet(d.key, id, editable)
        };
      }) : [],
      options: d.kind === "tiles" ? (d.options || []).map(([id, label, sub]) => {
        const isMine = mine === id, isWon = settled && ACTUAL[d.key] === id;
        let s2 = sub;
        if (settled) s2 = isMine && isWon ? "YOURS · LANDED" : isMine ? "YOURS" : isWon ? "LANDED" : "";
        return {
          label, sub: s2,
          subStyle: s2 ? { fontSize: '10px', color: isMine ? 'var(--color-on-brand)' : 'var(--text-muted)', opacity: isMine ? 0.8 : 1 } : { display: 'none' },
          style: tileStyleDesktop(isMine, isWon),
          pick: () => handleSet(d.key, id, editable)
        };
      }) : [],
      showScore: editable && d.kind === "score",
      steppers: d.kind === "score" ? [[hName, hCode, CLUB[hCode] || '#666', 0], [aName, aCode, CLUB[aCode] || '#666', 1]].map(([team, code, color, idx]) => {
        const scoreVal = a.exact_score ? (Array.isArray(a.exact_score) ? a.exact_score[idx as number] : idx === 0 ? a.exact_score.homeGoals : a.exact_score.awayGoals) : (a.score ? a.score[idx as number] : "–");
        return {
          team, code, color, value: scoreVal !== undefined && scoreVal !== null ? scoreVal : "–",
          btnStyle: editable ? `w-[34px] h-[46px] md:w-[42px] md:h-[44px] flex-none rounded-[10px] border border-[var(--surface-border-strong)] grid place-items-center text-[18px] md:text-[19px] text-[var(--text-secondary)] cursor-pointer` : "hidden",
          valueStyle: `flex-1 min-w-0 h-[46px] rounded-[10px] grid place-items-center font-heading font-bold text-[20px] tf-num ${a.exact_score || a.score ? 'bg-[var(--text-primary)] text-[var(--surface-canvas)]' : 'border border-dashed border-[var(--surface-border-strong)] text-[var(--text-muted)]'}`,
          boxStyle: { flex: 1, height: '48px', borderRadius: '11px', display: 'flex', flexDirection: 'column' as any, alignItems: 'center', justifyContent: 'center', border: (a.exact_score || a.score) ? 'none' : '1px dashed var(--surface-border-strong)', background: (a.exact_score || a.score) ? 'var(--surface-subtle)' : 'transparent' },
          inc: () => handleBump(idx as number, 1, editable), dec: () => handleBump(idx as number, -1, editable)
        };
      }) : [],
      scoreNote: '',
      scoreNoteStyle: '',
      showPlayers: editable && d.kind === "players"
    };

    if (d.kind === "score") {
      const v = a.exact_score || a.score;
      const vStr = Array.isArray(v) ? `${v[0]}–${v[1]}` : (v ? `${v.homeGoals}–${v.awayGoals}` : null);
      m.scoreNote = settled ? `You said ${vStr || 'nothing'} · it finished ${ACTUAL.score[0]}–${ACTUAL.score[1]}`
        : marketLocked ? (vStr ? `Locked at ${vStr}` : "Nothing was ever saved here.")
          : vStr ? `${hName} ${Array.isArray(v) ? v[0] : v?.homeGoals} · ${aName} ${Array.isArray(v) ? v[1] : v?.awayGoals}` : "Untouched — an exact score is not assumed to be 0–0.";
      const scoreHit = settled && v && ((Array.isArray(v) && v[0] === ACTUAL.score[0] && v[1] === ACTUAL.score[1]) || (!Array.isArray(v) && v.homeGoals === ACTUAL.score[0] && v.awayGoals === ACTUAL.score[1]));
      m.scoreNoteStyle = `text-[10.5px] md:text-[12.5px] leading-[1.5] mt-[9px] md:mt-[5px] ${scoreHit ? 'text-[var(--success-text)]' : (settled || (marketLocked && !v)) ? 'text-[var(--danger-text)]' : 'text-[var(--text-muted)]'}`;
    }

    if (d.kind === "players") {
      const shown = (settled || marketLocked) ? ((d.players as any[]) || []).filter(([id]) => id === mine) : ((d.players as any[]) || []);
      (m as any).playerItems = shown.map(([id, name, meta, initials]: any) => {
        const isMine = mine === id, isWon = settled && ACTUAL[d.key] === id, inReview = settled && out === "review";
        return {
          name, meta, initials,
          style: `flex items-center gap-[10px] min-h-[46px] rounded-[11px] p-[7px_11px] ${editable ? 'cursor-pointer' : 'cursor-default'} ${(isMine && isWon && !inReview) ? 'border border-[var(--color-success)] bg-[var(--success-surface)]' : isMine ? 'border border-[var(--color-brand)] bg-[var(--accent-surface)]' : 'border border-[var(--surface-border-strong)] bg-transparent'}`,
          badgeStyle: `w-[30px] h-[30px] rounded-full flex-none grid place-items-center font-heading font-bold text-[10px] ${isMine ? 'bg-[var(--color-brand)] text-[var(--color-on-brand)]' : 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]'}`,
          nameStyle: `flex-1 min-w-0 font-heading ${isMine ? 'font-bold' : 'font-semibold'} text-[13px] whitespace-nowrap overflow-hidden text-ellipsis`,
          mark: isWon && !inReview ? "✓" : isMine ? "✓" : "",
          markStyle: `flex-none text-[13px] ${isWon && !inReview ? 'text-[var(--success-text)]' : 'text-[var(--color-brand)]'} ${isMine || isWon ? '' : 'invisible'}`,
          pick: () => handleSet(d.key, id, editable)
        };
      });

      (m as any).players = shown.map(([id, name, meta, initials]) => {
        const isMine = mine === id, isWon = settled && ACTUAL[d.key] === id, inReview = settled && out === "review";
        return {
          name, meta, initials,
          style: { display: 'flex', alignItems: 'center', gap: '11px', minHeight: '50px', borderRadius: '11px', padding: '8px 12px', cursor: editable ? 'pointer' : 'default', transition: 'border-color .14s', border: isMine ? '1px solid var(--color-brand)' : '1px solid var(--surface-border-strong)', background: isMine ? 'var(--accent-surface)' : 'transparent' },
          badgeStyle: { width: '32px', height: '32px', borderRadius: '999px', flex: 'none', display: 'grid', placeItems: 'center', font: "600 10.5px 'DM Sans', sans-serif", background: isMine ? 'var(--color-brand)' : 'var(--surface-subtle)', color: isMine ? 'var(--color-on-brand)' : 'var(--text-secondary)' },
          tickStyle: { flex: 'none', fontSize: '14px', color: 'var(--color-brand)', visibility: isMine ? 'visible' : 'hidden' },
          pick: () => handleSet(d.key, id, editable)
        };
      });

      (m as any).search = editable ? "SEARCH ALL PLAYERS →" : (unanswered ? (settled ? "You did not answer this one" : "Not answered — no points from this one") : "");
      (m as any).searchStyle = `mt-[9px] font-heading font-bold text-[9.5px] tracking-[0.05em] ${editable ? 'text-[var(--text-link)]' : 'text-[var(--text-muted)]'} ${(m as any).search ? '' : 'hidden'}`;
      (m as any).searchLabel = editable ? "Search all players →" : "";
      (m as any).searchHref = editable ? `/predict/fixture/${fixtureId}/player?leagueId=${leagueId}&market=${d.key === 'player_card' ? 'card' : 'scorer'}` : "";
    }

    if (d.key === "exact_score" || d.key === "score") {
      const sc = a.exact_score || a.score;
      (m as any).answer = sc ? (Array.isArray(sc) ? `${sc[0]} — ${sc[1]}` : `${sc.homeGoals} — ${sc.awayGoals}`) : (marketLocked ? "Nothing was ever saved here" : "Untouched — an exact score is not assumed to be 0–0");
    } else if (d.kind === "players") {
      const pickedId = a[d.key];
      const pickedPlayer = pickedId ? ((d.players as any[]) || []).find(([id]) => id === pickedId) : null;
      (m as any).answer = pickedPlayer ? pickedPlayer[1] : (marketLocked ? "Not answered — no points from this one" : "Not answered");
    } else if (d.kind === "lineup") {
      const picked = a[d.key];
      const count = Array.isArray(picked) ? picked.length : 0;
      (m as any).answer = count === 11 ? "11 of 11 selected" : count > 0 ? `${count} of 11 selected` : (marketLocked ? "Not set — no points from this one" : "Not set");
    } else {
      (m as any).answer = a[d.key] ? (typeof a[d.key] === 'string' ? a[d.key] : JSON.stringify(a[d.key])) : (marketLocked ? "Not answered — no points from this one" : "Not answered");
    }
    (m as any).answerStyle = a[d.key] ? "font-size: 12.5px; color: var(--text-secondary); margin-top: 5px;" : "font-size: 12.5px; color: var(--text-muted); font-style: italic; margin-top: 5px;";

    let chipText = settled ? (out === "review" ? "In review" : out === "void" ? "Void" : "Provisional") : marketLocked ? "Locked" : "Open";
    let chipBase = "font: 600 10px 'DM Sans', sans-serif; letter-spacing: .03em; padding: 3px 9px; border-radius: 999px; white-space: nowrap; ";
    let chipSpec = settled ? (out === "review" ? "border: 1px solid var(--surface-border-strong); color: var(--text-secondary);" : out === "void" ? "border: 1px solid var(--surface-border-strong); color: var(--text-muted);" : "background: var(--state-provisional); color: var(--nav-on-accent);") : marketLocked ? "background: var(--state-locked); color: var(--color-on-brand);" : "background: var(--surface-subtle); color: var(--text-secondary);";
    (m as any).chipStyle = chipBase + chipSpec;
    (m as any).chip = chipText;
    (m as any).outcomeWrapStyle = `display: flex; flex-direction: column; align-items: flex-end; gap: 6px; padding-top: 3px; justify-self: end; width: ${settled ? '150px' : '86px'}`;
    (m as any).lockLine = settled ? "Settled" : marketLocked ? "Locked at kick-off" : `Locks at kickoff · ${clock}`;
    (m as any).historyNote = "Only the top line counted. Earlier answers are kept so a score can be checked, never re-scored.";

    return m;
  });

  const lineups = [
    { code: hCode, color: CLUB[hCode] || '#666', name: `${hName} lineup`, set: !!answers.home_lineup, side: 'home' as const },
    { code: aCode, color: CLUB[aCode] || '#666', name: `${aName} lineup`, set: !!answers.away_lineup, side: 'away' as const }
  ].map((l, i, arr) => {
    let sub, right, rightToneClass;
    if (settled) { sub = l.set ? "Lineup settled" : "Not set — no points from this one"; right = l.set ? "+11" : "0"; rightToneClass = l.set ? 'text-[var(--prediction-correct)]' : 'text-[var(--text-muted)]'; }
    else if (locked) { sub = l.set ? "11 named · locked" : "Not set — this one closed"; right = l.set ? "VIEW" : "MISSED"; rightToneClass = l.set ? 'text-[var(--text-muted)]' : 'text-[var(--danger-text)]'; }
    else { sub = l.set ? "11 named · you can still change it" : "Nothing named yet"; right = l.set ? "EDIT →" : "PICK →"; rightToneClass = l.set ? 'text-[var(--text-link)]' : 'text-[var(--accent-text-strong)]'; }
    return {
      code: l.code, color: l.color, name: l.name, sub, crest: l.code, points: `${marketPoints("lineup") || "1 pt"} × 11`,
      subStyle: `text-[10.5px] mt-[3px] ${l.set ? 'text-[var(--text-muted)]' : (settled || locked) ? 'text-[var(--danger-text)]' : 'text-[var(--text-secondary)]'}`,
      right,
      rightStyle: `${settled ? 'font-heading font-bold text-[17px] tracking-[-0.4px] tf-num' : 'font-heading font-bold text-[9.5px] tracking-[0.05em]'} flex-none ${rightToneClass}`,
      rowStyle: `flex items-center gap-[12px] p-[14px_var(--gutter)] border-t border-[var(--surface-border)] ${i === arr.length - 1 ? 'border-b' : ''} ${(!l.set && !settled && !locked) ? 'bg-[var(--surface-subtle)]' : ''}`,
      answer: settled ? (l.set ? "11 selected" : "Not set — no points") : (l.set ? "11 of 11 selected" : "Not set"),
      answerStyle: l.set ? "font-size: 12.5px; color: var(--text-secondary); margin-top: 5px;" : "font-size: 12.5px; color: var(--text-muted); font-style: italic; margin-top: 5px;",
      chip: settled ? "Provisional" : locked ? "Locked" : "Open",
      chipStyle: `font: 600 10px 'DM Sans', sans-serif; letter-spacing: .03em; padding: 3px 9px; border-radius: 999px; white-space: nowrap; ${settled ? 'background: var(--state-provisional); color: var(--nav-on-accent);' : locked ? 'background: var(--state-locked); color: var(--color-on-brand);' : 'background: var(--surface-subtle); color: var(--text-secondary);'}`,
      pick: () => setEditingLineup(l.side)
    };
  });

  const HERO: Record<string, string[]> = {
    open: ["OPEN", "until everything locks", "Lineups close two hours earlier. Everything else stays open until the whistle."],
    urgent: ["LOCKING NOW", "until everything locks", "Anything still unanswered when the whistle goes scores nothing. Lineups have already closed."],
    locked: ["LOCKED", "kick-off", "Nothing can change now. Any unanswered markets will score nothing."],
    settled: ["PROVISIONAL", "so far", "Provisional until review closes. A voided market scores nothing for everyone."],
    conflict: ["OPEN", "until everything locks", "This fixture is open on another device too. The stored answer always wins until you replace it."],
    loading: ["", "", ""]
  };
  const heroKey = settled ? "settled" : locked ? "locked" : urgent ? "urgent" : "open";
  const heroData = HERO[isReady ? heroKey : "open"] || HERO.open;

  // Derive other leagues containing this fixture from user's active leagues
  const otherLeagues = useMemo(() => {
    if (!leaguesData?.items) return [];
    return leaguesData.items.filter(l => l.id !== leagueId).map(l => ({
      id: l.id,
      league: l.name,
      note: `Same match · all markets`,
      flag: "",
      // Verified live against the real endpoint: a cancelled or archived
      // league is still attempted (and reported per-market, typically as
      // "league_closed") since the copy targets every league you actively
      // *belong to*, historical ones included -- the backend's own copy
      // service explicitly copies into "closed historical leagues" too. A
      // draft is the one case truly never attempted, since it has no real
      // membership or published fixtures yet -- only that dims here, so the
      // pre-copy count matches what the backend actually attempts.
      muted: l.lifecycleState === 'draft'
    }));
  }, [leaguesData, leagueId]);

  // The backend endpoint (POST .../predictions/copy) takes no target list --
  // it always copies into *every* other league the caller actively belongs
  // to that has this fixture, and reports what happened per league. There is
  // no way to copy into a chosen subset, so this used to be a real bug: the
  // UI let you individually check/uncheck leagues and the button said
  // "Copy into N leagues" for whatever N you'd selected, but execution never
  // read that selection at all -- it just set local "done" state without
  // ever calling the mutation, so no copy ever actually happened, checked or
  // not. This is now an informational list (every one of these leagues will
  // receive the copy) rather than a selection the user believes they control.
  const targets = otherLeagues.map(t => ({
    league: t.league, note: t.note,
    cardStyle: `flex gap-[12px] items-start p-[13px_14px] md:p-[14px_16px] rounded-[13px] bg-[var(--surface-canvas)] md:bg-[var(--surface-card)] border border-[var(--surface-border)] ${t.muted ? 'opacity-55' : ''}`,
    boxStyle: `w-[21px] h-[21px] rounded-[6px] md:rounded-[7px] flex-none mt-[1px] grid place-items-center text-[11px] text-[var(--color-on-brand)] ${t.muted ? 'border border-[var(--surface-border-strong)]' : 'bg-[var(--color-brand)]'}`,
    check: t.muted ? "" : "✓",
    hasFlag: !!t.flag, flag: t.flag,
    flagStyle: `inline-block font-heading font-semibold text-[10px] md:text-[10.5px] p-[3px_9px] rounded-[999px] mt-[7px] bg-[var(--surface-subtle)] text-[var(--text-muted)]`,
    toggle: () => {}
  }));

  const carryLabels = MARKET_KEYS.map(k => {
    const val = a[k];
    if (!val) return null;
    if (k === "exact_score" || k === "score") {
      return Array.isArray(val) ? `${val[0]}–${val[1]}` : `${val.homeGoals}–${val.awayGoals}`;
    }
    if (k === "anytime_goalscorer" || k === "player_card") {
      const roster = k === "anytime_goalscorer" ? scorerPlayers : cardPlayers;
      const player = (roster as any[]).find(([id]) => id === val);
      return player ? player[1] : null;
    }
    if (typeof val === 'string') return val;
    return k;
  }).filter(Boolean);

  const carrying = carryLabels.map(l => ({
    label: l, style: `font-heading font-semibold text-[10.5px] p-[6px_10px] rounded-[7px] md:rounded-[999px] bg-[var(--surface-subtle)] md:bg-[var(--surface-border-strong)] text-[var(--text-secondary)] md:text-[var(--text-primary)]`
  }));

  const activeTargetCount = otherLeagues.filter(t => !t.muted).length;

  const handleExecuteCopy = () => {
    setCopyError(null);
    copyPredictionsMutation.mutate(undefined, {
      onSuccess: (data) => {
        setCopyResult(data);
        setCopy('done');
      },
      onError: () => setCopyError('Could not copy your picks. Try again.')
    });
  };

  const OUTCOME_LABEL: Record<CopyAnswerOutcome, string> = {
    copied: 'Copied', replaced: 'Replaced your previous pick', unchanged: 'Already matched',
    locked: 'Too late — locked', not_enabled: 'Market not enabled there',
    league_closed: 'League closed', changed_elsewhere: 'Changed elsewhere',
    no_longer_member: 'No longer a member', snapshot_unavailable: 'Squad data unavailable',
    player_unavailable: 'Player not available there', line_differs: 'Different goals line there'
  };
  const SUCCESS_OUTCOMES = new Set(['copied', 'replaced', 'unchanged']);

  // Built from the real per-league report the mutation returns -- not from
  // which checkboxes happened to be ticked, since every eligible league is
  // always included regardless of what was shown as "selected."
  const outcomes = (copyResult?.leagues || []).map(l => {
    const ok = l.answers.filter(a => SUCCESS_OUTCOMES.has(a.outcome)).length;
    const allOk = ok === l.answers.length && l.answers.length > 0;
    const firstFailure = l.answers.find(a => !SUCCESS_OUTCOMES.has(a.outcome));
    return {
      league: l.leagueName,
      note: allOk ? `All ${l.answers.length} answers copied.` : `${ok} of ${l.answers.length} copied${firstFailure ? ` — ${OUTCOME_LABEL[firstFailure.outcome]}` : ''}.`,
      icon: allOk ? "✓" : "!",
      rowStyle: `flex gap-[11px] items-start p-[13px_0] border-t border-[var(--surface-border)]`,
      iconStyle: `w-[20px] h-[20px] rounded-full flex-none grid place-items-center font-heading font-bold text-[10.5px] mt-[1px] ${allOk ? 'bg-[var(--color-success)] text-[var(--tf-white)]' : 'bg-[var(--surface-subtle)] text-[var(--text-muted)]'}`
    };
  });

  const tabItem = (label: string, on: boolean) => ({
    label, style: { display: 'flex', alignItems: 'center', padding: '0 13px', height: '43px', font: "600 12.5px 'DM Sans', sans-serif", cursor: 'pointer', borderBottom: `2px solid ${on ? 'var(--color-brand)' : 'transparent'}`, color: on ? 'var(--text-primary)' : 'var(--text-muted)' }
  });

  const currentLeague = leaguesData?.items?.find(l => l.id === leagueId);
  const leagueName = currentLeague?.name || (leaguesData?.items?.[0]?.name) || "League";
  const competitionLabel = currentLeague?.competitions?.[0]?.displayName || "Premier League";

  const props = {
    theme, isLoading, isReady, settled, locked, urgent, clock, HERO: heroData, heroTone,
    answeredTotal, pct, conflict, setResolved, a, setAnswers, markets, lineups,
    carryLabels, setCopy, copy, targets, carrying, outcomes, CLUB,
    leagueName, competitionLabel, fixtureId, leagueId,
    hName, aName, hCode, aCode, hLogo, aLogo,

    // Desktop extra
    contextTabs: [tabItem("Overview", false), tabItem("Fixtures", true), tabItem("Table", false), tabItem("Questions", false), tabItem("More", false)],
    heroStyle: { position: 'relative' as any, overflow: 'hidden', color: 'var(--nav-text)', padding: '22px 0 26px', background: `linear-gradient(103deg, color-mix(in srgb, ${CLUB[hCode] || '#666'} 42%, transparent) 0%, transparent 52%), linear-gradient(257deg, color-mix(in srgb, ${CLUB[aCode] || '#666'} 42%, transparent) 0%, transparent 52%), var(--nav-surface)` },
    homeColor: CLUB[hCode] || '#666', awayColor: CLUB[aCode] || '#666',
    heroKicker: settled ? "PROVISIONAL" : locked ? "LOCKED" : "OPEN",
    heroDotStyle: { width: '8px', height: '8px', borderRadius: '999px', flex: 'none', background: settled ? 'var(--nav-positive)' : locked ? 'var(--nav-text-faint)' : 'var(--nav-warning)' },
    scoreline: settled ? `${ACTUAL.score[0]} — ${ACTUAL.score[1]}` : kickoffTimeLabel,
    scoreSize: settled ? '64px' : '52px',
    kickoffLine: settled ? "FULL TIME" : "KICKOFF",
    bannerLabel: settled ? "Provisional" : locked ? "Kick-off" : "Last market locks in",
    bannerRight: settled ? `+${totalPointsEarned}` : locked ? kickoffTimeLabel : clock,
    bannerText: settled ? "Final once review closes" : locked ? "Nothing can change now" : "Lineups closed 2h before kickoff",
    marketsDone: `${answeredMarkets} of ${enabledStandardKeys.length}`, lineupsDone: `${lineupsSetCount} of ${enabledLineupCount}`,
    pointsLabel: settled ? "Points" : "Max", pointsValue: settled ? `+${totalPointsEarned}` : String(totalPointsAtStake), pointsHeroColor: settled ? "var(--nav-positive)" : "var(--nav-text)",
    pointsAtStake: totalPointsAtStake, pointsEarned: totalPointsEarned,
    marketsHint: editable ? "Each market saves the moment you pick — there is no fixture-level save." : "Editing closed.",
    footNote: settled ? "Provisional scores become final once review closes. If a market is voided it scores nothing for everyone." : "There is no save button on this screen. Each market stores its own answer the moment you pick it, and you can change any of them until it locks.",
    canCopy: editable && activeTargetCount > 0,
    copySub: `${otherLeagues.length} other leagues · ${carryLabels.length} answers ready to carry`,
    showConflict: conflict,
    copyError,
    copyPending: copyPredictionsMutation.isPending,
    copyPrimary: copyPredictionsMutation.isPending ? "Copying…" : activeTargetCount > 0 ? `Copy to ${activeTargetCount} ${activeTargetCount === 1 ? 'league' : 'leagues'}` : "No other leagues",
    copyPrimaryStyle: `mt-[18px] h-[48px] rounded-[13px] grid place-items-center font-heading font-bold text-[13.5px] ${activeTargetCount > 0 && !copyPredictionsMutation.isPending ? 'bg-[var(--brand-fill)] text-[var(--color-on-brand)] cursor-pointer shadow-[var(--elev-glow)]' : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] opacity-70'}`,
    onCopyExecute: handleExecuteCopy
  };

  return (
    <div className="flex flex-col flex-1 h-[100dvh] md:h-auto overflow-hidden bg-[var(--surface-canvas)] relative">
      <div className="md:hidden flex flex-col flex-1 overflow-hidden h-[100dvh]">
        <FixtureMobile {...props} />
      </div>
      <div className="hidden md:flex flex-col flex-1 overflow-hidden h-full">
        <FixtureDesktop {...props} />
      </div>

      {editingLineup && (
        <div className="absolute inset-0 z-50 bg-[var(--surface-canvas)] md:bg-[rgba(0,0,0,0.5)] md:flex md:items-center md:justify-center p-[20px]">
          <div className="bg-[var(--surface-canvas)] w-full max-w-[500px] rounded-[16px] overflow-hidden flex flex-col md:max-h-[80vh]">
            <div className="flex justify-between items-center p-[16px] border-b border-[var(--surface-border)]">
              <div className="font-heading font-bold text-[18px]">{editingLineup === 'home' ? hName : aName} Starting XI</div>
              <button onClick={() => setEditingLineup(null)} className="text-[24px] text-[var(--text-muted)]">×</button>
            </div>
            <div className="p-[16px] overflow-y-auto">
              <LineupPicker
                players={(DEFS.find(d => d.key === `${editingLineup}_lineup`)?.players as any) || []}
                onSave={(lineup) => handleSetLineup(editingLineup, lineup)}
                isSaving={submitLineup.isPending}
                initialSelection={answers[`${editingLineup}_lineup`] || []}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
