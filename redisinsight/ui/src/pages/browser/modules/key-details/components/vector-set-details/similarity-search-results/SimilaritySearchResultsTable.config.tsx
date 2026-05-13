import React from 'react'

import {
  CellContext,
  ColumnDef,
  Row as TableRow,
} from 'uiSrc/components/base/layout/table'
import { VectorSetSimilarityMatch } from 'uiSrc/slices/interfaces/vectorSet'

import { ElementNameCell } from '../vector-set-element-list/components/ElementNameCell/ElementNameCell'
import { formatSimilarity } from './utils'
import { parseAttributes, renderAttributeValue } from './utils/parseAttributes'
import {
  HIGH_SIMILARITY_THRESHOLD,
  SIMILARITY_RESULTS_ATTRIBUTE_COLUMN_ID_PREFIX,
  SIMILARITY_RESULTS_ATTRIBUTE_COLUMN_SIZE,
  SIMILARITY_RESULTS_COLUMN_HEADERS,
  SIMILARITY_RESULTS_NAME_COLUMN_SIZE,
  SIMILARITY_RESULTS_SIMILARITY_COLUMN_SIZE,
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
  size: SIMILARITY_RESULTS_NAME_COLUMN_SIZE,
  sizeUnit: 'px',
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
  size: SIMILARITY_RESULTS_SIMILARITY_COLUMN_SIZE,
  sizeUnit: 'px',
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

/** Build a column for a single attribute key. */
const buildAttributeColumn = (
  key: string,
): ColumnDef<VectorSetSimilarityMatch> => ({
  id: `${SIMILARITY_RESULTS_ATTRIBUTE_COLUMN_ID_PREFIX}${key}`,
  header: key,
  enableSorting: false,
  size: SIMILARITY_RESULTS_ATTRIBUTE_COLUMN_SIZE,
  sizeUnit: 'px',
  cell: ({ row }: CellContext<VectorSetSimilarityMatch, unknown>) => {
    const attrs = parseAttributes(row.original.attributes)
    return (
      <S.AttributeCell
        data-testid={`vector-set-similarity-attribute-cell-${row.index}-${key}`}
      >
        {renderAttributeValue(attrs[key])}
      </S.AttributeCell>
    )
  },
})

/**
 * Element + Similarity (sticky-left), followed by one column per attribute
 * key. `attributeKeys` is expected to be in stable alphabetical order.
 */
export const buildSimilarityResultsColumns = (
  attributeKeys: string[],
): ColumnDef<VectorSetSimilarityMatch>[] => [
  nameColumn,
  similarityColumn,
  ...attributeKeys.map(buildAttributeColumn),
]

/** Static-only column list (for call sites that don't thread attribute keys). */
export const SIMILARITY_RESULTS_COLUMNS: ColumnDef<VectorSetSimilarityMatch>[] =
  buildSimilarityResultsColumns([])
