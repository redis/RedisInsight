import React, { memo, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { selectedKeySelector } from 'uiSrc/slices/browser/keys'

import { SimilarityResultsCellMeta } from './SimilaritySearchResultsTable.config'
import { SIMILARITY_RESULTS_EMPTY_MESSAGE } from './constants'
import { SimilaritySearchResultsTableProps } from './SimilaritySearchResultsTable.types'
import * as S from './SimilaritySearchResultsTable.styles'

const TEST_ID = 'vector-set-similarity-results'

const SimilaritySearchResultsTable = memo(
  ({
    matches,
    columns,
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

    return (
      <S.Container data-testid={TEST_ID}>
        <S.StyledTable
          columns={columns}
          data={sortedMatches}
          meta={meta}
          stripedRows
          enableColumnResizing
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
