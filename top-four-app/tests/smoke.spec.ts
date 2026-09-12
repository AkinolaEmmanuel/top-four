import { test, expect, type Page } from '@playwright/test';

/**
 * One pass over every screen, asserting it drew its own content.
 *
 * The bar is deliberately not a 200. Each check below stands for a defect that
 * shipped while the build was green: markets that rendered a title and no
 * controls, counts that reported a page instead of a league, prototype names in
 * place of real ones.
 */

const signedIn = (page: Page) => page.context().cookies().then(
  cookies => cookies.some(c => c.name === 'tf.sid' || c.name === '__Host-tf.sid'),
);

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

test('predict counts open markets across every league', async ({ page }) => {
  await requireSession(page);
  await visit(page, '/predict');
  await expectNoProblemState(page);
  await expect(page.getByText(/markets still unanswered|Nothing needs you|No predictions to make/)).toBeVisible();
});

test('me renders the account', async ({ page }) => {
  await requireSession(page);
  await visit(page, '/me');
  await expectNoProblemState(page);
  // It once greeted every member as "Your Name".
  await expect(page.getByText('Your Name')).toHaveCount(0);
});

test('league overview shows a real fixture, not the prototype’s', async ({ page }) => {
  await requireSession(page);
  await visit(page, `/leagues/${await firstLeagueId(page)}`);
  await expectNoProblemState(page);
  await expect(page.getByText('YOU ARE', { exact: false })).toBeVisible();
  // Thirteen prototype strings were hardcoded into the mobile twin.
  await expect(page.getByText(/Tobi|LIV 2 — 1 TOT/)).toHaveCount(0);
});

test('league fixtures counts the whole league, both segments', async ({ page }) => {
  await requireSession(page);
  const id = await firstLeagueId(page);
  await visit(page, `/leagues/${id}/fixtures`);
  await expectNoProblemState(page);

  const upcoming = page.getByRole('link', { name: /Upcoming/ });
  const results = page.getByRole('link', { name: /Results/ });
  await expect(upcoming).toBeVisible();
  await expect(results).toBeVisible();

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
  await visit(page, '/me');

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
