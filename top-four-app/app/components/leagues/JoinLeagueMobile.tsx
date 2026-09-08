'use client';

import React from 'react';

interface JoinLeagueMobileProps {
  leagueName: string;
  concealed: boolean;
  byCode: boolean;
  chromeRight: string;
  INVITE: string[];
  facts: string[][];
  tags: { label: string; style: string }[];
  onOutcome: boolean;
  outcome: string | null;
  setOutcome: (o: string | null) => void;
  o: any;
  inviteCode: string;
  setInviteCode: (c: string) => void;
  joinLeaguePending: boolean;
  onJoinCode: () => void;
  onNavigateHome: () => void;
  MY_LEAGUES: [string, string, string, string, string, string][];
  onLeaveLeague: (leagueId: string) => void;
  secondaryAction?: () => void;
}

export function JoinLeagueMobile(props: JoinLeagueMobileProps) {
  const {
    leagueName,
    concealed,
    byCode,
    chromeRight,
    INVITE,
    facts,
    tags,
    onOutcome,
    outcome,
    setOutcome,
    o,
    inviteCode,
    setInviteCode,
    joinLeaguePending,
    onJoinCode,
    onNavigateHome,
    MY_LEAGUES,
    onLeaveLeague,
    secondaryAction,
  } = props;

  return (
    <div className="flex flex-col flex-1 w-full overflow-hidden bg-[var(--surface-canvas)] font-['Sora',sans-serif] text-[var(--text-primary)]">
      <header className="bg-[var(--nav-surface)] text-[var(--nav-text)] p-[6px_var(--gutter)_20px] flex-none">
        <div className="flex items-center justify-between">
          <div className="font-heading font-bold text-[17px] tracking-[-0.5px]">TopFour</div>
          <div className="text-[10.5px] text-[var(--nav-text-faint)]">{chromeRight}</div>
        </div>

        <div className="flex items-center gap-[8px] mt-[18px]">
          <span
            className="w-[7px] h-[7px] rounded-full flex-none"
            style={{ background: byCode ? 'var(--nav-text-faint)' : INVITE[1] }}
          />
          <span
            className="font-heading font-bold text-[9.5px] leading-[1] tracking-[0.13em] uppercase"
            style={{ color: byCode ? 'var(--nav-text-faint)' : INVITE[1] }}
          >
            {byCode ? "JOIN BY CODE" : INVITE[0]}
          </span>
        </div>

        <div
          className={`font-heading font-bold text-[26px] leading-[1.1] tracking-[-0.9px] mt-[9px] ${
            concealed ? 'text-[var(--nav-text-faint)]' : ''
          }`}
        >
          {leagueName}
        </div>

        {!concealed && (
          <div className="flex gap-[22px] mt-[16px]">
            {!byCode &&
              facts.map(([value, label], i) => (
                <div key={i}>
                  <div className="font-heading font-bold text-[17px] tracking-[-0.4px] font-tabular-nums">{value}</div>
                  <div className="font-heading font-semibold text-[9px] tracking-[0.09em] text-[var(--nav-text-faint)] mt-[4px] uppercase">
                    {label}
                  </div>
                </div>
              ))}
          </div>
        )}

        {!byCode && (
          <div className="flex flex-wrap gap-[6px] mt-[16px]">
            {tags.map((t, i) => (
              <span
                key={i}
                className={`inline-flex items-center h-[22px] px-[8px] rounded-[6px] font-heading font-bold text-[9.5px] leading-[1] tracking-[0.05em] uppercase ${t.style}`}
              >
                {t.label}
              </span>
            ))}
          </div>
        )}
      </header>

      <main className="tf-scroll flex-1 overflow-auto bg-[var(--surface-canvas)]">
        {/* CODE */}
        {!onOutcome && (
          <div className="p-[20px_var(--gutter)_26px] animate-[tfin_0.16s_ease]">
            <div className="font-heading font-bold text-[19px] leading-[1.2] tracking-[-0.5px]">
              Enter the code you were given
            </div>
            <div className="text-[12.5px] leading-[1.6] text-[var(--text-secondary)] mt-[9px]">
              Ten characters, not case sensitive. A code names one league and behaves exactly like a link to it.
            </div>
            <div className="relative mt-[18px]">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase().slice(0, 10))}
                className="absolute inset-0 opacity-0 w-full h-full cursor-text z-10"
                maxLength={10}
              />
              <div className="flex gap-[4px]">
                {Array.from({ length: 10 }).map((_, i) => {
                  const ch = inviteCode[i] || "";
                  const isFocused = inviteCode.length === i;
                  return (
                    <div
                      key={i}
                      className={`flex-1 h-[48px] rounded-[9px] grid place-items-center font-heading font-bold text-[14px] bg-[var(--surface-card)] text-[var(--text-primary)] border ${
                        isFocused ? 'border-[var(--color-brand)]' : 'border-[var(--surface-border-strong)]'
                      }`}
                    >
                      {ch}
                    </div>
                  );
                })}
              </div>
            </div>
            <div
              onClick={onJoinCode}
              className={`tf-tap mt-[18px] h-[48px] rounded-[13px] grid place-items-center font-heading font-bold text-[13.5px] ${
                inviteCode.length === 10 && !joinLeaguePending
                  ? 'bg-[var(--brand-fill)] text-[var(--color-on-brand)] shadow-[var(--elev-glow)]'
                  : 'bg-[var(--surface-subtle)] text-[var(--text-muted)]'
              }`}
            >
              {joinLeaguePending ? 'Joining...' : 'Join this league'}
            </div>
            <div className="mt-[14px] text-[11.5px] leading-[1.6] text-[var(--text-muted)]">
              A code that has been used up, withdrawn or has expired fails the same way a dead link does — you are told, and nothing else about the league is revealed.
            </div>
          </div>
        )}

        {/* OUTCOME */}
        {onOutcome && (
          <div className="p-[26px_var(--gutter)] animate-[tfin_0.16s_ease]">
            <div
              className="w-[52px] h-[52px] rounded-full grid place-items-center text-[22px] bg-[var(--surface-subtle)]"
              style={{ color: o.tone || 'var(--text-muted)' }}
            >
              {o.icon}
            </div>
            <div className="font-heading font-bold text-[21px] leading-[1.2] tracking-[-0.55px] mt-[18px]">{o.title}</div>
            <div className="text-[13px] leading-[1.6] text-[var(--text-secondary)] mt-[10px]">{o.body}</div>

            {o.list && (
              <div className="mt-[18px]">
                {MY_LEAGUES.map(([name, meta, action, tint, initials, id], i, arr) => (
                  <div
                    key={i}
                    onClick={action === "—" ? undefined : () => onLeaveLeague(id)}
                    className={`flex items-center gap-[11px] py-[12px] border-t border-[var(--surface-border)] ${
                      i === arr.length - 1 ? 'border-b' : ''
                    } ${action === "—" ? 'opacity-55' : 'cursor-pointer'}`}
                  >
                    <span
                      className="w-[30px] h-[30px] rounded-full flex-none grid place-items-center font-heading font-bold text-[10px] text-[var(--text-primary)]"
                      style={{ background: tint }}
                    >
                      {initials}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-[650] text-[13px] whitespace-nowrap overflow-hidden text-ellipsis">
                        {name}
                      </div>
                      <div className="text-[10.5px] text-[var(--text-muted)] mt-[3px]">{meta}</div>
                    </div>
                    <span className="font-heading font-bold text-[10px] text-[var(--text-link)] flex-none">{action}</span>
                  </div>
                ))}
              </div>
            )}

            {o.primary && (
              <div
                onClick={() => {
                  if (outcome === 'welcome') {
                    onNavigateHome();
                  } else {
                    setOutcome(null);
                  }
                }}
                className="tf-tap mt-[22px] h-[48px] rounded-[13px] grid place-items-center font-heading font-bold text-[13.5px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] shadow-[var(--elev-glow)]"
              >
                {o.primary}
              </div>
            )}
            {o.secondary && (
              <div
                onClick={o.secondaryOff ? undefined : secondaryAction}
                className={`mt-[8px] h-[46px] rounded-[12px] border border-[var(--surface-border-strong)] grid place-items-center font-heading font-bold text-[12.5px] ${
                  o.secondaryOff || !secondaryAction ? 'opacity-45' : 'cursor-pointer'
                }`}
              >
                {o.secondary}
              </div>
            )}
            {o.note && <div className="mt-[16px] text-[11px] leading-[1.6] text-[var(--text-muted)]">{o.note}</div>}
          </div>
        )}
      </main>
    </div>
  );
}
