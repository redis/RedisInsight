export const ARRAY_TABLE_EMPTY_MESSAGE = 'No elements in range'
export const ARRAY_TABLE_LOADING_MESSAGE = 'Loading…'

// Array results table column widths, shared with NeighbourBand so the expanded
// row mirrors the same layout. The fixed table-layout shares slack in these
// proportions, so their ratios hold at any width. px sizes assume the app's
// 62.5% root (1rem = 10px) — the scale the rem selection width also resolves to.
export const INDEX_COLUMN_SIZE = 140
export const VALUE_COLUMN_SIZE = 420
export const ACTIONS_COLUMN_SIZE = 48
// Snug around the 1.8rem checkbox (side padding via SELECTION_COLUMN_CELL_CLASS),
// not redis-ui's default 4.2rem.
export const SELECTION_COLUMN_WIDTH_REM = 2.6
export const SELECTION_COLUMN_CELL_CLASS = 'array-selection-cell'
