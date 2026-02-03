import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import {
  IndexInfo,
  IndexOptions,
} from 'uiSrc/pages/vector-search/hooks/useIndexInfo'

import { IndexInfoTableData } from './IndexInfo.types'

/**
 * Parses index attributes to table-friendly format.
 * Expects field types to already be normalized (lowercase).
 */
export const parseIndexAttributes = (
  indexInfo: IndexInfo,
): IndexInfoTableData[] =>
  indexInfo.attributes.map((field) => ({
    identifier: field.identifier,
    attribute: field.attribute,
    type: field.type as FieldTypes,
    weight: field.weight,
  }))

/**
 * Formats index options for display.
 * Returns a comma-separated string of option key-value pairs.
 */
export const formatOptions = (options: IndexOptions): string => {
  const optionParts: string[] = []

  if (options.filter) {
    optionParts.push(`filter: ${options.filter}`)
  }

  if (options.defaultLang) {
    optionParts.push(`language: ${options.defaultLang}`)
  }

  return optionParts.join(', ')
}

/**
 * Formats prefixes array for display.
 * Joins prefixes with comma and wraps each in quotes.
 */
export const formatPrefixes = (prefixes: string[] | undefined): string => {
  if (!prefixes || prefixes.length === 0) {
    return ''
  }

  return prefixes.map((prefix) => `"${prefix}"`).join(', ')
}

/**
 * Checks if index options object has any meaningful options.
 */
export const hasIndexOptions = (options: IndexOptions | undefined): boolean => {
  if (!options) {
    return false
  }

  return Boolean(options.filter || options.defaultLang)
}
