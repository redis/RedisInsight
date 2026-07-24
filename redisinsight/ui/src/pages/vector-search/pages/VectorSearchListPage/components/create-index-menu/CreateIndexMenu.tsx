import React, { useCallback, useMemo } from 'react'

import { useTranslation } from 'uiSrc/i18n'
import { ToggleButton } from 'uiSrc/components/base/forms/buttons'
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  MenuDropdownArrow,
} from 'uiSrc/components/base/layout/menu'
import { RiTooltip } from 'uiSrc/components/base/tooltip'
import { useAppSelector } from 'uiSrc/slices/hooks'
import { isVectorSearchEnhancementsEnabledSelector } from 'uiSrc/slices/app/features'

import { useVectorSearch } from '../../../../context/vector-search'
import { SearchTelemetrySource } from '../../../../telemetry.constants'

export const CreateIndexMenu = () => {
  const { t } = useTranslation()
  const {
    openPickSampleDataModal,
    navigateToExistingDataFlow,
    hasExistingKeys,
    hasExistingKeysLoading,
    hasExistingKeysError,
  } = useVectorSearch()
  const enhancementsEnabled = useAppSelector(
    isVectorSearchEnhancementsEnabledSelector,
  )

  const handleSampleData = useCallback(
    () => openPickSampleDataModal(SearchTelemetrySource.List),
    [openPickSampleDataModal],
  )

  const handleExistingData = useCallback(
    () => navigateToExistingDataFlow(SearchTelemetrySource.List),
    [navigateToExistingDataFlow],
  )

  // With the flag off, restore the legacy behavior: gate the "existing data"
  // entry on the presence of indexable keys, with an explanatory tooltip.
  // A failed/inconclusive probe keeps the entry available.
  const isExistingDataDisabled =
    !enhancementsEnabled &&
    (hasExistingKeysLoading || (!hasExistingKeys && !hasExistingKeysError))

  const existingDataTooltip = useMemo(() => {
    if (enhancementsEnabled) {
      return null
    }

    if (hasExistingKeysLoading) {
      return t('vectorSearch.list.createMenu.checkingKeys')
    }

    if (!hasExistingKeys && !hasExistingKeysError) {
      return t('vectorSearch.list.createMenu.noKeys')
    }

    return null
  }, [
    enhancementsEnabled,
    hasExistingKeysLoading,
    hasExistingKeys,
    hasExistingKeysError,
    t,
  ])

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
        <RiTooltip
          content={isExistingDataDisabled ? existingDataTooltip : null}
        >
          <MenuItem
            text={t('vectorSearch.list.createMenu.existingData')}
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
