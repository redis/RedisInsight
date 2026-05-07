import { defineConfig } from '@hey-api/openapi-ts';

/**
 * Generates the typed OpenAPI client consumed by the UI workspace.
 *
 * Input:  `redisinsight/api/openapi.json` (produced by `yarn generate:openapi-spec`).
 * Output: `redisinsight/api-client/`     (gitignored, regenerated on `postinstall`).
 *
 * The generator is pure JS (no Java/JRE required); the axios client plugin is
 * bundled into `@hey-api/openapi-ts` since v0.73.0.
 */
export default defineConfig({
  input: './openapi.json',
  output: '../api-client',
  plugins: ['@hey-api/client-axios'],
});
