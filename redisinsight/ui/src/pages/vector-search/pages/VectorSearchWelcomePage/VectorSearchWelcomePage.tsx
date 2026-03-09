import React from 'react'

import { WelcomeScreen } from '../../components/welcome-screen'
import { useVectorSearch } from '../../context/vector-search'

/**
 * Vector Search Welcome page.
 * Connects the WelcomeScreen presentational component to the application
 * context, providing callbacks and configuration.
 */
export const VectorSearchWelcomePage = () => {
  const {
    openPickSampleDataModal,
    navigateToExistingDataFlow,
    hasExistingKeys,
    hasExistingKeysLoading,
  } = useVectorSearch()

  const useMyDatabaseDisabled = hasExistingKeysLoading
    ? { tooltip: 'Checking for existing keys…' }
    : !hasExistingKeys
      ? { tooltip: 'No Hash or JSON keys found in your database' }
      : undefined

  return (
    <WelcomeScreen
      onTrySampleDataClick={openPickSampleDataModal}
      onUseMyDatabaseClick={navigateToExistingDataFlow}
      useMyDatabaseDisabled={useMyDatabaseDisabled}
    />
  )
}
