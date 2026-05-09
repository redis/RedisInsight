import { KeyValueCompressor, KeyValueFormat } from 'uiSrc/constants'
import { VectorSetSimilarityMatch } from 'uiSrc/slices/interfaces/vectorSet'
import { Nullable } from 'uiSrc/utils'

export enum SimilarityResultsColumn {
  Name = 'name',
  Similarity = 'similarity',
}

export interface SimilarityResultsListConfig {
  compressor: Nullable<KeyValueCompressor>
  viewFormat: KeyValueFormat
}

export interface SimilaritySearchResultsTableProps {
  matches: VectorSetSimilarityMatch[]
}
