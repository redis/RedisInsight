import React, { useCallback } from 'react'

import { WelcomeScreen } from '../../components/welcome-screen'
import { useVectorSearch } from '../../context/vector-search'
import { SearchTelemetrySource } from '../../telemetry.constants'

/**
 * Vector Search Welcome page.
 * Connects the WelcomeScreen presentational component to the application
 * context, providing callbacks and configuration.
 */
export const VectorSearchWelcomePage = () => {
  const { openPickSampleDataModal, navigateToExistingDataFlow } =
    useVectorSearch()

  const handleTrySampleData = useCallback(
    () => openPickSampleDataModal(SearchTelemetrySource.Welcome),
    [openPickSampleDataModal],
  )

  const handleUseMyDatabase = useCallback(
    () => navigateToExistingDataFlow(SearchTelemetrySource.Welcome),
    [navigateToExistingDataFlow],
  )

  return (
    <WelcomeScreen
      onTrySampleDataClick={handleTrySampleData}
      onUseMyDatabaseClick={handleUseMyDatabase}
    />
  )
}
