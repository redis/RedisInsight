import { useAppSelector } from 'uiSrc/slices/hooks'
import React, { useEffect, useState } from 'react'
import type { TourStepProps } from 'uiSrc/components/base/display/tour/types'
import { appFeatureOnboardingSelector } from 'uiSrc/slices/app/features'

import OnboardingTour from './OnboardingTour'
import { OnboardingTourOptions } from './interfaces'

export interface Props {
  options: OnboardingTourOptions
  children: React.ReactElement
  anchorPosition?: TourStepProps['placement']
  panelClassName?: string
  anchorWrapperClassName?: string
  preventPropagation?: boolean
  fullSize?: boolean
  delay?: number
  rerenderWithDelay?: any
}

const OnboardingTourWrapper = (props: Props) => {
  const { options, children, delay, rerenderWithDelay } = props
  const { step } = options
  const { currentStep, isActive, totalSteps } = useAppSelector(
    appFeatureOnboardingSelector,
  )
  const [isDelayed, setIsDelayed] = useState(true)

  const isCurrentStep = step === currentStep && isActive

  useEffect(() => {
    if (!isCurrentStep) return setIsDelayed(true)
    if (!delay) return setIsDelayed(false)

    setIsDelayed(true)
    const timeId = setTimeout(() => setIsDelayed(false), delay)

    return () => clearTimeout(timeId)
  }, [isCurrentStep, delay, rerenderWithDelay])

  // render tour only when it needed due to side effect calls
  return !isDelayed && isCurrentStep ? (
    <OnboardingTour
      currentStep={currentStep}
      totalSteps={totalSteps}
      isActive={isActive}
      {...props}
    >
      {children}
    </OnboardingTour>
  ) : (
    children
  )
}

export default OnboardingTourWrapper
