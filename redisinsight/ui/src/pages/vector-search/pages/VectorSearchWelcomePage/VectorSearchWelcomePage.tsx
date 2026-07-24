import React, { useCallback } from 'react'

import { useTranslation } from 'uiSrc/i18n'
import { useAppSelector } from 'uiSrc/slices/hooks'
import { isVectorSearchEnhancementsEnabledSelector } from 'uiSrc/slices/app/features'

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
    hasExistingKeysError,
  } = useVectorSearch()
  const enhancementsEnabled = useAppSelector(
    isVectorSearchEnhancementsEnabledSelector,
  )

  const handleTrySampleData = useCallback(
    () => openPickSampleDataModal(SearchTelemetrySource.Welcome),
    [openPickSampleDataModal],
  )

  const handleUseMyDatabase = useCallback(
    () => navigateToExistingDataFlow(SearchTelemetrySource.Welcome),
    [navigateToExistingDataFlow],
  )

  // With the flag off, restore the legacy behavior: gate the button on the
  // presence of indexable keys and use the original "use my database" label.
  // A failed/inconclusive probe keeps the button available rather than
  // wrongly reporting "no keys".
  const useMyDatabaseDisabled = enhancementsEnabled
    ? undefined
    : hasExistingKeysLoading
      ? { tooltip: t('vectorSearch.welcome.checkingKeys') }
      : !hasExistingKeys && !hasExistingKeysError
        ? { tooltip: t('vectorSearch.welcome.noKeysFound') }
        : undefined

  return (
    <WelcomeScreen
      onTrySampleDataClick={handleTrySampleData}
      onUseMyDatabaseClick={handleUseMyDatabase}
      useMyDatabaseText={
        enhancementsEnabled
          ? undefined
          : t('vectorSearch.welcome.useMyDatabaseLegacy')
      }
      useMyDatabaseDisabled={useMyDatabaseDisabled}
    />
  )
}
