import {
  GeoPointResult,
  GeoQueryOverlay,
  GeoShapeGeometry,
  GeoShapeOperation,
  GeoShapeResult,
  ParseResult,
  ParsedRqeGeoCommand,
  RqeGeoCommand,
  RqeGeoDataset,
} from '../types'
import { tokenizeRedisCommand } from './geoParser'

const RQE_GEO_COMMANDS = new Set<RqeGeoCommand>([
  'FT.SEARCH',
  'FT.AGGREGATE',
  'FT.HYBRID',
])

const RQE_UNITS = new Set(['m', 'km', 'mi', 'ft'])
const SHAPE_OPERATIONS = new Set<GeoShapeOperation>([
  'WITHIN',
  'CONTAINS',
  'INTERSECTS',
  'DISJOINT',
])

const GEO_QUERY_PATTERN =
  /@(?<field>[A-Za-z0-9_.$:-]+):\[\s*(?<lon>[-+$A-Za-z0-9_.]+)\s+(?<lat>[-+$A-Za-z0-9_.]+)\s+(?<radius>[-+$A-Za-z0-9_.]+)\s+(?<unit>m|km|mi|ft)\s*\]/i

const GEOSHAPE_QUERY_PATTERN =
  /@(?<field>[A-Za-z0-9_.$:-]+):\[\s*(?<operation>WITHIN|CONTAINS|INTERSECTS|DISJOINT)\s+(?<shape>[^\]]+)\]/i

const normalizeFieldName = (field: string): string =>
  field.replace(/^@+/, '').replace(/^\$+\./, '').replace(/^\$+/, '')

const parseNumber = (value: string, field: string): ParseResult<number> => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return { ok: false, error: `Invalid ${field}: ${value}.` }
  }
  return { ok: true, value: parsed }
}

const convertToKm = (value: number, unit: string): number => {
  const normalized = unit.toLowerCase()
  if (normalized === 'km') {
    return value
  }
  if (normalized === 'm') {
    return value / 1000
  }
  if (normalized === 'mi') {
    return value * 1.60934
  }
  if (normalized === 'ft') {
    return value * 0.0003048
  }
  return value
}

const resolveParam = (value: string, params: Record<string, string>): string =>
  value.startsWith('$') ? params[value.slice(1)] || value : value

const parseParams = (tokens: string[]): Record<string, string> => {
  const params: Record<string, string> = {}
  const upperTokens = tokens.map((token) => token.toUpperCase())
  const paramsIndex = upperTokens.indexOf('PARAMS')
  if (paramsIndex < 0) {
    return params
  }

  const count = Number(tokens[paramsIndex + 1])
  if (!Number.isInteger(count) || count <= 0) {
    return params
  }

  for (let index = paramsIndex + 2; index < paramsIndex + 2 + count; index += 2) {
    const name = tokens[index]
    const value = tokens[index + 1]
    if (name && value !== undefined) {
      params[name] = value
    }
  }

  return params
}

const getSearchExpressions = (
  command: RqeGeoCommand,
  tokens: string[],
): string[] => {
  if (command === 'FT.SEARCH' || command === 'FT.AGGREGATE') {
    return tokens[2] ? [tokens[2]] : []
  }

  const expressions: string[] = []
  const upperTokens = tokens.map((token) => token.toUpperCase())
  upperTokens.forEach((token, index) => {
    if ((token === 'SEARCH' || token === 'FILTER') && tokens[index + 1]) {
      expressions.push(tokens[index + 1])
    }
  })
  return expressions
}

const parseRadiusOverlay = (
  field: string,
  lonValue: string,
  latValue: string,
  radiusValue: string,
  unitValue: string,
  params: Record<string, string>,
  source: 'query' | 'geofilter',
): ParseResult<GeoQueryOverlay> => {
  const unit = unitValue.toLowerCase()
  if (!RQE_UNITS.has(unit)) {
    return { ok: false, error: `Unsupported GEO unit: ${unitValue}.` }
  }

  const lon = parseNumber(resolveParam(lonValue, params), 'longitude')
  if (!lon.ok) {
    return lon
  }
  const lat = parseNumber(resolveParam(latValue, params), 'latitude')
  if (!lat.ok) {
    return lat
  }
  const radius = parseNumber(resolveParam(radiusValue, params), 'radius')
  if (!radius.ok) {
    return radius
  }

  return {
    ok: true,
    value: {
      type: 'radius',
      source,
      field: normalizeFieldName(field),
      lon: lon.value,
      lat: lat.value,
      radius: radius.value,
      radiusKm: convertToKm(radius.value, unit),
      unit,
    },
  }
}

export const parseWktGeometry = (
  wkt: string,
): ParseResult<GeoShapeGeometry> => {
  const trimmed = wkt.trim()
  const pointMatch = trimmed.match(
    /^POINT\s*\(\s*([-+]?\d*\.?\d+)\s+([-+]?\d*\.?\d+)\s*\)$/i,
  )
  if (pointMatch) {
    return {
      ok: true,
      value: {
        type: 'point',
        lon: Number(pointMatch[1]),
        lat: Number(pointMatch[2]),
      },
    }
  }

  const polygonMatch = trimmed.match(/^POLYGON\s*\(\s*(.+)\s*\)$/i)
  if (!polygonMatch) {
    return {
      ok: false,
      error: 'Unsupported WKT geometry. Expected POINT or POLYGON.',
    }
  }

  const ringMatches = [...polygonMatch[1].matchAll(/\(([^()]*)\)/g)]
  if (!ringMatches.length) {
    return { ok: false, error: 'Invalid POLYGON WKT.' }
  }

  const rings = ringMatches.map((ringMatch) =>
    ringMatch[1].split(',').map((point) => {
      const [lon, lat] = point.trim().split(/\s+/).map(Number)
      return { lon, lat }
    }),
  )

  if (
    rings.some((ring) =>
      ring.length < 3 || ring.some(({ lon, lat }) => !Number.isFinite(lon) || !Number.isFinite(lat)),
    )
  ) {
    return { ok: false, error: 'Invalid POLYGON coordinates.' }
  }

  return {
    ok: true,
    value: {
      type: 'polygon',
      rings,
    },
  }
}

const parseShapeOverlay = (
  field: string,
  operation: string,
  shapeValue: string,
  params: Record<string, string>,
): ParseResult<GeoQueryOverlay> => {
  const normalizedOperation = operation.toUpperCase() as GeoShapeOperation
  if (!SHAPE_OPERATIONS.has(normalizedOperation)) {
    return { ok: false, error: `Unsupported GEOSHAPE operation: ${operation}.` }
  }

  const wkt = resolveParam(shapeValue.trim(), params)
  const geometry = parseWktGeometry(wkt)
  if (!geometry.ok) {
    return geometry
  }

  return {
    ok: true,
    value: {
      type: 'shape',
      field: normalizeFieldName(field),
      operation: normalizedOperation,
      wkt,
      geometry: geometry.value,
    },
  }
}

const parseGeofilterOverlay = (
  tokens: string[],
  params: Record<string, string>,
): ParseResult<GeoQueryOverlay> | null => {
  const upperTokens = tokens.map((token) => token.toUpperCase())
  const index = upperTokens.indexOf('GEOFILTER')
  if (index < 0) {
    return null
  }

  const [field, lon, lat, radius, unit] = tokens.slice(index + 1, index + 6)
  if (!field || !lon || !lat || !radius || !unit) {
    return { ok: false, error: 'GEOFILTER requires field longitude latitude radius unit.' }
  }
  return parseRadiusOverlay(field, lon, lat, radius, unit, params, 'geofilter')
}

const parseQueryOverlay = (
  expressions: string[],
  params: Record<string, string>,
): ParseResult<GeoQueryOverlay> | null => {
  for (const expression of expressions) {
    const radiusMatch = expression.match(GEO_QUERY_PATTERN)
    if (radiusMatch?.groups) {
      return parseRadiusOverlay(
        radiusMatch.groups.field,
        radiusMatch.groups.lon,
        radiusMatch.groups.lat,
        radiusMatch.groups.radius,
        radiusMatch.groups.unit,
        params,
        'query',
      )
    }

    const shapeMatch = expression.match(GEOSHAPE_QUERY_PATTERN)
    if (shapeMatch?.groups) {
      return parseShapeOverlay(
        shapeMatch.groups.field,
        shapeMatch.groups.operation,
        shapeMatch.groups.shape,
        params,
      )
    }
  }

  return null
}

export const parseRqeGeoCommand = (
  command: string,
): ParseResult<ParsedRqeGeoCommand> => {
  const tokens = tokenizeRedisCommand(command)
  const commandToken = tokens[0]?.toUpperCase() as RqeGeoCommand | undefined
  if (!commandToken) {
    return { ok: false, error: 'Missing Redis Query Engine command.' }
  }
  if (!RQE_GEO_COMMANDS.has(commandToken)) {
    return { ok: false, error: `Unsupported Redis Query Engine command: ${tokens[0]}.` }
  }
  if (!tokens[1]) {
    return { ok: false, error: `${commandToken} requires an index.` }
  }

  const params = parseParams(tokens)
  const geofilterOverlay = commandToken === 'FT.SEARCH'
    ? parseGeofilterOverlay(tokens, params)
    : null
  const parsedOverlay =
    geofilterOverlay || parseQueryOverlay(getSearchExpressions(commandToken, tokens), params)

  if (!parsedOverlay) {
    return { ok: false, error: 'No Redis Query Engine geospatial predicate found.' }
  }
  if (!parsedOverlay.ok) {
    return parsedOverlay
  }

  return {
    ok: true,
    value: {
      command: commandToken,
      kind: parsedOverlay.value.type === 'radius' ? 'pointRadius' : 'shape',
      rawTokens: tokens,
      index: tokens[1],
      query: getSearchExpressions(commandToken, tokens).join(' '),
      geoField: parsedOverlay.value.field,
      params,
      overlay: parsedOverlay.value,
    },
  }
}

interface RqeRow {
  id: string
  fields: Record<string, unknown>
}

const fieldPairsToRecord = (fields: unknown): Record<string, unknown> | null => {
  if (!Array.isArray(fields)) {
    return null
  }

  const result: Record<string, unknown> = {}
  for (let index = 0; index < fields.length; index += 2) {
    const field = fields[index]
    if (field === undefined || fields[index + 1] === undefined) {
      return null
    }
    result[String(field)] = fields[index + 1]
  }
  return result
}

const parseSearchRows = (response: unknown[]): RqeRow[] => {
  const rows: RqeRow[] = []
  for (let index = 1; index < response.length; index += 2) {
    const id = String(response[index])
    const fields = fieldPairsToRecord(response[index + 1])
    if (fields) {
      rows.push({ id, fields })
    }
  }
  return rows
}

const parseAggregateRows = (response: unknown[]): RqeRow[] => {
  const source = Array.isArray(response[0]) ? response[0] : response
  return source
    .slice(1)
    .map((fields, index): RqeRow | null => {
      const parsedFields = fieldPairsToRecord(fields)
      if (!parsedFields) {
        return null
      }
      return {
        id: `row-${index + 1}`,
        fields: parsedFields,
      }
    })
    .filter((row): row is RqeRow => row !== null)
}

const parseHybridResultRows = (results: unknown[]): RqeRow[] =>
  results
    .map((result, index): RqeRow | null => {
      if (Array.isArray(result)) {
        const directFields = fieldPairsToRecord(result)
        if (directFields) {
          return {
            id: `row-${index + 1}`,
            fields: directFields,
          }
        }

        const fields = fieldPairsToRecord(result[1])
        if (fields) {
          return {
            id: String(result[0] || `row-${index + 1}`),
            fields,
          }
        }
      }

      if (result && typeof result === 'object') {
        const row = result as Record<string, unknown>
        const fields = row.fields ? fieldPairsToRecord(row.fields) : null
        if (fields) {
          return {
            id: String(row.id || row.key || row.__key || `row-${index + 1}`),
            fields,
          }
        }

        return {
          id: String(row.id || row.key || row.__key || `row-${index + 1}`),
          fields: Object.fromEntries(
            Object.entries(row).filter(
              ([field]) => !['id', 'key', '__key'].includes(field),
            ),
          ),
        }
      }

      return null
    })
    .filter((row): row is RqeRow => row !== null)

const getHybridResults = (response: unknown): unknown[] | null => {
  if (Array.isArray(response)) {
    for (let index = 0; index < response.length - 1; index += 2) {
      if (
        String(response[index]).toLowerCase() === 'results' &&
        Array.isArray(response[index + 1])
      ) {
        return response[index + 1]
      }
    }
  }

  if (response && typeof response === 'object') {
    const results = (response as { results?: unknown }).results
    return Array.isArray(results) ? results : null
  }

  return null
}

const parseHybridRows = (response: unknown): ParseResult<RqeRow[]> => {
  const results = getHybridResults(response)
  if (results) {
    return { ok: true, value: parseHybridResultRows(results) }
  }

  if (!Array.isArray(response)) {
    return { ok: false, error: 'FT.HYBRID response must be an array or object.' }
  }

  const rows = response[1] && Array.isArray(response[2])
    ? parseSearchRows(response)
    : parseAggregateRows(response)
  return { ok: true, value: rows }
}

const parseRqeRows = (
  response: unknown,
  command: ParsedRqeGeoCommand,
): ParseResult<RqeRow[]> => {
  if (command.command === 'FT.HYBRID') {
    return parseHybridRows(response)
  }

  if (!Array.isArray(response)) {
    return { ok: false, error: `${command.command} response must be an array.` }
  }

  if (command.command === 'FT.SEARCH') {
    return { ok: true, value: parseSearchRows(response) }
  }
  if (command.command === 'FT.AGGREGATE') {
    return { ok: true, value: parseAggregateRows(response) }
  }

  return {
    ok: false,
    error: `Unsupported Redis Query Engine command: ${command.command}.`,
  }
}

const parseCoordinateString = (value: string): GeoPointResult['lon' | 'lat'][] | null => {
  const parts = value.split(',').map((part) => Number(part.trim()))
  if (parts.length !== 2 || !parts.every(Number.isFinite)) {
    return null
  }
  return parts
}

const getCoordinatePairs = (value: unknown): Array<{ lon: number; lat: number }> => {
  if (typeof value === 'string') {
    const direct = parseCoordinateString(value)
    if (direct) {
      return [{ lon: direct[0], lat: direct[1] }]
    }

    try {
      return getCoordinatePairs(JSON.parse(value))
    } catch {
      return []
    }
  }

  if (!Array.isArray(value)) {
    return []
  }

  if (
    value.length === 2 &&
    Number.isFinite(Number(value[0])) &&
    Number.isFinite(Number(value[1]))
  ) {
    return [{ lon: Number(value[0]), lat: Number(value[1]) }]
  }

  return value.flatMap(getCoordinatePairs)
}

const getFieldValue = (
  fields: Record<string, unknown>,
  requestedField: string,
): { field: string; value: unknown } | null => {
  const normalizedRequestedField = normalizeFieldName(requestedField)
  const exactEntry = Object.entries(fields).find(
    ([field]) => normalizeFieldName(field) === normalizedRequestedField,
  )
  if (exactEntry) {
    return { field: normalizeFieldName(exactEntry[0]), value: exactEntry[1] }
  }

  return null
}

const getFallbackFieldValue = (
  fields: Record<string, unknown>,
  parser: (value: unknown) => boolean,
): { field: string; value: unknown } | null => {
  const entry = Object.entries(fields).find(([, value]) => parser(value))
  return entry ? { field: normalizeFieldName(entry[0]), value: entry[1] } : null
}

const getRowName = (row: RqeRow): string =>
  typeof row.fields.name === 'string' ? row.fields.name : row.id

const parsePointRows = (
  rows: RqeRow[],
  command: ParsedRqeGeoCommand,
): GeoPointResult[] => {
  const points: GeoPointResult[] = []
  rows.forEach((row) => {
    const fieldValue =
      getFieldValue(row.fields, command.geoField) ||
      getFallbackFieldValue(row.fields, (value) => getCoordinatePairs(value).length > 0)
    if (!fieldValue) {
      return
    }

    getCoordinatePairs(fieldValue.value).forEach(({ lon, lat }, index) => {
      points.push({
        id: index === 0 ? row.id : `${row.id}#${index + 1}`,
        name: getRowName(row),
        field: fieldValue.field,
        lon,
        lat,
      })
    })
  })
  return points
}

const tryParseWkt = (value: unknown): { wkt: string; geometry: GeoShapeGeometry } | null => {
  if (typeof value !== 'string') {
    return null
  }
  const parsed = parseWktGeometry(value)
  return parsed.ok ? { wkt: value, geometry: parsed.value } : null
}

const parseShapeRows = (
  rows: RqeRow[],
  command: ParsedRqeGeoCommand,
): GeoShapeResult[] => {
  const shapes: GeoShapeResult[] = []
  rows.forEach((row) => {
    const fieldValue =
      getFieldValue(row.fields, command.geoField) ||
      getFallbackFieldValue(row.fields, (value) => tryParseWkt(value) !== null)
    if (!fieldValue) {
      return
    }

    const parsed = tryParseWkt(fieldValue.value)
    if (!parsed) {
      return
    }

    shapes.push({
      id: row.id,
      name: getRowName(row),
      field: fieldValue.field,
      wkt: parsed.wkt,
      geometry: parsed.geometry,
    })
  })
  return shapes
}

const getMissingGeoFieldMessage = (command: ParsedRqeGeoCommand): string => {
  if (command.command === 'FT.AGGREGATE') {
    return `No returned geospatial fields found. Add LOAD 1 @${command.geoField} to the FT.AGGREGATE command.`
  }
  if (command.command === 'FT.HYBRID') {
    return `No returned geospatial fields found. Add LOAD 1 ${command.geoField} to the FT.HYBRID command.`
  }
  return `No returned geospatial fields found. Add RETURN 1 ${command.geoField} to the FT.SEARCH command.`
}

export const parseRqeGeoResults = (
  response: unknown,
  command: ParsedRqeGeoCommand,
): ParseResult<RqeGeoDataset> => {
  const parsedRows = parseRqeRows(response, command)
  if (!parsedRows.ok) {
    return parsedRows
  }

  const points = command.kind === 'pointRadius'
    ? parsePointRows(parsedRows.value, command)
    : []
  const shapes = command.kind === 'shape'
    ? parseShapeRows(parsedRows.value, command)
    : []

  if (!points.length && !shapes.length) {
    return { ok: false, error: getMissingGeoFieldMessage(command) }
  }

  return {
    ok: true,
    value: {
      command,
      points,
      shapes,
    },
  }
}
