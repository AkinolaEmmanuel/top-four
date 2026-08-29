'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AlertsPage() {
  const [view, setView] = useState<'list' | 'prefs' | 'loading' | 'empty'>('list');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [filter, setFilter] = useState<string>('All');
  const [read, setRead] = useState<Record<string, boolean>>({});
  const [prefs, setPrefs] = useState<Record<string, boolean>>({ reminders: true, questions: true });

  const NOTES: any[] = [];
  const isLoading = view === "loading";
  const isEmpty = view === "empty" || NOTES.length === 0;
  const onList = view === "list";
  const onPrefs = view === "prefs";
  const showList = onList && !isLoading && !isEmpty;

  const isUnread = (n: any) => n.unread && !read[n.title];
  const unreadCount = NOTES.filter(isUnread).length;

  const match = (n: any) => {
    if (filter === "Unread") return isUnread(n);
    if (filter === "Deadlines") return n.kind === "Deadline";
    if (filter === "Points") return n.kind === "Settled" || n.kind === "Correction";
    return true;
  };
  const shown = NOTES.filter(match);

  const names: string[] = [];
  shown.forEach(n => { if (!names.includes(n.group)) names.push(n.group); });

  const groups = names.map(g => ({
    label: g,
    rows: shown.filter(n => n.group === g).map((n, i, a) => {
      const u = isUnread(n);
      return {
        ...n,
        dotStyle: `w-[8px] h-[8px] rounded-full flex-none mt-[6px] ${u ? '' : 'border-[1.5px] border-[var(--surface-border-strong)] bg-transparent'}` + (u ? ` bg-[${n.accent}]` : ''),
        titleStyle: `font-heading ${u ? 'font-bold' : 'font-medium'} text-[13.5px] leading-[1.35] tracking-[-0.15px]`,
        rowStyle: `flex gap-[12px] p-[14px_var(--gutter)] border-t border-[var(--surface-border)] cursor-pointer ${i === a.length - 1 ? 'border-b border-[var(--surface-border)]' : ''} ${u ? '' : 'opacity-70'}`
      };
    })
  })).filter(g => g.rows.length > 0);

  const counts: Record<string, string> = {
    All: String(NOTES.length),
    Unread: String(unreadCount),
    Deadlines: String(NOTES.filter(n => n.kind === "Deadline").length),
    Points: String(NOTES.filter(n => n.kind === "Settled" || n.kind === "Correction").length)
  };

  const filters = ["All", "Unread", "Deadlines", "Points"].map(f => {
    const on = filter === f;
    return {
      label: f, count: counts[f],
      style: `flex items-center h-[32px] p-[0_12px] rounded-full cursor-pointer whitespace-nowrap flex-none font-heading font-semibold text-[11.5px] ${on ? 'bg-[var(--text-primary)] text-[var(--surface-canvas)]' : 'border border-[var(--surface-border-strong)] text-[var(--text-secondary)]'}`,
      countStyle: `ml-[6px] font-tabular-nums ${on ? 'opacity-70' : 'opacity-55'}`
    };
  });

  const mkPref = (id: string, title: string, note: string, locked?: boolean) => {
    const on = locked ? true : prefs[id];
    return {
      id, title, note, on, locked: !!locked,
      titleColor: locked ? "var(--text-secondary)" : "var(--text-primary)",
      rowStyle: `flex items-center justify-between p-[14px_var(--gutter)] border-t border-[var(--surface-border)] ${locked ? 'opacity-65' : 'cursor-pointer'}`
    };
  };

  const prefGroups = [
    { label: "EMAILS YOU CAN TURN OFF", note: "A simple on or off. We do not promise a send time in your timezone.",
      rows: [mkPref("reminders", "Weekly prediction reminder", "Once a week, only if something is unanswered"),
             mkPref("questions", "Custom question admin", "Chasers at 13, 12, 7, 3 and 1 days before a question voids")] },
    { label: "IN-APP ONLY", note: "These never email.",
      rows: [mkPref("m1", "Membership changes", "Approvals, roles, removals, ownership", true),
             mkPref("m2", "Point corrections", "Only when your own total moves", true)] },
    { label: "ALWAYS SENT", note: "",
      rows: [mkPref("sec", "Account security", "Sign-ins, password and email changes", true)] }
  ];

  const headTitle = onPrefs ? "Alert settings" : "Alerts";
  const headSub = onPrefs ? "What reaches your inbox" : (unreadCount ? `${unreadCount} unread · all leagues` : "All caught up");
  const headActLabel = onPrefs ? "Done" : "Settings";

  return (
    <div className={`flex-1 flex flex-col bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''} overflow-y-auto`}>
      {/* Container */}
      <div className="flex flex-col w-full max-w-[1000px] mx-auto p-[20px_16px] md:p-[32px] overflow-hidden relative">
        <header className="flex-none bg-[var(--nav-surface)] text-[var(--nav-text)] p-[16px_24px] rounded-[16px] border border-[var(--surface-border)] shadow-[var(--elev-2)]">
          <div className="flex items-center gap-[14px]">
            <Link href="/home" className="w-[36px] h-[36px] rounded-full border border-[var(--nav-border)] grid place-items-center flex-none text-[var(--nav-text-quiet)] text-[15px] hover:text-[var(--nav-text)] transition-colors">
              ‹
            </Link>
            <div className="flex-1 min-w-0">
              <div className="font-heading font-bold text-[22px] leading-[1.05] tracking-[-0.5px]">{headTitle}</div>
              <div className="text-[12px] text-[var(--nav-text-faint)] mt-[4px]">{headSub}</div>
            </div>
            <button onClick={() => setView(onPrefs ? "list" : "prefs")} className="flex-none px-[16px] h-[36px] rounded-[10px] bg-[var(--nav-fill)] text-[var(--nav-text)] hover:bg-[rgba(255,255,255,0.18)] grid place-items-center font-heading font-semibold text-[12px] transition-colors cursor-pointer">
              {headActLabel}
            </button>
          </div>
        </header>

        {onList && (
          <div className="flex-none flex gap-[8px] py-[16px] overflow-x-auto">
            {filters.map(f => (
              <div key={f.label} onClick={() => { setFilter(f.label); setView('list'); }} className={f.style}>
                {f.label}<span className={f.countStyle}>{f.count}</span>
              </div>
            ))}
          </div>
        )}

        <main className="flex-1 mt-[8px] bg-[var(--surface-card)] rounded-[18px] border border-[var(--surface-border)] overflow-hidden shadow-[var(--elev-2)]">
          {isLoading && (
            <div className="p-[24px]">
              {[{ w: "74%" }, { w: "58%" }, { w: "81%" }, { w: "66%" }, { w: "70%" }, { w: "52%" }].map((s, i) => (
                <div key={i} className="p-[15px_0] border-b border-[var(--surface-border)]">
                  <div className="h-[11px] rounded-full bg-[var(--surface-subtle)]" style={{ width: s.w }}></div>
                  <div className="h-[9px] w-[52%] rounded-full bg-[var(--surface-subtle)] mt-[9px]"></div>
                </div>
              ))}
            </div>
          )}

          {isEmpty && (
            <div className="p-[80px_30px] flex flex-col items-center text-center">
              <div className="w-[56px] h-[56px] rounded-full bg-[var(--surface-subtle)] grid place-items-center text-[22px] text-[var(--text-muted)]">◔</div>
              <h2 className="font-heading font-bold text-[22px] leading-[1.2] tracking-[-0.5px] mt-[20px]">Nothing to catch up on</h2>
              <p className="text-[13.5px] leading-[1.6] text-[var(--text-secondary)] mt-[10px] max-w-[340px]">Deadlines, settled fixtures and point corrections land here. You&apos;re completely up to date.</p>
            </div>
          )}

          {showList && (
            <div>
              {groups.map((g, gi) => (
                <section key={gi}>
                  <div className="p-[16px_24px_9px]"><span className="tf-kicker text-[var(--text-muted)]">{g.label}</span></div>
                  {g.rows.map((r, ri) => (
                    <div key={ri} onClick={() => setRead({ ...read, [r.title]: true })} className={r.rowStyle}>
                      <span className={r.dotStyle} style={r.unread && !read[r.title] ? { background: r.accent } : {}}></span>
                      <div className="flex-1 min-w-0">
                        <div className={r.titleStyle}>{r.title}</div>
                        <div className="text-[12px] leading-[1.5] text-[var(--text-secondary)] mt-[4px]">{r.body}</div>
                        <div className="flex items-center gap-[8px] mt-[10px]">
                          <span className="font-heading font-bold text-[9px] tracking-[0.06em] p-[3px_8px] rounded-[5px] bg-[var(--surface-subtle)] text-[var(--text-muted)] flex-none">{r.league}</span>
                          <span className="text-[10.5px] text-[var(--text-muted)]">{r.when}</span>
                          <span className="flex-1"></span>
                          <span className="font-heading font-bold text-[10.5px] text-[var(--text-link)] flex-none">{r.action} →</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </section>
              ))}
              <div className="p-[20px_24px] text-[11.5px] leading-[1.55] text-[var(--text-muted)]">
                Alerts are personal. You are told when your own total moves, never when somebody else&apos;s does.
              </div>
            </div>
          )}

          {onPrefs && (
            <div>
              {prefGroups.map((g, gi) => (
                <section key={gi} className="mt-[18px]">
                  <div className="p-[0_24px_6px]"><span className="tf-kicker text-[var(--text-muted)]">{g.label}</span></div>
                  {g.note && <div className="p-[0_24px_6px] text-[11.5px] leading-[1.5] text-[var(--text-muted)]">{g.note}</div>}
                  {g.rows.map((r, ri) => (
                    <div key={ri} onClick={() => { if (!r.locked) setPrefs({ ...prefs, [r.id]: !prefs[r.id] }); }} className={r.rowStyle}>
                      <div className="flex-1 min-w-0">
                        <div className="font-heading font-semibold text-[13.5px]" style={{ color: r.titleColor }}>{r.title}</div>
                        <div className="text-[11px] leading-[1.45] text-[var(--text-muted)] mt-[3px]">{r.note}</div>
                      </div>
                      <div className={`w-[40px] h-[24px] rounded-full flex-none p-[2px] flex transition-colors ${r.on ? 'bg-[var(--color-brand)] justify-end' : 'bg-[var(--surface-border-strong)] justify-start'}`}>
                        <div className="w-[20px] h-[20px] rounded-full bg-[var(--surface-card)]"></div>
                      </div>
                    </div>
                  ))}
                </section>
              ))}
              <div className="p-[20px_24px] text-[11.5px] leading-[1.55] text-[var(--text-muted)]">
                Membership changes and point corrections never email. The badge is the whole notification — they are quiet by design.
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
