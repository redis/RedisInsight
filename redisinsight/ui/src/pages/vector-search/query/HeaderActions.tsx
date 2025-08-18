import React from 'react'
import { useParams } from 'react-router-dom'

import { ManageIndexesDrawer } from '../manage-indexes/ManageIndexesDrawer'
import { collectSavedQueriesPanelToggleTelemetry } from '../telemetry'
import { StartWizardButton } from './StartWizardButton'
import { RiEmptyButton } from 'uiBase/forms'
import { RiRow, RiSpacer } from 'uiBase/layout'

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
      <RiRow align="center">
        <StartWizardButton />

        <RiRow justify="end" data-testid="vector-search-header-actions" gap="m">
          <RiEmptyButton onClick={handleSavedQueriesClick}>
            Saved queries
          </RiEmptyButton>

          <RiEmptyButton onClick={() => setIsManageIndexesDrawerOpen(true)}>
            Manage indexes
          </RiEmptyButton>
        </RiRow>

        <ManageIndexesDrawer
          open={isManageIndexesDrawerOpen}
          onOpenChange={setIsManageIndexesDrawerOpen}
        />
      </RiRow>

      <RiSpacer size="m" />
    </>
  )
}
