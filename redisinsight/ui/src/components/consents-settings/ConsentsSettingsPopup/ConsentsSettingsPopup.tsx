import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiIcon } from 'uiBase/icons'
import { RiTitle } from 'uiBase/text'
import { RiModal } from 'uiBase/display'
import { BuildType } from 'uiSrc/constants/env'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import { Pages } from 'uiSrc/constants'
import { ConsentsSettings } from 'uiSrc/components'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import styles from '../styles.module.scss'

const ConsentsSettingsPopup = () => {
  const history = useHistory()
  const { server } = useSelector(appInfoSelector)

  const handleSubmitted = () => {
    if (
      server &&
      server.buildType === BuildType.RedisStack &&
      server?.fixedDatabaseId
    ) {
      history.push(Pages.browser(server.fixedDatabaseId))
    }
  }

  useEffect(() => {
    sendEventTelemetry({
      event: TelemetryEvent.CONSENT_MENU_VIEWED,
    })
  }, [])

  return (
    <RiModal
      open
      persistent
      width="600px"
      className={styles.consentsPopup}
      data-testid="consents-settings-popup"
      title={
        <RiRow justify="between">
          <RiFlexItem>
            <RiTitle size="L" className={styles.consentsPopupTitle}>
              EULA and Privacy Settings
            </RiTitle>
          </RiFlexItem>
          <RiFlexItem>
            <RiIcon className={styles.redisIcon} type="RedisLogoFullIcon" />
          </RiFlexItem>
        </RiRow>
      }
      content={<ConsentsSettings onSubmitted={handleSubmitted} />}
    />
  )
}

export default ConsentsSettingsPopup
