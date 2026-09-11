/**
 * Regenerates `lib/api/generated/schema.d.ts` from the API's own OpenAPI
 * document, so the client's types are the server's types rather than a
 * hand-written guess at them.
 *
 * Run against a local API:  npm run api:types
 * Point elsewhere with:     API_SPEC_URL=https://… npm run api:types
 *
 * UPSTREAM_PATCHES exists only because the published document currently fails
 * to resolve. Each entry names the defect and the fix that retires it, and the
 * script FAILS if a patch is no longer needed — so a fixed backend forces the
 * patch to be deleted instead of quietly outliving its purpose.
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname } from 'node:path';

const SPEC_URL = process.env.API_SPEC_URL ?? 'http://localhost:3000/v1/docs-yaml';
const OUT = 'lib/api/generated/schema.d.ts';
const TMP = 'node_modules/.cache/topfour-openapi.yaml';

const UPSTREAM_PATCHES = [
  {
    // `SelectablePlayersResponseDto` hand-writes `$ref: SelectablePlayerDto`,
    // but that class is never passed to a decorator as `type:`, so Nest's
    // Swagger plugin never registers it and the document cannot be resolved.
    // Backend fix: `@ApiExtraModels(SelectablePlayerDto)` on the controller.
    id: 'missing-SelectablePlayerDto',
    appliesWhen: spec => !/^ {4}SelectablePlayerDto:$/m.test(spec),
    apply: spec =>
      spec.replace(
        '    SelectablePlayersResponseDto:',
        `    SelectablePlayerDto:
      type: object
      properties:
        side: { type: string, enum: [home, away] }
        teamId: { type: string, format: uuid }
        playerId: { type: string, format: uuid }
        displayName: { type: string }
        position: { type: string, nullable: true }
        shirtNumber: { type: number, nullable: true }
      required: [side, teamId, playerId, displayName, position, shirtNumber]
    SelectablePlayersResponseDto:`,
      ),
  },
  {
    // The prediction-task union declares `discriminator: { propertyName: kind }`
    // with no `mapping`. OpenAPI then implies schema *names* as the values, so a
    // generated client narrows on "FixturePredictionTaskDto" while the wire
    // actually carries "fixture". The member DTOs already say so in their own
    // `enum`; only the mapping is absent.
    // Backend fix: add `mapping` beside `propertyName` in PredictionTaskPageDto.
    id: 'unmapped-prediction-task-discriminator',
    appliesWhen: spec => /discriminator:\s*\n\s*propertyName: kind\s*\n(?!\s*mapping:)/.test(spec),
    apply: spec =>
      spec.replace(
        /(discriminator:\s*\n(\s*)propertyName: kind\s*\n)/,
        `$1$2mapping:\n$2  fixture: '#/components/schemas/FixturePredictionTaskDto'\n$2  custom_question: '#/components/schemas/CustomQuestionPredictionTaskDto'\n`,
      ),
  },
];

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
