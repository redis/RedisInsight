import {
  parseRqeGeoCommand,
  parseRqeGeoResults,
  parseWktGeometry,
} from './rqeGeoParser'

const unwrapCommand = (command: string) => {
  const parsed = parseRqeGeoCommand(command)
  if (!parsed.ok) {
    throw new Error(parsed.error)
  }
  return parsed.value
}

describe('rqeGeoParser', () => {
  it('parses FT.SEARCH GEO radius filters', () => {
    expect(
      parseRqeGeoCommand(
        'FT.SEARCH cities "@coords:[2.34 48.86 1000 km]" RETURN 1 coords',
      ),
    ).toMatchObject({
      ok: true,
      value: {
        command: 'FT.SEARCH',
        index: 'cities',
        kind: 'pointRadius',
        geoField: 'coords',
        overlay: {
          type: 'radius',
          lon: 2.34,
          lat: 48.86,
          radius: 1000,
          unit: 'km',
        },
      },
    })
  })

  it('parses legacy FT.SEARCH GEOFILTER options', () => {
    expect(
      parseRqeGeoCommand(
        'FT.SEARCH idx * GEOFILTER coords 2.34 48.86 1000 km',
      ),
    ).toMatchObject({
      ok: true,
      value: {
        command: 'FT.SEARCH',
        index: 'idx',
        kind: 'pointRadius',
        geoField: 'coords',
        overlay: {
          type: 'radius',
          source: 'geofilter',
          lon: 2.34,
          lat: 48.86,
          radius: 1000,
          unit: 'km',
        },
      },
    })
  })

  it('converts supported radius units to kilometers', () => {
    expect(
      unwrapCommand('FT.SEARCH idx "@coords:[2.34 48.86 1000 m]"').overlay,
    ).toMatchObject({ radiusKm: 1, unit: 'm' })
    expect(
      unwrapCommand('FT.SEARCH idx "@coords:[2.34 48.86 2 mi]"').overlay,
    ).toMatchObject({ radiusKm: 3.21868, unit: 'mi' })
    const feetOverlay = unwrapCommand(
      'FT.SEARCH idx "@coords:[2.34 48.86 1000 ft]"',
    ).overlay
    expect(feetOverlay).toMatchObject({ type: 'radius', unit: 'ft' })
    if (feetOverlay.type !== 'radius') {
      throw new Error('Expected radius overlay')
    }
    expect(feetOverlay.radiusKm).toBeCloseTo(0.3048)
  })

  it('substitutes PARAMS in FT.AGGREGATE GEO filters', () => {
    expect(
      parseRqeGeoCommand(
        'FT.AGGREGATE idx "@coords:[$lon $lat $radius km]" PARAMS 6 lon 2.34 lat 48.86 radius 1000 LOAD 1 @coords',
      ),
    ).toMatchObject({
      ok: true,
      value: {
        command: 'FT.AGGREGATE',
        index: 'idx',
        kind: 'pointRadius',
        geoField: 'coords',
        overlay: {
          lon: 2.34,
          lat: 48.86,
          radius: 1000,
          unit: 'km',
        },
      },
    })
  })

  it('parses FT.HYBRID SEARCH geo filters', () => {
    expect(
      parseRqeGeoCommand(
        'FT.HYBRID idx SEARCH "@coords:[2.34 48.86 1000 km]" VSIM @embedding $vec LOAD 1 coords PARAMS 2 vec blob',
      ),
    ).toMatchObject({
      ok: true,
      value: {
        command: 'FT.HYBRID',
        index: 'idx',
        kind: 'pointRadius',
        geoField: 'coords',
      },
    })
  })

  it('parses FT.HYBRID FILTER geo filters', () => {
    expect(
      parseRqeGeoCommand(
        'FT.HYBRID idx VSIM @embedding $vec FILTER "@coords:[2.34 48.86 1000 km]" LOAD 1 coords PARAMS 2 vec blob',
      ),
    ).toMatchObject({
      ok: true,
      value: {
        command: 'FT.HYBRID',
        index: 'idx',
        kind: 'pointRadius',
        geoField: 'coords',
      },
    })
  })

  it('parses GEOSHAPE point and polygon predicates', () => {
    expect(
      parseRqeGeoCommand(
        'FT.SEARCH idx "@geom:[CONTAINS $shape]" PARAMS 2 shape "POINT (2 2)" DIALECT 3',
      ),
    ).toMatchObject({
      ok: true,
      value: {
        command: 'FT.SEARCH',
        kind: 'shape',
        geoField: 'geom',
        overlay: {
          type: 'shape',
          operation: 'CONTAINS',
          geometry: { type: 'point', lon: 2, lat: 2 },
        },
      },
    })

    expect(
      parseRqeGeoCommand(
        'FT.SEARCH idx "@geom:[WITHIN $shape]" PARAMS 2 shape "POLYGON ((1 1, 1 3, 3 3, 1 1))" DIALECT 3',
      ),
    ).toMatchObject({
      ok: true,
      value: {
        kind: 'shape',
        geoField: 'geom',
        overlay: {
          type: 'shape',
          operation: 'WITHIN',
          geometry: {
            type: 'polygon',
            rings: [
              [
                { lon: 1, lat: 1 },
                { lon: 1, lat: 3 },
                { lon: 3, lat: 3 },
                { lon: 1, lat: 1 },
              ],
            ],
          },
        },
      },
    })
  })

  it('parses WKT polygons with holes', () => {
    expect(
      parseWktGeometry(
        'POLYGON ((0 0, 4 0, 4 4, 0 0), (1 1, 2 1, 1 1))',
      ),
    ).toEqual({
      ok: true,
      value: {
        type: 'polygon',
        rings: [
          [
            { lon: 0, lat: 0 },
            { lon: 4, lat: 0 },
            { lon: 4, lat: 4 },
            { lon: 0, lat: 0 },
          ],
          [
            { lon: 1, lat: 1 },
            { lon: 2, lat: 1 },
            { lon: 1, lat: 1 },
          ],
        ],
      },
    })
  })

  it('rejects malformed RQE geo predicates', () => {
    expect(parseRqeGeoCommand('')).toEqual({
      ok: false,
      error: 'Missing Redis Query Engine command.',
    })
    expect(parseRqeGeoCommand('FT.INFO idx')).toEqual({
      ok: false,
      error: 'Unsupported Redis Query Engine command: FT.INFO.',
    })
    expect(parseRqeGeoCommand('FT.SEARCH')).toEqual({
      ok: false,
      error: 'FT.SEARCH requires an index.',
    })
    expect(
      parseRqeGeoCommand(
        'FT.SEARCH idx "@coords:[$lon 48.86 1000 km]" PARAMS bad lon 2.34',
      ),
    ).toEqual({
      ok: false,
      error: 'Invalid longitude: $lon.',
    })
    expect(
      parseRqeGeoCommand('FT.SEARCH idx "@coords:[2.34 nope 1000 km]"'),
    ).toEqual({
      ok: false,
      error: 'Invalid latitude: nope.',
    })
    expect(
      parseRqeGeoCommand('FT.SEARCH idx "@coords:[2.34 48.86 wide km]"'),
    ).toEqual({
      ok: false,
      error: 'Invalid radius: wide.',
    })
    expect(
      parseRqeGeoCommand('FT.SEARCH idx * GEOFILTER coords 2.34 48.86 1000 yd'),
    ).toEqual({
      ok: false,
      error: 'Unsupported GEO unit: yd.',
    })
    expect(
      parseRqeGeoCommand('FT.SEARCH idx * GEOFILTER coords 2.34 48.86'),
    ).toEqual({
      ok: false,
      error: 'GEOFILTER requires field longitude latitude radius unit.',
    })
  })

  it('rejects malformed WKT polygons', () => {
    expect(parseWktGeometry('POLYGON (0 0, 1 1)')).toEqual({
      ok: false,
      error: 'Invalid POLYGON WKT.',
    })
    expect(parseWktGeometry('POLYGON ((0 0, bad 1, 0 0))')).toEqual({
      ok: false,
      error: 'Invalid POLYGON coordinates.',
    })
  })

  it('normalizes FT.SEARCH point rows from returned fields', () => {
    const command = unwrapCommand(
      'FT.SEARCH cities "@coords:[2.34 48.86 1000 km]" RETURN 1 coords',
    )

    expect(
      parseRqeGeoResults(
        [2, 'city:1', ['name', 'Paris', 'coords', '2.34,48.86'], 'city:2', ['coords', '3.1,49.2']],
        command,
      ),
    ).toMatchObject({
      ok: true,
      value: {
        points: [
          { id: 'city:1', name: 'Paris', field: 'coords', lon: 2.34, lat: 48.86 },
          { id: 'city:2', name: 'city:2', field: 'coords', lon: 3.1, lat: 49.2 },
        ],
        shapes: [],
      },
    })
  })

  it('normalizes FT.AGGREGATE and cursor point rows', () => {
    const command = unwrapCommand(
      'FT.AGGREGATE idx "@coords:[$lon $lat $radius km]" PARAMS 6 lon 2.34 lat 48.86 radius 1000 LOAD 1 @coords',
    )

    expect(
      parseRqeGeoResults([[1, ['name', 'Paris', 'coords', '2.34,48.86']], 0], command),
    ).toMatchObject({
      ok: true,
      value: {
        points: [
          { id: 'row-1', name: 'Paris', field: 'coords', lon: 2.34, lat: 48.86 },
        ],
      },
    })
  })

  it('normalizes JSON array coordinate fields', () => {
    const command = unwrapCommand(
      'FT.SEARCH cities "@coords:[2.34 48.86 1000 km]" RETURN 1 coords',
    )

    expect(
      parseRqeGeoResults([1, 'city:1', ['coords', '["2.34,48.86","3.1,49.2"]']], command),
    ).toMatchObject({
      ok: true,
      value: {
        points: [
          { id: 'city:1', field: 'coords', lon: 2.34, lat: 48.86 },
          { id: 'city:1#2', field: 'coords', lon: 3.1, lat: 49.2 },
        ],
      },
    })
  })

  it('normalizes nested and numeric array coordinate fields', () => {
    const command = unwrapCommand(
      'FT.SEARCH cities "@coords:[2.34 48.86 1000 km]" RETURN 1 coords',
    )

    expect(
      parseRqeGeoResults(
        [
          2,
          'city:1',
          ['coords', [2.34, 48.86]],
          'city:2',
          ['coords', [[3.1, 49.2], ['4.2,50.3']]],
        ],
        command,
      ),
    ).toMatchObject({
      ok: true,
      value: {
        points: [
          { id: 'city:1', field: 'coords', lon: 2.34, lat: 48.86 },
          { id: 'city:2', field: 'coords', lon: 3.1, lat: 49.2 },
          { id: 'city:2#2', field: 'coords', lon: 4.2, lat: 50.3 },
        ],
      },
    })
  })

  it('uses fallback returned fields when the queried point field is not returned', () => {
    const command = unwrapCommand(
      'FT.SEARCH cities "@coords:[2.34 48.86 1000 km]" RETURN 1 other',
    )

    expect(
      parseRqeGeoResults([1, 'city:1', ['other', '2.34,48.86']], command),
    ).toMatchObject({
      ok: true,
      value: {
        points: [
          { id: 'city:1', field: 'other', lon: 2.34, lat: 48.86 },
        ],
      },
    })
  })

  it('normalizes FT.HYBRID search-like and aggregate-like rows', () => {
    const command = unwrapCommand(
      'FT.HYBRID idx SEARCH "@coords:[2.34 48.86 1000 km]" VSIM @embedding $vec LOAD 1 coords PARAMS 2 vec blob',
    )

    expect(
      parseRqeGeoResults([1, 'city:1', ['coords', '2.34,48.86']], command),
    ).toMatchObject({
      ok: true,
      value: {
        points: [
          { id: 'city:1', field: 'coords', lon: 2.34, lat: 48.86 },
        ],
      },
    })
    expect(
      parseRqeGeoResults([1, ['coords', '3.1,49.2']], command),
    ).toMatchObject({
      ok: true,
      value: {
        points: [
          { id: 'row-1', field: 'coords', lon: 3.1, lat: 49.2 },
        ],
      },
    })
  })

  it('normalizes returned WKT shapes', () => {
    const command = unwrapCommand(
      'FT.SEARCH idx "@geom:[CONTAINS $shape]" PARAMS 2 shape "POINT (2 2)" RETURN 1 geom DIALECT 3',
    )

    expect(
      parseRqeGeoResults(
        [1, 'shape:1', ['name', 'Zone', 'geom', 'POLYGON ((1 1, 1 3, 3 3, 1 1))']],
        command,
      ),
    ).toMatchObject({
      ok: true,
      value: {
        points: [],
        shapes: [
          {
            id: 'shape:1',
            name: 'Zone',
            field: 'geom',
            geometry: { type: 'polygon' },
          },
        ],
      },
    })
  })

  it('uses fallback returned fields for WKT shapes', () => {
    const command = unwrapCommand(
      'FT.SEARCH idx "@geom:[CONTAINS $shape]" PARAMS 2 shape "POINT (2 2)" RETURN 1 other DIALECT 3',
    )

    expect(
      parseRqeGeoResults(
        [1, 'shape:1', ['other', 'POINT (4 5)']],
        command,
      ),
    ).toMatchObject({
      ok: true,
      value: {
        shapes: [
          {
            id: 'shape:1',
            field: 'other',
            geometry: { type: 'point', lon: 4, lat: 5 },
          },
        ],
      },
    })
  })

  it('skips non-geospatial returned fields before returning guidance', () => {
    const pointCommand = unwrapCommand(
      'FT.SEARCH idx "@coords:[2.34 48.86 1000 km]"',
    )
    const shapeCommand = unwrapCommand(
      'FT.SEARCH idx "@geom:[CONTAINS $shape]" PARAMS 2 shape "POINT (2 2)" DIALECT 3',
    )

    expect(parseRqeGeoResults([1, 'city:1', ['coords', 42]], pointCommand)).toEqual({
      ok: false,
      error:
        'No returned geospatial fields found. Add RETURN 1 coords to the FT.SEARCH command.',
    })
    expect(parseRqeGeoResults([1, 'shape:1', ['other', 42]], shapeCommand)).toEqual({
      ok: false,
      error:
        'No returned geospatial fields found. Add RETURN 1 geom to the FT.SEARCH command.',
    })
    expect(parseRqeGeoResults([1, 'shape:1', ['geom', 42]], shapeCommand)).toEqual({
      ok: false,
      error:
        'No returned geospatial fields found. Add RETURN 1 geom to the FT.SEARCH command.',
    })
  })

  it('returns guidance when returned fields do not include geo data', () => {
    const searchCommand = unwrapCommand(
      'FT.SEARCH idx "@coords:[2.34 48.86 1000 km]"',
    )
    const aggregateCommand = unwrapCommand(
      'FT.AGGREGATE idx "@coords:[2.34 48.86 1000 km]"',
    )
    const hybridCommand = unwrapCommand(
      'FT.HYBRID idx SEARCH "@coords:[2.34 48.86 1000 km]" VSIM @embedding $vec LOAD 1 coords PARAMS 2 vec blob',
    )

    expect(parseRqeGeoResults([1, 'city:1', ['name', 'Paris']], searchCommand)).toEqual({
      ok: false,
      error:
        'No returned geospatial fields found. Add RETURN 1 coords to the FT.SEARCH command.',
    })
    expect(parseRqeGeoResults([1, ['name', 'Paris']], aggregateCommand)).toEqual({
      ok: false,
      error:
        'No returned geospatial fields found. Add LOAD 1 @coords to the FT.AGGREGATE command.',
    })
    expect(parseRqeGeoResults([1, ['name', 'Paris']], hybridCommand)).toEqual({
      ok: false,
      error:
        'No returned geospatial fields found. Add LOAD 1 coords to the FT.HYBRID command.',
    })
  })

  it('rejects malformed RQE responses and field rows', () => {
    const searchCommand = unwrapCommand(
      'FT.SEARCH idx "@coords:[2.34 48.86 1000 km]"',
    )
    const aggregateCommand = unwrapCommand(
      'FT.AGGREGATE idx "@coords:[2.34 48.86 1000 km]"',
    )

    expect(parseRqeGeoResults('not-array', searchCommand)).toEqual({
      ok: false,
      error: 'FT.SEARCH response must be an array.',
    })
    expect(parseRqeGeoResults([1, 'city:1', 'not-fields'], searchCommand)).toEqual({
      ok: false,
      error:
        'No returned geospatial fields found. Add RETURN 1 coords to the FT.SEARCH command.',
    })
    expect(parseRqeGeoResults([1, 'city:1', ['coords']], searchCommand)).toEqual({
      ok: false,
      error:
        'No returned geospatial fields found. Add RETURN 1 coords to the FT.SEARCH command.',
    })
    expect(parseRqeGeoResults([1, ['coords']], aggregateCommand)).toEqual({
      ok: false,
      error:
        'No returned geospatial fields found. Add LOAD 1 @coords to the FT.AGGREGATE command.',
    })
  })

  it('rejects unsupported RQE geo commands and malformed shapes', () => {
    expect(parseRqeGeoCommand('FT.SEARCH idx "*"')).toEqual({
      ok: false,
      error: 'No Redis Query Engine geospatial predicate found.',
    })
    expect(
      parseRqeGeoCommand(
        'FT.SEARCH idx "@geom:[WITHIN $shape]" PARAMS 2 shape "LINESTRING (0 0, 1 1)" DIALECT 3',
      ),
    ).toEqual({
      ok: false,
      error: 'Unsupported WKT geometry. Expected POINT or POLYGON.',
    })
  })
})
