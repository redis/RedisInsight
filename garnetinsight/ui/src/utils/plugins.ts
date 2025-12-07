import { IPluginVisualization } from 'uiSrc/slices/interfaces'
import { getBaseApiUrl } from 'uiSrc/utils/common'

export const getVisualizationsByCommand = (
  query: string = '',
  visualizations: IPluginVisualization[],
) =>
  visualizations.filter((visualization: IPluginVisualization) =>
    visualization.matchCommands.some(
      (matchCommand) =>
        query?.startsWith(matchCommand) ||
        new RegExp(`^${matchCommand}`, 'i').test(query),
    ),
  )

export const urlForAsset = (basePluginUrl: string, path: string) => {
  const baseApiUrl = getBaseApiUrl()
  return `${baseApiUrl}${basePluginUrl}${path}`
}
