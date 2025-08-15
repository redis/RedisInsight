import React from 'react'
import { useParams } from 'react-router-dom'

import { ManageIndexesDrawer } from '../manage-indexes/ManageIndexesDrawer'
import { collectSavedQueriesPanelToggleTelemetry } from '../telemetry'
import { StartWizardButton } from './StartWizardButton'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout'

export type HeaderActionsProps = {
  isManageIndexesDrawerOpen: boolean
  setIsManageIndexesDrawerOpen: (value: boolean) => void
  isSavedQueriesOpen: boolean
  setIsSavedQueriesOpen: (value: boolean) => void
}

export const HeaderActions = ({
  isManageIndexesDrawerOpen,
  setIsManageIndexesDrawerOpen,
  isSavedQueriesOpen,
  setIsSavedQueriesOpen,
}: HeaderActionsProps) => {
  const { instanceId } = useParams<{ instanceId: string }>()

  const handleSavedQueriesClick = () => {
    setIsSavedQueriesOpen(!isSavedQueriesOpen)

    collectSavedQueriesPanelToggleTelemetry({
      instanceId,
      isSavedQueriesOpen,
    })
  }

  return (
    <>
      <Row align="center">
        <StartWizardButton />

        <Row justify="end" data-testid="vector-search-header-actions" gap="m">
          <EmptyButton onClick={handleSavedQueriesClick}>
            Saved queries
          </EmptyButton>

          <EmptyButton onClick={() => setIsManageIndexesDrawerOpen(true)}>
            Manage indexes
          </EmptyButton>
        </Row>

        <ManageIndexesDrawer
          open={isManageIndexesDrawerOpen}
          onOpenChange={setIsManageIndexesDrawerOpen}
        />
      </Row>

      <Spacer size="m" />
    </>
  )
}
