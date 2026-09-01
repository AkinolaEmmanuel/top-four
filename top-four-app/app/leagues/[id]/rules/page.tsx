'use client';

import { useState } from 'react';
import { LeagueRulesMobile } from '../../../components/leagues/LeagueRulesMobile';
import { LeagueRulesDesktop } from '../../../components/leagues/LeagueRulesDesktop';
import { useLeague } from '@/hooks/api/useLeagues';
import { useAuth } from '@/context/auth-context';

export default function LeagueRulesPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const { data: league, isLoading: leagueLoading, isError: leagueError } = useLeague(params.id);

  const [theme] = useState<'light' | 'dark'>('dark');
  const [screen] = useState<'rules' | 'settings' | 'participant'>('rules');

  const isLoading = leagueLoading;
  const isTerminal = leagueError || (!isLoading && !league);
  const isReady = !isLoading && !isTerminal;

  const role = league?.membership?.role || 'participant';
  const isOwner = role === 'owner';
  const participant = role === 'participant';
  const isRules = screen === "rules";

  const leagueName = league?.name || 'League';
  const createdDate = league?.createdAt
    ? new Date(league.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
    : '12 August';

  const LINE = "flex items-center gap-[12px] p-[16px_var(--gutter)] border-b border-[var(--surface-border)] last:border-b-0";
  const frozen = (title: string, value: string, note?: string) => ({ cls: LINE, locked: true, title, value, note: note || "", hasNote: !!note, titleColor: "var(--text-primary)", valStyle: "", chevron: false });
  const editable = (title: string, value: string, note?: string) => ({ cls: `${LINE} cursor-pointer`, locked: false, title, value, note: note || "", hasNote: !!note, titleColor: "var(--text-primary)", valStyle: "text-[var(--text-link)]", chevron: true });
  const readonly = (title: string, value: string, note?: string) => ({ cls: LINE, locked: false, title, value, note: note || "", hasNote: !!note, titleColor: "var(--text-primary)", valStyle: "", chevron: false });

  // Competitions from real league
  const compsFromLeague = league?.competitions?.length
    ? league.competitions.map(c => frozen(c.displayName, "Full season", "2025/26"))
    : [
        frozen("Premier League", "Full season", "2025/26 · all 38 rounds"),
        frozen("Champions League", "Rounds 1–8", "2025/26 · league phase only")
      ];

  const lockMinutes = league?.configuration?.standardLock?.offsetMinutes ?? 15;

  const RULES = [
    { label: "Competitions", hasIntro: true, intro: "Chosen once, at publication. A league cannot gain or lose a competition afterwards.", lines: compsFromLeague },
    { label: "Markets and points", hasIntro: true, intro: "Every enabled market and what a correct answer is worth.", lines: [
      frozen("Match result", "2 pts"),
      frozen("Exact score", "5 pts"),
      frozen("Both teams to score", "1 pt"),
      frozen("Total goals", "1 pt", "Over or under 2.5"),
      frozen("Anytime goalscorer", "5 pts", "Extra time counts; shootouts and own goals do not"),
      frozen("Player card", "4 pts", "Yellow, second yellow or straight red, if the player appears"),
      frozen("Starting lineups", "1 pt per starter", "Both elevens, 22 points at most")
    ]},
    { label: "Timing and joining", hasIntro: false, intro: "", lines: [
      frozen("Standard lock", `${lockMinutes} minutes before`, "Applies to every market except the lineups"),
      frozen("Lineup lock", "2 hours before", "Fixed by TopFour — the standard lock never applies to it"),
      frozen("Late joining", "Permitted", "A late member starts on zero and cannot answer locked matches")
    ]},
    { label: "Tiebreakers", hasIntro: true, intro: "Applied in order when totals are equal. Members who tie on all of them share a position.", lines: [
      frozen("1 · Exact scores correct", ""),
      frozen("2 · Match results correct", ""),
      frozen("3 · Anytime goalscorers correct", "")
    ]}
  ];

  const memberCount = league?.memberCount || 1;

  const OWNER = [
    { label: "League", hasIntro: true, intro: "These stay editable for the life of the league.", lines: [
      editable("Name", leagueName),
      editable("Description", league?.description || "No description"),
      editable("Crest colour", "Brand")
    ]},
    { label: "Joining", hasIntro: false, intro: "", lines: [
      editable("Invitation links", league?.invitationSettings?.enabled === false ? "Off" : "On", "Anyone with a link can request to join"),
      editable("Approve new members", league?.invitationSettings?.joinApprovalRequired ? "Required" : "Automatic", "You or an admin approves every request"),
      readonly("Members", `${memberCount} members`)
    ]},
    { label: "Notifications", hasIntro: true, intro: "Applies to your own email only. Other members choose their own.", lines: [
      editable("Deadline reminders", "On", "We never promise a send time"),
      editable("Results and corrections", "On")
    ]},
    { label: "Frozen at publication", hasIntro: true, intro: `Locked on ${createdDate}. Cloning the league is the only way to play these rules differently.`, lines: [
      frozen("Competitions", `${league?.competitions?.length || 1} selected`),
      frozen("Markets and points", "7 enabled · 40 max"),
      frozen("Standard lock", `${lockMinutes} minutes before`),
      frozen("Late joining", "Permitted"),
      frozen("Tiebreakers", "3 in order")
    ]}
  ];

  const PARTICIPANT = [
    { label: "Your notifications", hasIntro: true, intro: "The only settings a participant controls. Everything else belongs to the owner.", lines: [
      editable("Deadline reminders", "On"),
      editable("Results and corrections", "On")
    ]},
    { label: "This league", hasIntro: true, intro: "Read-only for you. The owner can change the first three; nothing can change the rest.", lines: [
      readonly("Name", leagueName),
      readonly("Approve new members", league?.invitationSettings?.joinApprovalRequired ? "Required" : "Automatic"),
      readonly("Members", String(memberCount)),
      frozen("Markets and points", "7 enabled · 40 max"),
      frozen("Standard lock", `${lockMinutes} minutes before`)
    ]}
  ];

  const sections = isRules ? RULES : (isOwner ? OWNER : PARTICIPANT);

  const TERM = {
    notfound: ["ghost", "var(--text-muted)", "Not found, or no longer available", "This league either does not exist or is not one you can see. TopFour does not say which — that distinction would itself leak who is in which league.", "BACK TO MY LEAGUES"],
    error: ["warning", "var(--warn-text)", "The rules didn't load", "Check your connection and try again. Nothing about the league has changed.", "RETRY"]
  }[isTerminal ? "error" : "error"];

  const IconMap: Record<string, any> = {
    lock: (size: number) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
        <path d="M8.4 10.5V8a3.6 3.6 0 0 1 7.2 0v2.5" />
      </svg>
    ),
    back: (size: number) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M14.5 5 8 12l6.5 7" />
      </svg>
    ),
    warning: (size: number) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M12 3 2.8 20h18.4L12 3Z" />
        <path d="M12 9v4.5M12 17h.01" />
      </svg>
    ),
    ghost: (size: number) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M9 9.5h.01M15 9.5h.01M9 15.2c1.8-1.4 4.2-1.4 6 0" />
      </svg>
    )
  };

  const headTitle = isRules ? "League rules" : "League settings";
  const headSub = isRules ? `${leagueName} · frozen ${createdDate}` : `${leagueName} · ${isOwner ? "owner" : "participant"}`;
  
  const frozenText = isRules
    ? "Everything here was fixed when the league was published. It cannot be changed for this league — cloning creates a new one with different rules."
    : (isOwner ? "Name, joining and notifications stay editable. The scoring rules below the padlock froze at publication."
               : "You can change your own reminders. The rest is the owner's, and the scoring rules are nobody's — they froze at publication.");

  const showMaxPoints = isReady && isRules;
  const showDanger = isReady && isOwner;

  const dangerLinesMobile = [
    { title: "Clone this league", note: "A fresh draft with these rules, ready to change. Members do not carry over." },
    { title: "Archive this league", note: "Hidden from active views. History is kept and stays readable." },
    { title: "Cancel this league", note: "Permanent. Started fixtures settle, everything still open is voided." }
  ];

  const footNote = isRules ? "Shown to every member, in the same words. Nobody plays to different rules." : "Changes save one at a time and take effect immediately.";

  // --- Desktop Specific Logic ---
  const MARKETS = [
    { name: "Match result", note: "Home, draw or away", pts: 2, color: "var(--cat-1)" },
    { name: "Exact score", note: "Both teams' goals", pts: 5, color: "var(--cat-6)" },
    { name: "Both teams to score", note: "Yes or no", pts: 1, color: "var(--cat-2)" },
    { name: "Total goals", note: "Over or under 2.5", pts: 1, color: "var(--cat-4)" },
    { name: "Anytime goalscorer", note: "Own goals don't count", pts: 5, color: "var(--cat-3)" },
    { name: "Player card", note: "Not run in this league", pts: 0, off: true, color: "var(--cat-5)" },
    { name: "Correct lineup starter", note: "Per player, across both elevens", pts: 1, perPlayer: true, color: "var(--cat-7)" }
  ];

  const COMPS = league?.competitions?.length
    ? league.competitions.map(c => ({
        abbr: c.displayName.substring(0, 3).toUpperCase(),
        name: c.displayName,
        scope: "Whole season"
      }))
    : [
        { abbr: "EPL", name: "English Premier League", scope: "Whole season · 38 rounds" },
        { abbr: "UCL", name: "UEFA Champions League", scope: "Matchdays 1–8" }
      ];

  const enabled = MARKETS.filter(m => !m.off);
  const maxPointsDesktop = enabled.reduce((a, m) => a + m.pts * (m.perPlayer ? 22 : 1), 0);

  const marketsDesktop = MARKETS.map((m, i, a) => ({
    name: m.name, note: m.note,
    nameColor: m.off ? "var(--text-muted)" : "var(--text-primary)",
    pts: m.off ? "off" : (m.perPlayer ? m.pts + " × 22" : m.pts + (m.pts === 1 ? " pt" : " pts")),
    ptsStyle: { flex: "none", font: "700 13px 'DM Sans',sans-serif", fontVariantNumeric: "tabular-nums", color: m.off ? "var(--text-muted)" : "var(--text-primary)" },
    swatchStyle: { width: "9px", height: "32px", borderRadius: "3px", flex: "none", background: m.color, opacity: m.off ? 0.35 : 1 },
    rowStyle: { display: "flex", alignItems: "center", gap: "13px", padding: "13px 18px", borderBottom: i === a.length - 1 ? "none" : "1px solid var(--surface-border)", opacity: m.off ? 0.65 : 1 }
  }));

  const tiebreakersDesktop = [
    { n: "1", label: "Total points" }, { n: "2", label: "Exact scores correct" },
    { n: "3", label: "Match results correct" }, { n: "4", label: "Lineup players correct" }
  ];

  const deadlinesDesktop = [
    { label: "Standard lock", value: `${lockMinutes} min`, note: "before each kick-off" },
    { label: "Lineups", value: "2 hours", note: "always, whatever the standard lock is" },
    { label: "Custom questions", value: "Per question", note: "set when the question is written" }
  ];

  const dangerLinesDesktop = [
    { label: "Complete the league", action: "Complete", note: "Available once every fixture and question has settled. Points stay readable forever." },
    { label: "Cancel the league", action: "Cancel", note: "Voids every prediction and every point. Only for a league that should never have run.", danger: true },
    { label: "Archive the league", action: "Archive", note: "Hides it from active lists after completion. Nothing is deleted." }
  ].map(d => ({
    label: d.label, note: d.note, action: d.action,
    btnStyle: { flex: "none", padding: "0 16px", height: "38px", borderRadius: "10px", display: "grid", placeItems: "center", font: "600 11.5px 'DM Sans',sans-serif", cursor: "pointer", border: d.danger ? "1px solid var(--color-danger)" : "1px solid var(--surface-border-strong)", color: d.danger ? "var(--danger-text)" : "inherit" }
  }));

  const editableDesktop = [
    { label: "League name and description", note: "Members see the change immediately" },
    { label: "Invitation links", note: "Create, share or revoke" },
    { label: "Admins", note: "Promote or demote members" },
    { label: "Approval for new members", note: league?.invitationSettings?.joinApprovalRequired ? "Currently on" : "Currently off" }
  ];

  const rootNav = [["Home","home",""],["Predict","predict",""],["Leagues","leagues",""]].map((it) => {
    const label = it[0], id = it[1], badge = it[2];
    return {
      label, id, badge,
      badgeStyle: badge ? { marginLeft: '7px', minWidth: '16px', height: '16px', padding: '0 4px', borderRadius: '8px', background: 'var(--nav-accent)', color: 'var(--nav-on-accent)', display: 'inline-grid', placeItems: 'center', font: "700 9px 'DM Sans',sans-serif" } : { display: 'none' },
      style: { display: 'flex', alignItems: 'center', padding: '7px 13px', borderRadius: '9px', font: "600 12.5px 'DM Sans',sans-serif", cursor: 'pointer', background: id === "leagues" ? 'var(--nav-fill)' : 'transparent', opacity: id === "leagues" ? 1 : 0.66 } 
    };
  });

  const tabItem = (label: string, on: boolean) => ({
    label, style: { padding: '0 13px', height: '43px', display: 'flex', alignItems: 'center', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: '12.5px', cursor: 'pointer', borderBottom: `2px solid ${on ? 'var(--color-brand)' : 'transparent'}`, color: on ? 'var(--text-primary)' : 'var(--text-muted)' }
  });

  const TERM_ICON_DESKTOP = IconMap[TERM[0] as string] ? IconMap[TERM[0] as string](40) : null;

  const propsMobile = {
    theme, params, isLoading, isTerminal, isReady, isRules, isOwner,
    ds: isTerminal ? 'error' : isLoading ? 'loading' : 'live',
    IconMap, TERM, headTitle, headSub, frozenText, showMaxPoints,
    showDanger, sections, dangerLines: dangerLinesMobile, footNote, retry: () => {}, dataState: 'live',
    leagueName
  };

  const propsDesktop = {
    theme, rootNav, avatarInitials: (user?.displayName || "KA").substring(0, 2).toUpperCase(), avatarName: user?.displayName || "Kolade",
    showContext: !isTerminal, roleLine: participant ? "You play in this league" : isOwner ? "You own this league" : "You are an admin",
    contextTabs: [tabItem("Overview", false), tabItem("Fixtures", false), tabItem("Table", false), tabItem("Questions", false), tabItem("More", true)],
    isLoading, skeletons: [{ w: "58%" }, { w: "70%" }, { w: "46%" }, { w: "64%" }],
    isTerminal, termIcon: TERM_ICON_DESKTOP, termIconColor: TERM[1], termTitle: TERM[2], termBody: TERM[3], termAction: TERM[4],
    termActionStyle: { marginTop: "24px", padding: "0 22px", height: "48px", borderRadius: "13px", border: "1px solid var(--surface-border-strong)", background: "var(--surface-card)", display: "grid", placeItems: "center", font: "700 12.5px 'DM Sans',sans-serif", cursor: "pointer" },
    retry: () => {},
    isReady, showMaxPoints: true,
    heroStyle: { flex: "none", background: "var(--nav-surface)", color: "var(--nav-text)", padding: "24px 0 26px", borderBottom: "1px solid rgba(255,255,255,.1)" },
    maxPoints: String(maxPointsDesktop), maxNote: "Five markets at " + enabled.filter(m => !m.perPlayer).reduce((a, m) => a + m.pts, 0) + " points, plus twenty-two lineup places at 1 each — both elevens. Player card is not run here.",
    showFrozenBanner: true, lockIcon: IconMap.lock(16),
    frozenText: participant ? "These rules were frozen when the league was published. Nobody can change them now, including the owner — you answered under them, so they hold." : "Scoring, tiebreakers and competitions froze at publication. Members answered under them, so they cannot change while the league runs.",
    markets: marketsDesktop, tiebreakers: tiebreakersDesktop,
    comps: COMPS.map(c => ({ abbr: c.abbr, name: c.name, scope: c.scope, abbrStyle: { width: "38px", height: "28px", borderRadius: "8px", flex: "none", display: "grid", placeItems: "center", font: "700 9.5px 'DM Sans',sans-serif", background: "var(--surface-subtle)", color: "var(--text-secondary)" } })),
    deadlines: deadlinesDesktop, showDanger: isOwner, dangerLines: dangerLinesDesktop,
    showEditable: isOwner, editable: editableDesktop, showLeave: participant,
    footNote: participant ? "If a rule here looks wrong, it is still the rule — raise it with an admin rather than expecting a correction. Only a platform re-settlement can move points after the fact, never a league admin." : "Changing anything frozen would mean members had answered under different rules. That is why the only route is completing this league and starting another.",
    leagueName, params
  };

  return (
    <div className="flex flex-col flex-1 h-[100dvh] md:h-auto overflow-hidden bg-[var(--surface-canvas)] relative">
      <div className="md:hidden flex flex-col flex-1 overflow-hidden h-[100dvh]">
        <LeagueRulesMobile {...propsMobile} />
      </div>
      <div className="hidden md:flex flex-col flex-1 overflow-hidden h-full">
        <LeagueRulesDesktop {...propsDesktop} />
      </div>
    </div>
  );
}
