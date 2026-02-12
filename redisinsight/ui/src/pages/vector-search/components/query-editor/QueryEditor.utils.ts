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
  const subcommand = parsed.command === 'FT.SEARCH' ? 'SEARCH' : 'AGGREGATE'

  // Extract the first token (index name), respecting quotes.
  const { index, remainder } = extractFirstToken(rest)

  if (remainder === null) {
    // Only index, no query args
    return `FT.PROFILE ${index} ${subcommand} QUERY`
  }

  return `FT.PROFILE ${index} ${subcommand} QUERY${remainder}`
}

/**
 * Extracts the first whitespace-delimited token from a string,
 * respecting single and double-quoted tokens that may contain spaces.
 *
 * Returns the token (including its quotes) and the remainder of the
 * string (starting from the whitespace after the token), or
 * `{ index: input, remainder: null }` when there is no second token.
 */
export const extractFirstToken = (
  input: string,
): { index: string; remainder: string | null } => {
  if (!input) return { index: '', remainder: null }

  const quote = input[0]
  if (quote === '"' || quote === "'") {
    // Find the matching closing quote (skip escaped quotes)
    let i = 1
    while (i < input.length) {
      if (input[i] === '\\') {
        i += 2 // skip escaped character
        continue
      }
      if (input[i] === quote) {
        // Token ends at closing quote
        const endIdx = i + 1
        const index = input.slice(0, endIdx)
        const after = input.slice(endIdx)
        return after.length === 0 || !/\s/.test(after[0])
          ? { index, remainder: after || null }
          : { index, remainder: after }
      }
      i++
    }
    // Unterminated quote – treat entire input as the token
    return { index: input, remainder: null }
  }

  // Unquoted token – split on first whitespace
  const spaceIdx = input.search(/\s/)
  if (spaceIdx === -1) {
    return { index: input, remainder: null }
  }
  return { index: input.slice(0, spaceIdx), remainder: input.slice(spaceIdx) }
}
