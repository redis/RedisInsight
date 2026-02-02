import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { BuildType } from 'uiSrc/constants/env'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import { Pages } from 'uiSrc/constants'
import { ConsentsSettings } from 'uiSrc/components'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { Title } from 'uiSrc/components/base/text/Title'
import { Modal } from 'uiSrc/components/base/display'
import * as S from '../ConsentsSettings.styles'

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
    <S.ConsentsPopup
      as={Modal}
      open
      persistent
      width="600px"
      data-testid="consents-settings-popup"
      title={
        <Row justify="between">
          <FlexItem>
            <Title size="XL" variant="semiBold" color="primary">
              EULA and Privacy settings
            </Title>
          </FlexItem>
          <FlexItem>
            <S.RedisIcon>
              <RiIcon type="RedisLogoFullIcon" />
            </S.RedisIcon>
          </FlexItem>
        </Row>
      }
      content={<ConsentsSettings onSubmitted={handleSubmitted} />}
    />
  )
}

export default ConsentsSettingsPopup
