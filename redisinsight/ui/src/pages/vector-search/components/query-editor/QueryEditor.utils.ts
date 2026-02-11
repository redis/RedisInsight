import { EXPLAINABLE_COMMANDS } from './QueryEditor.constants'
import { ExplainableCommand } from './QueryEditor.types'

/**
 * Parses the query to detect a single FT.SEARCH or FT.AGGREGATE command.
 *
 * Returns the matched command and its position so that Explain / Profile
 * can transform the query without a second regex pass.
 */
export const parseExplainableCommand = (
  query: string,
): { command: ExplainableCommand; afterCommand: string } | null => {
  const trimmed = query.trim()
  if (!trimmed) return null

  const upper = trimmed.toUpperCase()
  for (const cmd of EXPLAINABLE_COMMANDS) {
    if (upper.startsWith(cmd)) {
      const rest = trimmed.slice(cmd.length)
      // Must be followed by whitespace or end-of-string
      if (rest.length === 0 || /^\s/.test(rest)) {
        return { command: cmd, afterCommand: rest }
      }
    }
  }
  return null
}

/**
 * Builds an FT.EXPLAIN command from the current query.
 *
 * `FT.SEARCH idx "query" LIMIT 0 10` → `FT.EXPLAIN idx "query" LIMIT 0 10`
 */
export const buildExplainQuery = (parsed: {
  command: ExplainableCommand
  afterCommand: string
}): string => `FT.EXPLAIN${parsed.afterCommand}`

/**
 * Builds an FT.PROFILE command from the current query.
 *
 * `FT.SEARCH idx "query" LIMIT 0 10`
 *   → `FT.PROFILE idx SEARCH QUERY "query" LIMIT 0 10`
 *
 * `FT.AGGREGATE idx "query" GROUPBY ...`
 *   → `FT.PROFILE idx AGGREGATE QUERY "query" GROUPBY ...`
 */
export const buildProfileQuery = (parsed: {
  command: ExplainableCommand
  afterCommand: string
}): string => {
  const rest = parsed.afterCommand.trimStart()
  // Split: first token is the index, remainder is the query args
  const spaceIdx = rest.search(/\s/)
  if (spaceIdx === -1) {
    // Only index, no query args
    return `FT.PROFILE ${rest} ${parsed.command === 'FT.SEARCH' ? 'SEARCH' : 'AGGREGATE'} QUERY`
  }
  const index = rest.slice(0, spaceIdx)
  const queryArgs = rest.slice(spaceIdx)
  const subcommand = parsed.command === 'FT.SEARCH' ? 'SEARCH' : 'AGGREGATE'
  return `FT.PROFILE ${index} ${subcommand} QUERY${queryArgs}`
}
