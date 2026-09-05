'use client';

import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { LeagueQuestionsMobile } from '../../../components/leagues/LeagueQuestionsMobile';
import { LeagueQuestionsDesktop } from '../../../components/leagues/LeagueQuestionsDesktop';
import { useCustomQuestions, useCreateCustomQuestion, useSubmitCustomAnswer, useResolveCustomQuestion, useVoidCustomQuestion, useOwnCustomAnswers, useDisclosedAnswers } from '@/hooks/api/useCustomQuestions';
import { useLeague } from '@/hooks/api/useLeagues';
import { useAuth } from '@/context/auth-context';
import { useParams } from 'next/navigation';
import { STANDINGS_QUESTION_PRESETS, QuestionPreset } from '@/lib/constants/question-presets';


const GROUPS = [
  ["open", "OPEN NOW"],
  ["closed", "WAITING ON THE OUTCOME"],
  ["done", "ALREADY SETTLED"]
];

const TYPES = [
  ["yesno", "Yes / No", "Two options, fixed. The simplest thing to settle."],
  ["choice", "Choice", "You write the options. Members pick exactly one."],
  ["text", "Open text", "Members type an answer. You settle it with a single correct answer, matched ignoring case and outer spaces."]
];

const RESOLVE_NOTES = [
  { title: "Changing the answer later", body: "Correcting a settlement reverses what you already awarded and pays out again on the new answer. Both stay on record, and every member is told it changed." },
  { title: "Terms are locked", body: "Somebody has answered, so the wording, options, deadline and point value cannot change — they answered partly on the value.", foot: "You can still edit the resolution criteria and the outcome date." },
  { title: "If you leave it too long", body: "A question not settled within 14 days of its outcome date is voided automatically, and nobody scores." }
];

export default function QuestionsPage() {
  const params = useParams() as { id: string };
  const { user } = useAuth();
  const { data: league } = useLeague(params.id);
  const { data: questionsPage, isLoading } = useCustomQuestions(params.id);
  const createQuestion = useCreateCustomQuestion(params.id);
  const submitAnswer = useSubmitCustomAnswer(params.id);
  const resolveQuestion = useResolveCustomQuestion(params.id);
  const voidQuestion = useVoidCustomQuestion(params.id);

  const apiQuestions = questionsPage?.data || [];
  
  const questionIds = apiQuestions.map(q => q.id);
  const ownAnswersQueries = useOwnCustomAnswers(params.id, questionIds);

  const ownAnswersMap = ownAnswersQueries.reduce((acc, q, idx) => {
    if (q.data?.data) {
       acc[questionIds[idx]] = q.data.data;
    }
    return acc;
  }, {} as Record<string, any>);

  // Converts the real stored answer ({value}/{option}/{text}) back into the
  // raw UI id these tiles compare against ("yes"/"no", "true"/"false", the
  // option string itself, or the free-text value).
  const answerToRawId = (answerKind: string, answer: any): string | undefined => {
    if (!answer || typeof answer !== 'object') return undefined;
    if ('value' in answer) {
      const v = !!answer.value;
      if (answerKind === 'true_false') return v ? 'true' : 'false';
      return v ? 'yes' : 'no';
    }
    if ('option' in answer) return answer.option;
    if ('text' in answer) return answer.text;
    return undefined;
  };

  // Builds the real per-kind wire shape from the raw UI id/text a member picked.
  const buildAnswerPayload = (answerKind: string, rawValue: string): { value: boolean } | { option: string } | { text: string } => {
    if (answerKind === 'yes_no') return { value: rawValue === 'yes' };
    if (answerKind === 'true_false') return { value: rawValue === 'true' };
    if (answerKind === 'open_text') return { text: rawValue };
    return { option: rawValue };
  };

  const dynamicQuestions = apiQuestions.map(q => {
    let choices: any = undefined;
    let options: any = undefined;

    if (q.answerKind === 'yes_no') choices = [["yes", "Yes"], ["no", "No"]];
    else if (q.answerKind === 'true_false') choices = [["true", "True"], ["false", "False"]];
    else if (q.answerKind === 'single_choice' && q.options) options = q.options.map(o => [o, o, ""]);

    return {
      id: q.id,
      answerKind: q.answerKind,
      realOptions: q.options || [],
      group: q.phase === 'open' ? 'open' : (q.phase === 'settled' || q.phase === 'void') ? 'done' : 'closed',
      pts: String(q.points),
      title: q.questionText,
      chip: q.phase === 'open' ? `OPEN · CLOSES ${new Date(q.deadlineAt).toLocaleDateString()}` : q.phase === 'settled' ? `SETTLED` : q.phase === 'void' ? `VOIDED` : `CLOSED`,
      voided: q.phase === 'void',
      choices,
      options,
      hasText: q.answerKind === 'open_text',
      criteria: q.resolutionCriteria
    };
  });

  const displayQuestions = dynamicQuestions;

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [view, setView] = useState<'list' | 'empty' | 'create' | 'resolve'>('list');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [textDrafts, setTextDrafts] = useState<Record<string, string>>({});
  const [sheet, setSheet] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [qType, setQType] = useState("yesno");
  const [qPoints, setQPoints] = useState(10);
  const [qText, setQText] = useState("");
  const [qCriteria, setQCriteria] = useState("");
  const [qOptions, setQOptions] = useState(["Haaland", "Saka", "Salah"]);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [resolveText, setResolveText] = useState("");
  const [resolveQuestionId, setResolveQuestionId] = useState<string | null>(null);
  const { data: disclosedAnswers } = useDisclosedAnswers(params.id, resolveQuestionId);

  useEffect(() => {
    const newAnswers = { ...answers };
    let changed = false;
    ownAnswersQueries.forEach((q, idx) => {
      if (q.data?.data?.answered && q.data.data.answer) {
        const qId = questionIds[idx];
        const kind = apiQuestions.find(aq => aq.id === qId)?.answerKind || '';
        const raw = answerToRawId(kind, q.data.data.answer);
        if (!newAnswers[qId] && raw !== undefined) {
          newAnswers[qId] = raw;
          changed = true;
        }
      }
    });
    if (changed) {
      setAnswers(newAnswers);
    }
  }, [ownAnswersQueries, questionIds, answers, apiQuestions]);

  useEffect(() => {
    let t: NodeJS.Timeout;
    if (toast) {
      t = setTimeout(() => setToast(null), 2800);
    }
    return () => clearTimeout(t);
  }, [toast]);

  const flash = (msg: string) => setToast(msg);

  const onList = view === "list", onEmpty = view === "empty", onCreate = view === "create", onResolve = view === "resolve";
  const admin = league?.membership?.role === 'owner' || league?.membership?.role === 'admin';

  const submitTextAnswer = (q: any) => {
    const draft = (textDrafts[q.id] || '').trim();
    if (!draft) return;
    setAnswers(s => ({ ...s, [q.id]: draft }));
    const existing = ownAnswersMap[q.id];
    const expectedVersion = existing?.version || 0;
    submitAnswer.mutate({ questionId: q.id, expectedVersion, answer: buildAnswerPayload(q.answerKind, draft) }, {
      onSuccess: () => flash("Answer saved · you can change it until the deadline")
    });
  };

  const goToSettle = (questionId: string) => {
    setResolveQuestionId(questionId);
    setOutcome(null);
    setResolveText("");
    setView("resolve");
  };

  const chipToneMobile = (q: any) => {
    if (q.voided) return "border border-dashed border-[var(--surface-border-strong)] text-[var(--text-muted)]";
    if (q.won) return "bg-[var(--color-success)] text-[var(--tf-white)]";
    if (q.group === "closed") return "bg-[var(--state-locked)] text-[var(--tf-white)]";
    return "bg-[var(--accent-surface)] text-[var(--accent-text-strong)]";
  };
  
  const chipToneDesktop = (q: any): CSSProperties => {
    if (q.voided) return { border: '1px dashed var(--surface-border-strong)', color: 'var(--text-muted)' };
    if (q.won) return { background: 'var(--color-success)', color: 'var(--tf-white)' };
    if (q.group === "closed") return { background: 'var(--state-locked)', color: 'var(--tf-white)' };
    return { background: 'var(--accent-surface)', color: 'var(--accent-text-strong)', border: '1px solid var(--accent-border)' };
  };
  const chipBaseDesktop: CSSProperties = { display: 'inline-flex', alignItems: 'center', height: '20px', padding: '0 8px', borderRadius: '5px', font: "700 8.5px 'DM Sans',sans-serif", letterSpacing: '.06em' };

  const buildMobile = (q: any, i: number, arr: any[]) => {
    const picked = answers[q.id];
    const unanswered = q.group === "open" && !picked;
    return {
      title: q.title, chip: q.chip, chipStyle: chipToneMobile(q),
      pts: q.pts, ptsUnit: q.pts ? (q.won ? "scored" : "pts") : "",
      ptsStyle: `font-heading font-bold ${q.group === "open" ? 'text-[26px]' : 'text-[21px]'} tracking-[-0.8px] ${q.won ? 'text-[var(--prediction-correct)]' : q.group === "open" ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'} ${q.pts ? '' : 'hidden'}`,
      ptsUnitStyle: `text-[9.5px] text-[var(--text-muted)] mt-[3px] ${q.pts ? '' : 'hidden'}`,
      blockStyle: `p-[16px_var(--gutter)] border-t border-[var(--surface-border)] ${i === arr.length - 1 ? 'border-b' : ''} ${unanswered ? 'bg-[var(--accent-surface)] shadow-[inset_3px_0_0_0_var(--color-brand)]' : ''}`,
      
      hasChoices: !!q.choices,
      choices: (q.choices || []).map(([id, label]: [string, string]) => ({
        label,
        style: `flex-1 h-[46px] rounded-[12px] grid place-items-center cursor-pointer font-heading font-[650] text-[13px] transition-colors duration-140 ${picked === id ? 'bg-[var(--brand-fill)] text-[var(--color-on-brand)]' : 'border border-[var(--surface-border-strong)] bg-[var(--surface-canvas)]'}`,
        pick: () => { 
          setAnswers(s => ({ ...s, [q.id]: id })); 
          const existing = ownAnswersMap[q.id];
          const expectedVersion = existing?.version || 0;
          submitAnswer.mutate({ questionId: q.id, expectedVersion, answer: buildAnswerPayload(q.answerKind, id) }, {
            onSuccess: () => flash("Answer saved · you can change it until Sat 18:00")
          }); 
        }
      })),
      
      hasOptions: !!q.options,
      options: (q.options || []).map(([id, label, sub]: [string, string, string]) => {
        const sel = picked === id;
        return {
          label, sub,
          subStyle: `text-[10.5px] flex-none ${sub ? (sel ? 'text-[rgba(255,255,255,0.75)]' : 'text-[var(--text-muted)]') : 'hidden'}`,
          style: `flex items-center gap-[10px] min-h-[46px] rounded-[12px] px-[13px] cursor-pointer transition-colors duration-140 ${sel ? 'bg-[var(--brand-fill)] text-[var(--color-on-brand)]' : 'border border-[var(--surface-border-strong)] bg-[var(--surface-canvas)]'}`,
          markStyle: `w-[15px] h-[15px] rounded-full flex-none ${sel ? 'bg-[var(--tf-white)] border-[4px] border-[var(--brand-fill)] shadow-[0_0_0_1.5px_var(--tf-white)]' : 'border-[1.5px] border-[var(--surface-border-strong)]'}`,
          pick: () => { 
            setAnswers(s => ({ ...s, [q.id]: id })); 
            const existing = ownAnswersMap[q.id];
            const expectedVersion = existing?.version || 0;
            submitAnswer.mutate({ questionId: q.id, expectedVersion, answer: buildAnswerPayload(q.answerKind, id) }, {
              onSuccess: () => flash("Answer saved · you can change it until Sat 18:00")
            }); 
          }
        };
      }),
      
      hasBars: !!q.bars,
      bars: (q.bars || []).map(([label, count, lead]: [string, number, boolean]) => ({
        label, count: String(count),
        labelStyle: `text-[11px] w-[58px] flex-none whitespace-nowrap overflow-hidden text-ellipsis ${lead ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`,
        fillStyle: `w-[${Math.round(count / 128 * 100)}%] h-full rounded-full ${lead ? 'bg-[var(--color-brand)]' : 'bg-[var(--state-locked)]'}`
      })),
      
      hasText: !!q.hasText,
      textValue: textDrafts[q.id] ?? picked ?? '',
      textPlaceholder: "Type your answer…",
      setTextValue: (v: string) => setTextDrafts(s => ({ ...s, [q.id]: v })),
      submitTextValue: () => submitTextAnswer(q),

      canSettle: admin && q.group === 'closed',
      settleLabel: "Settle this question →",
      settleAction: () => goToSettle(q.id),

      answer: q.answer || "",
      answerStyle: `text-[12px] leading-[1.5] mt-[11px] ${q.voided ? 'text-[var(--text-muted)]' : 'text-[var(--text-secondary)]'} ${q.answer ? '' : 'hidden'}`,
      criteria: q.criteria || "",
      criteriaStyle: `text-[10.5px] leading-[1.5] text-[var(--text-muted)] mt-[8px] ${q.criteria ? '' : 'hidden'}`
    };
  };

  const buildDesktop = (q: any, i: number, arr: any[], compact: boolean) => {
    const picked = answers[q.id];
    const unanswered = q.group === "open" && !picked;
    return {
      title: q.title, chip: q.chip, chipStyle: { ...chipBaseDesktop, ...chipToneDesktop(q) } as CSSProperties,
      pts: q.pts, ptsUnit: q.pts ? (q.won ? "scored" : "pts") : "",
      ptsStyle: {
        font: `700 ${compact ? '18px' : '26px'} 'DM Sans',sans-serif`, letterSpacing: '-.7px',
        color: q.won ? 'var(--prediction-correct)' : q.group === "open" ? 'var(--text-primary)' : 'var(--text-secondary)',
        display: q.pts ? undefined : 'none'
      } as CSSProperties,
      ptsUnitStyle: { fontSize: '9.5px', color: 'var(--text-muted)', marginTop: '3px', display: q.pts ? undefined : 'none' } as CSSProperties,
      blockStyle: (compact
        ? { padding: '14px 16px', borderBottom: i === arr.length - 1 ? undefined : '1px solid var(--surface-border)' }
        : { background: unanswered ? 'var(--accent-surface)' : 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: '14px', padding: '18px 20px', marginTop: '11px', boxShadow: unanswered ? 'inset 3px 0 0 0 var(--color-brand)' : undefined }
      ) as CSSProperties,

      hasChoices: !!q.choices,
      choices: (q.choices || []).map(([id, label]: [string, string]) => ({
        label,
        style: {
          flex: 1, height: '46px', borderRadius: '12px', display: 'grid', placeItems: 'center', cursor: 'pointer',
          font: "650 13px 'DM Sans',sans-serif", transition: 'background .14s',
          background: picked === id ? 'var(--brand-fill)' : 'var(--surface-canvas)',
          color: picked === id ? 'var(--color-on-brand)' : undefined,
          border: picked === id ? undefined : '1px solid var(--surface-border-strong)'
        } as CSSProperties,
        pick: () => {
          setAnswers(s => ({ ...s, [q.id]: id }));
          const existing = ownAnswersMap[q.id];
          const expectedVersion = existing?.version || 0;
          submitAnswer.mutate({ questionId: q.id, expectedVersion, answer: buildAnswerPayload(q.answerKind, id) }, {
            onSuccess: () => flash("Answer saved · you can change it until Sat 18:00")
          });
        }
      })),

      hasOptions: !!q.options,
      options: (q.options || []).map(([id, label, sub]: [string, string, string]) => {
        const sel = picked === id;
        return {
          label, sub,
          subStyle: { fontSize: '10.5px', flex: 'none', color: sub ? (sel ? 'rgba(255,255,255,.75)' : 'var(--text-muted)') : undefined, display: sub ? undefined : 'none' } as CSSProperties,
          style: {
            display: 'flex', alignItems: 'center', gap: '10px', minHeight: '46px', borderRadius: '12px', padding: '0 13px', cursor: 'pointer', transition: 'background .14s',
            background: sel ? 'var(--brand-fill)' : 'var(--surface-canvas)',
            color: sel ? 'var(--color-on-brand)' : undefined,
            border: sel ? undefined : '1px solid var(--surface-border-strong)'
          } as CSSProperties,
          markStyle: {
            width: '15px', height: '15px', borderRadius: '999px', flex: 'none',
            background: sel ? 'var(--tf-white)' : undefined,
            border: sel ? '4px solid var(--brand-fill)' : '1.5px solid var(--surface-border-strong)',
            boxShadow: sel ? '0 0 0 1.5px var(--tf-white)' : undefined
          } as CSSProperties,
          pick: () => {
            setAnswers(s => ({ ...s, [q.id]: id }));
            const existing = ownAnswersMap[q.id];
            const expectedVersion = existing?.version || 0;
            submitAnswer.mutate({ questionId: q.id, expectedVersion, answer: buildAnswerPayload(q.answerKind, id) }, {
              onSuccess: () => flash("Answer saved · you can change it until Sat 18:00")
            });
          }
        };
      }),

      hasBars: !!q.bars,
      bars: (q.bars || []).map(([label, count, lead]: [string, number, boolean]) => ({
        label, count: String(count),
        labelStyle: { fontSize: '11px', width: '58px', flex: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: lead ? 'var(--text-primary)' : 'var(--text-secondary)' } as CSSProperties,
        fillStyle: { width: `${Math.round(count / 128 * 100)}%`, height: '100%', borderRadius: '999px', background: lead ? 'var(--color-brand)' : 'var(--state-locked)' } as CSSProperties
      })),

      hasText: !!q.hasText,
      textValue: textDrafts[q.id] ?? picked ?? '',
      textPlaceholder: "Type your answer…",
      setTextValue: (v: string) => setTextDrafts(s => ({ ...s, [q.id]: v })),
      submitTextValue: () => submitTextAnswer(q),

      canSettle: admin && q.group === 'closed',
      settleLabel: "Settle this question →",
      settleAction: () => goToSettle(q.id),

      answer: q.answer || "",
      answerStyle: { fontSize: '11.5px', lineHeight: 1.5, marginTop: '9px', color: q.voided ? 'var(--text-muted)' : 'var(--text-secondary)', display: q.answer ? undefined : 'none' } as CSSProperties,
      criteria: q.criteria || "",
      criteriaStyle: { fontSize: '10.5px', lineHeight: 1.5, color: 'var(--text-muted)', marginTop: compact ? '8px' : '13px', display: q.criteria ? undefined : 'none' } as CSSProperties
    };
  };

  const groupRight = (id: string, items: any[]) => id === 'open'
    ? `${items.reduce((n, q) => n + parseInt(q.pts || '0', 10), 0)} POINTS`
    : `${items.length} ${items.length === 1 ? 'QUESTION' : 'QUESTIONS'}`;

  const groupsMobile = GROUPS.map(([id, kicker]) => {
    const items = displayQuestions.filter(q => q.group === id);
    return { kicker, right: groupRight(id, items), items: items.map(buildMobile) };
  }).filter(g => g.items.length > 0);

  const openQs = displayQuestions.filter(q => q.group === "open");
  const answeredOpen = openQs.filter(q => answers[q.id]).length;
  const owing = openQs.length - answeredOpen;
  const allIn = owing === 0;
  const stake = openQs.filter(q => !answers[q.id]).reduce((n, q) => n + parseInt(q.pts || "0", 10), 0);
  const committed = openQs.reduce((n, q) => n + parseInt(q.pts || "0", 10), 0);
  
  const openItemsDesktop = openQs.map((q, i, a) => buildDesktop(q, i, a, false));
  const pastGroupsDesktop = [
    ["closed", "WAITING ON THE OUTCOME"],
    ["done", "ALREADY SETTLED"]
  ].map(([id, kicker], gi) => {
    const items = displayQuestions.filter(q => q.group === id);
    return { kicker, right: groupRight(id, items), items: items.map((q, i, a) => buildDesktop(q, i, a, true)), wrapStyle: { marginTop: gi === 0 ? 0 : '22px' } };
  }).filter(g => g.items.length > 0);

  const TYPE = TYPES.find(t => t[0] === qType) || TYPES[0];
  const typesMobile = TYPES.map(([id, label]) => ({
    label, pick: () => setQType(id),
    style: `flex-1 h-[36px] rounded-[9px] grid place-items-center cursor-pointer font-heading font-bold text-[11.5px] ${qType === id ? 'bg-[var(--text-primary)] text-[var(--surface-canvas)]' : 'border border-[var(--surface-border-strong)] text-[var(--text-secondary)]'}`
  }));
  const typesDesktop = TYPES.map(([id, label]) => ({
    label, pick: () => setQType(id),
    style: { flex: 1, height: '38px', borderRadius: '9px', display: 'grid', placeItems: 'center', cursor: 'pointer', font: "700 11.5px 'DM Sans',sans-serif", background: qType === id ? 'var(--text-primary)' : 'transparent', color: qType === id ? 'var(--surface-canvas)' : 'var(--text-secondary)', border: qType === id ? 'none' : '1px solid var(--surface-border-strong)' }
  }));

  const pointOptionsMobile = [5, 10, 15, 25].map(v => ({
    label: String(v), pick: () => setQPoints(v),
    style: `flex-1 h-[38px] rounded-[9px] grid place-items-center cursor-pointer font-heading font-bold text-[13px] font-[tabular-nums] ${qPoints === v ? 'bg-[var(--brand-fill)] text-[var(--color-on-brand)]' : 'border border-[var(--surface-border-strong)] text-[var(--text-secondary)]'}`
  }));
  const pointOptionsDesktop = [5, 10, 15, 25].map(v => ({
    label: String(v), pick: () => setQPoints(v),
    style: { flex: 1, height: '40px', borderRadius: '9px', display: 'grid', placeItems: 'center', cursor: 'pointer', font: "700 13px 'DM Sans',sans-serif", fontVariantNumeric: 'tabular-nums', background: qPoints === v ? 'var(--brand-fill)' : 'transparent', color: qPoints === v ? 'var(--color-on-brand)' : 'var(--text-secondary)', border: qPoints === v ? 'none' : '1px solid var(--surface-border-strong)' }
  }));

  const optionsListMobile = qOptions.map((label, i) => ({
    label,
    update: (v: string) => setQOptions(s => s.map((o, j) => j === i ? v : o)),
    removeStyle: `text-[15px] text-[var(--text-muted)] flex-none px-[2px] ${qOptions.length > 2 ? 'cursor-pointer' : 'opacity-30'}`,
    remove: () => { if (qOptions.length > 2) setQOptions(s => s.filter((_, j) => j !== i)); }
  }));
  const optionsListDesktop = qOptions.map((label, i) => ({
    label,
    update: (v: string) => setQOptions(s => s.map((o, j) => j === i ? v : o)),
    removeStyle: { fontSize: '15px', color: 'var(--text-muted)', flex: 'none', padding: '0 2px', cursor: qOptions.length > 2 ? 'pointer' : 'default', opacity: qOptions.length > 2 ? 1 : 0.3 },
    remove: () => { if (qOptions.length > 2) setQOptions(s => s.filter((_, j) => j !== i)); }
  }));

  const canPublish = !!qText && !!qCriteria && !createQuestion.isPending;

  const applyPreset = (preset: QuestionPreset) => {
    setQText(preset.questionText);
    setQCriteria(preset.resolutionCriteria);
    setQPoints(preset.points);
    setQType(preset.answerKind === 'single_choice' ? 'choice' : preset.answerKind === 'yes_no' ? 'yesno' : 'text');
    if (preset.options) {
      setQOptions(preset.options);
    }
    flash(`Loaded preset: ${preset.questionText}`);
  };

  const handlePublish = () => {
    if (!canPublish) return;
    
    // Convert relative dates for MVP (e.g. opens now, closes in 1 week, outcomes in 1 week + 2 hours)
    const now = new Date();
    const deadlineAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const outcomeAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString();
    
    createQuestion.mutate({
      answerKind: qType === 'yesno' ? 'yes_no' : qType === 'choice' ? 'single_choice' : 'open_text',
      questionText: qText,
      resolutionCriteria: qCriteria,
      points: qPoints,
      opensAt: now.toISOString(),
      deadlineAt,
      outcomeAt,
      options: qType === 'choice' ? qOptions : undefined
    }, {
      onSuccess: () => {
        setView("list");
        setQText("");
        setQCriteria("");
        flash("Question is live · Members notified");
      },
      onError: () => {
        flash("Failed to publish question");
      }
    });
  };

  const handleResolve = () => {
    if (resolveQuestion.isPending) return;
    const targetQ = displayQuestions.find(q => q.id === resolveQuestionId);
    if (!targetQ) return;

    const isText = targetQ.answerKind === 'open_text';
    const rawValue = isText ? resolveText.trim() : outcome;
    if (!rawValue) return;

    resolveQuestion.mutate({
      questionId: targetQ.id,
      correctAnswer: buildAnswerPayload(targetQ.answerKind, rawValue),
      reason: "Resolved by admin"
    }, {
      onSuccess: () => {
        setView("list");
        setOutcome(null);
        setResolveText("");
        setResolveQuestionId(null);
        flash("Question settled · Points awarded");
      },
      onError: () => {
        flash("Failed to settle question");
      }
    });
  };

  const handleVoid = () => {
    if (voidQuestion.isPending || !resolveQuestionId) return;
    voidQuestion.mutate({ questionId: resolveQuestionId, reason: "Voided by admin" }, {
      onSuccess: () => {
        setView("list");
        setOutcome(null);
        setResolveText("");
        setResolveQuestionId(null);
        flash("Voided · nobody scored");
      },
      onError: () => {
        flash("Failed to void question");
      }
    });
  };

  const resolveNotesListMobile = RESOLVE_NOTES.map((n: any, i, arr) => ({
    title: n.title, body: n.body,
    rowStyle: `p-[16px_var(--gutter)] border-t border-[var(--surface-border)] ${i === arr.length - 1 ? 'border-b' : ''}`,
    hasEffect: !!n.effect, effect: (n.effect || []).map(([label, value]: [string, string]) => ({ label, value })),
    hasAction: !!n.action, action: n.action,
    actionStyle: `mt-[12px] h-[46px] rounded-[12px] grid place-items-center cursor-pointer font-heading font-bold text-[12.5px] ${n.danger ? 'bg-[var(--color-danger)] text-[var(--tf-white)]' : 'border border-[var(--surface-border-strong)]'}`,
    hasFoot: !!n.foot, foot: n.foot
  }));
  const resolveNotesListDesktop = RESOLVE_NOTES.map((n: any, i) => ({
    title: n.title, body: n.body, foot: n.foot || "", action: n.action || "",
    effect: (n.effect || []).map(([label, value]: [string, string]) => ({ label, value })),
    wrapStyle: { padding: '16px 18px', borderRadius: '14px', marginTop: i ? '14px' : 0, background: n.danger ? 'var(--danger-surface)' : 'var(--surface-card)', border: `1px solid ${n.danger ? 'var(--color-danger)' : 'var(--surface-border)'}` },
    titleColor: n.danger ? "var(--danger-text)" : "var(--text-primary)",
    bodyColor: n.danger ? "var(--danger-text)" : "var(--text-secondary)",
    ruleColor: n.danger ? "var(--color-danger)" : "var(--surface-border)",
    effectWrapStyle: { marginTop: n.effect ? '11px' : 0, display: n.effect ? 'block' : 'none' },
    footStyle: { fontSize: '11px', lineHeight: 1.5, color: 'var(--text-muted)', marginTop: '9px', display: n.foot ? 'block' : 'none' },
    actionStyle: { marginTop: '13px', height: '38px', borderRadius: '9px', display: n.action ? 'grid' : 'none', placeItems: 'center', cursor: 'pointer', font: "700 12px 'DM Sans',sans-serif", background: 'var(--color-danger)', color: 'var(--tf-white)' }
  }));

  const targetQForResolve = displayQuestions.find(q => q.id === resolveQuestionId);
  const disclosedCountsByRawId: Record<string, number> = {};
  if (targetQForResolve && disclosedAnswers?.answers) {
    for (const a of disclosedAnswers.answers) {
      const raw = answerToRawId(targetQForResolve.answerKind, a.answer);
      if (raw !== undefined) disclosedCountsByRawId[raw] = (disclosedCountsByRawId[raw] || 0) + 1;
    }
  }
  const totalDisclosed = disclosedAnswers?.answers?.length || 0;
  const OUT: [string, string, number][] = targetQForResolve?.options
    ? targetQForResolve.options.map((o: any) => [o[0] as string, o[1] as string, disclosedCountsByRawId[o[0]] || 0])
    : targetQForResolve?.choices
      ? targetQForResolve.choices.map((c: any) => [c[0] as string, c[1] as string, disclosedCountsByRawId[c[0]] || 0])
      : [];
  const outcomesDesktop = OUT.map(([id, label, count]) => {
    const sel = outcome === id;
    return {
      label, count: `${count} answered`,
      pick: () => setOutcome(id as string),
      style: { display: 'flex', alignItems: 'center', gap: '11px', minHeight: '50px', borderRadius: '12px', padding: '0 15px', cursor: 'pointer', background: sel ? 'var(--brand-fill)' : 'var(--surface-card)', color: sel ? 'var(--color-on-brand)' : 'var(--text-primary)', border: sel ? 'none' : '1px solid var(--surface-border-strong)' },
      markStyle: { width: '15px', height: '15px', borderRadius: '999px', flex: 'none', background: sel ? 'var(--tf-white)' : 'transparent', border: sel ? '4px solid var(--brand-fill)' : '1.5px solid var(--surface-border-strong)', boxShadow: sel ? '0 0 0 1.5px var(--tf-white)' : 'none' },
      countStyle: { font: "600 11.5px 'DM Sans',sans-serif", flex: 'none', color: sel ? 'rgba(255,255,255,.78)' : 'var(--text-muted)' }
    };
  });
  const outcomesMobile = OUT.map(([id, label, count]) => {
    const sel = outcome === id;
    return {
      label, count: `${count} answered`,
      pick: () => setOutcome(id as string),
      style: `flex items-center gap-[11px] min-h-[50px] rounded-[12px] px-[15px] cursor-pointer ${sel ? 'bg-[var(--brand-fill)] text-[var(--color-on-brand)]' : 'bg-[var(--surface-card)] text-[var(--text-primary)] border border-[var(--surface-border-strong)]'}`,
      markStyle: `w-[15px] h-[15px] rounded-full flex-none ${sel ? 'bg-[var(--tf-white)] border-[4px] border-[var(--brand-fill)] shadow-[0_0_0_1.5px_var(--tf-white)]' : 'border-[1.5px] border-[var(--surface-border-strong)]'}`,
      countStyle: `tf-num font-heading font-semibold text-[11.5px] flex-none ${sel ? 'text-[rgba(255,255,255,0.78)]' : 'text-[var(--text-muted)]'}`
    };
  });
  const resolveIsText = targetQForResolve?.answerKind === 'open_text';
  const canSettleNow = resolveIsText ? !!resolveText.trim() : !!outcome;
  const settleLabelText = resolveQuestion.isPending ? "Settling…" : canSettleNow ? `Settle and pay out ${totalDisclosed} ${totalDisclosed === 1 ? 'member' : 'members'}` : "Pick the outcome first";
  const resolveTitle = targetQForResolve?.title || "Pick a question to settle";
  const resolveSubtitle = targetQForResolve ? `${totalDisclosed} ${totalDisclosed === 1 ? 'member has' : 'members have'} answered. Awarding an outcome pays out immediately and tells everybody what they scored.` : "";

  const match = resolveIsText ? totalDisclosed : (outcome ? (disclosedCountsByRawId[outcome] || 0) : 0);
  const questionPoints = targetQForResolve?.pts ?? "0";
  const settleQuestionName = targetQForResolve?.title || "this question";
  const SHEET = sheet === "void"
    ? ["Void this question?", "Nobody scores. Use it when the question can no longer be answered fairly. Members are told why.", [["Members answered", String(totalDisclosed)], ["Awards reversed", "0"]], "Void now", true]
    : sheet === "settle"
    ? [`Settle "${settleQuestionName}"?`, "Members are notified either way.", [["Members gaining points", String(match)], ["Members gaining nothing", String(Math.max(0, totalDisclosed - match))], ["Points each", String(questionPoints)]], "Settle now", false]
    : null;

  const IconMap: Record<string, any> = {
    overview: () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M4 10.5 12 4l8 6.5V20H4v-9.5Z" /><path d="M9.5 20v-6h5v6" /></svg>,
    ball: () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><circle cx="12" cy="12" r="8" /><path d="m12 8 3.4 2.5-1.3 4h-4.2l-1.3-4L12 8Z" /></svg>,
    table: () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M5 19V11M12 19V5M19 19V8" /></svg>,
    more: () => <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" strokeWidth="0" style={{ display: 'block' }}><path d="M5 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm7 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm7 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" /></svg>
  };

  const tabs = [
    { label: "OVERVIEW", ic: "overview", on: false },
    { label: "FIXTURES", ic: "ball", on: false },
    { label: "TABLE", ic: "table", on: false },
    { label: "MORE", ic: "more", on: true }
  ];
  
  const questionBadge = (onEmpty || allIn) ? "" : String(owing);
  const stakeLabel = allIn ? "all answered" : (owing === 1 ? "question unanswered" : "questions unanswered");

  const rootNav = [["Home","home",""],["Predict","predict","25"],["Leagues","leagues",""]].map((it) => {
    const label = it[0], id = it[1], badge = it[2];
    return {
      label, id, badge,
      badgeStyle: badge ? { marginLeft: '7px', minWidth: '16px', height: '16px', padding: '0 4px', borderRadius: '8px', background: 'var(--nav-accent)', color: 'var(--nav-on-accent)', display: 'inline-grid', placeItems: 'center', font: "700 9px 'DM Sans',sans-serif" } : { display: 'none' },
      style: { display: 'flex', alignItems: 'center', padding: '7px 13px', borderRadius: '9px', font: "600 12.5px 'DM Sans',sans-serif", cursor: 'pointer', background: id === "leagues" ? 'var(--nav-fill)' : 'transparent', opacity: id === "leagues" ? 1 : 0.66 } 
    };
  });

  const tabItem = (label: string, on: boolean, badge: string) => ({
    label, badge: badge || "",
    style: { display: 'flex', alignItems: 'center', padding: '0 13px', height: '43px', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: '12.5px', cursor: 'pointer', borderBottom: `2px solid ${on ? 'var(--color-brand)' : 'transparent'}`, color: on ? 'var(--text-primary)' : 'var(--text-muted)' },
    badgeStyle: badge ? { marginLeft: '7px', minWidth: '16px', height: '16px', padding: '0 4px', borderRadius: '8px', background: 'var(--color-danger)', color: 'var(--color-on-brand)', display: 'inline-grid', placeItems: 'center', font: "700 9px 'DM Sans',sans-serif" } : { display: 'none' }
  });
  
  const propsMobile = {
    theme, view, params, setView, setSheet, admin, allIn, committed, stake, owing,
    groups: groupsMobile, IconMap, tabs, onList, onEmpty, onCreate, onResolve,
    qText, setQText, types: typesMobile, TYPE, qType, optionsList: optionsListMobile, setQOptions,
    qPoints, pointOptions: pointOptionsMobile, qCriteria, setQCriteria, canPublish, flash, publishAction: handlePublish,
    resolveTitle, resolveSubtitle, outcomes: outcomesMobile, resolveIsText, resolveText, setResolveText,
    canSettleNow, settleLabel: settleLabelText,
    match, resolveNotesList: resolveNotesListMobile, SHEET, toast, settleAction: handleResolve, voidAction: handleVoid,
    presets: STANDINGS_QUESTION_PRESETS, applyPreset,
    leagueName: league?.name
  };
  
  const propsDesktop = {
    theme, rootNav, avatarInitials: (user?.displayName || "??").substring(0, 2).toUpperCase(), avatarName: user?.displayName || "", showContext: true,
    contextTabs: [tabItem("Overview", false, ""), tabItem("Fixtures", false, "6"), tabItem("Table", false, ""), tabItem("Questions", true, questionBadge), tabItem("More", false, "")],
    onList, onEmpty, onCreate, onResolve,
    heroStyle: { padding: '24px 0 26px', background: 'var(--nav-surface)', color: 'var(--nav-text)', borderBottom: '1px solid rgba(255,255,255,.1)' },
    heroTone: allIn ? "var(--nav-positive)" : "var(--nav-warning)",
    heroKicker: allIn ? "NOTHING OWED" : "RIDING ON YOUR ANSWERS",
    heroNum: allIn ? "25" : String(stake),
    heroSub: allIn ? "points already committed" : "points still unclaimed",
    heroNote: allIn ? "Every open question is answered. You can change any of them until the deadline — the points only settle when somebody resolves the question." : `${owing} ${stakeLabel}. Questions score onto the same table as fixtures, so leaving one is the same as leaving a market blank.`,
    newBtnStyle: { flex: 'none', height: '40px', padding: '0 18px', borderRadius: '11px', display: 'grid', placeItems: 'center', cursor: 'pointer', font: "700 12.5px 'DM Sans',sans-serif", background: 'var(--nav-accent)', color: 'var(--nav-on-accent)' },
    setView, allIn, stake, committed, owing, openItems: openItemsDesktop, pastGroups: pastGroupsDesktop,
    qText, setQText, qType, setQType, types: typesDesktop, TYPE, optionsList: optionsListDesktop, setQOptions,
    qPoints, setQPoints, pointOptions: pointOptionsDesktop, qCriteria, setQCriteria,
    canPublish, publishStyle: { marginTop: '22px', height: '48px', borderRadius: '13px', display: 'grid', placeItems: 'center', cursor: canPublish ? 'pointer' : 'default', font: "700 13.5px 'DM Sans',sans-serif", background: canPublish ? 'var(--brand-fill)' : 'var(--surface-subtle)', color: canPublish ? 'var(--color-on-brand)' : 'var(--text-muted)' },
    publishLabel: createQuestion.isPending ? "Publishing..." : canPublish ? "Ask the league" : "Add the criteria to continue",
    publishNoteStyle: { fontSize: '10.5px', lineHeight: 1.55, color: 'var(--text-muted)', marginTop: '10px', textAlign: 'center' },
    publishNote: canPublish ? "Goes live straight away. Everyone in the league is told a new question is open." : "Every question needs a stated way to settle it before it can go live.",
    presets: STANDINGS_QUESTION_PRESETS, applyPreset,
    publishAction: handlePublish,
    previewText: qText || "Your question will read here", previewPoints: String(qPoints),
    outcomes: outcomesDesktop, resolveTitle, resolveSubtitle, resolveIsText, resolveText, setResolveText, canSettleNow,
    match,
    settleStyle: { marginTop: '24px', height: '48px', borderRadius: '12px', display: 'grid', placeItems: 'center', font: "700 13.5px 'DM Sans',sans-serif", background: canSettleNow ? 'var(--brand-fill)' : 'var(--surface-subtle)', color: canSettleNow ? 'var(--color-on-brand)' : 'var(--text-muted)', cursor: canSettleNow ? 'pointer' : 'not-allowed' },
    settleLabel: settleLabelText,
    settleAction: handleResolve, voidAction: handleVoid,
    resolveNotesList: resolveNotesListDesktop, toast, toastStyle: {
      position: 'fixed' as const, bottom: '30px', left: '50%', transform: `translateX(-50%) translateY(${toast ? '0' : '20px'})`,
      opacity: toast ? 1 : 0, transition: 'all .2s cubic-bezier(.1,.9,.2,1)', pointerEvents: 'none' as const, zIndex: 100,
      background: 'var(--nav-surface)', color: 'var(--nav-text)', padding: '0 18px', height: '42px', borderRadius: '21px',
      display: 'flex', alignItems: 'center', font: "700 12.5px 'DM Sans',sans-serif", boxShadow: '0 12px 24px rgba(0,0,0,.2)'
    },
    leagueName: league?.name,
    memberCount: league?.memberCount,
    params
  };

  return (
    <div className="flex flex-col flex-1 h-[100dvh] md:h-auto overflow-hidden bg-[var(--surface-canvas)] relative">
      



      <div className="md:hidden flex flex-col flex-1 overflow-hidden h-[100dvh]">
        <LeagueQuestionsMobile {...propsMobile} />
      </div>
      <div className="hidden md:flex flex-col flex-1 overflow-hidden h-full">
        <LeagueQuestionsDesktop {...propsDesktop} />
      </div>
    </div>
  );
}
