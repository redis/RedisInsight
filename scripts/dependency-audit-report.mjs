#!/usr/bin/env node
// Runs `npm audit` across every lockfile and renders the vulnerability report.
// Report-only: always exits 0. (Dead-dependency detection lives in the
// `.ai/skills/dead-dependencies` skill — it is a local, interactive workflow.)
import { execFileSync } from 'node:child_process';
import { existsSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  AUDIT_DIRS,
  analyzeTree,
  buildReport,
  buildStepSummary,
  shouldPostSlack,
  slackColor,
} from './lib/dependency-audit-core.mjs';

const ROOT = process.cwd();

function runJson(cmd, args, cwd) {
  const label = `${cmd} ${args.join(' ')} in ${cwd}`;
  let raw;
  try {
    raw = execFileSync(cmd, args, {
      cwd,
      encoding: 'utf8',
      maxBuffer: 1 << 28,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch (err) {
    // npm audit exits non-zero when vulnerabilities exist but still prints JSON.
    raw = err.stdout;
    if (!raw) {
      console.error(`WARN: ${label} failed: ${err.message}`);
      return null;
    }
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error(`WARN: ${label} produced unparsable output`);
    return null;
  }
  // npm serializes hard failures (bad lockfile, registry down) as {"error":…}
  // even under --json. Treat that as a failed audit, not an empty clean one.
  if (parsed && parsed.error) {
    console.error(`WARN: ${label} reported: ${parsed.error.code || 'error'}`);
    return null;
  }
  return parsed;
}

function auditTree(dir, warnings) {
  const cwd = join(ROOT, dir);
  if (!existsSync(join(cwd, 'package-lock.json'))) {
    const msg = `no lockfile in ${dir}; tree not audited`;
    console.error(`WARN: ${msg}`);
    warnings.push(msg);
    return null;
  }
  const fullAudit = runJson('npm', ['audit', '--json'], cwd);
  const prodAudit = runJson('npm', ['audit', '--omit=dev', '--json'], cwd);
  if (!fullAudit) {
    const msg = `audit failed for ${dir}; tree not audited`;
    console.error(`WARN: ${msg}`);
    warnings.push(msg);
    return null;
  }
  const result = analyzeTree({
    tree: dir === '.' ? 'root' : dir,
    fullAudit,
    prodAudit,
  });
  if (!prodAudit) {
    // Split unavailable — flag the tree so the broken-audit alert fires and a
    // human confirms the counts.
    const msg = `prod audit failed for ${dir}; findings counted as prod`;
    console.error(`WARN: ${msg}`);
    warnings.push(msg);
    result.incomplete = true;
  }
  return result;
}

function parseArgs(argv) {
  const args = { github: false };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--github') args.github = true;
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));

// Report-only: always exit 0 so this never fails a CI job on its own.
try {
  const warnings = [];
  const trees = AUDIT_DIRS.map((dir) => auditTree(dir, warnings)).filter(
    Boolean,
  );
  // A dropped or incomplete tree means the audit didn't fully run — alert on it
  // separately so a broken audit can't read as clean.
  const failed =
    trees.length < AUDIT_DIRS.length || trees.some((t) => t.incomplete);
  const report = buildReport({ trees, warnings });
  const summary = buildStepSummary(report);

  if (args.github && process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + '\n');
  } else {
    process.stdout.write(summary + '\n');
  }

  // The Slack message is built inline in the workflow; emit only the counts
  // and colour it templates in.
  if (process.env.GITHUB_OUTPUT) {
    const { prod, dev } = report.counts;
    const outputs = [
      `post=${shouldPostSlack(report)}`,
      `color=${slackColor(report)}`,
      `total_hc=${prod.critical + prod.high + dev.critical + dev.high}`,
      `failed=${failed}`,
      `prod_critical=${prod.critical}`,
      `prod_high=${prod.high}`,
      `dev_critical=${dev.critical}`,
      `dev_high=${dev.high}`,
    ];
    appendFileSync(process.env.GITHUB_OUTPUT, outputs.join('\n') + '\n');
  }
} catch (err) {
  console.error(
    `ERROR: dependency-audit-report failed unexpectedly: ${err.stack || err.message}`,
  );
  // A crash mid-report is itself a broken audit — signal it so the alert fires
  // rather than the run looking like a quiet success.
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, 'post=false\nfailed=true\n');
  }
}

process.exit(0);
