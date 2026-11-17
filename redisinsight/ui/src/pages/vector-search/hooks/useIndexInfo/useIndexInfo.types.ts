import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'

import { IndexAttributeBooleanFlag } from './useIndexInfo.constants'

/**
 * Frontend types for index information.
 * The hook transforms API response (DTO) to these types.
 */

export interface IndexAttribute {
  identifier: string
  attribute: string
  type: FieldTypes
  weight?: string
  /** Present boolean FT.INFO flags only (true when set on the attribute). */
  flags?: Partial<Record<IndexAttributeBooleanFlag, true>>
}

export interface IndexDefinition {
  keyType: string
  prefixes: string[]
}

export interface IndexOptions {
  filter?: string
  defaultLang?: string
}

/**
 * Index information as used by the frontend.
 * This is the single source of truth for index data on the FE.
 */
export interface IndexInfo {
  indexDefinition: IndexDefinition
  indexOptions?: IndexOptions
  attributes: IndexAttribute[]
  numDocs: number
  maxDocId: number
  numRecords: number
  numTerms: number
}

/**
 * Hook options and result types.
 */

export interface UseIndexInfoOptions {
  indexName: string
}

export interface UseIndexInfoResult {
  indexInfo: IndexInfo | null
  loading: boolean
  error: string | null
  refetch: () => void
}
