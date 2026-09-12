import { test as setup, expect } from '@playwright/test';
import fs from 'node:fs';

/**
 * Signs in once and saves the session for every other spec.
 *
 * Credentials are read from the environment — never from the repo. Set
 * `TF_TEST_EMAIL` and `TF_TEST_PASSWORD` to run the signed-in specs.
 */
const SESSION = '.auth/session.json';

setup('sign in', async ({ page }) => {
  const email = process.env.TF_TEST_EMAIL;
  const password = process.env.TF_TEST_PASSWORD;

  if (!email || !password) {
    // Never clobber a session already on disk: a run without credentials would
    // otherwise silently sign out a suite that was working a moment ago.
    if (!fs.existsSync(SESSION)) {
      // An empty state is still a valid state file, so the dependent projects
      // can run and skip cleanly rather than erroring on a missing one.
      fs.mkdirSync('.auth', { recursive: true });
      fs.writeFileSync(SESSION, JSON.stringify({ cookies: [], origins: [] }));
    }
    setup.skip(true, 'Set TF_TEST_EMAIL and TF_TEST_PASSWORD to run the signed-in smoke tests.');
    return;
  }

  await page.goto('/');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).first().fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();

  // Surface the app's own rejection rather than timing out on the URL, which
  // says nothing about why. Wrong credentials are the common case by far.
  const rejected = page.getByText(/incorrect|not allowed|Too many attempts/i);
  await expect
    .poll(async () => (await rejected.count()) > 0 ? await rejected.first().innerText() : page.url(),
      { timeout: 15_000, message: 'sign-in did not complete' })
    .toMatch(/\/(home|leagues|predict)/);

  fs.mkdirSync('.auth', { recursive: true });
  await page.context().storageState({ path: SESSION });
});
