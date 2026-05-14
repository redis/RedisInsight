import {
  parseGeoCommand,
  parseGeoDistanceResult,
  parseGeoHashResults,
  parseGeoPositionResults,
  parseGeoSearchResults,
  parseIntegerResult,
  parseSearchParams,
  tokenizeRedisCommand,
} from './geoParser'

describe('geoParser', () => {
  it('keeps quoted Redis command tokens intact', () => {
    expect(
      tokenizeRedisCommand(
        'GEOSEARCH "city data" FROMMEMBER "New York" BYRADIUS 10 km WITHCOORD',
      ),
    ).toEqual([
      'GEOSEARCH',
      'city data',
      'FROMMEMBER',
      'New York',
      'BYRADIUS',
      '10',
      'km',
      'WITHCOORD',
    ])
  })

  it('parses every Redis GEO command family', () => {
    expect(parseGeoCommand('GEOADD Sicily NX 13.361389 38.115556 Palermo')).toMatchObject({
      ok: true,
      value: {
        command: 'GEOADD',
        kind: 'addSummary',
        key: 'Sicily',
        addOptions: ['NX'],
        points: [{ lon: 13.361389, lat: 38.115556, member: 'Palermo' }],
      },
    })

    expect(parseGeoCommand('GEODIST Sicily Palermo Catania km')).toMatchObject({
      ok: true,
      value: {
        command: 'GEODIST',
        kind: 'distance',
        key: 'Sicily',
        members: ['Palermo', 'Catania'],
        unit: 'km',
      },
    })

    expect(parseGeoCommand('GEOHASH Sicily Palermo Catania')).toMatchObject({
      ok: true,
      value: {
        command: 'GEOHASH',
        kind: 'hashList',
        members: ['Palermo', 'Catania'],
      },
    })

    expect(parseGeoCommand('GEOPOS Sicily Palermo Missing')).toMatchObject({
      ok: true,
      value: {
        command: 'GEOPOS',
        kind: 'pointList',
        members: ['Palermo', 'Missing'],
      },
    })

    expect(
      parseGeoCommand('GEOSEARCH Sicily FROMLONLAT 0 0 BYBOX 20 10 km WITHCOORD WITHDIST WITHHASH'),
    ).toMatchObject({
      ok: true,
      value: {
        command: 'GEOSEARCH',
        kind: 'searchResults',
        key: 'Sicily',
        centerLon: 0,
        centerLat: 0,
        boxWidth: 20,
        boxHeight: 10,
        searchType: 'box',
        withCoord: true,
        withDist: true,
        withHash: true,
      },
    })

    expect(
      parseGeoCommand('GEOSEARCHSTORE Nearby Sicily FROMMEMBER Palermo BYRADIUS 300 km STOREDIST'),
    ).toMatchObject({
      ok: true,
      value: {
        command: 'GEOSEARCHSTORE',
        kind: 'storeSummary',
        destinationKey: 'Nearby',
        key: 'Sicily',
        memberName: 'Palermo',
        storeDist: true,
      },
    })
  })

  it('parses read-only legacy radius commands and store variants', () => {
    expect(parseGeoCommand('GEORADIUS_RO Sicily 15 37 100 km WITHCOORD')).toMatchObject({
      ok: true,
      value: {
        command: 'GEORADIUS_RO',
        kind: 'searchResults',
        centerLon: 15,
        centerLat: 37,
        radius: 100,
        withCoord: true,
      },
    })

    expect(parseGeoCommand('GEORADIUSBYMEMBER Sicily Palermo 100 km STOREDIST Nearby')).toMatchObject({
      ok: true,
      value: {
        command: 'GEORADIUSBYMEMBER',
        kind: 'storeSummary',
        memberName: 'Palermo',
        storeDistKey: 'Nearby',
      },
    })
  })

  it('requires WITHCOORD for map search params', () => {
    expect(parseSearchParams('GEOSEARCH Sicily FROMLONLAT 15 37 BYRADIUS 300 km')).toEqual({
      ok: false,
      error: 'Geo map visualizations require WITHCOORD in the Redis command.',
    })
  })

  it('parses geo search rows with distance hash and zero coordinates', () => {
    const command = parseGeoCommand(
      'GEOSEARCH Sicily FROMLONLAT 15 37 BYRADIUS 300 km WITHDIST WITHHASH WITHCOORD',
    )

    expect(command.ok && parseGeoSearchResults([['Null Island', '0', 123, ['0', '0']]], command.value)).toEqual({
      ok: true,
      value: [
        {
          name: 'Null Island',
          distance: 0,
          hash: 123,
          lon: 0,
          lat: 0,
        },
      ],
    })
  })

  it('parses command-specific scalar and tabular responses', () => {
    const geoPos = parseGeoCommand('GEOPOS Sicily Palermo Missing')
    const geoHash = parseGeoCommand('GEOHASH Sicily Palermo Catania')
    const geoDist = parseGeoCommand('GEODIST Sicily Palermo Catania km')
    const geoAdd = parseGeoCommand('GEOADD Sicily 13.361389 38.115556 Palermo')

    expect(geoPos.ok && parseGeoPositionResults([['13.361389', '38.115556'], null], geoPos.value)).toEqual({
      ok: true,
      value: [
        { member: 'Palermo', lon: 13.361389, lat: 38.115556, missing: false },
        { member: 'Missing', missing: true },
      ],
    })
    expect(geoHash.ok && parseGeoHashResults(['sqc8b49rny0', 'sqdtr74hyu0'], geoHash.value)).toMatchObject({
      ok: true,
      value: [
        { member: 'Palermo', hash: 'sqc8b49rny0' },
        { member: 'Catania', hash: 'sqdtr74hyu0' },
      ],
    })
    expect(geoDist.ok && parseGeoDistanceResult('166.2742', geoDist.value)).toEqual({
      ok: true,
      value: { distance: 166.2742, unit: 'km' },
    })
    expect(geoAdd.ok && parseIntegerResult(1, geoAdd.value)).toEqual({
      ok: true,
      value: { count: 1, label: 'items added' },
    })
  })
})
