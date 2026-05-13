import { KeyValueCompressor, KeyValueFormat } from 'uiSrc/constants'
import { ColumnDef } from 'uiSrc/components/base/layout/table'
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
  columns: ColumnDef<VectorSetSimilarityMatch>[]
  /** `@redis-ui/table` visibility map (`{ [columnId]: false }`). */
  columnVisibility: Record<string, boolean>
  parsedAttributesCache: WeakMap<
    VectorSetSimilarityMatch,
    Record<string, unknown>
  >
}
