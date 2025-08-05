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
  RiEmptyButton,
  RiIconButton,
  RiPrimaryButton,
  RiSecondaryButton,
} from 'uiSrc/components/base/forms'
import { ColorText } from 'uiSrc/components/base/text'
import { RiTourStep } from 'uiSrc/components/base/display'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Title } from 'uiSrc/components/base/text/Title'
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
        <RiEmptyButton
          onClick={handleSkip}
          className={styles.skipTourBtn}
          size="small"
          data-testid="skip-tour-btn"
        >
          Skip tour
        </RiEmptyButton>
      ) : (
        <RiIconButton
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
      <Row className={styles.footer} align="center" justify="between">
        <ColorText color="subdued" className={styles.stepCount}>
          {currentStep} of {totalSteps}
        </ColorText>
        <Row grow={false} gap="m">
          {currentStep > 1 && (
            <RiSecondaryButton
              onClick={handleClickBack}
              size="s"
              data-testid="back-btn"
            >
              Back
            </RiSecondaryButton>
          )}
          <RiPrimaryButton
            onClick={handleClickNext}
            size="s"
            data-testid="next-btn"
          >
            {!isLastStep ? 'Next' : 'Take me back'}
          </RiPrimaryButton>
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
      <RiTourStep
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
      </RiTourStep>
    </div>
  )
}

export default OnboardingTour
