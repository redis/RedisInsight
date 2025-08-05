import React, { useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { FeatureFlags, Pages } from 'uiSrc/constants'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { setDBConfigStorageField } from 'uiSrc/services'
import { ConfigDBStorageItem } from 'uiSrc/constants/storage'
import { FeatureFlagComponent } from 'uiSrc/components'
import { RiSpacer } from 'uiSrc/components/base/layout/spacer'
import {
  RiPrimaryButton,
  RiSecondaryButton,
  RiCheckbox,
} from 'uiSrc/components/base/forms'
import { RiTitle, RiText } from 'uiSrc/components/base/text'
import styles from '../styles.module.scss'

interface Props {
  onApply: () => void
}

const RunConfirmationPopover = ({ onApply }: Props) => {
  const [notShowAgain, setNotShowAgain] = useState(false)

  const { instanceId } = useParams<{ instanceId: string }>()
  const history = useHistory()

  const handleChangeDatabase = () => {
    history.push(Pages.home)
    sendEventTelemetry({
      event: TelemetryEvent.EXPLORE_PANEL_DATABASE_CHANGE_CLICKED,
      eventData: {
        databaseId: instanceId,
      },
    })
  }

  const handleApply = () => {
    if (notShowAgain) {
      setDBConfigStorageField(
        instanceId,
        ConfigDBStorageItem.notShowConfirmationRunTutorial,
        true,
      )
    }
    onApply?.()
  }

  return (
    <>
      <RiTitle size="XS">Run commands</RiTitle>
      <RiSpacer size="s" />
      <RiText size="s">
        This tutorial will change data in your database, are you sure you want
        to run commands in this database?
      </RiText>
      <RiSpacer size="s" />
      <RiCheckbox
        id="showAgain"
        name="showAgain"
        label="Don't show again for this database"
        checked={notShowAgain}
        className={styles.showAgainCheckBox}
        onChange={(e) => setNotShowAgain(e.target.checked)}
        data-testid="checkbox-show-again"
        aria-label="checkbox do not show agan"
      />
      <div className={styles.popoverFooter}>
        <div>
          <FeatureFlagComponent name={FeatureFlags.envDependent}>
            <RiSecondaryButton
              size="s"
              className={styles.popoverBtn}
              onClick={handleChangeDatabase}
              data-testid="tutorial-popover-change-db"
            >
              Change Database
            </RiSecondaryButton>
          </FeatureFlagComponent>
          <RiPrimaryButton
            size="s"
            className={styles.popoverBtn}
            onClick={handleApply}
            data-testid="tutorial-popover-apply-run"
          >
            Run
          </RiPrimaryButton>
        </div>
      </div>
    </>
  )
}

export default RunConfirmationPopover
