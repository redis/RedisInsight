import React, { memo, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { selectedKeySelector } from 'uiSrc/slices/browser/keys'

import {
  SIMILARITY_RESULTS_EMPTY_MESSAGE,
  SIMILARITY_RESULTS_TABLE_MIN_COLUMN_WIDTH,
  SIMILARITY_RESULTS_TABLE_MIN_WIDTH_FALLBACK,
} from './constants'
import { SimilaritySearchResultsTableProps } from './SimilaritySearchResultsTable.types'
import * as S from './SimilaritySearchResultsTable.styles'

const TEST_ID = 'vector-set-similarity-results'

const SimilaritySearchResultsTable = memo(
  ({
    matches,
    columns,
    columnVisibility,
    parsedAttributesCache,
  }: SimilaritySearchResultsTableProps) => {
    const { compressor = null } = useSelector(connectedInstanceSelector)
    const { viewFormat } = useSelector(selectedKeySelector)

    const sortedMatches = useMemo(
      () => [...matches].sort((a, b) => b.score - a.score),
      [matches],
    )

    const meta = useMemo(
      () =>
        ({
          compressor,
          viewFormat,
          parsedAttributesCache,
        }) as SimilarityResultsCellMeta,
      [compressor, viewFormat, parsedAttributesCache],
    )

    // Force the table to grow wider than its container (and scroll
    // horizontally) when there are many attribute columns, instead of
    // squishing every column into a narrow, ellipsised cell. Driven by the
    // count of *visible* columns so hiding attributes via the Columns popover
    // shrinks the table back down.
    const tableMinWidth = useMemo(() => {
      const visibleCount = columns.filter(
        (column) => columnVisibility[column.id as string] !== false,
      ).length
      const computed = visibleCount * SIMILARITY_RESULTS_TABLE_MIN_COLUMN_WIDTH
      return `${Math.max(computed, SIMILARITY_RESULTS_TABLE_MIN_WIDTH_FALLBACK)}px`
    }, [columns, columnVisibility])

    return (
      <S.Container data-testid={TEST_ID}>
        <S.StyledTable
          columns={columns}
          data={sortedMatches}
          meta={meta}
          columnVisibility={columnVisibility}
          stripedRows
          enableColumnResizing
          minWidth={tableMinWidth}
          paginationEnabled={false}
          emptyState={SIMILARITY_RESULTS_EMPTY_MESSAGE}
          data-testid={`${TEST_ID}-table`}
        />
      </S.Container>
    )
  },
)

SimilaritySearchResultsTable.displayName = 'SimilaritySearchResultsTable'

export { SimilaritySearchResultsTable }
