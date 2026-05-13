import { SimilarityResultsColumn } from './SimilaritySearchResultsTable.types'

export const SIMILARITY_RESULTS_COLUMN_HEADERS: Record<
  SimilarityResultsColumn,
  string
> = {
  [SimilarityResultsColumn.Name]: 'Element',
  [SimilarityResultsColumn.Similarity]: 'Similarity',
}

export const SIMILARITY_RESULTS_EMPTY_MESSAGE = 'No matching elements found.'

/**
 * Scores at or above this threshold are treated as a "high" match and
 * rendered with a success color so users can spot strong hits at a glance.
 * Expressed in the same `[0, 1]` space the BE returns.
 */
export const HIGH_SIMILARITY_THRESHOLD = 0.85

/** Prefix for dynamic attribute column ids — avoids collision with `name` / `similarity`. */
export const SIMILARITY_RESULTS_ATTRIBUTE_COLUMN_ID_PREFIX = 'attr_'

/**
 * Per-column widths (in px). Sized so each column comfortably fits its content
 * without ellipsing for typical values. Combined with the per-table
 * `minWidth` we compute, this lets the table grow wider than its container
 * and scroll horizontally instead of squishing every column.
 *
 * `NAME_COLUMN_MIN_SIZE` is a floor — the name column is auto-sized via
 * `getHeaderCellProps` and can grow to absorb leftover space.
 */
export const SIMILARITY_RESULTS_NAME_COLUMN_MIN_SIZE = 200
export const SIMILARITY_RESULTS_SIMILARITY_COLUMN_SIZE = 100
export const SIMILARITY_RESULTS_ATTRIBUTE_COLUMN_SIZE = 140
