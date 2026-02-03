/**
 * Frontend types for index information.
 * The hook transforms API response (DTO) to these types.
 */

export interface IndexAttribute {
  identifier: string
  attribute: string
  type: string
  weight?: string
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
