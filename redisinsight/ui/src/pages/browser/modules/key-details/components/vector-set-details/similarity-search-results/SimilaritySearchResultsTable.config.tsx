import React from 'react'

import {
  CellContext,
  ColumnDef,
  Row as TableRow,
} from 'uiSrc/components/base/layout/table'
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
import { KeyValueFormat } from 'uiSrc/constants'

const nameColumn: ColumnDef<VectorSetSimilarityMatch> = {
  id: SimilarityResultsColumn.Name,
  accessorKey: SimilarityResultsColumn.Name,
  header: SIMILARITY_RESULTS_COLUMN_HEADERS[SimilarityResultsColumn.Name],
  enableSorting: false,
  size: 200,
  cell: ({ row, table }: CellContext<VectorSetSimilarityMatch, unknown>) => {
    const { compressor = null, viewFormat } = table.options
      .meta as SimilarityResultsListConfig
    return (
      <ElementNameCell
        element={row.original}
        compressor={compressor}
        viewFormat={viewFormat ?? KeyValueFormat.JSON}
      />
    )
  },
}

const similarityColumn: ColumnDef<VectorSetSimilarityMatch> = {
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
      >
        {formatSimilarity(score)}
      </S.SimilarityCell>
    )
  },
}

export const SIMILARITY_RESULTS_COLUMNS: ColumnDef<VectorSetSimilarityMatch>[] =
  [nameColumn, similarityColumn]
