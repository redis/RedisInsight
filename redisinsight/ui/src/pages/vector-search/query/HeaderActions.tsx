import React from 'react'
import { StyledHeaderAction, StyledTextButton } from './HeaderActions.styles'
import { ManageIndexesDrawer } from '../manage-indexes/ManageIndexesDrawer'

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
}: HeaderActionsProps) => (
  <>
    <StyledHeaderAction data-testid="vector-search-header-actions">
      <StyledTextButton
        variant="primary"
        onClick={() => setIsSavedQueriesOpen(!isSavedQueriesOpen)}
      >
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
  </>
)
