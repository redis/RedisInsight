import React from 'react'
import { TelemetryPageView } from 'uiSrc/telemetry'
import { usePageViewTelemetry } from 'uiSrc/telemetry/usePageViewTelemetry'

import { VectorSearchQuery } from './../query/VectorSearchQuery'
import { VectorSearchPageWrapper } from './../styles'

const VectorSearchPage = () => {
  usePageViewTelemetry({
    page: TelemetryPageView.VECTOR_SEARCH_PAGE,
  })

  // TODO: Set title, once we know the name of the page
  // setTitle(
  //   `${formatLongName(connectedInstanceName, 33, 0, '...')} ${getDbIndex(db)} - Vector Search`,
  // )

  return (
    <VectorSearchPageWrapper>
      <VectorSearchQuery />
    </VectorSearchPageWrapper>
  )
}

export default VectorSearchPage
