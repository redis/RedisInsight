import React, { memo, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { selectedKeySelector } from 'uiSrc/slices/browser/keys'

import {
  SIMILARITY_RESULTS_ATTRIBUTE_COLUMN_ID_PREFIX,
  SIMILARITY_RESULTS_ATTRIBUTE_COLUMN_SIZE,
  SIMILARITY_RESULTS_EMPTY_MESSAGE,
  SIMILARITY_RESULTS_NAME_COLUMN_MIN_SIZE,
  SIMILARITY_RESULTS_SIMILARITY_COLUMN_SIZE,
} from './constants'
import {
  SimilarityResultsListConfig,
  SimilaritySearchResultsTableProps,
} from './SimilaritySearchResultsTable.types'
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
        }) as SimilarityResultsListConfig,
      [compressor, viewFormat, parsedAttributesCache],
    )

    // Force the table to overflow (and scroll horizontally) once the columns
    // can no longer fit comfortably inside the container, instead of squishing
    // every column. The min-width is the actual sum of column widths so the
    // browser only stretches the auto-sized name column with leftover space.
    const tableMinWidth = useMemo(() => {
      const visibleAttributeCount = columns.filter(
        (column) =>
          column.id?.startsWith(
            SIMILARITY_RESULTS_ATTRIBUTE_COLUMN_ID_PREFIX,
          ) && columnVisibility[column.id] !== false,
      ).length
      const total =
        SIMILARITY_RESULTS_NAME_COLUMN_MIN_SIZE +
        SIMILARITY_RESULTS_SIMILARITY_COLUMN_SIZE +
        visibleAttributeCount * SIMILARITY_RESULTS_ATTRIBUTE_COLUMN_SIZE
      return `${total}px`
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
