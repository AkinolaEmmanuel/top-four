'use client';

import Link from 'next/link';
import { LegalShell, Section, P, Bullets, Callout } from './LegalShell';

/*
 * The "no gambling" section is load-bearing: it is what distinguishes a free
 * prediction game from a betting product to Google, an app store or a regulator.
 * Keep the product honest to it — no entry fee, no stake, no prize of value, and
 * no "bet", "stake", "odds" or "winnings" in the interface.
 */

export function TermsScreen() {
  return (
    <LegalShell
      title="Terms of service"
      updated="18 September 2026"
      intro={
        <>
          <P>
            These are the rules for using TopFour. By creating an account or using the service you
            accept them. If you do not, please do not use TopFour.
          </P>
          <P>
            We have kept them as short and readable as we can. Nothing here is designed to catch you
            out.
          </P>
        </>
      }
    >
      <Section id="who" title="Who you are agreeing with">
        <P>
          TopFour is run by <strong>Kolade Amire</strong> and <strong>Emmanuel Akinola</strong>, two
          individuals based in Nigeria, operating jointly. There is no company — your agreement is
          with us personally. Contact:{' '}
          <a href="mailto:support@topfour.app" className="text-[var(--text-link)] font-semibold">support@topfour.app</a>.
        </P>
      </Section>

      <Section id="eligibility" title="Who can use TopFour">
        <P>
          You must be <strong>18 or over</strong> and able to enter into a contract where you live.
        </P>
        <P>
          We do not collect dates of birth and we do not verify age. The rule is a condition of using
          TopFour, not a check we carry out. If we find out an account belongs to someone under 18 we
          will close it.
        </P>
      </Section>

      <Section id="account" title="Your account">
        <Bullets items={[
          <>Give accurate details, and keep your email address current — it is how we reach you about your account.</>,
          <>Keep your password to yourself. You are responsible for what happens under your account.</>,
          <>Tell us at once if you think someone else has got into it.</>,
          <>One account per person. Extra accounts used to gain an advantage in a league are not allowed.</>,
          <>Choose a display name that is not offensive, misleading, or impersonating someone else. We can ask you to change it, or change it ourselves.</>,
        ]} />
      </Section>

      <Section id="what-it-is" title="What TopFour is">
        <P>
          TopFour is a free football prediction game. You create or join a private league with people
          you know, predict match results, exact scores, lineups and other outcomes, answer questions
          your league invents, and collect points. The points produce a table. The table settles the
          argument.
        </P>
        <P>That is the whole product. It is for entertainment.</P>
      </Section>

      <Section id="no-gambling" title="No gambling, stakes, entry fees or prizes">
        <Callout>
          TopFour is not gambling, and we intend to keep it that way. Nothing you do on TopFour
          involves risking anything of value to win anything of value.
        </Callout>
        <Bullets items={[
          <>We charge <strong>no entry fee</strong> to create or join a league, or to predict.</>,
          <>We accept and hold <strong>no stake, wager, deposit or betting balance</strong>. There is no wallet.</>,
          <>We award <strong>no prizes</strong> — no cash, no cryptocurrency, no goods, no gift cards, nothing of real-world monetary value.</>,
          <>Points have <strong>no monetary value</strong>. They cannot be bought, sold, transferred, exchanged, withdrawn or redeemed for anything.</>,
          <>You may not use TopFour to organise or settle bets between yourselves. Leagues are for bragging rights.</>,
          <>TopFour is not a bookmaker, a betting exchange, a lottery, a prize competition or a prediction market, and does not act as an intermediary for any of them.</>,
        ]} />
      </Section>

      <Section id="leagues" title="Leagues, scoring and football data">
        <P>
          Each league sets its own rules when it is created — which competitions count, what each
          market is worth, and how ties are broken. Those rules freeze when the league is published,
          so everyone plays the same game.
        </P>
        <Bullets items={[
          <>Predictions lock at the deadline shown. A prediction not saved before the deadline does not count.</>,
          <>Match results come from a third-party football data provider. That data is usually right and occasionally late or wrong.</>,
          <>Where a result is corrected, a match is postponed or abandoned, or a market cannot be settled fairly, we may re-settle or void that market and recalculate points. We will do this only where it is needed to keep the league accurate, not at whim.</>,
          <>Standings are calculated automatically. Where scoring is disputed, the rules published in your league govern, and our determination of how they apply is final for the purposes of the game.</>,
        ]} />
      </Section>

      <Section id="content" title="Questions and content you create">
        <P>
          Leagues can write their own questions, and you choose your display name and league names.
          You keep ownership of what you write. You give us only the permission we need to host,
          display, and moderate it so TopFour works.
        </P>
        <P>Do not post anything that is:</P>
        <Bullets items={[
          <>unlawful, hateful, harassing, threatening or abusive;</>,
          <>someone else&apos;s personal information, or sensitive information about anybody;</>,
          <>an infringement of someone else&apos;s rights;</>,
          <>deliberately misleading, or written to make a question impossible to settle fairly.</>,
        ]} />
        <P>We can remove content that breaks these rules, and tell the member why.</P>
      </Section>

      <Section id="fair-play" title="Fair play">
        <Bullets items={[
          <>Do not use bots, scripts or automation to enter predictions or read TopFour.</>,
          <>Do not use more than one account to gain an advantage, or share an account to do so.</>,
          <>Do not attempt to interfere with scoring, settlement, another member&apos;s account, or the service itself.</>,
          <>Do not scrape TopFour or try to get at data you are not a member of a league to see.</>,
          <>Do not probe, attack or overload our systems. If you find a security problem, tell us — we would much rather hear from you.</>,
        ]} />
      </Section>

      <Section id="third-party" title="Things we depend on">
        <P>
          TopFour runs on services we do not control — hosting, email delivery, Google sign-in and a
          football data feed. When one of them has a problem, TopFour may too. We are responsible for
          our own obligations to you; we cannot guarantee someone else&apos;s service.
        </P>
      </Section>

      <Section id="privacy" title="Privacy">
        <P>
          Our <Link href="/privacy" className="text-[var(--text-link)] font-semibold">privacy policy</Link> explains what we
          collect and why. It is information, not a consent form — accepting these terms is not you
          consenting to data processing.
        </P>
      </Section>

      <Section id="ip" title="Who owns what">
        <P>
          We own the TopFour software, design and name. You own what you write. Club names, crests,
          competition names and player data belong to their respective owners, and appear here to
          describe real football — we claim no rights in them and are not affiliated with, endorsed
          by, or connected to any club or competition.
        </P>
      </Section>

      <Section id="availability" title="Availability and changes">
        <P>
          We do not promise TopFour will always be available or uninterrupted. We will need to take it
          down for maintenance sometimes, and things will occasionally break.
        </P>
        <P>
          We may add, change or remove features. Where a change materially harms how existing leagues
          work, we will give notice rather than spring it on you mid-season.
        </P>
      </Section>

      <Section id="termination" title="Closing your account, and us closing it">
        <P>
          You can stop using TopFour whenever you like, and ask us to delete your account at{' '}
          <a href="mailto:support@topfour.app" className="text-[var(--text-link)] font-semibold">support@topfour.app</a>. What
          happens to your data then is set out in the{' '}
          <Link href="/privacy#retention" className="text-[var(--text-link)] font-semibold">privacy policy</Link> — in short,
          your personal details go and the league&apos;s historical table stays, with your name replaced.
        </P>
        <P>
          We may suspend or close an account that breaks these terms, cheats, puts the service or other
          members at risk, or is being used unlawfully. Where it is reasonable to do so, we will tell
          you why first and give you a chance to respond.
        </P>
      </Section>

      <Section id="paid" title="If we add paid features later">
        <P>TopFour is free today. There is nothing to buy, and no part of it is behind a payment.</P>
        <P>
          We may add optional paid features in the future. If we do:
        </P>
        <Bullets items={[
          <>you will never be charged without first seeing the price, the billing period, any taxes, and how to cancel — and agreeing to it;</>,
          <>free leagues will stay free, and we will not put an existing league behind a payment;</>,
          <>any payment will be for functionality. It will never be an entry fee, a stake, a contribution to a prize, or a purchase of points that can be redeemed for anything.</>,
        ]} />
        <P>
          Introducing anything with a real prize or a stake would be a different product from the one
          these terms describe, and would need new terms before it launched.
        </P>
      </Section>

      <Section id="disclaimers" title="What we do not promise">
        <P>
          TopFour is provided as it is. We do not warrant that football data will be accurate or
          timely, that the service will be error-free, or that it will always be available.
        </P>
        <P>
          Nothing on TopFour is betting advice, financial advice, or a prediction you should rely on
          for anything beyond the game.
        </P>
        <P>
          None of this affects rights you have under the law that cannot be excluded — and if you are
          a consumer in the UK or EU, you have several. We are not trying to sign those away.
        </P>
      </Section>

      <Section id="liability" title="Liability">
        <P>
          We are responsible to you for loss we cause by breaking this agreement or by failing to use
          reasonable care and skill. We are not responsible for loss that was not foreseeable, or for
          loss caused by a third-party service outside our control.
        </P>
        <P>
          We do not limit our liability for death or personal injury caused by our negligence, for
          fraud, or for anything else the law does not allow us to limit. Where the law permits a
          limit, our total liability to you is limited to a reasonable amount — and because TopFour is
          free, we will not attempt to argue that this is therefore nothing.
        </P>
      </Section>

      <Section id="law" title="Governing law and disputes">
        <P>
          These terms are governed by the laws of the Federal Republic of Nigeria, and the Nigerian
          courts have jurisdiction.
        </P>
        <P>
          If you are a consumer in the UK or the EU, this does not deprive you of the protection of
          the mandatory rules of your own country, or of your right to bring proceedings in your local
          courts.
        </P>
        <P>
          Before anything formal, please email us. Most things are a misunderstanding and we would
          rather fix it.
        </P>
      </Section>

      <Section id="changes" title="Changes to these terms">
        <P>
          We may update these terms. The date at the top tells you when they last changed. Changes
          apply from the date we publish them, not retrospectively, and we will make material changes
          visible in the app.
        </P>
        <P>
          If a part of these terms turns out to be unenforceable, the rest still stands. If we do not
          enforce something straight away, we have not given up the right to.
        </P>
      </Section>

      <Section id="contact" title="Contact">
        <P>
          <a href="mailto:support@topfour.app" className="text-[var(--text-link)] font-semibold">support@topfour.app</a> — for
          anything at all, including the things in these terms.
        </P>
      </Section>
    </LegalShell>
  );
}
