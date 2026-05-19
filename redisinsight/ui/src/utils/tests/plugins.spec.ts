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

  it('applies optional query predicates after command matching', () => {
    const geodataVisualization = {
      matchCommands: ['FT.SEARCH', 'FT.AGGREGATE', 'FT.HYBRID'],
      matchQuery: {
        anyRegex: [
          String.raw`@\w+:\[\s*[-+$\w.]+\s+[-+$\w.]+\s+[-+$\w.]+\s+(?:m|km|mi|ft)\s*\]`,
          String.raw`\bGEOFILTER\s+\w+\s+[-+$\w.]+\s+[-+$\w.]+\s+[-+$\w.]+\s+(?:m|km|mi|ft)\b`,
        ],
      },
    } as IPluginVisualization

    expect(
      getVisualizationsByCommand('FT.SEARCH idx "*"', [geodataVisualization]),
    ).toHaveLength(0)
    expect(
      getVisualizationsByCommand(
        'FT.SEARCH idx "@coords:[2.34 48.86 1000 km]"',
        [geodataVisualization],
      ),
    ).toHaveLength(1)
    expect(
      getVisualizationsByCommand('FT.AGGREGATE idx "*" LOAD 1 @coords', [
        geodataVisualization,
      ]),
    ).toHaveLength(0)
    expect(
      getVisualizationsByCommand(
        'FT.SEARCH idx * GEOFILTER coords 2.34 48.86 1000 km',
        [geodataVisualization],
      ),
    ).toHaveLength(1)
  })

  it('ignores invalid query predicate regexes without throwing', () => {
    const invalidVisualization = {
      matchCommands: ['FT.SEARCH'],
      matchQuery: {
        anyRegex: ['['],
      },
    } as IPluginVisualization

    expect(() =>
      getVisualizationsByCommand(
        'FT.SEARCH idx "@coords:[2.34 48.86 1000 km]"',
        [invalidVisualization],
      ),
    ).not.toThrow()
    expect(
      getVisualizationsByCommand(
        'FT.SEARCH idx "@coords:[2.34 48.86 1000 km]"',
        [invalidVisualization],
      ),
    ).toHaveLength(0)
  })

  it('ignores invalid command regexes without throwing', () => {
    const invalidCommandVisualization = {
      matchCommands: ['FT.SEARCH', '['],
    } as IPluginVisualization

    expect(() =>
      getVisualizationsByCommand('FT.AGGREGATE idx "*"', [
        invalidCommandVisualization,
      ]),
    ).not.toThrow()
    expect(
      getVisualizationsByCommand('FT.AGGREGATE idx "*"', [
        invalidCommandVisualization,
      ]),
    ).toHaveLength(0)
  })

  it('does not run query predicate regexes against oversized queries', () => {
    const geodataVisualization = {
      matchCommands: ['FT.SEARCH'],
      matchQuery: {
        anyRegex: [
          String.raw`@[A-Za-z0-9_.$:-]{1,128}:\[\s*[-+$A-Za-z0-9_.]{1,128}\s+[-+$A-Za-z0-9_.]{1,128}\s+[-+$A-Za-z0-9_.]{1,128}\s+(?:m|km|mi|ft)\s*\]`,
        ],
      },
    } as IPluginVisualization

    const oversizedQuery = `FT.SEARCH idx "${'a'.repeat(1025)} @coords:[2.34 48.86 1000 km]"`

    expect(
      getVisualizationsByCommand(oversizedQuery, [geodataVisualization]),
    ).toHaveLength(0)
  })

  it('matches bounded geodata query predicate regexes', () => {
    const geodataVisualization = {
      matchCommands: ['FT.SEARCH', 'FT.AGGREGATE', 'FT.HYBRID'],
      matchQuery: {
        anyRegex: [
          String.raw`@[A-Za-z0-9_.$:-]{1,128}:\[\s*[-+$A-Za-z0-9_.]{1,128}\s+[-+$A-Za-z0-9_.]{1,128}\s+[-+$A-Za-z0-9_.]{1,128}\s+(?:m|km|mi|ft)\s*\]`,
          String.raw`\bGEOFILTER\s+[A-Za-z0-9_.$:-]{1,128}\s+[-+$A-Za-z0-9_.]{1,128}\s+[-+$A-Za-z0-9_.]{1,128}\s+[-+$A-Za-z0-9_.]{1,128}\s+(?:m|km|mi|ft)\b`,
          String.raw`@[A-Za-z0-9_.$:-]{1,128}:\[\s*(?:WITHIN|CONTAINS|INTERSECTS|DISJOINT)\s+[^\]]{1,2048}\]`,
        ],
      },
    } as IPluginVisualization

    expect(
      getVisualizationsByCommand(
        'FT.SEARCH idx "@coords:[2.34 48.86 1000 km]"',
        [geodataVisualization],
      ),
    ).toHaveLength(1)
    expect(
      getVisualizationsByCommand(
        'FT.SEARCH idx * GEOFILTER coords 2.34 48.86 1000 km',
        [geodataVisualization],
      ),
    ).toHaveLength(1)
    expect(
      getVisualizationsByCommand(
        'FT.SEARCH idx "@geom:[CONTAINS $shape]" PARAMS 2 shape "POINT (2 2)"',
        [geodataVisualization],
      ),
    ).toHaveLength(1)
  })
})
