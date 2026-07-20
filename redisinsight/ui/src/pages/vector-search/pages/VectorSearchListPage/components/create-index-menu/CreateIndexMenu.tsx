import React, { useCallback } from 'react'

import { useTranslation } from 'uiSrc/i18n'
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
  const { t } = useTranslation()
  const { openPickSampleDataModal, navigateToExistingDataFlow } =
    useVectorSearch()

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
          {t('vectorSearch.list.createMenu.create')}
        </ToggleButton>
      </MenuTrigger>
      <MenuContent align="end">
        <MenuItem
          text={t('vectorSearch.list.createMenu.sampleData')}
          onClick={handleSampleData}
          data-testid="vector-search--list--create-index--sample-data"
        />
        <MenuItem
          text={t('vectorSearch.list.createMenu.existingData')}
          onClick={handleExistingData}
          data-testid="vector-search--list--create-index--existing-data"
        />
        <MenuDropdownArrow />
      </MenuContent>
    </Menu>
  )
}
