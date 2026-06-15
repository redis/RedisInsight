import { defineConfig } from '@hey-api/openapi-ts';

/**
 * Generates the typed OpenAPI client consumed by the UI workspace.
 *
 * Input:  `redisinsight/api/openapi.json` (produced by `yarn generate:openapi-spec`).
 * Output: `redisinsight/api-client/`     (gitignored, regenerated on `postinstall`).
 *
 * `enums: 'typescript'` makes the typescript plugin emit named TS enums for any
 * top-level enum schemas in the OpenAPI document, so the UI can consume them
 * as values (e.g. `NodeRole.Primary`). For this to fire on a given enum, the BE
 * `@ApiProperty({ enum, ... })` decorator must include `enumName: 'X'` so Nest
 * emits the enum as a referenced `components/schemas/X` instead of inlining it.
 *
 * `enums.case: 'PascalCase'` keeps member names exactly as written in the BE
 * source (e.g. `RunQueryMode.ASCII`, `NodeRole.Primary`) so the UI does not
 * have to follow casing transforms.
 */
export default defineConfig({
  input: './openapi.json',
  output: '../api-client',
  plugins: [
    {
      name: '@hey-api/typescript',
      enums: {
        mode: 'typescript',
        case: 'PascalCase',
      },
    },
    '@hey-api/sdk',
    '@hey-api/client-axios',
  ],
});
