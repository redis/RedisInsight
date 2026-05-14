import { MAP_WITHCOORD_ERROR } from '../constants'
import {
  GeoCommand,
  GeoDistanceResult,
  GeoHashResult,
  GeoIntegerResult,
  GeoPositionResult,
  GeoResult,
  ParseResult,
  ParsedGeoCommand,
} from '../types'

const GEO_COMMANDS = new Set<GeoCommand>([
  'GEOADD',
  'GEODIST',
  'GEOHASH',
  'GEOPOS',
  'GEORADIUS',
  'GEORADIUS_RO',
  'GEORADIUSBYMEMBER',
  'GEORADIUSBYMEMBER_RO',
  'GEOSEARCH',
  'GEOSEARCHSTORE',
])

const GEOADD_OPTIONS = new Set(['NX', 'XX', 'CH'])
const DISTANCE_UNITS = new Set(['M', 'KM', 'FT', 'MI'])

export const tokenizeRedisCommand = (command: string): string[] => {
  const tokens: string[] = []
  let current = ''
  let quote: '"' | "'" | null = null
  let isEscaped = false

  for (const char of command.trim()) {
    if (isEscaped) {
      current += char
      isEscaped = false
      continue
    }

    if (char === '\\') {
      isEscaped = true
      continue
    }

    if (quote) {
      if (char === quote) {
        quote = null
      } else {
        current += char
      }
      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      continue
    }

    if (/\s/.test(char)) {
      if (current.length > 0) {
        tokens.push(current)
        current = ''
      }
      continue
    }

    current += char
  }

  if (current.length > 0) {
    tokens.push(current)
  }

  return tokens
}

const parseNumber = (value: string | undefined, field: string): ParseResult<number> => {
  if (value === undefined) {
    return { ok: false, error: `Missing ${field}.` }
  }

  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return { ok: false, error: `Invalid ${field}: ${value}.` }
  }

  return { ok: true, value: parsed }
}

const convertToKm = (value: number, unit = 'km'): number => {
  const normalizedUnit = unit.toUpperCase()
  if (normalizedUnit === 'KM') {
    return value
  }
  if (normalizedUnit === 'M') {
    return value / 1000
  }
  if (normalizedUnit === 'MI') {
    return value * 1.60934
  }
  if (normalizedUnit === 'FT') {
    return value * 0.0003048
  }
  return value
}

const getUpperTokens = (tokens: string[]): string[] =>
  tokens.map((token) => token.toUpperCase())

const getFlags = (tokens: string[]) => {
  const upperTokens = getUpperTokens(tokens)
  return {
    withCoord: upperTokens.includes('WITHCOORD'),
    withDist: upperTokens.includes('WITHDIST'),
    withHash: upperTokens.includes('WITHHASH'),
  }
}

const getSearchOptions = (tokens: string[]) => {
  const upperTokens = getUpperTokens(tokens)
  const countIndex = upperTokens.indexOf('COUNT')
  const storeIndex = upperTokens.indexOf('STORE')
  const storeDistIndex = upperTokens.indexOf('STOREDIST')
  const ascIndex = upperTokens.indexOf('ASC')
  const descIndex = upperTokens.indexOf('DESC')
  const count = countIndex >= 0 ? Number(tokens[countIndex + 1]) : undefined

  return {
    ...getFlags(tokens),
    count: Number.isFinite(count) ? count : undefined,
    isAnyCount: upperTokens.includes('ANY'),
    order: ascIndex >= 0 ? 'ASC' as const : descIndex >= 0 ? 'DESC' as const : undefined,
    storeKey: storeIndex >= 0 ? tokens[storeIndex + 1] : undefined,
    storeDistKey: storeDistIndex >= 0 ? tokens[storeDistIndex + 1] : undefined,
    storeDist: storeDistIndex >= 0,
  }
}

const isGeoCommand = (command: string): command is GeoCommand =>
  GEO_COMMANDS.has(command as GeoCommand)

const createBaseCommand = (
  command: GeoCommand,
  tokens: string[],
): Pick<ParsedGeoCommand, 'command' | 'rawTokens' | 'searchType'> => ({
  command,
  rawTokens: tokens,
  searchType: 'unknown',
})

const parseGeoAdd = (
  command: GeoCommand,
  tokens: string[],
): ParseResult<ParsedGeoCommand> => {
  const key = tokens[1]
  if (!key) {
    return { ok: false, error: 'GEOADD requires a key.' }
  }

  const addOptions: string[] = []
  let index = 2
  while (GEOADD_OPTIONS.has(tokens[index]?.toUpperCase())) {
    addOptions.push(tokens[index].toUpperCase())
    index += 1
  }

  const points = []
  while (index < tokens.length) {
    const lon = parseNumber(tokens[index], 'longitude')
    if (!lon.ok) {
      return lon
    }

    const lat = parseNumber(tokens[index + 1], 'latitude')
    if (!lat.ok) {
      return lat
    }

    const member = tokens[index + 2]
    if (!member) {
      return { ok: false, error: 'GEOADD requires longitude latitude member triples.' }
    }

    points.push({ lon: lon.value, lat: lat.value, member })
    index += 3
  }

  if (points.length === 0) {
    return { ok: false, error: 'GEOADD requires at least one point.' }
  }

  return {
    ok: true,
    value: {
      ...createBaseCommand(command, tokens),
      kind: 'addSummary',
      key,
      addOptions,
      points,
    },
  }
}

const parseGeoDist = (
  command: GeoCommand,
  tokens: string[],
): ParseResult<ParsedGeoCommand> => {
  if (!tokens[1] || !tokens[2] || !tokens[3]) {
    return { ok: false, error: 'GEODIST requires key member1 member2.' }
  }

  return {
    ok: true,
    value: {
      ...createBaseCommand(command, tokens),
      kind: 'distance',
      key: tokens[1],
      members: [tokens[2], tokens[3]],
      unit: tokens[4] || 'm',
    },
  }
}

const parseGeoMemberList = (
  command: GeoCommand,
  tokens: string[],
  kind: 'hashList' | 'pointList',
): ParseResult<ParsedGeoCommand> => {
  if (!tokens[1]) {
    return { ok: false, error: `${command} requires a key.` }
  }

  return {
    ok: true,
    value: {
      ...createBaseCommand(command, tokens),
      kind,
      key: tokens[1],
      members: tokens.slice(2),
    },
  }
}

const applySearchShape = (
  params: ParsedGeoCommand,
  tokens: string[],
): ParseResult<ParsedGeoCommand> => {
  const upperTokens = getUpperTokens(tokens)
  const fromLonLatIndex = upperTokens.indexOf('FROMLONLAT')
  const fromMemberIndex = upperTokens.indexOf('FROMMEMBER')

  if (fromLonLatIndex >= 0) {
    const lon = parseNumber(tokens[fromLonLatIndex + 1], 'longitude')
    if (!lon.ok) {
      return lon
    }

    const lat = parseNumber(tokens[fromLonLatIndex + 2], 'latitude')
    if (!lat.ok) {
      return lat
    }

    params.centerLon = lon.value
    params.centerLat = lat.value
  } else if (fromMemberIndex >= 0) {
    params.memberName = tokens[fromMemberIndex + 1]
    params.centerFromMember = true
  } else {
    return { ok: false, error: `${params.command} requires FROMLONLAT or FROMMEMBER.` }
  }

  const radiusIndex = upperTokens.indexOf('BYRADIUS')
  const boxIndex = upperTokens.indexOf('BYBOX')

  if (radiusIndex >= 0) {
    const radius = parseNumber(tokens[radiusIndex + 1], 'radius')
    if (!radius.ok) {
      return radius
    }

    params.radius = convertToKm(radius.value, tokens[radiusIndex + 2])
    params.unit = 'km'
    params.searchType = 'radius'
    return { ok: true, value: params }
  }

  if (boxIndex >= 0) {
    const width = parseNumber(tokens[boxIndex + 1], 'box width')
    if (!width.ok) {
      return width
    }

    const height = parseNumber(tokens[boxIndex + 2], 'box height')
    if (!height.ok) {
      return height
    }

    params.boxWidth = convertToKm(width.value, tokens[boxIndex + 3])
    params.boxHeight = convertToKm(height.value, tokens[boxIndex + 3])
    params.unit = 'km'
    params.searchType = 'box'
    return { ok: true, value: params }
  }

  return { ok: false, error: `${params.command} requires BYRADIUS or BYBOX.` }
}

const parseGeoSearch = (
  command: GeoCommand,
  tokens: string[],
): ParseResult<ParsedGeoCommand> => {
  if (!tokens[1]) {
    return { ok: false, error: 'GEOSEARCH requires a key.' }
  }

  const params: ParsedGeoCommand = {
    ...createBaseCommand(command, tokens),
    ...getSearchOptions(tokens),
    kind: 'searchResults',
    key: tokens[1],
  }

  return applySearchShape(params, tokens)
}

const parseGeoSearchStore = (
  command: GeoCommand,
  tokens: string[],
): ParseResult<ParsedGeoCommand> => {
  if (!tokens[1] || !tokens[2]) {
    return { ok: false, error: 'GEOSEARCHSTORE requires destination and source keys.' }
  }

  const params: ParsedGeoCommand = {
    ...createBaseCommand(command, tokens),
    ...getSearchOptions(tokens),
    kind: 'storeSummary',
    destinationKey: tokens[1],
    key: tokens[2],
  }

  return applySearchShape(params, tokens)
}

const parseGeoRadius = (
  command: GeoCommand,
  tokens: string[],
): ParseResult<ParsedGeoCommand> => {
  if (!tokens[1]) {
    return { ok: false, error: `${command} requires a key.` }
  }

  const lon = parseNumber(tokens[2], 'longitude')
  if (!lon.ok) {
    return lon
  }

  const lat = parseNumber(tokens[3], 'latitude')
  if (!lat.ok) {
    return lat
  }

  const radius = parseNumber(tokens[4], 'radius')
  if (!radius.ok) {
    return radius
  }

  const options = getSearchOptions(tokens)

  return {
    ok: true,
    value: {
      ...createBaseCommand(command, tokens),
      ...options,
      kind: options.storeKey || options.storeDistKey ? 'storeSummary' : 'searchResults',
      key: tokens[1],
      centerLon: lon.value,
      centerLat: lat.value,
      radius: convertToKm(radius.value, tokens[5]),
      unit: 'km',
      searchType: 'radius',
    },
  }
}

const parseGeoRadiusByMember = (
  command: GeoCommand,
  tokens: string[],
): ParseResult<ParsedGeoCommand> => {
  if (!tokens[1] || !tokens[2]) {
    return { ok: false, error: `${command} requires key and member.` }
  }

  const radius = parseNumber(tokens[3], 'radius')
  if (!radius.ok) {
    return radius
  }

  const options = getSearchOptions(tokens)

  return {
    ok: true,
    value: {
      ...createBaseCommand(command, tokens),
      ...options,
      kind: options.storeKey || options.storeDistKey ? 'storeSummary' : 'searchResults',
      key: tokens[1],
      memberName: tokens[2],
      centerFromMember: true,
      radius: convertToKm(radius.value, tokens[4]),
      unit: 'km',
      searchType: 'radius',
    },
  }
}

export const parseGeoCommand = (command: string): ParseResult<ParsedGeoCommand> => {
  const tokens = tokenizeRedisCommand(command)
  const commandToken = tokens[0]?.toUpperCase()

  if (!commandToken) {
    return { ok: false, error: 'Missing Redis command.' }
  }

  if (!isGeoCommand(commandToken)) {
    return { ok: false, error: `Unsupported geo command: ${tokens[0]}.` }
  }

  if (commandToken === 'GEOADD') {
    return parseGeoAdd(commandToken, tokens)
  }
  if (commandToken === 'GEODIST') {
    return parseGeoDist(commandToken, tokens)
  }
  if (commandToken === 'GEOHASH') {
    return parseGeoMemberList(commandToken, tokens, 'hashList')
  }
  if (commandToken === 'GEOPOS') {
    return parseGeoMemberList(commandToken, tokens, 'pointList')
  }
  if (commandToken === 'GEOSEARCH') {
    return parseGeoSearch(commandToken, tokens)
  }
  if (commandToken === 'GEOSEARCHSTORE') {
    return parseGeoSearchStore(commandToken, tokens)
  }
  if (commandToken === 'GEORADIUS' || commandToken === 'GEORADIUS_RO') {
    return parseGeoRadius(commandToken, tokens)
  }
  return parseGeoRadiusByMember(commandToken, tokens)
}

export const parseSearchParams = (command: string): ParseResult<ParsedGeoCommand> => {
  const parsed = parseGeoCommand(command)
  if (!parsed.ok) {
    return parsed
  }
  if (parsed.value.kind !== 'searchResults') {
    return { ok: false, error: `${parsed.value.command} does not return coordinate search rows.` }
  }
  if (!parsed.value.withCoord) {
    return { ok: false, error: MAP_WITHCOORD_ERROR }
  }
  return parsed
}

const parseCoordinatePair = (value: unknown): { lon: number; lat: number } | null => {
  if (!Array.isArray(value) || value.length !== 2) {
    return null
  }

  const lon = Number(value[0])
  const lat = Number(value[1])
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
    return null
  }

  return { lon, lat }
}

export const parseGeoSearchResults = (
  response: unknown,
  command: ParsedGeoCommand,
): ParseResult<GeoResult[]> => {
  if (!command.withCoord) {
    return { ok: false, error: MAP_WITHCOORD_ERROR }
  }
  if (!Array.isArray(response)) {
    return { ok: false, error: 'Geo command response must be an array.' }
  }

  const results: GeoResult[] = []
  for (const item of response) {
    if (!Array.isArray(item) || item.length === 0) {
      return { ok: false, error: 'Unsupported geo response row shape.' }
    }

    let index = 1
    const name = String(item[0])
    const result: GeoResult = {
      name,
      lon: 0,
      lat: 0,
    }

    if (command.withDist) {
      const distance = Number(item[index])
      if (!Number.isFinite(distance)) {
        return { ok: false, error: `Invalid distance for ${name}.` }
      }
      result.distance = distance
      index += 1
    }

    if (command.withHash) {
      const hash = Number(item[index])
      if (!Number.isFinite(hash)) {
        return { ok: false, error: `Invalid geohash for ${name}.` }
      }
      result.hash = hash
      index += 1
    }

    const coordinates = parseCoordinatePair(item[index])
    if (!coordinates) {
      return { ok: false, error: `Missing coordinates for ${name}.` }
    }

    results.push({
      ...result,
      lon: coordinates.lon,
      lat: coordinates.lat,
    })
  }

  return { ok: true, value: results }
}

export const parseGeoPositionResults = (
  response: unknown,
  command: ParsedGeoCommand,
): ParseResult<GeoPositionResult[]> => {
  if (!Array.isArray(response)) {
    return { ok: false, error: 'GEOPOS response must be an array.' }
  }

  const members = command.members || []
  const results = response.map((item, index): GeoPositionResult => {
    const member = members[index] || `Member ${index + 1}`
    const coordinates = parseCoordinatePair(item)
    if (!coordinates) {
      return { member, missing: true }
    }

    return {
      member,
      lon: coordinates.lon,
      lat: coordinates.lat,
      missing: false,
    }
  })

  return { ok: true, value: results }
}

export const parseGeoHashResults = (
  response: unknown,
  command: ParsedGeoCommand,
): ParseResult<GeoHashResult[]> => {
  if (!Array.isArray(response)) {
    return { ok: false, error: 'GEOHASH response must be an array.' }
  }

  const members = command.members || []
  return {
    ok: true,
    value: response.map((item, index) => ({
      member: members[index] || `Member ${index + 1}`,
      hash: item === null || item === undefined ? null : String(item),
    })),
  }
}

export const parseGeoDistanceResult = (
  response: unknown,
  command: ParsedGeoCommand,
): ParseResult<GeoDistanceResult> => {
  if (response === null || response === undefined) {
    return {
      ok: true,
      value: {
        distance: null,
        unit: command.unit || 'm',
      },
    }
  }

  const distance = Number(response)
  if (!Number.isFinite(distance)) {
    return { ok: false, error: 'GEODIST response must be numeric or null.' }
  }

  return {
    ok: true,
    value: {
      distance,
      unit: command.unit || 'm',
    },
  }
}

export const parseIntegerResult = (
  response: unknown,
  command: ParsedGeoCommand,
): ParseResult<GeoIntegerResult> => {
  const count = Number(response)
  if (!Number.isInteger(count)) {
    return { ok: false, error: `${command.command} response must be an integer.` }
  }

  return {
    ok: true,
    value: {
      count,
      label: command.kind === 'storeSummary' ? 'items stored' : 'items added',
    },
  }
}

export const getSearchMemberRows = (response: unknown): string[] => {
  if (!Array.isArray(response)) {
    return []
  }

  return response.map((item) => {
    if (Array.isArray(item)) {
      return String(item[0])
    }
    return String(item)
  })
}

export const isUnitToken = (value: string | undefined): boolean =>
  !!value && DISTANCE_UNITS.has(value.toUpperCase())
