import React from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { TelemetryPageView } from 'uiSrc/telemetry'
import { usePageViewTelemetry } from 'uiSrc/telemetry/usePageViewTelemetry'

import { VectorSearchQuery } from './../query/VectorSearchQuery'
import { VectorSearchPageWrapper } from './../styles'
import { Loader } from 'uiSrc/components/base/display'
import useRedisInstanceCompatibility from '../create-index/hooks/useRedisInstanceCompatibility'
import { Spacer } from 'uiSrc/components/base/layout'
import { RqeNotAvailableCard } from '../components/rqe-not-available/RqeNotAvailableCard'

type Params = {
  instanceId: string
}

const VectorSearchPage = () => {
  const { instanceId } = useParams<Params>()
  const { search } = useLocation()
  const { hasRedisearch, loading } = useRedisInstanceCompatibility()

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
      <VectorSearchPageWrapper>
        <RqeNotAvailableCard />
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
