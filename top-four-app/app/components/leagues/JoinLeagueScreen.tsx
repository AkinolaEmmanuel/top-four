'use client';

import React from 'react';
import Link from 'next/link';

interface JoinLeagueScreenProps {
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

export function JoinLeagueScreen(props: JoinLeagueScreenProps) {
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

  const handlePrimary = () => {
    if (outcome === 'welcome') {
      onNavigateHome();
    } else {
      setOutcome(null);
    }
  };

  return (
    <>
      {/* ============ MOBILE ============ */}
      <div className="md:hidden flex flex-col flex-1 w-full overflow-hidden bg-[var(--surface-canvas)] font-['Sora',sans-serif] text-[var(--text-primary)]">
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
                  onClick={handlePrimary}
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

      {/* ============ DESKTOP ============ */}
      <div className="hidden md:flex flex-1 flex-col min-h-0 bg-[var(--surface-canvas)] font-['Sora',sans-serif] text-[var(--text-primary)] overflow-y-auto">
        <div className="max-w-[1200px] w-full mx-auto p-[40px_32px] flex flex-col gap-[32px]">
          <div className="flex items-center justify-between pb-[16px] border-b border-[var(--surface-border)]">
            <div className="flex items-center gap-[12px]">
              <Link href="/leagues" className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-[6px]">
                <span>‹</span> All Leagues
              </Link>
              <span className="text-[var(--surface-border-strong)]">/</span>
              <span className="text-[13px] font-heading font-semibold text-[var(--text-primary)]">
                {byCode ? "Join by Code" : "Invitation"}
              </span>
            </div>
            <div className="text-[12px] text-[var(--text-muted)]">
              {onOutcome ? "Status" : "Invite Code"}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[32px] items-start">
            <div className="lg:col-span-7 flex flex-col gap-[20px]">
              <div className="rounded-[20px] bg-[var(--nav-surface)] text-[var(--nav-text)] p-[36px_32px] relative overflow-hidden border border-[var(--surface-border)] shadow-[var(--elev-3)]">
                <div className="absolute top-[-40px] right-[-40px] w-[200px] h-[200px] rounded-full bg-[var(--color-brand)] opacity-10 blur-3xl pointer-events-none" />

                <div className="flex items-center gap-[8px]">
                  <span
                    className="w-[8px] h-[8px] rounded-full flex-none"
                    style={{ background: byCode ? 'var(--nav-text-faint)' : INVITE[1] }}
                  />
                  <span
                    className="font-heading font-bold text-[10.5px] leading-[1] tracking-[0.14em] uppercase"
                    style={{ color: byCode ? 'var(--nav-text-faint)' : INVITE[1] }}
                  >
                    {byCode ? "JOIN BY CODE" : INVITE[0]}
                  </span>
                </div>

                <h1 className={`font-heading font-bold text-[36px] leading-[1.1] tracking-[-1px] mt-[14px] ${concealed ? 'text-[var(--nav-text-faint)]' : ''}`}>
                  {leagueName}
                </h1>

                <p className="text-[13.5px] text-[var(--nav-text-quiet)] leading-[1.6] mt-[12px] max-w-[500px]">
                  {byCode
                    ? "Enter your ten-character invitation code to join this prediction league and battle on the community leaderboard."
                    : "Compete with friends, predict match outcomes, correct scores, goalscorers, and squad lineups across the season."}
                </p>

                {!concealed && (
                  <div className="grid grid-cols-3 gap-[16px] mt-[28px] pt-[24px] border-t border-[rgba(255,255,255,0.1)]">
                    {!byCode &&
                      facts.map(([value, label], i) => (
                        <div key={i} className="flex flex-col">
                          <div className="font-heading font-bold text-[24px] tracking-[-0.6px] font-tabular-nums text-white">
                            {value}
                          </div>
                          <div className="font-heading font-semibold text-[9.5px] tracking-[0.09em] text-[var(--nav-text-faint)] mt-[4px] uppercase">
                            {label}
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {!byCode && tags.length > 0 && (
                  <div className="flex flex-wrap gap-[8px] mt-[24px]">
                    {tags.map((t, i) => (
                      <span
                        key={i}
                        className={`inline-flex items-center h-[26px] px-[10px] rounded-[7px] font-heading font-bold text-[10px] leading-[1] tracking-[0.05em] uppercase ${t.style}`}
                      >
                        {t.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-[14px] bg-[var(--surface-card)] border border-[var(--surface-border)] p-[20px_24px] flex items-center justify-between">
                <div className="flex items-center gap-[14px]">
                  <div className="w-[38px] h-[38px] rounded-[10px] bg-[var(--surface-subtle)] text-[var(--color-brand)] grid place-items-center font-heading font-bold text-[16px]">
                    ⚽
                  </div>
                  <div>
                    <div className="font-heading font-semibold text-[13.5px]">Standard Rule Engine</div>
                    <div className="text-[11.5px] text-[var(--text-muted)] mt-[2px]">Lineups lock 2h before kickoff · Fixture predictions lock at whistle</div>
                  </div>
                </div>
                <span className="text-[11.5px] font-heading font-semibold text-[var(--text-link)]">Rulebook →</span>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-[20px] bg-[var(--surface-card)] border border-[var(--surface-border-strong)] p-[32px_28px] shadow-[var(--elev-3)]">
                {!onOutcome && (
                  <div className="animate-[tfin_0.16s_ease]">
                    <div className="font-heading font-bold text-[20px] leading-[1.2] tracking-[-0.5px]">
                      Enter invite code
                    </div>
                    <div className="text-[12.5px] leading-[1.6] text-[var(--text-secondary)] mt-[6px]">
                      Ten characters, not case-sensitive. Enter the code shared by the league admin.
                    </div>

                    <div className="relative mt-[22px]">
                      <input
                        type="text"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase().slice(0, 10))}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-text z-10"
                        maxLength={10}
                        autoFocus
                      />
                      <div className="grid grid-cols-10 gap-[6px]">
                        {Array.from({ length: 10 }).map((_, i) => {
                          const ch = inviteCode[i] || "";
                          const isFocused = inviteCode.length === i;
                          return (
                            <div
                              key={i}
                              className={`h-[52px] rounded-[10px] grid place-items-center font-heading font-bold text-[16px] bg-[var(--surface-canvas)] text-[var(--text-primary)] border transition-colors ${
                                isFocused ? 'border-[var(--color-brand)] shadow-[0_0_0_1px_var(--color-brand)]' : 'border-[var(--surface-border-strong)]'
                              }`}
                            >
                              {ch}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      onClick={onJoinCode}
                      disabled={inviteCode.length !== 10 || joinLeaguePending}
                      className={`w-full mt-[22px] h-[48px] rounded-[12px] grid place-items-center font-heading font-bold text-[13.5px] transition-all ${
                        inviteCode.length === 10 && !joinLeaguePending
                          ? 'bg-[var(--color-brand)] hover:bg-[var(--color-brand)]/90 text-white shadow-[var(--elev-glow)] cursor-pointer'
                          : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] cursor-not-allowed opacity-60'
                      }`}
                    >
                      {joinLeaguePending ? 'Joining...' : 'Join this league'}
                    </button>

                    <div className="mt-[16px] text-[11.5px] leading-[1.6] text-[var(--text-muted)] text-center">
                      Already have an invite link? Open it in your browser directly.
                    </div>
                  </div>
                )}

                {onOutcome && (
                  <div className="animate-[tfin_0.16s_ease]">
                    <div
                      className="w-[56px] h-[56px] rounded-[14px] grid place-items-center text-[24px] bg-[var(--surface-subtle)] mb-[16px]"
                      style={{ color: o.tone || 'var(--text-muted)' }}
                    >
                      {o.icon}
                    </div>
                    <div className="font-heading font-bold text-[22px] leading-[1.2] tracking-[-0.6px]">
                      {o.title}
                    </div>
                    <div className="text-[13px] leading-[1.6] text-[var(--text-secondary)] mt-[10px]">
                      {o.body}
                    </div>

                    {o.list && (
                      <div className="mt-[20px] rounded-[12px] bg-[var(--surface-canvas)] p-[12px] border border-[var(--surface-border)]">
                        {MY_LEAGUES.map(([name, meta, action, tint, initials, id], i, arr) => (
                          <div
                            key={i}
                            className={`flex items-center gap-[12px] py-[10px] ${
                              i !== arr.length - 1 ? 'border-b border-[var(--surface-border)]' : ''
                            }`}
                          >
                            <span
                              className="w-[32px] h-[32px] rounded-full flex-none grid place-items-center font-heading font-bold text-[11px] text-white"
                              style={{ background: tint }}
                            >
                              {initials}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="font-heading font-semibold text-[13px] truncate">{name}</div>
                              <div className="text-[11px] text-[var(--text-muted)] mt-[2px]">{meta}</div>
                            </div>
                            <span onClick={() => onLeaveLeague(id)} className="font-heading font-bold text-[11px] text-[var(--text-link)] flex-none cursor-pointer">
                              {action}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {o.primary && (
                      <button
                        onClick={handlePrimary}
                        className="w-full mt-[24px] h-[48px] rounded-[12px] grid place-items-center font-heading font-bold text-[13.5px] bg-[var(--color-brand)] text-white shadow-[var(--elev-glow)] hover:bg-[var(--color-brand)]/90 transition-colors cursor-pointer"
                      >
                        {o.primary}
                      </button>
                    )}
                    {o.secondary && (
                      <button
                        onClick={o.secondaryOff ? undefined : secondaryAction}
                        disabled={o.secondaryOff || !secondaryAction}
                        className={`w-full mt-[10px] h-[46px] rounded-[12px] border border-[var(--surface-border-strong)] grid place-items-center font-heading font-semibold text-[13px] transition-colors ${
                          o.secondaryOff || !secondaryAction ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-[var(--surface-subtle)]'
                        }`}
                      >
                        {o.secondary}
                      </button>
                    )}
                    {o.note && (
                      <div className="mt-[16px] text-[11.5px] leading-[1.6] text-[var(--text-muted)]">
                        {o.note}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
