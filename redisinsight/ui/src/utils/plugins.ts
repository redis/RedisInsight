import { IPluginVisualization } from 'uiSrc/slices/interfaces'
import { getBaseApiUrl } from 'uiSrc/utils/common'

const MATCH_QUERY_MAX_LENGTH = 1024

const testRegex = (pattern: string, query: string): boolean => {
  try {
    return new RegExp(pattern, 'i').test(query)
  } catch {
    return false
  }
}

const doesCommandMatch = (query: string, matchCommand: string): boolean =>
  query?.startsWith(matchCommand) || testRegex(`^${matchCommand}`, query)

const doesQueryPredicateMatch = (
  query: string,
  visualization: IPluginVisualization,
): boolean => {
  const anyRegex = visualization.matchQuery?.anyRegex
  if (!anyRegex?.length) {
    return true
  }

  if (query.length > MATCH_QUERY_MAX_LENGTH) {
    return false
  }

  return anyRegex.some((pattern) => testRegex(pattern, query))
}

export const getVisualizationsByCommand = (
  query: string = '',
  visualizations: IPluginVisualization[],
) =>
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
