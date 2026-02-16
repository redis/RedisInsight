import React from 'react'

import { WelcomeScreen } from '../../components/welcome-screen'
import { useVectorSearch } from '../../context/vector-search'

/**
 * Vector Search Welcome page.
 * Connects the WelcomeScreen presentational component to the application
 * context, providing callbacks and configuration.
 */
export const VectorSearchWelcomePage = () => {
  const { openPickSampleDataModal } = useVectorSearch()

  return (
    <WelcomeScreen
      onTrySampleDataClick={openPickSampleDataModal}
      useMyDatabaseDisabled={{ tooltip: 'Coming soon' }}
    />
  )
}
