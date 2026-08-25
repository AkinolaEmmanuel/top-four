'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCreateLeague } from '@/hooks/api/useLeagues';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api/fetcher';

const BRAND = "var(--color-brand)";

const LEAGUE = [{ name: "Regular season", form: "num", rounds: 38, per: 10 }];
const COMPS = [
  { id: "epl", abbr: "EPL", name: "English Premier League", season: "2026/27", stages: LEAGUE },
  {
    id: "ucl", abbr: "UCL", name: "UEFA Champions League", season: "2026/27", stages: [
      { name: "League phase", form: "md", rounds: 8, per: 18 },
      { name: "Round of 16", form: "legs", rounds: 2, per: 8 },
      { name: "Quarter-final", form: "legs", rounds: 2, per: 4 },
      { name: "Semi-final", form: "legs", rounds: 2, per: 2 },
      { name: "Final", form: "one", rounds: 1, per: 1 }
    ]
  },
  { id: "liga", abbr: "LL", name: "La Liga", season: "2026/27", stages: LEAGUE },
  { id: "seriea", abbr: "SA", name: "Serie A", season: "2026/27", stages: LEAGUE },
  { id: "bundes", abbr: "BL", name: "Bundesliga", season: "2026/27", stages: [{ name: "Regular season", form: "num", rounds: 34, per: 9 }] },
  { id: "ligue1", abbr: "L1", name: "Ligue 1", season: "2026/27", stages: [{ name: "Regular season", form: "num", rounds: 34, per: 9 }] }
];

function roundsOf(c: any) {
  const out: any[] = [];
  c.stages.forEach((st: any, si: number) => {
    for (let i = 1; i <= st.rounds; i++) {
      out.push({
        stageIdx: si, per: st.per,
        label: st.form === "num" ? String(i) : st.form === "md" ? "MD" + i : st.form === "legs" ? "Leg " + i : st.name,
        full: st.form === "num" ? "Round " + i : st.form === "md" ? "MD " + i : st.form === "legs" ? st.name + " leg " + i : st.name
      });
    }
  });
  return out;
}

const MARKETS = [
  { id: "result", name: "Match result", note: "Home, draw or away", def: 2, tie: "Most correct match results", color: "var(--cat-1)" },
  { id: "score", name: "Exact score", note: "Both teams' goals", def: 5, tie: "Most correct exact scores", color: "var(--cat-6)" },
  { id: "btts", name: "Both teams to score", note: "Yes or no", def: 1, tie: "Most correct both-teams-to-score", color: "var(--cat-2)" },
  { id: "goals", name: "Total goals", note: "Over or under the line", def: 1, tie: "Most correct total goals", color: "var(--cat-4)" },
  { id: "scorer", name: "Anytime goalscorer", note: "One player · own goals do not count", def: 5, tie: "Most correct goalscorers", color: "var(--cat-3)" },
  { id: "card", name: "Player card", note: "Yellow, second yellow or red", def: 4, tie: "Most correct player cards", color: "var(--cat-5)" },
  { id: "lineup", name: "Correct lineup starter", note: "Per player · always locks 2h before kick-off", def: 1, perPlayer: true, tie: "Most correct lineup players", color: "var(--cat-7)" }
];

const LOCKS = [
  { id: "kick", label: "Kick-off", note: "Deadlines land the moment the whistle goes. Nothing to spare if a member is late." },
  { id: "5m", label: "5 min", note: "The default. Team news is out, and nobody is answering during the match." },
  { id: "15m", label: "15 min", note: "Fifteen minutes of quiet before kick-off." },
  { id: "30m", label: "30 min", note: "Half an hour ahead of kick-off, roughly when line-ups are confirmed." },
  { id: "60m", label: "1 hour", note: "An hour ahead. Predictions close before most team news lands." },
  { id: "2h", label: "2 hours", note: "Matches the lineup market, so every deadline in the league falls together." },
  { id: "custom", label: "Custom", note: "Any whole number of minutes up to seven days. A value matching a preset is stored as that preset." }
];

const LINES = ["0.5", "1.5", "2.5", "3.5", "4.5", "5.5", "6.5", "7.5", "8.5", "9.5", "10.5", "11.5"];

export default function LeagueSetupPage() {
  const router = useRouter();
  const createLeague = useCreateLeague();

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [step, setStep] = useState('1');
  const [createdLeagueId, setCreatedLeagueId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dataState, setDataState] = useState<'ready' | 'loading' | 'empty'>('loading');
  const [liveComps, setLiveComps] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    async function loadComps() {
      try {
        const catalogueComps = await apiFetch<any[]>('/football/catalogue/competitions');
        
        const enriched = [];
        for (const c of COMPS) {
          const catComp = catalogueComps.find(x => 
              x.slug === c.id || 
              x.displayName === c.name || 
              x.shortName === c.abbr ||
              c.name.includes(x.displayName) ||
              x.displayName.includes(c.name.replace("English ", ""))
          );
          if (catComp) {
            const seasons = await apiFetch<any[]>(`/football/catalogue/competitions/${catComp.id}/seasons`);
            const activeSeason = seasons.find(s => s.selectableForNewLeague) || seasons[0];
            if (activeSeason) {
               enriched.push({
                 ...c,
                 supportedCompetitionId: catComp.id,
                 seasonId: activeSeason.id
               });
            }
          }
        }
        
        if (mounted) {
           if (enriched.length === 0) setDataState('empty');
           else {
             setLiveComps(enriched);
             setDataState('ready');
           }
        }
      } catch (e) {
        console.error(e);
        if (mounted) setDataState('empty');
      }
    }
    loadComps();
    return () => { mounted = false; };
  }, []);
  const [sheet, setSheet] = useState<string | null>(null);
  const [compsState, setCompsState] = useState<Record<string, string>>({ epl: "season", ucl: "range" });
  const [bounds, setBounds] = useState<Record<string, { a?: number, z?: number }>>({ ucl: { a: 0, z: 3 } });
  const [points, setPoints] = useState<Record<string, number>>({});
  const [off, setOff] = useState<Record<string, boolean>>({ card: true });
  const [line, setLine] = useState("2.5");
  const [lock, setLock] = useState("5m");
  const [lateJoin, setLateJoin] = useState("open");
  const [approval, setApproval] = useState(true);
  const [tieOrder, setTieOrder] = useState(["score", "lineup", "scorer", "result"]);

  const ds = dataState;

  const pts = (m: any) => points[m.id] == null ? m.def : points[m.id];
  const on = (m: any) => !off[m.id];
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

  const comps = liveComps.map(c => {
    const sel = compsState[c.id];
    const rs = roundsOf(c);
    const b = bounds[c.id] || {};
    const a = b.a;
    const z = b.z;
    const picking = sel === "range" && a != null && z == null;
    const done = sel === "season" || (sel === "round" && a != null) || (sel === "range" && a != null && z != null);
    const from = sel === "season" ? 0 : a || 0;
    const to = sel === "season" ? rs.length - 1 : sel === "round" ? a || 0 : z || 0;
    const fx = done ? rs.slice(from, to + 1).reduce((t: number, r: any) => t + r.per, 0) : 0;

    const span = !done ? ""
      : sel === "season" ? "Every round · " + rs.length + " of them · " + fx + " fixtures"
        : sel === "round" ? rs[from].full + " · " + fx + " fixtures"
          : rs[from].full + " → " + rs[to].full + " · " + (to - from + 1) + " rounds · " + fx + " fixtures";

    return {
      id: c.id, abbr: c.abbr, name: c.name, on: !!sel, done: !!done, fx,
      short: !done ? "unfinished" : sel === "season" ? "full season"
        : sel === "round" ? rs[from].full
          : rs[from].full + "–" + rs[to].full,
      meta: !sel ? rs.length + " rounds available"
        : !done ? (sel === 'round' ? 'One round' : sel === 'range' ? 'Round range' : 'Full season') + " · nothing picked yet"
          : sel === "season" ? "Full season · " + rs.length + " rounds · " + fx + " fixtures"
            : sel === "round" ? rs[from].full + " · " + fx + " fixtures"
              : rs[from].full + " → " + rs[to].full + " · " + fx + " fixtures",
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
        pick: () => setCompsState(s => ({ ...s, [c.id]: id }))
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
      groups: c.stages.map((st: any, si: number) => ({
        named: c.stages.length > 1, name: st.name,
        rounds: rs.map((r: any, i: number) => ({ r, i })).filter(x => x.r.stageIdx === si).map(x => {
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
  const scopesDone = selectedComps.every(c => c.done);
  const totalFixtures = selectedComps.reduce((t, c) => t + c.fx, 0);
  const canNext = step === "1" ? true
    : step === "2" ? selectedComps.length > 0 && scopesDone
      : step === "3" ? maxPoints > 0
        : true;

  const backFor: any = { "2": "1", "3": "2", "4": "3", "5": "4", "done": "1" };
  const nextFor: any = { "1": "2", "2": "3", "3": "4", "4": "5" };

  const weightBar = totals.map(t => ({ style: "flex-grow: " + t.total + "; background: " + t.m.color + "; min-width: 3px;" }));
  const weightKeys = totals.map(t => ({
    label: (t.m.perPlayer ? "Lineups" : t.m.name === "Both teams to score" ? "BTTS" : t.m.name) + " " + t.total,
    dotStyle: "w-[7px] h-[7px] rounded-[2px] flex-none bg-[" + t.m.color + "]"
  }));

  const compSummary = selectedComps.map(c => c.abbr + " " + c.short).join(" · ");
  const lockRow = LOCKS.find(l => l.id === lock) || LOCKS[0];
  const lockValue = lockRow.label === "Custom" ? "90 min before kick-off" : lockRow.label === "Kick-off" ? "At kick-off" : lockRow.label + " before kick-off";

  const editable = [
    { label: "League name", value: name || "New league" },
    { label: "Description", value: description || "None" }
  ];

  const frozen = [
    { label: "Competitions", value: compSummary },
    { label: "Fixtures", value: String(totalFixtures) },
    { label: "Max per match", value: maxPoints + " pts" },
    { label: "Deadlines", value: lockValue },
    { label: "Late joining", value: lateJoin === "open" ? "Allowed" : "Closed at kick-off" },
    { label: "Tiebreakers", value: String(tieOrder.length) + " rules" }
  ];

  const HERO: Record<string, string[]> = {
    // "1": ["20", "places used", "0 available", "var(--color-brand)"],
    "2": [String(totalFixtures), "fixtures included", "across " + selectedComps.length + " comps", "var(--nav-text)"],
    "3": [String(maxPoints), "pts per match", enabled.length + " markets", "var(--nav-text)"],
    "4": ["3", "rules", "lineups always 2h", "var(--nav-text)"],
    "5": [String(totalFixtures), "fixtures total", compSummary, "var(--nav-text)"]
  };

  const currentHero = HERO[step];

  return (
    <div className={`flex flex-col flex-1 bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''}`}>

      {/* App Container */}
      <div className="flex flex-col flex-1 w-full max-w-[1080px] mx-auto overflow-hidden relative">

        <header className="flex-none space-y-5 text-[var(--nav-text)] p-[8px_var(--gutter)_14px]">
          <div className="flex items-center gap-[11px]">
            <div onClick={() => { const b = backFor[step]; if (b) { setStep(b); setSheet(null); } }} className={`w-[40px] h-[40px] rounded-full border border-[var(--nav-border)] grid place-items-center text-[15px] flex-none text-[var(--nav-text-quiet)] cursor-pointer ${step === '1' || step === 'done' ? 'opacity-35' : ''}`}>
              ‹
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-heading font-[650] text-[16px] leading-[1.1] tracking-[-0.3px] whitespace-nowrap overflow-hidden text-ellipsis">{step === 'done' ? name : 'New league'}</div>
              <div className="text-[10.5px] text-[var(--nav-text-faint)] mt-[4px]">{step === 'done' ? 'Published · 16 Aug' : `Step ${step} of 5 · ${{ '1': 'Name', '2': 'Competitions', '3': 'Points', '4': 'Rules', '5': 'Review' }[step] || ''}`}</div>
            </div>
            <div 
              onClick={() => {
                if (step === 'done' && createdLeagueId) {
                  router.push(`/leagues/${createdLeagueId}`);
                }
              }}
              className={`h-[32px] px-[12px] rounded-[8px] grid place-items-center flex-none font-heading font-bold text-[10px] tracking-[0.06em] uppercase ${step === 'done' ? 'bg-[var(--nav-accent)] text-[var(--nav-on-accent)] cursor-pointer' : 'border border-[var(--nav-border)] text-[var(--nav-text-quiet)] cursor-pointer'}`}>
              {step === 'done' ? 'MANAGE' : 'SAVE'}
            </div>
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
                <div
                  key={s}
                  onClick={() => setStep(s as any)}
                  className={`h-[4px] rounded-full cursor-pointer transition-all duration-300 ${w} ${(step === 'done' || parseInt(step) >= i + 1) ? 'bg-[var(--nav-accent)]' : 'bg-white/15'}`}
                ></div>
              );
            })}
          </div>
        </header>

        <main className="tf-scroll flex-1 overflow-auto bg-[var(--surface-canvas)]">

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

              <div className="p-[20px_var(--gutter)_26px] text-[10.5px] leading-[1.6] text-[var(--text-muted)]">Drafts count against your twenty. Completed and cancelled leagues give their place back, so the limit is on what you are running, not on what you have ever run.</div>
            </div>
          )}

          {/* 2. COMPETITIONS */}
          {step === '2' && (
            <div className="animate-[tfin_0.16s_ease]">
              <section className="p-[22px_var(--gutter)_0]">
                <div className="font-heading font-bold text-[23px] leading-[1.15] tracking-[-0.6px]">Which competitions?</div>
                <div className="text-[12.5px] leading-[1.6] text-[var(--text-secondary)] mt-[9px]">One season and one scope each. They all share the rules you set next and feed a single table.</div>
              </section>

              {ds === 'loading' && (
                <div className="mt-[22px]">
                  {[{ w: '62%' }, { w: '48%' }, { w: '71%' }, { w: '55%' }].map((s, i) => (
                    <div key={i} className="flex items-center gap-[12px] p-[15px_var(--gutter)] border-t border-[var(--surface-border)] animate-[tfpulse_1.4s_ease-in-out_infinite]">
                      <div className="w-[34px] h-[34px] rounded-[10px] bg-[var(--surface-subtle)] flex-none"></div>
                      <div className="flex-1">
                        <div className="h-[12px] rounded-[4px] bg-[var(--surface-subtle)]" style={{ width: s.w }}></div>
                        <div className="h-[9px] rounded-[4px] bg-[var(--surface-subtle)] w-[34%] mt-[7px]"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

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
                      <div onClick={c.toggle} className="flex items-center gap-[12px] cursor-pointer">
                        <div className={c.crestStyle}>{c.abbr}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-heading font-[650] text-[14px] tracking-[-0.2px] whitespace-nowrap overflow-hidden text-ellipsis">{c.name}</div>
                          <div className={c.metaStyle}>{c.meta}</div>
                        </div>
                        <div className={c.checkStyle}>{c.check}</div>
                      </div>

                      {c.on && (
                        <div className="mt-[13px]">
                          <div className="flex gap-[6px]">
                            {c.scopes.map((s, j) => (
                              <div
                                key={j}
                                onClick={s.pick}
                                className={`h-[32px] px-[12px] rounded-[8px] grid place-items-center cursor-pointer whitespace-nowrap flex-none font-heading font-bold text-[11px] ${s.on ? 'bg-[var(--text-primary)] text-[var(--surface-canvas)]' : 'border border-[var(--surface-border-strong)] text-[var(--text-secondary)]'}`}
                              >
                                {s.label}
                              </div>
                            ))}
                          </div>
                          <div className="text-[10.5px] leading-[1.5] text-[var(--text-muted)] mt-[9px]">{c.scopeNote}</div>

                          {c.pickRounds && (
                            <div className="mt-[13px] border-t border-[var(--surface-border-strong)] pt-[12px]">
                              <div className="flex items-baseline justify-between gap-[10px]">
                                <span className={`tf-kicker ${c.railKickerStyle}`}>{c.railKicker}</span>
                                {c.showRailAction && (
                                  <span onClick={c.railAction} className="tf-tap tf-kicker text-[var(--text-link)] flex-none">START AGAIN</span>
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
                                      <div key={l} onClick={r.pick} className={`tf-num ${r.style}`}>
                                        {r.label}
                                      </div>
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
                      <div onClick={() => setOff(s => ({ ...s, [m.id]: isOn }))} className={`w-[40px] h-[24px] rounded-full flex-none p-[2px] flex cursor-pointer transition-colors duration-150 ${isOn ? 'bg-[var(--color-brand)] justify-end' : 'bg-[var(--surface-border-strong)] justify-start'}`}>
                        <div className="w-[20px] h-[20px] rounded-full bg-[var(--tf-white)] shadow-[var(--elev-1)]"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-heading font-[650] text-[13.5px] tracking-[-0.2px]">{m.name}</div>
                        <div className="text-[10.5px] leading-[1.45] text-[var(--text-muted)] mt-[3px]">{m.note}</div>
                      </div>
                      <div className={`flex items-center rounded-[10px] bg-[var(--surface-subtle)] flex-none ${isOn ? '' : 'invisible'}`}>
                        <div onClick={() => bump(m, -1)} className="tf-tap w-[30px] h-[30px] grid place-items-center text-[15px] text-[var(--text-secondary)]">−</div>
                        <span className="tf-num min-w-[24px] text-center font-heading font-bold text-[15px]">{pts(m)}</span>
                        <div onClick={() => bump(m, 1)} className="tf-tap w-[30px] h-[30px] grid place-items-center text-[15px] text-[var(--text-secondary)]">+</div>
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
                      <div
                        key={i}
                        onClick={() => setLine(l)}
                        className={`h-[32px] px-[12px] rounded-[8px] grid place-items-center cursor-pointer whitespace-nowrap flex-none font-heading font-bold text-[11px] ${line === l ? 'bg-[var(--text-primary)] text-[var(--surface-canvas)]' : 'border border-[var(--surface-border-strong)] text-[var(--text-secondary)]'}`}
                      >
                        {l}
                      </div>
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
                    <div
                      key={i}
                      onClick={() => setLock(l.id)}
                      className={`h-[32px] px-[12px] rounded-[8px] grid place-items-center cursor-pointer whitespace-nowrap flex-none font-heading font-bold text-[11px] ${lock === l.id ? 'bg-[var(--text-primary)] text-[var(--surface-canvas)]' : 'border border-[var(--surface-border-strong)] text-[var(--text-secondary)]'}`}
                    >
                      {l.label}
                    </div>
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
                  <div key={i} onClick={() => setLateJoin(j.id)} className={`flex gap-[12px] items-start p-[14px_var(--gutter)] border-t border-[var(--surface-border)] cursor-pointer ${lateJoin === j.id ? 'bg-[var(--accent-surface)] shadow-[inset_3px_0_0_0_var(--color-brand)]' : ''}`}>
                    <div className={`w-[20px] h-[20px] rounded-full flex-none mt-[1px] grid place-items-center border-[1.5px] ${lateJoin === j.id ? 'border-[var(--color-brand)]' : 'border-[var(--surface-border-strong)]'}`}>
                      <div className={`w-[10px] h-[10px] rounded-full ${lateJoin === j.id ? 'bg-[var(--color-brand)]' : 'bg-transparent'}`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-[650] text-[13.5px] tracking-[-0.2px]">{j.label}</div>
                      <div className="text-[10.5px] leading-[1.5] text-[var(--text-muted)] mt-[3px]">{j.note}</div>
                    </div>
                  </div>
                ))}
                <div onClick={() => setApproval(!approval)} className="flex items-center gap-[12px] p-[14px_var(--gutter)] border-y border-[var(--surface-border)] cursor-pointer">
                  <div className={`w-[40px] h-[24px] rounded-full flex-none p-[2px] flex transition-colors duration-150 ${approval ? 'bg-[var(--color-brand)] justify-end' : 'bg-[var(--surface-border-strong)] justify-start'}`}>
                    <div className="w-[20px] h-[20px] rounded-full bg-[var(--tf-white)] shadow-[var(--elev-1)]"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-heading font-[650] text-[13.5px] tracking-[-0.2px]">Approve every request</div>
                    <div className="text-[10.5px] leading-[1.5] text-[var(--text-muted)] mt-[3px]">{approval ? "Every request waits for an owner or admin." : "Anyone with the link is in immediately."}</div>
                  </div>
                </div>
              </section>

              <section className="mt-[24px]">
                <div className="flex items-baseline justify-between p-[0_var(--gutter)_10px]">
                  <span className="tf-kicker text-[var(--text-muted)]">TIEBREAKERS</span>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase">POINTS FIRST, ALWAYS</span>
                </div>
                {tieOrder.map((id, i) => (
                  <div key={i} className="flex items-center gap-[12px] p-[11px_var(--gutter)] border-t border-[var(--surface-border)]">
                    <span className="tf-num w-[22px] h-[22px] rounded-[6px] flex-none grid place-items-center font-heading font-bold text-[10.5px] bg-[var(--surface-subtle)] text-[var(--text-secondary)]">{i + 1}</span>
                    <span className="flex-1 text-[12.5px] text-[var(--text-primary)]">{MARKETS.find(m => m.id === id)?.tie}</span>
                    <div onClick={() => {
                      if (i > 0) {
                        const n = [...tieOrder];
                        const at = n.indexOf(id);
                        const t = n[at - 1];
                        n[at - 1] = id;
                        n[at] = t;
                        setTieOrder(n);
                      }
                    }} className={`w-[30px] h-[30px] rounded-[8px] flex-none grid place-items-center text-[13px] bg-[var(--surface-subtle)] text-[var(--text-secondary)] ${i === 0 ? 'opacity-30' : 'cursor-pointer'}`}>↑</div>
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

              {ds === 'loading' && (
                <div className="mt-[22px]">
                  {[{ w: '62%' }, { w: '48%' }, { w: '71%' }, { w: '55%' }].map((s, i) => (
                    <div key={i} className="p-[16px_var(--gutter)] border-t border-[var(--surface-border)] animate-[tfpulse_1.4s_ease-in-out_infinite]">
                      <div className="h-[12px] rounded-[4px] bg-[var(--surface-subtle)]" style={{ width: s.w }}></div>
                    </div>
                  ))}
                  <div className="p-[16px] text-center text-[11.5px] text-[var(--text-muted)]">Working out which fixtures make the cut</div>
                </div>
              )}

              {ds !== 'loading' && (
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
                <div className="tf-kicker opacity-75">PUBLISHED · 16 AUGUST</div>
                <div className="font-heading font-bold text-[27px] leading-[1.1] tracking-[-0.9px] mt-[11px]">{name} is live</div>
                <div className="text-[12.5px] leading-[1.6] opacity-85 mt-[9px]">The rules are frozen. Send this to the people you want in — anyone with the link can ask to join.</div>

                <div className="flex gap-[6px] mt-[20px]">
                  {"SUN6QK".split("").map((ch, i) => (
                    <div key={i} className="tf-num flex-1 h-[46px] rounded-[10px] bg-[rgba(255,255,255,.14)] grid place-items-center font-heading font-bold text-[20px]">{ch}</div>
                  ))}
                </div>
                <div className="flex items-center gap-[10px] mt-[10px]">
                  <span className="flex-1 text-[11.5px] opacity-80 whitespace-nowrap overflow-hidden text-ellipsis">topfour.app/j/SUN-6QK</span>
                  <span className="tf-tap font-heading font-bold text-[11px] flex-none">COPY</span>
                </div>
                <div className="tf-tap mt-[16px] h-[48px] rounded-[13px] bg-[var(--tf-white)] text-[var(--tf-green-800)] grid place-items-center font-heading font-bold text-[13.5px]">Share the invitation</div>
              </section>

              <section className="mt-[24px]">
                <div className="tf-kicker text-[var(--text-muted)] p-[0_var(--gutter)_10px]">WHAT NOW</div>
                {[
                  ["1", "Invite the other five and approve their requests"],
                  ["2", "Ask a custom question if you want one before Saturday"],
                  ["3", "Answer Arsenal v Chelsea — it locks at 14:55"]
                ].map(([num, label], i, a) => (
                  <div key={i} className={`flex items-center gap-[12px] p-[14px_var(--gutter)] border-t border-[var(--surface-border)] cursor-pointer ${i === a.length - 1 ? 'border-b' : ''}`}>
                    <span className="tf-num w-[22px] flex-none font-heading font-bold text-[11.5px] text-[var(--text-muted)]">{num}</span>
                    <span className="flex-1 text-[12.5px] leading-[1.5] text-[var(--text-secondary)]">{label}</span>
                    <span className="text-[13px] text-[var(--text-muted)] flex-none">›</span>
                  </div>
                ))}
              </section>
              <div className="h-[26px]"></div>
            </div>
          )}
        </main>

        {step !== 'done' && (
          <div className="flex-none border-t border-[var(--surface-border)] bg-[var(--surface-card)] p-[11px_var(--gutter)_15px]">
            <div className="flex justify-between items-baseline mb-[10px]">
              <span className="text-[11px] text-[var(--text-muted)]">
                {{ '1': 'Draft saved automatically', '2': 'Competitions chosen', '3': 'Most a match can be worth', '4': 'Tiebreakers in order', '5': 'Fixtures at publication' }[step]}
              </span>
              <span className="tf-num font-heading font-bold text-[12px]">
                {{ '1': 'Just now', '2': String(selectedComps.length), '3': maxPoints + ' pts', '4': String(tieOrder.length), '5': String(totalFixtures) }[step]}
              </span>
            </div>
            <div onClick={() => {
              if (!canNext) return;
              if (step === '5') { setSheet('publish'); return; }
              setStep(nextFor[step] as any);
            }} className={`h-[48px] rounded-[13px] grid place-items-center font-heading font-bold text-[14px] tracking-[-0.1px] ${canNext ? 'bg-[var(--brand-fill)] text-[var(--color-on-brand)] cursor-pointer shadow-[var(--elev-glow)]' : 'bg-[var(--surface-subtle)] text-[var(--text-muted)]'}`}>
              {step === '5' ? 'Publish the league' : canNext ? 'Continue' : selectedComps.length === 0 ? 'Choose at least one' : 'Finish the rounds first'}
            </div>
          </div>
        )}

        {sheet === 'publish' && (
          <div onClick={() => setSheet(null)} className="absolute inset-0 z-50 bg-[var(--scrim)] flex items-end">
            <div className="w-full bg-[var(--surface-card)] rounded-[20px_20px_27px_27px] p-[18px_var(--gutter)_22px] animate-[tfup_0.22s_cubic-bezier(0.2,0.8,0.2,1)] shadow-[var(--elev-4)]" onClick={e => e.stopPropagation()}>
              <div className="w-[38px] h-[4px] rounded-full bg-[var(--surface-border-strong)] mx-auto mb-[15px]"></div>
              <div className="font-heading font-bold text-[19px] leading-[1.2] tracking-[-0.5px]">Publish {name || 'league'}?</div>
              <div className="text-[12.5px] leading-[1.6] text-[var(--text-secondary)] mt-[9px]">This cannot be undone. To run different rules you would clone the league and publish that instead.</div>
              <div className="mt-[14px]">
                {[
                  `${totalFixtures} fixtures are added and the first deadline is set for Saturday 14:55.`,
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
                <div onClick={() => setSheet(null)} className="tf-tap flex-1 h-[48px] rounded-[12px] border border-[var(--surface-border-strong)] grid place-items-center font-heading font-bold text-[12.5px]">Keep editing</div>
                <div onClick={() => {
                  if (createLeague.isPending) return;
                  const idempotencyKey = crypto.randomUUID();
                  const MARKET_MAP: Record<string, string> = {
                    result: 'match_result',
                    score: 'exact_score',
                    btts: 'both_teams_to_score',
                    goals: 'total_goals',
                    scorer: 'anytime_goalscorer',
                    card: 'player_card',
                    lineup: 'lineup'
                  };
                  const LOCK_MAP: Record<string, string> = {
                    'kick': 'at_kickoff',
                    '5m': 'minutes_5',
                    '15m': 'minutes_15',
                    '30m': 'minutes_30',
                    '60m': 'minutes_60',
                    '2h': 'minutes_120',
                    'custom': 'custom'
                  };
                  
                  const compScopes = selectedComps.map(c => ({
                    supportedCompetitionId: c.supportedCompetitionId,
                    seasonId: c.seasonId,
                    kind: "full_season"
                  }));

                  const payload = {
                    name: name || "New League",
                    description: description || undefined,
                    invitationSettings: { joinApprovalRequired: approval, enabled: true },
                    configuration: {
                      competitionScopes: compScopes,
                      markets: MARKETS.map(m => ({
                        marketType: MARKET_MAP[m.id],
                        enabled: on(m),
                        points: pts(m)
                      })),
                      tiebreakers: tieOrder.map(id => MARKET_MAP[id]).filter(Boolean),
                      standardLock: { kind: LOCK_MAP[lock] || 'minutes_5' }
                    }
                  };
                  createLeague.mutate({ idempotencyKey, payload }, {
                    onSuccess: (data) => {
                      setCreatedLeagueId(data.id);
                      setStep('done');
                    }
                  });
                }} className={`tf-tap flex-1 h-[48px] rounded-[12px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] grid place-items-center font-heading font-bold text-[12.5px] shadow-[var(--elev-glow)] ${createLeague.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {createLeague.isPending ? 'Publishing...' : 'Publish'}
                </div>
              </div>
            </div>
          </div>
        )}

      </div></div>
  );
}
