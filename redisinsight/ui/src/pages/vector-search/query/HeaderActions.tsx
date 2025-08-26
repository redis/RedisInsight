import React from 'react'

import { StartWizardButton } from './StartWizardButton'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout'
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
  const { hasSupportedVersion } = useRedisInstanceCompatibility()

  return (
    <>
      <Row align="center">
        {hasSupportedVersion && <StartWizardButton />}
        {!hasSupportedVersion && <VectorSetNotAvaiallableBanner />}

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
