/**
 * The server's own types, reachable by DTO name.
 *
 *   type StandingEntry = Api<'StandingEntryDto'>;
 *
 * `lib/api/generated/schema.d.ts` is written by `npm run api:types` and must
 * never be edited by hand. This file is the only place the rest of the client
 * reaches into it, so a rename upstream surfaces here rather than in fifty
 * import sites.
 */

import type { components } from './generated/schema';

export type Api<Name extends keyof components['schemas']> = components['schemas'][Name];

export type ApiSchemaName = keyof components['schemas'];
