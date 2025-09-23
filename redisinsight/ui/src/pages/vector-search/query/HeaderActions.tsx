import React from 'react'

import { StartWizardButton } from './StartWizardButton'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout'
import { FeatureFlags } from 'uiSrc/constants'
import { useSelector } from 'react-redux'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import useRedisInstanceCompatibility from '../create-index/hooks/useRedisInstanceCompatibility'
import { VectorSetNotAvaiallableBanner } from '../components/vector-set-not-available/VectorSetNotAvailableBanner'

export type HeaderActionsProps = {
  toggleManageIndexesScreen: () => void
  toggleSavedQueriesScreen: () => void
}

export const HeaderActions = ({
  toggleManageIndexesScreen,
  toggleSavedQueriesScreen,
}: HeaderActionsProps) => {
  const { loading, hasSupportedVersion } = useRedisInstanceCompatibility()

  const { [FeatureFlags.vectorSearch]: vectorSearchFeature } = useSelector(
    appFeatureFlagsFeaturesSelector,
  )

  return (
    <>
      <Row align="center">
        {vectorSearchFeature?.flag &&
          loading === false &&
          hasSupportedVersion && <StartWizardButton />}
        {loading === false && hasSupportedVersion === false && (
          <VectorSetNotAvaiallableBanner />
        )}

        <Row justify="end" data-testid="vector-search-header-actions" gap="m">
          <EmptyButton onClick={toggleSavedQueriesScreen}>
            Saved queries
          </EmptyButton>

          <EmptyButton onClick={toggleManageIndexesScreen}>
            Manage indexes
          </EmptyButton>
        </Row>
      </Row>

      <Spacer size="m" />
    </>
  )
}
