import { IPluginVisualization } from 'uiSrc/slices/interfaces'
import { getBaseApiUrl } from 'uiSrc/utils/common'

const MATCH_QUERY_SCAN_LENGTH = 20_000

const getRegexMatchTarget = (query: string): string => {
  const paramsIndex = query.search(/\bPARAMS\b/i)
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
