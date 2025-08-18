import React from 'react'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'

import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiText } from 'uiBase/text'
import { WindowControlGroup } from 'uiBase/index'
import { RiIcon } from 'uiBase/icons'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  resetCliHelperSettings,
  toggleCliHelper,
  toggleHideCliHelper,
} from 'uiSrc/slices/cli/cli-settings'
import { OnboardingTour } from 'uiSrc/components'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'

import styles from './styles.module.scss'

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
    <div className={styles.container} id="command-helper-header">
      <RiRow justify="between" align="center" style={{ height: '100%' }}>
        <RiFlexItem className={styles.title}>
          <RiIcon type="DocumentationIcon" size="L" />
          <OnboardingTour
            options={ONBOARDING_FEATURES.BROWSER_COMMAND_HELPER}
            anchorPosition="upLeft"
            panelClassName={styles.helperOnboardPanel}
          >
            <RiText>Command Helper</RiText>
          </OnboardingTour>
        </RiFlexItem>
        <RiFlexItem grow />
        <WindowControlGroup
          onClose={handleCloseHelper}
          onHide={handleHideHelper}
          id="command-helper"
          label="Command Helper"
        />
      </RiRow>
    </div>
  )
}

export default CommandHelperHeader
