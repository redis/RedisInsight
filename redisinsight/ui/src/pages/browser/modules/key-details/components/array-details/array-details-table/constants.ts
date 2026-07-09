export const ARRAY_TABLE_EMPTY_MESSAGE = 'No elements in range'
export const ARRAY_TABLE_LOADING_MESSAGE = 'Loading…'

// --- Array results table column sizing (see ArrayDetailsTable.config) ---
// Base column widths. redis-ui's `Table` uses table-layout: fixed and hands out
// slack proportionally to these, so their ratios hold at any table width. Shared
// with NeighbourBand so the expanded row can mirror the same layout and line up
// under the parent columns. The px sizes assume the app's 62.5% root (1rem =
// 10px), the same scale the rem-based selection width resolves to.
export const INDEX_COLUMN_SIZE = 140
export const VALUE_COLUMN_SIZE = 420
export const ACTIONS_COLUMN_SIZE = 48
// The row-selection checkbox is 1.8rem; size its column snugly around it
// (checkbox + `space050` side padding, applied via SELECTION_COLUMN_CELL_CLASS)
// instead of redis-ui's default 4.2rem.
export const SELECTION_COLUMN_WIDTH_REM = 2.6
export const SELECTION_COLUMN_CELL_CLASS = 'array-selection-cell'
