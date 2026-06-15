#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Wrapper that regenerates the OpenAPI TypeScript client used by the UI.
 *
 * Invoked from the root `generate:api-client` script and the `postinstall`
 * hook. Skipped when `SKIP_API_CLIENT_GEN=1` is set in the environment, which
 * is useful for offline installs / CI caches where the generator should not
 * run automatically.
 */

const path = require('path');
const { spawnSync } = require('child_process');

if (process.env.SKIP_API_CLIENT_GEN === '1') {
  console.log('[generate-api-client] SKIP_API_CLIENT_GEN=1 — skipping');
  process.exit(0);
}

const apiDir = path.resolve(__dirname, '..', 'redisinsight', 'api');
const result = spawnSync('yarn', ['--cwd', apiDir, 'generate:api-client'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 1);
