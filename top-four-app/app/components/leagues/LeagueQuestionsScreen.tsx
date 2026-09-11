'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LeagueTabs } from './LeagueTabs';
import { useSubmitCustomAnswer, useCreateCustomQuestion, useResolveCustomQuestion, useVoidCustomQuestion } from '@/hooks/api/useCustomQuestions';
import { toAnswerValue, toQuestionSections, type QuestionCard } from '@/lib/leagues/league-questions';
import { pluralise } from '@/lib/format';

/**
 * Custom questions — one component for both platforms.
 *
 * Three things happen here: a member answers, an admin writes a question, an
 * admin settles one. They were four views crammed into a pair of twins; they
 * are three sections of one screen now.
 *
 * Every answer says when it can be changed until — using the question's own
 * deadline. The version this replaces said "until Sat 18:00" for all of them.
 */

type View = 'list' | 'create';

function Card({ card, onAnswer, pending, canResolve, onResolve, onVoid }: {
  card: QuestionCard;
  onAnswer: (raw: string) => void;
  pending: boolean;
  canResolve: boolean;
  onResolve: (card: QuestionCard) => void;
  onVoid: (card: QuestionCard) => void;
}) {
  const [text, setText] = useState(card.answered ?? '');
  const unanswered = card.canAnswer && !card.answered;

  return (
    <article className={`p-[16px_var(--gutter)] md:px-[8px] border-t border-[var(--surface-border)] last:border-b ${unanswered ? 'bg-[var(--accent-surface)] shadow-[inset_3px_0_0_0_var(--color-brand)]' : ''}`}>
      <div className="flex items-start gap-[12px]">
        <div className="flex-1 min-w-0">
          <div className="font-heading font-[650] text-[14px] leading-[1.35]">{card.title}</div>
          <div className="text-[10.5px] text-[var(--text-muted)] mt-[5px]">
            {card.canAnswer ? card.deadlineLabel : card.phase === 'void' ? 'Voided — nobody scored' : card.phase === 'settled' ? 'Settled' : 'Waiting on the outcome'}
          </div>
        </div>
        <div className="text-right flex-none">
          <div className="tf-num font-heading font-bold text-[20px] tracking-[-0.6px]">{card.points}</div>
          <div className="text-[9.5px] text-[var(--text-muted)] mt-[2px]">{card.points === 1 ? 'pt' : 'pts'}</div>
        </div>
      </div>

      {card.canAnswer && !card.isFreeText && (
        <div className="flex gap-[8px] mt-[12px] flex-wrap">
          {card.choices.map(choice => {
            const on = card.answered === choice.id;
            return (
              <button
                key={choice.id}
                type="button"
                aria-pressed={on}
                disabled={pending}
                onClick={() => onAnswer(choice.id)}
                className={`flex-1 min-w-[92px] h-[46px] rounded-[12px] grid place-items-center font-heading font-[650] text-[13px] ${on ? 'bg-[var(--brand-fill)] text-[var(--color-on-brand)]' : 'border border-[var(--surface-border-strong)] bg-[var(--surface-canvas)]'}`}
              >
                {choice.label}
              </button>
            );
          })}
        </div>
      )}

      {card.canAnswer && card.isFreeText && (
        <form className="flex gap-[8px] mt-[12px]" onSubmit={e => { e.preventDefault(); if (text.trim()) onAnswer(text.trim()); }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type your answer"
            aria-label={card.title}
            className="flex-1 h-[46px] px-[13px] rounded-[12px] border border-[var(--surface-border-strong)] bg-[var(--surface-canvas)] text-[13px]"
          />
          <button type="submit" disabled={pending || !text.trim()} className="h-[46px] px-[16px] rounded-[12px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] font-heading font-bold text-[12.5px] disabled:opacity-40">Save</button>
        </form>
      )}

      {card.answered && card.canAnswer && (
        <div className="text-[10.5px] text-[var(--success-text)] mt-[9px]">
          Stored — you can change it until it {card.deadlineLabel.replace('closes ', 'closes on ')}.
        </div>
      )}

      {card.criteria && (
        <p className="text-[10.5px] leading-[1.55] text-[var(--text-muted)] mt-[10px]">{card.criteria}</p>
      )}

      {canResolve && card.group === 'closed' && (
        <div className="flex gap-[8px] mt-[12px]">
          <button type="button" onClick={() => onResolve(card)} className="h-[38px] px-[14px] rounded-[10px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] font-heading font-bold text-[11.5px]">Settle it</button>
          <button type="button" onClick={() => onVoid(card)} className="h-[38px] px-[14px] rounded-[10px] border border-[var(--color-danger)] text-[var(--danger-text)] font-heading font-bold text-[11.5px]">Void it</button>
        </div>
      )}
    </article>
  );
}

export function LeagueQuestionsScreen({ leagueId, leagueName, cards, canAdmin }: {
  leagueId: string;
  leagueName: string;
  cards: QuestionCard[];
  canAdmin: boolean;
}) {
  const router = useRouter();
  const [view, setView] = useState<View>('list');
  const [failed, setFailed] = useState<string | null>(null);
  const [resolving, setResolving] = useState<QuestionCard | null>(null);
  const [resolveValue, setResolveValue] = useState('');

  const submitAnswer = useSubmitCustomAnswer(leagueId);
  const createQuestion = useCreateCustomQuestion(leagueId);
  const resolveQuestion = useResolveCustomQuestion(leagueId);
  const voidQuestion = useVoidCustomQuestion(leagueId);

  const sections = toQuestionSections(cards);
  const open = cards.filter(c => c.canAnswer);
  const owing = open.filter(c => !c.answered);
  const unclaimed = owing.reduce((n, c) => n + c.points, 0);
  const committed = open.filter(c => c.answered).reduce((n, c) => n + c.points, 0);
  // A league with no questions is not a league that has answered them all.
  const none = cards.length === 0;

  const answer = (card: QuestionCard, raw: string) => {
    setFailed(null);
    submitAnswer.mutate(
      { questionId: card.id, expectedVersion: card.answerVersion, answer: toAnswerValue(card.answerKind, raw) },
      {
        onSuccess: () => router.refresh(),
        onError: () => setFailed('That answer did not save — nothing was stored.'),
      },
    );
  };

  const settle = () => {
    if (!resolving) return;
    setFailed(null);
    const correctAnswer = resolving.isFreeText
      // Open text settles against a list of accepted spellings, not one string.
      ? { acceptedAnswers: resolveValue.split(',').map(s => s.trim()).filter(Boolean) }
      : resolving.answerKind === 'single_choice'
        ? { option: resolveValue }
        : { value: resolveValue === 'yes' || resolveValue === 'true' };

    resolveQuestion.mutate({ questionId: resolving.id, correctAnswer }, {
      onSuccess: () => { setResolving(null); setResolveValue(''); router.refresh(); },
      onError: () => setFailed('Settling that question did not go through.'),
    });
  };

  return (
    <div className="flex flex-col flex-1 h-[100dvh] md:h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif]">

      <header className="flex-none bg-[var(--nav-surface)] text-[var(--nav-text)] pt-[calc(8px+env(safe-area-inset-top))] px-[var(--gutter)] pb-[18px] md:p-0 md:border-b md:border-[rgba(255,255,255,.1)]">
        <div className="md:max-w-[900px] md:mx-auto md:px-[24px] md:py-[24px]">
          <div className="flex items-center gap-[11px]">
            <Link href={`/leagues/${leagueId}/more`} className="tf-tap w-[40px] h-[40px] rounded-full border border-[var(--nav-border)] grid place-items-center flex-none text-[var(--nav-text-quiet)] text-[15px] md:hidden">‹</Link>
            <div className="min-w-0 flex-1">
              <div className="font-heading font-[650] text-[17px] md:text-[20px] leading-[1.1] tracking-[-0.3px]">Questions</div>
              <div className="text-[10.5px] md:text-[12px] text-[var(--nav-text-faint)] mt-[4px] truncate">{leagueName}</div>
            </div>
            {canAdmin && (
              <button
                type="button"
                onClick={() => setView(view === 'create' ? 'list' : 'create')}
                className="h-[38px] px-[14px] rounded-[10px] bg-[var(--nav-accent)] text-[var(--nav-on-accent)] font-heading font-bold text-[11.5px] flex-none"
              >
                {view === 'create' ? 'Close' : 'New question'}
              </button>
            )}
          </div>

          <div className="flex items-end gap-[10px] mt-[16px]">
            <span
              className="tf-num font-heading font-bold text-[38px] leading-[0.9] tracking-[-1.6px]"
              style={{ color: none ? 'var(--nav-text-faint)' : owing.length === 0 ? 'var(--nav-positive)' : 'var(--nav-warning)' }}
            >
              {none ? 0 : owing.length === 0 ? committed : unclaimed}
            </span>
            <div className="pb-[4px] text-[11.5px] leading-[1.35] text-[var(--nav-text-faint)]">
              {none ? 'points on offer' : owing.length === 0 ? 'points already committed' : 'points still unclaimed'}
            </div>
          </div>
          <div className="text-[10.5px] text-[var(--nav-text-faint)] mt-[8px]">
            {none
              ? 'No questions have been written for this league yet.'
              : owing.length === 0
                ? 'Every open question is answered. You can change any of them until its deadline.'
                : `${pluralise(owing.length, 'question')} unanswered. Questions score onto the same table as fixtures.`}
          </div>
        </div>
      </header>

      <LeagueTabs leagueId={leagueId} active="more" />

      <main className="tf-scroll flex-1 overflow-auto pb-[86px] md:pb-[26px]">
        <div className="md:max-w-[900px] md:mx-auto md:px-[24px]">

          {view === 'create' && canAdmin && (
            <CreateQuestion
              pending={createQuestion.isPending}
              onCancel={() => setView('list')}
              onCreate={payload => {
                setFailed(null);
                createQuestion.mutate(payload, {
                  onSuccess: () => { setView('list'); router.refresh(); },
                  onError: () => setFailed('That question was not created.'),
                });
              }}
            />
          )}

          {view === 'list' && (
            sections.length === 0 ? (
              <div className="p-[60px_30px] text-center">
                <div className="font-heading font-bold text-[18px] tracking-[-0.4px]">No questions yet</div>
                <p className="text-[12.5px] leading-[1.6] text-[var(--text-secondary)] mt-[9px] max-w-[320px] mx-auto">
                  {canAdmin
                    ? 'Write one and it scores onto the same table as the fixtures.'
                    : 'An admin has not set any season-long questions for this league.'}
                </p>
              </div>
            ) : sections.map(section => (
              <section key={section.group} className="mt-[18px]">
                <div className="tf-kicker text-[var(--text-muted)] p-[0_var(--gutter)_8px] md:px-[8px]">{section.label}</div>
                {section.cards.map(card => (
                  <Card
                    key={card.id}
                    card={card}
                    pending={submitAnswer.isPending}
                    onAnswer={raw => answer(card, raw)}
                    canResolve={canAdmin}
                    onResolve={c => { setResolving(c); setResolveValue(''); }}
                    onVoid={c => {
                      setFailed(null);
                      voidQuestion.mutate({ questionId: c.id, reason: 'Voided by an admin' }, {
                        onSuccess: () => router.refresh(),
                        onError: () => setFailed('Voiding that question did not go through.'),
                      });
                    }}
                  />
                ))}
              </section>
            ))
          )}

          {failed && <p role="alert" className="p-[14px_var(--gutter)] md:px-[8px] text-[11.5px] text-[var(--danger-text)]">{failed}</p>}
        </div>
      </main>

      {resolving && (
        <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,.45)] flex items-end md:items-center justify-center" onClick={() => setResolving(null)}>
          <div className="w-full md:w-[440px] bg-[var(--surface-card)] rounded-t-[18px] md:rounded-[16px] p-[20px_var(--gutter)_calc(20px+env(safe-area-inset-bottom))] md:p-[22px]" onClick={e => e.stopPropagation()}>
            <div className="font-heading font-bold text-[17px] tracking-[-0.4px]">Settle this question</div>
            <p className="text-[12.5px] leading-[1.6] text-[var(--text-secondary)] mt-[8px]">{resolving.title}</p>

            {resolving.isFreeText ? (
              <label className="block mt-[14px]">
                <span className="text-[11.5px] text-[var(--text-secondary)]">Accepted spellings, separated by commas. Matching ignores case and outer spaces.</span>
                <input
                  autoFocus
                  value={resolveValue}
                  onChange={e => setResolveValue(e.target.value)}
                  className="w-full h-[42px] px-[12px] mt-[8px] rounded-[10px] border border-[var(--surface-border-strong)] bg-[var(--surface-canvas)] text-[13px]"
                />
              </label>
            ) : (
              <div className="flex gap-[8px] mt-[14px] flex-wrap">
                {resolving.choices.map(choice => (
                  <button
                    key={choice.id}
                    type="button"
                    aria-pressed={resolveValue === choice.id}
                    onClick={() => setResolveValue(choice.id)}
                    className={`flex-1 min-w-[92px] h-[44px] rounded-[11px] grid place-items-center font-heading font-[650] text-[12.5px] ${resolveValue === choice.id ? 'bg-[var(--brand-fill)] text-[var(--color-on-brand)]' : 'border border-[var(--surface-border-strong)]'}`}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-[9px] mt-[18px]">
              <button
                type="button"
                disabled={!resolveValue.trim() || resolveQuestion.isPending}
                onClick={settle}
                className="flex-1 h-[46px] rounded-[12px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] font-heading font-bold text-[12.5px] disabled:opacity-40"
              >
                {resolveQuestion.isPending ? 'Settling…' : 'Settle now'}
              </button>
              <button type="button" onClick={() => setResolving(null)} className="h-[46px] px-[18px] rounded-[12px] border border-[var(--surface-border-strong)] font-heading font-semibold text-[12.5px]">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Writing a new question. Admin only — the screen gates it above. */
function CreateQuestion({ pending, onCancel, onCreate }: {
  pending: boolean;
  onCancel: () => void;
  onCreate: (payload: {
    answerKind: 'yes_no' | 'single_choice' | 'open_text';
    questionText: string; resolutionCriteria: string; points: number;
    opensAt: string; deadlineAt: string; outcomeAt: string; options?: string[];
  }) => void;
}) {
  const inSevenDays = new Date(Date.now() + 7 * 24 * 3600 * 1000);
  const [kind, setKind] = useState<'yes_no' | 'single_choice' | 'open_text'>('yes_no');
  const [text, setText] = useState('');
  const [criteria, setCriteria] = useState('');
  const [points, setPoints] = useState(10);
  const [options, setOptions] = useState('');
  const [deadline, setDeadline] = useState(inSevenDays.toISOString().slice(0, 16));

  const valid = text.trim().length > 0 && criteria.trim().length > 0
    && (kind !== 'single_choice' || options.split(',').filter(o => o.trim()).length >= 2);

  return (
    <form
      className="p-[16px_var(--gutter)] md:px-[8px] flex flex-col gap-[12px]"
      onSubmit={e => {
        e.preventDefault();
        if (!valid) return;
        const deadlineAt = new Date(deadline).toISOString();
        onCreate({
          answerKind: kind,
          questionText: text.trim(),
          resolutionCriteria: criteria.trim(),
          points,
          opensAt: new Date().toISOString(),
          deadlineAt,
          outcomeAt: new Date(new Date(deadline).getTime() + 2 * 3600 * 1000).toISOString(),
          ...(kind === 'single_choice' ? { options: options.split(',').map(o => o.trim()).filter(Boolean) } : {}),
        });
      }}
    >
      <div className="flex gap-[6px]">
        {([['yes_no', 'Yes / No'], ['single_choice', 'Choice'], ['open_text', 'Open text']] as const).map(([id, label]) => (
          <button key={id} type="button" aria-pressed={kind === id} onClick={() => setKind(id)}
            className={`flex-1 h-[36px] rounded-[9px] font-heading font-bold text-[11.5px] ${kind === id ? 'bg-[var(--text-primary)] text-[var(--surface-canvas)]' : 'border border-[var(--surface-border-strong)] text-[var(--text-secondary)]'}`}>
            {label}
          </button>
        ))}
      </div>

      <label className="flex flex-col gap-[6px]">
        <span className="text-[11.5px] text-[var(--text-secondary)]">The question</span>
        <input value={text} onChange={e => setText(e.target.value)} className="h-[44px] px-[13px] rounded-[11px] border border-[var(--surface-border-strong)] bg-[var(--surface-canvas)] text-[13px]" />
      </label>

      {kind === 'single_choice' && (
        <label className="flex flex-col gap-[6px]">
          <span className="text-[11.5px] text-[var(--text-secondary)]">Options, separated by commas</span>
          <input value={options} onChange={e => setOptions(e.target.value)} className="h-[44px] px-[13px] rounded-[11px] border border-[var(--surface-border-strong)] bg-[var(--surface-canvas)] text-[13px]" />
        </label>
      )}

      <label className="flex flex-col gap-[6px]">
        <span className="text-[11.5px] text-[var(--text-secondary)]">How it will be settled</span>
        <textarea value={criteria} onChange={e => setCriteria(e.target.value)} rows={3} className="p-[11px_13px] rounded-[11px] border border-[var(--surface-border-strong)] bg-[var(--surface-canvas)] text-[13px] resize-none" />
      </label>

      <div className="flex gap-[10px]">
        <label className="flex-1 flex flex-col gap-[6px]">
          <span className="text-[11.5px] text-[var(--text-secondary)]">Points</span>
          <input type="number" min={1} max={100} value={points} onChange={e => setPoints(Number(e.target.value))} className="h-[44px] px-[13px] rounded-[11px] border border-[var(--surface-border-strong)] bg-[var(--surface-canvas)] text-[13px]" />
        </label>
        <label className="flex-[2] flex flex-col gap-[6px]">
          <span className="text-[11.5px] text-[var(--text-secondary)]">Closes</span>
          <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} className="h-[44px] px-[13px] rounded-[11px] border border-[var(--surface-border-strong)] bg-[var(--surface-canvas)] text-[13px]" />
        </label>
      </div>

      <div className="flex gap-[9px] mt-[4px]">
        <button type="submit" disabled={!valid || pending} className="flex-1 h-[46px] rounded-[12px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] font-heading font-bold text-[13px] disabled:opacity-40">
          {pending ? 'Publishing…' : 'Publish the question'}
        </button>
        <button type="button" onClick={onCancel} className="h-[46px] px-[18px] rounded-[12px] border border-[var(--surface-border-strong)] font-heading font-semibold text-[12.5px]">Cancel</button>
      </div>

      <p className="text-[10.5px] leading-[1.6] text-[var(--text-muted)]">
        Once somebody answers, the wording, options, deadline and point value are locked — they answered partly on the value.
      </p>
    </form>
  );
}
