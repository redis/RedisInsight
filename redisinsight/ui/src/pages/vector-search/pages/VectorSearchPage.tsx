import React from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { TelemetryPageView } from 'uiSrc/telemetry'
import { usePageViewTelemetry } from 'uiSrc/telemetry/usePageViewTelemetry'

import { VectorSearchQuery } from './../query/VectorSearchQuery'
import { VectorSearchPageWrapper } from './../styles'

type Params = {
  instanceId: string
}
type LocationState = {
  openSavedQueriesPanel: boolean
}

const VectorSearchPage = () => {
  const { instanceId } = useParams<Params>()
  const { state } = useLocation<LocationState | undefined>()
  usePageViewTelemetry({
    page: TelemetryPageView.VECTOR_SEARCH_PAGE,
  })

  // TODO: Set title, once we know the name of the page
  // setTitle(
  //   `${formatLongName(connectedInstanceName, 33, 0, '...')} ${getDbIndex(db)} - Vector Search`,
  // )

  return (
    <VectorSearchPageWrapper>
      <VectorSearchQuery
        instanceId={instanceId}
        openSavedQueriesPanel={state?.openSavedQueriesPanel}
      />
    </VectorSearchPageWrapper>
  )
}

export default VectorSearchPage
