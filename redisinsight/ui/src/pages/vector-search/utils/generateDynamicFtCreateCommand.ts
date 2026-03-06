import {
  FieldTypes,
  RedisearchIndexKeyType,
} from 'uiSrc/pages/browser/components/create-redisearch-index/constants'

import {
  IndexField,
  VectorAlgorithm,
  VectorFieldOptions,
  VectorHnswFieldOptions,
  TextFieldOptions,
} from '../components/index-details/IndexDetails.types'
import {
  VECTOR_ALGORITHM_DEFAULT,
  VECTOR_DATA_TYPE_DEFAULT,
  VECTOR_DISTANCE_METRIC_DEFAULT,
  VECTOR_CONSTRAINTS,
  PHONETIC_NONE,
} from '../components/field-type-modal/FieldTypeModal.constants'

export interface DynamicFtCreateParams {
  indexName: string
  keyType: RedisearchIndexKeyType
  prefix: string
  fields: IndexField[]
}

export const generateDynamicFtCreateCommand = ({
  indexName,
  keyType,
  prefix,
  fields,
}: DynamicFtCreateParams): string => {
  const onClause = keyType === RedisearchIndexKeyType.JSON ? 'JSON' : 'HASH'

  const fieldSchemas = sortFieldsByType(fields)
    .map((field) => `    ${buildFieldSchema(field, keyType)}`)
    .join('\n')

  const parts = [
    `FT.CREATE "${indexName}"`,
    `  ON ${onClause}`,
    `    PREFIX 1 "${prefix}"`,
    '  SCHEMA',
  ]

  if (fieldSchemas) {
    parts.push(fieldSchemas)
  }

  return parts.join('\n')
}

const buildFieldSchema = (
  field: IndexField,
  keyType: RedisearchIndexKeyType,
): string => {
  const isJson = keyType === RedisearchIndexKeyType.JSON
  const fieldRef = isJson
    ? `$.${field.name} AS ${field.name}`
    : `"${field.name}"`

  if (field.type === FieldTypes.VECTOR) {
    const vectorOptions = field.options as VectorFieldOptions | undefined
    const algorithm = vectorOptions?.algorithm ?? VECTOR_ALGORITHM_DEFAULT
    const params = getVectorParams(vectorOptions)
    const numArgs = params.length * 2

    const paramLines = params
      .map(([key, value]) => `      ${key} ${value}`)
      .join('\n')

    return `${fieldRef} VECTOR ${algorithm} ${numArgs}\n${paramLines}`
  }

  if (field.type === FieldTypes.TEXT) {
    const textOptions = field.options as TextFieldOptions | undefined
    const parts = [fieldRef, 'TEXT']

    if (textOptions?.weight !== undefined && textOptions.weight !== 1) {
      parts.push('WEIGHT', String(textOptions.weight))
    }

    if (textOptions?.phonetic && textOptions.phonetic !== PHONETIC_NONE) {
      parts.push('PHONETIC', textOptions.phonetic)
    }

    return parts.join(' ')
  }

  return `${fieldRef} ${field.type.toUpperCase()}`
}

const getVectorParams = (options?: VectorFieldOptions): [string, string][] => {
  const algorithm = options?.algorithm ?? VECTOR_ALGORITHM_DEFAULT
  const dataType = options?.dataType ?? VECTOR_DATA_TYPE_DEFAULT
  const dimensions =
    options?.dimensions ?? VECTOR_CONSTRAINTS.DIMENSIONS_DEFAULT
  const distanceMetric =
    options?.distanceMetric ?? VECTOR_DISTANCE_METRIC_DEFAULT

  const params: [string, string][] = [
    ['TYPE', dataType],
    ['DIM', String(dimensions)],
    ['DISTANCE_METRIC', distanceMetric],
  ]

  if (algorithm === VectorAlgorithm.HNSW) {
    const hnsw = options as VectorHnswFieldOptions | undefined
    if (hnsw?.maxEdges !== undefined) {
      params.push(['M', String(hnsw.maxEdges)])
    }
    if (hnsw?.maxNeighbors !== undefined) {
      params.push(['EF_CONSTRUCTION', String(hnsw.maxNeighbors)])
    }
    if (hnsw?.candidateLimit !== undefined) {
      params.push(['EF_RUNTIME', String(hnsw.candidateLimit)])
    }
    if (hnsw?.epsilon !== undefined) {
      params.push(['EPSILON', String(hnsw.epsilon)])
    }
  }

  return params
}

/**
 * RediSearch parses field modifiers greedily: after a field type, it keeps
 * consuming tokens that match known modifier keywords (case-insensitive).
 * A field *name* like "weight" after a TEXT field is consumed as the WEIGHT
 * modifier, causing a parsing error.
 *
 * Ordering fields so that types with fewer/simpler modifiers come first
 * (NUMERIC, GEO → TAG → TEXT → VECTOR) avoids most real-world clashes.
 */
const FIELD_TYPE_ORDER: Record<string, number> = {
  [FieldTypes.NUMERIC]: 0,
  [FieldTypes.GEO]: 1,
  [FieldTypes.TAG]: 2,
  [FieldTypes.TEXT]: 3,
  [FieldTypes.VECTOR]: 4,
}

const sortFieldsByType = (fields: IndexField[]): IndexField[] =>
  [...fields].sort(
    (a, b) => (FIELD_TYPE_ORDER[a.type] ?? 3) - (FIELD_TYPE_ORDER[b.type] ?? 3),
  )
