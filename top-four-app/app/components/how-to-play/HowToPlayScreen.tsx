'use client';

import Link from 'next/link';
import Image, { type StaticImageData } from 'next/image';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/auth-context';
import { FootballBall } from '../brand/football-ball';

/*
 * Imported, not referenced by a path under `public/`.
 *
 * A public path is stable, so Next will not let it be cached — these shipped
 * with `max-age=0, must-revalidate` and were refetched on every page load.
 * Imported, each one is emitted with a content hash and served immutable for a
 * year; replacing a shot changes the hash, so nothing can go stale either.
 */
import leaguesShot from './shots/leagues.png';
import predictShot from './shots/predict.png';
import lineupsShot from './shots/lineups-filled.png';
import questionsShot from './shots/questions.png';
import tableShot from './shots/table.png';
import homeMobileShot from './shots/home-mobile.png';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

const STEPS: {
  n: string;
  eyebrow: string;
  title: string;
  body: string;
  image: StaticImageData;
  alt: string;
  /** Overrides the default 16:10 shot frame where a screen needs a wider crop. */
  aspect?: string;
}[] = [
    {
      n: '01',
      eyebrow: 'Start here',
      title: 'Create a league, or join one with a code',
      body: "Set up your own league around any competition in a couple of taps, or drop in the invite code a friend sent you. Every league runs its own table, so the same friends can run five leagues at once and never mix them up.",
      image: leaguesShot,
      alt: 'The Leagues screen, showing a league card with member count and a Join or Create a league button',
    },
    {
      n: '02',
      eyebrow: 'Every fixture',
      title: 'Predict scores, results and more — pick the score once, we do the rest',
      body: "Call the match result, the exact score, both teams to score, total goals and who scores first. Pick an exact score and TopFour fills in both teams to score and total goals to match it automatically, so a 2-1 doesn't leave you disagreeing with yourself on the market underneath it.",
      image: predictShot,
      alt: 'The fixture prediction screen for Brentford v Chelsea, showing match result, exact score, and both teams to score markets',
    },
    {
      n: '03',
      eyebrow: 'Starting XI',
      title: 'Name a lineup in one tap with Auto-fill',
      body: "Pick a formation, then hit Auto-fill to drop in a sensible XI from the real squad instantly — swap in whoever you actually rate, or leave it exactly as it landed. Either way, the shape is picked and the eleven are named before kickoff.",
      image: lineupsShot,
      alt: 'The lineup picker showing a completed 4-3-3 Brentford starting XI on a pitch diagram, filled in with one tap',
    },
    {
      n: '04',
      eyebrow: "This week's debate",
      title: 'Answer the questions only your league is asking',
      body: 'Every league can add its own questions on top of the fixtures — who finishes top four, whether there\'s a red card this weekend, whatever your group actually argues about. They score onto the same table as everything else.',
      image: questionsShot,
      alt: 'The Questions screen showing two open custom questions worth points, including club and yes/no picks',
    },
    {
      n: '05',
      eyebrow: 'Bragging rights',
      title: 'Watch the table settle every argument',
      body: "Points land the moment results are confirmed, and the table updates live. No more he-said-she-said about who actually called it — the standings remember for you.",
      image: tableShot,
      alt: 'The league table showing member standings ranked by points',
      // The shot's own ratio, so a short table is neither cropped nor padded.
      aspect: 'aspect-[36/13]',
    },
  ];

export function HowToPlayScreen() {
  /* This page is public and the root nav hides itself here, so a signed-in
     reader who followed the link has no way back into the app — the sign-up
     pair is a dead end for them. `user` is null until auth resolves, which is
     the right default: the page is mostly read by people who aren't members. */
  const { user } = useAuth();

  return (
    <div className="flex flex-col flex-1 min-h-0 h-[100dvh] bg-[var(--surface-canvas)] text-[var(--text-primary)]">
      {/* Top bar — stays outside the scroll region so it reads as a fixed nav, not just sticky. */}
      <header className="flex-none z-20 border-b border-[var(--border-base)] bg-[var(--surface-canvas)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="font-heading font-bold text-[17px] leading-[1] tracking-[-0.6px] text-[var(--text-primary)]">
            TOPFOUR<span className="text-[var(--color-brand)]">/</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <Link
                href="/home"
                className="inline-flex items-center justify-center rounded-md h-9 px-4 sm:px-5 text-sm font-bold tracking-wide text-white bg-[var(--brand-fill)] hover:bg-[var(--color-brand-hover)] transition-colors"
              >
                Back to TopFour
              </Link>
            ) : (
              <>
                <Link
                  href="/"
                  className="hidden sm:inline-flex items-center justify-center rounded-md h-9 px-4 text-sm font-bold text-[var(--text-primary)] hover:text-[var(--color-brand)] transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center rounded-md h-9 px-4 sm:px-5 text-sm font-bold tracking-wide text-white bg-[var(--brand-fill)] hover:bg-[var(--color-brand-hover)] transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto tf-scroll">

        {/* Hero */}
        <section className="relative overflow-hidden bg-slate-950 border-b border-slate-800">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] bg-[size:28px_28px]" />
          <svg
            aria-hidden
            viewBox="0 0 800 400"
            className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
          >
            {/* Halfway line and centre circle only. The penalty boxes used to
                be here, but `slice` crops their tops and bottoms away at this
                width, leaving two bare verticals that read as stray lines. */}
            <line x1="0" y1="200" x2="800" y2="200" stroke="white" strokeWidth="2" />
            <circle cx="400" cy="200" r="90" stroke="white" strokeWidth="2" />
            <circle cx="400" cy="200" r="3" fill="white" />
          </svg>

          <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 text-center">
            <motion.div
              aria-hidden
              className="mx-auto mb-8 w-14 h-14 origin-center"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
            >
              <FootballBall className="h-14 w-14 text-[var(--color-brand)]" />
            </motion.div>


            <h1 className="mx-auto mt-3 max-w-3xl text-4xl sm:text-6xl font-black leading-[1.05] tracking-tight text-white uppercase font-heading">
              Create a league. Predict every match. Settle the argument.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm sm:text-base leading-relaxed text-slate-400 font-sans">
              Five minutes to get set up. Here&apos;s exactly what happens between signing up and seeing your name at the top of the table.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-md h-12 px-8 text-sm font-bold tracking-wide text-white bg-[var(--brand-fill)] hover:bg-[var(--color-brand-hover)] transition-colors w-full sm:w-auto"
              >
                Get started free
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-md h-12 px-8 text-sm font-bold tracking-wide text-white/80 border border-white/20 hover:text-white hover:border-white/40 transition-colors w-full sm:w-auto"
              >
                I already have an account
              </Link>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="flex flex-col gap-20 sm:gap-28">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className={`grid items-center gap-10 md:gap-16 md:grid-cols-2 ${i % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''}`}
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-heading font-black text-3xl text-[var(--color-brand)]">{step.n}</span>
                    <span className="h-px flex-1 max-w-16 bg-[var(--border-base)]" />
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--text-muted)]">
                      {step.eyebrow}
                    </span>
                  </div>
                  <h2 className="mt-4 text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] font-heading">
                    {step.title}
                  </h2>
                  <p className="mt-4 text-sm sm:text-base leading-relaxed text-[var(--text-secondary)] font-sans">
                    {step.body}
                  </p>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                  className="relative"
                >
                  <div className="rounded-2xl border border-[var(--border-base)] bg-[var(--surface-layer-1)] shadow-lg overflow-hidden">
                    <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-[var(--border-base)] bg-[var(--surface-canvas)]">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                    </div>
                    <div className={`relative w-full ${step.aspect ?? 'aspect-[16/10]'} overflow-hidden`}>
                      {/* Blurred until it lands. Available only because the
                          import carries the dimensions and a placeholder. */}
                      <Image
                        src={step.image}
                        alt={step.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        placeholder="blur"
                        className="object-cover object-top"
                        priority={i === 0}
                      />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Anywhere */}
        <section className="border-y border-[var(--border-base)] bg-[var(--surface-layer-1)]">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 grid items-center gap-10 md:gap-16 md:grid-cols-2">
            <div className="order-2 md:order-1 mx-auto w-full max-w-[280px]">
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="rounded-[2rem] border-[6px] border-slate-950 bg-slate-950 shadow-xl overflow-hidden"
              >
                <div className="relative w-full aspect-[390/844] overflow-hidden rounded-[1.4rem]">
                  <Image
                    src={homeMobileShot}
                    alt="The TopFour home screen on a phone, showing the next lock countdown and what's waiting on you"
                    fill
                    sizes="280px"
                    placeholder="blur"
                    className="object-cover object-top"
                  />
                </div>
              </motion.div>
            </div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="order-1 md:order-2"
            >
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--color-brand)]">
                Everywhere
              </span>
              <h2 className="mt-4 text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] font-heading">
                Same league, whatever screen you&apos;re on
              </h2>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-[var(--text-secondary)] font-sans">
                TopFour is built for the phone in your pocket first. Predictions save the moment you make them, deadlines count down in real time, and the table you check on your laptop is the same one waiting on your phone at kickoff.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative overflow-hidden bg-slate-950">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] bg-[size:28px_28px]" />
          <div className="relative mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-28 text-center">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase font-heading">
              Your league is one code away.
            </h2>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-400 font-sans">
              Create a league, invite the group chat, and let this week&apos;s fixtures do the arguing for you.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-md h-12 px-8 text-sm font-bold tracking-wide text-white bg-[var(--brand-fill)] hover:bg-[var(--color-brand-hover)] transition-colors w-full sm:w-auto"
              >
                Create your account
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-md h-12 px-8 text-sm font-bold tracking-wide text-white/80 border border-white/20 hover:text-white hover:border-white/40 transition-colors w-full sm:w-auto"
              >
                Sign in
              </Link>
            </div>
            <p className="mt-10 text-xs text-slate-500 font-mono">
              &copy; {new Date().getFullYear()} topfour.app • All rights reserved
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
