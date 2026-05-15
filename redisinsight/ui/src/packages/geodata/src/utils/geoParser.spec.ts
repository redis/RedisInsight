import {
  getSearchMemberRows,
  isUnitToken,
  parseGeoCommand,
  parseGeoDistanceResult,
  parseGeoHashResults,
  parseGeoPositionResults,
  parseGeoSearchResults,
  parseIntegerResult,
  parseSearchParams,
  tokenizeRedisCommand,
} from './geoParser'
import { ParsedGeoCommand } from '../types'

const unwrapCommand = (command: string): ParsedGeoCommand => {
  const parsed = parseGeoCommand(command)
  if (!parsed.ok) {
    throw new Error(parsed.error)
  }

  return parsed.value
}

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

  it('keeps escaped whitespace inside tokens', () => {
    expect(tokenizeRedisCommand('GEOHASH Sicily New\\ York')).toEqual([
      'GEOHASH',
      'Sicily',
      'New York',
    ])
  })

  it('parses every Redis GEO command family', () => {
    expect(
      parseGeoCommand('GEOADD Sicily NX 13.361389 38.115556 Palermo'),
    ).toMatchObject({
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
      parseGeoCommand(
        'GEOSEARCH Sicily FROMLONLAT 0 0 BYBOX 20 10 km WITHCOORD WITHDIST WITHHASH',
      ),
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
      parseGeoCommand(
        'GEOSEARCHSTORE Nearby Sicily FROMMEMBER Palermo BYRADIUS 300 km STOREDIST',
      ),
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
    expect(
      parseGeoCommand('GEORADIUS_RO Sicily 15 37 100 km WITHCOORD'),
    ).toMatchObject({
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

    expect(
      parseGeoCommand(
        'GEORADIUSBYMEMBER Sicily Palermo 100 km STOREDIST Nearby',
      ),
    ).toMatchObject({
      ok: true,
      value: {
        command: 'GEORADIUSBYMEMBER',
        kind: 'storeSummary',
        memberName: 'Palermo',
        storeDistKey: 'Nearby',
      },
    })
  })

  it('parses radius units count and ordering options', () => {
    expect(
      parseGeoCommand(
        'GEOSEARCH Sicily FROMLONLAT 15 37 BYRADIUS 1000 m WITHCOORD COUNT 5 ANY DESC',
      ),
    ).toMatchObject({
      ok: true,
      value: {
        radius: 1,
        count: 5,
        isAnyCount: true,
        order: 'DESC',
      },
    })

    expect(
      parseGeoCommand('GEORADIUS Sicily 15 37 1 mi WITHCOORD STORE Nearby'),
    ).toMatchObject({
      ok: true,
      value: {
        kind: 'storeSummary',
        radius: 1.60934,
        storeKey: 'Nearby',
      },
    })

    const feetRadius = parseGeoCommand(
      'GEORADIUSBYMEMBER Sicily Palermo 1000 ft WITHCOORD ASC',
    )
    expect(feetRadius).toMatchObject({
      ok: true,
      value: {
        order: 'ASC',
      },
    })
    expect(feetRadius.ok && feetRadius.value.radius).toBeCloseTo(0.3048)

    expect(
      parseGeoCommand('GEORADIUSBYMEMBER Sicily Palermo 42 yards WITHCOORD'),
    ).toMatchObject({
      ok: true,
      value: {
        radius: 42,
      },
    })
  })

  it('returns clear parse errors for malformed commands', () => {
    expect(parseGeoCommand('')).toEqual({
      ok: false,
      error: 'Missing Redis command.',
    })
    expect(parseGeoCommand('PING')).toEqual({
      ok: false,
      error: 'Unsupported geo command: PING.',
    })
    expect(parseGeoCommand('GEOADD')).toEqual({
      ok: false,
      error: 'GEOADD requires a key.',
    })
    expect(parseGeoCommand('GEOADD Sicily')).toEqual({
      ok: false,
      error: 'GEOADD requires at least one point.',
    })
    expect(parseGeoCommand('GEOADD Sicily 13.3 nope Palermo')).toEqual({
      ok: false,
      error: 'Invalid latitude: nope.',
    })
    expect(parseGeoCommand('GEOADD Sicily nope 38.1 Palermo')).toEqual({
      ok: false,
      error: 'Invalid longitude: nope.',
    })
    expect(parseGeoCommand('GEOADD Sicily 13.3 38.1')).toEqual({
      ok: false,
      error: 'GEOADD requires longitude latitude member triples.',
    })
    expect(parseGeoCommand('GEODIST Sicily Palermo')).toEqual({
      ok: false,
      error: 'GEODIST requires key member1 member2.',
    })
    expect(parseGeoCommand('GEOHASH')).toEqual({
      ok: false,
      error: 'GEOHASH requires a key.',
    })
    expect(parseGeoCommand('GEOSEARCH')).toEqual({
      ok: false,
      error: 'GEOSEARCH requires a key.',
    })
    expect(parseGeoCommand('GEOSEARCH Sicily BYRADIUS 1 km')).toEqual({
      ok: false,
      error: 'GEOSEARCH requires FROMLONLAT or FROMMEMBER.',
    })
    expect(parseGeoCommand('GEOSEARCH Sicily FROMLONLAT 15 37')).toEqual({
      ok: false,
      error: 'GEOSEARCH requires BYRADIUS or BYBOX.',
    })
    expect(
      parseGeoCommand('GEOSEARCH Sicily FROMLONLAT 15 nope BYRADIUS 1 km'),
    ).toEqual({
      ok: false,
      error: 'Invalid latitude: nope.',
    })
    expect(
      parseGeoCommand('GEOSEARCH Sicily FROMLONLAT nope 37 BYRADIUS 1 km'),
    ).toEqual({
      ok: false,
      error: 'Invalid longitude: nope.',
    })
    expect(
      parseGeoCommand('GEOSEARCH Sicily FROMLONLAT 15 37 BYRADIUS bad km'),
    ).toEqual({
      ok: false,
      error: 'Invalid radius: bad.',
    })
    expect(
      parseGeoCommand('GEOSEARCH Sicily FROMLONLAT 15 37 BYBOX nope 10 km'),
    ).toEqual({
      ok: false,
      error: 'Invalid box width: nope.',
    })
    expect(
      parseGeoCommand('GEOSEARCH Sicily FROMLONLAT 15 37 BYBOX 10 nope km'),
    ).toEqual({
      ok: false,
      error: 'Invalid box height: nope.',
    })
    expect(parseGeoCommand('GEOSEARCHSTORE Nearby')).toEqual({
      ok: false,
      error: 'GEOSEARCHSTORE requires destination and source keys.',
    })
    expect(parseGeoCommand('GEORADIUS')).toEqual({
      ok: false,
      error: 'GEORADIUS requires a key.',
    })
    expect(parseGeoCommand('GEORADIUS Sicily nope 37 1 km')).toEqual({
      ok: false,
      error: 'Invalid longitude: nope.',
    })
    expect(parseGeoCommand('GEORADIUS Sicily 15 nope 1 km')).toEqual({
      ok: false,
      error: 'Invalid latitude: nope.',
    })
    expect(parseGeoCommand('GEORADIUS Sicily 15 37')).toEqual({
      ok: false,
      error: 'Missing radius.',
    })
    expect(parseGeoCommand('GEORADIUSBYMEMBER Sicily')).toEqual({
      ok: false,
      error: 'GEORADIUSBYMEMBER requires key and member.',
    })
    expect(parseGeoCommand('GEORADIUSBYMEMBER Sicily Palermo nope km')).toEqual(
      {
        ok: false,
        error: 'Invalid radius: nope.',
      },
    )
  })

  it('requires WITHCOORD for map search params', () => {
    expect(
      parseSearchParams('GEOSEARCH Sicily FROMLONLAT 15 37 BYRADIUS 300 km'),
    ).toEqual({
      ok: false,
      error: 'Geo map visualizations require WITHCOORD in the Redis command.',
    })
  })

  it('rejects non-search commands as map search params', () => {
    expect(parseSearchParams('GEODIST Sicily Palermo Catania km')).toEqual({
      ok: false,
      error: 'GEODIST does not return coordinate search rows.',
    })
  })

  it('returns parse errors from map search params', () => {
    expect(parseSearchParams('PING')).toEqual({
      ok: false,
      error: 'Unsupported geo command: PING.',
    })
  })

  it('parses geo search rows with distance hash and zero coordinates', () => {
    const command = unwrapCommand(
      'GEOSEARCH Sicily FROMLONLAT 15 37 BYRADIUS 300 km WITHDIST WITHHASH WITHCOORD',
    )

    expect(
      parseGeoSearchResults([['Null Island', '0', 123, ['0', '0']]], command),
    ).toEqual({
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

  it('rejects malformed search result rows', () => {
    const withCoord = unwrapCommand(
      'GEOSEARCH Sicily FROMLONLAT 15 37 BYRADIUS 300 km WITHCOORD',
    )
    const withDist = unwrapCommand(
      'GEOSEARCH Sicily FROMLONLAT 15 37 BYRADIUS 300 km WITHDIST WITHCOORD',
    )
    const withDistHash = unwrapCommand(
      'GEOSEARCH Sicily FROMLONLAT 15 37 BYRADIUS 300 km WITHDIST WITHHASH WITHCOORD',
    )

    expect(parseGeoSearchResults('bad', withCoord)).toEqual({
      ok: false,
      error: 'Geo command response must be an array.',
    })
    expect(
      parseGeoSearchResults(
        [],
        unwrapCommand('GEOSEARCH Sicily FROMLONLAT 15 37 BYRADIUS 300 km'),
      ),
    ).toEqual({
      ok: false,
      error: 'Geo map visualizations require WITHCOORD in the Redis command.',
    })
    expect(parseGeoSearchResults([[]], withCoord)).toEqual({
      ok: false,
      error: 'Unsupported geo response row shape.',
    })
    expect(
      parseGeoSearchResults([['Palermo', 'bad', ['13', '38']]], withDist),
    ).toEqual({
      ok: false,
      error: 'Invalid distance for Palermo.',
    })
    expect(
      parseGeoSearchResults(
        [['Palermo', '1', 'bad', ['13', '38']]],
        withDistHash,
      ),
    ).toEqual({
      ok: false,
      error: 'Invalid geohash for Palermo.',
    })
    expect(
      parseGeoSearchResults([['Palermo', ['bad', '38']]], withCoord),
    ).toEqual({
      ok: false,
      error: 'Missing coordinates for Palermo.',
    })
  })

  it('parses command-specific scalar and tabular responses', () => {
    const geoPos = unwrapCommand('GEOPOS Sicily Palermo Missing')
    const geoHash = unwrapCommand('GEOHASH Sicily Palermo Catania')
    const geoDist = unwrapCommand('GEODIST Sicily Palermo Catania km')
    const geoAdd = unwrapCommand('GEOADD Sicily 13.361389 38.115556 Palermo')

    expect(
      parseGeoPositionResults([['13.361389', '38.115556'], null], geoPos),
    ).toEqual({
      ok: true,
      value: [
        { member: 'Palermo', lon: 13.361389, lat: 38.115556, missing: false },
        { member: 'Missing', missing: true },
      ],
    })
    expect(
      parseGeoHashResults(['sqc8b49rny0', 'sqdtr74hyu0'], geoHash),
    ).toMatchObject({
      ok: true,
      value: [
        { member: 'Palermo', hash: 'sqc8b49rny0' },
        { member: 'Catania', hash: 'sqdtr74hyu0' },
      ],
    })
    expect(parseGeoDistanceResult('166.2742', geoDist)).toEqual({
      ok: true,
      value: { distance: 166.2742, unit: 'km' },
    })
    expect(parseIntegerResult(1, geoAdd)).toEqual({
      ok: true,
      value: { count: 1, label: 'items added' },
    })
  })

  it('handles scalar parser fallbacks and invalid response shapes', () => {
    const geoPos = unwrapCommand('GEOPOS Sicily Palermo')
    const geoHash = unwrapCommand('GEOHASH Sicily Palermo Missing')
    const geoDist = unwrapCommand('GEODIST Sicily Palermo Missing')
    const geoAdd = unwrapCommand('GEOADD Sicily 13.361389 38.115556 Palermo')

    expect(parseGeoPositionResults('bad', geoPos)).toEqual({
      ok: false,
      error: 'GEOPOS response must be an array.',
    })
    expect(parseGeoPositionResults([[13.3, 'bad']], geoPos)).toEqual({
      ok: true,
      value: [{ member: 'Palermo', missing: true }],
    })
    expect(parseGeoHashResults('bad', geoHash)).toEqual({
      ok: false,
      error: 'GEOHASH response must be an array.',
    })
    expect(parseGeoHashResults(['hash', null], geoHash)).toEqual({
      ok: true,
      value: [
        { member: 'Palermo', hash: 'hash' },
        { member: 'Missing', hash: null },
      ],
    })
    expect(parseGeoDistanceResult(null, geoDist)).toEqual({
      ok: true,
      value: { distance: null, unit: 'm' },
    })
    expect(parseGeoDistanceResult('bad', geoDist)).toEqual({
      ok: false,
      error: 'GEODIST response must be numeric or null.',
    })
    expect(parseIntegerResult(1.5, geoAdd)).toEqual({
      ok: false,
      error: 'GEOADD response must be an integer.',
    })
  })

  it('extracts plain member rows and recognizes distance units', () => {
    expect(getSearchMemberRows('bad')).toEqual([])
    expect(getSearchMemberRows(['Palermo', ['Catania', '56.4']])).toEqual([
      'Palermo',
      'Catania',
    ])
    expect(isUnitToken('km')).toBe(true)
    expect(isUnitToken('yards')).toBe(false)
    expect(isUnitToken(undefined)).toBe(false)
  })
})
