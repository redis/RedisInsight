import React from 'react'
import { useParams } from 'react-router-dom'
import { StyledHeaderAction } from './HeaderActions.styles'
import { ManageIndexesDrawer } from '../manage-indexes/ManageIndexesDrawer'
import { collectSavedQueriesPanelToggleTelemetry } from '../telemetry'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'

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
      <StyledHeaderAction data-testid="vector-search-header-actions">
        <EmptyButton onClick={handleSavedQueriesClick}>
          Saved queries
        </EmptyButton>
        <EmptyButton onClick={() => setIsManageIndexesDrawerOpen(true)}>
          Manage indexes
        </EmptyButton>
      </StyledHeaderAction>

      <ManageIndexesDrawer
        open={isManageIndexesDrawerOpen}
        onOpenChange={setIsManageIndexesDrawerOpen}
      />
    </>
  )
}
