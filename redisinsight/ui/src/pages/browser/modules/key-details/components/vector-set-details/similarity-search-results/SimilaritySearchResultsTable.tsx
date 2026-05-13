import React, { memo, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { selectedKeySelector } from 'uiSrc/slices/browser/keys'

import { SIMILARITY_RESULTS_COLUMNS } from './SimilaritySearchResultsTable.config'
import { SIMILARITY_RESULTS_EMPTY_MESSAGE } from './constants'
import { SimilaritySearchResultsTableProps } from './SimilaritySearchResultsTable.types'
import * as S from './SimilaritySearchResultsTable.styles'

const TEST_ID = 'vector-set-similarity-results'

const SimilaritySearchResultsTable = memo(
  ({ matches }: SimilaritySearchResultsTableProps) => {
    const { compressor = null } = useSelector(connectedInstanceSelector)
    const { viewFormat } = useSelector(selectedKeySelector)

    const sortedMatches = useMemo(
      () => [...matches].sort((a, b) => b.score - a.score),
      [matches],
    )

    return (
      <S.Container data-testid={TEST_ID}>
        <S.StyledTable
          columns={SIMILARITY_RESULTS_COLUMNS}
          data={sortedMatches}
          meta={{ compressor, viewFormat }}
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
