import { ParseKeys } from 'i18next'

export const ARRAY_TABLE_EMPTY_MESSAGE: ParseKeys = 'browser.array.table.empty'
export const ARRAY_TABLE_LOADING_MESSAGE: ParseKeys =
  'browser.array.table.loading'

// Array results table column widths, shared with NeighbourBand so the expanded
// row lines up with the same columns.
export const INDEX_COLUMN_SIZE = 140
export const VALUE_COLUMN_SIZE = 420
// Snug fit for the row hover actions (edit · expand · delete).
export const ACTIONS_COLUMN_SIZE = 60
// Snug around the 1.8rem checkbox, not redis-ui's default 4.2rem.
export const SELECTION_COLUMN_WIDTH_REM = 2.6
export const SELECTION_COLUMN_CELL_CLASS = 'array-selection-cell'
export const ACTIONS_COLUMN_CELL_CLASS = 'array-actions-cell'
