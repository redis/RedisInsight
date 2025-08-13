import React from 'react'
import { useParams } from 'react-router-dom'

import { ManageIndexesDrawer } from '../manage-indexes/ManageIndexesDrawer'
import { collectSavedQueriesPanelToggleTelemetry } from '../telemetry'
import { StartWizardButton } from './StartWizardButton'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { FlexGroup, Row } from 'uiSrc/components/base/layout/flex'
import { HorizontalSpacer, Spacer } from 'uiSrc/components/base/layout'

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
      <FlexGroup align="center">
        <StartWizardButton />

        <Row justify="end" data-testid="vector-search-header-actions">
          <EmptyButton onClick={handleSavedQueriesClick}>
            Saved queries
          </EmptyButton>

          <HorizontalSpacer size="m" />

          <EmptyButton onClick={() => setIsManageIndexesDrawerOpen(true)}>
            Manage indexes
          </EmptyButton>
        </Row>

        <ManageIndexesDrawer
          open={isManageIndexesDrawerOpen}
          onOpenChange={setIsManageIndexesDrawerOpen}
        />
      </FlexGroup>

      <Spacer size="m" />
    </>
  )
}
