import React from 'react'
import { useSelector } from 'react-redux'

import { TelemetryPageView } from 'uiSrc/telemetry'
import { usePageViewTelemetry } from 'uiSrc/telemetry/usePageViewTelemetry'
import { Loader } from 'uiSrc/components/base/display'
import {
  formatLongName,
  getDbIndex,
  getRedisearchVersion,
  setTitle,
} from 'uiSrc/utils'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'

import { useRedisearchListData } from '../../hooks'
import { VectorSearchWelcomePage } from '../VectorSearchWelcomePage'
import { VectorSearchListPage } from '../VectorSearchListPage'
import * as S from '../styles'

/**
 * Main Vector Search page component.
 * Acts as the entry point that selects and renders the appropriate screen
 * based on the current state (indexes availability).
 * RediSearch module availability is guarded at the router level (VectorSearchPageRouter).
 */
export const VectorSearchPage = () => {
  const { stringData: indexes, loading: indexesLoading } =
    useRedisearchListData()

  const {
    name: connectedInstanceName,
    db,
    provider,
    modules,
  } = useSelector(connectedInstanceSelector)

  const isReady = indexesLoading === false

  usePageViewTelemetry({
    page: TelemetryPageView.VECTOR_SEARCH_PAGE,
    ready: isReady,
    eventData: {
      rqe_version: getRedisearchVersion(modules),
      provider,
      number_of_indexes: indexes.length,
      welcome_page_enabled: indexes.length === 0,
    },
  })

  setTitle(
    `${formatLongName(connectedInstanceName, 33, 0, '...')} ${getDbIndex(db)} - Vector Search`,
  )

  if (indexesLoading !== false) {
    return (
      <S.PageWrapper
        data-testid="vector-search-page--loading"
        align="center"
        justify="center"
      >
        <Loader size="xl" data-testid="vector-search-loader" />
      </S.PageWrapper>
    )
  }

  if (indexes.length === 0) {
    return (
      <S.PageWrapper data-testid="vector-search-page--welcome">
        <VectorSearchWelcomePage />
      </S.PageWrapper>
    )
  }

  // Show index list when indexes exist
  return (
    <S.PageWrapper data-testid="vector-search-page--list">
      <VectorSearchListPage />
    </S.PageWrapper>
  )
}
