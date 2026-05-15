import { IPluginVisualization } from 'uiSrc/slices/interfaces'
import { getBaseApiUrl } from 'uiSrc/utils/common'

const doesCommandMatch = (query: string, matchCommand: string): boolean =>
  query?.startsWith(matchCommand) ||
  new RegExp(`^${matchCommand}`, 'i').test(query)

const doesQueryPredicateMatch = (
  query: string,
  visualization: IPluginVisualization,
): boolean => {
  const anyRegex = visualization.matchQuery?.anyRegex
  if (!anyRegex?.length) {
    return true
  }

  return anyRegex.some((pattern) => {
    try {
      return new RegExp(pattern, 'i').test(query)
    } catch {
      return false
    }
  })
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
