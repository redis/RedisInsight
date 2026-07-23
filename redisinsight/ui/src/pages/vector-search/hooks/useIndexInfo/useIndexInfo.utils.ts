import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import { IndexAttibuteDto, IndexInfoDto } from 'apiClient'

import {
  INDEX_ATTRIBUTE_BOOLEAN_FLAGS,
  IndexAttributeBooleanFlag,
} from './useIndexInfo.constants'
import { IndexAttribute, IndexInfo } from './useIndexInfo.types'

/**
 * Converts API field type (uppercase) to FieldTypes enum (lowercase).
 */
export const normalizeFieldType = (type: string): FieldTypes =>
  type.toLowerCase() as FieldTypes

/**
 * Collect boolean FT.INFO flags that are set on an API attribute.
 * Only truthy flags are kept — Redis emits these as presence tokens.
 */
export const collectAttributeFlags = (
  attr: IndexAttibuteDto,
): IndexAttribute['flags'] => {
  const flags: Partial<Record<IndexAttributeBooleanFlag, true>> = {}

  INDEX_ATTRIBUTE_BOOLEAN_FLAGS.forEach((flag) => {
    if (attr[flag]) {
      flags[flag] = true
    }
  })

  return Object.keys(flags).length ? flags : undefined
}

/**
 * Transforms API response (DTO) to frontend model (IndexInfo).
 * Normalizes field types and converts snake_case to camelCase.
 */
export const transformIndexInfo = (data: IndexInfoDto): IndexInfo => ({
  indexDefinition: {
    keyType: data.index_definition.key_type,
    prefixes: data.index_definition.prefixes,
  },
  indexOptions: data.index_options
    ? {
        filter: data.index_options.filter,
        defaultLang: data.index_options.default_lang,
      }
    : undefined,
  attributes: data.attributes.map((attr) => ({
    identifier: attr.identifier,
    attribute: attr.attribute,
    type: normalizeFieldType(attr.type),
    weight: attr.WEIGHT,
    flags: collectAttributeFlags(attr),
  })),
  numDocs: Number(data.num_docs) || 0,
  maxDocId: Number(data.max_doc_id) || 0,
  numRecords: Number(data.num_records) || 0,
  numTerms: Number(data.num_terms) || 0,
})
