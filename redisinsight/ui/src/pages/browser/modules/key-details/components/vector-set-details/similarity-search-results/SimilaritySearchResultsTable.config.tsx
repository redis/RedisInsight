import React from 'react'

import { ColumnDef, Row as TableRow } from 'uiSrc/components/base/layout/table'
import { VectorSetSimilarityMatch } from 'uiSrc/slices/interfaces/vectorSet'

import { ElementNameCell } from '../vector-set-element-list/components/ElementNameCell/ElementNameCell'
import { formatSimilarity } from './utils'
import {
  HIGH_SIMILARITY_THRESHOLD,
  SIMILARITY_RESULTS_COLUMN_HEADERS,
} from './constants'
import {
  SimilarityResultsColumn,
  SimilarityResultsListConfig,
} from './SimilaritySearchResultsTable.types'
import * as S from './SimilaritySearchResultsTable.styles'

const createNameColumn = (
  listConfig: SimilarityResultsListConfig,
): ColumnDef<VectorSetSimilarityMatch> => {
  const { compressor, viewFormat } = listConfig
  return {
    id: SimilarityResultsColumn.Name,
    accessorKey: SimilarityResultsColumn.Name,
    header: SIMILARITY_RESULTS_COLUMN_HEADERS[SimilarityResultsColumn.Name],
    enableSorting: false,
    size: 200,
    cell: ({ row }: { row: TableRow<VectorSetSimilarityMatch> }) => (
      <ElementNameCell
        element={row.original}
        compressor={compressor}
        viewFormat={viewFormat}
      />
    ),
  }
}

const createSimilarityColumn = (): ColumnDef<VectorSetSimilarityMatch> => ({
  id: SimilarityResultsColumn.Similarity,
  accessorKey: SimilarityResultsColumn.Similarity,
  header: SIMILARITY_RESULTS_COLUMN_HEADERS[SimilarityResultsColumn.Similarity],
  enableSorting: false,
  size: 120,
  cell: ({ row }: { row: TableRow<VectorSetSimilarityMatch> }) => {
    const { score } = row.original
    const isHigh = Number.isFinite(score) && score >= HIGH_SIMILARITY_THRESHOLD
    return (
      <S.SimilarityCell
        $isHigh={isHigh}
        data-testid={`vector-set-similarity-cell-${row.index}`}
        title={String(score)}
      >
        {formatSimilarity(score)}
      </S.SimilarityCell>
    )
  },
})

export const getSimilarityResultsColumns = (
  listConfig: SimilarityResultsListConfig,
): ColumnDef<VectorSetSimilarityMatch>[] => [
  createNameColumn(listConfig),
  createSimilarityColumn(),
]
