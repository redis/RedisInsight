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
  try {
    const out = execFileSync(cmd, args, {
      cwd,
      encoding: 'utf8',
      maxBuffer: 1 << 28,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return JSON.parse(out);
  } catch (err) {
    // npm audit exits non-zero when vulnerabilities exist but still prints JSON.
    if (err.stdout) {
      try {
        return JSON.parse(err.stdout);
      } catch {
        /* fall through */
      }
    }
    console.error(
      `WARN: ${cmd} ${args.join(' ')} in ${cwd} failed: ${err.message}`,
    );
    return null;
  }
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
  if (!prodAudit) {
    const msg = `prod audit failed for ${dir}; prod/dev split may under-report`;
    console.error(`WARN: ${msg}`);
    warnings.push(msg);
  }
  return analyzeTree({
    tree: dir === '.' ? 'root' : dir,
    fullAudit,
    prodAudit: prodAudit || { vulnerabilities: {} },
  });
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
  // A dropped tree means a lockfile couldn't be audited — a broken audit, not
  // a clean one. Alert on it separately so it can't read as clean.
  const failed = trees.length < AUDIT_DIRS.length;
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
}

process.exit(0);
