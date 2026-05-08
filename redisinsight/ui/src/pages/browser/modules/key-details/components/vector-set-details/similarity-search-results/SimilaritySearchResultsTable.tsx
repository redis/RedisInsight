import React, { memo, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { selectedKeySelector } from 'uiSrc/slices/browser/keys'

import { getSimilarityResultsColumns } from './SimilaritySearchResultsTable.config'
import { SIMILARITY_RESULTS_EMPTY_MESSAGE } from './constants'
import { SimilaritySearchResultsTableProps } from './SimilaritySearchResultsTable.types'
import * as S from './SimilaritySearchResultsTable.styles'

const SimilaritySearchResultsTable = memo(
  ({
    matches,
    'data-testid': dataTestId = 'vector-set-similarity-results',
  }: SimilaritySearchResultsTableProps) => {
    const { compressor = null } = useSelector(connectedInstanceSelector)
    const { viewFormat } = useSelector(selectedKeySelector)

    const sortedMatches = useMemo(
      () => [...matches].sort((a, b) => b.score - a.score),
      [matches],
    )

    const columns = useMemo(
      () => getSimilarityResultsColumns({ compressor, viewFormat }),
      [compressor, viewFormat],
    )

    return (
      <S.Container data-testid={dataTestId}>
        <S.StyledTable
          columns={columns}
          data={sortedMatches}
          stripedRows
          paginationEnabled={false}
          emptyState={SIMILARITY_RESULTS_EMPTY_MESSAGE}
          data-testid={`${dataTestId}-table`}
        />
      </S.Container>
    )
  },
)

SimilaritySearchResultsTable.displayName = 'SimilaritySearchResultsTable'

export { SimilaritySearchResultsTable }
