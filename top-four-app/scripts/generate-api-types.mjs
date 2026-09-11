/**
 * Regenerates `lib/api/generated/schema.d.ts` from the API's own OpenAPI
 * document, so the client's types are the server's types rather than a
 * hand-written guess at them.
 *
 * Run against a local API:  npm run api:types
 * Point elsewhere with:     API_SPEC_URL=https://… npm run api:types
 *
 * UPSTREAM_PATCHES is empty, and should stay that way. It is the escape hatch
 * for a published document that cannot be consumed as-is: each entry names the
 * defect and the backend fix that retires it, and the script FAILS once a patch
 * is no longer needed, so a fixed backend forces the patch out rather than
 * letting it quietly outlive its purpose. It has already done that once — the
 * unresolvable `SelectablePlayerDto` ref and the unmapped prediction-task
 * discriminator were both fixed upstream, and this list emptied itself.
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname } from 'node:path';

const SPEC_URL = process.env.API_SPEC_URL ?? 'http://localhost:3000/v1/docs-yaml';
const OUT = 'lib/api/generated/schema.d.ts';
const TMP = 'node_modules/.cache/topfour-openapi.yaml';

const UPSTREAM_PATCHES = [];

const response = await fetch(SPEC_URL);
if (!response.ok) {
  throw new Error(`Could not read the OpenAPI document at ${SPEC_URL} (HTTP ${response.status}). Is the API running?`);
}

let spec = await response.text();
const stale = UPSTREAM_PATCHES.filter(patch => !patch.appliesWhen(spec));

if (stale.length > 0) {
  throw new Error(
    `The API no longer has these defects, so their patches are dead code:\n` +
      stale.map(patch => `  - ${patch.id}`).join('\n') +
      `\nRemove them from scripts/generate-api-types.mjs and run this again.`,
  );
}

for (const patch of UPSTREAM_PATCHES) {
  spec = patch.apply(spec);
  console.log(`  patched around upstream defect: ${patch.id}`);
}

mkdirSync(dirname(TMP), { recursive: true });
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(TMP, spec);

try {
  execFileSync('npx', ['openapi-typescript', TMP, '-o', OUT], { stdio: 'inherit' });
} finally {
  rmSync(TMP, { force: true });
}
