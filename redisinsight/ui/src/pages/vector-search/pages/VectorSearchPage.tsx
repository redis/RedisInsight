import React from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { TelemetryPageView } from 'uiSrc/telemetry'
import { usePageViewTelemetry } from 'uiSrc/telemetry/usePageViewTelemetry'
import { Loader } from 'uiSrc/components/base/display'
import { Spacer } from 'uiSrc/components/base/layout'

import { VectorSearchPageWrapper } from './../styles'
import { VectorSearchQuery } from './../query/VectorSearchQuery'
import useRedisInstanceCompatibility from '../create-index/hooks/useRedisInstanceCompatibility'
import useVectorSearchOnboarding from '../create-index/hooks/useVectorSearchOnboarding'
import { RqeNotAvailableCard } from '../components/rqe-not-available/RqeNotAvailableCard'
import { VectorSearchOnboarding } from '../components/onboarding/VectorSearchOnboarding'

type Params = {
  instanceId: string
}

const VectorSearchPage = () => {
  const { instanceId } = useParams<Params>()
  const { search } = useLocation()
  const { hasRedisearch, loading } = useRedisInstanceCompatibility()
  const { showOnboarding } = useVectorSearchOnboarding()

  const defaultSavedQueriesIndex =
    new URLSearchParams(search).get('defaultSavedQueriesIndex') || undefined

  usePageViewTelemetry({
    page: TelemetryPageView.VECTOR_SEARCH_PAGE,
  })

  // TODO: Set title, once we know the name of the page
  // setTitle(
  //   `${formatLongName(connectedInstanceName, 33, 0, '...')} ${getDbIndex(db)} - Vector Search`,
  // )

  if (loading) {
    return (
      <VectorSearchPageWrapper>
        <Spacer style={{ flex: 1 }} />
        <Loader size="xl" data-testid="vector-search-loader" />
        <Spacer style={{ flex: 1 }} />
      </VectorSearchPageWrapper>
    )
  }

  if (!hasRedisearch) {
    return (
      <VectorSearchPageWrapper
        as="div"
        data-testid="vector-search-page--rqe-not-available"
      >
        <RqeNotAvailableCard />
      </VectorSearchPageWrapper>
    )
  }

  if (showOnboarding) {
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
