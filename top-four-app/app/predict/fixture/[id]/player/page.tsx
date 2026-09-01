'use client';

import { useState } from 'react';
import { PlayerPickerMobile } from '../../../../components/predict/PlayerPickerMobile';
import { PlayerPickerDesktop } from '../../../../components/predict/PlayerPickerDesktop';
import { useFixtureSquads } from '@/hooks/api/useFixtures';

const TINTS = ["var(--ident-1)", "var(--ident-2)", "var(--ident-3)", "var(--ident-4)", "var(--ident-5)", "var(--ident-6)", "var(--ident-7)"];

export default function PlayerPickerPage({ params }: { params: { id: string } }) {
  const { data: squadsData, isLoading: squadsLoading, isError: squadsError } = useFixtureSquads(params.id);

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mode, setMode] = useState<'scorer' | 'card'>('scorer');
  const [picked, setPicked] = useState<string | null>(null);
  const [side, setSide] = useState<string>('both');
  const [pos, setPos] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const isLoading = squadsLoading;
  const isTerminal = squadsError;
  const isReady = !isLoading && !isTerminal;

  // Build player lists from API data
  const homeSquad = squadsData?.homeSquad;
  const awaySquad = squadsData?.awaySquad;
  const homeCode = homeSquad?.team.code || 'HOM';
  const awayCode = awaySquad?.team.code || 'AWA';
  const homeName = homeSquad?.team.displayName || 'Home Team';
  const awayName = awaySquad?.team.displayName || 'Away Team';
  const homeColor = homeSquad?.team.code ? `var(--club-${homeSquad.team.code.toLowerCase()}, #666)` : '#666';
  const awayColor = awaySquad?.team.code ? `var(--club-${awaySquad.team.code.toLowerCase()}, #666)` : '#666';

  const CLUB: Record<string, string> = {};
  if (homeSquad) CLUB[homeCode] = homeColor;
  if (awaySquad) CLUB[awayCode] = awayColor;

  const homePlayers = (homeSquad?.players || []).map(p => ({
    id: p.id,
    shirt: p.shirtNumber,
    name: p.displayName,
    pos: p.position,
    initials: p.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }));

  const awayPlayers = (awaySquad?.players || []).map(p => ({
    id: p.id,
    shirt: p.shirtNumber,
    name: p.displayName,
    pos: p.position,
    initials: p.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }));

  const ALL = homePlayers.concat(awayPlayers);

  const searching = searchQuery.length > 0;
  const ds = isLoading ? 'loading' : isTerminal ? 'stale' : searching ? 'searching' : 'live';

  const DEFAULT_PICK: Record<string, string | null> = { scorer: null, card: null };
  const currentPicked = picked !== null ? picked : DEFAULT_PICK[mode];
  const pickedPlayer = ALL.find(p => p.id === currentPicked) || null;

  const currentPos = searching ? "All" : pos;

  const chipStyle = (on: boolean) => `h-[32px] px-[12px] rounded-full grid place-items-center whitespace-nowrap flex-none cursor-pointer font-heading font-bold text-[10.5px] ${on ? 'bg-[var(--text-primary)] text-[var(--surface-canvas)]' : 'border border-[var(--surface-border-strong)] text-[var(--text-secondary)]'}`;
  
  const chipClsDesktop = (on: boolean) => `h-[32px] flex items-center px-[13px] border border-[var(--surface-border-strong)] rounded-full font-heading font-semibold text-[11px] leading-[1] whitespace-nowrap text-[var(--text-secondary)] cursor-pointer ${on ? 'bg-[var(--color-brand)] !border-[var(--color-brand)] text-[var(--color-on-brand)]' : ''}`;

  const mobileChips = [
    ["both", "Both teams", "side"], [homeCode, homeName, "side"], [awayCode, awayName, "side"],
    ["All", "All", "pos"], ["GK", "GK", "pos"], ["DEF", "DEF", "pos"], ["MID", "MID", "pos"], ["FWD", "FWD", "pos"], ["Unlisted", "Unlisted", "pos"]
  ].map(([id, label, group]) => ({
    label,
    style: chipStyle(group === "side" ? side === id : currentPos === id),
    pick: () => { if (group === "side") setSide(id); else setPos(id); }
  }));

  const sideChips = [
    ["both", "Both teams"], [homeCode, homeName], [awayCode, awayName]
  ].map(([id, label]) => ({
    label, cls: chipClsDesktop(side === id), pick: () => setSide(id)
  }));
  
  const posChips = [
    ["All", "All"], ["GK", "GK"], ["DEF", "DEF"], ["MID", "MID"], ["FWD", "FWD"], ["Unlisted", "Unlisted"]
  ].map(([id, label]) => ({
    label, cls: chipClsDesktop(currentPos === id), pick: () => setPos(id)
  }));

  const matches = (p: any) => {
    if (searching && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (currentPos === "Unlisted") return p.pos === null;
    if (currentPos !== "All" && p.pos !== currentPos) return false;
    return true;
  };

  const buildGroupsMobile = (list: any[]) => list.filter(matches).map((p, i) => {
    const on = currentPicked === p.id;
    return {
      id: p.id,
      shirt: p.shirt === null ? "—" : p.shirt,
      name: p.name, initials: p.initials,
      tint: TINTS[i % TINTS.length],
      meta: p.pos === null ? "Position not listed" : p.pos,
      metaColor: p.pos === null ? "var(--text-muted)" : "var(--text-secondary)",
      nameStyle: `font-heading ${on ? 'font-bold' : 'font-semibold'} text-[13.5px] leading-[1.2] whitespace-nowrap overflow-hidden text-ellipsis`,
      rowStyle: `flex items-center gap-[11px] p-[11px_var(--gutter)] border-b border-[var(--surface-border)] cursor-pointer ` + (on ? "bg-[var(--accent-surface)] shadow-[inset_3px_0_0_0_var(--color-brand)]" : ""),
      mark: on ? "YOUR PICK" : "",
      markStyle: on ? "font-heading font-bold text-[9px] tracking-[0.06em] p-[5px_8px] rounded-[6px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] flex-none" : "hidden",
      pick: () => setPicked(p.id)
    };
  });

  const buildGroupsDesktop = (list: any[]) => list.filter(matches).map((p, i) => {
    const on = currentPicked === p.id;
    return {
      id: p.id,
      shirt: p.shirt === null ? "—" : p.shirt,
      name: p.name, initials: p.initials,
      tint: TINTS[i % TINTS.length],
      meta: p.pos === null ? "Position not listed" : p.pos,
      metaColor: p.pos === null ? "var(--text-muted)" : "var(--text-secondary)",
      badgeStyle: { width: '34px', height: '34px', borderRadius: '999px', flex: 'none', display: 'grid', placeItems: 'center', font: "700 11px 'DM Sans', sans-serif", color: 'var(--text-primary)', background: TINTS[i % TINTS.length] },
      rowStyle: { display: 'flex', alignItems: 'center', gap: '11px', padding: '11px 20px', borderBottom: '1px solid var(--surface-border)', cursor: 'pointer', background: on ? 'var(--accent-surface)' : 'transparent', boxShadow: on ? 'inset 3px 0 0 0 var(--color-brand)' : 'none' },
      mark: on ? "YOUR PICK" : "",
      markStyle: on ? { font: "700 9.5px 'DM Sans', sans-serif", letterSpacing: '.07em', padding: '5px 8px', borderRadius: '6px', background: 'var(--brand-fill)', color: 'var(--color-on-brand)', flex: 'none' } : { display: 'none' },
      pick: () => setPicked(p.id)
    };
  });

  const filteredHomePlayers = homePlayers.filter(matches);
  const filteredAwayPlayers = awayPlayers.filter(matches);

  const mHome = { code: homeCode, name: homeName, color: homeColor, players: buildGroupsMobile(homePlayers), count: searching ? `${filteredHomePlayers.length} shown` : `${homePlayers.length} in squad` };
  const mAway = { code: awayCode, name: awayName, color: awayColor, players: buildGroupsMobile(awayPlayers), count: searching ? `${filteredAwayPlayers.length} shown` : `${awayPlayers.length} in squad` };
  const mobileGroups = side === homeCode ? [mHome] : side === awayCode ? [mAway] : [mHome, mAway];

  const dHome = { code: homeCode, name: homeName, color: homeColor, players: buildGroupsDesktop(homePlayers), count: searching ? `${filteredHomePlayers.length} shown` : `${homePlayers.length} in squad` };
  const dAway = { code: awayCode, name: awayName, color: awayColor, players: buildGroupsDesktop(awayPlayers), count: searching ? `${filteredAwayPlayers.length} shown` : `${awayPlayers.length} in squad` };
  const rawDGroups = side === homeCode ? [dHome] : side === awayCode ? [dAway] : [dHome, dAway];
  const desktopGroups = rawDGroups.map((g, i) => ({ ...g, colStyle: { minWidth: 0, borderRight: (i === 0 && rawDGroups.length > 1) ? '1px solid var(--surface-border)' : 'none' } }));

  const TERM = {
    noresults: ["empty", "var(--text-muted)", "No player matches that", "Nobody in either squad matches your search. Search filters the squads TopFour holds for this match — it cannot add a player to them.", "CLEAR THE SEARCH"],
    stale: ["warning", "var(--warn-text)", "This squad list has moved on", "The squad TopFour holds for this match was refreshed while you were looking, so these names are no longer the ones a pick would be checked against. Reloading brings the current list; anything already saved is untouched.", "RELOAD THE SQUAD"]
  }[isTerminal ? 'stale' : "noresults"];

  const MARKET = {
    scorer: ["Anytime goalscorer", "4 pts", "Extra time counts. A penalty shootout does not, and an own goal is not a goalscorer. A player who never gets on the pitch is simply wrong."],
    card: ["Player to be carded", "1 pt", "A yellow, a second yellow and a straight red all count, including in extra time. A card shown to an unused substitute does not."]
  }[mode];

  const IconMap: Record<string, any> = {
    search: (size: number) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <circle cx="10.5" cy="10.5" r="5.5" />
        <path d="m15 15 4 4" />
      </svg>
    ),
    warning: (size: number) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path d="M12 3 2.8 20h18.4L12 3Z" />
        <path d="M12 9v4.5M12 17h.01" />
      </svg>
    ),
    empty: (size: number) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </svg>
    )
  };

  const termIcon = IconMap[TERM[0]](32);
  const searchIcon = IconMap["search"](16);

  const tabItem = (label: string, on: boolean) => ({
    label, style: { display: 'flex', alignItems: 'center', padding: '0 13px', height: '43px', font: "600 12.5px 'DM Sans', sans-serif", cursor: 'pointer', borderBottom: `2px solid ${on ? 'var(--color-brand)' : 'transparent'}`, color: on ? 'var(--text-primary)' : 'var(--text-muted)' }
  });

  const rootNav = [["Home","home",""],["Predict","predict",""],["Leagues","leagues",""]].map(function(it){
    var label=it[0], id=it[1], badge=it[2];
    return { label: label, badge: badge,
      badgeStyle: badge ? { marginLeft: '7px', minWidth: '16px', height: '16px', padding: '0 4px', borderRadius: '8px', background: 'var(--nav-accent)', color: 'var(--nav-on-accent)', display: 'inline-grid', placeItems: 'center', font: "700 9px 'DM Sans', sans-serif" } : { display: 'none' },
      style: { display: 'flex', alignItems: 'center', padding: '7px 13px', borderRadius: '9px', font: "600 12.5px 'DM Sans', sans-serif", cursor: 'pointer', background: id === 'leagues' ? 'var(--nav-fill)' : 'transparent', opacity: id === 'leagues' ? 1 : 0.66 } 
    };
  });

  const skeletonCols = [0, 1].map(() => ({ rows: [{ w: "62%" }, { w: "48%" }, { w: "71%" }, { w: "55%" }, { w: "66%" }, { w: "44%" }, { w: "58%" }] }));

  const props = {
    theme, MARKET, CLUB, searching, ds, termIcon, TERM, isTerminal, isReady,
    isLoading, pickedPlayer, setDataState: () => {}, searchIcon,
    
    // Mobile specific
    chips: mobileChips,
    mobileGroups,

    // Desktop specific
    contextTabs: [tabItem("Overview", false), tabItem("Fixtures", true), tabItem("Table", false), tabItem("Questions", false), tabItem("More", false)],
    rootNav, sideChips, posChips, skeletonCols,
    ghostRows: [{ label: "Match result", value: "—" }, { label: "Exact score", value: "—" }, { label: "Both teams to score", value: "—" }, { label: "Anytime goalscorer", value: "Choose" }],
    sheetTitle: mode === "scorer" ? "Who scores?" : "Who gets booked?",
    sheetSub: MARKET[0] + " · one player from either squad.",
    modalWidth: "880px",
    columnTemplate: "minmax(0,1fr) minmax(0,1fr)",
    desktopGroups,
    storedStyle: pickedPlayer ? { display: 'flex', alignItems: 'center', gap: '8px', font: "600 12px 'DM Sans', sans-serif", color: 'var(--success-text)' } : { display: 'none' },
    storedDotStyle: { width: '7px', height: '7px', borderRadius: '999px', background: 'var(--color-success)', flex: 'none' },
    storedLabel: pickedPlayer ? pickedPlayer.name + " stored · you can change it until the lock" : "",
    cancelStyle: { display: 'none' },
    primaryLabel: "DONE",
    primaryStyle: { flex: 'none', minWidth: '190px', height: '46px', padding: '0 22px', borderRadius: '12px', display: 'grid', placeItems: 'center', font: "700 12.5px 'DM Sans', sans-serif", letterSpacing: '.02em', background: pickedPlayer ? 'var(--brand-fill)' : 'var(--surface-subtle)', color: pickedPlayer ? 'var(--color-on-brand)' : 'var(--text-muted)', cursor: pickedPlayer ? 'pointer' : 'not-allowed' },
    footNote: MARKET[2],
    leagueName: "League",
    competitionLabel: `${homeName} v ${awayName}`
  };

  return (
    <div className="flex flex-col flex-1 h-[100dvh] md:h-auto overflow-hidden bg-[var(--surface-canvas)] relative">
      <div className="md:hidden flex flex-col flex-1 overflow-hidden h-[100dvh]">
        <PlayerPickerMobile {...props} groups={mobileGroups} />
      </div>
      <div className="hidden md:flex flex-col flex-1 overflow-hidden h-full">
        <PlayerPickerDesktop {...props} groups={desktopGroups} />
      </div>
    </div>
  );
}
