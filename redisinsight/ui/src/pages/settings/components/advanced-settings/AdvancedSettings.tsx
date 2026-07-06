import React from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'

import { validateCountNumber } from 'uiSrc/utils'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { SettingItem } from 'uiSrc/components'
import {
  updateUserConfigSettingsAction,
  userSettingsConfigSelector,
} from 'uiSrc/slices/user/user-settings'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { useTranslation } from 'uiSrc/i18n'

const AdvancedSettings = () => {
  const { t } = useTranslation()
  const { scanThreshold = '' } =
    useAppSelector(userSettingsConfigSelector) ?? {}

  const dispatch = useAppDispatch()

  const handleApplyKeysToScanChanges = (value: string) => {
    // eslint-disable-next-line no-nested-ternary
    const data = value
      ? +value < SCAN_COUNT_DEFAULT
        ? SCAN_COUNT_DEFAULT
        : +value
      : null

    dispatch(updateUserConfigSettingsAction({ scanThreshold: data }))
  }

  return (
    <>
      <SettingItem
        initValue={scanThreshold.toString()}
        onApply={handleApplyKeysToScanChanges}
        validation={validateCountNumber}
        title={t('settings.advanced.keysToScan.title')}
        summary={t('settings.advanced.keysToScan.summary')}
        testid="keys-to-scan"
        placeholder="10 000"
        label={t('settings.advanced.keysToScan.label')}
      />
      <Spacer size="m" />
    </>
  )
}

export default AdvancedSettings
