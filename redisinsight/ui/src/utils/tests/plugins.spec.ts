import { getVisualizationsByCommand } from 'uiSrc/utils'
import { IPluginVisualization } from 'uiSrc/slices/interfaces'

describe('getVisualizationsByCommand', () => {
  const boundedGeoRadiusRegex =
    String.raw`@[A-Za-z0-9_.$:-]{1,128}:\[\s*` +
    String.raw`[-+$A-Za-z0-9_.]{1,128}\s+` +
    String.raw`[-+$A-Za-z0-9_.]{1,128}\s+` +
    String.raw`[-+$A-Za-z0-9_.]{1,128}\s+(?:m|km|mi|ft)\s*\]`

  const boundedGeoFilterRegex =
    String.raw`\bGEOFILTER\s+[A-Za-z0-9_.$:-]{1,128}\s+` +
    String.raw`[-+$A-Za-z0-9_.]{1,128}\s+` +
    String.raw`[-+$A-Za-z0-9_.]{1,128}\s+` +
    String.raw`[-+$A-Za-z0-9_.]{1,128}\s+(?:m|km|mi|ft)\b`
  const redisTokenRegex = String.raw`(?:"[^"]{0,512}"|'[^']{0,512}'|\S{1,512})`
  const nativeWithCoordRegex =
    String.raw`(?:\bGEOSEARCH\b\s+${redisTokenRegex}\s+` +
    String.raw`(?:FROMLONLAT\s+${redisTokenRegex}\s+${redisTokenRegex}|FROMMEMBER\s+${redisTokenRegex})\s+` +
    String.raw`(?:BYRADIUS\s+${redisTokenRegex}\s+${redisTokenRegex}|BYBOX\s+${redisTokenRegex}\s+${redisTokenRegex}\s+${redisTokenRegex})|` +
    String.raw`\bGEORADIUS(?:_RO)?\b\s+${redisTokenRegex}\s+${redisTokenRegex}\s+${redisTokenRegex}\s+${redisTokenRegex}\s+${redisTokenRegex}|` +
    String.raw`\bGEORADIUSBYMEMBER(?:_RO)?\b\s+${redisTokenRegex}\s+${redisTokenRegex}\s+${redisTokenRegex}\s+${redisTokenRegex})` +
    String.raw`\s+[\s\S]{0,4096}\bWITHCOORD\b`

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

  it('matches literal command tokens without prefix bleed', () => {
    const visualizations = [
      { matchCommands: ['GEOSEARCH'], id: 'geo-search' },
      { matchCommands: ['FT.SEARCH'], id: 'ft-search' },
      { matchCommands: ['ft.*'], id: 'ft-wildcard' },
    ] as IPluginVisualization[]

    expect(
      getVisualizationsByCommand(
        'GEOSEARCHSTORE dst src BYRADIUS 1 km',
        visualizations,
      ).map((view) => view.id),
    ).toEqual([])
    expect(
      getVisualizationsByCommand('FT.SEARCHX idx "*"', visualizations).map(
        (view) => view.id,
      ),
    ).toEqual(['ft-wildcard'])
    expect(
      getVisualizationsByCommand('FTASEARCH idx "*"', visualizations).map(
        (view) => view.id,
      ),
    ).toEqual([])
    expect(
      getVisualizationsByCommand('FT.SEARCH idx "*"', visualizations).map(
        (view) => view.id,
      ),
    ).toEqual(['ft-search', 'ft-wildcard'])
  })

  it('supports negative query predicates', () => {
    const visualizations = [
      {
        id: 'with-coord',
        matchCommands: ['GEOSEARCH'],
        matchQuery: { anyRegex: [String.raw`\bWITHCOORD\b`] },
      },
      {
        id: 'without-coord',
        matchCommands: ['GEOSEARCH'],
        matchQuery: { noneRegex: [nativeWithCoordRegex] },
      },
    ] as IPluginVisualization[]

    expect(
      getVisualizationsByCommand(
        'GEOSEARCH Sicily FROMLONLAT 15 37 BYRADIUS 300 km WITHCOORD',
        visualizations,
      ).map((view) => view.id),
    ).toEqual(['with-coord'])
    expect(
      getVisualizationsByCommand(
        'GEOSEARCH Sicily FROMLONLAT 15 37 BYRADIUS 300 km',
        visualizations,
      ).map((view) => view.id),
    ).toEqual(['without-coord'])
  })

  it('selects one geodata default per GEO command shape', () => {
    const views = [
      {
        id: 'ri-geodata-map',
        matchCommands: ['GEOSEARCH'],
        matchQuery: { anyRegex: [nativeWithCoordRegex] },
        default: true,
      },
      {
        id: 'ri-geodata-heatmap',
        matchCommands: ['GEOSEARCH'],
        matchQuery: { anyRegex: [nativeWithCoordRegex] },
        default: false,
      },
      {
        id: 'ri-geodata-inspector',
        matchCommands: [
          'GEOADD',
          'GEODIST',
          'GEOHASH',
          'GEOPOS',
          'GEOSEARCHSTORE',
        ],
        default: true,
      },
      {
        id: 'ri-geodata-search-inspector',
        matchCommands: [
          'GEOSEARCH',
          'GEORADIUS',
          'GEORADIUS_RO',
          'GEORADIUSBYMEMBER',
          'GEORADIUSBYMEMBER_RO',
        ],
        matchQuery: { noneRegex: [nativeWithCoordRegex] },
        default: true,
      },
      {
        id: 'ri-geodata-coordinate-inspector',
        matchCommands: [
          'GEOSEARCH',
          'GEORADIUS',
          'GEORADIUS_RO',
          'GEORADIUSBYMEMBER',
          'GEORADIUSBYMEMBER_RO',
        ],
        matchQuery: { anyRegex: [nativeWithCoordRegex] },
        default: false,
      },
    ] as IPluginVisualization[]

    const defaultsFor = (query: string) =>
      getVisualizationsByCommand(query, views)
        .filter((view) => view.default)
        .map((view) => view.id)

    expect(
      defaultsFor(
        'GEOSEARCH Sicily FROMLONLAT 15 37 BYRADIUS 300 km WITHCOORD',
      ),
    ).toEqual(['ri-geodata-map'])
    expect(
      defaultsFor('GEOSEARCH Sicily FROMLONLAT 15 37 BYRADIUS 300 km'),
    ).toEqual(['ri-geodata-search-inspector'])
    expect(
      defaultsFor('GEOSEARCH WITHCOORD FROMLONLAT 15 37 BYRADIUS 300 km'),
    ).toEqual(['ri-geodata-search-inspector'])
    expect(defaultsFor('GEODIST Sicily Palermo Catania km')).toEqual([
      'ri-geodata-inspector',
    ])
    expect(
      defaultsFor(
        'GEOSEARCHSTORE Nearby Sicily FROMLONLAT 15 37 BYRADIUS 300 km STOREDIST',
      ),
    ).toEqual(['ri-geodata-inspector'])
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

  it('matches query predicates before oversized PARAMS payloads', () => {
    const geodataVisualization = {
      matchCommands: ['FT.SEARCH'],
      matchQuery: {
        anyRegex: [boundedGeoRadiusRegex],
      },
    } as IPluginVisualization

    const oversizedHybridQuery =
      'FT.SEARCH idx "@coords:[2.34 48.86 1000 km]=>[KNN 3 @embedding $vec]" ' +
      `PARAMS 2 vec "${'a'.repeat(20_001)}" DIALECT 2`

    expect(
      getVisualizationsByCommand(oversizedHybridQuery, [geodataVisualization]),
    ).toHaveLength(1)
  })

  it('only scans a bounded query prefix for predicates', () => {
    const geodataVisualization = {
      matchCommands: ['FT.SEARCH'],
      matchQuery: {
        anyRegex: [boundedGeoRadiusRegex],
      },
    } as IPluginVisualization

    const queryWithLateGeoPredicate = `FT.SEARCH idx "${'a'.repeat(20_001)} @coords:[2.34 48.86 1000 km]"`

    expect(
      getVisualizationsByCommand(queryWithLateGeoPredicate, [
        geodataVisualization,
      ]),
    ).toHaveLength(0)
  })

  it('matches bounded geodata query predicate regexes', () => {
    const geodataVisualization = {
      matchCommands: ['FT.SEARCH', 'FT.AGGREGATE', 'FT.HYBRID'],
      matchQuery: {
        anyRegex: [
          boundedGeoRadiusRegex,
          boundedGeoFilterRegex,
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
