import { bufferToString } from 'uiSrc/utils'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { RedisearchIndexKeyType } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'

import {
  inferKeyFields,
  isGeoCoordinates,
  isVector,
  HashKeyData,
  JsonKeyData,
} from '../../utils/inferFieldType'
import { InferredFieldsResult } from './useLoadKeyData.types'

const EMPTY_RESULT: InferredFieldsResult = { fields: [], skippedFields: [] }

// ---------------------------------------------------------------------------
// JSON helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when a JSON field value can be mapped to a RediSearch field type.
 * Objects/arrays that aren't geo coordinates or vectors are not indexable directly.
 */
export const isIndexableJsonValue = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return true
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return true
  }

  if (Array.isArray(value)) {
    return isGeoCoordinates(value) || isVector(value)
  }

  if (typeof value === 'object') {
    return isGeoCoordinates(value)
  }

  return true
}

export interface FilterJsonDataResult {
  indexable: JsonKeyData
  skippedFields: string[]
}

/**
 * Partitions JSON key entries into indexable fields and skipped fields.
 * Complex nested values (objects/arrays that aren't geo or vectors) are skipped.
 */
export const filterJsonData = (data: JsonKeyData): FilterJsonDataResult => {
  const indexable: JsonKeyData = {}
  const skippedFields: string[] = []

  Object.entries(data).forEach(([key, value]) => {
    if (isIndexableJsonValue(value)) {
      indexable[key] = value
    } else {
      skippedFields.push(key)
    }
  })

  return { indexable, skippedFields }
}

// ---------------------------------------------------------------------------
// Response → IndexField[] converters
// ---------------------------------------------------------------------------

/**
 * Converts raw hash field API response into inferred IndexField[].
 */
export const parseHashFields = (
  apiFields: Array<{ field: RedisResponseBuffer; value: RedisResponseBuffer }>,
): InferredFieldsResult => {
  const hashData: HashKeyData = Object.fromEntries(
    apiFields.map(({ field, value }) => [
      bufferToString(field),
      bufferToString(value),
    ]),
  )

  return {
    fields: inferKeyFields(hashData, RedisearchIndexKeyType.HASH),
    skippedFields: [],
  }
}

/**
 * Extracts the root JSON object from a parsed value.
 * ReJSON GET wraps the result in an array (e.g. `[{...}]`), so we unwrap the first element.
 * Plain objects are returned as-is; anything else yields an empty object.
 */
const extractRootObject = (value: object): JsonKeyData => {
  if (!Array.isArray(value)) {
    return value as JsonKeyData
  }

  const first = value[0]
  if (first && typeof first === 'object' && !Array.isArray(first)) {
    return first as JsonKeyData
  }

  return {} as JsonKeyData
}

/**
 * Unwraps the raw ReJSON GET response, filters out non-indexable fields,
 * and returns inferred IndexField[] together with skipped field names.
 */
export const parseJsonValue = (rawData: unknown): InferredFieldsResult => {
  let jsonValue = rawData
  if (typeof jsonValue === 'string') {
    try {
      jsonValue = JSON.parse(jsonValue)
    } catch {
      return EMPTY_RESULT
    }
  }

  if (!jsonValue || typeof jsonValue !== 'object') {
    return EMPTY_RESULT
  }

  const rootObject = extractRootObject(jsonValue)

  const { indexable, skippedFields } = filterJsonData(rootObject)

  return {
    fields: inferKeyFields(indexable, RedisearchIndexKeyType.JSON),
    skippedFields,
  }
}
