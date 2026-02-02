import React from 'react'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  resetCliHelperSettings,
  toggleCliHelper,
  toggleHideCliHelper,
} from 'uiSrc/slices/cli/cli-settings'
import { OnboardingTour } from 'uiSrc/components'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { WindowControlGroup } from 'uiSrc/components/base/shared/WindowControlGroup'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import * as S from '../CommandHelper.styles'

const CommandHelperHeader = () => {
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const dispatch = useDispatch()

  const handleCloseHelper = () => {
    sendEventTelemetry({
      event: TelemetryEvent.COMMAND_HELPER_CLOSED,
      eventData: {
        databaseId: instanceId,
      },
    })
    dispatch(resetCliHelperSettings())
  }

  const handleHideHelper = () => {
    sendEventTelemetry({
      event: TelemetryEvent.COMMAND_HELPER_MINIMIZED,
      eventData: {
        databaseId: instanceId,
      },
    })
    dispatch(toggleCliHelper())
    dispatch(toggleHideCliHelper())
  }

  return (
    <S.HeaderContainer id="command-helper-header">
      <Row justify="between" align="center" style={{ height: '100%' }}>
        <S.HeaderTitle as={FlexItem}>
          <RiIcon type="DocumentationIcon" size="L" />
          <OnboardingTour
            options={ONBOARDING_FEATURES.BROWSER_COMMAND_HELPER}
            anchorPosition="upLeft"
          >
            <Text>Command Helper</Text>
          </OnboardingTour>
        </S.HeaderTitle>
        <FlexItem grow />
        <WindowControlGroup
          onClose={handleCloseHelper}
          onHide={handleHideHelper}
          id="command-helper"
          label="Command Helper"
        />
      </Row>
    </S.HeaderContainer>
  )
}

export default CommandHelperHeader
