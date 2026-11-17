import React from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import {
  appFeatureOnboardingSelector,
  setOnboardNextStep,
  skipOnboarding,
} from 'uiSrc/slices/app/features'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { OnboardingStepName, OnboardingSteps } from 'uiSrc/constants/onboarding'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { EmptyButton, PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { RiPopover } from 'uiSrc/components/base'
import { Row } from 'uiSrc/components/base/layout/flex'
import { Trans, useTranslation } from 'uiSrc/i18n'
import styles from './styles.module.scss'

const OnboardingStartPopover = () => {
  const { t } = useTranslation()
  const { id: connectedInstanceId = '' } = useAppSelector(
    connectedInstanceSelector,
  )
  const { isActive, currentStep } = useAppSelector(appFeatureOnboardingSelector)
  const dispatch = useAppDispatch()

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
      anchorPosition="downRight"
      data-testid="onboarding-start-popover"
    >
      <Title size="S">{t('browser.onboarding.title')}</Title>
      <Spacer size="s" />
      <Text data-testid="onboarding-start-content">
        <Trans
          i18nKey="browser.onboarding.content"
          components={{ lineBreak: <br /> }}
        />
      </Text>
      <Spacer />
      <Row justify="between">
        <EmptyButton
          onClick={handleSkip}
          size="small"
          data-testid="skip-tour-btn"
        >
          {t('browser.onboarding.button.skip')}
        </EmptyButton>
        <PrimaryButton
          onClick={handleStart}
          color="secondary"
          size="s"
          data-testid="start-tour-btn"
        >
          {t('browser.onboarding.button.start')}
        </PrimaryButton>
      </Row>
    </RiPopover>
  )
}

export default OnboardingStartPopover
