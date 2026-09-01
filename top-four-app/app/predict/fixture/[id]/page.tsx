'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { FixtureMobile } from '../../../components/predict/FixtureMobile';
import { FixtureDesktop } from '../../../components/predict/FixtureDesktop';
import { LineupPicker } from '../../../components/predict/LineupPicker';
import { useFixtureData, useSubmitPrediction, useSubmitLineupPrediction, useCopyPredictions } from '@/hooks/api/useFixturePrediction';
import { usePredictionTasks } from '@/hooks/api/usePredictions';
import { useMyLeagues } from '@/hooks/api/useLeagues';

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
  const { data: tasksData } = usePredictionTasks();
  const { data: leaguesData } = useMyLeagues();
  const submitPrediction = useSubmitPrediction(leagueId, fixtureId);
  const submitLineup = useSubmitLineupPrediction(leagueId, fixtureId);
  const copyPredictionsMutation = useCopyPredictions(leagueId, fixtureId);

  // Extract team names and codes from global tasks feed if available
  let hName = "Home Team", aName = "Away Team";
  let hCode = "HOM", aCode = "AWA";
  if (tasksData) {
    for (const t of tasksData.items as any[]) {
      if (t.kind === 'fixture' && (t.fixtureId === fixtureId || t.leagueFixtureId === fixtureId)) {
        hName = t.homeTeam.displayName;
        aName = t.awayTeam.displayName;
        hCode = hName.substring(0, 3).toUpperCase();
        aCode = aName.substring(0, 3).toUpperCase();
        break;
      }
    }
  }

  // Derive player options dynamically from selectablePlayers API
  const homePlayersList = useMemo(() => {
    if (!selectablePlayers?.players) return [];
    return selectablePlayers.players.filter(p => p.teamSide === 'home');
  }, [selectablePlayers]);

  const awayPlayersList = useMemo(() => {
    if (!selectablePlayers?.players) return [];
    return selectablePlayers.players.filter(p => p.teamSide === 'away');
  }, [selectablePlayers]);

  const scorerPlayers = useMemo(() => {
    if (!selectablePlayers?.players || selectablePlayers.players.length === 0) {
      return [];
    }
    return selectablePlayers.players.map(p => {
      const code = p.teamSide === 'home' ? hCode : aCode;
      const initials = p.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      return [p.id, p.displayName, `${code} ${p.shirtNumber || ''}`, initials];
    });
  }, [selectablePlayers, hCode, aCode]);

  const cardPlayers = scorerPlayers;

  const homeLineupRoster = useMemo(() => {
    return homePlayersList.map(p => ({
      id: p.id,
      displayName: p.displayName,
      position: p.position || undefined,
      shirtNumber: p.shirtNumber || undefined
    }));
  }, [homePlayersList]);

  const awayLineupRoster = useMemo(() => {
    return awayPlayersList.map(p => ({
      id: p.id,
      displayName: p.displayName,
      position: p.position || undefined,
      shirtNumber: p.shirtNumber || undefined
    }));
  }, [awayPlayersList]);

  const DEFS = useMemo(() => [
    { key: "match_result", name: "Match result", pts: "2 pts", kind: "tiles", options: [["home", hName, "win"], ["draw", "Draw", ""], ["away", aName, "win"]] },
    { key: "exact_score", name: "Exact score", pts: "5 pts", kind: "score" },
    { key: "both_teams_to_score", name: "Both teams to score", pts: "1 pt", kind: "tiles", options: [["yes", "Yes", ""], ["no", "No", ""]] },
    { key: "total_goals", name: "Total goals", pts: "1 pt", kind: "tiles", options: [["over", "Over 2.5", ""], ["under", "Under 2.5", ""]] },
    { key: "anytime_goalscorer", name: "Anytime goalscorer", pts: "5 pts", kind: "players", players: scorerPlayers },
    { key: "player_card", name: "Player to be carded", pts: "4 pts", kind: "players", players: cardPlayers },
    { key: "home_lineup", name: `${hName} Starting XI`, pts: "11 pts", kind: "lineup", side: "home", players: homeLineupRoster },
    { key: "away_lineup", name: `${aName} Starting XI`, pts: "11 pts", kind: "lineup", side: "away", players: awayLineupRoster }
  ], [hName, aName, scorerPlayers, cardPlayers, homeLineupRoster, awayLineupRoster]);

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [state, setState] = useState<'open' | 'urgent' | 'locked' | 'settled' | 'conflict' | 'loading'>('open');
  const [history, setHistory] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);
  const [copy, setCopy] = useState<'idle' | 'done' | null>(null);
  const [copyTargets, setCopyTargets] = useState<Record<string, boolean>>({});
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [editingLineup, setEditingLineup] = useState<'home' | 'away' | null>(null);
  const [seconds, setSeconds] = useState(8115);

  const ACTUAL: Record<string, any> = { score: results?.score ? [results.score.home, results.score.away] : [0, 0] };
  const OUTCOME: Record<string, string> = {};
  const EARNED: Record<string, string> = {};
  if (results?.markets) {
    for (const [k, v] of Object.entries(results.markets)) {
      OUTCOME[k] = v.status;
      EARNED[k] = v.pointsAwarded > 0 ? `+${v.pointsAwarded}` : '0';
    }
  }
  const EDITS: Record<string, string[][]> = {};

  const isLoading = dataLoading || state === 'loading';
  const isReady = !isLoading && !isError;
  const isLocked = state === "locked" || (availability && availability.availability.status === 'LOCKED');
  const isSettled = state === "settled" || (availability && availability.availability.status === 'SETTLED');
  const urgent = state === "urgent";

  useEffect(() => {
    if (predictions?.markets) {
      const initial: Record<string, any> = {};
      for (const key in predictions.markets) {
        initial[key] = predictions.markets[key].answer;
      }
      setAnswers(initial);
    }
  }, [predictions]);

  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => s > 0 ? s - 1 : 0), 1000);
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

  const handleSet = (key: string, value: any, editable: boolean) => {
    if (!editable || isLocked || isSettled) return;
    setAnswers(prev => ({ ...prev, [key]: value }));

    if (leagueId && predictions) {
      const expectedVersion = predictions.markets[key]?.version || 0;
      submitPrediction.mutate({ marketType: key, expectedVersion, answer: value });
    }
    showReceipt(key);
  };

  const handleBump = (i: number, d: number, editable: boolean) => {
    if (!editable) return;
    const sc = (answers.exact_score || answers.score || [0, 0]).slice();
    sc[i] = Math.max(0, Math.min(9, sc[i] + d));
    setAnswers(prev => ({ ...prev, exact_score: sc, score: sc }));
    if (leagueId && predictions) {
      const expectedVersion = predictions.markets['exact_score']?.version || 0;
      submitPrediction.mutate({ marketType: 'exact_score', expectedVersion, answer: { homeGoals: sc[0], awayGoals: sc[1] } });
    }
    showReceipt("score");
  };

  const handleSetLineup = (side: 'home' | 'away', lineup: string[]) => {
    setAnswers(prev => ({ ...prev, [`${side}_lineup`]: lineup }));
    if (leagueId && predictions) {
      const expectedVersion = predictions.markets[`${side}_lineup`]?.version || 0;
      submitLineup.mutate({ side, expectedVersion, lineup });
    }
    setEditingLineup(null);
    showReceipt(`${side}_lineup`);
  };

  const st = state;
  const locked = st === "locked", settled = st === "settled";
  const conflict = st === "conflict" && !resolved;
  const editable = isReady && !locked && !settled;
  const clock = fmt(urgent ? Math.min(seconds, 842) : seconds);

  const a = conflict ? { ...answers, match_result: "draw" } : answers;

  const heroTone = urgent ? "var(--color-danger)" : settled ? "var(--state-provisional)" : locked ? "var(--nav-text-faint)" : "var(--nav-accent)";
  const MARKET_KEYS = ["match_result", "exact_score", "both_teams_to_score", "total_goals", "anytime_goalscorer", "player_card"];
  const answeredMarkets = MARKET_KEYS.filter(k => a[k] !== null && a[k] !== undefined).length;
  const answeredTotal = answeredMarkets + 1;
  const pct = Math.round((answeredTotal / 8) * 100);

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

  const markets = DEFS.map((d, i) => {
    const mine = a[d.key];
    const out = OUTCOME[d.key];
    const edits = EDITS[d.key] || [];
    const histOpen = history === d.key;
    const unanswered = mine === null || mine === undefined;

    let right, rightStyle;
    if (settled) {
      const tone = out === "hit" ? "var(--prediction-correct)" : "var(--text-muted)";
      right = EARNED[d.key] || "0";
      rightStyle = `font-heading font-bold text-[17px] tracking-[-0.4px] flex-none tf-num text-[${tone}]`;
    } else if (locked) {
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
      blockStyle: `p-[15px_var(--gutter)] border-t border-[var(--surface-border)] ${i === DEFS.length - 1 ? 'border-b' : ''} ${(!settled && !locked && unanswered) ? 'bg-[var(--accent-surface)] shadow-[inset_3px_0_0_0_var(--color-brand)]' : ''}`,
      cardStyle: `border-top: 1px solid var(--surface-border); ${!editable ? 'opacity: .96;' : ''} ${editable && unanswered ? 'background: var(--accent-surface); box-shadow: inset 3px 0 0 0 var(--color-brand);' : ''}`,
      historyLink: edits.length ? (histOpen ? "HIDE EDITS" : `EDITED ${edits.length}×`) : "Never changed",
      historyStyle: edits.length ? `font-heading font-bold text-[9.5px] tracking-[0.05em] text-[var(--text-link)] cursor-pointer` : "hidden",
      historyLinkStyle: `flex-none font-heading font-semibold text-[10.5px] ${edits.length ? 'color-[var(--text-link)] cursor-pointer' : 'text-[var(--text-muted)]'}`,
      showHistory: histOpen && edits.length > 0,
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
      footStyle: `flex items-center min-h-[20px] mt-[10px] ${(!edits.length && saved !== d.key) ? 'hidden' : ''}`,
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
        : locked ? (vStr ? `Locked at ${vStr}` : "Nothing was ever saved here.")
          : vStr ? `${hName} ${Array.isArray(v) ? v[0] : v?.homeGoals} · ${aName} ${Array.isArray(v) ? v[1] : v?.awayGoals}` : "Untouched — an exact score is not assumed to be 0–0.";
      const scoreHit = settled && v && ((Array.isArray(v) && v[0] === ACTUAL.score[0] && v[1] === ACTUAL.score[1]) || (!Array.isArray(v) && v.homeGoals === ACTUAL.score[0] && v.awayGoals === ACTUAL.score[1]));
      m.scoreNoteStyle = `text-[10.5px] md:text-[12.5px] leading-[1.5] mt-[9px] md:mt-[5px] ${scoreHit ? 'text-[var(--success-text)]' : (settled || (locked && !v)) ? 'text-[var(--danger-text)]' : 'text-[var(--text-muted)]'}`;
    }

    if (d.kind === "players") {
      const shown = (settled || locked) ? ((d.players as any[]) || []).filter(([id]) => id === mine) : ((d.players as any[]) || []);
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
    }

    if (d.key === "exact_score" || d.key === "score") {
      const sc = a.exact_score || a.score;
      (m as any).answer = sc ? (Array.isArray(sc) ? `${sc[0]} — ${sc[1]}` : `${sc.homeGoals} — ${sc.awayGoals}`) : (locked ? "Nothing was ever saved here" : "Untouched — an exact score is not assumed to be 0–0");
    } else {
      (m as any).answer = a[d.key] ? (typeof a[d.key] === 'string' ? a[d.key] : JSON.stringify(a[d.key])) : (locked ? "Not answered — no points from this one" : "Not answered");
    }
    (m as any).answerStyle = a[d.key] ? "font-size: 12.5px; color: var(--text-secondary); margin-top: 5px;" : "font-size: 12.5px; color: var(--text-muted); font-style: italic; margin-top: 5px;";

    let chipText = settled ? (out === "review" ? "In review" : out === "void" ? "Void" : "Provisional") : locked ? "Locked" : "Open";
    let chipBase = "font: 600 10px 'DM Sans', sans-serif; letter-spacing: .03em; padding: 3px 9px; border-radius: 999px; white-space: nowrap; ";
    let chipSpec = settled ? (out === "review" ? "border: 1px solid var(--surface-border-strong); color: var(--text-secondary);" : out === "void" ? "border: 1px solid var(--surface-border-strong); color: var(--text-muted);" : "background: var(--state-provisional); color: var(--nav-on-accent);") : locked ? "background: var(--state-locked); color: var(--color-on-brand);" : "background: var(--surface-subtle); color: var(--text-secondary);";
    (m as any).chipStyle = chipBase + chipSpec;
    (m as any).chip = chipText;
    (m as any).outcomeWrapStyle = `display: flex; flex-direction: column; align-items: flex-end; gap: 6px; padding-top: 3px; justify-self: end; width: ${settled ? '150px' : '86px'}`;
    (m as any).lockLine = settled ? "Settled" : locked ? "Locked at kick-off" : `Locks at kickoff · ${clock}`;
    (m as any).historyNote = "Only the top line counted. Earlier answers are kept so a score can be checked, never re-scored.";

    return m;
  });

  const lineups = [
    { code: hCode, color: CLUB[hCode] || '#666', name: `${hName} lineup`, set: !!answers.home_lineup, side: 'home' as const },
    { code: aCode, color: CLUB[aCode] || '#666', name: `${aName} lineup`, set: !!answers.away_lineup, side: 'away' as const }
  ].map((l, i, arr) => {
    let sub, right, rightTone;
    if (settled) { sub = l.set ? "Lineup settled" : "Not set — no points from this one"; right = l.set ? "+11" : "0"; rightTone = l.set ? "var(--prediction-correct)" : "var(--text-muted)"; }
    else if (locked) { sub = l.set ? "11 named · locked" : "Not set — this one closed"; right = l.set ? "VIEW" : "MISSED"; rightTone = l.set ? "var(--text-muted)" : "var(--danger-text)"; }
    else { sub = l.set ? "11 named · you can still change it" : "Nothing named yet"; right = l.set ? "EDIT →" : "PICK →"; rightTone = l.set ? "var(--text-link)" : "var(--accent-text-strong)"; }
    return {
      code: l.code, color: l.color, name: l.name, sub, crest: l.code, points: "1 pt × 11",
      subStyle: `text-[10.5px] mt-[3px] ${l.set ? 'text-[var(--text-muted)]' : (settled || locked) ? 'text-[var(--danger-text)]' : 'text-[var(--text-secondary)]'}`,
      right,
      rightStyle: `${settled ? 'font-heading font-bold text-[17px] tracking-[-0.4px] tf-num' : 'font-heading font-bold text-[9.5px] tracking-[0.05em]'} flex-none text-[${rightTone}]`,
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
  const heroData = HERO[isReady ? st : "open"] || HERO.open;

  // Derive other leagues containing this fixture from user's active leagues
  const otherLeagues = useMemo(() => {
    if (!leaguesData?.items) return [];
    return leaguesData.items.filter(l => l.id !== leagueId).map(l => ({
      id: l.id,
      league: l.name,
      note: `Same match · all markets`,
      flag: "",
      muted: l.lifecycleState === 'archived' || l.lifecycleState === 'cancelled'
    }));
  }, [leaguesData, leagueId]);

  const targets = otherLeagues.map(t => {
    const on = !t.muted && !!copyTargets[t.id];
    return {
      league: t.league, note: t.note,
      cardStyle: `flex gap-[12px] items-start p-[13px_14px] md:p-[14px_16px] rounded-[13px] ${on ? 'bg-[var(--accent-surface)] md:bg-[var(--surface-card)] border border-[var(--color-brand)] md:border-[var(--control-ring)] md:border-solid md:border-[var(--color-brand)]' : 'bg-[var(--surface-canvas)] md:bg-[var(--surface-card)] border border-[var(--surface-border)]'} ${t.muted ? 'opacity-55' : 'cursor-pointer'}`,
      boxStyle: `w-[21px] h-[21px] rounded-[6px] md:rounded-[7px] flex-none mt-[1px] grid place-items-center text-[11px] text-[var(--color-on-brand)] ${on ? 'bg-[var(--color-brand)]' : 'border border-[var(--surface-border-strong)]'}`,
      check: on ? "✓" : "",
      hasFlag: !!t.flag, flag: t.flag,
      flagStyle: `inline-block font-heading font-semibold text-[10px] md:text-[10.5px] p-[3px_9px] rounded-[999px] mt-[7px] bg-[var(--surface-subtle)] text-[var(--text-muted)]`,
      toggle: () => { if (!t.muted) setCopyTargets(s => ({ ...s, [t.id]: !s[t.id] })); }
    };
  });

  const carryLabels = MARKET_KEYS.map(k => {
    const val = a[k];
    if (!val) return null;
    if (k === "exact_score" || k === "score") {
      return Array.isArray(val) ? `${val[0]}–${val[1]}` : `${val.homeGoals}–${val.awayGoals}`;
    }
    if (typeof val === 'string') return val;
    return k;
  }).filter(Boolean);

  const carrying = carryLabels.map(l => ({
    label: l, style: `font-heading font-semibold text-[10.5px] p-[6px_10px] rounded-[7px] md:rounded-[999px] bg-[var(--surface-subtle)] md:bg-[var(--surface-border-strong)] text-[var(--text-secondary)] md:text-[var(--text-primary)]`
  }));

  const chosen = otherLeagues.filter(t => copyTargets[t.id]).length;

  const handleExecuteCopy = () => {
    copyPredictionsMutation.mutate(undefined, {
      onSuccess: () => {
        setCopy('done');
      }
    });
  };

  const outcomes = otherLeagues.filter(t => copyTargets[t.id]).map(t => ({
    league: t.league,
    note: `All ${carryLabels.length} answers copied.`,
    icon: "✓",
    rowStyle: `flex gap-[11px] items-start p-[13px_0] border-t border-[var(--surface-border)]`,
    iconStyle: `w-[20px] h-[20px] rounded-full flex-none grid place-items-center font-heading font-bold text-[10.5px] mt-[1px] bg-[var(--color-success)] text-[var(--tf-white)]`
  }));

  const tabItem = (label: string, on: boolean) => ({
    label, style: { display: 'flex', alignItems: 'center', padding: '0 13px', height: '43px', font: "600 12.5px 'DM Sans', sans-serif", cursor: 'pointer', borderBottom: `2px solid ${on ? 'var(--color-brand)' : 'transparent'}`, color: on ? 'var(--text-primary)' : 'var(--text-muted)' }
  });

  const currentLeague = leaguesData?.items?.find(l => l.id === leagueId);
  const leagueName = currentLeague?.name || (leaguesData?.items?.[0]?.name) || "League";
  const competitionLabel = currentLeague?.competitions?.[0]?.displayName || "Premier League";

  const props = {
    theme, isLoading, isReady, settled, locked, urgent, clock, HERO: heroData, heroTone,
    answeredTotal, pct, conflict, setResolved, a, setAnswers, markets, lineups,
    carryLabels, setCopy, copy, targets, carrying, chosen, outcomes, CLUB,
    leagueName, competitionLabel,

    // Desktop extra
    contextTabs: [tabItem("Overview", false), tabItem("Fixtures", true), tabItem("Table", false), tabItem("Questions", false), tabItem("More", false)],
    heroStyle: { position: 'relative' as any, overflow: 'hidden', color: 'var(--nav-text)', padding: '22px 0 26px', background: `linear-gradient(103deg, color-mix(in srgb, ${CLUB[hCode] || '#666'} 42%, transparent) 0%, transparent 52%), linear-gradient(257deg, color-mix(in srgb, ${CLUB[aCode] || '#666'} 42%, transparent) 0%, transparent 52%), var(--nav-surface)` },
    homeColor: CLUB[hCode] || '#666', awayColor: CLUB[aCode] || '#666',
    heroKicker: settled ? "PROVISIONAL" : locked ? "LOCKED" : "OPEN",
    heroDotStyle: { width: '8px', height: '8px', borderRadius: '999px', flex: 'none', background: settled ? 'var(--nav-positive)' : locked ? 'var(--nav-text-faint)' : 'var(--nav-warning)' },
    scoreline: settled ? `${ACTUAL.score[0]} — ${ACTUAL.score[1]}` : "15:00",
    scoreSize: settled ? '64px' : '52px',
    kickoffLine: settled ? "FULL TIME" : "KICKOFF",
    bannerLabel: settled ? "Provisional" : locked ? "Kick-off" : "Last market locks in",
    bannerRight: settled ? (results?.markets ? `+${Object.values(results.markets).reduce((sum, m) => sum + (m.pointsAwarded || 0), 0)}` : "+0") : locked ? "15:00" : clock,
    bannerText: settled ? "Final once review closes" : locked ? "Nothing can change now" : "Lineups closed 2h before kickoff",
    marketsDone: `${answeredTotal} of 6`, lineupsDone: "1 of 2",
    pointsLabel: settled ? "Points" : "Max", pointsValue: settled ? (results?.markets ? `+${Object.values(results.markets).reduce((sum, m) => sum + (m.pointsAwarded || 0), 0)}` : "+0") : "18", pointsHeroColor: settled ? "var(--nav-positive)" : "var(--nav-text)",
    marketsHint: editable ? "Each market saves the moment you pick — there is no fixture-level save." : "Editing closed.",
    footNote: settled ? "Provisional scores become final once review closes. If a market is voided it scores nothing for everyone." : "There is no save button on this screen. Each market stores its own answer the moment you pick it, and you can change any of them until it locks.",
    canCopy: editable && otherLeagues.length > 0,
    copySub: `${otherLeagues.length} other leagues · ${carryLabels.length} answers ready to carry`,
    showConflict: conflict,
    copyPrimary: chosen ? `Copy into ${chosen} ${chosen === 1 ? 'league' : 'leagues'}` : "Pick a league",
    copyPrimaryStyle: `mt-[18px] h-[48px] rounded-[13px] grid place-items-center font-heading font-bold text-[13.5px] ${chosen ? 'bg-[var(--brand-fill)] text-[var(--color-on-brand)] cursor-pointer shadow-[var(--elev-glow)]' : 'bg-[var(--surface-subtle)] text-[var(--text-muted)]'}`,
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
