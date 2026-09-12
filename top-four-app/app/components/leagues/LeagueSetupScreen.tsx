'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Breadcrumb } from '../Breadcrumb';
import { useCreateLeague, usePublishLeague } from '@/hooks/api/useLeagues';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api/fetcher';
import {
  buildCreatePayload, summariseSpan, LOCK_PRESETS, MARKET_PRESETS,
  type CompetitionChoice, type LockKind, type MarketType,
  type LeagueDraft, type MarketPreset, type ScopeSelection, type SetupCompetition,
} from '@/lib/leagues/league-setup';

const BRAND = "var(--color-brand)";




const MARKETS = MARKET_PRESETS;
const LOCKS = LOCK_PRESETS;

const LINES = ["0.5", "1.5", "2.5", "3.5", "4.5", "5.5", "6.5", "7.5", "8.5", "9.5", "10.5", "11.5"];

/**
 * The league setup wizard.
 *
 * Everything it needs about the catalogue arrives already shaped, with the
 * stage and round ids intact — the version this replaces walked the catalogue
 * in the browser and kept only a round count, so a league could never actually
 * be scoped to the rounds its creator picked.
 */
export function LeagueSetupScreen({ competitions, placesUsed, placesLimit }: {
  competitions: SetupCompetition[];
  /** Unfinished leagues against the cap, for the step-one hero. */
  placesUsed: number;
  placesLimit: number;
}) {
  const router = useRouter();
  const createLeague = useCreateLeague();
  const publishLeague = usePublishLeague();
  const publishingRef = useRef(false); // double-tap guard

  const [step, setStep] = useState('1');
  const [createdLeagueId, setCreatedLeagueId] = useState<string | null>(null);
  const [createdLeagueName, setCreatedLeagueName] = useState<string>('');
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [copyToast, setCopyToast] = useState(false);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [sheet, setSheet] = useState<string | null>(null);
  // Nothing is pre-selected: the prototype seeded 'epl' and 'ucl', which are not
  // slugs any competition actually has, so those picks never applied to anything.
  const [compsState, setCompsState] = useState<Record<string, ScopeSelection>>({});
  const [bounds, setBounds] = useState<Record<string, { a?: number, z?: number }>>({});
  const [points, setPoints] = useState<Partial<Record<MarketType, number>>>({});
  // All seven markets on, which is what the server defaults to.
  const [off, setOff] = useState<Partial<Record<MarketType, boolean>>>({});
  const [line, setLine] = useState("2.5");
  const [lock, setLock] = useState<LockKind>("minutes_5");
  const [lateJoin, setLateJoin] = useState("open");
  const [approval, setApproval] = useState(true);
  const [tieOrder, setTieOrder] = useState<MarketType[]>(
    ["exact_score", "lineup", "anytime_goalscorer", "match_result"],
  );

  const ds: 'ready' | 'empty' = competitions.length > 0 ? 'ready' : 'empty';

  const pts = (m: MarketPreset) => points[m.marketType] ?? m.points;
  const on = (m: MarketPreset) => !off[m.marketType];
  const bump = (m: any, d: number) => {
    const v = Math.min(50, Math.max(1, pts(m) + d));
    setPoints(s => ({ ...s, [m.id]: v }));
  };

  const tapRound = (id: string, scope: string, i: number) => {
    const cur = bounds[id] || {};
    let next;
    if (scope === "round") next = { a: i };
    else if (cur.a == null || cur.z != null) next = { a: i };
    else if (i <= cur.a) next = cur;
    else next = { a: cur.a, z: i };
    setBounds(s => ({ ...s, [id]: next }));
  };

  const enabled = MARKETS.filter(m => on(m));
  const totals = enabled.map(m => ({ m, total: pts(m) * (m.perPlayer ? 22 : 1) }));
  const maxPoints = totals.reduce((a, t) => a + t.total, 0);
  const biggest = totals.slice().sort((a, b) => b.total - a.total)[0];
  const share = biggest && maxPoints ? biggest.total / maxPoints : 0;

  const comps = competitions.map(c => {
    const sel = compsState[c.id];
    const rs = c.rounds;
    const b = bounds[c.id] || {};
    const a = b.a;
    const z = b.z;
    const picking = sel === "range" && a != null && z == null;
    const summary = sel ? summariseSpan(c, { selection: sel, from: a, to: z }) : null;
    const done = !!summary?.complete;
    const from = sel === "season" ? 0 : a || 0;
    const to = sel === "season" ? rs.length - 1 : sel === "round" ? a || 0 : z || 0;

    const span = !done ? ""
      : sel === "season" ? "Every round · " + rs.length + " of them"
        : sel === "round" ? rs[from].full
          : rs[from].full + " → " + rs[to].full + " · " + (to - from + 1) + " rounds";

    return {
      id: c.id, abbr: c.abbr, name: c.name, on: !!sel, done, roundCount: summary?.roundCount ?? 0,
      supportedCompetitionId: c.supportedCompetitionId,
      seasonId: c.seasonId,
      short: !done ? "unfinished" : sel === "season" ? "full season"
        : sel === "round" ? rs[from].full
          : rs[from].full + "–" + rs[to].full,
      meta: !sel ? rs.length + " rounds available"
        : !done ? (sel === 'round' ? 'One round' : sel === 'range' ? 'Round range' : 'Full season') + " · nothing picked yet"
          : sel === "season" ? "Full season · " + rs.length + " rounds"
            : sel === "round" ? rs[from].full
              : rs[from].full + " → " + rs[to].full + " · " + (to - from + 1) + " rounds",
      metaStyle: "text-[10.5px] mt-[3px] " + (sel && !done ? "font-semibold text-[var(--warn-text)]" : "text-[var(--text-muted)]"),
      blockStyle: "p-[14px_var(--gutter)] border-t border-[var(--surface-border)] " +
        (sel ? "bg-[var(--accent-surface)] shadow-[inset_3px_0_0_0_var(--color-brand)]" : ""),
      crestStyle: "w-[34px] h-[34px] rounded-[10px] flex-none grid place-items-center font-heading font-bold text-[10.5px] bg-[var(--surface-subtle)] text-[var(--text-secondary)]",
      check: sel ? "✓" : "",
      checkStyle: "w-[22px] h-[22px] rounded-full flex-none grid place-items-center text-[11px] text-[var(--color-on-brand)] " +
        (sel ? "bg-[var(--color-brand)]" : "border-[1.5px] border-[var(--surface-border-strong)]"),
      toggle: () => {
        const next = { ...compsState };
        if (next[c.id]) delete next[c.id]; else next[c.id] = "season";
        setCompsState(next);
      },
      scopes: ["round", "range", "season"].map(id => ({
        label: id === 'round' ? 'One round' : id === 'range' ? 'Round range' : 'Full season',
        on: sel === id,
        pick: () => setCompsState(s => ({ ...s, [c.id]: id as ScopeSelection }))
      })),
      scopeNote: sel === "round" ? "One round only. The league finishes when it settles."
        : sel === "range" ? "A block of rounds. It may cross stages, but only forwards."
          : "Every round in the season, including ones not yet scheduled.",
      pickRounds: sel === "round" || sel === "range",
      railKicker: sel === "round" ? (done ? "THE ROUND" : "PICK THE ROUND")
        : picking ? "NOW PICK THE LAST ROUND" : done ? "THE RANGE" : "PICK THE FIRST ROUND",
      railKickerStyle: "text-[" + (done ? "var(--text-muted)" : "var(--warn-text)") + "]",
      spanText: done ? span : picking ? rs[from].full + " → …" : "Nothing picked yet",
      spanStyle: "font-heading font-bold text-[13.5px] leading-[1.3] tracking-[-0.3px] mt-[6px] " +
        (done ? "" : "text-[var(--text-muted)]"),
      showRailAction: sel === "range" && a != null,
      railAction: () => {
        const next = { ...bounds }; delete next[c.id]; setBounds(next);
      },
      groups: c.stages.map(st => ({
        named: c.stages.length > 1, name: st.name,
        rounds: rs.map((r, i) => ({ r, i })).filter(x => x.r.stageId === st.id).map(x => {
          const end = x.i === a || (sel === "range" && x.i === z);
          const mid = sel === "range" && done && a != null && z != null && x.i > a && x.i < z;
          const off = picking && a != null && x.i <= a;
          const kind = end ? "end" : mid ? "mid" : off ? "off" : "open";

          let roundChipStyle = "box-border min-w-[36px] h-[31px] px-[9px] rounded-[8px] grid place-items-center font-heading font-bold text-[11px] whitespace-nowrap ";
          if (kind === "end") roundChipStyle += "bg-[var(--text-primary)] text-[var(--surface-canvas)] cursor-pointer";
          else if (kind === "mid") roundChipStyle += "bg-[color-mix(in_srgb,var(--color-brand)_26%,var(--surface-canvas))] text-[var(--text-primary)] cursor-pointer";
          else if (kind === "off") roundChipStyle += "border border-dashed border-[var(--surface-border)] text-[var(--text-muted)] opacity-50";
          else roundChipStyle += "border border-[var(--surface-border-strong)] bg-[var(--surface-canvas)] text-[var(--text-secondary)] cursor-pointer";

          return {
            label: x.r.label,
            style: roundChipStyle,
            pick: () => { if (!off) tapRound(c.id, sel, x.i); }
          };
        })
      }))
    };
  });

  const selectedComps = comps.filter(c => c.on);
  // Rounds, not fixtures: the catalogue publishes no fixture count.
  const totalRounds = selectedComps.reduce((t, c) => t + c.roundCount, 0);
  const scopesDone = selectedComps.every(c => c.done);
  const canNext = step === "1" ? true
    : step === "2" ? selectedComps.length > 0 && scopesDone
      : step === "3" ? maxPoints > 0
        : true;

  const backFor: any = { "2": "1", "3": "2", "4": "3", "5": "4", "done": "1" };
  const nextFor: any = { "1": "2", "2": "3", "3": "4", "4": "5" };

  const weightBar = totals.map(t => ({ style: "flex-grow: " + t.total + "; background: " + t.m.colour + "; min-width: 3px;" }));
  const weightKeys = totals.map(t => ({
    label: (t.m.perPlayer ? "Lineups" : t.m.name === "Both teams to score" ? "BTTS" : t.m.name) + " " + t.total,
    dotStyle: "w-[7px] h-[7px] rounded-[2px] flex-none bg-[" + t.m.colour + "]"
  }));

  const compSummary = selectedComps.map(c => c.abbr + " " + c.short).join(" · ");
  const lockRow = LOCKS.find(l => l.kind === lock) ?? LOCKS[1];
  const lockValue = lockRow.label === "Custom" ? "90 min before kick-off" : lockRow.label === "Kick-off" ? "At kick-off" : lockRow.label + " before kick-off";

  const editable = [
    { label: "League name", value: name || "New league" },
    { label: "Description", value: description || "None" }
  ];

  const frozen = [
    { label: "Competitions", value: compSummary },
    { label: "Rounds", value: String(totalRounds) },
    { label: "Max per match", value: maxPoints + " pts" },
    { label: "Deadlines", value: lockValue },
    { label: "Late joining", value: lateJoin === "open" ? "Allowed" : "Closed at kick-off" },
    { label: "Tiebreakers", value: String(tieOrder.length) + " rules" }
  ];

  const HERO: Record<string, string[]> = {
    // The design states the cap on step one, before any effort is spent: a
    // member already at twenty cannot make this league, and finding that out
    // after five steps is the worst place to find it out.
    "1": [
      String(placesUsed),
      `of ${placesLimit} unfinished leagues`,
      placesUsed >= placesLimit
        ? 'No places left. Finish or leave one to make room.'
        : 'A draft counts. Finished ones give the place back.',
      placesUsed >= placesLimit ? 'var(--danger-text)' : 'var(--nav-text)',
    ],
    "2": [String(totalRounds), "rounds included", "across " + selectedComps.length + " comps", "var(--nav-text)"],
    "3": [String(maxPoints), "pts per match", enabled.length + " markets", "var(--nav-text)"],
    "4": [String(tieOrder.length), "tiebreakers", "lineups always 2h", "var(--nav-text)"],
    "5": [String(totalRounds), "rounds total", compSummary, "var(--nav-text)"]
  };

  const currentHero = HERO[step];

  /** Each step and what it has decided so far. */
  const STEP_TRAIL: Array<{ id: string; label: string; value: string }> = [
    { id: '1', label: 'Name', value: name || 'Not named yet' },
    { id: '2', label: 'Competitions', value: compSummary || 'None chosen' },
    { id: '3', label: 'Points', value: `${enabled.length} markets · max ${maxPoints}` },
    { id: '4', label: 'Rules', value: `${lockValue} · ${tieOrder.length} tiebreakers` },
    { id: '5', label: 'Review', value: `${totalRounds} rounds` },
  ];

  return (
    <div className="flex flex-col flex-1 bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif]">
      <Breadcrumb trail={[{ label: 'Leagues', href: '/leagues' }, { label: 'New league' }]} />

      {/* App Container */}
      <div className="flex flex-col flex-1 w-full max-w-[1080px] mx-auto overflow-hidden relative">

        <header className="flex-none space-y-5 text-[var(--nav-text)] p-[8px_var(--gutter)_14px]">
          <div className="flex items-center gap-[11px]">
            <button type="button" onClick={() => { const b = backFor[step]; if (b) { setStep(b); setSheet(null); } }} className={`w-[40px] h-[40px] rounded-full border border-[var(--nav-border)] grid place-items-center text-[15px] flex-none text-[var(--nav-text-quiet)] cursor-pointer ${step === '1' || step === 'done' ? 'opacity-35' : ''}`}>
              ‹
            </button>
            <div className="min-w-0 flex-1">
              <div className="font-heading font-[650] text-[16px] leading-[1.1] tracking-[-0.3px] whitespace-nowrap overflow-hidden text-ellipsis">{step === 'done' ? name : 'New league'}</div>
              <div className="text-[10.5px] text-[var(--nav-text-faint)] mt-[4px]">{step === 'done' ? 'Published just now' : `Step ${step} of 5 · ${{ '1': 'Name', '2': 'Competitions', '3': 'Points', '4': 'Rules', '5': 'Review' }[step] || ''}`}</div>
            </div>
            <button type="button" 
              onClick={() => {
                if (step === 'done' && createdLeagueId) {
                  router.push(`/leagues/${createdLeagueId}`);
                }
              }}
              className={`h-[32px] px-[12px] rounded-[8px] grid place-items-center flex-none font-heading font-bold text-[10px] tracking-[0.06em] uppercase ${step === 'done' ? 'bg-[var(--nav-accent)] text-[var(--nav-on-accent)] cursor-pointer' : 'border border-[var(--nav-border)] text-[var(--nav-text-quiet)] cursor-pointer'}`}>
              {step === 'done' ? 'MANAGE' : 'SAVE'}
            </button>
          </div>

          {step !== 'done' && currentHero && (
            <div className="mt-[16px]">
              <div className="flex items-end gap-[11px]">
                <div className="tf-num font-heading font-bold text-[40px] leading-[0.88] tracking-[-1.8px]" style={{ color: currentHero[3] }}>{currentHero[0]}</div>
                <div className="pb-[5px] min-w-0">
                  <div className="text-[11.5px] leading-[1.35]">{currentHero[1]}</div>
                  <div className="text-[10.5px] text-[var(--nav-text-faint)] mt-[3px]">{currentHero[2]}</div>
                </div>
              </div>

              {step === '3' && (
                <div>
                  <div className="flex h-[9px] rounded-full overflow-hidden gap-[2px] mt-[15px] bg-white/10">
                    {weightBar.map((w, i) => <div key={i} style={{ flexGrow: w.style.split('flex-grow: ')[1]?.split(';')[0] || 1, background: w.style.split('background: ')[1]?.split(';')[0] || 'black', minWidth: '3px' }}></div>)}
                  </div>
                  <div className="flex flex-wrap gap-[5px_11px] mt-[11px]">
                    {weightKeys.map((k, i) => (
                      <div key={i} className="flex items-center gap-[5px]">
                        <span className={k.dotStyle}></span>
                        <span className="tf-num text-[10px] text-[var(--nav-text-quiet)]">{k.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-[4px] mt-[16px]">
            {['1', '2', '3', '4', '5'].map((s, i) => {
              const num = parseInt(step);
              let w = 'flex-1';
              if (step === 'done') w = 'flex-1';
              else if (num === i + 1) w = 'w-[40%] flex-none';
              else if (i + 1 < num) w = 'w-[8px] flex-none';
              else w = 'flex-1 min-w-[4px]';

              return (
                <button type="button"
                  key={s}
                  onClick={() => setStep(s as any)}
                  className={`h-[4px] rounded-full cursor-pointer transition-all duration-300 ${w} ${(step === 'done' || parseInt(step) >= i + 1) ? 'bg-[var(--nav-accent)]' : 'bg-white/15'}`}
                ></button>
              );
            })}
          </div>
        </header>

        {/* Three columns at width. A wizard that shows one step at a time is a
            phone's answer to a small screen; on a screen whose output is frozen
            forever at publication, hiding what the earlier steps decided is the
            wrong trade. */}
        <main className="tf-scroll flex-1 min-h-0 overflow-auto bg-[var(--surface-canvas)] md:grid md:grid-cols-[220px_minmax(0,1fr)_280px] md:gap-[28px] md:px-[24px] md:pt-[20px] md:items-start">

          <nav aria-label="Setup steps" className="hidden md:block md:sticky md:top-[20px]">
            {STEP_TRAIL.map(entry => {
              const on = step === entry.id;
              const done = STEP_TRAIL.findIndex(x => x.id === step) > STEP_TRAIL.findIndex(x => x.id === entry.id);
              return (
                <button
                  key={entry.id}
                  type="button"
                  disabled={!done}
                  onClick={() => done && setStep(entry.id)}
                  aria-current={on ? 'step' : undefined}
                  className={`w-full text-left p-[11px_12px] rounded-[10px] ${on ? 'bg-[var(--surface-card)] shadow-[var(--elev-1)]' : done ? 'cursor-pointer' : 'opacity-45 cursor-default'}`}
                >
                  <div className={`font-heading text-[12.5px] ${on ? 'font-bold' : 'font-semibold text-[var(--text-secondary)]'}`}>
                    {entry.label}
                  </div>
                  {/* What this step decided, so the trail is a record and not
                      just a position. */}
                  <div className="text-[10.5px] text-[var(--text-muted)] mt-[3px] truncate">{entry.value}</div>
                </button>
              );
            })}
          </nav>

          <div className="min-w-0">

          {/* 1. NAME */}
          {step === '1' && (
            <div className="animate-[tfin_0.16s_ease]">
              <section className="p-[22px_var(--gutter)_0]">
                <div className="font-heading font-bold text-[23px] leading-[1.15] tracking-[-0.6px]">What is it called?</div>
                <div className="text-[12.5px] leading-[1.6] text-[var(--text-secondary)] mt-[9px]">Members see this name on every invitation and every notification. You can rename it later, even after publishing.</div>
              </section>

              <section className="mt-[24px]">
                <div className="flex items-baseline justify-between p-[0_var(--gutter)_10px]">
                  <span className="tf-kicker text-[var(--text-muted)]">LEAGUE NAME</span>
                  <span className="tf-num text-[10px] text-[var(--text-muted)]">{name.length} / 60</span>
                </div>
                <div className="flex items-center gap-[2px] p-[14px_var(--gutter)] border-y border-[var(--surface-border)] bg-[var(--surface-card)] shadow-[inset_3px_0_0_0_var(--color-brand)] focus-within:shadow-[inset_3px_0_0_0_var(--color-brand),inset_0_0_0_1px_var(--color-brand)] transition-shadow">
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value.substring(0, 60))}
                    placeholder="e.g. Sunday Six" 
                    className="flex-1 min-w-0 bg-transparent outline-none font-heading font-bold text-[26px] leading-[1.1] tracking-[-0.7px] placeholder:text-[var(--text-muted)]" 
                  />
                </div>
              </section>

              <section className="mt-[22px]">
                <div className="flex items-baseline justify-between p-[0_var(--gutter)_10px]">
                  <span className="tf-kicker text-[var(--text-muted)]">DESCRIPTION</span>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase">OPTIONAL</span>
                </div>
                <div className="border-y border-[var(--surface-border)] bg-[var(--surface-card)] focus-within:border-[var(--color-brand)] transition-colors">
                  <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value.substring(0, 200))}
                    placeholder="Add a description for your league..."
                    className="w-full h-[80px] p-[14px_var(--gutter)] bg-transparent outline-none text-[13px] leading-[1.6] text-[var(--text-secondary)] resize-none placeholder-[var(--text-muted)]"
                  ></textarea>
                </div>
              </section>
            </div>
          )}

          {/* 2. COMPETITIONS */}
          {step === '2' && (
            <div className="animate-[tfin_0.16s_ease]">
              <section className="p-[22px_var(--gutter)_0]">
                <div className="font-heading font-bold text-[23px] leading-[1.15] tracking-[-0.6px]">Which competitions?</div>
                <div className="text-[12.5px] leading-[1.6] text-[var(--text-secondary)] mt-[9px]">One season and one scope each. They all share the rules you set next and feed a single table.</div>
              </section>


              {ds === 'empty' && (
                <div className="p-[70px_30px] flex flex-col items-center text-center">
                  <div className="w-[52px] h-[52px] rounded-full bg-[var(--surface-subtle)] grid place-items-center text-[20px] text-[var(--text-muted)]">◷</div>
                  <div className="font-heading font-bold text-[20px] leading-[1.2] tracking-[-0.5px] mt-[20px]">No seasons published yet</div>
                  <div className="text-[12.5px] leading-[1.6] text-[var(--text-secondary)] mt-[10px] max-w-[270px]">Fixture data for the new season has not landed. Your draft is saved — come back and this fills in on its own.</div>
                  <div className="tf-tap mt-[20px] font-heading font-bold text-[11px] text-[var(--text-link)] uppercase">CHECK AGAIN</div>
                </div>
              )}

              {ds === 'ready' && (
                <div className="mt-[22px]">
                  {comps.map((c, i) => (
                    <div key={i} className={c.blockStyle}>
                      <button type="button" onClick={c.toggle} className="flex items-center gap-[12px] cursor-pointer">
                        <div className={c.crestStyle}>{c.abbr}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-heading font-[650] text-[14px] tracking-[-0.2px] whitespace-nowrap overflow-hidden text-ellipsis">{c.name}</div>
                          <div className={c.metaStyle}>{c.meta}</div>
                        </div>
                        <div className={c.checkStyle}>{c.check}</div>
                      </button>

                      {c.on && (
                        <div className="mt-[13px]">
                          <div className="flex gap-[6px]">
                            {c.scopes.map((s, j) => (
                              <button type="button"
                                key={j}
                                onClick={s.pick}
                                className={`h-[32px] px-[12px] rounded-[8px] grid place-items-center cursor-pointer whitespace-nowrap flex-none font-heading font-bold text-[11px] ${s.on ? 'bg-[var(--text-primary)] text-[var(--surface-canvas)]' : 'border border-[var(--surface-border-strong)] text-[var(--text-secondary)]'}`}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                          <div className="text-[10.5px] leading-[1.5] text-[var(--text-muted)] mt-[9px]">{c.scopeNote}</div>

                          {c.pickRounds && (
                            <div className="mt-[13px] border-t border-[var(--surface-border-strong)] pt-[12px]">
                              <div className="flex items-baseline justify-between gap-[10px]">
                                <span className={`tf-kicker ${c.railKickerStyle}`}>{c.railKicker}</span>
                                {c.showRailAction && (
                                  <button type="button" onClick={c.railAction} className="tf-tap tf-kicker text-[var(--text-link)] flex-none">START AGAIN</button>
                                )}
                              </div>
                              <div className={`tf-num ${c.spanStyle}`}>{c.spanText}</div>

                              {c.groups.map((g: any, k: number) => (
                                <div key={k} className="mt-[13px]">
                                  {g.named && (
                                    <div className="tf-kicker text-[var(--text-muted)] mb-[8px]">{g.name}</div>
                                  )}
                                  <div className="flex flex-wrap gap-[5px]">
                                    {g.rounds.map((r: any, l: number) => (
                                      <button type="button" key={l} onClick={r.pick} className={`tf-num ${r.style}`}>
                                        {r.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="p-[20px_var(--gutter)_26px] text-[10.5px] leading-[1.6] text-[var(--text-muted)]">A league cannot gain or lose a competition after it is published. This is the most expensive step to get wrong.</div>
                </div>
              )}
            </div>
          )}

          {/* 3. POINTS */}
          {step === '3' && (
            <div className="animate-[tfin_0.16s_ease]">
              {share > 0.5 && (
                <div className="bg-[var(--color-warning)] text-[var(--tf-white)] p-[15px_var(--gutter)]">
                  <div className="tf-kicker">ONE MARKET DECIDES THE TABLE</div>
                  <div className="text-[12.5px] leading-[1.55] mt-[8px]">
                    {biggest ? (biggest.m.perPlayer ? "Lineups" : biggest.m.name) + " is worth " + Math.round(share * 100) + "% of a match. One market this heavy decides the table on its own." : ""}
                  </div>
                </div>
              )}

              <section className="p-[22px_var(--gutter)_0]">
                <div className="font-heading font-bold text-[23px] leading-[1.15] tracking-[-0.6px]">What is each one worth?</div>
                <div className="text-[12.5px] leading-[1.6] text-[var(--text-secondary)] mt-[9px]">Whole numbers, 1 to 50. To take a market out of the league switch it off — zero is not a value.</div>
              </section>

              <section className="mt-[22px]">
                {MARKETS.map((m, i) => {
                  const isOn = on(m);
                  return (
                    <div key={i} className={`flex items-center gap-[12px] p-[13px_var(--gutter)] border-t border-[var(--surface-border)] ${i === MARKETS.length - 1 ? 'border-b' : ''} ${isOn ? '' : 'opacity-50'}`}>
                      <button type="button" onClick={() => setOff(s => ({ ...s, [m.marketType]: isOn }))} className={`w-[40px] h-[24px] rounded-full flex-none p-[2px] flex cursor-pointer transition-colors duration-150 ${isOn ? 'bg-[var(--color-brand)] justify-end' : 'bg-[var(--surface-border-strong)] justify-start'}`}>
                        <div className="w-[20px] h-[20px] rounded-full bg-[var(--tf-white)] shadow-[var(--elev-1)]"></div>
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="font-heading font-[650] text-[13.5px] tracking-[-0.2px]">{m.name}</div>
                        <div className="text-[10.5px] leading-[1.45] text-[var(--text-muted)] mt-[3px]">{m.note}</div>
                      </div>
                      <div className={`flex items-center rounded-[10px] bg-[var(--surface-subtle)] flex-none ${isOn ? '' : 'invisible'}`}>
                        <button type="button" onClick={() => bump(m, -1)} className="tf-tap w-[30px] h-[30px] grid place-items-center text-[15px] text-[var(--text-secondary)]">−</button>
                        <span className="tf-num min-w-[24px] text-center font-heading font-bold text-[15px]">{pts(m)}</span>
                        <button type="button" onClick={() => bump(m, 1)} className="tf-tap w-[30px] h-[30px] grid place-items-center text-[15px] text-[var(--text-secondary)]">+</button>
                      </div>
                    </div>
                  );
                })}
              </section>

              {on(MARKETS[3]) && (
                <section className="mt-[24px]">
                  <div className="flex items-baseline justify-between p-[0_var(--gutter)_10px]">
                    <span className="tf-kicker text-[var(--text-muted)]">TOTAL GOALS LINE</span>
                    <span className="tf-num font-heading font-bold text-[15px]">{line}</span>
                  </div>
                  <div className="tf-scroll flex gap-[6px] overflow-x-auto p-[12px_var(--gutter)] border-y border-[var(--surface-border)]">
                    {LINES.map((l, i) => (
                      <button type="button"
                        key={i}
                        onClick={() => setLine(l)}
                        className={`h-[32px] px-[12px] rounded-[8px] grid place-items-center cursor-pointer whitespace-nowrap flex-none font-heading font-bold text-[11px] ${line === l ? 'bg-[var(--text-primary)] text-[var(--surface-canvas)]' : 'border border-[var(--surface-border-strong)] text-[var(--text-secondary)]'}`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                  <div className="p-[12px_var(--gutter)_0] text-[10.5px] leading-[1.55] text-[var(--text-muted)]">Everyone answers over or under this one line. Members cannot pick their own.</div>
                </section>
              )}

              <div className="h-[26px]"></div>
            </div>
          )}

          {/* 4. RULES */}
          {step === '4' && (
            <div className="animate-[tfin_0.16s_ease]">
              <section className="p-[22px_var(--gutter)_0]">
                <div className="font-heading font-bold text-[23px] leading-[1.15] tracking-[-0.6px]">House rules</div>
                <div className="text-[12.5px] leading-[1.6] text-[var(--text-secondary)] mt-[9px]">Deadlines, who can still join, and how a tie is broken. All three freeze at publication.</div>
              </section>

              <section className="mt-[24px]">
                <div className="tf-kicker text-[var(--text-muted)] p-[0_var(--gutter)_10px]">PREDICTIONS LOCK</div>
                <div className="flex flex-wrap gap-[6px] p-[12px_var(--gutter)] border-t border-[var(--surface-border)]">
                  {LOCKS.map((l, i) => (
                    <button type="button"
                      key={i}
                      onClick={() => setLock(l.kind)}
                      className={`h-[32px] px-[12px] rounded-[8px] grid place-items-center cursor-pointer whitespace-nowrap flex-none font-heading font-bold text-[11px] ${lock === l.kind ? 'bg-[var(--text-primary)] text-[var(--surface-canvas)]' : 'border border-[var(--surface-border-strong)] text-[var(--text-secondary)]'}`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
                <div className="p-[0_var(--gutter)_14px] text-[11.5px] leading-[1.55] text-[var(--text-secondary)] border-b border-[var(--surface-border)]">{lockRow.note}</div>
                <div className="p-[11px_var(--gutter)_0] text-[10.5px] leading-[1.55] text-[var(--text-muted)]">Lineups ignore this and always lock two hours out, which is why a fixture can be open and closed at the same time.</div>
              </section>

              <section className="mt-[24px]">
                <div className="tf-kicker text-[var(--text-muted)] p-[0_var(--gutter)_10px]">JOINING</div>
                {[
                  { id: "open", label: "Late joining allowed", note: "Somebody can join mid-season. They start on zero and cannot touch a locked match." },
                  { id: "closed", label: "Close when it starts", note: "Membership shuts the moment the first deadline passes." }
                ].map((j, i) => (
                  <button type="button" key={i} onClick={() => setLateJoin(j.id)} className={`flex gap-[12px] items-start p-[14px_var(--gutter)] border-t border-[var(--surface-border)] cursor-pointer ${lateJoin === j.id ? 'bg-[var(--accent-surface)] shadow-[inset_3px_0_0_0_var(--color-brand)]' : ''}`}>
                    <div className={`w-[20px] h-[20px] rounded-full flex-none mt-[1px] grid place-items-center border-[1.5px] ${lateJoin === j.id ? 'border-[var(--color-brand)]' : 'border-[var(--surface-border-strong)]'}`}>
                      <div className={`w-[10px] h-[10px] rounded-full ${lateJoin === j.id ? 'bg-[var(--color-brand)]' : 'bg-transparent'}`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-[650] text-[13.5px] tracking-[-0.2px]">{j.label}</div>
                      <div className="text-[10.5px] leading-[1.5] text-[var(--text-muted)] mt-[3px]">{j.note}</div>
                    </div>
                  </button>
                ))}
                <button type="button" onClick={() => setApproval(!approval)} className="flex items-center gap-[12px] p-[14px_var(--gutter)] border-y border-[var(--surface-border)] cursor-pointer">
                  <div className={`w-[40px] h-[24px] rounded-full flex-none p-[2px] flex transition-colors duration-150 ${approval ? 'bg-[var(--color-brand)] justify-end' : 'bg-[var(--surface-border-strong)] justify-start'}`}>
                    <div className="w-[20px] h-[20px] rounded-full bg-[var(--tf-white)] shadow-[var(--elev-1)]"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-heading font-[650] text-[13.5px] tracking-[-0.2px]">Approve every request</div>
                    <div className="text-[10.5px] leading-[1.5] text-[var(--text-muted)] mt-[3px]">{approval ? "Every request waits for an owner or admin." : "Anyone with the link is in immediately."}</div>
                  </div>
                </button>
              </section>

              <section className="mt-[24px]">
                <div className="flex items-baseline justify-between p-[0_var(--gutter)_10px]">
                  <span className="tf-kicker text-[var(--text-muted)]">TIEBREAKERS</span>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase">POINTS FIRST, ALWAYS</span>
                </div>
                {tieOrder.map((id, i) => (
                  <div key={i} className="flex items-center gap-[12px] p-[11px_var(--gutter)] border-t border-[var(--surface-border)]">
                    <span className="tf-num w-[22px] h-[22px] rounded-[6px] flex-none grid place-items-center font-heading font-bold text-[10.5px] bg-[var(--surface-subtle)] text-[var(--text-secondary)]">{i + 1}</span>
                    <span className="flex-1 text-[12.5px] text-[var(--text-primary)]">{MARKETS.find(m => m.marketType === id)?.tiebreakerLabel}</span>
                    <button type="button" onClick={() => {
                      if (i > 0) {
                        const n = [...tieOrder];
                        const at = n.indexOf(id);
                        const t = n[at - 1];
                        n[at - 1] = id;
                        n[at] = t;
                        setTieOrder(n);
                      }
                    }} className={`w-[30px] h-[30px] rounded-[8px] flex-none grid place-items-center text-[13px] bg-[var(--surface-subtle)] text-[var(--text-secondary)] ${i === 0 ? 'opacity-30' : 'cursor-pointer'}`}>↑</button>
                  </div>
                ))}
                <div className="flex items-center gap-[12px] p-[11px_var(--gutter)] border-y border-[var(--surface-border)]">
                  <span className="tf-num w-[22px] h-[22px] rounded-[6px] flex-none grid place-items-center font-heading font-bold text-[10.5px] bg-[var(--surface-subtle)] text-[var(--text-muted)]">{tieOrder.length + 1}</span>
                  <span className="flex-1 text-[12.5px] text-[var(--text-muted)]">Shared position</span>
                </div>
                <div className="p-[12px_var(--gutter)_26px] text-[10.5px] leading-[1.6] text-[var(--text-muted)]">Still level after all of them and the position is shared: two members tied for 2nd are followed by 4th.</div>
              </section>
            </div>
          )}

          {/* 5. REVIEW */}
          {step === '5' && (
            <div className="animate-[tfin_0.16s_ease]">
              <section className="p-[22px_var(--gutter)_0]">
                <div className="font-heading font-bold text-[23px] leading-[1.15] tracking-[-0.6px]">Freeze these rules</div>
                <div className="text-[12.5px] leading-[1.6] text-[var(--text-secondary)] mt-[9px]">Publishing opens the league and locks the first list below for good.</div>
              </section>


              {(
                <div>
                  <section className="mt-[22px]">
                    <div className="tf-kicker text-[var(--danger-text)] p-[0_var(--gutter)_10px]">FROZEN AT PUBLICATION</div>
                    {frozen.map((f, i) => (
                      <div key={i} className={`flex items-baseline gap-[12px] p-[11px_var(--gutter)] border-t border-[var(--surface-border)] ${i === frozen.length - 1 ? 'border-b' : ''}`}>
                        <span className="text-[11.5px] text-[var(--text-muted)] flex-none w-[110px]">{f.label}</span>
                        <span className="flex-1 text-right font-heading font-semibold text-[12px] leading-[1.45]">{f.value}</span>
                      </div>
                    ))}
                  </section>

                  <section className="mt-[24px]">
                    <div className="tf-kicker text-[var(--success-text)] p-[0_var(--gutter)_10px]">STILL YOURS TO CHANGE</div>
                    {editable.map((f, i) => (
                      <div key={i} className={`flex items-baseline gap-[12px] p-[11px_var(--gutter)] border-t border-[var(--surface-border)] ${i === editable.length - 1 ? 'border-b' : ''}`}>
                        <span className="text-[11.5px] text-[var(--text-muted)] flex-none w-[110px]">{f.label}</span>
                        <span className="flex-1 text-right font-heading font-semibold text-[12px]">{f.value}</span>
                      </div>
                    ))}
                  </section>
                  <div className="p-[20px_var(--gutter)_26px] text-[10.5px] leading-[1.6] text-[var(--text-muted)]">Three fixtures kick off inside your lock window, so they cannot be predicted and are not part of the league.</div>
                </div>
              )}
            </div>
          )}

          {/* PUBLISHED */}
          {step === 'done' && (
            <div className="animate-[tfin_0.2s_ease]">
              <section className="bg-[var(--tf-green-800)] text-[var(--tf-white)] p-[26px_var(--gutter)_24px]">
                <div className="tf-kicker opacity-75">PUBLISHED · JUST NOW</div>
                <div className="font-heading font-bold text-[27px] leading-[1.1] tracking-[-0.9px] mt-[11px]">{createdLeagueName || name} is live</div>
                <div className="text-[12.5px] leading-[1.6] opacity-85 mt-[9px]">The rules are frozen. Send this to the people you want in — anyone with the link can ask to join.</div>

                {inviteCode ? (
                  <>
                    <div className="flex gap-[6px] mt-[20px]">
                      {inviteCode.split("").map((ch, i) => (
                        <div key={i} className="tf-num flex-1 h-[46px] rounded-[10px] bg-[rgba(255,255,255,.14)] grid place-items-center font-heading font-bold text-[20px]">{ch}</div>
                      ))}
                    </div>
                    <div className="flex items-center gap-[10px] mt-[10px]">
                      <span className="flex-1 text-[11.5px] opacity-80 whitespace-nowrap overflow-hidden text-ellipsis">topfour.app/j/{inviteCode}</span>
                      <button
                        type="button"
                        className="tf-tap font-heading font-bold text-[11px] flex-none"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(`https://topfour.app/j/${inviteCode}`);
                            setCopyToast(true);
                            setTimeout(() => setCopyToast(false), 2000);
                          } catch {}
                        }}
                      >
                        {copyToast ? 'COPIED ✓' : 'COPY'}
                      </button>
                    </div>
                    <button type="button"
                      className="tf-tap mt-[16px] h-[48px] rounded-[13px] bg-[var(--tf-white)] text-[var(--tf-green-800)] grid place-items-center font-heading font-bold text-[13.5px]"
                      onClick={async () => {
                        const url = `https://topfour.app/j/${inviteCode}`;
                        const shareData = { title: `Join ${createdLeagueName || name} on TopFour`, url };
                        try {
                          if (navigator.share && navigator.canShare?.(shareData)) {
                            await navigator.share(shareData);
                          } else {
                            await navigator.clipboard.writeText(url);
                            setCopyToast(true);
                            setTimeout(() => setCopyToast(false), 2000);
                          }
                        } catch {}
                      }}
                    >
                    Share the invitation
                    </button>
                  </>
                ) : (
                  <div className="mt-[20px] h-[46px] rounded-[10px] bg-[rgba(255,255,255,.1)] animate-pulse" />
                )}
              </section>

              <section className="mt-[24px]">
                <div className="tf-kicker text-[var(--text-muted)] p-[0_var(--gutter)_10px]">WHAT NOW</div>
                {[
                  { num: "1", label: "Invite people to join your league", href: null, action: async () => {
                    if (!inviteCode) return;
                    const url = `https://topfour.app/j/${inviteCode}`;
                    const shareData = { title: `Join ${createdLeagueName || name} on TopFour`, url };
                    try {
                      if (navigator.share && navigator.canShare?.(shareData)) {
                        await navigator.share(shareData);
                      } else {
                        await navigator.clipboard.writeText(url);
                        setCopyToast(true);
                        setTimeout(() => setCopyToast(false), 2000);
                      }
                    } catch {}
                  }},
                  { num: "2", label: "Manage members and settings", href: createdLeagueId ? `/leagues/${createdLeagueId}/admin` : null },
                  { num: "3", label: "Start making predictions", href: "/predict" },
                ].map(({ num, label, href, action }, i, a) => (
                  href ? (
                    <Link key={i} href={href} className={`flex items-center gap-[12px] p-[12px_var(--gutter)] border-t border-[var(--surface-border)] ${i === a.length - 1 ? 'border-b' : ''}`}>
                      <span className="tf-num w-[22px] flex-none font-heading font-bold text-[11.5px] text-[var(--text-muted)]">{num}</span>
                      <span className="flex-1 text-[12.5px] leading-[1.5] text-[var(--text-secondary)]">{label}</span>
                      <span className="text-[13px] text-[var(--text-muted)] flex-none">›</span>
                    </Link>
                  ) : (
                    <button type="button" key={i} onClick={action} className={`flex items-center gap-[12px] p-[12px_var(--gutter)] border-t border-[var(--surface-border)] cursor-pointer ${i === a.length - 1 ? 'border-b' : ''}`}>
                      <span className="tf-num w-[22px] flex-none font-heading font-bold text-[11.5px] text-[var(--text-muted)]">{num}</span>
                      <span className="flex-1 text-[12.5px] leading-[1.5] text-[var(--text-secondary)]">{label}</span>
                      <span className="text-[13px] text-[var(--text-muted)] flex-none">›</span>
                    </button>
                  )
                ))}
              </section>
              <div className="h-[26px]"></div>
            </div>
          )}
          </div>

          <aside className="hidden md:block md:sticky md:top-[20px] p-[16px] rounded-[14px] bg-[var(--surface-card)] border border-[var(--surface-border)]">
            <div className="tf-kicker text-[var(--text-muted)]">The whole rule set</div>
            {[...editable, ...frozen].map(row => (
              <div key={row.label} className="flex items-baseline gap-[10px] py-[8px] border-b border-[var(--surface-border)] last:border-b-0">
                <span className="text-[10.5px] text-[var(--text-muted)] w-[96px] flex-none">{row.label}</span>
                <span className="text-[11.5px] flex-1 min-w-0 text-right truncate">{row.value || '—'}</span>
              </div>
            ))}
            <p className="text-[10px] leading-[1.6] text-[var(--text-muted)] mt-[10px]">
              Everything below the name freezes at publication. Members answer under it, so it cannot
              change while the league runs.
            </p>
          </aside>
        </main>

        {step !== 'done' && (
          <div className="flex-none border-t border-[var(--surface-border)] bg-[var(--surface-card)] p-[11px_var(--gutter)_15px]">
            <div className="flex justify-between items-baseline mb-[10px]">
              <span className="text-[11px] text-[var(--text-muted)]">
                {{ '1': 'Draft saved automatically', '2': 'Competitions chosen', '3': 'Most a match can be worth', '4': 'Tiebreakers in order', '5': 'Fixtures at publication' }[step]}
              </span>
              <span className="tf-num font-heading font-bold text-[12px]">
                {{ '1': 'Just now', '2': String(selectedComps.length), '3': maxPoints + ' pts', '4': String(tieOrder.length), '5': String(totalRounds) }[step]}
              </span>
            </div>
            <button type="button" onClick={() => {
              if (!canNext) return;
              if (step === '5') { setSheet('publish'); return; }
              setStep(nextFor[step] as any);
            }} className={`w-full h-[48px] rounded-[13px] grid place-items-center font-heading font-bold text-[14px] tracking-[-0.1px] ${canNext ? 'bg-[var(--brand-fill)] text-[var(--color-on-brand)] cursor-pointer shadow-[var(--elev-glow)]' : 'bg-[var(--surface-subtle)] text-[var(--text-muted)]'}`}>
              {step === '5' ? 'Publish the league' : canNext ? 'Continue' : selectedComps.length === 0 ? 'Choose at least one' : 'Finish the rounds first'}
            </button>
          </div>
        )}

        {sheet === 'publish' && (
          <div
            // Dismisses on its own surface only, so the sheet below needs no
            // click handler of its own to stop the event travelling.
            role="presentation"
            onClick={event => { if (event.target === event.currentTarget) setSheet(null); }}
            className="absolute inset-0 z-50 bg-[var(--scrim)] flex items-end"
          >
            <div role="dialog" aria-modal="true" className="w-full bg-[var(--surface-card)] rounded-[20px_20px_27px_27px] p-[18px_var(--gutter)_22px] animate-[tfup_0.22s_cubic-bezier(0.2,0.8,0.2,1)] shadow-[var(--elev-4)]">
              <div className="w-[38px] h-[4px] rounded-full bg-[var(--surface-border-strong)] mx-auto mb-[15px]"></div>
              <div className="font-heading font-bold text-[19px] leading-[1.2] tracking-[-0.5px]">Publish {name || 'league'}?</div>
              <div className="text-[12.5px] leading-[1.6] text-[var(--text-secondary)] mt-[9px]">This cannot be undone. To run different rules you would clone the league and publish that instead.</div>
              <div className="mt-[14px]">
                {[
                  `${totalRounds} rounds are added, and each fixture's deadline follows the lock you chose.`,
                  `Points, markets, competitions and tiebreakers can never change again.`,
                  `The invitation link and short code start working immediately.`
                ].map((text, i) => (
                  <div key={i} className="flex gap-[10px] items-start py-[6px]">
                    <span className="w-[5px] h-[5px] rounded-full bg-[var(--color-brand)] mt-[7px] flex-none"></span>
                    <span className="text-[12px] leading-[1.5] text-[var(--text-secondary)]">{text}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-[8px] mt-[16px]">
                <button type="button" onClick={() => setSheet(null)} className="tf-tap flex-1 h-[48px] rounded-[12px] border border-[var(--surface-border-strong)] grid place-items-center font-heading font-bold text-[12.5px]">Keep editing</button>
                <button type="button" onClick={() => {
                  if (createLeague.isPending || publishingRef.current) return;
                  publishingRef.current = true;
                  const idempotencyKey = crypto.randomUUID();
                  const payload = buildCreatePayload({
                    name,
                    description,
                    joinApprovalRequired: approval,
                    lateJoinPolicy: lateJoin === 'open' ? 'allow' : 'close_when_in_progress',
                    totalGoalsLine: Number(line) as LeagueDraft['totalGoalsLine'],
                    lock,
                    points,
                    disabled: off,
                    tiebreakers: tieOrder,
                    choices: Object.fromEntries(
                      Object.entries(compsState).map(([id, selection]) => [
                        id,
                        { selection, from: bounds[id]?.a, to: bounds[id]?.z } satisfies CompetitionChoice,
                      ]),
                    ),
                  }, competitions);
                  setPublishError(null);
                  createLeague.mutate({ idempotencyKey, payload }, {
                    onSuccess: (data) => {
                      publishLeague.mutate({
                        leagueId: data.id,
                        idempotencyKey: crypto.randomUUID(),
                        expectedVersion: data.version,
                      }, {
                        onSuccess: async () => {
                          setCreatedLeagueId(data.id);
                          setCreatedLeagueName(data.name);
                          setStep('done');
                          setSheet(null);
                          publishingRef.current = false;
                          // Auto-create a default invitation link
                          try {
                            const inv = await apiFetch<any>(`/leagues/${data.id}/invitations`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ useLimit: 100 }),
                            });
                            const code = inv?.data?.joinCode || inv?.joinCode || null;
                            if (code) setInviteCode(code);
                          } catch {
                            // invitation creation failed silently; user can still manage from admin
                          }
                        },
                        onError: () => {
                          publishingRef.current = false;
                          setPublishError('The league was created but publishing failed. Try again from here.');
                        }
                      });
                    },
                    onError: () => {
                      publishingRef.current = false;
                      setPublishError('Something went wrong creating the league. Try again.');
                    }
                  });
                }} className={`tf-tap flex-1 h-[48px] rounded-[12px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] grid place-items-center font-heading font-bold text-[12.5px] shadow-[var(--elev-glow)] ${(createLeague.isPending || publishLeague.isPending) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {createLeague.isPending || publishLeague.isPending ? 'Publishing...' : 'Publish'}
                </button>
              </div>
              {publishError && (
                <div className="mt-[10px] text-[12px] text-[var(--danger-text)] leading-[1.5]">{publishError}</div>
              )}
            </div>
          </div>
        )}

      </div></div>
  );
}
