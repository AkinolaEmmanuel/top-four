'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Breadcrumb } from '../components/Breadcrumb';
import {
  useNotificationPreferences, useUpdateNotificationPreferences, useUnreadNotifications,
  useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead
} from '@/hooks/api/useNotifications';
import { useMyLeagues } from '@/hooks/api/useLeagues';
import { failureMessage } from '@/lib/api/failure';
import type { NotificationItem, NotificationKind, NotificationPreferences } from '@/lib/api/notifications';

/**
 * What each alert says, and the one thing it wants the reader to do.
 *
 * `to` is a path builder rather than a path, because most destinations are
 * inside the league the alert came from. A kind with no `action` gets no
 * control: an alert about a league you have just been removed from should not
 * offer a link into it.
 */
type AlertCopy = {
  title: string;
  body: string;
  action?: string;
  to?: (leagueId: string) => string;
};

const IN_LEAGUE = {
  overview: (id: string) => `/leagues/${id}`,
  fixtures: (id: string) => `/leagues/${id}/fixtures`,
  results: (id: string) => `/leagues/${id}/fixtures?view=results`,
  questions: (id: string) => `/leagues/${id}/questions`,
  table: (id: string) => `/leagues/${id}/table`,
  admin: (id: string) => `/leagues/${id}/admin`,
};

const KIND_COPY: Record<NotificationKind, (n: NotificationItem) => AlertCopy> = {
  'league.join_request.received': () => ({ title: 'New join request', body: 'Somebody asked to join. Approve or decline it from the admin page.', action: 'Review requests', to: IN_LEAGUE.admin }),
  'league.join_request.approved': () => ({ title: "You're in", body: 'Your request to join was approved.', action: 'Open the league', to: IN_LEAGUE.overview }),
  'league.join_request.rejected': () => ({ title: 'Request declined', body: 'Your request to join was not approved.' }),
  'league.role.changed': () => ({ title: 'Your role changed', body: 'An owner or admin updated what you can do in this league.', action: 'Open the league', to: IN_LEAGUE.overview }),
  'league.membership.removed': () => ({ title: 'Removed from a league', body: 'You are no longer a member. Your history stays with the league.' }),
  'league.round.reminder': () => ({ title: 'Predictions still open', body: 'Something in this league is still unanswered before the next deadline.', action: 'Predict', to: IN_LEAGUE.fixtures }),
  'league.results.settled': () => ({ title: 'Results are in', body: 'A fixture in this league has settled.', action: 'See the result', to: IN_LEAGUE.results }),
  'league.results.corrected': () => ({ title: 'A result was corrected', body: 'Your points moved after a settled result was corrected.', action: 'See the breakdown', to: IN_LEAGUE.table }),
  'league.completed': () => ({ title: 'League completed', body: 'Every fixture and question has settled. The table is final.', action: 'See the final table', to: IN_LEAGUE.table }),
  'league.cancelled': () => ({ title: 'League cancelled', body: 'The owner ended this league.' }),
  'league.fixture.moved': () => ({ title: 'A fixture moved', body: 'A kickoff time changed, which may have shifted a deadline.', action: 'See the fixtures', to: IN_LEAGUE.fixtures }),
  'league.custom_question.resolve_reminder': () => ({ title: 'A question needs resolving', body: 'A custom question is waiting on an outcome.', action: 'Resolve it', to: IN_LEAGUE.questions }),
  'league.custom_question.auto_voided': () => ({ title: 'A question was voided', body: 'A custom question passed its outcome date unresolved and was voided automatically.', action: 'See the question', to: IN_LEAGUE.questions }),
  'account.password.changed': () => ({ title: 'Password changed', body: 'Your account password was changed.' }),
  'account.email.changed': () => ({ title: 'Email changed', body: 'Your account email address was changed.' }),
  'account.password_reset.completed': () => ({ title: 'Password reset', body: 'Your password was reset.' }),
};

/** One row as the screen draws it, built from a notification and its copy. */
interface AlertRow {
  id: string;
  title: string;
  body: string;
  unread: boolean;
  accent: string;
  group: string;
  league: string;
  when: string;
  action: string;
  href: string | null;
}

const CATEGORY_LABEL: Record<string, string> = {
  membership: 'MEMBERSHIP',
  round_reminder: 'DEADLINES',
  correction: 'POINTS',
  custom_question_admin: 'CUSTOM QUESTIONS',
  account_security: 'ACCOUNT SECURITY',
  results: 'POINTS',
  fixture_moved: 'DEADLINES',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function AlertsPage() {
  const [view, setView] = useState<'list' | 'prefs'>('list');
  const [filter, setFilter] = useState<string>('All');
  /** Which alert the wide layout is reading. Narrow screens have no pane. */
  const [reading, setReading] = useState<string | null>(null);

  const { data: prefsData, isLoading: prefsLoading } = useNotificationPreferences();
  const { data: unreadData } = useUnreadNotifications();
  const updatePrefsMutation = useUpdateNotificationPreferences();
  const { data: notificationsData, isLoading: notificationsLoading } = useNotifications();
  const { data: leaguesData } = useMyLeagues();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const leagueName = (leagueId: string | null) => {
    if (!leagueId) return 'TopFour';
    return leaguesData?.items.find(l => l.id === leagueId)?.name || 'A league';
  };

  const NOTES: AlertRow[] = (notificationsData?.items || []).map(n => {
    const copy = KIND_COPY[n.kind]?.(n) || { title: n.kind, body: '' };
    return {
      id: n.id,
      title: copy.title,
      body: copy.body,
      unread: n.readAt === null,
      accent: n.category === 'account_security' ? 'var(--color-danger)' : 'var(--color-brand)',
      group: CATEGORY_LABEL[n.category] || n.category.toUpperCase(),
      league: leagueName(n.leagueId),
      when: timeAgo(n.createdAt),
      // The design names the action per alert — Predict, See the result, Review
      // requests — because "VIEW LEAGUE" on every row says nothing about why the
      // row is there. A kind that has nowhere useful to send anyone gets no link.
      action: copy.action && copy.to && n.leagueId ? copy.action.toUpperCase() : '',
      href: copy.to && n.leagueId ? copy.to(n.leagueId) : null,
    };
  });

  const onList = view === "list";
  const onPrefs = view === "prefs";
  const isLoading = onPrefs ? prefsLoading : notificationsLoading;
  // The empty state belongs to the list, not to the settings panel that shares
  // this <main>. Without the guard, "Nothing to catch up on" sat above the
  // preferences.
  const isEmpty = onList && !isLoading && NOTES.length === 0;
  const showList = onList && !isLoading && !isEmpty;

  const unreadCount = unreadData ?? 0;

  const match = (n: AlertRow) => {
    if (filter === "Unread") return n.unread;
    if (filter === "Deadlines") return n.group === "DEADLINES";
    if (filter === "Points") return n.group === "POINTS";
    return true;
  };
  const shown = NOTES.filter(match);

  const names: string[] = [];
  shown.forEach(n => { if (!names.includes(n.group)) names.push(n.group); });

  const groups = names.map(g => ({
    label: g,
    rows: shown.filter(n => n.group === g).map((n, i, a) => {
      const u = n.unread;
      return {
        ...n,
        dotStyle: `w-[8px] h-[8px] rounded-full flex-none mt-[6px] ${u ? '' : 'border-[1.5px] border-[var(--surface-border-strong)] bg-transparent'}`,
        titleStyle: `font-heading ${u ? 'font-bold' : 'font-medium'} text-[13.5px] leading-[1.35] tracking-[-0.15px]`,
        rowStyle: `flex gap-[12px] p-[14px_var(--gutter)] border-t border-[var(--surface-border)] cursor-pointer ${i === a.length - 1 ? 'border-b border-[var(--surface-border)]' : ''} ${u ? '' : 'opacity-70'}`,
        onOpen: () => {
          if (u) markReadMutation.mutate(n.id);
        }
      };
    })
  })).filter(g => g.rows.length > 0);

  const counts: Record<string, string> = {
    All: String(NOTES.length),
    Unread: String(unreadCount),
    Deadlines: String(NOTES.filter(n => n.group === "DEADLINES").length),
    Points: String(NOTES.filter(n => n.group === "POINTS").length)
  };

  const filters = ["All", "Unread", "Deadlines", "Points"].map(f => {
    const on = filter === f;
    return {
      label: f, count: counts[f],
      style: `flex items-center h-[32px] p-[0_12px] rounded-full cursor-pointer whitespace-nowrap flex-none font-heading font-semibold text-[11.5px] ${on ? 'bg-[var(--text-primary)] text-[var(--surface-canvas)]' : 'border border-[var(--surface-border-strong)] text-[var(--text-secondary)]'}`,
      countStyle: `ml-[6px] font-tabular-nums ${on ? 'opacity-70' : 'opacity-55'}`
    };
  });

  /* Which preference is in flight, so its own row can say so. The backend
     takes seconds, and a toggle that does not move reads as a dead control. */
  const savingField = updatePrefsMutation.isPending
    ? Object.keys(updatePrefsMutation.variables ?? {})[0]
    : null;

  const failure = onPrefs
    ? (updatePrefsMutation.error ? failureMessage(updatePrefsMutation.error, 'That setting did not save.') : null)
    : (markAllReadMutation.error ? failureMessage(markAllReadMutation.error, 'Could not mark them read.')
      : markReadMutation.error ? failureMessage(markReadMutation.error, 'Could not mark that read.')
      : null);

  const open = NOTES.find(note => note.id === reading) ?? null;

  const PREF_FIELD: Record<string, keyof NotificationPreferences | undefined> = {
    reminders: 'roundReminder', questions: 'customQuestionAdmin',
  };

  const mkPref = (id: string, title: string, note: string, on: boolean, locked?: boolean) => {
    const field = PREF_FIELD[id];
    const saving = !locked && savingField !== null && field === savingField;
    // While the write is in flight the toggle shows where it is going, so the
    // control answers the tap even though the server takes seconds.
    const pendingValue = saving && field
      ? (updatePrefsMutation.variables as Partial<NotificationPreferences>)[field]
      : undefined;
    return {
      id, title, note: saving ? 'Saving…' : note,
      on: locked ? true : (typeof pendingValue === 'boolean' ? pendingValue : on),
      locked: !!locked, saving,
      titleColor: locked ? "var(--text-secondary)" : "var(--text-primary)",
      rowStyle: `flex items-center justify-between p-[14px_var(--gutter)] border-t border-[var(--surface-border)] ${locked || saving ? 'opacity-65' : 'cursor-pointer'}`
    };
  };

  const prefGroups = [
    { label: "EMAILS YOU CAN TURN OFF", note: "A simple on or off. We do not promise a send time in your timezone.",
      rows: [mkPref("reminders", "Weekly prediction reminder", "Once a week, only if something is unanswered", !!prefsData?.roundReminder),
             mkPref("questions", "Custom question admin", "Chasers at 13, 12, 7, 3 and 1 days before a question voids", !!prefsData?.customQuestionAdmin)] },
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
    <div className="flex-1 flex flex-col min-h-0 bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] overflow-hidden">
      <Breadcrumb trail={[{ label: 'Home', href: '/home' }, { label: 'Alerts' }]} />
      <div className="flex-1 min-h-0 overflow-y-auto tf-scroll">
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
          <div className="flex-none flex items-center gap-[10px] py-[16px]">
            {/* The chips scroll; the action does not. They shared one scrolling
                row, so on a 390px phone "Mark all read" sat 41px past the right
                edge and had to be found by dragging the filters sideways. */}
            <div className="tf-scroll flex items-center gap-[8px] overflow-x-auto flex-1 min-w-0">
              {filters.map(f => (
                <button type="button" key={f.label} onClick={() => { setFilter(f.label); setView('list'); }} className={f.style}>
                  {f.label}<span className={f.countStyle}>{f.count}</span>
                </button>
              ))}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="tf-hit flex-none font-heading font-bold text-[10.5px] tracking-[0.05em] text-[var(--text-link)] cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                {markAllReadMutation.isPending ? 'MARKING…' : 'MARK ALL READ'}
              </button>
            )}
          </div>
        )}

        {failure && (
          <p role="status" className="mt-[8px] p-[10px_14px] rounded-[10px] bg-[var(--danger-surface)] text-[var(--danger-text)] text-[11.5px] leading-[1.5]">
            {failure}
          </p>
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
            /* Two panes at width: the list keeps its place on the left while the
               selected alert is read whole on the right. A single column at
               every width means every alert you open loses the list you were
               working through. */
            <div className="md:grid md:grid-cols-[minmax(0,1fr)_360px] md:items-start">
            <div className="md:border-r md:border-[var(--surface-border)]">
              {groups.map((g, gi) => (
                <section key={gi}>
                  <div className="p-[16px_24px_9px]"><span className="tf-kicker text-[var(--text-muted)]">{g.label}</span></div>
                  {g.rows.map((r, ri) => (
                    <div
                      key={ri}
                      // Stays a div because it contains its own link, which a
                      // button may not wrap; given the role and keyboard
                      // support a real control needs instead.
                      role="button"
                      tabIndex={0}
                      aria-current={reading === r.id ? 'true' : undefined}
                      onClick={() => { setReading(r.id); r.onOpen(); }}
                      onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setReading(r.id); r.onOpen(); } }}
                      className={`${r.rowStyle} ${reading === r.id ? 'md:bg-[var(--accent-surface)] md:shadow-[inset_3px_0_0_0_var(--color-brand)]' : ''}`}
                    >
                      <span className={r.dotStyle} style={r.unread ? { background: r.accent } : {}}></span>
                      <div className="flex-1 min-w-0">
                        <div className={r.titleStyle}>{r.title}</div>
                        <div className="text-[12px] leading-[1.5] text-[var(--text-secondary)] mt-[4px]">{r.body}</div>
                        <div className="flex items-center gap-[8px] mt-[10px]">
                          <span className="font-heading font-bold text-[9px] tracking-[0.06em] p-[3px_8px] rounded-[5px] bg-[var(--surface-subtle)] text-[var(--text-muted)] flex-none">{r.league}</span>
                          <span className="text-[10.5px] text-[var(--text-muted)]">{r.when}</span>
                          <span className="flex-1"></span>
                          {r.href && (
                            <Link href={r.href} className="tf-hit font-heading font-bold text-[10.5px] text-[var(--text-link)] flex-none">{r.action} →</Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </section>
              ))}
            </div>

            {/* The reading pane. Sticky, so working down a long list does not
                leave the thing being read somewhere above the fold. */}
            <aside className="hidden md:block md:sticky md:top-[16px] p-[20px]">
              {open ? (
                <>
                  <span className="font-heading font-bold text-[9px] tracking-[0.06em] px-[8px] py-[3px] rounded-[5px] bg-[var(--surface-subtle)] text-[var(--text-muted)]">
                    {open.group}
                  </span>
                  <h2 className="font-heading font-bold text-[17px] leading-[1.25] tracking-[-0.3px] mt-[12px]">{open.title}</h2>
                  <p className="text-[12.5px] leading-[1.6] text-[var(--text-secondary)] mt-[9px]">{open.body}</p>
                  <div className="flex items-center gap-[8px] mt-[14px]">
                    <span className="font-heading font-bold text-[9px] tracking-[0.06em] p-[3px_8px] rounded-[5px] bg-[var(--surface-subtle)] text-[var(--text-muted)]">{open.league}</span>
                    <span className="text-[10.5px] text-[var(--text-muted)]">{open.when}</span>
                  </div>
                  {open.href && (
                    <Link
                      href={open.href}
                      className="mt-[16px] h-[42px] px-[16px] rounded-[11px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] font-heading font-bold text-[12px] inline-grid place-items-center"
                    >
                      {open.action || 'Open'}
                    </Link>
                  )}
                </>
              ) : (
                <p className="text-[12px] leading-[1.6] text-[var(--text-muted)]">
                  Pick an alert to read it here. Opening one marks it read.
                </p>
              )}
            </aside>
            </div>
          )}

          {onPrefs && (
            <div>
              {prefGroups.map((g, gi) => (
                <section key={gi} className="mt-[18px]">
                  <div className="p-[0_24px_6px]"><span className="tf-kicker text-[var(--text-muted)]">{g.label}</span></div>
                  {g.note && <div className="p-[0_24px_6px] text-[11.5px] leading-[1.5] text-[var(--text-muted)]">{g.note}</div>}
                  {g.rows.map((r, ri) => (
                    <button type="button" key={ri} disabled={r.locked || savingField !== null} onClick={() => {
                      const field = PREF_FIELD[r.id];
                      if (field) updatePrefsMutation.mutate({ [field]: !r.on });
                    }} className={r.rowStyle}>
                      <div className="flex-1 min-w-0">
                        <div className="font-heading font-semibold text-[13.5px]" style={{ color: r.titleColor }}>{r.title}</div>
                        <div className="text-[11px] leading-[1.45] text-[var(--text-muted)] mt-[3px]">{r.note}</div>
                      </div>
                      <div className={`w-[40px] h-[24px] rounded-full flex-none p-[2px] flex transition-colors ${r.on ? 'bg-[var(--color-brand)] justify-end' : 'bg-[var(--surface-border-strong)] justify-start'}`}>
                        <div className="w-[20px] h-[20px] rounded-full bg-[var(--surface-card)]"></div>
                      </div>
                    </button>
                  ))}
                </section>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
    </div>
  );
}
