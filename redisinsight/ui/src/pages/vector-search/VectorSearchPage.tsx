import React from 'react'
import { TelemetryPageView } from 'uiSrc/telemetry'
import { usePageViewTelemetry } from 'uiSrc/telemetry/usePageViewTelemetry'

import { Loader } from 'uiSrc/components/base/display'
import { VectorSearchCreateIndex } from './create-index/VectorSearchCreateIndex'
import { VectorSearchQuery } from './query/VectorSearchQuery'
import { VectorSearchPageWrapper } from './styles'
import { useRedisearchListData } from './useRedisearchListData'

export const VectorSearchPage = () => {
  const { data, loading } = useRedisearchListData()
  const hasIndexes = false // data?.length > 0

  usePageViewTelemetry({
    page: TelemetryPageView.VECTOR_SEARCH_PAGE,
  })

  // TODO: Set title, once we know the name of the page
  // setTitle(
  //   `${formatLongName(connectedInstanceName, 33, 0, '...')} ${getDbIndex(db)} - Vector Search`,
  // )

  return (
    <VectorSearchPageWrapper>
      {loading && <Loader />}
      {hasIndexes ? <VectorSearchQuery /> : <VectorSearchCreateIndex />}
    </VectorSearchPageWrapper>
  )
}
