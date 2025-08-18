import React from 'react'
import { useParams } from 'react-router-dom'

import { StyledHeaderAction, StyledWrapper } from './HeaderActions.styles'
import { ManageIndexesDrawer } from '../manage-indexes/ManageIndexesDrawer'
import { collectSavedQueriesPanelToggleTelemetry } from '../telemetry'
import { StartWizardButton } from './StartWizardButton'
import { RiEmptyButton } from 'uiBase/forms'

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
    <StyledWrapper>
      <StartWizardButton />

      <StyledHeaderAction data-testid="vector-search-header-actions">
        <RiEmptyButton onClick={handleSavedQueriesClick}>
          Saved queries
        </RiEmptyButton>
        <RiEmptyButton onClick={() => setIsManageIndexesDrawerOpen(true)}>
          Manage indexes
        </RiEmptyButton>
      </StyledHeaderAction>

      <ManageIndexesDrawer
        open={isManageIndexesDrawerOpen}
        onOpenChange={setIsManageIndexesDrawerOpen}
      />
    </StyledWrapper>
  )
}
