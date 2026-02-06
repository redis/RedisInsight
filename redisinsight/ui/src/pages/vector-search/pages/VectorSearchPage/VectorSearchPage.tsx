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
import {
  RqeNotAvailableScreen,
  WelcomeScreen,
  IndexListScreen,
} from '../components'
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

  // Treat undefined (uninitialized) as loading so we don't render WelcomeScreen before compatibility is known
  const isLoading = compatibilityLoading !== false || indexesLoading

  // Show loader while checking compatibility or loading indexes
  if (isLoading) {
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

  // Show RQE not available screen if RediSearch module is not loaded
  if (compatibilityLoading === false && hasRedisearch === false) {
    return (
      <S.PageWrapper data-testid="vector-search-page--rqe-not-available">
        <RqeNotAvailableScreen />
      </S.PageWrapper>
    )
  }

  // Show welcome screen when no indexes exist
  if (indexes.length === 0) {
    return (
      <S.PageWrapper data-testid="vector-search-page--welcome">
        <WelcomeScreen />
      </S.PageWrapper>
    )
  }

  // Show index list when indexes exist
  return (
    <S.PageWrapper data-testid="vector-search-page">
      <IndexListScreen indexes={indexes} />
    </S.PageWrapper>
  )
}
