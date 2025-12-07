import { getVisualizationsByCommand } from 'uiSrc/utils'
import { IPluginVisualization } from 'uiSrc/slices/interfaces'

describe('getVisualizationsByCommand', () => {
  const getVisualizationsByCommandTests: [string, number][] = [
    ['ft.search sa', 2],
    ['ft.get zxc', 2],
    ['command ft. zxc zxcz ft', 0],
    ['command ft', 0],
    ['any command', 0],
    ['get key', 1],
  ]

  const visualizations = [
    { matchCommands: ['ft.search', 'ft.get'] },
    { matchCommands: ['ft._list'] },
    { matchCommands: ['ft.*'] },
    { matchCommands: ['get'] },
  ] as IPluginVisualization[]

  test.each(getVisualizationsByCommandTests)(
    'for %j, should be %i',
    (input, expected) => {
      // @ts-ignore
      const result = getVisualizationsByCommand(input, visualizations)
      expect(result).toHaveLength(expected)
    },
  )
})
