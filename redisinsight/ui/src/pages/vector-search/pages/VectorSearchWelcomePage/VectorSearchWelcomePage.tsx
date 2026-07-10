import React, { useCallback } from 'react'

import { useTranslation } from 'uiSrc/i18n'

import { WelcomeScreen } from '../../components/welcome-screen'
import { useVectorSearch } from '../../context/vector-search'
import { SearchTelemetrySource } from '../../telemetry.constants'

/**
 * Vector Search Welcome page.
 * Connects the WelcomeScreen presentational component to the application
 * context, providing callbacks and configuration.
 */
export const VectorSearchWelcomePage = () => {
  const { t } = useTranslation()
  const {
    openPickSampleDataModal,
    navigateToExistingDataFlow,
    hasExistingKeys,
    hasExistingKeysLoading,
  } = useVectorSearch()

  const useMyDatabaseDisabled = hasExistingKeysLoading
    ? { tooltip: t('vectorSearch.welcome.checkingKeys') }
    : !hasExistingKeys
      ? { tooltip: t('vectorSearch.welcome.noKeysFound') }
      : undefined

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
      useMyDatabaseDisabled={useMyDatabaseDisabled}
    />
  )
}
