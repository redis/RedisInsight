import { ParseKeys } from 'i18next'
import { VectorSetColumn } from './VectorSetElementList.types'

export const DEFAULT_PAGE_SIZE = 10

// Header values are i18n keys resolved with t() at render; Actions has no title.
export const VECTOR_SET_COLUMN_HEADERS: Record<VectorSetColumn, string> = {
  [VectorSetColumn.Name]: 'browser.vectorSet.list.elementColumn',
  [VectorSetColumn.Actions]: '',
}

/** Width (in px) of the actions column in the element-list table. */
export const ACTIONS_COLUMN_SIZE = 100

/**
 * Minimum per-column width (in px) used to derive the table's overall
 * minimum width when no auto-sizing kicks in.
 */
export const MIN_COLUMN_WIDTH = 100

/** Lower bound (in px) for the table's minimum width regardless of column count. */
export const MIN_TABLE_WIDTH_FLOOR = 550

/** Empty-state messages shown in the element-list table. */
export const ELEMENT_LIST_LOADING_MESSAGE: ParseKeys =
  'browser.vectorSet.list.loading'
export const ELEMENT_LIST_EMPTY_MESSAGE: ParseKeys =
  'browser.vectorSet.list.empty'

/**
 * Appended to a row id to scope the delete-confirmation popover to the
 * vector-set element list. Prevents popover-id collisions with other tables.
 */
export const ELEMENT_DELETE_POPOVER_SUFFIX = '_vectorSet'
