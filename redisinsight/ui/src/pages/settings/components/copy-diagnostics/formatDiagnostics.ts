import { GetServerInfoResponse } from 'apiClient'

const CODE_FENCE = '```'
const HEADER = 'RedisInsight diagnostics'
const LABEL_COLUMN_WIDTH = 15
const BUILD_COMMIT_SHA_LENGTH = 7

/**
 * Builds the clipboard payload for the Settings copy button: a fenced code
 * block of environment info ready to paste into a GitHub issue. Rows with an
 * empty value (build commit on dev builds, package type off Electron) are
 * dropped so each runtime flavor produces a clean block.
 */
export const formatDiagnostics = (server: GetServerInfoResponse): string => {
  const rows: [string, string | undefined][] = [
    ['App version:', server.appVersion],
    ['Build commit:', server.buildCommitSha?.slice(0, BUILD_COMMIT_SHA_LENGTH)],
    ['OS:', `${server.osPlatform} (${server.osArch})`],
    ['Build type:', server.buildType],
    ['App type:', server.appType],
    ['Package type:', server.packageType],
  ]

  const lines = rows
    .filter(([, value]) => Boolean(value))
    .map(([label, value]) => `${label.padEnd(LABEL_COLUMN_WIDTH)}${value}`)

  return [CODE_FENCE, HEADER, ...lines, CODE_FENCE].join('\n')
}
