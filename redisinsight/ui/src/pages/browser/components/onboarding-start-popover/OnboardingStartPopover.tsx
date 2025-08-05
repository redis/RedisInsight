import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  appFeatureOnboardingSelector,
  setOnboardNextStep,
  skipOnboarding,
} from 'uiSrc/slices/app/features'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { OnboardingStepName, OnboardingSteps } from 'uiSrc/constants/onboarding'
import { RiSpacer } from 'uiSrc/components/base/layout/spacer'
import { RiEmptyButton, RiPrimaryButton } from 'uiSrc/components/base/forms'
import { RiTitle, RiText } from 'uiSrc/components/base/text'
import { RiPopover } from 'uiSrc/components/base'
import styles from './styles.module.scss'

const OnboardingStartPopover = () => {
  const { id: connectedInstanceId = '' } = useSelector(
    connectedInstanceSelector,
  )
  const { isActive, currentStep } = useSelector(appFeatureOnboardingSelector)
  const dispatch = useDispatch()

  const sendTelemetry = (action: string) =>
    sendEventTelemetry({
      event: TelemetryEvent.ONBOARDING_TOUR_CLICKED,
      eventData: {
        databaseId: connectedInstanceId,
        step: OnboardingStepName.Start,
        action,
      },
    })

  const handleSkip = () => {
    dispatch(skipOnboarding())
    sendTelemetry('closed')
  }

  const handleStart = () => {
    dispatch(setOnboardNextStep())
    sendTelemetry('next')
  }

  return (
    <RiPopover
      button={<></>}
      isOpen={isActive && currentStep === OnboardingSteps.Start}
      ownFocus={false}
      closePopover={() => {}}
      panelClassName={styles.onboardingStartPopover}
      anchorPosition="upCenter"
      data-testid="onboarding-start-popover"
      style={{ display: 'none' }}
    >
      <RiTitle size="S">Take a quick tour of Redis Insight?</RiTitle>
      <RiSpacer size="s" />
      <RiText data-testid="onboarding-start-content">
        Hi! Redis Insight has many tools that can help you to optimize the
        development process.
        <br />
        Would you like us to show them to you?
      </RiText>
      <div className={styles.onboardingActions}>
        <RiEmptyButton
          onClick={handleSkip}
          className={styles.skipTourBtn}
          size="small"
          data-testid="skip-tour-btn"
        >
          Skip tour
        </RiEmptyButton>
        <RiPrimaryButton
          onClick={handleStart}
          color="secondary"
          size="s"
          data-testid="start-tour-btn"
        >
          Show me around
        </RiPrimaryButton>
      </div>
    </RiPopover>
  )
}

export default OnboardingStartPopover
