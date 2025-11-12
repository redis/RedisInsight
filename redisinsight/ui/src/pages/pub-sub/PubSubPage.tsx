import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import {
  sendEventTelemetry,
  sendPageViewTelemetry,
  TelemetryEvent,
  TelemetryPageView,
} from 'uiSrc/telemetry'
import { formatLongName, getDbIndex, setTitle } from 'uiSrc/utils'

import { OnboardingTour } from 'uiSrc/components'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'
import { incrementOnboardStepAction } from 'uiSrc/slices/app/features'
import { OnboardingSteps } from 'uiSrc/constants/onboarding'
import { MessagesListWrapper, PublishMessage } from './components'

import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'
import { Theme } from 'uiSrc/components/base/theme/types'
import { OnboardingWrapper } from './PubSubPage.styles'

const FooterPanel = styled(FlexItem)`
  border-top: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  padding: ${({ theme }: { theme: Theme }) => theme.core.space.space300};
`

const PubSubPage = () => {
  const { name: connectedInstanceName, db } = useSelector(
    connectedInstanceSelector,
  )
  const { instanceId } = useParams<{ instanceId: string }>()

  const [isPageViewSent, setIsPageViewSent] = useState(false)

  const dispatch = useDispatch()

  const dbName = `${formatLongName(connectedInstanceName, 33, 0, '...')} ${getDbIndex(db)}`
  setTitle(`${dbName} - Pub/Sub`)

  useEffect(
    () => () => {
      // as here is the last step of onboarding, we set next step when move from the page
      // remove it when triggers&functions won't be the last page
      dispatch(
        incrementOnboardStepAction(OnboardingSteps.Finish, 0, () => {
          sendEventTelemetry({
            event: TelemetryEvent.ONBOARDING_TOUR_FINISHED,
            eventData: {
              databaseId: instanceId,
            },
          })
        }),
      )
    },
    [],
  )

  useEffect(() => {
    if (connectedInstanceName && !isPageViewSent) {
      sendPageView(instanceId)
    }
  }, [connectedInstanceName, isPageViewSent])

  const sendPageView = (instanceId: string) => {
    sendPageViewTelemetry({
      name: TelemetryPageView.PUBSUB_PAGE,
      eventData: {
        databaseId: instanceId,
      },
    })
    setIsPageViewSent(true)
  }

  return (
    <Col data-testid="pub-sub-page" justify="between">
      <FlexItem grow={true}>
        <MessagesListWrapper />
      </FlexItem>

      <FooterPanel grow={false}>
        <PublishMessage />
      </FooterPanel>

      <OnboardingWrapper grow={false}>
        <OnboardingTour
          options={ONBOARDING_FEATURES.FINISH}
          anchorPosition="downRight"
        >
          <span />
        </OnboardingTour>
      </OnboardingWrapper>
    </Col>
  )
}

export default PubSubPage
