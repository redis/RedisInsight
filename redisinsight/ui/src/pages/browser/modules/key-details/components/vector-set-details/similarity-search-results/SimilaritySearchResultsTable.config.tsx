import React from 'react'

import {
  CellContext,
  ColumnDef,
  Row as TableRow,
} from 'uiSrc/components/base/layout/table'
import { VectorSetSimilarityMatch } from 'uiSrc/slices/interfaces/vectorSet'

import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'
import { ElementNameCell } from '../vector-set-element-list/components/ElementNameCell/ElementNameCell'
import { formatSimilarity } from './utils'
import { bufferToString } from 'uiSrc/utils'
import {
  getParsedAttributes,
  parseAttributes,
  renderAttributeValue,
} from './utils/parseAttributes'
import {
  HIGH_SIMILARITY_THRESHOLD,
  SIMILARITY_RESULTS_ATTRIBUTE_COLUMN_ID_PREFIX,
  SIMILARITY_RESULTS_ATTRIBUTE_COLUMN_SIZE,
  SIMILARITY_RESULTS_COLUMN_HEADERS,
  SIMILARITY_RESULTS_NAME_COLUMN_MIN_SIZE,
  SIMILARITY_RESULTS_RANK_COLUMN_SIZE,
  SIMILARITY_RESULTS_SIMILARITY_COLUMN_SIZE,
} from './constants'
import {
  SimilarityResultsCellMeta,
  SimilarityResultsColumn,
  SimilarityResultsListConfig,
} from './SimilaritySearchResultsTable.types'
import * as S from './SimilaritySearchResultsTable.styles'
import { KeyValueFormat } from 'uiSrc/constants'

const nameColumn: ColumnDef<VectorSetSimilarityMatch> = {
  id: SimilarityResultsColumn.Name,
  accessorKey: SimilarityResultsColumn.Name,
  header: SIMILARITY_RESULTS_COLUMN_HEADERS[SimilarityResultsColumn.Name],
  enableSorting: true,
  sortingFn: (rowA, rowB) =>
    bufferToString(rowA.original.name)
      .toLowerCase()
      .localeCompare(bufferToString(rowB.original.name).toLowerCase()),
  minSize: SIMILARITY_RESULTS_NAME_COLUMN_MIN_SIZE,
  size: SIMILARITY_RESULTS_NAME_COLUMN_MIN_SIZE,
  sizeUnit: 'px',
  getHeaderCellProps: () => ({
    style: {
      width: 'auto',
      minWidth: `${SIMILARITY_RESULTS_NAME_COLUMN_MIN_SIZE}px`,
    },
  }),
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

const rankColumn: ColumnDef<VectorSetSimilarityMatch> = {
  id: SimilarityResultsColumn.Rank,
  accessorKey: SimilarityResultsColumn.Rank,
  header: SIMILARITY_RESULTS_COLUMN_HEADERS[SimilarityResultsColumn.Rank],
  enableSorting: true,
  size: SIMILARITY_RESULTS_RANK_COLUMN_SIZE,
  minSize: SIMILARITY_RESULTS_RANK_COLUMN_SIZE,
  maxSize: SIMILARITY_RESULTS_RANK_COLUMN_SIZE,
  sizeUnit: 'px',
  cell: ({ row }: { row: TableRow<VectorSetSimilarityMatch> }) => {
    const { rank } = row.original
    return (
      <RiBadge
        data-testid={`vector-set-similarity-rank-cell-${row.index}`}
        label={rank !== undefined ? `#${rank}` : ''}
      />
    )
  },
}

const similarityColumn: ColumnDef<VectorSetSimilarityMatch> = {
  id: SimilarityResultsColumn.Similarity,
  accessorKey: SimilarityResultsColumn.Similarity,
  header: SIMILARITY_RESULTS_COLUMN_HEADERS[SimilarityResultsColumn.Similarity],
  size: SIMILARITY_RESULTS_SIMILARITY_COLUMN_SIZE,
  minSize: SIMILARITY_RESULTS_SIMILARITY_COLUMN_SIZE,
  maxSize: SIMILARITY_RESULTS_SIMILARITY_COLUMN_SIZE,
  sizeUnit: 'px',
  enableSorting: true,
  sortingFn: (rowA, rowB) =>
    Number(rowA.original.score) - Number(rowB.original.score),
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

const buildAttributeColumn = (
  key: string,
): ColumnDef<VectorSetSimilarityMatch> => ({
  id: `${SIMILARITY_RESULTS_ATTRIBUTE_COLUMN_ID_PREFIX}${key}`,
  header: key,
  size: SIMILARITY_RESULTS_ATTRIBUTE_COLUMN_SIZE,
  sizeUnit: 'px',
  enableSorting: true,
  // `getParsedAttributes` memoizes per match so sorting doesn't re-parse JSON
  // on every comparison. `accessorFn` makes this a sortable data column.
  accessorFn: (row) => getParsedAttributes(row)[key],
  sortingFn: (rowA, rowB) =>
    renderAttributeValue(getParsedAttributes(rowA.original)[key])
      .toLowerCase()
      .localeCompare(
        renderAttributeValue(
          getParsedAttributes(rowB.original)[key],
        ).toLowerCase(),
      ),
  cell: ({ row, table }: CellContext<VectorSetSimilarityMatch, unknown>) => {
    const { parsedAttributesCache } = table.options
      .meta as SimilarityResultsCellMeta
    const attrs =
      parsedAttributesCache.get(row.original) ??
      parseAttributes(row.original.attributes)
    const hasOwn = Object.prototype.hasOwnProperty.call(attrs, key)
    const value = hasOwn ? attrs[key] : undefined
    const isMissing = !hasOwn || value === null || value === undefined
    return (
      <S.AttributeCell
        data-testid={`vector-set-similarity-attribute-cell-${row.index}-${key}`}
      >
        {isMissing ? (
          <S.NilAttributeValue variant="italic">Empty</S.NilAttributeValue>
        ) : (
          renderAttributeValue(value)
        )}
      </S.AttributeCell>
    )
  },
})

export const buildSimilarityResultsColumns = (
  attributeKeys: string[],
): ColumnDef<VectorSetSimilarityMatch>[] => [
  nameColumn,
  ...attributeKeys.map(buildAttributeColumn),
  rankColumn,
  similarityColumn,
]
