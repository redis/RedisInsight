import { GROUP_TYPES_COLORS, KeyTypes } from 'uiSrc/constants'

export enum FieldTypes {
  TEXT = 'text',
  TAG = 'tag',
  NUMERIC = 'numeric',
  GEO = 'geo',
  GEOSHAPE = 'geoshape',
  VECTOR = 'vector',
}

export enum RedisearchIndexKeyType {
  HASH = 'hash',
  JSON = 'json',
}

export const KEY_TYPE_OPTIONS = [
  {
    text: 'Hash',
    value: RedisearchIndexKeyType.HASH,
    color: GROUP_TYPES_COLORS[KeyTypes.Hash],
  },
  {
    text: 'JSON',
    value: RedisearchIndexKeyType.JSON,
    color: GROUP_TYPES_COLORS[KeyTypes.JSON],
  },
]

export const FIELD_TYPE_OPTIONS = [
  {
    text: 'TEXT',
    value: FieldTypes.TEXT,
    description: 'Use TEXT for full-text search and indexing free-form text.',
  },
  {
    text: 'TAG',
    value: FieldTypes.TAG,
    description: 'Use TAG for filtering by exact match values.',
  },
  {
    text: 'NUMERIC',
    value: FieldTypes.NUMERIC,
    description: 'Use NUMERIC for storing and querying numbers.',
  },
  {
    text: 'GEO',
    value: FieldTypes.GEO,
    description: 'Use GEO for geographic coordinates (latitude and longitude).',
  },
  {
    text: 'VECTOR',
    value: FieldTypes.VECTOR,
    description: 'Use VECTOR for semantic search using vector embeddings.',
  },
]
