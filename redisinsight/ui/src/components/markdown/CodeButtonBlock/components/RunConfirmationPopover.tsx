import React, { useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { FeatureFlags, Pages } from 'uiSrc/constants'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { setDBConfigStorageField } from 'uiSrc/services'
import { ConfigDBStorageItem } from 'uiSrc/constants/storage'
import { FeatureFlagComponent } from 'uiSrc/components'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { Row } from 'uiSrc/components/base/layout/flex'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
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
      <Title size="XS">Run commands</Title>
      <Spacer size="s" />
      <Text size="s">
        This tutorial will change data in your database, are you sure you want
        to run commands in this database?
      </Text>
      <Spacer size="s" />
      <Checkbox
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
        <Row gap="m" justify="end">
          <FeatureFlagComponent name={FeatureFlags.envDependent}>
            <SecondaryButton
              size="s"
              className={styles.popoverBtn}
              onClick={handleChangeDatabase}
              data-testid="tutorial-popover-change-db"
            >
              Change Database
            </SecondaryButton>
          </FeatureFlagComponent>
          <PrimaryButton
            size="s"
            className={styles.popoverBtn}
            onClick={handleApply}
            data-testid="tutorial-popover-apply-run"
          >
            Run
          </PrimaryButton>
        </Row>
      </div>
    </>
  )
}

export default RunConfirmationPopover
