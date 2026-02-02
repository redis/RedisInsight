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
import * as S from '../CodeButtonBlock.styles'

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
      <S.ShowAgainCheckBox>
        <Checkbox
          id="showAgain"
          name="showAgain"
          label="Don't show again for this database"
          checked={notShowAgain}
          onChange={(e) => setNotShowAgain(e.target.checked)}
          data-testid="checkbox-show-again"
          aria-label="checkbox do not show agan"
        />
      </S.ShowAgainCheckBox>
      <S.PopoverFooter>
        <Row gap="m" justify="end">
          <FeatureFlagComponent name={FeatureFlags.envDependent}>
            <S.PopoverBtn>
              <SecondaryButton
                size="s"
                onClick={handleChangeDatabase}
                data-testid="tutorial-popover-change-db"
              >
                Change Database
              </SecondaryButton>
            </S.PopoverBtn>
          </FeatureFlagComponent>
          <S.PopoverBtn>
            <PrimaryButton
              size="s"
              onClick={handleApply}
              data-testid="tutorial-popover-apply-run"
            >
              Run
            </PrimaryButton>
          </S.PopoverBtn>
        </Row>
      </S.PopoverFooter>
    </>
  )
}

export default RunConfirmationPopover
