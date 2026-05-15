import { diff } from 'deep-object-diff'
import stringify from 'json-stable-stringify'
import fs from 'fs'
import path from 'path'

const OVERWRITE = 'overwrite'
const FORCE_OVERWRITE = 'force_overwrite'
const COMPARE = 'compare'

const SUPPORTED_COMMANDS = [OVERWRITE, COMPARE, FORCE_OVERWRITE] as const

type ErrorSnapshot = Record<string, Record<string, number>>

interface TsError {
  type: string
  value: {
    path: { type: string; value: string }
    cursor: { type: string; value: { line: number; col: number } }
    tsError: { type: string; value: { type: string; errorString: string } }
    message: { type: string; value: string }
  }
}

interface ErrorInfo {
  filename: string
  removedErrCodes: string[]
  infoPerErrorCode: Record<
    string,
    {
      newErrorsCount: number
      messages: string[]
    }
  >
}

const command = process.argv[2]
const recFileArg = process.argv[3]
const updateHintArg = process.argv[4]

if (
  !SUPPORTED_COMMANDS.includes(command as (typeof SUPPORTED_COMMANDS)[number])
) {
  throw new Error(
    `Pass one of the following commands as the first argument: ${SUPPORTED_COMMANDS.join(
      ', ',
    )}`,
  )
}

if (!recFileArg) {
  throw new Error(
    'Pass the path to the .tscheck.rec.json file as the second argument',
  )
}

const REC_FILE_PATH = path.resolve(process.cwd(), recFileArg)
const UPDATE_HINT = updateHintArg || `update the baseline at ${recFileArg}`

const tsErrorsAsJson: TsError[] = JSON.parse(fs.readFileSync(0, 'utf-8'))

function getNewSnapshot() {
  let totalErrorCount = 0

  const currentSnapshot: ErrorSnapshot = tsErrorsAsJson.reduce(
    (fileToErrMap: ErrorSnapshot, err: TsError) => {
      const filename = err.value.path.value
      const errCode = err.value.tsError.value.errorString
      const prevErrInfoForFile = fileToErrMap[filename] || {}

      totalErrorCount += 1

      return {
        ...fileToErrMap,
        [filename]: {
          ...prevErrInfoForFile,
          [errCode]: (prevErrInfoForFile[errCode] || 0) + 1,
        },
      }
    },
    {},
  )

  return {
    totalErrorCount,
    currentSnapshot,
  }
}

function getNewErrCount(
  oldFileErrorInfoSnapshot: Record<string, number>,
  newFileErrorInfoSnapshot: Record<string, number>,
  errCode: string,
): number {
  return (
    (newFileErrorInfoSnapshot[errCode] || 0) -
    (oldFileErrorInfoSnapshot[errCode] || 0)
  )
}

function getErrorInfo(
  existingSnapshot: ErrorSnapshot,
  currentSnapshotParam: ErrorSnapshot,
): ErrorInfo[] {
  return Object.keys(diff(existingSnapshot, currentSnapshotParam)).reduce(
    (acc: ErrorInfo[], filename: string) => {
      const oldFileErrorInfoSnapshot = existingSnapshot[filename] || {}
      const newFileErrorInfoSnapshot = currentSnapshotParam[filename] || {}
      const errors = tsErrorsAsJson.filter(
        (err: TsError) =>
          err.value.path.value === filename &&
          getNewErrCount(
            oldFileErrorInfoSnapshot,
            newFileErrorInfoSnapshot,
            err.value.tsError.value.errorString,
          ) > 0,
      )

      if (!errors.length) {
        return acc
      }

      return acc.concat({
        filename,
        removedErrCodes: Object.keys(oldFileErrorInfoSnapshot).filter(
          (errCode) => !(errCode in newFileErrorInfoSnapshot),
        ),
        infoPerErrorCode: errors.reduce(
          (
            result: Record<
              string,
              { newErrorsCount: number; messages: string[] }
            >,
            err: TsError,
          ) => {
            const errCode = err.value.tsError.value.errorString
            const newResult = { ...result }

            if (!newResult[errCode]) {
              newResult[errCode] = {
                newErrorsCount: getNewErrCount(
                  oldFileErrorInfoSnapshot,
                  newFileErrorInfoSnapshot,
                  errCode,
                ),
                messages: [],
              }
            }

            const info = err.value
            const pos = info.cursor.value
            newResult[errCode].messages.push(
              `${filename}:${pos.line}:${pos.col} — ${err.value.message.value}`,
            )

            return newResult
          },
          {},
        ),
      })
    },
    [],
  )
}

function getTotalErrorCount(snapshot: ErrorSnapshot): number {
  return Object.values(snapshot)
    .flatMap((fileErrors) => Object.values(fileErrors))
    .reduce((sum, count) => sum + count, 0)
}

const { currentSnapshot, totalErrorCount } = getNewSnapshot()

// eslint-disable-next-line no-console
console.log('Remaining errors: ', totalErrorCount)

interface CompareResult {
  hasNewErrors: boolean
  isOutdated: boolean
  fixedCount: number
}

function readExistingSnapshot(): ErrorSnapshot {
  if (!fs.existsSync(REC_FILE_PATH)) {
    return {}
  }
  return JSON.parse(fs.readFileSync(REC_FILE_PATH, 'utf-8'))
}

function compare(): CompareResult {
  const existingSnapshot = readExistingSnapshot()
  const baselineErrorCount = getTotalErrorCount(existingSnapshot)

  let hasNewErrors = false

  ;[
    ...new Set([
      ...Object.keys(existingSnapshot),
      ...Object.keys(currentSnapshot),
    ]),
  ].forEach((filename) => {
    const snapshotFileErrors = existingSnapshot[filename]
    const currentFileErrors = currentSnapshot[filename]
    const errCodes = [
      ...new Set([
        ...Object.keys(snapshotFileErrors || {}),
        ...Object.keys(currentFileErrors || {}),
      ]),
    ]
    const invalid =
      currentFileErrors &&
      (!snapshotFileErrors ||
        errCodes.some(
          (eCode) =>
            (snapshotFileErrors[eCode] || 0) <
            (currentFileErrors[eCode] || 0),
        ))

    if (invalid) {
      hasNewErrors = true
    }
  })

  if (hasNewErrors) {
    getErrorInfo(existingSnapshot, currentSnapshot).forEach((errInfo) => {
      console.error('_'.repeat(80), '\n', errInfo.filename)

      Object.entries(errInfo.infoPerErrorCode).forEach(([errCode, info]) => {
        console.error(
          `  🐛 ${info.newErrorsCount} new ${errCode} error${
            info.newErrorsCount > 1 ? 's' : ''
          } ${
            info.newErrorsCount !== info.messages.length &&
            info.messages.length > 1
              ? `which makes ${info.messages.length} in total`
              : ''
          }:${['', ...info.messages].join('\n     > ')}`,
        )
      })

      if (errInfo.removedErrCodes.length) {
        console.error(
          `  ⚠ There were also some removed errors (maybe they were replaced by the new ones?): ${errInfo.removedErrCodes.join(
            ', ',
          )}.

  If you want to quickly see the message for those without starting your editor see: https://github.com/microsoft/TypeScript/blob/main/src/compiler/diagnosticMessages.json

        `,
        )
      }
    })
  }

  const isOutdated = totalErrorCount < baselineErrorCount
  const fixedCount = isOutdated ? baselineErrorCount - totalErrorCount : 0

  return {
    hasNewErrors,
    isOutdated,
    fixedCount,
  }
}

async function overwrite(force?: boolean): Promise<void> {
  if (!force) {
    const result = compare()

    if (result.hasNewErrors) {
      throw new Error('There are more TS errors than previously recorded')
    }

    if (result.fixedCount > 0) {
      // eslint-disable-next-line no-console
      console.log(
        `✨ You fixed ${result.fixedCount} error${
          result.fixedCount > 1 ? 's' : ''
        }!`,
      )
    }
  }

  const stringified = stringify(currentSnapshot, { space: 2 })

  if (stringified) {
    await fs.promises.mkdir(path.dirname(REC_FILE_PATH), { recursive: true })
    await fs.promises.writeFile(REC_FILE_PATH, `${stringified}\n`)
  }
}

switch (command) {
  case COMPARE: {
    const result = compare()

    if (result.hasNewErrors) {
      throw new Error('There are more TS errors than previously recorded')
    }

    if (result.isOutdated) {
      console.error('_'.repeat(80))
      console.error(
        `✨ Great! You fixed ${result.fixedCount} error${
          result.fixedCount > 1 ? 's' : ''
        }!`,
      )
      console.error(`📝 But the baseline is outdated. Please run:`)
      console.error('')
      console.error(`   ${UPDATE_HINT}`)
      console.error('')
      console.error(`Then commit the updated baseline file.`)
      console.error('_'.repeat(80))
      throw new Error(
        `Baseline is outdated - please update it by running: ${UPDATE_HINT}`,
      )
    }

    // eslint-disable-next-line no-console
    console.log('Great, no new errors!')
    break
  }
  case OVERWRITE: {
    overwrite().catch((err: Error) => {
      console.error('Error during overwrite:', err)
      process.exit(1)
    })
    break
  }
  case FORCE_OVERWRITE: {
    overwrite(true).catch((err: Error) => {
      console.error('Error during force overwrite:', err)
      process.exit(1)
    })
    break
  }
  default: {
    throw new Error(`Unsupported command: ${command}`)
  }
}
