import { IPluginVisualization } from 'uiSrc/slices/interfaces'
import { getBaseApiUrl } from 'uiSrc/utils/common'

const MATCH_QUERY_SCAN_LENGTH = 20_000

interface QueryToken {
  value: string
  start: number
  quoted: boolean
}

const tokenizeQueryPrefix = (query: string): QueryToken[] => {
  const tokens: QueryToken[] = []
  let index = 0

  while (index < query.length) {
    while (/\s/.test(query[index])) {
      index += 1
    }

    if (index >= query.length) {
      break
    }

    const start = index
    const quote = query[index]
    if (quote === '"' || quote === "'") {
      let value = ''
      index += 1
      while (index < query.length && query[index] !== quote) {
        if (query[index] === '\\' && index + 1 < query.length) {
          value += query[index + 1]
          index += 2
        } else {
          value += query[index]
          index += 1
        }
      }
      if (index < query.length) {
        index += 1
      }
      tokens.push({ value, start, quoted: true })
      continue
    }

    while (index < query.length && !/\s/.test(query[index])) {
      index += 1
    }
    tokens.push({
      value: query.slice(start, index),
      start,
      quoted: false,
    })
  }

  return tokens
}

const getParamsPayloadIndex = (query: string): number => {
  const tokens = tokenizeQueryPrefix(query)
  if (!tokens[0]?.value.match(/^FT\./i)) {
    return -1
  }

  const paramsToken = tokens.find(
    (token, index) =>
      index > 2 && !token.quoted && token.value.toUpperCase() === 'PARAMS',
  )

  return paramsToken?.start ?? -1
}

const getRegexMatchTarget = (query: string): string => {
  const paramsIndex = getParamsPayloadIndex(query)
  const queryWithoutParams =
    paramsIndex === -1 ? query : query.slice(0, paramsIndex)

  return queryWithoutParams.slice(0, MATCH_QUERY_SCAN_LENGTH)
}

const testRegex = (pattern: string, query: string): boolean => {
  try {
    return new RegExp(pattern, 'i').test(query)
  } catch {
    return false
  }
}

const escapeRegex = (value: string): string =>
  value.replace(/[|\\{}()[\]^$+?.]/g, '\\$&')

const createCommandPattern = (matchCommand: string): string =>
  `^${matchCommand.split('*').map(escapeRegex).join('\\S*')}(?:\\s|$)`

const doesCommandMatch = (query: string, matchCommand: string): boolean =>
  testRegex(createCommandPattern(matchCommand), query)

const doesQueryPredicateMatch = (
  query: string,
  visualization: IPluginVisualization,
): boolean => {
  const anyRegex = visualization.matchQuery?.anyRegex
  const noneRegex = visualization.matchQuery?.noneRegex
  const matchTarget = getRegexMatchTarget(query)
  const hasRequiredMatch =
    !anyRegex?.length ||
    anyRegex.some((pattern) => testRegex(pattern, matchTarget))
  const hasExcludedMatch = noneRegex?.some((pattern) =>
    testRegex(pattern, matchTarget),
  )

  return hasRequiredMatch && !hasExcludedMatch
}

export const getVisualizationsByCommand = (
  query: string = '',
  visualizations: IPluginVisualization[],
): IPluginVisualization[] =>
  visualizations.filter(
    (visualization: IPluginVisualization) =>
      visualization.matchCommands.some((matchCommand) =>
        doesCommandMatch(query, matchCommand),
      ) && doesQueryPredicateMatch(query, visualization),
  )

export const urlForAsset = (basePluginUrl: string, path: string) => {
  const baseApiUrl = getBaseApiUrl()
  return `${baseApiUrl}${basePluginUrl}${path}`
}
