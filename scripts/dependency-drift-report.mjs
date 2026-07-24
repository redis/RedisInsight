#!/usr/bin/env node
// Reports how far each direct dependency is behind its latest release, across
// every lockfile, highlighting the Tier-1 build/runtime spine so core upgrades
// can be planned before the migration cost compounds. Report-only: always
// exits 0. (Vulnerabilities live in `deps:audit`; this is the drift signal.)
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  AUDIT_DIRS,
  analyzeTree,
  buildReport,
  formatTable,
  topLevelVersions,
} from './lib/dependency-drift-core.mjs';

const ROOT = process.cwd();

function readCurrentVersions(cwd) {
  try {
    return topLevelVersions(
      JSON.parse(readFileSync(join(cwd, 'package-lock.json'), 'utf8')),
    );
  } catch {
    return {};
  }
}

function runOutdated(dir, warnings) {
  const cwd = join(ROOT, dir);
  if (!existsSync(join(cwd, 'package-lock.json'))) {
    const msg = `no lockfile in ${dir}; tree not scanned`;
    console.error(`WARN: ${msg}`);
    warnings.push(msg);
    return null;
  }
  let raw;
  try {
    raw = execFileSync('npm', ['outdated', '--json'], {
      cwd,
      encoding: 'utf8',
      maxBuffer: 1 << 28,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch (err) {
    // `npm outdated` exits non-zero when anything is out of date but still
    // prints the JSON report on stdout.
    raw = err.stdout;
    if (!raw) {
      const msg = `npm outdated failed for ${dir}; tree not scanned`;
      console.error(`WARN: ${msg}`);
      warnings.push(msg);
      return null;
    }
  }
  try {
    return JSON.parse(raw);
  } catch {
    const msg = `npm outdated produced unparsable output for ${dir}`;
    console.error(`WARN: ${msg}`);
    warnings.push(msg);
    return null;
  }
}

const flags = process.argv.slice(2);
const asJson = flags.includes('--json');
const showIgnored = flags.includes('--show-ignored');

try {
  const warnings = [];
  const trees = AUDIT_DIRS.map((dir) => {
    const outdated = runOutdated(dir, warnings);
    if (!outdated) return null;
    const currentVersions = readCurrentVersions(join(ROOT, dir));
    return analyzeTree({
      tree: dir === '.' ? 'root' : dir,
      outdated,
      currentVersions,
    });
  }).filter(Boolean);

  const report = buildReport({ trees });

  if (asJson) {
    process.stdout.write(
      JSON.stringify({ ...report, warnings }, null, 2) + '\n',
    );
  } else {
    process.stdout.write(formatTable(report, { showIgnored }) + '\n');
    for (const w of warnings) console.error(`WARN: ${w}`);
  }
} catch (err) {
  console.error(
    `ERROR: dependency-drift-report failed unexpectedly: ${err.stack || err.message}`,
  );
}

process.exit(0);
