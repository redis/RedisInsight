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
