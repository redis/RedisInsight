import { VectorSetSimilarityMatch } from 'uiSrc/slices/interfaces/vectorSet'

export interface UseSimilaritySearchResultsResult {
  /** True once a search has produced a response for the current key. */
  hasResults: boolean
  /** Matches from the latest successful search; empty when none. */
  matches: VectorSetSimilarityMatch[]
}
