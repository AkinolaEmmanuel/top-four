'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LeagueTabs } from './LeagueTabs';
import { useUpdateLeague } from '@/hooks/api/useLeagues';
import { useUpdateNotificationPreferences } from '@/hooks/api/useNotifications';
import type { CompetitionRule, MarketRule } from '@/lib/leagues/league-rules';

/**
 * The league rules — one component for both platforms.
 *
 * Most of this is frozen and read-only. The settings an owner or admin can
 * still change are edited in place: the old screen collected a new league name
 * with `window.prompt` and reported failures with `window.alert`.
 */

function Frozen({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex items-start gap-[12px] p-[14px_var(--gutter)] md:px-[6px] border-b border-[var(--surface-border)]">
      <div className="flex-1 min-w-0">
        <div className="font-heading font-semibold text-[13px]">{label}</div>
        {note && <div className="text-[10.5px] text-[var(--text-muted)] mt-[3px]">{note}</div>}
      </div>
      <div className="text-[12.5px] text-[var(--text-secondary)] text-right flex-none max-w-[45%]">{value}</div>
    </div>
  );
}

/** A setting that can still change: a short text field, or an on/off switch. */
function Editable({ label, value, note, kind, pending, onSave }: {
  label: string;
  value: string;
  note?: string;
  kind: 'text' | 'switch';
  pending: boolean;
  onSave: (next: string | boolean) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const on = value === 'On' || value === 'Required';

  if (kind === 'switch') {
    return (
      <div className="flex items-center gap-[12px] p-[14px_var(--gutter)] md:px-[6px] border-b border-[var(--surface-border)]">
        <div className="flex-1 min-w-0">
          <div className="font-heading font-semibold text-[13px]">{label}</div>
          {note && <div className="text-[10.5px] text-[var(--text-muted)] mt-[3px]">{note}</div>}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={label}
          disabled={pending}
          onClick={() => onSave(!on)}
          className={`w-[44px] h-[26px] rounded-full flex-none relative transition-colors ${pending ? 'opacity-55' : 'cursor-pointer'}`}
          style={{ background: on ? 'var(--color-brand)' : 'var(--surface-border-strong)' }}
        >
          <span className="absolute top-[3px] w-[20px] h-[20px] rounded-full bg-[var(--tf-white)] transition-[left]" style={{ left: on ? '21px' : '3px' }} />
        </button>
      </div>
    );
  }

  return (
    <div className="p-[14px_var(--gutter)] md:px-[6px] border-b border-[var(--surface-border)]">
      <div className="flex items-center gap-[12px]">
        <div className="flex-1 min-w-0">
          <div className="font-heading font-semibold text-[13px]">{label}</div>
          {!editing && <div className="text-[12.5px] text-[var(--text-secondary)] mt-[3px] truncate">{value}</div>}
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => { setDraft(value); setEditing(true); }}
            className="font-heading font-bold text-[10.5px] text-[var(--text-link)] flex-none"
          >
            EDIT
          </button>
        )}
      </div>

      {editing && (
        <form
          className="flex items-center gap-[8px] mt-[10px]"
          onSubmit={e => { e.preventDefault(); setEditing(false); if (draft.trim() !== value) onSave(draft.trim()); }}
        >
          <input
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            aria-label={label}
            className="flex-1 h-[40px] px-[12px] rounded-[10px] border border-[var(--surface-border-strong)] bg-[var(--surface-canvas)] text-[13px] text-[var(--text-primary)]"
          />
          <button type="submit" disabled={pending} className="h-[40px] px-[14px] rounded-[10px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] font-heading font-bold text-[12px]">Save</button>
          <button type="button" onClick={() => setEditing(false)} className="h-[40px] px-[12px] rounded-[10px] border border-[var(--surface-border-strong)] font-heading font-semibold text-[12px]">Cancel</button>
        </form>
      )}
    </div>
  );
}

export function LeagueRulesScreen({
  leagueId, leagueName, description, version, canEdit, markets, competitions,
  maxPoints, maxNote, tiebreakers, lockMinutes, lateJoin,
  invitationsOn, approvalRequired, remindersOn,
}: {
  leagueId: string;
  leagueName: string;
  description: string;
  version: number;
  canEdit: boolean;
  markets: MarketRule[];
  competitions: CompetitionRule[];
  maxPoints: number;
  maxNote: string;
  tiebreakers: string[];
  lockMinutes: number;
  lateJoin: string;
  invitationsOn: boolean;
  approvalRequired: boolean;
  remindersOn: boolean;
}) {
  const router = useRouter();
  const updateLeague = useUpdateLeague(leagueId);
  const updatePreferences = useUpdateNotificationPreferences();
  const [failed, setFailed] = useState<string | null>(null);

  const save = (payload: Parameters<typeof updateLeague.mutate>[0], what: string) => {
    setFailed(null);
    updateLeague.mutate(payload, {
      onSuccess: () => router.refresh(),
      onError: () => setFailed(`${what} did not save — nothing was changed.`),
    });
  };

  return (
    <div className="flex flex-col flex-1 h-[100dvh] md:h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif]">

      <header className="flex-none bg-[var(--nav-surface)] text-[var(--nav-text)] pt-[calc(8px+env(safe-area-inset-top))] px-[var(--gutter)] pb-[20px] md:p-0 md:border-b md:border-[rgba(255,255,255,.1)]">
        <div className="md:max-w-[860px] md:mx-auto md:px-[24px] md:py-[24px]">
          <div className="flex items-center gap-[11px]">
            <Link href={`/leagues/${leagueId}/more`} className="tf-tap w-[40px] h-[40px] rounded-full border border-[var(--nav-border)] grid place-items-center flex-none text-[var(--nav-text-quiet)] text-[15px] md:hidden">‹</Link>
            <div className="min-w-0 flex-1">
              <div className="font-heading font-[650] text-[17px] md:text-[22px] leading-[1.1] tracking-[-0.3px] truncate">Rules</div>
              <div className="text-[10.5px] md:text-[12px] text-[var(--nav-text-faint)] mt-[4px] truncate">{leagueName}</div>
            </div>
          </div>
          <div className="flex items-end gap-[12px] mt-[16px]">
            <span className="tf-num font-heading font-bold text-[40px] leading-[0.88] tracking-[-1.8px]">{maxPoints}</span>
            <div className="pb-[5px] text-[11px] leading-[1.45] text-[var(--nav-text-faint)] max-w-[300px]">points at most from one fixture</div>
          </div>
        </div>
      </header>

      <LeagueTabs leagueId={leagueId} active="more" />

      <main className="tf-scroll flex-1 overflow-auto pb-[86px] md:pb-[26px]">
        <div className="md:max-w-[860px] md:mx-auto md:px-[24px] md:pt-[20px]">

          <p className="p-[16px_var(--gutter)] md:px-[6px] text-[11.5px] leading-[1.6] text-[var(--text-muted)]">
            These froze when the league was published. Members answered under them, so they cannot change while it runs. {maxNote}
          </p>

          <section className="mt-[8px]">
            <div className="tf-kicker px-[var(--gutter)] md:px-[6px] pb-[8px] text-[var(--text-muted)]">Competitions</div>
            {competitions.length === 0
              ? <p className="px-[var(--gutter)] md:px-[6px] text-[12px] text-[var(--text-secondary)]">No competitions on this league.</p>
              : competitions.map(c => <Frozen key={c.name} label={c.name} value={c.season} note={c.scope} />)}
          </section>

          <section className="mt-[22px]">
            <div className="tf-kicker px-[var(--gutter)] md:px-[6px] pb-[8px] text-[var(--text-muted)]">Markets and points</div>
            {markets.filter(m => m.enabled).map(m => <Frozen key={m.marketType} label={m.label} value={m.price} note={m.note} />)}
            {markets.some(m => !m.enabled) && (
              <p className="p-[12px_var(--gutter)] md:px-[6px] text-[11px] text-[var(--text-muted)]">
                Not run here: {markets.filter(m => !m.enabled).map(m => m.label).join(', ')}.
              </p>
            )}
          </section>

          <section className="mt-[22px]">
            <div className="tf-kicker px-[var(--gutter)] md:px-[6px] pb-[8px] text-[var(--text-muted)]">Timing and joining</div>
            <Frozen label="Standard lock" value={`${lockMinutes} minutes before`} note="Applies to every market except the lineups" />
            <Frozen label="Lineup lock" value="2 hours before" note="Fixed by TopFour — the standard lock never applies to it" />
            <Frozen label="Late joining" value={lateJoin} note="A late member starts on zero and cannot answer locked matches" />
          </section>

          <section className="mt-[22px]">
            <div className="tf-kicker px-[var(--gutter)] md:px-[6px] pb-[8px] text-[var(--text-muted)]">Tiebreakers</div>
            {tiebreakers.map((label, i) => <Frozen key={label} label={`${i + 1} · ${label}`} value="" />)}
          </section>

          {canEdit && (
            <section className="mt-[26px]">
              <div className="tf-kicker px-[var(--gutter)] md:px-[6px] pb-[8px] text-[var(--text-muted)]">Still changeable</div>
              <Editable
                label="Name" value={leagueName} kind="text" pending={updateLeague.isPending}
                onSave={next => save({ expectedVersion: version, name: String(next) }, 'The name')}
              />
              <Editable
                label="Description" value={description || 'No description'} kind="text" pending={updateLeague.isPending}
                onSave={next => save({ expectedVersion: version, description: String(next) || null }, 'The description')}
              />
              <Editable
                label="Invitation links" value={invitationsOn ? 'On' : 'Off'} kind="switch" pending={updateLeague.isPending}
                note="Anyone with a link can request to join"
                onSave={next => save({ expectedVersion: version, invitationSettings: { enabled: Boolean(next) } }, 'That setting')}
              />
              <Editable
                label="Approve new members" value={approvalRequired ? 'Required' : 'Automatic'} kind="switch" pending={updateLeague.isPending}
                note="You or an admin approves every request"
                onSave={next => save({ expectedVersion: version, invitationSettings: { joinApprovalRequired: Boolean(next) } }, 'That setting')}
              />
            </section>
          )}

          <section className="mt-[22px]">
            <div className="tf-kicker px-[var(--gutter)] md:px-[6px] pb-[8px] text-[var(--text-muted)]">Your reminders</div>
            <Editable
              label="Deadline reminders" value={remindersOn ? 'On' : 'Off'} kind="switch"
              pending={updatePreferences.isPending}
              note="We never promise a send time"
              onSave={next => {
                setFailed(null);
                updatePreferences.mutate({ roundReminder: Boolean(next) }, {
                  onSuccess: () => router.refresh(),
                  onError: () => setFailed('That setting did not save — nothing was changed.'),
                });
              }}
            />
          </section>

          {failed && <p role="alert" className="px-[var(--gutter)] md:px-[6px] pt-[14px] text-[11.5px] text-[var(--danger-text)]">{failed}</p>}

          <p className="p-[20px_var(--gutter)_26px] md:px-[6px] text-[11px] leading-[1.6] text-[var(--text-muted)]">
            Changing anything frozen would mean members had answered under different rules. That is why the only route is completing this league and starting another.
          </p>
        </div>
      </main>
    </div>
  );
}
