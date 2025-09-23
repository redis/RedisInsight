import React from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { FeatureFlags } from 'uiSrc/constants'
import { TelemetryPageView } from 'uiSrc/telemetry'
import { usePageViewTelemetry } from 'uiSrc/telemetry/usePageViewTelemetry'
import { Loader } from 'uiSrc/components/base/display'
import { Spacer } from 'uiSrc/components/base/layout'
import { formatLongName, getDbIndex, setTitle } from 'uiSrc/utils'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'

import { VectorSearchPageWrapper } from './../styles'
import { VectorSearchQuery } from './../query/VectorSearchQuery'
import useRedisInstanceCompatibility from '../create-index/hooks/useRedisInstanceCompatibility'
import { RqeNotAvailableCard } from '../components/rqe-not-available/RqeNotAvailableCard'
import { VectorSearchOnboarding } from '../components/onboarding/VectorSearchOnboarding'
import {
  useVectorSearchOnboarding,
  VectorSearchOnboardingProvider,
} from '../context/VectorSearchOnboardingContext'

type Params = {
  instanceId: string
}

const VectorSearchPage = () => (
  <VectorSearchOnboardingProvider>
    <VectorSearch />
  </VectorSearchOnboardingProvider>
)

export const VectorSearch = () => {
  const { instanceId } = useParams<Params>()
  const { search } = useLocation()
  const { hasRedisearch, loading } = useRedisInstanceCompatibility()
  const { showOnboarding } = useVectorSearchOnboarding()

  const { name: connectedInstanceName, db } = useSelector(
    connectedInstanceSelector,
  )

  const { [FeatureFlags.vectorSearch]: vectorSearchFeature } = useSelector(
    appFeatureFlagsFeaturesSelector,
  )

  const defaultSavedQueriesIndex =
    new URLSearchParams(search).get('defaultSavedQueriesIndex') || undefined

  usePageViewTelemetry({
    page: TelemetryPageView.VECTOR_SEARCH_PAGE,
  })

  setTitle(
    `${formatLongName(connectedInstanceName, 33, 0, '...')} ${getDbIndex(db)} - Vector Search`,
  )

  if (loading) {
    return (
      <VectorSearchPageWrapper>
        <Spacer style={{ flex: 1 }} />
        <Loader size="xl" data-testid="vector-search-loader" />
        <Spacer style={{ flex: 1 }} />
      </VectorSearchPageWrapper>
    )
  }

  if (loading === false && hasRedisearch === false) {
    return (
      <VectorSearchPageWrapper
        as="div"
        data-testid="vector-search-page--rqe-not-available"
      >
        <RqeNotAvailableCard />
      </VectorSearchPageWrapper>
    )
  }

  if (showOnboarding && vectorSearchFeature?.flag) {
    return (
      <VectorSearchPageWrapper>
        <VectorSearchOnboarding />
      </VectorSearchPageWrapper>
    )
  }

  return (
    <VectorSearchPageWrapper as="div" data-testid="vector-search-page">
      <VectorSearchQuery
        instanceId={instanceId}
        defaultSavedQueriesIndex={defaultSavedQueriesIndex}
      />
    </VectorSearchPageWrapper>
  )
}

export default VectorSearchPage
