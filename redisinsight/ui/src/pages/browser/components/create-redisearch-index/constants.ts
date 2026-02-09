import { GROUP_TYPES_COLORS, KeyTypes } from 'uiSrc/constants'

export enum FieldTypes {
  TEXT = 'text',
  TAG = 'tag',
  NUMERIC = 'numeric',
  GEO = 'geo',
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
  },
  {
    text: 'TAG',
    value: FieldTypes.TAG,
  },
  {
    text: 'NUMERIC',
    value: FieldTypes.NUMERIC,
  },
  {
    text: 'GEO',
    value: FieldTypes.GEO,
  },
  {
    text: 'VECTOR',
    value: FieldTypes.VECTOR,
  },
]
