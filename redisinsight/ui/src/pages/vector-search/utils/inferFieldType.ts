import {
  FieldTypes,
  RedisearchIndexKeyType,
} from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import { IndexField } from '../components/index-details/IndexDetails.types'

const TAG_MAX_LENGTH = 50
const MIN_VECTOR_LENGTH = 2

const WKT_PREFIXES = [
  'point(',
  'polygon(',
  'linestring(',
  'multipoint(',
  'multipolygon(',
  'multilinestring(',
  'geometrycollection(',
]

const GEO_REGEX = /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/

const LON_MIN = -180
const LON_MAX = 180
const LAT_MIN = -90
const LAT_MAX = 90

const isLonLatInRange = (lon: number, lat: number): boolean =>
  Number.isFinite(lon) &&
  Number.isFinite(lat) &&
  lon >= LON_MIN &&
  lon <= LON_MAX &&
  lat >= LAT_MIN &&
  lat <= LAT_MAX

/** Returns true if value is [lon, lat] or { lat, lon } with valid coordinate ranges. */
export const isGeoCoordinates = (value: unknown): boolean => {
  if (Array.isArray(value)) {
    if (value.length !== 2) {
      return false
    }
    const [a, b] = value
    if (typeof a !== 'number' || typeof b !== 'number') {
      return false
    }
    return isLonLatInRange(a, b)
  }
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    const o = value as Record<string, unknown>
    const lon = o.lon ?? o.longitude
    const lat = o.lat ?? o.latitude
    if (typeof lon !== 'number' || typeof lat !== 'number') {
      return false
    }
    return isLonLatInRange(lon, lat)
  }
  return false
}

export const isGeoShape = (value: string): boolean => {
  const lower = value.trimStart().toLowerCase()
  return WKT_PREFIXES.some((prefix) => lower.startsWith(prefix))
}

export const isGeo = (value: string): boolean => {
  const match = GEO_REGEX.exec(value)
  if (!match) {
    return false
  }

  const lon = parseFloat(match[1])
  const lat = parseFloat(match[2])

  if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
    return false
  }
  return lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90
}

export const isVector = (value: string): boolean => {
  const trimmed = value.trim()
  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) {
    return false
  }

  try {
    const parsed = JSON.parse(trimmed)
    return (
      Array.isArray(parsed) &&
      parsed.length >= MIN_VECTOR_LENGTH &&
      parsed.every((item) => typeof item === 'number' && Number.isFinite(item))
    )
  } catch {
    return false
  }
}

export const isNumeric = (value: string): boolean => {
  if (value.trim() === '') {
    return false
  }
  const n = Number(value)
  return !Number.isNaN(n) && Number.isFinite(n)
}

export type JsonType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'null'
  | 'array'
  | 'object'

/**
 * Infers the index field type from a raw value (string, number, boolean, null, array, or object).
 * Used when the key's value is passed directly from the keys browser.
 */
export const inferFieldType = (value: unknown): FieldTypes => {
  if (value === null || value === undefined) {
    return FieldTypes.TAG
  }
  if (typeof value === 'number') {
    return FieldTypes.NUMERIC
  }
  if (typeof value === 'boolean') {
    return FieldTypes.TAG
  }
  if (Array.isArray(value)) {
    if (isGeoCoordinates(value)) {
      return FieldTypes.GEO
    }
    const s = JSON.stringify(value)
    return isVector(s) ? FieldTypes.VECTOR : FieldTypes.TAG
  }
  if (typeof value === 'object') {
    if (isGeoCoordinates(value)) {
      return FieldTypes.GEO
    }
    return FieldTypes.TEXT
  }

  const str = String(value)
  if (isGeoShape(str)) {
    return FieldTypes.GEOSHAPE
  }
  if (isGeo(str)) {
    return FieldTypes.GEO
  }
  if (isVector(str)) {
    return FieldTypes.VECTOR
  }
  if (isNumeric(str)) {
    return FieldTypes.NUMERIC
  }

  if (str.length < TAG_MAX_LENGTH) {
    return FieldTypes.TAG
  }
  return FieldTypes.TEXT
}

export interface HashFieldInput {
  field: string
  value: string
}

export interface JsonFieldInput {
  key: string
  value: string | number | boolean | null
  type: JsonType
}

/** Converts a value to string for IndexField.value (display/storage). */
const valueToString = (value: unknown): string => {
  if (value == null) {
    return ''
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

export const inferHashKeyFields = (fields: HashFieldInput[]): IndexField[] =>
  fields.map((entry) => ({
    id: entry.field,
    name: entry.field,
    value: entry.value,
    type: inferFieldType(entry.value),
  }))

export const inferJsonKeyFields = (fields: JsonFieldInput[]): IndexField[] =>
  fields.map((entry) => ({
    id: entry.key,
    name: entry.key,
    value: valueToString(entry.value),
    type: inferFieldType(entry.value),
  }))

/**
 * Top-level hash key value: field name → string value.
 * This is the key's value as loaded when the user clicks the key in the keys browser (Hash).
 */
export type HashKeyData = Record<string, string>

/**
 * Top-level JSON key value: property name → value (string, number, boolean, null, array, or object).
 * This is the key's value as loaded when the user clicks the key in the keys browser (JSON).
 */
export type JsonKeyData = Record<string, unknown>

/**
 * Infers index field types for all top-level fields of a key.
 * Pass the key's value as returned when the user clicks the key in the keys browser:
 * - For Hash keys: the hash content as Record<string, string>.
 * - For JSON keys: the root object as Record<string, unknown>.
 */
export const inferKeyFields = (
  data: HashKeyData | JsonKeyData,
  keyType: RedisearchIndexKeyType,
): IndexField[] => {
  const entries = Object.entries(data)
  if (keyType === RedisearchIndexKeyType.HASH) {
    return entries.map(([name, value]) => ({
      id: name,
      name,
      value: value as string,
      type: inferFieldType(value as string),
    }))
  }
  return entries.map(([name, value]) => ({
    id: name,
    name,
    value: valueToString(value),
    type: inferFieldType(value),
  }))
}
