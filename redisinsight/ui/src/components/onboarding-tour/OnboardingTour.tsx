import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import cx from 'classnames'

import {
  skipOnboarding,
  setOnboardNextStep,
  setOnboardPrevStep,
} from 'uiSrc/slices/app/features'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import {
  EmptyButton,
  IconButton,
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { ColorText } from 'uiSrc/components/base/text'
import { TourStep } from 'uiSrc/components/base/display/tour/TourStep'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Title } from 'uiSrc/components/base/text/Title'
import { Spacer } from 'uiSrc/components/base/layout'
import { Props as OnboardingWrapperProps } from './OnboardingTourWrapper'

import styles from './styles.module.scss'

export interface Props extends OnboardingWrapperProps {
  isActive: boolean
  currentStep: number
  totalSteps: number
}

const OnboardingTour = (props: Props) => {
  const {
    options,
    children,
    anchorPosition = 'rightUp',
    panelClassName,
    anchorWrapperClassName,
    isActive,
    currentStep,
    totalSteps,
    preventPropagation,
    fullSize,
  } = props
  const { step, title, Inner } = options
  const {
    content = '',
    onBack = () => {},
    onNext = () => {},
    onSkip = () => {},
  } = Inner ? Inner() : {}

  const [isOpen, setIsOpen] = useState(step === currentStep && isActive)
  const isLastStep = currentStep === totalSteps

  const dispatch = useDispatch()

  useEffect(() => {
    setIsOpen(step === currentStep && isActive)
  }, [currentStep, isActive])

  const handleClickBack = () => {
    onBack?.()
    dispatch(setOnboardPrevStep())
  }

  const handleClickNext = () => {
    onNext?.()
    dispatch(setOnboardNextStep())
  }

  const handleSkip = () => {
    onSkip?.()
    dispatch(skipOnboarding())
  }

  const handleWrapperClick = (e: React.MouseEvent) => {
    if (preventPropagation) {
      e.stopPropagation()
    }
  }

  const Header = (
    <Col className={styles.header}>
      {!isLastStep ? (
        <EmptyButton
          onClick={handleSkip}
          className={styles.skipTourBtn}
          size="small"
          data-testid="skip-tour-btn"
        >
          Skip tour
        </EmptyButton>
      ) : (
        <IconButton
          icon={CancelSlimIcon}
          className={styles.skipTourBtn}
          onClick={handleSkip}
          size="S"
          aria-label="close-tour"
          data-testid="close-tour-btn"
        />
      )}
      <Title size="XS" data-testid="step-title">
        {title}
      </Title>
    </Col>
  )

  const StepContent = (
    <Col>
      <div className={styles.content} data-testid="step-content">
        {content}
      </div>
      <Spacer />
      <Row align="center" justify="between">
        <ColorText>
          {currentStep} of {totalSteps}
        </ColorText>
        <Row grow={false} gap="m">
          {currentStep > 1 && (
            <SecondaryButton
              onClick={handleClickBack}
              size="s"
              data-testid="back-btn"
            >
              Back
            </SecondaryButton>
          )}
          <PrimaryButton
            onClick={handleClickNext}
            size="s"
            data-testid="next-btn"
          >
            {!isLastStep ? 'Next' : 'Take me back'}
          </PrimaryButton>
        </Row>
      </Row>
    </Col>
  )

  return (
    <div
      onClick={handleWrapperClick}
      className={cx(styles.wrapper, anchorWrapperClassName, {
        [styles.fullSize]: fullSize,
      })}
      role="presentation"
    >
      <TourStep
        content={StepContent}
        open={isOpen}
        minWidth={300}
        maxWidth={360}
        title={Header}
        placement={anchorPosition}
        className={cx(styles.popoverPanel, panelClassName, {
          [styles.lastStep]: isLastStep,
        })}
        offset={5}
        data-testid="onboarding-tour"
      >
        {children}
      </TourStep>
    </div>
  )
}

export default OnboardingTour
