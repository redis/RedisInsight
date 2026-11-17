import { ParseKeys } from 'i18next'

export const SIMILARITY_SEARCH_FORM_TEST_ID = 'similarity-search-form'
export const COMMAND_PREVIEW_TEST_ID = 'similarity-search-command-preview'

export const SIMILARITY_SEARCH_COUNT_DEFAULT = 10
export const SIMILARITY_SEARCH_COUNT_MIN = 1
export const SIMILARITY_SEARCH_COUNT_MAX = 1000

export const VECTOR_PLACEHOLDER: ParseKeys =
  'browser.vectorSet.search.vectorPlaceholder'
export const ELEMENT_PLACEHOLDER: ParseKeys =
  'browser.vectorSet.search.elementPlaceholder'
// A filter-syntax example — kept literal (code), like the filter help examples.
export const FILTER_PLACEHOLDER = 'e.g. .price > 50 and .category == "books"'

export const VECTOR_MODE_TOOLTIP: ParseKeys =
  'browser.vectorSet.search.vectorModeTooltip'
export const ELEMENT_MODE_TOOLTIP: ParseKeys =
  'browser.vectorSet.search.elementModeTooltip'

export const QUERY_NOT_READY_TOOLTIP: ParseKeys =
  'browser.vectorSet.search.queryNotReadyTooltip'
