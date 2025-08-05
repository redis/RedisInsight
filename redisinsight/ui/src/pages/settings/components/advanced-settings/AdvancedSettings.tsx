import React from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { validateCountNumber } from 'uiSrc/utils'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { SettingItem } from 'uiSrc/components'
import {
  updateUserConfigSettingsAction,
  userSettingsConfigSelector,
} from 'uiSrc/slices/user/user-settings'
import { RiSpacer } from 'uiSrc/components/base/layout/spacer'

const AdvancedSettings = () => {
  const { scanThreshold = '' } = useSelector(userSettingsConfigSelector) ?? {}

  const dispatch = useDispatch()

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
        title="Keys to Scan in List view"
        summary="Sets the amount of keys to scan per one iteration. Filtering by pattern per a large number of keys may decrease performance."
        testid="keys-to-scan"
        placeholder="10 000"
        label="Keys to Scan:"
      />
      <RiSpacer size="m" />
    </>
  )
}

export default AdvancedSettings
