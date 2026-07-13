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
    descriptionKey: 'vectorSearch.fieldType.desc.text',
  },
  {
    text: 'TAG',
    value: FieldTypes.TAG,
    descriptionKey: 'vectorSearch.fieldType.desc.tag',
  },
  {
    text: 'NUMERIC',
    value: FieldTypes.NUMERIC,
    descriptionKey: 'vectorSearch.fieldType.desc.numeric',
  },
  {
    text: 'GEO',
    value: FieldTypes.GEO,
    descriptionKey: 'vectorSearch.fieldType.desc.geo',
  },
  {
    text: 'VECTOR',
    value: FieldTypes.VECTOR,
    descriptionKey: 'vectorSearch.fieldType.desc.vector',
  },
]
