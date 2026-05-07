#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Regenerates the OpenAPI TypeScript client consumed by the UI workspace.
 *
 * Runs as part of the api workspace `postinstall` so a fresh checkout always
 * produces an up-to-date `redisinsight/api-client/`. Skipped when:
 *   - SKIP_API_CLIENT_GEN=1            (offline installs / CI caches)
 *   - CI=true and SKIP_API_CLIENT_GEN unset  -> runs (CI generates the client)
 *
 * Failures are logged but do not abort install: the missing client surfaces
 * as a build/type error instead, which is easier to diagnose than an aborted
 * `yarn install`.
 */

const path = require('path');
const { spawnSync } = require('child_process');

if (process.env.SKIP_API_CLIENT_GEN === '1') {
  console.log('[postinstall] SKIP_API_CLIENT_GEN=1 — skipping API client generation');
  process.exit(0);
}

const apiDir = path.resolve(__dirname, '..');
console.log('[postinstall] Generating OpenAPI client...');

const result = spawnSync('yarn', ['generate:api-client'], {
  cwd: apiDir,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (result.status !== 0) {
  console.warn(
    '[postinstall] API client generation failed (exit code: ' +
      result.status +
      '). Run `yarn --cwd redisinsight/api generate:api-client` manually to retry.',
  );
}

process.exit(0);
