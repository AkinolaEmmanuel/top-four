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
  step: 'signup' | 'signin' | 'code';
  setStep: (s: 'signup' | 'signin' | 'code') => void;
  onOutcome: boolean;
  outcome: string | null;
  setOutcome: (o: string | null) => void;
  o: any;
  inviteCode: string;
  setInviteCode: (c: string) => void;
  focus: string | null;
  setFocus: (f: string | null) => void;
  attempts: number;
  trySignin: () => void;
  joinLeaguePending: boolean;
  onJoinCode: () => void;
  onNavigateHome: () => void;
  MY_LEAGUES: string[][];
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
    step,
    setStep,
    onOutcome,
    outcome,
    setOutcome,
    o,
    inviteCode,
    setInviteCode,
    focus,
    setFocus,
    attempts,
    trySignin,
    joinLeaguePending,
    onJoinCode,
    onNavigateHome,
    MY_LEAGUES,
  } = props;

  const Field = ({ label, fieldKey, hint }: { label: string; fieldKey: string; hint?: string }) => {
    const on = focus === fieldKey;
    return (
      <div>
        <div
          onClick={() => setFocus(fieldKey)}
          className={`min-h-[48px] rounded-[12px] flex items-center px-[13px] cursor-text bg-[var(--surface-card)] text-[12.5px] text-[var(--text-muted)] border ${
            on ? 'border-[var(--color-brand)]' : 'border-[var(--surface-border-strong)]'
          }`}
        >
          {label}
        </div>
        {hint && <div className="text-[10.5px] text-[var(--text-muted)] mt-[6px] pl-[2px]">{hint}</div>}
      </div>
    );
  };

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
        {/* CREATE ACCOUNT */}
        {!onOutcome && step === "signup" && (
          <div className="p-[20px_var(--gutter)_26px] animate-[tfin_0.16s_ease]">
            <div className="font-heading font-bold text-[19px] leading-[1.2] tracking-[-0.5px]">
              Create an account to join
            </div>
            <div className="flex flex-col gap-[12px] mt-[16px]">
              <Field label="Email address" fieldKey="email" />
              <Field label="Display name" fieldKey="name" hint="Shown on the table. You can change it later." />
              <Field label="Password" fieldKey="pw" hint="Twelve characters or more." />
            </div>
            <div
              onClick={() => {
                setOutcome("verify");
                setFocus(null);
              }}
              className="tf-tap mt-[16px] h-[48px] rounded-[13px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] grid place-items-center font-heading font-bold text-[13.5px] shadow-[var(--elev-glow)]"
            >
              Create account and join
            </div>

            <div className="flex items-center gap-[10px] my-[16px]">
              <div className="flex-1 h-[1px] bg-[var(--surface-border)]" />
              <span className="text-[10.5px] text-[var(--text-muted)]">or</span>
              <div className="flex-1 h-[1px] bg-[var(--surface-border)]" />
            </div>
            <div className="tf-tap h-[48px] rounded-[13px] border border-[var(--surface-border-strong)] grid place-items-center font-heading font-bold text-[13px]">
              Continue with Google
            </div>

            <div className="text-center mt-[18px] text-[12.5px] text-[var(--text-secondary)]">
              Already have an account?{" "}
              <span
                onClick={() => {
                  setStep("signin");
                  setFocus(null);
                }}
                className="tf-tap text-[var(--text-link)] font-semibold"
              >
                Sign in
              </span>
            </div>
            <div className="text-center mt-[14px]">
              <span
                onClick={() => {
                  setStep("code");
                  setFocus(null);
                }}
                className="tf-tap text-[11.5px] text-[var(--text-link)]"
              >
                Have a code instead?
              </span>
            </div>
          </div>
        )}

        {/* SIGN IN */}
        {!onOutcome && step === "signin" && (
          <div className="p-[20px_var(--gutter)_26px] animate-[tfin_0.16s_ease]">
            <div className="font-heading font-bold text-[19px] leading-[1.2] tracking-[-0.5px]">Sign in to join</div>
            <div className="flex flex-col gap-[12px] mt-[16px]">
              <Field label="Email address" fieldKey="semail" />
              <Field label="Password" fieldKey="spw" />
            </div>

            {attempts > 0 && (
              <div className="mt-[12px] p-[12px_13px] rounded-[12px] border border-[var(--color-danger)] bg-[var(--surface-card)]">
                <div className="font-heading font-bold text-[12px] text-[var(--danger-text)]">
                  {attempts >= 2 ? "Too many attempts" : "Email or password is incorrect"}
                </div>
                <div className="text-[11.5px] leading-[1.5] text-[var(--text-secondary)] mt-[5px]">
                  {attempts >= 2
                    ? "Try again in 48 seconds. Your invitation is still held."
                    : "Check the address the invitation was sent to."}
                </div>
              </div>
            )}

            <div
              onClick={trySignin}
              className={`tf-tap mt-[16px] h-[48px] rounded-[13px] grid place-items-center font-heading font-bold text-[13.5px] ${
                attempts >= 2
                  ? 'bg-[var(--surface-subtle)] text-[var(--text-muted)] cursor-not-allowed'
                  : 'bg-[var(--brand-fill)] text-[var(--color-on-brand)] shadow-[var(--elev-glow)]'
              }`}
            >
              {attempts >= 2 ? "Locked for 48s" : "Sign in and join"}
            </div>

            <div className="flex justify-between mt-[16px]">
              <span className="tf-tap text-[11.5px] text-[var(--text-link)]">Forgot password</span>
              <span
                onClick={() => {
                  setStep("signup");
                  setFocus(null);
                }}
                className="tf-tap text-[11.5px] text-[var(--text-link)]"
              >
                Create an account
              </span>
            </div>
            <div className="mt-[20px] text-[11.5px] leading-[1.6] text-[var(--text-muted)]">
              Signing in takes you straight into the league. The invitation survives the round trip, and the hold above keeps counting.
            </div>
          </div>
        )}

        {/* CODE */}
        {!onOutcome && step === "code" && (
          <div className="p-[20px_var(--gutter)_26px] animate-[tfin_0.16s_ease]">
            <div className="font-heading font-bold text-[19px] leading-[1.2] tracking-[-0.5px]">
              Enter the code you were given
            </div>
            <div className="text-[12.5px] leading-[1.6] text-[var(--text-secondary)] mt-[9px]">
              Six characters, not case sensitive. A code names one league and behaves exactly like a link to it.
            </div>
            <div className="relative mt-[18px]">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase().slice(0, 6))}
                className="absolute inset-0 opacity-0 w-full h-full cursor-text z-10"
                maxLength={6}
              />
              <div className="flex gap-[7px]">
                {Array.from({ length: 6 }).map((_, i) => {
                  const ch = inviteCode[i] || "";
                  const isFocused = inviteCode.length === i;
                  return (
                    <div
                      key={i}
                      className={`flex-1 h-[52px] rounded-[11px] grid place-items-center font-heading font-bold text-[20px] bg-[var(--surface-card)] text-[var(--text-primary)] border ${
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
                inviteCode.length === 6 && !joinLeaguePending
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
                {MY_LEAGUES.map(([name, meta, action, tint, initials], i, arr) => (
                  <div
                    key={i}
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
                    setStep("code");
                  }
                }}
                className="tf-tap mt-[22px] h-[48px] rounded-[13px] grid place-items-center font-heading font-bold text-[13.5px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] shadow-[var(--elev-glow)]"
              >
                {o.primary}
              </div>
            )}
            {o.secondary && (
              <div
                className={`mt-[8px] h-[46px] rounded-[12px] border border-[var(--surface-border-strong)] grid place-items-center font-heading font-bold text-[12.5px] ${
                  o.secondaryOff ? 'opacity-45' : 'cursor-pointer'
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
