import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { RiTitle } from 'uiBase/text'
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
import {
  MessagesListWrapper,
  PublishMessage,
  SubscriptionPanel,
} from './components'

import styles from './styles.module.scss'

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
    <div className={styles.main} data-testid="pub-sub-page">
      <div className={styles.contentPanel}>
        <div className={styles.header}>
          <RiTitle size="XXL" className={styles.title}>
            Pub/Sub
          </RiTitle>
          <SubscriptionPanel />
        </div>
        <div className={styles.tableWrapper}>
          <MessagesListWrapper />
        </div>
      </div>
      <div className={styles.footerPanel}>
        <PublishMessage />
      </div>
      <div className={styles.onboardAnchor}>
        <OnboardingTour
          options={ONBOARDING_FEATURES.FINISH}
          anchorPosition="downCenter"
          panelClassName={styles.onboardPanel}
        >
          <span />
        </OnboardingTour>
      </div>
    </div>
  )
}

export default PubSubPage
