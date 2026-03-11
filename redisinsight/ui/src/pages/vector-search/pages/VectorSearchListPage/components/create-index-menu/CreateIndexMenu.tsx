import React, { useCallback } from 'react'

import { ToggleButton } from 'uiSrc/components/base/forms/buttons'
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  MenuDropdownArrow,
} from 'uiSrc/components/base/layout/menu'

import { useVectorSearch } from '../../../../context/vector-search'
import { SearchTelemetrySource } from '../../../../telemetry.constants'

export const CreateIndexMenu = () => {
  const {
    openPickSampleDataModal,
    navigateToExistingDataFlow,
    hasExistingKeys,
    hasExistingKeysLoading,
  } = useVectorSearch()

  const handleSampleData = useCallback(
    () => openPickSampleDataModal(SearchTelemetrySource.List),
    [openPickSampleDataModal],
  )

  const handleExistingData = useCallback(
    () => navigateToExistingDataFlow(SearchTelemetrySource.List),
    [navigateToExistingDataFlow],
  )

  return (
    <Menu>
      <MenuTrigger>
        <ToggleButton data-testid="vector-search--list--create-index-btn">
          + Create search index
        </ToggleButton>
      </MenuTrigger>
      <MenuContent align="end">
        <MenuItem
          text="Use sample data"
          onClick={handleSampleData}
          data-testid="vector-search--list--create-index--sample-data"
        />
        <MenuItem
          text="Use existing data"
          disabled={hasExistingKeysLoading || !hasExistingKeys}
          onClick={handleExistingData}
          data-testid="vector-search--list--create-index--existing-data"
        />
        <MenuDropdownArrow />
      </MenuContent>
    </Menu>
  )
}
