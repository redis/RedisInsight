import React from 'react'
import { useSelector } from 'react-redux'

import { TelemetryPageView } from 'uiSrc/telemetry'
import { usePageViewTelemetry } from 'uiSrc/telemetry/usePageViewTelemetry'
import { Loader } from 'uiSrc/components/base/display'
import { formatLongName, getDbIndex, setTitle } from 'uiSrc/utils'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'

import {
  useRedisInstanceCompatibility,
  useRedisearchListData,
} from '../../hooks'
import { RqeNotAvailable } from '../../components/rqe-not-available'
import { VectorSearchWelcomePage } from '../VectorSearchWelcomePage'
import { VectorSearchListPage } from '../VectorSearchListPage'
import * as S from '../styles'

/**
 * Main Vector Search page component.
 * Acts as the entry point that selects and renders the appropriate screen
 * based on the current state (RQE support, indexes availability).
 */
export const VectorSearchPage = () => {
  const { hasRedisearch, loading: compatibilityLoading } =
    useRedisInstanceCompatibility()
  const { stringData: indexes, loading: indexesLoading } =
    useRedisearchListData()

  const { name: connectedInstanceName, db } = useSelector(
    connectedInstanceSelector,
  )

  usePageViewTelemetry({
    page: TelemetryPageView.VECTOR_SEARCH_PAGE,
  })

  setTitle(
    `${formatLongName(connectedInstanceName, 33, 0, '...')} ${getDbIndex(db)} - Vector Search`,
  )

  if (hasRedisearch === false && compatibilityLoading === false) {
    return (
      <S.PageWrapper data-testid="vector-search-page--rqe-not-available">
        <RqeNotAvailable />
      </S.PageWrapper>
    )
  }

  if (compatibilityLoading !== false || indexesLoading !== false) {
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
