import { KeyValueCompressor, KeyValueFormat } from 'uiSrc/constants'
import { ColumnDef } from 'uiSrc/components/base/layout/table'
import { VectorSetSimilarityMatch } from 'uiSrc/slices/interfaces/vectorSet'
import { Nullable } from 'uiSrc/utils'
import { VectorSetActionsConfig } from '../vector-set-element-list/VectorSetElementList.types'

export enum SimilarityResultsColumn {
  Name = 'name',
  Rank = 'rank',
  Similarity = 'similarity',
  Actions = 'actions',
}

export interface SimilarityResultsListConfig {
  compressor: Nullable<KeyValueCompressor>
  viewFormat: KeyValueFormat
}

export type ParsedAttributesCache = WeakMap<
  VectorSetSimilarityMatch,
  Record<string, unknown>
>

export interface SimilarityResultsCellMeta extends SimilarityResultsListConfig {
  parsedAttributesCache: ParsedAttributesCache
  actionsConfig?: VectorSetActionsConfig
}

export interface SimilaritySearchResultsTableProps {
  matches: VectorSetSimilarityMatch[]
  columns: ColumnDef<VectorSetSimilarityMatch>[]
  /** `@redis-ui/table` visibility map (`{ [columnId]: false }`). */
  columnVisibility: Record<string, boolean>
  parsedAttributesCache: ParsedAttributesCache
  actionsConfig?: VectorSetActionsConfig
}
