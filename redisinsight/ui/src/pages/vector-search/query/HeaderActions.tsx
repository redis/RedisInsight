import React from 'react'
import { useParams } from 'react-router-dom'
import {
  StyledHeaderAction,
  StyledTextButton,
  StyledWrapper,
} from './HeaderActions.styles'
import { ManageIndexesDrawer } from '../manage-indexes/ManageIndexesDrawer'
import { collectSavedQueriesPanelToggleTelemetry } from '../telemetry'
import { StartWizardButton } from './StartWizardButton'

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
        <StyledTextButton variant="primary" onClick={handleSavedQueriesClick}>
          Saved queries
        </StyledTextButton>
        <StyledTextButton onClick={() => setIsManageIndexesDrawerOpen(true)}>
          Manage indexes
        </StyledTextButton>
      </StyledHeaderAction>

      <ManageIndexesDrawer
        open={isManageIndexesDrawerOpen}
        onOpenChange={setIsManageIndexesDrawerOpen}
      />
    </StyledWrapper>
  )
}
