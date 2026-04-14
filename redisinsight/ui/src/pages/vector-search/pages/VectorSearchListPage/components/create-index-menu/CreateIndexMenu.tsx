import React, { useCallback, useMemo } from 'react'

import { ToggleButton } from 'uiSrc/components/base/forms/buttons'
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  MenuDropdownArrow,
} from 'uiSrc/components/base/layout/menu'
import { RiTooltip } from 'uiSrc/components/base/tooltip'

import { useVectorSearch } from '../../../../context/vector-search'
import { SearchTelemetrySource } from '../../../../telemetry.constants'

export const CreateIndexMenu = () => {
  const {
    openPickSampleDataModal,
    navigateToExistingDataFlow,
    hasExistingKeys,
    hasExistingKeysLoading,
  } = useVectorSearch()

  const isExistingDataDisabled = hasExistingKeysLoading || !hasExistingKeys

  const existingDataTooltip = useMemo(() => {
    if (hasExistingKeysLoading) {
      return 'Checking for existing keys…'
    }

    if (!hasExistingKeys) {
      return 'No Hash or JSON keys found in your database'
    }

    return null
  }, [hasExistingKeysLoading, hasExistingKeys])

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
        <RiTooltip
          content={isExistingDataDisabled ? existingDataTooltip : null}
        >
          <MenuItem
            text="Use existing data"
            disabled={isExistingDataDisabled}
            onClick={handleExistingData}
            data-testid="vector-search--list--create-index--existing-data"
          />
        </RiTooltip>
        <MenuDropdownArrow />
      </MenuContent>
    </Menu>
  )
}
