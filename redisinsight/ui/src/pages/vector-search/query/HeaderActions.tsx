import React from 'react'

import { StartWizardButton } from './StartWizardButton'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout'

export type HeaderActionsProps = {
  toggleManageIndexesScreen: () => void
  toggleSavedQueriesScreen: () => void
}

export const HeaderActions = ({
  toggleManageIndexesScreen,
  toggleSavedQueriesScreen,
}: HeaderActionsProps) => (
  <>
    <Row align="center">
      <StartWizardButton />

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
