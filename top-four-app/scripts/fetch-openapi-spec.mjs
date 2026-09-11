// Fetches the backend's live OpenAPI document and saves a snapshot under
// openapi/schema.json. The generated types (lib/api/generated/schema.d.ts)
// are built from this saved snapshot, not from a live fetch on every build --
// codegen has to be reproducible without depending on network access or a
// specific environment being reachable at build time.
//
// The backend serves its spec at <global-prefix>/openapi.json (globalPrefix
// is "v1"), which the frontend's own Next.js rewrite maps to /api/openapi.json.
// Override with OPENAPI_SPEC_URL to point at a different environment.

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_URL = 'https://dev.topfour.app/api/openapi.json';
const url = process.env.OPENAPI_SPEC_URL || DEFAULT_URL;

const outPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'openapi', 'schema.json');

console.log(`Fetching OpenAPI spec from ${url}`);
const response = await fetch(url);
if (!response.ok) {
  console.error(`Failed to fetch spec: ${response.status} ${response.statusText}`);
  process.exit(1);
}
const spec = await response.json();

if (!spec.openapi || !spec.paths) {
  console.error('Response does not look like an OpenAPI document (missing "openapi" or "paths").');
  process.exit(1);
}

await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, JSON.stringify(spec, null, 2) + '\n', 'utf-8');
console.log(`Saved ${Object.keys(spec.paths).length} paths to ${outPath}`);
