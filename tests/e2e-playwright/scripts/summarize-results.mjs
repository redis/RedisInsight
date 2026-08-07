#!/usr/bin/env node
/**
 * Turns Playwright's json reporter output into a compact, agent-friendly digest.
 *
 * The raw report nests suites arbitrarily deep, embeds per-test stdout/stderr and
 * code snippets, and carries ANSI escapes inside error messages, which makes it
 * both large (megabytes on a full run) and awkward to consume. This emits a flat
 * failure list instead: title, location, status and a capped one-line cause.
 *
 * The digest is published where no token is needed to read it, so it must never
 * carry secret values. e2e jobs hold real Redis Cloud credentials, an app
 * encryption key and (on Electron) a TLS private key, and those leak into error
 * text through connection errors, assertion diffs and locators built from test
 * data. Everything emitted here therefore goes through redact().
 *
 * Usage:
 *   node scripts/summarize-results.mjs [--input <results.json>] [--json <out>] [--markdown]
 */

import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, relative, resolve } from 'path'

const MAX_FAILURES = 50
const MAX_ERROR_CHARS = 400
const MIN_REDACTED_LENGTH = 4

// Job env holding values that must never reach the digest. Names only: the
// values are read at runtime and substituted out.
const SECRET_ENV_KEYS = [
  'E2E_CLOUD_DATABASE_USERNAME',
  'E2E_CLOUD_DATABASE_PASSWORD',
  'E2E_CLOUD_DATABASE_HOST',
  'E2E_CLOUD_DATABASE_PORT',
  'E2E_CLOUD_DATABASE_NAME',
  'E2E_CLOUD_API_ACCESS_KEY',
  'E2E_CLOUD_API_SECRET_KEY',
  'E2E_RI_ENCRYPTION_KEY',
  'RI_ENCRYPTION_KEY',
  'TEST_BIG_DB_DUMP',
  'RI_SERVER_TLS_CERT',
  'RI_SERVER_TLS_KEY',
  'DOCKERHUB_TOKEN',
  'SLACK_TEST_REPORT_KEY',
]

// Backstop for credential-shaped strings that never came from the env above,
// e.g. a token echoed by a remote API. Deliberately conservative: these run
// after value substitution and only match long, unbroken secret-like runs.
const SECRET_PATTERNS = [
  [/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g, '***jwt***'],
  [/\b[A-Fa-f0-9]{32,}\b/g, '***hex***'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, '***private-key***'],
]

const ANSI = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g')

const args = process.argv.slice(2)
const getArg = (name, fallback) => {
  const i = args.indexOf(name)
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback
}

const repoRoot = resolve(process.cwd(), '../..')
const inputPath = getArg('--input', 'test-results/results.json')
const jsonOut = getArg('--json', '')
const wantMarkdown = args.includes('--markdown')

const secretValues = SECRET_ENV_KEYS.map((key) => process.env[key])
  .filter((value) => value && value.trim().length >= MIN_REDACTED_LENGTH)
  // Longest first so a value that contains another is replaced whole.
  .sort((a, b) => b.length - a.length)

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const redact = (input) => {
  if (!input) return ''
  let out = String(input).replace(ANSI, '')

  for (const value of secretValues) {
    out = out.replace(new RegExp(escapeRegExp(value), 'g'), '***')
  }
  for (const [pattern, replacement] of SECRET_PATTERNS) {
    out = out.replace(pattern, replacement)
  }
  // Runner paths are noise and expose the checkout layout.
  out = out.replace(new RegExp(escapeRegExp(repoRoot), 'g'), '.')

  return out.replace(/\s+/g, ' ').trim()
}

const firstLines = (message, count = 3) =>
  redact(message).split(' at ')[0].split('\n').slice(0, count).join(' ')

// Paths arrive absolute under the runner checkout. Report them relative to the
// e2e package so they match what you'd pass back to `npx playwright test`.
const PACKAGE_MARKER = 'tests/e2e-playwright/'
const toRepoPath = (value) => {
  if (!value) return ''
  const normalized = redact(value)
  const at = normalized.lastIndexOf(PACKAGE_MARKER)
  if (at !== -1) return normalized.slice(at + PACKAGE_MARKER.length)
  return relative('.', normalized) || normalized
}

// When a test passes only on retry the last result carries no error, so take the
// cause from the attempt that actually failed.
const failingAttempt = (attempts) =>
  attempts.find((attempt) => attempt.error) || attempts[attempts.length - 1]

// A run killed before the reporter flushes leaves no report. Say so rather than
// exiting non-zero, so the publishing step still reports something useful.
let report
try {
  report = JSON.parse(readFileSync(inputPath, 'utf8'))
} catch (error) {
  report = null
}

const totals = { passed: 0, failed: 0, flaky: 0, skipped: 0, timedOut: 0, interrupted: 0 }
const failures = []

const classify = (test) => {
  const attempts = test.results || []
  const last = attempts[attempts.length - 1]
  if (!last) return null
  if (last.status === 'skipped') return 'skipped'
  // Passing only after a retry is flaky, not passed - it hides real races.
  if (last.status === 'passed') return attempts.length > 1 ? 'flaky' : 'passed'
  return last.status
}

const walk = (suite, ancestors = []) => {
  // The file-level suite is titled with its own path; keep that out of the test
  // title so what remains matches the describe chain you'd pass to `-g`.
  const isFileSuite = Boolean(suite.file) && suite.title === suite.file
  const trail = suite.title && !isFileSuite ? [...ancestors, suite.title] : ancestors

  for (const child of suite.suites || []) walk(child, trail)

  for (const spec of suite.specs || []) {
    for (const test of spec.tests || []) {
      const status = classify(test)
      if (!status) continue

      totals[status] = (totals[status] || 0) + 1
      if (status === 'passed' || status === 'skipped') continue

      const attempts = test.results || []
      const cause = failingAttempt(attempts)

      failures.push({
        title: redact([...trail, spec.title].join(' > ')),
        file: toRepoPath(spec.file),
        line: spec.line ?? null,
        project: test.projectName || '',
        status,
        attempts: attempts.length,
        durationMs: cause.duration ?? null,
        error: firstLines(cause.error?.message).slice(0, MAX_ERROR_CHARS),
        artifacts: (cause.attachments || []).map((a) => toRepoPath(a.path || a.name)).filter(Boolean),
      })
    }
  }
}

if (report) walk(report)

// Playwright reports worker crashes and config faults here rather than against a
// spec, so a run can fail with no failing test. Without these the digest would
// say "No failures" for a run that never got going.
const globalErrors = (report?.errors || [])
  .map((error) => firstLines(error?.message ?? error?.value ?? String(error)))
  .filter(Boolean)
  .slice(0, 10)
  .map((message) => message.slice(0, MAX_ERROR_CHARS))

const digest = {
  reportFound: Boolean(report),
  globalErrors,
  run: {
    url: process.env.GITHUB_SERVER_URL
      ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : '',
    workflow: process.env.GITHUB_WORKFLOW || '',
    sha: process.env.GITHUB_SHA || '',
    ref: process.env.GITHUB_REF_NAME || '',
  },
  totals,
  failures: failures.slice(0, MAX_FAILURES),
  truncated: failures.length > MAX_FAILURES,
  omittedCount: Math.max(0, failures.length - MAX_FAILURES),
}

if (jsonOut) {
  // The callers run under `if: always()`, so a build or startup step can fail
  // before Playwright creates test-results. Writing there is how the "no report"
  // digest reaches an early-failure run.
  mkdirSync(dirname(resolve(jsonOut)), { recursive: true })
  writeFileSync(jsonOut, `${JSON.stringify(digest, null, 2)}\n`)
}

if (wantMarkdown) {
  const t = digest.totals
  const lines = [
    `### ${digest.run.workflow || 'Playwright'} results`,
    '',
    `passed **${t.passed}** · failed **${t.failed}** · flaky **${t.flaky}** · timedOut **${t.timedOut}** · skipped **${t.skipped}**`,
    '',
  ]

  if (digest.globalErrors.length) {
    lines.push('**Run-level errors** (reported outside any test):', '')
    for (const message of digest.globalErrors) lines.push(`- ${message}`)
    lines.push('')
  }

  if (!digest.reportFound) {
    lines.push(`No report at \`${inputPath}\` - the run likely died before the reporter flushed.`)
  } else if (!digest.failures.length) {
    lines.push(digest.globalErrors.length ? 'No failing tests.' : 'No failures.')
  } else {
    lines.push('| Test | Location | Status | Cause |', '| --- | --- | --- | --- |')
    for (const f of digest.failures) {
      const cause = f.error.replace(/\|/g, '\\|').slice(0, 200)
      lines.push(`| ${f.title} | \`${f.file}:${f.line}\` | ${f.status} | ${cause} |`)
    }
    if (digest.truncated) {
      lines.push('', `_${digest.omittedCount} further failure(s) omitted; see the uploaded artifact._`)
    }
  }

  process.stdout.write(`${lines.join('\n')}\n`)
}

if (!jsonOut && !wantMarkdown) {
  process.stdout.write(`${JSON.stringify(digest, null, 2)}\n`)
}
