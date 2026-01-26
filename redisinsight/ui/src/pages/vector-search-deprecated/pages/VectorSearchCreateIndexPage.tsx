import React from 'react'
import { TelemetryPageView } from 'uiSrc/telemetry'
import { usePageViewTelemetry } from 'uiSrc/telemetry/usePageViewTelemetry'
import { VectorSearchOnboardingProvider } from 'uiSrc/pages/vector-search-deprecated/context/VectorSearchOnboardingContext'

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
      <VectorSearchOnboardingProvider>
        <VectorSearchCreateIndex />
      </VectorSearchOnboardingProvider>
    </VectorSearchPageWrapper>
  )
}

export default VectorSearchCreateIndexPage
