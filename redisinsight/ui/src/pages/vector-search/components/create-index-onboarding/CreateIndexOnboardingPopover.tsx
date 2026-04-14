import React from 'react'

import { AnchorPosition, RiPopover } from 'uiSrc/components/base'
import {
  Button,
  EmptyButton,
  IconButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'

import { useCreateIndexOnboarding } from '../../context/create-index-onboarding'
import {
  CreateIndexOnboardingStep,
  ONBOARDING_STEPS,
  STEP_CONTENT,
  TOTAL_STEPS,
} from './CreateIndexOnboarding.constants'
import * as S from './CreateIndexOnboardingPopover.styles'

export interface CreateIndexOnboardingPopoverProps {
  step: CreateIndexOnboardingStep
  children: React.ReactNode
  anchorPosition?: AnchorPosition
}

export const CreateIndexOnboardingPopover = ({
  step,
  children,
  anchorPosition = 'rightCenter',
}: CreateIndexOnboardingPopoverProps) => {
  const { currentStep, isActive, nextStep, prevStep, skipOnboarding } =
    useCreateIndexOnboarding()

  const isCurrentStep = isActive && currentStep === step

  if (!isCurrentStep) {
    return <>{children}</>
  }

  const content = STEP_CONTENT[step]

  if (!content) {
    return <>{children}</>
  }

  const stepIndex = ONBOARDING_STEPS.indexOf(
    step as (typeof ONBOARDING_STEPS)[number],
  )
  const isFirstStep = stepIndex === 0
  const isLastStep = stepIndex === TOTAL_STEPS - 1
  const stepNumber = stepIndex + 1

  const handleAction = isLastStep ? skipOnboarding : nextStep
  const actionLabel = isLastStep ? 'Got it' : 'Next'

  return (
    <div onClick={(e) => e.stopPropagation()} role="presentation">
      <RiPopover
        isOpen
        anchorPosition={anchorPosition}
        data-testid={`create-index-onboarding-popover-${step}`}
        trigger={children}
      >
        <S.Content
          gap="l"
          data-testid={`create-index-onboarding-content-${step}`}
        >
          <Col gap="s">
            <Row justify="end">
              {isLastStep ? (
                <IconButton
                  icon={CancelSlimIcon}
                  onClick={skipOnboarding}
                  size="S"
                  aria-label="close-onboarding"
                  data-testid="create-index-onboarding-close"
                />
              ) : (
                <EmptyButton
                  onClick={skipOnboarding}
                  data-testid="create-index-onboarding-skip"
                >
                  <Text size="m" color="primary">
                    Skip tour
                  </Text>
                </EmptyButton>
              )}
            </Row>
            <Text size="L" variant="semiBold" color="primary">
              {content.title}
            </Text>
          </Col>

          <Col gap="s">{content.body}</Col>

          <Row justify="between" align="center">
            <S.StepCounter>
              <Text size="s" color="secondary">
                {stepNumber}/{TOTAL_STEPS}
              </Text>
            </S.StepCounter>

            <Row gap="m" grow={false}>
              {!isFirstStep && (
                <SecondaryButton
                  size="small"
                  onClick={prevStep}
                  data-testid="create-index-onboarding-back"
                >
                  Back
                </SecondaryButton>
              )}
              <Button
                size="small"
                onClick={handleAction}
                data-testid={`create-index-onboarding-action-${step}`}
              >
                {actionLabel}
              </Button>
            </Row>
          </Row>
        </S.Content>
      </RiPopover>
    </div>
  )
}
