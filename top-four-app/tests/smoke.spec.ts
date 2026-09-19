import { test, expect, type Page } from '@playwright/test';

/**
 * One pass over every screen, asserting it drew its own content.
 *
 * The bar is deliberately not a 200. Each check below stands for a defect that
 * shipped while the build was green: markets that rendered a title and no
 * controls, counts that reported a page instead of a league, prototype names in
 * place of real ones.
 */

/*
 * Scoped to the base URL, not to any cookie of that name.
 *
 * A saved state file holds cookies for the host it signed in to. Reused against
 * a different base URL — a production session against localhost — an unscoped
 * check reports a session that will not be sent, so every signed-in spec runs
 * against the sign-in redirect instead of skipping. Some then fail; worse, the
 * ones asserting an absence pass while proving nothing.
 */
const signedIn = async (page: Page) => {
  const base = test.info().project.use.baseURL ?? 'http://localhost:5173';
  const cookies = await page.context().cookies(base);
  return cookies.some(c => c.name === 'tf.sid' || c.name === '__Host-tf.sid');
};

/**
 * Skips a spec that needs a member. Called per test rather than in a
 * `beforeEach`, which would skip the public specs in this file too.
 */
async function requireSession(page: Page) {
  test.skip(!(await signedIn(page)), 'No session — set TF_TEST_EMAIL and TF_TEST_PASSWORD.');
}

/**
 * Navigates without waiting for every image and font.
 *
 * These screens carry real club crests from a remote host; waiting for `load`
 * makes the test hostage to that host rather than to the page.
 */
async function visit(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  // Checked on every navigation: Next's dev overlay means the route failed to
  // compile, usually because the tree changed mid-run. Without this the real
  // cause hides behind whatever locator times out next.
  await expect(
    page.getByRole('heading', { name: 'Server Error' }),
    `${url} returned a Server Error — is something mid-edit?`,
  ).toHaveCount(0);
}

/**
 * `visit`, plus a short pause before the first click.
 *
 * Not standing in for a diagnosed defect — unlike everything else in this
 * file, this one is precautionary. `domcontentloaded` (see `visit`) fires
 * before hydration necessarily finishes, and this screen has a live
 * countdown ("2h 20m until lineups lock") whose server- and client-rendered
 * text can disagree, which is the kind of thing that could race a click
 * against hydration on paper. It was the wrong explanation for a real
 * failure seen while this test was being written, though — that one was the
 * test opening a fixture whose lineup was already saved from earlier in the
 * session, so Auto-fill was correctly disabled and the test kept clicking
 * it anyway. `domcontentloaded` is still right regardless (this screen
 * carries remote club crests `load` would go hostage to).
 */
async function visitAndSettle(page: Page, url: string) {
  await visit(page, url);
  await page.waitForTimeout(800);
}

/** The app's own failure screens, which must never be what a smoke test sees. */
async function expectNoProblemState(page: Page) {

  await expect(page.getByText('Something went wrong at our end')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Not found, or no longer available' })).toHaveCount(0);
}

async function firstLeagueId(page: Page): Promise<string> {
  const response = await page.request.get('/api/leagues');
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  const id = body.items?.[0]?.id;
  expect(id, 'the signed-in account needs at least one league').toBeTruthy();
  return id as string;
}

test('home shows the queue and its true size', async ({ page }) => {
  await requireSession(page);
  await visit(page, '/home');
  await expectNoProblemState(page);

  // The count is the member's whole queue: it read 20 while 476 were waiting,
  // because only the first page of the task feed was ever fetched. The wide
  // layout says it in the context bar and the narrow one on the "see all" link,
  // so this asserts the fact is on screen rather than where it sits.
  // Filtered to what is actually on screen: both layouts render both forms, and
  // the hidden one comes first in the DOM.
  const total = page
    .getByText(/\d+ waiting on you|SEE ALL \d+|Everything answered|Nothing else owed/)
    .filter({ visible: true });
  await expect(total.first()).toBeVisible();

  // A bare clock time in the queue reads as kickoff; these rows show time
  // remaining. Scoped to the queue on purpose: the hero's own countdown drops
  // to mm:ss inside the last hour, which no regex can tell from a wall clock,
  // so asserting across the whole page fails whenever a deadline gets close.
  const queue = page.locator('section').filter({ hasText: /Also waiting on you|Nothing else owed/ });
  await expect(queue.getByText(/^\d{1,2}:\d{2}$/)).toHaveCount(0);
});

test('leagues lists the member’s leagues', async ({ page }) => {
  await requireSession(page);
  await visit(page, '/leagues');
  await expectNoProblemState(page);
  await expect(page.getByRole('link').filter({ hasText: /./ }).first()).toBeVisible();
});

test('predict counts the markets a member can act on, and says which', async ({ page }) => {
  await requireSession(page);
  await visit(page, '/predict');
  await expectNoProblemState(page);

  const empty = page.getByText(/Nothing needs you|No predictions to make/);
  if (await empty.isVisible().catch(() => false)) return;

  /* The headline used to sum the whole season — thousands of markets, most of
     them months away. It counts what closes inside the named window, and counts
     the rows below it rather than their markets: "474 markets to answer" says
     the same thing as thirty rows in a way nobody can act on.

     What must never happen is the kicker naming one window and the figure
     measuring another, which is how this number stopped meaning anything the
     first time. */
  await expect(page.getByText(/OPEN (THIS WEEK|IN THE NEXT \d+ WEEKS)/)).toBeVisible();
  await expect(page.getByText('waiting on you')).toBeVisible();

  // The figure beside it is a number, and the line under it says of what.
  await expect(page.getByText(/^\d+$/).first()).toBeVisible();
  await expect(page.getByText(/\d+ leagues?/)).toBeVisible();
});

test('me renders the account', async ({ page }) => {
  await requireSession(page);
  await visit(page, '/me');
  await expectNoProblemState(page);
  // It once greeted every member as "Your Name".
  await expect(page.getByText('Your Name')).toHaveCount(0);

  // Settings is the only route to the legal pages from inside the app: every
  // other link to them sits on a screen you only see before signing in.
  await expect(page.getByRole('link', { name: 'Privacy policy' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Terms of service' })).toBeVisible();
});

test('league overview shows a real fixture, not the prototype’s', async ({ page }) => {
  await requireSession(page);
  await visit(page, `/leagues/${await firstLeagueId(page)}`);
  await expectNoProblemState(page);
  await expect(page.getByText('YOU ARE', { exact: false })).toBeVisible();
  // Thirteen prototype strings were hardcoded into the mobile twin.
  await expect(page.getByText(/Tobi|LIV 2 — 1 TOT/)).toHaveCount(0);
});

test('league fixtures shows a week, and its count matches the rows', async ({ page }) => {
  await requireSession(page);
  const id = await firstLeagueId(page);
  await visit(page, `/leagues/${id}/fixtures`);
  await expectNoProblemState(page);

  const upcoming = page.getByRole('link', { name: /Upcoming/ });
  const results = page.getByRole('link', { name: /Results/ });
  await expect(upcoming).toBeVisible();
  await expect(results).toBeVisible();

  // The screen used to list the whole season — 494 fixtures, forty at a time —
  // under a tab counting the season's remainder. It now shows a week, and the
  // number on the tab has to be that week rather than the league: a count above
  // rows it does not describe is how the old screen stopped meaning anything.
  await expect(page.getByText(/Kicking off in the next/)).toBeVisible();

  const shown = await page.locator('a[href*="/predict/fixture/"]').count();
  const label = await upcoming.textContent();
  const counted = Number.parseInt((label ?? '').replace(/\D+/g, ''), 10);
  expect(Number.isFinite(counted)).toBe(true);
  // Equal while the week fits in one page, which is the ordinary case; never
  // fewer rows than claimed, which would mean the tab is counting the season.
  expect(shown).toBeLessThanOrEqual(counted);
  expect(counted).toBeLessThanOrEqual(shown + 40);

  // Both segments reachable: Results had no path to it at all for a while.
  await visit(page, `/leagues/${id}/fixtures?view=results`);
  await expectNoProblemState(page);
});

test('league table, rules, questions and more all render', async ({ page }) => {
  await requireSession(page);
  const id = await firstLeagueId(page);
  for (const path of ['table', 'rules', 'questions', 'more']) {
    await visit(page, `/leagues/${id}/${path}`);
    await expectNoProblemState(page);
    await expect(page.getByRole('link', { name: 'Overview' })).toBeVisible();
  }
});

test('every open market on a fixture is answerable', async ({ page }) => {
  await requireSession(page);
  const id = await firstLeagueId(page);
  const availability = await page.request.get(`/api/leagues/${id}/fixtures/availability?limit=100`);
  const open = (await availability.json()).data?.find((f: { hasOpenMarkets: boolean }) => f.hasOpenMarkets);
  test.skip(!open, 'no fixture with open markets in this league');

  await visit(page, `/predict/fixture/${open.leagueFixtureId}?leagueId=${id}`);
  await expectNoProblemState(page);

  // The defect this test exists for: three markets drew a title, a price and
  // the word OPEN, with nothing to press. Each named market must own a control.
  for (const market of ['Match result', 'Both teams to score', 'Total goals']) {
    const heading = page.getByText(market, { exact: true });
    if (await heading.count() === 0) continue;
    const row = heading.first().locator('xpath=ancestor::div[3]');
    await expect(row.getByRole('button').first(), `${market} has no control`).toBeVisible();
  }

  // The steppers are real buttons, not clickable divs.
  await expect(page.getByRole('button', { name: /One more goal for/ }).first()).toBeVisible();
});

test('the lineup dialog keeps its save control on screen', async ({ page }) => {
  await requireSession(page);
  const id = await firstLeagueId(page);
  const availability = await page.request.get(`/api/leagues/${id}/fixtures/availability?limit=100`);
  const withLineups = (await availability.json()).data?.find(
    (f: { markets?: { marketType: string; state: string }[] }) =>
      f.markets?.some(m => m.marketType === 'lineup' && m.state === 'open'),
  );
  test.skip(!withLineups, 'no fixture with an open lineup in this league');

  await visitAndSettle(page, `/predict/fixture/${withLineups.leagueFixtureId}?leagueId=${id}`);
  await expectNoProblemState(page);
  await page.locator('button', { hasText: /Starting XI/i }).first().click();

  /* The pitch was `aspect-[3/4]` of the dialog's full width — about 670px tall
     in a 500px dialog — inside a single scrolling body, so Save sat below the
     fold and the one control the dialog exists to reach was lost. It is pinned
     outside the scroll area now, and this asserts it stays there. */
  const save = page.getByRole('button', { name: /Save this XI|Finish the formation first|Still \d+ to fill/ }).first();
  await expect(save).toBeVisible();

  const box = await save.boundingBox();
  const viewport = page.viewportSize();
  expect(box, 'the save control has no box').not.toBeNull();
  expect(
    Math.round(box!.y + box!.height),
    'the save control ends below the fold',
  ).toBeLessThanOrEqual(viewport!.height + 1);
});

test('the formation steppers reach a split none of the four presets can', async ({ page }) => {
  await requireSession(page);
  const id = await firstLeagueId(page);
  const availability = await page.request.get(`/api/leagues/${id}/fixtures/availability?limit=100`);
  const withLineups = (await availability.json()).data?.find(
    (f: { markets?: { marketType: string; state: string }[] }) =>
      f.markets?.some(m => m.marketType === 'lineup' && m.state === 'open'),
  );
  test.skip(!withLineups, 'no fixture with an open lineup in this league');

  await visitAndSettle(page, `/predict/fixture/${withLineups.leagueFixtureId}?leagueId=${id}`);
  await expectNoProblemState(page);
  await page.locator('button', { hasText: /Starting XI/i }).first().click();

  // Starts at 4-3-3. Free a midfield place, then add it to defence: 5-2-3 is
  // not 4-3-3, 4-4-2, 3-5-2 or 5-3-2, so none of the four quick-picks should
  // read as selected once this lands.
  await page.getByRole('button', { name: /Fewer midfielders/i }).click();
  await page.getByRole('button', { name: /More defenders/i }).click();

  for (const preset of ['4-3-3', '4-4-2', '3-5-2', '5-3-2']) {
    await expect(
      page.getByRole('button', { name: preset, exact: true }),
      `${preset} should not read as selected once the shape is 5-2-3`,
    ).toHaveAttribute('aria-pressed', 'false');
  }
});

test('dragging a filled place onto another swaps who is there', async ({ page }) => {
  await requireSession(page);
  const id = await firstLeagueId(page);
  const availability = await page.request.get(`/api/leagues/${id}/fixtures/availability?limit=100`);
  const withLineups = (await availability.json()).data?.find(
    (f: { markets?: { marketType: string; state: string }[] }) =>
      f.markets?.some(m => m.marketType === 'lineup' && m.state === 'open'),
  );
  test.skip(!withLineups, 'no fixture with an open lineup in this league');

  await visitAndSettle(page, `/predict/fixture/${withLineups.leagueFixtureId}?leagueId=${id}`);
  await expectNoProblemState(page);
  await page.locator('button', { hasText: /Starting XI/i }).first().click();
  // Disabled once the XI is already complete — an account with a lineup
  // already saved for this fixture opens straight on eleven of eleven, and
  // Auto-fill has nothing left to do.
  const autoFill = page.getByRole('button', { name: /AUTO-FILL/i });
  if (await autoFill.isEnabled()) await autoFill.click();

  const fwdSlot = page.locator('button[data-slot^="FWD"]').first();
  const defSlot = page.locator('button[data-slot^="DEF"]').first();
  await expect(fwdSlot).toBeVisible();
  await expect(defSlot).toBeVisible();

  const fwdBefore = await fwdSlot.getAttribute('aria-label');
  const defBefore = await defSlot.getAttribute('aria-label');

  /* boundingBox() reports layout geometry even for a place scrolled out of
     the pitch's own overflow-y-auto region — real, but not what is actually
     on screen, so a coordinate drag onto it can land on whatever the browser
     paints at that pixel instead (the Save button sitting right below the
     pitch, in one run of this). Scrolling FWD into view, reading its box and
     pressing there — then only scrolling to DEF, and reading *its* box —
     after: scrolling either after both boxes are read would move the other
     one, since both cannot fit on screen together in a short window. This
     mirrors a real drag anyway: scroll to where you are, press, scroll to
     where you are going, release. */
  await fwdSlot.scrollIntoViewIfNeeded();
  const fwdBox = (await fwdSlot.boundingBox())!;
  await page.mouse.move(fwdBox.x + fwdBox.width / 2, fwdBox.y + fwdBox.height / 2);
  await page.mouse.down();

  await defSlot.scrollIntoViewIfNeeded();
  const defBox = (await defSlot.boundingBox())!;
  await page.mouse.move(defBox.x + defBox.width / 2, defBox.y + defBox.height / 2, { steps: 12 });
  await page.mouse.up();

  await expect(fwdSlot).not.toHaveAttribute('aria-label', fwdBefore!);
  await expect(defSlot).not.toHaveAttribute('aria-label', defBefore!);
});

test('dropping a drag on bare pitch is a no-op, not a tap that reopens the squad list', async ({ page }) => {
  await requireSession(page);
  const id = await firstLeagueId(page);
  const availability = await page.request.get(`/api/leagues/${id}/fixtures/availability?limit=100`);
  const withLineups = (await availability.json()).data?.find(
    (f: { markets?: { marketType: string; state: string }[] }) =>
      f.markets?.some(m => m.marketType === 'lineup' && m.state === 'open'),
  );
  test.skip(!withLineups, 'no fixture with an open lineup in this league');

  await visitAndSettle(page, `/predict/fixture/${withLineups.leagueFixtureId}?leagueId=${id}`);
  await expectNoProblemState(page);
  await page.locator('button', { hasText: /Starting XI/i }).first().click();
  // Disabled once the XI is already complete — see the equivalent guard
  // above in the drag-swap test.
  const autoFill = page.getByRole('button', { name: /AUTO-FILL/i });
  if (await autoFill.isEnabled()) await autoFill.click();

  const fwdSlot = page.locator('button[data-slot^="FWD"]').first();
  await expect(fwdSlot).toBeVisible();
  const fwdBefore = await fwdSlot.getAttribute('aria-label');
  await fwdSlot.scrollIntoViewIfNeeded();
  const fwdBox = (await fwdSlot.boundingBox())!;
  // The dialog's own title bar — always on screen (it is above the pitch's
  // scroll region, not inside it) and definitely not a `[data-slot]` place,
  // which a coordinate computed from the pitch's own full, possibly
  // off-screen layout geometry is not guaranteed to be.
  const title = page.getByRole('heading', { name: /Starting XI$/ });
  const titleBox = (await title.boundingBox())!;

  await page.mouse.move(fwdBox.x + fwdBox.width / 2, fwdBox.y + fwdBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(titleBox.x + titleBox.width / 2, titleBox.y + titleBox.height / 2, { steps: 12 });
  await page.mouse.up();

  // Nothing moved...
  await expect(fwdSlot).toHaveAttribute('aria-label', fwdBefore!);
  // ...and pointer capture routing the click back to the origin place did
  // not fall through to opening the squad list for it.
  await expect(page.getByText('Whole squad')).toHaveCount(0);
});

test('a league you cannot see and one that does not exist look the same', async ({ page }) => {
  // Both need a session: middleware sends a signed-out visitor to sign-in
  // before either route runs.
  await requireSession(page);
  const notFound = page.getByRole('heading', { name: 'Not found, or no longer available' });

  // Rejected on shape, before any read — a mistyped link is not a failure at our end.
  await visit(page, '/leagues/not-a-real-league');
  await expect(notFound).toBeVisible();

  // Rejected by the API — and it must be indistinguishable from the above.
  await visit(page, '/leagues/00000000-0000-4000-8000-000000000000');
  await expect(notFound).toBeVisible();
});

/**
 * The shell's three guarantees, each standing for a defect that shipped:
 * a tab bar 209px below the fold, no way back on desktop but the browser's own
 * button, and a document hardcoded to dark.
 */

test('the root tab bar sits inside the viewport on every root screen', async ({ page }, testInfo) => {
  await requireSession(page);
  test.skip(testInfo.project.name !== 'mobile', 'The tab bar is narrow-screen only.');

  for (const path of ['/home', '/predict', '/leagues', '/me']) {
    await visit(page, path);
    const bar = page.locator('nav.grid-cols-4');
    await expect(bar, `${path} has no tab bar`).toBeVisible();
    const box = await bar.boundingBox();
    const viewport = page.viewportSize();
    expect(box, `${path} tab bar has no box`).not.toBeNull();
    expect(
      Math.round(box!.y + box!.height),
      `${path} tab bar ends below the fold`,
    ).toBeLessThanOrEqual(viewport!.height + 1);
  }
});

test('every screen below the root offers a way back on wide screens', async ({ page }, testInfo) => {
  await requireSession(page);
  test.skip(testInfo.project.name === 'mobile', 'Narrow screens use their own chevron.');

  for (const path of ['/alerts', '/me/name', '/me/email', '/me/password', '/leagues/setup']) {
    await visit(page, path);
    const crumbs = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(crumbs, `${path} has no breadcrumb`).toBeVisible();
    // A trail of one is not a way back.
    await expect(crumbs.getByRole('link').first(), `${path} breadcrumb has no link`).toBeVisible();
  }

  // League screens get theirs from the chrome instead: level two names the
  // league you are in, and level one links out to the list of them. That is the
  // design's own answer, so a breadcrumb on top of it would be a third bar.
  const leagueId = await firstLeagueId(page);
  for (const path of ['', '/fixtures', '/table', '/questions', '/more']) {
    await visit(page, `/leagues/${leagueId}${path}`);
    await expect(
      page.getByRole('link', { name: 'Leagues', exact: true }),
      `/leagues/${leagueId}${path} has no way back to the league list`,
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Questions', exact: true }),
      `/leagues/${leagueId}${path} is missing the Questions tab`,
    ).toBeVisible();
  }
});

test('the theme follows the stored choice, and light mode is reachable', async ({ page }) => {
  await requireSession(page);
  // Not `visit()`: that waits only for domcontentloaded, which fires before
  // React has hydrated and attached the radios' click handlers. A click that
  // lands in that window is not queued or retried — it is simply lost, no
  // error either. /me carries no remote images, so there is nothing here for
  // `load` to go hostage to, and it fires late enough that hydration is done.
  await page.goto('/me', { waitUntil: 'load' });

  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', /^(light|dark)$/);

  await page.getByRole('radio', { name: 'Light' }).click();
  await expect(html).toHaveAttribute('data-theme', 'light');

  await page.getByRole('radio', { name: 'Dark' }).click();
  await expect(html).toHaveAttribute('data-theme', 'dark');

  // The choice must survive a reload, which is the whole point of storing it.
  await visit(page, '/home');
  await expect(html).toHaveAttribute('data-theme', 'dark');
});

/**
 * Public, so no `requireSession` — this page is reachable from the sign-in
 * screen and must render for someone with no account at all.
 *
 * `next/image` draws its frame whether or not the file behind it exists, so a
 * missing or renamed screenshot is invisible to a locator. `naturalWidth` is
 * the only thing that separates a loaded shot from an empty box.
 */
test('how to play renders every step, with its screenshots actually loaded', async ({ page }) => {
  await visit(page, '/how-to-play');
  await expectNoProblemState(page);

  for (const title of [
    'Create a league, or join one with a code',
    'Name a lineup in one tap with Auto-fill',
    'Answer the questions only your league is asking',
    'Watch the table settle every argument',
  ]) {
    await expect(page.getByRole('heading', { name: title }), `"${title}" is missing`).toBeVisible();
  }

  const shots = page.locator('main img');
  await expect(shots, 'five step screenshots plus the phone mock-up').toHaveCount(6);

  for (let i = 0; i < 6; i++) {
    const shot = shots.nth(i);
    // Every shot but the first is lazy, so it has to be on screen to load.
    await shot.scrollIntoViewIfNeeded();
    await expect(shot).toHaveJSProperty('complete', true);
    const width = await shot.evaluate((el: HTMLImageElement) => el.naturalWidth);
    expect(width, `${await shot.getAttribute('alt')} — image did not load`).toBeGreaterThan(0);
  }

  // The app's own nav hides itself on this page, so the header is the only way
  // onward: "Get started" signed out, "Back to TopFour" for a member who
  // followed the link and would otherwise be stranded on a marketing page.
  await expect(
    page.getByRole('link', { name: /Back to TopFour|Get started/ }).first(),
    'no way onward from how to play',
  ).toBeVisible();
});

/**
 * Public, and deliberately so: Google's OAuth consent screen fetches both pages
 * signed out. A middleware change that sends them to sign-in would break the
 * Google client without touching anything that looks related.
 */
test('the legal pages are reachable signed out, and say the things they must', async ({ page }) => {
  for (const [path, heading] of [['/privacy', 'Privacy policy'], ['/terms', 'Terms of service']] as const) {
    await visit(page, path);
    await expectNoProblemState(page);
    await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible();
    // Not redirected to sign-in — the actual failure mode this guards.
    expect(new URL(page.url()).pathname, `${path} redirected away`).toBe(path);
  }

  // Google requires the disclosure to match what the app really does with Google
  // data. These two claims are the ones review looks for.
  await visit(page, '/privacy');
  await expect(page.getByRole('heading', { name: 'If you sign in with Google' })).toBeVisible();
  await expect(page.getByText('We do not use or store your Google profile picture.')).toBeVisible();

  // The no-gambling section is what keeps a free prediction game out of the
  // real-money category. Losing it is a compliance regression, not a copy edit.
  await visit(page, '/terms');
  await expect(page.getByRole('heading', { name: /No gambling/ })).toBeVisible();
  await expect(page.getByText(/no entry fee/i).first()).toBeVisible();
});

/**
 * Public, and deliberately never submits: the point is the gate, and a spec that
 * registered an account would leave one behind on every run.
 *
 * The terms set 18 as a condition of use, and this checkbox is the only place
 * anyone says so. Delete it, or drop `!accepted` from the button's disabled
 * expression, and the claim in the terms becomes decorative with nothing failing.
 */
test('sign-up will not proceed until age and terms are confirmed', async ({ page }) => {
  await visit(page, '/sign-up');
  await expectNoProblemState(page);

  const confirm = page.getByRole('checkbox');
  const create = page.getByRole('button', { name: 'Create account' });

  // Unticked to start. A pre-ticked box would be no evidence anyone read it.
  await expect(confirm, 'the age and terms checkbox is missing').toBeVisible();
  await expect(confirm).not.toBeChecked();
  await expect(create, 'Create account is reachable without confirming age').toBeDisabled();

  await confirm.check();
  await expect(create, 'confirming age did not release the button').toBeEnabled();

  // And back, so the gate is a real binding rather than a one-way latch.
  await confirm.uncheck();
  await expect(create).toBeDisabled();

  // Opening the terms must not discard a part-filled form, so both links leave
  // this tab alone.
  const label = page.locator('label').filter({ hasText: 'I am 18 or over' });
  for (const name of ['terms of service', 'privacy policy']) {
    await expect(label.getByRole('link', { name })).toHaveAttribute('target', '_blank');
  }
});

/**
 * Google sign-in creates an account when none exists, so the button is a sign-up
 * path too. It carries a statement rather than a tick, because a returning
 * member should not confirm their age on every sign-in.
 *
 * Only the statement is asserted. The button itself is Google's, drawn in
 * production inside a cross-origin iframe whose contents no test of ours can
 * read and no stylesheet of ours can reach.
 *
 * Skips where no Google client is configured, since nothing is offered then.
 */
test('where Google sign-up is offered, it states the age and terms', async ({ page }) => {
  await visit(page, '/sign-up');

  const offered = page.locator('span').filter({ hasText: /^or$/ });
  test.skip(await offered.count() === 0, 'No Google client configured here.');

  await expect(
    page.getByText(/By continuing with Google you confirm you are 18 or over/),
    'Google sign-up is offered without stating the age requirement',
  ).toBeVisible();
});
