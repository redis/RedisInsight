import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'

import {
  toggleCli,
  resetCliSettings,
  deleteCliClientAction,
} from 'uiSrc/slices/cli/cli-settings'
import { BrowserStorageItem } from 'uiSrc/constants'
import { sessionStorageService } from 'uiSrc/services'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { resetOutputLoading } from 'uiSrc/slices/cli/cli-output'
import { OnboardingTour } from 'uiSrc/components'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { WindowControlGroup } from 'uiSrc/components/base/shared/WindowControlGroup'
import { RiIcon } from 'uiSrc/components/base/icons'
import styles from './styles.module.scss'

const CliHeader = () => {
  const dispatch = useDispatch()

  const { instanceId = '' } = useParams<{ instanceId: string }>()

  const removeCliClient = () => {
    const cliClientUuid =
      sessionStorageService.get(BrowserStorageItem.cliClientUuid) ?? ''

    cliClientUuid && dispatch(deleteCliClientAction(instanceId, cliClientUuid))
  }

  useEffect(() => {
    window.addEventListener('beforeunload', removeCliClient, false)
    return () => {
      window.removeEventListener('beforeunload', removeCliClient, false)
    }
  }, [])

  const handleCloseCli = () => {
    sendEventTelemetry({
      event: TelemetryEvent.CLI_CLOSED,
      eventData: {
        databaseId: instanceId,
      },
    })
    removeCliClient()
    dispatch(resetCliSettings())
    dispatch(resetOutputLoading())
  }

  const handleHideCli = () => {
    sendEventTelemetry({
      event: TelemetryEvent.CLI_MINIMIZED,
      eventData: {
        databaseId: instanceId,
      },
    })
    dispatch(toggleCli())
  }

  return (
    <div className={styles.container} id="cli-header">
      <Row justify="between" align="center" style={{ height: '100%' }}>
        <FlexItem className={styles.title} direction="row">
          <RiIcon type="CliIcon" size="M" />
          <OnboardingTour
            options={ONBOARDING_FEATURES.BROWSER_CLI}
            anchorPosition="upLeft"
            panelClassName={styles.cliOnboardPanel}
          >
            <Text>CLI</Text>
          </OnboardingTour>
        </FlexItem>
        <FlexItem grow />
        <WindowControlGroup
          onClose={handleCloseCli}
          onHide={handleHideCli}
          id="cli"
        />
      </Row>
    </div>
  )
}

export default CliHeader
