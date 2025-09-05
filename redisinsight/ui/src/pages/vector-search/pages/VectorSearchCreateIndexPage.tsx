import React from 'react'
import { TelemetryPageView } from 'uiSrc/telemetry'
import { usePageViewTelemetry } from 'uiSrc/telemetry/usePageViewTelemetry'

import { VectorSearchCreateIndex } from './../create-index/VectorSearchCreateIndex'
import { VectorSearchPageWrapper } from './../styles'

const VectorSearchCreateIndexPage = () => {
  usePageViewTelemetry({
    page: TelemetryPageView.VECTOR_SEARCH_PAGE,
  })

  return (
    <VectorSearchPageWrapper
      as="div"
      data-testid="vector-search--create-index-page"
    >
      <VectorSearchCreateIndex />
    </VectorSearchPageWrapper>
  )
}

export default VectorSearchCreateIndexPage
