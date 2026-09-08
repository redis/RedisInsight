#!/usr/bin/env node
// Merges the per-shard `jest --json --coverage` reports produced by sharded
// CI runs (tests-frontend.yml) back into a single report.json, so the
// existing jest-coverage-report-action PR comment keeps working unmodified.
//
// Per-shard runs only execute a fraction of the test files, so per-shard
// `coverageThreshold` enforcement is meaningless (it must be disabled via
// `--coverageThreshold='{}'` on the sharded jest runs). This script re-checks
// the *merged* coverage against the `coverageThreshold.global` from the given
// jest config, exiting non-zero if it isn't met.
//
// Usage: node scripts/merge-jest-shard-reports.mjs <shardsRootDir> <outputFile> <reportRelPath> [jestConfigPath]
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'fs'
import { createRequire } from 'module'
import { dirname, join, resolve } from 'path'
import istanbulLibCoverage from 'istanbul-lib-coverage'

const { createCoverageMap } = istanbulLibCoverage
const require = createRequire(import.meta.url)

const [, , shardsRootDir, outputFile, reportRelPath, jestConfigPath] = process.argv

if (!shardsRootDir || !outputFile || !reportRelPath) {
  console.error(
    'Usage: merge-jest-shard-reports.mjs <shardsRootDir> <outputFile> <reportRelPath> [jestConfigPath]',
  )
  process.exit(1)
}

const shardDirs = readdirSync(shardsRootDir).filter((name) =>
  statSync(join(shardsRootDir, name)).isDirectory(),
)

if (shardDirs.length === 0) {
  console.error(`No shard directories found under ${shardsRootDir}`)
  process.exit(1)
}

const NUMERIC_FIELDS = [
  'numFailedTestSuites',
  'numFailedTests',
  'numPassedTestSuites',
  'numPassedTests',
  'numPendingTestSuites',
  'numPendingTests',
  'numRuntimeErrorTestSuites',
  'numTodoTests',
  'numTotalTestSuites',
  'numTotalTests',
]

const coverageMap = createCoverageMap({})
const merged = {
  testResults: [],
  success: true,
  wasInterrupted: false,
  startTime: Number.POSITIVE_INFINITY,
}
for (const field of NUMERIC_FIELDS) merged[field] = 0

for (const shardDir of shardDirs) {
  const reportPath = join(shardsRootDir, shardDir, reportRelPath)
  const report = JSON.parse(readFileSync(reportPath, 'utf8'))

  merged.testResults.push(...(report.testResults ?? []))
  merged.success = merged.success && report.success !== false
  merged.wasInterrupted = merged.wasInterrupted || !!report.wasInterrupted
  merged.startTime = Math.min(merged.startTime, report.startTime ?? Date.now())

  for (const field of NUMERIC_FIELDS) merged[field] += report[field] ?? 0

  if (report.coverageMap) coverageMap.merge(report.coverageMap)
}

merged.coverageMap = coverageMap.toJSON()

mkdirSync(dirname(outputFile), { recursive: true })
writeFileSync(outputFile, JSON.stringify(merged))

console.log(
  `Merged ${shardDirs.length} shard reports into ${outputFile} (${merged.numTotalTests} tests, success=${merged.success})`,
)

if (jestConfigPath) {
  const { coverageThreshold } = require(resolve(jestConfigPath))
  const thresholds = coverageThreshold?.global ?? {}
  const summary = coverageMap.getCoverageSummary().toJSON()

  let met = true
  for (const [metric, minPct] of Object.entries(thresholds)) {
    const actualPct = summary[metric]?.pct ?? 0
    const ok = actualPct >= minPct
    met = met && ok
    console.log(
      `${ok ? '✓' : '✗'} ${metric}: ${actualPct}% (threshold ${minPct}%)`,
    )
  }

  if (!met) {
    console.error('Merged coverage does not meet the global coverageThreshold.')
    process.exitCode = 1
  }
}
