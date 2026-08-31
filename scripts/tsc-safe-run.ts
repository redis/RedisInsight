import { parse } from '@aivenio/tsc-output-parser'
import { spawnSync } from 'child_process'
import { createRequire } from 'module'
import path from 'path'

// tsc exits 0 when it finds nothing and 1 or 2 when it reports diagnostics.
// Any other status means it died before listing them - 134 for an
// out-of-memory abort - and its empty output must never be read as a clean
// run, which would silently erase the baseline in ts-error-check.ts.
const TSC_FINISHED_STATUSES = new Set([0, 1, 2])

const argv = process.argv.slice(2)
const projectFlagIndex = argv.indexOf('--project')
const projectArg =
  projectFlagIndex === -1 ? undefined : argv[projectFlagIndex + 1]

if (!projectArg) {
  throw new Error('Pass the tsconfig to check as `--project <file>`')
}

// Everything except --project is forwarded to ts-error-check.ts untouched.
const checkArgs = [
  ...argv.slice(0, projectFlagIndex),
  ...argv.slice(projectFlagIndex + 2),
]

function refuseRun(reason: string, stderr: string): never {
  console.error('_'.repeat(80))
  console.error(`✗ tsc ${reason}.`)

  if (/heap out of memory|Allocation failed/.test(stderr)) {
    console.error('')
    console.error('It ran out of memory. Give it a bigger heap and retry:')
    console.error('')
    console.error('   NODE_OPTIONS=--max-old-space-size=8192 <command>')
  }

  console.error('')
  console.error('The baseline was left untouched.')
  console.error('_'.repeat(80))

  throw new Error(
    `tsc ${reason}, so its output says nothing about the real error count`,
  )
}

// Resolve tsc the way the shell would from this package, since the api pins
// its own typescript.
const requireFromCwd = createRequire(path.join(process.cwd(), 'noop.js'))
const tsc = spawnSync(
  process.execPath,
  [
    requireFromCwd.resolve('typescript/bin/tsc'),
    '--project',
    projectArg,
    '--noEmit',
    '--pretty',
    'false',
  ],
  { encoding: 'utf-8', maxBuffer: 1 << 28 },
)

if (tsc.error) {
  throw new Error(`Could not start tsc: ${tsc.error.message}`)
}

if (tsc.stderr) {
  console.error(tsc.stderr)
}

if (
  tsc.signal ||
  tsc.status === null ||
  !TSC_FINISHED_STATUSES.has(tsc.status)
) {
  const cause = tsc.signal
    ? `was killed by ${tsc.signal}`
    : `exited with ${tsc.status}`

  refuseRun(`${cause} before reporting any diagnostics`, tsc.stderr)
}

const tsErrors = parse(tsc.stdout) as unknown[]

// A non-zero status means tsc had something to report, so an empty result
// means it crashed before listing anything rather than finding nothing. An
// uncaught compiler exception looks exactly like this: status 1, a stack
// trace on stderr, and no diagnostics at all.
if (tsc.status !== 0 && !tsErrors.length) {
  refuseRun(
    `exited with ${tsc.status} without reporting a single diagnostic`,
    tsc.stderr,
  )
}

// Hand the parsed diagnostics to ts-error-check.ts on stdin, exactly the way
// the old `tsc | tsc-output-parser | tsx ts-error-check.ts` shell pipe did.
// That script is untouched - it still only knows how to compare/overwrite a
// baseline against TsError[] JSON read from stdin.
const check = spawnSync(
  'tsx',
  [path.join(__dirname, 'ts-error-check.ts'), ...checkArgs],
  {
    input: JSON.stringify(tsErrors),
    stdio: ['pipe', 'inherit', 'inherit'],
    encoding: 'utf-8',
  },
)

if (check.error) {
  throw new Error(`Could not start ts-error-check.ts: ${check.error.message}`)
}

process.exit(check.status ?? 1)
